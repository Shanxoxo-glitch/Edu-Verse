"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

interface InteractiveClassroomProps {
  onClose?: () => void
}

export default function InteractiveClassroom({ onClose }: InteractiveClassroomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const [teacherMessage, setTeacherMessage] = useState("Welcome to class! Click on the board to learn more.")
  const [studentCount] = useState(Math.floor(Math.random() * 5) + 5)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a2e4a)
    scene.fog = new THREE.Fog(0x1a2e4a, 100, 500)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(0, 1.5, 5)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.far = 100
    scene.add(directionalLight)

    const accentLight = new THREE.PointLight(0x00ffff, 50)
    accentLight.position.set(-8, 3, 5)
    scene.add(accentLight)

    // Classroom floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a3f5a,
      roughness: 0.7,
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Classroom walls (simplified)
    const wallGeometry = new THREE.BoxGeometry(20, 5, 0.1)
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a4a,
      roughness: 0.6,
    })

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial)
    backWall.position.set(0, 2.5, -10)
    backWall.castShadow = true
    backWall.receiveShadow = true
    scene.add(backWall)

    // Interactive whiteboard
    const boardGeometry = new THREE.PlaneGeometry(8, 5)
    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      metalness: 0.3,
      roughness: 0.2,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3,
    })
    const board = new THREE.Mesh(boardGeometry, boardMaterial)
    board.position.set(0, 3.5, -9.8)
    board.castShadow = true
    board.receiveShadow = true
    scene.add(board)

    // Create AI teacher avatar (glowing holographic sphere with features)
    const teacherGroup = new THREE.Group()
    teacherGroup.position.set(0, 0, 2)

    const teacherBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.3, 1, 16, 8),
      new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        metalness: 0.6,
        roughness: 0.2,
      }),
    )
    teacherBody.position.y = 0.8
    teacherBody.castShadow = true
    teacherGroup.add(teacherBody)

    // Teacher head
    const headGeometry = new THREE.SphereGeometry(0.25, 32, 32)
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.7,
      metalness: 0.5,
      roughness: 0.1,
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 2
    head.castShadow = true
    teacherGroup.add(head)

    // Teacher glow effect
    const glowGeometry = new THREE.SphereGeometry(0.35, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.2,
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    glow.position.y = 0.8
    glow.scale.set(1.5, 1.5, 1.5)
    teacherGroup.add(glow)

    scene.add(teacherGroup)

    // Create student avatars at desks
    const createStudentDesk = (x: number, z: number, index: number) => {
      const deskGroup = new THREE.Group()

      // Desk surface
      const deskGeometry = new THREE.BoxGeometry(1.5, 0.05, 1)
      const deskMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a4f6a,
        roughness: 0.6,
      })
      const desk = new THREE.Mesh(deskGeometry, deskMaterial)
      desk.position.y = 1
      desk.castShadow = true
      desk.receiveShadow = true
      deskGroup.add(desk)

      // Student avatar (simplified)
      const studentColors = [0x00ffff, 0xffd166, 0x00ff99, 0xff00ff, 0xffaa00]
      const studentBody = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.15, 0.6, 8, 4),
        new THREE.MeshStandardMaterial({
          color: studentColors[index % studentColors.length],
          emissive: studentColors[index % studentColors.length],
          emissiveIntensity: 0.2,
        }),
      )
      studentBody.position.set(0, 1.4, 0)
      studentBody.castShadow = true
      deskGroup.add(studentBody)

      const studentHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({
          color: studentColors[index % studentColors.length],
        }),
      )
      studentHead.position.set(0, 1.85, 0)
      studentHead.castShadow = true
      deskGroup.add(studentHead)

      deskGroup.position.set(x, 0, z)
      return deskGroup
    }

    // Create student desks in rows
    const deskPositions = [
      [-3, 3],
      [0, 3],
      [3, 3],
      [-3, 1],
      [0, 1],
      [3, 1],
    ].slice(0, studentCount)

    deskPositions.forEach(([x, z], idx) => {
      scene.add(createStudentDesk(x, z, idx))
    })

    // Animation loop
    let animationFrameId: number
    let time = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      time += 0.016

      // Subtle teacher animation
      teacherGroup.rotation.y = Math.sin(time * 0.5) * 0.2
      teacherBody.position.y = 0.8 + Math.sin(time * 2) * 0.05

      // Glow pulse effect
      glow.material.opacity = 0.2 + Math.sin(time * 3) * 0.1

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
  }, [studentCount])

  return (
    <div className="relative w-full h-full bg-background">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-8 left-8 right-8 flex items-start justify-between pointer-events-none">
        <div className="bg-card/80 backdrop-blur border border-border rounded-lg p-4 max-w-md pointer-events-auto">
          <p className="text-sm text-accent font-heading font-bold glow-cyan mb-2">AI Teacher</p>
          <p className="text-sm text-foreground">{teacherMessage}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="bg-card/80 backdrop-blur border border-border rounded-lg p-2 hover:bg-card pointer-events-auto"
          >
            X
          </button>
        )}
      </div>

      <div className="absolute bottom-8 left-8 right-8 flex items-center gap-4 pointer-events-none">
        <div className="bg-card/80 backdrop-blur border border-border rounded-lg p-4 pointer-events-auto">
          <p className="text-xs text-foreground/60">Students in class: {studentCount}</p>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: studentCount }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-accent rounded-full glow-cyan"></div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setTeacherMessage("Great question! Let me explain this concept...")}
          className="bg-accent text-background px-4 py-2 rounded-lg font-heading font-bold hover:glow-cyan transition-all pointer-events-auto"
        >
          Ask Question
        </button>
      </div>
    </div>
  )
}
