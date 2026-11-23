// Brick definitions — index order MUST match BRICK_DEFS_MAIN in index.vue
const BRICK_DEFS = [
    { id: '6x6',  shapes: [[6,6]],       area: 36, blId: '3958'  },
    { id: '4x4',  shapes: [[4,4]],       area: 16, blId: '3031'  },
    { id: '2x3',  shapes: [[2,3],[3,2]], area: 6,  blId: '3021'  },
    { id: '2x2',  shapes: [[2,2]],       area: 4,  blId: '3022'  },
    { id: '2x2L', shapes: null,          area: 3,  blId: '2420',  special: 'L' },
    { id: '1x2',  shapes: [[1,2],[2,1]], area: 2,  blId: '3023'  },
    { id: '1x1',  shapes: [[1,1]],       area: 1,  blId: '3024'  },
    // 1×1 "cheese" slope — only used by dual-image (lenticular) mode, never by normal packing
    { id: '1x1S', shapes: [[1,1]],       area: 1,  blId: '54200', special: 'slope' },
];

// ── Color availability is defined in brick-colors.js ─────────────────────────
importScripts('./brick-colors.js');
// Attach filters to brick defs
for (const b of BRICK_DEFS) b.colorFilter = COLOR_FILTER[b.id] !== undefined ? COLOR_FILTER[b.id] : null;

// L-piece orientations — first 3 include (0,0) so safe for scan-order greedy placement;
// orientation 3 (missing top-left) is used ONLY by the post-processing pass.
const L_CELLS = [
    [[0,0],[0,1],[1,1]], // ori 0: missing top-right   (1,0)
    [[0,0],[1,0],[0,1]], // ori 1: missing bottom-right (1,1)
    [[0,0],[1,0],[1,1]], // ori 2: missing bottom-left  (0,1)
    [[1,0],[0,1],[1,1]], // ori 3: missing top-left     (0,0)  ← post-process only
];

const IDX_1X1  = BRICK_DEFS.findIndex(b => b.id === '1x1');
const IDX_2X2L = BRICK_DEFS.findIndex(b => b.id === '2x2L');
const IDX_SLOPE = BRICK_DEFS.findIndex(b => b.id === '1x1S');

self.onmessage = function (e) {
    const { buffer, bufferB, canvasWidth, canvasHeight, studSize, colorOptions, generation, enabledBrickIds, dither, height } = e.data;
    // Build colorNames lookup (ci → CSV color name) for brick color-availability checks
    const colorNames = colorOptions.map(o => o.name || '');
    const pixelData = new Uint8ClampedArray(buffer);

    const numStudsX = Math.ceil(canvasWidth / studSize);
    const numStudsY = Math.ceil(canvasHeight / studSize);
    const numColors = colorOptions.length;
    const N = numStudsX * numStudsY;
    const ditherStrength = dither && dither.enabled ? Math.max(0, Math.min(1, dither.strength)) : 0;

    // ── Dual image (lenticular) mode: two images interleaved on 1×1 cheese slopes ──
    if (bufferB) {
        const slopeFilter = BRICK_DEFS[IDX_SLOPE].colorFilter;
        const enabledS = enabledColors(colorOptions, c => !slopeFilter || slopeFilter.has(colorNames[c]));
        const A = studAverages(pixelData, canvasWidth, canvasHeight, studSize, numStudsX, numStudsY);
        const B = studAverages(new Uint8ClampedArray(bufferB), canvasWidth, canvasHeight, studSize, numStudsX, numStudsY);
        const colorGrid = new Int32Array(N).fill(-1);
        // Even columns = image A, odd columns = image B. Each image is color-matched on its
        // own half-width grid so dithering error never leaks between the two images.
        for (const [parity, src] of [[0, A], [1, B]]) {
            const subW = Math.ceil((numStudsX - parity) / 2);
            if (subW <= 0) continue;
            const subAvg = new Float32Array(subW * numStudsY * 3);
            const subHas = new Uint8Array(subW * numStudsY);
            for (let y = 0; y < numStudsY; y++) for (let k = 0; k < subW; k++) {
                const n = y * numStudsX + (2 * k + parity), m = y * subW + k;
                subHas[m] = src.hasPx[n];
                subAvg[m * 3] = src.avg[n * 3]; subAvg[m * 3 + 1] = src.avg[n * 3 + 1]; subAvg[m * 3 + 2] = src.avg[n * 3 + 2];
            }
            const sub = matchColors(subAvg, subHas, subW, numStudsY, enabledS, ditherStrength);
            for (let y = 0; y < numStudsY; y++) for (let k = 0; k < subW; k++)
                colorGrid[y * numStudsX + (2 * k + parity)] = sub[y * subW + k];
        }
        // One cheese slope per stud. Facing is implied by column parity (even = faces left, odd = right),
        // so each column pair forms a ridge: from the left you see A's slopes, from the right B's.
        const plc = new Int32Array(N * 6);
        const brickCounts = new Int32Array(BRICK_DEFS.length * numColors);
        let p = 0;
        for (let sy = 0; sy < numStudsY; sy++) for (let sx = 0; sx < numStudsX; sx++) {
            const ci = colorGrid[sy * numStudsX + sx];
            plc[p++] = sx; plc[p++] = sy; plc[p++] = 1; plc[p++] = 1; plc[p++] = ci; plc[p++] = IDX_SLOPE;
            if (ci >= 0) brickCounts[IDX_SLOPE * numColors + ci]++;
        }
        self.postMessage(
            { placements: plc.buffer, brickCounts: brickCounts.buffer, heightGrid: null, numStudsX, numStudsY, generation },
            [plc.buffer, brickCounts.buffer]
        );
        return;
    }

    // ── Step 1a/1b: Average color per stud, then color matching (optionally dithered) ──
    const enabled = enabledColors(colorOptions, () => true);
    const { avg, hasPx } = studAverages(pixelData, canvasWidth, canvasHeight, studSize, numStudsX, numStudsY);
    const colorGrid = matchColors(avg, hasPx, numStudsX, numStudsY, enabled, ditherStrength);

    // ── Step 1c: Automatic height map (plates of elevation per stud) ──────
    let heightGrid = null;
    if (height && height.enabled && height.max > 0) {
        heightGrid = computeHeightGrid(avg, hasPx, numStudsX, numStudsY, height);
    }
    // Bricks may only merge studs that sit at the same height
    const sameHeight = heightGrid
        ? (a, b) => heightGrid[a] === heightGrid[b]
        : () => true;

    // ── Step 2: Phase-based brick packing — one full-grid scan per size ─────────────
    // Doing a complete pass for the largest brick before allowing any smaller brick
    // prevents small bricks from fragmenting areas where large bricks could have fit.
    const activeBrickIds = Array.isArray(enabledBrickIds) ? enabledBrickIds : ['1x1'];
    const activeBricks = BRICK_DEFS
        .map((b, i) => ({ ...b, bdi: i }))
        .filter(b => activeBrickIds.includes(b.id) || b.id === '1x1');
    activeBricks.sort((a, b) => b.area - a.area); // largest first

    const visited     = new Uint8Array(numStudsX * numStudsY);
    const plcFlat     = []; // interleaved: x, y, w, h, colorIdx, brickDefIdx  (6 values per brick)
    const brickCounts = new Int32Array(BRICK_DEFS.length * numColors);

    // ── One complete left→right, top→bottom scan per brick size ──────────────────
    for (const brick of activeBricks) {
        if (brick.id === '1x1') continue; // handled in the fallback pass below

        for (let sy = 0; sy < numStudsY; sy++) {
            for (let sx = 0; sx < numStudsX; sx++) {
                if (visited[sy * numStudsX + sx]) continue;
                const colorIdx = colorGrid[sy * numStudsX + sx];
                if (colorIdx < 0) continue; // empty cells handled in fallback pass

                // Hard boundary: no brick may cross a 16×16 baseplate edge
                const bpEndX = Math.min((Math.floor(sx / 16) + 1) * 16, numStudsX);
                const bpEndY = Math.min((Math.floor(sy / 16) + 1) * 16, numStudsY);

                if (brick.special === 'L') {
                    if (sx + 2 > bpEndX || sy + 2 > bpEndY) continue;
                    if (brick.colorFilter && !brick.colorFilter.has(colorNames[colorIdx])) continue;
                    // Only orientations 0-2: those always include (sx,sy) as an occupied cell.
                    // Orientation 3 (missing top-left) is handled in the post-processing pass.
                    for (let ori = 0; ori < 3; ori++) {
                        const cells = L_CELLS[ori];
                        let ok = true;
                        for (const [dx, dy] of cells) {
                            const nx = sx + dx, ny = sy + dy;
                            if (visited[ny * numStudsX + nx] || colorGrid[ny * numStudsX + nx] !== colorIdx
                                || !sameHeight(ny * numStudsX + nx, sy * numStudsX + sx)) {
                                ok = false; break;
                            }
                        }
                        if (ok) {
                            for (const [dx, dy] of cells) visited[(sy + dy) * numStudsX + (sx + dx)] = 1;
                            brickCounts[IDX_2X2L * numColors + colorIdx]++;
                            plcFlat.push(sx, sy, 0, ori + 1, colorIdx, IDX_2X2L);
                            break;
                        }
                    }
                } else {
                    if (brick.colorFilter && !brick.colorFilter.has(colorNames[colorIdx])) continue;
                    for (const [w, h] of brick.shapes) {
                        if (sx + w > bpEndX || sy + h > bpEndY) continue;
                        let ok = true;
                        outer: for (let dy = 0; dy < h; dy++) {
                            for (let dx = 0; dx < w; dx++) {
                                const nx = sx + dx, ny = sy + dy;
                                if (visited[ny * numStudsX + nx] || colorGrid[ny * numStudsX + nx] !== colorIdx
                                    || !sameHeight(ny * numStudsX + nx, sy * numStudsX + sx)) {
                                    ok = false; break outer;
                                }
                            }
                        }
                        if (ok) {
                            for (let dy = 0; dy < h; dy++) {
                                for (let dx = 0; dx < w; dx++) visited[(sy + dy) * numStudsX + (sx + dx)] = 1;
                            }
                            brickCounts[brick.bdi * numColors + colorIdx]++;
                            plcFlat.push(sx, sy, w, h, colorIdx, brick.bdi);
                            break; // placed — don't try the other orientation of this same size
                        }
                    }
                }
            }
        }
    }

    // ── Final pass: fill every remaining cell with a 1×1 ────────────────────────
    for (let sy = 0; sy < numStudsY; sy++) {
        for (let sx = 0; sx < numStudsX; sx++) {
            if (visited[sy * numStudsX + sx]) continue;
            const colorIdx = colorGrid[sy * numStudsX + sx];
            visited[sy * numStudsX + sx] = 1;
            if (colorIdx < 0) {
                plcFlat.push(sx, sy, 1, 1, -1, IDX_1X1);
            } else {
                brickCounts[IDX_1X1 * numColors + colorIdx]++;
                plcFlat.push(sx, sy, 1, 1, colorIdx, IDX_1X1);
            }
        }
    }

    // ── Post-processing: merge 1×1 triplets into L-pieces (all 4 orientations) ─────
    // The greedy scan misses orientation 3 (top-left missing) and can miss others when
    // same-color cells end up as isolated 1×1s due to scan order.
    let finalFlat = plcFlat;
    if (activeBrickIds.includes('2x2L')) {
        const numP0  = plcFlat.length / 6;
        const deleted = new Uint8Array(numP0);

        // Lookup: cell → placement index (1×1 bricks only)
        const oneLookup = new Int32Array(numStudsX * numStudsY).fill(-1);
        for (let i = 0; i < numP0; i++) {
            const w = plcFlat[i*6+2], h = plcFlat[i*6+3], c = plcFlat[i*6+4];
            if (w === 1 && h === 1 && c >= 0)
                oneLookup[plcFlat[i*6+1] * numStudsX + plcFlat[i*6+0]] = i;
        }

        for (let sy = 0; sy < numStudsY - 1; sy++) {
            for (let sx = 0; sx < numStudsX - 1; sx++) {
                // Both column and row of the 2×2 window must stay inside one 16×16 baseplate
                if ((sx >> 4) !== ((sx + 1) >> 4)) continue;
                if ((sy >> 4) !== ((sy + 1) >> 4)) continue;

                for (let ori = 0; ori < L_CELLS.length; ori++) {
                    const cells = L_CELLS[ori];
                    const p0 = oneLookup[(sy + cells[0][1]) * numStudsX + (sx + cells[0][0])];
                    const p1 = oneLookup[(sy + cells[1][1]) * numStudsX + (sx + cells[1][0])];
                    const p2 = oneLookup[(sy + cells[2][1]) * numStudsX + (sx + cells[2][0])];
                    if (p0 < 0 || p1 < 0 || p2 < 0) continue;
                    if (deleted[p0] || deleted[p1] || deleted[p2]) continue;

                    const c = plcFlat[p0*6+4];
                    if (plcFlat[p1*6+4] !== c || plcFlat[p2*6+4] !== c) continue;
                    if (heightGrid) {
                        const n0 = plcFlat[p0*6+1] * numStudsX + plcFlat[p0*6+0];
                        const n1 = plcFlat[p1*6+1] * numStudsX + plcFlat[p1*6+0];
                        const n2 = plcFlat[p2*6+1] * numStudsX + plcFlat[p2*6+0];
                        if (!sameHeight(n0, n1) || !sameHeight(n0, n2)) continue;
                    }
                    // Check the L-piece exists in this color
                    const lFilter = BRICK_DEFS[IDX_2X2L].colorFilter;
                    if (lFilter && !lFilter.has(colorNames[c])) continue;

                    // Merge: replace 3×1×1 with one L-piece
                    deleted[p0] = deleted[p1] = deleted[p2] = 1;
                    // Remove merged cells from lookup so they can't be reused
                    oneLookup[plcFlat[p0*6+1]*numStudsX + plcFlat[p0*6+0]] = -1;
                    oneLookup[plcFlat[p1*6+1]*numStudsX + plcFlat[p1*6+0]] = -1;
                    oneLookup[plcFlat[p2*6+1]*numStudsX + plcFlat[p2*6+0]] = -1;
                    brickCounts[IDX_1X1 * numColors + c] -= 3;
                    brickCounts[IDX_2X2L * numColors + c]++;
                    plcFlat.push(sx, sy, 0, ori + 1, c, IDX_2X2L);
                    break; // at most one L-piece per 2×2 window
                }
            }
        }

        // Build final list: skip deleted entries, keep newly pushed L-pieces (idx >= numP0)
        finalFlat = [];
        for (let i = 0, n = plcFlat.length / 6; i < n; i++) {
            if (i >= numP0 || !deleted[i])
                finalFlat.push(plcFlat[i*6], plcFlat[i*6+1], plcFlat[i*6+2],
                                plcFlat[i*6+3], plcFlat[i*6+4], plcFlat[i*6+5]);
        }
    }

    // Pack placement list into a transferable Int32Array (6 ints per brick)
    const placementsArr = new Int32Array(finalFlat);

    // Transfer buffers back zero-copy
    const transfer = [placementsArr.buffer, brickCounts.buffer];
    if (heightGrid) transfer.push(heightGrid.buffer);
    self.postMessage(
        { placements: placementsArr.buffer, brickCounts: brickCounts.buffer, heightGrid: heightGrid ? heightGrid.buffer : null, numStudsX, numStudsY, generation },
        transfer
    );
};

function clamp255(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

// Small deterministic PRNG so dithering noise is stable between re-renders
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Derive a per-stud height (0…max plates) from the image, fully automatically:
//  - 'brightness': brighter areas stand taller (classic relief / lithophane look)
//  - 'subject':    studs that differ most from the background color (estimated from the
//                  image border) stand taller, so the subject pops out of the background
// The signal is smoothed (so heights form contiguous terraces instead of noise) and
// normalized between the 2nd and 98th percentile, so it adapts to every image.
function computeHeightGrid(avg, hasPx, nX, nY, opts) {
    const N = nX * nY;
    const val = new Float32Array(N);
    if (opts.mode === 'subject') {
        const rs = [], gs = [], bs = [];
        for (let y = 0; y < nY; y++) for (let x = 0; x < nX; x++) {
            if (x !== 0 && y !== 0 && x !== nX - 1 && y !== nY - 1) continue;
            const n = y * nX + x;
            if (!hasPx[n]) continue;
            rs.push(avg[n * 3]); gs.push(avg[n * 3 + 1]); bs.push(avg[n * 3 + 2]);
        }
        const med = a => { if (!a.length) return 0; a.sort((p, q) => p - q); return a[a.length >> 1]; };
        const br = med(rs), bg = med(gs), bb = med(bs);
        for (let n = 0; n < N; n++) {
            const dr = avg[n * 3] - br, dg = avg[n * 3 + 1] - bg, db = avg[n * 3 + 2] - bb;
            val[n] = Math.sqrt(dr * dr + dg * dg + db * db);
        }
    } else {
        for (let n = 0; n < N; n++) val[n] = 0.299 * avg[n * 3] + 0.587 * avg[n * 3 + 1] + 0.114 * avg[n * 3 + 2];
    }

    // Two passes of a 3×3 box blur
    let src = val, dst = new Float32Array(N);
    for (let pass = 0; pass < 2; pass++) {
        for (let y = 0; y < nY; y++) for (let x = 0; x < nX; x++) {
            let sum = 0, cnt = 0;
            for (let dy = -1; dy <= 1; dy++) {
                const yy = y + dy; if (yy < 0 || yy >= nY) continue;
                for (let dx = -1; dx <= 1; dx++) {
                    const xx = x + dx; if (xx < 0 || xx >= nX) continue;
                    sum += src[yy * nX + xx]; cnt++;
                }
            }
            dst[y * nX + x] = sum / cnt;
        }
        const t = src; src = dst; dst = t;
    }

    const sorted = Float32Array.from(src).sort();
    const lo = sorted[Math.floor(0.02 * (N - 1))];
    const hi = sorted[Math.floor(0.98 * (N - 1))];
    const range = hi - lo || 1;
    const max = Math.max(0, Math.min(255, Math.round(opts.max)));
    const out = new Uint8Array(N);
    for (let n = 0; n < N; n++) {
        let t = (src[n] - lo) / range;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        if (opts.invert) t = 1 - t;
        out[n] = Math.round(t * max);
    }
    return out;
}


function enabledColors(colorOptions, allow) {
    const out = [];
    for (let c = 0; c < colorOptions.length; c++) {
        if (colorOptions[c].checked && allow(c)) {
            const col = colorOptions[c].color;
            out.push({ idx: c, r: col[0], g: col[1], b: col[2] });
        }
    }
    return out;
}

function nearestColor(enabled, r, g, b) {
    let best = null, bestDist = Infinity;
    for (const col of enabled) {
        const d = (r - col.r) * (r - col.r) + (g - col.g) * (g - col.g) + (b - col.b) * (b - col.b);
        if (d < bestDist) { bestDist = d; best = col; }
    }
    return best;
}

// Average RGB of the pixels under every stud
function studAverages(pixelData, canvasWidth, canvasHeight, studSize, numStudsX, numStudsY) {
    const N = numStudsX * numStudsY;
    const avg = new Float32Array(N * 3);
    const hasPx = new Uint8Array(N);
    for (let sy = 0; sy < numStudsY; sy++) {
        for (let sx = 0; sx < numStudsX; sx++) {
            const studX = sx * studSize;
            const studY = sy * studSize;
            let totalR = 0, totalG = 0, totalB = 0, cnt = 0;
            const maxPx = Math.min(studX + studSize, canvasWidth);
            const maxPy = Math.min(studY + studSize, canvasHeight);
            for (let py = studY; py < maxPy; py++) {
                const rowBase = py * canvasWidth;
                for (let px = studX; px < maxPx; px++) {
                    const i = (rowBase + px) * 4;
                    totalR += pixelData[i]; totalG += pixelData[i + 1]; totalB += pixelData[i + 2]; cnt++;
                }
            }
            if (cnt === 0) continue;
            const n = sy * numStudsX + sx;
            hasPx[n] = 1;
            avg[n * 3] = totalR / cnt; avg[n * 3 + 1] = totalG / cnt; avg[n * 3 + 2] = totalB / cnt;
        }
    }
    return { avg, hasPx };
}

// Map each cell of a W×H grid to the nearest enabled color index (-1 = empty / no colors).
// With ditherStrength > 0 uses serpentine Floyd–Steinberg error diffusion: quantization error
// is pushed onto neighbouring cells so mixed colors average out to the true color from a
// distance. A small seeded noise jitter breaks up regular "worm" patterns so the mix looks
// random, while staying identical between re-renders.
function matchColors(avg, hasPx, W, H, enabled, ditherStrength) {
    const N = W * H;
    const grid = new Int32Array(N).fill(-1);
    if (!enabled.length) return grid;
    if (ditherStrength <= 0) {
        for (let n = 0; n < N; n++) {
            if (!hasPx[n]) continue;
            grid[n] = nearestColor(enabled, avg[n * 3], avg[n * 3 + 1], avg[n * 3 + 2]).idx;
        }
        return grid;
    }
    const work = Float32Array.from(avg);
    const rand = mulberry32(0x5eed);
    const jitter = 28 * ditherStrength;
    const spread = (n, er, eg, eb, w) => {
        work[n * 3] += er * w; work[n * 3 + 1] += eg * w; work[n * 3 + 2] += eb * w;
    };
    for (let y = 0; y < H; y++) {
        const ltr = (y & 1) === 0;
        const dir = ltr ? 1 : -1;
        for (let i = 0; i < W; i++) {
            const x = ltr ? i : W - 1 - i;
            const n = y * W + x;
            if (!hasPx[n]) continue;
            const r = clamp255(work[n * 3]), g = clamp255(work[n * 3 + 1]), b = clamp255(work[n * 3 + 2]);
            const noise = jitter ? (rand() - 0.5) * jitter : 0;
            const best = nearestColor(enabled, r + noise, g + noise, b + noise);
            grid[n] = best.idx;
            const er = (r - best.r) * ditherStrength;
            const eg = (g - best.g) * ditherStrength;
            const eb = (b - best.b) * ditherStrength;
            const nx = x + dir, px = x - dir;
            const hasNext = nx >= 0 && nx < W;
            const hasPrev = px >= 0 && px < W;
            if (hasNext) spread(n + dir, er, eg, eb, 7 / 16);
            if (y + 1 < H) {
                const below = n + W;
                if (hasPrev) spread(below - dir, er, eg, eb, 3 / 16);
                spread(below, er, eg, eb, 5 / 16);
                if (hasNext) spread(below + dir, er, eg, eb, 1 / 16);
            }
        }
    }
    return grid;
}
