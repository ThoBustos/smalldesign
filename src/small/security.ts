type WidgetOptions = {
  sitekey: string;
  action: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};
type Turnstile = {
  render: (el: HTMLElement, options: WidgetOptions) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
let loading: Promise<Turnstile> | undefined;
export function loadSecurity() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = setTimeout(() => {
      script.remove();
      loading = undefined;
      reject(new Error("Security check timed out. Please retry."));
    }, 15000);
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      clearTimeout(timer);
      if (window.turnstile) resolve(window.turnstile);
      else {
        loading = undefined;
        reject(new Error("Security check unavailable."));
      }
    };
    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      loading = undefined;
      reject(new Error("Security check unavailable."));
    };
    document.head.append(script);
  });
  return loading;
}
