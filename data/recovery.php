<?php
$logFilePath = __DIR__ . '/log.log'; // 日志文件路径
$dataFilePath = __DIR__ . '/data.json'; // 数据文件路径

// 从GET参数中获取用户身份证号和题目类型
$userId = $_GET['userId'] ?? '';
$progressType = $_GET['type'] ?? '';

if (empty($userId) || empty($progressType)) {
    echo "User ID and progress type are required.";
    exit;
}

// 初始化进度数组
$progress = [];

// 打开日志文件，以读取方式
$logFileHandle = fopen($logFilePath, 'r');
if (!$logFileHandle) {
    echo "Failed to open log file.";
    exit;
}

// 获取共享锁
if (!flock($logFileHandle, LOCK_SH)) {
    fclose($logFileHandle);
    echo "Failed to lock log file.";
    exit;
}

// 逐行读取日志文件内容
while (($line = fgets($logFileHandle)) !== false) {
    // 查找包含指定用户身份证号和题目类型的记录
    if (strpos($line, $userId) !== false) {
        if ($progressType == 1 && strpos($line, '/saveProgress') !== false) {
            // 题目进度记录
            if (preg_match('/题目编号为 (\d+)/', $line, $matches)) {
                $progress[] = $matches[1];
            }
        } elseif ($progressType == 2 && strpos($line, '/updateBookmarks') !== false) {
            // 收藏题目记录
            if (preg_match('/题目编号为 (\d+)/', $line, $matches)) {
                $progress[] = $matches[1];
            }
        }
    }
}

// 关闭并解锁日志文件
flock($logFileHandle, LOCK_UN);
fclose($logFileHandle);

// 打开数据文件，以写入方式
$dataFileHandle = fopen($dataFilePath, 'r+');
if (!$dataFileHandle) {
    echo "Failed to open data file.";
    exit;
}

// 获取独占锁
if (!flock($dataFileHandle, LOCK_EX)) {
    fclose($dataFileHandle);
    echo "Failed to lock data file.";
    exit;
}

// 更新data.json文件中对应用户的题目进度或收藏记录
if (!isset($data[$userId])) {
    $data[$userId] = ['questionDone' => [], 'starQuestions' => []];
}

if ($progressType == 1) {
    // 更新题目进度
    foreach ($progress as $questionId) {
        if (!in_array($questionId, $data[$userId]['questionDone'])) {
            $data[$userId]['questionDone'][] = $questionId;
        }
    }
} elseif ($progressType == 2) {
    // 更新收藏题目
    foreach ($progress as $questionId) {
        if (!in_array($questionId, $data[$userId]['starQuestions'])) {
            $data[$userId]['starQuestions'][] = $questionId;
        }
    }
}

// 将更新后的数据写回到data.json文件中
if (file_put_contents($dataFilePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo "Updated data.json successfully.";
} else {
    echo "Failed to update data.json.";
}

// 解锁并关闭数据文件
flock($dataFileHandle, LOCK_UN);
fclose($dataFileHandle);
?>