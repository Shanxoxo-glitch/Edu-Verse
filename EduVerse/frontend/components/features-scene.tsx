"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface FeaturesSceneProps {
  activeFeatureIndex: number
}

export default function FeaturesScene({ activeFeatureIndex }: FeaturesSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const featureObjectsRef = useRef<THREE.Mesh[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    scene.fog = new THREE.Fog(0x0a0a14, 100, 300)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 3, 10)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffff, 100)
    pointLight.position.set(5, 10, 5)
    pointLight.castShadow = true
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0xffd166, 50)
    pointLight2.position.set(-5, 8, -5)
    scene.add(pointLight2)

    const featureObjects: THREE.Mesh[] = []

    // Center octahedron (main feature representation)
    const octaGeometry = new THREE.OctahedronGeometry(2, 0)
    const octaMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x00ffff,
      emissiveIntensity: 0.4,
    })
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial)
    octahedron.castShadow = true
    scene.add(octahedron)
    featureObjects.push(octahedron)

    // Orbiting spheres
    const sphereColors = [0x00ffff, 0xffd166, 0xff00ff, 0x00ff88]
    sphereColors.forEach((color, idx) => {
      const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16)
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.3,
        emissive: color,
        emissiveIntensity: 0.2,
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.castShadow = true
      scene.add(sphere)
      featureObjects.push(sphere)
    })

    featureObjectsRef.current = featureObjects

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2e4a,
      roughness: 0.9,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -3
    ground.receiveShadow = true
    scene.add(ground)

    // Animation loop
    let animationFrameId: number
    let time = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      time += 0.01

      // Rotate central octahedron
      if (featureObjects[0]) {
        featureObjects[0].rotation.x += 0.005
        featureObjects[0].rotation.y += 0.008
        featureObjects[0].scale.x = 0.8 + Math.sin(time) * 0.3
        featureObjects[0].scale.y = 0.8 + Math.sin(time) * 0.3
        featureObjects[0].scale.z = 0.8 + Math.sin(time) * 0.3
      }

      // Orbit spheres around center
      featureObjects.slice(1).forEach((sphere, idx) => {
        const angle = (time + (idx * (Math.PI * 2)) / 4) * 0.5
        const radius = 4
        sphere.position.x = Math.cos(angle) * radius
        sphere.position.z = Math.sin(angle) * radius
        sphere.position.y = Math.sin(time * 0.5 + idx) * 2
        sphere.rotation.x += 0.01
        sphere.rotation.y += 0.01
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
  }, [activeFeatureIndex])

  return <div ref={containerRef} className="w-full h-96 rounded-2xl overflow-hidden border border-border" />
}
