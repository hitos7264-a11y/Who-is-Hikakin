/* =====================================================================
   result.js - 結果表示 + ランキング保存・表示
   ===================================================================== */
(function() {
  const result = window.QuizStorage ? window.QuizStorage.loadResult() : null;
  const data = window.QUIZ_DATA || [];

  // 結果がなければ案内表示
  if (!result) {
    const wrap = document.getElementById("result-root");
    if (wrap) {
      wrap.innerHTML = `
        <div class="result-hero">
          <h1 class="result-rank-title">まだ挑戦記録がありません</h1>
          <p class="result-rank-sub">まずは10問のクイズに挑戦してみましょう。<br>結果はこのページに表示され、ランキングにも保存できます。</p>
          <div class="result-cta">
            <a href="quiz.html" class="btn btn-primary">▶ クイズを始める</a>
            <a href="archive.html" class="btn btn-ghost">解説アーカイブを見る</a>
          </div>
        </div>
        <section style="margin-top:60px;">
          <h2 class="section-title" style="font-size:24px; text-align:center;">これまでの<span class="gold-text">挑戦者ランキング</span></h2>
          <span class="gold-rule"></span>
          <div id="ranking-table-wrap"></div>
        </section>
      `;
      renderRanking(null);
    }
    return;
  }

  /* ===== ランク判定 ===== */
  function rankInfo(score, total) {
    const ratio = score / total;
    if (score === total) return { letter: "S", title: "ヒカキン博士、ここに誕生。", sub: "全問正解、文句なしのパーフェクト。新潟県妙高市の出身であることから、結婚発表の日付まで完璧に把握しているあなたは、もはや本人公認レベルです。" };
    if (ratio >= 0.8)    return { letter: "A", title: "ほぼ完璧。立派なヒカキン通。", sub: "8割以上の正解率は素晴らしい。あと数問の知識を補強すれば、あなたも「博士」の称号を手にできます。" };
    if (ratio >= 0.6)    return { letter: "B", title: "上級ファンの片鱗あり。", sub: "ヒカキンの主要なエピソードはしっかり押さえています。アリアナ・グランデのコラボ曲や、HIKAKIN PREMIUMの細部まで覚えればさらに上を目指せます。" };
    if (ratio >= 0.4)    return { letter: "C", title: "標準的な知識レベル。", sub: "メジャーな話題はだいたい知っているけれど、コアな豆知識ではまだ取りこぼしも。解説アーカイブで復習してから再挑戦してみましょう。" };
    if (ratio >= 0.2)    return { letter: "D", title: "これから知ればいい。", sub: "ここからがスタート。ヒカキンの歩みは日本のYouTube史そのもの。解説を読みながら、興味深いエピソードを発見していきましょう。" };
    return { letter: "E", title: "新潟県妙高市から出発しよう。", sub: "ヒカキンの本名「開發 光」、出身地、原点のチャンネル名——基礎から押さえていけば、必ず楽しめます。解説アーカイブを丁寧に読んでみてください。" };
  }

  const ri = rankInfo(result.score, result.total);

  // 各問の正誤セル
  const cellsHtml = result.judgements.map((j, i) => {
    const cls = j === true ? "is-ok" : j === false ? "is-ng" : "";
    const mark = j === true ? "✓" : j === false ? "✕" : "—";
    return `<div class="result-cell ${cls}">
      <div class="result-cell-num">Q${String(i+1).padStart(2,"0")}</div>
      <div class="result-cell-mark">${mark}</div>
      <div class="result-cell-label">${j === true ? "CORRECT" : j === false ? "WRONG" : "—"}</div>
    </div>`;
  }).join("");

  const m = Math.floor(result.duration_sec / 60);
  const s = result.duration_sec % 60;
  const timeStr = `${m}分${String(s).padStart(2,"0")}秒`;

  // 名前入力欄を表示
  const savedName = window.QuizStorage.loadName();

  const wrap = document.getElementById("result-root");
  wrap.innerHTML = `
    <div class="result-hero">
      <div class="result-rank-crest">
        <div class="result-rank-ring"></div>
        <div class="result-rank-inner">${ri.letter}</div>
      </div>
      <h1 class="result-rank-title">${escapeHtml(ri.title)}</h1>
      <p class="result-rank-sub">${escapeHtml(ri.sub)}</p>
      <div class="result-score-line">
        <span class="num">${result.score}</span>
        <span class="total">/ ${result.total}</span>
        <span class="label">SCORE</span>
      </div>
      <div style="margin-top: 18px; color: var(--color-text-muted); font-size: 13px; letter-spacing: 0.1em;">
        所要時間：${timeStr}
      </div>
    </div>

    <div class="result-detail">${cellsHtml}</div>

    <section class="name-prompt" id="name-prompt">
      <p>ランキングに登録するためにお名前（ニックネーム）を入力してください。</p>
      <div class="name-input-row">
        <input type="text" id="player-name" class="name-input" placeholder="例：博士見習い" value="${escapeHtml(savedName)}" maxlength="20">
        <button id="save-score-btn" type="button" class="btn btn-primary">登録する</button>
      </div>
      <div id="name-saved-msg" class="name-saved" style="display:none;">✓ ランキングに登録しました</div>
    </section>

    <section class="ranking-section">
      <h2 class="section-title" style="font-size:24px; text-align:center;">挑戦者<span class="gold-text">ランキング</span></h2>
      <span class="gold-rule"></span>
      <div id="ranking-table-wrap" style="margin-top: 30px;"></div>
    </section>

    <div class="result-cta">
      <a href="quiz.html" class="btn btn-primary" onclick="if(window.QuizStorage) window.QuizStorage.clearResult();">▶ もう一度挑戦する</a>
      <a href="archive.html" class="btn btn-ghost">解説アーカイブを読む</a>
      <a href="index.html" class="btn btn-ghost">ホームに戻る</a>
    </div>
  `;

  // 登録処理
  const saveBtn = document.getElementById("save-score-btn");
  const nameInput = document.getElementById("player-name");
  const savedMsg = document.getElementById("name-saved-msg");
  let myRecordId = null;

  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim() || "ヒカキンファン";
    window.QuizStorage.saveName(name);
    saveBtn.disabled = true;
    saveBtn.textContent = "登録中...";
    const rec = await window.QuizRanking.add({
      name: name,
      score: result.score,
      total: result.total,
      duration_sec: result.duration_sec,
      timestamp: result.timestamp || Date.now()
    });
    if (rec && rec.id) {
      myRecordId = rec.id;
      savedMsg.style.display = "block";
      saveBtn.textContent = "✓ 登録済み";
      // 結果をクリア（再投稿防止）
      window.QuizStorage.clearResult();
      // ランキング再描画
      renderRanking(myRecordId);
    } else {
      saveBtn.disabled = false;
      saveBtn.textContent = "登録する";
      savedMsg.textContent = "⚠ 登録に失敗しました。時間をおいて再度お試しください。";
      savedMsg.style.color = "var(--color-incorrect-light)";
      savedMsg.style.display = "block";
    }
  });

  // 初回ランキング表示
  renderRanking(null);

  /* ===== ランキング描画 ===== */
  async function renderRanking(highlightId) {
    const wrap = document.getElementById("ranking-table-wrap");
    if (!wrap) return;
    const rows = await window.QuizRanking.list(50);
    if (!rows.length) {
      wrap.innerHTML = `<div class="ranking-empty">まだランキングに登録された記録はありません。<br>あなたが最初の挑戦者になりましょう。</div>`;
      return;
    }
    const top = rows.slice(0, 20);
    let html = `<div class="ranking-table">
      <div class="ranking-row is-head">
        <span>順位</span>
        <span>名前</span>
        <span>スコア</span>
        <span class="rank-time">時間</span>
      </div>`;
    top.forEach((r, i) => {
      const place = i + 1;
      const placeCls = place === 1 ? "gold" : place === 2 ? "silver" : place === 3 ? "bronze" : "";
      const isYou = highlightId && r.id === highlightId;
      const m = Math.floor((r.duration_sec || 0) / 60);
      const s = (r.duration_sec || 0) % 60;
      const tStr = `${m}:${String(s).padStart(2,"0")}`;
      html += `
        <div class="ranking-row ${isYou ? 'is-you' : ''}">
          <span class="rank-place ${placeCls}">${String(place).padStart(2,"0")}</span>
          <span class="rank-name ${isYou ? 'you-tag' : ''}">${escapeHtml(r.name || "名無し")}</span>
          <span class="rank-score">${r.score}/${r.total}</span>
          <span class="rank-time">${tStr}</span>
        </div>`;
    });
    html += `</div>`;
    wrap.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  }
})();
