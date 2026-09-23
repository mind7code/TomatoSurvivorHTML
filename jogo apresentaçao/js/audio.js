/* Áudio isolado do loop de combate para permitir trocar efeitos depois. */
window.TomatoAudio = {
  createManager(rand) {
    let context, pendingResume, failed = false, warned = false;
    const report = error => { if (!warned) { warned = true;console.warn('Áudio indisponível neste navegador.', error); } };
    const tones = { shoot:[210,.06], hit:[110,.09], level:[520,.18], buy:[320,.1], slash:[280,.07], crit:[760,.12], xp:[620,.05], wave:[430,.18], boss:[75,.45], click:[360,.04] };
    return {
      play(type) {
        try {
          if (failed) return;
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) { failed = true;report('Web Audio não suportado.');return; }
          context ||= new AudioContext();
          if (context.state === 'closed') { failed = true;report('Contexto de áudio encerrado.');return; }
          if (context.state === 'suspended') {
            if (!pendingResume) pendingResume = context.resume().then(() => { pendingResume = null; }, error => { pendingResume = null;report(error); });
            return;
          }
          const oscillator = context.createOscillator(), gain = context.createGain(), now = context.currentTime;
          oscillator.connect(gain); gain.connect(context.destination);
          const [frequency, duration] = tones[type] || tones.click, pitch = rand(.92, 1.08);
          oscillator.type = ['hit','boss'].includes(type) ? 'square' : 'triangle';
          oscillator.frequency.setValueAtTime(frequency * pitch, now);
          oscillator.frequency.exponentialRampToValueAtTime(frequency * pitch * (type === 'level' ? 1.8 : .58), now + duration);
          gain.gain.setValueAtTime(type === 'boss' ? .055 : rand(.026,.036), now);
          gain.gain.exponentialRampToValueAtTime(.001, now + duration);
          oscillator.onended = () => { oscillator.disconnect();gain.disconnect(); };
          oscillator.start(now); oscillator.stop(now + duration + .02);
        } catch (error) { failed = true;report(error); }
      }
    };
  }
};
