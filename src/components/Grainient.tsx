import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Camera, Geometry } from 'ogl';

interface GrainientProps {
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  className?: string;

  // Unified Particles Props
  showParticles?: boolean;
  particleCount?: number;
  particleSpread?: number;
  particleSpeed?: number;
  particleBaseSize?: number;
  cameraDistance?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
}

const hexToRgb = (hex: string): [number, number, number] => {
  if (!hex) return [1, 1, 1];
  
  const trimmed = hex.trim().toLowerCase();

  // Handle rgb/rgba formats
  if (trimmed.startsWith('rgb')) {
    const match = trimmed.match(/rgba?\(.*?(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) {
      const r = parseInt(match[1], 10) / 255;
      const g = parseInt(match[2], 10) / 255;
      const b = parseInt(match[3], 10) / 255;
      return [r, g, b];
    }
  }

  // Handle hex formats
  let hexCode = trimmed.replace(/^#/, '');
  
  // 3-digit hex: fff -> ffffff
  if (hexCode.length === 3) {
    hexCode = hexCode.split('').map(c => c + c).join('');
  }
  
  // 4-digit hex: fff0 -> ffffff00
  if (hexCode.length === 4) {
    hexCode = hexCode.split('').map(c => c + c).join('');
  }

  // Extract first 6 characters for R, G, B
  if (hexCode.length >= 6) {
    const r = parseInt(hexCode.substring(0, 2), 16) / 255;
    const g = parseInt(hexCode.substring(2, 4), 16) / 255;
    const b = parseInt(hexCode.substring(4, 6), 16) / 255;
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return [r, g, b];
    }
  }

  // Fallback
  return [1, 1, 1];
};

// Shaders for Grainient wave background
const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);} 
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);} 
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);} 
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

// Shaders for overlaying particle system (WebGL 2 syntax)
const particlesVertex = `#version 300 es
in vec3 position;
in vec4 random;
in vec3 color;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uSpread;
uniform float uBaseSize;
uniform float uSizeRandomness;

out vec4 vRandom;
out vec3 vColor;

void main() {
  vRandom = random;
  vColor = color;
  
  vec3 pos = position * uSpread;
  pos.z *= 1.5; // Custom z-stretching to float safely in front of camera
  
  vec4 mPos = modelMatrix * vec4(pos, 1.0);
  float t = uTime;
  mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
  mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
  mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
  
  vec4 mvPos = viewMatrix * mPos;

  if (uSizeRandomness == 0.0) {
    gl_PointSize = uBaseSize;
  } else {
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
  }
  
  gl_Position = projectionMatrix * mvPos;
}
`;

const particlesFragment = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAlphaParticles;
in vec4 vRandom;
in vec3 vColor;
out vec4 fragColor;

void main() {
  vec2 uv = gl_PointCoord.xy;
  float d = length(uv - vec2(0.5));
  
  if (uAlphaParticles < 0.5) {
    if (d > 0.5) {
      discard;
    }
    fragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
  } else {
    float circle = smoothstep(0.5, 0.4, d) * 0.8;
    fragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
  }
}
`;

type GrainientCtx = {
  renderer: InstanceType<typeof Renderer>;
  program: InstanceType<typeof Program>;
  mesh: InstanceType<typeof Mesh>;
};
const ctxMap = new WeakMap<HTMLDivElement, GrainientCtx>();

const Grainient: React.FC<GrainientProps> = ({
  timeSpeed = 0.25,
  colorBalance = 0.0,
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.1,
  grainScale = 2.0,
  grainAnimated = true,
  contrast = 1.5,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  color1 = '#b071dfff',
  color2 = '#d662ab',
  color3 = '#917df1',
  className = '',

  // Unified Particles defaults
  showParticles = false,
  particleCount = 70,
  particleSpread = 7,
  particleSpeed = 0.04,
  particleBaseSize = 30,
  cameraDistance = 30,
  particleColors = ['#B071DF', '#d8b4fe', '#ffffff'],
  moveParticlesOnHover = true,
  particleHoverFactor = 1
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Create OGL Renderer (uses WebGL 2 by default, transparent alpha)
    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.background = 'transparent';
    canvas.style.backgroundColor = 'transparent';
    container.appendChild(canvas);

    // 2. Create Grainient Wave Mesh
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime:           { value: 0 },
        iResolution:     { value: new Float32Array([1, 1]) },
        uTimeSpeed:      { value: 0.25 },
        uColorBalance:   { value: 0.0 },
        uWarpStrength:   { value: 1.0 },
        uWarpFrequency:  { value: 5.0 },
        uWarpSpeed:      { value: 2.0 },
        uWarpAmplitude:  { value: 50.0 },
        uBlendAngle:     { value: 0.0 },
        uBlendSoftness:  { value: 0.05 },
        uRotationAmount: { value: 500.0 },
        uNoiseScale:     { value: 2.0 },
        uGrainAmount:    { value: 0.1 },
        uGrainScale:     { value: 2.0 },
        uGrainAnimated:  { value: 0.0 },
        uContrast:       { value: 1.5 },
        uGamma:          { value: 1.0 },
        uSaturation:     { value: 1.0 },
        uCenterOffset:   { value: new Float32Array([0, 0]) },
        uZoom:           { value: 0.9 },
        uColor1:         { value: new Float32Array([1, 1, 1]) },
        uColor2:         { value: new Float32Array([1, 1, 1]) },
        uColor3:         { value: new Float32Array([1, 1, 1]) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    // 3. Create Particles mesh if enabled (all in the exact same WebGL canvas!)
    let particlesMesh: InstanceType<typeof Mesh> | null = null;
    let particlesProgram: InstanceType<typeof Program> | null = null;
    let particlesCamera: InstanceType<typeof Camera> | null = null;

    if (showParticles) {
      particlesCamera = new Camera(gl, { fov: 15 });
      particlesCamera.position.set(0, 0, cameraDistance);

      const count = particleCount;
      const positions = new Float32Array(count * 3);
      const randoms = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);
      const palette = particleColors;

      for (let i = 0; i < count; i++) {
        let x: number, y: number, z: number, len: number;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          z = Math.random() * 2 - 1;
          len = x * x + y * y + z * z;
        } while (len > 1 || len === 0);
        const r = Math.cbrt(Math.random());
        positions.set([x * r, y * r, z * r], i * 3);
        randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
        const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
        colors.set(col, i * 3);
      }

      const particlesGeometry = new Geometry(gl, {
        position: { size: 3, data: positions },
        random: { size: 4, data: randoms },
        color: { size: 3, data: colors }
      });

      particlesProgram = new Program(gl, {
        vertex: particlesVertex,
        fragment: particlesFragment,
        uniforms: {
          uTime: { value: 0 },
          uSpread: { value: particleSpread },
          uBaseSize: { value: particleBaseSize * Math.min(window.devicePixelRatio || 1, 2) },
          uSizeRandomness: { value: 1.0 },
          uAlphaParticles: { value: 0.0 }
        },
        transparent: true,
        depthTest: false
      });

      particlesMesh = new Mesh(gl, { mode: gl.POINTS, geometry: particlesGeometry, program: particlesProgram });
    }

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);

      const res = (program.uniforms.iResolution as { value: Float32Array }).value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;

      if (showParticles && particlesCamera) {
        particlesCamera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      }

      // Draw grainient first
      renderer.render({ scene: mesh });
      // Draw particles on top without clearing the buffer
      if (showParticles && particlesMesh && particlesCamera) {
        renderer.render({ scene: particlesMesh, camera: particlesCamera, clear: false });
      }
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = (e.clientX / w) * 2 - 1;
      const y = -((e.clientY / h) * 2 - 1);
      mouseRef.current = { x, y };
    };

    if (showParticles && moveParticlesOnHover) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    let lastTime = performance.now();
    let elapsedParticles = 0;

    const loop = (t: number) => {
      const elapsedSeconds = (t - t0) * 0.001;

      // Update and draw Grainient
      (program.uniforms.iTime as { value: number }).value = elapsedSeconds;
      renderer.render({ scene: mesh });

      // Update and draw Particles on top in the same render loop!
      if (showParticles && particlesMesh && particlesProgram && particlesCamera) {
        const delta = t - lastTime;
        lastTime = t;
        elapsedParticles += delta * particleSpeed;
        particlesProgram.uniforms.uTime.value = elapsedParticles * 0.001;

        if (moveParticlesOnHover) {
          particlesMesh.position.x = -mouseRef.current.x * particleHoverFactor;
          particlesMesh.position.y = -mouseRef.current.y * particleHoverFactor;
        } else {
          particlesMesh.position.x = 0;
          particlesMesh.position.y = 0;
        }

        particlesMesh.rotation.x = Math.sin(elapsedParticles * 0.0002) * 0.1;
        particlesMesh.rotation.y = Math.cos(elapsedParticles * 0.0005) * 0.15;
        particlesMesh.rotation.z += 0.01 * particleSpeed;

        renderer.render({ scene: particlesMesh, camera: particlesCamera, clear: false });
      }

      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    };
    const tryStop = () => {
      if (raf !== 0) { cancelAnimationFrame(raf); raf = 0; }
    };

    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; isVisible ? tryStart() : tryStop(); },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (showParticles && moveParticlesOnHover) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      ctxMap.delete(container);
      try { container.removeChild(canvas); } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const { program } = ctx;
    const u = program.uniforms as Record<string, { value: any }>;

    u.uTimeSpeed.value      = timeSpeed;
    u.uColorBalance.value   = colorBalance;
    u.uWarpStrength.value   = warpStrength;
    u.uWarpFrequency.value  = warpFrequency;
    u.uWarpSpeed.value      = warpSpeed;
    u.uWarpAmplitude.value  = warpAmplitude;
    u.uBlendAngle.value     = blendAngle;
    u.uBlendSoftness.value  = blendSoftness;
    u.uRotationAmount.value = rotationAmount;
    u.uNoiseScale.value     = noiseScale;
    u.uGrainAmount.value    = grainAmount;
    u.uGrainScale.value     = grainScale;
    u.uGrainAnimated.value  = grainAnimated ? 1.0 : 0.0;
    u.uContrast.value       = contrast;
    u.uGamma.value          = gamma;
    u.uSaturation.value     = saturation;
    u.uCenterOffset.value   = new Float32Array([centerX, centerY]);
    u.uZoom.value           = zoom;
    u.uColor1.value         = new Float32Array(hexToRgb(color1));
    u.uColor2.value         = new Float32Array(hexToRgb(color2));
    u.uColor3.value         = new Float32Array(hexToRgb(color3));
  }, [
    timeSpeed, colorBalance, warpStrength, warpFrequency, warpSpeed,
    warpAmplitude, blendAngle, blendSoftness, rotationAmount, noiseScale,
    grainAmount, grainScale, grainAnimated, contrast, gamma, saturation,
    centerX, centerY, zoom, color1, color2, color3
  ]);

  return <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`.trim()} />;
};

export default Grainient;
