/**
 * HUD 四角装饰框
 * 深空终端美学 - L型边框装饰
 */

interface CornerFramesProps {
  className?: string;
}

export function CornerFrames({ className = '' }: CornerFramesProps) {
  const strokeWidth = 1;
  const strokeColor = 'rgba(59, 130, 246, 0.3)'; // hud-accent/30

  return (
    <div className={`pointer-events-none fixed inset-0 z-30 ${className}`}>
      {/* 左上角 - 移动端缩小 */}
      <svg
        className="absolute left-2 top-2 h-6 w-6 sm:left-4 sm:top-4 sm:h-10 sm:w-10"
        viewBox="0 0 40 40"
      >
        <path
          d="M 0 40 L 0 0 L 40 0"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* 右上角 */}
      <svg
        className="absolute right-2 top-2 h-6 w-6 sm:right-4 sm:top-4 sm:h-10 sm:w-10"
        viewBox="0 0 40 40"
      >
        <path
          d="M 0 0 L 40 0 L 40 40"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* 左下角 */}
      <svg
        className="absolute bottom-2 left-2 h-6 w-6 sm:bottom-4 sm:left-4 sm:h-10 sm:w-10"
        viewBox="0 0 40 40"
      >
        <path
          d="M 0 0 L 0 40 L 40 40"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* 右下角 */}
      <svg
        className="absolute bottom-2 right-2 h-6 w-6 sm:bottom-4 sm:right-4 sm:h-10 sm:w-10"
        viewBox="0 0 40 40"
      >
        <path
          d="M 40 0 L 40 40 L 0 40"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
    </div>
  );
}
