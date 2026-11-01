/* Original farm scores. Independent gains preserve nature and effect controls. */
function createFarmScorePlayer(loadBuffer) {
  const buffers = new Map(), pending = new Map(), voices = new Set();
  let desired = '', current = null, generation = 0;
  function retire(voice, context) {
    if (!voice || voice.retiring) return;
    voice.retiring = true;
    const now = context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0, now, .5);
    voice.source.stop(now + 3);
    if (current === voice) current = null;
  }
  async function sync({context, mode, active, volume}) {
    const wanted = active && context && volume > 0 ? mode : '';
    if (desired !== wanted) { desired = wanted; generation++; }
    const request = generation;
    if (!wanted) {
      if (context) for (const voice of voices) retire(voice, context);
      return;
    }
    for (const voice of voices) {
      if (!voice.retiring) voice.gain.gain.setTargetAtTime(volume * .55, context.currentTime, .5);
    }
    if (current?.mode === wanted) return;
    let buffer = buffers.get(wanted);
    if (!buffer) {
      if (!pending.has(wanted)) pending.set(wanted, Promise.resolve().then(() => loadBuffer(context, wanted)));
      const promise = pending.get(wanted);
      try { buffer = await promise; buffers.set(wanted, buffer); }
      catch (_) { return; }
      finally { if (pending.get(wanted) === promise) pending.delete(wanted); }
    }
    // A menu, hidden tab, or newer weather request must not resurrect a late download.
    if (request !== generation || desired !== wanted || current?.mode === wanted) return;
    for (const voice of voices) retire(voice, context);
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.setTargetAtTime(volume * .55, context.currentTime, 1);
    source.connect(gain).connect(context.destination);
    const voice = {source, gain, mode: wanted, retiring: false};
    source.onended = () => { voices.delete(voice); source.disconnect(); gain.disconnect(); };
    voices.add(voice);
    current = voice;
    source.start();
  }
  return {sync, get mode() { return current?.mode || ''; }};
}
if (typeof module !== 'undefined') module.exports = {createFarmScorePlayer};
