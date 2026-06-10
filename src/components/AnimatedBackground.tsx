export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-mesh">
      <div className="absolute -top-32 -left-32 h-96 w-96 animate-float rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute top-1/4 -right-24 h-80 w-80 animate-float-delayed rounded-full bg-violet-500/15 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-72 w-72 animate-float-slow rounded-full bg-blue-500/10 blur-3xl" />
      <div
        className="absolute top-1/2 left-1/2 h-2 w-2 animate-pulse-glow rounded-full bg-orange-400/60"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
