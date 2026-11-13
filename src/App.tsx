import { useEffect, useLayoutEffect } from "react";
import { Landing } from "./small/Landing";
import { Diagnostic } from "./small/Diagnostic";
import { captureDiagnosticEvent } from "./small/analytics";
export default function App() {
  const diagnostic = location.pathname.replace(/\/$/, "") === "/diagnostic";
  useEffect(() => {
    if (location.pathname === "/") captureDiagnosticEvent("small_landing_viewed");
  }, []);
  useLayoutEffect(() => {
    document.body.classList.toggle("diagnostic-page", diagnostic);
    document.title = diagnostic
      ? "Your diagnostic — Small"
      : "Small — Brand, website & product design";
    const description = diagnostic
      ? "Request your Small Diagnostic: a focused review of your brand, website and product, with clear priorities for what comes next."
      : "Independent design studio connecting positioning, brand, websites and products.";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute(
        "href",
        "https://small.design" + (diagnostic ? "/diagnostic" : "/"),
      );
    for (const property of ["og:url", "og:title", "og:description"])
      document
        .querySelector(`meta[property="${property}"]`)
        ?.setAttribute(
          "content",
          property === "og:url"
            ? location.origin + (diagnostic ? "/diagnostic" : "/")
            : property === "og:title"
              ? document.title
              : description,
        );
    const theme = matchMedia("(prefers-color-scheme: dark)");
    const update = () =>
      document
        .querySelectorAll<HTMLLinkElement>('link[rel="icon"]')
        .forEach((icon) => {
          icon.href =
            "/assets/" +
            (icon.type === "image/png"
              ? theme.matches
                ? "icon-dark-48.png"
                : "icon-48.png"
              : theme.matches
                ? "favicon-dark.ico"
                : "favicon.ico");
        });
    update();
    theme.addEventListener("change", update);
    return () => theme.removeEventListener("change", update);
  }, [diagnostic]);
  return diagnostic ? <Diagnostic /> : <Landing />;
}
