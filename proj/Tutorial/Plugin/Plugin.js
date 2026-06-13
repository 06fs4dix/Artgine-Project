import "https://06fs4dix.github.io/Artgine/artgine/artgine.js";
import { CClass } from "https://06fs4dix.github.io/Artgine/artgine/basic/CClass.js";
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
gPF.mWASM = false;
gPF.mCanvas = "";
gPF.mServer = 'local';
gPF.mGitHub = false;
gPF.mVersion = "mpuhzq22_36";
import { CAtelier } from "https://06fs4dix.github.io/Artgine/artgine/app/CAtelier.js";
import { CPlugin } from "https://06fs4dix.github.io/Artgine/artgine/util/CPlugin.js";
CPlugin.PushPath('test', '../../../plugin/test/');
import "../../../Artgine/plugin/test/test.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init(['Main.json'], "");
var Main = gAtl.Canvas('Main.json');
import { CConsol } from "https://06fs4dix.github.io/Artgine/artgine/basic/CConsol.js";
import { CPool } from "https://06fs4dix.github.io/Artgine/artgine/basic/CPool.js";
import { CEvent } from "https://06fs4dix.github.io/Artgine/artgine/basic/CEvent.js";
import { CFrame } from "https://06fs4dix.github.io/Artgine/artgine/util/CFrame.js";
import { CInput } from "https://06fs4dix.github.io/Artgine/artgine/system/CInput.js";
import { CAlert } from "https://06fs4dix.github.io/Artgine/artgine/basic/CAlert.js";
import { CCanvasPluginRPMgr } from "https://06fs4dix.github.io/Artgine/artgine/app/canvas/CCanvasPluginRPMgr.js";
let CTest = CClass.New("CTest");
CConsol.Log(CTest["v"]);
Main.PushSub(await CPool.Product("test"));
let rpMgr = gAtl.Frame().Res().Find("testUVRPMgr");
Main.PushPlugin(new CCanvasPluginRPMgr(rpMgr));
gAtl.Frame().PushEvent(CEvent.eType.Update, () => {
    if (CFrame.Main().Input().KeyUp(CInput.eKey.Num1)) {
        Main.RemovePlugin(CCanvasPluginRPMgr);
        let rpMgr = gAtl.Frame().Res().Find("testRPMgr");
        Main.PushPlugin(new CCanvasPluginRPMgr(rpMgr));
    }
    if (CFrame.Main().Input().KeyUp(CInput.eKey.Num2)) {
        Main.RemovePlugin(CCanvasPluginRPMgr);
        let rpMgr = gAtl.Frame().Res().Find("testUVRPMgr");
        Main.PushPlugin(new CCanvasPluginRPMgr(rpMgr));
    }
});
CAlert.Info("숫자1,2로 플러그인에서 만든 정보로 RP를 변경합니다", 60 * 1000);
