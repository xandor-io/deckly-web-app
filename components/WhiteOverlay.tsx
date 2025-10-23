export function WhiteOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 bg-white/5"
      style={{
        mixBlendMode: "overlay",
      }}
    />
  )
}
