"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

interface ExploreCampusProps {
  onBuildingHovered?: (building: string | null) => void
}

export default function ExploreCampus({ onBuildingHovered }: ExploreCampusProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const buildingsRef = useRef<THREE.Mesh[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null)
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a14)
    scene.fog = new THREE.Fog(0x0a0a14, 50, 400)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000,
    )
    camera.position.set(0, 15, 30)
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

    const pointLight = new THREE.PointLight(0x00ffff, 120)
    pointLight.position.set(20, 40, 20)
    pointLight.castShadow = true
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0xffd166, 80)
    pointLight2.position.set(-20, 30, -20)
    scene.add(pointLight2)

    const buildingData = [
      { x: -20, z: -20, color: 0x00ffff, name: "NFT Classroom", height: 12 },
      { x: 20, z: -20, color: 0xffd166, name: "Token Hub", height: 10 },
      { x: -20, z: 20, color: 0xff00ff, name: "AI Lab", height: 14 },
      { x: 20, z: 20, color: 0x00ff88, name: "Learning Center", height: 11 },
      { x: 0, z: 0, color: 0x00aaff, name: "Central Plaza", height: 8 },
    ]

    const buildings: THREE.Mesh[] = []
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    buildingData.forEach((data, idx) => {
      const geometry = new THREE.BoxGeometry(10, data.height, 10)
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        metalness: 0.3,
        roughness: 0.4,
        emissive: data.color,
        emissiveIntensity: 0.2,
      })
      const building = new THREE.Mesh(geometry, material)
      building.position.set(data.x, data.height / 2, data.z)
      building.castShadow = true
      building.receiveShadow = true
      building.userData = { name: data.name, index: idx }
      scene.add(building)
      buildings.push(building)
    })
    buildingsRef.current = buildings

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(400, 400)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2e4a,
      roughness: 0.9,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid overlay
    const gridHelper = new THREE.GridHelper(400, 40, 0x00ffff, 0x1a1a2e)
    gridHelper.position.y = 0.01
    scene.add(gridHelper)

    // Mouse interaction
    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(buildings)

      buildings.forEach((building) => {
        if (intersects.length > 0 && intersects[0].object === building) {
          building.scale.y = 1.1
          onBuildingHovered?.(building.userData.name)
        } else {
          building.scale.y = 1
        }
      })
    }

    const onMouseClick = (event: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(buildings)

      if (intersects.length > 0) {
        const clicked = intersects[0].object as THREE.Mesh
        setSelectedBuilding(clicked.userData.index)
      } else {
        setSelectedBuilding(null)
      }
    }

    // Keyboard input
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
    }

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    // Animation loop
    let animationFrameId: number
    let time = 0

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      time += 0.01

      // Camera movement with WASD
      const moveSpeed = 0.5
      if (keysPressed.current["w"]) camera.position.z -= moveSpeed
      if (keysPressed.current["s"]) camera.position.z += moveSpeed
      if (keysPressed.current["a"]) camera.position.x -= moveSpeed
      if (keysPressed.current["d"]) camera.position.x += moveSpeed
      if (keysPressed.current["q"]) camera.position.y -= moveSpeed
      if (keysPressed.current["e"]) camera.position.y += moveSpeed

      // Rotate and pulse selected building
      buildings.forEach((building) => {
        building.rotation.y += 0.002
        if (selectedBuilding === building.userData.index) {
          building.scale.x = 1 + Math.sin(time * 3) * 0.05
          building.scale.z = 1 + Math.sin(time * 3) * 0.05
        } else {
          building.scale.x = 1
          building.scale.z = 1
        }
      })

      renderer.render(scene, camera)
    }

    animate()

    containerRef.current.addEventListener("mousemove", onMouseMove)
    containerRef.current.addEventListener("click", onMouseClick)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

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
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      containerRef.current?.removeEventListener("mousemove", onMouseMove)
      containerRef.current?.removeEventListener("click", onMouseClick)
      cancelAnimationFrame(animationFrameId)
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-screen bg-gradient-to-b from-background to-card" />

      {/* Controls overlay */}
      <div className="absolute bottom-8 left-8 bg-card/80 backdrop-blur border border-border rounded-lg p-6">
        <h3 className="text-sm font-heading font-bold text-accent mb-4 glow-cyan">Campus Navigation</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-foreground/70 mb-2">Move: WASD</p>
            <p className="text-xs text-foreground/70">Vertical: Q/E</p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-foreground/70">Click buildings to select</p>
            <p className="text-xs text-foreground/70">Hover to preview</p>
          </div>
        </div>
      </div>

      {/* Building info panel */}
      {selectedBuilding !== null && (
        <div className="absolute top-8 right-8 bg-card/80 backdrop-blur border border-accent/50 rounded-lg p-6 max-w-sm glow-cyan">
          <h3 className="text-xl font-heading font-bold text-accent mb-3">
            {buildingsRef.current[selectedBuilding]?.userData.name}
          </h3>
          <p className="text-sm text-foreground/80 mb-4">
            Explore this campus building to learn more about our facilities and programs.
          </p>
          <button className="w-full bg-accent text-background px-4 py-2 rounded font-heading font-bold hover:glow-cyan transition-all text-sm">
            View Details
          </button>
        </div>
      )}
    </div>
  )
}
