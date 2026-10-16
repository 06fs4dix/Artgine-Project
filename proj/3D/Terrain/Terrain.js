import "../../../Artgine/artgine/artgine.js";
import { CPreferences } from "../../../Artgine/artgine/basic/CPreferences.js";
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
gPF.mVersion = "mtsc8k27_27";
import { CAtelier } from "../../../Artgine/artgine/app/CAtelier.js";
import { CPlugin } from "../../../Artgine/artgine/util/CPlugin.js";
CPlugin.PushPath('Water', '../../../plugin/Water/');
import "../../../plugin/Water/Water.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([], "");
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CCamCon3DFirstPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CLoaderOption } from "../../../Artgine/artgine/util/CLoader.js";
import { CTexture } from "../../../Artgine/artgine/render/CTexture.js";
import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { CTerrainMap } from "../../../Artgine/artgine/app/subject/CTerrainMap.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
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
import { CWater3D } from "../../../plugin/Water/Water.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
var Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
gAtl.Brush().GetCam3D().SetCamCon(new CCamCon3DFirstPerson(gAtl.Frame().Input()));
gAtl.Brush().GetCam3D().Init(new CVec3(23000, 6000, 20000), new CVec3(23001, 6000, 20000));
let ligSub = Main.PushSub(new CSubject());
ligSub.SetPos(new CVec3(0, 1, 5));
let ligComp = ligSub.PushComp(new CLight());
ligComp.SetShadow3D("shadow", 0, 0.002, 0.016);
ligComp.mShadowDistance = 100000;
class CTestComp extends CComponent {
    PCF = new CVec1(2);
    bias = new CVec1(1);
    normalBias = new CVec1(0.3);
    shadowRate = new CVec1(0.3);
    jitter = new CVec1(1);
}
let sub = Main.PushSub(new CSubject());
let testComp = sub.PushComp(new CTestComp());
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
const collider = heightMap.PushComp(new CCollider());
collider.SetLayer("test");
collider.PushCollisionLayer("test");
const water = Main.PushSub(new CWater3D());
water.SetKey("water");
water.SetRot(new CVec3(-Math.PI / 2, 0, 0));
water.SetSca(new CVec3(500000, 500000, 500000));
water.SetPos(new CVec3(0, 400, 0));
water.Light();
water.GetPT().SetTexCodi(new CVec4(100, 100, 0, 0));
water.NormalFlow(new CVec2(1, 0));
water.AddReflector();
water.AddRefractor();
water.AddCaustics(new CVec2(1, 0));
const sky = Main.PushSub(new CSubject());
const cube = sky.PushComp(new CPaintCube(""));
cube.Sky(true, true, true);
const plane = Main.PushSub(new CSubject());
plane.SetPos(new CVec3(300, -0.5, 300));
plane.SetSca(new CVec3(200, 2, 200));
const planePt = plane.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
planePt.SetColorModel(new CColor(0, 0, 1, CColor.eModel.RGBAdd));
const player = Main.PushSub(new CSubject());
player.SetPos(new CVec3(1000, 1000, 1000));
player.SetSca(new CVec3(200, 200, 200));
const playerPt = player.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh()));
playerPt.PushTag("light");
playerPt.PushTag("shadow");
const playerRb = player.PushComp(new CRigidBody());
playerRb.SetGravity(10);
const playerCol = player.PushComp(new CCollider(playerPt, playerRb));
playerCol.SetLayer("test");
playerCol.PushCollisionLayer("test");
playerCol.SetPushRate();
class CBehaviorTest extends CBehavior {
    CollisionEnter(_org, _tar) {
        super.CollisionEnter(_org, _tar);
        playerPt.SetColorModel(new CColor(1, 0, 0, CColor.eModel.RGBAdd));
    }
    CollisionExit(_org, _tar) {
        super.CollisionExit(_org, _tar);
        playerPt.SetColorModel(new CColor(0, 0, 1, CColor.eModel.RGBAdd));
    }
}
player.PushComp(new CBehaviorTest());
new CModalFrameView();
async function PreLoad(_tex) {
    const loaderOpt = new CLoaderOption();
    loaderOpt.mAlphaBleed = false;
    loaderOpt.mMipMap = CTexture.eMipmap.None;
    loaderOpt.mGPU = false;
    return await gAtl.Frame().Load().Exe(_tex, loaderOpt);
}
async function InitScene() {
    const mesh = CUtilRender.CMeshCreateInfoToCMesh(CUtilRender.GetTerrain(new CVec2(MESH_SIZE, MESH_SIZE), 0), gAtl.Frame().Pal().GetBlackTex());
    gAtl.Frame().Pal().mTerrain = mesh.meshTree.mData.ci;
    CUtilRender.MeshBoundUpdate(mesh);
    heightMap.mHeightBuf.Reset(new CVec3(TEX_SIZE, TEX_SIZE, 1), CELL_SIZE);
    heightMap.mSplatBuf.Reset(new CVec3(SPLAT_SIZE, SPLAT_SIZE, 1), CELL_SIZE);
    heightMap.mTerrainHeight = TERRAIN_HEIGHT;
    heightMap.mDefaultHeight = TERRAIN_HEIGHT * 2;
    const heightex = await PreLoad("Res/canyon_height.png");
    const splattex = await PreLoad("Res/terrain_splat.png");
    if (heightex instanceof CTexture) {
        let reducedTex = gAtl.Frame().Res().Find(`${heightex.Key()}_${TEX_SIZE}`);
        if (reducedTex == null) {
            reducedTex = CImgPro.SqurEnlargedReduced(heightex.GetWidth(), heightex.GetHeight(), heightex.GetBuf()[0], TEX_SIZE / heightex.GetWidth(), TEX_SIZE / heightex.GetHeight(), 4);
            gAtl.Frame().Res().Push(`${heightex.Key()}_${TEX_SIZE}`, reducedTex);
        }
        heightMap.mHeightBuf.SetTexture(reducedTex);
    }
    if (splattex instanceof CTexture) {
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
