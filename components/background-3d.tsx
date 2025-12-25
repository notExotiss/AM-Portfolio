'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'


function FloatingParticles() {
  const particles = useRef<THREE.Points>(null)
  const particleCount = 500
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  const colorPalette = [
    new THREE.Color('#3b82f6'),
    new THREE.Color('#ef4444'),
    new THREE.Color('#8b5cf6'),
    new THREE.Color('#f59e0b'),
    new THREE.Color('#ec4899'),
    new THREE.Color('#10b981'),
  ]

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 60
    positions[i + 1] = (Math.random() - 0.5) * 60
    positions[i + 2] = (Math.random() - 0.5) * 60
    
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
    colors[i] = color.r
    colors[i + 1] = color.g
    colors[i + 2] = color.b
  }

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.x = state.clock.elapsedTime * 0.02
      particles.current.rotation.y = state.clock.elapsedTime * 0.03
      particles.current.rotation.z = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} vertexColors transparent opacity={0.5} />
    </points>
  )
}

function GeometricShapes() {
  const shapes = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (shapes.current) {
      shapes.current.rotation.x = state.clock.elapsedTime * 0.01
      shapes.current.rotation.y = state.clock.elapsedTime * 0.015
    }
  })

  return (
    <group ref={shapes}>
      {/* Octahedron */}
      <mesh position={[-10, 5, -15]} rotation={[0.5, 0.5, 0]}>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.2} wireframe />
      </mesh>
      {/* Tetrahedron */}
      <mesh position={[10, -5, -20]} rotation={[0.3, -0.3, 0]}>
        <tetrahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.2} wireframe />
      </mesh>
      {/* Icosahedron */}
      <mesh position={[0, 10, -25]} rotation={[-0.2, 0.2, 0]}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#8b5cf6" transparent opacity={0.2} wireframe />
      </mesh>
    </group>
  )
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 opacity-25 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ef4444" />
        <FloatingParticles />
        <GeometricShapes />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.15} />
      </Canvas>
    </div>
  )
}

