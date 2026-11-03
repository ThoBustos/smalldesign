import { useEffect, useRef } from "react";
export function IdleCompanion() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!,
      ctx = canvas.getContext("2d")!,
      im = new Image(),
      reduce = matchMedia("(prefers-reduced-motion: reduce)"),
      abort = new AbortController();
    let boxes: number[][] = [],
      ready = false,
      t = 0,
      last = 0,
      raf = 0,
      w = 0,
      h = 0,
      disposed = false;
    function draw() {
      if (!ready || !w || disposed) return;
      ctx.clearRect(0, 0, w, h);
      const b =
          boxes[reduce.matches ? 0 : [0, 1, 2, 1][Math.floor(t / 250) % 4]],
        size = Math.min(135, w * 0.62, h * 0.72),
        bh = size * (1 + Math.sin((t / 2000) * Math.PI * 2) * 0.009),
        bw = size * 0.99,
        cx = w / 2,
        base = h * 0.82;
      ctx.save();
      ctx.translate(cx, base + 2);
      ctx.scale(1, 0.16);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.52);
      g.addColorStop(0, "#0003");
      g.addColorStop(1, "#0000");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(im, b[0], b[1], b[2], b[3], cx - bw / 2, base - bh, bw, bh);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx - bw * 0.14, base - size * 0.7, size * 0.055, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    function tick(now: number) {
      raf = 0;
      if (disposed || document.hidden) return;
      if (last && !reduce.matches) t += Math.min(now - last, 70);
      last = now;
      draw();
      if (!reduce.matches) raf = requestAnimationFrame(tick);
    }
    function resume() {
      cancelAnimationFrame(raf);
      last = 0;
      if (!document.hidden && !disposed) raf = requestAnimationFrame(tick);
    }
    const observer = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect(),
        d = Math.min(devicePixelRatio, 2);
      w = r.width;
      h = r.height;
      canvas.width = w * d;
      canvas.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      draw();
    });
    observer.observe(canvas);
    fetch("/assets/character/idle-bounds.json", { signal: abort.signal })
      .then((r) => r.json())
      .then((data) => {
        boxes = data.bounds;
        im.onload = () => {
          ready = true;
          resume();
        };
        im.src = "/assets/idle-bodies.webp";
      })
      .catch(() => {});
    document.addEventListener("visibilitychange", resume);
    reduce.addEventListener("change", resume);
    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
      reduce.removeEventListener("change", resume);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Small’s painted companion faces the questions and gently breathes"
    />
  );
}
