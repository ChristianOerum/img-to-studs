import { defineStore } from 'pinia'

export const useImageStore = defineStore('Image', {
  state: () => ({
    keepAspect: false,
    width: 6,
    height: 4,
    brightness: 0,
    contrast: 1,

    allColorOptions: []

  }),
})