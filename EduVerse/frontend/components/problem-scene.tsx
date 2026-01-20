"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ProblemScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const problemObjectsRef = useRef<THREE.Mesh[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    scene.fog = new THREE.Fog(0x0a0a14, 100, 500)
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

    const pointLight = new THREE.PointLight(0x00ffff, 80)
    pointLight.position.set(5, 10, 10)
    pointLight.castShadow = true
    scene.add(pointLight)

    const problemObjects: THREE.Mesh[] = []
    const positions = [
      { x: -6, z: 0, color: 0x00ffff },
      { x: 0, z: 0, color: 0xffd166 },
      { x: 6, z: 0, color: 0xff00ff },
    ]

    positions.forEach((pos) => {
      const geometry = new THREE.BoxGeometry(3, 3, 3)
      const material = new THREE.MeshStandardMaterial({
        color: pos.color,
        metalness: 0.4,
        roughness: 0.3,
        emissive: pos.color,
        emissiveIntensity: 0.3,
      })
      const cube = new THREE.Mesh(geometry, material)
      cube.position.set(pos.x, 0, pos.z)
      cube.castShadow = true
      scene.add(cube)
      problemObjects.push(cube)
    })
    problemObjectsRef.current = problemObjects

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(30, 30)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2e4a,
      roughness: 0.9,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid overlay
    const gridHelper = new THREE.GridHelper(30, 10, 0x00ffff, 0x1a1a2e)
    gridHelper.position.y = -1.9
    scene.add(gridHelper)

    // Animation loop
    let animationFrameId: number
    let time = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      time += 0.01

      // Rotate and float problem cubes
      problemObjects.forEach((cube, idx) => {
        cube.rotation.x += 0.004
        cube.rotation.y += 0.003
        cube.position.y = Math.sin(time + idx) * 2
      })

      // Subtle camera movement
      camera.position.x = Math.sin(time * 0.3) * 5
      camera.position.y = 5 + Math.sin(time * 0.2) * 2

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
