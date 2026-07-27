// Brick definitions — index order MUST match BRICK_DEFS_MAIN in index.vue
const BRICK_DEFS = [
    { id: '6x6',  shapes: [[6,6]],       area: 36, blId: '3958'  },
    { id: '4x4',  shapes: [[4,4]],       area: 16, blId: '3031'  },
    { id: '2x3',  shapes: [[2,3],[3,2]], area: 6,  blId: '3021'  },
    { id: '2x2',  shapes: [[2,2]],       area: 4,  blId: '3022'  },
    { id: '2x2L', shapes: null,          area: 3,  blId: '2420',  special: 'L' },
    { id: '1x2',  shapes: [[1,2],[2,1]], area: 2,  blId: '3023'  },
    { id: '1x1',  shapes: [[1,1]],       area: 1,  blId: '3024'  },
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

self.onmessage = function (e) {
    const { buffer, canvasWidth, canvasHeight, studSize, colorOptions, generation, enabledBrickIds } = e.data;
    // Build colorNames lookup (ci → CSV color name) for brick color-availability checks
    const colorNames = colorOptions.map(o => o.name || '');
    const pixelData = new Uint8ClampedArray(buffer);

    const numStudsX = Math.ceil(canvasWidth / studSize);
    const numStudsY = Math.ceil(canvasHeight / studSize);
    const numColors = colorOptions.length;

    // Pre-extract enabled colors into a flat structure for cache-friendly access
    const enabled = [];
    for (let c = 0; c < numColors; c++) {
        if (colorOptions[c].checked) {
            const col = colorOptions[c].color;
            enabled.push({ idx: c, r: col[0], g: col[1], b: col[2] });
        }
    }
    const noColors = enabled.length === 0;

    // ── Step 1: Color matching per stud ───────────────────────────────────
    const colorGrid = new Int32Array(numStudsX * numStudsY);
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
            if (cnt === 0 || noColors) { colorGrid[sy * numStudsX + sx] = -1; continue; }
            const avgR = totalR / cnt, avgG = totalG / cnt, avgB = totalB / cnt;
            let bestIdx = -1, bestDist = Infinity;
            for (const { idx, r, g, b } of enabled) {
                const d = (avgR - r) * (avgR - r) + (avgG - g) * (avgG - g) + (avgB - b) * (avgB - b);
                if (d < bestDist) { bestDist = d; bestIdx = idx; }
            }
            colorGrid[sy * numStudsX + sx] = bestIdx;
        }
    }

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
                            if (visited[ny * numStudsX + nx] || colorGrid[ny * numStudsX + nx] !== colorIdx) {
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
                                if (visited[ny * numStudsX + nx] || colorGrid[ny * numStudsX + nx] !== colorIdx) {
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
    self.postMessage(
        { placements: placementsArr.buffer, brickCounts: brickCounts.buffer, numStudsX, numStudsY, generation },
        [placementsArr.buffer, brickCounts.buffer]
    );
};
