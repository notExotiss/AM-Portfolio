'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleField({ count = 2000 }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const light = useRef<THREE.PointLight>(null)

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const x = Math.random() * 200 - 100
      const y = Math.random() * 200 - 100
      const z = Math.random() * 200 - 100
      temp.push({ time, factor, speed, x, y, z })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return

    particles.forEach((particle, i) => {
      let { factor, speed, x, y, z } = particle
      const t = (particle.time += speed)

      const nx = x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10
      const ny = y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10
      const nz = z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10

      const matrix = new THREE.Matrix4()
      matrix.compose(
        new THREE.Vector3(nx, ny, nz),
        new THREE.Quaternion(),
        new THREE.Vector3(0.5, 0.5, 0.5)
      )
      mesh.current.setMatrixAt(i, matrix)
    })

    mesh.current.instanceMatrix.needsUpdate = true

    if (light.current) {
      light.current.position.x = state.mouse.x * 50
      light.current.position.y = state.mouse.y * 50
    }
  })

  return (
    <>
      <pointLight ref={light} distance={100} intensity={2} color="#3b82f6" />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </instancedMesh>
    </>
  )
}

export default function ParticlesBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30">
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <ParticleField count={1500} />
      </Canvas>
    </div>
  )
}

