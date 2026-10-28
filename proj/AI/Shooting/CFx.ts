import { CCanvas } from "../../../artgine/app/canvas/CCanvas.js";
import { CAniFlow } from "../../../artgine/app/component/CAniFlow.js";
import { CBehavior } from "../../../artgine/app/component/CBehavior.js";
import { CUpdate } from "../../../artgine/basic/Basic.js";
import { CAnimation, CClipAlpha, CClipCoodi, CClipDestroy, CClipImg, CClipPRS } from "../../../artgine/app/component/CAnimation.js";
import { CPaint2D } from "../../../artgine/app/component/paint/CPaint2D.js";
import { CParticleOut } from "../../../artgine/app/subject/CParticle.js";
import { CSubject } from "../../../artgine/app/subject/CSubject.js";
import { CVec2 } from "../../../artgine/geometry/CVec2.js";
import { CVec3 } from "../../../artgine/geometry/CVec3.js";
import { CAlpha } from "../../../artgine/render/CAlpha.js";
import { CCamera } from "../../../artgine/render/CCamera.js";
import { CColor } from "../../../artgine/render/CColor.js";
import { CH5Canvas } from "../../../artgine/render/CH5Canvas.js";
import { CShaderAttr } from "../../../artgine/render/CShaderAttr.js";
import { CVec1 } from "../../../artgine/geometry/CVec1.js";
import { CCamShakeNoise } from "../../../artgine/util/CCamShake.js";
import { CSampList, CSampMinMax, CSampler } from "../../../artgine/util/CSampler.js";
import { CSchedule } from "../../../artgine/util/CSchedule.js";
import { CBulletComp } from "./CBulletComp.js";

export class CDelayComp extends CBehavior
{
    mTime = 0;
    OnEnd: () => void = null;

    constructor(_time = 0, _onEnd: () => void = null)
    {
        super();
        this.mTime = _time;
        this.OnEnd = _onEnd;
    }

    override Update(_update: CUpdate): void
    {
        if (this.GetOwner().IsDestroy()) return;
        super.Update(_update);
        this.mTime -= _update.DeltaMil();
        if (this.mTime > 0) return;
        if (this.OnEnd) this.OnEnd();
        this.GetOwner().Destroy();
    }
}

export class CSpinComp extends CBehavior
{
    mSpeed = 2.5;
    mAngle = 0;

    constructor(_speed = 2.5)
    {
        super();
        this.mSpeed = _speed;
    }

    override Update(_update: CUpdate): void
    {
        super.Update(_update);
        this.mAngle += _update.DeltaTime() * this.mSpeed;
        this.GetOwner().SetRot(new CVec3(0, 0, this.mAngle));
    }
}

export class CFx
{
    static sCanvas: CCanvas = null;
    static sShake: CCamShakeNoise = null;
    static sTrauma = 0;
    static sTraumaTime = 0;

    static Init(_canvas: CCanvas, _cam: CCamera)
    {
        CFx.sCanvas = _canvas;
        CFx.sShake = new CCamShakeNoise();
        CFx.sShake.Set2D(26);
        CFx.sShake.mPosLimit.z = 0;
        CFx.sShake.mRecoverySpeed = 1.8;
        CFx.sShake.mFrequency = 32;
        _cam.SetCamShake(CFx.sShake);

        let fw = _canvas.GetFrame();
        if (fw.Res().Find(CFx.sWhiteTex) == null)
        {
            CH5Canvas.Init(2, 2);
            CH5Canvas.Draw([CH5Canvas.Cmd("fillStyle", "white"), CH5Canvas.Cmd("fillRect", [0, 0, 2, 2])]);
            let tex = CH5Canvas.GetNewTex();
            fw.Ren().BuildTexture(tex);
            fw.Res().Push(CFx.sWhiteTex, tex);
        }
    }

    static sWhiteTex = "Shooting/White.tex";

    static WhiteTex()
    {
        return CFx.sWhiteTex;
    }

    static Shake(_power: number)
    {
        if (CFx.sShake == null) return;
        let now = performance.now();
        let cur = Math.max(0, CFx.sTrauma - (now - CFx.sTraumaTime) / 1000 * CFx.sShake.mRecoverySpeed);
        if (_power <= cur) return;
        CFx.sTrauma = _power;
        CFx.sTraumaTime = now;
        CFx.sShake.Shake(_power * 1000 / CFx.sShake.mRecoverySpeed);
    }

    // mask 유니폼은 페인트 기본값 대상이 아니라 값이 없는 페인트는 직전 드로우 값을 물려받는다 → 항상 명시한다
    static Bloom(_pt: CPaint2D, _mask = 1)
    {
        _pt.PushTag("bloom");
        _pt.PushCShaderAttr(new CShaderAttr("mask", new CVec1(_mask)));
    }

    static Glow(_pos: CVec3, _size: number, _r: number, _g: number, _b: number, _life: number, _z = 0.25)
    {
        let fx = new CSubject();
        let pt = new CPaint2D("Res/shmup_effects/flash5_64x64x4x2.png", new CVec2(_size, _size));
        pt.SetTexCodi(0, 0, 64, 64, 256, 128);
        pt.SetColorModel(new CColor(_r, _g, _b, CColor.eModel.RGBMul));
        CFx.Bloom(pt, 0.45);
        fx.PushComp(pt);

        let ani = new CAnimation();
        ani.mLoop = false;
        ani.Push(new CClipAlpha(0, _life, new CAlpha(1), new CAlpha(0)));
        ani.Push(new CClipPRS(0, _life, new CVec3(1, 1, 1), new CVec3(0.2, 0.2, 1), CClipPRS.eType.Sca));
        ani.Push(new CClipDestroy(_life));
        fx.PushComp(new CAniFlow(ani));

        fx.SetPos(new CVec3(_pos.x, _pos.y, _z));
        CFx.sCanvas.PushSub(fx);
        return fx;
    }

    static Sparks(_pos: CVec3, _count: number, _r: number, _g: number, _b: number,
        _speedMin = 120, _speedMax = 380, _life = 0.45, _size = 5)
    {
        let sample = new CSubject();
        let pt = new CPaint2D(CFx.WhiteTex(), new CVec2(_size, _size));
        pt.SetColorModel(new CColor(_r, _g, _b, CColor.eModel.RGBMul));
        CFx.Bloom(pt, 0.9);
        sample.PushComp(pt);

        let ani = new CAnimation();
        ani.mLoop = false;
        ani.Push(new CClipAlpha(0, _life, new CAlpha(1), new CAlpha(0)));
        ani.Push(new CClipPRS(0, _life, new CVec3(1, 1, 1), new CVec3(0.1, 0.1, 1), CClipPRS.eType.Sca));
        ani.Push(new CClipDestroy(_life));
        sample.PushComp(new CAniFlow(ani));

        let par = new CParticleOut();
        par.mDir = new CSampMinMax<CVec3>(new CVec3(-1, -1, 0), new CVec3(1, 1, 0));
        par.mMoveSpeed = new CSampMinMax<number>(_speedMin, _speedMax);
        par.mSample = new CSampList<CSubject | string>([sample]);
        par.mCreateCount = new CSampler<number>(_count);
        par.mTimer = new CSchedule(0, 1);
        par.SetPos(new CVec3(_pos.x, _pos.y, 0.3));
        CFx.sCanvas.PushSub(par);
    }

    static Ring(_pos: CVec3, _size: number, _life = 0.4, _stSca = 0.15, _edSca = 1.0)
    {
        let fx = new CSubject();
        let pt = new CPaint2D("Res/shmup_effects/ring03_512x512.png", new CVec2(_size, _size));
        CFx.Bloom(pt, 0.45);
        fx.PushComp(pt);

        let ani = new CAnimation();
        ani.mLoop = false;
        ani.Push(new CClipPRS(0, _life, new CVec3(_stSca, _stSca, 1), new CVec3(_edSca, _edSca, 1), CClipPRS.eType.Sca));
        ani.Push(new CClipAlpha(0, _life, new CAlpha(0.7), new CAlpha(0)));
        ani.Push(new CClipDestroy(_life));
        fx.PushComp(new CAniFlow(ani));

        fx.SetSca(new CVec3(_stSca, _stSca, 1));
        fx.SetPos(new CVec3(_pos.x, _pos.y, 0.28));
        CFx.sCanvas.PushSub(fx);
    }

    static Flash(_pos: CVec3, _size: number, _speed = 2.5)
    {
        let fx = new CSubject();
        let pt = new CPaint2D(null, new CVec2(_size, _size));
        pt.SetColorModel(new CColor(1, 0.8, 0.55, CColor.eModel.RGBMul));
        CFx.Bloom(pt, 0.4);
        fx.PushComp(pt);

        let ani = new CAnimation();
        ani.mLoop = false;
        ani.Push(new CClipImg(0, 0, "Res/shmup_effects/flash5_64x64x4x2.png"));
        const fd = 0.1;
        for (let i = 0; i < 8; i++)
        {
            let x = (i % 4) * 64, y = Math.floor(i / 4) * 64;
            ani.Push(new CClipCoodi(i * fd, fd, x, y, x + 64, y + 64));
        }
        ani.Push(new CClipDestroy(0.8));
        let af = fx.PushComp(new CAniFlow(ani));
        af.SetSpeed(_speed);

        fx.SetPos(new CVec3(_pos.x, _pos.y, 0.22));
        CFx.sCanvas.PushSub(fx);
    }

    static Explosion(_pos: CVec3, _scale = 1)
    {
        let fx = new CSubject();
        let pt = new CPaint2D(null, new CVec2(110 * _scale, 110 * _scale));
        pt.SetColorModel(new CColor(1, 0.68, 0.38, CColor.eModel.RGBMul));
        CFx.Bloom(pt, 0.2);
        fx.PushComp(pt);

        let ani = new CAnimation();
        ani.mLoop = false;
        ani.Push(new CClipImg(0, 0, "Res/shmup_effects/explosion1.png"));
        const fd = 0.1;
        for (let i = 0; i < 24; i++)
        {
            let x = (i % 4) * 160, y = Math.floor(i / 4) * 160;
            ani.Push(new CClipCoodi(i * fd, fd, x, y, x + 160, y + 160));
        }
        ani.Push(new CClipDestroy(2.4));
        let af = fx.PushComp(new CAniFlow(ani));
        af.SetSpeed(2.6);

        fx.SetPos(new CVec3(_pos.x, _pos.y, 0.2));
        CFx.sCanvas.PushSub(fx);

        CFx.Glow(_pos, 45 * _scale, 1, 0.5, 0.15, 0.2);
        CFx.Sparks(_pos, Math.round(10 * _scale), 1, 0.6, 0.2, 100, 320 * Math.sqrt(_scale), 0.5, 5);
        CFx.Sparks(_pos, Math.round(5 * _scale), 1, 0.8, 0.35, 60, 200, 0.3, 4);
        CFx.Ring(_pos, 150 * _scale, 0.35);
        CFx.Shake(Math.min(1, 0.22 * _scale));
    }

    static ScreenFlash(_r: number, _g: number, _b: number, _alpha: number, _life: number)
    {
        let fx = new CSubject();
        let pt = new CPaint2D(CFx.WhiteTex(), new CVec2(700, 900));
        pt.SetColorModel(new CColor(_r, _g, _b, CColor.eModel.RGBMul));
        fx.PushComp(pt);

        let ani = new CAnimation();
        ani.mLoop = false;
        ani.Push(new CClipAlpha(0, _life, new CAlpha(_alpha), new CAlpha(0)));
        ani.Push(new CClipDestroy(_life));
        fx.PushComp(new CAniFlow(ani));

        fx.SetPos(new CVec3(0, 0, 0.9));
        CFx.sCanvas.PushSub(fx);
    }

    static ClearEnemyBullets()
    {
        for (let [, sub] of CFx.sCanvas.GetSubMap())
        {
            if (sub.IsDestroy()) continue;
            let bc = sub.FindComp(CBulletComp);
            if (bc == null || bc.mIsPlayer) continue;
            CFx.Glow(sub.GetPos(), 14, 0.6, 0.9, 1, 0.3);
            sub.Destroy();
        }
    }
}
