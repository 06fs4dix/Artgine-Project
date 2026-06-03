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
gPF.mServer = 'webServer';
gPF.mGitHub = false;
gPF.mVersion = "mpy1x7kf_2";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
CPlugin.PushPath('ShadowPlane','../../../Artgine/plugin/ShadowPlane/');
import "../../../Artgine/plugin/ShadowPlane/ShadowPlane.js"
CPlugin.PushPath('Water','../../../Artgine/plugin/Water/');
import "../../../Artgine/plugin/Water/Water.js"
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init(['Main.json'],"");
var Main = gAtl.Canvas('Main.json');
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
import {CObject} from "../../../Artgine/artgine/basic/CObject.js"
import { CAlert } from "../../../Artgine/artgine/basic/CAlert.js";
import { CMonacoViewer } from "../../../Artgine/artgine/util/CModalUtil.js";
import { CUtilWeb } from "../../../Artgine/artgine/util/CUtilWeb.js";
import { CModal } from "../../../Artgine/artgine/basic/CModal.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CTimer } from "../../../Artgine/artgine/system/CTimer.js";
import { CScript } from "../../../Artgine/artgine/util/CScript.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint2D } from "../../../Artgine/artgine/app/component/paint/CPaint2D.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";

//Main.Find("House").PushComp(new CPlaneShadow());
CAlert.Info("f3로 개발모드에서 라이팅 위치와 값을 수정해 보세요",60*1000);

// let sub=Main.PushSub(new CSubject());
// sub.SetPos(new CVec3(-200,0));
// let pt=sub.PushComp(new CPaint2D("Res/01.png",new CVec2(128,128)));
// //pt.PushTag("tail");
// pt.PushTag("shadowProj");




















