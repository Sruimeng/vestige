/**
 * HUD 四角装饰框
 * 深空终端美学 - L型边框装饰
 */

interface CornerFramesProps {
  className?: string;
}

export function CornerFrames({ className = '' }: CornerFramesProps) {
  const cornerSize = 40;
  const strokeWidth = 1;
  const strokeColor = 'rgba(59, 130, 246, 0.3)'; // hud-accent/30

  return (
    <div className={`pointer-events-none fixed inset-0 z-30 ${className}`}>
      {/* 左上角 */}
      <svg
        className="absolute left-4 top-4"
        width={cornerSize}
        height={cornerSize}
        viewBox={`0 0 ${cornerSize} ${cornerSize}`}
      >
        <path
          d={`M 0 ${cornerSize} L 0 0 L ${cornerSize} 0`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* 右上角 */}
      <svg
        className="absolute right-4 top-4"
        width={cornerSize}
        height={cornerSize}
        viewBox={`0 0 ${cornerSize} ${cornerSize}`}
      >
        <path
          d={`M 0 0 L ${cornerSize} 0 L ${cornerSize} ${cornerSize}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* 左下角 */}
      <svg
        className="absolute bottom-4 left-4"
        width={cornerSize}
        height={cornerSize}
        viewBox={`0 0 ${cornerSize} ${cornerSize}`}
      >
        <path
          d={`M 0 0 L 0 ${cornerSize} L ${cornerSize} ${cornerSize}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* 右下角 */}
      <svg
        className="absolute bottom-4 right-4"
        width={cornerSize}
        height={cornerSize}
        viewBox={`0 0 ${cornerSize} ${cornerSize}`}
      >
        <path
          d={`M ${cornerSize} 0 L ${cornerSize} ${cornerSize} L 0 ${cornerSize}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
    </div>
  );
}
