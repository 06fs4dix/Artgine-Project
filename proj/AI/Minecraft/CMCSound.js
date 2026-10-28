import { GetAudioContext, gCompressor } from "../../../Artgine/artgine/system/audio/CAudio.js";
const PARAM = {
    stone: { freq: 1100, tone: 0.35, noise: 0.9, lowpass: 0.05, decay: 26 },
    dirt: { freq: 120, tone: 0.6, noise: 0.8, lowpass: 0.6, decay: 22 },
    grass: { freq: 260, tone: 0.1, noise: 0.9, lowpass: 0.35, decay: 24 },
    wood: { freq: 240, tone: 0.9, noise: 0.35, lowpass: 0.5, decay: 20 },
    sand: { freq: 160, tone: 0.1, noise: 1.0, lowpass: 0.25, decay: 16 },
    leaves: { freq: 400, tone: 0.0, noise: 0.8, lowpass: 0.2, decay: 28 },
    water: { freq: 300, tone: 0.2, noise: 0.8, lowpass: 0.5, decay: 12 },
};
const DURATION = { break: 0.3, hit: 0.11, place: 0.16, step: 0.1 };
const VOLUME = { break: 0.55, hit: 0.3, place: 0.4, step: 0.2 };
const VARIANT = 3;
export class CMCSound {
    mBuf = new Map();
    mGain = null;
    Unlock() {
        const ctx = GetAudioContext();
        if (ctx.state === "suspended")
            ctx.resume();
    }
    Make(_kind, _type) {
        const ctx = GetAudioContext();
        const p = PARAM[_kind];
        const dur = DURATION[_type];
        const n = Math.floor(ctx.sampleRate * dur);
        const arr = [];
        for (let v = 0; v < VARIANT; ++v) {
            const buf = ctx.createBuffer(1, n, ctx.sampleRate);
            const d = buf.getChannelData(0);
            const freq = p.freq * (0.85 + v * 0.15);
            let low = 0;
            for (let i = 0; i < n; ++i) {
                const t = i / ctx.sampleRate;
                const env = Math.exp(-t * p.decay) * Math.min(1, t * 800);
                const white = Math.random() * 2 - 1;
                low += (white - low) * p.lowpass;
                const noise = p.lowpass >= 0.5 ? low : white - low * (1 - p.lowpass);
                const tone = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * (p.decay * 0.6));
                d[i] = (noise * p.noise + tone * p.tone) * env;
            }
            arr.push(buf);
        }
        return arr;
    }
    Play(_kind, _type, _vol = 1) {
        if (_kind == null)
            return;
        const ctx = GetAudioContext();
        if (ctx.state != "running")
            return;
        const key = _kind + "/" + _type;
        let arr = this.mBuf.get(key);
        if (arr == null) {
            arr = this.Make(_kind, _type);
            this.mBuf.set(key, arr);
        }
        if (this.mGain == null) {
            this.mGain = ctx.createGain();
            this.mGain.connect(gCompressor);
        }
        const src = ctx.createBufferSource();
        src.buffer = arr[Math.floor(Math.random() * arr.length)];
        src.playbackRate.value = 0.92 + Math.random() * 0.16;
        const g = ctx.createGain();
        g.gain.value = VOLUME[_type] * _vol;
        src.connect(g);
        g.connect(this.mGain);
        src.start();
    }
}
