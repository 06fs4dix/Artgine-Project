//Version
import "../../../artgine/artgine.js"

//Class
import {CClass} from "../../../artgine/basic/CClass.js";

//Atelier
import {CPreferences} from "../../../artgine/basic/CPreferences.js";
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
gPF.mServer = 'webServer';
gPF.mGitHub = false;
gPF.mVersion = "mv91179n_4";

import {CAtelier} from "../../../artgine/app/CAtelier.js";

import {CPlugin} from "../../../artgine/util/CPlugin.js";
CPlugin.PushPath('EnvmapGPU','../../../plugin/EnvmapGPU/');
import "../../../plugin/EnvmapGPU/EnvmapGPU.js"
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint

import { CVec3 } from "../../../artgine/geometry/CVec3.js";
import { CMath } from "../../../artgine/geometry/CMath.js";
import { CCamCon3DFirstPerson } from "../../../artgine/util/CCamCon.js";
import { CSubject } from "../../../artgine/app/subject/CSubject.js";
import { CProbe } from "../../../artgine/app/subject/CProbe.js";
import { CPaint } from "../../../artgine/app/component/paint/CPaint.js";
import { CPaint3D, CPaintCube } from "../../../artgine/app/component/paint/CPaint3D.js";
import { CLight } from "../../../artgine/app/component/CLight.js";
import { CDayCycle, CLightPlanet } from "../../../artgine/app/component/CLightPlanet.js";
import { CColor } from "../../../artgine/render/CColor.js";
import { CEvent } from "../../../artgine/basic/CEvent.js";
import { CModal } from "../../../artgine/basic/CModal.js";
import { CCanvasPluginEnvmapGPU } from "../../../plugin/EnvmapGPU/EnvmapGPU.js";

// -----------------------------------------------
// cam
// -----------------------------------------------
const Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
Main.PushPlugin(new CCanvasPluginEnvmapGPU());
const camCon = new CCamCon3DFirstPerson(gAtl.Frame().Input());
camCon.SetPosSensitivity(4);
Main.GetCam().SetCamCon(camCon);
gAtl.Brush().GetCam3D().Init(new CVec3(0, 1500, -6500), new CVec3(0, 300, 0));

// -----------------------------------------------
// env
// -----------------------------------------------
const sky = Main.PushSub(new CSubject());
sky.SetKey("Sky");
const skyPaint = sky.PushComp(new CPaintCube(""));
skyPaint.Sky(true, true, true, false);
skyPaint.PushTag("probe");

const sun = Main.PushSub(new CSubject());
sun.SetKey("Sun");
sun.SetPos(new CVec3(0.4, 1, 0.3));
const sunLight = sun.PushComp(new CLightPlanet());
sunLight.SetShadow3D("shadow", 0, 0, 0, 0, 0, 0);
sunLight.SetShadowDistance(20000);
sunLight.Push(new CDayCycle(new CVec3(0, 1, 0), new CColor(1, 1, 1)));
sunLight.Push(new CDayCycle(new CVec3(2, 0.5, 0), new CColor(1, 0.8, 0.8)));
sunLight.Push(new CDayCycle(new CVec3(-2, 0.5, 0), new CColor(1, 0.8, 0.8)));
sunLight.Push(new CDayCycle(new CVec3(-1, 0, 0), new CColor(1, 0.5, 0.5)));
sunLight.Push(new CDayCycle(new CVec3(1, 0, 0), new CColor(1, 0.5, 0.5)));
sunLight.Push(new CDayCycle(new CVec3(0, -1, 0), new CColor(0, 0, 0)));

// -----------------------------------------------
// box util
// -----------------------------------------------
const boxMesh = gAtl.Frame().Pal().GetBoxMesh();
const sphereMesh = gAtl.Frame().Pal().GetSphereMesh();
const Color = (_r : number, _g : number, _b : number) => new CColor(_r, _g, _b, CColor.eModel.RGBAdd);

let boxCount = 0;
function PushBox(_min : CVec3, _max : CVec3, _color : CColor) : CPaint3D
{
    const sub = Main.PushSub(new CSubject());
    sub.SetKey("Box" + boxCount++);
    sub.SetPos(CMath.V3MulFloat(CMath.V3AddV3(_min, _max), 0.5));
    sub.SetSca(CMath.V3SubV3(_max, _min));
    const pt = sub.PushComp(new CPaint3D(boxMesh));
    pt.SetColorModel(_color);
    pt.SetMaterial(0.8, 0);
    pt.PushTag(CPaint.eTag.Light);
    pt.PushTag(CPaint.eTag.Shadow);
    pt.PushTag(CPaint.eTag.Env);
    pt.PushTag("probe");
    return pt;
}

// -----------------------------------------------
// probe
// -----------------------------------------------
const mirrorY = 400;
const probeArr : CProbe[] = [];

//_radius == 0이면 무한거리 프로브. 반지름 안에 있는 픽셀은 반지름 프로브가 무한거리 프로브보다 우선한다(Light.ts EnvNearest)
function PushProbe(_key : string, _pos : CVec3, _radius : number, _size : number = null, _cycle : number = null)
{
    const probe = Main.PushSub(new CProbe());
    probe.SetKey(_key);
    probe.SetPos(_pos);
    probe.SetSca(new CVec3(400, 400, 400));
    probe.GetEnvMap().mRadius = _radius;
    probe.SetDebug(true);
    if(_size != null) probe.mEnvMap.mSize = _size;
    if(_cycle != null) probe.mEnvMap.mCycle = _cycle;
    probeArr.push(probe);
    return probe;
}

// -----------------------------------------------
// ground
// -----------------------------------------------
const groundHalf = 7000;
PushBox(new CVec3(-groundHalf, -50, -groundHalf), new CVec3(groundHalf, 0, groundHalf), Color(0.45, 0.45, 0.45));

// -----------------------------------------------
// room
// -----------------------------------------------
const roomHalf = 1200;
const roomDist = 2700;
const wallThick = 100;
const doorHalf = 400;
const doorHeight = 600;

//_doorSide(+1/-1) 쪽 z벽에 문을 낸다
function PushRoomWall(_cx : number, _cz : number, _y0 : number, _y1 : number, _doorSide : number, _color : CColor)
{
    const x0 = _cx - roomHalf - wallThick, x1 = _cx + roomHalf + wallThick;
    PushBox(new CVec3(x0, _y0, _cz - roomHalf), new CVec3(_cx - roomHalf, _y1, _cz + roomHalf), _color);
    PushBox(new CVec3(_cx + roomHalf, _y0, _cz - roomHalf), new CVec3(x1, _y1, _cz + roomHalf), _color);
    for(const side of [-1, 1])
    {
        const z0 = side < 0 ? _cz - roomHalf - wallThick : _cz + roomHalf;
        const z1 = z0 + wallThick;
        if(side != _doorSide)
        {
            PushBox(new CVec3(x0, _y0, z0), new CVec3(x1, _y1, z1), _color);
            continue;
        }
        PushBox(new CVec3(x0, _y0, z0), new CVec3(_cx - doorHalf, _y1, z1), _color);
        PushBox(new CVec3(_cx + doorHalf, _y0, z0), new CVec3(x1, _y1, z1), _color);
        PushBox(new CVec3(_cx - doorHalf, _y0 + doorHeight, z0), new CVec3(_cx + doorHalf, _y1, z1), _color);
    }
}
function PushPillar(_x : number, _z : number, _y0 : number, _height : number, _color : CColor)
{
    PushBox(new CVec3(_x - 100, _y0, _z - 100), new CVec3(_x + 100, _y0 + _height, _z + 100), _color);
}

//지붕 없는 방. 문은 광장(원점) 쪽
function PushRoom(_key : string, _cx : number, _cz : number, _wall : CColor, _floor : CColor, _pillar : CColor)
{
    const height = 900;
    const doorSide = _cz < 0 ? 1 : -1;
    PushRoomWall(_cx, _cz, 0, height, doorSide, _wall);
    PushBox(new CVec3(_cx - roomHalf, 0, _cz - roomHalf), new CVec3(_cx + roomHalf, 10, _cz + roomHalf), _floor);
    PushPillar(_cx - roomHalf + 300, _cz - roomHalf + 300, 0, 700, _pillar);
    PushPillar(_cx + roomHalf - 300, _cz + roomHalf - 300, 0, 700, _pillar);

    PushProbe(_key, new CVec3(_cx, mirrorY, _cz), roomHalf * 1.414);
}
PushRoom("Red", -roomDist, -roomDist, Color(0.8, 0.1, 0.1), Color(0.35, 0.05, 0.05), Color(1, 1, 1));
PushRoom("Green", roomDist, -roomDist, Color(0.1, 0.7, 0.15), Color(0.05, 0.3, 0.05), Color(0.9, 0.2, 0.9));
PushRoom("Yellow", roomDist, roomDist, Color(0.9, 0.8, 0.1), Color(0.4, 0.3, 0.05), Color(0.1, 0.2, 0.9));

// -----------------------------------------------
// building (2층, 지붕 있음)
// -----------------------------------------------
{
    const cx = -roomDist, cz = roomDist;
    const floorHeight = 900, slabThick = 50, holeSize = 600;
    const roofY = floorHeight * 2;
    const wall = Color(0.15, 0.3, 0.85);

    PushRoomWall(cx, cz, 0, floorHeight, -1, wall);
    PushRoomWall(cx, cz, floorHeight, roofY, 0, wall);
    PushBox(new CVec3(cx - roomHalf - wallThick, roofY, cz - roomHalf - wallThick), new CVec3(cx + roomHalf + wallThick, roofY + wallThick, cz + roomHalf + wallThick), wall);

    //1층 바닥
    PushBox(new CVec3(cx - roomHalf, 0, cz - roomHalf), new CVec3(cx + roomHalf, 10, cz + roomHalf), Color(0.05, 0.08, 0.3));
    //2층 바닥. 비행 카메라로 올라갈 수 있게 한쪽 모서리를 뚫는다
    const slabColor = Color(0.2, 0.8, 0.8);
    const fy0 = floorHeight, fy1 = floorHeight + slabThick;
    PushBox(new CVec3(cx - roomHalf, fy0, cz - roomHalf), new CVec3(cx + roomHalf - holeSize, fy1, cz + roomHalf), slabColor);
    PushBox(new CVec3(cx + roomHalf - holeSize, fy0, cz - roomHalf), new CVec3(cx + roomHalf, fy1, cz + roomHalf - holeSize), slabColor);

    PushPillar(cx - roomHalf + 300, cz + roomHalf - 300, 0, 700, Color(1, 0.5, 0));
    PushPillar(cx - roomHalf + 300, cz + roomHalf - 300, fy1, 700, Color(1, 0.1, 0.5));

    const PushPointLight = (_key : string, _pos : CVec3, _color : CVec3) => {
        const sub = Main.PushSub(new CSubject());
        sub.SetKey(_key);
        sub.SetPos(_pos);
        const lig = sub.PushComp(new CLight());
        lig.SetColor(_color);
        lig.SetPoint(2000, 800);
    };
    PushPointLight("BlueLight1F", new CVec3(cx, floorHeight - 100, cz), new CVec3(1, 0.7, 0.4));
    PushPointLight("BlueLight2F", new CVec3(cx, roofY - 100, cz), new CVec3(0.8, 0.9, 1));

    PushProbe("Blue1F", new CVec3(cx, mirrorY, cz), roomHalf);
    PushProbe("Blue2F", new CVec3(cx, fy1 + mirrorY, cz), roomHalf);
}

// -----------------------------------------------
// plaza (야외, 무한거리 프로브)
// -----------------------------------------------
PushPillar(-800, -800, 0, 1200, Color(1, 1, 1));
PushPillar(800, -800, 0, 1200, Color(1, 0.5, 0));
PushPillar(-800, 800, 0, 1200, Color(0.6, 0.2, 0.9));
PushPillar(800, 800, 0, 1200, Color(0.1, 0.8, 0.8));
PushProbe("Outdoor", new CVec3(0, mirrorY, 0), 0);

// -----------------------------------------------
// tester (카메라 앞을 따라다니며 선택되는 환경맵을 보여줌)
// -----------------------------------------------
const tester = PushProbe("Tester", new CVec3(0, mirrorY, 0), 0, 64);
const testerDist = 1500;

// -----------------------------------------------
// info
// -----------------------------------------------
const infoDiv = document.createElement("div");
const infoModal = new CModal("EnvMapInfo");
infoModal.SetTitle(CModal.eTitle.Text);
infoModal.SetHeader("EnvMap");
infoModal.SetBody(infoDiv);
infoModal.SetSize(300, 330);
infoModal.Open(CModal.ePos.TopRight);

//셰이더 EnvNearest는 픽셀마다 고르므로 여기선 오브젝트 중심 기준 근사값이다
function EnvKey(_probe : CProbe) : string
{
    const pos = _probe.GetPos();
    let best = "none", bestDist = Infinity;
    for(const probe of probeArr)
    {
        const radius = probe.GetEnvMap().mRadius;
        let d = CMath.V3Distance(probe.GetPos(), pos);
        if(radius > 0) d = d >= radius ? 1000000 : d - 1000000;
        if(d < bestDist)
        {
            bestDist = d;
            best = probe.Key();
        }
    }
    return best;
}
let infoHtml = "";
gAtl.Frame().PushEvent(CEvent.eType.Update, () => {
    const cam = gAtl.Brush().GetCam3D();
    tester.SetPos(CMath.V3AddV3(cam.GetEye(), CMath.V3MulFloat(cam.GetView(), testerDist)));

    const lineArr = [`<b>Tester → ${EnvKey(tester)}</b>`, ""];
    for(const probe of probeArr) lineArr.push(`${probe.Key()} → ${EnvKey(probe)}`);
    lineArr.push("", "WASD 이동 / Z·X 하강·상승", "마우스 왼쪽 회전 / 오른쪽 이동");
    const html = lineArr.join("<br>");
    if(html != infoHtml)
    {
        infoHtml = html;
        infoDiv.innerHTML = html;
    }
});














