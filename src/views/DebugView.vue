<script setup lang="ts">
import { ref } from 'vue'
import { encryptWithSM2 } from '../utils/crypto'

const value = ref<string[]>([])

const encryptData = (data: string[], key: string) => {
    return data.map((item) => encryptWithSM2(item, key))
}

value.value = encryptData(dataToEncrypt, publicKey)
</script>

<template>
    <div class="page-debug">
        {{ value }}
    </div>
</template>

<style>
.page-debug {
    word-break: break-all;
}
</style>
