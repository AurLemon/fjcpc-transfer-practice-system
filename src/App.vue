<script setup lang="ts">
import { onMounted } from 'vue'

import PageHeader from './components/PageHeader.vue'
import PageContainer from './components/PageContainer.vue'
import PageFooter from './components/PageFooter.vue'
import NotifyContainer from './components/common/NotifyContainer.vue'

import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useQuestionStore } from '@/stores/question'

const authStore = useAuthStore()
const userStore = useUserStore()
const questionStore = useQuestionStore()

if (userStore.readLogin()) {
    authStore.getUserProfile()
    userStore.fetchUserProgress()
    userStore.fetchStarProgress()
}

questionStore.getQuestionInfo()
</script>

<template>
    <PageHeader />
    <PageContainer />
    <PageFooter />
    <NotifyContainer />
</template>

<style lang="scss">
#app {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    min-height: 100vh;
}
</style>
