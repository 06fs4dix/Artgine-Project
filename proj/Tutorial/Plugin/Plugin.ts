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
gPF.mVersion = "mpuhzq22_36";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
CPlugin.PushPath('test','../../../plugin/test/');
import "../../../Artgine/plugin/test/test.js"
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init(['Main.json'],"");
var Main = gAtl.Canvas('Main.json');
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
import {CObject} from "../../../Artgine/artgine/basic/CObject.js"
import { CConsol } from "../../../Artgine/artgine/basic/CConsol.js";
import { CPool } from "../../../Artgine/artgine/basic/CPool.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CRPMgr } from "../../../Artgine/artgine/app/canvas/CRPMgr.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CFrame } from "../../../Artgine/artgine/util/CFrame.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CAlert } from "../../../Artgine/artgine/basic/CAlert.js";
import { CCanvasPluginRPMgr } from "../../../Artgine/artgine/app/canvas/CCanvasPluginRPMgr.js";

//플러그인에서 정의한 클래스 사용
let CTest=CClass.New("CTest");
CConsol.Log(CTest["v"]);

//플러그인에서 설정한 생산자를 이용
Main.PushSub(await CPool.Product<CSubject>("test"));

//플러그인에서 RPMgr가져오기
let rpMgr=gAtl.Frame().Res().Find("testUVRPMgr") as CRPMgr;
Main.PushPlugin(new CCanvasPluginRPMgr(rpMgr))
//Main.SetRPMgr(rpMgr);


gAtl.Frame().PushEvent(CEvent.eType.Update,()=>{
    if(CFrame.Main().Input().KeyUp(CInput.eKey.Num1))
    {
        Main.RemovePlugin(CCanvasPluginRPMgr);
        let rpMgr=gAtl.Frame().Res().Find("testRPMgr") as CRPMgr;
        Main.PushPlugin(new CCanvasPluginRPMgr(rpMgr))
        
    }
    if(CFrame.Main().Input().KeyUp(CInput.eKey.Num2))
    {
        Main.RemovePlugin(CCanvasPluginRPMgr);
        let rpMgr=gAtl.Frame().Res().Find("testUVRPMgr") as CRPMgr;
        Main.PushPlugin(new CCanvasPluginRPMgr(rpMgr))
    }
});

CAlert.Info("숫자1,2로 플러그인에서 만든 정보로 RP를 변경합니다",60*1000);




