//Version
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
gPF.mWASM = false;
gPF.mCanvas = "";
gPF.mServer = 'local';
gPF.mGitHub = false;
gPF.mVersion = "mpuhzq22_60";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
import {CObject} from "../../../Artgine/artgine/basic/CObject.js"
import {  CFileViewer } from "../../../Artgine/artgine/util/CModalUtil.js";
import { CCamCon3DThirdPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CRenderPass } from "../../../Artgine/artgine/render/CRenderPass.js";
import { CWASM } from "../../../Artgine/artgine/basic/CWASM.js";
import { CConsol } from "../../../Artgine/artgine/basic/CConsol.js";
let Main=gAtl.NewCanvas("Main");
let camCon=new CCamCon3DThirdPerson(gAtl.Frame().Input());
gAtl.Brush().GetCam3D().SetCamCon(camCon);
gAtl.Brush().GetCam3D().EyeMoveAndViewCac(new CVec3());

let editer=new CFileViewer(["TestShader.ts","ShaderEditer.json","ShaderEditer.html","ShaderEditer.js","ShaderEditer.ts"],async (_file,_source)=>{

    if(_file!="TestShader.ts")  return;

    let shaMgr=gAtl.Frame().Ren().SInter().New();
    await shaMgr.Exe("TestShader.ts",_source)
    let sl=shaMgr.GetShaderList();
    gAtl.Frame().Res().Remove("TestShader.ts");
    gAtl.Frame().Res().Push("TestShader.ts",sl);

    for(var each01 of sl.mShader)
    {
        gAtl.Frame().Res().Remove(each01.mKey);
        gAtl.Frame().Res().Push(each01.mKey,each01);
    }
    Init();

});
//editer.SetSize(1024,768);
editer.Open();

await gAtl.Frame().Load().Exe("TestShader.ts");

function Init()
{
    Main.Clear();
    Main.ClearBatch();
    gAtl.Brush().ClearRen();
    Main.SetCameraKey("3D");
    
    let sub=Main.PushSub(new CSubject());
    let pt=sub.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
    pt.SetTexture(gAtl.Frame().Pal().GetNoneTex());
    let rp=new CRenderPass("TestShader.ts");
    pt.PushRenderPass(rp);
    //pt.SetColorModel(new CColor(1,1,1,CColor.eModel.RGBAdd));
}
Init();


CConsol.Log(CWASM.Checker(10000));



