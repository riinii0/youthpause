// Web Audio API ambient sound synthesizer (Rain, Ocean, Campfire, White Noise)
// Self-contained with zero external audio assets required

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isRunning: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type: 'rain' | 'waves' | 'campfire' | 'zen', volume: number = 0.5) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.currentType = type;
    this.isRunning = true;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'rain') {
      this.createRainSound();
    } else if (type === 'waves') {
      this.createWavesSound();
    } else if (type === 'campfire') {
      this.createCampfireSound();
    } else if (type === 'zen') {
      this.createZenDrone();
    }
  }

  setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(vol * 0.4, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    if (this.noiseNode) {
      try {
        if ('stop' in this.noiseNode && typeof (this.noiseNode as any).stop === 'function') {
          (this.noiseNode as any).stop();
        }
        this.noiseNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.noiseNode = null;
    }
    this.currentType = null;
    this.isRunning = false;
  }

  isPlaying() {
    return this.isRunning;
  }

  getCurrentType() {
    return this.currentType;
  }

  private createWhiteNoiseBuffer(seconds = 5): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createPinkNoiseBuffer(seconds = 5): AudioBuffer {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createRainSound() {
    const ctx = this.ctx!;
    const buffer = this.createPinkNoiseBuffer(4);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter for gentle rain sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode!);
    noise.start();
    this.noiseNode = noise;
  }

  private createWavesSound() {
    const ctx = this.ctx!;
    const buffer = this.createPinkNoiseBuffer(6);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    // LFO to modulate wave swell
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // one wave cycle every ~8 seconds

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    noise.connect(filter);
    filter.connect(this.gainNode!);
    noise.start();
    this.noiseNode = noise;
  }

  private createCampfireSound() {
    const ctx = this.ctx!;
    const buffer = this.createPinkNoiseBuffer(5);
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode!);
    noise.start();
    this.noiseNode = noise;
  }

  private createZenDrone() {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(216, ctx.currentTime); // 216 Hz relaxing harmonic

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(432, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.2, ctx.currentTime);

    osc.connect(this.gainNode!);
    osc2.connect(subGain);
    subGain.connect(this.gainNode!);

    osc.start();
    osc2.start();
    this.noiseNode = osc;
  }
}

export const ambientSound = new AmbientSoundEngine();
