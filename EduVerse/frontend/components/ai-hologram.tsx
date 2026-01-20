"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

interface AIHologramProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  onClick?: () => void
}

export default function AIHologram({ position = "bottom-right", onClick }: AIHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const [isAwake, setIsAwake] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0e0e17)
    scene.fog = new THREE.Fog(0x0e0e17, 10, 50)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 3

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffff, 100)
    pointLight.position.set(2, 2, 2)
    scene.add(pointLight)

    // Main hologram sphere
    const geometry = new THREE.IcosahedronGeometry(1, 4)
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.4,
      shininess: 100,
      wireframe: false,
    })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.castShadow = true
    sphereRef.current = sphere
    scene.add(sphere)

    // Add wireframe overlay for hologram effect
    const wireframeGeometry = new THREE.IcosahedronGeometry(1, 4)
    const wireframeLines = new THREE.LineSegments(
      new THREE.EdgesGeometry(wireframeGeometry),
      new THREE.LineBasicMaterial({
        color: 0x00ffff,
        linewidth: 1,
      }),
    )
    sphere.add(wireframeLines)

    // Eye representations (using small spheres)
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
    })

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.3, 0.3, 0.95)
    sphere.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.3, 0.3, 0.95)
    sphere.add(rightEye)

    // Particle ring around avatar
    const particleCount = 20
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      positions[i * 3] = Math.cos(angle) * 1.8
      positions[i * 3 + 1] = Math.sin(angle) * 1.8
      positions[i * 3 + 2] = Math.sin(angle * 2) * 0.5
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffd166,
      size: 0.15,
      sizeAttenuation: true,
    })

    const particleSystem = new THREE.Points(particles, particlesMaterial)
    scene.add(particleSystem)

    // Animation loop
    let animationFrameId: number
    let time = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      time += 0.016

      // Rotate sphere
      sphere.rotation.x += 0.005
      sphere.rotation.y += 0.008
      sphere.rotation.z += 0.003

      // Pulsing scale when awake
      if (isAwake) {
        const pulse = 1 + Math.sin(time * 4) * 0.1
        sphere.scale.set(pulse, pulse, pulse)
        material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.15
      } else {
        sphere.scale.set(1, 1, 1)
        material.emissiveIntensity = 0.3
      }

      // Rotate particle system
      particleSystem.rotation.z += 0.002

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
      renderer.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [isAwake])

  const positionClasses = {
    "bottom-right": "bottom-8 right-8",
    "bottom-left": "bottom-8 left-8",
    "top-right": "top-8 right-8",
    "top-left": "top-8 left-8",
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-40 cursor-pointer`}
      onClick={() => {
        setIsAwake(!isAwake)
        onClick?.()
      }}
    >
      <div
        ref={containerRef}
        className="w-24 h-24 rounded-full border border-accent glow-cyan hover:glow-pulse transition-all"
      />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 text-center">
        <p className="text-xs text-accent font-heading font-bold glow-cyan">{isAwake ? "Active" : "Click to chat"}</p>
      </div>
    </div>
  )
}
