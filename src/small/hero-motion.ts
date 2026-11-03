export function startHero(canvas: HTMLCanvasElement, onUnfolded?: () => void, onError?: () => void) {
  const ctx = canvas.getContext("2d")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    images: Record<string, HTMLImageElement> = {};
  let spec: Record<string, [number, number, number, number][]>,
    disposed = false,
    announced = false,
    ready = false,
    t = 0,
    last = 0,
    lastPaint = 0,
    raf = 0,
    w = 0,
    h = 0;
  const clamp = (x: number) => Math.max(0, Math.min(1, x)),
    ease = (x: number) => {
      x = clamp(x);
      return x * x * (3 - 2 * x);
    },
    mix = (a: number, b: number, p: number) => a + (b - a) * p;
  function shadow(x: number, y: number, r: number, opacity: number) {
    ctx.save();
    ctx.translate(x, y + 2);
    ctx.scale(1, 0.22);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, `rgba(0,0,0,${opacity})`);
    g.addColorStop(0.5, `rgba(0,0,0,${opacity * 0.35})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function body(
    slug: string,
    index: number,
    cx: number,
    base: number,
    height: number,
    flip = false,
    angle = 0,
    pivot = cx,
  ) {
    const b = spec[slug][index],
      bw = (b[2] / b[3]) * height;
    ctx.save();
    ctx.translate(pivot, base);
    ctx.rotate(angle);
    ctx.translate(cx - pivot, 0);
    ctx.scale(flip ? -1 : 1, 1);
    ctx.drawImage(images[slug], ...b, -bw / 2, -height, bw, height);
    ctx.restore();
    return bw;
  }
  function eye(x: number, y: number, r: number, open = 1) {
    if (open <= 0.02) return;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * open, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  function waddle(root: number, base: number, size: number, seconds: number) {
    const phase = seconds % 1,
      idx = Math.min(5, Math.floor(phase * 6)),
      b = spec.waddle[idx],
      bw = (b[2] / b[3]) * size,
      planted = [0, 0, 1, 1, 1, 0][idx],
      anchors = [0.315, 0.411, 0.676, 0.752, 0.788, 0.435],
      feet = [
        [0.315, 0.769],
        [0.411, 0.794],
        [0.3, 0.676],
        [0.291, 0.752],
        [0.389, 0.788],
        [0.435, 0.704],
      ],
      contact = root + (planted ? 1 : -1) * size * 0.16,
      cx = contact - (anchors[idx] - 0.5) * bw,
      angle = Math.sin(phase * Math.PI * 2) * 0.025;
    for (let foot = 0; foot < 2; foot++)
      shadow(
        cx + (feet[idx][foot] - 0.5) * bw,
        base,
        size * (foot === planted ? 0.095 : 0.12),
        foot === planted ? 0.23 : [0, 3].includes(idx) ? 0.11 : 0.035,
      );
    body("waddle", idx, cx, base, size, idx >= 4, angle, contact);
    ctx.save();
    ctx.translate(contact, base);
    ctx.rotate(angle);
    eye(cx - contact - bw * 0.14, -size * 0.7, size * 0.05);
    ctx.restore();
    return idx;
  }
  function blink(s: number) {
    let open = 1;
    for (const at of [0.9, 1.85, 2.18]) {
      const d = Math.abs(s - at);
      if (d < 0.13)
        open = Math.min(open, 1 - Math.sin(((1 - d / 0.13) * Math.PI) / 2));
    }
    return open;
  }
  function draw() {
    if (disposed || !ready || !w) return;
    ctx.clearRect(0, 0, w, h);
    const size = Math.min(240, h * 0.7, w * 0.45),
      base = h * 0.82,
      cx = w / 2,
      speed = Math.max(38, Math.min(70, w / 21)),
      walkDuration = (cx + size * 0.65) / speed,
      total = 7.3 + walkDuration + 0.35,
      seconds = reduced.matches ? 6 : (t / 1000) % total;
    let phase,
      x = cx,
      index = -1;
    if (seconds < 2.5) {
      phase = "roll";
      const p = ease(seconds / 2.5),
        r = size * 0.25;
      x = mix(w + r, cx, p);
      shadow(x, base, r * 0.8, 0.17);
      ctx.fillStyle = "#080808";
      ctx.beginPath();
      ctx.arc(x, base - r, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (seconds < 4.8) {
      phase = "unfold";
      const s = 1.02 + ((seconds - 2.5) / 2.3) * 1.78;
      index =
        s < 1.22
          ? 1
          : s < 1.46
            ? 2
            : s < 1.74
              ? 3
              : s < 2.02
                ? 4
                : s < 2.26
                  ? 5
                  : s < 2.55
                    ? 6
                    : 7;
      const fac = [0.65, 0.65, 0.75, 0.88, 0.96, 1, 1, 1][index],
        b = spec.transformation[index],
        height = ((size * b[3]) / 314) * fac,
        bw = (b[2] / b[3]) * height,
        split = ease((s - 1.95) / 0.35);
      if (split < 1) shadow(cx, base, size * 0.24, 0.14 * (1 - split));
      if (split > 0) {
        shadow(cx - bw * 0.12, base, size * 0.1, 0.22 * split);
        shadow(cx + bw * 0.28, base, size * 0.1, 0.2 * split);
      }
      body("transformation", index, cx, base, height);
      eye(
        cx - bw * 0.14,
        base - size * 0.7,
        size * 0.052,
        ease((s - 2.5) / 0.22),
      );
    } else if (seconds < 7.3) {
      phase = "idle";
      index = 7;
      const b = spec.transformation[index],
        height =
          ((size * b[3]) / 314) *
          (1 + Math.sin((seconds - 4.8) * Math.PI) * 0.006),
        bw = (b[2] / b[3]) * height;
      shadow(cx - bw * 0.12, base, size * 0.1, 0.22);
      shadow(cx + bw * 0.28, base, size * 0.1, 0.2);
      body("transformation", index, cx, base, height);
      eye(
        cx - bw * 0.14,
        base - size * 0.7,
        size * 0.052,
        reduced.matches ? 1 : blink(seconds - 4.8),
      );
    } else if (seconds < 7.3 + walkDuration) {
      phase = "walk";
      const s = seconds - 7.3;
      x = cx - s * speed;
      index = waddle(x, base, size, s);
    } else phase = "empty";
    if (phase === "idle" && !announced) { announced = true; onUnfolded?.(); }
    canvas.dataset.phase = phase;
    canvas.dataset.x = x.toFixed(1);
    canvas.dataset.frame = String(index);
    canvas.dataset.time = seconds.toFixed(2);
    canvas.dataset.duration = total.toFixed(2);
  }
  function tick(now: number) {
    raf = 0;
    if (document.hidden || reduced.matches) {
      last = 0;
      draw();
      return;
    }
    if (last) t += Math.min(now - last, 70);
    last = now;
    if (now - lastPaint >= 33) {
      draw();
      lastPaint = now;
    }
    raf = requestAnimationFrame(tick);
  }
  function schedule() {
    draw();
    if (!disposed && !raf && !document.hidden && !reduced.matches)
      raf = requestAnimationFrame(tick);
  }
  const observer = new ResizeObserver(() => {
    const r = canvas.getBoundingClientRect(),
      d = Math.min(devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * d);
    canvas.height = Math.round(h * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    draw();
  });
  observer.observe(canvas);
  const resume = () => {
    last = 0;
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else schedule();
  };
  reduced.addEventListener("change", resume);
  document.addEventListener("visibilitychange", resume);
  fetch("/assets/journey.json", { signal: AbortSignal.timeout(8000) })
    .then((r) => {
      if (!r.ok) throw Error("metadata");
      return r.json();
    })
    .then(async (data) => {
      spec = data;
      await Promise.all(
        ["transformation", "waddle"].map(
          (slug) =>
            new Promise<void>((resolve, reject) => {
              const im = new Image();
              im.onload = () => {
                images[slug] = im;
                resolve();
              };
              im.onerror = reject;
              im.src = "/assets/" + slug + ".webp";
            }),
        ),
      );
      if (disposed) return;
      ready = true;
      schedule();
    })
    .catch(() => {
      if (disposed) return;
      onError?.();
      canvas.setAttribute("aria-label", "Small’s painted companion");
    });

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    observer.disconnect();
    reduced.removeEventListener("change", resume);
    document.removeEventListener("visibilitychange", resume);
  };
}
