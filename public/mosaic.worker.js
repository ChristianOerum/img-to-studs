self.onmessage = function (e) {
    const { buffer, canvasWidth, canvasHeight, studSize, colorOptions, generation } = e.data;
    const pixelData = new Uint8ClampedArray(buffer);

    const numStudsX = Math.ceil(canvasWidth / studSize);
    const numStudsY = Math.ceil(canvasHeight / studSize);

    const results = new Int32Array(numStudsX * numStudsY);
    const counts  = new Int32Array(colorOptions.length);

    // Pre-extract enabled colors into a flat structure for cache-friendly access
    const enabled = [];
    for (let c = 0; c < colorOptions.length; c++) {
        if (colorOptions[c].checked) {
            const col = colorOptions[c].color;
            enabled.push({ idx: c, r: col[0], g: col[1], b: col[2] });
        }
    }

    const noColors = enabled.length === 0;

    for (let sy = 0; sy < numStudsY; sy++) {
        for (let sx = 0; sx < numStudsX; sx++) {
            const studX = sx * studSize;
            const studY = sy * studSize;

            // Average color for this stud cell — read from pre-loaded pixel array
            let totalR = 0, totalG = 0, totalB = 0, count = 0;
            const maxPx = Math.min(studX + studSize, canvasWidth);
            const maxPy = Math.min(studY + studSize, canvasHeight);

            for (let py = studY; py < maxPy; py++) {
                const rowBase = py * canvasWidth;
                for (let px = studX; px < maxPx; px++) {
                    const i = (rowBase + px) * 4;
                    totalR += pixelData[i];
                    totalG += pixelData[i + 1];
                    totalB += pixelData[i + 2];
                    count++;
                }
            }

            if (count === 0 || noColors) {
                results[sy * numStudsX + sx] = -1;
                continue;
            }

            const avgR = totalR / count;
            const avgG = totalG / count;
            const avgB = totalB / count;

            // Closest LEGO color — squared Euclidean distance in RGB
            let closestIdx = -1;
            let closestDist = Infinity;

            for (let k = 0; k < enabled.length; k++) {
                const { idx, r, g, b } = enabled[k];
                const dr = avgR - r;
                const dg = avgG - g;
                const db = avgB - b;
                const dist = dr * dr + dg * dg + db * db;
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIdx = idx;
                }
            }

            results[sy * numStudsX + sx] = closestIdx;
            if (closestIdx >= 0) counts[closestIdx]++;
        }
    }

    // Transfer typed array buffers back (zero-copy)
    self.postMessage(
        { results: results.buffer, counts: counts.buffer, numStudsX, numStudsY, generation },
        [results.buffer, counts.buffer]
    );
};
