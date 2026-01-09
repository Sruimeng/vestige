import {
  defineConfig,
  presetIcons,
  presetWind3,
  transformerCompileClass,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';
import presetAnimations from 'unocss-preset-animations';

export default defineConfig({
  presets: [
    presetWind3({
      breakpoints: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    }),
    presetAnimations(),
    presetIcons({
      autoInstall: true,
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup(), transformerCompileClass()],
  theme: {
    colors: {
      // 原有通用色彩
      background: 'rgba(var(--color-background) / <alpha-value>)',
      foreground: 'rgba(var(--color-foreground) / <alpha-value>)',
      primary: 'rgba(var(--color-primary) / <alpha-value>)',
      secondary: 'rgba(var(--color-secondary) / <alpha-value>)',
      accent: 'rgba(var(--color-accent) / <alpha-value>)',
      muted: 'rgba(var(--color-muted) / <alpha-value>)',
      border: 'rgba(var(--color-border) / <alpha-value>)',
      // Ephemera 深空终端色彩系统
      canvas: '#050505',
      'hud-accent': '#3B82F6',
      'hud-accent-dim': '#1E40AF',
      'hud-panel': 'rgba(10, 10, 10, 0.8)',
      'hud-glass': 'rgba(30, 30, 35, 0.6)',
      'hud-text': '#E5E5E5',
      'hud-text-dim': '#525252',
      'hud-success': '#22C55E',
      'hud-error': '#EF4444',
    },
    fontFamily: {
      mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      serif: ['"Playfair Display"', '"Times New Roman"', 'serif'],
    },
  },
  shortcuts: {
    // HUD 面板样式
    'hud-panel': 'bg-hud-panel backdrop-blur-20 border border-white/5 rounded-sm',
    // 玻璃面板样式
    'glass-panel': 'bg-hud-glass backdrop-blur-40 border-t border-white/15 border-b border-white/5 rounded-[32px]',
    // HUD 按钮
    'btn-hud':
      'bg-hud-accent/10 text-hud-accent border border-hud-accent/30 rounded-sm font-mono uppercase tracking-wider text-xs px-3 py-1.5 transition-all hover:bg-hud-accent/20 hover:border-hud-accent/50 active:scale-95',
    // 数据标签
    'data-label': 'font-mono text-xs text-hud-text-dim uppercase tracking-[0.2em]',
    // 哲学标题
    'title-philosophy': 'font-serif text-hud-text tracking-tight',
    // HUD 文本
    'hud-text-mono': 'font-mono text-hud-text tabular-nums',
    'hud-text-accent': 'font-mono text-hud-accent',
  },
  rules: [
    // 安全距离相关的工具类
    ['safe-area-pt', { 'padding-top': 'env(safe-area-inset-top, 0px)' }],
    ['safe-area-pb', { 'padding-bottom': 'env(safe-area-inset-bottom, 0px)' }],
    [
      'safe-area-px',
      {
        'padding-left': 'env(safe-area-inset-left, 0px)',
        'padding-right': 'env(safe-area-inset-right, 0px)',
      },
    ],
    [
      'safe-area-py',
      {
        'padding-top': 'env(safe-area-inset-top, 0px)',
        'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    ],
    [
      'scrollbar-thin',
      {
        'scrollbar-width': 'thin',
        'border-radius': '30px',
        'scrollbar-color': 'rgba(153, 153, 153, 1) rgba(32, 32, 32, 1)',
      },
    ],
    // HUD 特殊规则
    ['backdrop-blur-20', { 'backdrop-filter': 'blur(20px)' }],
    ['backdrop-blur-40', { 'backdrop-filter': 'blur(40px) saturate(180%)' }],
  ],
});
