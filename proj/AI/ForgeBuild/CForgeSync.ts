import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CCanvas } from "../../../Artgine/artgine/app/canvas/CCanvas.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { SDF } from "../../../Artgine/artgine/z_file/SDF.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CForgeFactory, CForgeOption, CForgeScene } from "../../../Artgine/plugin/ForgeBuild/ForgeBuild.js";
import { CForgeTerrain } from "./CForgeTerrain.js";

//데모 편집 데이터(CForgeScene) → 플러그인 공장. 바뀐 게 있으면 전체를 Push하고 Build 한 번(공장이 결과가 같은 것은 재사용한다).
//바닥 높이는 이 프로젝트 지형에서 읽어 바닥 점의 y로, 편집 데이터의 높이는 상단 점의 y로 넘긴다
export class CForgeSync
{
    static sType : Record<string, string> = { wall : CForgeFactory.eType.Wall, building : CForgeFactory.eType.House, tower : CForgeFactory.eType.Tower, path : CForgeFactory.eType.Path, fence : CForgeFactory.eType.Fence,
        bridge : CForgeFactory.eType.Bridge, stair : CForgeFactory.eType.Stair, church : CForgeFactory.eType.Church, dock : CForgeFactory.eType.Dock, monument : CForgeFactory.eType.Monument };
    static sOrder : string[] = [CForgeScene.eKind.Wall, CForgeScene.eKind.Tower, CForgeScene.eKind.Building, CForgeScene.eKind.Path, CForgeScene.eKind.Fence, CForgeScene.eKind.Bridge, CForgeScene.eKind.Stair, CForgeScene.eKind.Church, CForgeScene.eKind.Dock, CForgeScene.eKind.Monument];

    mScene : CForgeScene;
    mTerrain : CForgeTerrain;
    mFactory : CForgeFactory;
    mSub = new Map<string, CSubject>();
    mTheme = "europe_medieval_northwest";
    mForce = true;
    mLastMs = 0;
    mLastCount = 0;

    constructor(_scene : CForgeScene, _terrain : CForgeTerrain, _canvas : CCanvas)
    {
        this.mScene = _scene;
        this.mTerrain = _terrain;
        this.mFactory = new CForgeFactory(_canvas);
        const U = CForgeScene.sUnit;
        this.mFactory.mGround = (_x, _z) => _terrain.WorldY(_x / U, _z / U);
    }

    mSurf = { mNormal : true, mMaterial : true, mParallax : true };
    mPBR = false;
    mGlow = 0;
    static sGlowPower = 1;
    static sGlowColor = new CColor(1.0, 0.72, 0.38, SDF.eColorModel.RGBMul);
    mReal = false;
    //공장이 노말맵에만 Lambert를 넣어 둔다. PBR이 그걸 덮어쓰기 전에 기억해 끄면 되돌린다
    private mLambert = new WeakMap<CPaint3D, boolean>();

    SetTheme(_name : string) { this.mTheme = _name; this.mForce = true; }
    SetSurf(_key : "mNormal" | "mMaterial" | "mParallax", _on : boolean) { this.mSurf[_key] = _on; this.mForce = true; }
    //밤 정도(0~1)에 따라 창 유리(forgeGlow 태그)를 발광시킨다. 블룸이 Emission 텍스처를 번지게 한다
    SetGlow(_rate : number)
    {
        if(_rate == this.mGlow || (Math.abs(_rate - this.mGlow) < 0.02 && _rate > 0 && _rate < 1)) return;
        this.mGlow = _rate;
        this.ApplyPoint();
        for(const sub of this.mSub.values()) if(sub != null) for(const pt of sub.FindComps(CPaint3D, true)) this.ApplyGlow(pt);
    }
    //점광원 세기 = 슬라이더 값 × 밤 정도. 낮에는 꺼진다
    mPoint = 1;
    mPointOn = true;
    SetPointShadow(_on : boolean) { this.mFactory.SetPointShadow(_on); }
    SetPoint(_on : boolean, _k : number) { this.mPointOn = _on; this.mPoint = _k; this.ApplyPoint(); }
    private ApplyPoint() { this.mFactory.SetPointLight(this.mPointOn ? this.mPoint * this.mGlow : 0); }
    private ApplyGlow(_pt : CPaint3D)
    {
        //재질 w(emissive)가 0이 아니면 Emission 패스에 그려져 블룸되므로 창 유리 말고는 0이어야 한다
        //재질맵이 있으면 w를 음수로 줘서 셰이더가 맵 w(유리 마스크)에 비례해 발광시킨다. 맵이 없는 단색은 통째로 발광
        const glow = _pt.mTag.has("forgeGlow"), w = glow ? (_pt.mTag.has("forgeMat") ? -1 : 1) * this.mGlow * CForgeSync.sGlowPower : 0;
        if(glow && !_pt.mTag.has("forgeEmit")) _pt.SetEmission(CForgeSync.sGlowColor);
        if(_pt.mMaterial.w == w) return;
        _pt.mMaterial.w = w;
        _pt.ClearBatch();
    }
    SetPBR(_on : boolean)
    {
        if(this.mPBR == _on) return;
        this.mPBR = _on;
        this.mForce = true;
    }
    SetReal(_on : boolean)
    {
        if(this.mReal == _on) return;
        this.mReal = _on;
        this.mForce = true;
    }

    Update() : boolean
    {
        const dirty = this.mScene.PopDirty();
        if(dirty.length == 0 && !this.mForce) return false;
        this.mForce = false;
        const t0 = performance.now(), keys : string[] = [];
        for(const k of CForgeSync.sOrder)
            for(const e of this.mScene.List<any>(k))
            {
                const [bottom, top, opt] = this.Args(k, e);
                this.mFactory.Push(CForgeSync.sType[k], bottom, top, opt);
                keys.push(k + ":" + e.id);
            }
        const subs = this.mFactory.Build();
        this.mSub.clear();
        keys.forEach((_k, _i) => { if(subs[_i] != null) this.mSub.set(_k, subs[_i]); });
        for(const sub of subs) this.ApplyEnv(sub);
        this.mLastCount = this.mFactory.mLastCount;
        this.mLastMs = performance.now() - t0;
        return true;
    }

    //재질맵이 없는 단색은 roughness -1이 셰이더에서 0으로 잘려 PBR에서 거울이 된다
    private ApplyEnv(_sub : CSubject)
    {
        if(_sub == null) return;
        for(const pt of _sub.FindComps(CPaint3D, true))
        {
            if(this.mLambert.has(pt) == false)
            {
                const step = pt.FindCShaderAttr("ligStep0");
                this.mLambert.set(pt, step != null && step.mData.x == SDF.eLightStep0.Lambert);
            }
            if(this.mPBR)
            {
                pt.Env();
                pt.PushCShaderAttr(new CShaderAttr("ligStep0", SDF.eLightStep0.Lambert));
                pt.PushCShaderAttr(new CShaderAttr("ligStep1", SDF.eLightStep1.CookTorrance));
                if(pt.mMaterial.x > -0.5) pt.SetMaterial(0.85, 0, 1, 1);
            }
            else
            {
                pt.RemoveTag("env");
                pt.PushCShaderAttr(new CShaderAttr("ligStep0", this.mLambert.get(pt) ? SDF.eLightStep0.Lambert : SDF.eLightStep0.HafeLambert));
                pt.PushCShaderAttr(new CShaderAttr("ligStep1", SDF.eLightStep1.Phong));
                if(pt.mMaterial.x > -0.5) pt.SetMaterial(-1, -1, 1, 1);
            }
            this.ApplyGlow(pt);
        }
    }

    Resolved(_kind : string, _id : number) : any
    {
        const sub = this.mSub.get(_kind + ":" + _id);
        return sub == null ? null : this.mFactory.GetResolved(sub);
    }

    private Args(_kind : string, _e : any) : [CVec3[], CVec3[], CForgeOption]
    {
        const U = CForgeScene.sUnit, K = CForgeScene.eKind, G = (_x : number, _z : number) => this.mTerrain.HeightM(_x, _z);
        const V = (_x : number, _z : number, _y : number) => new CVec3(_x * U, _y * U, _z * U);
        //개체마다 고정된 시드를 넘겨야 편집해도 색·창 배치가 유지된다
        const opt = new CForgeOption({ mTheme : this.mTheme, mSeed : _e.seed, mOverride : _e.over ?? null, mPBR : this.mPBR, mReal : this.mReal, ...this.mSurf });
        if(_kind == K.Wall)
        {
            opt.mSize = _e.thick;
            return [_e.pts.map((q : number[]) => V(q[0], q[1], G(q[0], q[1]))), _e.pts.map((q : number[]) => V(q[0], q[1], G(q[0], q[1]) + q[2])), opt];
        }
        if(_kind == K.Building)
        {
            const bottom = _e.poly.map((q : number[]) => V(q[0], q[1], G(q[0], q[1])));
			opt.mInterior = _e.interior ?? null;
            return [bottom, bottom.map((v : CVec3) => new CVec3(v.x, v.y + _e.height * U, v.z)), opt];
        }
        if(_kind == K.Tower)
        {
            const g = G(_e.c[0], _e.c[1]);
            opt.mSize = _e.r;
            opt.mStyle = _e.shape == 1 ? (_e.roof == CForgeScene.eRoof.Flat ? 4 : 3) : _e.roof == CForgeScene.eRoof.Cone ? 1 : _e.roof == CForgeScene.eRoof.Flat ? 2 : 0;
            return [[V(_e.c[0], _e.c[1], g)], [V(_e.c[0], _e.c[1], g + _e.height)], opt];
        }
        if(_kind == K.Church) { opt.mStyle = _e.style ?? 0; return [_e.poly.map((q : number[]) => V(q[0], q[1], G(q[0], q[1]))), null, opt]; }
        if(_kind == K.Monument) { opt.mSize = _e.size; opt.mStyle = _e.style ?? 0; return [[V(_e.c[0], _e.c[1], G(_e.c[0], _e.c[1]))], null, opt]; }
        if(_kind == K.Path || _kind == K.Bridge || _kind == K.Stair || _kind == K.Dock) { opt.mSize = _e.width; opt.mStyle = _e.style ?? 0; }
        if(_kind == K.Dock && _e.deck != null) return [_e.pts.map((q : number[]) => V(q[0], q[1], G(q[0], q[1]))), [V(_e.pts[0][0], _e.pts[0][1], _e.deck)], opt];
        const bottom = _e.pts.map((q : number[]) => V(q[0], q[1], G(q[0], q[1])));
        if(_kind == K.Stair) return [bottom, bottom.map((v : CVec3, i : number) => new CVec3(v.x, v.y + (i == bottom.length - 1 ? (_e.top ?? 0) * U : 0), v.z)), opt];
        return [bottom, null, opt];
    }
}
