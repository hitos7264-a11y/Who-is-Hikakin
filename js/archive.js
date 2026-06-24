/* =====================================================================
   archive.js - 全問解説アーカイブ描画
   ===================================================================== */
(function() {
  const root = document.getElementById("archive-root");
  if (!root || !window.QUIZ_DATA) return;

  function esc(s) {
    return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  }

  // イントロ
  const introHtml = `
    <section class="archive-intro">
      <h1 class="section-title" style="text-align:center;">${esc(window.QUIZ_INTRO.title)}</h1>
      <span class="gold-rule"></span>
      <p class="section-lead" style="margin-top: 18px;">${esc(window.QUIZ_INTRO.lead)}</p>
    </section>
  `;

  const itemsHtml = window.QUIZ_DATA.map(q => {
    const incHeading = q.incorrectHeading || "❌ 不正解の解説";

    // 選択肢一覧
    const choicesHtml = q.choices.map(c => `
      <li class="archive-choice ${q.answer.includes(c.key) ? 'is-answer' : ''}">
        <span class="archive-choice-key">${c.key}</span>
        <span class="archive-choice-text">${esc(c.text)}</span>
        ${q.answer.includes(c.key) ? '<span class="archive-choice-mark">✓</span>' : ''}
      </li>
    `).join("");

    // テーブル
    let tableHtml = "";
    if (q.extraTable) {
      tableHtml = `<table class="explain-table">
        <thead><tr>${q.extraTable.headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
        <tbody>${q.extraTable.rows.map(row =>
          `<tr>${row.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`
        ).join("")}</tbody>
      </table>`;
    }

    // リスト
    let listHtml = "";
    if (q.extraList && q.extraList.length) {
      listHtml = `<ul class="explain-extra-list">${q.extraList.map(li =>
        `<li>${esc(li)}</li>`
      ).join("")}</ul>`;
    }

    const incHtml = (q.incorrect || []).map(i => `
      <div class="explain-incorrect-item">
        <span class="explain-incorrect-key">${esc(i.key)}</span>
        <span class="explain-incorrect-text">${esc(i.text)}</span>
      </div>
    `).join("");

    const tagCls = q.type === "multiple" ? "archive-tag is-multi" : "archive-tag";

    return `
      <article class="archive-item" id="q${q.number}">
        <div class="archive-head">
          <span class="archive-num">Q${String(q.number).padStart(2,"0")}</span>
          <div class="archive-q">
            ${esc(q.question)}
            ${q.questionSub ? `<div style="margin-top:10px; font-size:13px; color: var(--color-text-secondary);">${esc(q.questionSub)}</div>` : ""}
          </div>
          <span class="${tagCls}">${esc(q.typeLabel)}</span>
        </div>
        <div class="archive-body">
          <ul class="archive-choices">${choicesHtml}</ul>
          <div class="archive-answer-block">
            <div class="explain-answer"><span class="mark">✅</span>正解: ${esc(q.answerLabel)}</div>
            <p class="explain-text">${esc(q.explanation)}</p>
            ${tableHtml}
            ${listHtml}
            <div class="explain-incorrect-heading">${esc(incHeading)}</div>
            <div class="explain-incorrect">${incHtml}</div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // アウトロ
  const outroHtml = `
    <section class="archive-outro">
      <h2 class="archive-outro-heading">${esc(window.QUIZ_OUTRO.heading)}</h2>
      <ul class="explain-extra-list">${window.QUIZ_OUTRO.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>
      <p class="archive-outro-closing">${esc(window.QUIZ_OUTRO.closing)}</p>
    </section>
  `;

  root.innerHTML = `
    ${introHtml}
    <div class="archive-toc">
      ${window.QUIZ_DATA.map(q => `<a href="#q${q.number}" class="archive-toc-link">Q${String(q.number).padStart(2,"0")}</a>`).join("")}
    </div>
    <div class="archive-list">${itemsHtml}</div>
    ${outroHtml}
  `;
})();
