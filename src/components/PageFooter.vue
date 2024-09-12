<template>
    <footer class="page-footer">
        <div class="page-footer-project">
            <div class="page-footer-project__link">
                <a href="https://beian.miit.gov.cn/" target="_blank">
                    <img src="../assets/images/beian_miit.png" width="16" height="16" />
                    闽ICP备2023007345号-1
                </a>
                <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank">
                    <img src="../assets/images/beian_mps.png" width="16" height="16" />
                    闽公网安备35010202001677号
                </a>
                <a href="https://lemon.hydcraft.cn/stat" target="_blank">
                    <img src="../assets/images/favicon.png" width="16" height="16" />
                    用户做题统计
                </a>
                <a href="https://appzb.fjcpc.edu.cn/kszx-test32/#/login" target="_blank">
                    <img src="../assets/images/logo_fjcpc.png" width="16" height="16" />
                    船政刷题登录
                </a>
            </div>
        </div>
        <div class="page-footer-copyright">This project based on Vue.js + Nest.js, coding and design by AurLemon. © 2024 AurLemon under License MIT</div>
    </footer>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/media_screen.scss' as screen;

.page-footer {
    color: var(--color-surface-4);
    font-size: 12px;
    max-width: var(--page-common-width);
    margin: 0 auto;
    margin-bottom: 2rem;

    .page-footer-copyright {
        text-align: center;
    }

    .page-footer-project {
        display: flex;
        justify-content: center;
        padding-bottom: 0.25rem;
        margin-bottom: 0.25rem;
        border-bottom: 1px solid var(--border-color-base);
    }

    .page-footer-project__link {
        display: flex;
        gap: calc(var(--gap-value) / 6);

        a {
            display: flex;
            align-items: center;
            gap: 3px;
            color: var(--color-base--subtle);
            text-decoration: none;
            padding: 2px 6px;
            border-radius: 8px;
            transition: var(--transition-hover);

            &:hover {
                background: var(--border-color-base);
            }

            &:active {
                transform: scale(0.98);
            }
        }

        img {
            width: 16px;
            height: 16px;
            border-radius: 50%;
        }
    }
}

@include screen.media-screen(mobile) {
    .page-footer {
        margin: 0 1rem 3rem 1rem;

        .page-footer-project {
            padding-bottom: 0.75rem;
        }

        .page-footer-project__name {
            margin: 10px;
        }

        .page-footer-project__link {
            flex-wrap: wrap;
            gap: 0.75px;
        }
    }
}
</style>
