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
