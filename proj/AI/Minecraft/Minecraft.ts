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
gPF.mServer = 'webServer';
gPF.mGitHub = false;
gPF.mVersion = "minecraft_1";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CPhysics } from "../../../Artgine/artgine/app/component/CPhysics.js";
import { CMCWorld, MC_SIZE } from "./CMCWorld.js";
import { CMCPlayer } from "./CMCPlayer.js";
import { MCSkyBuild } from "./CMCSky.js";
import { CMCTouch } from "./CMCTouch.js";
import { CMCFx } from "./CMCFx.js";
import { CMCHand } from "./CMCHand.js";
import { CMCSound } from "./CMCSound.js";
import { CMCBag } from "./CMCBag.js";

const WORLD_X = 200;
const WORLD_Y = 64;
const WORLD_Z = 200;
const MOBILE_SIZE = 64;
const MOBILE_Y = 32;
const SEED = 20240611;
const TOUCH = CMCTouch.IsTouch();

const Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
Main.GetCam().SetCamCon(null);
Main.GetCam().SetNear(5);
Main.GetCam().SetFar(10000);
Main.GetCam().SetFov(1.2);

gAtl.Frame().Dev().SetClearColor(true, new CVec4(0.53, 0.81, 0.92, 0.99));

const world = new CMCWorld();
await world.Prepare();
world.ResetInfo(new CVec3(TOUCH ? MOBILE_SIZE : WORLD_X, TOUCH ? MOBILE_Y : WORLD_Y, TOUCH ? MOBILE_SIZE : WORLD_Z), MC_SIZE);
world.Generate(SEED);
Main.PushSub(world);

const fx = new CMCFx(gAtl.Frame(), Main);
const hand = new CMCHand(gAtl.Frame(), Main);
const sound = new CMCSound();
const bag = new CMCBag();
if (TOUCH) fx.mDebris = 5;

CPhysics.GravityPow = 100;
CPhysics.GravityMaxPow = 3000;

const sunLight = MCSkyBuild(Main, 10, TOUCH);

gAtl.Brush().EnsureDefaultRP();
const shadowReadRP = gAtl.Brush().FindAutoRP("ShadowRead_Voxel");
shadowReadRP.mShaderAttr.push(new CShaderAttr("bias", new CVec1(1.5)));
shadowReadRP.mShaderAttr.push(new CShaderAttr("normalBias", new CVec1(4)));
shadowReadRP.mShaderAttr.push(new CShaderAttr("PCF", new CVec1(2)));

const body = Main.PushSub(new CSubject());
let touchCtl: CMCTouch = null;
if (TOUCH)
{
    const UI = gAtl.NewCanvas("UI");
    UI.SetCameraKey("2D");
    touchCtl = new CMCTouch(UI);
}
const player = new CMCPlayer(world, Main.GetCam(), fx, hand, sound, bag, body, gAtl.Frame().Input(), gAtl.PF(), gAtl.Frame().Win().Handle(), touchCtl);

let hour = 10;
let hourCd = 0;
gAtl.Frame().PushEvent(CEvent.eType.Update, (_update: CUpdate) =>
{
    player.Update(_update);

    hour = (hour + _update.DeltaTime() * 24 / 600) % 24;
    hourCd -= _update.DeltaTime();
    if (hourCd <= 0)
    {
        hourCd = 0.2;
        sunLight.SetTime(hour);
    }
});
