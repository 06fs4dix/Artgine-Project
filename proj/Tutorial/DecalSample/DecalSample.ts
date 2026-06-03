//Version
const version='mp25fgx1_39';
import "../../../Artgine/artgine/artgine.js"

//Class
import {CClass} from "../../../Artgine/artgine/basic/CClass.js";

//Atelier
import {CPreferences} from "../../../Artgine/artgine/basic/CPreferences.js";
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

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint

import {CObject} from "../../../Artgine/artgine/basic/CObject.js"
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CCamCon3DFirstPerson, CCamCon3DThirdPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CPaint3DDecalMesh } from "../../../Artgine/plugin/DecalMesh/DecalMesh.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CRay } from "../../../Artgine/artgine/geometry/CRay.js";
import { CMath } from "../../../Artgine/artgine/geometry/CMath.js";
import { CAlert } from "../../../Artgine/artgine/basic/CAlert.js";
let Main=gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");

let camcon=new CCamCon3DFirstPerson(gAtl.Frame().Input());
gAtl.Brush().GetCam3D().SetCamCon(camcon);
// camcon.SetPos(new CVec3(0,1000,0));

let back=Main.PushSub(new CSubject());
// back.SetRot(new CVec3(3.14 / 2, 0, 0));
let pt=back.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
//pt.SetTexture(gAtl.Frame().Pal().GetNoneTex());
pt.SetTexture("cat2.jpg");
//pt.SetColorModel(new CColor(1,1,1,CColor.eModel.RGBAdd));
back.SetSca(new CVec3(10,10,10));



let ray : CRay;
let scroll = 0;
let VS = true;
function UpdateRay() {
    const mouse=gAtl.Frame().Input().Mouse();
    ray=gAtl.Brush().GetCam3D().GetRay(mouse.x,mouse.y);
    new CCollider(pt.GetBoundFMat()).PickChk(ray);
}
function DrawDecal() {
    if(VS) {
        pt.ResetDecal(gAtl.Frame().Pal().GetNoneTex(), ray.GetPosition(), new CVec3(250,250,1000), new CVec3(0, -1, 0), scroll);
    }
    else {
        pt.ResetDecal(gAtl.Frame().Pal().GetNoneTex(), ray.GetPosition(), new CVec3(250,250,1000), ray.GetDirect(), scroll);
    }
}
gAtl.Frame().PushEvent(CEvent.eType.Update,()=>{
    if(gAtl.Frame().Input().KeyDown(CInput.eKey.L, true)) {
        VS = !VS;
    }
    if(gAtl.Frame().Input().KeyUp(CInput.eKey.Wheel)) {
        scroll += gAtl.Frame().Input().Wheel() * 0.05 / (Math.PI * 2);
        DrawDecal();
    }
    if(gAtl.Frame().Input().KeyDown(CInput.eKey.F))
    {
        UpdateRay();
        DrawDecal();
    }
    if(gAtl.Frame().Input().KeyUp(CInput.eKey.G))
    {
        UpdateRay();
        let sub=Main.PushSub(new CSubject());
        sub.PushComp(new CPaint3DDecalMesh([gAtl.Frame().Pal().GetNoneTex()],pt.GetBound().mPos.Array(),pt.GetFMat(),ray.GetPosition(),new CVec3(250,250,1000)));
    }
});



CAlert.Info("F/G Decal Create!")


























































