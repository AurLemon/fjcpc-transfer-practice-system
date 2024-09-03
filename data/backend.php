<?php
$dataFilePath = __DIR__ . '/data.json'; // 数据文件路径
$logFilePath = __DIR__ . '/log.log'; // 日志文件路径

header('Content-Type: application/json'); // 设置响应类型为JSON

// 根据请求方法进行处理
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // 处理其他GET请求
        break;
    case 'POST':
        $postData = json_decode(file_get_contents('php://input'), true);
        $requestUri = $_SERVER['REQUEST_URI'];
        if (strpos($requestUri, '/updateBookmarks') !== false || strpos($requestUri, '/saveProgress') !== false || strpos($requestUri, '/studentInfo') !== false || strpos($requestUri, '/deleteBookmarks') !== false || strpos($requestUri, '/deleteProgress') !== false || strpos($requestUri, '/publicStat') !== false) {
            if (isset($postData['userId'])) {
                echo updateUserData($dataFilePath, $postData, $logFilePath, $requestUri);
            } else {
                echo json_encode(['error' => 'User ID not provided']);
            }
        } elseif (strpos($requestUri, '/getUserProgress') !== false) {
            if (isset($postData['userId'])) {
                echo getUserProgress($dataFilePath, $postData['userId'], $logFilePath);
            } else {
                echo json_encode(['error' => 'User ID not provided']);
            }
        } else {
            echo json_encode(['error' => 'Invalid request']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
}

function writeLog($logFilePath, $message) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFilePath, $logMessage, FILE_APPEND);
}

function updateUserData($filePath, $postData, $logFilePath, $requestUri) {
    if (!file_exists($filePath)) {
        file_put_contents($filePath, json_encode([])); // 确保文件存在
    }
    
    $file = fopen($filePath, 'r+');
    if (flock($file, LOCK_EX)) { // 获得独占锁
        $data = json_decode(file_get_contents($filePath), true);
        $userId = $postData['userId'] ?? null;
        $userInfo = $data[$userId]['userInfo'] ?? ['xm' => '未知', 'sfz' => $userId];

        if ($userId === null) {
            flock($file, LOCK_UN);
            fclose($file);
            return json_encode(['error' => 'User ID not provided']);
        }

        if (!isset($data[$userId])) {
            $data[$userId] = [
                'questionDone' => [],
                'starQuestions' => [],
                'userInfo' => []
            ];
        }

        if (isset($postData['data'])) {
            if (strpos($requestUri, '/updateBookmarks') !== false) {
                if ($postData['data'] === 'reset') {
                    $data[$userId]['starQuestions'] = [];
                    writeLog($logFilePath, "/updateBookmarks: {$userInfo['xm']}（{$userInfo['sfz']}）重置了书签。");
                } else {
                    $newData = array_diff($postData['data'], $data[$userId]['starQuestions']);
                    $data[$userId]['starQuestions'] = array_unique(array_merge($data[$userId]['starQuestions'], $postData['data']));
                    $data[$userId]['starQuestions'] = array_values($data[$userId]['starQuestions']);
                    writeLog($logFilePath, "/updateBookmarks: {$userInfo['xm']}（{$userInfo['sfz']}）添加了题目编号为 " . implode(', ', $newData) . " 的书签。");
                }
                updateOperateTime($data, $userId, '/updateBookmarks');
            } elseif (strpos($requestUri, '/saveProgress') !== false) {
                if ($postData['data'] === 'reset') {
                    $data[$userId]['questionDone'] = [];
                    writeLog($logFilePath, "/saveProgress: {$userInfo['xm']}（{$userInfo['sfz']}）重置了进度。");
                } else {
                    $newData = array_diff($postData['data'], $data[$userId]['questionDone']);
                    $data[$userId]['questionDone'] = array_unique(array_merge($data[$userId]['questionDone'], $postData['data']));
                    $data[$userId]['questionDone'] = array_values($data[$userId]['questionDone']);
                    writeLog($logFilePath, "/saveProgress: {$userInfo['xm']}（{$userInfo['sfz']}）添加了题目编号为 " . implode(', ', $newData) . " 的进度。");
                }
                updateOperateTime($data, $userId, '/saveProgress');
            } elseif (strpos($requestUri, '/studentInfo') !== false) {
                $data[$userId]['userInfo'] = $postData['data'];
                updateOperateTime($data, $userId, '/studentInfo');
                writeLog($logFilePath, "/studentInfo: {$userInfo['sfz']} 传入了学生信息。");
            } elseif (strpos($requestUri, '/deleteBookmarks') !== false || strpos($requestUri, '/deleteProgress') !== false) {
                $itemKey = strpos($requestUri, '/deleteBookmarks') !== false ? 'starQuestions' : 'questionDone';
                $originalData = $data[$userId][$itemKey];
                $data[$userId][$itemKey] = array_values(array_diff($originalData, $postData['data']));
                $notFound = array_diff($postData['data'], $originalData);
                if (!empty($notFound)) {
                    writeLog($logFilePath, "/$itemKey: 无法找到并删除用户{$userInfo['xm']}的题目编号为 " . implode(', ', $notFound) . " 的数据。");
                    return json_encode(['error' => 'Items not found', 'notFound' => $notFound]);
                } else {
                    writeLog($logFilePath, "/$itemKey: 成功删除用户{$userInfo['xm']}的题目编号 " . implode(', ', $postData['data']) . "。");
                    updateOperateTime($data, $userId, "/" . $itemKey);
                }
            }
        } else if (strpos($requestUri, '/publicStat') !== false) {
            if (!isset($postData['publicStatSet'])) {
                return json_encode(['error' => 'Public status setting not provided']);
            }
            $publicStatSet = (bool) $postData['publicStatSet'];
            if (!isset($data[$userId]['userSettings'])) {
                $data[$userId]['userSettings'] = ['publicStat' => $publicStatSet];
            } else {
                $data[$userId]['userSettings']['publicStat'] = $publicStatSet;
            }
            writeLog($logFilePath, "/publicStat: 用户 {$userInfo['xm']}（{$userInfo['sfz']}）的公开状态设置为 " . ($publicStatSet ? 'true' : 'false') . ".");
            updateOperateTime($data, $userId, '/publicStat');
        } else {
            return json_encode(['error' => 'No data provided for update']);
        }

        if (file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            flock($file, LOCK_UN);
            fclose($file);
            return json_encode(['status' => 'success']);
        } else {
            flock($file, LOCK_UN);
            fclose($file);
            return json_encode(['error' => 'Failed to write data']);
        }
    } else {
        fclose($file);
        return json_encode(['error' => 'Could not lock file']);
    }
}

function updateOperateTime(&$data, $userId, $requestUri) {
    $data[$userId]['operateTime'] = [
        'operateType' => $requestUri,
        'time' => time()  // 使用当前的Unix时间戳
    ];
}

function getUserProgress($filePath, $userId, $logFilePath) {
    if (file_exists($filePath)) {
        $file = fopen($filePath, 'r+');
        if (flock($file, LOCK_SH)) { // 获得共享锁
            $data = json_decode(file_get_contents($filePath), true);
            if (isset($data[$userId])) {
                $userData = $data[$userId];

                // 确保 userSettings 存在
                if (!isset($userData['userSettings'])) {
                    $userData['userSettings'] = ['publicStat' => true]; // 如果不存在，则创建默认值
                }

                // 准备返回的数据
                $response = [
                    'questionDone' => $userData['questionDone'] ?? [],
                    'starQuestions' => $userData['starQuestions'] ?? [],
                    'userSettings' => $userData['userSettings']
                ];

                // 计算近10分钟内的操作次数
                $recentOperateCount = 0;
                $currentTime = time();
                foreach ($data as $user) {
                    if (isset($user['operateTime']) && ($currentTime - $user['operateTime']['time']) <= 600) {
                        $recentOperateCount++;
                    }
                }

                $response['recentOperateCount'] = $recentOperateCount;

                flock($file, LOCK_UN);
                fclose($file);
                $userIP = $_SERVER['REMOTE_ADDR'];
                writeLog($logFilePath, "/getUserProgress: $userIP 获取了 {$userId} 的用户进度");
                // updateOperateTime($data, $userId, '/getUserProgress');
                return json_encode($response);
            } else {
                flock($file, LOCK_UN);
                fclose($file);
                return json_encode(['error' => 'User not found']);
            }
        } else {
            fclose($file);
            return json_encode(['error' => 'Could not lock file']);
        }
    } else {
        return json_encode(['error' => 'Data file not found']);
    }
}
?>