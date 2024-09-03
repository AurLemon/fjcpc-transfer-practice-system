var loadModule = (function() {
    let questionSets = {};
    let exerciseSets = {};
    
    function addScript(src, callback) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = script.onerror = function() {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            if (callback) {
                callback();
                callback = null;
            }
        }
        ;
        document.head.appendChild(script);
        return script;
    }

    $.ajax({
        url: 'https://lemon-1254268741.cos.ap-shanghai.myqcloud.com/questionSets.json',
        method: 'GET',
        async: false, // 设置为同步请求
        success: function(data) {
            questionSets = data;
            console.log('questionSets.json 已加载');
        },
        error: function(xhr, status, error) {
            console.log('加载questionSets.json出错:' + error);
        }
    });
    
    $.ajax({
        url: 'https://lemon-1254268741.cos.ap-shanghai.myqcloud.com/exerciseSets.json',
        method: 'GET',
        async: false,
        success: function(data) {
            exerciseSets = data;
            console.log('exerciseSets.json 已加载');
        },
        error: function(xhr, status, error) {
            console.log('加载exerciseSets.json出错:' + error);
        }
    });

    addScript('libraries/main.js');

    return {
        exerciseSets: exerciseSets,
        questionSets: questionSets
    }
})();