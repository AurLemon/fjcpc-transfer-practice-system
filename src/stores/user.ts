// src/stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        login: {
            isLogged: false
        }
    })
})
