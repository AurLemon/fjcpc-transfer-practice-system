<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ContainerPanel from './ContainerPanel.vue'
import PageViewContainer from './PageViewContainer.vue'
</script>

<template>
    <main class="page-container">
        <ContainerPanel />
        <div class="page-container-main">
            <div class="page-container-main-tools">
                <router-link to="/" class="page-container-main-tools__button" :exact-active-class="'active'">引导</router-link>
                <router-link to="/practice" class="page-container-main-tools__button" :exact-active-class="'active'">刷题</router-link>
                <router-link to="/test" class="page-container-main-tools__button" :exact-active-class="'active'">组卷</router-link>
                <router-link to="/view" class="page-container-main-tools__button" :exact-active-class="'active'">看题</router-link>
                <router-link to="/star" class="page-container-main-tools__button" :exact-active-class="'active'">收藏</router-link>
                <router-link to="/stat" class="page-container-main-tools__button" :exact-active-class="'active'">统计</router-link>
                <router-link to="/advanced" class="page-container-main-tools__button" :exact-active-class="'active'">设置</router-link>
                <router-link to="/about" class="page-container-main-tools__button" :exact-active-class="'active'">关于</router-link>
            </div>
            <div class="page-container-main-wrapper">
                <RouterView />
                <PageViewContainer />
            </div>
        </div>
    </main>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/media_screen.scss' as screen;

.page-container {
    --container-height: 75vh;
    --panel-width: 300px;
    display: flex;
    justify-content: space-between;
    gap: calc(var(--gap-value) * 2);
    max-width: var(--page-common-width);
    min-height: 600px;
    height: var(--container-height);
    margin: 0 auto;
    margin-bottom: 4rem;
    position: relative;

    .page-container-main {
        display: flex;
        width: calc(100% - var(--panel-width));
        border: 1px solid var(--border-color-base);
        border-radius: 10px;
        background: var(--color-surface-0);
        position: relative;

        .page-container-main-tools {
            display: flex;
            align-items: center;
            gap: calc(var(--gap-value) * 0.5);
            position: absolute;
            left: 0;
            bottom: calc(100% + 2px);

            .page-container-main-tools__button {
                color: var(--color-base--subtle);
                font-size: 12px;
                padding: 2px 4px;
                border-radius: 12px;
                text-decoration: none;
                transition: var(--transition-hover);
                user-select: none;

                &:hover {
                    color: var(--color-surface-0);
                    padding: 2px 8px;
                    background: var(--color-primary);
                }

                &:active {
                    transform: scale(0.9);
                }

                &.active {
                    color: var(--color-base--emphasized);
                    font-size: 13px;
                    font-weight: bold;

                    &:hover {
                        color: var(--color-surface-0);
                    }
                }
            }
        }

        .page-container-main-wrapper {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
        }

        .page-container-slide {
            height: 100%;
            padding: 15px;
        }
    }
}

@include screen.media-screen(phone) {
    .page-container {
        --container-height: 75vh;
        margin: 0 20px 3rem 20px;

        .page-container-main {
            width: 100%;

            .page-container-main-tools {
                bottom: calc(100% + 6px);
            }
        }
    }
}
</style>
