// src/stores/card.ts

import { defineStore } from 'pinia'

export const useCardStore = defineStore('card', {
    state: () => ({
        showLoginCard: false,
        mobileShowPanel: false
    }),
    actions: {
        isViewContainerOn(): Boolean {
            return this.showLoginCard
        }
    }
})
