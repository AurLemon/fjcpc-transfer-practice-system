<script lang="ts">
import { defineComponent } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useCardStore } from '@/stores/card'
import { useUserStore } from '@/stores/user'
import { useNotifyStore } from '@/stores/notify'

import { debounce } from '@/utils/debounce'
import { get, post, getPublicKey } from '@/api/api'
import { sm2Encrypt } from '@/utils/crypto'

interface Data {
    id_number: string
    password: string
    loadStatus: string
    loadingInfo: string
}

export default defineComponent({
    name: 'LoginCard',
    data(): Data {
        return {
            id_number: '',
            password: '',
            loadStatus: 'none',
            loadingInfo: ''
        }
    },
    methods: {
        async fetchData() {
            if (!this.id_number.length > 0 && !this.password.length > 0) {
                this.loadStatus = 'error'
                this.loadingInfo = '请输入账号密码'
                return
            }

            if (this.id_number.length < 18 && this.password.length < 6) {
                this.loadStatus = 'error'
                this.loadingInfo = '账号或密码长度不足'
                return
            }

            this.loadStatus = 'loading'
            this.loadingInfo = '正在获取公钥以加密信息…'
            const authStore = useAuthStore()
            const publicKey: string | null = await getPublicKey()
            if (publicKey !== null) {
                this.loadingInfo = '加密信息中…'
                const encryptedIdNumber = sm2Encrypt(this.id_number, publicKey)
                const encryptedPassword = sm2Encrypt(this.password, publicKey)

                try {
                    this.loadingInfo = '请求令牌以验证身份中…'
                    const tokenResponse: any = await post('/auth/login', {
                        id_number: encryptedIdNumber,
                        password: encryptedPassword
                    })

                    if (tokenResponse.data.data.type === 'password_incorrect') {
                        this.loadStatus = 'error'
                        this.loadingInfo = `密码错误`
                        this.userStore.login.isLogged = false
                        return
                    }

                    if (tokenResponse.data.data.type === 'password_illegal') {
                        this.loadStatus = 'error'
                        this.loadingInfo = `密码不合法`
                        this.userStore.login.isLogged = false
                        return
                    }

                    if (tokenResponse.data.data.type === 'Unauthorized') {
                        this.loadStatus = 'error'
                        this.loadingInfo = `请传入参数`
                        this.userStore.login.isLogged = false
                        return
                    }

                    if (tokenResponse.data.data.type === 'no_detected') {
                        this.loadStatus = 'error'
                        this.loadingInfo = `船政系统内不存在你的身份证，等船政加了你再说`
                        this.userStore.login.isLogged = false
                        return
                    }

                    const token = tokenResponse.data.data.tokens.access_token
                    const refreshToken = tokenResponse.data.data.tokens.refresh_token

                    authStore.setToken(token)
                    authStore.setRefreshToken(refreshToken)

                    this.loadStatus = 'success'
                    this.loadingInfo = tokenResponse.data.data.type === 'login' ? '登录成功' : '已自动注册，别把密码忘了宝宝'
                    this.userStore.login.isLogged = true
                    this.notifyStore.addMessage('success', '登录成功！')
                    authStore.getUserProfile()
                    this.userStore.fetchUserProgress()
                    this.userStore.fetchStarProgress()
                    setTimeout(() => {
                        this.closeLoginCard()
                    }, 1200)
                } catch (err) {
                    this.loadStatus = 'error'
                    this.loadingInfo = `请求失败（${err}）`
                    this.userStore.login.isLogged = false
                }
            } else {
                this.loadStatus = 'error'
                this.loadingInfo = '获取公钥失败，请检查网络连接。'
            }
        },
        closeLoginCard() {
            this.cardStore.showLoginCard = false
        },
        keyupFetchData: debounce(function () {
            this.fetchData()
        }, 300),
        resetLoadStatus: debounce(function () {
            setTimeout(() => {
                ;(this.loadStatus = 'none'), (this.loadingInfo = '')
            }, 2000)
        }, 1000)
    },
    watch: {
        loadStatus(newStatus) {
            if (newStatus === 'success' || newStatus === 'error') {
                this.resetLoadStatus()
            }
        }
    },
    setup() {
        const cardStore = useCardStore()
        const userStore = useUserStore()
        const notifyStore = useNotifyStore()
        return {
            cardStore,
            userStore,
            notifyStore
        }
    }
})
</script>

<template>
    <div class="view-login">
        <div class="view-login-main">
            <div class="view-login-title" v-if="!userStore.login.isLogged">登录</div>
            <div class="view-login-title" v-else>切换账户</div>
            <div class="view-login-tips">账户系统基于船政转轨练习系统的用户信息二次封装开发</div>
            <div class="view-login-form">
                <div class="view-login-form__input" :class="{ disabled: loadStatus === 'loading' }">
                    <label>身份证</label>
                    <input type="text" placeholder="请输入身份证号" v-model="id_number" maxlength="18" @keyup.enter="keyupFetchData" />
                </div>
                <div class="view-login-form__input" :class="{ disabled: loadStatus === 'loading' }">
                    <label>登录码</label>
                    <input type="password" placeholder="请输入6位数字的登录码" v-model="password" maxlength="6" @keyup.enter="keyupFetchData" />
                </div>
                <div class="view-login-form__login">
                    <button @click="fetchData" :class="{ disabled: loadStatus === 'loading' }">
                        登录
                        <div class="material-icons loading" :class="{ show: loadStatus === 'loading' }">autorenew</div>
                        <div class="material-icons success" :class="{ show: loadStatus === 'success' }">done</div>
                        <div class="material-icons error" :class="{ show: loadStatus === 'error' }">close</div>
                    </button>
                    <div class="view-login-form__loading">
                        <div class="loading-info">{{ loadingInfo }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="view-login-desc">
            <div class="view-login-desc__title">登录须知</div>
            <ul class="view-login-desc__list">
                <li>未注册的会自动注册，登录码需要纯六位数字。</li>
                <li>不登录也可以做题，只不过做题数据会保留在本地，换浏览器就会丢失。</li>
                <li>必须船政转轨考联系中心的系统里有你的身份证信息，才能在本站进行登录。为了安全考虑，不然随便来一个身份证就把数据库填满了。</li>
                <li>
                    身份证信息在前后端的存储都是密文的。前后端交互过程采用非对称加密算法 SM2 加密，后端数据库采用 SHA256
                    算法加密，具体可以查阅本项目的代码仓库进行安全审查。
                </li>
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
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    position: relative;

    .view-login-main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin: auto;
    }

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

        .view-login-form__input {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: 250ms ease;

            label {
                color: var(--color-base--emphasized);
                font-size: 14px;
                user-select: none;
            }

            input {
                font-size: 14px;
                min-width: 200px;
                background: var(--color-surface-0);
                outline: 2px solid transparent;
                transition: 250ms ease;

                &:focus {
                    outline: 2px solid var(--color-primary);
                }

                @include screen.media-screen(mobile) {
                    width: 180px;
                    min-width: unset;
                }
            }

            &.disabled {
                opacity: 0.5;
                user-select: none;
                pointer-events: none;
                transform: scale(0.92);
            }
        }

        .view-login-form__login {
            margin: 2rem auto 0 auto;
            position: relative;

            button {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 0.25rem;
                color: var(--color-surface-0);
                width: 150px;
                background: var(--color-primary);
                cursor: pointer;
                transition: 150ms ease;

                &:hover {
                    background: var(--color-base--subtle);
                    box-shadow: 0 1px 5px var(--border-color-base--darker);
                }

                &:active {
                    transform: scale(0.98);
                }

                &.disabled {
                    filter: grayscale(1);
                    cursor: not-allowed;
                }

                @keyframes loading {
                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }
                }

                .material-icons {
                    display: none;
                    position: absolute;
                    left: calc(100% + 4px);
                    color: var(--color-base--subtle);
                    user-select: none;

                    &.show {
                        display: block;
                    }
                }

                .loading {
                    animation: loading 800ms linear infinite;
                }

                .success {
                    color: var(--success-color);
                }

                .error {
                    color: var(--failed-color);
                }
            }

            .view-login-form__loading {
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-base--subtle);
                font-size: 12px;
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: 0;
                opacity: 0.5;
                user-select: none;

                .loading-info {
                    white-space: nowrap;
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
            color: var(--failed-color);
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
