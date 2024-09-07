<script lang="ts">
import { defineComponent } from 'vue'
import { useCardStore } from '@/stores/card'
import LoginCard from './common/LoginCard.vue'

export default defineComponent({
    name: 'PageViewContainer',
    components: {
        LoginCard
    },
    setup() {
        const cardStore = useCardStore()
        return {
            cardStore
        }
    }
})
</script>

<template>
    <div class="page-view-container" :class="{ active: cardStore.showLoginCard }">
        <LoginCard v-if="cardStore.showLoginCard" />
    </div>
</template>

<style lang="scss" scoped>
$page-value-z-index: 100;

.active {
    padding: 15px;
    position: absolute;
    inset: 0;
    z-index: $page-value-z-index;
    backdrop-filter: blur(48px) saturate(0.5);
    transition: 250ms ease;
}
</style>
