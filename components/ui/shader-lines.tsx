"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

// Subtle dark shader that matches the website aesthetic
export function ShaderAnimation() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<{
        camera: THREE.Camera
        scene: THREE.Scene
        renderer: THREE.WebGLRenderer
        uniforms: {
            time: { value: number }
            resolution: { value: THREE.Vector2 }
            mouse: { value: THREE.Vector2 }
        }
        animationId: number | null
    }>({
        camera: null as any,
        scene: null as any,
        renderer: null as any,
        uniforms: null as any,
        animationId: null,
    })

    useEffect(() => {
        if (containerRef.current) {
            initThreeJS()
        }

        return () => {
            if (sceneRef.current.animationId) {
                cancelAnimationFrame(sceneRef.current.animationId)
            }
            if (sceneRef.current.renderer) {
                sceneRef.current.renderer.dispose()
                const canvas = containerRef.current?.querySelector('canvas');
                if (canvas) containerRef.current?.removeChild(canvas);
            }
        }
    }, [])

    const initThreeJS = () => {
        if (!containerRef.current) return

        const container = containerRef.current
        container.innerHTML = ""

        const camera = new THREE.Camera()
        camera.position.z = 1

        const scene = new THREE.Scene()
        const geometry = new THREE.PlaneGeometry(2, 2)

        const uniforms = {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2() },
            mouse: { value: new THREE.Vector2(0.5, 0.5) },
        }

        // Vertex shader
        const vertexShader = `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `

        // Fragment shader - subtle flowing gradients matching the dark theme
        const fragmentShader = `
            precision highp float;
            
            uniform float time;
            uniform vec2 resolution;
            uniform vec2 mouse;
            
            // Noise functions
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                for(int i = 0; i < 5; i++) {
                    value += amplitude * noise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                vec2 pos = uv * 2.0 - 1.0;
                pos.x *= resolution.x / resolution.y;
                
                // Slow time for subtle movement
                float t = time * 0.03;
                
                // Create flowing noise patterns
                float n1 = fbm(pos * 1.5 + t * 0.5);
                float n2 = fbm(pos * 2.0 - t * 0.3 + vec2(5.0, 3.0));
                float n3 = fbm(pos * 0.8 + t * 0.2 + vec2(10.0, 7.0));
                
                // Mouse interaction - subtle glow near cursor
                float mouseDist = length(uv - mouse);
                float mouseGlow = smoothstep(0.5, 0.0, mouseDist) * 0.15;
                
                // Color palette - dark blues and subtle highlights
                vec3 baseColor = vec3(0.04, 0.04, 0.045); // Near black
                vec3 accentColor1 = vec3(0.08, 0.12, 0.18); // Dark blue
                vec3 accentColor2 = vec3(0.06, 0.08, 0.12); // Darker blue
                vec3 highlightColor = vec3(0.15, 0.25, 0.4); // Subtle blue highlight
                
                // Mix colors based on noise
                vec3 color = baseColor;
                color = mix(color, accentColor1, n1 * 0.4);
                color = mix(color, accentColor2, n2 * 0.3);
                color += highlightColor * n3 * 0.1;
                
                // Add mouse glow
                color += vec3(0.1, 0.15, 0.25) * mouseGlow;
                
                // Vignette
                float vignette = 1.0 - length(pos) * 0.3;
                vignette = clamp(vignette, 0.0, 1.0);
                color *= vignette;
                
                // Subtle grain
                float grain = hash(uv + t) * 0.02;
                color += grain;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        })

        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        const renderer = new THREE.WebGLRenderer({ alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        container.appendChild(renderer.domElement)

        sceneRef.current = {
            camera,
            scene,
            renderer,
            uniforms,
            animationId: null,
        }

        // Handle resize
        const onWindowResize = () => {
            if (!container) return;
            const rect = container.getBoundingClientRect()
            renderer.setSize(rect.width, rect.height)
            uniforms.resolution.value.x = renderer.domElement.width
            uniforms.resolution.value.y = renderer.domElement.height
        }

        // Mouse move handler
        const onMouseMove = (e: MouseEvent) => {
            uniforms.mouse.value.x = e.clientX / window.innerWidth
            uniforms.mouse.value.y = 1.0 - (e.clientY / window.innerHeight)
        }

        onWindowResize()
        window.addEventListener("resize", onWindowResize, false)
        window.addEventListener("mousemove", onMouseMove, false)

        // Animation loop
        const animate = () => {
            sceneRef.current.animationId = requestAnimationFrame(animate)
            uniforms.time.value += 0.016
            renderer.render(scene, camera)
        }

        animate()
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full absolute inset-0"
            style={{ opacity: 0.8 }}
        />
    )
}

// Grid shader for technical sections
export function GridShader() {
    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<any>({})

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        container.innerHTML = ""

        const camera = new THREE.Camera()
        camera.position.z = 1

        const scene = new THREE.Scene()
        const geometry = new THREE.PlaneGeometry(2, 2)

        const uniforms = {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2() },
        }

        const vertexShader = `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `

        const fragmentShader = `
            precision highp float;
            uniform float time;
            uniform vec2 resolution;
            
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                
                // Grid spacing
                float gridSize = 40.0;
                vec2 grid = fract(uv * gridSize);
                
                // Grid lines
                float lineWidth = 0.02;
                float line = step(1.0 - lineWidth, grid.x) + step(1.0 - lineWidth, grid.y);
                line = clamp(line, 0.0, 1.0);
                
                // Animate grid appearance
                float t = time * 0.05;
                float wave = sin(uv.x * 3.0 + t) * sin(uv.y * 3.0 + t * 0.7) * 0.5 + 0.5;
                
                // Color - very subtle blue grid
                vec3 color = vec3(0.04, 0.06, 0.1) * line * wave * 0.3;
                
                gl_FragColor = vec4(color, line * 0.1);
            }
        `

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
        })

        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        const renderer = new THREE.WebGLRenderer({ alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        container.appendChild(renderer.domElement)

        sceneRef.current = { renderer, uniforms, animationId: null }

        const onResize = () => {
            const rect = container.getBoundingClientRect()
            renderer.setSize(rect.width, rect.height)
            uniforms.resolution.value.set(renderer.domElement.width, renderer.domElement.height)
        }
        onResize()
        window.addEventListener("resize", onResize)

        const animate = () => {
            sceneRef.current.animationId = requestAnimationFrame(animate)
            uniforms.time.value += 0.016
            renderer.render(scene, camera)
        }
        animate()

        return () => {
            if (sceneRef.current.animationId) cancelAnimationFrame(sceneRef.current.animationId)
            renderer.dispose()
            window.removeEventListener("resize", onResize)
        }
    }, [])

    return <div ref={containerRef} className="absolute inset-0 pointer-events-none" />
}
