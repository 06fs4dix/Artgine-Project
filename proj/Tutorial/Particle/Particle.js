import "../../../artgine/artgine.js";
import { CPreferences } from "../../../artgine/basic/CPreferences.js";
var gPF = new CPreferences();
gPF.mTargetWidth = 0;
gPF.mTargetHeight = 0;
gPF.mRenderer = "GL";
gPF.m32fDepth = false;
gPF.mTexture16f = false;
gPF.mAnti = true;
gPF.mBatchPool = true;
gPF.mXR = false;
gPF.mDeveloper = true;
gPF.mIAuto = true;
gPF.mCanvas = "";
gPF.mServer = 'webServer';
gPF.mGitHub = false;
gPF.mVersion = "mszqhp50_4";
import { CAtelier } from "../../../artgine/app/CAtelier.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([], "");
import { CCamCon3DFirstPerson } from "../../../artgine/util/CCamCon.js";
import { CRenderPass } from "../../../artgine/render/CRenderPass.js";
import { CSubject } from "../../../artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../artgine/app/component/paint/CPaint3D.js";
import { CParticle, CParticleShapeOut } from "../../../artgine/app/subject/CParticle.js";
import { CPaint2D } from "../../../artgine/app/component/paint/CPaint2D.js";
import { CColor } from "../../../artgine/render/CColor.js";
import { CVec3 } from "../../../artgine/geometry/CVec3.js";
import { CVec2 } from "../../../artgine/geometry/CVec2.js";
import { CAlpha } from "../../../artgine/render/CAlpha.js";
import { CAnimation, CClipAlpha, CClipColor, CClipDestroy, CClipPRS } from "../../../artgine/app/component/CAnimation.js";
import { CAniFlow } from "../../../artgine/app/component/CAniFlow.js";
import { CSampList } from "../../../artgine/util/CSampler.js";
import { CEvent } from "../../../artgine/basic/CEvent.js";
import { CInput } from "../../../artgine/system/CInput.js";
import { CPool } from "../../../artgine/basic/CPool.js";
import { CMath } from "../../../artgine/geometry/CMath.js";
import { CTrail } from "../../../artgine/app/subject/CTrail.js";
var Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
gAtl.Brush().GetCam3D().SetCamCon(new CCamCon3DFirstPerson(gAtl.Frame().Input()));
var obj = new CSubject();
var pt = new CPaint3D(gAtl.Frame().Pal().GetBoxMesh());
let rp = new CRenderPass(gAtl.Frame().Pal().Sl3DKey());
rp.SetPriority(CRenderPass.ePriority.BackGround);
pt.PushRenderPass(rp);
pt.SetTexture(gAtl.Frame().Pal().GetNoneTex());
obj.PushComp(pt);
obj.SetSca(new CVec3(2000, 20, 2000));
Main.PushSub(obj);
var particle = new CParticle();
var sub0 = new CSubject();
CPool.On("Type0", () => {
    let psub0 = new CSubject();
    let ptbill = new CPaint2D(gAtl.Frame().Pal().GetNoneTex(), new CVec2(100, 100));
    ptbill.SetBillBoard(true);
    ptbill.SetColorModel(new CColor(0, 1, 0, CColor.eModel.RGBMul));
    psub0.PushComp(ptbill);
    var ani = new CAnimation();
    ani.Push(new CClipAlpha(0, 5, new CAlpha(1), new CAlpha(0)));
    ani.Push(new CClipDestroy(5));
    psub0.PushComp(new CAniFlow(ani));
    return psub0;
}, CPool.ePool.Product);
CPool.On("Type0", (_r) => {
}, CPool.ePool.Recycle);
let ptbill = new CPaint2D(gAtl.Frame().Pal().GetNoneTex(), new CVec2(100, 100));
ptbill.SetBillBoard(true);
ptbill.SetColorModel(new CColor(0, 1, 0, CColor.eModel.RGBMul));
sub0.PushComp(ptbill);
var ani = new CAnimation();
ani.Push(new CClipAlpha(0, 5, new CAlpha(1), new CAlpha(0)));
ani.Push(new CClipDestroy(5));
sub0.PushComp(new CAniFlow(ani));
var sub1 = new CSubject();
ptbill = new CPaint2D(gAtl.Frame().Pal().GetNoneTex(), new CVec2(10, 100));
ptbill.SetColorModel(new CColor(1, 0, 0, CColor.eModel.RGBMul));
ptbill.SetBillBoard(true);
ptbill.Tail();
sub1.PushComp(ptbill);
var ani = new CAnimation();
ani.Push(new CClipColor(5, 10, new CColor(0, 0, 0, CColor.eModel.RGBAdd), new CColor(1, -1, -1, CColor.eModel.RGBAdd)));
ani.Push(new CClipDestroy(10));
sub1.PushComp(new CAniFlow(ani));
var sub2 = new CSubject();
ptbill = new CPaint2D(gAtl.Frame().Pal().GetNoneTex(), new CVec2(100, 100));
ptbill.SetColorModel(new CColor(0, 0, 1, CColor.eModel.RGBMul));
sub2.PushComp(ptbill);
var ani = new CAnimation();
ani.Push(new CClipDestroy(5));
sub2.PushComp(new CAniFlow(ani));
var sam = new CSampList([sub0, sub1, sub2], [1, 4, 2]);
particle.mSample = sam;
particle.mShape = new CParticleShapeOut();
Main.PushSub(particle);
{
    const plane = new CSubject();
    const planePT = new CPaint3D(gAtl.Frame().Pal().GetBoxMesh());
    const planeRP = new CRenderPass(gAtl.Frame().Pal().Sl3DKey());
    planeRP.SetPriority(CRenderPass.ePriority.BackGround);
    planePT.PushRenderPass(planeRP);
    planePT.SetTexture(gAtl.Frame().Pal().GetNoneTex());
    planePT.SetColorModel(new CColor(0.2, 0.5, 0.2, CColor.eModel.RGBMul));
    plane.PushComp(planePT);
    plane.SetSca(new CVec3(200, 20, 200));
    plane.SetPos(new CVec3(0, 500, 0));
    Main.PushSub(plane);
}
function ArcTrail180(_pos, _view, _dot, _size, _duration = 1.0, _fadeTime = 2.0) {
    const reach = _size > 0 ? _size : 100;
    const radius = reach * 0.5;
    const dir = CMath.V3Nor(_view);
    const center = _pos;
    const baseAng = Math.atan2(dir.z, dir.x);
    const halfArc = Math.acos(_dot);
    const arcDeg = halfArc * 2 * 180 / Math.PI;
    const startA = baseAng - halfArc;
    const endA = baseAng + halfArc;
    const SEGMENTS = 16;
    const segDur = _duration / SEGMENTS;
    const arcLen = radius * (arcDeg * Math.PI / 180);
    const trail = new CTrail(gAtl.Brush().GetCam3D());
    trail.mLength = arcLen * 1.1;
    trail.mFadeTime = _fadeTime;
    trail.mWidth = reach;
    trail.mLastSmall = false;
    trail.mLastHide = false;
    trail.mNormal = new CVec3(0, 1, 0);
    const startPos = new CVec3(center.x + Math.cos(startA) * radius, center.y, center.z + Math.sin(startA) * radius);
    trail.SetPos(startPos);
    const colorize = new CEvent();
    let applied = false;
    colorize.mEvent = (_dt) => {
        const tp = trail.mTrailPaint;
        if (tp != null && !applied) {
            tp.SetColorModel(new CColor(0.7, 0.9, 1.0, CColor.eModel.RGBAdd));
            tp.SetAlphaModel(new CAlpha(0.8));
            applied = true;
            gAtl.Frame().RemoveEvent(colorize);
        }
    };
    gAtl.Frame().PushEvent(CEvent.eType.Update, colorize);
    const ani = new CAnimation();
    ani.mLoop = false;
    let prev = startPos;
    for (let i = 1; i <= SEGMENTS; i++) {
        const a = startA + (endA - startA) * (i / SEGMENTS);
        const cur = new CVec3(center.x + Math.cos(a) * radius, center.y, center.z + Math.sin(a) * radius);
        ani.Push(new CClipPRS((i - 1) * segDur, segDur, prev, cur, CClipPRS.eType.Pos));
        prev = cur;
    }
    ani.Push(new CClipDestroy(_duration + _fadeTime));
    trail.PushComp(new CAniFlow(ani));
    Main.PushSub(trail);
    return trail;
}
function ThrustTest(_pos, _view, _distance = 130, _duration = 0.25, _fadeTime = 0.3) {
    const nor = CMath.V3Nor(_view);
    const startPos = new CVec3(_pos.x, _pos.y, _pos.z);
    const endPos = new CVec3(_pos.x + nor.x * _distance, _pos.y + nor.y * _distance, _pos.z + nor.z * _distance);
    const trail = new CTrail(gAtl.Brush().GetCam3D());
    trail.mLength = _distance * 1.2;
    trail.mFadeTime = _fadeTime;
    trail.mWidth = 18;
    trail.mLastSmall = true;
    trail.mLastHide = true;
    trail.SetPos(startPos);
    const colorize = new CEvent();
    let applied = false;
    colorize.mEvent = (_dt) => {
        const tp = trail.mTrailPaint;
        if (tp != null && !applied) {
            tp.SetColorModel(new CColor(1.0, 0.6, 0.2, CColor.eModel.RGBAdd));
            tp.SetAlphaModel(new CAlpha(0.8));
            applied = true;
            gAtl.Frame().RemoveEvent(colorize);
        }
    };
    gAtl.Frame().PushEvent(CEvent.eType.Update, colorize);
    const half = _duration / 2;
    const ani = new CAnimation();
    ani.mLoop = false;
    ani.Push(new CClipPRS(0, half, startPos, endPos, CClipPRS.eType.Pos));
    ani.Push(new CClipPRS(half, half, endPos, startPos, CClipPRS.eType.Pos));
    ani.Push(new CClipDestroy(_duration + _fadeTime));
    trail.PushComp(new CAniFlow(ani));
    Main.PushSub(trail);
    return trail;
}
gAtl.Frame().PushEvent(CEvent.eType.Update, new CEvent((_dt) => {
    const input = gAtl.Frame().Input();
    if (input.KeyDown(CInput.eKey.Space, true))
        ArcTrail180(new CVec3(0, 550, 0), new CVec3(0, 0, 1), 0, 100);
    if (input.KeyDown(CInput.eKey.F, true))
        ThrustTest(new CVec3(0, 550, 0), new CVec3(0, 0, 1), 100);
}));
