"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function TechStack3D() {
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
    camera.position.set(0, 5, 15)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffff, 100)
    pointLight.position.set(10, 15, 10)
    pointLight.castShadow = true
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0xffd166, 60)
    pointLight2.position.set(-10, 10, -10)
    scene.add(pointLight2)

    const techItems = [
      { name: "Frontend", color: 0x00ffff, x: -8, y: 8, z: 0 },
      { name: "Backend", color: 0xffd166, x: 8, y: 8, z: 0 },
      { name: "Blockchain", color: 0xff00ff, x: 0, y: 0, z: 0 },
      { name: "AI", color: 0x00ff88, x: -8, y: -8, z: 0 },
      { name: "Storage", color: 0x00aaff, x: 8, y: -8, z: 0 },
    ]

    const nodes: THREE.Mesh[] = []

    // Create tech nodes
    techItems.forEach((tech) => {
      const geometry = new THREE.IcosahedronGeometry(1.5, 3)
      const material = new THREE.MeshStandardMaterial({
        color: tech.color,
        metalness: 0.5,
        roughness: 0.3,
        emissive: tech.color,
        emissiveIntensity: 0.3,
      })
      const node = new THREE.Mesh(geometry, material)
      node.position.set(tech.x, tech.y, tech.z)
      node.castShadow = true
      scene.add(node)
      nodes.push(node)
    })

    // Draw connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 })
    techItems.forEach((tech, idx) => {
      if (idx !== 2) {
        // Connect all to center (blockchain)
        const points = [new THREE.Vector3(tech.x, tech.y, tech.z), new THREE.Vector3(0, 0, 0)]
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(lineGeometry, lineMaterial)
        scene.add(line)
      }
    })

    // Animation loop
    let animationFrameId: number
    let time = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      time += 0.01

      // Rotate and pulse nodes
      nodes.forEach((node, idx) => {
        node.rotation.x += 0.005
        node.rotation.y += 0.008
        node.scale.x = 1 + Math.sin(time + idx * 0.5) * 0.2
        node.scale.y = 1 + Math.sin(time + idx * 0.5) * 0.2
        node.scale.z = 1 + Math.sin(time + idx * 0.5) * 0.2
      })

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
