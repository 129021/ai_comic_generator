# 产品需求文档 (PRD)：ComfyUI 3D 写实风漫画渲染引擎 (MVP 主流程)

## 1. 项目概述

- 产品定位：一个纯本地部署的 ComfyUI 渲染主流程，专门为现代都市、写实、3D CG 质感漫画分镜而设计。
- 当前目标：在 Apple Silicon 本地环境下，建立一条可重复执行的渲染主线，使角色面部一致性、画面材质质感、基础镜头构图都能达到可进入后续排版阶段的水平。
- 主线策略：以 `IP-Adapter FaceID + 面部结构控制` 作为角色一致性的核心方案，以 `Deliberate_v2` 作为当前主线候选底模。

## 2. 主线边界

这份 PRD 定义的是当前项目的渲染主流程，而不是临时实验分支。

这意味着：

- 后续主线渲染研发默认围绕 `ComfyUI + Deliberate_v2 + FaceID + 面部结构控制` 展开
- 现有 `majicMIX`、`SDXL base 1.0` 等路线保留为对比和备选，不再视为当前主流程
- 主流程优先验证单格可控性，再扩展到章节级批量执行

## 3. 环境部署与底层依赖

### 3.1 当前安装位置

项目内 ComfyUI 根目录：

- `/Volumes/T7/workspace/ai_comic_generator/ComfyUI`

兼容软链接：

- `/Users/wangjianqin/.gemini/antigravity/scratch/ComfyUI`

### 3.2 系统级依赖

Apple Silicon 本地环境必须先确保编译工具可用：

```bash
brew install cmake
```

### 3.3 Python 环境与核心依赖

在项目内 ComfyUI 目录下：

```bash
cd /Volumes/T7/workspace/ai_comic_generator/ComfyUI
python3 -m venv venv
source venv/bin/activate
pip install torch torchvision torchaudio
pip install -r requirements.txt
pip install insightface
```

说明：

- `insightface` 是当前 FaceID 路线的关键依赖
- Apple Silicon 上若出现编译或运行问题，应优先记录为主流程阻塞项，而不是默默绕过

### 3.4 ComfyUI-Manager

Manager 作为主流程的扩展管理基座，默认纳入主线环境：

```bash
cd /Volumes/T7/workspace/ai_comic_generator/ComfyUI/custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Manager.git
```

## 4. 静态资产与扩展包清单

### 4.1 主线候选资产

| 资产类型 | 名称 | 路径/来源 | 用途 |
| :--- | :--- | :--- | :--- |
| 基础底模 | `Deliberate_v2.safetensors` | `ComfyUI/models/checkpoints/` | 当前主线候选写实 3D CG 风格底模 |
| 面部插件 | `ComfyUI_IPAdapter_plus` | Manager 安装 | FaceID 特征注入 |
| FaceID 权重 | `ip-adapter-faceid_sd15.bin` | 插件模型目录 | SD1.5 FaceID 路线 |
| 控制插件 | `ComfyUI-ControlNet-Aux` | Manager 安装 | 面部预处理器 |
| 控制底模 | `control_v11p_sd15_face.pth` | `ComfyUI/models/controlnet/` | 面部结构约束 |

### 4.2 当前已存在的历史模型

以下模型不再定义为主流程，只保留为对比或回归验证：

- `majicMIX realistic 麦橘写实_v7.safetensors`
- `sd_xl_base_1.0.safetensors`

## 5. 节点拓扑主线

### 5.1 主干渲染流

基础链路：

- `Load Checkpoint`
- `CLIP Text Encode (Positive)`
- `CLIP Text Encode (Negative)`
- `KSampler`
- `VAE Decode`
- `Save Image`

基础 latent：

- `Empty Latent Image`
- 默认从 `512 x 768` 或 `768 x 1152` 起步
- `Batch Size = 1`

### 5.2 Face ID 特征注入流

主线组件：

- `Load Image`
- `IPAdapter Apply FaceID`
- `InsightFace Loader`
- `IPAdapter Model Loader`

主线逻辑：

- 主模型先进入 FaceID 注入
- 注入后的 `MODEL` 输出再进入 `KSampler`
- `InsightFace Loader` 默认优先采用 CPU 路线，直到本机有更稳定方案

### 5.3 面部结构约束流

主线组件：

- `MediaPipe-FaceMesh`
- `Apply ControlNet`
- `Load ControlNet Model`

主线逻辑：

- 角色参考图先提取面部网格
- ControlNet 对正向条件做面部结构约束
- 约束后的正向条件再输入 `KSampler`

## 6. Prompting 主线规范

主流程不把单条 prompt 视为固定资产，而把 prompt 模板结构视为核心规范。

正向 prompt 应至少包含：

- 角色身份描述
- 场景描述
- 镜头描述
- 风格质感标签
- CG / 渲染材质标签

负向 prompt 应至少包含：

- 解剖错误
- 低质量问题
- 水印文字
- 风格偏移
- 不需要的裸露或 NSFW 内容

### 当前主线风格标签方向

可优先测试以下风格标签组合：

- `3d render`
- `cg station`
- `daz3d`
- `octane render`
- `unreal engine 5`
- `ray tracing`
- `smooth glossy skin`

### 当前测试示例

以下示例仍可作为女性角色风格压测样例，但不代表整条漫画主流程的唯一 prompt：

正向：

```text
1girl, black suit skirt, black pantyhose, black high heels, standing in a modern classroom, electronic whiteboard in background, 3d render, cg station, daz3d, octane render, unreal engine 5, ray tracing, smooth glossy skin, masterpiece, best quality
```

负向：

```text
nsfw, nude, naked, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, jpeg artifacts, signature, watermark, blurry
```

## 7. 与现有项目流程的关系

当前项目整体流程仍然是：

`structured script -> resolved prompts -> render -> typeset -> retry`

这份 PRD 只修改其中的 `render` 主流程定义：

- `render` 不再默认围绕 `majicMIX bedroom-night` 展开
- `render` 主线改为围绕 `Deliberate_v2 + IP-Adapter FaceID + 面部 ControlNet` 展开
- 旧工作流和模型继续保留用于对比和回归

## 8. MVP 验收标准

### 8.1 环境验收

1. 点击 `Queue Prompt` 时，无红色必填项缺失警告
2. InsightFace 相关节点能够正常加载
3. 后台终端无 `C++ Build Failed`、关键依赖缺失或节点加载崩溃

### 8.2 单格渲染验收

1. 在 `output` 中生成真实底图，而不是 stub 占位图
2. 角色长相与参考图具备明显可感知的一致性
3. 画面呈现出明确的 3D CG / 写实光影质感
4. 输出图像仍适合后续条漫排字，而不是完全变成海报式人像

### 8.3 工程验收

1. 工作流能从 ComfyUI GUI 导出为 API workflow
2. 导出的 API workflow 能接入项目 baseline 文件
3. 项目 render 模块能通过 `resolved.json` 调用该 workflow 并稳定收图

## 9. 风险与已知问题

- Apple Silicon 上 `insightface`、ControlNet、FaceID 组合仍可能存在性能与兼容性风险
- 3D CG 风格容易把镜头推向“单张海报感”，不一定天然适合条漫叙事
- 单角色女性风格工作流不代表天然适合男性角色、近景反应镜头或反射意象镜头
- 仍需额外验证该主流程对 `p01 / p04 / p10` 等不同镜头类型的泛化能力

## 10. 当前执行原则

- 主流程优先围绕这份 PRD 推进
- 旧模型线不删除，但默认降级为对比线
- 每完成一个可用工作流，都应导出 API workflow 并纳入 `workflows/comfyui/baselines/`
- 任何“看起来更好”的新工作流，只有在接入项目并完成章节样例对比后，才算真正通过主流程验证
