//Version
import "../../../artgine/artgine.js"

//Class
import {CClass} from "../../../artgine/basic/CClass.js";

//Atelier
import {CPreferences} from "../../../artgine/basic/CPreferences.js";
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

import {CAtelier} from "../../../artgine/app/CAtelier.js";

import {CPlugin} from "../../../artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
import {CObject} from "../../../artgine/basic/CObject.js"


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
import { CAnimation,  CClipAlpha,  CClipColor,  CClipDestroy, CClipPRS } from "../../../artgine/app/component/CAnimation.js";
import { CAniFlow } from "../../../artgine/app/component/CAniFlow.js";
import { CSampler, CSampList, CSampMinMax } from "../../../artgine/util/CSampler.js";
import { CPaintTrail } from "../../../artgine/app/component/paint/CPaintTrail.js";
import { CRigidBody } from "../../../artgine/app/component/CRigidBody.js";
import { CForce } from "../../../artgine/app/component/CForce.js";
import { CEvent } from "../../../artgine/basic/CEvent.js";
import { CInput } from "../../../artgine/system/CInput.js";
import { CPool } from "../../../artgine/basic/CPool.js";
import { CMath } from "../../../artgine/geometry/CMath.js";
import { CJSON } from "../../../artgine/basic/CJSON.js";
import { CVec4 } from "../../../artgine/geometry/CVec4.js";
import { CUtilMath } from "../../../artgine/geometry/CUtilMath.js";
import { CUpdate } from "../../../artgine/basic/Basic.js";
import { CCamera } from "../../../artgine/render/CCamera.js";
import { CTrail } from "../../../artgine/app/subject/CTrail.js";



var Main=gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
gAtl.Brush().GetCam3D().SetCamCon(new CCamCon3DFirstPerson(gAtl.Frame().Input()));
var obj=new CSubject();
var pt=new CPaint3D(gAtl.Frame().Pal().GetBoxMesh());
let rp=new CRenderPass(gAtl.Frame().Pal().Sl3DKey());
//강제로 렌더링 순서를 조정했다.
rp.SetPriority(CRenderPass.ePriority.BackGround);
pt.PushRenderPass(rp);
pt.SetTexture(gAtl.Frame().Pal().GetNoneTex());
//pt.SetRenderPass(rp);
obj.PushComp(pt);
obj.SetSca(new CVec3(2000,20,2000));
//obj.SetSca(new CVec3(100,0.01,100));
Main.PushSub(obj);



//파티클 샘플
var particle=new CParticle();
var sub0=new CSubject();
//sub0.ExeRecycle("Type0");
CPool.On("Type0",()=>{
    let psub0=new CSubject();
    let ptbill=new CPaint2D(gAtl.Frame().Pal().GetNoneTex(),new CVec2(100,100));
    ptbill.SetBillBoard(true);
    ptbill.SetColorModel(new CColor(0,1,0,CColor.eModel.RGBMul))
    psub0.PushComp(ptbill);

    var ani=new CAnimation();
    ani.Push(new CClipAlpha(0,5,new CAlpha(1),new CAlpha(0)));
    ani.Push(new CClipDestroy(5));
    psub0.PushComp(new CAniFlow(ani));

    return psub0;
},CPool.ePool.Product);
CPool.On("Type0",(_r : any)=>{
    //_r.FindComp(CAniFlow).SetAni();
},CPool.ePool.Recycle);

let ptbill=new CPaint2D(gAtl.Frame().Pal().GetNoneTex(),new CVec2(100,100));
ptbill.SetBillBoard(true);
ptbill.SetColorModel(new CColor(0,1,0,CColor.eModel.RGBMul))
sub0.PushComp(ptbill);

var ani=new CAnimation();
ani.Push(new CClipAlpha(0,5,new CAlpha(1),new CAlpha(0)));
ani.Push(new CClipDestroy(5));
sub0.PushComp(new CAniFlow(ani));


var sub1=new CSubject();
ptbill=new CPaint2D(gAtl.Frame().Pal().GetNoneTex(),new CVec2(10,100));
ptbill.SetColorModel(new CColor(1,0,0,CColor.eModel.RGBMul))
ptbill.SetBillBoard(true);
ptbill.Tail();
sub1.PushComp(ptbill);
var ani=new CAnimation();
ani.Push(new CClipColor(5,10,new CColor(0,0,0,CColor.eModel.RGBAdd),new CColor(1,-1,-1,CColor.eModel.RGBAdd)));
ani.Push(new CClipDestroy(10));
sub1.PushComp(new CAniFlow(ani));


var sub2=new CSubject();
ptbill=new CPaint2D(gAtl.Frame().Pal().GetNoneTex(),new CVec2(100,100));
ptbill.SetColorModel(new CColor(0,0,1,CColor.eModel.RGBMul))
//ptbill.SetBillBoard(true);
sub2.PushComp(ptbill);
var ani=new CAnimation();
ani.Push(new CClipDestroy(5));
sub2.PushComp(new CAniFlow(ani));

//3가지 샘플을 4:2:1 비율로 선택함
var sam=new CSampList([sub0,sub1,sub2],[1,4,2]);
//var sam=new CSamplerList(["Type0"]);
//var sam=new CSamplerList([sub0]);
particle.mSample=sam;
//particle.mCreateCount=new CSampler(200);
//particle.m_createTime=1000*5;
//모든 방향으로 아웃함
particle.mShape=new CParticleShapeOut();
//(particle.mShape as CParticleShapeOut).mDir=new CExtractMinMax(new CVec3(0,0,0),new CVec3(0,1,0));
//particle.mCreateCount=new CExtract(1);
//particle.mCreateTime=5000;
Main.PushSub(particle);




// var trail3Obj=Main.PushSub(new CTrail(gAtl.Brush().GetCam3D()));
// trail3Obj.mLength    = 1000;
// trail3Obj.mFadeTime  = 10.0;   // 감소속도 = 1000/10 = 100/sec < 이동속도(200/sec) → 꼬리 쌓임

// var ani=new CAnimation();

// // ani.Push(new CClipPRS(0,2,new CVec3(500,100,500),new CVec3(500,100,-500),0));
// // ani.Push(new CClipPRS(2,2,new CVec3(500,100,-500),new CVec3(500,100,500),0));
// //ani.mLoop=false;
// ani.Push(new CClipPRS(0,5,new CVec3(500,100,500),new CVec3(500,100,-500),0));
// ani.Push(new CClipPRS(5,5,new CVec3(500,100,-500),new CVec3(-500,100,-500),0));
// ani.Push(new CClipPRS(10,5,new CVec3(-500,100,-500),new CVec3(-500,100,500),0));
// ani.Push(new CClipPRS(15,5,new CVec3(-500,100,500),new CVec3(500,100,500),0));

// trail3Obj.PushComp(new CAniFlow(ani));






// // =========================================================
// // 원형 검 궤적 (Sword Circle Trail)
// // =========================================================
// // Space 키를 누르면 발동
// //   radius   : 회전 반경 (단위: 게임 유닛)
// //   size     : 트레일 두께·크기
// //   duration : 원 한 바퀴를 도는 데 걸리는 시간(초)
// //   center   : 원의 중심 위치 (CVec3)
// function SwordCircleTrail(
//     radius: number   = 300,
//     size: number     = 50,
//     duration: number = 1.5,
//     center: CVec3    = new CVec3(0, 100, 0)
// ) {
//     const SEGMENTS = 32;          // 원을 근사하는 선분 수 (많을수록 부드러움)
//     const segDur   = duration / SEGMENTS;

//     // CTrail: 오브젝트 이동 궤적을 자동으로 트레일로 표현
//     const trail = new CTrail(gAtl.Brush().GetCam3D());
    
//     trail.mLastSmall = true;              // 꼬리 끝을 가늘게
//     trail.mLastHide  = false;

//     Main.PushSub(trail);

//     // 원을 SEGMENTS개의 직선으로 근사해 CClipPRS로 애니메이션
//     const swordAni = new CAnimation();
//     for (let i = 0; i < SEGMENTS; i++) {
//         const a0 = (i       / SEGMENTS) * Math.PI * 2;
//         const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2;
//         swordAni.Push(new CClipPRS(
//             i * segDur,
//             segDur,
//             new CVec3(center.x + Math.cos(a0) * radius, center.y, center.z + Math.sin(a0) * radius),
//             new CVec3(center.x + Math.cos(a1) * radius, center.y, center.z + Math.sin(a1) * radius),
//             0   // CClipPRS.eType.Pos
//         ));
//     }
//     trail.PushComp(new CAniFlow(swordAni));

//     // CAniFlow 의 CClipDestroy 대신 RemoveEvent 패턴으로 확실하게 Destroy
//     const destroyTime = duration * 2 + 1.0;  // 잔상 소멸 후 1초 여유
//     let elapsed = 0;
//     const cleanupEv = new CEvent();
//     cleanupEv.mEvent = (_dt: number) => {
//         elapsed += _dt;
//         if (elapsed >= destroyTime) {
//             trail.Destroy();
//             gAtl.Frame().RemoveEvent(cleanupEv);
//         }
//     };
//     gAtl.Frame().PushEvent(CEvent.eType.Update, cleanupEv);

//     return trail;
// }

// SwordCircleTrail(300, 50, 1.5, new CVec3(0, 100, 0));























// ── Trail 폭 테스트용 참조 평면 (X: 0~500, Z: 0~100) ──────────────────
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
    plane.SetPos(new CVec3(0, 500, 0));   // X:0~500, Y:−1~0, Z:0~100
    Main.PushSub(plane);
}

// ── 180° 호 트레일 — SlashTrail과 동일 파라미터 구조, XZ 평면 ──────────
function ArcTrail180(
    _pos     : CVec3,
    _view    : CVec3,
    _dot     : number,
    _size    : number,
    _duration: number = 1.0,
    _fadeTime: number = 2.0
): CSubject {
    const reach  = _size > 0 ? _size : 100;
    const radius = reach * 0.5;
    const dir    = CMath.V3Nor(_view);
    const center = _pos;

    const baseAng = Math.atan2(dir.z, dir.x);   // XZ 평면
    const halfArc = Math.acos(_dot);
    const arcDeg  = halfArc * 2 * 180 / Math.PI;
    const startA  = baseAng - halfArc;
    const endA    = baseAng + halfArc;

    const SEGMENTS = 16;
    const segDur   = _duration / SEGMENTS;
    const arcLen   = radius * (arcDeg * Math.PI / 180);

    const trail = new CTrail(gAtl.Brush().GetCam3D());
    trail.mLength    = arcLen * 1.1;
    trail.mFadeTime  = _fadeTime;
    trail.mWidth     = reach;
    trail.mLastSmall = false;
    trail.mLastHide  = false;
    trail.mNormal    = new CVec3(0, 1, 0);  // 탑뷰 고정 노말

    const startPos = new CVec3(
        center.x + Math.cos(startA) * radius,
        center.y,
        center.z + Math.sin(startA) * radius
    );
    trail.SetPos(startPos);

    const colorize = new CEvent();
    let applied = false;
    colorize.mEvent = (_dt: number) => {
        const tp = (trail as any).mTrailPaint as CPaintTrail;
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
        const a   = startA + (endA - startA) * (i / SEGMENTS);
        const cur = new CVec3(
            center.x + Math.cos(a) * radius,
            center.y,
            center.z + Math.sin(a) * radius
        );
        ani.Push(new CClipPRS((i-1) * segDur, segDur, prev, cur, CClipPRS.eType.Pos));
        prev = cur;
    }
    ani.Push(new CClipDestroy(_duration + _fadeTime));
    trail.PushComp(new CAniFlow(ani));
    Main.PushSub(trail);
    return trail;
}

// mDot=0 → acos(0)=90° → 총 180°, +Z 방향 기준
// F키 → ThrustTest: 아래(Y=500)에서 위로 갔다가 다시 아래로
function ThrustTest(
    _pos     : CVec3,
    _view    : CVec3,
    _distance: number = 130,
    _duration: number = 0.25,
    _fadeTime: number = 0.3
): CSubject {
    const nor      = CMath.V3Nor(_view);
    const startPos = new CVec3(_pos.x, _pos.y, _pos.z);
    const endPos   = new CVec3(_pos.x + nor.x * _distance, _pos.y + nor.y * _distance, _pos.z + nor.z * _distance);

    const trail = new CTrail(gAtl.Brush().GetCam3D());
    trail.mLength    = _distance * 1.2;
    trail.mFadeTime  = _fadeTime;
    trail.mWidth     = 18;
    trail.mLastSmall = true;
    trail.mLastHide  = true;
    
    trail.SetPos(startPos);

    const colorize = new CEvent();
    let applied = false;
    colorize.mEvent = (_dt: number) => {
        const tp = (trail as any).mTrailPaint as CPaintTrail;
        if (tp != null && !applied) {
            tp.SetColorModel(new CColor(1.0, 0.6, 0.2, CColor.eModel.RGBAdd));
            tp.SetAlphaModel(new CAlpha(0.8));
            applied = true;
            gAtl.Frame().RemoveEvent(colorize);
        }
    };
    gAtl.Frame().PushEvent(CEvent.eType.Update, colorize);

    const half = _duration / 2;
    const ani  = new CAnimation();
    ani.mLoop  = false;
    ani.Push(new CClipPRS(0,    half, startPos, endPos,   CClipPRS.eType.Pos));
    ani.Push(new CClipPRS(half, half, endPos,   startPos, CClipPRS.eType.Pos));
    ani.Push(new CClipDestroy(_duration + _fadeTime));
    trail.PushComp(new CAniFlow(ani));
    Main.PushSub(trail);
    return trail;
}

gAtl.Frame().PushEvent(CEvent.eType.Update, new CEvent((_dt: number) => {
    const input = gAtl.Frame().Input();
    if (input.KeyDown(CInput.eKey.Space, true))
        ArcTrail180(new CVec3(0, 550, 0), new CVec3(0, 0, 1), 0, 100);
    if (input.KeyDown(CInput.eKey.F, true))
        ThrustTest(new CVec3(0, 550, 0), new CVec3(0, 0, 1), 100);
}));









