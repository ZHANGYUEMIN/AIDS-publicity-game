// 学生名单
const students = [
    '蔡明朗',
    '曾思琪',
    '陈斌',
    '陈健彬',
    '陈栩康',
    '邓佩琪',
    '樊骏烨',
    '何建恒',
    '黄奥蓥',
    '黄汉超',
    '黄小芸',
    '黄永杭',
    '邝皓彬',
    '邝艺胜',
    '邝志启',
    '黎信鸿',
    '李斌',
    '李浩文',
    '李伟畅',
    '梁伟雄',
    '刘炜槟',
    '刘志炜',
    '吕迦瀚',
    '莫秉坤',
    '农鑫浩',
    '欧鸿鑫',
    '翁晖栩',
    '吴祉乐',
    '萧枥恒',
    '谢宝颖',
    '谢梓健',
    '许跃腾',
    '杨浩宏',
    '殷昊',
    '虞鑫荣',
    '张伊晨',
    '赵俊轩',
    '朱俊诚'
];

// 班级数据存储
let classData = {
    totalStudents: students.length,
    completedStudents: 0,
    studentScores: {},  // 存储每个学生的得分
    questionStats: {},  // 存储每个题目的答对率
    knowledgeAreaStats: {}  // 存储每个知识领域的掌握情况
};

// 初始化每个题目的统计数据
function initQuestionStats() {
    questions.forEach((q, index) => {
        classData.questionStats[index] = {
            correct: 0,
            total: 0
        };
    });
}

// 初始化每个知识领域的统计数据
function initKnowledgeAreaStats() {
    const areas = [
        "基础知识",
        "传播途径",
        "预防措施",
        "治疗和管理",
        "社会支持与检测"
    ];
    
    areas.forEach(area => {
        classData.knowledgeAreaStats[area] = {
            correct: 0,
            total: 0
        };
    });
}

// 添加学生得分到班级数据
function addStudentDataToClass(studentName, score, answers) {
    classData.studentScores[studentName] = score;
    classData.completedStudents++;
    
    // 更新题目统计
    answers.forEach((answer, index) => {
        classData.questionStats[index].total++;
        if (answer.isCorrect) {
            classData.questionStats[index].correct++;
        }
        
        // 更新知识领域统计
        const area = getQuestionKnowledgeArea(index);
        classData.knowledgeAreaStats[area].total++;
        if (answer.isCorrect) {
            classData.knowledgeAreaStats[area].correct++;
        }
    });
}

// 获取题目对应的知识领域
function getQuestionKnowledgeArea(questionIndex) {
    // 根据题目索引划分知识领域
    const areaMapping = {
        0: "基础知识",
        1: "传播途径",
        2: "传播途径",
        3: "预防措施",
        4: "预防措施",
        5: "基础知识",
        6: "治疗和管理",
        7: "社会支持与检测",
        8: "治疗和管理",
        9: "社会支持与检测"
    };
    
    return areaMapping[questionIndex];
}

// 模拟生成随机班级数据（用于测试）
function generateRandomClassData() {
    students.forEach(student => {
        if (!(student in classData.studentScores)) {
            const randomScore = Math.floor(Math.random() * 11);
            const mockAnswers = [];
            
            for (let i = 0; i < 10; i++) {
                const isCorrect = Math.random() > 0.5;
                mockAnswers.push({
                    isCorrect: isCorrect,
                    selectedOptions: isCorrect ? questions[i].correctAnswer : ["X"]
                });
            }
            
            addStudentDataToClass(student, randomScore, mockAnswers);
        }
    });
}

// 初始化学生下拉选择框
function populateStudentSelect() {
    const studentSelect = document.getElementById('student-select');
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student;
        option.textContent = student;
        studentSelect.appendChild(option);
    });
}

// 初始化统计数据
initQuestionStats();
initKnowledgeAreaStats(); 