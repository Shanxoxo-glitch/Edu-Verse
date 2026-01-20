"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface CampusSceneProps {
  type: "home" | "explore"
}

export default function CampusScene({ type }: CampusSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const buildingsRef = useRef<THREE.Mesh[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    scene.fog = new THREE.Fog(0x0a0a14, 100, 1000)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000,
    )
    camera.position.set(0, 10, 20)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting with more dramatic effects
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffff, 150)
    pointLight.position.set(10, 20, 10)
    pointLight.castShadow = true
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0xffd166, 100)
    pointLight2.position.set(-10, 15, -10)
    pointLight2.castShadow = true
    scene.add(pointLight2)

    // Create enhanced campus buildings
    const buildings = createEnhancedCampusBuildings()
    buildings.forEach((building) => {
      scene.add(building)
      buildingsRef.current.push(building)
    })

    // Create ground with better material
    const groundGeometry = new THREE.PlaneGeometry(200, 200)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2e4a,
      roughness: 0.8,
      metalness: 0.1,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.position.y = -0.01
    scene.add(ground)

    // Enhanced grid overlay
    const gridHelper = new THREE.GridHelper(200, 20, 0x00ffff, 0x1a1a2e)
    gridHelper.position.y = 0.02
    gridHelper.material.transparent = true
    gridHelper.material.opacity = 0.5
    scene.add(gridHelper)

    // Particle system for atmosphere
    const particleCount = 100
    const particleGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = Math.random() * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.3,
    })

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particleSystem)

    // Animation loop
    let animationFrameId: number
    let rotationAngle = 0
    let time = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      rotationAngle += 0.0005
      time += 0.016

      // Animate buildings with hover effect
      buildingsRef.current.forEach((building, index) => {
        if (index % 2 === 0) {
          building.rotation.y = rotationAngle * (index + 1)
        }

        // Pulsing scale effect
        const pulse = 1 + Math.sin(time + index) * 0.05
        building.scale.set(pulse, pulse, pulse)
      })

      // Rotate particle system slowly
      particleSystem.rotation.y += 0.0001

      // Camera movement for home page
      if (type === "home") {
        camera.position.x = Math.sin(rotationAngle) * 30
        camera.position.z = Math.cos(rotationAngle) * 30
        camera.position.y = 15 + Math.sin(rotationAngle * 0.5) * 5
        camera.lookAt(0, 0, 0)
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
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [type])

  return <div ref={containerRef} className="w-full h-screen bg-gradient-to-b from-background to-card" />
}

function createEnhancedCampusBuildings(): THREE.Mesh[] {
  const buildings: THREE.Mesh[] = []
  const positions = [
    { x: -15, z: -15, name: "NFT Classroom", color: 0x00ffff },
    { x: 15, z: -15, name: "Token Hub", color: 0xffd166 },
    { x: -15, z: 15, name: "AI Lab", color: 0x00ff99 },
    { x: 15, z: 15, name: "Learning Center", color: 0xff00ff },
    { x: 0, z: 0, name: "Central Plaza", color: 0x00ffff },
  ]

  positions.forEach((pos) => {
    // Create main building mesh
    const geometry = new THREE.BoxGeometry(8, 10, 8)

    const material = new THREE.MeshStandardMaterial({
      color: pos.color,
      metalness: 0.4,
      roughness: 0.3,
      emissive: pos.color,
      emissiveIntensity: 0.25,
    })

    const building = new THREE.Mesh(geometry, material)
    building.position.set(pos.x, 5, pos.z)
    building.castShadow = true
    building.receiveShadow = true

    // Add edge highlights for voxel effect
    const edges = new THREE.EdgesGeometry(geometry)
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: pos.color,
        linewidth: 2,
      }),
    )
    building.add(line)

    // Add glow effect using another layer
    const glowGeometry = new THREE.BoxGeometry(8.2, 10.2, 8.2)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: pos.color,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    building.add(glow)

    buildings.push(building)
  })

  return buildings
}
