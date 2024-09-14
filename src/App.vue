<script setup lang="ts">
import PageHeader from './components/PageHeader.vue'
import PageContainer from './components/PageContainer.vue'
import PageFooter from './components/PageFooter.vue'
import NotifyContainer from './components/common/NotifyContainer.vue'

import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useNotifyStore } from '@/stores/notify'

import { get, post } from './api/api'

const authStore = useAuthStore()
const userStore = useUserStore()
const notifyStore = useNotifyStore()

if (userStore.readLogin()) {
    authStore.getUserProfile();
}
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
