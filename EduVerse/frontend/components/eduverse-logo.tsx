"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface EduVerseLogoProps {
  loading?: boolean
}

export default function EduVerseLogo({ loading = false }: EduVerseLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cubeRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0e0e17)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 4

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffff, 150)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0xffd166, 100)
    pointLight2.position.set(-5, -5, 5)
    scene.add(pointLight2)

    // Create rotating cube
    const geometry = new THREE.BoxGeometry(2, 2, 2, 3, 3, 3)

    // Create material with gradient-like effect using vertex colors
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3,
      shininess: 100,
      wireframe: false,
    })

    const cube = new THREE.Mesh(geometry, material)
    cube.castShadow = true
    cubeRef.current = cube
    scene.add(cube)

    // Add edges for that voxel look
    const edges = new THREE.EdgesGeometry(geometry)
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0x00ffff,
        linewidth: 2,
      }),
    )
    cube.add(line)

    // Create "E" letter on cube (using canvas texture)
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#1a2e4a"
      ctx.fillRect(0, 0, 256, 256)

      ctx.fillStyle = "#00ffff"
      ctx.font = "bold 200px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("E", 128, 128)

      // Glow effect
      ctx.strokeStyle = "#00ffff"
      ctx.lineWidth = 4
      ctx.strokeText("E", 128, 128)
    }

    const texture = new THREE.CanvasTexture(canvas)
    const textMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.4,
    })

    // Apply text to front face
    const front = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), textMaterial)
    front.position.z = 1.01
    cube.add(front)

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      // Rotate cube
      if (cube) {
        cube.rotation.x += 0.01
        cube.rotation.y += 0.015
        cube.rotation.z += 0.005

        // Pulsing scale during loading
        if (loading) {
          const scale = 0.9 + Math.sin(Date.now() * 0.003) * 0.1
          cube.scale.set(scale, scale, scale)
        }
      }

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
  }, [loading])

  return <div ref={containerRef} className="w-full h-full" />
}
