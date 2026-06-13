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
gPF.mCanvas = "";
gPF.mWASM = false;
gPF.mServer = 'webServer';
gPF.mGitHub = false;
gPF.mVersion = "mqc9ngpy_2";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
CPlugin.PushPath('Water','../../../Artgine/plugin/Water/');
import "../../../Artgine/plugin/Water/Water.js"
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint

import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CCamCon3DFirstPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CLoaderOption } from "../../../Artgine/artgine/util/CLoader.js";
import { CTexture } from "../../../Artgine/artgine/render/CTexture.js";
import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { CTerrainMap } from "../../../Artgine/artgine/app/subject/CTerrainMap.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
import { CRPAuto, CRPMgr } from "../../../Artgine/artgine/app/canvas/CRPMgr.js";
import { CCondition } from "../../../Artgine/artgine/util/CCondition.js";
import { CRenderPass } from "../../../Artgine/artgine/render/CRenderPass.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { SDF } from "../../../Artgine/artgine/z_file/SDF.js";
import { CCanvasPluginRPMgr } from "../../../Artgine/artgine/app/canvas/CCanvasPluginRPMgr.js";
import { CPaint3D, CPaintCube } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CModalFrameView } from "../../../Artgine/artgine/util/CModalUtil.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";
import { CComponent } from "../../../Artgine/artgine/app/component/CComponent.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CBehavior } from "../../../Artgine/artgine/app/component/CBehavior.js";
import { CUtilRender } from "../../../Artgine/artgine/render/CUtilRender.js";
import { CImgPro } from "../../../Artgine/artgine/render/CImgPro.js";
import { CWater3D } from "../../../Artgine/plugin/Water/Water.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";

var Main=gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
gAtl.Brush().GetCam3D().SetCamCon(new CCamCon3DFirstPerson(gAtl.Frame().Input()));
gAtl.Brush().GetCam3D().Init(new CVec3(23000, 6000, 20000), new CVec3(23001, 6000, 20000));

// Light
let ligSub = Main.PushSub(new CSubject());
ligSub.SetPos(new CVec3(0, 1, 5));
let ligComp = ligSub.PushComp(new CLight())
ligComp.SetShadow3D("shadow", 0, 2, 16);

class CTestComp extends CComponent
{
    PCF = new CVec1(2);
    bias = new CVec1(40);
    normalBias = new CVec1(10);
    shadowRate = new CVec1(0.3);
    jitter = new CVec1(1);
}
let sub = Main.PushSub(new CSubject());
let testComp = sub.PushComp(new CTestComp());

// RPMgr
let forward=new CRPMgr();
Main.PushPlugin(new CCanvasPluginRPMgr(forward));
forward.PushTex(gAtl.Frame().Pal().GetShadowReadTex(),new CTexture());
// shadowRead
{
    let rp=forward.PushRP(new CRPAuto());
    rp.PushOr(new CCondition("class","==","CPaint3D"));
    rp.PushOr(new CCondition("class","==","CPaint3DMerge"));
    rp.PushAnd(new CCondition("mTag[shadow]","==",true));
    rp.mPriority=CRenderPass.ePriority.BackGround+1;

    rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.ArrShadowWrite,gAtl.Frame().Pal().GetShadowWriteTex()));
    rp.mShaderAttr.push(new CShaderAttr("PCF",testComp.PCF));
    rp.mShaderAttr.push(new CShaderAttr("bias",testComp.bias));
    rp.mShaderAttr.push(new CShaderAttr("normalBias",testComp.normalBias));
    rp.mShaderAttr.push(new CShaderAttr("shadowRate",testComp.shadowRate));
    rp.mShaderAttr.push(new CShaderAttr("jitter",testComp.jitter));

    rp.mShader=gAtl.Frame().Pal().Sl3DKey();
    rp.mRenderTarget=gAtl.Frame().Pal().GetShadowReadTex();
    rp.mTag.add("shadowRead");
}
// draw
{
    let rp=forward.PushRP(new CRPAuto());
    rp.PushOr(new CCondition("class","==","CPaint3D"));
    rp.PushOr(new CCondition("class","==","CPaint3DMerge"));
    rp.PushAnd(new CCondition("mTag[water]","!=",true));
    rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.SingleShadowRead, gAtl.Frame().Pal().GetShadowReadTex()));
    rp.mShaderAttr.push(new CShaderAttr("shadowOn", new CVec1(1)));
    rp.mShader=gAtl.Frame().Pal().Sl3DKey();
}
// terrain shadowRead
{
    let rp=forward.PushRP(new CRPAuto());
    rp.PushOr(new CCondition("class","==","CPaintTerrain"));
    rp.PushAnd(new CCondition("mTag[shadow]","==",true));
    rp.mPriority=CRenderPass.ePriority.BackGround+1;

    rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.ArrShadowWrite, gAtl.Frame().Pal().GetShadowWriteTex()));
    rp.mShaderAttr.push(new CShaderAttr("PCF",testComp.PCF));
    rp.mShaderAttr.push(new CShaderAttr("bias",testComp.bias));
    rp.mShaderAttr.push(new CShaderAttr("normalBias",testComp.normalBias));
    rp.mShaderAttr.push(new CShaderAttr("shadowRate",testComp.shadowRate));
    rp.mShaderAttr.push(new CShaderAttr("jitter",testComp.jitter));

    rp.mShader=gAtl.Frame().Pal().SlTerrainKey();
    rp.mRenderTarget=gAtl.Frame().Pal().GetShadowReadTex();
    rp.mTag.add("shadowRead");
}
// terrain draw
{
    let rp=forward.PushRP(new CRPAuto());
    rp.PushOr(new CCondition("class","==","CPaintTerrain"));
    rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.SingleShadowRead, gAtl.Frame().Pal().GetShadowReadTex()));
    rp.mShaderAttr.push(new CShaderAttr("shadowOn", new CVec1(1)));
    rp.mShader=gAtl.Frame().Pal().SlTerrainKey();
}

// terrain
const TEX_SIZE = 4096;
const SPLAT_SIZE = 1024;
const CELL_SIZE = 40;
const MESH_SIZE = 64;
const TERRAIN_HEIGHT = 8192;

const heightMap = Main.PushSub(new CTerrainMap());
heightMap.SetLevel([1, 1, 1, 1, 1, 1]);
heightMap.mHeightBuf.mSize = 40;
heightMap.mTag.add("light");
heightMap.mTag.add("shadow");
heightMap.mCollider.SetLayer("test");
heightMap.mCollider.PushCollisionLayer("test");

// water
const water = Main.PushSub(new CWater3D());
water.SetKey("water");
water.SetRot(new CVec3(-Math.PI / 2, 0, 0));
water.SetSca(new CVec3(50000, 50000, 50000));
water.SetPos(new CVec3(0, 400, 0));
water.Light();
water.GetPT().SetTexCodi(new CVec4(100,100,0,0));
water.NormalFlow(new CVec2(1, 0));
water.AddReflector();
water.AddRefractor();
water.AddCaustics(new CVec2(1, 0));

// sky
const sky = Main.PushSub(new CSubject());
const cube = sky.PushComp(new CPaintCube(""));
cube.Sky(true, true, true);

// plane
const plane = Main.PushSub(new CSubject());
plane.SetPos(new CVec3(300, -0.5, 300));
plane.SetSca(new CVec3(1, 0.01, 1));
const planePt = plane.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
planePt.SetColorModel(new CColor(0, 0, 1, CColor.eModel.RGBAdd));

// player
const player = Main.PushSub(new CSubject());
player.SetPos(new CVec3(1000, 1000, 1000));
const playerPt = player.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
playerPt.PushTag("light");
playerPt.PushTag("shadow");
const playerRb = player.PushComp(new CRigidBody());
playerRb.SetGravity(10);
const playerCol = player.PushComp(new CCollider(playerPt, playerRb));
playerCol.SetLayer("test");
playerCol.PushCollisionLayer("test");
playerCol.SetRestitution();
class CBehaviorTest extends CBehavior {
    override CollisionEnter(_org: CCollider, _tar: CCollider): void {
        super.CollisionEnter(_org, _tar);
        playerPt.SetColorModel(new CColor(1, 0, 0, CColor.eModel.RGBAdd));
    }
    override CollisionExit(_org: CCollider, _tar: CCollider): void {
        super.CollisionExit(_org, _tar);
        playerPt.SetColorModel(new CColor(0, 0, 1, CColor.eModel.RGBAdd));
    }
}
player.PushComp(new CBehaviorTest());

// frameView
new CModalFrameView();

async function PreLoad(_tex: string)
{
    const loaderOpt = new CLoaderOption();
    loaderOpt.mAlphaBleed = false;
    loaderOpt.mMipMap = CTexture.eMipmap.None;
    return await gAtl.Frame().Load().Exe(_tex, loaderOpt);
}

async function InitScene()
{
    const mesh = CUtilRender.CMeshCreateInfoToCMesh(CUtilRender.GetTerrain(new CVec2(MESH_SIZE, MESH_SIZE), 0), gAtl.Frame().Pal().GetBlackTex());
    gAtl.Frame().Pal().mTerrain = mesh.meshTree.mData.ci;
    CUtilRender.MeshBoundUpdate(mesh);

    heightMap.mHeightBuf.Reset(new CVec3(TEX_SIZE, TEX_SIZE, 1), CELL_SIZE);
    heightMap.mSplatBuf.Reset(new CVec3(SPLAT_SIZE, SPLAT_SIZE, 1), CELL_SIZE);
    heightMap.mTerrainHeight = TERRAIN_HEIGHT;
    heightMap.mDefaultHeight = TERRAIN_HEIGHT * 2;

    const heightex = await PreLoad("Res/canyon_height.png");
    const splattex = await PreLoad("Res/terrain_splat.png");

    if(heightex instanceof CTexture) {
        let reducedTex = gAtl.Frame().Res().Find(`${heightex.Key()}_${TEX_SIZE}`);
        if(reducedTex == null) {
            reducedTex = CImgPro.SqurEnlargedReduced(heightex.GetWidth(), heightex.GetHeight(), heightex.GetBuf()[0], TEX_SIZE / heightex.GetWidth(), TEX_SIZE / heightex.GetHeight(), 4);
            gAtl.Frame().Res().Push(`${heightex.Key()}_${TEX_SIZE}`, reducedTex);
        }
        heightMap.mHeightBuf.SetTexture(reducedTex);
    }
    if(splattex instanceof CTexture) {
        heightMap.mSplatBuf.SetTexture(splattex);
    }

    const textures = [
        "Res/grass.png", "Res/dirt.png", "Res/sand.png", "Res/rock.png",
        new CVec4(1.0, 0.92, 0.0, 1.0), new CVec4(1.0, 0.82, 0.0, 1.0), new CVec4(1.0, 0.68, 0.0, 1.0), new CVec4(1.0, 0.75, 0.0, 1.0),
        "Res/grass_nm.png", "Res/dirt_nm.png", "Res/sand_nm.png", "Res/rock_nm.png"
    ];
    const splatTexCodi = [
        256, 256, 0, 0,
        32, 32, 0, 0,
        32, 32, 0, 0,
        32, 32, 0, 0,
    ];

    heightMap.SetSplat(textures, new CMat(splatTexCodi));
    heightMap.ClearAll();
}
InitScene();























