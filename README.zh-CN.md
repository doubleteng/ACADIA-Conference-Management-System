# ACADIA 会议管理工具包

这套仓库把五个 Apps Script 系统整理成可配置、可交接的开源副本：Author Portal、Conference Program、演讲提醒邮件、自动更新的 Google Calendar，以及会后的 Recognition Portal。

**现有线上项目和数据没有改动。** 每届组委会在自己的 Google 账号下创建新项目、新表格和新部署。

## 组委会使用步骤

1. 在 GitHub 点击 **Code → Download ZIP**，解压后用浏览器打开 **`configure.html`**。不需要安装 Node.js，也不需要架设服务器。GitHub 文件预览不能直接运行界面。
2. 在 Conference 填写年份、日期、时区、场地、联系人和截止日期。默认日期只是演示值，请填写下一届实际安排。
3. 在 Templates & data 下载模板生成脚本。在一个全新的 Apps Script 项目中运行它：系统会在当前账号创建 **7 份 Google Sheets（52 个工作表）**、**8 份 Google Docs 模板**和配套文件夹。把生成的配置 JSON 下载并导回界面，资源地址会自动填入。
4. 在新表格中填写录用稿件、作者、会议议程、工作坊和证书名单。证书样式、签名、投稿格式包、宣传图等由本届组委会提供。
5. 在界面填写每日演讲要求、FAQ、管理员操作参数，检查 Advanced content 中的历史政策文案。无需在代码中搜索年份、日期或链接。
6. 从 Export projects 下载部署 ZIP。按包内 `START-HERE.md`，在五个新 Apps Script 项目中放入生成的代码并授权。三个门户部署为 Web app；提醒邮件和日历同步是后台服务。
7. 将三个门户的 `/exec` 地址填回 Website integration，生成嵌入代码，交给 `2027.acadia.org` 的网站维护人。

## 下一届网站怎么接入

网站继续负责导航和页面布局，Google 托管三个应用。在作者页面嵌入 Author Portal，在日程页面嵌入 Program，会后在证书页面嵌入 Recognition。生成的 HTML 包含 iframe 和“新标签页打开”链接，适用于支持自定义 HTML 的网站/CMS。邮件提醒不需要嵌入；日历提供独立公开查看/订阅链接。

详见 [网站接入说明](docs/WEBSITE-INTEGRATION.md)，包括 `/exec` 与 `/dev` 的区别、访问权限、iframe、更新部署及网站验收步骤。

## 交接文档

- [逐模块部署说明](docs/DEPLOYMENT.md)
- [Google 表格字段和模板说明](templates/README.md)
- [上线前演练](docs/ACCEPTANCE.md)
- [每届交接记录](docs/HANDOFF.md)
- [复制范围与迁移改动](docs/MIGRATION.md)

当前版本为 **0.1.0**。已经完成本地代码生成、语法、表格字段契约和代表性议程解析检查；还没有在全新 Google 账号完成真实授权、上传、发信、日历及证书的端到端验收。组委会应先用虚构测试数据完成演练，再正式开放。

原系统处理的是录用后的 submission/author 流程，保留 EasyChair 数据导入，不代替 EasyChair 的完整投稿和同行评审系统。

公开仓库不含真实作者名单、线上 Google 文件 ID、旧部署地址或密钥。生成的配置文件、填好的表格和运行日志应由组委会私下保管。代码采用 MIT 开源许可；字体许可和非代码素材范围见 [NOTICE](NOTICE)。
