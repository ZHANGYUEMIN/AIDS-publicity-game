# 艾滋病知识自测游戏 v1.2.0 备份

这是艾滋病知识自测游戏 v1.2.0 版本的完整备份。

## 版本信息

- 版本: v1.2.0
- 备份日期: 2023-11-14
- 主要更新内容:
  1. 修复GitHub图标显示问题，使用官方Octocat图标
  2. 添加小游戏排行榜功能，替代原开始新测试按钮
  3. 优化数据同步和界面显示

## 文件说明

- app.js: 主要应用逻辑代码
- index.html: 主页面HTML
- data/: 数据存储目录
  - classData.json: 班级数据模板
  - studentReports.json: 学生报告数据模板

## 恢复说明

如需从此备份恢复，只需将这些文件复制回项目主目录即可。

```bash
copy backup_v1.2.0\app.js app.js
copy backup_v1.2.0\index.html index.html
xcopy /E /I backup_v1.2.0\data data
``` 