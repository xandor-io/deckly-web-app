"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Shader className="h-full w-full">
        <Swirl
          colorA="#1275d8"
          colorB="#e19136"
          speed={0.8}
          detail={0.8}
          blend={50}
          coarseX={40}
          coarseY={40}
          mediumX={40}
          mediumY={40}
          fineX={40}
          fineY={40}
        />
        <ChromaFlow
          baseColor="#0066ff"
          upColor="#0066ff"
          downColor="#d1d1d1"
          leftColor="#e19136"
          rightColor="#e19136"
          intensity={0.9}
          radius={1.8}
          momentum={25}
          maskType="alpha"
          opacity={0.97}
        />
      </Shader>
      <div className="absolute inset-0 bg-black/20" />
    </div>
  )
}
