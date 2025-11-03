import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// ============ STYLES ============
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

  .bg-root * { margin: 0; padding: 0; outline: none !important; box-sizing: border-box; }
  .bg-root { width: 100%; height: 100%; overflow-x: hidden; background: #000000; font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif; }

  .bg-crt-frame {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .bg-crt-frame canvas { display: block; width: 100% !important; height: 100% !important; pointer-events: none; }

  .bg-hero-wrapper {
    position: fixed;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .bg-hero-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 55%;
    background: linear-gradient(to top, #000000 0%, #000000 8%, transparent 100%);
    z-index: 5;
    pointer-events: none !important;
    will-change: auto;
    transform: translateZ(0);
  }

  .bg-hero-fade-top {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 20%;
    background: linear-gradient(to bottom, #000000 0%, #000000 5%, transparent 100%);
    z-index: 5;
    pointer-events: none !important;
    will-change: auto;
    transform: translateZ(0);
  }

  .bg-crt-frame {
    opacity: 1;
  }
  .bg-crt-frame.visible {
    opacity: 1;
  }
  .bg-hero-fade,
  .bg-hero-fade-top {
    opacity: 0;
    transition: opacity 2s cubic-bezier(0.25, 0.1, 0.25, 1);
    transition-delay: 1.0s;
  }
  .bg-hero-fade.anim-in,
  .bg-hero-fade-top.anim-in {
    opacity: 1;
  }

`;

export default function Background() {
  const crtFrameRef = useRef(null);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [fadesIn, setFadesIn] = useState(false);

  const threeRefs = useRef({});

  useEffect(() => {
    const container = crtFrameRef.current;
    if (!container) return;

    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
    const gpuTier = (() => {
      const gl = document.createElement("canvas").getContext("webgl");
      if (!gl) return "low";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      const gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL).toLowerCase() : "";
      if (/apple gpu|apple m/.test(gpu)) return "high";
      if (/swiftshader|llvmpipe|mali-4|adreno 3/.test(gpu)) return "low";
      if (/intel(?!.*(iris|uhd|arc))/.test(gpu)) return "low";
      if (/mali-g[567]|adreno [45]|intel (iris|uhd)|geforce (mx|gt)|radeon (rx )?(5[0-4]|vega 8)/.test(gpu)) return "mid";
      return "high";
    })();

    const qualityPresets = {
      low:  { pixelRatio: 0.75, marchSteps: 32, aoSteps: 2 },
      mid:  { pixelRatio: 0.9,  marchSteps: 40, aoSteps: 2 },
      high: { pixelRatio: 1.0,  marchSteps: 50, aoSteps: 2 },
    };
    let currentTier = isMobile ? "low" : gpuTier;
    let quality = { ...qualityPresets[currentTier] };
    const settings = {
      dither:    { enabled: true, dotSize: quality.dotSize, dotGap: quality.dotGap, brightness: 0.85, contrast: 0.60, threshold: 0.03, dotColor: [1.0, 1.0, 1.0], bgColor: [0.00784, 0.00784, 0.01176] },
      crosshatch:{ enabled: false, intensity: 0.95, angle: 0.4363 },
      bloom:     { enabled: quality.bloomEnabled, intensity: 0.55, size: 1.50 },
      crt:       { enabled: true, curvature: 0.0, scanlines: quality.scanlines, vignette: 2.00, chroma: 0.0 },
      scene:     { gooeyness: 1.20, speed: 0.85 },
    };

    const mouse = new THREE.Vector2(0, 0);
    let mouseInScene = false;
    let mousePressed = false;
    let mouseSphereRadius = 0.0;
    const mouseSphereTargetRadius = 0.55;
    const mouseSphereClickRadius = 0.95;
    const mouseWorld = new THREE.Vector3(0, 0, 0);
    const mouseWorldTarget = new THREE.Vector3(0, 0, 0);
    const mouseDamping = 0.15;

    const scene = new THREE.Scene();
    scene.background = null;
    const getSize = () => ({ width: window.innerWidth, height: window.innerHeight });
    let size = getSize();

    const camera = new THREE.PerspectiveCamera(60, size.width / size.height, 0.1, 100);
    camera.position.set(0, 0, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.pixelRatio));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.enabled = false;
    controls.target.x = 2.0;

    let pageVisible = true;
    const onPointerMove = (e) => {
      mouseInScene = true;
      const x = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const y = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      mouse.x = (x / window.innerWidth) * 2 - 1;
      mouse.y = -(y / window.innerHeight) * 2 + 1;
    };
    document.addEventListener("mousemove", onPointerMove, { passive: true });
    document.addEventListener("touchmove", onPointerMove, { passive: true });
    document.addEventListener("mouseenter", () => { mouseInScene = true; }, { passive: true });
    document.addEventListener("mouseleave", () => { mouseInScene = false; }, { passive: true });
    document.addEventListener("touchstart", (e) => { mouseInScene = true; mousePressed = true; onPointerMove(e); }, { passive: true });
    document.addEventListener("touchend", () => { mousePressed = false; mouseInScene = false; }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      pageVisible = !document.hidden;
      if (document.hidden) mouseInScene = false;
    });
    document.addEventListener("mousedown", () => { mousePressed = true; }, { passive: true });
    document.addEventListener("mouseup", () => { mousePressed = false; }, { passive: true });

    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    const quadMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime:             { value: 0 },
        uResolution:       { value: new THREE.Vector2(size.width, size.height) },
        uCameraPos:        { value: camera.position.clone() },
        uCameraTarget:     { value: new THREE.Vector3(2.0, 0, 0) },
        uPixelRatio:       { value: Math.min(window.devicePixelRatio, 1.5) },
        uGooeyness:        { value: settings.scene.gooeyness },
        uSpeed:            { value: settings.scene.speed },
        uMouseSpherePos:   { value: new THREE.Vector3(0, 0, 0) },
        uMouseSphereRadius:{ value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        #define MARCH_STEPS ${quality.marchSteps}
        #define AO_STEPS ${quality.aoSteps}
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uCameraPos;
        uniform vec3 uCameraTarget;
        uniform float uPixelRatio;
        uniform float uGooeyness;
        uniform float uSpeed;
        uniform vec3 uMouseSpherePos;
        uniform float uMouseSphereRadius;

        varying vec2 vUv;

        float smin(float a, float b, float k) {
          float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
          return mix(b, a, h) - k * h * (1.0 - h);
        }

        float sdSphere(vec3 p, vec3 center, float radius) {
          return length(p - center) - radius;
        }

        float sceneCompound(vec3 p, float t, float k) {
          float angle1 = t * 0.5;
          float angle2 = t * 0.5 + 3.14159;
          vec3 c1 = vec3(
            cos(angle1) * 2.4 + sin(t * 0.25) * 0.3,
            sin(angle1 * 0.6) * 0.8 + cos(t * 0.4) * 0.2,
            sin(angle1 * 0.35) * 0.6
          );
          vec3 c2 = vec3(
            cos(angle2) * 2.4 + sin(t * 0.3) * 0.3,
            sin(angle2 * 0.6) * 0.8 - cos(t * 0.35) * 0.2,
            sin(angle2 * 0.35) * 0.6
          );
          float s1 = sdSphere(p, c1, 1.2 + 0.07 * sin(t * 2.5));
          float s2 = sdSphere(p, c2, 1.05 + 0.07 * cos(t * 2.0));

          vec3 c3 = c1 + vec3(sin(t * 1.8) * 0.9, cos(t * 2.2) * 0.9, sin(t * 1.5) * 0.6);
          vec3 c4 = c2 + vec3(-cos(t * 1.5) * 0.8, sin(t * 1.9) * 0.8, -cos(t * 1.7) * 0.5);
          float s3 = sdSphere(p, c3, 0.55);
          float s4 = sdSphere(p, c4, 0.5);

          vec3 c5 = vec3(sin(t * 0.7) * 3.0, cos(t * 0.55) * 1.2, cos(t * 0.45) * 0.7);
          vec3 c6 = vec3(-cos(t * 0.65) * 2.8, sin(t * 0.75) * 1.0, sin(t * 0.5) * 0.8);
          float s5 = sdSphere(p, c5, 0.6);
          float s6 = sdSphere(p, c6, 0.55);

          vec3 c7 = vec3(
            cos(t * 0.85) * 3.8,
            sin(t * 0.65) * 1.6 + 0.5,
            sin(t * 0.55) * 1.2
          );
          vec3 c8 = vec3(
            -cos(t * 0.75) * 3.5,
            cos(t * 0.95) * 1.4 - 0.4,
            -cos(t * 0.6) * 1.0
          );
          vec3 c9 = vec3(
            sin(t * 1.1) * 3.2,
            cos(t * 0.85) * 1.8 + 0.8,
            sin(t * 0.7) * 1.5
          );
          vec3 c10 = vec3(
            -sin(t * 0.9) * 4.0,
            -cos(t * 0.7) * 1.5 - 0.3,
            -sin(t * 0.8) * 0.9
          );
          float s7 = sdSphere(p, c7, 0.45);
          float s8 = sdSphere(p, c8, 0.4);
          float s9 = sdSphere(p, c9, 0.5);
          float s10 = sdSphere(p, c10, 0.35);

          float d = smin(s1, s2, k);
          d = smin(d, s3, k * 0.7);
          d = smin(d, s4, k * 0.7);
          d = smin(d, s5, k * 0.8);
          d = smin(d, s6, k * 0.8);
          d = smin(d, s7, k * 0.6);
          d = smin(d, s8, k * 0.6);
          d = smin(d, s9, k * 0.7);
          d = smin(d, s10, k * 0.5);
          return d;
        }

        float sceneSDF(vec3 p) {
          float t = uTime * uSpeed;
          float k = uGooeyness;
          float d = sceneCompound(p, t, k);
          if (uMouseSphereRadius > 0.001) {
            float ms = sdSphere(p, uMouseSpherePos, uMouseSphereRadius);
            d = smin(d, ms, k * 0.8);
          }
          return d;
        }

        vec3 computeBlendedColor(vec3 p, float t) {
          float a1 = t * 0.5;
          float a2 = t * 0.5 + 3.14159;
          vec3 c1 = vec3(cos(a1) * 2.4 + sin(t * 0.25) * 0.3, sin(a1 * 0.6) * 0.8 + cos(t * 0.4) * 0.2, sin(a1 * 0.35) * 0.6);
          vec3 c2 = vec3(cos(a2) * 2.4 + sin(t * 0.3) * 0.3, sin(a2 * 0.6) * 0.8 - cos(t * 0.35) * 0.2, sin(a2 * 0.35) * 0.6);
          vec3 c3 = c1 + vec3(sin(t * 1.8) * 0.9, cos(t * 2.2) * 0.9, sin(t * 1.5) * 0.6);
          vec3 c4 = c2 + vec3(-cos(t * 1.5) * 0.8, sin(t * 1.9) * 0.8, -cos(t * 1.7) * 0.5);
          vec3 c5 = vec3(sin(t * 0.7) * 3.0, cos(t * 0.55) * 1.2, cos(t * 0.45) * 0.7);
          vec3 c6 = vec3(-cos(t * 0.65) * 2.8, sin(t * 0.75) * 1.0, sin(t * 0.5) * 0.8);
          vec3 c7 = vec3(cos(t * 0.85) * 3.8, sin(t * 0.65) * 1.6 + 0.5, sin(t * 0.55) * 1.2);
          vec3 c8 = vec3(-cos(t * 0.75) * 3.5, cos(t * 0.95) * 1.4 - 0.4, -cos(t * 0.6) * 1.0);
          vec3 c9 = vec3(sin(t * 1.1) * 3.2, cos(t * 0.85) * 1.8 + 0.8, sin(t * 0.7) * 1.5);
          vec3 c10 = vec3(-sin(t * 0.9) * 4.0, -cos(t * 0.7) * 1.5 - 0.3, -sin(t * 0.8) * 0.9);
          vec3 co1 = vec3(0.66, 0.78, 0.69);
          vec3 co2 = vec3(0.91, 0.85, 0.78);
          vec3 co3 = vec3(0.72, 0.70, 0.66);
          float ep = 0.001;
          float w1 = 1.0 / (dot(p - c1, p - c1) + ep);
          float w2 = 1.0 / (dot(p - c2, p - c2) + ep);
          float w3 = 1.0 / (dot(p - c3, p - c3) + ep);
          float w4 = 1.0 / (dot(p - c4, p - c4) + ep);
          float w5 = 1.0 / (dot(p - c5, p - c5) + ep);
          float w6 = 1.0 / (dot(p - c6, p - c6) + ep);
          float w7 = 1.0 / (dot(p - c7, p - c7) + ep);
          float w8 = 1.0 / (dot(p - c8, p - c8) + ep);
          float w9 = 1.0 / (dot(p - c9, p - c9) + ep);
          float w10 = 1.0 / (dot(p - c10, p - c10) + ep);
          float tot = w1 + w2 + w3 + w4 + w5 + w6 + w7 + w8 + w9 + w10;
          return (co1 * (w1 + w4 + w7 + w10) + co2 * (w2 + w5 + w8) + co3 * (w3 + w6 + w9)) / tot;
        }

        vec3 calcNormal(vec3 p) {
          const float eps = 0.001;
          vec2 h = vec2(eps, 0.0);
          return normalize(vec3(
            sceneSDF(p + h.xyy) - sceneSDF(p - h.xyy),
            sceneSDF(p + h.yxy) - sceneSDF(p - h.yxy),
            sceneSDF(p + h.yyx) - sceneSDF(p - h.yyx)
          ));
        }

        float calcAO(vec3 pos, vec3 nor) {
          float occ = 0.0;
          float sca = 1.0;
          for (int i = 0; i < AO_STEPS; i++) {
            float h = 0.02 + 0.15 * float(i);
            float d = sceneSDF(pos + h * nor);
            occ += (h - d) * sca;
            sca *= 0.9;
          }
          return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
        }

        float fresnel(vec3 viewDir, vec3 normal, float power) {
          return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
        }

        float cheapShadow(vec3 pos, vec3 lightDir) {
          float d1 = sceneSDF(pos + lightDir * 0.15);
          float d2 = sceneSDF(pos + lightDir * 0.4);
          float d3 = sceneSDF(pos + lightDir * 0.8);
          return clamp(0.3 + 0.7 * smoothstep(0.0, 0.3, min(min(d1, d2), d3)), 0.0, 1.0);
        }

        mat3 setCamera(vec3 ro, vec3 ta, float cr) {
          vec3 cw = normalize(ta - ro);
          vec3 cp = vec3(sin(cr), cos(cr), 0.0);
          vec3 cu = normalize(cross(cw, cp));
          vec3 cv = normalize(cross(cu, cw));
          return mat3(cu, cv, cw);
        }

        void main() {
          vec2 fragCoord = vUv * uResolution;
          vec2 uv = (2.0 * fragCoord - uResolution) / uResolution.y;
          vec3 ro = uCameraPos;
          vec3 ta = uCameraTarget;
          mat3 ca = setCamera(ro, ta, 0.0);
          vec3 rd = ca * normalize(vec3(uv, 1.8));
          float t = 0.0;
          float d;
          vec3 p;
          bool hit = false;
          for (int i = 0; i < MARCH_STEPS; i++) {
            p = ro + rd * t;
            d = sceneSDF(p);
            if (d < 0.002) { hit = true; break; }
            t += d * 0.9;
            if (t > 12.0) break;
          }
          vec3 col = vec3(0.0);
          if (hit) {
            vec3 nor = calcNormal(p);
            vec3 viewDir = normalize(ro - p);
            vec3 lightPos1 = vec3(3.0, 4.0, 5.0);
            vec3 lightPos2 = vec3(-4.0, 2.0, -3.0);
            vec3 lightDir1 = normalize(lightPos1 - p);
            vec3 lightDir2 = normalize(lightPos2 - p);
            float diff1 = max(dot(nor, lightDir1), 0.0);
            float diff2 = max(dot(nor, lightDir2), 0.0);
            vec3 halfDir1 = normalize(lightDir1 + viewDir);
            vec3 halfDir2 = normalize(lightDir2 + viewDir);
            float spec1 = pow(max(dot(nor, halfDir1), 0.0), 64.0);
            float spec2 = pow(max(dot(nor, halfDir2), 0.0), 32.0);
            float sha1 = cheapShadow(p + nor * 0.01, lightDir1);
            float sha2 = cheapShadow(p + nor * 0.01, lightDir2);
            float ao = calcAO(p, nor);
            float sss = max(0.0, dot(viewDir, -lightDir1)) * 0.3;
            float t = uTime * uSpeed;
            vec3 sphereColor = computeBlendedColor(p, t);
            float nl = diff1 * sha1 * 0.7 + diff2 * sha2 * 0.3;
            vec3 diffuse = sphereColor * nl * 1.8;
            vec3 ambient = sphereColor * 0.2 * ao;
            float softRim = pow(1.0 - max(dot(viewDir, nor), 0.0), 3.0);
            vec3 rim = sphereColor * softRim * 0.15;
            vec3 softSpec = vec3(0.5) * pow(max(dot(nor, halfDir1), 0.0), 20.0) * sha1 * 0.3;
            col = ambient + diffuse + rim + softSpec;
          }
          col = col / (col + vec3(0.8));
          col = pow(col, vec3(1.0 / 2.2));
          col *= 1.2;
          float vig = 1.0 - 0.15 * dot(uv * 0.5, uv * 0.5);
          col *= vig;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });

    const quad = new THREE.Mesh(quadGeometry, quadMaterial);
    quad.name = "raymarchQuad";
    quad.frustumCulled = false;

    const quadScene = new THREE.Scene();
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quadScene.add(quad);

    const composer = new EffectComposer(renderer);
    composer.setSize(size.width, size.height);
    const renderPass = new RenderPass(quadScene, quadCamera);
    composer.addPass(renderPass);
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    let scrollY = 0;
    let smoothScrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    const tierOrder = ["high", "mid", "low"];
    let fpsFrames = 0;
    let fpsStartTime = performance.now();
    let fpsWatchdogActive = true;
    const FPS_SAMPLE_WINDOW = 2000;
    const FPS_THRESHOLD = 30;

    function downgradeQuality() {
      const currentIndex = tierOrder.indexOf(currentTier);
      if (currentIndex >= tierOrder.length - 1) { fpsWatchdogActive = false; return; }
      const nextTier = tierOrder[currentIndex + 1];
      currentTier = nextTier;
      quality = { ...qualityPresets[currentTier] };
      const pr = Math.min(window.devicePixelRatio, quality.pixelRatio);
      renderer.setPixelRatio(pr);
      renderer.setSize(size.width, size.height);
      composer.setSize(size.width, size.height);
      fpsFrames = 0;
      fpsStartTime = performance.now();
      if (currentIndex + 1 >= tierOrder.length - 1) fpsWatchdogActive = false;
    }

    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const _forward = new THREE.Vector3();

    function animate() {
      if (!pageVisible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      controls.update();

      const targetR = mouseInScene ? (mousePressed ? mouseSphereClickRadius : mouseSphereTargetRadius) : 0.0;
      const fadeSpeed = mouseInScene ? (mousePressed ? 10.0 : 6.0) : 3.0;
      const step = Math.min(1.0, fadeSpeed * dt);
      mouseSphereRadius += (targetR - mouseSphereRadius) * step;
      if (mouseSphereRadius < 0.005 && !mouseInScene) mouseSphereRadius = 0.0;

      raycaster.setFromCamera(mouse, camera);
      const rayDir = raycaster.ray.direction;
      const rayOrigin = raycaster.ray.origin;
      _forward.subVectors(controls.target, camera.position).normalize();
      const dist = camera.position.distanceTo(controls.target);
      const t = dist / rayDir.dot(_forward);
      mouseWorldTarget.copy(rayOrigin).addScaledVector(rayDir, t);
      mouseWorld.lerp(mouseWorldTarget, mouseDamping);

      smoothScrollY += (scrollY - smoothScrollY) * 0.1;
      const vh = window.innerHeight;
      const scrollProgress = Math.min(smoothScrollY / vh, 1.0);
      const baseZ = 5;
      const baseCamY = 0;
      camera.position.y = baseCamY + scrollProgress * 1.5;
      camera.position.z = baseZ + scrollProgress * 0.8;
      controls.target.y = scrollProgress * 0.8;

      quadMaterial.uniforms.uMouseSpherePos.value.copy(mouseWorld);
      quadMaterial.uniforms.uMouseSphereRadius.value = mouseSphereRadius;
      quadMaterial.uniforms.uTime.value = elapsed;
      quadMaterial.uniforms.uCameraPos.value.copy(camera.position);
      quadMaterial.uniforms.uCameraTarget.value.copy(controls.target);
      composer.render();

      if (fpsWatchdogActive) {
        fpsFrames++;
        const elapsed_ms = performance.now() - fpsStartTime;
        if (elapsed_ms >= FPS_SAMPLE_WINDOW) {
          const avgFps = (fpsFrames / elapsed_ms) * 1000;
          if (avgFps < FPS_THRESHOLD) downgradeQuality();
          else fpsWatchdogActive = false;
        }
      }
    }

    renderer.setAnimationLoop(animate);

    let resizeTimeout = null;
    const handleResize = () => {
      size = getSize();
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      const pr = Math.min(window.devicePixelRatio, quality.pixelRatio);
      renderer.setPixelRatio(pr);
      renderer.setSize(size.width, size.height);
      quadMaterial.uniforms.uResolution.value.set(size.width, size.height);
      quadMaterial.uniforms.uPixelRatio.value = pr;
      composer.setSize(size.width, size.height);
    };
    const onResize = () => {
      clearTimeout(resizeTimeout);
      renderer.domElement.style.width = window.innerWidth + "px";
      renderer.domElement.style.height = window.innerHeight + "px";
      resizeTimeout = setTimeout(handleResize, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    function initSectionScenes() {
      const researchWrap = document.getElementById("research-canvas");
      if (researchWrap) {
        const rScene = new THREE.Scene();
        rScene.background = new THREE.Color(0x020203);
        const rCam = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        rCam.position.set(0, 0, 12);
        const rRenderer = new THREE.WebGLRenderer({ antialias: false });
        rRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        researchWrap.appendChild(rRenderer.domElement);

        const R_PARTICLE_COUNT = 320;
        const rPosArr = new Float32Array(R_PARTICLE_COUNT * 3);
        const rHomeArr = new Float32Array(R_PARTICLE_COUNT * 3);
        const rVelArr = new Float32Array(R_PARTICLE_COUNT * 3);
        for (let i = 0; i < R_PARTICLE_COUNT; i++) {
          const hx = (Math.random() - 0.5) * 42;
          const hy = (Math.random() - 0.5) * 18;
          const hz = (Math.random() - 0.5) * 6;
          rPosArr[i * 3] = hx; rPosArr[i * 3 + 1] = hy; rPosArr[i * 3 + 2] = hz;
          rHomeArr[i * 3] = hx; rHomeArr[i * 3 + 1] = hy; rHomeArr[i * 3 + 2] = hz;
          rVelArr[i * 3] = (Math.random() - 0.5) * 0.005;
          rVelArr[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
          rVelArr[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
        }
        const rPGeo = new THREE.BufferGeometry();
        rPGeo.setAttribute("position", new THREE.BufferAttribute(rPosArr, 3));
        const rPMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.9, sizeAttenuation: true, transparent: true, opacity: 0.45 });
        const rPoints = new THREE.Points(rPGeo, rPMat);
        rPoints.name = "researchParticles";
        rScene.add(rPoints);

        const rLineGeo = new THREE.BufferGeometry();
        const rMaxLines = 600;
        const rLinePos = new Float32Array(rMaxLines * 6);
        const rLineColors = new Float32Array(rMaxLines * 6);
        rLineGeo.setAttribute("position", new THREE.BufferAttribute(rLinePos, 3));
        rLineGeo.setAttribute("color", new THREE.BufferAttribute(rLineColors, 3));
        const rLineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.2 });
        const rLines = new THREE.LineSegments(rLineGeo, rLineMat);
        rLines.name = "researchLines";
        rScene.add(rLines);

        const rComposer = new EffectComposer(rRenderer);
        rComposer.addPass(new RenderPass(rScene, rCam));
        const rDotPass = new ShaderPass({
          uniforms: {
            tDiffuse:    { value: null },
            uResolution: { value: new THREE.Vector2(400, 400) },
            uDotSize:    { value: 3.5 },
            uDotGap:     { value: 2.0 },
            uBrightness: { value: 1.0 },
            uContrast:   { value: 0.5 },
            uBgColor:    { value: new THREE.Vector3(0.00784, 0.00784, 0.01176) },
          },
          vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
          fragmentShader: `
            precision highp float;
            uniform sampler2D tDiffuse;
            uniform vec2 uResolution;
            uniform float uDotSize, uDotGap, uBrightness, uContrast;
            uniform vec3 uBgColor;
            varying vec2 vUv;
            void main() {
              vec2 px = vUv * uResolution;
              float sp = uDotSize + uDotGap;
              vec2 cell = floor(px / sp);
              vec2 center = (cell + 0.5) * sp;
              vec2 sUV = center / uResolution;
              vec3 c = texture2D(tDiffuse, sUV).rgb;
              float lum = dot(c, vec3(0.299, 0.587, 0.114)) * uBrightness;
              lum = clamp((lum - 0.5) / uContrast + 0.5, 0.0, 1.0);
              if (lum < 0.02) { gl_FragColor = vec4(uBgColor, 1.0); return; }
              float maxR = uDotSize * 0.5;
              float r = mix(0.3, maxR, pow(lum, uContrast));
              float d = length(px - center);
              float mask = 1.0 - smoothstep(r - 0.5, r + 0.5, d);
              vec3 dotCol = vec3(1.0) * lum * 1.2;
              gl_FragColor = vec4(mix(uBgColor, dotCol, mask), 1.0);
            }
          `,
        });
        rComposer.addPass(rDotPass);
        rComposer.addPass(new OutputPass());

        const rMouse = new THREE.Vector2(9999, 9999);
        const rMouseWorld = new THREE.Vector3(9999, 9999, 0);
        let rMouseActive = false;
        const rRaycaster = new THREE.Raycaster();
        const rMousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        researchWrap.style.pointerEvents = "auto";
        researchWrap.style.touchAction = "pan-y";

        researchWrap.addEventListener("mousemove", (e) => {
          const rect = researchWrap.getBoundingClientRect();
          rMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          rMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          rRaycaster.setFromCamera(rMouse, rCam);
          const target = new THREE.Vector3();
          rRaycaster.ray.intersectPlane(rMousePlane, target);
          rMouseWorld.copy(target);
          rMouseActive = true;
        });
        researchWrap.addEventListener("mouseleave", () => {
          rMouseActive = false;
          rMouseWorld.set(9999, 9999, 0);
        });
        researchWrap.addEventListener("touchmove", (e) => {
          const touch = e.touches[0];
          const rect = researchWrap.getBoundingClientRect();
          rMouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          rMouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
          rRaycaster.setFromCamera(rMouse, rCam);
          const target = new THREE.Vector3();
          rRaycaster.ray.intersectPlane(rMousePlane, target);
          rMouseWorld.copy(target);
          rMouseActive = true;
        }, { passive: true });
        researchWrap.addEventListener("touchend", () => {
          rMouseActive = false;
          rMouseWorld.set(9999, 9999, 0);
        });

        let rActive = false;
        const rObs = new IntersectionObserver((entries) => {
          rActive = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        rObs.observe(researchWrap);

        function researchSize() {
          const w = researchWrap.clientWidth;
          const h = researchWrap.clientHeight;
          rCam.aspect = w / h;
          rCam.updateProjectionMatrix();
          rRenderer.setSize(w, h);
          rComposer.setSize(w, h);
          rDotPass.uniforms.uResolution.value.set(w, h);
        }
        researchSize();
        window.addEventListener("resize", researchSize, { passive: true });

        const MOUSE_RADIUS = 7.5;
        const MOUSE_STRENGTH = 0.12;
        const MOUSE_LINE_RADIUS = 6.0;
        const SPRING_STRENGTH_DEFAULT = 0.008;
        const SPRING_STRENGTH_FORMATION = 0.012;
        const SPRING_DAMPING = 0.92;

        const rScatteredHome = new Float32Array(rHomeArr);

        const rFormation1 = new Float32Array(R_PARTICLE_COUNT * 3);
        (() => {
          const half = Math.floor(R_PARTICLE_COUNT / 2);
          for (let i = 0; i < R_PARTICLE_COUNT; i++) {
            const strand = i < half ? 0 : 1;
            const idx = i < half ? i : i - half;
            const t = (idx / half) * Math.PI * 6;
            const x = (idx / half) * 28 - 14;
            const yOffset = strand === 0 ? 1.5 : -1.5;
            rFormation1[i * 3] = x;
            rFormation1[i * 3 + 1] = Math.sin(t) * 3.0 + yOffset;
            rFormation1[i * 3 + 2] = Math.cos(t * 0.5 + strand * Math.PI) * 1.2;
          }
        })();

        const rFormation2 = new Float32Array(R_PARTICLE_COUNT * 3);
        (() => {
          const groups = [
            { cx: -12, cy:  4,   size: 4,   dots: 5 },
            { cx:  -5, cy:  5.5, size: 3,   dots: 4 },
            { cx:   3, cy:  6,   size: 5,   dots: 6 },
            { cx:  11, cy:  4.5, size: 3.5, dots: 5 },
            { cx: -10, cy: -3,   size: 3.5, dots: 5 },
            { cx:  -2, cy: -4,   size: 4.5, dots: 5 },
            { cx:   7, cy: -3.5, size: 3,   dots: 4 },
            { cx:  13, cy: -5,   size: 4,   dots: 5 },
          ];
          let idx = 0;
          const perGroup = Math.floor(R_PARTICLE_COUNT / groups.length);
          const remainder = R_PARTICLE_COUNT - perGroup * groups.length;
          for (let g = 0; g < groups.length; g++) {
            const { cx, cy, size, dots } = groups[g];
            const count = perGroup + (g < remainder ? 1 : 0);
            const cols = dots;
            const rows = Math.ceil(count / cols);
            const spacing = size / (dots - 1);
            for (let i = 0; i < count && idx < R_PARTICLE_COUNT; i++) {
              const col = i % cols;
              const row = Math.floor(i / cols);
              rFormation2[idx * 3]     = cx + col * spacing - (cols - 1) * spacing * 0.5;
              rFormation2[idx * 3 + 1] = cy + row * spacing - (rows - 1) * spacing * 0.5;
              rFormation2[idx * 3 + 2] = 0;
              idx++;
            }
          }
          while (idx < R_PARTICLE_COUNT) {
            rFormation2[idx * 3] = (Math.random() - 0.5) * 4;
            rFormation2[idx * 3 + 1] = (Math.random() - 0.5) * 4;
            rFormation2[idx * 3 + 2] = 0;
            idx++;
          }
        })();

        const rFormation3 = new Float32Array(R_PARTICLE_COUNT * 3);
        (() => {
          const half = Math.floor(R_PARTICLE_COUNT / 2);
          for (let i = 0; i < R_PARTICLE_COUNT; i++) {
            const strand = i < half ? 0 : 1;
            const idx = i < half ? i : i - half;
            const t = (idx / half) * Math.PI * 4;
            const x = (idx / half) * 28 - 14;
            const phaseOffset = strand * Math.PI;
            rFormation3[i * 3] = x;
            rFormation3[i * 3 + 1] = Math.sin(t + phaseOffset) * 4.0;
            rFormation3[i * 3 + 2] = Math.cos(t + phaseOffset) * 2.0;
          }
        })();

        const formations = [null, rFormation1, rFormation2, rFormation3];
        let activeFormation = 0;
        let formationBlend = 0;
        let formationTarget = 0;

        const researchItems = document.querySelectorAll(".research-item[data-formation]");
        researchItems.forEach((item) => {
          item.style.cursor = "pointer";
          item.addEventListener("mouseenter", () => {
            formationTarget = parseInt(item.dataset.formation);
            researchItems.forEach((el) => el.classList.remove("active"));
            item.classList.add("active");
          });
          item.addEventListener("mouseleave", () => {
            formationTarget = 0;
            item.classList.remove("active");
          });
        });

        function rAnimate() {
          requestAnimationFrame(rAnimate);
          if (!rActive) return;
          const pos = rPGeo.attributes.position.array;
          const mx = rMouseWorld.x;
          const my = rMouseWorld.y;

          if (formationTarget > 0) {
            formationBlend = Math.min(formationBlend + 0.04, 1.0);
            activeFormation = formationTarget;
          } else {
            formationBlend = Math.max(formationBlend - 0.03, 0.0);
            if (formationBlend <= 0) activeFormation = 0;
          }

          const springStr = activeFormation > 0
            ? SPRING_STRENGTH_DEFAULT + (SPRING_STRENGTH_FORMATION - SPRING_STRENGTH_DEFAULT) * formationBlend
            : SPRING_STRENGTH_DEFAULT;

          const t = performance.now();

          for (let i = 0; i < R_PARTICLE_COUNT; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            let homeX, homeY, homeZ;
            if (activeFormation > 0 && formationBlend > 0) {
              const f = formations[activeFormation];
              homeX = rScatteredHome[ix] + (f[ix] - rScatteredHome[ix]) * formationBlend;
              homeY = rScatteredHome[iy] + (f[iy] - rScatteredHome[iy]) * formationBlend;
              homeZ = rScatteredHome[iz] + (f[iz] - rScatteredHome[iz]) * formationBlend;
            } else {
              homeX = rScatteredHome[ix];
              homeY = rScatteredHome[iy];
              homeZ = rScatteredHome[iz];
            }

            if (rMouseActive) {
              const dmx = pos[ix] - mx;
              const dmy = pos[iy] - my;
              const dmd = Math.sqrt(dmx * dmx + dmy * dmy);
              if (dmd < MOUSE_RADIUS && dmd > 0.1) {
                const force = MOUSE_STRENGTH * (1.0 - dmd / MOUSE_RADIUS) * (1.0 - dmd / MOUSE_RADIUS);
                rVelArr[ix] += (dmx / dmd) * force;
                rVelArr[iy] += (dmy / dmd) * force;
              }
            }

            rVelArr[ix] += (homeX - pos[ix]) * springStr;
            rVelArr[iy] += (homeY - pos[iy]) * springStr;
            rVelArr[iz] += (homeZ - pos[iz]) * springStr;
            rVelArr[ix] *= SPRING_DAMPING;
            rVelArr[iy] *= SPRING_DAMPING;
            rVelArr[iz] *= SPRING_DAMPING;

            if (formationBlend < 0.5) {
              rScatteredHome[ix] += Math.sin(i * 0.73 + t * 0.0003) * 0.003;
              rScatteredHome[iy] += Math.cos(i * 1.17 + t * 0.00025) * 0.002;
              if (Math.abs(rScatteredHome[ix]) > 21) rScatteredHome[ix] *= 0.99;
              if (Math.abs(rScatteredHome[iy]) > 9)  rScatteredHome[iy] *= 0.99;
              if (Math.abs(rScatteredHome[iz]) > 4)  rScatteredHome[iz] *= 0.99;
            }

            pos[ix] += rVelArr[ix];
            pos[iy] += rVelArr[iy];
            pos[iz] += rVelArr[iz];

            if (Math.abs(pos[ix]) > 22) { pos[ix] = Math.sign(pos[ix]) * 22; rVelArr[ix] *= -0.5; }
            if (Math.abs(pos[iy]) > 10) { pos[iy] = Math.sign(pos[iy]) * 10; rVelArr[iy] *= -0.5; }
            if (Math.abs(pos[iz]) > 5)  { pos[iz] = Math.sign(pos[iz]) * 5;  rVelArr[iz] *= -0.5; }
          }
          rPGeo.attributes.position.needsUpdate = true;
          rPMat.opacity = 0.45 + formationBlend * 0.25;
          rPMat.size = 1.9 + formationBlend * 0.6;

          let li = 0;
          const lp = rLineGeo.attributes.position.array;
          const lc = rLineGeo.attributes.color.array;
          const baseThreshold = 4.0 - formationBlend * 1.5;
          const lineOpacityBoost = formationBlend * 0.3;
          for (let i = 0; i < R_PARTICLE_COUNT && li < rMaxLines; i++) {
            for (let j = i + 1; j < R_PARTICLE_COUNT && li < rMaxLines; j++) {
              const dx = pos[i * 3] - pos[j * 3];
              const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
              const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              let threshold = baseThreshold;
              if (rMouseActive) {
                const midX = (pos[i * 3] + pos[j * 3]) * 0.5;
                const midY = (pos[i * 3 + 1] + pos[j * 3 + 1]) * 0.5;
                const dMidMouse = Math.sqrt((midX - mx) * (midX - mx) + (midY - my) * (midY - my));
                if (dMidMouse < MOUSE_LINE_RADIUS) {
                  const boost = 1.0 + 1.5 * (1.0 - dMidMouse / MOUSE_LINE_RADIUS);
                  threshold = baseThreshold * boost;
                }
              }
              if (dist < threshold) {
                const alpha = 1.0 - dist / threshold;
                const idx = li * 6;
                lp[idx] = pos[i * 3]; lp[idx + 1] = pos[i * 3 + 1]; lp[idx + 2] = pos[i * 3 + 2];
                lp[idx + 3] = pos[j * 3]; lp[idx + 4] = pos[j * 3 + 1]; lp[idx + 5] = pos[j * 3 + 2];
                let r = alpha * (0.4 + lineOpacityBoost);
                let g = alpha * (0.4 + lineOpacityBoost);
                let b = alpha * (0.6 + lineOpacityBoost);
                if (rMouseActive) {
                  const midX = (pos[i * 3] + pos[j * 3]) * 0.5;
                  const midY = (pos[i * 3 + 1] + pos[j * 3 + 1]) * 0.5;
                  const dMid = Math.sqrt((midX - mx) * (midX - mx) + (midY - my) * (midY - my));
                  if (dMid < MOUSE_LINE_RADIUS) {
                    const glow = 1.0 - dMid / MOUSE_LINE_RADIUS;
                    r += glow * 0.3; g += glow * 0.35; b += glow * 0.5;
                  }
                }
                lc[idx] = r; lc[idx + 1] = g; lc[idx + 2] = b;
                lc[idx + 3] = r; lc[idx + 4] = g; lc[idx + 5] = b;
                li++;
              }
            }
          }
          for (let i = li * 6; i < rMaxLines * 6; i++) { lp[i] = 0; lc[i] = 0; }
          rLineGeo.attributes.position.needsUpdate = true;
          rLineGeo.attributes.color.needsUpdate = true;
          rLineGeo.setDrawRange(0, li * 2);
          rComposer.render();
        }
        rAnimate();
      }

      const numbersWrap = document.getElementById("numbers-canvas");
      if (numbersWrap) {
        const nScene = new THREE.Scene();
        nScene.background = new THREE.Color(0x020203);
        const nCam = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        nCam.position.set(0, 0, 12);
        const nRenderer = new THREE.WebGLRenderer({ antialias: false });
        nRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        numbersWrap.appendChild(nRenderer.domElement);

        const PARTICLE_COUNT = 600;
        const posArr = new Float32Array(PARTICLE_COUNT * 3);
        const velArr = new Float32Array(PARTICLE_COUNT * 3);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          posArr[i * 3] = (Math.random() - 0.5) * 30;
          posArr[i * 3 + 1] = (Math.random() - 0.5) * 20;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 15;
          velArr[i * 3] = (Math.random() - 0.5) * 0.01;
          velArr[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
          velArr[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.0, sizeAttenuation: true, transparent: true, opacity: 0.5 });
        const points = new THREE.Points(pGeo, pMat);
        points.name = "numbersParticles";
        nScene.add(points);

        const lineGeo = new THREE.BufferGeometry();
        const maxLines = 1000;
        const linePos = new Float32Array(maxLines * 6);
        const lineColors = new Float32Array(maxLines * 6);
        lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
        lineGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
        const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.25 });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        lines.name = "numbersLines";
        nScene.add(lines);

        const nComposer = new EffectComposer(nRenderer);
        nComposer.addPass(new RenderPass(nScene, nCam));
        const nDotPass = new ShaderPass({
          uniforms: {
            tDiffuse:    { value: null },
            uResolution: { value: new THREE.Vector2(400, 400) },
            uDotSize:    { value: 3.5 },
            uDotGap:     { value: 2.0 },
            uBrightness: { value: 1.0 },
            uContrast:   { value: 0.5 },
            uBgColor:    { value: new THREE.Vector3(0.00784, 0.00784, 0.01176) },
          },
          vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
          fragmentShader: `
            precision highp float;
            uniform sampler2D tDiffuse;
            uniform vec2 uResolution;
            uniform float uDotSize, uDotGap, uBrightness, uContrast;
            uniform vec3 uBgColor;
            varying vec2 vUv;
            void main() {
              vec2 px = vUv * uResolution;
              float sp = uDotSize + uDotGap;
              vec2 cell = floor(px / sp);
              vec2 center = (cell + 0.5) * sp;
              vec2 sUV = center / uResolution;
              vec3 c = texture2D(tDiffuse, sUV).rgb;
              float lum = dot(c, vec3(0.299, 0.587, 0.114)) * uBrightness;
              lum = clamp((lum - 0.5) / uContrast + 0.5, 0.0, 1.0);
              if (lum < 0.02) { gl_FragColor = vec4(uBgColor, 1.0); return; }
              float maxR = uDotSize * 0.5;
              float r = mix(0.3, maxR, pow(lum, uContrast));
              float d = length(px - center);
              float mask = 1.0 - smoothstep(r - 0.5, r + 0.5, d);
              vec3 dotCol = vec3(1.0) * lum * 1.2;
              gl_FragColor = vec4(mix(uBgColor, dotCol, mask), 1.0);
            }
          `,
        });
        nComposer.addPass(nDotPass);
        nComposer.addPass(new OutputPass());

        let nActive = false;
        const nObs = new IntersectionObserver((entries) => {
          nActive = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        nObs.observe(numbersWrap);

        function numbersSize() {
          const w = numbersWrap.clientWidth;
          const h = numbersWrap.clientHeight;
          nCam.aspect = w / h;
          nCam.updateProjectionMatrix();
          nRenderer.setSize(w, h);
          nComposer.setSize(w, h);
          nDotPass.uniforms.uResolution.value.set(w, h);
        }
        numbersSize();
        window.addEventListener("resize", numbersSize, { passive: true });

        function nAnimate() {
          requestAnimationFrame(nAnimate);
          if (!nActive) return;
          const pos = pGeo.attributes.position.array;
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            pos[i * 3] += velArr[i * 3];
            pos[i * 3 + 1] += velArr[i * 3 + 1];
            pos[i * 3 + 2] += velArr[i * 3 + 2];
            if (Math.abs(pos[i * 3]) > 15) velArr[i * 3] *= -1;
            if (Math.abs(pos[i * 3 + 1]) > 10) velArr[i * 3 + 1] *= -1;
            if (Math.abs(pos[i * 3 + 2]) > 8) velArr[i * 3 + 2] *= -1;
          }
          pGeo.attributes.position.needsUpdate = true;

          let li = 0;
          const lp = lineGeo.attributes.position.array;
          const lc = lineGeo.attributes.color.array;
          const threshold = 4.0;
          for (let i = 0; i < PARTICLE_COUNT && li < maxLines; i++) {
            for (let j = i + 1; j < PARTICLE_COUNT && li < maxLines; j++) {
              const dx = pos[i * 3] - pos[j * 3];
              const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
              const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist < threshold) {
                const alpha = 1.0 - dist / threshold;
                const idx = li * 6;
                lp[idx] = pos[i * 3]; lp[idx + 1] = pos[i * 3 + 1]; lp[idx + 2] = pos[i * 3 + 2];
                lp[idx + 3] = pos[j * 3]; lp[idx + 4] = pos[j * 3 + 1]; lp[idx + 5] = pos[j * 3 + 2];
                lc[idx] = alpha * 0.4; lc[idx + 1] = alpha * 0.4; lc[idx + 2] = alpha * 0.6;
                lc[idx + 3] = alpha * 0.4; lc[idx + 4] = alpha * 0.4; lc[idx + 5] = alpha * 0.6;
                li++;
              }
            }
          }
          for (let i = li * 6; i < maxLines * 6; i++) { lp[i] = 0; lc[i] = 0; }
          lineGeo.attributes.position.needsUpdate = true;
          lineGeo.attributes.color.needsUpdate = true;
          lineGeo.setDrawRange(0, li * 2);
          nComposer.render();
        }
        nAnimate();
      }
    }
    initSectionScenes();

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        composer.render();
      }, { timeout: 1000 });
    } else {
      setTimeout(() => {
        composer.render();
      }, 200);
    }

    threeRefs.current = { quadMaterial, settings };

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setCanvasVisible(true);
        setFadesIn(true);
      })
    );

    return () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);
    };
  }, []);


  return (
    <>
      <style>{styles}</style>
      <div className="bg-root">
        <div className="bg-hero-wrapper">
          <div
            ref={crtFrameRef}
            className={`bg-crt-frame${canvasVisible ? " visible" : ""}`}
          />
          <div className={`bg-hero-fade${fadesIn ? " anim-in" : ""}`} />
          <div className={`bg-hero-fade-top${fadesIn ? " anim-in" : ""}`} />
        </div>
      </div>
    </>
  );
}
