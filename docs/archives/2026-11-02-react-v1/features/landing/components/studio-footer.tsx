import { content } from "../landing-content";

export function StudioFooter() {
  return (
    <footer className="studio-footer">
      <img src={content.images.hero} alt="" aria-hidden="true" width="1456" height="816" loading="lazy" decoding="async" />
      <div className="footer-top">
        <span>© 2026</span>
        <span className="footer-status">All services are online</span>
      </div>
      <div className="studio-footer-word">small.design</div>
    </footer>
  );
}
