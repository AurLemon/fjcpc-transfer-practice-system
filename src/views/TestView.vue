<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'TestView'
})
</script>

<template>
    <div class="page-container-slide page-test">
        <iframe class="fjcpc-transfer-exam" src="https://appzb.fjcpc.edu.cn/kszx-test32-app/#/login" frameborder="0"></iframe>
    </div>
</template>

<style lang="scss" scoped>
.page-test {
    padding: 0 !important;

    iframe.fjcpc-transfer-exam {
        width: 100%;
        height: 100%;
    }
}
</style>
