/* Áudio isolado do loop de combate para permitir trocar efeitos depois. */
window.TomatoAudio = {
  createManager(rand) {
    let context;
    const tones = { shoot:[210,.06], hit:[110,.09], level:[520,.18], buy:[320,.1], slash:[280,.07], crit:[760,.12], xp:[620,.05], wave:[430,.18], boss:[75,.45], click:[360,.04] };
    return {
      play(type) {
        try {
          context ||= new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = context.createOscillator(), gain = context.createGain(), now = context.currentTime;
          oscillator.connect(gain); gain.connect(context.destination);
          const [frequency, duration] = tones[type] || tones.click, pitch = rand(.92, 1.08);
          oscillator.type = ['hit','boss'].includes(type) ? 'square' : 'triangle';
          oscillator.frequency.setValueAtTime(frequency * pitch, now);
          oscillator.frequency.exponentialRampToValueAtTime(frequency * pitch * (type === 'level' ? 1.8 : .58), now + duration);
          gain.gain.setValueAtTime(type === 'boss' ? .055 : rand(.026,.036), now);
          gain.gain.exponentialRampToValueAtTime(.001, now + duration);
          oscillator.start(now); oscillator.stop(now + duration + .02);
        } catch (_) { /* áudio é opcional: o jogo não deve falhar sem permissão */ }
      }
    };
  }
};
