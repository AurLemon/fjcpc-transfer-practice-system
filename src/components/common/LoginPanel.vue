<script lang="ts">
import { defineComponent } from 'vue'
import { useAuthStore } from '@/stores/auth'

import { sm2 } from 'sm-crypto-v2'
import { get, post } from '@/api/api'

interface Data {
    id_number: string
    password: string
}

export default defineComponent({
    data(): Data {
        return {
            id_number: '',
            password: ''
        }
    },
    methods: {
        async fetchData() {
            const authStore = useAuthStore() // 使用 Pinia Store

            try {
                // 获取公钥
                const keyResponse = await get<{ data: Object; public_key: string }>('/auth/login')
                const cipherMode = 1
                const publicKey = keyResponse.data.public_key

                // 使用公钥加密身份证和密码
                const encryptedIdNumber = sm2.doEncrypt(this.id_number, publicKey, cipherMode)
                const encryptedPassword = sm2.doEncrypt(this.password, publicKey, cipherMode)

                try {
                    // 发送登录请求并获取 token 和 refresh_token
                    const tokenResponse = await post<{
                        data: Object
                        token: string
                        refresh_token: string
                    }>('/auth/login', {
                        id_number: encryptedIdNumber,
                        password: encryptedPassword
                    })

                    // 获取 token 和 refresh_token
                    const token = tokenResponse.data.token
                    const refreshToken = tokenResponse.data.refresh_token

                    // 使用 Pinia 存储 token 和 refresh_token
                    authStore.setToken(token)
                    authStore.setRefreshToken(refreshToken)
                } catch (err) {
                    console.error(`请检查网络连接。（${err}）`)
                }
            } catch (err) {
                console.error(`请检查网络连接。（${err}）`)
            }
        }
    }
})
</script>

<template>
    <div class="page-login">
        
    </div>
</template>

<style lang="scss" scoped></style>
