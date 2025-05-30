# 艾滋病知识自测游戏

**版本号：v1.1.2**  
**还原代码：`git reset --hard e1f7bab`**

这是一个用于艾滋病知识测试的网页应用，适合课前测试或课前摸底使用，以引出主题内容，测试学生对艾滋病知识的掌握情况。

## 功能特点

### 基本游戏功能
- 10道艾滋病知识题目（单选和多选）
- 答对显示"不错喔，加油！"，答错显示"哎呀，后续努力喽！"
- 完成后生成个人分析报告和班级分析报告

### 界面优化
- 扩大了答题界面和图表区域
- 修复了饼图自动下滑问题
- 将学生姓名选择改为方块格子模式，确保方块之间有适当间距
- 添加了"返回个人分析报告"按钮
- **新增三种背景主题选项**：
  - 红丝带图案背景（艾滋病防治的国际符号）——标准红丝带形状，带有填充效果
  - 医疗相关的简约图标背景
  - 抽象几何图形背景

### 数据管理功能
- 实现数据持久化存储，保存每个学生的测试记录
- 添加查看历史报告功能
- 添加删除报告功能，支持单个删除和批量删除
- 右上角添加全选功能

### 报告分析
- 个人分析报告：得分、知识领域掌握情况、个性化评价
- 班级分析报告：得分分布、题目答对率、知识领域掌握情况、教学建议

## 使用方法

1. 打开网页应用
2. 点击"开始新测试"按钮
3. 从学生格子中选择姓名
4. 点击"开始测试"按钮
5. 回答所有问题，点击"下一题"按钮继续
6. 测试完成后查看个人分析报告
7. 点击"查看班级报告"可以查看全班的测试情况（当有多名学生完成测试后）
8. 可以通过"查看历史报告"功能查看之前的测试结果
9. **在页面底部可以选择不同的背景主题**

## 项目结构

- `index.html` - 主要HTML页面
- `styles.css` - CSS样式文件
- `students.js` - 学生数据和班级统计功能
- `questions.js` - 题目数据和答案
- `app.js` - 游戏主逻辑
- `images/` - 图标和背景图案资源

## 技术栈

- HTML5
- CSS3
- JavaScript
- Chart.js (用于数据可视化)
- SVG (用于背景图案)

## 版本历史

- **v1.0.0-alpha**: 初始版本，完整的艾滋病知识自测小游戏
- **v1.1.0**: 添加三种背景主题选择功能
- **v1.1.1**: 优化红丝带背景，使用标准艾滋病防治红丝带图案；修复CSS语法错误
- **v1.1.2**: 进一步优化红丝带背景图案，更准确地表现标准红丝带形状，添加填充效果

## 自定义

- 可以在`students.js`中修改学生名单
- 可以在`questions.js`中修改或添加测试题目
- 可以调整`app.js`中的评分标准和反馈文本

## 测试数据

如需添加测试数据以查看班级报告效果，可以在`app.js`中取消以下代码的注释：

```javascript
// 添加测试数据
// setTimeout(addTestData, 2000);
```

## 作者

本应用由HAPPY Games™根据需求创建，用于教育目的。 