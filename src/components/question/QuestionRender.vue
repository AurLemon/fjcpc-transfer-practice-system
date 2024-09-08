<script lang="ts">
import { defineComponent } from 'vue'

//   unique_code: 题目唯一编号（随机生成的64位 绝对不会重复）【主键】
//   pid: 题目编号 string
//   content: 题目（最好大一点方便存数据）
//   type: 题目类型（int即可，根据被爬取的考试中心的数据，已知的题目类型有0，1，2，8这几种）
//   options: 题目选项（JSON）
//   sub_options: 子题目选项（JSON，有些特殊题型会把选项当题目继续塞一层子题目，所以设置这个字段，只有dtlx为8这个才需要内容，一般直接为null即可）
//   answer: 正确答案（数组，因为答案的选项）
//   subject: 科目（int数字就行，到时候后端解析的时候会提供一个解析表，比如0代表未知，1代表语文，2代表数学，3代表英语，4代表思想政治，5代表专业基础-计算机应用技术）
//   updated_time: 题目更新时间（把爬取下来的时间转成timestamp）
//   crawl_time: 题目爬取下来的时间
//   done_count: 做过这题的用户人数计数（默认0）
//   incorrect_count: 做过这题而且做错过的用户人数计数（默认0）
//   status: 题目状态，true是启用，false是未启用，新增的题目都是true
//   crawl_count: 如果是新加的题目就默认1，如果下一次被爬取的时候，但是发现已经有这题了，那就给这个 count 加 1

export default defineComponent({
    name: 'QuestionRender',
    data() {
        return {
            response: {
                code: 200,
                status: 'success',
                data: {
                    questions: [
                        {
                            pid: 114514,
                            content: '<img src=https://app.fjcpc.edu.cn/fjcpc/2022/04/01/e385cc7db17e480099bd4b7985503308.jpeg />',
                            type: 0,
                            options: [
                                {
                                    id: 1,
                                    number: 'A',
                                    content: ' 虽则听死了的老头子说，好像那老祖父逃出长毛营盘的时候，不巧撞着了一个巡路的小长毛……'
                                },
                                {
                                    id: 2,
                                    number: 'B',
                                    content: ' 虽则听死了的老头子说，好像那老祖父逃出长毛营盘的时候，不巧撞着了一个巡路的小长毛……'
                                },
                                {
                                    id: 3,
                                    number: 'C',
                                    content: ' 虽则听死了的老头子说，好像那老祖父逃出长毛营盘的时候，不巧撞着了一个巡路的小长毛……'
                                },
                                {
                                    id: 4,
                                    number: 'D',
                                    content: ' 虽则听死了的老头子说，好像那老祖父逃出长毛营盘的时候，不巧撞着了一个巡路的小长毛……'
                                }
                            ],
                            answer: 2
                        },
                        {

                        }
                    ],
                    question_info: {
                        subject: 'math',
                        order: 'desc',

                    }
                },
                timestamp: 19198100
            }
        }
    }
})
</script>

<template>
    <div class="question-render-wrapper">
        <div class="question-render-info">
            <div class="question-render-info__subject">计算机应用技术</div>
            <div class="question-render-info__status">
                <div class="question-render-info__direction question-render-info__previous">
                    <span class="material-icons">keyboard_arrow_left</span>
                </div>
                <div class="question-render-info__current"><span class="now">1</span>/<span class="max">4</span></div>
                <div class="question-render-info__direction question-render-info__next">
                    <span class="material-icons">keyboard_arrow_right</span>
                </div>
            </div>
            <div class="question-render-info__id">114514</div>
            <div class="question-render-info__sheet">1111</div>
        </div>
        <div class="question-render-questions">
            <div class="question-render-question"></div>
            <div class="question-render-warn" v-if="false"></div>
        </div>
        <div class="question-render-tools"></div>
    </div>
</template>

<style lang="scss" scoped>
.question-render-wrapper {
    --page-container-practice-margin-vertical: 30px;
    --page-container-practice-margin-horizon: 50px;
    --page-container-practice-answer-height: 75px;
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

        .question-render-info__subject,
        .question-render-info__id {
            display: flex;
            align-items: center;
            color: var(--color-surface-4);
            flex-basis: 25%;
        }

        .question-render-info__status {
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--color-base--emphasized);
            font-size: 16px;
            flex: 1;

            .question-render-info__current {
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
        flex: 1;

        .question-render-question {
            height: 100%;
            padding-bottom: calc(var(--page-container-practice-answer-height) + 10px);
            margin: var(--page-container-practice-margin-vertical) var(--page-container-practice-margin-horizon);
            overflow-y: auto;
        }
    }

    .question-render-tools {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        margin-top: 5px;
        background: var(--color-surface-2);
        position: relative;
    }
}
</style>
