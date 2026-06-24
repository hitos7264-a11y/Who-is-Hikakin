/* =====================================================================
   quiz-engine.js - クイズ進行 / 採点 / 解説表示
   ===================================================================== */
(function() {
  const data = window.QUIZ_DATA || [];
  const total = data.length;

  /* ステート */
  const state = {
    index: 0,
    selections: [],     // 現在問題で選択中のキー（配列）
    answers: [],        // 各問の選択結果配列
    isJudged: false,    // 現在問題が採点済みか
    judgements: [],     // 各問の正誤 boolean
    startTime: Date.now()
  };

  /* DOM */
  const el = {
    counter: document.getElementById("counter-current"),
    counterTotal: document.getElementById("counter-total"),
    dots: document.getElementById("quiz-dots"),
    scoreCorrect: document.getElementById("score-correct"),
    scoreWrong: document.getElementById("score-wrong"),
    card: document.getElementById("quiz-card"),
    qType: document.getElementById("q-type"),
    qText: document.getElementById("q-text"),
    qSub: document.getElementById("q-sub"),
    choices: document.getElementById("choices"),
    actionHint: document.getElementById("action-hint"),
    submitBtn: document.getElementById("submit-btn"),
    explain: document.getElementById("explain"),
    nextBtn: document.getElementById("next-btn"),
    quizNav: document.getElementById("quiz-nav")
  };

  /* ===== ドット初期化 ===== */
  function renderDots() {
    el.dots.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const d = document.createElement("span");
      d.className = "quiz-dot";
      if (i === state.index) d.classList.add("is-current");
      if (state.judgements[i] === true) d.classList.add("is-correct");
      if (state.judgements[i] === false) d.classList.add("is-wrong");
      el.dots.appendChild(d);
    }
  }

  /* ===== スコア表示 ===== */
  function renderScore() {
    const ok = state.judgements.filter(x => x === true).length;
    const ng = state.judgements.filter(x => x === false).length;
    el.scoreCorrect.textContent = String(ok).padStart(2, "0");
    el.scoreWrong.textContent = String(ng).padStart(2, "0");
  }

  /* ===== 問題描画 ===== */
  function renderQuestion() {
    const q = data[state.index];
    state.selections = [];
    state.isJudged = false;

    el.counter.textContent = String(state.index + 1).padStart(2, "0");
    el.counterTotal.textContent = String(total).padStart(2, "0");

    // タイプpill
    el.qType.textContent = "【" + q.typeLabel + "】";
    el.qType.classList.toggle("is-multi", q.type === "multiple");

    el.qText.textContent = q.question;

    if (q.questionSub) {
      el.qSub.style.display = "";
      el.qSub.textContent = q.questionSub;
    } else {
      el.qSub.style.display = "none";
    }

    // 選択肢
    el.choices.innerHTML = "";
    q.choices.forEach(c => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      if (q.type === "multiple") btn.classList.add("is-multi");
      btn.dataset.key = c.key;
      btn.innerHTML = `
        <span class="choice-key">${c.key}</span>
        <span class="choice-text">${escapeHtml(c.text)}</span>
        <span class="choice-check" aria-hidden="true"></span>
        <span class="choice-mark" aria-hidden="true"></span>
      `;
      btn.addEventListener("click", () => onChoiceClick(btn, c.key));
      el.choices.appendChild(btn);
    });

    // ヒント
    if (q.type === "multiple") {
      el.actionHint.innerHTML = "<b>複数選択可</b>。当てはまるものをすべて選び、「回答する」を押してください。";
      el.submitBtn.style.display = "";
      el.submitBtn.disabled = true;
    } else {
      el.actionHint.innerHTML = "選択肢をクリックすると<b>即座に判定</b>されます。";
      el.submitBtn.style.display = "none";
    }

    // 解説リセット
    el.explain.classList.remove("is-open");
    el.explain.innerHTML = "";
    el.quizNav.style.display = "none";

    // カードフリップアニメ
    el.card.classList.remove("is-flipping");
    void el.card.offsetWidth;
    el.card.classList.add("is-flipping");

    renderDots();
    renderScore();

    // スクロール
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ===== 選択肢クリック ===== */
  function onChoiceClick(btn, key) {
    if (state.isJudged) return;
    const q = data[state.index];
    if (window.Sound) window.Sound.select();

    if (q.type === "multiple") {
      // トグル
      const idx = state.selections.indexOf(key);
      if (idx >= 0) {
        state.selections.splice(idx, 1);
        btn.classList.remove("is-selected");
      } else {
        state.selections.push(key);
        btn.classList.add("is-selected");
      }
      el.submitBtn.disabled = state.selections.length === 0;
    } else {
      // 単一選択：即判定
      state.selections = [key];
      btn.classList.add("is-selected");
      judge();
    }
  }

  /* ===== 採点 ===== */
  function judge() {
    const q = data[state.index];
    state.isJudged = true;

    const correct = q.answer.slice().sort().join(",");
    const picked = state.selections.slice().sort().join(",");
    const isOk = correct === picked;
    state.judgements[state.index] = isOk;
    state.answers[state.index] = state.selections.slice();

    // 選択肢の色付け
    Array.from(el.choices.children).forEach(btn => {
      btn.classList.add("is-disabled");
      const k = btn.dataset.key;
      const isCorrectKey = q.answer.includes(k);
      const isPicked = state.selections.includes(k);

      const mark = btn.querySelector(".choice-mark");
      if (isCorrectKey) {
        btn.classList.add("is-correct-answer");
        mark.textContent = "✓";
      } else if (isPicked) {
        btn.classList.add("is-wrong-answer");
        mark.textContent = "✕";
      }
    });

    // 演出
    if (isOk) {
      if (window.Sound) window.Sound.correct();
      if (window.fireConfetti) window.fireConfetti();
      if (window.fireRingPulse) {
        const rect = el.card.getBoundingClientRect();
        window.fireRingPulse(rect.left + rect.width / 2, rect.top + 80, "#d4af37");
      }
    } else {
      if (window.Sound) window.Sound.wrong();
      el.card.classList.add("is-shaking");
      setTimeout(() => el.card.classList.remove("is-shaking"), 600);
    }

    renderExplanation(q, isOk);
    renderDots();
    renderScore();

    // 次へボタン
    el.quizNav.style.display = "flex";
    el.nextBtn.textContent = state.index === total - 1 ? "結果を見る" : "次の問題へ →";
  }

  /* ===== 解説描画 ===== */
  function renderExplanation(q, isOk) {
    const incHeading = q.incorrectHeading || "❌ 不正解の解説";

    let tableHtml = "";
    if (q.extraTable) {
      tableHtml = `
        <table class="explain-table">
          <thead><tr>${q.extraTable.headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
          <tbody>
            ${q.extraTable.rows.map(row =>
              `<tr>${row.map(c => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`
            ).join("")}
          </tbody>
        </table>
      `;
    }

    let extraListHtml = "";
    if (q.extraList && q.extraList.length) {
      extraListHtml = `
        <ul class="explain-extra-list">
          ${q.extraList.map(li => `<li>${escapeHtml(li)}</li>`).join("")}
        </ul>
      `;
    }

    const incHtml = (q.incorrect || []).map(i => `
      <div class="explain-incorrect-item">
        <span class="explain-incorrect-key">${escapeHtml(i.key)}</span>
        <span class="explain-incorrect-text">${escapeHtml(i.text)}</span>
      </div>
    `).join("");

    el.explain.innerHTML = `
      <div class="explain-banner ${isOk ? 'is-ok' : 'is-ng'}">
        <span class="explain-banner-icon">${isOk ? "✓" : "✕"}</span>
        <span>${isOk ? "見事、正解です。" : "惜しい！正解はこちら。"}</span>
      </div>
      <div class="explain-body">
        <div class="explain-answer">
          <span class="mark">✅</span>正解: ${escapeHtml(q.answerLabel)}
        </div>
        <p class="explain-text">${escapeHtml(q.explanation)}</p>
        ${tableHtml}
        ${extraListHtml}
        <div class="explain-incorrect-heading">${escapeHtml(incHeading)}</div>
        <div class="explain-incorrect">${incHtml}</div>
      </div>
    `;
    requestAnimationFrame(() => el.explain.classList.add("is-open"));
  }

  /* ===== 「回答する」ボタン（複数選択時のみ）===== */
  el.submitBtn.addEventListener("click", () => {
    if (state.selections.length === 0 || state.isJudged) return;
    judge();
  });

  /* ===== 「次へ」ボタン ===== */
  el.nextBtn.addEventListener("click", () => {
    if (window.Sound) window.Sound.click();
    if (state.index === total - 1) {
      // 結果ページへ
      const ok = state.judgements.filter(x => x === true).length;
      const result = {
        score: ok,
        total: total,
        judgements: state.judgements,
        answers: state.answers,
        duration_sec: Math.floor((Date.now() - state.startTime) / 1000),
        timestamp: Date.now()
      };
      if (window.QuizStorage) window.QuizStorage.saveResult(result);
      if (window.Sound) window.Sound.finish();
      setTimeout(() => { window.location.href = "result.html"; }, 600);
    } else {
      state.index++;
      renderQuestion();
    }
  });

  /* ===== HTMLエスケープ ===== */
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  /* ===== キーボードショートカット ===== */
  document.addEventListener("keydown", (e) => {
    // A-E で選択
    const key = e.key.toUpperCase();
    if (["A", "B", "C", "D", "E"].includes(key) && !state.isJudged) {
      const btn = el.choices.querySelector(`[data-key="${key}"]`);
      if (btn) btn.click();
    }
    // Enter で submit / next
    if (e.key === "Enter") {
      if (state.isJudged) {
        el.nextBtn.click();
      } else if (!el.submitBtn.disabled && el.submitBtn.style.display !== "none") {
        el.submitBtn.click();
      }
    }
  });

  /* ===== 初期化 ===== */
  state.judgements = new Array(total).fill(null);
  renderQuestion();
})();
