import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { SDF } from "../../../Artgine/artgine/z_file/SDF.js";
import { CForgeFactory, CForgeOption, CForgeScene } from "../../../Artgine/plugin/ForgeBuild/ForgeBuild.js";
export class CForgeSync {
    static sType = { wall: CForgeFactory.eType.Wall, building: CForgeFactory.eType.House, tower: CForgeFactory.eType.Tower, path: CForgeFactory.eType.Path, fence: CForgeFactory.eType.Fence,
        bridge: CForgeFactory.eType.Bridge, stair: CForgeFactory.eType.Stair, church: CForgeFactory.eType.Church, dock: CForgeFactory.eType.Dock, monument: CForgeFactory.eType.Monument };
    static sOrder = [CForgeScene.eKind.Wall, CForgeScene.eKind.Tower, CForgeScene.eKind.Building, CForgeScene.eKind.Path, CForgeScene.eKind.Fence, CForgeScene.eKind.Bridge, CForgeScene.eKind.Stair, CForgeScene.eKind.Church, CForgeScene.eKind.Dock, CForgeScene.eKind.Monument];
    mScene;
    mTerrain;
    mFactory;
    mSub = new Map();
    mTheme = "europe_medieval_northwest";
    mForce = true;
    mLastMs = 0;
    mLastCount = 0;
    constructor(_scene, _terrain, _canvas) {
        this.mScene = _scene;
        this.mTerrain = _terrain;
        this.mFactory = new CForgeFactory(_canvas);
        const U = CForgeScene.sUnit;
        this.mFactory.mGround = (_x, _z) => _terrain.WorldY(_x / U, _z / U);
    }
    mSurf = { mNormal: true, mMaterial: true, mParallax: true };
    mPBR = false;
    mReal = false;
    mLambert = new WeakMap();
    SetTheme(_name) { this.mTheme = _name; this.mForce = true; }
    SetSurf(_key, _on) { this.mSurf[_key] = _on; this.mForce = true; }
    SetPBR(_on) {
        if (this.mPBR == _on)
            return;
        this.mPBR = _on;
        this.mForce = true;
    }
    SetReal(_on) {
        if (this.mReal == _on)
            return;
        this.mReal = _on;
        this.mForce = true;
    }
    Update() {
        const dirty = this.mScene.PopDirty();
        if (dirty.length == 0 && !this.mForce)
            return false;
        this.mForce = false;
        const t0 = performance.now(), keys = [];
        for (const k of CForgeSync.sOrder)
            for (const e of this.mScene.List(k)) {
                const [bottom, top, opt] = this.Args(k, e);
                this.mFactory.Push(CForgeSync.sType[k], bottom, top, opt);
                keys.push(k + ":" + e.id);
            }
        const subs = this.mFactory.Build();
        this.mSub.clear();
        keys.forEach((_k, _i) => { if (subs[_i] != null)
            this.mSub.set(_k, subs[_i]); });
        for (const sub of subs)
            this.ApplyEnv(sub);
        this.mLastCount = this.mFactory.mLastCount;
        this.mLastMs = performance.now() - t0;
        return true;
    }
    ApplyEnv(_sub) {
        if (_sub == null)
            return;
        for (const pt of _sub.FindComps(CPaint3D)) {
            if (this.mLambert.has(pt) == false) {
                const step = pt.FindCShaderAttr("ligStep0");
                this.mLambert.set(pt, step != null && step.mData.x == SDF.eLightStep0.Lambert);
            }
            if (this.mPBR) {
                pt.Env();
                pt.PushCShaderAttr(new CShaderAttr("ligStep0", SDF.eLightStep0.Lambert));
                pt.PushCShaderAttr(new CShaderAttr("ligStep1", SDF.eLightStep1.CookTorrance));
                if (pt.mMaterial.x > -0.5)
                    pt.SetMaterial(0.85, 0, 1, 1);
            }
            else {
                pt.RemoveTag("env");
                pt.PushCShaderAttr(new CShaderAttr("ligStep0", this.mLambert.get(pt) ? SDF.eLightStep0.Lambert : SDF.eLightStep0.HafeLambert));
                pt.PushCShaderAttr(new CShaderAttr("ligStep1", SDF.eLightStep1.Phong));
                if (pt.mMaterial.x > -0.5)
                    pt.SetMaterial(-1, -1, 1, 1);
            }
        }
    }
    Resolved(_kind, _id) {
        const sub = this.mSub.get(_kind + ":" + _id);
        return sub == null ? null : this.mFactory.GetResolved(sub);
    }
    Args(_kind, _e) {
        const U = CForgeScene.sUnit, K = CForgeScene.eKind, G = (_x, _z) => this.mTerrain.HeightM(_x, _z);
        const V = (_x, _z, _y) => new CVec3(_x * U, _y * U, _z * U);
        const opt = new CForgeOption({ mTheme: this.mTheme, mSeed: _e.seed, mOverride: _e.over ?? null, mPBR: this.mPBR, mReal: this.mReal, ...this.mSurf });
        if (_kind == K.Wall) {
            opt.mSize = _e.thick;
            return [_e.pts.map((q) => V(q[0], q[1], G(q[0], q[1]))), _e.pts.map((q) => V(q[0], q[1], G(q[0], q[1]) + q[2])), opt];
        }
        if (_kind == K.Building) {
            const bottom = _e.poly.map((q) => V(q[0], q[1], G(q[0], q[1])));
            return [bottom, bottom.map((v) => new CVec3(v.x, v.y + _e.height * U, v.z)), opt];
        }
        if (_kind == K.Tower) {
            const g = G(_e.c[0], _e.c[1]);
            opt.mSize = _e.r;
            opt.mStyle = _e.shape == 1 ? (_e.roof == CForgeScene.eRoof.Flat ? 4 : 3) : _e.roof == CForgeScene.eRoof.Cone ? 1 : _e.roof == CForgeScene.eRoof.Flat ? 2 : 0;
            return [[V(_e.c[0], _e.c[1], g)], [V(_e.c[0], _e.c[1], g + _e.height)], opt];
        }
        if (_kind == K.Church) {
            opt.mStyle = _e.style ?? 0;
            return [_e.poly.map((q) => V(q[0], q[1], G(q[0], q[1]))), null, opt];
        }
        if (_kind == K.Monument) {
            opt.mSize = _e.size;
            opt.mStyle = _e.style ?? 0;
            return [[V(_e.c[0], _e.c[1], G(_e.c[0], _e.c[1]))], null, opt];
        }
        if (_kind == K.Path || _kind == K.Bridge || _kind == K.Stair || _kind == K.Dock) {
            opt.mSize = _e.width;
            opt.mStyle = _e.style ?? 0;
        }
        if (_kind == K.Dock && _e.deck != null)
            return [_e.pts.map((q) => V(q[0], q[1], G(q[0], q[1]))), [V(_e.pts[0][0], _e.pts[0][1], _e.deck)], opt];
        const bottom = _e.pts.map((q) => V(q[0], q[1], G(q[0], q[1])));
        if (_kind == K.Stair)
            return [bottom, bottom.map((v, i) => new CVec3(v.x, v.y + (i == bottom.length - 1 ? (_e.top ?? 0) * U : 0), v.z)), opt];
        return [bottom, null, opt];
    }
}
