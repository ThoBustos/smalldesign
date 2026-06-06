import { content } from "../landing-content";

export function Method() {
  return (
    <section className="studio-method" id="method">
      <div className="method-blackout" aria-hidden="true" />
      <div className="method-editor">
        <p className="method-kicker js-reveal">Method</p>
        <p className="method-edit" aria-label={content.method}>
          <span>One strong idea, </span>
          <span className="method-cut">reduced until it can carry naming, identity, web, product, and launch </span>
          <span>without noise.</span>
        </p>
        <p className="method-final">Make the company easier to believe in.</p>
      </div>
    </section>
  );
}
