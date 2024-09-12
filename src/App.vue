<script setup lang="ts">
import PageHeader from './components/PageHeader.vue'
import PageContainer from './components/PageContainer.vue'
import PageFooter from './components/PageFooter.vue'
</script>

<template>
    <PageHeader />
    <PageContainer />
    <PageFooter />
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
