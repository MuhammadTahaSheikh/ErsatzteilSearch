export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-mesh">
      <div className="absolute -top-32 -left-32 h-96 w-96 animate-float rounded-full bg-orange-500/15 blur-3xl" />
      <div className="absolute top-1/4 -right-24 h-80 w-80 animate-float-delayed rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-72 w-72 animate-float-slow rounded-full bg-blue-500/8 blur-3xl" />
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
