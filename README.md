# PingPongDuo — System in motion

基于用户提供的 **Overview_fig.pptx 第一页**制作的交互网站。入口在 [`Demo_Video/index.html`](Demo_Video/index.html)。

## 两个视图

**Overview** 保留 PPT 中的机器人、训练场景与主要构图。SVG 动画覆盖在原始图上：沿原有连接线播放流水灯；Strike 显示球路和接触光圈；Clear 显示横向让位提示；Task phases 同步切换参考动作框、角色状态和 Select 分支。

**Archify signal map** 是使用官方 Archify 包实际渲染的独立 HTML，而非将自定义 SVG 冒称为 Archify 输出。它提供节点探索、关系追踪与讲解视图。原图视图采用定制 SVG，是为了保留机器人素材与论文排版。

## 操作

点击 Ready / Strike / Clear / Wait / Recover 可以停在对应阶段；Play 继续播放。Following A/B 切换跟随的机器人。支持拖动时间轴、0.5×–2× 倍速、全屏、整体暂停与 Reduce motion。键盘：Space 暂停，方向键切换阶段，R 重播。SVG 中的 Task phases 也支持点击和键盘选择。

## 本地打开

无需构建：直接打开 `Demo_Video/index.html`。需要完整 HTTP 环境时，在仓库根目录执行：

```bash
python3 -m http.server 8000
```

访问 `http://localhost:8000/Demo_Video/`。

## 文件与修改位置

- `Demo_Video/index.html`：页面结构、原图和八条 SVG 信号路径。
- `Demo_Video/assets/site.css`：颜色、布局、信号样式、响应式与静态模式。
- `Demo_Video/assets/site.js`：统一时间轴、阶段时长、A/B 角色配对、动作分支与局部特效。
- `Demo_Video/assets/overview.webp`：由源 PPT 第一页渲染、优化的原图；SHA-256 验证信息在 `source/artwork.json`。
- `Demo_Video/source/deployment.dataflow.json`：可编辑的 Archify typed source。
- `Demo_Video/archify/deployment.html`：实际生成的 Archify viewer。
- `Demo_Video/archify/validation.json` 和 `delivery.json`：Archify 结构与成品校验回执。
- `tests/browser.mjs`：真实浏览器回归测试。测试结果和截图见 Actions 的 `browser-evidence` artifact；完整网站见 `PingPongDuo-site` artifact。

## Archify

构建使用 `tt-a1i/archify` 的固定提交 `72c750bb070d95171dbb2244e5b62b1b7da69c12`。工作流在修改 typed source 后运行 `validate` 和 `deliver`，必须通过 showcase 检查后才提交 HTML。当前已生成版本通过 9 项检查，0 errors、0 warnings。Archify 的 MIT 许可保留在 `Demo_Video/archify/LICENSE.txt`。源图片的权利不因使用 Archify 而改变。

## 动画的含义与边界

本次提供的 ZIP 没有 `paper/` 或 LaTeX 原文，因此内容依据 PPT 第一页，未宣称核对论文。13.6 秒阶段循环、双方角色配对、contact window 和参考动作框是**展示性编排**，不代表实际控制器的精确状态机、测量时序或实时 motion matching。原图内机器人仍是静态姿态；球、光圈、让位提示和信号是独立动画。

## 发布

`.github/workflows/website.yml` 会进行浏览器测试、生成网站 ZIP artifact，并尝试发布 GitHub Pages。Pages 成功启用后的地址为 `https://liucheng532.github.io/Pingpong_Duo_Web/`。如仓库尚未允许 Pages，请到 Settings → Pages 选择 GitHub Actions，再运行该工作流。工作流结果是发布状态的依据。

浏览器检查与 Archify 的确定性校验分开记录；结构校验不等于浏览器测试或人工视觉审核。
