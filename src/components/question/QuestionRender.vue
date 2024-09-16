<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import _ from 'lodash-es'

import { get, post } from '@/api/api'
import { debounce } from '@/utils/debounce'

import { useUserStore } from '@/stores/user'
import { useQuestionStore } from '@/stores/question'
import { useNotifyStore } from '@/stores/notify'

const userStore = useUserStore()
const questionStore = useQuestionStore()
const notifyStore = useNotifyStore()

interface UserSetting {
    course: number
    subject: number
    type: number
    sort_column: string
    order: string
}

const userSetting = ref<UserSetting>({
    course: 1,
    subject: -1,
    type: -1,
    sort_column: 'pid',
    order: 'asc'
})

const userSettingOldValue = ref<UserSetting>({
    course: 1,
    subject: -1,
    type: -1,
    sort_column: 'pid',
    order: 'asc'
})

let isDone = ref<boolean>(false)
let isMark = ref<boolean>(false)

const updateDone = () => {
    isDone.value = !isDone.value
}

const updateBookmark = () => {
    isMark.value = !isMark.value
}

const renderQuestionCourse = (course: number) => {
    if (course === 1) {
        return '文化基础'
    } else if (course === 2) {
        return '专业基础'
    }
}

const renderQuestionSubject = (course: number, subject: number) => {
    if (course === 1) {
        switch (subject) {
            case 1:
                return '语文'
            case 2:
                return '数学'
            case 3:
                return '英语'
            case 4:
                return '政治'
        }
    } else if (course === 2) {
        return questionStore.questionInfo.profession_lesson.find((item) => item.subject === subject)?.name || null
    }
}
const renderQuestionType = (type: number) => {
    switch (type) {
        case 0:
            return '单选题'
        case 1:
            return '多选题'
        case 2:
            return '判断题'
        case 8:
            return '阅读题'
    }
}

interface Option {
    id: number
    xx: string
    txt: string
}

interface Question {
    index: number
    unique_code: string
    pid: string
    content: string
    type: number
    options: Option[]
    sub_options: Option[] | null
    answer: string[]
    subject: number
    course: number
    created_time: string
    updated_time: string
    crawl_time: string
    done_count: number
    incorrect_count: number
    status: boolean
    crawl_count: number
}

interface QuestionsResponse {
    questions: Question[]
    offset_pid: string
    stat: {
        course: number
        subject: number
        type: number
        order: string
        sort_column: string
        total_questions: number
    }
}

const questions = ref<Question[]>([])
const questionsInfo = ref<QuestionsResponse['stat']>({
    course: 1,
    subject: -1,
    type: -1,
    order: 'asc',
    sort_column: 'pid',
    total_questions: 0
})
const nextPid = ref<string | null>(null)
const prevPid = ref<string | null>(null)

const currentId = ref<number>(1)
const isLoadQuestion = ref<boolean>(false)
const reloadCount = ref<number>(0)

const addQuestion = (newQuestions: any[]) => {
    newQuestions.forEach((newQuestion) => {
        const exists = questions.value.some((q) => q.index === newQuestion.index)

        if (!exists) {
            questions.value.push(newQuestion)
        }
    })

    questions.value.sort((a, b) => a.index - b.index)
}

const getQuestions = async (params?: any, callback?: any) => {
    isLoadQuestion.value = true

    const sendParams = {
        course: userSetting.value.course,
        subject: userSetting.value.subject,
        type: userSetting.value.type,
        sort_column: userSetting.value.sort_column,
        order: userSetting.value.order,
        ...params
    }

    try {
        const response: any = await get('/question/practice', sendParams)

        if (response.data.data.questions.length === 0) {
            notifyStore.addMessage(
                'failed',
                `有没有可能，${renderQuestionSubject(questionsInfo.value.course, questionsInfo.value.subject)}根本就没有${renderQuestionType(userSetting.value.type)}`
            )
            notifyStore.addMessage('success', '即将加载原数据')
            userSetting.value = userSettingOldValue.value
            setTimeout(() => {
                getQuestions()
            }, 500)
        } else {
            addQuestion(response.data.data.questions)
        }

        questionsInfo.value = response.data.data.stat
        nextPid.value = response.data.data.next_pid
        prevPid.value = response.data.data.prev_pid

        if (callback) {
            callback()
        }
    } catch (error) {
        if (reloadCount.value <= 5) {
            reloadCount.value++
            setTimeout(() => {
                getQuestions
            }, 500)
        } else {
            reloadCount.value = 0
            notifyStore.addMessage('success', '无法请求题库信息，请检查网络连接。')
        }
    } finally {
        isLoadQuestion.value = false
    }
}

const currentQuestion = computed(() => {
    return questions.value.find((question) => question.index === currentId.value) || null
})

const resetQuestionComplete = () => {
    showAnswer.value = false
    userChoice.value = []
}

const prevQuestion = () => {
    resetQuestionComplete()
    const previousQuestion = questions.value.filter((q) => q.index < currentId.value).sort((a, b) => b.index - a.index)[0]

    if (previousQuestion) {
        currentId.value = previousQuestion.index
    } else {
        notifyStore.addMessage('success', '没上一题了姐姐')
    }
}

const nextQuestion = () => {
    resetQuestionComplete()
    const nextQuestion = questions.value.filter((q) => q.index > currentId.value).sort((a, b) => a.index - b.index)[0]

    if (nextQuestion) {
        currentId.value = nextQuestion.index
    } else {
        currentId.value = 1
        notifyStore.addMessage('success', '没下一题了姐姐')
    }
}

const minIndex = ref(1)
const maxIndex = ref(1)

watch(currentId, (newVal, oldVal) => {
    const indices = questions.value.map((q) => q.index)
    minIndex.value = Math.min(...indices)
    maxIndex.value = Math.max(...indices)

    // 下面这些打印出来都是给我自己看的
    // console.log('最小 index:', minIndex.value)
    // console.log('最大 index:', maxIndex.value)

    if (maxIndex.value - newVal <= 4 && nextPid.value) {
        if (maxIndex.value < questionsInfo.value.total_questions) {
            getQuestions({ next_pid: nextPid.value })
        }
    }

    if (newVal - minIndex.value > 8) {
        questions.value = questions.value.filter((q) => q.index >= newVal - 8)
        // console.log('移除旧问题，剩余问题:', questions.value)
    }

    if (newVal - minIndex.value < 4 && prevPid.value) {
        if (minIndex.value > 1) {
            getQuestions({ prev_pid: prevPid.value })
        }
    }

    // if (newVal === 1 && !prevPid.value) {
    //     console.log('已经到最前面，没有更多数据可以加载。')
    // }

    // if (maxIndex.value >= questionsInfo.value.total_questions && !nextPid.value) {
    //     console.log('已经到最后一题，没有更多数据可以加载。')
    // }
})

const userChoice = ref<string[]>([])

const addChoice = (id: number) => {
    const stringId = id.toString()
    const index = userChoice.value.indexOf(stringId)

    if (index === -1) {
        userChoice.value.push(stringId)
    } else {
        userChoice.value.splice(index, 1)
    }
}

const checkAnswerCorrect = () => {
    return _.isEqual(_.sortBy(userChoice.value), _.sortBy(currentQuestion.value?.answer || []))
}

const renderAnswerNumber = (
    type: number,
    answer: string[] | string[][],
    options: { id: number; xx?: string; txt: string }[],
    subOptions?: { list: { id: number; xx: string }[] }[]
) => {
    if (type === 2) {
        return (answer as string[])
            .map((a) => {
                const option = options.find((opt) => opt.id.toString() === a)
                if (option) {
                    return option.txt === '对' ? 'T' : 'F'
                }
                return ''
            })
            .join('')
    }

    if (Array.isArray(answer[0])) {
        return (answer as string[][])
            .map((subAnswer, index) => {
                const subOptionList = subOptions?.[index].list || []
                return subAnswer.map((a) => subOptionList.find((option) => option.id.toString() === a)?.xx).join('')
            })
            .sort()
            .join('-')
    } else {
        return (answer as string[])
            .map((a) => options.find((option) => option.id.toString() === a)?.xx)
            .sort()
            .join('')
    }
}

const showAnswer = ref<boolean>(false)
const isAnswerCorrect = ref<boolean>(false)
const checkAnswer = () => {
    showAnswer.value = true
    isAnswerCorrect.value = checkAnswerCorrect() ? true : false
}

const debouncedGetQuestions = debounce(getQuestions, 500)

watch(
    () => JSON.parse(JSON.stringify(userSetting.value)),
    (newVal, oldVal) => {
        debouncedGetQuestions()
        userSettingOldValue.value = oldVal
        questions.value = []
        currentId.value = 1
    },
    {
        deep: true
    }
)

const handleKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
        case 'ArrowUp':
            console.log(1)
            break
        case 'ArrowDown':
            console.log(2)
            break
        case 'ArrowLeft':
            prevQuestion()
            break
        case 'ArrowRight':
            nextQuestion()
            break
        case 'Enter':
            checkAnswer()
            break
        default:
            break
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
})

getQuestions()
</script>

<template>
    <div class="question-render-wrapper" :class="{ loading: isLoadQuestion }">
        <div class="question-render-info" v-if="!isLoadQuestion && currentQuestion">
            <div class="question-render-info__subject">{{ renderQuestionCourse(questionsInfo?.course) }}</div>
            <div class="question-render-info__status">
                <div class="question-render-info__direction question-render-info__previous" @click="prevQuestion">
                    <span class="material-icons">keyboard_arrow_left</span>
                </div>
                <div class="question-render-info__current">
                    <span class="now">{{ currentQuestion?.index }}</span
                    >/<span class="max">{{ questionsInfo?.total_questions }}</span>
                </div>
                <div class="question-render-info__direction question-render-info__next" @click="nextQuestion">
                    <span class="material-icons">keyboard_arrow_right</span>
                </div>
            </div>
            <div class="question-render-info__id" v-tippy="{ appendTo: 'parent', content: '题目在船政系统里面的编号' }">{{ currentQuestion?.pid }}</div>
            <div class="question-render-info__sheet">1111</div>
        </div>
        <div class="question-render-questions">
            <div class="question-render-question" v-if="!isLoadQuestion && currentQuestion">
                <div class="question-type">
                    {{ renderQuestionType(currentQuestion?.type ?? 0) }}
                </div>
                <div class="question-content" v-html="currentQuestion?.content"></div>
                <div class="question-options" v-if="currentQuestion && currentQuestion.options">
                    <div
                        class="question-option"
                        v-for="option in currentQuestion?.options"
                        :key="option.id"
                        @click="addChoice(option.id)"
                        :class="{
                            selected: userChoice.includes(option.id.toString()),
                            answer: showAnswer && currentQuestion.answer.includes(option.id.toString()),
                            error: showAnswer && !currentQuestion.answer.includes(option.id.toString()) && userChoice.includes(option.id.toString())
                        }"
                    >
                        <div class="question-option-number">{{ currentQuestion?.type !== 2 ? option.xx : option.txt === '对' ? 'T' : 'F' }}</div>
                        <div class="question-option-content" v-html="option.txt"></div>
                    </div>
                </div>
            </div>
            <div class="question-render-loading" v-else>
                <span class="material-icons">autorenew</span>
            </div>
        </div>
        <div class="question-render-tools">
            <div class="question-answer" v-if="userChoice.length > 0 && currentQuestion">
                <div class="question-answer-infos">
                    <div class="question-answer-user question-answer-info" v-if="showAnswer">
                        <div class="question-answer-user__label question-answer-info__label">你的答案</div>
                        <div class="question-answer-user__answer question-answer-info__answer" :class="{ error: !isAnswerCorrect }">
                            {{ renderAnswerNumber(currentQuestion?.type, userChoice, currentQuestion?.options || []) }}
                        </div>
                    </div>
                    <div class="question-answer-system question-answer-info" v-if="showAnswer">
                        <div class="question-answer-system__label question-answer-info__label">正确答案</div>
                        <div class="question-answer-system__answer question-answer-info__answer">
                            {{ renderAnswerNumber(currentQuestion?.type, currentQuestion?.answer || [], currentQuestion?.options || []) }}
                        </div>
                    </div>
                </div>
                <button
                    @click="checkAnswer"
                    v-if="!showAnswer"
                    v-tippy="{ appendTo: 'parent', content: '其实电脑上直接按方向键或者回车也可以操作哦，点来点去很累' }"
                >
                    <span class="material-icons">library_add_check</span>
                    检查
                </button>
                <button @click="nextQuestion" v-else>
                    <span class="material-icons">fast_forward</span>
                    下一题
                </button>
            </div>
            <div class="question-render-tools__options">
                <select class="question-render-tools__option" v-model="userSetting.course" content="课程类型" v-tippy="{ appendTo: 'parent' }">
                    <option :value="1">文化课</option>
                    <option :value="2">专业课</option>
                </select>
                <select
                    class="question-render-tools__option"
                    v-model="userSetting.subject"
                    v-if="!questionStore.isGetQuestionInfo"
                    content="科目"
                    v-tippy="{ appendTo: 'parent' }"
                >
                    <option value="-1">所有科目</option>
                    <option
                        v-for="subject in questionStore.questionInfo[userSetting.course === 1 ? 'cultural_lesson' : 'profession_lesson']"
                        :value="subject.subject"
                        :key="subject.subject"
                    >
                        {{ subject.name }}
                    </option>
                </select>
                <select class="question-render-tools__option" v-model="userSetting.type" content="题型" v-tippy="{ appendTo: 'parent' }">
                    <option :value="-1">所有题型</option>
                    <option :value="0">单选题</option>
                    <option :value="1">多选题</option>
                    <option :value="2">判断题</option>
                    <option :value="8">阅读题</option>
                </select>
                <select class="question-render-tools__option" v-model="userSetting.sort_column" content="排序列" v-tippy="{ appendTo: 'parent' }">
                    <option value="pid">题目编号</option>
                    <option value="crawl_count">出现概率</option>
                </select>
                <select class="question-render-tools__option" v-model="userSetting.order" content="排序方式" v-tippy="{ appendTo: 'parent' }">
                    <option value="asc">升序</option>
                    <option value="desc">降序</option>
                </select>
            </div>
            <div class="question-render-tools__buttons">
                <div class="question-render-tools__button material-icons" @click="updateDone" content="做没做过这题" v-tippy="{ appendTo: 'parent' }">
                    {{ isDone ? 'check_circle' : 'check_circle_outline' }}
                </div>
                <div class="question-render-tools__button material-icons" @click="updateBookmark" content="收藏" v-tippy="{ appendTo: 'parent' }">
                    {{ isMark ? 'bookmark' : 'bookmark_border' }}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/media_screen.scss' as screen;

.question-render-wrapper {
    --page-container-practice-margin-vertical: 30px;
    --page-container-practice-margin-horizon: 50px;
    --page-container-practice-answer-height: 100px;
    display: flex;
    flex-direction: column;
    padding: 0;
    height: 100%;

    .question-render-info {
        display: flex;
        justify-content: center;
        font-size: 14px;
        padding: 5px 15px;
        margin: 0 20px;
        border-bottom: 1px solid var(--border-color-base);
        position: relative;
        transition: 250ms ease;

        @include screen.media-screen(phone) {
            flex-wrap: wrap;
            row-gap: 6px;
        }

        .question-render-info__subject,
        .question-render-info__id {
            display: flex;
            align-items: center;
            color: var(--color-surface-4);
            flex-basis: 25%;

            @include screen.media-screen(phone) {
                justify-content: center !important;
                flex: 0 0 50%;
            }
        }

        .question-render-info__status {
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--color-base--emphasized);
            font-size: 16px;

            @include screen.media-screen(phone) {
                font-size: 18px;
                flex: 1 0 100%;
                order: -1;
            }

            .question-render-info__current {
                width: 5.5rem;
                text-align: center;
                margin: 0 2rem;
            }

            .question-render-info__direction {
                border-radius: 50%;
                user-select: none;
                transition: 200ms ease;

                .material-icons {
                    display: block;
                }

                &:hover {
                    background: var(--border-color-base);
                }

                &:active {
                    transform: scale(0.9);
                    transition-duration: 80ms;
                }
            }
        }

        .question-render-info__id {
            justify-content: flex-end;
        }

        .question-render-info__sheet {
            --page-practice-sheet-height: 250px;
            --page-practice-sheet-title-height: 20px;
            height: 0;
            padding: 0;
            opacity: 0;
            pointer-events: none;
            user-select: none;
            border: 1px solid var(--border-color-base--lighter);
            border-radius: 12px;
            background: var(--color-surface-2);
            box-shadow: 0px 0px 0px rgba(0, 0, 0, 0);
            position: absolute;
            top: 100%;
            right: 0;
            z-index: 1;
            overflow: hidden;
            transition: var(--transition-hover);

            &.active {
                height: var(--page-practice-sheet-height);
                padding: 6px;
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
                opacity: 1;
                pointer-events: all;
                user-select: auto;
            }
        }
    }

    .question-render-questions {
        height: 100%;
        overflow-y: auto;

        .question-render-question {
            height: 100%;
            padding: var(--page-container-practice-margin-vertical) var(--page-container-practice-margin-horizon);
            padding-bottom: calc(var(--page-container-practice-answer-height) + 10px);
            overflow-y: auto;

            .question-type {
                color: var(--color-surface-0);
                font-size: 12px;
                width: fit-content;
                margin-bottom: 0.75rem;
                padding: 3px 9px;
                border-radius: 12px;
                background: var(--color-primary);
            }

            .question-content {
                margin-bottom: 1rem;
            }

            .question-options,
            .question-sub-options {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;

                .question-option,
                .question-sub-option {
                    display: flex;
                    align-items: baseline;
                    padding: 6px 8px;
                    background: var(--color-surface-2);
                    border-radius: 8px;
                    transition: 150ms ease;
                    transition-duration: 0ms;
                    cursor: pointer;
                    user-select: none;

                    .question-option-number {
                        font-weight: 600;
                        padding: 0 6px;
                        margin-right: 6px;
                    }

                    @media screen and (hover: hover) {
                        &:hover {
                            background: var(--color-surface-3);
                            transition-duration: 150ms;
                        }
                    }

                    &:active {
                        transform: scale(0.99);
                        transition-duration: 80ms;
                    }

                    &.selected {
                        background: var(--background-color-primary--active);
                        transition-duration: 150ms;
                    }

                    &.error {
                        color: var(--color-surface-0);
                        background: var(--failed-color);
                        transition-duration: 150ms;
                    }

                    &.answer {
                        color: var(--color-surface-0);
                        background: var(--success-color);
                        transition-duration: 150ms;
                    }
                }
            }
        }

        .question-render-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;

            @keyframes loading {
                from {
                    transform: rotate(0deg);
                }

                to {
                    transform: rotate(360deg);
                }
            }

            .material-icons {
                font-size: 48px;
                animation: loading 500ms linear infinite;
                user-select: none;
            }
        }
    }

    .question-render-tools {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background: var(--color-surface-2);
        position: relative;
        transition: 250ms ease;

        .question-answer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: var(--page-container-practice-answer-height);
            padding: 0.5rem var(--page-container-practice-margin-horizon);
            background: linear-gradient(180deg, transparent -15%, var(--color-surface-0) 75%);
            backdrop-filter: blur(8px);
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;

            @include screen.media-screen(phone) {
                flex-wrap: wrap;
                padding: 0.25rem 1rem;
            }

            .question-answer-infos {
                display: flex;
                gap: 0.5rem;

                .question-answer-info {
                    display: flex;
                    flex-direction: column;

                    .question-answer-info__label {
                        color: var(--color-base--subtle);
                        font-size: 14px;
                        line-height: 1;
                    }

                    .question-answer-info__answer {
                        font-size: 36px;
                        font-weight: 600;

                        &.question-answer-system__answer {
                            color: var(--success-color);
                        }

                        &.question-answer-user__answer {
                            color: var(--success-color);

                            &.error {
                                color: var(--failed-color);
                            }
                        }
                    }
                }
            }

            button {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                color: var(--color-surface-0);
                font-size: 14px;
                background: var(--color-primary);
                margin: 0 2rem;
                margin-bottom: auto;
                padding: 6px 16px;
                cursor: pointer;

                @include screen.media-screen(phone) {
                    margin: 0;
                }

                .material-icons {
                    color: var(--color-surface-0);
                    font-size: 18px;
                }

                &:hover {
                    background: var(--color-base--subtle);
                }
            }
        }

        .question-render-tools__options {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.25rem;

            .question-render-tools__option {
                &:hover {
                    background: var(--border-color-base);
                }
            }
        }

        .question-render-tools__buttons {
            display: flex;
            align-items: center;

            .question-render-tools__button {
                color: var(--color-base--subtle);
                padding: 4px;
                border-radius: 50%;
                transition: 150ms ease;
                user-select: none;

                &:hover {
                    background: var(--border-color-base);
                }

                &:active {
                    transform: scale(0.9);
                    transition-duration: 80ms;
                }
            }
        }
    }

    &.loading {
        .question-render-info,
        .question-render-tools {
            opacity: 0.5;
            filter: grayscale(1);
            pointer-events: none;
        }
    }
}
</style>
