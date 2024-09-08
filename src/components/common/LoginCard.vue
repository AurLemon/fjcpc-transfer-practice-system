<script lang="ts">
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCardStore } from '@/stores/card'

import { sm2 } from 'sm-crypto-v2'
import { get, post } from '@/api/api'

interface Data {
    id_number: string
    password: string
}

export default defineComponent({
    name: 'LoginCard',
    data(): Data {
        return {
            id_number: '',
            password: ''
        }
    },
    methods: {
        async fetchData() {
            const authStore = useAuthStore()

            try {
                const keyResponse = await get<{ data: Object; public_key: string }>('/auth/login')
                const cipherMode = 1
                const publicKey = keyResponse.data.public_key

                const encryptedIdNumber = sm2.doEncrypt(this.id_number, publicKey, cipherMode)
                const encryptedPassword = sm2.doEncrypt(this.password, publicKey, cipherMode)

                try {
                    const tokenResponse = await post<{
                        data: Object
                        token: string
                        refresh_token: string
                    }>('/auth/login', {
                        id_number: encryptedIdNumber,
                        password: encryptedPassword
                    })

                    const token = tokenResponse.data.token
                    const refreshToken = tokenResponse.data.refresh_token

                    authStore.setToken(token)
                    authStore.setRefreshToken(refreshToken)
                } catch (err) {
                    console.error(`请检查网络连接。（${err}）`)
                }
            } catch (err) {
                console.error(`请检查网络连接。（${err}）`)
            }
        },
        closeLoginCard() {
            this.cardStore.showLoginCard = false
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
    <div class="view-login">
        <div class="view-login-title">登录</div>
        <div class="view-login-tips">账户系统基于船政转轨练习系统的用户信息二次封装开发</div>
        <div class="view-login-form">
            <div class="view-login-form__input">
                <label>身份证</label>
                <input type="text" placeholder="请输入身份证号" />
            </div>
            <div class="view-login-form__input">
                <label>登录码</label>
                <input type="text" placeholder="请输入6位数字的登录码" />
            </div>
            <div class="view-login-form__login">
                <button>登录</button>
            </div>
        </div>
        <div class="view-login-desc">
            <div class="view-login-desc__title">登录须知</div>
            <ul class="view-login-desc__list">
                <li>未注册的会自动注册，登录码需要纯六位数字。</li>
                <li>不登录也可以做题，只不过做题数据会保留在本地，换浏览器就会丢失。</li>
                <li>必须船政转轨考联系中心的系统里有你的身份证信息，才能在本站进行登录。为了安全考虑，不然随便来一个身份证就把数据库填满了。</li>
                <li>身份证信息在前后端的存储都是密文的。前后端交互过程采用非对称加密算法 SM2 加密，后端数据库采用 AES 加密算法。可以查阅本项目的代码仓库进行安全审查。</li>
            </ul>
        </div>
        <div class="view-login-close" @click="closeLoginCard">
            <span class="material-icons">close</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/media_screen.scss' as screen;

.view-login {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    position: relative;

    .view-login-title {
        font-size: 28px;
        font-weight: 600;
    }

    .view-login-tips {
        font-size: 12px;
    }

    .view-login-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 3.5rem;
        margin-bottom: 4.5rem;

        .view-login-form__input {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            label {
                color: var(--color-base--emphasized);
                font-size: 14px;
                user-select: none;
            }

            input {
                font-size: 14px;
                min-width: 350px;
                background: var(--color-surface-0);
                outline: 2px solid transparent;
                transition: 250ms ease;

                &:focus {
                    outline: 2px solid var(--color-primary);
                }

                @include screen.media-screen(mobile) {
                    width: 250px;
                    min-width: unset;
                }
            }
        }

        .view-login-form__login {
            margin: 2rem auto 0 auto;

            button {
                color: var(--color-surface-0);
                width: 150px;
                background: var(--color-primary);
                cursor: pointer;

                &:hover {
                    transform: scale(0.98);
                    box-shadow: 0 1px 5px var(--border-color-base--darker);
                }

                &:active {
                    transform: scale(0.95);
                }
            }
        }
    }

    .view-login-desc {
        color: var(--color-base--subtle);
        font-size: 12px;
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-color-base--darker);
        border-radius: 12px;

        .view-login-desc__title {
            color: var(--color-surface-4);
            margin-bottom: 0.25rem;
        }

        .view-login-desc__list {
            margin: 0;
            padding: 0;
            list-style-type: none;

            li {
                &::before {
                    content: '•';
                    margin-right: 6px;
                }
            }
        }
    }

    .view-login-close {
        position: absolute;
        top: 0;
        right: 0;
        padding: 5px;
        user-select: none;
        border-radius: 50%;
        transition: 250ms ease;

        .material-icons {
            display: block;
            font-size: 36px;
        }

        &:hover {
            background: var(--border-color-base);
            transform: rotate(-15deg);
        }

        &:active {
            transform: rotate(-15deg) scale(0.96);
            transition-duration: 80ms;
        }
    }
}
</style>
