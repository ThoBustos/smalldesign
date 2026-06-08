import { useCallback, useState } from "react";
import { Hero } from "./components/hero";
import { Method } from "./components/method";
import { Questions } from "./components/questions";
import { Services } from "./components/services";
import { StudioFooter } from "./components/studio-footer";
import { StudioLoader } from "./components/studio-loader";
import { StudioTopBar } from "./components/studio-topbar";
import { useLandingAnimations } from "./hooks/use-landing-animations";

export function LandingPage() {
  const [loaderDone, setLoaderDone] = useState(false);
  const handleLoaderDone = useCallback(() => setLoaderDone(true), []);

  useLandingAnimations(handleLoaderDone);

  return (
    <main className="studio-page" id="top">
      {!loaderDone && <StudioLoader />}
      <StudioTopBar />
      <Hero />
      <div className="hero-blackout-transition" aria-hidden="true" />
      <Method />
      <Services />
      <Questions />
      <StudioFooter />
    </main>
  );
}
