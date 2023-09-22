import { defineStore } from 'pinia'

export const useImageStore = defineStore('Image', {
  state: () => ({
    keepAspect: true,
    width: 3,
    height: 3,
    brightness: 0,
    contrast: 1,
    x: 0,
    y: 0,

    allColorOptions: [],
    previewShowMosaic: true

  }),
})