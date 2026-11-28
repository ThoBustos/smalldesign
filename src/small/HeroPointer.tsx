import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./hero-pointer.css";

const interactiveArea = ".landing-header, #main, .contact-footer, .landing-signature";

export function HeroPointer() {
  const indicator = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = indicator.current!;
    const root = document.documentElement;
    const media = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const quickX = gsap.quickTo(node, "x", { duration: .26, ease: "power3.out" });
    const quickY = gsap.quickTo(node, "y", { duration: .26, ease: "power3.out" });

    let docked: HTMLElement | null = null;
    let pointer: { x: number; y: number } | null = null;

    function undock() {
      if (!docked) return;
      docked.removeAttribute("data-arrow-active");
      docked.style.removeProperty("--arrow-x");
      docked.style.removeProperty("--arrow-y");
      docked = null;
    }

    function dock(action: HTMLElement, x: number, y: number) {
      if (docked !== action) {
        undock();
        docked = action;
        docked.setAttribute("data-arrow-active", "");
      }

      const bounds = action.getBoundingClientRect();
      const dx = x - bounds.left - bounds.width / 2;
      const dy = y - bounds.top - bounds.height / 2;
      const radius = 100;
      const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
      const pull = .32 * proximity * proximity * (3 - 2 * proximity);
      action.style.setProperty("--arrow-x", `${(dx * pull).toFixed(2)}px`);
      action.style.setProperty("--arrow-y", `${(dy * pull).toFixed(2)}px`);
    }

    function hide() {
      pointer = null;
      undock();
      node.removeAttribute("data-visible");
      delete root.dataset.heroPointer;
    }

    function update(target: Element | null, x: number, y: number) {
      if (!target?.closest(interactiveArea) || target.closest(".skip-link")) {
        hide();
        return;
      }

      const link = target.closest("a[href]");
      const action = link?.querySelector<HTMLElement>("[data-hero-arrow-dock]");
      if (action) dock(action, x, y);
      else undock();

      const navRing = !action && Boolean(link?.closest(".landing-header nav, .signature-links"));
      if (link && navRing) {
        const bounds = link.getBoundingClientRect();
        x += gsap.utils.clamp(-13, 13, (bounds.left + bounds.width / 2 - x) * .55);
        y += gsap.utils.clamp(-13, 13, (bounds.top + bounds.height / 2 - y) * .55);
      } else if (link && !action) {
        x += 12;
        y += 12;
      }

      if (!node.hasAttribute("data-visible")) gsap.set(node, { x, y });
      quickX(x);
      quickY(y);
      node.toggleAttribute("data-nav-ring", navRing);
      node.toggleAttribute("data-docked", Boolean(action));
      const reverse = target.closest(".wordmark-scene-reverse-type")?.querySelector(".footer-motion")?.getBoundingClientRect();
      const overReverse = reverse && x >= reverse.left && x <= reverse.right && y >= reverse.top && y <= reverse.bottom;
      node.toggleAttribute("data-on-dark", Boolean(overReverse || target.closest(".signature-ink")));
      node.setAttribute("data-visible", "");
      root.dataset.heroPointer = "active";
    }

    function move(event: PointerEvent) {
      if (!media.matches || event.pointerType !== "mouse") {
        hide();
        return;
      }
      pointer = { x: event.clientX, y: event.clientY };
      update(event.target instanceof Element ? event.target : null, pointer.x, pointer.y);
    }

    function scroll() {
      if (pointer) update(document.elementFromPoint(pointer.x, pointer.y), pointer.x, pointer.y);
    }

    function leave(event: PointerEvent) {
      if (!event.relatedTarget) hide();
    }

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("blur", hide);
    window.addEventListener("keydown", hide);
    media.addEventListener("change", hide);
    return () => {
      hide();
      quickX.tween.kill();
      quickY.tween.kill();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("blur", hide);
      window.removeEventListener("keydown", hide);
      media.removeEventListener("change", hide);
    };
  }, []);

  return (
    <div className="hero-pointer hero-pointer-ring" aria-hidden="true" ref={indicator}>
      <span />
    </div>
  );
}
