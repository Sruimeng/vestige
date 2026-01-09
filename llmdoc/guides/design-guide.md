---
id: design-guide
type: guide
related_ids:
  - prd
  - time-capsule-guide
---

# 深空终端美学设计规范 (Deep Space Terminal)

> 让用户一眼看出"这是 Sruimeng 的作品"

## 1. 核心类型定义

```typescript
/** 色彩系统 */
interface ColorPalette {
  canvas: '#050505';           // 近乎纯黑的深空背景
  panel: 'rgba(10-30, 10-30, 10-35, 0.6-0.8)';  // 深色玻璃面板
  accent: '#3B82F6';           // 荧光蓝 - 唯一强调色
  accentDim: '#1E40AF';        // 暗蓝 - 轮廓光/补光
  textPrimary: '#E5E5E5';      // 主文字
  textDim: '#525252';          // 暗淡装饰文字
  error: '#EF4444';            // 错误/警告状态
  success: '#22C55E';          // 成功/在线状态
}

/** 字体系统 */
interface Typography {
  mono: '"JetBrains Mono", "SF Mono", Menlo, monospace';   // HUD数据、时间戳、坐标
  sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif';  // 正文、说明
  serif: '"Playfair Display", "Times New Roman", serif';  // 哲学标题、艺术性文案
}

/** 动画配置 */
interface AnimationConfig {
  name: string;
  duration: string;
  easing: string;
  iteration?: 'infinite';
}

/** HUD 元素类型 */
type HUDElement = 
  | 'corner-frame'    // 角落装饰框 (L形 SVG)
  | 'crosshair'       // 十字准星
  | 'timestamp'       // 实时时间戳 HH:MM:SS.mmm CN
  | 'coordinates'     // 坐标读数 X: 0000 / Y: 0000
  | 'data-stream'     // 滚动十六进制数据
  | 'signal-bar'      // 5级信号强度条
  | 'status-dot';     // 脉冲圆点 + 状态文字
```

## 2. 色彩规范

### 2.1 主色板

| 角色 | 色值 | 语义 |
|------|------|------|
| Canvas | `#050505` | 近乎纯黑的深空背景 |
| Panel | `rgba(10-30, 10-30, 10-35, 0.6-0.8)` | 深色玻璃面板 |
| Accent | `#3B82F6` | 荧光蓝 - 唯一的强调色 |
| Accent Dim | `#1E40AF` | 暗蓝 - 轮廓光/补光 |
| Text Primary | `#E5E5E5` | 主文字 |
| Text Dim | `#525252` | 暗淡装饰文字 |
| Error | `#EF4444` | 错误/警告状态 |
| Success | `#22C55E` | 成功/在线状态 |

### 2.2 色彩规则

```
RULE single_accent:
  - 只用蓝色 (#3B82F6) 作为强调
  - 禁止使用其他彩色作为强调

RULE low_opacity:
  - 装饰元素使用 white/5 ~ white/15
  - 避免高对比度装饰

RULE deep_background:
  - 大面积使用 #050505 ~ #1a1a2e
  - 保持深邃感
```

## 3. 字体规范

### 3.1 字体栈

| 用途 | 字体 | 示例场景 |
|------|------|----------|
| 等宽 (mono) | JetBrains Mono | HUD数据、时间戳、坐标 |
| 无衬线 (sans) | Inter | 正文、说明文字 |
| 衬线 (serif) | Playfair Display | 哲学标题、艺术性文案 |

### 3.2 排版规则

| 规则 | 值 | 用途 |
|------|-----|------|
| 大字间距 | `tracking-[0.15em]` ~ `tracking-[0.3em]` | 系统标签 |
| 全大写 | `uppercase` | 系统标签 |
| 等宽数字 | `tabular-nums` | 数据显示 |
| 极小字号 | `10px` ~ `12px` | 装饰文字 |

## 4. 组件规范

### 4.1 玻璃面板 (Glass Panel)

```css
.glass-panel {
  background: rgba(30, 30, 35, 0.60);
  backdrop-filter: blur(40px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
```

### 4.2 HUD 面板 (HUD Panel)

```css
.hud-panel {
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  box-shadow:
    inset 0 0 30px rgba(255, 255, 255, 0.01),
    0 0 40px rgba(0, 0, 0, 0.5);
}
```

### 4.3 HUD 按钮 (HUD Button)

```css
.btn-hud {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 2px;
  font-family: monospace;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.2s;
}

.btn-hud:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.btn-hud:active {
  transform: scale(0.95);
}
```

## 5. HUD 装饰元素

| 元素 | 位置 | 用途 |
|------|------|------|
| 角落装饰框 | 四角 | L形 SVG 边框 |
| 十字准星 | 中心 | 渐变线条 + 角标记 |
| 实时时间戳 | 顶部 | `HH:MM:SS.mmm CN` |
| 坐标读数 | 左下 | `X: 0000 / Y: 0000` |
| 数据流 | 右下 | 滚动的十六进制数据 |
| 信号指示器 | 顶部 | 5级信号强度条 |
| 状态点 | 顶部 | 脉冲圆点 + 状态文字 |

## 6. 动画规范

| 动画 | 用途 | 时长 | 缓动 |
|------|------|------|------|
| fade-in | 元素进入 | 0.3s | ease-out |
| slide-up | 面板弹出 | 0.4s | cubic-bezier(0.32, 0.72, 0, 1) |
| pulse-glow | 状态指示 | 2s | ease-in-out, infinite |
| loading-bar | 加载进度 | 1.5s | ease-in-out, infinite |
| data-stream | 数据滚动 | 20s | linear, infinite |
| flicker | 故障效果 | 0.1s | steps(2) |

## 7. 文案规范

### 7.1 命名格式

```
// 系统标签格式
PROJECT.VERSION     → EPHEMERA.V2
Object.Property     → Object.Description
Status.State        → Signal.Lost
Action.Target       → View.Sources

// 技术数据格式
0x7F3A9B2C         → 十六进制 (8位大写)
2026.01.08         → 日期 (点分隔)
14:32:05.847 CN    → 时间戳 (毫秒+时区)
X: 0000 / Y: 0000  → 坐标 (四位补零)
```

### 7.2 状态文案

| 类型 | 示例 |
|------|------|
| 系统正常 | `SYS.NOMINAL` |
| 系统初始化 | `SYS.INIT` |
| 数据就绪 | `DATA.RDY` |
| 同步完成 | `SYNC.OK` |
| 错误状态 | `ERROR: 404_TIMELINE_MISSING` |

## 8. Z-Index 层级

| 层级 | 用途 |
|------|------|
| Z-0 | Canvas / 3D Scene (背景) |
| Z-30 | HUD Decorations (装饰层) |
| Z-40 | Info Panels (信息面板) |
| Z-50 | Header / Navigation (导航) |
| Z-60+ | Modals / Sheets (弹窗) |

## 9. UnoCSS 配置

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      canvas: '#050505',
      panel: 'rgba(20, 20, 20, 0.6)',
      'hud-accent': '#3B82F6',
      'hud-accent-dim': '#1E40AF',
      text: {
        primary: '#E5E5E5',
        dim: '#525252',
        tech: '#3B82F6',
      },
    },
    fontFamily: {
      mono: ['"JetBrains Mono"', 'monospace'],
      sans: ['"Inter"', 'sans-serif'],
      serif: ['"Playfair Display"', 'serif'],
    },
  },
  shortcuts: {
    'hud-panel': 'bg-[rgba(10,10,10,0.8)] backdrop-blur-[20px] border border-white/5 rounded-sm',
    'btn-hud': 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 rounded-sm font-mono uppercase tracking-wider',
    'data-label': 'font-mono text-xs text-[#525252] uppercase tracking-[0.2em]',
    'title-philosophy': 'font-serif text-[#E5E5E5] tracking-tight',
  },
});
```

## 10. 快速识别清单

| 特征 | 表现 |
|------|------|
| ✅ 深空背景 | 近乎纯黑 `#050505` |
| ✅ 荧光蓝强调 | `#3B82F6` 作为唯一亮色 |
| ✅ 等宽字体数据 | JetBrains Mono 显示技术信息 |
| ✅ 衬线体标题 | Playfair Display 用于艺术性标题 |
| ✅ 大字间距 | `tracking-[0.2em]` 以上 |
| ✅ 全大写标签 | UPPERCASE 系统标签 |
| ✅ 玻璃面板 | 高模糊 + 低透明度 |
| ✅ 四角装饰框 | L形 SVG 边框 |
| ✅ 实时时间戳 | 毫秒级更新 |
| ✅ 十字准星 | 中心渐变线条 |
| ✅ 点分隔命名 | `Object.Property` 格式 |
| ✅ 暗角效果 | 边缘渐变暗化 |
| ✅ 脉冲状态点 | 蓝色呼吸灯 |

## 11. ⛔ 禁止事项 (Do NOTs)

- 🚫 不要使用除 `#3B82F6` 以外的彩色作为强调色
- 🚫 不要使用高饱和度或明亮的背景色
- 🚫 不要在 HUD 数据显示中使用非等宽字体
- 🚫 不要在哲学/艺术性文案中使用无衬线字体
- 🚫 不要使用小于 `tracking-[0.1em]` 的字间距用于系统标签
- 🚫 不要在装饰元素上使用高于 `white/20` 的透明度
- 🚫 不要打破 Z-Index 层级规范
- 🚫 不要使用圆角大于 `4px` 的 HUD 面板（玻璃面板除外）