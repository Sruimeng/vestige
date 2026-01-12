---
id: constitution
type: reference
related_ids: [doc-standard, tech-stack, data-model]
---

# Constitution - Graphics Engine Rules

## 1. Type Definitions

```typescript
// Coordinate System
type CoordinateSystem = 'right-handed-y-up';  // WebGL/THREE.js standard

// Matrix Storage
type MatrixOrder = 'column-major';  // OpenGL convention

// Precision
type FloatComparison = (a: number, b: number, epsilon?: number) => boolean;
const EPSILON = Number.EPSILON;

// Shader Types (GLSL <-> JS mapping)
interface UniformTypeMap {
  float: number;
  vec2: THREE.Vector2;
  vec3: THREE.Vector3;
  vec4: THREE.Vector4;
  mat3: THREE.Matrix3;
  mat4: THREE.Matrix4;
  sampler2D: THREE.Texture;
}
```

## 2. Matrix Order

```
RULE: Column-Major Storage
  THREE.js Matrix4.elements = [
    m11, m21, m31, m41,  // column 0
    m12, m22, m32, m42,  // column 1
    m13, m23, m33, m43,  // column 2
    m14, m24, m34, m44   // column 3
  ]

TRANSFORM ORDER: Scale -> Rotate -> Translate
  matrix = T * R * S  // right-to-left multiplication
```

## 3. Coordinate System

```
SYSTEM: Right-Handed Y-Up

AXES:
  +X = Right
  +Y = Up
  +Z = Toward Camera (out of screen)

ROTATION: Counter-clockwise when looking down axis
  - Euler order default: 'XYZ'
  - Quaternion: (x, y, z, w)

NDC (Normalized Device Coordinates):
  X: [-1, 1] left to right
  Y: [-1, 1] bottom to top
  Z: [-1, 1] near to far (WebGL)
```

## 4. Precision Rules

```typescript
// Float Comparison
function floatEquals(a: number, b: number): boolean {
  return Math.abs(a - b) < Number.EPSILON;
}

// Vector Comparison
function vec3Equals(a: THREE.Vector3, b: THREE.Vector3): boolean {
  return a.distanceTo(b) < Number.EPSILON;
}

// Angle Normalization
function normalizeAngle(rad: number): number {
  return ((rad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}
```

## 5. Graphics Pipeline

```
POST-PROCESSING STACK (@react-three/postprocessing):

  EffectComposer
    └── Effects[] (order matters)
        ├── Bloom          // glow extraction
        ├── ChromaticAberration
        ├── Vignette
        └── ToneMapping    // always last

EFFECT ORDER RULE:
  1. Geometry effects (SSAO, SSR)
  2. Color effects (ColorCorrection, HueSaturation)
  3. Blur effects (Bloom, DOF)
  4. Film effects (Grain, Vignette)
  5. Tone mapping (final)
```

## 6. Shader Uniform Rules

```typescript
// Type Safety
interface ShaderUniforms {
  uTime: { value: number };           // float
  uResolution: { value: THREE.Vector2 }; // vec2
  uMouse: { value: THREE.Vector2 };   // vec2
  uTexture: { value: THREE.Texture }; // sampler2D
}

// Update Pattern
useFrame((state) => {
  materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
});
```

## 7. Memory Rules

```
ALLOCATION:
  - Pre-allocate typed arrays outside render loop
  - Reuse Vector3/Matrix4 instances
  - Pool geometries and materials

DISPOSAL:
  geometry.dispose()
  material.dispose()
  texture.dispose()
  renderer.dispose()
```

## 8. Forbidden Patterns

```
RENDER LOOP VIOLATIONS:
  - new Float32Array() in useFrame
  - new THREE.Vector3() in useFrame
  - JSON.parse/stringify in animation
  - Array.map creating new arrays each frame

ARCHITECTURE VIOLATIONS:
  - Nesting depth > 3 levels
  - Bureaucratic naming (AbstractManagerImpl, FactoryFactory)
  - God components (>300 lines)
  - Inline shader strings (use .glsl files)

TYPE VIOLATIONS:
  - any type
  - Direct float equality (a === b)
  - Untyped uniforms
```

## 9. R3F Patterns

```typescript
// Ref Pattern
const meshRef = useRef<THREE.Mesh>(null);

// Frame Loop
useFrame((state, delta) => {
  if (!meshRef.current) return;
  meshRef.current.rotation.y += delta;
});

// Disposal
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);
```

## 10. Performance Thresholds

```
TARGETS:
  - 60 FPS minimum
  - Draw calls < 100
  - Triangles < 1M per frame
  - Texture memory < 512MB

MONITORING:
  - useFrame delta > 16.67ms = frame drop
  - renderer.info.render.calls
  - renderer.info.memory.geometries
```
