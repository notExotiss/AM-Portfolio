'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Torus, Box } from '@react-three/drei'
import * as THREE from 'three'

function FloatingShape({ position, shape = 'sphere' }: { position: [number, number, number], shape?: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.5
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5
  })

  const color = shape === 'sphere' ? '#3b82f6' : shape === 'torus' ? '#ef4444' : '#8b5cf6'

  return (
    <group position={position}>
      {shape === 'sphere' && (
        <Sphere ref={meshRef} args={[1, 32, 32]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0}
            metalness={0.8}
          />
        </Sphere>
      )}
      {shape === 'torus' && (
        <Torus ref={meshRef} args={[1, 0.4, 16, 100]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0}
            metalness={0.8}
          />
        </Torus>
      )}
      {shape === 'box' && (
        <Box ref={meshRef} args={[1.5, 1.5, 1.5]}>
          <MeshDistortMaterial
            color={color}
            attach="material"
            distort={0.2}
            speed={1}
            roughness={0}
            metalness={0.8}
          />
        </Box>
      )}
    </group>
  )
}

export default function FloatingShapes() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none opacity-20">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <FloatingShape position={[-8, 2, 0]} shape="sphere" />
        <FloatingShape position={[8, -2, 0]} shape="torus" />
        <FloatingShape position={[0, 5, -5]} shape="box" />
        <FloatingShape position={[-5, -4, -3]} shape="sphere" />
        <FloatingShape position={[6, 3, -2]} shape="torus" />
      </Canvas>
    </div>
  )
}

