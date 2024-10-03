// src/stores/question.ts

import { defineStore } from 'pinia'
import { get } from '@/api/api'
import { useNotifyStore } from '@/stores/notify'

interface Lesson {
    subject: number
    id: string
    name: string
    count: number
}

interface QuestionInfo {
    cultural_lesson: Lesson[]
    profession_lesson: Lesson[]
    exam_info: {
        exam_time: string
        exam_trust: boolean
    }
}

export const useQuestionStore = defineStore('question', {
    state: () => ({
        questionInfo: {
            cultural_lesson: [],
            profession_lesson: [],
            exam_info: {
                exam_time: '',
                exam_trust: false
            }
        } as QuestionInfo,
        currentStat: {} as any,
        isGetQuestionInfo: true
    }),
    actions: {
        async getQuestionInfo(callback?: Function) {
            const notifyStore = useNotifyStore()

            try {
                const response: any = await get('/question/info')
                this.questionInfo = response.data.data
                this.isGetQuestionInfo = false

                if (callback) {
                    callback()
                }
            } catch (err) {
                notifyStore.addMessage('failed', '无法获取题库信息，请检查网络连接。')
            }
        },
        getCulturalCount() {
            return this.questionInfo.cultural_lesson.reduce((sum: number, lesson: { subject: number; id: string; name: string; count: number }) => {
                return sum + lesson.count
            }, 0)
        },
        getProfessionCount() {
            return this.questionInfo.profession_lesson.reduce((sum: number, lesson: { subject: number; id: string; name: string; count: number }) => {
                return sum + lesson.count
            }, 0)
        }
    }
})
