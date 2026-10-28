import "../../../Artgine/artgine/artgine.js";
import { CPreferences } from "../../../Artgine/artgine/basic/CPreferences.js";
var gPF = new CPreferences();
gPF.mTargetWidth = 0;
gPF.mTargetHeight = 0;
gPF.mRenderer = "GL";
gPF.m32fDepth = false;
gPF.mTexture16f = false;
gPF.mAnti = false;
gPF.mBatchPool = true;
gPF.mXR = false;
gPF.mDeveloper = true;
gPF.mIAuto = true;
gPF.mCanvas = "";
gPF.mServer = 'webServer';
gPF.mGitHub = false;
gPF.mVersion = "mttmpcyy_36";
import { CAtelier } from "../../../Artgine/artgine/app/CAtelier.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init(['Main.json'], "");
var Main = gAtl.Canvas('Main.json');
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CMath } from "../../../Artgine/artgine/geometry/CMath.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CBound } from "../../../Artgine/artgine/geometry/CBound.js";
import { CCamCon3DThirdPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D, CPaintCube } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CDayCycle, CLightPlanet } from "../../../Artgine/artgine/app/component/CLightPlanet.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CAnimation, CClipMesh } from "../../../Artgine/artgine/app/component/CAnimation.js";
import { CAniFlow } from "../../../Artgine/artgine/app/component/CAniFlow.js";
import { CPad } from "../../../Artgine/artgine/app/subject/CPad.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CDensityInfo, CLOD, CDensityMap, CDensityColliderInfo } from "../../../Artgine/artgine/app/subject/CDensityMap.js";
Main.Find("Ground").Destroy();
let densityMap = new CDensityMap(true);
densityMap.mDiv = 16;
densityMap.mBuf.Reset(new CVec3(32, 32, 1), 100, 0xFFFFFFFF);
let info = densityMap.PushDensityInfo(new CDensityInfo(0xFFFFFFFF, new CVec3(100, 100, 100), [new CLOD("Res/ModularVillage/Cobblestone_Dirt_Transition_1.obj", 1, 0, 0, [CPaint.eTag.Shadow, CPaint.eTag.Light])]));
info.mCollider.push(new CDensityColliderInfo("ground"));
Main.PushSub(densityMap);
let cubeSub = Main.PushSub(new CSubject());
cubeSub.SetKey("Sky");
cubeSub.SetSca(new CVec3(10, 10, 10));
let ptcube = cubeSub.PushComp(new CPaintCube(""));
ptcube.Sky(true, false, true, false, false);
gAtl.Brush().GetCam3D().Init(new CVec3(1580, 670, 1980), new CVec3(830, 300, 1220));
Main.Find("Light").Destroy();
let sl = Main.PushSub(new CSubject());
sl.SetKey("Light");
let lp = sl.PushComp(new CLightPlanet());
lp.mCascadeDivide = [500, 350, 450, 600, 900, 5200];
lp.SetShadow3D("shadow", 0, 0, 0, 0, 0, 0);
lp.SetShadowDistance(8000);
gAtl.Brush().EnsureDefaultRP();
gAtl.Brush().FindAutoRP("ShadowRead_3D").mShaderAttr.push(new CShaderAttr("bias", new CVec1(4)));
sl.SetPos(new CVec3(0.3, 1, 0));
lp.Push(new CDayCycle(new CVec3(0, 1, 0), new CColor(1, 1, 1)));
lp.Push(new CDayCycle(new CVec3(2, 0.5, 0), new CColor(1, 0.8, 0.8)));
lp.Push(new CDayCycle(new CVec3(-2, 0.5, 0), new CColor(1, 0.8, 0.8)));
lp.Push(new CDayCycle(new CVec3(-1, 0, 0), new CColor(1, 0.5, 0.5)));
lp.Push(new CDayCycle(new CVec3(1, 0, 0), new CColor(1, 0.5, 0.5)));
lp.Push(new CDayCycle(new CVec3(0, -1, 0), new CColor(0, 0, 0)));
let chsub = Main.PushSub(new CSubject());
chsub.SetKey("User");
let ptRes = "Res/blocky/blocky.FBX";
let aniRes = "Res/blocky/blocky.FBX";
let pt3 = new CPaint3D(ptRes);
pt3.mAutoLoad.mCenterPos = true;
pt3.mAutoLoad.mTargetScale = 100;
chsub.PushComp(pt3);
pt3.PushTag(CPaint.eTag.Light);
pt3.PushTag(CPaint.eTag.Shadow);
chsub.SetPos(new CVec3(590, 600, 892));
let bound = new CBound();
bound.InitBound(50);
bound.SetType(CBound.eType.Sphere);
let cl = chsub.PushComp(new CCollider(bound));
cl.SetLayer("user");
cl.PushCollisionLayer("ground");
cl.SetPushRate(1);
let rb = chsub.PushComp(new CRigidBody());
rb.SetGravity(1);
let aniStand = new CAnimation();
let cm = aniStand.Push(new CClipMesh(0, 1, 2500, 4500, aniRes));
cm.mBake = true;
let aniWalk = new CAnimation();
cm = aniWalk.Push(new CClipMesh(0, 1.5, 0, 2000, aniRes));
cm.mBake = true;
let af = chsub.PushComp(new CAniFlow(aniWalk));
let camCon = new CCamCon3DThirdPerson(gAtl.Frame().Input());
gAtl.Brush().GetCam3D().SetCamCon(camCon);
let can2d = gAtl.NewCanvas("2D");
can2d.SetCameraKey("2D");
let pad = can2d.PushSub(new CPad());
chsub.Update = (_update) => {
    camCon.SetPos(chsub.GetPos());
    if (pad.IsOn())
        camCon.SetPause(true);
    else
        camCon.SetPause(false);
    let dir = pad.GetDir();
    rb.Remove("move");
    let angle = CMath.V3SignedAngle(new CVec3(0, 0, 1), gAtl.Brush().GetCam3D().GetFront(), new CVec3(0, 1, 0));
    if (dir.IsZero() == false) {
        var vArr = new Array();
        vArr.push(CVec3.Up());
        vArr.push(CVec3.Down());
        vArr.push(CVec3.Left());
        vArr.push(CVec3.Right());
        var maxd = -1;
        var maxI = 0;
        for (var i = 0; i < vArr.length; ++i) {
            var dVal = CMath.V3Dot(vArr[i], dir);
            if (maxd < dVal) {
                maxd = dVal;
                maxI = i;
            }
        }
        switch (maxI) {
            case 0:
                rb.Push(new CForce("move", CMath.V3MulFloat(gAtl.Brush().GetCam3D().GetFront(), 1), 300));
                break;
            case 1:
                rb.Push(new CForce("move", CMath.V3MulFloat(gAtl.Brush().GetCam3D().GetFront(), -1), 300));
                angle = 3.14 + angle;
                break;
            case 2:
                rb.Push(new CForce("move", CMath.V3MulFloat(gAtl.Brush().GetCam3D().GetCross(), 1), 300));
                angle = 3.14 / 2 + angle;
                break;
            case 3:
                rb.Push(new CForce("move", CMath.V3MulFloat(gAtl.Brush().GetCam3D().GetCross(), -1), 300));
                angle = -(3.14 / 2) + angle;
                break;
        }
        chsub.SetRot(new CVec3(0, angle, 0));
        if (af.GetAni() != aniWalk)
            af.SetAni(aniWalk);
    }
    else {
        if (af.GetAni() != aniStand)
            af.SetAni(aniStand);
    }
    if (pad.GetButtonEvent(0) == CEvent.eType.Click) {
        var jump = new CForce("jump");
        jump.SetDirVel(new CVec3(0, 1), 500, new CVec3(0, 1), 200);
        jump.SetDelay(0.5);
        jump.mRemove = true;
        rb.Push(jump);
    }
};
