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
gPF.mServer = 'local';
gPF.mGitHub = false;
gPF.mVersion = "mtwh45gn_7";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init(['Main.json'],"");
var Main = gAtl.Canvas('Main.json');
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint

import {CObject} from "../../../Artgine/artgine/basic/CObject.js"
import { CCamCon3DThirdPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D, CPaintCube } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CDOM } from "../../../Artgine/artgine/basic/CDOM.js";
import { CWebView } from "../../../Artgine/artgine/system/CWebView.js";
import { CUniqueID } from "../../../Artgine/artgine/basic/CUniqueID.js";
import { CLoaderOption } from "../../../Artgine/artgine/util/CLoader.js";
import { CConfirm, CModal } from "../../../Artgine/artgine/basic/CModal.js";
import { CBase64File } from "../../../Artgine/artgine/util/CBase64File.js";
import { CMesh } from "../../../Artgine/artgine/render/CMesh.js";
import { CAlert } from "../../../Artgine/artgine/basic/CAlert.js";
import { CAniFlow } from "../../../Artgine/artgine/app/component/CAniFlow.js";
import { CAnimation, CClipMesh } from "../../../Artgine/artgine/app/component/CAnimation.js";
import { CTexture } from "../../../Artgine/artgine/render/CTexture.js";
import { CDrop } from "../../../Artgine/artgine/basic/CModal.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CModalFlex, CModalFrameView } from "../../../Artgine/artgine/util/CModalUtil.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
import { CRPAuto, CRPMgr } from "../../../Artgine/artgine/app/canvas/CRPMgr.js";
import { CCanvasPluginRPMgr } from "../../../Artgine/artgine/app/canvas/CCanvasPluginRPMgr.js";
import { CCondition } from "../../../Artgine/artgine/util/CCondition.js";
import { CRenderPass } from "../../../Artgine/artgine/render/CRenderPass.js";
import { SDF } from "../../../Artgine/artgine/z_file/SDF.js";
import { CConsol } from "../../../Artgine/artgine/basic/CConsol.js";
import { CVertexFormat } from "../../../Artgine/artgine/render/CShader.js";
import { CMeshBuf } from "../../../Artgine/artgine/render/CMeshCreateInfo.js";
import { CTree } from "../../../Artgine/artgine/basic/CTree.js";
import { CMeshCopyNode } from "../../../Artgine/artgine/render/CMeshCopyNode.js";
import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { CMeshTreeUpdate } from "../../../Artgine/artgine/render/CMeshTreeUpdate.js";
import { CBound } from "../../../Artgine/artgine/geometry/CBound.js";
import { CMath } from "../../../Artgine/artgine/geometry/CMath.js";
import { CUtilWeb } from "../../../Artgine/artgine/util/CUtilWeb.js";
import { CFile } from "../../../Artgine/artgine/system/CFile.js";
import { CUtil } from "../../../Artgine/artgine/basic/CUtil.js";
import { CIframeMsg } from "../../../Artgine/artgine/server/html/CIframeMsg.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
const camcon=new CCamCon3DThirdPerson(gAtl.Frame().Input());
gAtl.Brush().GetCam3D().SetCamCon(camcon);
gAtl.Brush().GetCam3D().Init(new CVec3(-66, 350, 300), new CVec3(0, 0, 0));
camcon.SetPos(new CVec3());

const modelURL = CUtilWeb.Parameter("model", null);
// modelURL이 순수 base64(데이터 URI 접두어 없이)일 때 확장자를 알려주기 위한 보조 파라미터. 예: ?model=<base64>&modelExt=glb
const modelExt = CUtilWeb.Parameter("modelExt", null);

const rpPlug=new CCanvasPluginRPMgr(null);
Main.PushPlugin(rpPlug);
const forward=new CRPMgr();
rpPlug.SetRPMgr(forward);
forward.PushTex(gAtl.Frame().Pal().GetShadowReadTex(),new CTexture());

let rp=forward.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class","==","CPaint3D"));
rp.PushAnd(new CCondition("mTag[shadow]"));
rp.mPriority=CRenderPass.ePriority.BackGround+1;
rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.ArrShadowWrite,gAtl.Frame().Pal().GetShadowWriteTex()));
rp.mAlpha=false;
rp.mShader=gAtl.Frame().Pal().Sl3DKey();
rp.mRenderTarget=gAtl.Frame().Pal().GetShadowReadTex();
rp.mTag.add("shadowRead");

rp=forward.PushRP(new CRPAuto());
rp.PushAnd(new CCondition("class","==","CPaint3D"));
rp.mShaderAttr.push(new CShaderAttr("shadowOn", 1));
rp.mShaderAttr.push(new CShaderAttr(SDF.eTexSlot.SingleShadowRead,gAtl.Frame().Pal().GetShadowReadTex()));
rp.mShader=gAtl.Frame().Pal().Sl3DKey();

const ligObj = Main.PushSub(new CSubject());
ligObj.SetPos(new CVec3(0, 1, 0));
const lig = ligObj.PushComp(new CLight());
lig.SetDirect();
lig.mShadowDistance = 1;
const floorObj = Main.PushSub(new CSubject());
floorObj.SetPos(new CVec3(0, -75, 0));
floorObj.SetRot(new CVec3(-Math.PI/2, 0, 0));
floorObj.SetSca(new CVec3(10000, 10000, 10000));
const floorPaint = floorObj.PushComp(new CPaint3D(gAtl.Frame().Pal().GetPlaneMesh()));
floorPaint.SetColorModel(new CColor(0.3, 0.3, 0.3, CColor.eModel.RGBAdd));
const skyObj = Main.PushSub(new CSubject());
const cubePaint = skyObj.PushComp(new CPaintCube(""));
cubePaint.Sky();
cubePaint.SetColorModel(new CColor(0.3, 0.3, 0.3, CColor.eModel.RGBAdd));

const obj = Main.PushSub(new CSubject());
const paint = obj.PushComp(new CPaint3D(gAtl.Frame().Pal().GetBoxMesh(), true, 100));
const leftSubjects: { subject: CSubject, paint: CPaint3D, aniflow: CAniFlow, autoAdded?: boolean }[] = [];

function recalcAndApplyBounds() {
    if (!paint || !paint.mMesh) return;
    
    let bound = new CBound();
    let mesh = gAtl.Frame().Res().Find(paint.mMesh) as CMesh;
    if (mesh) {
        const tree = new CTree<CMeshCopyNode>();
        tree.mData = new CMeshCopyNode();
        CMeshTreeUpdate.TreeCopy(mesh.meshTree, tree, new CMat(), bound);
    }

    let combinedBound = new CBound();
    combinedBound.mType = CBound.eType.Box;
    combinedBound.InitBound(bound);

    if (leftSubjects.length > 0) {
        for (let ls of leftSubjects) {
            let lsBound = new CBound();
            lsBound.mType = CBound.eType.Box;
            let lsMesh = gAtl.Frame().Res().Find(ls.paint.mMesh) as CMesh;
            if (lsMesh) {
                const lsTree = new CTree<CMeshCopyNode>();
                lsTree.mData = new CMeshCopyNode();
                CMeshTreeUpdate.TreeCopy(lsMesh.meshTree, lsTree, new CMat(), lsBound);
                combinedBound.InitBound(lsBound);
            }
        }

        let combinedSize = combinedBound.GetSize();
        let maxSize = CMath.Max(CMath.Max(combinedSize.x, combinedSize.y), combinedSize.z);
        let targetScale = 100;
        let scale = maxSize === 0 ? 1 : targetScale / maxSize;

        let targetLMat = new CMat();
        targetLMat.mF32A[0] = scale;
        targetLMat.mF32A[5] = scale;
        targetLMat.mF32A[10] = scale;
        let center = combinedBound.GetCenter();
        targetLMat.SetV3(3, CMath.V3MulV3(center, new CVec3(-scale, -scale, -scale)));
        targetLMat.UnitCheck();

        paint.mCenterPos = false;
        paint.mTargetScale = 0;
        paint.SetLMat(targetLMat);

        for (let ls of leftSubjects) {
            ls.paint.mCenterPos = false;
            ls.paint.mTargetScale = 0;
            ls.paint.SetLMat(targetLMat);
        }
    } else {
        paint.mCenterPos = true;
        paint.mTargetScale = 100;
        paint.ExeLocalMat();
    }
}


// ====================================================
// [Animation Section Start] - 애니메이션 컴포넌트 및 타임라인 UI 생성
// ====================================================
// Add UI Overlay with Buttons
const topToolbar = document.createElement("div");
topToolbar.className = "position-fixed start-50 translate-middle-x d-flex gap-2 p-2 mt-2";
topToolbar.style.top = "env(safe-area-inset-top, 0px)";
topToolbar.style.zIndex = "999999"; // Increased fundamentally to stay above all modals/offcanvas
topToolbar.innerHTML = `
    <button id="btnLoadModel" class="btn btn-primary shadow-sm">
        <i class="bi bi-folder2-open"></i> Load Model
    </button>
    <input type="file" id="fileInput" multiple accept=".gltf,.fbx,.glb,.obj,.png,.jpg,.jpeg,.bin" class="d-none" />
    
    <button class="btn btn-dark shadow-sm" id="btnToggleTimeline" type="button" data-bs-toggle="offcanvas" data-bs-target="#aniWindow" style="display: none;">
        <i class="bi bi-film"></i> Timeline
    </button>
    <button class="btn btn-dark shadow-sm" id="btnToggleInspector" type="button" data-bs-toggle="offcanvas" data-bs-target="#inspectorWindow">
        <i class="bi bi-info-circle"></i> Inspector
    </button>
`;
document.body.appendChild(topToolbar);

const btnLoadModel = topToolbar.querySelector("#btnLoadModel") as HTMLButtonElement;
const fileInput = topToolbar.querySelector("#fileInput") as HTMLInputElement;

btnLoadModel.onclick = () => { fileInput.click(); };

fileInput.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    let drop = new CDrop();
    drop.mFiles = Array.from(files) as any;
    drop.mPaths = [];

    await handleModelDrop(drop);
    fileInput.value = "";
};

const aniflow = obj.PushComp(new CAniFlow());
aniflow.SetAni(new CAnimation([new CClipMesh(0, 1000 / 600, 0, 1000)]));
const aniWindow = document.createElement("div");
aniWindow.id = "aniWindow";
aniWindow.className = "offcanvas offcanvas-bottom text-bg-dark border-top border-secondary";
aniWindow.setAttribute("tabindex", "-1");
aniWindow.setAttribute("data-bs-backdrop", "false");
aniWindow.setAttribute("data-bs-scroll", "true");
aniWindow.style.height = "250px";
aniWindow.style.zIndex = "1000000";

const aniHeader = document.createElement("div");
aniHeader.className = "offcanvas-header py-2 border-bottom border-secondary";
aniHeader.innerHTML = `
    <h6 class="offcanvas-title mb-0"><i class="bi bi-film"></i> Animation Timeline</h6>
    <div id="speedContainer" class="d-flex align-items-center ms-4 me-auto">
        <span id="speedLabel" class="me-2 small">Speed: 1.0x</span>
        <input type="range" id="speedSlider" class="form-range" min="0" max="5" step="0.1" value="1" style="width:100px;">
    </div>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
`;

aniWindow.appendChild(aniHeader);

document.body.appendChild(aniWindow); // temporary append to get elements by ID
const speedSlider = document.getElementById("speedSlider") as HTMLInputElement;
const speedLabel = document.getElementById("speedLabel") as HTMLSpanElement;

speedSlider.oninput = (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    aniflow.mSpeed = val;
    for (let ls of leftSubjects) {
        ls.aniflow.mSpeed = val;
    }
    speedLabel.innerText = `Speed: ${val.toFixed(1)}x`;
};

const aniContent = document.createElement("div");
aniContent.id = "aniContent";
aniContent.className = "d-flex flex-grow-1 w-100 h-100 overflow-hidden";

const aniList = document.createElement("div");
aniList.id = "aniList";
aniList.className = "bg-dark text-white overflow-auto border-end border-secondary d-flex flex-column";
aniList.style.width = "30%";
aniList.style.minWidth = "120px";
aniList.style.maxWidth = "250px";

const aniTimeline = document.createElement("div");
aniTimeline.id = "aniTimeline";
aniTimeline.className = "flex-grow-1 position-relative overflow-hidden bg-dark text-white";
aniTimeline.style.cursor = "pointer";
aniTimeline.style.touchAction = "none";

let isDraggingTimeline = false;

const updateTimelineFrame = (e: MouseEvent | TouchEvent) => {
    let clientX = 0;
    if ('touches' in e) {
        if (e.touches.length > 0) {
            clientX = e.touches[0].clientX;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
        } else {
            return;
        }
    } else {
        clientX = (e as MouseEvent).clientX;
    }

    const rect = aniTimeline.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = x / rect.width;
    
    if (aniflow.GetAni()) {
        const anim = aniflow.GetAni();
        if (anim && anim.mClip && anim.mClip.length > 0) {
            const clip = anim.mClip[0] as CClipMesh;
            const total = clip.mDelay;
            if (total > 0) {
                aniflow.mTime = total * pct;
                for (let ls of leftSubjects) {
                    ls.aniflow.mTime = total * pct;
                }
            }
        }
    }
};

aniTimeline.onmousedown = (e) => {
    isDraggingTimeline = true;
    aniflow.mSpeed = 0;
    aniflow.mPlay = true;
    for (let ls of leftSubjects) {
        ls.aniflow.mSpeed = 0;
        ls.aniflow.mPlay = true;
    }
    updateTimelineFrame(e);
};

aniTimeline.onmousemove = (e) => {
    if (isDraggingTimeline) {
        updateTimelineFrame(e);
    }
};

aniTimeline.onmouseup = (e) => {
    if (isDraggingTimeline) {
        isDraggingTimeline = false;
        aniflow.mSpeed = 1;
        for (let ls of leftSubjects) {
            ls.aniflow.mSpeed = 1;
        }
    }
};

aniTimeline.onmouseleave = (e) => {
    if (isDraggingTimeline) {
        isDraggingTimeline = false;
        aniflow.mSpeed = 1;
        for (let ls of leftSubjects) {
            ls.aniflow.mSpeed = 1;
        }
    }
};

aniTimeline.ontouchstart = (e) => {
    isDraggingTimeline = true;
    aniflow.mSpeed = 0;
    aniflow.mPlay = true;
    for (let ls of leftSubjects) {
        ls.aniflow.mSpeed = 0;
        ls.aniflow.mPlay = true;
    }
    updateTimelineFrame(e);
};

aniTimeline.ontouchmove = (e) => {
    if (isDraggingTimeline) {
        updateTimelineFrame(e);
        e.preventDefault();
    }
};

aniTimeline.ontouchend = (e) => {
    if (isDraggingTimeline) {
        isDraggingTimeline = false;
        aniflow.mSpeed = 1;
        for (let ls of leftSubjects) {
            ls.aniflow.mSpeed = 1;
        }
    }
};

aniTimeline.ontouchcancel = (e) => {
    if (isDraggingTimeline) {
        isDraggingTimeline = false;
        aniflow.mSpeed = 1;
        for (let ls of leftSubjects) {
            ls.aniflow.mSpeed = 1;
        }
    }
};

const aniCursor = document.createElement("div");
aniCursor.id = "aniCursor";
aniCursor.className = "position-absolute top-0 bottom-0 bg-danger pe-none";
aniCursor.style.width = "2px";
aniCursor.style.left = "0%";
aniCursor.style.zIndex = "10";

aniTimeline.appendChild(aniCursor);
aniContent.appendChild(aniList);
aniContent.appendChild(aniTimeline);
aniWindow.appendChild(aniHeader);
aniWindow.appendChild(aniContent);

document.body.appendChild(aniWindow);

// Removed separate timeline toggle button

function renderTimeline(start: number, end: number) {
    const timeline = CDOM.ID('aniTimeline');
    Array.from(timeline.children).forEach(c => {
        if (c.id !== 'aniCursor') timeline.removeChild(c);
    });
    
    const duration = end - start;
    if (duration <= 0) return;
    
    let tickCount = Math.min(duration, 50);
    if (tickCount < 5) tickCount = 5;
    const step = duration / tickCount;
    
    for (let i = 0; i <= tickCount; i++) {
        const val = start + i * step;
        const leftPct = (i / tickCount) * 100;
        
        const tick = document.createElement("div");
        tick.className = "position-absolute bottom-0 bg-secondary";
        tick.style.left = `${leftPct}%`;
        tick.style.top = i % 5 === 0 ? "15px" : "22px";
        tick.style.width = "1px";
        timeline.appendChild(tick);
        
        if (i % 5 === 0) {
            const label = document.createElement("span");
            label.innerText = Math.round(val).toString();
            label.className = "position-absolute top-0 text-secondary text-center translate-middle-x";
            label.style.left = `${leftPct}%`;
            label.style.fontSize = "10px";
            timeline.appendChild(label);
        }
    }
}
// ====================================================
// [Animation Section End]
// ====================================================

// ====================================================
// [Inspector Section Start] - Unity 스타일 속성창
// ====================================================
const inspectorWindow = document.createElement("div");
inspectorWindow.id = "inspectorWindow";
inspectorWindow.className = "offcanvas offcanvas-end text-bg-dark border-start border-secondary";
inspectorWindow.setAttribute("tabindex", "-1");
inspectorWindow.setAttribute("data-bs-backdrop", "false");
inspectorWindow.setAttribute("data-bs-scroll", "true");
inspectorWindow.style.width = "350px";
inspectorWindow.style.zIndex = "1000000";

const inspectorHeader = document.createElement("div");
inspectorHeader.className = "offcanvas-header py-2 border-bottom border-secondary";
inspectorHeader.innerHTML = `
    <h6 class="offcanvas-title mb-0"><i class="bi bi-info-circle"></i> Inspector</h6>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
`;
inspectorWindow.appendChild(inspectorHeader);

const inspectorContent = document.createElement("div");
inspectorContent.className = "offcanvas-body p-2 overflow-x-hidden";

let currentOpenContent: HTMLElement | null = null;

function createAccordionItem(title: string, contentId: string) {
    const item = document.createElement("div");
    item.className = "border-bottom border-dark";
    
    const header = document.createElement("div");
    header.className = "bg-secondary bg-opacity-50 px-2 py-1 text-light fw-bold d-flex align-items-center user-select-none";
    header.style.cursor = "pointer";
    header.style.fontSize = "13px";
    
    const toggle = document.createElement("span");
    toggle.innerText = "▶";
    toggle.className = "me-2";
    toggle.style.fontSize = "10px";
    
    const titleSpan = document.createElement("span");
    titleSpan.innerText = title;
    
    header.appendChild(toggle);
    header.appendChild(titleSpan);
    
    const content = document.createElement("div");
    content.id = contentId;
    content.className = "p-2 text-light bg-dark text-break";
    content.style.display = "none";
    content.style.fontSize = "12px";
    
    header.onclick = () => {
        if (currentOpenContent && currentOpenContent !== content) {
            currentOpenContent.style.display = "none";
            const prevHeader = currentOpenContent.previousSibling as HTMLElement;
            if(prevHeader && prevHeader.firstChild) {
                (prevHeader.firstChild as HTMLElement).innerText = "▶";
            }
        }
        
        if (content.style.display === "none") {
            content.style.display = "block";
            toggle.innerText = "▼";
            currentOpenContent = content;
        } else {
            content.style.display = "none";
            toggle.innerText = "▶";
            currentOpenContent = null;
        }
    };
    
    item.appendChild(header);
    item.appendChild(content);
    return { item, content, header };
}

const { item: meshItem, content: meshContent, header: meshHeaderAcc } = createAccordionItem("Mesh Structure", "inspectorMesh");
meshContent.innerHTML = "<div>No model loaded.</div>";
const { item: multiMeshItem, content: multiMeshContent, header: multiMeshHeaderAcc } = createAccordionItem("Multi Mesh Control", "inspectorMultiMesh");
const btnLeaveMesh = document.createElement("button");
btnLeaveMesh.className = "btn btn-sm btn-outline-light mb-2";
btnLeaveMesh.innerHTML = `<i class="bi bi-files"></i> 메시 남기기`;
btnLeaveMesh.onclick = () => {
    if(!paint || !paint.mMesh) {
        CAlert.E("남길 메시가 없습니다.");
        return;
    }
    const newObj = Main.PushSub(obj.Export());
    const newPaint = newObj.FindComp(CPaint3D) as CPaint3D;
    const newAniflow = newObj.FindComp(CAniFlow) as CAniFlow;
    
    leftSubjects.push({ subject: newObj, paint: newPaint, aniflow: newAniflow });
    updateLeftSubjectsUI();
    CAlert.Info("메시가 남아있도록 처리되었습니다. (" + leftSubjects.length + "개)");
};

const leftMeshListContainer = document.createElement("div");
leftMeshListContainer.className = "mt-2 d-flex flex-column gap-2";

function updateLeftSubjectsUI() {
    leftMeshListContainer.innerHTML = "";
    if (leftSubjects.length === 0) {
        leftMeshListContainer.innerHTML = "<div class='text-secondary small'>남겨진 메시가 없습니다.</div>";
        return;
    }
    
    leftSubjects.forEach((ls, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "border border-secondary p-2 rounded position-relative";
        itemDiv.style.backgroundColor = "rgba(0,0,0,0.2)";
        
        const nameDiv = document.createElement("div");
        nameDiv.className = "fw-bold text-light mb-1 text-truncate";
        nameDiv.style.paddingRight = "24px";
        nameDiv.innerText = ls.paint.mMesh ? ls.paint.mMesh.split('/').pop() : "Unknown Mesh";
        
        const descDiv = document.createElement("div");
        descDiv.className = "text-secondary small text-truncate";
        descDiv.innerText = `ID: ${ls.subject.Key()}`;
        
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-1 px-1 py-0";
        delBtn.innerHTML = "<i class='bi bi-x'></i>";
        delBtn.onclick = () => {
            ls.subject.Destroy();
            leftSubjects.splice(index, 1);
            recalcAndApplyBounds();
            updateLeftSubjectsUI();
        };
        
        itemDiv.appendChild(nameDiv);
        itemDiv.appendChild(descDiv);
        itemDiv.appendChild(delBtn);
        leftMeshListContainer.appendChild(itemDiv);
    });
}
updateLeftSubjectsUI();

multiMeshContent.appendChild(btnLeaveMesh);
multiMeshContent.appendChild(leftMeshListContainer);

const { item: texItem, content: texContent, header: texHeaderAcc } = createAccordionItem("Textures", "inspectorTex");
texContent.innerHTML = "<div>No model loaded.</div>";
const { item: matItem, content: matContent, header: matHeaderAcc } = createAccordionItem("Skins", "inspectorMat");
matContent.innerHTML = "<div>No model loaded.</div>";
const { item: aniItemInst, content: aniContentInst, header: aniHeaderInstAcc } = createAccordionItem("Animations", "inspectorAniInst");

// --- [Animation Mesh Load Start] 다른 파일의 애니메이션을 현재 메시에 로드 ---
const btnLoadAniMesh = document.createElement("button");
btnLoadAniMesh.className = "btn btn-sm btn-outline-light mb-2";
btnLoadAniMesh.innerHTML = `<i class="bi bi-folder2-open"></i> 애니메이션 메시 로드`;
const aniMeshFileInput = document.createElement("input");
aniMeshFileInput.type = "file";
aniMeshFileInput.accept = ".gltf,.fbx,.glb,.obj";
aniMeshFileInput.className = "d-none";
btnLoadAniMesh.onclick = () => aniMeshFileInput.click();

const aniListContent = document.createElement("div");
aniListContent.innerHTML = "<div>No model loaded.</div>";

aniContentInst.appendChild(btnLoadAniMesh);
aniContentInst.appendChild(aniMeshFileInput);
aniContentInst.appendChild(aniListContent);

function populateAniList(aniMap: Map<string, { start: number, end: number }>, meshKey: string | null) {
    const listElem = CDOM.ID('aniList');
    listElem.innerHTML = '';

    let first = true;
    for (let [aniName, aniInfo] of aniMap.entries()) {
        const btn = document.createElement("div");
        btn.className = "px-3 py-2 border-bottom border-dark text-secondary";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "13px";
        btn.innerText = aniName;

        btn.onmouseover = () => {
            if (!btn.classList.contains('text-white')) btn.classList.add('bg-secondary');
        };
        btn.onmouseout = () => {
            if (!btn.classList.contains('text-white')) btn.classList.remove('bg-secondary');
        };

        btn.onclick = () => {
            const clip = meshKey
                ? new CClipMesh(0, (aniInfo.end - aniInfo.start) / 600, aniInfo.start, aniInfo.end, meshKey)
                : new CClipMesh(0, (aniInfo.end - aniInfo.start) / 600, aniInfo.start, aniInfo.end);
            aniflow.SetAni(new CAnimation([clip]));

            for (let ls of leftSubjects) {
                const lsClip = meshKey
                    ? new CClipMesh(0, (aniInfo.end - aniInfo.start) / 600, aniInfo.start, aniInfo.end, meshKey)
                    : new CClipMesh(0, (aniInfo.end - aniInfo.start) / 600, aniInfo.start, aniInfo.end);
                ls.aniflow.SetAni(new CAnimation([lsClip]));
                ls.aniflow.mSpeed = aniflow.mSpeed;
                ls.aniflow.mPlay = aniflow.mPlay;
            }

            Array.from(listElem.children).forEach(c => {
                const el = c as HTMLElement;
                el.className = "px-3 py-2 border-bottom border-dark text-secondary";
            });
            btn.className = "px-3 py-2 border-bottom border-dark text-white bg-primary fw-bold";

            renderTimeline(aniInfo.start, aniInfo.end);
        };

        listElem.appendChild(btn);

        if (first) {
            btn.click();
            first = false;
        }
    }

    const btnToggleTimeline = document.getElementById("btnToggleTimeline");
    if (btnToggleTimeline) btnToggleTimeline.style.display = "block";
    if ((window as any).bootstrap) {
        (window as any).bootstrap.Offcanvas.getOrCreateInstance(aniWindow).show();
    }
}

aniMeshFileInput.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() ?? "";
    if (!["gltf", "fbx", "glb", "obj"].includes(ext)) {
        CAlert.E("gltf/fbx/glb/obj 형식의 파일만 불러올 수 있습니다.");
        aniMeshFileInput.value = "";
        return;
    }

    const uk = CUniqueID.GetHash(8);
    const key = `${Main.Key()}/ani/${uk}/${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = new CBase64File();
    base64.mExt = ext;
    base64.mData = arrayBuffer;
    base64.RefreshHash();

    let option = new CLoaderOption();
    option.mWrap = CTexture.eWrap.Repeat;
    base64.mOption = option.Export();
    base64.mOption.mAutoLoad = false;

    Main.GetResMap().set(base64.mHash, base64);
    await gAtl.Frame().Load().LoadSwitch(key, base64.mData, base64.mOption);

    const aniMesh = gAtl.Frame().Res().Find(key) as CMesh;
    if (!aniMesh || !aniMesh.aniMap || aniMesh.aniMap.size === 0) {
        CAlert.E("선택한 파일에서 애니메이션을 찾을 수 없습니다.");
        aniMeshFileInput.value = "";
        return;
    }

    let html = "";
    for (let [aniName, aniInfo] of aniMesh.aniMap.entries()) {
        html += `<div class="mb-1">
            <strong class="text-white">${aniName}</strong><br/>
            Start: ${Math.round(aniInfo.start)} / End: ${Math.round(aniInfo.end)}
        </div>`;
    }
    aniListContent.innerHTML = html;

    populateAniList(aniMesh.aniMap, key);

    aniMeshFileInput.value = "";
};
// --- [Animation Mesh Load End] ---

const { item: renderItem, content: renderContent, header: renderHeaderAcc } = createAccordionItem("Rendering Options", "inspectorRender");

inspectorContent.appendChild(meshItem);
inspectorContent.appendChild(multiMeshItem);
inspectorContent.appendChild(texItem);
inspectorContent.appendChild(matItem);
inspectorContent.appendChild(aniItemInst);
inspectorContent.appendChild(renderItem);

renderContent.innerHTML = `
    <div style="margin-bottom:10px;">
        <label class="text-white d-flex align-items-center" style="cursor:pointer;">
            <input type="checkbox" id="chkLighting" checked class="me-2 form-check-input mt-0" />
            Enable Lighting
        </label>
    </div>
    <div class="mb-2">
        <label class="text-white d-flex align-items-center" style="cursor:pointer;">
            <input type="checkbox" id="chkWireframe" class="me-2 form-check-input mt-0" />
            Enable Wireframe
        </label>
    </div>
    <div class="mb-2" hidden>
        <label class="text-white d-flex align-items-center" style="cursor:pointer;">
            <input type="checkbox" id="chkParallax" class="me-2 form-check-input mt-0" />
            Enable Parallax
        </label>
    </div>
    <div class="mb-2">
        <label class="text-white d-flex align-items-center" style="cursor:pointer;">
            <input type="checkbox" id="chkShadow" class="me-2 form-check-input mt-0" />
            Enable Shadows
        </label>
    </div>
    <!-- Removed Skin Skeleton -->
    <div class="mb-2 border-top border-secondary pt-2">
        <label class="text-white d-block mb-1">Light Direction</label>
        <div class="d-flex align-items-center mb-1">
            <span class="text-white me-2" style="width:14px;">X</span>
            <input type="range" id="rngLightDirX" class="form-range flex-grow-1 me-2" min="-1" max="1" step="0.01" value="0" />
            <span id="valLightDirX" class="text-white" style="width:40px;">0.00</span>
        </div>
        <div class="d-flex align-items-center mb-1">
            <span class="text-white me-2" style="width:14px;">Y</span>
            <input type="range" id="rngLightDirY" class="form-range flex-grow-1 me-2" min="-1" max="1" step="0.01" value="1" />
            <span id="valLightDirY" class="text-white" style="width:40px;">1.00</span>
        </div>
        <div class="d-flex align-items-center mb-1">
            <span class="text-white me-2" style="width:14px;">Z</span>
            <input type="range" id="rngLightDirZ" class="form-range flex-grow-1 me-2" min="-1" max="1" step="0.01" value="0" />
            <span id="valLightDirZ" class="text-white" style="width:40px;">0.00</span>
        </div>
    </div>
    <div class="mb-2 border-top border-secondary pt-2">
        <label class="text-white d-block mb-1">Tone Mapping</label>
        <select id="selToneMapping" class="form-select form-select-sm bg-dark text-white border-secondary">
            <option value="0">None</option>
            <option value="1">Neutral</option>
            <option value="2">ACES</option>
            <option value="3">Reinhard</option>
        </select>
    </div>
    <div class="mb-2">
        <label class="text-white d-flex justify-content-between mb-1">
            <span>Exposure</span>
            <span id="valExposure">1.0</span>
        </label>
        <input type="range" id="rngExposure" class="form-range" min="0.1" max="5.0" step="0.1" value="1.0" />
    </div>
`;

inspectorWindow.appendChild(inspectorHeader);
inspectorWindow.appendChild(inspectorContent);

document.body.appendChild(inspectorWindow);

// Removed inspector toggle button

// --- [Rendering Options Event Handlers Start] ---
paint.PushTag("light"); // Default on

const chkLighting = document.getElementById("chkLighting") as HTMLInputElement;
chkLighting.onchange = () => {
    if (chkLighting.checked) paint.PushTag("light");
    else paint.RemoveTag("light");
};

const chkWireframe = document.getElementById("chkWireframe") as HTMLInputElement;
chkWireframe.onchange = () => {
    (paint as any).mRenderPass.forEach((rp: any) => {
        if (chkWireframe.checked) rp.SetLine(1); // 1 = CRenderPass.eLine.LINE_STRIP
        else rp.SetLine(null);
    });
    paint.ClearBatch();
};

const chkParallax = document.getElementById("chkParallax") as HTMLInputElement;
chkParallax.onchange = () => {
    if (chkParallax.checked) {
        paint.PushTag("parallax");
        paint.PushCShaderAttr(new CShaderAttr("parallaxNormal", new CVec1(0.05)));
    } else {
        paint.RemoveTag("parallax");
    }
};

const chkShadow = document.getElementById("chkShadow") as HTMLInputElement;
chkShadow.onchange = () => {
    if (chkShadow.checked) {
        lig.SetShadow3D("shadow", 0);
        floorPaint.PushTag(CPaint.eTag.Shadow);
        floorPaint.PushTag(CPaint.eTag.ShadowReadOnly);
        paint.PushTag(CPaint.eTag.Shadow);
    }
    else {
        lig.RemoveShadow();
        floorPaint.RemoveTag(CPaint.eTag.Shadow);
        floorPaint.RemoveTag(CPaint.eTag.ShadowReadOnly);
        paint.RemoveTag(CPaint.eTag.Shadow);
    }
};

// Removed Skin Skeleton variables and onchange handler

const rngLightDirX = document.getElementById("rngLightDirX") as HTMLInputElement;
const rngLightDirY = document.getElementById("rngLightDirY") as HTMLInputElement;
const rngLightDirZ = document.getElementById("rngLightDirZ") as HTMLInputElement;
const valLightDirX = document.getElementById("valLightDirX") as HTMLSpanElement;
const valLightDirY = document.getElementById("valLightDirY") as HTMLSpanElement;
const valLightDirZ = document.getElementById("valLightDirZ") as HTMLSpanElement;

const updateLightDir = () => {
    const x = parseFloat(rngLightDirX.value);
    const y = parseFloat(rngLightDirY.value);
    const z = parseFloat(rngLightDirZ.value);
    valLightDirX.innerText = x.toFixed(2);
    valLightDirY.innerText = y.toFixed(2);
    valLightDirZ.innerText = z.toFixed(2);
    ligObj.SetPos(new CVec3(x, y, z));
};

rngLightDirX.oninput = updateLightDir;
rngLightDirY.oninput = updateLightDir;
rngLightDirZ.oninput = updateLightDir;

const selToneMapping = document.getElementById("selToneMapping") as HTMLSelectElement;
const rngExposure = document.getElementById("rngExposure") as HTMLInputElement;
const valExposure = document.getElementById("valExposure") as HTMLSpanElement;

const updateToneMapping = () => {
    const type = parseInt(selToneMapping.value);
    const exp = parseFloat(rngExposure.value);
    valExposure.innerText = exp.toFixed(1);

    paint.PushTag("tonemapping");
    paint.PushCShaderAttr(new CShaderAttr("exposure", exp));
    paint.PushCShaderAttr(new CShaderAttr("tonemappingType", type));
};

selToneMapping.onchange = updateToneMapping;
rngExposure.oninput = updateToneMapping;
// --- [Rendering Options Event Handlers End] ---

// ====================================================
// [Inspector Section End]
// ====================================================

obj.Update = (_update : CUpdate) => {
    // --- [Animation Update Start] 커서 동기화 ---
    if (aniCursor && aniflow.GetAni()) {
        const anim = aniflow.GetAni();
        if (anim && anim.mClip && anim.mClip.length > 0) {
            const clip = anim.mClip[0] as CClipMesh;
            const total = clip.mDelay;
            if (total > 0) {
                const current = aniflow.mTime % total;
                const pct = (current / total) * 100;
                aniCursor.style.left = `${pct}%`;
            }
        }
    }
    // --- [Animation Update End] ---
};

const background = new CModalFlex([1.0], "backgroundModal");
background.SetTitle(CModal.eTitle.None);
background.SetCloseEsc(false);
background.Open();
background.FullSwitch(true);
background.FindFlex(0).append(gAtl.Frame().Win().Handle());
async function handleModelDrop(drop: CDrop, _auto: boolean = false) {
    if (drop.mPaths.length == 0 || drop.mPaths[0] == undefined) {
        CConsol.Log("proj 하위 폴더가 아니면 이미지/정보 파일을 함께 드래그앤드랍해야 합니다.");
    }
    if (drop.mPaths || drop.mFiles) {
        const files = drop.mFiles;
        if (!files) return;

        let fileDrop = { mFiles: files, mPaths: drop.mPaths || [] as string[], mObject: [] as string[] };

        let hasObj = false;
        for (let i = 0; i < files.length; ++i) {
            if (files[i].name.toLowerCase().endsWith('.obj')) {
                hasObj = true;
                break;
            }
        }

        if (fileDrop.mPaths.length === 0) {
            if(_auto) {
                try {
                    fileDrop.mPaths = await CWebView.JToWFileDroppedPath(files);
                } catch (err) {
                    fileDrop.mPaths = new Array(files.length).fill(null);
                }
            } else {
                fileDrop.mPaths = new Array(files.length).fill(null);
            }
        }
        
        for(let i=0; i<fileDrop.mPaths.length; ++i) {
            if (fileDrop.mPaths[i] && hasObj) {
                fileDrop.mPaths[i] = fileDrop.mPaths[i].toLowerCase();
            }
        }

    let pathLoad = true;
    for (let i = 0; i < fileDrop.mPaths.length; ++i) {
        if (fileDrop.mPaths[i] == null) {
            pathLoad = false;
        }
    }

    let hasModel = false;
    for (let i = 0; i < fileDrop.mFiles.length; ++i) {
        const ext = fileDrop.mFiles[i].name.split('.').pop()?.toLowerCase();
        if (ext === "gltf" || ext === "fbx" || ext === "glb" || ext === "obj") {
            hasModel = true;
        }
    }
    
    if (!hasModel) return;

    const GetIconClass = (path: string | null): string => {
        if (!path) return "bi bi-question-circle";
        const ext = path.split('.').pop()?.toLowerCase();
        switch (ext) {
            case "tga": case "jpg": case "jpeg": case "png": return "bi bi-image";
            case "fbx": case "gltf": case "obj": case "glb": return "bi bi-globe";
            default: return "bi bi-file-earmark";
        }
    }

    const listGroup = CDOM.DataToDom("ul");
    listGroup.className = "list-group";
    fileDrop.mObject = [];
    let uk = CUniqueID.GetHash(8);
    for (let i = 0; i < fileDrop.mFiles.length; ++i) {
        const path = fileDrop.mPaths[i];
        const file = fileDrop.mFiles[i];

        const li = CDOM.DataToDom("li");
        li.className = "list-group-item d-flex align-items-center";

        const icon = CDOM.DataToDom("i");
        icon.className = GetIconClass(file.name);
        icon.style.marginRight = "0.5rem";

        const pathText = path ?? `${Main.Key()}/${uk}/${hasObj ? file.name.toLowerCase() : file.name}`;
        fileDrop.mObject.push(pathText);

        const pre = document.createElement("pre");
        pre.className = "form-control user-select-all mb-0 me-2";
        pre.style.width = "auto";
        pre.style.display = "inline-block";
        pre.textContent = pathText;

        const labelDiv = document.createElement("div");
        labelDiv.className = "d-flex align-items-center";
        labelDiv.append(pre);

        li.append(icon, labelDiv);
        listGroup.appendChild(li);
    }

    let option = new CLoaderOption();
    option.mColorTex=true;
    option.mWrap = CTexture.eWrap.Repeat;
    listGroup.append(option.EditInit());

    const onModelConfirm = async () => {
        let loadName = [];
        let mainMeshName = "";
        let droppedMeshes: string[] = [];
        
        if (pathLoad) {
            // 텍스처 등 메시가 아닌 파일들을 먼저 로드
            for (let i = 0; i < fileDrop.mPaths.length; ++i) {
                const ext = fileDrop.mPaths[i].split('.').pop()?.toLowerCase();
                if (ext === "gltf" || ext === "fbx" || ext === "glb" || ext === "obj") {
                    continue;
                }
                await gAtl.Frame().Load().Exe(fileDrop.mPaths[i], option);
            }

            for (let i = 0; i < fileDrop.mPaths.length; ++i) {
                const ext = fileDrop.mPaths[i].split('.').pop()?.toLowerCase();
                if (ext === "gltf" || ext === "fbx" || ext === "glb" || ext === "obj") {
                    mainMeshName = fileDrop.mPaths[i];
                    droppedMeshes.push(mainMeshName);
                    await gAtl.Frame().Load().Exe(fileDrop.mPaths[i], option);
                }
            }
        } else {
            const textureMap = new Map<string, string>(); 

            for (let i = 0; i < fileDrop.mFiles.length; ++i) {
                const file = fileDrop.mFiles[i];
                const ext = file.name.split('.').pop()?.toLowerCase() ?? "";
                loadName.push(file.name);
                if (ext === "gltf" || ext === "fbx" || ext === "glb" || ext === "obj") {
                    continue;
                } else {
                    const arrayBuffer = await file.arrayBuffer();
                    const base64 = new CBase64File();
                    base64.mExt = ext;
                    base64.mData = arrayBuffer;
                    base64.RefreshHash();
                    base64.mOption = option.Export();

                    Main.GetResMap().set(base64.mHash, base64);
                    textureMap.set(file.name.toLowerCase(), fileDrop.mObject[i]); 

                    base64.mOption.mCache = fileDrop.mObject[i];
                    await gAtl.Frame().Load().LoadSwitch(fileDrop.mObject[i], base64.mData, base64.mOption);
                }
            }

            for (let i = 0; i < fileDrop.mFiles.length; ++i) {
                const file = fileDrop.mFiles[i];
                const ext = file.name.split('.').pop()?.toLowerCase() ?? "";
                if (ext === "gltf" || ext === "fbx" || ext === "glb" || ext === "obj") {
                    mainMeshName = fileDrop.mObject[i];
                    droppedMeshes.push(mainMeshName);
                } else continue;
                
                const arrayBuffer = await file.arrayBuffer();
                const base64 = new CBase64File();
                base64.mExt = ext;
                base64.mData = arrayBuffer;
                base64.RefreshHash();
                base64.mOption = option.Export();

                Main.GetResMap().set(base64.mHash, base64);
                base64.mOption.mAutoLoad = false;
                await gAtl.Frame().Load().LoadSwitch(fileDrop.mObject[i], base64.mData, base64.mOption);

                const mesh = gAtl.Frame().Res().Find(fileDrop.mObject[i]) as CMesh;
                if (mesh?.texture instanceof Array) {
                    for (let ti = 0; ti < mesh.texture.length; ++ti) {
                        const texPath = mesh.texture[ti];
                        if (texPath.indexOf("&") != -1) continue;
                        const texName = texPath.split("/").pop()?.toLowerCase() ?? "";

                        if (textureMap.has(texName)) {
                            mesh.texture[ti] = textureMap.get(texName)!; 
                        }
                    }
                }
            }
        }
        
        if (mainMeshName !== "") {
            for (let i = leftSubjects.length - 1; i >= 0; i--) {
                if (leftSubjects[i].autoAdded) {
                    leftSubjects[i].subject.Destroy();
                    leftSubjects.splice(i, 1);
                }
            }

            for (let i = 0; i < droppedMeshes.length - 1; i++) {
                const prevMeshName = droppedMeshes[i];
                const newObj = Main.PushSub(new CSubject());
                const newPaint = newObj.PushComp(new CPaint3D(prevMeshName, false, 0));
                const newAniflow = newObj.PushComp(new CAniFlow());
                leftSubjects.push({ subject: newObj, paint: newPaint, aniflow: newAniflow, autoAdded: true });
            }

            const mesh = gAtl.Frame().Res().Find(mainMeshName) as CMesh;
            if (mesh) {
                paint.SetMesh(mainMeshName);

                // --- [Animation Reset Start] 새 메시 로드 시 이전에 남아있던 애니메이션 제거 ---
                aniflow.SetAni(new CAnimation([]));
                CDOM.ID('aniList').innerHTML = '';
                aniListContent.innerHTML = "<div>No model loaded.</div>";
                const btnToggleTimelineReset = document.getElementById("btnToggleTimeline");
                if (btnToggleTimelineReset) btnToggleTimelineReset.style.display = "none";
                // --- [Animation Reset End] ---

                // --- [Inspector Load Start] 인스펙터에 메시 정보 로드 ---
                if ((window as any).bootstrap) {
                    (window as any).bootstrap.Offcanvas.getOrCreateInstance(inspectorWindow).show();
                    // Removed inspectorToggleBtn handling
                }
                
                let totalPoly = 0;
                let totalIndex = 0;
                let meshInfoHtml = "";
                
                const nodes = mesh.meshTree.GetArray();
                let subMeshCount = 0;
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    if (node.mData && node.mData.ci) {
                        subMeshCount++;
                        const vCount = node.mData.ci.vertexCount;
                        const iCount = node.mData.ci.indexCount;
                        totalPoly += iCount / 3;
                        totalIndex += iCount;
                        meshInfoHtml += `<div class="mt-2 pt-2 border-top border-secondary" style="border-style: dashed !important;">
                            <strong class="text-white">[SubMesh ${subMeshCount}] ${node.mKey}</strong><br/>
                            Vertices: ${vCount}<br/>
                            Indices: ${iCount}<br/>
                            Polygons: ${Math.floor(iCount/3)}
                        </div>`;
                    }
                }

                const bound = new CBound();
                const tree = new CTree<CMeshCopyNode>();
                tree.mData=new CMeshCopyNode();
                CMeshTreeUpdate.TreeCopy(mesh.meshTree, tree, new CMat(), bound);

                recalcAndApplyBounds();
                updateLeftSubjectsUI();

                const size = bound.GetSize();
                
                meshContent.innerHTML = `
                    <div class="mb-2 text-white">
                        <strong>Total Polygons:</strong> ${Math.floor(totalPoly)}<br/>
                        <strong>Total Indices:</strong> ${totalIndex}<br/>
                        <strong>Total SubMeshes:</strong> ${subMeshCount}<br/>
                        <strong>Total Size:</strong> [${size.x.toFixed(0)}, ${size.y.toFixed(0)}, ${size.z.toFixed(0)}]
                    </div>
                    ${meshInfoHtml}
                `;
                
                let texHtml = "";
                if (mesh.texture && mesh.texture.length > 0) {
                    let texUsage: { [texIdx: number]: string[] } = {};
                    for (let t = 0; t < mesh.texture.length; t++) texUsage[t] = [];
                    
                    let smCount = 0;
                    for (let i = 0; i < nodes.length; i++) {
                        const node = nodes[i];
                        if (node.mData && node.mData.ci) {
                            smCount++;
                            let smName = node.mKey || `SubMesh ${smCount}`;
                            
                            let texOffBuf : CMeshBuf = null;
                            if (typeof node.mData.ci.GetVFType === 'function') {
                                let bufs = node.mData.ci.GetVFType(CVertexFormat.eIdentifier.TexOff); // 7 is CVertexFormat.eIdentifier.TexOff
                                if (bufs && bufs.length > 0) {
                                    texOffBuf = bufs[0];
                                }
                            } else if (node.mData.ci.vertex) {
                                for (let v = 0; v < node.mData.ci.vertex.length; v++) {
                                    if (node.mData.ci.vertex[v].vfType === 7) {
                                        texOffBuf = node.mData.ci.vertex[v];
                                        break;
                                    }
                                }
                            }

                            if (texOffBuf && texOffBuf.bufF && node.mData.textureOff) {
                                const v3 = texOffBuf.bufF.V3(0);
                                let tIdxX = Math.round(v3.x);
                                let tIdxY = Math.round(v3.y);
                                let tIdxZ = Math.round(v3.z);

                                if (tIdxX !== -1 && tIdxX < node.mData.textureOff.length) {
                                    let actualTexIdx = node.mData.textureOff[tIdxX];
                                    if (texUsage[actualTexIdx]) texUsage[actualTexIdx].push(`[${smName}] Diffuse`);
                                }
                                if (tIdxY !== -1 && tIdxY < node.mData.textureOff.length) {
                                    let actualTexIdx = node.mData.textureOff[tIdxY];
                                    if (texUsage[actualTexIdx]) texUsage[actualTexIdx].push(`[${smName}] Normal`);
                                }
                                if (tIdxZ !== -1 && tIdxZ < node.mData.textureOff.length) {
                                    let actualTexIdx = node.mData.textureOff[tIdxZ];
                                    if (texUsage[actualTexIdx]) texUsage[actualTexIdx].push(`[${smName}] ORM`);
                                }
                                if(tIdxX == -1 && tIdxY == -1 && tIdxZ == -1 && node.mData.textureOff.length > 0) {
                                    let actualTexIdx = node.mData.textureOff[0];
                                    if (texUsage[actualTexIdx]) texUsage[actualTexIdx].push(`[${smName}] Diffuse`);
                                }
                            }
                        }
                    }

                    mesh.texture.forEach((tex, idx) => {
                        let imgSrc = tex;
                        let texObj = gAtl.Frame().Res().Find(tex) as CTexture;
                        if (texObj && texObj.GetBuf && texObj.GetBuf().length > 0) {
                            let buf = texObj.GetBuf()[0];
                            if (buf instanceof Image && buf.src) {
                                imgSrc = buf.src;
                            } else if (buf.src) {
                                imgSrc = buf.src;
                            } else if (buf instanceof Uint8Array || buf instanceof Uint8ClampedArray) {
                                const w = texObj.GetWidth();
                                const h = texObj.GetHeight();
                                const canvas = document.createElement("canvas");
                                canvas.width = w;
                                canvas.height = h;
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                    const imgData = ctx.createImageData(w, h);
                                    for (let i = 0; i < buf.length; i++) {
                                        imgData.data[i] = buf[i];
                                    }
                                    ctx.putImageData(imgData, 0, 0);
                                    imgSrc = canvas.toDataURL();
                                }
                            }
                        } else if (imgSrc.startsWith("proj/")) {
                            imgSrc = "/Artgine/" + imgSrc;
                        }

                        let usageHtml = "";
                        if (texUsage[idx] && texUsage[idx].length > 0) {
                            let uniqueUsages = Array.from(new Set(texUsage[idx]));
                            usageHtml = `<div class="text-secondary mt-1" style="font-size:11px;">
                                <strong>Used in:</strong><br/>` + uniqueUsages.join("<br/>") + `
                            </div>`;
                        } else {
                            usageHtml = `<div class="text-secondary mt-1" style="font-size:11px;">Not used</div>`;
                        }

                        texHtml += `<div class="mb-3 pb-2 border-bottom border-secondary text-break" style="border-style: dashed !important;">
                            <div class="mb-1">
                                <span class="text-secondary">[${idx}]</span> ${tex}
                            </div>
                            <img src="${imgSrc}" class="w-100 bg-dark border border-secondary d-block" style="max-height:200px; object-fit:contain;" onerror="this.classList.add('d-none')"/>
                            ${usageHtml}
                        </div>`;
                    });
                } else {
                    texHtml = "<div>No textures used.</div>";
                }
                texContent.innerHTML = texHtml;
                
                let matHtml = "";
                if (mesh.skin && mesh.skin.length > 0) {
                    mesh.skin.forEach((s, idx) => {
                        matHtml += `<div class="mb-1">
                            <span class="text-secondary">[Skin ${idx}]</span> ${s.key}
                        </div>`;
                    });
                } else {
                    matHtml = "<div>No skins found.</div>";
                }
                matContent.innerHTML = matHtml;
                
                let animInstHtml = "";
                if (mesh.aniMap && mesh.aniMap.size > 0) {
                    for (let [aniName, aniInfo] of mesh.aniMap.entries()) {
                        animInstHtml += `<div class="mb-1">
                            <strong class="text-white">${aniName}</strong><br/>
                            Start: ${Math.round(aniInfo.start)} / End: ${Math.round(aniInfo.end)}
                        </div>`;
                    }
                } else {
                    animInstHtml = "<div>No animations.</div>";
                }
                aniListContent.innerHTML = animInstHtml;
                
                if (currentOpenContent) {
                    currentOpenContent.style.display = "none";
                    const prevHeader = currentOpenContent.previousSibling as HTMLElement;
                    if(prevHeader && prevHeader.firstChild) (prevHeader.firstChild as HTMLElement).innerText = "▶";
                    currentOpenContent = null;
                }
                meshHeaderAcc.click();
                // --- [Inspector Load End] ---

                // --- [Animation Drop Load Start] 모델 로드 시 애니메이션 로드 ---
                if (mesh.aniMap && mesh.aniMap.size > 0) {
                    populateAniList(mesh.aniMap, null);
                } else {
                    const btnToggleTimeline = document.getElementById("btnToggleTimeline");
                    if (btnToggleTimeline) btnToggleTimeline.style.display = "none";
                }
                // --- [Animation Drop Load End] ---
            }
        }
        
        CAlert.Info(loadName + " load!");
    };

    if (_auto) {
        await onModelConfirm();
    } else {
        let confirm = CConfirm.List(listGroup, [onModelConfirm, () => {}], ["OK", "Cancel"]);
    }
    } else if (drop.mObject) {
        // 내부 드래그 오브젝트 처리
    }
}
background.On(CEvent.eType.Drop, handleModelDrop);

// ====================================================
// [External Model Load Section Start] - 쿼리 파라미터(?model=)/postMessage로 전달된 모델을
// 드래그앤드랍한 것처럼 확인창 없이 바로 로드한다.
// ====================================================
async function LoadModelBuffer(_fileName: string, _buf: ArrayBufferLike) {
    if (!_buf) {
        CAlert.Info("모델 데이터를 불러오지 못했습니다: " + _fileName);
        return;
    }
    const file = new File([_buf as ArrayBuffer], _fileName);
    let drop = new CDrop();
    drop.mFiles = [file] as any;
    drop.mPaths = [];
    await handleModelDrop(drop, true);
}

function ExtFromMime(_mime: string): string {
    switch (_mime) {
        case "model/gltf-binary": return "glb";
        case "model/gltf+json": return "gltf";
        default: return "glb";
    }
}

// _src: 모델 사이트 주소(http/https, 원본 서버가 CORS 허용 필요) 또는 base64 문자열(데이터 URI 포함/미포함).
// _extHint: _src가 데이터 URI 접두어 없는 순수 base64일 때 확장자를 알려주기 위한 값(?modelExt=glb 등).
async function LoadModelFromParameter(_src: string, _extHint: string | null) {
    try {
        if (_src.startsWith("data:")) {
            const commaIdx = _src.indexOf(",");
            const meta = _src.substring(5, commaIdx);
            const b64 = _src.substring(commaIdx + 1).replace(/ /g, "+"); // 쿼리스트링에서 +가 공백으로 치환된 경우 복구
            const ext = _extHint ?? ExtFromMime(meta.split(";")[0]);
            await LoadModelBuffer(`model.${ext}`, CUtil.Base64ToArray(b64));
        } else if (/^https?:\/\//i.test(_src) || _src.startsWith("/") || _src.startsWith("./") || _src.startsWith("../")) {
            const clean = _src.split("?")[0].split("#")[0];
            const name = clean.split("/").pop() || "model.glb";
            const buf = await CFile.Load(_src, false, true);
            await LoadModelBuffer(name, buf);
        } else {
            const ext = _extHint ?? "glb";
            await LoadModelBuffer(`model.${ext}`, CUtil.Base64ToArray(_src.replace(/ /g, "+")));
        }
    } catch (err) {
        CConsol.Log("modelURL 로드 실패: " + err);
        CAlert.Info("모델 로드 실패: " + err);
    }
}

if (modelURL) {
    LoadModelFromParameter(modelURL, modelExt);
}

// iframe으로 임베드된 경우 부모 창에서 postMessage로 모델을 직접 전달할 수도 있다.
// URL 길이 제한/CORS 문제 없이 ArrayBuffer를 바로 넘길 때 사용.
// 예) iframeEl.contentWindow.postMessage({header:{type:"load-model"}, data:{name:"a.glb", buffer: arrayBuffer}}, "*")
CIframeMsg.Recv({
    "load-model": (data) => {
        if (data?.buffer) {
            LoadModelBuffer(data.name ?? "model.glb", data.buffer);
        } else if (typeof data?.base64 === "string") {
            LoadModelFromParameter(data.base64, data.ext ?? null);
        } else if (typeof data?.url === "string") {
            LoadModelFromParameter(data.url, null);
        }
    },
});
// ====================================================
// [External Model Load Section End]
// ====================================================



















new CModalFrameView();










































