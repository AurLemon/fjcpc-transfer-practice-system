<template>
    <div class="page-container-slide page-guide">
        <h2>哦哈哟同学🤓☝</h2>
        <div class="page-guide-tips">
            😡😡😡 有bug赶快找<a href="https://qm.qq.com/q/kroi2TEapW">他(QQ 2115386831)</a
            >说，自信点就是我写的屎山网站的问题<br />网站会不定期更新CSS和JS，如果碰到问题先刷新页面，然后Ctrl+F5强制刷新缓存（手机:
            清除浏览数据）
        </div>
        <div class="page-guide-block page-guide-update">
            <div class="page-guide-keyvalue">
                <div class="page-guide-keyvalue__value">2024-05-07 20:57</div>
                <div class="page-guide-keyvalue__key">最近更新时间</div>
            </div>
            <div class="page-guide-log">
                <li>
                    <span class="page-guide-log__time">2024-05-06 20:57</span>
                    <span class="page-guide-log__text"
                        ><b>应该修差不多了，接下来基本不会改了</b
                        ><br />新增：统计可以看每个科目的进度和收藏，可以根据这个去刷特定科目。<br />修复：题目去重、刷收藏的题目如果做错会取消收藏</span
                    >
                </li>
                <li>
                    <span class="page-guide-log__time">2024-05-06 00:55</span>
                    <span class="page-guide-log__text"
                        >题目去重、刷收藏的题目如果做错会取消收藏、修复一直莫名其妙同步然后跳回去的bug、刷题可以刷收藏的题目、可以取消收藏题目、设置里可以调整做题数据给不给别人看、统计里可以看各个科目的完成进度和已收藏题量、电脑按回车下一题、修复部分浏览器看不到“下一题”的兼容性问题</span
                    >
                </li>
                <li>
                    <span class="page-guide-log__time">2024-05-06 00:42</span>
                    <span class="page-guide-log__text">微调界面、新增统计、修修JS的小bug</span>
                </li>
                <li>
                    <span class="page-guide-log__time">2024-05-05 01:32</span>
                    <span class="page-guide-log__text"
                        >修复了题目都做完了看不了题库的bug、微调界面（CSS）</span
                    >
                </li>
                <li>
                    <span class="page-guide-log__time">2024-05-04 00:36</span>
                    <span class="page-guide-log__text"
                        >支持多设备数据同步、没登陆没法收藏题目导致没法下一题的bug<span
                            style="opacity: 0.4"
                            >（22计大没人发现？）</span
                        >、修复做题进度百分比没乘100的bug</span
                    >
                </li>
                <li>
                    <span class="page-guide-log__time">2024-05-03 11:23</span>
                    <span class="page-guide-log__text">网站上线。</span>
                </li>
            </div>
        </div>
        <div class="page-guide-block page-guide-info">
            <div class="page-guide-keyvalue">
                <div class="page-guide-keyvalue__value">2024-05-12 20:53</div>
                <div class="page-guide-keyvalue__key">题库更新时间</div>
            </div>
            <div class="page-guide-keyvalue">
                <div class="page-guide-keyvalue__value">4</div>
                <div class="page-guide-keyvalue__key">题库新增（或修改）题目</div>
            </div>
            <div class="page-guide-keyvalue">
                <div class="page-guide-keyvalue__value">就一个政治多选变了答案，其它是变错字</div>
                <div class="page-guide-keyvalue__key">题库更新内容</div>
            </div>
        </div>
        <div class="page-guide-block page-guide-usage">
            <li class="page-guide-block__title">这是什么网站？</li>
            <li>
                船政转轨考做题的。和船政的网站有什么区别？我这有<b>全部题库</b>、<b>做完就能看答案</b>、<b>还能看错题集</b>、还能看正确率。
            </li>
            <li>
                题库怎么弄下来的，卷子不是题目随机组合吗？那我多弄几套卷子然后把所有题目整理起来不就可以了，撞库+去重。
            </li>
            <li>界面丑？两天搓的，还是在AI的帮助下，我觉得好看👍。</li>
            <li>有bug？群里或者私聊我一下，线下直接找我也可以。</li>
        </div>
        <div class="page-guide-block page-guide-faq">
            <li class="page-guide-block__title">不填身份证号可不可以？</li>
            <li>
                可以啊，但是做题记录只会保存到localStorage，不会同步，你别换浏览器就行，<b>如果你填了身份证号那就不用担心同步</b>，如果是其他网友想来做做题<b>完全不用填身份证</b>，也填不了，只有船政的系统里有登记你的身份证信息才有用
            </li>
            <li>
                你会不会泄露我们身份证号啊？<b>不会</b>，我把后端和前端都放gitee了，你不放心可以自己看代码😡
                不填其实也没啥
            </li>
            <li>
                你这个网站怎么弄的？其实就是一个静态页面，配合jQuery做出来的，还有一个PHP后台存做题信息和题库
            </li>
            <li>如果要开始，可以点上面五个菜单中的“刷题”就可以开始做了哦！</li>
            <li>
                如果想看源代码，可以点右上角那个“G”图标，这个是
                Gitee，简单理解成存代码的网站就可以了，GitHub 和这个是一类东西。
            </li>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-container {
    .page-container-main {
        .page-guide {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-gap: var(--gap-value);
            padding: 1.5rem;
            overflow-y: auto;

            .page-guide-block {
                padding: 15px;
                border: 1px solid var(--border-color-base--darker);
                border-radius: 12px;

                .page-guide-block__title {
                    color: var(--color-base--emphasized);
                    font-size: 24px;
                    margin: 0;
                    margin-bottom: 8px;
                    padding: 0;
                    list-style: none;
                }

                .page-guide-keyvalue {
                    display: flex;
                    flex-direction: column;

                    .page-guide-keyvalue__value {
                        font-size: 28px;
                        line-height: 1;
                    }

                    .page-guide-keyvalue__key {
                        color: var(--color-base--subtle);
                        font-size: 14px;
                    }
                }
            }

            .page-guide-tips {
                grid-column: span 2;
                color: var(--color-base--subtle);
                font-size: 12px;
                text-align: center;
                margin: 1rem 0;

                a {
                    color: var(--color-base--subtle);
                    opacity: 0.7;
                }
            }

            .page-guide-update {
                .page-guide-log {
                    font-size: 14px;
                    text-align: justify;
                    max-height: 200px;
                    padding: 10px 5px;
                    margin-top: 20px;
                    overflow-y: auto;
                }
            }

            .page-guide-info {
                display: flex;
                justify-content: space-between;
                flex-direction: column;
                gap: var(--gap-value);
            }

            h2 {
                grid-column: span 2;
                margin: 1rem 2rem;
            }

            b {
                color: var(--color-base--emphasized);
            }

            li {
                margin: 0 15px;
            }

            .page-guide-form {
                grid-column: span 2;
                padding: 2rem;
                margin: 1rem 3rem;
                border: 1px solid var(--border-color-input);
                border-radius: 12px;

                .page-guide-form-title {
                    color: var(--color-base--emphasized);
                    font-size: 14px;
                    letter-spacing: 0.75px;
                    margin-bottom: 4px;
                }

                .page-guide-form-sumbit {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--gap-value);

                    button {
                        display: flex;
                        align-items: center;
                        gap: 0.75px;
                    }

                    img {
                        display: block;
                        width: 20px;
                        height: 20px;
                        opacity: 0.7;
                    }
                }
            }
        }
    }
}

@media screen and (max-width: 1000px) {
    .page-container {
        .page-container-main {
            .page-guide {
                grid-template-columns: repeat(1, 1fr);

                h2,
                .page-guide-form,
                .page-guide-tips {
                    grid-column: span 1;
                }

                .page-guide-form {
                    padding: 15px;
                    margin: 1rem 1.5rem;
                    border: 1px solid var(--border-color-base--darker);
                    border-radius: 12px;
                }
            }
        }
    }
}
</style>
