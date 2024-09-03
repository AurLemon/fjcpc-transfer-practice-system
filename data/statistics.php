<?php
$dataFilePath = __DIR__ . '/data.json';

header('Content-Type: text/html; charset=utf-8'); 

$data = file_exists($dataFilePath) ? json_decode(file_get_contents($dataFilePath), true) : [];

$totalQuestionsDone = 0;
$totalStarQuestions = 0;
$userCount = count($data);
$usersWithPublicStatFalse = 0;

foreach ($data as $userId => $userInfo) {
    $totalQuestionsDone += count($userInfo['questionDone']);
    $totalStarQuestions += count($userInfo['starQuestions']);
    
    if (isset($userInfo['userSettings']['publicStat']) && $userInfo['userSettings']['publicStat'] === false) {
        $usersWithPublicStatFalse++;
    }
}
$averageQuestionsDone = $userCount > 0 ? $totalQuestionsDone / $userCount : 0;
$averageStarQuestions = $userCount > 0 ? $totalStarQuestions / $userCount : 0;

echo "<!DOCTYPE html>";
echo "<html lang='zh-CN'>";
echo "<head>";
echo "<meta charset='UTF-8'>";
echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
echo "<link rel='icon' href='https://lemon.hydcraft.cn/resources/images/favicon.png' type='image/png'>";
echo "<link rel='stylesheet' href='https://lemon.hydcraft.cn/resources/static/styles.css'>";
echo "<link rel='stylesheet' href='https://lemon.hydcraft.cn/resources/static/statistics.css'>";
echo "<title>用户统计信息</title>";
echo "</head>";
echo "<body>";
echo "<h1>用户统计信息</h1>";

echo "<div class='statistics-info'>总共有 " . $userCount . " 个人做题（序号只代表第几个在网站登记，设置可禁止做题数据公开）。全班平均做题量为 " . number_format($averageQuestionsDone, 0) . "，平均收藏题量为 " . number_format($averageStarQuestions, 0) . "，有 " . $usersWithPublicStatFalse . " 人设置了不公开做题数据。</div>";

echo "<div class='statistics-list'>";

$count = 1;
foreach ($data as $userId => $userInfo) {
    $starRatio = 0;
    $name = $userInfo['userInfo']['xm'] ?: '未知';
    $questionDoneCount = count($userInfo['questionDone']);
    $starQuestionsCount = count($userInfo['starQuestions']);
    
    // 检查用户是否有设置公开统计信息，如果没有或者为 false，且未传入 show 参数，则跳过该用户的统计信息
    if (isset($userInfo['userSettings']['publicStat']) && $userInfo['userSettings']['publicStat'] === false && !isset($_GET['show'])) {
        echo "<div class='statistics-item' count='$count' question-done='$questionDoneCount' star-question='$starQuestionsCount'>";
        
        echo "<div class='statistics-item__unknown'>";
        echo "<div class='statistics-item__unknownPic'><img src='https://lemon.hydcraft.cn/resources/images/favicon.png'></div>";
        echo "<div class='statistics-item__unknownTitle'>这么喜欢偷窥</div>";
        echo "</div>";
        
        echo "<div class='statistics-item__progressWrapper'>";
        echo "<div class='statistics-item__progress'>";
        echo "</div>";
        echo "</div>";
        
        echo "</div>";
        $count++;
        continue;
    }
    
    echo "<div class='statistics-item' count='$count' question-done='$questionDoneCount' star-question='$starQuestionsCount'>";

    if ($questionDoneCount > 0)
        $starRatio = ($starQuestionsCount / $questionDoneCount) * 100;
    
    $recentOperateTime = isset($userInfo['operateTime']) ? date('Y-m-d H:i:s', $userInfo['operateTime']['time']) : '';
    $recentOperateType = isset($userInfo['operateTime']) ? $userInfo['operateTime']['operateType'] : '';
    $recentOperateDescription = $recentOperateType;

    echo "<div class='statistics-item__info'>";
    echo "<div class='statistics-item__label'>身份证号: <span class='statistics-item__value' id='id-number'>" . substr($userId, 0, 6) . str_repeat('*', 11) . substr($userId, -1) . "</span></div>";
    
    $showName = isset($_GET['show']) && $_GET['show'] === 'true';
    if ($showName) {
        echo "<div class='statistics-item__label'>姓名: <span class='statistics-item__value' id='name'>$name</span></div>";
    } else {
        echo "<div class='statistics-item__label'>姓名: <span class='statistics-item__value' id='name'>" . mb_substr($name, 0, 1, 'UTF-8') . (mb_strlen($name, 'UTF-8') > 1 ? '*' . mb_substr($name, 2, null, 'UTF-8') : '') . "</span></div>";
    }
    
    echo "<div class='statistics-item__label'>做题数量: <span class='statistics-item__value'>$questionDoneCount</span></div>";
    echo "<div class='statistics-item__label'>收藏题目数量: <span class='statistics-item__value'>$starQuestionsCount</span></div>";
    echo "<div class='statistics-item__label'>收藏做题比: <span class='statistics-item__value'>" . ($starRatio == 0 ? '0' : number_format($starRatio, 1)) . "%</span></div>";
    echo "<div class='statistics-item__label'>做题进度: " . "<span class='statistics-item__value' id='done-progress'></span>" . "</div>";
    echo "</div>";
    
    echo "<div class='statistics-item__opreateWrapper'>";
    echo "<div class='statistics-item__opreate'>最近操作时间: <span class='statistics-item__value'>$recentOperateTime</span></div>";
    echo "<div class='statistics-item__opreate'>最近操作类型: <span class='statistics-item__value'>$recentOperateDescription</span></div>";
    echo "</div>";
    
    echo "<div class='statistics-item__progressWrapper'>";
    echo "<div class='statistics-item__progress'>";
    echo "</div>";
    echo "</div>";
    
    echo "</div>";
    
    $count++;
}

echo "</div>";
echo '<footer class="page-footer"><div class="page-footer-project"><div class="page-footer-project__name"><span>AurLemon\'s Personal Practice Question Bank</span><span>for FJCPC Transfer Exam</span></div><div class="page-footer-project__link"><a href="https://beian.miit.gov.cn/" target="_blank"><img src="https://lemon.hydcraft.cn/resources/images/beian_miit.png" width="16" height="16">闽ICP备2023007345号-1</a><a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank"><img src="https://lemon.hydcraft.cn/resources/images/beian_mps.png" width="16" height="16">闽公网安备35010202001677号</a><a href="https://lemon.hydcraft.cn" target="_blank"><img src="https://lemon.hydcraft.cn/resources/images/favicon.png" width="16" height="16">回去刷题</a><a href="https://appzb.fjcpc.edu.cn/kszx-test32/#/login" target="_blank"><img src="resources/images/logo_fjcpc.png" width="16" height="16">船政刷题登录</a></div></div><div class="page-footer-copyright">This project based on jQuery, coding and design by AurLemon (Lin Jun Le). © 2024 AurLemon under License MIT<br>工贸三年 谢谢教过我(们)的老师 特别是班主任/专业课/英语老师🌹 学生朽木 难以自雕 亦难自弃 愿工贸 春风育桃李 杏坛尽芳菲（除了教导队学生会）</div></footer>';
echo '<script type="text/javascript">var statModule=function(){const a=document.querySelectorAll(".statistics-item");return a.forEach(a=>{const b=parseInt(a.getAttribute("question-done")),c=100*(b/1394),d=a.querySelector(".statistics-item__progress");if(d.style.width=`${c}%`,100==c&&(d.style.background="var(--success-color)"),a.querySelector(".statistics-item__label #done-progress")){const b=a.querySelector(".statistics-item__label #done-progress");b.textContent=`${c.toFixed(1)}%`}}),{rank:function(c="question-done"){const d=Array.from(a).sort((d,a)=>{const b=parseInt(d.getAttribute("question-done")),e=parseInt(a.getAttribute("question-done")),f=parseInt(d.getAttribute("star-question")),g=parseInt(a.getAttribute("star-question")),h=100*(f/b)||0,i=100*(g/e)||0;return"star-question"===c?f===g?b===e?i-h:e-b:g-f:"star-question-per"===c?h===i?b===e?g-f:e-b:i-h:b===e?f===g?i-h:g-f:e-b}),e=d.map(a=>a.querySelector("#name").textContent);return e}}}();</script>';
echo "</body>";
echo "</html>";
?>