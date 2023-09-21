import { defineStore } from 'pinia'

export const useImageStore = defineStore('Image', {
  state: () => ({
    keepAspect: false,
    width: 6,
    height: 4,

    chosenColors: [],
    colorOptions: [[5, 19, 29, 1],[108, 110, 104, 1],[160, 165, 169, 1],[247, 247, 247, 1]],
    allColorOptions: [
      {color: [5, 19, 29, 1], colorName: "Black"},
      {color: [108, 110, 104, 1], colorName: "Dark gray"},
      {color: [160, 165, 169, 1], colorName: "Light gray"},
      {color: [247, 247, 247, 1], colorName: "white"}
    ]

  }),
})