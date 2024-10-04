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
                <router-link to="/test" class="page-container-main-tools__button" :exact-active-class="'active'">试卷</router-link>
                <router-link to="/view" class="page-container-main-tools__button" :exact-active-class="'active'">看题</router-link>
                <router-link to="/star" class="page-container-main-tools__button" :exact-active-class="'active'">收藏</router-link>
                <router-link to="/stat" class="page-container-main-tools__button" :exact-active-class="'active'">统计</router-link>
                <router-link to="/advanced" class="page-container-main-tools__button" :exact-active-class="'active'">设置</router-link>
                <router-link to="/about" class="page-container-main-tools__button" :exact-active-class="'active'">关于</router-link>
                <router-link to="/debug" class="page-container-main-tools__button" :exact-active-class="'active'">调试</router-link>
            </div>
            <div class="page-container-main-wrapper">
                <Transition name="route">
                    <RouterView />
                </Transition>
                <PageViewContainer />
            </div>
        </div>
    </main>
</template>

<style lang="scss" scoped>
.route-enter-active,
.route-leave-active {
    transition: 300ms ease;
}

.route-enter-from,
.enter-leave-to {
    transform: translateX(-20px);
    opacity: 0;
}
</style>

<style lang="scss" scoped>
@use '@/assets/styles/media_screen.scss' as screen;

.page-container {
    --container-height: 78vh;
    --panel-width: 300px;
    display: flex;
    justify-content: center;
    gap: calc(var(--gap-value) * 2);
    min-height: 400px;
    height: var(--container-height);
    margin: auto 8rem;
    position: relative;

    @include screen.media-screen(phone) {
        --container-height: 80vh;
    }

    .page-container-main {
        display: flex;
        flex: 1;
        width: 60vw;
        max-width: 900px;
        border: 1px solid var(--border-color-base);
        border-radius: 10px;
        background: var(--color-surface-0);
        box-shadow: var(--box-shadow-diverge);
        transition: box-shadow 200ms ease;
        position: relative;

        &:hover {
            box-shadow: var(--box-shadow-diverge--hover);
        }

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
                white-space: nowrap;
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
            padding: 1.5rem;
        }
    }
}

@include screen.media-screen(mobile) {
    .page-container {
        width: 100%;
        padding: 0 1.25rem;
        margin: 3rem 0;

        .page-container-main {
            width: 100%;

            .page-container-main-tools {
                width: 100%;
                bottom: calc(100% + 4px);
                padding-bottom: 5px;
                overflow-x: auto;
            }
        }
    }
}
</style>
