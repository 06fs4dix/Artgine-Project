//Version
import "https://06fs4dix.github.io/Artgine/artgine/artgine.js"

//Class
import {CClass} from "https://06fs4dix.github.io/Artgine/artgine/basic/CClass.js";

//Atelier
import {CPreferences} from "https://06fs4dix.github.io/Artgine/artgine/basic/CPreferences.js";
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
gPF.mVersion = "mq4m3t4v_89";

import {CAtelier} from "https://06fs4dix.github.io/Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "https://06fs4dix.github.io/Artgine/artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint

import { CObject } from "https://06fs4dix.github.io/Artgine/artgine/basic/CObject.js"
import { CVec3 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec3.js";

import { CCamCon3DFirstPerson } from "https://06fs4dix.github.io/Artgine/artgine/util/CCamCon.js";
import { CBGAttachButton } from "https://06fs4dix.github.io/Artgine/artgine/util/CModalUtil.js";
import { CVec2 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec2.js";
import { CEvent } from "https://06fs4dix.github.io/Artgine/artgine/basic/CEvent.js";
import { CUpdate } from "https://06fs4dix.github.io/Artgine/artgine/basic/Basic.js";
import { CMath } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CMath.js";

import { CUtil } from "https://06fs4dix.github.io/Artgine/artgine/basic/CUtil.js";
import { CDOM } from "https://06fs4dix.github.io/Artgine/artgine/basic/CDOM.js";
import { CInput } from "https://06fs4dix.github.io/Artgine/artgine/system/CInput.js";
import { CVec1 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec1.js";

import { CTexture } from "https://06fs4dix.github.io/Artgine/artgine/render/CTexture.js";

import { CRenderPass } from "https://06fs4dix.github.io/Artgine/artgine/render/CRenderPass.js";
import { CShaderAttr } from "https://06fs4dix.github.io/Artgine/artgine/render/CShaderAttr.js";
import { SDF } from "https://06fs4dix.github.io/Artgine/artgine/z_file/SDF.js";

import { CH5Canvas } from "https://06fs4dix.github.io/Artgine/artgine/render/CH5Canvas.js";
import { CLoaderOption } from "https://06fs4dix.github.io/Artgine/artgine/util/CLoader.js";
import { CVoxelMap, CVTile } from "https://06fs4dix.github.io/Artgine/artgine/app/subject/CVoxelMap.js";
import { CCollider } from "https://06fs4dix.github.io/Artgine/artgine/app/component/CCollider.js";
import { CCIndex } from "https://06fs4dix.github.io/Artgine/artgine/app/canvas/CCIndex.js";
import { CSubject } from "https://06fs4dix.github.io/Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "https://06fs4dix.github.io/Artgine/artgine/app/component/paint/CPaint3D.js";
import { CColor } from "https://06fs4dix.github.io/Artgine/artgine/render/CColor.js";
import { CAlpha } from "https://06fs4dix.github.io/Artgine/artgine/render/CAlpha.js";
import { CRPAuto, CRPMgr } from "https://06fs4dix.github.io/Artgine/artgine/app/canvas/CRPMgr.js";
import { CCondition } from "https://06fs4dix.github.io/Artgine/artgine/util/CCondition.js";
import { CCanvasPluginRPMgr } from "https://06fs4dix.github.io/Artgine/artgine/app/canvas/CCanvasPluginRPMgr.js";
import { CLight } from "https://06fs4dix.github.io/Artgine/artgine/app/component/CLight.js";
let Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
gAtl.Brush().GetCam3D().SetCamCon(new CCamCon3DFirstPerson(gAtl.Frame().Input()));
//gAtl.Brush().GetCam3D().Init(new CVec3(500,1000,2600),new CVec3(500,0,1600));

var texList = new Array<string>();
var tileColors = new Array<number>();
var select = 0;
var gTileCounter = 6; // 동적 타일 ID 카운터 (정적 5개 이후부터)
var gVoxel = new CVoxelMap();
gVoxel.SetBlackBoard(true);
await gVoxel.mAtlas.Push("Res/rect_gray0.png");
await gVoxel.mAtlas.Push("Res/tutorial_pad.png");
await gVoxel.mAtlas.Push("Res/floor_sand_stone0.png");
await gVoxel.mAtlas.Push("Res/dngn_shoals_shallow_water4.png");
await gVoxel.mAtlas.Push("Res/dirt_full.png");
texList.push("Res/rect_gray0.png");
texList.push("Res/tutorial_pad.png");
texList.push("Res/floor_sand_stone0.png");
texList.push("Res/dngn_shoals_shallow_water4.png");
texList.push("Res/dirt_full.png");

// 색상값은 반드시 상위 24비트에 데이터 필요 (내부적으로 & 0xFFFFFF00 마스킹됨)
gVoxel.PushTile(new CVTile(0x01000000, 1, "voxel")); tileColors.push(0x01000000);
gVoxel.PushTile(new CVTile(0x02000000, 2, "voxel")); tileColors.push(0x02000000);
gVoxel.PushTile(new CVTile(0x03000000, 3, "voxel")); tileColors.push(0x03000000);
gVoxel.PushTile(new CVTile(0x04000000, 4, "voxel")); tileColors.push(0x04000000);
gVoxel.PushTile(new CVTile(0x05000000, 5, "voxel")); tileColors.push(0x05000000);

gVoxel.ResetInfo(new CVec3(16, 16, 16), 100);
Main.PushSub(gVoxel);

// BondsFill 대체: 바닥면(y=0) 전체 채우기
for (let _x = 0; _x < 16; _x++) {
    for (let _z = 0; _z < 16; _z++) {
        gVoxel.Bonds(new CCIndex(_x, 0, _z), tileColors[0]);
    }
}


let Help = new CBGAttachButton("DevToolModal", 101, new CVec2(320, 320));
//gAtl.Frame().Win().HtmlPush(Option_btn);
Help.SetTitleText("Help");
Help.SetContent(`

<div class="card shadow-sm">
    <div class="card-header d-flex align-items-center justify-content-between">
        <h5 class="mb-0">타일</h5>
    </div>
    <div class="card-body p-1">
        <select class="form-select" id='tileMode'>
            <option value="Create" selected >Create</option>
            <option value="Remove">Remove</option>
            <option value="Move" >Move</option>
        </select>
        <div id='tileList'></div>
    </div>
</div>

<div class="card shadow-sm">
    <div class="card-header d-flex align-items-center justify-content-between">
        <h5 class="mb-0">컬러 조절</h5>
    </div>
    <div class="card-body p-1">
        <input type="color" value="#ff0000ff" class="form-control form-control-color" id='tileColorInput'>
        <button type="button" class="btn btn-success btn-sm" onclick='AddColor()'>컬러 추가</button>
        <input id="fileInput" type="file" class="visually-hidden" accept="image/*,.json" onchange='AddImg()'>
        <label for="fileInput" class="btn btn-outline-primary btn-sm mb-0">이미지 추가</label>
        <div id="paletteList" class="d-flex flex-wrap gap-3 mt-3"></div>
    </div>
</div>

`);


async function AddColor() {
    CDOM.ID("tileColorInput");

    let value = CDOM.IDValue("tileColorInput");

    const r = parseInt(value.substring(1, 3), 16) / 255;
    const g = parseInt(value.substring(3, 5), 16) / 255;
    const b = parseInt(value.substring(5, 7), 16) / 255;


    CH5Canvas.Init(32, 32);
    var para = [CH5Canvas.Cmd("fillStyle", value), CH5Canvas.Cmd("fillRect", [0, 0, 32, 32])];
    CH5Canvas.Draw(para);
    texList.push(CH5Canvas.GetDataURL());
    RefreshTexList();
    let tex = CH5Canvas.GetNewTex();
    const atlasIdx = await gVoxel.mAtlas.Push(texList[texList.length - 1]);
    (gVoxel.mAtlas as any).mGBuffer = new Array<any>();
    gAtl.Frame().Ren().BuildTexture(tex);
    gAtl.Frame().Res().Push(texList[texList.length - 1], tex);

    const newColor = (gTileCounter++ << 24) >>> 0;
    gVoxel.PushTile(new CVTile(newColor, atlasIdx as number, "voxel"));
    tileColors.push(newColor);


    //const inputColor = new CVec4(r, g, b, this.w); // 유지되는 알파 포함
}
window["AddColor"] = AddColor;
async function AddImg() {
    const input = CDOM.ID("fileInput") as HTMLInputElement;
    const files = input?.files;
    if (!files || files.length === 0) return;

    // 다중 선택도 처리
    for (const file of Array.from(files)) {
        // 이미지 파일만 처리 (accept에 .json도 있지만, 요청은 "컬러 추가처럼"이라 이미지 흐름만)
        if (!file.type.startsWith("image/")) continue;

        // 파일 → DataURL
        const dataUrl: string = await new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = () => reject(fr.error);
            fr.readAsDataURL(file);
        });

        // 1) 팔레트 소스 목록에 추가
        

        // 2) 아틀라스에 푸시, 반환값으로 atlasIdx 획득
        const atlasIdx = await gVoxel.mAtlas.Push(dataUrl);
        (gVoxel.mAtlas as any).mGBuffer = new Array<any>();

        let ab=await file.arrayBuffer();
        texList.push(dataUrl);
        await gAtl.Frame().Load().TextureLoad(dataUrl,ab,new CLoaderOption());

        // 3) 새 타일 생성해서 바로 사용 가능하게 등록
        const newColor = (gTileCounter++ << 24) >>> 0;
        gVoxel.PushTile(new CVTile(newColor, atlasIdx as number, "voxel"));
        tileColors.push(newColor);
    }
    RefreshTexList();
}
window["AddImg"] = AddImg;
var gBoxSub = Main.PushSub(new CSubject());
gBoxSub.SetSca(0.5);
let pt3d = gBoxSub.PushComp(new CPaint3D());
pt3d.SetColorModel(new CColor(1, 0, 0, CColor.eModel.RGBAdd));
pt3d.SetAlphaModel(new CAlpha(0.7));

gAtl.Frame().PushEvent(CEvent.eType.Update, (_update: CUpdate) => {

    let mouse = gAtl.Frame().Input().Mouse();
    let ray = gAtl.Brush().GetCam3D().GetRay(mouse.x, mouse.y);
    let pick = gVoxel.PickBox(ray);

    if (CDOM.IDValue("tileMode") == "Move" || CInput.eDragState.None != gAtl.Frame().Input().DragState()) {
        gBoxSub.SetSca(0);
        return;
    }

    if (!pick) {
        gBoxSub.SetSca(0);
        return;
    }

    if (CDOM.IDValue("tileMode") == "Create") {
        pt3d.SetColorModel(new CColor(0, 0, 0, CColor.eModel.RGBAdd));
        pt3d.SetTexture(texList[select]);
        pick.PickMove();
    }
    else {
        pt3d.SetTexture(gAtl.Frame().Pal().GetBlackTex());
        pt3d.SetColorModel(new CColor(1, 0, 0, CColor.eModel.RGBAdd));
    }





    let sca = (gVoxel.mBuf.mSize / 200) * 1.1;
    let pos = CMath.V3AddV3(pick.M2Pos(gVoxel.mBuf.mSize), gVoxel.GetPos());

    gBoxSub.SetPos(pos);
    gBoxSub.SetSca(sca);

    if (gAtl.Frame().Input().KeyUp(CInput.eKey.LButton)) {
        if (CDOM.IDValue("tileMode") == "Create")
            gVoxel.Bonds(pick, tileColors[select]);
        else
            gVoxel.Bonds(pick, 0);
    }


});
function RefreshTexList() {
    CDOM.ID("tileList").innerHTML = "";
    let html = { "tag": "div", "html": [] };

    for (let i = 0; i < texList.length; ++i) {

        html.html.push({
            "tag": "img", "src": texList[i], "title": i, "onclick": (e) => {
                let num = Number(e.target.title);
                select = num;
            }, "style": "max-width:32px;"
        });
    }
    CDOM.ID("tileList").append(CDOM.DataToDom(html));
    gVoxel.RefreshRes();

}
RefreshTexList();




let PCF = new CVec1(1.0);
var bias: number = 5;
var normalBias: number = 4;
var shadowRate = 0.7;
let forward = new CRPMgr();
let texKey = forward.PushTex("shadowread.tex", new CTexture());
let rp = forward.PushRP(new CRPAuto());
rp.PushOr(new CCondition("class", "==", "CPaintVoxel"));
rp.mPriority = CRenderPass.ePriority.BackGround + 1;
rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.ArrShadowWrite, gAtl.Frame().Pal().GetShadowWriteTex()));
rp.mShaderAttr.push(new CShaderAttr("shadowRate", shadowRate));
rp.mShaderAttr.push(new CShaderAttr("PCF", PCF));
rp.mShaderAttr.push(new CShaderAttr("bias", bias));
rp.mShaderAttr.push(new CShaderAttr("normalBias", normalBias));
rp.mShaderAttr.push(new CShaderAttr("jitter", 0.2));
rp.mShader = gAtl.Frame().Pal().SlVoxelKey();
rp.mRenderTarget = "shadowread.tex";
rp.mTag.add("shadowRead");

rp = forward.PushRP(new CRPAuto());
rp.PushOr(new CCondition("class", "==", "CPaintVoxel"));
rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.SingleShadowRead, "shadowread.tex"));
rp.mShaderAttr.push(new CShaderAttr("shadowOn", new CVec1(SDF.eTexSlot.SingleShadowRead)));
rp.mShader = gAtl.Frame().Pal().SlVoxelKey();
rp.mTag.add("light");
Main.PushPlugin(new CCanvasPluginRPMgr(forward));



let ligSub = Main.PushSub(new CSubject());
let lig = ligSub.PushComp(new CLight());
lig.SetDirect();
lig.SetColor(new CVec3(1, 1, 1));
lig.SetShadow3D("test", 0);









































































































