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
gPF.mVersion = "forgebuild_1";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
CPlugin.PushPath('ForgeBuild','../../../plugin/ForgeBuild/');
import "../../../plugin/ForgeBuild/ForgeBuild.js"
CPlugin.PushPath('Water','../../../plugin/Water/');
import "../../../plugin/Water/Water.js"
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint

import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CMath } from "../../../Artgine/artgine/geometry/CMath.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CModal } from "../../../Artgine/artgine/basic/CModal.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CStorage } from "../../../Artgine/artgine/system/CStorage.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CUtilRender } from "../../../Artgine/artgine/render/CUtilRender.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CTerrainMap } from "../../../Artgine/artgine/app/subject/CTerrainMap.js";
import { CComponent } from "../../../Artgine/artgine/app/component/CComponent.js";
import { CDayCycle, CLightPlanet } from "../../../Artgine/artgine/app/component/CLightPlanet.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CWind } from "../../../Artgine/artgine/app/component/CWind.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CPaintCube } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CProbe } from "../../../Artgine/artgine/app/subject/CProbe.js";
import { CForgeScene, IForgeWall } from "../../../plugin/ForgeBuild/CForgeScene.js";
import { CForgeHistory } from "../../../plugin/ForgeBuild/CForgeHistory.js";
import { CForgeTerrain } from "./CForgeTerrain.js";
import { CForgeCamCon } from "./CForgeCamCon.js";
import { CForgeSync } from "./CForgeSync.js";
import { CForgeTheme } from "../../../plugin/ForgeBuild/CForgeTheme.js";
import { CForgeInspect } from "./CForgeInspect.js";
import { CForgeAdjust } from "../../../plugin/ForgeBuild/CForgeAdjust.js";
import { CForgeWallGen } from "../../../plugin/ForgeBuild/CForgeWallGen.js";
import { CForgeHandle } from "./CForgeHandle.js";
import { CForgeSample } from "./CForgeSample.js";
import { CForgeGeoTest } from "../../../plugin/ForgeBuild/CForgeGeoTest.js";
import { CWater3D } from "../../../plugin/Water/Water.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CRPAuto } from "../../../Artgine/artgine/app/canvas/CRPMgr.js";
import { CCondition } from "../../../Artgine/artgine/util/CCondition.js";
import { CForgeFlora } from "./CForgeFlora.js";


const U = CForgeScene.sUnit;
const Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
const gCam = gAtl.Brush().GetCam3D();
gCam.SetFar(80000);
gCam.SetNear(10);

const gShadow = Main.PushSub(new CSubject()).PushComp(new class CForgeShadowParam extends CComponent {
    PCF = new CVec1(4);
    PCFStep = new CVec1(1.5);
    bias = new CVec1(1);
    normalBias = new CVec1(0.6);
    shadowRate = new CVec1(0.0);
    jitter = new CVec1(1);
    ambient = new CVec3(0.42, 0.48, 0.6);
});
{
    gAtl.Brush().EnsureDefaultRP();
    for(const key of ["ShadowRead_3D", "ShadowRead_Terrain"])
    {
        const rp = gAtl.Brush().FindAutoRP(key);
        rp.mShaderAttr.push(new CShaderAttr("PCF", gShadow.PCF));
        rp.mShaderAttr.push(new CShaderAttr("PCFStep", gShadow.PCFStep));
        rp.mShaderAttr.push(new CShaderAttr("bias", gShadow.bias));
        rp.mShaderAttr.push(new CShaderAttr("normalBias", gShadow.normalBias));
        rp.mShaderAttr.push(new CShaderAttr("shadowRate", gShadow.shadowRate));
        rp.mShaderAttr.push(new CShaderAttr("jitter", gShadow.jitter));
    }
    //원거리 나무 빌보드(Forward_2D)도 같은 환경광을 받아야 3D 나무와 밝기가 맞는다
    for(const key of ["Forward_3D", "Forward_Terrain", "Forward_Shadow_3D", "Forward_Shadow_Terrain", "Forward_2D"])
        gAtl.Brush().FindAutoRP(key).mShaderAttr.push(new CShaderAttr("ambientColor", gShadow.ambient));

    //얇은 잎 카드는 그림자 맵에 자기 자신이 찍혀 판째 어두워진다. 나무는 그림자를 드리우기만 하고 받지 않는 Forward_3D 복제 패스로 그린다.
    //shadowOn을 0으로 주지 않으면 같은 셰이더 그림자 패스가 남긴 유니폼 1이 남아 화면 그림자 값을 읽는다
    const fwd = gAtl.Brush().FindAutoRP("Forward_3D");
    const leaf = fwd.Export() as CRPAuto;
    leaf.mShaderAttr = [...fwd.mShaderAttr, new CShaderAttr("shadowOn", new CVec1(0))];
    leaf.mAnd = leaf.mAnd.filter(_c => _c.mState != "mTag[shadow]");
    leaf.PushAnd(new CCondition("mTag[leafNoSR]", "==", true));
    gAtl.Brush().PushAutoRP("Forward_Leaf_3D", leaf);
    for(const key of ["Forward_Shadow_3D", "ShadowRead_3D"])
        gAtl.Brush().FindAutoRP(key).PushAnd(new CCondition("mTag[leafNoSR]", "!=", true));
}

const gSky = Main.PushSub(new CSubject());
gSky.PushComp(new CPaintCube("")).Sky(true, true, true, false, false);
const gEnv = Main.PushSub(new CSubject());
gEnv.PushComp(new CWind());

const gSun = Main.PushSub(new CSubject());
{
    gSun.SetKey("sun");
    const dir = CMath.V3Nor(new CVec3(0.62, 0.48, 0.38));
    gSun.SetPos(dir);
    const lig = gSun.PushComp(new CLightPlanet());
    lig.Push(new CDayCycle(dir, new CColor(1.2, 1.04, 0.86)));
    lig.Push(new CDayCycle(new CVec3(0, -1, 0), new CColor(0, 0, 0)));
    lig.SetShadow3D("shadow", 0.001, 0.001, 0.033);
    lig.SetCascadeTexelThreshold(12);
    lig.SetShadowDistance(20000);
    lig.mCascadeDivide = [1500, 5000, 16000];
}

const gScene = new CForgeScene(LoadSeed());
const gHistory = new CForgeHistory(gScene);
const gTerrainGen = new CForgeTerrain();
gTerrainGen.Build(gScene.mSeed);

const gTerrain = Main.PushSub(new CTerrainMap());
{
    const mesh = CUtilRender.CMeshCreateInfoToCMesh(CUtilRender.GetTerrain(new CVec2(64, 64), 0), gAtl.Frame().Pal().GetBlackTex());
    gAtl.Frame().Pal().mTerrain = mesh.meshTree.mData.ci;
    CUtilRender.MeshBoundUpdate(mesh);
    gTerrain.SetLevel([1, 1, 1]);
    gTerrain.mTag.add(CPaint.eTag.Light);
    gTerrain.mTag.add(CPaint.eTag.Shadow);
    gTerrainGen.Write(gTerrain);
    gTerrain.ClearAll();
}

const gWater = Main.PushSub(new CWater3D());
{
    const S = CForgeScene.sSize * U;
    gWater.SetRot(new CVec3(-Math.PI / 2, 0, 0));
    gWater.SetSca(new CVec3(S, S, 1));
    gWater.SetPos(new CVec3(S * 0.5, CForgeTerrain.sWaterY * U, S * 0.5));
    gWater.Light();
    gWater.GetPT().SetTexCodi(new CVec4(S / 400, S / 400, 0, 0));
    gWater.SetWaterDeep(150, 0, 6000, new CVec3(0.1, 0.27, 0.3), new CVec3(0.36, 0.55, 0.48));
    gWater.NormalFlow(new CVec2(0.1, 0.5));
}

const gFlora = new CForgeFlora(Main, gTerrain, gTerrainGen, gScene);
gFlora.mCam = gCam;
gFlora.mSun = gSun.FindComp(CLightPlanet);
gFlora.mAmbient = gShadow.ambient;

const gCamCon = new CForgeCamCon(gAtl.Frame().Input());
gCamCon.mBoundMax = CForgeScene.sSize * U;
gCamCon.mGroundY = (_x, _z) => gTerrainGen.WorldY(_x / U, _z / U);
gCamCon.Look(new CVec3(CForgeScene.sSize * 0.5 * U, 0, CForgeScene.sSize * 0.5 * U), 0.6, 0.4, 8500, true);
gCam.SetCamCon(gCamCon);

const gView = new CForgeSync(gScene, gTerrainGen, Main);
//타입 목록: 양식 → 시대 순, 표시 이름은 타입이 가진 이름
const gTypeKeys = [...CForgeTheme.sList.keys()].sort((_a, _b) => { const A = CForgeTheme.Get(_a), B = CForgeTheme.Get(_b); return A.mCulture - B.mCulture || A.mEra - B.mEra || A.mLabel.localeCompare(B.mLabel); });
const gHandle =gEnv.PushComp(new CForgeHandle(gScene, gHistory, gTerrainGen, gView, Main, gCam, gCamCon));

function LoadSeed() : number
{
    const s = Number(CStorage.Get("ForgeBuild_seed", "1"));
    return s > 0 ? s : 1;
}

let gLog = "";
function Log(_msg : string) { gLog = _msg; }

function Undo() { const l = gHistory.Undo(); Log(l == null ? "되돌릴 작업 없음" : `실행 취소: ${l}`); }
function Redo() { const l = gHistory.Redo(); Log(l == null ? "다시 할 작업 없음" : `다시 실행: ${l}`); }
function AddSample()
{
    const n = gScene.Count(CForgeScene.eKind.Wall);
    const c : [number, number] = [[64, 64], [30, 34], [30, 94], [64, 24], [64, 104]][n % 5] as [number, number];
    CForgeSample.Random(gHistory, gScene.mSeed * 31 + n + 1, c, gTerrainGen);
    Log(`샘플 추가 (해시 ${gScene.Hash().toString(16)})`);
}

//P1 완료 기준: 저장→불러오기 해시 동일, 같은 시드 샘플 동일, 실행 취소/다시 실행 후 해시 복원
function SelfTest() : string
{
    const out : string[] = [];
    const ok = (_name : string, _v : boolean) => out.push(`${_v ? "✔" : "✘"} ${_name}`);

    const copy = new CForgeScene();
    copy.ImportJson(gScene.ExportJson());
    ok("저장→불러오기 해시 동일", copy.Hash() == gScene.Hash());

    const a = new CForgeScene(77), b = new CForgeScene(77);
    CForgeSample.Random(new CForgeHistory(a), 1234);
    CForgeSample.Random(new CForgeHistory(b), 1234);
    ok("같은 시드 → 같은 장면", a.Hash() == b.Hash());

    const c = new CForgeScene(78);
    CForgeSample.Random(new CForgeHistory(c), 1234);
    ok("다른 장면 시드 → 개체 시드 다름", a.Hash() != c.Hash());

    const h = new CForgeHistory(a);
    const h0 = a.Hash();
    CForgeSample.Random(h, 99);
    const h1 = a.Hash();
    h.Undo();
    ok("실행 취소 후 원래 해시", a.Hash() == h0);
    h.Redo();
    ok("다시 실행 후 같은 해시", a.Hash() == h1);

    const wall = CForgeScene.Clone(a.List(CForgeScene.eKind.Wall)[0]) as any;
    h.Begin("drag");
    for(let i = 0; i < 10; i++) { wall.pts[0][2] += 0.5; h.Push(CForgeScene.eKind.Wall, wall); }
    h.End();
    const h2 = a.Hash();
    h.Undo();
    ok("드래그 10번 → 실행 취소 1번에 복원", a.Hash() == h1);
    h.Redo();
    ok("드래그 다시 실행", a.Hash() == h2);

    //작은 수정 → 작은 변화: 열린 벽 끝점을 0.5m 옮겨도 앞쪽 형상(정점)은 대부분 그대로여야 한다
    const sc = new CForgeScene(5), sh = new CForgeHistory(sc), flat = () => 0;
    const w0 = sh.Push<IForgeWall>(CForgeScene.eKind.Wall, { id : 0, seed : 0, pts : [[20, 20, 6], [40, 22, 7], [60, 30, 6], [80, 28, 8]], thick : 1.2, style : 0 });
    const Keys = (_w : IForgeWall) => { const s = new Set<string>(); for(const p of CForgeWallGen.Build(CForgeAdjust.Wall(_w, sc), flat)) for(let i = 0; i < p.buf.mPos.length; i += 3) s.add(`${Math.round(p.buf.mPos[i])},${Math.round(p.buf.mPos[i + 1])},${Math.round(p.buf.mPos[i + 2])}`); return s; };
    const k0 = Keys(w0), w1 = CForgeScene.Clone(w0);
    w1.pts[3][0] += 0.5;
    const k1 = Keys(w1);
    let same = 0;
    for(const k of k0) if(k1.has(k)) same++;
    const ratio = same / Math.max(1, k0.size);
    ok(`끝점 0.5m 이동 → 정점 ${(ratio * 100).toFixed(0)}% 유지 (기준 50%)`, ratio > 0.5);

    return out.join("<br>");
}

//반지름 0은 무한거리라 공중에 있어도 벽이 구 밖으로 잘리지 않는다. 같은 높이의 격자 중 가장 가까운 큐브맵을 쓴다
const gProbe : CProbe[] = [];
{
    const n = 3, y = 30 * U;
    for(let j = 0; j < n; j++)
    for(let i = 0; i < n; i++)
    {
        const probe = Main.PushSub(new CProbe());
        probe.SetKey("sky" + i + j);
        probe.SetPos(new CVec3((i + 0.5) * CForgeScene.sSize / n * U, y, (j + 0.5) * CForgeScene.sSize / n * U));
        probe.GetEnvMap().mRadius = 0;
        probe.GetEnvMap().mSize = 128;
        probe.GetEnvMap().SetEnable(false);
        gProbe.push(probe);
    }
}

class CForgeUpdater extends CComponent
{
    override Update(_update : CUpdate) : void
    {
        super.Update(_update);
        const input = gAtl.Frame().Input();
        if(input.KeyDown(CInput.eKey.LControl))
        {
            if(input.KeyDown(CInput.eKey.Z, true))
            {
                if(input.KeyDown(CInput.eKey.Shift)) Redo();
                else Undo();
            }
            else if(input.KeyDown(CInput.eKey.Y, true)) Redo();
        }
        if(gView.Update())
            for(const p of gProbe) p.GetEnvMap().UpdateAllEnvMap();
        gFlora.Update();
    }
}
gEnv.PushComp(new CForgeUpdater());

{
    const panel = new CModal("ForgePanel");
    panel.SetTitle(CModal.eTitle.None);
    panel.SetResize(false);
    panel.SetLimitPush(true);
    panel.SetBG("transparent");
    panel.SetSize(290, 260);
    panel.SetBody(`
<div style="pointer-events:auto;background:rgba(255,250,240,0.86);backdrop-filter:blur(8px);border-radius:14px;padding:14px 16px;color:#4a3b2a;font-size:13px;box-shadow:0 6px 24px rgba(60,40,20,0.18);">
  <div id="forge_title" class="d-flex justify-content-between align-items-start" style="margin-bottom:10px;">
    <div><div style="font-size:11px;letter-spacing:3px;color:#b07a45;">FORGE BUILD · 1차</div><div style="font-size:16px;margin-top:2px;">자동 조정 생성기</div></div>
    <button id="forge_fold" class="btn btn-sm btn-outline-secondary py-0" title="패널 접기·펼치기">－</button>
  </div>
  <div id="forge_body">
  <div class="d-grid gap-1 mb-2">
    <div class="btn-group"><button class="btn btn-sm btn-outline-secondary" data-act="sample">샘플 추가</button><button class="btn btn-sm btn-outline-secondary active" data-act="handle" id="forge_handle">핸들 보기</button></div>
    <select id="forge_preset" class="form-select form-select-sm"><option value="">테스트 장면 불러오기…</option>${CForgeSample.sPresets.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select>
    <div class="d-flex align-items-center gap-2"><span style="white-space:nowrap">타입</span><select id="forge_theme" class="form-select form-select-sm">${gTypeKeys.map(k => `<option value="${k}">${CForgeTheme.Get(k).mLabel}</option>`).join("")}</select></div>
    <div class="d-flex gap-3">${[["mNormal", "노말"], ["mMaterial", "재질"], ["mParallax", "패럴랙스"]].map(([k, n]) => `<label style="white-space:nowrap"><input type="checkbox" class="form-check-input me-1" data-surf="${k}" checked>${n}</label>`).join("")}</div>
    <div class="d-flex gap-3"><label style="white-space:nowrap"><input type="checkbox" class="form-check-input me-1" id="forge_flora" checked>식생(풀·나무·돌)</label><label style="white-space:nowrap"><input type="checkbox" class="form-check-input me-1" id="forge_real">실사</label></div>
  </div>
  </div>
</div>`);
    panel.Open(CModal.ePos.TopRight);
    const fold = document.getElementById("forge_fold"), body = document.getElementById("forge_body"), title = document.getElementById("forge_title");
    const SetFold = (_fold : boolean) => {
        body.style.display = _fold ? "none" : "";
        title.style.marginBottom = _fold ? "0" : "10px";
        fold.textContent = _fold ? "☰" : "－";
        panel.SetSize(_fold ? 220 : 290, _fold ? 80 : 260);
    };
    fold.onclick = () => { SetFold(body.style.display != "none"); gAtl.Frame().Win().Handle().focus(); };
    const insp = new CModal("ForgeInspect");
    insp.SetTitle(CModal.eTitle.None);
    insp.SetResize(false);
    insp.SetBG("transparent");
    insp.SetSize(300, 300);
    insp.SetBody(`<div style="pointer-events:auto;background:rgba(255,250,240,0.9);backdrop-filter:blur(8px);border-radius:14px;padding:4px 14px 12px;color:#4a3b2a;font-size:13px;box-shadow:0 6px 24px rgba(60,40,20,0.18);">
  <div id="forge_sel" style="padding-top:6px;color:#8a7a66;">핸들을 누르면 그 오브젝트의 재질·색을 바꿀 수 있습니다</div></div>`);
    insp.Open(CModal.ePos.BottomLeft);
    const inspect = new CForgeInspect(document.getElementById("forge_sel"), gScene, gHistory, gView, gHandle);
    //검사창은 선택한 오브젝트가 있을 때만 띄운다(빈 곳 클릭·삭제·실행 취소로 사라지면 숨김). Show가 창에 포커스를 가져가므로 캔버스로 되돌린다
    const SyncInsp = () => {
        const s = gHandle.mSel, on = s != null && gScene.Find(s.kind, s.id) != null;
        if(on == insp.mShow) return;
        if(on) { insp.Show(); setTimeout(() => gAtl.Frame().Win().Handle().focus(), 20); }
        else insp.Hide();
    };
    const onSel = gHandle.mOnSelect;
    gHandle.mOnSelect = () => { onSel?.(); SyncInsp(); };
    insp.Hide(0);

    const acts : Record<string, () => void> = {
        sample : AddSample,
        handle : () => { gHandle.mShow = !gHandle.mShow; document.getElementById("forge_handle").classList.toggle("active", gHandle.mShow); },
    };
    panel.GetBody().querySelectorAll<HTMLElement>("[data-act]").forEach((_b) => {
        _b.onclick = () => { acts[_b.dataset.act](); gAtl.Frame().Win().Handle().focus(); };
    });
    const theme = document.getElementById("forge_theme") as HTMLSelectElement;
    const flora = document.getElementById("forge_flora") as HTMLInputElement;
    //지형 색은 초기화 때 레이어 텍스처에 구워진다. 스플랫이 참조하는 CVec4 값을 바꾸고 ClearAll로 다음 프레임에 레이어를 다시 굽게 한다
    const SetGround = (_key : string) => {
        const T = CForgeTheme.Get(_key), [g0, g1] = T.mGround, G = CForgeTerrain.sGrass;
        if(Math.abs(G.x - g0[0]) + Math.abs(G.y - g0[1]) + Math.abs(G.z - g0[2]) > 1e-3)
        {
            for(const [v, c] of [[G, g0], [CForgeTerrain.sGrassDeep, g1]] as [CVec4, number[]][]) { v.x = c[0]; v.y = c[1]; v.z = c[2]; }
            gTerrain.ClearAll();
        }
        if(flora.checked == T.mArid) flora.click();
    };
    theme.onchange = () => { gView.SetTheme(theme.value); SetGround(theme.value); Log(`타입: ${CForgeTheme.Get(theme.value).mLabel}`); gAtl.Frame().Win().Handle().focus(); };
    window["ForgeSetTheme"] = (_key : string) => { theme.value = _key; theme.onchange(null); };
    panel.GetBody().querySelectorAll<HTMLInputElement>("[data-surf]").forEach((_c) => {
        _c.onchange = () => { gView.SetSurf(_c.dataset.surf as any, _c.checked); Log(`${_c.parentElement.textContent}: ${_c.checked ? "켬" : "끔"}`); gAtl.Frame().Win().Handle().focus(); };
    });
    flora.onchange = () => { gFlora.SetEnable(flora.checked); Log(`식생: ${flora.checked ? "켬" : "끔"}`); gAtl.Frame().Win().Handle().focus(); };
    const real = document.getElementById("forge_real") as HTMLInputElement;
    real.onchange = () => {
        gView.SetPBR(real.checked); gView.SetReal(real.checked);
        gFlora.SetPBR(real.checked); gFlora.SetReal(real.checked);
        gTerrainGen.ApplyLook(gTerrain, real.checked);
        for(const p of gProbe) p.GetEnvMap().SetEnable(real.checked);
        Log(`실사: ${real.checked ? "켬" : "끔"}`);
        gAtl.Frame().Win().Handle().focus();
    };
    const preset = document.getElementById("forge_preset") as HTMLSelectElement;
    preset.onchange = () => {
        if(preset.value == "") return;
        CForgeSample.Preset(gHistory, gScene, preset.value);
        Log(`테스트 장면: ${preset.selectedOptions[0].text} (실행 취소 가능)`);
        preset.value = "";
        gAtl.Frame().Win().Handle().focus();
    };
    setInterval(() => {
        inspect.Refresh();
        SyncInsp();
    }, 300);
}

AddSample();
gHistory.Clear();
Log("시작 샘플 1개");

window["gScene"] = gScene;
window["gHistory"] = gHistory;
window["gTerrainGen"] = gTerrainGen;
window["gCamCon"] = gCamCon;
window["gAtl"] = gAtl;
window["ForgeSelfTest"] = SelfTest;
window["ForgeGeoTest"] = CForgeGeoTest;
window["gView"] = gView;
window["gWater"] = gWater;
window["gHandle"] = gHandle;
window["gFlora"] = gFlora;
window["gCam"] = gCam;
