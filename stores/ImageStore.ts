import { defineStore } from 'pinia'

export const useImageStore = defineStore('Image', {
  state: () => ({
    width: 3,
    height: 3,
    brightness: 0,
    contrast: 1,
    grayscale: false,
    x: 0,
    y: 0,

    showStuds: true,
    showGrid: true,


    allColorOptions: [],
    previewShowMosaic: true,

    previewArtOnWall: false,

    // Dithering: mix nearby colors so the mosaic approximates the true color from a distance
    dither: false,
    ditherStrength: 70, // 0–100 %

    // Height map: raise studs automatically into a 3D relief, supported by black bricks/plates
    heightMap: false,
    heightMax: 6, // max elevation in plates (3 plates = 1 brick)
    heightMode: 'brightness', // 'brightness' | 'subject'
    heightInvert: false,

    // Dual image (lenticular): two images interleaved column-by-column on 1×1 cheese slopes
    dualImage: false,
    dualPreview: 'built', // 'left' | 'built' | 'right'

  }),
})