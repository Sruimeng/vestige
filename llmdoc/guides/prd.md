---
id: prd
type: guide
related_ids:
  - time-capsule-guide
  - design-guide
---

# Ephemera: Time Capsule PRD

> **Core Concept:** "History in Objects" —— 历史不仅是文字的堆砌，更是物质的沉淀。通过 LLM 与 3D 生成技术，将任意年份（-500 ~ 2100）的历史切片具象化为一枚数字图腾。

## 1. 核心类型定义

```typescript
/** 系统状态机 */
type SystemState = 
  | 'IDLE'         // 初始状态，等待输入
  | 'SCROLLING'    // 用户正在快速滑动年份
  | 'CHECKING'     // 用户停止，API 查询是否存在
  | 'CONSTRUCTING' // 无缓存，正在生成 (60s 等待)
  | 'MATERIALIZED' // 模型加载完毕，可查看
  | 'ERROR';       // 异常

/** 用户旅程节点 */
interface UserJourneyNode {
  state: SystemState;
  action: string;
  nextState: SystemState | SystemState[];
}

/** UI 组件配置 */
interface UIComponentConfig {
  chronometer: ChronometerConfig;    // 时间轴控制器
  hudOverlay: HUDOverlayConfig;      // HUD 信息层
  philosophyPanel: PanelConfig;      // 哲学面板
  archivesSheet: SheetConfig;        // 历史档案抽屉
}

interface ChronometerConfig {
  range: [-500, 2100];
  font: 'JetBrains Mono';
  accentColor: '#3B82F6';
  interaction: 'inertia-scroll' | 'snap-to-year';
}

interface HUDOverlayConfig {
  topLeft: 'EPHEMERA.CAPSULE.V1';
  topRight: 'YYYY.MM.DD HH:MM:SS.mmm';
  bottomLeft: 'COORDS: YEAR <selection>';
  center: 'crosshair';
  corners: 'L-frame-svg';
}
```

## 2. 产品定位

### 2.1 设计理念

本项目严格遵循 **Sruimeng Design DNA** (参见 [`design-guide.md`](design-guide.md))。

```
CONCEPT: "位于时间尽头的观测站"
  - 用户通过操作精密仪表盘（HUD）
  - 从时间长河中打捞遗失的物质

VISUAL_STYLE:
  - 硬科幻
  - 数据主义
  - 极简主义

INTERACTION_METAPHOR:
  调整时间坐标 → 扫描虚空 → 物质重构
```

### 2.2 用户旅程

```
JOURNEY user_flow:
  1. 启动终端 → IDLE
  2. 滚动时间轴 → SCROLLING
  3. 停止滚动 → CHECKING (查询缓存)
  4. IF cache_hit:
       → MATERIALIZED (瞬间物质化)
     ELSE:
       → CONSTRUCTING (60s 等待)
       → 显示重构日志/数据流
       → MATERIALIZED
  5. 交互: 3D 检视 & 哲学解读
  6. 点击详情 → 历史事件档案
```

## 3. 界面布局

### 3.1 全局视口

| 属性 | 值 | 说明 |
|------|-----|------|
| 背景 | `#050505` | Deep Space Black |
| 后处理 | Vignette + Scanlines | opacity 0.02 |
| 环境光 | Studio Light | 冷色调，强调轮廓 |

### 3.2 核心组件

#### A. 时间轴控制器 (Chronometer)

```
COMPONENT Chronometer:
  position: bottom | right
  style: ruler (刻度 + 数字)
  font: JetBrains Mono
  interaction:
    - 惯性滚动
    - 停止时自动吸附最近年份
  selected_state:
    - color: #3B82F6
    - font_size: enlarged
    - haptic: vibration
```

#### B. HUD 信息层 (Overlay)

| 位置 | 内容 |
|------|------|
| Top-Left | `EPHEMERA.CAPSULE.V1` |
| Top-Right | `YYYY.MM.DD HH:MM:SS.mmm` |
| Bottom-Left | `COORDS: YEAR <selection>` |
| Center | 十字准星 (加载时旋转锁定) |
| Corners | 四角 L 型装饰框 (SVG) |

#### C. 哲学面板 (Philosophy Panel)

```
COMPONENT PhilosophyPanel:
  position: bottom-center
  container: .glass-panel (rgba(30, 30, 35, 0.60))
  title:
    content: 年份 (e.g., "1984")
    font: JetBrains Mono
  body:
    content: 哲学评判文本
    font: Playfair Display (Serif)
    color: white
    letter_spacing: tight
  decoration: 1px #3B82F6 进度条 (顶部)
```

#### D. 历史档案抽屉 (Archives Sheet)

```
COMPONENT ArchivesSheet:
  trigger: 点击哲学面板
  animation: slide-up from bottom
  content: events 列表
  typography:
    title: Inter, Bold, White
    category: JetBrains Mono, Tiny, Uppercase, #525252
    description: Inter, Regular, #A3A3A3
```

## 4. 状态机详解

### 4.1 CONSTRUCTING (生成中)

这是用户体验最关键的 60 秒。

```
STATE CONSTRUCTING:
  visual:
    - 全息线框立方体 (Wireframe Cube) 旋转
  data_stream:
    - font: .font-mono
    - position: 屏幕一侧
    - content: 伪日志快速滚动
  log_examples:
    - "> SEARCHING_DB... MISSING."
    - "> INIT_RECONSTRUCTION_PROTOCOL..."
    - "> ANALYZING_YEAR_DATA [1984]..."
    - "> EXTRACTING_SYMBOLS: [MACINTOSH, ORWELL, OLYMPICS]..."
    - "> SYNTHESIZING_GEOMETRY..."
  progress:
    - 顶部细长蓝色进度条
    - 脉冲效果
```

### 4.2 MATERIALIZED (物质化完成)

```
STATE MATERIALIZED:
  entry_animation:
    1. 线框立方体炸开/消失
    2. GLB 模型: opacity 0→1, scale 0.8→1.0
    3. 哲学面板: slide-up
  interaction:
    - 单指拖拽: 旋转模型 (Orbit)
    - 双指捏合: 缩放 (Zoom)
```

## 5. 技术实现

### 5.1 API 对接

参见 [`time-capsule-guide.md`](time-capsule-guide.md)

```
ENDPOINT: GET /api/time-capsule/{year}

ERROR_HANDLING:
  400 → HUD 警告框 "ERR: TEMPORAL_BOUNDS_EXCEEDED"
  500 → HUD 警告框 "ERR: SYNTHESIS_FAILURE" + 重试建议
```

### 5.2 前端组件结构 (React/R3F)

```tsx
<Canvas className="bg-[#050505]">
   <PostProcessing effects={[Scanlines, Vignette]} />
   <Stage>
      {state === 'MATERIALIZED' && <ArtifactModel url={data.model_url} />}
      {state === 'CONSTRUCTING' && <HologramWireframe />}
   </Stage>
</Canvas>

<HUD_Overlay>
   <TopBar timestamp={true} signalStrength={true} />
   <TimelineScroller onYearChange={setYear} />
   
   <AnimatePresence>
     {state === 'CONSTRUCTING' && <LogStream logs={logs} />}
     {state === 'MATERIALIZED' && <PhilosophyCard data={data} />}
   </AnimatePresence>
</HUD_Overlay>
```

### 5.3 样式类映射

| UI 组件 | Tailwind 类组合 |
|---------|-----------------|
| 主标题 (年份) | `font-mono text-4xl text-white tracking-widest` |
| 哲学文本 | `font-serif text-lg text-gray-200 leading-relaxed tracking-tight` |
| 数据标签 | `font-mono text-xs text-[#525252] uppercase tracking-[0.2em]` |
| 主按钮/高亮 | `text-[#3B82F6] border border-[#3B82F6]/30 bg-[#3B82F6]/10` |
| 玻璃面板 | `backdrop-blur-[40px] bg-[#1e1e23]/60 border-t border-white/15 rounded-[32px]` |
| Loading Log | `font-mono text-xs text-[#3B82F6] opacity-80` |

## 6. 开发计划

### Phase 1: The Shell (外壳与时间轴)

- [ ] 搭建基础布局：Canvas 背景 + HUD 装饰层
- [ ] 实现 `TimelineScroller` 组件：支持 -500 到 2100 的惯性滚动
- [ ] 实现 HUD 时钟和坐标读数

### Phase 2: The Core (API 与状态机)

- [ ] 集成 `useSWR` 或 `TanStack Query` 对接 API
- [ ] 实现 60s 等待状态的 "Log Stream" 动画效果
- [ ] 处理 3D 模型的加载 (`useGLTF`) 和错误回退

### Phase 3: The Soul (美化与动效)

- [ ] 调整后处理效果 (Scanlines)
- [ ] 字体排印微调 (Letter Spacing)
- [ ] 添加入场动画 (Framer Motion)

## 7. 验收标准

| 标准 | 检查项 |
|------|--------|
| 视觉一致性 | 是否一眼看出是 "Sruimeng" 风格（黑底、蓝光、毛玻璃、数据装饰） |
| 年份限制 | 滚动条不能滑出 -500 ~ 2100 范围 |
| 等待体验 | 首次生成时，60秒的等待过程是否有趣（有数据流、线框动画） |
| 模型展示 | 模型加载完毕后，是否自动居中且光照适宜 |
| 字体区分 | 必须严格区分 Mono (数据), Sans (信息), Serif (哲学) 三种字体的用途 |

## 8. ⛔ 禁止事项 (Do NOTs)

- 🚫 不要在 CONSTRUCTING 状态只显示 Spinner（必须有数据流动画）
- 🚫 不要使用除 `#3B82F6` 以外的强调色
- 🚫 不要在哲学文本中使用无衬线字体
- 🚫 不要让时间轴滑出 [-500, 2100] 范围
- 🚫 不要在模型加载前显示哲学面板
- 🚫 不要忽略 HUD 装饰元素（四角框、十字准星、时间戳）
- 🚫 不要在移动端忽略安全区域 (safe-area-inset)