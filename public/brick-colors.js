// ============================================================
//  LEGO Plate Color Availability Map
//  Source: BrickLink catalog Part Color Codes
//  Verified: July 27, 2026 (manually cross-checked against
//  live BrickLink catalogColors.asp pages for each part)
//
//  Each set lists the CSV color names available for that plate.
//  null = all colors (1×1 is the universal fallback).
//  Used by mosaic.worker.js to skip bricks unavailable in a color.
//
//  CHANGELOG vs previous version:
//   6x6  (3958): + Medium Lime, Aqua
//   4x4  (3031): + Sand Red, Sky Blue, Dark Royal Blue, Blue Violet
//                - Dark Tan, Dark Green (not actually available)
//   2x3  (3021): + Reddish Orange, Medium Tan, Medium Green
//                - Light Brown, Light Yellow (not available)
//                ~ Medium Violet -> Violet (wrong color name)
//   2x2  (3022): + Reddish Orange, Medium Tan, Warm Yellowish Orange, Light Purple
//                - Medium Orange, Medium Violet (not available)
//   2x2L (2420): no changes, verified correct
//   1x2  (3023): + Reddish Orange, Sand Red, Medium Brown, Medium Tan,
//                  Warm Yellowish Orange, Aqua, Sky Blue, Blue Violet, Rose Pink
//                - Light Orange, Light Yellow, Medium Violet (not available)
//   1x1  (3024): unchanged (null / universal fallback)
// ============================================================

/* global COLOR_FILTER */

const COLOR_FILTER = {

    // ── 6×6 Plate (BL part 3958) ─────────────────────────────────────
    '6x6': new Set([
        // Grays / Black / White
        'White', 'Light Gray', 'Light Bluish Gray', 'Dark Gray', 'Dark Bluish Gray', 'Black',
        // Reds / Browns
        'Dark Red', 'Red',
        'Dark Brown', 'Brown', 'Reddish Brown', 'Dark Tan', 'Tan', 'Medium Nougat',
        // Oranges / Yellows
        'Dark Orange', 'Orange', 'Medium Orange', 'Bright Light Orange',
        'Yellow', 'Bright Light Yellow', 'Neon Yellow',
        // Greens
        'Medium Lime', 'Lime', 'Olive Green', 'Dark Green', 'Green', 'Bright Green', 'Sand Green',
        'Dark Turquoise', 'Aqua', 'Light Aqua',
        // Blues / Purples
        'Dark Blue', 'Blue', 'Dark Azure', 'Medium Azure', 'Medium Blue', 'Bright Light Blue',
        'Dark Purple', 'Medium Lavender', 'Lavender',
        // Pinks / Magentas
        'Magenta', 'Dark Pink', 'Bright Pink',
    ]),

    // ── 4×4 Plate (BL part 3031) ─────────────────────────────────────
    '4x4': new Set([
        // Grays / Black / White
        'White', 'Light Gray', 'Light Bluish Gray', 'Dark Gray', 'Dark Bluish Gray', 'Black',
        // Reds / Browns
        'Dark Red', 'Red', 'Sand Red',
        'Brown', 'Reddish Brown', 'Tan', 'Light Nougat', 'Medium Nougat',
        // Oranges / Yellows
        'Orange', 'Medium Orange', 'Bright Light Orange',
        'Yellow', 'Bright Light Yellow', 'Yellowish Green',
        // Greens
        'Lime', 'Green', 'Bright Green', 'Sand Green', 'Dark Turquoise',
        // Blues / Purples
        'Dark Blue', 'Blue', 'Maersk Blue', 'Medium Azure', 'Sky Blue', 'Medium Blue', 'Sand Blue',
        'Dark Royal Blue', 'Blue Violet',
        'Dark Purple', 'Medium Lavender', 'Lavender',
        // Pinks / Magentas
        'Magenta', 'Dark Pink', 'Bright Pink',
    ]),

    // ── 2×3 Plate (BL part 3021) ─────────────────────────────────────
    '2x3': new Set([
        // Grays / Black / White
        'White', 'Very Light Bluish Gray',
        'Light Gray', 'Light Bluish Gray', 'Dark Gray', 'Dark Bluish Gray', 'Black',
        // Reds / Browns
        'Dark Red', 'Red', 'Reddish Orange',
        'Dark Brown', 'Brown', 'Reddish Brown',
        'Dark Tan', 'Tan', 'Light Nougat', 'Medium Tan', 'Nougat', 'Medium Nougat',
        // Oranges / Yellows
        'Dark Orange', 'Orange', 'Medium Orange', 'Light Orange', 'Bright Light Orange', 'Very Light Orange',
        'Yellow', 'Bright Light Yellow', 'Yellowish Green',
        // Greens
        'Lime', 'Olive Green', 'Dark Green', 'Green', 'Medium Green', 'Sand Green',
        'Dark Turquoise', 'Light Aqua',
        // Blues / Purples
        'Dark Blue', 'Blue', 'Dark Azure', 'Maersk Blue',
        'Medium Azure', 'Medium Blue', 'Bright Light Blue', 'Sand Blue',
        'Violet', 'Dark Purple', 'Purple', 'Medium Lavender', 'Lavender',
        // Pinks / Magentas
        'Magenta', 'Dark Pink', 'Bright Pink', 'Pink',
    ]),

    // ── 2×2 Plate (BL part 3022) ─────────────────────────────────────
    '2x2': new Set([
        // Grays / Black / White
        'White', 'Very Light Bluish Gray',
        'Light Gray', 'Light Bluish Gray', 'Dark Gray', 'Dark Bluish Gray', 'Black',
        // Reds / Browns
        'Dark Red', 'Red', 'Reddish Orange',
        'Dark Brown', 'Brown', 'Reddish Brown', 'Light Brown',
        'Dark Tan', 'Tan', 'Light Nougat', 'Medium Tan', 'Nougat', 'Medium Nougat', 'Earth Orange',
        // Oranges / Yellows
        'Dark Orange', 'Orange', 'Light Orange', 'Bright Light Orange', 'Warm Yellowish Orange', 'Very Light Orange',
        'Yellow', 'Light Yellow', 'Bright Light Yellow', 'Neon Yellow', 'Yellowish Green',
        // Greens
        'Lime', 'Olive Green', 'Dark Green', 'Green', 'Bright Green', 'Sand Green',
        'Dark Turquoise', 'Light Aqua',
        // Blues / Purples
        'Dark Blue', 'Blue', 'Dark Azure', 'Maersk Blue',
        'Medium Azure', 'Medium Blue', 'Bright Light Blue', 'Sand Blue',
        'Dark Purple', 'Purple', 'Light Purple', 'Medium Lavender', 'Lavender',
        // Pinks / Magentas
        'Magenta', 'Dark Pink', 'Bright Pink', 'Pink',
    ]),

    // ── 2×2 Corner Plate (BL part 2420) ──────────────────────────────
    '2x2L': new Set([
        // Grays / Black / White
        'White', 'Light Gray', 'Light Bluish Gray', 'Dark Gray', 'Dark Bluish Gray', 'Black',
        // Reds / Browns
        'Dark Red', 'Red',
        'Dark Brown', 'Brown', 'Reddish Brown', 'Dark Tan', 'Tan', 'Medium Nougat',
        // Oranges / Yellows
        'Dark Orange', 'Orange', 'Medium Orange', 'Bright Light Orange',
        'Yellow', 'Neon Yellow',
        // Greens
        'Lime', 'Olive Green', 'Dark Green', 'Green', 'Sand Green', 'Dark Turquoise',
        // Blues / Purples
        'Dark Blue', 'Blue', 'Maersk Blue', 'Medium Azure', 'Medium Blue', 'Sand Blue',
        'Dark Purple', 'Purple', 'Medium Lavender', 'Lavender',
        // Pinks / Magentas
        'Magenta',
        // NOTE: Dark Pink, Bright Pink, and Pink are NOT available for this part
    ]),

    // ── 1×2 Plate (BL part 3023) ─────────────────────────────────────
    '1x2': new Set([
        // Grays / Black / White
        'White', 'Very Light Bluish Gray',
        'Light Gray', 'Light Bluish Gray', 'Dark Gray', 'Dark Bluish Gray', 'Black',
        // Reds / Browns
        'Dark Red', 'Red', 'Reddish Orange', 'Coral', 'Sand Red',
        'Dark Brown', 'Brown', 'Reddish Brown', 'Light Brown', 'Medium Brown',
        'Dark Tan', 'Tan', 'Light Nougat', 'Medium Tan', 'Nougat', 'Medium Nougat',
        // Oranges / Yellows
        'Dark Orange', 'Orange', 'Medium Orange', 'Bright Light Orange', 'Warm Yellowish Orange', 'Very Light Orange',
        'Yellow', 'Bright Light Yellow', 'Neon Yellow', 'Yellowish Green',
        // Greens
        'Lime', 'Olive Green', 'Dark Green', 'Green', 'Bright Green', 'Sand Green',
        'Dark Turquoise', 'Aqua', 'Light Aqua',
        // Blues / Purples
        'Dark Blue', 'Blue', 'Dark Azure', 'Maersk Blue',
        'Medium Azure', 'Sky Blue', 'Medium Blue', 'Bright Light Blue', 'Sand Blue', 'Blue Violet',
        'Dark Purple', 'Purple', 'Medium Lavender', 'Lavender',
        // Pinks / Magentas
        'Magenta', 'Dark Pink', 'Bright Pink', 'Pink', 'Rose Pink',
    ]),

    // ── 1×1 Plate (BL part 3024) ─────────────────────────────────────
    // Universal fallback — available in all LEGO colors.
    '1x1': null,
};