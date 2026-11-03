import { content } from "../landing-content";

export function Questions() {
  return (
    <section className="studio-questions" id="questions">
      <div className="questions-aside js-reveal">
        <span className="section-label">Questions</span>
        <h2>Before we start.</h2>
      </div>
      <div className="question-list">
        {content.questions.map((item, index) => (
          <details className="js-reveal" key={item.question} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{item.question}</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
