//Version
import "../../../Artgine/artgine/artgine.js"

//Class
import {CClass} from "../../../Artgine/artgine/basic/CClass.js";
import { CNPC } from "./CNPC.js";
CClass.Push(CNPC);
import { CUser } from "./CUser.js";
CClass.Push(CUser);
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
gPF.mVersion = "mq9kph7i_5";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
CPlugin.PushPath('Inventory','../../../Artgine/plugin/Inventory/');
import "../../../Artgine/plugin/Inventory/Inventory.js"
CPlugin.PushPath('ShadowPlane','../../../Artgine/plugin/ShadowPlane/');
import "../../../Artgine/plugin/ShadowPlane/ShadowPlane.js"
CPlugin.PushPath('Water','../../../Artgine/plugin/Water/');
import "../../../Artgine/plugin/Water/Water.js"
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init(['Main.json','Real.json'],"");
var Main = gAtl.Canvas('Main.json');
var Real = gAtl.Canvas('Real.json');
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
let comcon=gAtl.Brush().GetCam2D().SetCamCon(new CCamCon2DFollow(gAtl.Frame().Input()));
gAtl.Brush().GetCam2D().Set2DZoom(1.5);
import {CObject} from "../../../Artgine/artgine/basic/CObject.js"

// === vinfo==3 위치에 랜덤 조형물 배치 (Village) ===

import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";

import { CBlackBoard } from "../../../Artgine/artgine/basic/CBlackBoard.js";

import { CBGAttachButton, CBlackboardModal, CLoadingBack, CMDViewer, CModalBackGround } from "../../../Artgine/artgine/util/CModalUtil.js";
import { CModal, CModalTitleBar } from "../../../Artgine/artgine/basic/CModal.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";

import { CTexture, CTextureInfo } from "../../../Artgine/artgine/render/CTexture.js";
import { CCamCon2DFollow } from "../../../Artgine/artgine/util/CCamCon.js";
import { CSysAuth } from "../../../Artgine/artgine/system/CSysAuth.js";
import { CAudioTag } from "../../../Artgine/artgine/system/audio/CAudio.js";
import { CDOM } from "../../../Artgine/artgine/basic/CDOM.js";

import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";

import { CConsol } from "../../../Artgine/artgine/basic/CConsol.js";
import { CSurfaceBloom } from "../../../Artgine/plugin/Bloom/Bloom.js";

import { CRenderPass } from "../../../Artgine/artgine/render/CRenderPass.js";
import { CShadowPlane } from "../../../Artgine/plugin/ShadowPlane/ShadowPlane.js";


import { SDF } from "../../../Artgine/artgine/z_file/SDF.js";
import { CSing, CSingOption } from "../../../Artgine/artgine/server/CSing.js";

import { CSocketIO } from "../../../Artgine/artgine/network/CSocketIO.js";
import { CStream } from "../../../Artgine/artgine/basic/CStream.js";
import { CAlert } from "../../../Artgine/artgine/basic/CAlert.js";
import { CCIndex } from "../../../Artgine/artgine/app/canvas/CCIndex.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CCanvasPluginRPMgr } from "../../../Artgine/artgine/app/canvas/CCanvasPluginRPMgr.js";
import { CRPAuto, CRPMgr } from "../../../Artgine/artgine/app/canvas/CRPMgr.js";
import { CCondition } from "../../../Artgine/artgine/util/CCondition.js";
import { CSurface } from "../../../Artgine/artgine/app/subject/CSurface.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
import { CUI, CUIPicture } from "../../../Artgine/artgine/app/subject/CUI.js";
import { CPad } from "../../../Artgine/artgine/app/subject/CPad.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CUniqueID } from "../../../Artgine/artgine/basic/CUniqueID.js";


import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { Bootstrap } from "../../../Artgine/artgine/basic/Bootstrap.js";

import { CHTMLDropdown } from "../../../Artgine/artgine/util/CHTMLBar.js";
import { CVoxelMap } from "../../../Artgine/artgine/app/subject/CVoxelMap.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CAtlas } from "../../../Artgine/artgine/util/CAtlas.js";
import { CDensityInfo2D, CDensityMap } from "../../../Artgine/artgine/app/subject/CDensityMap.js";
import { CBound } from "../../../Artgine/artgine/geometry/CBound.js";
import { CSampler, CSampList, CSampMinMax } from "../../../Artgine/artgine/util/CSampler.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CLoader, CLoaderOption } from "../../../Artgine/artgine/util/CLoader.js";


// //Real.Clear();

// let atlas=new CAtlas();
// await atlas.PushAutoCut("Res/Back/TilesetNature.png");
// atlas.SetKey("TilesetNatureAtlas");
// let TEX="TilesetNatureAtlas";
// gAtl.Frame().Res().Push(TEX,atlas);

// let densityMap=Real.PushSub(new CDensityMap());
// densityMap.mBuf.Reset(new CVec3(256,256,1),100);
// densityMap.mBuf.mBuffer.fill(0xffffffff)
// let info=densityMap.PushDensityInfo(new CDensityInfo2D(0xffffffff,new CVec3(500,500,0),TEX,new CSampList([atlas.GetTexel(0), atlas.GetTexel(1), atlas.GetTexel(2), atlas.GetTexel(3), atlas.GetTexel(4)])));
// info.mWind=10;
// info.mLabel="덤블";
// info.mYSort=true;
// info.mPaintTag.push(CPaint.eTag.Shadow);
// info.mPos = new CSampMinMax(new CVec3(-100, -100, 0), new CVec3(100, 100, 0));
// info.mSca = new CSampMinMax(new CVec3(0.4, 0.4, 0.4), new CVec3(0.5, 0.5, 0.5));

// === CDensityMap 방식: 복셀 색상별로 식생 배치 ===
{
    const backVoxel = Main.Find("BackGround") as CVoxelMap;
    if (backVoxel) {
        const densityMap = Real.PushSub(new CDensityMap());
        densityMap.mBuf = backVoxel.mBuf;
        densityMap.mDiv = 10;

        const tex = "Res/Back/TilesetNature.png";
        gAtl.Frame().Load().Exe(tex,new CLoaderOption().Set("mFilter",CTexture.eFilter.Neaest));
        // LTree (0x0000ff00)
        // LTree (0x0000ff00) — 셀 800, mSca로 렌더 크기 300 유지
        const ltree = densityMap.PushDensityInfo(new CDensityInfo2D(
            0x0000ff00, new CVec3(800, 800, 0), tex,
            new CSampler(new CVec4(0.12447916716337204, 0.14226190745830536, 0.12526041269302368, 0.000297616352327168))
        ));
        ltree.mYSort = true;
        ltree.mWind = 20;
        ltree.mSca = new CSampler(new CVec3(0.375, 0.375, 1));
        ltree.mPos = new CSampMinMax(new CVec3(-300, -300, 0), new CVec3(300, 300, 0));
        ltree.mColliderLayer = "object";
        ltree.mBound = new CBound(); ltree.mBound.SetType(CBound.eType.Box);
        ltree.mBound.mMin.Import(new CVec3(-50/300, -120/300, -0.5));
        ltree.mBound.mMax.Import(new CVec3( 50/300,  -50/300,  0.5));
        ltree.mPaintTag.push(CPaint.eTag.Shadow);

        // MTree (0x00001000) — 셀 600, mSca로 렌더 크기 100 유지
        const mtree = densityMap.PushDensityInfo(new CDensityInfo2D(
            0x00001000, new CVec3(600, 600, 0), tex,
            new CSampler(new CVec4(0.08020833134651184, 0.09166666865348816, 0.0002604166802484542, 0.9080356955528259))
        ));
        mtree.mYSort = true;
        mtree.mWind = 20;
        mtree.mSca = new CSampler(new CVec3(0.167, 0.167, 1));
        mtree.mPos = new CSampMinMax(new CVec3(-250, -250, 0), new CVec3(250, 250, 0));
        mtree.mColliderLayer = "object";
        mtree.mBound = new CBound(); mtree.mBound.SetType(CBound.eType.Box);
        mtree.mBound.mMin.Import(new CVec3(-50/100, -30/100, -0.5));
        mtree.mBound.mMax.Import(new CVec3( 50/100,   0/100,  0.5));
        mtree.mPaintTag.push(CPaint.eTag.Shadow);

        // Flower1 (0x00002000) — 셀 400, mSca로 렌더 크기 50 유지
        const flower1 = densityMap.PushDensityInfo(new CDensityInfo2D(
            0x00002000, new CVec3(400, 400, 0), tex,
            new CSampler(new CVec4(0.04114583507180214, 0.04702381044626236, 0.04192708432674408, 0.4288690388202667))
        ));
        flower1.mYSort = true;
        flower1.mWind = 50;
        flower1.mSca = new CSampler(new CVec3(0.125, 0.125, 1));
        flower1.mPos = new CSampMinMax(new CVec3(-150, -150, 0), new CVec3(150, 150, 0));
        flower1.mPaintTag.push(CPaint.eTag.Shadow);

        // Flower2 (0x00003000) — 셀 400, mSca로 렌더 크기 50 유지
        const flower2 = densityMap.PushDensityInfo(new CDensityInfo2D(
            0x00003000, new CVec3(400, 400, 0), tex,
            new CSampler(new CVec4(0.03593749925494194, 0.04404762014746666, 0.12786458432674408, 0.4288690388202667))
        ));
        flower2.mYSort = true;
        flower2.mWind = 50;
        flower2.mSca = new CSampler(new CVec3(0.125, 0.125, 1));
        flower2.mPos = new CSampMinMax(new CVec3(-150, -150, 0), new CVec3(150, 150, 0));
        flower2.mPaintTag.push(CPaint.eTag.Shadow);
    }
}
CModal.PushTitleBar(new CModalTitleBar("DevToolModal", "Unit", async () => {
    let ba: string[] = [];
  

    for (let [key, value] of CBlackBoard.Map()) {
        if (value instanceof CSubject) {
            ba.push(key);
        }
    }

    new CBlackboardModal(ba);
}));

Real.PushSub(new CNPC("Dante")).SetPos(new CVec3(6600,6400));
Real.PushSub(new CNPC("Miles")).SetPos(new CVec3(6200,9200));
Real.PushSub(new CNPC("Poppy")).SetPos(new CVec3(11000,8000));







let rpPlug=new CCanvasPluginRPMgr(null);
Real.PushPlugin(rpPlug);
let AM7RP=new CRPMgr();
let rp=AM7RP.PushRP(new CRPAuto());
rp.PushOr(new CCondition({"s":"class","v":"CPaint2D"}));
rp.PushOr(new CCondition({"s":"class","v":"CPaint2DMerge"}));
rp.PushAnd(new CCondition({"s":"mTag[shadowPlane]","v":0}));
//rp.PushInPaint(CPaint2D);
//rp.PushOutTag("shadowPlane");
rp.mShader=gAtl.Frame().Pal().Sl2DKey();
rp.mTag.add("light");


rp=AM7RP.PushRP(new CRPAuto());
rp.PushAnd(new CCondition({"s":"class","v":"CPaintVoxel"}));
rp.mShader=gAtl.Frame().Pal().SlVoxelKey();
rp.mTag.add("light");
//rpPlug.SetRPMgr(AM7RP);
//Real.SetRPMgr(AM7RP);

// let voxel=Main.Find("BackGround") as CVoxel;
// voxel.mLight=true;
// voxel.mUpdateRes=true;

let PM1RP=new CRPMgr();
rp=PM1RP.PushRP(new CRPAuto());
rp.PushOr(new CCondition({"s":"class","v":"CPaint2D"}));
rp.PushOr(new CCondition({"s":"class","v":"CPaint2DMerge"}));
rp.PushAnd(new CCondition({"s":"mTag[shadowPlane]","v":0}));

rp.mShader=gAtl.Frame().Pal().Sl2DKey();


rp=PM1RP.PushRP(new CRPAuto());
rp.PushAnd(new CCondition({"s":"class","v":"CPaintVoxel"}));
rp.mShader=gAtl.Frame().Pal().SlVoxelKey();

//Real.SetRPMgr(PM1RP);
rpPlug.SetRPMgr(PM1RP);


let PM11RP=new CRPMgr();


let emissiveTex=new CTexture();
emissiveTex.PushInfo([new CTextureInfo(CTexture.eTarget.Sigle,CTexture.eFormat.RGBA8,1)]);
let emissiveTexKey=PM11RP.PushTex("Bloom/emissiveTex.tex",emissiveTex);
rp=PM11RP.PushRP(new CRPAuto());
rp.PushAnd(new CCondition({"s":"class","v":"CPaint2D"}));
rp.PushAnd(new CCondition({"s":"mTag[bloom]"}));
rp.mShader=gAtl.Frame().Pal().Sl2DKey();
rp.mRenderTarget=emissiveTexKey;
rp.mTag.add("mask");



// let basiceTex=new CTexture();
// basiceTex.PushInfo([new CTextureInfo(CTexture.eTarget.Sigle,CTexture.eFormat.RGBA8,1)]);
// let basiceTexKey=PM11RP.PushTex("Bloom/basiceTex.tex",basiceTex);
rp=PM11RP.PushRP(new CRPAuto());
rp.PushOr(new CCondition({"s":"class","v":"CPaint2D"}));
rp.PushOr(new CCondition({"s":"class","v":"CPaint2DMerge"}));
rp.PushAnd(new CCondition({"s":"mTag[shadowPlane]","v":0}));
rp.mShader=gAtl.Frame().Pal().Sl2DKey();
rp.mTag.add("light");
// rp.mRenderTarget=basiceTexKey;


rp=PM11RP.PushRP(new CRPAuto());
rp.PushAnd(new CCondition({"s":"class","v":"CPaintVoxel"}));
rp.mShader=gAtl.Frame().Pal().SlVoxelKey();
rp.mTag.add("light");
// rp.mRenderTarget=basiceTexKey;


rp=PM11RP.PushRP(new CRPAuto());
rp.PushAnd(new CCondition({"s":"class","v":"CShadowPlane"}));
rp.PushAnd(new CCondition({"s":"mTag[shadowPlane]"}));
rp.mShader=gAtl.Frame().Pal().Sl2DKey();
// rp.mRenderTarget=basiceTexKey;



let sufBloom=PM11RP.PushSuf(new CSurfaceBloom()) as CSurfaceBloom;
let srp=sufBloom.GetRP();
srp.mShader=gAtl.Frame().Pal().Sl2DKey();
srp.mTag.add("blit");
srp.mShaderAttr.push(new CShaderAttr(0,emissiveTexKey));
sufBloom.OldSchool();
// sufBloom.m_intensity = 1000.0;//업샘플 합성의 기본 강도
sufBloom.m_threshold = 1.0;//이 값보다 어두운 픽셀은 블룸 입력에서 배제
sufBloom.m_softThreshold = 1.0;//임계 부근이 점진적으로 섞여 더 자연스러운 하이라이트 선택
// sufBloom.m_lowFrequencyBoost = 100.0;//값을 올리면 멀리 퍼져 보이는 느낌이 커짐.
// sufBloom.m_lowFrequencyBoostCurvation = 200.0;//멀리 퍼지는 긴 꼬리
// sufBloom.m_highPassFrequency = 1.0;//코드상 1.0이면 모든 mip 기여 허용, 값이 작아질수록 큰 mip(멀리 퍼지는 부분) 기여가 빠르게 줄어듭니다. 즉 멀리 퍼지게 하려면 1.0 유지가 유리
// sufBloom.Refresh();

let sufLast=PM11RP.PushSuf(new CSurface());
srp=sufLast.GetRP();
// sufLast.SetUseRT(false);

srp.mRenderTarget = gAtl.Frame().Pal().GetDefaultFrameBuffer();
srp.mShader=gAtl.Frame().Pal().SlPostKey();
srp.mTag.add("blend");
// srp.mShaderAttr.push(new CShaderAttr(0,basiceTexKey));
srp.mShaderAttr.push(new CShaderAttr(0,gAtl.Frame().Pal().GetMainFrameTex()));
srp.mShaderAttr.push(new CShaderAttr(1,sufBloom.GetTexKey()));
srp.mShaderAttr.push(new CShaderAttr("TexOffBlendFactor",new CMat([1,1,CRenderPass.eBlend.LinearDodge])));

//srp.mShaderAttr.push(new CShaderAttr("blend", 1, CRenderPass.eBlend.LinearDodge));
//srp.mShaderAttr.push(new CShaderAttr("opacity",1,1));







function AM7()
{
    //Real.SetRPMgr(AM7RP);
    rpPlug.SetRPMgr(AM7RP);
    let Direct=Main.Find("Direct");
    let PointList=Main.Find("PointList");

    let dirLight=Direct.FindComp(CLight);
    //dirLight.SetColor(new CVec3(1,0.8,0.8));
    Direct.SetPos(new CVec3(1,1,0));

    PointList.SetEnable(false);
    // let ptLights=PointList.FindComps(CLight,true);
    // for(let pt of ptLights)
    // {
    //     pt.SetColor(new CVec3());
    // }
    

}
window["AM7"]=AM7;


function PM1()
{
    //Real.SetRPMgr(PM1RP);
    rpPlug.SetRPMgr(PM1RP);
    //Real.SetRPMgr(lightAM7RP);
    let Direct=Main.Find("Direct");
    let PointList=Main.Find("PointList");

    let dirLight=Direct.FindComp(CLight);
    //dirLight.SetColor(new CVec3(1,1,1));
    Direct.SetPos(new CVec3(0,1,0));

    PointList.SetEnable(false);
    // let ptLights=PointList.FindComps(CLight,true);
    // for(let pt of ptLights)
    // {
    //     //pt.SetEnable(false);
    //     pt.SetColor(new CVec3());
    // }
    

}
window["PM1"]=PM1;



function PM11()
{
    //Real.SetRPMgr(PM11RP);
    rpPlug.SetRPMgr(PM11RP);
    let Direct=Main.Find("Direct");
    let PointList=Main.Find("PointList");

    // let dirLight=Direct.FindComp(CLight);
    // //dirLight.SetColor(new CVec3());
    Direct.SetPos(new CVec3(1,0,0));

    PointList.SetEnable(true);
    
}
window["PM11"]=PM11;



PM1();

let audioEnable= await CSysAuth.Confirm(true);
if(audioEnable)
{
    let audio=new CAudioTag("Res/sound/TownTheme.mp3");
    audio.Volume(0.5);
    audio.Play();
}
    


//Real.Clear();
new CMDViewer("README.md");

// Main.Find("Direct").Destroy();

// let ls=Main.PushSub(new CSubject());
// ls.SetKey("Direct");
// let lp=ls.PushComp(new CLightPlanet())
// lp.Push(new CDayCycle(new CVec3(0,1),new CColor(1,1,1)));
// lp.Push(new CDayCycle(new CVec3(1,1),new CColor(1,0.5,0.5)));
// lp.Push(new CDayCycle(new CVec3(-1,1),new CColor(1,0.5,0.5)));
// lp.Push(new CDayCycle(new CVec3(1,0),new CColor(0,0,0)));
// lp.Push(new CDayCycle(new CVec3(-1,0),new CColor(0,0,0)));



//이 부분은 미니맵 샘플이다! 지우지마!!!!!!!!!!!!!!!!!!
//let miniMapTex=gAtl.Frame().Ren().BuildRenderTarget([new CTextureInfo(CTexture.eTarget.Sigle,CTexture.eFormat.RGBA8)],new CVec2(512,512));


// rp=PM1RP.PushRP(new CRPAuto());
// rp.PushAnd(new CCondition({"s":"class","v":"CPaintVoxel"}));
// rp.mShader=gAtl.Frame().Pal().SlVoxelKey();
// rp.mRenderTarget=miniMapTex;
// //Real.SetRPMgr(PM1RP);
// rpPlug.SetRPMgr(PM1RP);


// let uipic=Main.PushSub(new CUIPicture());
// uipic.Init(miniMapTex);
// uipic.SetSize(128,128);
// uipic.SetAnchorX(CUI.eAnchor.Min,10);
// uipic.SetAnchorY(CUI.eAnchor.Max,10);
// uipic.GetPt().SetVFX(0,[25,50,0],SDF.eColorVFX.Scanline)








    let user=Real.PushSub(new CUser());
    user.SetPos(new CVec3(5200,6500));
    user.PushChild(new CPad()).mSave=false;


    // let item=Real.PushSub(new CSubjectInven(new CInventory("test0")));
    // item.SetPos(new CVec3(5200,6500));
    // let pt=user.FindComp(CPaint);
    // let durl=pt.CaptureTextureToDataURL();
    // CAlert.Info(`<img src='${durl}' />`);






let mg=new CModalBackGround("barRoot");
let arr: CHTMLDropdown[] = [];
arr.push(new CHTMLDropdown("root", "OptionBar", "Option", Bootstrap.eColor.warning));


arr.push(new CHTMLDropdown("OptionBar", "OptionAM7", `<div onclick="AM7()">AM7</div>`, Bootstrap.eColor.light));
arr.push(new CHTMLDropdown("OptionBar", "OptionPM1", `<div onclick="PM1()">PM1</div>`, Bootstrap.eColor.light));
arr.push(new CHTMLDropdown("OptionBar", "OptionPM11", `<div onclick="PM11()">PM11</div>`, Bootstrap.eColor.light));


const dummy = CHTMLDropdown.Attach(arr, "left");
let rightDiv=CDOM.DataToDom(`<div class="position-fixed top-0 end-0" style="z-index:2000;"></div>`);
rightDiv.append(dummy);
mg.SetBody(rightDiv);








































































































































































































































