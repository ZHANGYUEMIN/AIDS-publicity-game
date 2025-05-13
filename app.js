/**
 * 艾滋病知识自测游戏
 * 版本: v1.2.1
 * 更新日期: 2023-11-25
 * 更新内容: 
 * 1. 修复GitHub数据同步对话框无法关闭的问题
 * 2. 优化事件处理逻辑，避免事件绑定冲突
 * 3. 改进GitHub配置，设置默认用户名和仓库信息
 * 4. 增强对话框稳定性和用户体验
 */

// 全局变量
let currentStudent = null;
let currentQuestion = 0;
let userAnswers = [];
let score = 0;
let studentReports = {}; // 存储学生报告的对象
let githubToken = ''; // GitHub个人访问令牌
let githubUsername = 'ZHANGYUEMIN'; // GitHub用户名
let githubRepo = 'AIDS-publicity-game'; // GitHub仓库名
let githubBranch = 'main'; // GitHub分支名

// DOM 元素
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const feedbackScreen = document.getElementById('feedback-screen');
const resultsScreen = document.getElementById('results-screen');
const classResultsScreen = document.getElementById('class-results-screen');

// 欢迎页面子部分
const quizIntro = document.getElementById('quiz-intro');
const reportsManagement = document.getElementById('reports-management');
const deleteMode = document.getElementById('delete-mode');

// 欢迎页面按钮
const takeQuizBtn = document.getElementById('take-quiz-btn');
const viewReportsBtn = document.getElementById('view-reports-btn');
const viewClassBtn = document.getElementById('view-class-btn');
const backToQuizBtn = document.getElementById('back-to-quiz-btn');
const deleteModeBtn = document.getElementById('delete-mode-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const selectAllCheckbox = document.getElementById('select-all-checkbox');

// 报告列表容器
const reportsList = document.getElementById('reports-list');
const deleteList = document.getElementById('delete-list');

const studentGrid = document.getElementById('student-grid');
const startBtn = document.getElementById('start-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

const feedbackTitle = document.getElementById('feedback-title');
const feedbackMessage = document.getElementById('feedback-message');
const continueBtn = document.getElementById('continue-btn');

const scoreValue = document.getElementById('score-value');
const showClassBtn = document.getElementById('show-class-btn');
const restartBtn = document.getElementById('restart-btn');
const backToPersonalBtn = document.getElementById('back-to-personal-btn');

// 初始化应用
function init() {
    // 检查GitHub令牌
    const savedToken = localStorage.getItem('githubToken');
    if (savedToken) {
        githubToken = savedToken;
        // 使用保存的或默认值
        githubUsername = localStorage.getItem('githubUsername') || githubUsername;
        githubRepo = localStorage.getItem('githubRepo') || githubRepo;
        githubBranch = localStorage.getItem('githubBranch') || githubBranch;
    } else {
        // 如果没有保存的令牌，但要确保使用默认设置
        console.log('使用默认GitHub配置');
    }
    
    // 检查浏览器存储支持
    checkStorageSupport();
    
    // 从GitHub加载数据
    loadStudentReportsFromGitHub();
    loadClassDataFromGitHub();
    
    // 加载学生名单到选择网格
    populateStudentSelect();
    
    // 更新报告列表
    updateReportsList();
    
    // 事件监听器 - 欢迎页面
    takeQuizBtn.addEventListener('click', showLeaderboard);
    viewReportsBtn.addEventListener('click', showReportsManagement);
    viewClassBtn.addEventListener('click', showClassResults);
    backToQuizBtn.addEventListener('click', showQuizIntro);
    deleteModeBtn.addEventListener('click', showDeleteMode);
    confirmDeleteBtn.addEventListener('click', deleteSelectedReports);
    cancelDeleteBtn.addEventListener('click', showReportsManagement);
    selectAllCheckbox.addEventListener('change', toggleSelectAllReports);
    
    // 事件监听器 - 测试
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', handleNextQuestion);
    continueBtn.addEventListener('click', continueQuiz);
    showClassBtn.addEventListener('click', showClassResults);
    restartBtn.addEventListener('click', restartQuiz);
    backToPersonalBtn.addEventListener('click', backToPersonalReport);
    
    // 添加报告导航按钮事件
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleReportNavigation);
    });
    
    // 显示/隐藏班级报告按钮
    showClassBtn.style.display = classData.completedStudents > 0 ? 'block' : 'none';
    
    // 在主页也设置班级按钮的可见性，始终显示
    viewClassBtn.style.display = 'block';
    
    // 添加菜单栏中的GitHub保存按钮
    addGitHubButton();
    
    // 初始化Cookie通知
    initCookieNotice();
    
    // 初始化政策页面
    initPolicyPages();
    
    console.log('初始化完成');
}

// 检查浏览器存储支持
function checkStorageSupport() {
    let storageAvailable = false;
    let message = '';
    
    // 检查localStorage是否可用
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        storageAvailable = true;
        console.log('localStorage可用');
    } catch (e) {
        console.error('localStorage不可用:', e);
        message += '您的浏览器不支持或禁用了本地存储(localStorage)。';
        
        // 尝试检查sessionStorage
        try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            storageAvailable = true;
            console.log('sessionStorage可用');
            message += '但sessionStorage可用，您的测试数据将在浏览器关闭后丢失。';
        } catch (e2) {
            console.error('sessionStorage也不可用:', e2);
            message += '且sessionStorage也不可用。您的测试数据将无法保存。';
            storageAvailable = false;
        }
    }
    
    // 如果存储不可用，显示警告
    if (!storageAvailable) {
        const warningElement = document.createElement('div');
        warningElement.className = 'storage-warning';
        warningElement.innerHTML = `
            <div class="warning-icon">⚠️</div>
            <div class="warning-message">
                <h3>存储功能受限警告</h3>
                <p>${message}</p>
                <p>可能原因：</p>
                <ul>
                    <li>您正在使用隐私浏览模式</li>
                    <li>浏览器设置中禁用了存储功能</li>
                    <li>浏览器存储空间已满</li>
                    <li>使用了内容拦截器或隐私扩展程序</li>
                </ul>
                <p>解决方法：</p>
                <ul>
                    <li>尝试退出隐私浏览模式</li>
                    <li>在浏览器设置中允许使用Cookie和存储</li>
                    <li>清理浏览器缓存或其他网站数据</li>
                    <li>暂时禁用内容拦截器</li>
                </ul>
            </div>
        `;
        
        document.body.appendChild(warningElement);
        
        // 5秒后自动关闭
        setTimeout(() => {
            warningElement.classList.add('fadeout');
            setTimeout(() => {
                warningElement.remove();
            }, 1000);
        }, 8000);
    }
}

// 从GitHub加载学生报告数据
function loadStudentReportsFromGitHub() {
    if (!githubToken) {
        // 先尝试从本地存储加载
        loadStudentReports();
        return;
    }
    
    const dataFilePath = 'data/studentReports.json';
    
    fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${dataFilePath}?ref=${githubBranch}`, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => {
        if (response.status === 404) {
            console.log('GitHub上未找到学生报告数据，从本地加载');
            loadStudentReports();
            return null;
        } else if (response.ok) {
            return response.json();
        } else {
            throw new Error(`GitHub API错误: ${response.status}`);
        }
    })
    .then(data => {
        if (data) {
            // 解码Base64内容
            const content = decodeURIComponent(escape(atob(data.content)));
            try {
                studentReports = JSON.parse(content);
                console.log('成功从GitHub加载学生报告数据');
                showNotification('已从GitHub加载数据', 'success');
                
                // 更新本地存储
                localStorage.setItem('studentReports', JSON.stringify(studentReports));
                
                // 更新报告列表
                updateReportsList();
            } catch (parseError) {
                console.error('解析GitHub数据时出错:', parseError);
                loadStudentReports();
            }
        }
    })
    .catch(error => {
        console.error('从GitHub加载数据时出错:', error);
        loadStudentReports();
    });
}

// 从GitHub加载班级数据
function loadClassDataFromGitHub() {
    if (!githubToken) {
        // 先尝试从本地存储加载
        loadClassData();
        return;
    }
    
    const dataFilePath = 'data/classData.json';
    
    fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${dataFilePath}?ref=${githubBranch}`, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => {
        if (response.status === 404) {
            console.log('GitHub上未找到班级数据，从本地加载');
            loadClassData();
            return null;
        } else if (response.ok) {
            return response.json();
        } else {
            throw new Error(`GitHub API错误: ${response.status}`);
        }
    })
    .then(data => {
        if (data) {
            // 解码Base64内容
            const content = decodeURIComponent(escape(atob(data.content)));
            try {
                const parsedData = JSON.parse(content);
                
                // 更新班级数据
                classData = parsedData;
                console.log('成功从GitHub加载班级数据');
                
                // 更新本地存储
                localStorage.setItem('classData', JSON.stringify(classData));
                
                // 更新班级报告按钮显示状态
                showClassBtn.style.display = classData.completedStudents > 0 ? 'block' : 'none';
            } catch (parseError) {
                console.error('解析GitHub班级数据时出错:', parseError);
                loadClassData();
            }
        }
    })
    .catch(error => {
        console.error('从GitHub加载班级数据时出错:', error);
        loadClassData();
    });
}

// 调试辅助函数
function debugElementEvents(elementId, eventName) {
    setTimeout(function() {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`为元素 ${elementId} 添加 ${eventName} 事件监听器`);
            element.addEventListener(eventName, function(e) {
                console.log(`元素 ${elementId} 触发了 ${eventName} 事件`);
            });
        } else {
            console.warn(`未找到元素 ${elementId}`);
        }
    }, 100);
}

// 保存GitHub令牌函数
function saveGitHubToken(token, username, repo, branch, remember) {
    console.log('保存GitHub令牌和相关信息');
    
    // 设置全局变量
    githubToken = token;
    githubUsername = username;
    githubRepo = repo;
    githubBranch = branch;
    
    // 如果选择记住，保存到本地存储
    if (remember) {
        localStorage.setItem('githubToken', token);
        localStorage.setItem('githubUsername', username);
        localStorage.setItem('githubRepo', repo);
        localStorage.setItem('githubBranch', branch);
        console.log('GitHub授权信息已保存到localStorage');
    }
    
    // 显示成功通知
    showNotification('GitHub授权信息已保存，正在上传数据...', 'info');
    console.log('GitHub令牌保存成功');
    
    return true;
}

// 弹出GitHub令牌输入对话框
function showGitHubTokenDialog() {
    console.log('显示GitHub令牌对话框开始');
    // 检查是否已保存令牌
    const savedToken = localStorage.getItem('githubToken');
    if (savedToken) {
        githubToken = savedToken;
        console.log('已从localStorage加载令牌');
    }
    
    // 加载已保存的用户名、仓库名和分支名，如果没有则使用默认值
    const savedUsername = localStorage.getItem('githubUsername') || 'ZHANGYUEMIN';
    const savedRepo = localStorage.getItem('githubRepo') || 'AIDS-publicity-game';
    const savedBranch = localStorage.getItem('githubBranch') || 'main';
    
    // 更新全局变量
    githubUsername = savedUsername;
    githubRepo = savedRepo;
    githubBranch = savedBranch;
    
    console.log('已保存的GitHub配置:', { 
        token: savedToken ? '已存在' : '未保存', 
        username: savedUsername, 
        repo: savedRepo, 
        branch: savedBranch 
    });
    
    // 检查是否已经存在对话框，如果存在则移除
    const existingDialog = document.getElementById('github-dialog-overlay');
    if (existingDialog) {
        document.body.removeChild(existingDialog);
        console.log('移除已存在的对话框');
    }
    
    // 创建对话框元素
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'dialog-overlay';
    dialogOverlay.id = 'github-dialog-overlay';
    
    const dialogBox = document.createElement('div');
    dialogBox.className = 'dialog-box';
    
    dialogBox.innerHTML = `
        <h3>GitHub 授权</h3>
        <p>为了将数据保存到GitHub，需要您的GitHub个人访问令牌(Personal Access Token)。</p>
        <p>您可以在<a href="https://github.com/settings/tokens" target="_blank">GitHub设置</a>中创建一个具有repo权限的令牌。</p>
        <div class="form-group">
            <label for="github-token">GitHub 令牌:</label>
            <input type="password" id="github-token" value="${savedToken || ''}" placeholder="输入您的GitHub个人访问令牌">
        </div>
        <div class="form-group">
            <label for="github-username">GitHub 用户名:</label>
            <input type="text" id="github-username" value="${savedUsername}" placeholder="输入您的GitHub用户名">
        </div>
        <div class="form-group">
            <label for="github-repo">GitHub 仓库名:</label>
            <input type="text" id="github-repo" value="${savedRepo}" placeholder="输入您的GitHub仓库名">
        </div>
        <div class="form-group">
            <label for="github-branch">GitHub 分支名:</label>
            <input type="text" id="github-branch" value="${savedBranch}" placeholder="输入GitHub分支名">
        </div>
        <div class="form-group">
            <label>
                <input type="checkbox" id="remember-token" checked>
                记住这些设置（本地存储）
            </label>
        </div>
        <div class="dialog-buttons">
            <button id="save-token-btn" class="primary-btn">保存</button>
            <button id="cancel-token-btn">取消</button>
        </div>
    `;
    
    dialogOverlay.appendChild(dialogBox);
    document.body.appendChild(dialogOverlay);
    console.log('GitHub令牌对话框已添加到DOM');
    
    // 关闭对话框的函数
    function closeDialog() {
        const dialog = document.getElementById('github-dialog-overlay');
        if (dialog) {
            document.body.removeChild(dialog);
            console.log('对话框已关闭');
        }
    }
    
    // 保存按钮 - 使用addEventListener而不是onclick
    const saveBtn = document.getElementById('save-token-btn');
    if (saveBtn) {
        // 移除任何现有的事件监听器
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        newSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('保存按钮被点击');
            
            const token = document.getElementById('github-token').value.trim();
            const username = document.getElementById('github-username').value.trim();
            const repo = document.getElementById('github-repo').value.trim();
            const branch = document.getElementById('github-branch').value.trim();
            const rememberToken = document.getElementById('remember-token').checked;
            
            console.log('获取到表单数据:', { username, repo, branch, tokenLength: token.length, rememberToken });
            
            // 验证输入
            if (!token) {
                alert('请输入GitHub令牌');
                return;
            }
            
            if (!username) {
                alert('请输入GitHub用户名');
                return;
            }
            
            if (!repo) {
                alert('请输入GitHub仓库名');
                return;
            }
            
            if (!branch) {
                alert('请输入GitHub分支名');
                return;
            }
            
            // 保存GitHub令牌和配置
            if (saveGitHubToken(token, username, repo, branch, rememberToken)) {
                // 关闭对话框
                closeDialog();
                
                // 尝试保存数据
                setTimeout(function() {
                    saveStudentReportsToGitHub();
                }, 100);
            }
        });
    }
    
    // 取消按钮 - 使用addEventListener而不是onclick
    const cancelBtn = document.getElementById('cancel-token-btn');
    if (cancelBtn) {
        // 移除任何现有的事件监听器
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('取消按钮被点击');
            
            // 关闭对话框
            closeDialog();
            
            // 显示取消通知
            showNotification('已取消GitHub数据同步', 'info');
        });
    }
    
    // 点击背景关闭对话框 - 使用addEventListener而不是onclick
    dialogOverlay.addEventListener('click', function(e) {
        if (e.target === dialogOverlay) {
            console.log('通过点击背景关闭对话框');
            closeDialog();
            
            // 显示取消通知
            showNotification('已取消GitHub数据同步', 'info');
        }
    });
    
    console.log('GitHub令牌对话框初始化完成');
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 淡入效果
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // 定时删除
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 保存学生报告数据到GitHub
function saveStudentReportsToGitHub() {
    if (!githubToken) {
        showGitHubTokenDialog();
        return;
    }
    
    // 显示加载中通知
    showNotification('正在将数据保存到GitHub...', 'info');
    
    try {
        const dataFilePath = 'data/studentReports.json';
        
        // 先检查仓库是否存在
        fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    showNotification(`仓库 ${githubUsername}/${githubRepo} 不存在，请检查用户名和仓库名`, 'error');
                } else if (response.status === 401) {
                    showNotification(`GitHub授权失败，令牌无效或已过期`, 'error');
                    // 清除无效的令牌
                    localStorage.removeItem('githubToken');
                    githubToken = '';
                    // 显示令牌对话框
                    setTimeout(() => {
                        showGitHubTokenDialog();
                    }, 1000);
                } else {
                    showNotification(`检查仓库时出错: ${response.status}`, 'error');
                }
                throw new Error(`仓库不存在或无法访问: ${response.status}`);
            }
            
            console.log('GitHub仓库验证成功');
            
            // 检查data目录是否存在
            return fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data?ref=${githubBranch}`, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
        })
        .then(response => {
            if (response.status === 404) {
                // data目录不存在，尝试创建一个空文件来初始化目录
                console.log('GitHub仓库中不存在data目录，将创建目录');
                
                const placeholderContent = btoa(unescape(encodeURIComponent('# 数据目录\n\n此目录用于存储应用程序数据。')));
                const requestBody = {
                    message: '创建data目录',
                    content: placeholderContent,
                    branch: githubBranch
                };
                
                return fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data/README.md`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                })
                .then(response => {
                    if (response.ok) {
                        console.log('成功创建data目录');
                        return { directoryCreated: true };
                    } else {
                        throw new Error(`创建data目录失败: ${response.status}`);
                    }
                });
            } else if (response.ok) {
                console.log('已存在data目录');
                return { directoryExists: true };
            } else {
                throw new Error(`检查data目录时出错: ${response.status}`);
            }
        })
        .then(directoryInfo => {
            console.log('正在检查是否存在数据文件');
            // 检查文件是否存在，获取SHA
            return fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${dataFilePath}?ref=${githubBranch}`, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            })
            .then(response => {
                if (response.status === 404) {
                    // 文件不存在，创建新文件
                    console.log('数据文件不存在，将创建新文件');
                    return { exists: false };
                } else if (response.ok) {
                    return response.json().then(data => {
                        console.log('已存在数据文件，获取SHA');
                        return { exists: true, sha: data.sha };
                    });
                } else {
                    throw new Error(`检查文件是否存在时出错: ${response.status}`);
                }
            });
        })
        .then(fileInfo => {
            console.log('准备上传数据');
            // 准备提交内容 - 使用正确的Base64编码
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(studentReports, null, 2))));
            const commitMessage = '更新学生测试报告数据';
            
            // 构建请求体
            const requestBody = {
                message: commitMessage,
                content: content,
                branch: githubBranch
            };
            
            // 如果文件存在，需要包含sha
            if (fileInfo.exists) {
                requestBody.sha = fileInfo.sha;
            }
            
            console.log('开始提交到GitHub');
            // 提交到GitHub
            return fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${dataFilePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
        })
        .then(response => {
            if (response.ok) {
                console.log('学生报告数据已成功保存到GitHub');
                showNotification('学生报告数据已保存到GitHub', 'success');
                
                // 同时保存到本地作为备份
                saveStudentReports();
                
                // 保存班级数据
                saveClassDataToGitHub();
                
                return true;
            } else {
                return response.json().then(errorData => {
                    console.error('保存到GitHub失败:', response.status, errorData);
                    showNotification(`保存到GitHub失败: ${errorData.message || '未知错误'}`, 'error');
                    
                    // 保存到本地作为备份
                    saveStudentReports();
                    
                    return false;
                }).catch(jsonError => {
                    console.error('解析错误响应失败:', jsonError);
                    showNotification(`保存到GitHub失败: 状态码 ${response.status}`, 'error');
                    saveStudentReports();
                    return false;
                });
            }
        })
        .catch(error => {
            console.error('保存到GitHub时出错:', error);
            showNotification(`保存到GitHub时出错: ${error.message}`, 'error');
            
            // 保存到本地作为备份
            saveStudentReports();
        });
    } catch (error) {
        console.error('保存到GitHub过程中出错:', error);
        showNotification(`保存到GitHub过程中出错: ${error.message}`, 'error');
        
        // 保存到本地作为备份
        saveStudentReports();
    }
}

// 保存班级数据到GitHub
function saveClassDataToGitHub() {
    if (!githubToken) {
        showGitHubTokenDialog();
        return;
    }
    
    // 显示加载通知
    showNotification('正在保存班级数据到GitHub...', 'info');
    
    try {
        const dataFilePath = 'data/classData.json';
        
        console.log('准备保存班级数据到GitHub');
        
        // 检查文件是否存在，获取SHA
        fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${dataFilePath}?ref=${githubBranch}`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        .then(response => {
            if (response.status === 404) {
                // 文件不存在，创建新文件
                console.log('班级数据文件不存在，将创建新文件');
                return { exists: false };
            } else if (response.ok) {
                return response.json().then(data => {
                    console.log('已存在班级数据文件，获取SHA');
                    return { exists: true, sha: data.sha };
                });
            } else if (response.status === 401) {
                showNotification(`GitHub授权失败，令牌无效或已过期`, 'error');
                // 清除无效的令牌
                localStorage.removeItem('githubToken');
                githubToken = '';
                throw new Error('GitHub授权失败，令牌无效');
            } else {
                showNotification(`检查班级数据文件时出错: ${response.status}`, 'error');
                throw new Error(`检查文件是否存在时出错: ${response.status}`);
            }
        })
        .then(fileInfo => {
            console.log('准备上传班级数据');
            // 准备提交内容 - 确保使用正确的Base64编码
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(classData, null, 2))));
            const commitMessage = '更新班级数据';
            
            // 构建请求体
            const requestBody = {
                message: commitMessage,
                content: content,
                branch: githubBranch
            };
            
            // 如果文件存在，需要包含sha
            if (fileInfo.exists) {
                requestBody.sha = fileInfo.sha;
            }
            
            console.log('开始提交班级数据到GitHub');
            // 提交到GitHub
            return fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${dataFilePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
        })
        .then(response => {
            if (response.ok) {
                console.log('班级数据已成功保存到GitHub');
                showNotification('班级数据已保存到GitHub', 'success');
                
                // 同时保存到本地作为备份
                localStorage.setItem('classData', JSON.stringify(classData));
                
                return true;
            } else {
                return response.json().then(errorData => {
                    console.error('保存班级数据到GitHub失败:', response.status, errorData);
                    showNotification(`保存班级数据到GitHub失败: ${errorData.message || '未知错误'}`, 'error');
                    
                    // 保存到本地作为备份
                    localStorage.setItem('classData', JSON.stringify(classData));
                    
                    return false;
                }).catch(error => {
                    console.error('解析错误响应失败:', error);
                    showNotification(`保存班级数据失败: 状态码 ${response.status}`, 'error');
                    
                    // 保存到本地作为备份
                    localStorage.setItem('classData', JSON.stringify(classData));
                    
                    return false;
                });
            }
        })
        .catch(error => {
            console.error('保存班级数据到GitHub时出错:', error);
            showNotification(`保存班级数据到GitHub时出错: ${error.message}`, 'error');
            
            // 保存到本地作为备份
            localStorage.setItem('classData', JSON.stringify(classData));
        });
    } catch (error) {
        console.error('保存班级数据到GitHub过程中出错:', error);
        showNotification(`保存班级数据到GitHub过程中出错: ${error.message}`, 'error');
        
        // 保存到本地作为备份
        localStorage.setItem('classData', JSON.stringify(classData));
    }
}

// 从本地存储加载学生报告数据
function loadStudentReports() {
    try {
        const savedReports = localStorage.getItem('studentReports');
        if (savedReports) {
            studentReports = JSON.parse(savedReports);
            console.log('成功加载学生报告数据:', Object.keys(studentReports).length, '个学生');
        } else {
            console.log('没有找到保存的学生报告数据');
        }
    } catch (error) {
        console.error('加载学生报告数据时出错:', error);
        // 使用备用方法：尝试使用sessionStorage
        try {
            const savedReports = sessionStorage.getItem('studentReports');
            if (savedReports) {
                studentReports = JSON.parse(savedReports);
                console.log('从sessionStorage成功加载学生报告数据');
            }
        } catch (sessionError) {
            console.error('从sessionStorage加载失败:', sessionError);
        }
    }
}

// 保存学生报告数据到本地存储
function saveStudentReports() {
    try {
        localStorage.setItem('studentReports', JSON.stringify(studentReports));
        console.log('学生报告数据已成功保存到localStorage');
        
        // 同时保存到sessionStorage作为备份
        try {
            sessionStorage.setItem('studentReports', JSON.stringify(studentReports));
        } catch (sessionError) {
            console.error('保存到sessionStorage失败:', sessionError);
        }
    } catch (error) {
        console.error('保存学生报告数据到localStorage时出错:', error);
        // 尝试使用备用方法：仅使用sessionStorage
        try {
            sessionStorage.setItem('studentReports', JSON.stringify(studentReports));
            console.log('学生报告数据已保存到sessionStorage (备用方案)');
        } catch (fallbackError) {
            console.error('保存到sessionStorage也失败:', fallbackError);
            alert('无法保存测试数据。可能是由于您的浏览器限制了存储功能，或者您正在使用隐私模式浏览。');
        }
    }
}

// 从本地存储加载班级数据
function loadClassData() {
    // 初始化班级数据结构
    classData = {
        totalStudents: students.length,
        completedStudents: 0,
        studentScores: {},
        questionStats: {},
        knowledgeAreaStats: {}
    };
    
    // 初始化统计数据结构
    initQuestionStats();
    initKnowledgeAreaStats();
    
    try {
        const savedClassData = localStorage.getItem('classData');
        if (savedClassData) {
            try {
                // 尝试解析数据
                const parsedData = JSON.parse(savedClassData);
                console.log('成功从localStorage加载班级数据');
                
                // 不直接使用解析的数据，而是在init函数中通过recalculateClassData重新计算
                // 这确保了班级数据始终基于当前的学生报告计算得出
            } catch (parseError) {
                console.error('解析班级数据时出错:', parseError);
            }
        } else {
            console.log('没有找到保存的班级数据');
        }
    } catch (error) {
        console.error('从localStorage加载班级数据时出错:', error);
        
        // 尝试从sessionStorage加载
        try {
            const savedClassData = sessionStorage.getItem('classData');
            if (savedClassData) {
                // 不做任何操作，只是日志记录
                console.log('从sessionStorage找到班级数据');
            }
        } catch (sessionError) {
            console.error('从sessionStorage加载班级数据失败:', sessionError);
        }
    }
}

// 更新报告列表显示
function updateReportsList() {
    // 清空报告列表
    reportsList.innerHTML = '';
    deleteList.innerHTML = '';
    
    // 检查是否有报告
    const hasReports = Object.keys(studentReports).length > 0;
    
    if (!hasReports) {
        const noReportsMsg = document.createElement('div');
        noReportsMsg.className = 'no-reports-message';
        noReportsMsg.textContent = '没有历史测试报告';
        reportsList.appendChild(noReportsMsg);
        
        const noReportsDeleteMsg = noReportsMsg.cloneNode(true);
        deleteList.appendChild(noReportsDeleteMsg);
        
        // 禁用删除按钮
        deleteModeBtn.disabled = true;
        return;
    }
    
    // 启用删除按钮
    deleteModeBtn.disabled = false;
    
    // 获取报告列表并按时间排序
    const reports = [];
    for (const student in studentReports) {
        for (const timestamp in studentReports[student]) {
            reports.push({
                student: student,
                timestamp: timestamp,
                date: new Date(parseInt(timestamp)),
                data: studentReports[student][timestamp]
            });
        }
    }
    
    // 按时间倒序排序
    reports.sort((a, b) => b.date - a.date);
    
    // 创建报告列表项
    reports.forEach(report => {
        // 普通报告列表项
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.dataset.student = report.student;
        reportItem.dataset.timestamp = report.timestamp;
        
        const reportInfo = document.createElement('div');
        reportInfo.className = 'report-info';
        
        const reportTitle = document.createElement('h3');
        reportTitle.textContent = report.student;
        
        const reportMeta = document.createElement('div');
        reportMeta.className = 'report-meta';
        
        const reportDate = document.createElement('span');
        reportDate.textContent = formatDate(report.date);
        
        const reportScore = document.createElement('span');
        reportScore.className = 'report-score';
        reportScore.textContent = `得分: ${report.data.score}/10`;
        
        reportMeta.appendChild(reportDate);
        reportMeta.appendChild(reportScore);
        
        reportInfo.appendChild(reportTitle);
        reportInfo.appendChild(reportMeta);
        reportItem.appendChild(reportInfo);
        
        // 添加点击事件 - 查看报告
        reportItem.addEventListener('click', () => {
            loadAndShowReport(report.student, report.timestamp);
        });
        
        reportsList.appendChild(reportItem);
        
        // 删除模式下的报告列表项
        const deleteItem = reportItem.cloneNode(true);
        deleteItem.removeEventListener('click', () => {});
        
        const checkbox = document.createElement('div');
        checkbox.className = 'report-checkbox';
        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.dataset.student = report.student;
        checkboxInput.dataset.timestamp = report.timestamp;
        checkbox.appendChild(checkboxInput);
        
        deleteItem.insertBefore(checkbox, deleteItem.firstChild);
        deleteList.appendChild(deleteItem);
    });
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 加载并显示指定的报告
function loadAndShowReport(student, timestamp) {
    const report = studentReports[student][timestamp];
    
    // 设置当前学生
    currentStudent = student;
    
    // 设置得分
    score = report.score;
    
    // 设置用户答案
    userAnswers = report.answers;
    
    // 显示结果界面
    showScreen(resultsScreen);
    
    // 重置滚动位置到顶部，避免显示图表时自动下滑
    window.scrollTo(0, 0);
    resultsScreen.scrollTo(0, 0);
    
    // 更新分数显示
    scoreValue.textContent = score;
    
    // 重新生成图表和分析
    generatePersonalChart();
    showKnowledgeAreas();
    generatePerformanceText();
    
    // 确保班级数据是最新的
    recalculateClassData();
    
    // 显示班级按钮
    showClassBtn.style.display = classData.completedStudents > 0 ? 'block' : 'none';
}

// 更新班级数据
function updateClassDataFromReport(studentName, reportData) {
    // 更新学生分数
    classData.studentScores[studentName] = reportData.score;
    
    // 更新完成测试的学生数量
    classData.completedStudents = Object.keys(classData.studentScores).length;
    
    // 更新题目统计数据
    reportData.answers.forEach((answer, index) => {
        if (answer.isCorrect) {
            classData.questionStats[index].correct++;
        } else {
            classData.questionStats[index].incorrect++;
        }
        
        // 更新知识领域统计
        const area = getQuestionKnowledgeArea(index);
        if (area) {
            if (answer.isCorrect) {
                classData.knowledgeAreaStats[area].correct++;
            } else {
                classData.knowledgeAreaStats[area].incorrect++;
            }
        }
    });
    
    // 保存到GitHub
    saveClassDataToGitHub();
}

// 切换全选报告
function toggleSelectAllReports() {
    const checkboxes = deleteList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 删除选中的报告
function deleteSelectedReports() {
    const checkboxes = deleteList.querySelectorAll('input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        alert('请选择要删除的报告');
        return;
    }
    
    if (confirm(`确定要删除选中的 ${checkboxes.length} 条报告吗？`)) {
        checkboxes.forEach(checkbox => {
            const student = checkbox.dataset.student;
            const timestamp = checkbox.dataset.timestamp;
            
            if (studentReports[student] && studentReports[student][timestamp]) {
                delete studentReports[student][timestamp];
                
                // 如果学生没有报告了，删除该学生的条目
                if (Object.keys(studentReports[student]).length === 0) {
                    delete studentReports[student];
                }
            }
        });
        
        // 保存到GitHub
        saveStudentReportsToGitHub();
        
        // 更新界面
        updateReportsList();
        
        // 返回报告管理界面
        showReportsManagement();
    }
}

// 重新计算班级数据
function recalculateClassData() {
    // 重置班级数据
    classData = {
        totalStudents: students.length,
        completedStudents: 0,
        studentScores: {},
        questionStats: {},
        knowledgeAreaStats: {}
    };
    
    // 初始化题目统计和知识领域统计
    initQuestionStats();
    initKnowledgeAreaStats();
    
    // 记录已处理的学生，确保每个学生只计算一次
    const processedStudents = new Set();
    
    // 遍历所有学生的报告，更新班级数据
    for (const student in studentReports) {
        // 获取每个学生最新的一条报告
        const timestamps = Object.keys(studentReports[student]);
        if (timestamps.length > 0) {
            // 按时间戳排序，取最新的
            const latestTimestamp = timestamps.sort((a, b) => parseInt(b) - parseInt(a))[0];
            const report = studentReports[student][latestTimestamp];
            
            // 将学生添加到已处理集合
            processedStudents.add(student);
            
            // 更新班级数据
            classData.studentScores[student] = report.score;
            classData.completedStudents++;
            
            // 更新题目统计和知识领域统计
            report.answers.forEach((answer, index) => {
                if (classData.questionStats[index]) {
                    classData.questionStats[index].total++;
                    if (answer.isCorrect) {
                        classData.questionStats[index].correct++;
                    }
                    
                    // 获取知识领域
                    const area = getQuestionKnowledgeArea(index);
                    
                    if (classData.knowledgeAreaStats[area]) {
                        classData.knowledgeAreaStats[area].total++;
                        if (answer.isCorrect) {
                            classData.knowledgeAreaStats[area].correct++;
                        }
                    }
                }
            });
        }
    }
    
    // 保存更新后的班级数据
    localStorage.setItem('classData', JSON.stringify(classData));
    
    // 更新班级按钮显示状态
    showClassBtn.style.display = classData.completedStudents > 0 ? 'block' : 'none';
    
    console.log(`已重新计算班级数据，共${classData.completedStudents}名学生`);
}

// 显示欢迎界面的子部分
function showSubSection(section) {
    // 隐藏所有子部分
    document.querySelectorAll('.sub-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // 显示指定子部分
    section.classList.add('active');
}

// 显示排行榜部分
function showLeaderboard() {
    // 准备排行榜数据
    let leaderboardData = [];
    for (const student in studentReports) {
        // 获取该学生的最高分数
        let bestScore = 0;
        let bestTime = 0;
        
        for (const timestamp in studentReports[student]) {
            const report = studentReports[student][timestamp];
            if (report.score > bestScore) {
                bestScore = report.score;
                bestTime = parseInt(timestamp);
            }
        }
        
        if (bestScore > 0) {
            leaderboardData.push({
                name: student,
                score: bestScore,
                timestamp: bestTime
            });
        }
    }
    
    // 按分数排序
    leaderboardData.sort((a, b) => b.score - a.score);
    
    // 创建排行榜UI
    const leaderboardHTML = `
        <div class="leaderboard-container">
            <h2>小游戏排行榜</h2>
            <p>看看谁的得分最高！点击任意处进入游戏</p>
            <div class="leaderboard-table">
                <div class="leaderboard-header">
                    <div class="rank-cell">排名</div>
                    <div class="name-cell">姓名</div>
                    <div class="score-cell">得分</div>
                    <div class="time-cell">测试时间</div>
                </div>
                ${leaderboardData.slice(0, 10).map((player, index) => `
                    <div class="leaderboard-row ${index < 3 ? 'top-' + (index + 1) : ''}">
                        <div class="rank-cell">${index + 1}</div>
                        <div class="name-cell">${player.name}</div>
                        <div class="score-cell">${player.score}</div>
                        <div class="time-cell">${formatDate(new Date(player.timestamp))}</div>
                    </div>
                `).join('')}
            </div>
            ${leaderboardData.length === 0 ? '<div class="no-data">暂无数据，快来挑战吧！</div>' : ''}
            <button class="start-game-btn" onclick="showQuizIntro()">开始新游戏</button>
        </div>
    `;
    
    // 创建临时div元素
    const tempDiv = document.createElement('div');
    tempDiv.className = 'sub-section active';
    tempDiv.id = 'leaderboard-section';
    tempDiv.innerHTML = leaderboardHTML;
    
    // 添加CSS样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .leaderboard-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            margin: 0 auto;
        }
        
        .leaderboard-table {
            width: 100%;
            margin: 20px 0;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .leaderboard-header, .leaderboard-row {
            display: flex;
            padding: 10px;
            align-items: center;
        }
        
        .leaderboard-header {
            background: #4CAF50;
            color: white;
            font-weight: bold;
        }
        
        .leaderboard-row {
            background: white;
            border-bottom: 1px solid #f0f0f0;
            transition: background 0.3s;
        }
        
        .leaderboard-row:hover {
            background: #f9f9f9;
        }
        
        .top-1 {
            background: linear-gradient(to right, #FFD700, #FFC107);
            font-weight: bold;
        }
        
        .top-2 {
            background: linear-gradient(to right, #C0C0C0, #E0E0E0);
            font-weight: bold;
        }
        
        .top-3 {
            background: linear-gradient(to right, #CD7F32, #D7CCC8);
            font-weight: bold;
        }
        
        .rank-cell {
            width: 10%;
            text-align: center;
            font-weight: bold;
        }
        
        .name-cell {
            width: 35%;
            padding-left: 10px;
        }
        
        .score-cell {
            width: 20%;
            text-align: center;
            font-weight: bold;
        }
        
        .time-cell {
            width: 35%;
            text-align: center;
        }
        
        .no-data {
            text-align: center;
            padding: 30px;
            color: #757575;
            font-style: italic;
        }
        
        .start-game-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            display: block;
            margin: 20px auto 0;
            transition: all 0.3s;
        }
        
        .start-game-btn:hover {
            background: #388E3C;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(styleElement);
    
    // 删除原来的子部分
    document.querySelectorAll('.sub-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // 添加到DOM中
    welcomeScreen.appendChild(tempDiv);
    
    // 点击排行榜任意处进入游戏
    tempDiv.addEventListener('click', function(e) {
        if (!e.target.closest('.start-game-btn')) {
            showQuizIntro();
        }
    });
}

// 显示测试介绍部分
function showQuizIntro() {
    // 删除排行榜部分（如果存在）
    const leaderboardSection = document.getElementById('leaderboard-section');
    if (leaderboardSection) {
        leaderboardSection.remove();
    }
    
    // 显示测试介绍，隐藏其他部分
    showSubSection(quizIntro);
}

// 显示报告管理部分
function showReportsManagement() {
    // 显示报告管理，隐藏其他部分
    showSubSection(reportsManagement);
}

// 显示删除模式部分
function showDeleteMode() {
    // 显示删除模式，隐藏其他部分
    showSubSection(deleteMode);
}

// 初始化学生下拉选择框
function populateStudentSelect() {
    studentGrid.innerHTML = '';
    
    students.forEach(student => {
        const studentItem = document.createElement('div');
        studentItem.className = 'student-item';
        studentItem.textContent = student;
        studentItem.dataset.name = student;
        
        studentItem.addEventListener('click', function() {
            // 移除其他学生的选中状态
            document.querySelectorAll('.student-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // 添加当前学生的选中状态
            this.classList.add('selected');
            
            // 更新当前选中的学生
            currentStudent = this.dataset.name;
            
            // 启用开始按钮
            startBtn.disabled = false;
        });
        
        studentGrid.appendChild(studentItem);
    });
}

// 处理学生选择
function handleStudentSelect() {
    // 使用格子选择模式后，此函数不再需要，但为兼容性保留空函数
}

// 开始测试
function startQuiz() {
    // 重置测试数据
    currentQuestion = 0;
    userAnswers = [];
    score = 0;
    
    // 显示测试界面
    showScreen(quizScreen);
    
    // 加载第一道题
    loadQuestion();
}

// 加载当前问题
function loadQuestion() {
    // 获取当前问题
    const question = questions[currentQuestion];
    
    // 更新问题文本
    questionText.textContent = question.question;
    
    // 清空选项容器
    optionsContainer.innerHTML = '';
    
    // 添加选项
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        // 根据题目类型添加不同样式的选项标记
        if (question.type === 'single') {
            const radioIcon = document.createElement('span');
            radioIcon.className = 'option-radio';
            optionElement.appendChild(radioIcon);
        } else if (question.type === 'multiple') {
            const checkboxIcon = document.createElement('span');
            checkboxIcon.className = 'option-checkbox';
            optionElement.appendChild(checkboxIcon);
        }
        
        const optionText = document.createElement('span');
        optionText.className = 'option-text';
        optionText.textContent = option;
        optionElement.appendChild(optionText);
        
        // 添加点击事件
        optionElement.addEventListener('click', () => handleOptionClick(optionElement, index));
        
        // 添加到选项容器
        optionsContainer.appendChild(optionElement);
    });
    
    // 禁用下一题按钮
    nextBtn.disabled = true;
    
    // 更新进度条
    const progress = ((currentQuestion) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestion + 1}/${questions.length}`;
}

// 处理选项点击事件
function handleOptionClick(optionElement, index) {
    const question = questions[currentQuestion];
    
    // 单选题处理
    if (question.type === 'single') {
        // 取消其他选项的选中状态
        optionsContainer.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // 选中当前选项
        optionElement.classList.add('selected');
        
        // 更新用户答案
        userAnswers[currentQuestion] = {
            selectedOptions: [index],
            isCorrect: false  // 暂时设为false，之后会检查
        };
    } 
    // 多选题处理
    else if (question.type === 'multiple') {
        // 切换当前选项的选中状态
        optionElement.classList.toggle('selected');
        
        // 收集所有选中的选项
        const selectedOptions = [];
        optionsContainer.querySelectorAll('.option').forEach((option, optIndex) => {
            if (option.classList.contains('selected')) {
                selectedOptions.push(optIndex);
            }
        });
        
        // 更新用户答案
        userAnswers[currentQuestion] = {
            selectedOptions: selectedOptions,
            isCorrect: false  // 暂时设为false，之后会检查
        };
    }
    
    // 启用下一题按钮
    nextBtn.disabled = false;
}

// 处理下一题按钮点击
function handleNextQuestion() {
    const question = questions[currentQuestion];
    const userAnswer = userAnswers[currentQuestion];
    
    // 检查答案是否正确
    userAnswer.isCorrect = checkAnswer(userAnswer.selectedOptions, question.correctAnswer);
    
    // 如果答对，增加分数
    if (userAnswer.isCorrect) {
        score++;
    }
    
    // 显示反馈
    showFeedback(userAnswer.isCorrect, question.explanation);
    
    // 更新到下一题
    currentQuestion++;
}

// 检查答案是否正确
function checkAnswer(userAnswer, correctAnswer) {
    if (userAnswer.length !== correctAnswer.length) {
        return false;
    }
    
    // 对数组进行排序以便比较
    const sortedUserAnswer = [...userAnswer].sort();
    const sortedCorrectAnswer = [...correctAnswer].sort();
    
    for (let i = 0; i < sortedUserAnswer.length; i++) {
        if (sortedUserAnswer[i] !== sortedCorrectAnswer[i]) {
            return false;
        }
    }
    
    return true;
}

// 显示反馈
function showFeedback(isCorrect, explanation) {
    quizScreen.classList.remove('active');
    feedbackScreen.classList.add('active');
    
    if (isCorrect) {
        feedbackTitle.textContent = "不错喔，加油！";
        feedbackTitle.className = 'correct';
    } else {
        feedbackTitle.textContent = "哎呀，后续努力喽！";
        feedbackTitle.className = 'incorrect';
    }
    
    feedbackMessage.textContent = explanation;
}

// 继续测试
function continueQuiz() {
    if (currentQuestion < questions.length) {
        // 继续下一题
        showScreen(quizScreen);
        loadQuestion();
    } else {
        // 测试完成，显示结果
        showResults();
    }
}

// 显示测试结果
function showResults() {
    // 显示结果屏幕
    showScreen(resultsScreen);
    
    // 重置滚动位置到顶部，避免显示图表时自动下滑
    window.scrollTo(0, 0);
    resultsScreen.scrollTo(0, 0);
    
    // 更新分数显示
    scoreValue.textContent = score;
    
    // 生成个人饼图
    generatePersonalChart();
    
    // 显示知识领域掌握情况
    showKnowledgeAreas();
    
    // 生成个性化表现文本
    generatePerformanceText();
    
    // 保存学生报告
    saveStudentReport();
    
    // 判断是否存在班级数据，决定是否显示班级报告按钮
    showClassBtn.style.display = classData.completedStudents > 0 ? 'block' : 'none';
}

// 保存学生测试报告
function saveStudentReport() {
    // 获取当前时间戳作为报告ID
    const timestamp = Date.now().toString();
    
    // 如果这个学生没有报告，创建一个空对象
    if (!studentReports[currentStudent]) {
        studentReports[currentStudent] = {};
    }
    
    // 存储报告数据
    studentReports[currentStudent][timestamp] = {
        student: currentStudent,
        score: score,
        answers: userAnswers.map(answer => ({
            isCorrect: answer.isCorrect,
            selectedOptions: answer.selectedOptions
        })),
        date: new Date().toISOString()
    };
    
    // 保存到GitHub
    saveStudentReportsToGitHub();
    
    // 更新班级数据
    updateClassDataFromReport(currentStudent, {
        score: score,
        answers: userAnswers
    });
    
    // 更新报告列表
    updateReportsList();
    
    // 更新班级报告按钮显示状态
    showClassBtn.style.display = 'block';
}

// 生成个人分析图表
function generatePersonalChart() {
    // 获取正确和错误答案的数量
    const correctCount = userAnswers.filter(answer => answer.isCorrect).length;
    const incorrectCount = userAnswers.length - correctCount;
    
    // 按知识领域分类统计
    const knowledgeAreaData = {};
    
    // 初始化知识领域数据
    const areas = [
        "基础知识",
        "传播途径",
        "预防措施",
        "治疗和管理",
        "社会支持与检测"
    ];
    
    areas.forEach(area => {
        knowledgeAreaData[area] = {
            correct: 0,
            incorrect: 0
        };
    });
    
    // 统计每个知识领域的正确和错误答案
    userAnswers.forEach((answer, index) => {
        const area = getQuestionKnowledgeArea(index);
        if (answer.isCorrect) {
            knowledgeAreaData[area].correct++;
        } else {
            knowledgeAreaData[area].incorrect++;
        }
    });
    
    // 准备堆叠柱状图数据
    const areaLabels = Object.keys(knowledgeAreaData);
    const correctData = areaLabels.map(area => knowledgeAreaData[area].correct);
    const incorrectData = areaLabels.map(area => knowledgeAreaData[area].incorrect);
    
    // 获取Canvas元素
    const ctx = document.getElementById('personal-chart').getContext('2d');
    
    // 如果已存在图表，销毁它
    if (window.personalChart) {
        window.personalChart.destroy();
    }
    
    // 创建新的堆叠柱状图
    window.personalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: areaLabels,
            datasets: [
                {
                    label: '答对题数',
                    data: correctData,
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1,
                    barThickness: 60,
                    maxBarThickness: 80
                },
                {
                    label: '答错题数',
                    data: incorrectData,
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    borderColor: 'rgba(244, 67, 54, 1)',
                    borderWidth: 1,
                    barThickness: 60,
                    maxBarThickness: 80
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: '知识领域',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 3,
                    title: {
                        display: true,
                        text: '题目数量',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 14
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        footer: function(tooltipItems) {
                            const datasetIndex = tooltipItems[0].datasetIndex;
                            const index = tooltipItems[0].dataIndex;
                            const label = areaLabels[index];
                            const total = knowledgeAreaData[label].correct + knowledgeAreaData[label].incorrect;
                            
                            if (datasetIndex === 0) { // 正确答案
                                const percent = total > 0 ? Math.round((knowledgeAreaData[label].correct / total) * 100) : 0;
                                return `正确率: ${percent}%`;
                            }
                            return '';
                        }
                    },
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 10
                },
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 15
                    }
                }
            }
        }
    });
    
    // 设置分数环的样式
    const scorePercent = (score / questions.length) * 100;
    document.querySelector('.score-circle').style.setProperty('--score-percent', `${scorePercent}%`);
    
    // 强制调整Canvas高度（个人图表）
    setTimeout(() => {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.style.height = '450px';
        }
    }, 100);
}

// 显示知识领域掌握情况
function showKnowledgeAreas() {
    const knowledgeAreasElement = document.getElementById('knowledge-areas');
    knowledgeAreasElement.innerHTML = '';
    
    // 按知识领域统计答题情况
    const areaStats = {};
    const areas = [
        "基础知识",
        "传播途径",
        "预防措施",
        "治疗和管理",
        "社会支持与检测"
    ];
    
    areas.forEach(area => {
        areaStats[area] = {
            correct: 0,
            total: 0
        };
    });
    
    // 统计各知识领域的答题情况
    userAnswers.forEach((answer, index) => {
        const area = getQuestionKnowledgeArea(index);
        areaStats[area].total++;
        if (answer.isCorrect) {
            areaStats[area].correct++;
        }
    });
    
    // 生成知识领域掌握情况元素
    Object.keys(areaStats).forEach(area => {
        if (areaStats[area].total > 0) {
            const areaElement = document.createElement('div');
            areaElement.className = 'knowledge-area';
            
            const labelElement = document.createElement('div');
            labelElement.className = 'knowledge-label';
            labelElement.textContent = area;
            
            const barElement = document.createElement('div');
            barElement.className = 'knowledge-bar';
            
            const percent = Math.round((areaStats[area].correct / areaStats[area].total) * 100);
            const progressElement = document.createElement('div');
            progressElement.className = 'knowledge-progress';
            progressElement.style.width = `${percent}%`;
            
            // 根据掌握程度添加不同的颜色
            if (percent >= 80) {
                progressElement.classList.add('good');
            } else if (percent >= 50) {
                progressElement.classList.add('medium');
            } else {
                progressElement.classList.add('poor');
            }
            
            // 添加掌握程度文本
            const scoreText = document.createElement('span');
            scoreText.textContent = `${areaStats[area].correct}/${areaStats[area].total} (${percent}%)`;
            progressElement.appendChild(scoreText);
            
            barElement.appendChild(progressElement);
            areaElement.appendChild(labelElement);
            areaElement.appendChild(barElement);
            
            knowledgeAreasElement.appendChild(areaElement);
        }
    });
}

// 生成表现评价文本
function generatePerformanceText() {
    const performanceTextElement = document.getElementById('performance-text');
    
    // 根据得分计算百分比
    const scorePercent = (score / questions.length) * 100;
    
    // 创建评价文本
    let evaluation = '';
    let suggestions = '';
    
    // 总体评价
    if (scorePercent >= 90) {
        evaluation = `<p>恭喜你，${currentStudent}！你对艾滋病知识的掌握非常全面，得分率高达${scorePercent}%。你展示了对艾滋病基本概念、传播途径、预防措施和治疗知识的深入理解。</p>`;
    } else if (scorePercent >= 70) {
        evaluation = `<p>做得不错，${currentStudent}！你对艾滋病知识有较好的掌握，得分率为${scorePercent}%。你对主要的艾滋病知识点有了基本理解，但仍有提升空间。</p>`;
    } else if (scorePercent >= 50) {
        evaluation = `<p>${currentStudent}，你的表现尚可，得分率为${scorePercent}%。你对部分艾滋病相关知识有所了解，但存在一些关键知识点的理解不足。</p>`;
    } else {
        evaluation = `<p>${currentStudent}，你的得分率为${scorePercent}%，显示你对艾滋病知识的掌握还有较大提升空间。请不要气馁，通过持续学习，你会取得进步的。</p>`;
    }
    
    // 分析弱项
    const weakAreas = [];
    const areaStats = {};
    
    // 统计各知识领域的答题情况
    userAnswers.forEach((answer, index) => {
        const area = getQuestionKnowledgeArea(index);
        if (!areaStats[area]) {
            areaStats[area] = {
                correct: 0,
                total: 0
            };
        }
        areaStats[area].total++;
        if (answer.isCorrect) {
            areaStats[area].correct++;
        }
    });
    
    // 找出掌握较弱的知识领域
    Object.keys(areaStats).forEach(area => {
        if (areaStats[area].total > 0) {
            const percent = (areaStats[area].correct / areaStats[area].total) * 100;
            if (percent < 60) {
                weakAreas.push(area);
            }
        }
    });
    
    // 生成针对弱项的建议
    if (weakAreas.length > 0) {
        suggestions += `<p>建议加强对以下知识领域的学习：</p><ul>`;
        
        weakAreas.forEach(area => {
            switch(area) {
                case "基础知识":
                    suggestions += `<li><strong>基础知识</strong>：建议了解HIV病毒的基本特性、艾滋病的定义和全球流行情况。</li>`;
                    break;
                case "传播途径":
                    suggestions += `<li><strong>传播途径</strong>：重点理解HIV的主要传播方式（性传播、血液传播和母婴传播）以及不会传播的方式。</li>`;
                    break;
                case "预防措施":
                    suggestions += `<li><strong>预防措施</strong>：学习安全性行为、PrEP和PEP等预防手段的正确使用方法。</li>`;
                    break;
                case "治疗和管理":
                    suggestions += `<li><strong>治疗和管理</strong>：了解抗病毒治疗的重要性、依从性以及治疗的最新进展。</li>`;
                    break;
                case "社会支持与检测":
                    suggestions += `<li><strong>社会支持与检测</strong>：掌握检测渠道、窗口期概念以及社会支持资源的获取方式。</li>`;
                    break;
            }
        });
        
        suggestions += `</ul>`;
    } else {
        suggestions = `<p>你在各个知识领域的表现都较为平衡，建议继续保持学习热情，深入了解艾滋病防治的最新进展。</p>`;
    }
    
    // 生成总结性建议
    let finalAdvice = '';
    if (scorePercent >= 70) {
        finalAdvice = `<p>希望你能将所学知识应用到实际生活中，并向身边的人传播正确的艾滋病防治知识，共同消除对艾滋病的误解和歧视。</p>`;
    } else {
        finalAdvice = `<p>通过本次测试，希望你能重视艾滋病相关知识的学习，这不仅关系到个人健康，也是社会责任的体现。期待你在后续的学习中取得更大进步！</p>`;
    }
    
    // 组合所有评价和建议
    performanceTextElement.innerHTML = `
        <h3>个性化评价</h3>
        ${evaluation}
        <h3>学习建议</h3>
        ${suggestions}
        ${finalAdvice}
    `;
}

// 显示班级统计结果
function showClassResults() {
    // 重新计算班级数据，确保是最新的
    recalculateClassData();
    
    // 显示班级结果界面
    showScreen(classResultsScreen);
    
    // 重置滚动位置到顶部，避免显示图表时自动下滑
    window.scrollTo(0, 0);
    classResultsScreen.scrollTo(0, 0);
    
    // 检查是否有班级数据
    const hasData = classData.completedStudents > 0;
    
    // 获取图表部分和摘要部分
    const chartsSection = document.getElementById('charts-section');
    const summarySection = document.getElementById('summary-section');
    
    if (!hasData) {
        // 如果没有数据，显示提示信息
        const noDataMessage = `
            <div class="class-charts-container">
                <div style="text-align: center; padding: 50px; background: #f9f9f9; border-radius: 10px; margin: 20px;">
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;">暂无班级数据</h3>
                    <p>目前还没有学生完成测试，请等待学生完成测试后再查看班级分析报告。</p>
                    <p>您可以先进行一次测试，以便了解测试内容。</p>
                </div>
            </div>
        `;
        
        chartsSection.innerHTML = noDataMessage;
        summarySection.innerHTML = noDataMessage;
    } else {
        // 生成班级分数统计图表
        generateClassScoreChart();
        
        // 生成题目难度与答对率分析图表
        generateQuestionAccuracyChart();
        
        // 生成知识领域掌握程度雷达图
        generateKnowledgeAreaChart();
        
        // 生成班级总结报告
        generateClassSummary();
    }
    
    // 显示图表部分
    chartsSection.classList.add('active');
    summarySection.classList.remove('active');
    
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.section === 'charts') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 生成班级分数分布图表
function generateClassScoreChart() {
    const ctx = document.getElementById('class-score-chart').getContext('2d');
    
    // 计算分数分布
    const scoreDistribution = [0, 0, 0, 0, 0]; // 0-2分, 3-4分, 5-6分, 7-8分, 9-10分
    
    Object.values(classData.studentScores).forEach(score => {
        if (score <= 2) scoreDistribution[0]++;
        else if (score <= 4) scoreDistribution[1]++;
        else if (score <= 6) scoreDistribution[2]++;
        else if (score <= 8) scoreDistribution[3]++;
        else scoreDistribution[4]++;
    });
    
    // 创建柱状图
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-2分', '3-4分', '5-6分', '7-8分', '9-10分'],
            datasets: [{
                label: '学生人数',
                data: scoreDistribution,
                backgroundColor: [
                    '#f44336',
                    '#ff9800',
                    '#ffeb3b',
                    '#8bc34a',
                    '#4caf50'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 14
                        }
                    },
                    title: {
                        display: true,
                        text: '学生人数',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 14
                        }
                    },
                    title: {
                        display: true,
                        text: '分数区间',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 16
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 15
                    },
                    padding: 15
                }
            }
        }
    });
    
    // 强制调整Canvas高度
    setTimeout(() => {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            container.style.height = '500px';
        });
    }, 100);
}

// 生成题目答对率图表
function generateQuestionAccuracyChart() {
    const ctx = document.getElementById('question-accuracy-chart').getContext('2d');
    
    // 计算每个题目的答对率
    const accuracyData = [];
    const questionLabels = [];
    
    for (let i = 0; i < questions.length; i++) {
        const stats = classData.questionStats[i];
        const total = stats.correct + stats.incorrect;
        if (total > 0) {
            const accuracy = (stats.correct / total) * 100;
            accuracyData.push(accuracy);
            questionLabels.push(`第${i + 1}题`);
        } else {
            // 如果没有人回答，默认为0
            accuracyData.push(0);
            questionLabels.push(`第${i + 1}题`);
        }
    }
    
    // 创建柱状图
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: questionLabels,
            datasets: [{
                label: '答对率(%)',
                data: accuracyData,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const questionIndex = context.dataIndex;
                            const stats = classData.questionStats[questionIndex];
                            const total = stats.correct + stats.incorrect;
                            return [
                                `答对率: ${context.raw.toFixed(1)}%`,
                                `答对人数: ${stats.correct}/${total}人`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// 生成知识领域掌握情况图表
function generateKnowledgeAreaChart() {
    const ctx = document.getElementById('knowledge-area-chart').getContext('2d');
    
    // 计算每个知识领域的掌握情况
    const areaLabels = [];
    const areaData = [];
    
    Object.keys(classData.knowledgeAreaStats).forEach(area => {
        const stats = classData.knowledgeAreaStats[area];
        const total = stats.correct + stats.incorrect;
        if (total > 0) {
            const accuracy = (stats.correct / total) * 100;
            areaLabels.push(area);
            areaData.push(accuracy);
        } else {
            // 如果没有数据，默认为0
            areaLabels.push(area);
            areaData.push(0);
        }
    });
    
    // 创建雷达图
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: areaLabels,
            datasets: [{
                label: '掌握程度(%)',
                data: areaData,
                backgroundColor: 'rgba(153, 102, 255, 0.4)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        font: {
                            size: 12
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333',
                        padding: 10
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.2)',
                        lineWidth: 1
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.15)',
                        lineWidth: 1
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const areaIndex = context.dataIndex;
                            const area = areaLabels[areaIndex];
                            const stats = classData.knowledgeAreaStats[area];
                            const total = stats.correct + stats.incorrect;
                            return [
                                `掌握程度: ${context.raw.toFixed(1)}%`,
                                `答对题目: ${stats.correct}/${total}题`
                            ];
                        }
                    },
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 10
                }
            }
        }
    });
}

// 生成班级总结报告
function generateClassSummary() {
    const classSummaryElement = document.getElementById('class-summary');
    
    // 获取班级统计数据
    const studentCount = classData.completedStudents;
    const scores = Object.values(classData.studentScores);
    const averageScore = scores.length > 0 ? 
        (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : 0;
    
    // 计算分数分布
    const scoreDistribution = {
        excellent: scores.filter(score => score >= 9).length,
        good: scores.filter(score => score >= 7 && score < 9).length,
        average: scores.filter(score => score >= 5 && score < 7).length,
        needImprovement: scores.filter(score => score < 5).length
    };
    
    // 计算各分数段百分比
    const excellentPercent = Math.round((scoreDistribution.excellent / studentCount) * 100) || 0;
    const goodPercent = Math.round((scoreDistribution.good / studentCount) * 100) || 0;
    const averagePercent = Math.round((scoreDistribution.average / studentCount) * 100) || 0;
    const needImprovementPercent = Math.round((scoreDistribution.needImprovement / studentCount) * 100) || 0;
    
    // 计算各知识领域的掌握情况
    const areaStats = {};
    
    Object.keys(classData.knowledgeAreaStats).forEach(area => {
        const stats = classData.knowledgeAreaStats[area];
        if (stats.total > 0) {
            areaStats[area] = Math.round((stats.correct / stats.total) * 100);
        } else {
            areaStats[area] = 0;
        }
    });
    
    // 找出最强和最弱的知识领域
    let strongestArea = '';
    let weakestArea = '';
    let highestPercent = -1;
    let lowestPercent = 101;
    
    Object.keys(areaStats).forEach(area => {
        if (areaStats[area] > highestPercent) {
            highestPercent = areaStats[area];
            strongestArea = area;
        }
        if (areaStats[area] < lowestPercent) {
            lowestPercent = areaStats[area];
            weakestArea = area;
        }
    });
    
    // 找出最难和最简单的题目
    let hardestQuestion = -1;
    let easiestQuestion = -1;
    let lowestCorrectRate = 101;
    let highestCorrectRate = -1;
    
    Object.keys(classData.questionStats).forEach(questionIndex => {
        const stats = classData.questionStats[questionIndex];
        if (stats.total > 0) {
            const correctRate = (stats.correct / stats.total) * 100;
            if (correctRate < lowestCorrectRate) {
                lowestCorrectRate = correctRate;
                hardestQuestion = parseInt(questionIndex);
            }
            if (correctRate > highestCorrectRate) {
                highestCorrectRate = correctRate;
                easiestQuestion = parseInt(questionIndex);
            }
        }
    });
    
    // 生成总体表现描述
    let overallPerformance = '';
    if (averageScore >= 8) {
        overallPerformance = "整体表现出色，班级对艾滋病知识有很好的掌握。";
    } else if (averageScore >= 6) {
        overallPerformance = "整体表现良好，班级对艾滋病的主要知识点有基本了解。";
    } else {
        overallPerformance = "整体表现有待提高，班级对艾滋病知识的掌握存在明显不足。";
    }
    
    // 生成详细分析
    const detailedAnalysis = `
        <p>班级平均得分为${averageScore}分（满分10分），${overallPerformance}</p>
        
        <h3>分数分布分析</h3>
        <ul>
            <li>优秀（9-10分）：${scoreDistribution.excellent}人，占比${excellentPercent}%</li>
            <li>良好（7-8分）：${scoreDistribution.good}人，占比${goodPercent}%</li>
            <li>一般（5-6分）：${scoreDistribution.average}人，占比${averagePercent}%</li>
            <li>需提高（0-4分）：${scoreDistribution.needImprovement}人，占比${needImprovementPercent}%</li>
        </ul>
        
        <h3>知识领域掌握情况</h3>
        <ul>
            ${Object.keys(areaStats).map(area => 
                `<li>${area}：掌握率${areaStats[area]}%</li>`
            ).join('')}
        </ul>
        <p>班级在<strong>${strongestArea}</strong>领域掌握最好（${highestPercent}%），在<strong>${weakestArea}</strong>领域掌握较弱（${lowestPercent}%）。</p>
        
        <h3>题目难度分析</h3>
        <p>最容易的题目：第${easiestQuestion + 1}题，正确率${Math.round(highestCorrectRate)}%</p>
        <p>最困难的题目：第${hardestQuestion + 1}题，正确率${Math.round(lowestCorrectRate)}%</p>
    `;
    
    // 生成教学建议
    let teachingRecommendations = `<h3>教学建议</h3><ul>`;
    
    // 知识领域建议
    if (weakestArea) {
        teachingRecommendations += `<li>加强<strong>${weakestArea}</strong>相关内容的教学，可以通过案例分析、小组讨论等方式深化理解。</li>`;
    }
    
    // 根据分数分布提供建议
    if (needImprovementPercent > 30) {
        teachingRecommendations += `<li>班级中有较多学生对艾滋病知识掌握不足，建议进行基础知识讲解，并提供更多实用资源。</li>`;
    }

    if (hardestQuestion >= 0) {
        const hardestQuestionType = getQuestionCategory(hardestQuestion);
        teachingRecommendations += `<li>针对第${hardestQuestion + 1}题（${hardestQuestionType}）相关内容进行重点讲解和讨论。</li>`;
    }
    
    // 针对不同分数段学生的分层教学建议
    if (excellentPercent > 0 && needImprovementPercent > 0) {
        teachingRecommendations += `<li>采用分层教学策略，让掌握较好的学生带动其他同学，可组织小组讨论和互助学习。</li>`;
    }
    
    // 互动教学建议
    teachingRecommendations += `<li>增加互动性教学环节，如角色扮演、情境模拟等，帮助学生理解艾滋病预防和关怀的实际应用。</li>`;
    
    // 资源推荐
    teachingRecommendations += `<li>推荐优质的艾滋病科普资源，如中国疾控中心防艾宣传材料、世界卫生组织指南等。</li>`;
    
    teachingRecommendations += `</ul>`;
    
    // 总结语
    const conclusion = `
        <h3>总结</h3>
        <p>通过本次测试，可以看出班级对艾滋病知识的整体掌握情况，为后续教学提供了参考依据。建议在教学中关注学生的薄弱环节，采用多样化的教学方法，帮助学生全面理解艾滋病防治知识，提高健康素养。</p>
    `;
    
    // 组合所有内容
    classSummaryElement.innerHTML = `
        <h2>班级总结报告</h2>
        <p>参与测试人数：${studentCount}人</p>
        ${detailedAnalysis}
        ${teachingRecommendations}
        ${conclusion}
    `;
}

// 重新开始测试
function restartQuiz() {
    // 重置学生选择
    currentStudent = null;
    document.querySelectorAll('.student-item').forEach(item => {
        item.classList.remove('selected');
    });
    startBtn.disabled = true;
    
    // 返回欢迎界面
    showScreen(welcomeScreen);
    
    // 显示测试介绍部分
    quizIntro.classList.add('active');
    reportsManagement.classList.remove('active');
    deleteMode.classList.remove('active');
}

// 重置班级数据显示
function resetClassDataDisplay() {
    // 重新初始化班级数据
    classData = {
        totalStudents: students.length,
        completedStudents: 0,
        studentScores: {},
        questionStats: {},
        knowledgeAreaStats: {}
    };
    
    // 重新初始化统计数据
    initQuestionStats();
    initKnowledgeAreaStats();
    
    // 加载所有保存的学生报告数据到班级统计
    loadAllReportsToClassData();
}

// 加载所有报告到班级数据
function loadAllReportsToClassData() {
    // 遍历所有保存的学生报告
    for (const student in studentReports) {
        // 对每个学生，取最新的一次报告
        const timestamps = Object.keys(studentReports[student]);
        if (timestamps.length > 0) {
            // 按时间戳排序，取最新的
            const latestTimestamp = timestamps.sort((a, b) => parseInt(b) - parseInt(a))[0];
            const latestReport = studentReports[student][latestTimestamp];
            
            // 添加到班级统计
            addStudentDataToClass(student, latestReport.score, latestReport.answers);
        }
    }
}

// 添加学生得分到班级数据
function addStudentDataToClass(studentName, score, answers) {
    // 如果学生已经在统计中，先移除之前的数据
    if (classData.studentScores[studentName] !== undefined) {
        classData.completedStudents--;
        
        // 从问题统计中移除之前的数据
        answers.forEach((answer, index) => {
            if (index < Object.keys(classData.questionStats).length) {
                classData.questionStats[index].total--;
                if (answer.isCorrect) {
                    classData.questionStats[index].correct--;
                }
                
                // 从知识领域统计中移除之前的数据
                const area = getQuestionKnowledgeArea(index);
                if (classData.knowledgeAreaStats[area]) {
                    classData.knowledgeAreaStats[area].total--;
                    if (answer.isCorrect) {
                        classData.knowledgeAreaStats[area].correct--;
                    }
                }
            }
        });
    }
    
    // 添加新的数据
    classData.studentScores[studentName] = score;
    classData.completedStudents++;
    
    // 更新题目统计
    answers.forEach((answer, index) => {
        if (index < Object.keys(classData.questionStats).length) {
            classData.questionStats[index].total++;
            if (answer.isCorrect) {
                classData.questionStats[index].correct++;
            }
            
            // 更新知识领域统计
            const area = getQuestionKnowledgeArea(index);
            if (classData.knowledgeAreaStats[area]) {
                classData.knowledgeAreaStats[area].total++;
                if (answer.isCorrect) {
                    classData.knowledgeAreaStats[area].correct++;
                }
            }
        }
    });
}

// 对于测试目的，添加一些随机数据
function addTestData() {
    if (classData.completedStudents < 5) {
        generateRandomClassData();
    }
}

// 处理报告导航
function handleReportNavigation(event) {
    // 移除所有导航按钮的活动状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 为当前点击的按钮添加活动状态
    event.target.classList.add('active');
    
    // 获取目标部分
    const targetSection = event.target.dataset.section;
    
    // 隐藏所有部分
    document.querySelectorAll('.report-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示目标部分
    document.getElementById(`${targetSection}-section`).classList.add('active');
    
    // 重置滚动位置，避免视图跳动
    classResultsScreen.scrollTo(0, 0);
}

// 返回个人分析报告
function backToPersonalReport() {
    showScreen(resultsScreen);
    
    // 重置滚动位置到顶部，避免显示图表时自动下滑
    window.scrollTo(0, 0);
    resultsScreen.scrollTo(0, 0);
}

// 切换显示屏幕
function showScreen(screen) {
    // 隐藏所有屏幕
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    
    // 显示指定屏幕
    screen.classList.add('active');
}

// 初始化应用程序
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM完全加载，开始初始化...');
    
    // 初始化Cookie通知
    initCookieNotice();
    
    // 初始化政策页面
    initPolicyPages();
    
    // 初始化应用
    init();
    
    // 确保GitHub按钮被添加
    setTimeout(function() {
        addGitHubButton();
    }, 500);
    
    // 隐藏班级报告按钮，直到有数据
    showClassBtn.style.display = 'none';
});

// Cookie政策相关功能
function initCookieNotice() {
    const cookieNotice = document.getElementById('cookie-notice');
    const acceptAllBtn = document.getElementById('accept-all-cookies');
    const acceptSelectedBtn = document.getElementById('accept-selected-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    const policyLink = document.getElementById('cookies-policy-link');
    const policyLinkFooter = document.getElementById('cookies-policy-link-footer');
    const privacyLink = document.getElementById('privacy-policy-link');
    const termsLink = document.getElementById('terms-link');
    
    const functionalCheckbox = document.getElementById('functional-cookies');
    const analyticsCheckbox = document.getElementById('analytics-cookies');
    
    // 每次访问都显示Cookie通知，确保用户明确同意或拒绝
    setTimeout(() => {
        cookieNotice.classList.add('active');
    }, 500);
    
    // 点击全部同意按钮
    acceptAllBtn.addEventListener('click', () => {
        saveCookiePreferences(true, true);
        cookieNotice.classList.remove('active');
    });
    
    // 点击仅同意所选按钮
    acceptSelectedBtn.addEventListener('click', () => {
        saveCookiePreferences(
            functionalCheckbox.checked,
            analyticsCheckbox.checked
        );
        cookieNotice.classList.remove('active');
    });
    
    // 点击拒绝非必要Cookies
    rejectBtn.addEventListener('click', () => {
        saveCookiePreferences(false, false);
        functionalCheckbox.checked = false;
        analyticsCheckbox.checked = false;
        cookieNotice.classList.remove('active');
    });
    
    // 点击了解更多链接
    policyLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('cookies-policy-page').classList.add('active');
    });
    
    // 点击底部Cookies政策链接
    policyLinkFooter.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('cookies-policy-page').classList.add('active');
    });
    
    // 点击隐私政策链接
    privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('privacy-policy-page').classList.add('active');
    });
    
    // 点击使用条款链接
    termsLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('terms-page').classList.add('active');
    });
}

// 保存Cookie首选项
function saveCookiePreferences(functional, analytics) {
    const preferences = {
        essential: true, // 必要Cookie始终启用
        functional: functional,
        analytics: analytics,
        timestamp: Date.now() // 添加时间戳以跟踪上次保存时间
    };
    
    try {
        // 先移除之前的值，再设置新值
        localStorage.removeItem('cookiePreferences');
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        console.log('Cookie首选项已成功保存:', preferences);
        
        // 根据用户选择启用或禁用相应功能
        if (!functional) {
            // 禁用功能性Cookie相关功能
            console.log('功能性Cookie已禁用');
        }
        
        if (!analytics) {
            // 禁用分析Cookie相关功能
            console.log('分析Cookie已禁用');
        }
    } catch (error) {
        console.error('保存Cookie首选项时出错:', error);
        alert('无法保存您的Cookie首选项，可能是浏览器存储空间已满或隐私浏览模式下。');
    }
}

// 初始化政策页面
function initPolicyPages() {
    // 获取所有政策页面
    const policyPages = document.querySelectorAll('.policy-page');
    
    // 为每个政策页面添加关闭按钮事件
    policyPages.forEach(page => {
        const closeBtn = page.querySelector('.close-policy');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                page.classList.remove('active');
            });
        }
        
        // 点击背景关闭
        page.addEventListener('click', (e) => {
            if (e.target === page) {
                page.classList.remove('active');
            }
        });
    });
    
    // 添加键盘ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            policyPages.forEach(page => {
                if (page.classList.contains('active')) {
                    page.classList.remove('active');
                }
            });
        }
    });
}

// 背景切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取背景按钮元素
    const ribbonBtn = document.getElementById('bg-ribbon-btn');
    const medicalBtn = document.getElementById('bg-medical-btn');
    const geometricBtn = document.getElementById('bg-geometric-btn');
    
    // 获取body元素
    const body = document.body;
    
    // 从localStorage加载保存的背景设置
    const savedBg = localStorage.getItem('preferred-background');
    if (savedBg) {
        body.className = savedBg;
        
        // 更新按钮状态
        ribbonBtn.classList.remove('active');
        medicalBtn.classList.remove('active');
        geometricBtn.classList.remove('active');
        
        if (savedBg === 'bg-ribbon') {
            ribbonBtn.classList.add('active');
        } else if (savedBg === 'bg-medical') {
            medicalBtn.classList.add('active');
        } else if (savedBg === 'bg-geometric') {
            geometricBtn.classList.add('active');
        }
    }
    
    // 添加点击事件
    ribbonBtn.addEventListener('click', function() {
        body.className = 'bg-ribbon';
        localStorage.setItem('preferred-background', 'bg-ribbon');
        updateActiveButton(ribbonBtn);
    });
    
    medicalBtn.addEventListener('click', function() {
        body.className = 'bg-medical';
        localStorage.setItem('preferred-background', 'bg-medical');
        updateActiveButton(medicalBtn);
    });
    
    geometricBtn.addEventListener('click', function() {
        body.className = 'bg-geometric';
        localStorage.setItem('preferred-background', 'bg-geometric');
        updateActiveButton(geometricBtn);
    });
    
    // 更新活动按钮状态
    function updateActiveButton(activeBtn) {
        ribbonBtn.classList.remove('active');
        medicalBtn.classList.remove('active');
        geometricBtn.classList.remove('active');
        activeBtn.classList.add('active');
    }
});

// 添加GitHub按钮到导航栏
function addGitHubButton() {
    console.log('尝试添加GitHub按钮...');
    
    // 首先检查是否已存在GitHub按钮
    const existingButton = document.getElementById('save-to-github-btn');
    if (existingButton) {
        console.log('找到现有GitHub按钮，添加点击事件');
        // 确保现有按钮有点击事件
        existingButton.onclick = function() {
            showGitHubTokenDialog();
            return false;
        };
        return; // 已找到按钮并添加事件，结束函数
    }
    
    // 如果不存在按钮，才尝试添加
    const welcomeButtons = document.querySelector('.welcome-buttons');
    if (welcomeButtons) {
        console.log('创建GitHub按钮...');
        
        // 使用GitHub官方的猫头图标（Octocat）SVG
        const buttonHTML = `
            <button id="save-to-github-btn" class="github-btn">
                <svg class="github-octocat" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                GitHub数据同步
            </button>
        `;
        
        // 直接添加到DOM
        if (welcomeButtons.firstChild) {
            welcomeButtons.insertBefore(document.createRange().createContextualFragment(buttonHTML), welcomeButtons.firstChild);
        } else {
            welcomeButtons.innerHTML = buttonHTML + welcomeButtons.innerHTML;
        }
        
        console.log('GitHub按钮已插入DOM');
        
        // 获取添加后的按钮元素
        const button = document.getElementById('save-to-github-btn');
        
        // 添加点击事件
        if (button) {
            button.onclick = function() {
                showGitHubTokenDialog();
                return false;
            };
            console.log('GitHub数据同步按钮已完成设置');
        } else {
            console.error('无法找到添加的GitHub按钮元素');
        }
    } else {
        console.warn('未找到.welcome-buttons元素，1秒后重试');
        setTimeout(addGitHubButton, 1000);
    }
}

// 用于测试GitHub数据同步的函数
function testGitHubSync() {
    console.log('开始测试GitHub数据同步功能');
    
    // 检查是否有保存的令牌
    const savedToken = localStorage.getItem('githubToken');
    const savedUsername = localStorage.getItem('githubUsername');
    const savedRepo = localStorage.getItem('githubRepo');
    const savedBranch = localStorage.getItem('githubBranch');
    
    console.log('已保存的GitHub配置:', { 
        token: savedToken ? '已存在' : '未保存', 
        username: savedUsername || '未保存', 
        repo: savedRepo || '未保存', 
        branch: savedBranch || '未保存' 
    });
    
    if (savedToken && savedUsername && savedRepo) {
        // 设置全局变量
        githubToken = savedToken;
        githubUsername = savedUsername;
        githubRepo = savedRepo;
        githubBranch = savedBranch || 'main';
        
        console.log('使用保存的令牌进行测试');
        saveStudentReportsToGitHub();
    } else {
        console.log('没有保存的令牌，显示对话框');
        showGitHubTokenDialog();
    }
}

// 添加到window对象以便在控制台调用
window.testGitHubSync = testGitHubSync;

// 确保页面加载完成后立即执行
document.addEventListener('DOMContentLoaded', function() {
    // 立即初始化GitHub按钮
    initGitHubButton();
    
    // 添加测试按钮到页面，方便调试
    if (window.location.href.includes('debug=1') || localStorage.getItem('debug_mode')) {
        // 创建调试按钮
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '测试GitHub同步';
        debugBtn.style.position = 'fixed';
        debugBtn.style.bottom = '10px';
        debugBtn.style.right = '10px';
        debugBtn.style.zIndex = '9999';
        debugBtn.style.backgroundColor = '#ff5722';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '4px';
        debugBtn.style.padding = '8px 16px';
        debugBtn.style.cursor = 'pointer';
        
        // 添加点击事件
        debugBtn.onclick = function() {
            testGitHubSync();
        };
        
        // 添加到页面
        document.body.appendChild(debugBtn);
        console.log('已添加GitHub同步测试按钮');
    }
});

// 初始化GitHub按钮
function initGitHubButton() {
    console.log('初始化GitHub按钮...');
    
    // 尝试添加按钮
    addGitHubButton();
    
    // 直接为现有按钮添加点击事件
    const existingButton = document.getElementById('save-to-github-btn');
    if (existingButton) {
        console.log('为GitHub按钮添加点击事件');
        
        // 移除任何现有的事件监听器
        const newButton = existingButton.cloneNode(true);
        existingButton.parentNode.replaceChild(newButton, existingButton);
        
        // 添加新的事件监听器
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('GitHub按钮被点击');
            showGitHubTokenDialog();
        });
    } else {
        console.log('未找到GitHub按钮，1秒后重试');
        setTimeout(initGitHubButton, 1000);
    }
}