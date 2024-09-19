// src/stores/progress.ts
import { defineStore } from 'pinia'
import { openDB } from 'idb'

import { useUserStore } from './user'

const userStore = useUserStore()

export const useProgressStore = defineStore('progress', {
    state: () => ({}),
    actions: {}
})
