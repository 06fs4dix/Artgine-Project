import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { CTexture } from "../../../Artgine/artgine/render/CTexture.js";
import { CForgeRand } from "../../../Artgine/plugin/ForgeBuild/CForgeRand.js";
import { CForgeScene } from "../../../Artgine/plugin/ForgeBuild/CForgeScene.js";
export class CForgeTerrain {
    static sN = 256;
    static sCellM = CForgeScene.sSize / 256;
    static sHMin = -4;
    static sHRange = 24;
    static sGrass = new CVec4(0.45, 0.66, 0.27, 1);
    static sGrassDeep = new CVec4(0.33, 0.55, 0.22, 1);
    static sGrassKey = "forge_ground_grass.tex";
    static sDirtKey = "forge_ground_dirt.tex";
    static sGrassNor = "forge_ground_grass_n.tex";
    static sDirtNor = "forge_ground_dirt_n.tex";
    static sGrassMat = "forge_ground_grass_m.tex";
    static sDirtMat = "forge_ground_dirt_m.tex";
    static sRealGround = false;
    static sWaterY = 0.7;
    static sBedY = -0.6;
    static sRiverHalf = 3;
    static sBankHalf = 8.5;
    mHeight = new Float32Array(CForgeTerrain.sN * CForgeTerrain.sN);
    mDeep = new Float32Array(CForgeTerrain.sN * CForgeTerrain.sN);
    mSeed = 1;
    RiverX(_z) {
        return 104 + Math.sin(_z / 15 + this.mSeed % 7) * 4 + Math.sin(_z / 6.3 + this.mSeed % 3) * 1.2;
    }
    Build(_seed) {
        this.mSeed = _seed;
        const N = CForgeTerrain.sN, cell = CForgeTerrain.sCellM, half = CForgeScene.sSize * 0.5;
        for (let j = 0; j < N; j++)
            for (let i = 0; i < N; i++) {
                const x = (i + 0.5) * cell, z = (j + 0.5) * cell, o = j * N + i;
                const hill = (CForgeRand.Fbm(x / 40, z / 40, 3, _seed) - 0.5) * 3.2;
                const r = Math.hypot(x - half, z - half) / half;
                const k = 1 - CForgeTerrain.Smooth(CForgeTerrain.sRiverHalf, CForgeTerrain.sBankHalf, Math.abs(x - this.RiverX(z)));
                this.mHeight[o] = CForgeTerrain.Clamp((2.6 + hill + CForgeTerrain.Smooth(0.72, 1.05, r) * 4.5) * (1 - k) + CForgeTerrain.sBedY * k);
                this.mDeep[o] = Math.min(1, Math.max(0, (CForgeRand.Fbm(x / 9, z / 9, 3, _seed + 7) - 0.42) * 2.6));
            }
    }
    static Clamp(_h) { return Math.min(CForgeTerrain.sHMin + CForgeTerrain.sHRange - 0.01, Math.max(CForgeTerrain.sHMin + 0.01, _h)); }
    static Smooth(_a, _b, _x) {
        const t = Math.min(1, Math.max(0, (_x - _a) / (_b - _a)));
        return t * t * (3 - 2 * t);
    }
    HeightM(_xm, _zm) {
        const N = CForgeTerrain.sN, cell = CForgeTerrain.sCellM;
        const fx = Math.min(N - 1.001, Math.max(0, _xm / cell - 0.5)), fz = Math.min(N - 1.001, Math.max(0, _zm / cell - 0.5));
        const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
        const h = this.mHeight, o = j * N + i;
        return (h[o] * (1 - u) + h[o + 1] * u) * (1 - v) + (h[o + N] * (1 - u) + h[o + N + 1] * u) * v;
    }
    WorldY(_xm, _zm) { return this.HeightM(_xm, _zm) * CForgeScene.sUnit; }
    RayHit(_o, _d, _max = 600) {
        const Above = (t) => _o[1] + _d[1] * t - this.HeightM(_o[0] + _d[0] * t, _o[2] + _d[2] * t);
        if (Above(0) < 0)
            return null;
        let prev = 0;
        for (let t = 0.3; t < _max; t += 0.3) {
            if (Above(t) < 0) {
                let a = prev, b = t;
                for (let k = 0; k < 14; k++) {
                    const m = (a + b) * 0.5;
                    if (Above(m) < 0)
                        b = m;
                    else
                        a = m;
                }
                const x = _o[0] + _d[0] * b, z = _o[2] + _d[2] * b;
                return [x, this.HeightM(x, z), z];
            }
            prev = t;
        }
        return null;
    }
    Write(_terrain) {
        const N = CForgeTerrain.sN, cell = CForgeTerrain.sCellM, U = CForgeScene.sUnit;
        _terrain.SetPos(new CVec3(0, CForgeTerrain.sHMin * U, 0));
        _terrain.mHeightBuf.Reset(new CVec3(N, N, 1), cell * U);
        _terrain.mSplatBuf.Reset(new CVec3(N, N, 1), cell * U);
        _terrain.mTerrainHeight = CForgeTerrain.sHRange * U;
        _terrain.mDefaultHeight = CForgeTerrain.sHRange * U * 4;
        const hb = _terrain.mHeightBuf.GetBuf(), sb = _terrain.mSplatBuf.GetBuf();
        for (let o = 0; o < N * N; o++) {
            const t = Math.min(1, Math.max(0, (this.mHeight[o] - CForgeTerrain.sHMin) / CForgeTerrain.sHRange));
            hb[o] = ((Math.round(t * 65535) << 16) | 0xFF) >>> 0;
            sb[o] = ((Math.round(this.mDeep[o] * 255) << 24) | 0xFF) >>> 0;
        }
        this.ApplyLook(_terrain, CForgeTerrain.sRealGround);
    }
    static Tile(_x, _y, _p, _seed) {
        const xi = Math.floor(_x), yi = Math.floor(_y), xf = _x - xi, yf = _y - yi;
        const H = (_i, _j) => CForgeRand.HashF(((_i % _p) + _p) % _p, ((_j % _p) + _p) % _p, _seed);
        const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
        const a = H(xi, yi), b = H(xi + 1, yi), c = H(xi, yi + 1), d = H(xi + 1, yi + 1);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    static BakeGround(_dirt) {
        const N = 1024, alb = new Uint8Array(N * N * 4), hgt = new Float32Array(N * N), mat = new Uint8Array(N * N * 4);
        const C = (_v) => Math.max(0, Math.min(255, Math.round(_v * 255)));
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++) {
                const u = x / N, v = y / N, o = y * N + x, i = o * 4;
                const a = CForgeTerrain.Tile(u * 5, v * 5, 5, 21), b = CForgeTerrain.Tile(u * 8, v * 8, 8, 44), c = CForgeTerrain.Tile(u * 3, v * 3, 3, 67);
                let r, g, bl, hv, rg, ao;
                if (_dirt) {
                    const peb = Math.max(0, b - 0.72) / 0.28, moss = Math.max(0, c - 0.62);
                    r = 0.40 + (a - 0.5) * 0.12 + (c - 0.5) * 0.08;
                    g = 0.28 + (a - 0.5) * 0.08 + (c - 0.5) * 0.05;
                    bl = 0.14 + (a - 0.5) * 0.04;
                    r = r * (1 - peb) + 0.52 * peb;
                    g = g * (1 - peb) + 0.48 * peb;
                    bl = bl * (1 - peb) + 0.40 * peb;
                    r = r * (1 - moss * 0.35) + 0.28 * moss * 0.35;
                    g = g * (1 - moss * 0.2) + 0.36 * moss * 0.2;
                    hv = 0.42 + peb * 0.45 + (a - 0.5) * 0.08;
                    rg = Math.min(1, 0.9 + (1 - peb) * 0.08);
                    ao = 0.78 + peb * 0.22;
                }
                else {
                    const dry = Math.max(0, a - 0.55) / 0.45, soil = Math.max(0, 0.38 - b) / 0.38;
                    r = 0.28 + (c - 0.5) * 0.08;
                    g = 0.42 + (c - 0.5) * 0.1 + (b - 0.5) * 0.06;
                    bl = 0.14 + (c - 0.5) * 0.04;
                    r = r * (1 - dry * 0.45) + 0.48 * dry * 0.45;
                    g = g * (1 - dry * 0.25) + 0.44 * dry * 0.25;
                    bl = bl * (1 - dry * 0.35) + 0.18 * dry * 0.35;
                    r = r * (1 - soil * 0.55) + 0.36 * soil * 0.55;
                    g = g * (1 - soil * 0.55) + 0.26 * soil * 0.55;
                    bl = bl * (1 - soil * 0.4) + 0.14 * soil * 0.4;
                    hv = 0.5 + (b - 0.5) * 0.22 - soil * 0.16;
                    rg = Math.min(1, 0.9 + dry * 0.04 + soil * 0.06);
                    ao = 1 - soil * 0.18;
                }
                alb[i] = C(r);
                alb[i + 1] = C(g);
                alb[i + 2] = C(bl);
                alb[i + 3] = 255;
                hgt[o] = hv;
                mat[i] = C(ao);
                mat[i + 1] = C(rg);
                mat[i + 2] = 0;
                mat[i + 3] = 255;
            }
        return { alb, nor: CForgeTerrain.Normal(hgt, N, _dirt ? 5 : 3), mat };
    }
    static Normal(_h, N, _depth) {
        const H = (_x, _y) => _h[((_y + N) % N) * N + ((_x + N) % N)], out = new Uint8Array(N * N * 4);
        for (let y = 0; y < N; y++)
            for (let x = 0; x < N; x++) {
                const dx = (H(x + 1, y - 1) + 2 * H(x + 1, y) + H(x + 1, y + 1) - H(x - 1, y - 1) - 2 * H(x - 1, y) - H(x - 1, y + 1)) * 0.125 * _depth;
                const dy = (H(x - 1, y + 1) + 2 * H(x, y + 1) + H(x + 1, y + 1) - H(x - 1, y - 1) - 2 * H(x, y - 1) - H(x + 1, y - 1)) * 0.125 * _depth;
                const l = 1 / Math.sqrt(dx * dx + dy * dy + 1), i = (y * N + x) * 4;
                out[i] = (-dx * l * 0.5 + 0.5) * 255;
                out[i + 1] = (dy * l * 0.5 + 0.5) * 255;
                out[i + 2] = (l * 0.5 + 0.5) * 255;
                out[i + 3] = 255;
            }
        return out;
    }
    static EnsureGround(_frame) {
        if (_frame.Res().Find(CForgeTerrain.sGrassKey) != null)
            return;
        const Put = (_key, _buf) => {
            const tex = new CTexture();
            tex.SetSize(1024, 1024);
            tex.CreateBuf();
            tex.GetBuf()[0].set(_buf);
            tex.SetYFlip(false);
            tex.Set("mFilter", CTexture.eFilter.Linear);
            tex.Set("mMipMap", CTexture.eMipmap.GL);
            tex.Set("mWrap", CTexture.eWrap.Repeat);
            _frame.Res().Push(_key, tex);
        };
        const grass = CForgeTerrain.BakeGround(false), dirt = CForgeTerrain.BakeGround(true);
        Put(CForgeTerrain.sGrassKey, grass.alb);
        Put(CForgeTerrain.sGrassNor, grass.nor);
        Put(CForgeTerrain.sGrassMat, grass.mat);
        Put(CForgeTerrain.sDirtKey, dirt.alb);
        Put(CForgeTerrain.sDirtNor, dirt.nor);
        Put(CForgeTerrain.sDirtMat, dirt.mat);
    }
    ApplyLook(_terrain, _real) {
        CForgeTerrain.sRealGround = _real;
        if (_real)
            CForgeTerrain.EnsureGround(_terrain.GetFrame());
        const rep = _real ? 64 : CForgeScene.sSize / 4;
        const grass = _real ? CForgeTerrain.sGrassKey : CForgeTerrain.sGrass;
        const dirt = _real ? CForgeTerrain.sDirtKey : CForgeTerrain.sGrassDeep;
        const orm = new CVec4(1, 0.9, 0, 1);
        _terrain.SetSplat([
            grass, dirt, grass, grass,
            _real ? CForgeTerrain.sGrassMat : orm, _real ? CForgeTerrain.sDirtMat : orm, _real ? CForgeTerrain.sGrassMat : orm, _real ? CForgeTerrain.sGrassMat : orm,
            _real ? CForgeTerrain.sGrassNor : null, _real ? CForgeTerrain.sDirtNor : null, _real ? CForgeTerrain.sGrassNor : null, _real ? CForgeTerrain.sGrassNor : null,
        ], new CMat([
            rep, rep, 0, 0,
            rep, rep, _real ? 0.37 : 0, _real ? 0.21 : 0,
            rep, rep, 0, 0,
            rep, rep, 0, 0,
        ]));
        _terrain.ClearAll();
    }
}
