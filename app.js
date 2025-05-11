// 全局变量
let currentStudent = null;
let currentQuestion = 0;
let userAnswers = [];
let score = 0;
let studentReports = {}; // 存储学生报告的对象

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
    // 从本地存储加载学生报告数据
    loadStudentReports();
    
    // 从本地存储加载班级数据
    loadClassData();
    
    // 重新计算班级数据，确保数据与报告一致
    recalculateClassData();
    
    // 加载学生名单到选择网格
    populateStudentSelect();
    
    // 更新报告列表
    updateReportsList();
    
    // 事件监听器 - 欢迎页面
    takeQuizBtn.addEventListener('click', showQuizIntro);
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
}

// 从本地存储加载学生报告数据
function loadStudentReports() {
    const savedReports = localStorage.getItem('studentReports');
    if (savedReports) {
        studentReports = JSON.parse(savedReports);
    }
}

// 保存学生报告数据到本地存储
function saveStudentReports() {
    localStorage.setItem('studentReports', JSON.stringify(studentReports));
}

// 从本地存储加载班级数据
function loadClassData() {
    const savedClassData = localStorage.getItem('classData');
    if (savedClassData) {
        try {
            // 加载保存的班级数据
            const parsedData = JSON.parse(savedClassData);
            
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
            
            // 这里不再直接使用保存的数据，而在init函数中通过recalculateClassData重新计算
            // 这确保了班级数据始终基于当前的学生报告计算得出
        } catch (error) {
            console.error('解析班级数据时出错:', error);
            
            // 初始化班级数据
            classData = {
                totalStudents: students.length,
                completedStudents: 0,
                studentScores: {},
                questionStats: {},
                knowledgeAreaStats: {}
            };
            
            initQuestionStats();
            initKnowledgeAreaStats();
        }
    } else {
        // 初始化班级数据
        classData = {
            totalStudents: students.length,
            completedStudents: 0,
            studentScores: {},
            questionStats: {},
            knowledgeAreaStats: {}
        };
        
        initQuestionStats();
        initKnowledgeAreaStats();
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

// 从报告数据更新班级统计信息
function updateClassDataFromReport(studentName, reportData) {
    // 检查学生是否已经被计算过
    const isNewStudent = !(studentName in classData.studentScores);
    
    // 更新学生分数
    classData.studentScores[studentName] = reportData.score;
    
    // 如果是新学生，增加完成测试的学生数量
    if (isNewStudent) {
        classData.completedStudents++;
    }
    
    // 更新题目统计和知识领域统计
    reportData.answers.forEach((answer, index) => {
        // 如果题目统计不存在，初始化它
        if (!classData.questionStats[index]) {
            classData.questionStats[index] = {
                correct: 0,
                total: 0
            };
        }
        
        // 更新题目统计数据
        classData.questionStats[index].total++;
        if (answer.isCorrect) {
            classData.questionStats[index].correct++;
        }
        
        // 获取知识领域
        const area = getQuestionKnowledgeArea(index);
        
        // 如果知识领域统计不存在，初始化它
        if (!classData.knowledgeAreaStats[area]) {
            classData.knowledgeAreaStats[area] = {
                correct: 0,
                total: 0
            };
        }
        
        // 更新知识领域统计数据
        classData.knowledgeAreaStats[area].total++;
        if (answer.isCorrect) {
            classData.knowledgeAreaStats[area].correct++;
        }
    });
    
    // 保存更新后的班级数据到本地存储
    localStorage.setItem('classData', JSON.stringify(classData));
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
        
        // 保存更改
        saveStudentReports();
        
        // 重新计算班级数据
        recalculateClassData();
        
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

// 显示测试介绍部分
function showQuizIntro() {
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
    
    // 保存到本地存储
    saveStudentReports();
    
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
        if (stats.total > 0) {
            const accuracy = (stats.correct / stats.total) * 100;
            accuracyData.push(accuracy);
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
        if (stats.total > 0) {
            const accuracy = (stats.correct / stats.total) * 100;
            areaLabels.push(area);
            areaData.push(accuracy);
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
window.addEventListener('load', () => {
    // 初始化Cookie通知
    initCookieNotice();
    
    // 初始化政策页面
    initPolicyPages();
    
    // 初始化应用
    init();
    
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

// 优化滚动性能
(function() {
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // 优化监听滚动事件
    const optimizedScroll = debounce(function() {
        // 这里可以添加滚动时执行的操作
        // 例如懒加载图片或动态加载内容
    }, 20);

    // 使用被动事件监听器来提高滚动性能
    window.addEventListener('scroll', optimizedScroll, { passive: true });

    // 减少重排和重绘的频率
    function smoothScroll() {
        // 在滚动时减少动画效果
        document.body.classList.add('is-scrolling');
        
        // 滚动结束后恢复动画
        const scrollTimer = debounce(function() {
            document.body.classList.remove('is-scrolling');
        }, 150);
        
        window.addEventListener('scroll', scrollTimer, { passive: true });
    }

    // 延迟加载非关键资源
    function deferNonCriticalAssets() {
        // 找到所有具有data-src属性的图像（如果有的话）
        const deferredImages = document.querySelectorAll('img[data-src]');
        if (deferredImages.length > 0) {
            // 使用Intersection Observer延迟加载图像
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            });
            
            deferredImages.forEach(image => imageObserver.observe(image));
        }
    }

    // 页面加载完成后初始化优化
    window.addEventListener('load', function() {
        smoothScroll();
        deferNonCriticalAssets();
        
        // 如果存在过多动画影响性能，可以选择性禁用部分动画
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    });
})(); 