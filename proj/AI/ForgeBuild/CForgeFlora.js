import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CPaint2DMerge } from "../../../Artgine/artgine/app/component/paint/CPaint2D.js";
import { CPaint3DMerge } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CForgeFloraBake } from "../../../Artgine/plugin/ForgeFlora/ForgeFlora.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CDensityInfo, CDensityMap, CLOD } from "../../../Artgine/artgine/app/subject/CDensityMap.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CSampler } from "../../../Artgine/artgine/util/CSampler.js";
import { SDF } from "../../../Artgine/artgine/z_file/SDF.js";
import { CForgeRand } from "../../../Artgine/plugin/ForgeBuild/CForgeRand.js";
import { CForgeScene } from "../../../Artgine/plugin/ForgeBuild/CForgeScene.js";
import { CForgeFloraFactory } from "../../../Artgine/plugin/ForgeFlora/ForgeFlora.js";
import { CForgeTerrain } from "./CForgeTerrain.js";
class CForgeFloraSamp extends CSampler {
    mFn;
    constructor(_fn) { super(); this.mFn = _fn; }
    Execute() { return this.mFn(); }
}
class CForgeFloraPlace {
    mSeed;
    mRand;
    mMin;
    mMax;
    mLift;
    mBase;
    mScale = 1;
    mPosV = new CVec3();
    mScaV = new CVec3();
    mRotV = new CVec3();
    mPos;
    mSca;
    mRot;
    constructor(_seed, _min, _max, _lift, _base = 0) {
        this.mSeed = _seed;
        this.mMin = _min;
        this.mMax = _max;
        this.mLift = _lift;
        this.mBase = _base;
        this.Reset();
        this.mPos = new CForgeFloraSamp(() => { this.mScale = this.mMin + (this.mMax - this.mMin) * this.mRand.Next(); this.mPosV.y = this.mBase + this.mScale * this.mLift; return this.mPosV; });
        this.mSca = new CForgeFloraSamp(() => { this.mScaV.x = this.mScaV.y = this.mScaV.z = this.mScale; return this.mScaV; });
        this.mRot = new CForgeFloraSamp(() => { this.mRotV.y = this.mRand.Next() * Math.PI * 2; return this.mRotV; });
    }
    Reset() { this.mRand = new CForgeRand(this.mSeed); }
}
export class CForgeFlora {
    static eGrass = { Short: 0, Tall: 1, Reed: 2, Flower: 3, Clover: 4, Fern: 5, Barley: 6, Rice: 7, Cattail: 8 };
    static eTree = { BroadA: 0, BroadB: 1, Conifer: 2, Bush: 3, RockA: 4, RockB: 5, Bamboo: 6 };
    static sTreeColor = 20;
    static sLilyColor = 40;
    static sCell = 0.5;
    static sBigCell = 1;
    static sDiv = 32;
    static sGrassLOD = [25, 55, 90];
    static sTreeLOD = [22, 65];
    static sRockLOD = 35;
    static sHys = 0.2;
    static sLeafCut = 0.95;
    static sClearMax = 6;
    static sSettle = 600;
    static sLilyDepth = [0.28, 0.38];
    mTerrain;
    mScene;
    mFactory;
    mMap;
    mGrass = [];
    mTree = [];
    mPlace = [];
    mAll;
    mClear;
    mGrassBase;
    mTreeCand = [];
    mLilyCand = [];
    mRebuilt = 0;
    mSeed;
    mHash = -1;
    mBuiltHash = -1;
    mChangeAt = 0;
    mCheckAt = 0;
    mLastMs = 0;
    mGenMs = 0;
    mCount = [0, 0, 0];
    constructor(_canvas, _terrainMap, _terrain, _scene) {
        this.mTerrain = _terrain;
        this.mScene = _scene;
        this.mSeed = _scene.mSeed;
        const t0 = performance.now(), F = new CForgeFloraFactory(_canvas.GetFrame(), true), U = CForgeScene.sUnit;
        this.mFactory = F;
        const G = CForgeFloraFactory.eGrass, T = CForgeFloraFactory.eTree, R = CForgeFloraFactory.eRock;
        const grass = [F.Grass(G.Short, 11), F.Grass(G.Tall, 13), F.Grass(G.Reed, 14), F.Grass(G.Flower, 15),
            F.Grass(G.Clover, 17), F.Grass(G.Fern, 18), F.Grass(G.Barley, 19), F.Grass(G.Rice, 20), F.Grass(G.Cattail, 25)];
        const tree = [F.Tree(T.Broad, 21), F.Tree(T.Broad, 22), F.Tree(T.Conifer, 23), F.Tree(T.Bush, 24), F.Rock(R.Round, 31), F.Rock(R.Sharp, 32), F.Tree(T.Bamboo, 33)];
        const lily = F.Grass(G.Lily, 41);
        this.mGenMs = performance.now() - t0;
        const rock = (_a) => _a.mKind == CForgeFloraFactory.eKind.Rock, E = CForgeFlora.eGrass;
        const gWind = { [E.Reed]: 14, [E.Barley]: 14, [E.Rice]: 14, [E.Cattail]: 14, [E.Clover]: 3, [E.Fern]: 6, [E.Flower]: 8 };
        this.mGrass = grass.map((_a, _i) => ({ asset: _a, wind: gWind[_i] ?? 10, var: 0.18, sink: 0.05 }));
        const tWind = (_a) => rock(_a) ? 0 : _a.mPreset == CForgeFloraFactory.eTree.Bush ? 12 : _a.mPreset == CForgeFloraFactory.eTree.Bamboo ? 22 : 28;
        this.mTree = tree.map((_a) => ({ asset: _a, wind: tWind(_a), var: rock(_a) ? 0.35 : 0.2, sink: rock(_a) ? 0.15 : 0.02 }));
        const lk = { asset: lily, wind: 3, var: 0.25, sink: 0 };
        const n = Math.ceil(CForgeScene.sSize / CForgeFlora.sCell);
        this.mAll = new Uint32Array(n * n);
        this.mMap = _canvas.PushSub(new CDensityMap(true));
        this.mMap.mBuf.Reset(new CVec3(n, n, 1), CForgeFlora.sCell * U, 0);
        this.mMap.mDiv = CForgeFlora.sDiv;
        this.mMap.mLODBuildMs = 0;
        this.mMap.SetTerrain(_terrainMap);
        const Place = (_k, _seed, _base = 0) => {
            const m = _k.asset.MaxSize() * U, p = new CForgeFloraPlace(_seed, m * (1 - _k.var), m * (1 + _k.var), _k.asset.Bottom() - _k.sink, _base);
            this.mPlace.push(p);
            return p;
        };
        this.mGrass.forEach((_k, _c) => this.mMap.PushDensityInfo(this.GrassInfo(_k, _c, Place(_k, CForgeRand.Hash(this.mSeed, _c, 7)), CForgeFlora.sCell)));
        this.mTree.forEach((_k, _c) => {
            const p = Place(_k, CForgeRand.Hash(this.mSeed, _c, 9)), cls = CForgeFlora.sTreeColor + _c;
            this.mMap.PushDensityInfo(rock(_k.asset) ? this.RockInfo(_k, cls, p) : this.TreeInfo(_k, cls, p));
        });
        this.mMap.PushDensityInfo(this.GrassInfo(lk, CForgeFlora.sLilyColor, Place(lk, CForgeRand.Hash(this.mSeed, 51), CForgeFlora.sLilyDepth[1] * U), CForgeFlora.sBigCell));
        this.BuildBase();
        this.Rebuild(this.mScene.Hash());
    }
    static DColor(_cls) { return ((1 << 24) | ((_cls + 1) << 16) | (0x80 << 8)) >>> 0; }
    Info(_cls, _p, _cellM) {
        const c = _cellM * CForgeScene.sUnit, info = new CDensityInfo(CForgeFlora.DColor(_cls), new CVec3(c, c, c));
        info.mPos = _p.mPos;
        info.mSca = _p.mSca;
        info.mRot = _p.mRot;
        info.mBottomPos = false;
        return info;
    }
    mPBR = false;
    mStep0 = new CShaderAttr("ligStep0", SDF.eLightStep0.HafeLambert);
    mStep1 = new CShaderAttr("ligStep1", SDF.eLightStep1.None);
    mLit = -1;
    Light() { return [this.mStep0, this.mStep1]; }
    Tag(_t) { if (this.mPBR)
        _t.push("env"); if (_t.includes(CPaint.eTag.Shadow))
        _t.push("shadowMulti"); return _t; }
    SetReal(_on) {
        if (this.mFactory.mReal == _on)
            return;
        this.mFactory.ApplyReal(_on);
        this.mMap.mUpdate = true;
        this.Relight();
    }
    SetPBR(_on) {
        if (this.mPBR == _on)
            return;
        this.mPBR = _on;
        this.mStep0.mData.x = _on ? SDF.eLightStep0.Lambert : SDF.eLightStep0.HafeLambert;
        this.mStep1.mData.x = _on ? SDF.eLightStep1.CookTorrance : SDF.eLightStep1.None;
        for (const d of this.mMap.mDensityArr)
            for (const lod of d.mLODInfo) {
                if (lod.mRes == null || lod.mRes.endsWith(".mesh") == false)
                    continue;
                const tags = lod.mPaintTag, i = tags.indexOf("env");
                if (_on && i < 0)
                    tags.push("env");
                else if (!_on && i >= 0)
                    tags.splice(i, 1);
            }
        this.Relight();
        this.ApplyLight();
    }
    Relight() { this.mLit = -1; this.mLitDone = new WeakSet(); }
    mLitDone = new WeakSet();
    ApplyLight() {
        const pts = this.mMap.FindComps(CPaint3DMerge);
        if (pts.length == this.mLit)
            return;
        this.mLit = pts.length;
        for (const pt of pts) {
            if (this.mLitDone.has(pt))
                continue;
            this.mLitDone.add(pt);
            pt.PushCShaderAttr(this.mStep0);
            pt.PushCShaderAttr(this.mStep1);
            if (this.mPBR) {
                pt.SetMaterial(-1, -1, 0, -1);
                pt.PushTag("env");
            }
            else {
                pt.SetMaterial(1, 0, 0, 1);
                pt.RemoveTag("env");
            }
        }
    }
    GrassInfo(_k, _cls, _p, _cellM) {
        const info = this.Info(_cls, _p, _cellM), L = CForgeFlora.sGrassLOD, cut = _k.asset.mCut;
        const tags = this.Tag(cut ? [CPaint.eTag.Light, CPaint.eTag.Shadow, "shadowReadOnly", "alphaCut"] : [CPaint.eTag.Light, CPaint.eTag.Shadow, "shadowReadOnly"]);
        const attr = () => cut ? [new CShaderAttr("alphaCut", CForgeFlora.sLeafCut), ...this.Light()] : this.Light();
        info.AddLODLevel([
            this.Level(_k, _k.asset.Mesh(0), 1, 0, 0, tags, attr()),
            this.Level(_k, _k.asset.Mesh(1), 1, L[0], L[0] * CForgeFlora.sHys, tags, attr()),
            this.Level(_k, _k.asset.Mesh(1), 0.35, L[1], L[1] * CForgeFlora.sHys, tags, attr()),
            this.Level(_k, null, 1, L[2], L[2] * CForgeFlora.sHys),
        ]);
        return info;
    }
    TreeInfo(_k, _cls, _p) {
        const info = this.Info(_cls, _p, CForgeFlora.sBigCell), L = CForgeFlora.sTreeLOD, leaf = new CShaderAttr("alphaCut", CForgeFlora.sLeafCut);
        const tags = this.Tag([CPaint.eTag.Light, CPaint.eTag.Shadow, "alphaCut", "leafNoSR"]), bill = new CShaderAttr("billboardMat", this.mBillMat);
        info.AddLODLevel([
            this.Level(_k, _k.asset.Mesh(0), 1, 0, 0, tags, [leaf, ...this.Light()]),
            this.Level(_k, _k.asset.Mesh(1), 1, L[0], L[0] * CForgeFlora.sHys, tags, [leaf, ...this.Light()]),
            this.Level(_k, _k.asset.Billboard(), 1, L[1], L[1] * CForgeFlora.sHys, [CPaint.eTag.Light, "alphaCut"], [leaf, bill, ...this.Light()]),
        ]);
        return info;
    }
    RockInfo(_k, _cls, _p) {
        const info = this.Info(_cls, _p, CForgeFlora.sBigCell), tags = this.Tag([CPaint.eTag.Light, CPaint.eTag.Shadow]);
        info.AddLODLevel([
            this.Level(_k, _k.asset.Mesh(0), 1, 0, 0, tags, this.Light()),
            this.Level(_k, _k.asset.Mesh(1), 1, CForgeFlora.sRockLOD, CForgeFlora.sRockLOD * CForgeFlora.sHys, tags, this.Light()),
        ]);
        return info;
    }
    Level(_k, _res, _amount, _dist, _hys, _tag = [], _attr = []) {
        const U = CForgeScene.sUnit, i = _k.asset.mLod.indexOf(_res);
        return new CLOD(_res, _amount, _dist * U, _hys * U, _tag, _attr, i >= 0 && _k.asset.HasWind(i) ? _k.wind : 0);
    }
    mOn = true;
    SetEnable(_on) {
        this.mOn = _on;
        if (_on) {
            this.mBuiltHash = -1;
            this.mChangeAt = 0;
            return;
        }
        this.mMap.mBuf.GetBuf().fill(0);
        for (const p of this.mPlace)
            p.Reset();
        this.mMap.mUpdate = true;
    }
    IsLoading() { return this.mMap.IsLODPending(); }
    mCam = null;
    mBillMat = new CMat();
    UpdateBillMat() {
        if (this.mCam == null)
            return;
        const s = this.mCam.GetBillBoardMat().mF32A, o = this.mBillMat.mF32A;
        const rl = Math.hypot(s[0], s[2]) || 1, bl = Math.hypot(s[8], s[10]) || 1;
        o.set([s[0] / rl, 0, s[2] / rl, 0, 0, 1, 0, 0, s[8] / bl, 0, s[10] / bl, 0, 0, 0, 0, 1]);
        this.mBillMat.UnitCheck();
    }
    static sBillLeaf = 0.8;
    mSun = null;
    mAmbient = null;
    mBillColor = new CColor(1, 1, 1, CColor.eModel.RGBMul);
    mBillMerge = [];
    mBillCount = -1;
    UpdateBillColor() {
        if (this.mSun == null || this.mAmbient == null)
            return;
        const d = this.mSun.GetDirectPos(), l = Math.hypot(d.x, d.y, d.z) || 1, up = Math.max(0, d.y / l), c = this.mSun.GetColor(), a = this.mAmbient, o = this.mBillColor.mF32A;
        const H = CForgeFlora.sBillLeaf, g = 1 / CForgeFloraBake.sGain, old = [o[0], o[1], o[2]];
        for (const [k, s, m] of [[0, c.x, a.x], [1, c.y, a.y], [2, c.z, a.z]])
            o[k] = Math.min(2, Math.sqrt((s * H + m) / Math.max(s * up, m, 1e-3)) * g);
        const all = this.mMap.FindComps(CPaint2DMerge);
        const added = all.length != this.mBillCount;
        if (added) {
            this.mBillCount = all.length;
            this.mBillMerge = all.filter(_p => _p.GetTexture().some(_t => _t.endsWith("_imp.tex")));
        }
        if (!added && Math.abs(old[0] - o[0]) + Math.abs(old[1] - o[1]) + Math.abs(old[2] - o[2]) < 1e-4)
            return;
        for (const pt of this.mBillMerge)
            pt.SetColorModel(this.mBillColor);
    }
    Update() {
        this.ApplyLight();
        this.UpdateBillMat();
        this.UpdateBillColor();
        if (!this.mOn)
            return;
        const now = performance.now();
        if (now < this.mCheckAt)
            return;
        this.mCheckAt = now + 300;
        const h = this.mScene.Hash();
        if (h != this.mHash) {
            this.mHash = h;
            this.mChangeAt = now;
            return;
        }
        if (h != this.mBuiltHash && now - this.mChangeAt >= CForgeFlora.sSettle)
            this.Rebuild(h);
    }
    Rebuild(_hash) {
        const t0 = performance.now();
        this.mBuiltHash = this.mHash = _hash;
        this.BuildClear();
        this.mCount[0] = this.FillGrass();
        this.mCount[2] = this.FillBig(this.mLilyCand);
        this.mCount[1] = this.FillBig(this.mTreeCand);
        const buf = this.mMap.mBuf.GetBuf(), all = this.mAll;
        let changed = false;
        for (let i = 0; i < all.length; i++)
            if (buf[i] != all[i]) {
                changed = true;
                break;
            }
        this.mRebuilt = 0;
        if (changed) {
            buf.set(all);
            for (const p of this.mPlace)
                p.Reset();
            this.mMap.mUpdate = true;
            this.mRebuilt = 1;
        }
        this.mLastMs = performance.now() - t0;
    }
    BuildClear() {
        const C = CForgeFlora.sCell, n = Math.ceil(CForgeScene.sSize / C), M = CForgeFlora.sClearMax, K = CForgeScene.eKind;
        const clear = new Float32Array(n * n).fill(M);
        const Stamp = (_x0, _z0, _x1, _z1, _d) => {
            const i0 = Math.max(0, Math.floor((_x0 - M) / C)), i1 = Math.min(n - 1, Math.ceil((_x1 + M) / C));
            const j0 = Math.max(0, Math.floor((_z0 - M) / C)), j1 = Math.min(n - 1, Math.ceil((_z1 + M) / C));
            for (let j = j0; j <= j1; j++)
                for (let i = i0; i <= i1; i++) {
                    const o = j * n + i;
                    if (clear[o] <= 0)
                        continue;
                    clear[o] = Math.min(clear[o], Math.max(0, _d((i + 0.5) * C, (j + 0.5) * C)));
                }
        };
        const Lines = (_pts, _half) => {
            if (_pts == null || _pts.length == 0)
                return;
            const xs = _pts.map(_q => _q[0]), zs = _pts.map(_q => _q[1]);
            Stamp(Math.min(...xs) - _half, Math.min(...zs) - _half, Math.max(...xs) + _half, Math.max(...zs) + _half, (_x, _z) => {
                let d = Infinity;
                if (_pts.length == 1)
                    d = Math.hypot(_x - _pts[0][0], _z - _pts[0][1]);
                for (let k = 1; k < _pts.length; k++)
                    d = Math.min(d, CForgeFlora.SegDist(_x, _z, _pts[k - 1], _pts[k]));
                return d - _half;
            });
        };
        for (const w of this.mScene.List(K.Wall))
            Lines(w.pts, (w.thick ?? 1) * 0.5 + 0.4);
        for (const k of [K.Path, K.Bridge, K.Stair])
            for (const p of this.mScene.List(k))
                Lines(p.pts, (p.width ?? 2) * 0.5 + 0.2);
        for (const f of this.mScene.List(K.Fence))
            Lines(f.pts, 0.25);
        for (const t of this.mScene.List(K.Tower))
            Lines([t.c], t.r + 0.6);
        for (const m of this.mScene.List(K.Monument))
            Lines([m.c], (m.size ?? 2) * 0.9 + 0.6);
        for (const b of [...this.mScene.List(K.Building), ...this.mScene.List(K.Church)]) {
            const poly = b.poly;
            if (poly == null || poly.length < 3)
                continue;
            const xs = poly.map(_q => _q[0]), zs = poly.map(_q => _q[1]);
            Stamp(Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs), (_x, _z) => {
                if (CForgeFlora.InPoly(_x, _z, poly))
                    return 0;
                let d = Infinity;
                for (let k = 0; k < poly.length; k++)
                    d = Math.min(d, CForgeFlora.SegDist(_x, _z, poly[k], poly[(k + 1) % poly.length]));
                return d - 0.8;
            });
        }
        this.mClear = clear;
    }
    Clear(_x, _z) {
        const C = CForgeFlora.sCell, n = Math.ceil(CForgeScene.sSize / C);
        const i = Math.min(n - 1, Math.max(0, Math.floor(_x / C))), j = Math.min(n - 1, Math.max(0, Math.floor(_z / C)));
        return this.mClear[j * n + i];
    }
    static SegDist(_x, _z, _a, _b) {
        const dx = _b[0] - _a[0], dz = _b[1] - _a[1], l2 = dx * dx + dz * dz || 1;
        const t = Math.max(0, Math.min(1, ((_x - _a[0]) * dx + (_z - _a[1]) * dz) / l2));
        return Math.hypot(_x - _a[0] - dx * t, _z - _a[1] - dz * t);
    }
    static InPoly(_x, _z, _p) {
        let in_ = false;
        for (let i = 0, j = _p.length - 1; i < _p.length; j = i++)
            if ((_p[i][1] > _z) != (_p[j][1] > _z) && _x < (_p[j][0] - _p[i][0]) * (_z - _p[i][1]) / (_p[j][1] - _p[i][1]) + _p[i][0])
                in_ = !in_;
        return in_;
    }
    Field(_x, _z) {
        return this.Forest(_x, _z) < 0.15 && CForgeRand.Fbm(_x / 30, _z / 30, 2, this.mSeed + 40) > 0.66 ? 1 : 0;
    }
    Grove(_x, _z) { return CForgeRand.Fbm(_x / 22, _z / 22, 2, this.mSeed + 60) > 0.7 && this.Field(_x, _z) == 0; }
    Forest(_x, _z) {
        const half = CForgeScene.sSize * 0.5, edge = CForgeTerrain.Smooth(0.68, 0.95, Math.hypot(_x - half, _z - half) / half);
        return Math.min(1, Math.max(0, (CForgeRand.Fbm(_x / 26, _z / 26, 3, this.mSeed + 11) - 0.52) * 3.2) + edge * 0.7);
    }
    BuildBase() {
        const C = CForgeFlora.sCell, n = Math.ceil(CForgeScene.sSize / C), E = CForgeFlora.eGrass, W = CForgeTerrain.sWaterY;
        this.mGrassBase = new Int8Array(n * n).fill(-1);
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
                const x = (i + 0.5) * C, z = (j + 0.5) * C, h = this.mTerrain.HeightM(x, z);
                if (h < W + 0.08)
                    continue;
                const r = CForgeRand.HashF(i, j, this.mSeed + 101), r2 = CForgeRand.HashF(i, j, this.mSeed + 102);
                const river = Math.abs(x - this.mTerrain.RiverX(z)), bank = h < W + 0.6 && river < CForgeTerrain.sBankHalf + 2;
                const forest = this.Forest(x, z), field = this.Field(x, z);
                let cls = -1;
                if (bank)
                    cls = r < 0.3 ? E.Reed : r < 0.5 ? E.Cattail : r < 0.85 ? E.Tall : -1;
                else if (forest < 0.15 && river < CForgeTerrain.sBankHalf + 16 && CForgeRand.Fbm(x / 18, z / 18, 2, this.mSeed + 45) > 0.55) {
                    if (r < 0.6)
                        cls = E.Rice;
                }
                else if (field > 0) {
                    if (r < 0.6)
                        cls = E.Barley;
                }
                else if (forest > 0.45 && r < 0.05)
                    cls = E.Fern;
                else if (r < 0.62 - forest * 0.3) {
                    if (CForgeRand.Fbm(x / 12, z / 12, 2, this.mSeed + 44) > 0.66 && r2 < 0.55)
                        cls = E.Flower;
                    else if (r2 > 0.93)
                        cls = E.Clover;
                    else
                        cls = CForgeRand.Fbm(x / 9, z / 9, 2, this.mSeed + 3) > 0.6 ? E.Tall : E.Short;
                }
                this.mGrassBase[j * n + i] = cls;
            }
        this.mTreeCand = this.TreeCand();
        this.mLilyCand = this.LilyCand();
    }
    FillGrass() {
        const n = Math.ceil(CForgeScene.sSize / CForgeFlora.sCell), buf = this.mAll, base = this.mGrassBase, clear = this.mClear;
        let cnt = 0;
        for (let o = 0; o < n * n; o++) {
            const cls = base[o];
            if (cls < 0 || clear[o] < 0.3) {
                buf[o] = 0;
                continue;
            }
            buf[o] = CForgeFlora.DColor(cls);
            cnt++;
        }
        return cnt;
    }
    FillBig(_cand) {
        const n = Math.ceil(CForgeScene.sSize / CForgeFlora.sCell), k = Math.round(CForgeFlora.sBigCell / CForgeFlora.sCell), h = k >> 1, buf = this.mAll, taken = new Set();
        let cnt = 0;
        for (const c of _cand) {
            const big = c.j * n + c.i;
            if (taken.has(big) || this.Clear(c.x, c.z) < c.need)
                continue;
            taken.add(big);
            buf[(c.j * k + h) * n + c.i * k + h] = CForgeFlora.DColor(c.cls);
            cnt++;
        }
        return cnt;
    }
    static Cand(_i, _j, _cls, _need) {
        const C = CForgeFlora.sBigCell;
        return { i: _i, j: _j, x: (_i + 0.5) * C, z: (_j + 0.5) * C, cls: _cls, need: _need };
    }
    LilyCand() {
        const C = CForgeFlora.sBigCell, n = Math.ceil(CForgeScene.sSize / C), W = CForgeTerrain.sWaterY, D = CForgeFlora.sLilyDepth, out = [];
        for (let j = 0; j < n; j++)
            for (let i = 0; i < n; i++) {
                const d = W - this.mTerrain.HeightM((i + 0.5) * C, (j + 0.5) * C);
                if (d < D[0] || d > D[1] || CForgeRand.HashF(i, j, this.mSeed + 501) > 0.35)
                    continue;
                out.push(CForgeFlora.Cand(i, j, CForgeFlora.sLilyColor, 0));
            }
        return out;
    }
    TreeCand() {
        const C = CForgeFlora.sBigCell, n = Math.ceil(CForgeScene.sSize / C), E = CForgeFlora.eTree, T = CForgeFlora.sTreeColor, W = CForgeTerrain.sWaterY, S = this.mSeed, out = [];
        const Put = (_i, _j, _cls, _need) => out.push(CForgeFlora.Cand(_i, _j, T + _cls, _need));
        const BB = 3;
        for (let J = 0; J * BB < n; J++)
            for (let I = 0; I * BB < n; I++) {
                const i = Math.min(n - 1, I * BB + CForgeRand.Hash(I, J, S + 211) % BB), j = Math.min(n - 1, J * BB + CForgeRand.Hash(I, J, S + 212) % BB);
                const x = (i + 0.5) * C, z = (j + 0.5) * C;
                if (!this.Grove(x, z) || CForgeRand.HashF(I, J, S + 213) > 0.75 || this.mTerrain.HeightM(x, z) < W + 0.4)
                    continue;
                Put(i, j, E.Bamboo, 2);
            }
        const B = 5;
        for (let J = 0; J * B < n; J++)
            for (let I = 0; I * B < n; I++) {
                const i = Math.min(n - 1, I * B + CForgeRand.Hash(I, J, S + 201) % B), j = Math.min(n - 1, J * B + CForgeRand.Hash(I, J, S + 202) % B);
                const x = (i + 0.5) * C, z = (j + 0.5) * C, f = this.Forest(x, z);
                if (this.Field(x, z) > 0 || this.Grove(x, z))
                    continue;
                if (CForgeRand.HashF(I, J, S + 203) >= 0.05 + f * 0.85)
                    continue;
                if (this.mTerrain.HeightM(x, z) < W + 0.4)
                    continue;
                const r = CForgeRand.HashF(I, J, S + 204), bush = r < 0.2;
                const half = CForgeScene.sSize * 0.5, edge = Math.hypot(x - half, z - half) / half;
                Put(i, j, bush ? E.Bush : (r < 0.2 + 0.5 * Math.min(1, edge) ? E.Conifer : (r < 0.8 ? E.BroadA : E.BroadB)), bush ? 1.5 : 3.5);
            }
        const R = 4;
        for (let J = 0; J * R < n; J++)
            for (let I = 0; I * R < n; I++) {
                if (CForgeRand.HashF(I, J, S + 301) >= 0.07)
                    continue;
                const i = Math.min(n - 1, I * R + CForgeRand.Hash(I, J, S + 302) % R), j = Math.min(n - 1, J * R + CForgeRand.Hash(I, J, S + 303) % R);
                const x = (i + 0.5) * C, z = (j + 0.5) * C;
                if (this.mTerrain.HeightM(x, z) < W + 0.05)
                    continue;
                Put(i, j, CForgeRand.HashF(I, J, S + 304) < 0.6 ? E.RockA : E.RockB, 1.2);
            }
        return out;
    }
}
