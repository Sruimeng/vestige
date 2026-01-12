/**
 * HUD 十字准星
 * 深空终端美学 - 焦点指示器
 */

interface CrosshairProps {
  className?: string;
  isLoading?: boolean;
}

export function Crosshair({ className = '', isLoading = false }: CrosshairProps) {
  const size = 80;
  const innerSize = 20;

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 ${
        isLoading ? 'animate-crosshair-rotate' : ''
      } ${className}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 中心点 */}
        <circle cx={size / 2} cy={size / 2} r={2} fill="#3B82F6" opacity={0.8} />

        {/* 水平线 - 左 */}
        <line
          x1={0}
          y1={size / 2}
          x2={size / 2 - innerSize / 2}
          y2={size / 2}
          stroke="url(#crosshair-gradient-h)"
          strokeWidth={1}
        />

        {/* 水平线 - 右 */}
        <line
          x1={size / 2 + innerSize / 2}
          y1={size / 2}
          x2={size}
          y2={size / 2}
          stroke="url(#crosshair-gradient-h-reverse)"
          strokeWidth={1}
        />

        {/* 垂直线 - 上 */}
        <line
          x1={size / 2}
          y1={0}
          x2={size / 2}
          y2={size / 2 - innerSize / 2}
          stroke="url(#crosshair-gradient-v)"
          strokeWidth={1}
        />

        {/* 垂直线 - 下 */}
        <line
          x1={size / 2}
          y1={size / 2 + innerSize / 2}
          x2={size / 2}
          y2={size}
          stroke="url(#crosshair-gradient-v-reverse)"
          strokeWidth={1}
        />

        {/* 四角标记 */}
        <g stroke="#3B82F6" strokeWidth={1} opacity={0.5}>
          {/* 左上 */}
          <path d={`M ${size / 2 - innerSize} ${size / 2 - innerSize} l -5 0 m 5 0 l 0 -5`} fill="none" />
          {/* 右上 */}
          <path d={`M ${size / 2 + innerSize} ${size / 2 - innerSize} l 5 0 m -5 0 l 0 -5`} fill="none" />
          {/* 左下 */}
          <path d={`M ${size / 2 - innerSize} ${size / 2 + innerSize} l -5 0 m 5 0 l 0 5`} fill="none" />
          {/* 右下 */}
          <path d={`M ${size / 2 + innerSize} ${size / 2 + innerSize} l 5 0 m -5 0 l 0 5`} fill="none" />
        </g>

        {/* 渐变定义 */}
        <defs>
          <linearGradient id="crosshair-gradient-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="crosshair-gradient-h-reverse" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="crosshair-gradient-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="crosshair-gradient-v-reverse" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
