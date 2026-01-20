"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function TokenomicsChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 0, 15)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const tokenomicsData = [
      { label: "Community", percentage: 35, color: 0x00ffff },
      { label: "Team", percentage: 20, color: 0xffd166 },
      { label: "DAO Treasury", percentage: 25, color: 0xff00ff },
      { label: "Ecosystem", percentage: 20, color: 0x00ff88 },
    ]

    let currentAngle = 0
    const torusGroup = new THREE.Group()

    tokenomicsData.forEach((data) => {
      const angle = (data.percentage / 100) * Math.PI * 2
      const geometry = new THREE.TorusGeometry(5, 1.5, 16, Number.parseInt((angle / (Math.PI * 2)) * 100))
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        metalness: 0.4,
        roughness: 0.3,
        emissive: data.color,
        emissiveIntensity: 0.2,
      })
      const torus = new THREE.Mesh(geometry, material)
      torus.rotation.z = currentAngle
      torusGroup.add(torus)
      currentAngle += angle
    })

    scene.add(torusGroup)

    // Center sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a14,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x00ffff,
      emissiveIntensity: 0.1,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    // Animation loop
    let animationFrameId: number

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      torusGroup.rotation.z += 0.002
      renderer.render(scene, camera)
    }

    animate()

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
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-80 rounded-2xl overflow-hidden border border-border" />
}
