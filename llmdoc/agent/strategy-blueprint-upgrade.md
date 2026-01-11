---
id: strategy-blueprint-upgrade
type: strategy
related_ids:
  - prd-post-processing
  - blueprint-material
---

# Strategy: Blueprint 工程蓝图升级

## 1. Analysis

### 1.1 Context
当前 Blueprint 材质 (`blueprint-material.tsx`) 实现了基础全息效果：
- 菲涅尔边缘光
- 扫描线动画
- 半透明渲染

用户需求：升级为硬核"工程蓝图"风格，包含 4 个核心模块。

### 1.2 Constitution (Ref: prd-post-processing)
```
FILTER blueprint:
  category: hybrid
  performance: 2
  technique:
    - Barycentric Coordinates (重心坐标线框)
    - Rim Light (边缘光)
    - Scanline Sweep (扫描线扫过)
  color_palette:
    - primary: Cyan (#00FFFF)
    - secondary: Electric Blue (#3B82F6)
    - accent: Neon Green (#39FF14)
```

### 1.3 Negative Constraints
- 🚫 不要在移动端启用 performance >= 3 的滤镜
- 🚫 不要让 Scanline opacity 超过 0.05
- 🚫 不要在 `MATERIALIZED` 状态同时启用多个滤镜
- 🚫 不要使用重心坐标方案（需要预处理几何体，影响动态加载）
- 🚫 不要在 Shader 中使用 `new` 关键字（性能陷阱）

## 2. Assessment

<Assessment>
**Complexity:** Level 3 (Graphics/Shader Programming)
</Assessment>

**Rationale:**
- 涉及 GLSL Shader 编写
- 需要后处理管线集成
- 需要程序化几何生成（网格背景）

## 3. Math/Algo Specification

<MathSpec>

### 3.1 网格线框 (Grid Wireframe)
```glsl
// 基于世界坐标的程序化网格
vec2 gridCoord = vWorldPosition.xz * gridScale;
vec2 grid = abs(fract(gridCoord - 0.5) - 0.5) / fwidth(gridCoord);
float gridLine = 1.0 - min(min(grid.x, grid.y), 1.0);
gridLine = smoothstep(0.0, wireframeWidth, gridLine);
```

**说明:**
- `fwidth()` 计算屏幕空间导数，实现抗锯齿
- `fract()` 生成重复网格
- `smoothstep()` 平滑边缘

### 3.2 增强菲涅尔边缘光
```glsl
vec3 viewDir = normalize(cameraPosition - vWorldPosition);
float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
float edgeGlow = fresnel * edgeIntensity;
```

**改进:**
- 指数从 2.0 提升至 3.0（更锐利的边缘）
- 添加 `edgeIntensity` uniform 控制强度

### 3.3 X-Ray 透视效果
```glsl
// 深度衰减
float depth = gl_FragCoord.z / gl_FragCoord.w;
float normalizedDepth = depth / farPlane;
float xray = 1.0 - smoothstep(0.0, 1.0, normalizedDepth);

// 混合模式
vec3 xrayColor = mix(baseColor, accentColor, xray);
```

### 3.4 Sobel 边缘检测 (后处理)
```glsl
// 3x3 Sobel 卷积核
mat3 sobelX = mat3(
  -1.0, 0.0, 1.0,
  -2.0, 0.0, 2.0,
  -1.0, 0.0, 1.0
);

mat3 sobelY = mat3(
  -1.0, -2.0, -1.0,
   0.0,  0.0,  0.0,
   1.0,  2.0,  1.0
);

// 采样周围像素
float gx = 0.0, gy = 0.0;
for (int i = -1; i <= 1; i++) {
  for (int j = -1; j <= 1; j++) {
    vec2 offset = vec2(i, j) * texelSize;
    float sample = texture2D(tDiffuse, vUv + offset).r;
    gx += sample * sobelX[i+1][j+1];
    gy += sample * sobelY[i+1][j+1];
  }
}

float edge = sqrt(gx * gx + gy * gy);
edge = step(threshold, edge);
```

</MathSpec>

## 4. The Plan

<ExecutionPlan>

### Block 1: Shader 核心升级
**Target:** `app/components/post-processing/materials/blueprint-material.tsx`

**Steps:**
1. 添加新 Uniforms:
   ```typescript
   gridScale: { value: 5.0 }
   wireframeWidth: { value: 0.05 }
   edgeIntensity: { value: 2.0 }
   gridColor: { value: new THREE.Color(COLORS.neonGreen) }
   xrayStrength: { value: 0.5 }
   ```

2. 修改 Fragment Shader:
   - 实现网格线框算法 (MathSpec 3.1)
   - 增强菲涅尔计算 (MathSpec 3.2)
   - 添加 X-Ray 透视 (MathSpec 3.3)
   - 组合所有效果

3. 更新 Props 接口:
   ```typescript
   interface BlueprintMaterialProps {
     // 现有 props...
     gridScale?: number;
     wireframeWidth?: number;
     edgeIntensity?: number;
     xrayStrength?: number;
   }
   ```

### Block 2: 后处理边缘检测
**Target:** `app/components/post-processing/effects/blueprint-edge-effect.tsx` (新建)

**Steps:**
1. 创建 Effect 类:
   ```typescript
   import { Effect } from 'postprocessing';

   const fragmentShader = /* glsl */ `
     uniform vec3 edgeColor;
     uniform float threshold;
     // Sobel 实现 (MathSpec 3.4)
   `;

   export class BlueprintEdgeEffect extends Effect {
     constructor(options) {
       super('BlueprintEdgeEffect', fragmentShader, {
         uniforms: new Map([
           ['edgeColor', new Uniform(new Color('#00FFFF'))],
           ['threshold', new Uniform(0.1)]
         ])
       });
     }
   }
   ```

2. 导出到 `effects/index.ts`

### Block 3: Composer 集成
**Target:** `app/components/post-processing/composer.tsx`

**Steps:**
1. 导入 `BlueprintEdgeEffect`
2. 条件渲染:
   ```tsx
   {filter === 'blueprint' && (
     <BlueprintEdgeEffect
       edgeColor={COLORS.cyan}
       threshold={0.1}
     />
   )}
   ```

### Block 4: 网格背景组件
**Target:** `app/components/scene/blueprint-grid-background.tsx` (新建)

**Steps:**
1. 创建全屏四边形:
   ```tsx
   const geometry = new THREE.PlaneGeometry(100, 100);
   const material = new THREE.ShaderMaterial({
     vertexShader: /* 基础 pass-through */,
     fragmentShader: /* 程序化网格 */,
     transparent: true,
     depthWrite: false
   });
   ```

2. 在 `scene-canvas.tsx` 中条件渲染:
   ```tsx
   {filter === 'blueprint' && <BlueprintGridBackground />}
   ```

### Block 5: 测试与调优
**Steps:**
1. 验证移动端性能 (performance: 2 限制)
2. 调整参数默认值
3. 确保与现有扫描线效果兼容
4. 测试不同模型几何体

</ExecutionPlan>

## 5. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| 重心坐标需要预处理几何体 | 高 | 使用世界坐标网格方案 |
| 多 Pass 渲染影响移动端 | 中 | 保持 performance: 2，使用单 Pass 合并 |
| Sobel 需要深度纹理 | 低 | 使用亮度通道替代 |
| 网格背景遮挡模型 | 低 | 设置 `renderOrder` 和 `depthWrite: false` |

## 6. Implementation Priority

**Phase 1 (核心):**
- Block 1: Shader 升级 (网格线框 + 增强边缘光)

**Phase 2 (增强):**
- Block 2: 后处理边缘检测
- Block 3: Composer 集成

**Phase 3 (可选):**
- Block 4: 网格背景
- 2D 标注系统 (后续迭代)

## 7. Success Criteria

- ✅ 网格线框清晰可见
- ✅ 边缘光强度可调
- ✅ X-Ray 透视效果自然
- ✅ 移动端帧率 >= 30fps
- ✅ 与现有扫描线效果无冲突
- ✅ 符合 PRD 颜色规范 (Cyan/Electric Blue/Neon Green)

</ExecutionPlan>
