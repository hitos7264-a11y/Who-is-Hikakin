/* =====================================================================
   storage.js - localStorage + RESTful Table API でランキング保存
   ===================================================================== */
(function() {
  const LS_KEYS = {
    LAST_RESULT: "hikakin_quiz_last_result",
    USER_NAME: "hikakin_quiz_user_name",
    SOUND_ENABLED: "hikakin_quiz_sound"
  };

  const Storage = {
    saveResult(data) {
      try {
        localStorage.setItem(LS_KEYS.LAST_RESULT, JSON.stringify(data));
      } catch (e) {}
    },
    loadResult() {
      try {
        const raw = localStorage.getItem(LS_KEYS.LAST_RESULT);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    clearResult() {
      try { localStorage.removeItem(LS_KEYS.LAST_RESULT); } catch (e) {}
    },
    saveName(name) {
      try { localStorage.setItem(LS_KEYS.USER_NAME, name); } catch (e) {}
    },
    loadName() {
      try { return localStorage.getItem(LS_KEYS.USER_NAME) || ""; } catch (e) { return ""; }
    },
    soundEnabled() {
      try {
        const v = localStorage.getItem(LS_KEYS.SOUND_ENABLED);
        return v === null ? true : v === "1";
      } catch (e) { return true; }
    },
    setSoundEnabled(v) {
      try { localStorage.setItem(LS_KEYS.SOUND_ENABLED, v ? "1" : "0"); } catch (e) {}
    }
  };

  /* ===== RESTful Table API ラッパ ===== */
  const Ranking = {
    async list(limit = 50) {
      try {
        const res = await fetch(`tables/quiz_scores?limit=${limit}&sort=score`);
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        // score 降順、同点なら time 昇順
        const rows = (json.data || []).filter(r => !r.deleted);
        rows.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (a.duration_sec || 999999) - (b.duration_sec || 999999);
        });
        return rows;
      } catch (e) {
        return [];
      }
    },
    async add(record) {
      try {
        const res = await fetch("tables/quiz_scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record)
        });
        if (!res.ok) throw new Error("post failed");
        return await res.json();
      } catch (e) {
        return null;
      }
    }
  };

  window.QuizStorage = Storage;
  window.QuizRanking = Ranking;
})();
