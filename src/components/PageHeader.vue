<script lang="ts">
import { defineComponent } from 'vue'
import { useCardStore } from '@/stores/card'

export default defineComponent({
    name: 'PageHeader',
    methods: {
        showMobilePanel() {
            this.cardStore.mobileShowPanel = !this.cardStore.mobileShowPanel
        }
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
    <nav class="page-menu">
        <div class="page-menu-wrapper">
            <div class="page-menu-title" @click="showMobilePanel">计大船政转轨考の刷题系统3.0</div>
            <div class="page-menu-list">
                <div class="page-menu-link">
                    <a href="https://wiki.hydcraft.cn/Player:%E6%9F%A0%E6%AA%AC" target="_blank">
                        <img src="../assets/images/logo_aurlemon.jpg" alt="项目开发者头像" />
                    </a>
                </div>
                <div class="page-menu-link">
                    <a href="https://fjgmxx.cn" target="_blank">
                        <img src="../assets/images/logo_fjgm.png" alt="福建工贸学校" />
                    </a>
                </div>
                <div class="page-menu-link">
                    <a href="https://www.fjcpc.edu.cn/" target="_blank">
                        <img src="../assets/images/logo_fjcpc.png" alt="福建船政交通职业学院" />
                    </a>
                </div>
                <div class="page-menu-link">
                    <a href="https://gitee.com/aurlemon/fjcpc-transfer-qb" target="_blank">
                        <img src="../assets/images/logo_gitee.svg" alt="Gitee 项目地址" />
                    </a>
                </div>
            </div>
        </div>
    </nav>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/media_screen.scss' as screen;

.page-menu {
    border-bottom: 1px solid var(--border-color-base);
    margin-bottom: calc(var(--gap-value) * 5);
}

.page-menu-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 1000px;
    margin: 0 auto;
    padding: 10px;

    .page-menu-title {
        font-size: 20px;
        font-weight: bold;
    }

    .page-menu-list {
        display: flex;
        gap: var(--gap-value);

        .page-menu-link {
            border-radius: 50%;
            box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            transition: var(--transition-hover);

            img {
                display: block;
                width: 24px;
                height: 24px;
                background: var(--color-surface-0);
            }

            &:hover {
                transform: scale(1.05);
            }
        }
    }
}

@include screen.media-screen(mobile) {
    .page-menu-wrapper {
        width: unset;
        padding: 10px 20px;
        align-items: flex-start;
        flex-direction: column-reverse;
        flex-wrap: wrap;
        gap: calc(var(--gap-value) / 2);

        .page-menu-title {
            font-size: 22px;
            padding: 2px 8px;
            border-radius: 8px;
            transition: var(--transition-hover);
            user-select: none;

            &:active {
                transform: scale(0.98);
                background: var(--border-color-base);
                transition-duration: 80ms;
            }
        }
        
        .page-menu-list {
            margin: 0 8px;
        }
    }
}
</style>
