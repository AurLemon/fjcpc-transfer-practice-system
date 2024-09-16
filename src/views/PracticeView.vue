<template>
    <div class="page-container-slide page-practice">
        <div class="page-practice-info">
            <div class="page-practice-info__doing">-</div>
            <div class="page-practice-info__detail">
                <div class="page-practice-info__back">
                    <img src="../assets/images/icon_back.svg" />
                </div>
                <div class="page-practice-info__volume">-/-</div>
                <div class="page-practice-info__forward">
                    <img src="../assets/images/icon_forward.svg" />
                </div>
            </div>
            <div class="page-practice-info__pid">-</div>
            <div class="page-practice-info-sheet">
                <div class="page-practice-info-sheet__title">答题卡</div>
                <ul class="page-practice-info-sheet__list">
                    <li class="done page-practice-info-sheet__item" onclick="mainModule.navigateToQuestion('100053973')" question-number="100053973"></li>
                </ul>
            </div>
        </div>
        <div class="page-practice-question">
            <div class="page-practice-question__type"></div>
            <div class="page-practice-question--main"></div>
        </div>
        <div class="page-practice-tools">
            <div class="page-practice-question__answer">
                <div class="page-practice-question__answerWrapper" id="practice-true-answer">
                    <div class="page-practice-question__label">正确答案</div>
                    <div class="page-practice-question__value">-</div>
                </div>
                <div class="page-practice-question__answerWrapper" id="practice-selected-answer">
                    <div class="page-practice-question__label">你的答案</div>
                    <div class="page-practice-question__value">-</div>
                </div>
                <div class="page-practice-tools__check">
                    <button class="page-practice-question__continue" id="practice-continue">检查</button>
                </div>
            </div>
            <div class="page-practice-tools__load">
                <select id="practice-subject-choose">
                    <option value="0">专业基础</option>
                    <option value="1">语文（文化基础）</option>
                    <option value="2">数学（文化基础）</option>
                    <option value="3">英语（文化基础）</option>
                    <option value="4">思想政治（文化基础）</option>
                    <option value="-1">全部</option>
                    <option value="-2">已收藏题目</option>
                </select>
                <select id="practice-question-type">
                    <option value="-1">全部题型</option>
                    <option value="0">单选题</option>
                    <option value="1">多选题</option>
                    <option value="2">判断题</option>
                    <option value="8">阅读题</option>
                </select>
                <select id="practice-random-choose">
                    <option value="0">随机排序</option>
                    <option value="1">顺序排序</option>
                </select>
                <button onclick="mainModule.updatePracticeLoad()" id="practice-confirm-answer">确认</button>
            </div>
            <div class="page-practice-tools__buttons">
                <div
                    class="page-practice-tools__button"
                    id="practice-feedback"
                    onclick="mainModule.showMessage('success', '<span>反馈请加博主qq2115386831</span><span>题目的问题找班主任</span>', 3000)"
                >
                    <img src="../assets/images/icon_feedback.svg" />
                </div>
                <div class="page-practice-tools__button" id="practice-star" onclick="mainModule.toggleBookmark($('.page-practice-info__pid').text())">
                    <img src="../assets/images/icon_star.svg" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-container .page-container-main .page-practice {
    --page-container-practice-margin-vertical: 30px;
    --page-container-practice-margin-horizon: 50px;
    --page-container-practice-answer-height: 75px;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.page-container .page-container-main .page-practice .page-practice-info {
    display: flex;
    justify-content: center;
    font-size: 14px;
    padding: 5px 15px;
    margin: 0 20px;
    margin-bottom: 5px;
    border-bottom: 1px solid var(--border-color-base);
    position: relative;
}

.page-container .page-container-main .page-practice .page-practice-info > [class^='page-practice-info__'] {
    display: flex;
    align-items: center;
    gap: var(--gap-value);
    color: var(--color-surface-4);
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info__pid {
    justify-content: center;
    width: 85px;
    border-radius: 8px;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info__pid:hover {
    background: var(--border-color-base);
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet {
    --page-practice-sheet-height: 250px;
    --page-practice-sheet-title-height: 20px;
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
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet {
    height: 0;
    padding: 0;
    opacity: 0;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
}

.page-container .page-container-main .page-practice .page-practice-info .active.page-practice-info-sheet {
    height: var(--page-practice-sheet-height);
    padding: 6px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    opacity: 1;
    pointer-events: all;
    user-select: auto;
    -webkit-user-select: auto;
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet .page-practice-info-sheet__title {
    color: var(--color-base--subtle);
    font-size: 12px;
    letter-spacing: 0.75px;
    height: var(--page-practice-sheet-title-height);
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet .page-practice-info-sheet__list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: calc(var(--gap-value) / 2);
    margin: 0;
    padding: 2px;
    padding-bottom: 20px;
    list-style-type: none;
    max-height: calc(var(--page-practice-sheet-height) - var(--page-practice-sheet-title-height));
    overflow-y: auto;
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet .page-practice-info-sheet__item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90px;
    height: 28px;
    outline: 2px solid transparent;
    border-radius: 4px;
    background: var(--border-color-base);
    overflow: hidden;
    cursor: pointer;
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet .done.page-practice-info-sheet__item {
    color: var(--color-surface-0);
    background: var(--color-primary);
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet .now.page-practice-info-sheet__item {
    outline-color: var(--color-base--subtle);
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet .page-practice-info-sheet__item::before {
    content: attr(question-number);
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info__detail {
    color: var(--color-base--emphasized);
    font-size: 16px;
    margin: 0 auto;
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info__detail img,
.page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__buttons img {
    display: block;
    width: 20px;
    height: 20px;
    padding: 4px;
    border-radius: 50%;
    opacity: 0.7;
    transition: var(--transition-hover);
    user-select: none;
    -webkit-user-select: none;
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info__detail img:hover,
.page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__buttons img:hover {
    background: rgba(0, 0, 0, 0.1);
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info__detail img:active,
.page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__buttons img:active {
    transform: scale(0.9);
}

.page-container .page-container-main .page-practice .page-practice-info .page-practice-info__volume {
    width: 90px;
    text-align: center;
}

.page-container .page-container-main .page-practice .page-practice-question {
    height: 100%;
    padding-bottom: calc(var(--page-container-practice-answer-height) + 10px);
    margin: var(--page-container-practice-margin-vertical) var(--page-container-practice-margin-horizon);
    overflow-y: auto;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__type {
    color: var(--color-surface-0);
    font-size: 12px;
    width: fit-content;
    padding: 3px 9px;
    margin-bottom: 12px;
    border-radius: 12px;
    background: var(--color-primary);
}

.page-container .page-container-main .page-practice .page-practice-question[dtlx='8'] .page-practice-question--main {
    display: flex;
    flex-direction: column;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question--main .page-practice-question {
    margin: 0;
    padding: 0;
    margin-bottom: calc(var(--gap-value) * 2);
    padding-bottom: calc(var(--gap-value) * 2);
    border-bottom: 1px solid var(--border-color-base);
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question--main .page-practice-question:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: unset;
}

.page-container .page-container-main .page-practice .page-practice-question[dtlx='8'] .page-practice-question--main > .page-practice-question__title {
    margin-bottom: 1rem;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__title {
    margin-bottom: 10px;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__title p,
.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__title span {
    margin: 0 !important;
    padding: 0 !important;
    font-size: 16px !important;
    font-family: var(--font-family-base) !important;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__options {
    display: flex;
    flex-direction: column;
    gap: calc(var(--gap-value) / 2);
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option {
    padding: 8px 12px;
    border-radius: 8px;
    background: var(--border-color-base);
    transition: var(--transition-hover);
    cursor: pointer;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option:active {
    transform: scale(0.98) !important;
}

.page-container .page-container-main .page-practice .page-practice-question .selected.page-practice-question__option {
    background: var(--background-color-primary--active);
}

.page-container .page-container-main .page-practice .page-practice-question .answer.page-practice-question__option {
    color: var(--color-surface-0) !important;
    background: var(--success-color) !important;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option > span:first-child {
    font-weight: bold;
    margin-right: 10px;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option span:last-child p,
.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option span:last-child span,
.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option span:last-child img {
    display: inline;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 16px !important;
    font-family: var(--font-family-base) !important;
    background: none !important;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option,
.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option span:last-child p,
.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option span:last-child span,
.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option span:last-child img {
    display: inline-flex;
}

.page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option span:last-child img {
    width: 100%;
}

.page-container .page-container-main .page-practice .page-practice-question__answer {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: var(--gap-value);
    height: var(--page-container-practice-answer-height);
    padding-top: 5px;
    background: hsla(var(--color-primary__h), 3%, 98%, 0.8);
    backdrop-filter: saturate(25%) blur(32px);
    -webkit-backdrop-filter: saturate(25%) blur(32px);
    position: absolute;
    left: var(--page-container-practice-margin-horizon);
    right: calc(var(--page-container-practice-margin-horizon) + 10px);
    bottom: calc(100% + var(--page-container-practice-margin-vertical) + 5px);
}

.page-container .page-container-main .page-practice .page-practice-question__answerWrapper {
    visibility: hidden;
    display: flex;
    flex-direction: column;
}

.page-container .page-container-main .page-practice .page-practice-tools__check {
    display: flex;
    gap: calc(var(--gap-value) / 2);
    margin-left: auto;
}

.page-container .page-container-main .page-practice .page-practice-question__continue {
    color: var(--color-surface-0);
    width: 80px;
    letter-spacing: 0.75px;
    border-color: transparent;
    background: var(--color-primary);
}

.page-container .page-container-main .page-practice #practice-continue.page-practice-question__continue {
    display: none;
}

.page-container .page-container-main .page-practice .page-practice-question__label {
    color: var(--color-base--subtle);
    font-size: 13px;
}

.page-container .page-container-main .page-practice .page-practice-question__value {
    color: var(--color-base--emphasized);
    font-size: 36px;
    font-weight: 500;
    line-height: 1;
}

.page-container .page-container-main .page-practice #practice-true-answer .page-practice-question__value {
    color: var(--success-color);
}

.page-container .page-container-main .page-practice .page-practice-tools {
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
    margin-top: 5px;
    background: var(--color-surface-2);
    position: relative;
}

.page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__buttons,
.page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__load {
    display: flex;
    align-items: center;
    gap: calc(var(--gap-value) / 4);
}

.page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__load {
    gap: var(--gap-value);
}

.page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__buttons img {
    width: 32px;
    height: 32px;
}

@media screen and (min-width: 1001px) and (hover: hover) {
    .page-container .page-container-main .page-practice .page-practice-question .page-practice-question__option:hover {
        background: var(--background-color-primary--hover);
        transform: scale(0.99);
    }

    .page-container .page-container-main .page-practice .page-practice-question .selected.page-practice-question__option {
        background: var(--background-color-primary--active);
    }
}

@media screen and (max-width: 1000px) {
    .page-container .page-container-main .page-practice .page-practice-info {
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .page-container .page-container-main .page-practice .page-practice-info .page-practice-info__detail {
        font-size: 20px;
        order: 0;
        flex: 0 100%;
        justify-content: center;
    }

    .page-container .page-container-main .page-practice .page-practice-info .page-practice-info__doing {
        order: 1;
        flex: 0 50%;
        justify-content: center;
    }

    .page-container .page-container-main .page-practice .page-practice-info .page-practice-info__pid {
        order: 2;
        flex: 0 50%;
    }

    .page-container .page-container-main .page-practice .page-practice-info .page-practice-info-sheet .page-practice-info-sheet__list {
        grid-template-columns: repeat(3, 1fr);
    }

    .page-container .page-container-main .page-practice .page-practice-question {
        margin: 10px 15px;
    }

    .page-container .page-container-main .page-practice .page-practice-question__answer {
        padding: 10px 20px;
        left: 0;
        right: 0;
        bottom: 100%;
    }

    .page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__buttons,
    .page-container .page-container-main .page-practice .page-practice-tools .page-practice-tools__load {
        flex-wrap: wrap;
    }
}
</style>
