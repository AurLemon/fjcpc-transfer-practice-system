<script lang="ts">
import { defineComponent } from 'vue'
import QuestionRender from '@/components/question/QuestionRender.vue'

export default defineComponent({
    name: 'AllQuestionsView',
    components: {
        QuestionRender
    }
})
</script>

<template>
    <div class="page-container-slide page-view">
        <QuestionRender />
    </div>
</template>

<style lang="scss" scoped>
.page-test {
    padding: 0 !important;
}
</style>
