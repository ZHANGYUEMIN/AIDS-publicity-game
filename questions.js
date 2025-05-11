// 艾滋病知识题库
const questions = [
    {
        question: "艾滋病毒的学名是？",
        options: [
            "人类免疫缺陷病毒（Human Immunodeficiency Virus），缩写为HIV",
            "性免疫缺陷综合征（AIDS）",
            "苍白密螺旋体（Treponema pallidum）",
            "不知道"
        ],
        type: "single",
        correctAnswer: [0],
        explanation: "艾滋病毒的学名是人类免疫缺陷病毒（Human Immunodeficiency Virus），缩写为HIV，是导致艾滋病（AIDS）的病原体。"
    },
    {
        question: "目前我国艾滋病感染最主要的方式是？",
        options: [
            "血液传播",
            "性传播",
            "母婴传播",
            "不知道"
        ],
        type: "single",
        correctAnswer: [1],
        explanation: "目前我国艾滋病感染的最主要方式是性传播，占新发感染者的绝大多数。"
    },
    {
        question: "在公共场所共用马桶、餐具、浴巾等物品，不会感染艾滋病。",
        options: [
            "正确",
            "错误",
            "不知道"
        ],
        type: "single",
        correctAnswer: [0],
        explanation: "艾滋病毒主要通过血液、性接触和母婴三种途径传播，在公共场所共用马桶、餐具、浴巾等物品不会感染艾滋病。"
    },
    {
        question: "目前可以通过服用特定药物（如暴露前预防药物或阻断药物）来预防艾滋病感染。",
        options: [
            "正确",
            "错误",
            "不知道"
        ],
        type: "single",
        correctAnswer: [0],
        explanation: "目前已有暴露前预防（PrEP）和暴露后预防（PEP）药物可用于预防艾滋病感染，在高风险行为前后服用可有效降低感染风险。"
    },
    {
        question: "关于预防艾滋病的方法，以下哪些说法正确？",
        options: [
            "避免发生多性伴等不安全性行为",
            "发生性行为时全程正确使用安全套",
            "和外表健康的人发生性行为不会感染艾滋病",
            "拒绝吸食毒品/共用注射针具",
            "不知道"
        ],
        type: "multiple",
        correctAnswer: [0, 1, 3],
        explanation: "正确的预防措施包括：避免发生多性伴等不安全性行为、发生性行为时全程正确使用安全套以及拒绝吸食毒品/共用注射针具。与外表健康的人发生性行为依然有感染风险，因为HIV感染者可能没有明显症状。"
    },
    {
        question: "以下哪种行为有感染HIV的高风险？",
        options: [
            "与HIV感染者共用水杯",
            "与HIV感染者发生无保护性行为",
            "在正规医疗机构接受输血（已规范筛查）",
            "被HIV感染者的蚊子叮咬"
        ],
        type: "single",
        correctAnswer: [1],
        explanation: "与HIV感染者发生无保护性行为是高风险行为。共用水杯、规范筛查后的输血和蚊虫叮咬都不会传播HIV。"
    },
    {
        question: "HIV感染后，人体免疫系统首先受到攻击的细胞是？",
        options: [
            "红细胞",
            "CD4+ T淋巴细胞",
            "白细胞（非特异性）",
            "血小板"
        ],
        type: "single",
        correctAnswer: [1],
        explanation: "HIV感染后，首先攻击的是人体免疫系统中的CD4+ T淋巴细胞，这些细胞是免疫系统的重要组成部分。"
    },
    {
        question: "目前获取艾滋病自我检测试纸的渠道有哪些？",
        options: [
            "具备资质的网上药店",
            "疾控中心",
            "艾滋病防治公益组织",
            "具备资质的实体药店",
            "不知道"
        ],
        type: "multiple",
        correctAnswer: [0, 1, 2, 3],
        explanation: "目前获取艾滋病自我检测试纸的渠道包括：具备资质的网上药店、疾控中心、艾滋病防治公益组织以及具备资质的实体药店。"
    },
    {
        question: "关于HIV暴露后预防（PEP），以下说法正确的是？",
        options: [
            "必须在暴露后72小时内开始服药，越早效果越好",
            "只需服用1次药物即可预防感染",
            "暴露后无需检测，直接服药即可",
            "PEP对所有病毒（如乙肝、丙肝）均有效"
        ],
        type: "single",
        correctAnswer: [0],
        explanation: "HIV暴露后预防（PEP）必须在暴露后72小时内开始服药，并且越早服药效果越好。PEP需连续服用28天，且仅对HIV有效，不能预防其他病毒感染。"
    },
    {
        question: "即使感染了艾滋病，在医生的指导下采取母婴阻断措施，也能生出健康的宝宝。",
        options: [
            "正确",
            "错误",
            "不知道"
        ],
        type: "single",
        correctAnswer: [0],
        explanation: "HIV感染者可以在医生指导下服用抗病毒药物，采取科学的母婴阻断措施，大大降低传染给胎儿的风险，生出健康的宝宝。"
    }
];

// 获取问题对应的知识点类别
function getQuestionCategory(questionIndex) {
    const categories = {
        0: "基本概念",
        1: "传播途径",
        2: "传播途径",
        3: "预防措施",
        4: "预防措施",
        5: "风险行为",
        6: "病理知识",
        7: "检测渠道",
        8: "治疗知识",
        9: "母婴阻断"
    };
    
    return categories[questionIndex];
} 