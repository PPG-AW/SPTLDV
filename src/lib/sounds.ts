// Sound System untuk LINIERKu
// Menggunakan Web Audio API - tidak perlu file eksternal

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume jika di-suspend (kebijakan browser)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Inisialisasi audio context saat user pertama kali berinteraksi
export function initAudio() {
  const init = () => {
    getAudioContext();
    document.removeEventListener('click', init);
    document.removeEventListener('touchstart', init);
  };
  document.addEventListener('click', init);
  document.addEventListener('touchstart', init);
}

// Helper: play a single tone
function playTone(
  frequency: number,
  duration: number,
  startTime: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15
) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
}

// ✅ Jawaban BENAR - chord major ascending (C-E-G) ceria
export function playSuccess() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    playTone(523.25, 0.3, now, 'sine', 0.12);         // C5
    playTone(659.25, 0.3, now + 0.1, 'sine', 0.12);   // E5
    playTone(783.99, 0.4, now + 0.2, 'sine', 0.15);   // G5
    playTone(1046.50, 0.5, now + 0.3, 'triangle', 0.10); // C6 (sparkle)
  } catch (e) {
    console.log('Audio not supported');
  }
}

// ❌ Jawaban SALAH - dua nada descending lembut
export function playError() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    playTone(440, 0.25, now, 'sine', 0.10);       // A4
    playTone(349.23, 0.35, now + 0.15, 'sine', 0.08); // F4
  } catch (e) {
    console.log('Audio not supported');
  }
}

// 🎉 LULUS SUBBAB (3 benar) - fanfare kemenangan
export function playLevelUp() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Fanfare: C-E-G-C dengan timing kemenangan
    const notes = [
      { freq: 523.25, time: 0, dur: 0.2 },      // C5
      { freq: 659.25, time: 0.15, dur: 0.2 },   // E5
      { freq: 783.99, time: 0.3, dur: 0.2 },    // G5
      { freq: 1046.50, time: 0.45, dur: 0.5 },  // C6 (sustain)
      { freq: 1318.51, time: 0.6, dur: 0.4 },   // E6 (sparkle)
    ];
    
    notes.forEach(n => {
      playTone(n.freq, n.dur, now + n.time, 'sine', 0.15);
      playTone(n.freq * 2, n.dur * 0.5, now + n.time, 'triangle', 0.05); // Harmonic
    });
  } catch (e) {
    console.log('Audio not supported');
  }
}

// 💡 HINT - gentle chime
export function playHint() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    playTone(880, 0.2, now, 'sine', 0.08);       // A5
    playTone(1108.73, 0.3, now + 0.1, 'triangle', 0.06); // C#6
  } catch (e) {
    console.log('Audio not supported');
  }
}

// 🖱️ Click sound - subtle
export function playClick() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    playTone(800, 0.05, now, 'square', 0.03);
  } catch (e) {
    console.log('Audio not supported');
  }
}

// 🎵 Achievement / Star collected
export function playAchievement() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    playTone(783.99, 0.2, now, 'sine', 0.12);         // G5
    playTone(987.77, 0.2, now + 0.1, 'sine', 0.12);   // B5
    playTone(1174.66, 0.3, now + 0.2, 'sine', 0.14);  // D6
    playTone(1567.98, 0.4, now + 0.3, 'triangle', 0.08); // G6
  } catch (e) {
    console.log('Audio not supported');
  }
}

// 🔔 Notification bell
export function playNotification() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    playTone(1046.50, 0.15, now, 'sine', 0.12);       // C6
    playTone(1318.51, 0.25, now + 0.08, 'sine', 0.10); // E6
    playTone(1046.50, 0.15, now + 0.2, 'sine', 0.08); // C6 (echo)
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Tab switch sound
export function playTabSwitch() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    playTone(600, 0.08, now, 'sine', 0.05);
  } catch (e) {
    console.log('Audio not supported');
  }
}
