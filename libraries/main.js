/**
 * Main.js
 * 
 * AurLemon's Personal Practice Question Bank (for FJCPC Transfer Exam)
 * (c) 2024-Present AurLemon (Lin Jun Le)
 * @license MIT
 * @description 写一半发现写了个屎山 那就这样吧 懒得改了
 */
var mainModule = (function() {
    const versionType = 'Pre-Release';
    const version = '20240507-005837';
    
    const apiUrl = 'https://appzb.fjcpc.edu.cn/kszx-api/kszx-back/StudentTest32/getTestSjTmInfo';
    const sumbitUrl = 'https://appzb.fjcpc.edu.cn/kszx-api/kszx-back/StudentTest32/addTestInfo';
    const stuInfoUrl = 'https://appzb.fjcpc.edu.cn/kszx-api/kszx-back/StudentTest32/test32UserLogin';
    let backendUrl = '/data/backend.php';
    
    let exerciseSets = loadModule.exerciseSets;
    let questionSets = loadModule.questionSets;

    let sortedQuestionSets = {};
    let sortedExerciseSets = {};

    let userSettings;
    let defaultUserSettings = {
        backendUrl: backendUrl,
        autoStarWrongQuestion: true,
        connectBackend: true,
        publicStat: true,
        autoSync: true
    }

    let storedSettings = JSON.parse(localStorage.getItem('userSettings'));

    if (storedSettings === null) {
        userSettings = defaultUserSettings;
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    } else {
        let settingsChanged = false;
        for (let key in defaultUserSettings) {
            if (!(key in storedSettings)) {
                storedSettings[key] = defaultUserSettings[key];
                settingsChanged = true;
            }
        }

        if (settingsChanged) {
            localStorage.setItem('userSettings', JSON.stringify(storedSettings));
        }
    }    
    
    if (JSON.parse(localStorage.getItem('studentInfo')) !== null && storedSettings.connectBackend == false)
        fetchStudentInfoToBackend();

    function changeSettings(keyName, newValue) {
        let settingsObj = JSON.parse(localStorage.getItem('userSettings'));
        if (!settingsObj) {
            settingsObj = {...defaultUserSettings};
        }
        settingsObj[keyName] = newValue;
        localStorage.setItem('userSettings', JSON.stringify(settingsObj));
        showMessage('success', '设置已更改，刷新页面生效');
    }    

    function getSettings(keyName) {
        let settingsObj = JSON.parse(localStorage.getItem('userSettings'));
        return settingsObj[keyName];
    }

    function showMessage(type = 'normal', message, keepTime = 2000) {
        if ($('.messages-container').length === 0) {
            $('.page-footer').after('<div class="messages-container"></div>');
        }
        
        let className = 'messages-container__info';
        if (type === 'success') {
            className += ' success';
        } else if (type === 'error') {
            className += ' error';
        }
        
        let $message = $(`<div class="${className}" style="opacity: 0;">${message}</div>`);
        $('.messages-container').append($message);
    
        setTimeout(() => {
            $message.css('opacity', '1');
            setTimeout(() => {
                $message.removeAttr('style');
                setTimeout(() => {
                    $message.remove();
                    if ($('.messages-container').children().length === 0) {
                        $('.messages-container').remove();
                    }
                }, 300);
            }, keepTime);
        }, 200);
    }

    function saveLog(log) {
        const logContainer = $("#output-log");
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${getCurrentTime()}] ${log}`;
        logContainer.prepend(logEntry);
    }

    function getCurrentTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    }

    function randomizeFavicon() {
        const faviconLink = document.querySelector('link[rel="icon"]');
        const iconPaths = [];
        const randomIndex = Math.floor(Math.random() * iconPaths.length);
        const randomIconPath = iconPaths[randomIndex];
        faviconLink.href = randomIconPath;
    }

    Object.keys(questionSets).forEach(key => {
        sortedQuestionSets[key] = questionSets[key].slice().sort((a, b) => {
            return a - b;
        });
    });

    Object.keys(exerciseSets).forEach(key => {
        sortedExerciseSets[key] = exerciseSets[key].slice().sort((a, b) => {
            return a.pid - b.pid;
        });
    });

    let currentQuestionIndex = 0;
    let practiceQuestionId = {};
    let practiceQuestionSets = {};

    let subjectTypeMap = {
        0: ["单选题", "多选题", "判断题（正确选T，错误选F）"],
        1: ["单选题（语文）", "判断题（语文）正确选T，错误选F", "阅读题（语文）"],
        2: ["单选题（数学）", "判断题（数学）正确选T，错误选F"],
        3: ["单选题（英语）"],
        4: ["单选题（政治）", "多选题（政治）", "判断题（政治）正确选T，错误选F"]
    };

    let exerciseTypeMap = {
        "判断题（政治）正确选T，错误选F": 2,
        "判断题（数学）正确选T，错误选F": 2,
        "判断题（正确选T，错误选F）": 2,
        "判断题（语文）正确选T，错误选F": 2,
        "单选题": 0,
        "单选题（数学）": 0,
        "单选题（英语）": 0,
        "单选题（语文）": 0,
        "单选题（政治）": 0,
        "多选题": 1,
        "多选题（政治）": 1,
        "阅读题（语文）": 8
    };

    let dtlxNameMap = {
        0: ["单选题", "单选题（数学）", "单选题（英语）", "单选题（语文）", "单选题（政治）"],
        1: ["多选题", "多选题（政治）"],
        2: ["判断题（政治）正确选T，错误选F", "判断题（数学）正确选T，错误选F", "判断题（正确选T，错误选F）", "判断题（语文）正确选T，错误选F"],
        8: ["阅读题（语文）"]
    }

    let starQuestionSets = [];
    let questionDone = localStorage.getItem('doneQuestions') !== null ? JSON.parse(localStorage.getItem('doneQuestions')) : [];
    
    let userSettingsObj = JSON.parse(localStorage.getItem('userSettings'));
    let studentInfoObj = JSON.parse(localStorage.getItem('studentInfo'));
    
    if (studentInfoObj && userSettingsObj.connectBackend == true) {
        $.ajax({
            url: `${backendUrl}/getUserProgress`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ userId: studentInfoObj.sfz }),
            async: false,
            success: function(response) {
                if (response.error) {
                    showMessage('success', '服务器没有做题信息（第一次正常）');
                } else {
                    starQuestionSets = response.starQuestions || [];
                    localStorage.setItem('starQuestionSets', JSON.stringify(starQuestionSets));
                    
                    questionDone = response.questionDone || [];
                    localStorage.setItem('doneQuestions', JSON.stringify(questionDone));
                }
            },
            error: function(xhr, status, error) {
                showMessage('error', 'Error fetching user progress:' + error);
            }
        });
    }

    function displayQuestionByArray(arr, output) {
        output.empty();
        arr.forEach(pid => {
            let question = findAllQuestionById(pid);
            if (!question) return;

            let dtlx = exerciseTypeMap[findAllArrayNameByPid(pid)];
            let questionContainer = $('<div>', {'class': 'question-wrapper'});
            let optionsContainer = $('<div>', {'class': 'question-options'});
            let title = $('<div>', {
                'class': 'question-title',
                'html': `<span class="question-pid">${question.pid}</span><span>${question.tg}</span>`
            });
    
            if (dtlx !== 8) {
                question.list.forEach(option => {
                    let questionOption;

                    if (dtlx == 0 || dtlx == 1) {
                        questionOption = option.xx;
                    } else if (dtlx == 2) {
                        questionOption = option.txt == '对' ? 'T' : 'F';
                    } else {
                        saveLog('displayQuestion(): Unknown question type.');
                        return;
                    }

                    let optionElement = $('<div>', {
                        'class': 'question-options__option',
                        'html': `<span>${questionOption}</span><span>${option.txt}</span>`,
                        'click': function() {
                            $(this).toggleClass('selected');
                        }
                    });

                    if (dtlx == 1) {
                        let correctAnswers = question.zqda.split(',').map(id => String.fromCharCode(64 + parseInt(id)));

                        if (correctAnswers.includes(convertAnswer(option.id)))
                            optionElement.attr('answer', '1');
                    } else {
                        if (convertAnswer(question.zqda, dtlx) == questionOption)
                            optionElement.attr('answer', '1');
                    }

                    optionsContainer.append(optionElement);
                });

                questionContainer.append(title);
                questionContainer.append(optionsContainer);
            } else {                
                let subQuestionWrapper = $('<div>', {'class': 'question-options'});
                question.list.forEach(subQuestion => {
                    let subQuestionContainer = $('<div>', {'class': 'question-wrapper'});
                    let subQuestionTitle = $('<div>', {
                        'class': 'question-title',
                        'html': subQuestion.tg
                    });
                    let subOptionsContainer = $('<div>', {'class': 'question-options'});

                    subQuestion.list.forEach(option => {
                        let optionDiv = $('<div>', {
                            'class': 'question-options__option',
                            'html': `<span>${option.xx}</span><span>${option.txt}</span>`
                        });
                        optionDiv.on('click', function() {
                            $(this).toggleClass('selected');
                        });
                        if (convertAnswer(subQuestion.da, dtlx) == option.xx) {
                            optionDiv.attr('answer', '1');
                        }
                        subOptionsContainer.append(optionDiv);
                    });

                    subQuestionContainer.append(subQuestionTitle);
                    subQuestionContainer.append(subOptionsContainer);
                    subQuestionWrapper.append(subQuestionContainer);
                });

                questionContainer.append(title);
                questionContainer.append(subQuestionWrapper);
            }

            output.append(questionContainer);
        });
    }
    
    function updateStarLoad() {
        $('.page-star-output').empty();
        displayQuestionByArray(starQuestionSets, $('.page-star-output'));
        showMessage('success', '收藏已加载');
    }

    function updateViewLoad() {
        let selectSubject = $('#view-subject-choose').val();
        let selectDtlx = $('#view-subject-type').val();
        let filter;
        
        if (selectSubject != -1) {
            filter = subjectTypeMap[selectSubject].filter(type => dtlxNameMap[selectDtlx].includes(type)).length > 0 ? subjectTypeMap[selectSubject].filter(type => dtlxNameMap[selectDtlx].includes(type)) : null;

            if (filter !== null)
                displayQuestionByArray(sortedQuestionSets[filter], $('.page-view-output'));
            else {
                let subjectText = '';
                let subjectTypeText = ''
                if (selectSubject == 0)
                    subjectText = '专业课';
                else if (selectSubject == 1)
                    subjectText = '语文';
                else if (selectSubject == 2)
                    subjectText = '数学';
                else if (selectSubject == 3)
                    subjectText = '英语';
                else if (selectSubject == 4)
                    subjectText = '政治';
    
                if (selectDtlx == 0)
                    subjectTypeText = '单选';
                else if (selectDtlx == 1)
                    subjectTypeText = '多选';
                else if (selectDtlx == 2)
                    subjectTypeText = '判断';
                else if (selectDtlx == 8)
                    subjectTypeText = '阅读';
    
                showMessage('error', subjectText + '哪来的' + subjectTypeText);
            }
        } else {
            displayQuestionByArray(Object.values(sortedQuestionSets).flat(), $('.page-view-output'));
        }
    }

    function updatePracticeLoad(practiceLoad) {
        let selectSubject = practiceLoad == undefined ? $('#practice-subject-choose').val() : JSON.parse(localStorage.getItem('practiceLoad')).subject;
        let selectQuestionType = practiceLoad == undefined ? $('#practice-question-type').val() : JSON.parse(localStorage.getItem('practiceLoad')).selectQuestionType;
        let randomSetting = practiceLoad == undefined ? $('#practice-random-choose').val() : JSON.parse(localStorage.getItem('practiceLoad')).questionType;

        $('#practice-subject-choose').val(selectSubject)
        $('#practice-question-type').val(selectQuestionType)
        $('#practice-random-choose').val(randomSetting);

        function savePracticeLoad() {
            const practiceLoad = {
                subject: $('#practice-subject-choose').val(),
                selectQuestionType: $('#practice-question-type').val(),
                questionType: $('#practice-random-choose').val()
            };

            if (localStorage.getItem('practiceLoad') == null)
                localStorage.setItem('practiceLoad', JSON.stringify(practiceLoad));
            else
                return;
        }
    
        if (localStorage.getItem('practiceLoad') == null) {
            savePracticeLoad();
        }
        
        if (practiceLoad == undefined) {
            practiceLoad = {
                subject: $('#practice-subject-choose').val(),
                selectQuestionType: $('#practice-question-type').val(),
                questionType: $('#practice-random-choose').val()
            }

            localStorage.setItem('practiceLoad', JSON.stringify(practiceLoad));
        }

        let exerciseSetsRandom = randomSetting == 0 ? mainModule.exerciseSets : mainModule.sortedExerciseSets;
        let questionSetsRandom = randomSetting == 0 ? mainModule.questionSets : mainModule.sortedQuestionSets;

        practiceQuestionSets = {};
        practiceQuestionId = {};

        $('#practice-random-choose').removeClass('disabled');

        if (selectSubject == -2) {
            let starQuestions = JSON.parse(localStorage.getItem('starQuestionSets')) || [];
            starQuestions.forEach(pid => {
                let question = findAllQuestionById(parseInt(pid));
                if (question) {
                    let questionType = findAllArrayNameByPid(parseInt(pid));
                    if (selectQuestionType == -1 || dtlxNameMap[selectQuestionType].includes(questionType)) {
                        if (!practiceQuestionSets[questionType]) {
                            practiceQuestionSets[questionType] = [];
                            practiceQuestionId[questionType] = [];
                        }
                        if (!practiceQuestionId[questionType].includes(parseInt(pid))) {
                            practiceQuestionSets[questionType].push(question);
                            practiceQuestionId[questionType].push(parseInt(pid));
                        }
                    }
                }
            });
            $('#practice-random-choose').addClass('disabled');
        } else if (selectSubject != -1) {
            if (selectQuestionType == -1) {
                subjectTypeMap[selectSubject].forEach(subject => {
                    practiceQuestionSets[subject] = [];
                    practiceQuestionId[subject] = [];
    
                    exerciseSetsRandom[subject].forEach(item => {
                        if (!practiceQuestionId[subject].includes(item.pid)) {
                            practiceQuestionSets[subject].push({...item});
                            practiceQuestionId[subject].push(item.pid);
                        }
                    });
                });
            } else {
                let subject = subjectTypeMap[selectSubject].filter(type => dtlxNameMap[selectQuestionType].includes(type));
    
                practiceQuestionSets[subject] = [];
                practiceQuestionId[subject] = [];
    
                if (exerciseSetsRandom[subject]) {
                    exerciseSetsRandom[subject].forEach(item => {
                        if (!practiceQuestionId[subject].includes(item.pid)) {
                            practiceQuestionSets[subject].push({...item});
                            practiceQuestionId[subject].push(item.pid);
                        }
                    });
                } else {
                    let subjectText;
                    let subjectTypeText;

                    if (selectSubject == 0)
                        subjectText = '专业课';
                    else if (selectSubject == 1)
                        subjectText = '语文';
                    else if (selectSubject == 2)
                        subjectText = '数学';
                    else if (selectSubject == 3)
                        subjectText = '英语';
                    else if (selectSubject == 4)
                        subjectText = '政治';

                    if (selectQuestionType == 0)
                        subjectTypeText = '单选';
                    else if (selectQuestionType == 1)
                        subjectTypeText = '多选';
                    else if (selectQuestionType == 2)
                        subjectTypeText = '判断';
                    else if (selectQuestionType == 8)
                        subjectTypeText = '阅读';

                    showMessage('error', subjectText + '哪来的' + subjectTypeText);
                }
            }
        } else {
            if (selectQuestionType == -1) {
                Object.keys(exerciseSetsRandom).forEach(subject => {
                    practiceQuestionSets[subject] = [];
                    practiceQuestionId[subject] = [];
                    exerciseSetsRandom[subject].forEach(item => {
                        if (!practiceQuestionId[subject].includes(item.pid)) {
                            practiceQuestionSets[subject].push({...item});
                            practiceQuestionId[subject].push(item.pid);
                        }
                    });
                });
            } else {
                dtlxNameMap[selectQuestionType].forEach(subject => {
                    practiceQuestionSets[subject] = [];
                    practiceQuestionId[subject] = [];
        
                    if (exerciseSetsRandom[subject]) {
                        exerciseSetsRandom[subject].forEach(item => {
                            if (!practiceQuestionId[subject].includes(item.pid)) {
                                practiceQuestionSets[subject].push({...item});
                                practiceQuestionId[subject].push(item.pid);
                            }
                        });
                    } else {
                        saveLog(`No ${subject} questions available`);
                    }
                });
            }
        }
        
        displayQuestion(skipDoneQuestion());
    }

    function skipDoneQuestion() {
        const flatPracticeQuestionId = Object.values(practiceQuestionId).flat();
        const selectSubject = $('#practice-subject-choose').val();
    
        if (selectSubject == -2) {
            return flatPracticeQuestionId[0];
        }
    
        const nextQuestion = flatPracticeQuestionId.find(element => !questionDone.includes(element.toString()));
        return nextQuestion !== undefined ? nextQuestion : flatPracticeQuestionId[0];
    }

    function findQuestionById(pid) {
        for (let key in practiceQuestionSets) {
            let question = practiceQuestionSets[key].find(q => q.pid === pid);
            if (question) {
                return question;
            }
        }
        return null;
    }

    function findAllQuestionById(pid) {
        for (let key in exerciseSets) {
            let question = exerciseSets[key].find(q => q.pid == pid);
            if (question) {
                return question;
            }
        }
        return null;
    }

    function findArrayNameByPid(pid) {
        for (let key in practiceQuestionSets) {
            if (practiceQuestionSets.hasOwnProperty(key)) {
                let array = practiceQuestionSets[key];
                if (array.some(item => item.pid == pid)) {
                    return key;
                }
            }
        }
        return null;
    }

    function findAllArrayNameByPid(pid) {
        for (let key in exerciseSets) {
            if (exerciseSets.hasOwnProperty(key)) {
                let array = exerciseSets[key];
                if (array.some(item => item.pid == pid)) {
                    return key;
                }
            }
        }
        return null;
    }

    function toggleBookmark(questionId) {
        let index = starQuestionSets.indexOf(questionId);
        let studentInfo = JSON.parse(localStorage.getItem('studentInfo'));
        let userSettings = JSON.parse(localStorage.getItem('userSettings'));
    
        if (index === -1) {
            starQuestionSets.push(questionId);
            $('#practice-star img').attr('src', 'resources/images/icon_stared.svg');
            localStorage.setItem('starQuestionSets', JSON.stringify(starQuestionSets));
    
            if (studentInfo !== null && userSettings.connectBackend === true) {
                let userId = studentInfo.sfz;
                fetch(`${backendUrl}/updateBookmarks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userId, data: starQuestionSets })
                }).catch(error => showMessage('error', 'Failed to update bookmarks: ' + error));
            }
            
            showMessage('success', '已收藏');
            saveLog(`编号为 ${questionId} 的题目已收藏`);
        } else {
            starQuestionSets.splice(index, 1);
            $('#practice-star img').attr('src', 'resources/images/icon_star.svg');
            localStorage.setItem('starQuestionSets', JSON.stringify(starQuestionSets));
    
            if (studentInfo !== null && userSettings.connectBackend === true) {
                let userId = studentInfo.sfz;
                fetch(`${backendUrl}/deleteBookmarks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userId, data: [questionId] })
                }).catch(error => showMessage('error', 'Failed to delete bookmarks: ' + error));
            }
            
            showMessage('success', '已取消收藏');
            saveLog(`编号为 ${questionId} 的题目已取消收藏`);
        }
    
        if (studentInfo === null && userSettings.connectBackend === true) {
            showMessage('error', '没有提供身份证号，自动转为本地存储，数据将不会自动保存', 3000);
            showMessage('error', '可前往设置重新开启：连接服务器', 3000);
            userSettings.connectBackend = false;
            localStorage.setItem('userSettings', JSON.stringify(userSettings));
        }
    }

    function convertAnswer(answer, dtlx) {
        if (dtlx == 8) {
            if (Array.isArray(answer)) {
                return answer.map(subAnswer => {
                    return convertSubAnswer(subAnswer.da, subAnswer.lx);
                }).join(', ');
            } else {
                return convertSubAnswer(answer, dtlx);
            }
        } else if (dtlx == 1) {
            return answer.split(',').map(id => String.fromCharCode(64 + parseInt(id))).join('');
        } else if (dtlx == 2) {
            return answer == "1" ? 'T' : 'F';
        } else {
            return String.fromCharCode(64 + parseInt(answer));
        }
    }

    function convertSubAnswer(answer, lx) {
        if (lx == 2) {
            return answer == "1" ? 'T' : 'F';
        } else {
            return String.fromCharCode(64 + parseInt(answer));
        }
    }

    function displayQuestion(pid) {
        $('#practice-continue').css('display', 'none');
        $('.page-container .page-container-main .page-practice .page-practice-question__answerWrapper').removeAttr('style');
        let question = findQuestionById(pid);
        if (!question) return;
    
        currentQuestionIndex = pid;
    
        let questionContainer = $('.page-practice-question--main');
        questionContainer.empty();
    
        let title = $('<div>', {
            'class': 'page-practice-question__title',
            'html': question.tg
        });
        questionContainer.append(title);
    
        let dtlx = exerciseTypeMap[findArrayNameByPid(pid)];

        let optionsContainer;

        let questionOption;

        if (dtlx !== 8) {
            optionsContainer = $('<div>', {'class': 'page-practice-question__options'});
            question.list.forEach(option => {
                if (dtlx == 0) {
                    questionOption = option.xx;
                    optionElement = $('<div>', {
                        'class': 'page-practice-question__option',
                        'html': `<span>${questionOption}</span><span>${option.txt}</span>`,
                        'click': function() {
                            $(this).toggleClass('selected');
                            if ($('.page-practice-question__option.selected').length > 0) {
                                $('#practice-continue').css('display', 'block');
                            } else {
                                $('#practice-continue').css('display', 'none');
                            }
                        }
                    });
                } else if (dtlx == 1) {
                    questionOption = option.xx;
                    optionElement = $('<div>', {
                        'class': 'page-practice-question__option',
                        'html': `<span>${questionOption}</span><span>${option.txt}</span>`,
                        'click': function() {
                            $(this).toggleClass('selected');
                            if ($('.page-practice-question__option.selected').length > 0) {
                                $('#practice-continue').css('display', 'block');
                            } else {
                                $('#practice-continue').css('display', 'none');
                            }
                        }
                    });
                } else if (dtlx == 2) {
                    questionOption = option.txt == '对' ? 'T' : 'F';
                    optionElement = $('<div>', {
                        'class': 'page-practice-question__option',
                        'html': `<span>${questionOption}</span><span>${option.txt}</span>`,
                        'click': function() {
                            $(this).toggleClass('selected');
                            if ($('.page-practice-question__option.selected').length > 0) {
                                $('#practice-continue').css('display', 'block');
                            } else {
                                $('#practice-continue').css('display', 'none');
                            }
                        }
                    });
                } else
                    saveLog('displayQuestion(): Unknown question type.');
    
                if (dtlx == 1) {
                    let correctAnswers = question.zqda.split(',').map(id => String.fromCharCode(64 + parseInt(id)));
                    if (correctAnswers.includes(convertAnswer(option.id)))
                        optionElement.attr('answer', '1');
                } else {
                    if (convertAnswer(question.zqda, dtlx) == questionOption)
                        optionElement.attr('answer', '1');
                } 

                optionsContainer.append(optionElement);
            });
            $('#practice-true-answer .page-practice-question__value').text(convertAnswer(question.zqda, dtlx));
            questionContainer.append(optionsContainer);
        } else {
            let answer = '';
            question.list.forEach(subQuestion => {
                let subQuestionDiv = $('<div>', {'class': 'page-practice-question'});
                let subQuestionTitle = $('<div>', {
                    'class': 'page-practice-question__title',
                    'html': subQuestion.tg
                });
                subQuestionDiv.append(subQuestionTitle);
                let optionsDiv = $('<div>', {'class': 'page-practice-question__options'});

                subQuestion.list.forEach(option => {
                    let optionDiv = $('<div>', {
                        'class': 'page-practice-question__option',
                        'html': `<span>${option.xx}</span><span>${option.txt}</span>`
                    });

                    optionDiv.on('click', function() {
                        $(this).toggleClass('selected');
                        if ($('.page-practice-question__option.selected').length > 0) {
                            $('#practice-continue').css('display', 'block');
                        } else {
                            $('#practice-continue').css('display', 'none');
                        }
                    });
                    if (convertAnswer(subQuestion.da, dtlx) == option.xx)
                        optionDiv.attr('answer', '1');
                    optionsDiv.append(optionDiv);
                });

                answer += convertAnswer(subQuestion.da, dtlx);
                subQuestionDiv.append(optionsDiv);
                questionContainer.append(subQuestionDiv);
            });

            $('#practice-true-answer .page-practice-question__value').text(answer);
        }
    
        $('.page-practice-info-sheet__item').removeClass('now');
        $(`[question-number="${pid}"]`).addClass('now');

        let chooseSubjectType = $('#practice-subject-choose').val()
        if (chooseSubjectType == 0)
            chooseSubjectTypeName = '专业基础';
        else if (chooseSubjectType == -1)
            chooseSubjectTypeName = '全部';
        else if (chooseSubjectType == -2)
            chooseSubjectTypeName = '已收藏题目';
        else
            chooseSubjectTypeName = '文化基础';

        let allQuestions = Object.values(practiceQuestionSets).flat();
        currentIndex = allQuestions.findIndex(q => q.pid === currentQuestionIndex);

        $('.page-practice-info__volume').text(`${currentIndex + 1}/${allQuestions.reduce((count, question) => count + (question.pid ? 1 : 0), 0)}`);
        $('.page-practice-info__pid').text(pid);
        $('.page-practice-question__type').text(findArrayNameByPid(pid));
        $('.page-practice-info__doing').text(chooseSubjectTypeName);

        displayQuestions(pid);
        highlightCurrentQuestion(pid);
        loadInitialData();
        initPanel();

        if (starQuestionSets.includes(pid.toString()))
            $('#practice-star img').attr('src', 'resources/images/icon_stared.svg');
        else
            $('#practice-star img').attr('src', 'resources/images/icon_star.svg');
    }

    function displayQuestions() {
        let questionList = $('.page-practice-info-sheet__list');
        questionList.empty();
        let allQuestions = Object.values(practiceQuestionSets).flat();
    
        allQuestions.forEach(question => {
            let listItem = $('<li>', {
                'class': 'page-practice-info-sheet__item',
                'onclick': `mainModule.displayQuestion(${question.pid})`,
                'question-number': `${question.pid}`
            });

            if (questionDone !== null){
                if (questionDone.includes(question.pid)) {
                    listItem.addClass('done');
                }
            }

            questionList.append(listItem);
        });
    }

    function highlightCurrentQuestion(questionId) {
        $('.page-practice-info-sheet__item').removeClass('now');
        $(`.page-practice-info-sheet__item[question-number="${questionId}"]`).addClass('now');
    }

    function navigateToQuestion(questionId) {
        displayQuestion(questionId);
        highlightCurrentQuestion(questionId);
    }

    function navigateToNextQuestion() {
        let allQuestions = Object.values(practiceQuestionSets).flat();
        currentIndex = allQuestions.findIndex(q => q.pid === currentQuestionIndex);
        if (currentIndex !== -1 && currentIndex + 1 < allQuestions.length) {
            let nextQuestion = allQuestions[currentIndex + 1];
            displayQuestion(nextQuestion.pid);
        } else
            showMessage('error', '没有下一题了');
    }

    function navigateToPreviousQuestion() {
        let allQuestions = Object.values(practiceQuestionSets).flat();
        currentIndex = allQuestions.findIndex(q => q.pid === currentQuestionIndex);
        if (currentIndex > 0) {
            let prevQuestion = allQuestions[currentIndex - 1];
            displayQuestion(prevQuestion.pid);
        } else
            showMessage('error', '没有上一题啊');
    }

    function loadInitialData() {
        let savedData = JSON.parse(localStorage.getItem('starQuestionSets'));
        if (savedData) {
            starQuestionSets = savedData;
        }

        let doneQuestions = JSON.parse(localStorage.getItem('doneQuestions'));
        if (doneQuestions) {
            doneQuestions.forEach(questionId => {
                $(`.page-practice-info-sheet__item[question-number="${questionId}"]`).addClass('done');
            });
        }
    }

    function setupAnswerSheetToggle() {
        $('.page-practice-info__pid').click(function(event) {
            event.stopPropagation();
            $('.page-practice-info-sheet').toggleClass('active');

            let currentQuestion = $('.now.page-practice-info-sheet__item');
            if (currentQuestion.length > 0) {
                let container = $('.page-practice-info-sheet__list');
                let containerTop = container.offset().top;
                let containerBottom = containerTop + container.height();
                let currentQuestionTop = currentQuestion.offset().top;
                let currentQuestionBottom = currentQuestionTop + currentQuestion.outerHeight();
    
                if (currentQuestionTop < containerTop || currentQuestionBottom > containerBottom) {
                    container.scrollTop(currentQuestionTop - containerTop + container.scrollTop() - 10);
                }
            }
        });
    
        $('.page-practice-info-sheet').click(function(event) {
            event.stopPropagation();
        });
    
        $(document).click(function(event) {
            if (!$(event.target).closest('.page-practice-info, .page-practice-info-sheet').length) {
                $('.page-practice-info-sheet').removeClass('active');
            }
        });
    }
    
    function modifyBackendEnableInfo() {
        let userSettings = JSON.parse(localStorage.getItem('userSettings'));
        
        if (userSettings.connectBackend == true) {
            $('#progress-sync-status .container-panel-status__color').css('background', 'var(--success-color)');
            $('#progress-sync-status .container-panel-status__text').text('已连接服务器');
        } else {
            $('#progress-sync-status .container-panel-status__color').css('background', 'var(--failed-color)');
            $('#progress-sync-status .container-panel-status__text').text('未连接服务器，数据将不会同步');
        }
    }

    function saveProgress() {
        let doneQuestions = JSON.parse(localStorage.getItem('doneQuestions') || '[]');
        let studentInfo = JSON.parse(localStorage.getItem('studentInfo'));
        let userSettings = JSON.parse(localStorage.getItem('userSettings'));
    
        if (userSettings.connectBackend == true) {
            if (!studentInfo || !studentInfo.sfz) {
                showMessage('error', '没有提供身份证号，自动转为本地存储，数据将不会自动保存', 3000);
                showMessage('error', '可前往设置重新开启：连接服务器', 3000);
                userSettings.connectBackend = false;
                localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
                if (currentQuestionIndex !== 0) {
                    if (!doneQuestions.includes(currentQuestionIndex.toString())) {
                        doneQuestions.push(currentQuestionIndex.toString());
                        saveLog(`题目 ${currentQuestionIndex} 已完成，但由于未提供身份证号，已保存至本地`);
                        localStorage.setItem('doneQuestions', JSON.stringify(doneQuestions));
                    } else {
                        saveLog(`saveProgress(): 题目 ${currentQuestionIndex} 在数组中已存在`);
                    }
                }
    
                modifyBackendEnableInfo();
            } else {
                let userId = studentInfo.sfz;
                if (currentQuestionIndex !== 0 && !doneQuestions.includes(currentQuestionIndex.toString())) {
                    doneQuestions.push(currentQuestionIndex.toString());
                    questionDone.push(currentQuestionIndex.toString());
                    localStorage.setItem('doneQuestions', JSON.stringify(doneQuestions));
    
                    if (getSettings('connectBackend') && getSettings('backendUrl')) {
                        fetch(`${backendUrl}/saveProgress`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: userId, data: doneQuestions })
                        }).catch(error => showMessage('error', 'Failed to save progress:' + error));
                    }
                } else if (doneQuestions.includes(currentQuestionIndex.toString())) {
                    saveLog(`编号 ${currentQuestionIndex} 在数组中已存在`);
                }
    
                modifyBackendEnableInfo();
            }
        } else {
            if (currentQuestionIndex !== 0 && !doneQuestions.includes(currentQuestionIndex.toString())) {
                doneQuestions.push(currentQuestionIndex.toString());
                if (questionDone !== null)
                    questionDone.push(currentQuestionIndex.toString());
                localStorage.setItem('doneQuestions', JSON.stringify(doneQuestions));
                saveLog(`题目 ${currentQuestionIndex} 已完成，但由于连接服务器已关闭，已保存至本地`);
            } else if (doneQuestions.includes(currentQuestionIndex.toString())) {
                saveLog(`saveProgress(): 编号${currentQuestionIndex}在数组中已存在`);
            }
    
            modifyBackendEnableInfo();
        }
    
        if (studentInfo !== null && getSettings('connectBackend') == false)
            showMessage('error', '你关闭了连接服务器，信息不会同步，建议前往设置开启连接服务器喵');
    }

    function startScoreRequest() {
        showMessage('normal', '请求中');

        const studentInfo = loadStudentInfo();
        if (!studentInfo) {
            showMessage('error', '证件信息没填，去前面填一下');
            return;
        }
    
        const ifpass = $('#ifpass-type').val();
        const scoreType = $('#score-type').val();
        const scoreNumber = $('#score-number').val();
        let totalScore = scoreType == 1 ? 300 : 200;
    
        if (scoreNumber == '') {
            showMessage('error', '分数不能为空');
            return;
        }

        const data = {
            ifpass: parseInt(ifpass),
            sfz: studentInfo.sfz,
            xm: studentInfo.xm,
            xx: studentInfo.xx,
            zy: studentInfo.zy,
            zf: totalScore,
            sjmc: scoreType,
            cj: parseInt(scoreNumber),
        };

        fetch(sumbitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(responseData => {
            let outputText;
    
            if (responseData.result === 0) {
                outputText = `[${getCurrentTime()}] 操作成功. 服务器响应：${JSON.stringify(responseData)}`;
                showMessage('success', '添加好了，但是估计没用');
            } else {
                outputText = `[${getCurrentTime()}] 操作成功. 服务器响应：${JSON.stringify(responseData)}`;
                showMessage('success', '添加好了，但是估计没用');
            }
        })
        .catch(error => {
            showMessage('error', '网断了，或者船政服务器炸了，发不过去: ' + error);
        });
    }

    $(function() {
        loadInitialData();
        updatePracticeLoad(JSON.parse(localStorage.getItem('practiceLoad')));
        setupAnswerSheetToggle();

        $('.page-practice-info__back').on('click', function() {
            mainModule.navigateToPreviousQuestion();
        });
        $('.page-practice-info__forward').on('click', function() {
            mainModule.navigateToNextQuestion();
        });

        let isCheckMode = true;
        function checkAnswerAndContinue() {
            if ($('.selected.page-practice-question__option').length > 0) {
                $('.page-practice-question__continue').text('继续');
                const answerLabel = $('.page-container .page-container-main .page-practice .page-practice-question__answerWrapper');
                const clickButton = $('#practice-continue.page-practice-question__continue');
                const userSelectedValueLabel = $('#practice-selected-answer .page-practice-question__value');
                const rightAnswerValueLabel = $('.page-practice-question__option[answer=1]');
                const userSelectedValue = $('.selected.page-practice-question__option > span:first-child');
                const rightAnswerValue = $('.page-practice-question__option[answer=1] > span:first-child');
                const selectSubject = $('#practice-subject-choose');
        
                if (isCheckMode) {  
                    answerLabel.css('visibility', 'visible');
                    clickButton.text('下一题').css('display', 'block');
                    rightAnswerValueLabel.addClass('answer');
                    userSelectedValueLabel.text(userSelectedValue.text());      
        
                    if (userSelectedValue.text() == rightAnswerValue.text()) {
                        userSelectedValueLabel.css('color', 'var(--success-color)');
                    } else {
                        userSelectedValueLabel.css('color', 'var(--failed-color)');
                        $('.selected.page-practice-question__option').css('background', 'var(--failed-color)').css('color', 'var(--color-surface-0)');
        
                        if (getSettings('autoStarWrongQuestion') == true && selectSubject.val() != -2)
                            toggleBookmark($('.page-practice-info__pid').text());
                    }
        
                    isCheckMode = false;
                } else {
                    saveProgress();
                    navigateToNextQuestion();
        
                    answerLabel.removeAttr('style');
                    userSelectedValueLabel.removeAttr('style').text('-');
        
                    isCheckMode = true;
                }
            } else {
                showMessage('error', '请选择答案');
            }
        }
        
        $('#practice-continue').on('click', checkAnswerAndContinue);
        $(document).on('keydown', function(event) {
            if (event.keyCode === 13 || event.keyCode === 32) {
                event.preventDefault();
                checkAnswerAndContinue();
            }
        });
         
        let doneQuestions = Object.values(questionSets).flat();
    });

    function setActive(button) {
        const buttons = $(".page-container-main-tools__button");
        buttons.removeClass("active");
        button.addClass("active");
        const index = buttons.index(button);
        $(".page-container-main").css("--page-container-show-index", index);
        saveMenuState(button.attr('id'));
    }

    function saveMenuState(activeButtonId) {
        localStorage.setItem('activeButtonId', activeButtonId);
    }
    
    function saveStudentInfo(studentInfo) {
        localStorage.setItem('studentInfo', JSON.stringify(studentInfo));
    }
    
    function loadStudentInfo() {
        const storedInfo = localStorage.getItem('studentInfo');
        return storedInfo ? JSON.parse(storedInfo) : null;
    }
    
    function handleIdentity(action, idCard) {
        const idCardInput = document.getElementById('id-card');
        idCard = idCard || idCardInput.value.trim();
        if (action !== 'delete') {
            if (!validateIdCard(idCard)) {
                showMessage('error', '你框里输入的有问题吧');
                return;
            }
        }
        switch (action) {
            case 'add':
                showMessage('normal', '加载证件信息中，可能要1分钟，慢是船政的问题');
            case 'modify':
                fetchStudentInfo(idCard, action);
                break;
            case 'delete':
                deleteStudentInfo();
                break;
            default:
                saveLog('handleIdentity(): 无效的操作类型');
        }
    }

    function validateStudentInfoExists() {
        return localStorage.getItem('studentInfo') !== null && localStorage.getItem('studentInfo') !== undefined ? true : false;
    }

    function validateIdCard(idCard) {
        return idCard.length === 18;
    }

    function fetchStudentInfo(idCard, action) {
        fetch(stuInfoUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sfz: idCard })
        })
        .then(response => response.json())
        .then(data => {
            if (data.errorCode == 0 && data.data.outmap.err == 'success') {
                saveStudentInfo(data.data.outmap.xs);
                showMessage('success', '学生信息已加载');
                if (action === 'modify') {
                    showMessage('success', '学生信息已更新');
                }
                showMessage('success', '页面将会在2秒后刷新重载');
                setTimeout(function() {
                    window.location.reload();
                }, 2000);
            } else {
                showMessage('error', '请检查身份证号是否正确。');
                displayStudentInfo(data, 'abort');
            }
        })
        .catch(error => {
            showMessage('error', '请求身份证信息出错:', error);
        });
    }

    function fetchStudentInfoToBackend() {
        let studentInfo = JSON.parse(localStorage.getItem('studentInfo'));
        fetch(`${backendUrl}/studentInfo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: studentInfo.sfz, data: studentInfo })
        }).catch(error => showMessage('error', 'Failed to upload student info to backend:' + error));
    }

    function deleteStudentInfo() {
        localStorage.removeItem('studentInfo');
        showMessage('success', '学生信息已删除');
        showMessage('error', '页面将会在2秒后刷新重载');
        setTimeout(function() {
            window.location.reload();
        }, 2000);
    }

    function saveStudentInfo(studentInfo) {
        localStorage.setItem('studentInfo', JSON.stringify(studentInfo));
        displayStudentInfo(studentInfo);
        showMessage('success', '证件信息已保存本地存储');
    }

    function displayStudentInfo(studentInfo, type = 'normal') {
        let greetingMessage;
        let idNumberMessage;
        let detailMessage;

        if (type !== 'normal') {
            greetingMessage = '-';
            idNumberMessage = '-';
            detailMessage = '-';
        } else {
            greetingMessage = `${studentInfo.xm[0]}同学，你好`;
            idNumberMessage = studentInfo.sfz.replace(/(\d{6})\d{11}(\d)/, '$1***********$2');
            detailMessage = `${studentInfo.zy}（${studentInfo.xx}）`;
        }

        $('.container-panel-profile__greeting').text(greetingMessage);
        $('.container-panel-profile__idnumber').text(idNumberMessage);
        $('.container-panel-profile__detail').text(detailMessage);
        
        if (getSettings('connectBackend') == true)
            fetchStudentInfoToBackend();
    }

    function initPanel() {
        const profileEditButton = $('.container-panel-profile__edit');
        const profileDeleteButton = $('.container-panel-profile__delete');
        const profileDoneButton = $('.container-panel-profile__done');

        function panelButtonUnactive(type) {
            let buttons = $('.container-panel-profile__button');
            buttons.css('display', type == 0 ? 'none' : 'block');
            profileDoneButton.css('display', type == 0 ? 'block' : 'none');
        }

        profileEditButton.on('click', function() {
            let idNumberDiv = $('.container-panel-profile__idnumber');
            let idNumberValue = JSON.parse(localStorage.getItem('studentInfo')).sfz;
            idNumberDiv.replaceWith(`<input class="container-panel-profile__idnumber" value="${idNumberValue}" />`);
            panelButtonUnactive(0);

            function escHandler(event) {
                if (event.keyCode === 27) {
                    let idNumberInput = $('.container-panel-profile__idnumber');
                    let idNumberValue = idNumberInput.val(); 
                    idNumberInput.replaceWith(`<div class="container-panel-profile__idnumber">${idNumberValue}</div>`);
                    panelButtonUnactive(1);
                    
                    if (validateStudentInfoExists)
                        $('.container-panel-profile__idnumber').text(JSON.parse(localStorage.getItem('studentInfo')).sfz.replace(/(\d{6})\d{11}(\d)/, '$1***********$2'));
                
                    $(document).off('keydown', escHandler);
                }
            }

            $(document).on('keydown', escHandler);
        });
        
        profileDoneButton.on('click', function() {
            let idNumberInput = $('.container-panel-profile__idnumber');
            let idNumberValue = idNumberInput.val();
            handleIdentity('modify', idNumberValue);
            idNumberInput.replaceWith(`<div class="container-panel-profile__idnumber">${idNumberValue}</div>`);
            panelButtonUnactive(1);
        });

        profileDeleteButton.on('click', function() {
            handleIdentity('delete');
        });

        let currentDate = new Date();
        let targetDate = new Date('2024-05-15');
        let timeDiff = targetDate.getTime() - currentDate.getTime();
        let daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) > 0 ? Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) : '考完了';

        let exerciseCountMap = {
            '专业课单选': questionSets['单选题'].length,
            '专业课多选': questionSets['多选题'].length,
            '专业课判断': questionSets['判断题（正确选T，错误选F）'].length,
        
            '语文单选': questionSets['单选题（语文）'].length,
            '语文阅读': questionSets['阅读题（语文）'].length,
            '语文判断': questionSets['判断题（语文）正确选T，错误选F'].length,
        
            '数学单选': questionSets['单选题（数学）'].length,
            '数学判断': questionSets['判断题（数学）正确选T，错误选F'].length,
        
            '英语单选': questionSets['单选题（英语）'].length,
        
            '政治单选': questionSets['单选题（政治）'].length,
            '政治多选': questionSets['多选题（政治）'].length,
            '政治判断': questionSets['判断题（政治）正确选T，错误选F'].length
        };

        $('#exam-countdown .container-panel-header-countdown__value').text(daysDiff);
        $('#total-countdown .container-panel-header-countdown__value').text(Object.values(questionSets).flat().length);
        $('#prof-countdown .container-panel-header-countdown__value').text(exerciseCountMap['专业课单选'] + exerciseCountMap['专业课多选'] + exerciseCountMap['专业课判断']);
        $('#general-countdown .container-panel-header-countdown__value').text(Object.values(questionSets).flat().length - (exerciseCountMap['专业课单选'] + exerciseCountMap['专业课多选'] + exerciseCountMap['专业课判断']));

        let doProgress = JSON.parse(localStorage.getItem('doneQuestions')) !== null ? JSON.parse(localStorage.getItem('doneQuestions')).length : 0;
        let doProgressPercent = doProgress / Object.values(questionSets).flat().length;

        $('#student-progress').text(`${doProgressPercent.toFixed(4) == 0 ? '0' : (doProgressPercent * 100).toFixed(1)}%（${doProgress}）`);
        $('#backend-status .container-panel-status__progressScroll').css('width', `${(doProgress / Object.values(questionSets).flat().length) * 100}%`);
        
        modifyBackendEnableInfo();
        
        /**
         * 统计页
         */
        $('.page-statistics #countdown .page-statistics-value').text(questionDone.length);
        $('.page-statistics #correct-rate .page-statistics-value').text((starQuestionSets.length / questionDone.length).toFixed(0));
        
        doProgress = JSON.parse(localStorage.getItem('doneQuestions')) !== null ? JSON.parse(localStorage.getItem('doneQuestions')).length : 0;
        doProgressPercent = doProgress / Object.values(mainModule.questionSets).flat().length;
        $('.page-statistics #finish-rate .page-statistics-value').text(`${doProgressPercent.toFixed(2) == 0 ? '0' : (doProgressPercent * 100).toFixed(2)}%`);
        $('.page-statistics #star-rate .page-statistics-value').text(`${starQuestionSets.length}`);
        $('.page-statistics #star-done-rate .page-statistics-value').text(`${questionDone.length !== 0 ? ((starQuestionSets.length / questionDone.length) * 100).toFixed(2) : '0'}%`);
        
        function displaySubjectDoneProgress() {
            let subjectCompletion = {};
            let uniqueQuestions = {};
            let subjectStarred = {};
        
            for (let subject in exerciseSets) {
                if (exerciseSets.hasOwnProperty(subject)) {
                    subjectCompletion[subject] = new Set();
                    uniqueQuestions[subject] = new Set();
                    subjectStarred[subject] = new Set();
        
                    exerciseSets[subject].forEach(question => {
                        uniqueQuestions[subject].add(question.pid);
                        if (questionDone.includes(question.pid.toString())) {
                            subjectCompletion[subject].add(question.pid);
                        }
                        if (starQuestionSets.includes(question.pid.toString())) {
                            subjectStarred[subject].add(question.pid);
                        }
                    });
                }
            }
        
            let $table = $('<table>').addClass('statistics-table');
            let $thead = $('<thead>');
            let $tbody = $('<tbody>');
        
            $thead.append('<tr><th>科目</th><th>已做题数</th><th>总题数</th><th>完成进度</th><th>已收藏题数</th><th>收藏题数占科目总题数的比率</th></tr>');
            $table.append($thead);
        
            for (let subject in subjectCompletion) {
                let doneCount = subjectCompletion[subject].size;
                let totalCount = uniqueQuestions[subject].size;
                let starredCount = subjectStarred[subject].size;
                let completionPercentage = ((doneCount / totalCount) * 100).toFixed(2) + '%';
                let starredPercentage = ((starredCount / totalCount) * 100).toFixed(2) + '%';
        
                let $row = $('<tr>');
                $row.append(`<td class="statistics-table__subject">${subject}</td>`);
                $row.append(`<td>${doneCount}</td>`);
                $row.append(`<td>${totalCount}</td>`);
                $row.append(`<td>${completionPercentage}</td>`);
                $row.append(`<td>${starredCount}</td>`);
                $row.append(`<td>${starredPercentage}</td>`);
                $tbody.append($row);
            }
        
            $table.append($tbody);
        
            $('#subject-done-progress').empty().append($table);
        }
        displaySubjectDoneProgress();
    }
    
    function showEaster(status, htmlContent) {
        if (arguments.length === 1 && status === 'delete') {
            $('.page-fixed-tools').remove();
            return;
        }

        if ($('.page-fixed-tools').length) {
            $('.page-fixed-tools').remove();
        }
    
        var $fixedTools = $('<div class="page-fixed-tools"></div>');
        var $fixedCard = $('<div class="page-fixed-card"></div>').html(htmlContent);
    
        $fixedTools.append($fixedCard);
        $('.page-footer').after($fixedTools);
    
        setTimeout(function() {
            $fixedCard.css('opacity', '1');
    
            setTimeout(function() {
                $fixedCard.removeAttr('style');
    
                setTimeout(function() {
                    $fixedTools.remove();
                }, 200);
            }, 3000);
        }, 200);
    
        if (status === 'delete') {
            $fixedCard.on('click', 'button', function() {
                $fixedTools.remove();
            });
        }
    }

    $(function() {
        $(".page-container-main-tools__button").click(function() {
            setActive($(this));
        });
        const activeButtonId = localStorage.getItem('activeButtonId');
        if (activeButtonId) {
            $(`#${activeButtonId}`).click();
        } else {
            $(".page-container-main-tools__button:first").click();
        }
    });

    $(function() {
        const studentInfo = loadStudentInfo();
        if (studentInfo) {
            displayStudentInfo(studentInfo);
        }
    });

    /**
     * 设置页按钮绑定
     */
    $(function() {   
        // 自动星标错题设置
        let autoStarElement = $('#advanced-autostar-wrong');
        getSettings('autoStarWrongQuestion') == true ? autoStarElement.prop('checked', true) : autoStarElement.prop('checked', false);
        autoStarElement.on('click', function() {
            let isChecked = $(this).prop('checked');
            changeSettings('autoStarWrongQuestion', isChecked);
        });

        // 连接后台
        let connectBackendElement = $('#advanced-connect-backend');
        getSettings('connectBackend') == true ? connectBackendElement.prop('checked', true) : connectBackendElement.prop('checked', false);
        connectBackendElement.on('click', function() {
            let isChecked = $(this).prop('checked');
            changeSettings('connectBackend', isChecked);
            saveProgress();
            showMessage('success', '已修改服务器设置，修改后建议立刻刷新页面');
        });
        
        // 自动同步
        let autoSyncElement = $('#auto-sync');
        getSettings('autoSync') == true ? autoSyncElement.prop('checked', true) : autoSyncElement.prop('checked', false);
        autoSyncElement.on('click', function() {
            let isChecked = $(this).prop('checked');
            changeSettings('autoSync', isChecked);
        });
        
        // 公开统计数据
        let publicStatElement = $('#public-stat');
        getSettings('publicStat') == true ? publicStatElement.prop('checked', true) : publicStatElement.prop('checked', false);
        publicStatElement.on('click', function() {
            let studentInfo = JSON.parse(localStorage.getItem('studentInfo'));
            let isChecked = $(this).prop('checked');
            changeSettings('publicStat', isChecked);
            
            fetch(`${backendUrl}/publicStat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: studentInfo.sfz, publicStatSet: isChecked })
            })
            .then(response => response.json())
            .then(data => {
                showMessage('success', '已调整公开统计数据为 ' + isChecked);
            })
            .catch(error => showMessage('error', 'Failed to update public statistics setting.'));
        });

        // 重置做题进度
        let resetDoneElement = $('#reset-questions-done');
        resetDoneElement.on('click', function() {
            questionDone = [];
            localStorage.setItem('doneQuestions', JSON.stringify(questionDone));
            showMessage('success', '已重置做题进度，刷新页面生效');
        });

        // 重置收藏夹
        let resetStarElement = $('#reset-questions-star');
        resetStarElement.on('click', function() {
            starQuestionSets = [];
            localStorage.setItem('starQuestionSets', JSON.stringify(questionDone));
            showMessage('success', '已重置收藏夹，刷新页面生效');
        });
        
        // 重置服务器做题进度
        let resetBackendDoneElement = $('#reset-backend-questions-done');
        resetBackendDoneElement.on('click', function() {
            if (confirm('你确定，哥？要不再想想？点了确定全没了')) {
                let studentInfo = JSON.parse(localStorage.getItem('studentInfo'));
                if (studentInfo !== null) {
                    localStorage.setItem('doneQuestions', JSON.stringify(questionDone));
                    fetch(`${backendUrl}/saveProgress`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: studentInfo.sfz, data: 'reset' })
                    }).catch(error => showMessage('error', 'Failed to reset progress:' + error));
                    
                    showMessage('success', '已重置服务器做题进度，刷新页面生效');
                } else
                    showMessage('error', '你没登身份证重置鸡毛');
            }
        });

        // 重置服务器收藏夹
        let resetBackendStarElement = $('#reset-backend-questions-star');
        resetBackendStarElement.on('click', function() {
            if (confirm('你确定，哥？要不再想想？点了确定全没了')) {
                let studentInfo = JSON.parse(localStorage.getItem('studentInfo'));
                if (studentInfo !== null) {
                    localStorage.setItem('starQuestionSets', JSON.stringify(questionDone));
                    fetch(`${backendUrl}/updateBookmarks`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: studentInfo.sfz, data: 'reset' })
                    }).catch(error => showMessage('error', 'Failed to reset bookmarks:' + error));
                    
                    showMessage('success', '已重置服务器收藏夹，刷新页面生效');
                } else
                    showMessage('error', '你没登身份证重置鸡毛');
            }
        });
    });

    $(function() {
        saveLog(`页面已加载 (Main.js ${versionType} ${version})`);
        showMessage('success', '已自动跳过原来做过的题，有需要可以自己切回去');
        initPanel();
        
        $('.page-menu-title').on('click', function() {
            $('.page-container .page-container-panel').toggleClass('mobile');
        });
    
        function updateUserProgress() {
            if (studentInfoObj !== null && getSettings('connectBackend') == true && getSettings('autoSync') == true) {
                $.ajax({
                    url: `${backendUrl}/getUserProgress`,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ userId: studentInfoObj.sfz }),
                    success: function(response) {
                        if (response.error) {
                            showMessage('error', '无法解析');
                        } else {
                            let responseStar = response.starQuestions;
                            let responseDone = response.questionDone;
        
                            let isQuestionDoneEqual = arraysEqual(questionDone, responseDone);
        
                            if (!isQuestionDoneEqual) {
                                if ($('.page-practice-question__option.selected').length > 0) {
                                    saveLog('当前进度与服务器不同，但是你好像在做题，所以不打扰你瞄');
                                } else {
                                    questionDone = responseDone || [];
                                    localStorage.setItem('doneQuestions', JSON.stringify(questionDone));
                                    displayQuestion(skipDoneQuestion());
                                    showMessage('success', '当前进度与服务器不同，已自动同步最新进度瞄');
                                }
                            }
                            
                            if (response.userSettings.publicStat !== getSettings('publicStat')) {
                                let publicStatElement = $('#public-stat');
                                publicStatElement.prop('checked', response.userSettings.publicStat);
                                changeSettings('publicStat', response.userSettings.publicStat);
                            }
                            
                            if (response.recentOperateCount) {
                                if ($('#recent-operate-count').length > 0) {
                                    $('#recent-operate-count .container-panel-status__emphasized').text(response.recentOperateCount);
                                } else {
                                    let containerPanelStatusLabel = $('<div>', {
                                        class: 'container-panel-status__label',
                                        id: 'recent-operate-count'
                                    });
                                    let colorSpan = $('<span>', {
                                        class: 'container-panel-status__color'
                                    });
                                    let textSpan = $('<span>', {
                                        class: 'container-panel-status__text',
                                        html: `10分钟内有<span class="container-panel-status__emphasized">${response.recentOperateCount}</span>人做过题（包括你自己）`
                                    });
            
                                    containerPanelStatusLabel.append(colorSpan, textSpan);
                                    $('#progress-sync-status').before(containerPanelStatusLabel);
                                }
                            }
                        }
                    },
                    error: function(xhr, status, error) {
                        showMessage('error', 'Error fetching user progress. Try reload.');
                    }
                });
        
                saveLog('updateUserProgress(): 自动同步最新进度');
            }
        }
        
        function arraysEqual(arr1, arr2) {
            if (arr1.length !== arr2.length) return false;
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) return false;
            }
            return true;
        }
    
        if (getSettings('connectBackend') == true)
            setInterval(updateUserProgress, 1000 * 20);
            
        updateUserProgress();
    });

    return {
        questionSets: questionSets,
        exerciseSets: exerciseSets,

        questionDone: questionDone,

        sortedExerciseSets: sortedExerciseSets,
        sortedQuestionSets: sortedQuestionSets,

        userSettings: userSettings,
        getSettings: getSettings,
        changeSettings: changeSettings,

        displayQuestion: displayQuestion,
        displayQuestions: displayQuestions,
        updatePracticeLoad: updatePracticeLoad,
        navigateToQuestion: navigateToQuestion,
        toggleBookmark: toggleBookmark,

        updateStarLoad: updateStarLoad,
        updateViewLoad: updateViewLoad,

        navigateToQuestion: navigateToQuestion,
        navigateToNextQuestion: navigateToNextQuestion,
        navigateToPreviousQuestion: navigateToPreviousQuestion,

        handleIdentity: handleIdentity,
        validateStudentInfoExists: validateStudentInfoExists,
        startScoreRequest: startScoreRequest,

        showMessage: showMessage,
        showEaster: showEaster,
        saveLog: saveLog
    }
})();