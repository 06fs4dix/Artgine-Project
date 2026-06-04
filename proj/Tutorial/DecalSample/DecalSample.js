const version = 'mp25fgx1_39';
import "https://06fs4dix.github.io/Artgine/artgine/artgine.js";
import { CPreferences } from "https://06fs4dix.github.io/Artgine/artgine/basic/CPreferences.js";
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
gPF.mWASM = false;
gPF.mServer = 'local';
gPF.mGitHub = false;
import { CAtelier } from "https://06fs4dix.github.io/Artgine/artgine/app/CAtelier.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([], "");
import { CSubject } from "https://06fs4dix.github.io/Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "https://06fs4dix.github.io/Artgine/artgine/app/component/paint/CPaint3D.js";
import { CVec3 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec3.js";
import { CCamCon3DFirstPerson } from "https://06fs4dix.github.io/Artgine/artgine/util/CCamCon.js";
import { CEvent } from "https://06fs4dix.github.io/Artgine/artgine/basic/CEvent.js";
import { CInput } from "https://06fs4dix.github.io/Artgine/artgine/system/CInput.js";
import { CPaint3DDecalMesh } from "../../../Artgine/plugin/DecalMesh/DecalMesh.js";
import { CCollider } from "https://06fs4dix.github.io/Artgine/artgine/app/component/CCollider.js";
import { CAlert } from "https://06fs4dix.github.io/Artgine/artgine/basic/CAlert.js";
let Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
let camcon = new CCamCon3DFirstPerson(gAtl.Frame().Input());
gAtl.Brush().GetCam3D().SetCamCon(camcon);
let back = Main.PushSub(new CSubject());
let pt = back.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
pt.SetTexture("cat2.jpg");
back.SetSca(new CVec3(10, 10, 10));
let ray;
let scroll = 0;
let VS = true;
function UpdateRay() {
    const mouse = gAtl.Frame().Input().Mouse();
    ray = gAtl.Brush().GetCam3D().GetRay(mouse.x, mouse.y);
    new CCollider(pt.GetBoundFMat()).PickChk(ray);
}
function DrawDecal() {
    if (VS) {
        pt.ResetDecal(gAtl.Frame().Pal().GetNoneTex(), ray.GetPosition(), new CVec3(250, 250, 1000), new CVec3(0, -1, 0), scroll);
    }
    else {
        pt.ResetDecal(gAtl.Frame().Pal().GetNoneTex(), ray.GetPosition(), new CVec3(250, 250, 1000), ray.GetDirect(), scroll);
    }
}
gAtl.Frame().PushEvent(CEvent.eType.Update, () => {
    if (gAtl.Frame().Input().KeyDown(CInput.eKey.L, true)) {
        VS = !VS;
    }
    if (gAtl.Frame().Input().KeyUp(CInput.eKey.Wheel)) {
        scroll += gAtl.Frame().Input().Wheel() * 0.05 / (Math.PI * 2);
        DrawDecal();
    }
    if (gAtl.Frame().Input().KeyDown(CInput.eKey.F)) {
        UpdateRay();
        DrawDecal();
    }
    if (gAtl.Frame().Input().KeyUp(CInput.eKey.G)) {
        UpdateRay();
        let sub = Main.PushSub(new CSubject());
        sub.PushComp(new CPaint3DDecalMesh([gAtl.Frame().Pal().GetNoneTex()], pt.GetBound().mPos.Array(), pt.GetFMat(), ray.GetPosition(), new CVec3(250, 250, 1000)));
    }
});
CAlert.Info("F/G Decal Create!");
