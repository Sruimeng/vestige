---
id: prd-post-processing
type: guide
related_ids:
  - prd
  - design-guide
  - constitution
  - strategy-blueprint-upgrade
---

# Post-Processing PRD

> **定位:** 定义 Ephemera 项目的视觉后处理管线与风格滤镜系统。
> **核心理念:** AI 生成模型仅作为"几何原语"，由渲染管线进行"风格重塑"。

## 1. 核心类型定义

```typescript
/** 风格滤镜枚举 */
type StyleFilter =
  | 'default'      // 默认 (基础后处理)
  | 'blueprint'    // 全息蓝图
  | 'halftone'     // 复古报纸
  | 'ascii'        // 黑客矩阵
  | 'voxel'        // 体素化
  | 'sketch'       // 手绘素描
  | 'glitch'       // 故障艺术
  | 'crystal'      // 水晶玻璃
  | 'claymation';  // 粘土动画

/** 风格滤镜配置 */
interface StyleFilterConfig {
  id: StyleFilter;
  label: string;           // UI 显示名称
  category: 'post' | 'material' | 'hybrid';  // 实现类型
  performance: 1 | 2 | 3;  // 性能消耗等级
}

/** 后处理效果配置 */
interface PostProcessingConfig {
  vignette: VignetteConfig;
  scanlines: ScanlineConfig;
  bloom?: BloomConfig;
  chromaticAberration?: ChromaticAberrationConfig;
  noise?: NoiseConfig;
}

interface VignetteConfig {
  enabled: boolean;
  offset: number;      // 0.0 - 1.0, 推荐 0.5
  darkness: number;    // 0.0 - 1.0, 推荐 0.4
  opacity: number;     // 全局透明度, 推荐 0.02
}

interface ScanlineConfig {
  enabled: boolean;
  density: number;     // 线条密度, 推荐 1.5
  opacity: number;     // 推荐 0.02
  angle: number;       // 角度 (度), 推荐 0
}

interface BloomConfig {
  enabled: boolean;
  intensity: number;   // 0.0 - 2.0, 推荐 0.3
  threshold: number;   // 亮度阈值, 推荐 0.9
  radius: number;      // 扩散半径, 推荐 0.4
}

interface ChromaticAberrationConfig {
  enabled: boolean;
  offset: [number, number];  // [x, y] 偏移, 推荐 [0.002, 0.002]
}

interface NoiseConfig {
  enabled: boolean;
  opacity: number;     // 推荐 0.03
  animated: boolean;   // 是否动态噪点
}
```

## 2. 风格滤镜系统

### 2.1 滤镜清单

| ID | UI 名称 | 类型 | 性能 | 适用场景 |
|----|--------|------|------|---------|
| `blueprint` | 工程模式 | hybrid | 2 | 科技/数据类 |
| `halftone` | 旧时光 | post | 1 | 新闻/历史类 |
| `ascii` | 黑客 | post | 2 | 极客/信息类 |
| `voxel` | 像素世界 | material | 3 | 趣味/游戏类 |
| `sketch` | 艺术馆 | hybrid | 2 | 文化/艺术类 |
| `glitch` | 赛博故障 | hybrid | 2 | 冲突/突发类 |
| `crystal` | 水晶展台 | material | 3 | 高端/纪念类 |
| `claymation` | 粘土动画 | material | 2 | 温馨/童趣类 |

### 2.2 滤镜详解

#### A. 全息蓝图 (Blueprint)

```
FILTER blueprint:
  visual:
    - 半透明幽灵状
    - 发光边缘线框 (Wireframe)
    - 悬浮 UI 锚点 + 扫描光效
  color_palette:
    - primary: Cyan (#00FFFF)
    - secondary: Electric Blue (#3B82F6)
    - accent: Neon Green (#39FF14)
  technique:
    - Barycentric Coordinates (重心坐标线框)
    - Rim Light (边缘光)
    - Scanline Sweep (扫描线扫过)
```

#### B. 复古报纸 (Halftone)

```
FILTER halftone:
  visual:
    - 黑白印刷风
    - 阴影由圆点/斜线组成
    - 泛黄纸张背景
  technique:
    - Screen-space Halftone (屏幕空间半色调)
    - Luma -> Dot Radius 映射
    - Paper Noise 纹理叠加
```

#### C. 黑客矩阵 (ASCII)

```
FILTER ascii:
  visual:
    - 模型由字符组成
    - 亮区: @, #, %
    - 暗区: ., :, -
  color_mode:
    - matrix: Green (#00FF00) on Black
    - terminal: Black on White
  technique:
    - 屏幕像素化
    - 亮度 -> ASCII 字符图集映射
```

#### D. 体素化 (Voxel)

```
FILTER voxel:
  visual:
    - 模型转化为堆叠方块
    - 乐高/Minecraft 风格
  technique:
    - Compute Shader 体素化
    - Mesh 包围盒遍历
    - Instance Cube 生成
  note: 需要 WebGPU 支持
```

#### E. 手绘素描 (Sketch)

```
FILTER sketch:
  visual:
    - 铅笔绘制效果
    - 边缘抖动
    - 阴影排线 (Cross-hatching)
  technique:
    - Sobel 边缘检测
    - Toon Shading 色调映射
    - 顶点随机位移
```

#### F. 故障艺术 (Glitch)

```
FILTER glitch:
  visual:
    - 顶点撕裂
    - RGB 色彩分离
    - 噪点 + 横向拉丝
  technique:
    - Vertex Shader 正弦波偏移
    - Fragment Shader RGB UV 偏移
    - 时间驱动动画
```

#### G. 水晶玻璃 (Crystal)

```
FILTER crystal:
  visual:
    - 透明折射
    - 色散效果
    - 内部流光
  technique:
    - GrabPass 背景扭曲
    - MatCap / PBR Transmission
    - Ray-marching Caustics (可选)
  note: 高性能消耗
```

#### H. 粘土动画 (Claymation)

```
FILTER claymation:
  visual:
    - 指纹痕迹表面
    - 漫反射橡皮泥材质
    - 定格动画帧率 (8-12fps)
  technique:
    - 法线贴图叠加噪点
    - 时间量化 (Stop Motion)
    - 每帧微小形变
```

## 3. 滤镜选择器 UI

### 3.1 交互模式

```typescript
/** 滤镜选择器 - 响应式设计 */
COMPONENT FilterSelector:
  IF isMobile:
    RENDER MobileFilterSelector  // 垂直滑块
  ELSE:
    RENDER DesktopFilterSelector // 横向点击列表

/** 移动端滑块选择器 */
COMPONENT MobileFilterSelector:
  layout:
    - position: 左侧中央
    - size: 32px × 88px
    - style: 垂直滑动滚轮
  interaction:
    - drag: 上下拖拽切换滤镜
    - snap: 自动吸附到最近项
    - highlight: 中央选中框高亮
  visual:
    - icons: 每个滤镜特征图标 (24px × 24px)
    - label: 当前滤镜名称显示在右侧
    - mask: 上下渐变遮罩

/** PC端点击选择器 */
COMPONENT DesktopFilterSelector:
  layout:
    - position: 底部中央
    - style: 横向滚动列表
  interaction:
    - click: 点击切换滤镜
    - hover: 悬停放大效果
  visual:
    - icons: 32px × 32px 特征图标
    - label: 图标下方显示名称
    - indicator: 激活项底部圆点指示器
```

### 3.2 滤镜图标设计

| 滤镜 ID | 图标特征 |
|---------|---------|
| `default` | 灰色渐变 + 中央圆点 |
| `blueprint` | 青色网格线框 (3×3) |
| `halftone` | 黑色圆点阵列 (半色调) |
| `ascii` | 绿色终端字符 `>_` |
| `pixel` | 蓝色像素方块 |
| `sketch` | 虚线三角形 (铅笔风格) |
| `glitch` | RGB 色彩分离条纹 |
| `crystal` | 紫色菱形水晶 |
| `claymation` | 橙色粘土球 |

## 4. 基础后处理管线

```
PIPELINE PostProcessing:
  INPUT: Scene Render

  STAGE 1: Bloom (可选)
    - 提取高亮区域
    - 高斯模糊扩散
    - 叠加回原图

  STAGE 2: Vignette
    - 边缘渐暗
    - 聚焦中心视觉

  STAGE 3: Scanline
    - 水平扫描线叠加
    - 模拟 CRT 显示器

  STAGE 4: Chromatic Aberration (可选)
    - RGB 通道微偏移
    - 增加科技感

  STAGE 5: Noise (可选)
    - 胶片颗粒感
    - 动态或静态

  OUTPUT: Final Frame
```

## 4. 默认配置

```typescript
const DEFAULT_POST_PROCESSING: PostProcessingConfig = {
  vignette: {
    enabled: true,
    offset: 0.5,
    darkness: 0.4,
    opacity: 0.02
  },
  scanlines: {
    enabled: true,
    density: 1.5,
    opacity: 0.02,
    angle: 0
  },
  bloom: {
    enabled: false,
    intensity: 0.3,
    threshold: 0.9,
    radius: 0.4
  },
  chromaticAberration: {
    enabled: false,
    offset: [0.002, 0.002]
  },
  noise: {
    enabled: false,
    opacity: 0.03,
    animated: true
  }
};

const STYLE_FILTERS: StyleFilterConfig[] = [
  { id: 'blueprint',   label: '工程模式',   category: 'hybrid',   performance: 2 },
  { id: 'halftone',    label: '旧时光',     category: 'post',     performance: 1 },
  { id: 'ascii',       label: '黑客',       category: 'post',     performance: 2 },
  { id: 'voxel',       label: '像素世界',   category: 'material', performance: 3 },
  { id: 'sketch',      label: '艺术馆',     category: 'hybrid',   performance: 2 },
  { id: 'glitch',      label: '赛博故障',   category: 'hybrid',   performance: 2 },
  { id: 'crystal',     label: '水晶展台',   category: 'material', performance: 3 },
  { id: 'claymation',  label: '粘土动画',   category: 'material', performance: 2 },
];
```

## 5. 状态联动

| 系统状态 | 后处理调整 |
|---------|-----------|
| `IDLE` | 默认配置 |
| `SCROLLING` | Scanline opacity +0.01 |
| `CONSTRUCTING` | Bloom enabled, intensity 0.5 |
| `MATERIALIZED` | 应用用户选择的风格滤镜 |
| `ERROR` | Chromatic Aberration enabled |

## 6. 实现方案

### 6.1 技术栈

```
STACK:
  - @react-three/postprocessing (基础后处理)
  - postprocessing (pmndrs 库)
  - Three.js EffectComposer
  - Custom ShaderMaterial (材质类滤镜)
  - WebGPU Compute Shader (体素化)
```

### 6.2 架构设计

```
ARCHITECTURE:
  StyleFilterProvider (Context)
    ├── useStyleFilter() hook
    ├── PostProcessingEffects (后处理类)
    └── MaterialOverride (材质类)

  FLOW:
    1. 用户选择滤镜 -> setFilter(id)
    2. IF category === 'post':
         应用后处理 Shader
       ELSE IF category === 'material':
         替换模型材质
       ELSE: // hybrid
         两者结合
```

### 6.3 组件结构

```tsx
// 基础后处理
<EffectComposer>
  <Vignette offset={0.5} darkness={0.4} />
  <Scanline density={1.5} />
  {filter === 'halftone' && <HalftoneEffect />}
  {filter === 'ascii' && <ASCIIEffect />}
  {filter === 'glitch' && <GlitchEffect />}
</EffectComposer>

// 材质覆盖
<ArtifactModel>
  {filter === 'blueprint' && <BlueprintMaterial />}
  {filter === 'crystal' && <CrystalMaterial />}
  {filter === 'claymation' && <ClaymationMaterial />}
</ArtifactModel>
```

## 7. 性能优化

```
OPTIMIZATION:
  1. 移动端降级:
     - 禁用 performance >= 3 的滤镜
     - Scanline opacity 降至 0.01
     - 禁用 Chromatic Aberration

  2. 低端设备检测:
     - IF GPU_TIER < 2:
         仅允许 halftone, sketch
         禁用 voxel, crystal

  3. 分辨率缩放:
     - 后处理在 0.75x 分辨率执行
     - 最终上采样

  4. 按需加载:
     - 滤镜 Shader 动态 import
     - 未选中的滤镜不加载
```

## 8. ⛔ 禁止事项

- 🚫 不要让 Bloom intensity 超过 1.0 (过曝)
- 🚫 不要让 Scanline opacity 超过 0.05 (干扰阅读)
- 🚫 不要在移动端启用 voxel 或 crystal 滤镜
- 🚫 不要使用彩色 Vignette (仅限黑色渐暗)
- 🚫 不要在 `MATERIALIZED` 状态同时启用多个滤镜
- 🚫 不要加载 AI 模型的原始贴图 (仅使用几何体)
- 🚫 不要在 glitch 滤镜中让 RGB 偏移超过 0.01
- 🚫 不要让 claymation 帧率低于 8fps (卡顿感过强)
