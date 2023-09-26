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

    previewArtOnWall: false

  }),
})