// src/stores/user.ts
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', {
    state: () => ({
        login: {
            isLogged: false
        },
        profile: {
            name: '',
            id_number: '',
            school: '',
            profession: '',
            last_login: '',
            reg_date: ''
        },
        progress: {},
        setting: {}
    }),
    actions: {
        setLogin(status: boolean = true) {
            localStorage.setItem('isLogged', JSON.stringify(status))
        },
        readLogin() {
            const authStore: any = useAuthStore()

            if (authStore.readToken() !== null && authStore.readRefreshToken() !== null) {
                return true
            }
            return false
        },
        userLogout() {
            const authStore = useAuthStore()
            this.login.isLogged = false
            authStore.deleteToken()
            authStore.deleteRefreshToken()
            this.resetProfile()
        },
        resetProfile() {
            this.profile = {
                name: '',
                id_number: '',
                school: '',
                profession: '',
                last_login: '',
                reg_date: ''
            }
        }
    }
})
