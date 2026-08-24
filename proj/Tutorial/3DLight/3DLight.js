import "../../../Artgine/artgine/artgine.js";
import { CPreferences } from "../../../Artgine/artgine/basic/CPreferences.js";
var gPF = new CPreferences();
gPF.mTargetWidth = 0;
gPF.mTargetHeight = 0;
gPF.mRenderer = "GL";
gPF.m32fDepth = true;
gPF.mTexture16f = false;
gPF.mAnti = true;
gPF.mBatchPool = true;
gPF.mXR = false;
gPF.mDeveloper = true;
gPF.mIAuto = true;
gPF.mCanvas = "";
gPF.mServer = 'local';
gPF.mGitHub = false;
gPF.mVersion = "mt77xoq9_7";
import { CAtelier } from "../../../Artgine/artgine/app/CAtelier.js";
import { CPlugin } from "../../../Artgine/artgine/util/CPlugin.js";
CPlugin.PushPath('Water', '../../../Artgine/plugin/Water/');
import "../../../Artgine/plugin/Water/Water.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init(['Main.json'], "");
var Main = gAtl.Canvas('Main.json');
import { CCamCon3DThirdPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CTexture, CTextureInfo } from "../../../Artgine/artgine/render/CTexture.js";
import { CRenderPass } from "../../../Artgine/artgine/render/CRenderPass.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CModal, CModalTitleBar } from "../../../Artgine/artgine/basic/CModal.js";
import { SDF } from "../../../Artgine/artgine/z_file/SDF.js";
import { CBGAttachButton, CMDViewer, CModalFrameView } from "../../../Artgine/artgine/util/CModalUtil.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";
import { CUtilWeb } from "../../../Artgine/artgine/util/CUtilWeb.js";
import { CLoaderOption } from "../../../Artgine/artgine/util/CLoader.js";
import { CRPAuto, CRPMgr } from "../../../Artgine/artgine/app/canvas/CRPMgr.js";
import { CSurface } from "../../../Artgine/artgine/app/subject/CSurface.js";
import { CCanvasPluginRPMgr } from "../../../Artgine/artgine/app/canvas/CCanvasPluginRPMgr.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D, CPaintCube } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CCondition } from "../../../Artgine/artgine/util/CCondition.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CComponent } from "../../../Artgine/artgine/app/component/CComponent.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
const opt = new CLoaderOption();
opt.mFilter = CTexture.eFilter.Linear;
opt.mWrap = CTexture.eWrap.Repeat;
await gAtl.Frame().Load().Exe("Res/teapot/1zflt0j.jpg", opt);
await gAtl.Frame().Load().Exe("Res/teapot/1zflt0j_NRM.jpg", opt);
await gAtl.Frame().Load().Exe("Res/teapot/1zflt0j_lig.jpg", opt);
const skyLowTexBufList = [];
const skyTexKey = ["Res/skybox/right.jpg", "Res/skybox/left.jpg", "Res/skybox/bottom.jpg", "Res/skybox/top.jpg", "Res/skybox/front.jpg", "Res/skybox/back.jpg"];
const skyTexList = [];
await gAtl.Frame().Load().Exe(skyTexKey);
for (let i = 0; i < skyTexKey.length; ++i) {
    skyTexList.push(gAtl.Frame().Res().Find(skyTexKey[i]));
    skyLowTexBufList.push(skyTexList[i].GetBuf()[0]);
}
const cubeTexKey = gAtl.Frame().Ren().BuildCubeMap(skyTexList, true, "cube.tex");
const envTexKey = "env.tex";
const envTex = new CTexture();
envTex.SetSize(128, 128);
envTex.PushInfo([new CTextureInfo(CTexture.eTarget.Cube, CTexture.eFormat.RGBA8)]);
envTex.GetBuf().push(...skyLowTexBufList);
envTex.SetMipMap(CTexture.eMipmap.EnvFilter);
envTex.SetFilter(CTexture.eFilter.Linear);
gAtl.Frame().Ren().BuildTexture(envTex);
gAtl.Frame().Res().Push(envTexKey, envTex);
let PCF = new CVec1(1.0);
let bias = new CVec1(10);
let normalBias = new CVec1(0.3);
let shadowRate = new CVec1(0.0);
let shadowDistance = 0.4;
const shadowShaderAttrs = [
    new CShaderAttr("PCF", PCF),
    new CShaderAttr("bias", bias),
    new CShaderAttr("normalBias", normalBias),
    new CShaderAttr("shadowRate", shadowRate),
];
let rp;
let srp;
const DeferredSingle = new CRPMgr();
const gBufPosTex = new CTexture();
gBufPosTex.PushInfo([new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA32F, 1)]);
const gBufPosTexKey = DeferredSingle.PushTex("gBufPos.tex", gBufPosTex);
rp = DeferredSingle.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mPriority = CRenderPass.ePriority.Normal;
rp.mShaderAttr.push(new CShaderAttr("outputType", SDF.eGBuf.Position));
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
rp.mTag.add("gBuf");
rp.mAlpha = false;
rp.mRenderTarget = gBufPosTexKey;
const gBufNorTex = new CTexture();
gBufNorTex.PushInfo([new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA8, 1)]);
const gBufNorTexKey = DeferredSingle.PushTex("gBufNor.tex", gBufNorTex);
rp = DeferredSingle.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mPriority = CRenderPass.ePriority.Normal;
rp.mShaderAttr.push(new CShaderAttr("outputType", SDF.eGBuf.Normal));
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
rp.mTag.add("gBuf");
rp.mAlpha = false;
rp.mRenderTarget = gBufNorTexKey;
const gBufAlbTex = new CTexture();
gBufNorTex.PushInfo([new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA8, 1)]);
const gBufAlbTexKey = DeferredSingle.PushTex("gBufAlb.tex", gBufAlbTex);
rp = DeferredSingle.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mPriority = CRenderPass.ePriority.Normal;
rp.mShaderAttr.push(new CShaderAttr("outputType", SDF.eGBuf.Albedo));
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
rp.mTag.add("gBuf");
rp.mAlpha = false;
rp.mRenderTarget = gBufAlbTexKey;
const gBufSPETex = new CTexture();
gBufNorTex.PushInfo([new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA8, 1)]);
const gBufSPE = DeferredSingle.PushTex("gBufSPE.tex", gBufSPETex);
rp = DeferredSingle.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mPriority = CRenderPass.ePriority.Normal;
rp.mShaderAttr.push(new CShaderAttr("outputType", SDF.eGBuf.SpeculerPowEmissive));
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
rp.mTag.add("gBuf");
rp.mAlpha = false;
rp.mRenderTarget = gBufSPE;
let ShadowReadTexKey = DeferredSingle.PushTex(gAtl.Frame().Pal().GetShadowReadTex(), new CTexture());
rp = DeferredSingle.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mPriority = CRenderPass.ePriority.BackGround;
rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.ArrShadowWrite, gAtl.Frame().Pal().GetShadowWriteTex()));
for (const attr of shadowShaderAttrs) {
    rp.mShaderAttr.push(attr);
}
rp.mAlpha = false;
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
rp.mRenderTarget = ShadowReadTexKey;
rp.mTag.add("shadowRead");
let sufLig0 = DeferredSingle.PushSuf(new CSurface());
srp = sufLig0.GetRP();
srp.mShader = gAtl.Frame().Pal().SlPostKey();
srp.mTag.add("light");
srp.mTag.add("shadow");
srp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.SingleShadowRead, gAtl.Frame().Pal().GetShadowReadTex()));
srp.mShaderAttr.push(new CShaderAttr("shadowOn", new CVec1(1)));
srp.mShaderAttr.push(new CShaderAttr(0, gBufAlbTexKey));
srp.mShaderAttr.push(new CShaderAttr(1, gBufPosTexKey));
srp.mShaderAttr.push(new CShaderAttr(2, gBufNorTexKey));
srp.mShaderAttr.push(new CShaderAttr(3, gBufSPE));
srp.mShaderAttr.push(new CShaderAttr("renType", 0));
let sufLig1 = DeferredSingle.PushSuf(new CSurface());
srp = sufLig1.GetRP();
srp.mShader = gAtl.Frame().Pal().SlPostKey();
srp.mTag.add("light");
srp.mTag.add("shadow");
srp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.SingleShadowRead, gAtl.Frame().Pal().GetShadowReadTex()));
srp.mShaderAttr.push(new CShaderAttr("shadowOn", new CVec1(1)));
srp.mShaderAttr.push(new CShaderAttr(0, gBufAlbTexKey));
srp.mShaderAttr.push(new CShaderAttr(1, gBufPosTexKey));
srp.mShaderAttr.push(new CShaderAttr(2, gBufNorTexKey));
srp.mShaderAttr.push(new CShaderAttr(3, gBufSPE));
srp.mShaderAttr.push(new CShaderAttr("renType", 1));
rp = DeferredSingle.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaintCube"));
rp.mPriority = CRenderPass.ePriority.Surface;
rp.mShader = gAtl.Frame().Pal().SlCubeKey();
rp.mCullFace = CRenderPass.eCull.None;
rp.mCullFrustum = false;
rp.mRenderTarget = DeferredSingle.PushTex("skyboxTex.tex", new CTexture());
rp.mBlitRead = gBufPosTexKey;
rp.mBlitType = 1;
let sufLast = DeferredSingle.PushSuf(new CSurface());
sufLast.SetUseRT(false);
srp = sufLast.GetRP();
srp.mShader = gAtl.Frame().Pal().SlPostKey();
srp.mTag.add("blend");
srp.mAlpha = false;
srp.mShaderAttr.push(new CShaderAttr(0, sufLig0.GetTexKey()));
srp.mShaderAttr.push(new CShaderAttr(1, sufLig1.GetTexKey()));
srp.mShaderAttr.push(new CShaderAttr(2, rp.mRenderTarget));
srp.mShaderAttr.push(new CShaderAttr("BlendColor0", new CVec4(SDF.eBlend.Texture, 0)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor1", new CVec4(SDF.eBlend.Texture, 1)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor2", new CVec4(SDF.eBlend.Texture, 2)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor3", new CVec4(SDF.eBlend.LinearDodge, 0, 1, 1)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor4", new CVec4(SDF.eBlend.Tonemap, 3, 1, SDF.eTonemap.Neutral)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor5", new CVec4(SDF.eBlend.GammaCorrect, 4)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor6", new CVec4(SDF.eBlend.LinearDodge, 5, 2, 1)));
const DeferredMulti = new CRPMgr();
const gBufMultiTex = new CTexture();
gBufMultiTex.PushInfo([
    new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA8, 1),
    new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA32F, 1),
    new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA8, 1),
    new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA8, 1)
]);
const gBufMultiTexKey = DeferredMulti.PushTex("gBufMulti.tex", gBufMultiTex);
rp = DeferredMulti.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mPriority = CRenderPass.ePriority.Normal;
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
rp.mRenderTarget = gBufMultiTexKey;
rp.mAlpha = false;
rp.mTag.add("gBuf");
ShadowReadTexKey = DeferredMulti.PushTex(gAtl.Frame().Pal().GetShadowReadTex(), new CTexture());
rp = DeferredMulti.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mPriority = CRenderPass.ePriority.BackGround;
rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.ArrShadowWrite, gAtl.Frame().Pal().GetShadowWriteTex()));
for (const attr of shadowShaderAttrs) {
    rp.mShaderAttr.push(attr);
}
rp.mAlpha = false;
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
rp.mRenderTarget = ShadowReadTexKey;
rp.mTag.add("shadowRead");
sufLig0 = DeferredMulti.PushSuf(new CSurface());
sufLig0.NewRT([
    new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA32F, 1),
    new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA32F, 1),
    new CTextureInfo(CTexture.eTarget.Sigle, CTexture.eFormat.RGBA32F, 1)
]);
srp = sufLig0.GetRP();
srp.mShader = gAtl.Frame().Pal().SlPostKey();
srp.mTag.add("light").add("shadow");
srp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.SingleShadowRead, gAtl.Frame().Pal().GetShadowReadTex()));
srp.mShaderAttr.push(new CShaderAttr("shadowOn", new CVec1(1)));
srp.mShaderAttr.push(new CShaderAttr(0, gBufMultiTexKey));
srp.mShaderAttr.push(new CShaderAttr(0, envTexKey));
srp.mShaderAttr.push(new CShaderAttr("ligStep0", SDF.eLightStep0.Lambert));
srp.mShaderAttr.push(new CShaderAttr("ligStep1", SDF.eLightStep1.CookTorrance));
srp.mShaderAttr.push(new CShaderAttr("envmapOn", 1));
rp = DeferredMulti.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaintCube"));
rp.mPriority = CRenderPass.ePriority.Surface;
rp.mShader = gAtl.Frame().Pal().SlCubeKey();
rp.mCullFace = CRenderPass.eCull.None;
rp.mCullFrustum = false;
rp.mRenderTarget = DeferredMulti.PushTex("skyboxTex.tex", new CTexture());
rp.mBlitRead = gBufMultiTexKey;
rp.mBlitType = 1;
sufLast = DeferredMulti.PushSuf(new CSurface());
sufLast.SetUseRT(false);
srp = sufLast.GetRP();
srp.mShader = gAtl.Frame().Pal().SlPostKey();
srp.mTag.add("blend");
srp.mAlpha = false;
srp.mShaderAttr.push(new CShaderAttr(0, sufLig0.GetTexKey()));
srp.mShaderAttr.push(new CShaderAttr(2, rp.mRenderTarget));
srp.mShaderAttr.push(new CShaderAttr("BlendColor0", new CVec4(SDF.eBlend.Texture, 0)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor1", new CVec4(SDF.eBlend.Texture, 1)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor2", new CVec4(SDF.eBlend.Texture, 2)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor3", new CVec4(SDF.eBlend.LinearDodge, 0, 1, 1)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor4", new CVec4(SDF.eBlend.Tonemap, 3, 1, SDF.eTonemap.Neutral)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor5", new CVec4(SDF.eBlend.GammaCorrect, 4)));
srp.mShaderAttr.push(new CShaderAttr("BlendColor6", new CVec4(SDF.eBlend.LinearDodge, 5, 2, 1)));
const forward = new CRPMgr();
ShadowReadTexKey = forward.PushTex(gAtl.Frame().Pal().GetShadowReadTex(), new CTexture());
rp = forward.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mPriority = CRenderPass.ePriority.BackGround + 1;
rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.ArrShadowWrite, gAtl.Frame().Pal().GetShadowWriteTex()));
for (const attr of shadowShaderAttrs) {
    rp.mShaderAttr.push(attr);
}
rp.mAlpha = false;
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
rp.mRenderTarget = gAtl.Frame().Pal().GetShadowReadTex();
rp.mTag.add("shadowRead");
rp = forward.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class", "==", "CPaint3D"));
rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.SingleShadowRead, gAtl.Frame().Pal().GetShadowReadTex()));
rp.mShaderAttr.push(new CShaderAttr("shadowOn", 1));
rp.mShader = gAtl.Frame().Pal().Sl3DKey();
let rpPlug = new CCanvasPluginRPMgr(null);
Main.PushPlugin(rpPlug);
let camcon = new CCamCon3DThirdPerson(gAtl.Frame().Input());
gAtl.Brush().GetCam3D().SetCamCon(camcon);
camcon.SetPos(new CVec3());
let back = Main.PushSub(new CSubject());
let pt = back.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
pt.SetTexture(["Res/teapot/1zflt0j.jpg", "Res/teapot/1zflt0j_NRM.jpg", "Res/teapot/1zflt0j_lig.jpg"]);
pt.PushTag(CPaint.eTag.Shadow);
back.SetSca(new CVec3(2000, 2, 2000));
let teapot = Main.PushSub(new CSubject());
let pt2 = teapot.PushComp(new CPaint3D("Res/teapot/teapot.FBX"));
pt2.PushTag(CPaint.eTag.Shadow);
teapot = Main.PushSub(new CSubject());
teapot.SetPos(new CVec3(500, 0, 0));
pt2 = teapot.PushComp(new CPaint3D("Res/teapot/teapot.FBX"));
pt2.PushTag(CPaint.eTag.Shadow);
CModal.PushTitleBar(new CModalTitleBar("DevToolModal", "Forward", () => {
    Main.Clear();
    rpPlug.SetRPMgr(forward);
    let L = Main.PushSub(new CSubject());
    L.SetPos(new CVec3(0, 1, 1));
    let lig = new CLight();
    lig.SetShadow3D("D1_", 0, 100);
    lig.SetDirect();
    lig.SetMask(CPaint.eCullMask.Mask01);
    lig.SetColor(new CVec3(1, 1, 1));
    lig.mShadowDistance = shadowDistance;
    L.PushComp(lig);
    L = Main.PushSub(new CSubject());
    L.SetPos(new CVec3(0, 1, -1));
    lig = new CLight();
    lig.SetShadow3D("D2_", 0, 100);
    lig.SetDirect();
    lig.SetMask(CPaint.eCullMask.Mask02);
    lig.SetColor(new CVec3(1, 1, 1));
    lig.mShadowDistance = shadowDistance;
    L.PushComp(lig);
    const pointLights = [
        { pos: new CVec3(-450, 450, -250), color: new CVec3(1, 0.15, 0.1) },
        { pos: new CVec3(450, 450, -250), color: new CVec3(0.1, 1, 0.25) },
        { pos: new CVec3(0, 450, 520), color: new CVec3(0.15, 0.35, 1) },
    ];
    for (const pointLight of pointLights) {
        let pointLightSub = Main.PushSub(new CSubject());
        pointLightSub.SetPos(pointLight.pos);
        let pointPt = pointLightSub.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
        pointPt.SetColorModel(new CColor(pointLight.color.x, pointLight.color.y, pointLight.color.z, CColor.eModel.RGBAdd));
        let pointLig = new CLight();
        pointLig.SetPoint(900, 250);
        pointLig.SetColor(pointLight.color);
        pointLightSub.PushComp(pointLig);
    }
    let back = Main.PushSub(new CSubject());
    let pt = back.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
    pt.SetTexture(["Res/teapot/1zflt0j.jpg", "Res/teapot/1zflt0j_NRM.jpg", "Res/teapot/1zflt0j_lig.jpg"]);
    pt.PushTag(CPaint.eTag.Shadow);
    pt.PushTag(CPaint.eTag.Light);
    pt.PushTag("shadowMulti");
    pt.SetCullMask(CPaint.eCullMask.Mask01 + CPaint.eCullMask.Mask02);
    back.SetSca(new CVec3(2000, 2, 2000));
    let teapot = Main.PushSub(new CSubject());
    teapot.SetPos(new CVec3(300, 0, 0));
    let pt2 = teapot.PushComp(new CPaint3D("Res/teapot/teapot.FBX"));
    pt2.PushTag(CPaint.eTag.Shadow);
    pt2.PushTag(CPaint.eTag.Light);
    pt2.PushTag("shadowMulti");
    pt2.SetCullMask(CPaint.eCullMask.Mask01);
    teapot = Main.PushSub(new CSubject());
    teapot.SetPos(new CVec3(-300, 0, 0));
    pt2 = teapot.PushComp(new CPaint3D("Res/teapot/teapot.FBX"));
    pt2.PushTag(CPaint.eTag.Shadow);
    pt2.PushTag(CPaint.eTag.Light);
    pt2.PushTag("shadowMulti");
    pt2.SetCullMask(CPaint.eCullMask.Mask02);
    let skybox = Main.PushSub(new CSubject());
    skybox.SetSca(new CVec3(10, 10, 10));
    let ptcube = skybox.PushComp(new CPaintCube(cubeTexKey));
    ptcube.Sky(false, false, false, false, false);
}));
CModal.PushTitleBar(new CModalTitleBar("DevToolModal", "Deferred", () => {
}));
class CTestComp extends CComponent {
    constructor(_arr) {
        super();
        this.arr = _arr;
    }
    arr;
    shadowTest = new CVec4(0, 0, 0, 0);
}
CModal.PushTitleBar(new CModalTitleBar("Deferred", "DeferredSingle(HafeLambert+Phong)/Parallax", () => {
    Main.Clear();
    Main.ClearBatch();
    gAtl.Brush().ClearRen();
    rpPlug.SetRPMgr(DeferredSingle);
    const pointLights = [
        { pos: new CVec3(-450, 450, -250), color: new CVec3(1, 0, 0), shadow: "s0_" },
        { pos: new CVec3(450, 450, -250), color: new CVec3(0, 1, 0), shadow: "s1_" },
        { pos: new CVec3(0, 450, 520), color: new CVec3(0, 0, 1), shadow: "s2_" },
    ];
    for (const pointLight of pointLights) {
        let pointLightSub = Main.PushSub(new CSubject());
        pointLightSub.SetPos(pointLight.pos);
        pointLightSub.SetSca(new CVec3(10, 10, 10));
        let pointPt = pointLightSub.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
        pointPt.SetColorModel(new CColor(pointLight.color.x, pointLight.color.y, pointLight.color.z, CColor.eModel.RGBAdd));
        let pointLig = new CLight();
        pointLig.SetPoint(1000);
        pointLig.SetShadow3D(pointLight.shadow);
        pointLig.SetColor(pointLight.color);
        pointLightSub.PushComp(pointLig);
    }
    let sub = Main.PushSub(new CSubject());
    sub.SetKey("ShadowOption");
    let testComp = sub.PushComp(new CTestComp(shadowShaderAttrs));
    let back = Main.PushSub(new CSubject());
    let pt = back.PushComp(new CPaint3D("Res/plane/plane.FBX"));
    pt.mAutoLoad.mMipMap = CTexture.eMipmap.None;
    pt.PushTag(CPaint.eTag.Light);
    pt.PushTag(CPaint.eTag.Parallax);
    pt.PushTag("shadowMulti");
    pt.PushCShaderAttr(new CShaderAttr("parallaxNormal", 0.1));
    pt.PushCShaderAttr(new CShaderAttr("shadowTest", testComp.shadowTest));
    back.SetSca(new CVec3(20, 1, 20));
    let teapot = Main.PushSub(new CSubject());
    let pt2 = teapot.PushComp(new CPaint3D("Res/teapot/teapot.FBX"));
    pt2.PushTag(CPaint.eTag.Light);
    pt2.PushTag(CPaint.eTag.Shadow);
    pt2.PushCShaderAttr(new CShaderAttr("shadowTest", testComp.shadowTest));
    pt2.PushTag("shadowMulti");
    let skybox = Main.PushSub(new CSubject());
    skybox.SetSca(new CVec3(10, 10, 10));
    let ptcube = skybox.PushComp(new CPaintCube(cubeTexKey));
    ptcube.Sky(false, false, false, false, false);
}));
CModal.PushTitleBar(new CModalTitleBar("Deferred", "DeferredMulti(None+CookTorrance(PBR)", () => {
    Main.Clear();
    Main.ClearBatch();
    gAtl.Brush().ClearRen();
    rpPlug.SetRPMgr(DeferredMulti);
    for (let i = 0; i < 1; i++) {
        let L = Main.PushSub(new CSubject());
        L.SetKey("lig");
        let lig = new CLight();
        lig.SetShadow3D("test", 0, 0.1);
        lig.SetDirect();
        lig.SetColor(new CVec3(1, 1, 1));
        lig.mShadowDistance = shadowDistance;
        L.PushComp(lig);
        switch (i) {
            case 0:
                L.SetPos(new CVec3(-0.496, 0.592, -0.629));
                break;
            case 1:
                L.SetPos(new CVec3(0, 1, 1));
                break;
            case 2:
                L.SetPos(new CVec3(-1, 1, 0));
                break;
            case 3:
                L.SetPos(new CVec3(0, 1, -1));
                break;
        }
    }
    let back = Main.PushSub(new CSubject());
    let pt = back.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
    pt.SetTexture(["Res/teapot/1zflt0j.jpg"]);
    pt.PushTag(CPaint.eTag.Light);
    pt.PushTag(CPaint.eTag.ShadowReadOnly);
    pt.SetMaterial(0.1, 0.6);
    back.SetSca(new CVec3(2000, 2, 2000));
    for (let x = -1; x <= 1; x += 1)
        for (let z = -1; z <= 1; z += 1) {
            let teapot = Main.PushSub(new CSubject());
            let pt2 = teapot.PushComp(new CPaint3D(gAtl.Frame().Pal().GetSphereMesh()));
            teapot.SetSca(new CVec3(200, 200, 200));
            pt2.SetColorModel(new CColor(1, 0, 0, CColor.eModel.RGBAdd));
            pt2.PushTag(CPaint.eTag.Light);
            pt2.PushTag(CPaint.eTag.Shadow);
            pt2.SetMaterial((x + 1) * 0.5, (z + 1) * 0.5);
            teapot.SetPos(new CVec3(x * 500, 100, z * 500));
        }
    let skybox = Main.PushSub(new CSubject());
    skybox.SetSca(new CVec3(10, 10, 10));
    let ptcube = skybox.PushComp(new CPaintCube(cubeTexKey));
    ptcube.Sky(false, false, false, false, false);
}));
CModal.PushTitleBar(new CModalTitleBar("DevToolModal", "DeferredOption", () => {
}));
let moveLightEventAlreadyPushed = false;
const moveLightEvent = new CEvent(() => {
    for (const [key, sub] of Main.GetSubMap()) {
        const lig = sub.FindComp(CLight, true);
        if (lig != null && lig.IsPointLight() == false) {
            const timer = Date.now() * 0.00025;
            lig.SetDirectPos(new CVec3(Math.sin(timer * 7) * 3, Math.cos(timer * 5) * 4, Math.cos(timer * 3) * 3));
            break;
        }
    }
});
CModal.PushTitleBar(new CModalTitleBar("DeferredOption", "Const Light", () => {
    if (moveLightEventAlreadyPushed == true) {
        gAtl.Frame().RemoveEvent(moveLightEvent);
        moveLightEventAlreadyPushed = false;
    }
}));
CModal.PushTitleBar(new CModalTitleBar("DeferredOption", "Moving Light", () => {
    if (moveLightEventAlreadyPushed == false) {
        gAtl.Frame().PushEvent(CEvent.eType.Update, moveLightEvent);
        moveLightEventAlreadyPushed = true;
    }
}));
let mdviewer = new CMDViewer("README.md");
let Help = new CBGAttachButton("DevToolModal", 101, new CVec2(320, 320));
Help.SetTitleText("Help");
Help.SetContent(await CUtilWeb.MDReader("README.md"));
new CModalFrameView();
