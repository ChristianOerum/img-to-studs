import { defineStore } from 'pinia'

export const useMenuStore = defineStore('Menu', {
  state: () => ({
    menuItemShow: "SI"

  }),
})