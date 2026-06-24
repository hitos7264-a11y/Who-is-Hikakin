/* =====================================================================
   sound.js - Web Audio API による合成効果音（軽量・依存なし）
   ===================================================================== */
(function() {
  let ctx;
  let enabled = true;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, duration, type = "sine", gainVal = 0.18) {
    if (!enabled) return;
    const ac = getCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(gainVal, ac.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + duration + 0.05);
  }

  const Sound = {
    click() { tone(880, 0.07, "triangle", 0.10); },
    select() { tone(660, 0.10, "sine", 0.12); tone(990, 0.10, "sine", 0.10); },
    correct() {
      // 上昇する和音
      setTimeout(() => tone(523.25, 0.15, "triangle", 0.18), 0);   // C5
      setTimeout(() => tone(659.25, 0.15, "triangle", 0.18), 100); // E5
      setTimeout(() => tone(783.99, 0.3, "triangle", 0.20), 200);  // G5
      setTimeout(() => tone(1046.5, 0.4, "triangle", 0.20), 300);  // C6
    },
    wrong() {
      // 下降する低音
      setTimeout(() => tone(311.13, 0.2, "sawtooth", 0.12), 0);    // D#4
      setTimeout(() => tone(233.08, 0.35, "sawtooth", 0.12), 150); // A#3
    },
    finish() {
      // ファンファーレ
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      notes.forEach((n, i) => setTimeout(() => tone(n, 0.25, "triangle", 0.2), i * 130));
    },
    toggle(state) { enabled = state; }
  };

  window.Sound = Sound;
})();
