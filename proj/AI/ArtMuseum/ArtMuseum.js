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
gPF.mVersion = "mveoz3mt_7";
import { CAtelier } from "../../../Artgine/artgine/app/CAtelier.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([], "");
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CMath } from "../../../Artgine/artgine/geometry/CMath.js";
import { CBound } from "../../../Artgine/artgine/geometry/CBound.js";
import { CCamCon3DFirstPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D, CPaintCube } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CTexture } from "../../../Artgine/artgine/render/CTexture.js";
import { CH5Canvas } from "../../../Artgine/artgine/render/CH5Canvas.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CModal } from "../../../Artgine/artgine/basic/CModal.js";
import { CPad } from "../../../Artgine/artgine/app/subject/CPad.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
const W = 22;
const L = 45;
const H = 24;
const EYE = 6;
const ART_Y = 11.2;
const SKY_X = 8;
const SKY_Z = 36;
const WELL_TOP = 29.5;
const Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
window["Main"] = Main;
window["gAtl"] = gAtl;
const UI2D = gAtl.NewCanvas("UI2D");
UI2D.SetCameraKey("2D");
gAtl.Frame().Dev().SetClearColor(true, new CVec4(0.05, 0.05, 0.06, 0.99));
let gSeed = 1234567;
function Rand() {
    gSeed = (gSeed * 16807) % 2147483647;
    return (gSeed - 1) / 2147483646;
}
function BuildTex(_key, _w, _h, _draw) {
    CH5Canvas.Init(_w, _h);
    _draw(CH5Canvas.GetContext(), _w, _h);
    const tex = CH5Canvas.GetNewTex();
    tex.SetWrap(CTexture.eWrap.Repeat);
    gAtl.Frame().Ren().BuildTexture(tex);
    gAtl.Frame().Res().Push(_key, tex);
    return _key;
}
function Grain(_ctx, _w, _h, _count, _alpha) {
    for (let i = 0; i < _count; i++) {
        const v = Rand() > 0.5 ? 255 : 0;
        _ctx.fillStyle = `rgba(${v},${v},${v},${Rand() * _alpha})`;
        _ctx.fillRect(Rand() * _w, Rand() * _h, 1 + Rand() * 2, 1 + Rand() * 2);
    }
}
const TEX_DAMASK = BuildTex("ArtMuseum/damask.tex", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#651b23";
    ctx.fillRect(0, 0, w, h);
    const motif = (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = "rgba(140,50,56,0.4)";
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.ellipse(0, -30, 11, 30, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "rgba(118,38,44,0.45)";
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.ellipse(0, -44, 6, 16, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "rgba(190,120,70,0.45)";
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };
    motif(w / 2, h / 2);
    for (const x of [0, w])
        for (const y of [0, h])
            motif(x, y);
    ctx.strokeStyle = "rgba(140,50,55,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h / 2);
    ctx.lineTo(w / 2, h);
    ctx.lineTo(0, h / 2);
    ctx.closePath();
    ctx.stroke();
    for (let x = 0; x < w; x += 2) {
        ctx.fillStyle = `rgba(0,0,0,${Rand() * 0.06})`;
        ctx.fillRect(x, 0, 1, h);
    }
    Grain(ctx, w, h, 2500, 0.08);
});
const TEX_MARBLE = BuildTex("ArtMuseum/marble.tex", 512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#ece6db";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) {
        const g = ctx.createRadialGradient(Rand() * w, Rand() * h, 0, Rand() * w, Rand() * h, 60 + Rand() * 120);
        g.addColorStop(0, "rgba(205,195,180,0.25)");
        g.addColorStop(1, "rgba(205,195,180,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    }
    ctx.lineCap = "round";
    for (let i = 0; i < 16; i++) {
        let x = Rand() * w, y = Rand() * h;
        let ang = Math.PI * 0.3 + Rand() * 0.6;
        ctx.strokeStyle = `rgba(110,102,95,${0.12 + Rand() * 0.25})`;
        ctx.lineWidth = 0.6 + Rand() * 2.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let s = 0; s < 40; s++) {
            ang += (Rand() - 0.5) * 0.7;
            x += Math.cos(ang) * 9;
            y += Math.sin(ang) * 9;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    Grain(ctx, w, h, 4000, 0.05);
});
const TEX_PANEL = BuildTex("ArtMuseum/panel.tex", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#3b2417";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
        const y = Rand() * h;
        ctx.strokeStyle = `rgba(${Rand() > 0.5 ? "20,10,5" : "90,58,36"},${0.15 + Rand() * 0.25})`;
        ctx.lineWidth = 0.5 + Rand() * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.3, y + (Rand() - 0.5) * 8, w * 0.6, y + (Rand() - 0.5) * 8, w, y);
        ctx.stroke();
    }
    ctx.fillStyle = "rgba(20,11,6,0.55)";
    ctx.fillRect(0, 0, 22, h);
    ctx.fillRect(w - 22, 0, 22, h);
    ctx.fillRect(0, 0, w, 26);
    ctx.fillRect(0, h - 26, w, 26);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(125,86,52,0.9)";
    ctx.beginPath();
    ctx.moveTo(32, h - 36);
    ctx.lineTo(32, 36);
    ctx.lineTo(w - 32, 36);
    ctx.stroke();
    ctx.strokeStyle = "rgba(12,6,3,0.9)";
    ctx.beginPath();
    ctx.moveTo(w - 32, 36);
    ctx.lineTo(w - 32, h - 36);
    ctx.lineTo(32, h - 36);
    ctx.stroke();
    ctx.strokeStyle = "rgba(190,150,80,0.5)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(44, 48, w - 88, h - 96);
});
const TEX_COFFER = BuildTex("ArtMuseum/coffer.tex", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#efe7d6";
    ctx.fillRect(0, 0, w, h);
    const m = 30;
    const g = ctx.createLinearGradient(m, m, w - m, h - m);
    g.addColorStop(0, "#c9b894");
    g.addColorStop(1, "#ddd0b4");
    ctx.fillStyle = g;
    ctx.fillRect(m, m, w - m * 2, h - m * 2);
    ctx.fillStyle = "#e3d7bd";
    ctx.fillRect(m + 16, m + 16, w - (m + 16) * 2, h - (m + 16) * 2);
    ctx.strokeStyle = "#b8924a";
    ctx.lineWidth = 3;
    ctx.strokeRect(m, m, w - m * 2, h - m * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(m + 16, m + 16, w - (m + 16) * 2, h - (m + 16) * 2);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.fillStyle = "#c29a45";
    for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(0, -16, 6, 14, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = "#e0c070";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    Grain(ctx, w, h, 1500, 0.05);
});
const TEX_PARQUET = BuildTex("ArtMuseum/parquet.tex", 512, 512, (ctx, w, h) => {
    const cell = w / 2;
    const plank = cell / 4;
    for (let cy = 0; cy < 2; cy++)
        for (let cx = 0; cx < 2; cx++) {
            const vertical = (cx + cy) % 2 === 0;
            for (let p = 0; p < 4; p++) {
                const x = cx * cell + (vertical ? p * plank : 0);
                const y = cy * cell + (vertical ? 0 : p * plank);
                const pw = vertical ? plank : cell;
                const ph = vertical ? cell : plank;
                const t = Rand();
                ctx.fillStyle = `rgb(${86 + t * 26},${54 + t * 16},${32 + t * 10})`;
                ctx.fillRect(x, y, pw, ph);
                for (let g = 0; g < 14; g++) {
                    ctx.strokeStyle = `rgba(${Rand() > 0.5 ? "40,22,10" : "130,90,55"},${0.12 + Rand() * 0.2})`;
                    ctx.lineWidth = 0.6 + Rand();
                    ctx.beginPath();
                    if (vertical) {
                        const gx = x + Rand() * pw;
                        ctx.moveTo(gx, y);
                        ctx.bezierCurveTo(gx + (Rand() - 0.5) * 6, y + ph * 0.3, gx + (Rand() - 0.5) * 6, y + ph * 0.7, gx, y + ph);
                    }
                    else {
                        const gy = y + Rand() * ph;
                        ctx.moveTo(x, gy);
                        ctx.bezierCurveTo(x + pw * 0.3, gy + (Rand() - 0.5) * 6, x + pw * 0.7, gy + (Rand() - 0.5) * 6, x + pw, gy);
                    }
                    ctx.stroke();
                }
                ctx.strokeStyle = "rgba(18,9,4,0.9)";
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 1, y + 1, pw - 2, ph - 2);
            }
        }
    Grain(ctx, w, h, 3000, 0.06);
});
const TEX_CARPET = BuildTex("ArtMuseum/carpet.tex", 256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#1b2440";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#c9a14a";
    ctx.fillRect(18, 0, 6, h);
    ctx.fillRect(w - 24, 0, 6, h);
    ctx.fillStyle = "#6e141c";
    ctx.fillRect(24, 0, w - 48, h);
    ctx.strokeStyle = "rgba(201,161,74,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w - 40, h / 2);
    ctx.lineTo(w / 2, h);
    ctx.lineTo(40, h / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "rgba(30,40,70,0.7)";
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2 - 40);
    ctx.lineTo(w / 2 + 28, h / 2);
    ctx.lineTo(w / 2, h / 2 + 40);
    ctx.lineTo(w / 2 - 28, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c9a14a";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    for (let y = 0; y < h; y += 16) {
        ctx.fillStyle = "rgba(201,161,74,0.6)";
        ctx.fillRect(8, y + 4, 4, 8);
        ctx.fillRect(w - 12, y + 4, 4, 8);
    }
    Grain(ctx, w, h, 5000, 0.1);
});
function BuildPlaqueTex(_key, _title, _sub, _artist, _year) {
    return BuildTex(_key, 512, 256, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#f5efe2");
        g.addColorStop(1, "#e4d9c3");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#b48f4c";
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.fillStyle = "#2a2118";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.font = "bold 44px 'Batang', 'Noto Serif KR', Georgia, serif";
        ctx.fillText(_title, 38, 78, w - 76);
        ctx.fillStyle = "#6a5842";
        ctx.font = "italic 26px Georgia, serif";
        ctx.fillText(_sub, 38, 116, w - 76);
        ctx.fillStyle = "#b48f4c";
        ctx.fillRect(38, 136, 80, 3);
        ctx.fillStyle = "#3a2e22";
        ctx.font = "30px 'Batang', 'Noto Serif KR', Georgia, serif";
        ctx.fillText(_artist, 38, 184, w - 76);
        ctx.fillStyle = "#7a6852";
        ctx.font = "26px Georgia, serif";
        ctx.fillText(_year, 38, 222, w - 76);
    });
}
const M_GOLD = { color: new CColor(0.72, 0.53, 0.22, CColor.eModel.RGBAdd), rough: 0.2 };
const M_DARKGOLD = { color: new CColor(0.52, 0.38, 0.16, CColor.eModel.RGBAdd), rough: 0.3 };
const M_CREAM = { color: new CColor(0.9, 0.86, 0.77, CColor.eModel.RGBAdd), rough: 0.8 };
const M_DARKWOOD = { color: new CColor(0.17, 0.1, 0.06, CColor.eModel.RGBAdd), rough: 0.5 };
const M_BRONZE = { color: new CColor(0.22, 0.17, 0.12, CColor.eModel.RGBAdd), rough: 0.35 };
const M_LEATHER = { color: new CColor(0.09, 0.2, 0.15, CColor.eModel.RGBAdd), rough: 0.35 };
const M_VELVET = { color: new CColor(0.5, 0.05, 0.09, CColor.eModel.RGBAdd), rough: 0.9 };
const M_MARBLE = { tex: TEX_MARBLE, tile: 0, rough: 0.25 };
const M_DAMASK = { tex: TEX_DAMASK, tile: 4.5, rough: 0.95 };
const M_PANEL = { tex: TEX_PANEL, tile: 4.2, rough: 0.45 };
const M_COFFER = { tex: TEX_COFFER, tile: 6, rough: 1 };
const M_FLOOR = { tex: TEX_PARQUET, tile: 6, rough: 0.55 };
const M_LAMP_GLOW = { color: new CColor(1.0, 0.92, 0.72, CColor.eModel.RGBAdd), lit: false, shadow: false };
function FaceTile(_sca, _tile) {
    if (_sca.y <= _sca.x && _sca.y <= _sca.z)
        return new CVec4(_sca.x / _tile, _sca.z / _tile, 0, 0);
    if (_sca.x <= _sca.z)
        return new CVec4(_sca.z / _tile, _sca.y / _tile, 0, 0);
    return new CVec4(_sca.x / _tile, _sca.y / _tile, 0, 0);
}
function NewPaint(_mat, _sca, _mesh = gAtl.Frame().Pal().GetBoxMesh()) {
    const pt = new CPaint3D(_mesh);
    if (_mat.tex) {
        pt.SetTexture(_mat.tex);
        if (_mat.tile)
            pt.SetTexCodi(FaceTile(_sca, _mat.tile));
    }
    if (_mat.color)
        pt.SetColorModel(_mat.color);
    if (_mat.rough != null)
        pt.SetMaterial(_mat.rough, 0);
    if (_mat.lit !== false)
        pt.PushTag(CPaint.eTag.Light);
    if (_mat.shadow !== false)
        pt.PushTag(CPaint.eTag.Shadow);
    return pt;
}
function Box(_parent, _pos, _sca, _mat, _key = null) {
    const sub = new CSubject();
    if (_key)
        sub.SetKey(_key);
    sub.SetPos(_pos);
    sub.SetSca(_sca);
    sub.PushComp(NewPaint(_mat, _sca));
    if (_parent)
        _parent.PushChild(sub);
    else
        Main.PushSub(sub);
    return sub;
}
function Sphere(_pos, _radius, _mat) {
    const sub = new CSubject();
    sub.SetPos(_pos);
    sub.SetSca(new CVec3(_radius * 2, _radius * 2, _radius * 2));
    sub.PushComp(NewPaint(_mat, sub.GetSca(), gAtl.Frame().Pal().GetSphereMesh()));
    Main.PushSub(sub);
    return sub;
}
function DirLight(_dir, _color, _shadow) {
    const sub = Main.PushSub(new CSubject());
    sub.SetPos(_dir);
    const lig = sub.PushComp(new CLight());
    lig.SetDirect();
    lig.SetColor(_color);
    if (_shadow) {
        lig.SetShadow3D("sun", 0, 0);
        lig.SetShadowDistance(160);
    }
    return lig;
}
function PointLight(_pos, _color, _outer, _inner) {
    const sub = Main.PushSub(new CSubject());
    sub.SetPos(_pos);
    const lig = sub.PushComp(new CLight());
    lig.SetPoint(_outer, _inner);
    lig.SetColor(_color);
    return lig;
}
DirLight(new CVec3(0.22, 1, 0.3), new CVec3(1.1, 0.98, 0.8), true);
DirLight(new CVec3(0, -1, 0), new CVec3(0.1, 0.08, 0.06), false);
DirLight(new CVec3(-0.4, 0.5, -0.6), new CVec3(0.12, 0.12, 0.15), false);
for (const z of [-28, 0, 28]) {
    PointLight(new CVec3(0, 12, z), new CVec3(0.4, 0.33, 0.25), 30, 6);
}
gAtl.Brush().EnsureDefaultRP();
const shadowReadRP = gAtl.Brush().FindAutoRP("ShadowRead_3D");
shadowReadRP.mShaderAttr.push(new CShaderAttr("bias", new CVec1(0.15)));
shadowReadRP.mShaderAttr.push(new CShaderAttr("normalBias", new CVec1(0.4)));
shadowReadRP.mShaderAttr.push(new CShaderAttr("PCF", new CVec1(2)));
const sky = Main.PushSub(new CSubject());
sky.SetKey("Sky");
sky.PushComp(new CPaintCube("")).Sky(true, true, true);
Box(null, new CVec3(0, -0.25, 0), new CVec3(W * 2 + 2, 0.5, L * 2 + 2), M_FLOOR, "Floor");
const carpet = Box(null, new CVec3(0, 0.04, -2), new CVec3(8, 0.08, 72), { tex: TEX_CARPET, rough: 1 }, "Carpet");
carpet.FindComp(CPaint3D).SetTexCodi(new CVec4(1, 72 / 8, 0, 0));
function DressWall(_center, _normal, _length, _inset) {
    const alongX = Math.abs(_normal.z) > 0.5;
    const Piece = (_y, _hgt, _dep, _mat) => {
        const len = _inset ? _length - _dep * 2 : _length;
        const sca = alongX ? new CVec3(len, _hgt, _dep) : new CVec3(_dep, _hgt, len);
        const off = _dep / 2;
        Box(null, new CVec3(_center.x + _normal.x * off, _y, _center.z + _normal.z * off), sca, _mat);
    };
    const back = alongX ? new CVec3(_length + 2, H + 1, 1) : new CVec3(1, H + 1, _length + 2);
    Box(null, new CVec3(_center.x - _normal.x * 0.5, H / 2, _center.z - _normal.z * 0.5), back, M_DAMASK);
    Piece(2.1, 4.2, 0.3, M_PANEL);
    Piece(0.45, 0.9, 0.45, M_DARKWOOD);
    Piece(4.3, 0.35, 0.5, M_GOLD);
    Piece(21.9, 4.2, 0.2, M_CREAM);
    Piece(19.3, 0.25, 0.4, M_GOLD);
    Piece(19.9, 0.9, 1.1, M_CREAM);
    Piece(23.6, 0.8, 0.7, M_CREAM);
}
DressWall(new CVec3(-W, 0, 0), new CVec3(1, 0, 0), L * 2, false);
DressWall(new CVec3(W, 0, 0), new CVec3(-1, 0, 0), L * 2, false);
DressWall(new CVec3(0, 0, L), new CVec3(0, 0, -1), W * 2, true);
DressWall(new CVec3(0, 0, -L), new CVec3(0, 0, 1), W * 2, true);
function Pilaster(_x, _z, _normal) {
    const alongX = Math.abs(_normal.z) > 0.5;
    const Sca = (_wid, _hgt, _dep) => alongX ? new CVec3(_wid, _hgt, _dep) : new CVec3(_dep, _hgt, _wid);
    const At = (_off, _y) => new CVec3(_x + _normal.x * _off, _y, _z + _normal.z * _off);
    Box(null, At(0.45, 9.7), Sca(2.4, 19.4, 0.9), M_MARBLE);
    Box(null, At(0.65, 0.7), Sca(3.2, 1.4, 1.3), M_MARBLE);
    Box(null, At(0.7, 1.5), Sca(3.0, 0.2, 1.4), M_GOLD);
    Box(null, At(0.7, 18.7), Sca(3.2, 1.2, 1.4), M_MARBLE);
    Box(null, At(0.8, 18.0), Sca(3.0, 0.2, 1.6), M_GOLD);
}
for (const z of [-32, 0, 32]) {
    Pilaster(-W, z, new CVec3(1, 0, 0));
    Pilaster(W, z, new CVec3(-1, 0, 0));
}
for (const x of [-11.5, 11.5]) {
    Pilaster(x, L, new CVec3(0, 0, -1));
    Pilaster(x, -L, new CVec3(0, 0, 1));
}
Box(null, new CVec3(-(W + SKY_X) / 2, H + 0.5, 0), new CVec3(W - SKY_X, 1, L * 2), M_COFFER);
Box(null, new CVec3((W + SKY_X) / 2, H + 0.5, 0), new CVec3(W - SKY_X, 1, L * 2), M_COFFER);
Box(null, new CVec3(0, H + 0.5, (L + SKY_Z) / 2), new CVec3(SKY_X * 2, 1, L - SKY_Z), M_COFFER);
Box(null, new CVec3(0, H + 0.5, -(L + SKY_Z) / 2), new CVec3(SKY_X * 2, 1, L - SKY_Z), M_COFFER);
const wellY0 = H + 0.2;
const wellH = WELL_TOP - wellY0;
for (const s of [-1, 1]) {
    Box(null, new CVec3(s * (SKY_X + 0.25), wellY0 + wellH / 2, 0), new CVec3(0.5, wellH, SKY_Z * 2 + 1), M_CREAM);
    Box(null, new CVec3(0, wellY0 + wellH / 2, s * (SKY_Z + 0.25)), new CVec3(SKY_X * 2, wellH, 0.5), M_CREAM);
    Box(null, new CVec3(s * (SKY_X - 0.2), H - 0.1, 0), new CVec3(0.5, 0.4, SKY_Z * 2), M_GOLD);
    Box(null, new CVec3(0, H - 0.1, s * (SKY_Z - 0.2)), new CVec3((SKY_X - 0.45) * 2, 0.4, 0.5), M_GOLD);
}
for (let z = -SKY_Z + 9; z < SKY_Z; z += 9) {
    Box(null, new CVec3(0, WELL_TOP, z), new CVec3(SKY_X * 2, 0.3, 0.3), M_BRONZE);
}
Box(null, new CVec3(0, WELL_TOP, 0), new CVec3(0.3, 0.36, SKY_Z * 2), M_BRONZE);
const gArtworks = [
    {
        key: "Art_MonaLisa", tex: "Res/monalisa_1781486137734.jpg", crop: [138, 97, 886, 1000], height: 9.4, frame: 1.1,
        pos: new CVec3(0, ART_Y, L), rotY: Math.PI, normal: new CVec3(0, 0, -1),
        title: "모나리자", titleEn: "Mona Lisa", artist: "레오나르도 다 빈치", artistEn: "Leonardo da Vinci", year: "c. 1503",
        desc: "다 빈치가 개척한 스푸마토(sfumato) 기법으로 피사체의 경계선을 안개처럼 부드럽게 흐려, 설명하기 힘든 신비롭고 미묘한 표정을 완성했습니다. 인물의 배경에 비현실적인 산수 풍경을 배치하여 예술적 영비감을 더해 줍니다."
    },
    {
        key: "Art_StarryNight", tex: "Res/starry_night_1781486150455.jpg", crop: [0, 0, 1024, 936], height: 10.4, frame: 0.9,
        pos: new CVec3(-W, ART_Y, -16), rotY: Math.PI / 2, normal: new CVec3(1, 0, 0),
        title: "별이 빛나는 밤", titleEn: "The Starry Night", artist: "빈센트 반 고흐", artistEn: "Vincent van Gogh", year: "1889",
        desc: "생레미 요양원의 동쪽 창밖 풍경을 모티브로 그린 고흐의 절정기 작품입니다. 밤하늘에 소용돌이치는 격렬한 파란색 기류와 활활 타오르는 불꽃 같은 사이프러스 나무는 작가의 깊은 내면적 불안과 무한에 대한 갈망을 두꺼운 임파스토 붓 터치로 뿜어내고 있습니다."
    },
    {
        key: "Art_WaterLilies", tex: "Res/water_lilies_1781486202388.jpg", crop: [58, 56, 966, 966], height: 10.8, frame: 0.9,
        pos: new CVec3(-W, ART_Y, 16), rotY: Math.PI / 2, normal: new CVec3(1, 0, 0),
        title: "수련", titleEn: "Water Lilies", artist: "클로드 모네", artistEn: "Claude Monet", year: "c. 1916",
        desc: "지베르니 자택 정원에 연못을 조성하고 평생에 걸쳐 물위의 빛을 탐구했던 모네의 인상주의 걸작입니다. 캔버스 가장자리를 잘라내어 지평선이나 하늘이 보이지 않게 하고, 오직 수면 위의 수련과 빛의 굴절, 버드나무의 반영만을 채색해 무한한 물의 연출을 빚어냈습니다."
    },
    {
        key: "Art_BirthOfVenus", tex: "Res/birth_of_venus_1781486163028.jpg", crop: [0, 0, 1024, 1024], height: 11.2, frame: 0.9,
        pos: new CVec3(W, ART_Y, -16), rotY: -Math.PI / 2, normal: new CVec3(-1, 0, 0),
        title: "비너스의 탄생", titleEn: "The Birth of Venus", artist: "산드로 보티첼리", artistEn: "Sandro Botticelli", year: "c. 1486",
        desc: "그리스 신화를 바탕으로 미의 여신 아프로디테가 파도 거품 속에서 성숙한 여성의 모습으로 솟아올라 조개껍데기에 탄 채 키프로스 해안에 도착하는 고전적 서사를 묘사했습니다. 피렌체 르네상스의 시적인 아름다움과 조화가 극대화된 수작입니다."
    },
    {
        key: "Art_TheScream", tex: "Res/the_scream_1781486188181.jpg", crop: [0, 0, 1024, 1024], height: 10.4, frame: 0.9,
        pos: new CVec3(W, ART_Y, 16), rotY: -Math.PI / 2, normal: new CVec3(-1, 0, 0),
        title: "절규", titleEn: "The Scream", artist: "에드바르 뭉크", artistEn: "Edvard Munch", year: "1893",
        desc: "핏빛으로 이글거리는 노을 하늘과 물결처럼 굽이치는 자연 속에서 귀를 틀어막고 극단적 비명을 지르는 고독한 자아를 묘사했습니다. 뭉크 본인의 우울증과 현대 실존주의적 소외, 그리고 감정적 정서를 고스란히 캔버스 표면에 투영한 표현주의의 기념비입니다."
    },
    {
        key: "Art_PearlEarring", tex: "Res/pearl_earring_1781486175338.jpg", crop: [0, 0, 1024, 1024], height: 8.6, frame: 0.9,
        pos: new CVec3(0, ART_Y, -L), rotY: 0, normal: new CVec3(0, 0, 1),
        title: "진주 귀걸이를 한 소녀", titleEn: "Girl with a Pearl Earring", artist: "요하네스 페르메이르", artistEn: "Johannes Vermeer", year: "c. 1665",
        desc: "북유럽의 모나리자로도 일컬어지는 매혹적인 인물 트로니(Tronie) 양식의 초상화입니다. 어둡고 깊은 공백의 배경 속에서 유난히 돋보이는 터번과 반짝이는 물방울 모양의 거대한 진주 귀걸이, 관객을 흡입하듯 바라보는 소녀의 시선이 조화를 이룹니다."
    },
];
function BuildArtwork(_art) {
    const [x0, y0, x1, y1] = _art.crop;
    const h = _art.height;
    const w = h * (x1 - x0) / (y1 - y0);
    const f = _art.frame;
    const d = 0.9;
    const root = new CSubject();
    root.SetKey(_art.key);
    root.SetPos(_art.pos);
    root.SetRot(new CVec3(0, _art.rotY, 0));
    const hw = w / 2, hh = h / 2;
    const ow = hw + f, oh = hh + f;
    Box(root, new CVec3(0, hh + f / 2, d / 2), new CVec3(w + f * 2, f, d), M_GOLD);
    Box(root, new CVec3(0, -hh - f / 2, d / 2), new CVec3(w + f * 2, f, d), M_GOLD);
    Box(root, new CVec3(-hw - f / 2, 0, d / 2), new CVec3(f, h, d), M_GOLD);
    Box(root, new CVec3(hw + f / 2, 0, d / 2), new CVec3(f, h, d), M_GOLD);
    const bead = 0.2, beadIn = 0.03, beadZ0 = d - 0.1, beadZ1 = d + 0.15;
    const beadZ = (beadZ0 + beadZ1) / 2, beadD = beadZ1 - beadZ0;
    const beadMid = (ow - beadIn) - bead / 2;
    const beadMidY = (oh - beadIn) - bead / 2;
    Box(root, new CVec3(0, beadMidY, beadZ), new CVec3((ow - beadIn) * 2, bead, beadD), M_DARKGOLD);
    Box(root, new CVec3(0, -beadMidY, beadZ), new CVec3((ow - beadIn) * 2, bead, beadD), M_DARKGOLD);
    Box(root, new CVec3(-beadMid, 0, beadZ), new CVec3(bead, (oh - beadIn - bead) * 2, beadD), M_DARKGOLD);
    Box(root, new CVec3(beadMid, 0, beadZ), new CVec3(bead, (oh - beadIn - bead) * 2, beadD), M_DARKGOLD);
    const lip = 0.18, lipIn = 0.1, lipZ0 = 0.3, lipZ1 = d - 0.2;
    const lipZ = (lipZ0 + lipZ1) / 2, lipD = lipZ1 - lipZ0;
    Box(root, new CVec3(0, hh - lip / 2 + lipIn / 2, lipZ), new CVec3(w, lip + lipIn, lipD), M_DARKGOLD);
    Box(root, new CVec3(0, -hh + lip / 2 - lipIn / 2, lipZ), new CVec3(w, lip + lipIn, lipD), M_DARKGOLD);
    Box(root, new CVec3(-hw + lip / 2 - lipIn / 2, 0, lipZ), new CVec3(lip + lipIn, (hh - lip) * 2, lipD), M_DARKGOLD);
    Box(root, new CVec3(hw - lip / 2 + lipIn / 2, 0, lipZ), new CVec3(lip + lipIn, (hh - lip) * 2, lipD), M_DARKGOLD);
    const canvas = new CSubject();
    canvas.SetPos(new CVec3(0, 0, 0.4));
    canvas.SetSca(new CVec3(w, h, 0.1));
    const artPt = new CPaint3D(gAtl.Frame().Pal().GetBoxMesh());
    artPt.SetTexture(_art.tex);
    artPt.SetTexCodi(x0, y0, x1, y1, 1024, 1024, 0);
    artPt.SetColorModel(new CColor(0.96, 0.95, 0.92, CColor.eModel.RGBMul));
    canvas.PushComp(artPt);
    root.PushChild(canvas);
    const lampY = hh + f + 0.9;
    Box(root, new CVec3(0, lampY, 1.0), new CVec3(0.18, 0.18, 2.0), M_GOLD);
    Box(root, new CVec3(0, lampY - 0.15, 2.1), new CVec3(w * 0.55, 0.4, 0.55), M_GOLD);
    Box(root, new CVec3(0, lampY - 0.37, 2.1), new CVec3(w * 0.52, 0.05, 0.3), M_LAMP_GLOW);
    const plaqueKey = BuildPlaqueTex("ArtMuseum/plaque_" + _art.key + ".tex", _art.title, _art.titleEn, _art.artistEn, _art.year);
    const plaque = new CSubject();
    plaque.SetPos(new CVec3(hw + f + 2.4, 5.8 - _art.pos.y, 0.08));
    plaque.SetSca(new CVec3(3.0, 1.5, 0.12));
    const plaquePt = new CPaint3D(gAtl.Frame().Pal().GetBoxMesh());
    plaquePt.SetTexture(plaqueKey);
    plaquePt.SetColorModel(new CColor(0.88, 0.86, 0.82, CColor.eModel.RGBMul));
    plaque.PushComp(plaquePt);
    root.PushChild(plaque);
    const bound = new CBound();
    bound.mMin = new CVec3(-hw - f, -hh - f, 0);
    bound.mMax = new CVec3(hw + f, hh + f, 1.2);
    bound.SetType(CBound.eType.Box);
    root.PushComp(new CCollider(bound));
    Main.PushSub(root);
    const n = _art.normal;
    PointLight(new CVec3(_art.pos.x + n.x * 6, _art.pos.y + hh + 3.5, _art.pos.z + n.z * 6), new CVec3(1.7, 1.45, 1.1), 17, 4);
}
for (const art of gArtworks)
    BuildArtwork(art);
const gObstacles = [];
function Bench(_z) {
    Box(null, new CVec3(0, 0.6, _z), new CVec3(2.0, 1.2, 6.4), M_DARKWOOD);
    Box(null, new CVec3(0, 1.45, _z), new CVec3(2.8, 0.5, 7.4), M_LEATHER);
    Box(null, new CVec3(0, 1.2, _z), new CVec3(2.9, 0.12, 7.5), M_GOLD);
    gObstacles.push({ x0: -1.5, x1: 1.5, z0: _z - 3.8, z1: _z + 3.8 });
}
Bench(-16);
Bench(16);
const ropeZ = L - 6;
for (const x of [-6.5, 0, 6.5]) {
    Box(null, new CVec3(x, 0.1, ropeZ), new CVec3(1.0, 0.2, 1.0), M_GOLD);
    Box(null, new CVec3(x, 1.5, ropeZ), new CVec3(0.28, 2.8, 0.28), M_GOLD);
    Sphere(new CVec3(x, 3.05, ropeZ), 0.3, M_GOLD);
}
for (const s of [-1, 1]) {
    Box(null, new CVec3(s * 3.25, 2.55, ropeZ), new CVec3(6.5, 0.22, 0.22), M_VELVET);
}
gObstacles.push({ x0: -7, x1: 7, z0: ropeZ - 0.5, z1: ropeZ + 8 });
const camCon = new CCamCon3DFirstPerson(gAtl.Frame().Input());
camCon.SetPosSensitivity(0.025);
camCon.SetRotSensitivity(0.2);
camCon.SetZoomSensitivity(0);
camCon.SetKeyboard(false);
Main.GetCam().SetCamCon(camCon);
Main.GetCam().Init(new CVec3(0, EYE, -36), new CVec3(0, EYE + 1.2, L));
const pad = new CPad();
pad.mKeyType = CPad.eKeyType.Both;
UI2D.PushSub(pad);
const RADIUS = 1.5;
const LIMIT_X = W - 1.3 - RADIUS;
const LIMIT_Z = L - 1.3 - RADIUS;
function ResolvePos(_x, _z) {
    let x = CMath.Clamp(_x, -LIMIT_X, LIMIT_X);
    let z = CMath.Clamp(_z, -LIMIT_Z, LIMIT_Z);
    for (const o of gObstacles) {
        const x0 = o.x0 - RADIUS, x1 = o.x1 + RADIUS, z0 = o.z0 - RADIUS, z1 = o.z1 + RADIUS;
        if (x <= x0 || x >= x1 || z <= z0 || z >= z1)
            continue;
        const push = [x - x0, x1 - x, z - z0, z1 - z];
        const min = Math.min(...push);
        if (min === push[0])
            x = x0;
        else if (min === push[1])
            x = x1;
        else if (min === push[2])
            z = z0;
        else
            z = z1;
    }
    return [x, z];
}
const guide = new CModal("ArtMuseumGuide");
guide.SetTitle(CModal.eTitle.None);
guide.SetResize(false);
guide.SetLimitPush(true);
guide.SetBG("transparent");
guide.SetSize(380, 190);
guide.SetBody(`
<div style="background:rgba(18,14,12,0.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(201,161,74,0.35);border-radius:10px;padding:18px 22px;color:#eee;font-family:Georgia,serif;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
  <div style="font-size:11px;letter-spacing:4px;color:#c9a14a;text-transform:uppercase;">The Grand Gallery</div>
  <div style="font-size:20px;margin:4px 0 12px;color:#fff;">명화 갤러리에 오신 것을 환영합니다</div>
  <div style="font-size:13px;line-height:1.8;color:#cfc6b8;border-top:1px solid rgba(201,161,74,0.2);padding-top:10px;">
    <div><b style="color:#c9a14a">WASD · 방향키 · 패드</b> &nbsp;걷기</div>
    <div><b style="color:#c9a14a">드래그</b> &nbsp;둘러보기</div>
    <div><b style="color:#c9a14a">작품 클릭</b> &nbsp;도슨트 해설</div>
  </div>
</div>`);
guide.Open(CModal.ePos.TopLeft);
if (guide.mCard) {
    guide.mCard.style.border = "none";
    guide.mCard.style.background = "transparent";
    guide.mCard.style.boxShadow = "none";
    guide.mCard.style.pointerEvents = "none";
    guide.mCard.style.transition = "opacity 1.5s ease";
}
setTimeout(() => {
    if (guide.mCard)
        guide.mCard.style.opacity = "0";
    setTimeout(() => guide.Close(), 1600);
}, 12000);
const docent = new CModal("ArtMuseumDocent");
docent.SetTitle(CModal.eTitle.None);
docent.SetResize(false);
docent.SetLimitPush(true);
docent.SetBG("transparent");
docent.SetSize(600, 250);
docent.Open(CModal.ePos.Center);
if (docent.mCard) {
    docent.mCard.style.top = "";
    docent.mCard.style.bottom = "32px";
    docent.mCard.style.left = "50%";
    docent.mCard.style.border = "none";
    docent.mCard.style.background = "transparent";
    docent.mCard.style.boxShadow = "none";
    docent.mCard.style.cursor = "pointer";
    docent.mCard.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    docent.mCard.onclick = () => ShowDocent(null);
}
let gDocentArt = null;
function ShowDocent(_art) {
    if (!docent.mCard)
        return;
    gDocentArt = _art;
    if (_art == null) {
        docent.mCard.style.opacity = "0";
        docent.mCard.style.transform = "translateX(-50%) translateY(16px)";
        docent.mCard.style.pointerEvents = "none";
        return;
    }
    docent.SetBody(`
<div style="background:linear-gradient(160deg,rgba(28,22,18,0.95),rgba(16,13,11,0.93));backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(201,161,74,0.4);border-radius:12px;padding:24px 30px;color:#f3efe8;font-family:Georgia,serif;box-shadow:0 18px 50px rgba(0,0,0,0.65);position:relative;">
  <div style="position:absolute;top:0;left:10%;right:10%;height:2px;background:linear-gradient(90deg,transparent,#c9a14a,transparent);"></div>
  <div style="font-size:11px;letter-spacing:4px;color:#c9a14a;text-transform:uppercase;margin-bottom:6px;">Docent</div>
  <div style="font-size:24px;color:#fff;line-height:1.3;">${_art.title} <span style="font-size:16px;color:#b9ab94;font-style:italic;">${_art.titleEn}</span></div>
  <div style="font-size:14px;color:#a89c88;font-style:italic;margin:4px 0 14px;padding-bottom:12px;border-bottom:1px solid rgba(201,161,74,0.2);">${_art.artist} (${_art.artistEn}) · ${_art.year}</div>
  <div style="font-size:14.5px;line-height:1.75;color:#ddd5c8;">${_art.desc}</div>
  <div style="position:absolute;bottom:8px;right:16px;font-size:10px;color:rgba(201,161,74,0.5);">click to close</div>
</div>`);
    docent.mCard.style.opacity = "1";
    docent.mCard.style.transform = "translateX(-50%) translateY(0)";
    docent.mCard.style.pointerEvents = "auto";
}
ShowDocent(null);
gAtl.Frame().PushEvent(CEvent.eType.Update, (_update) => {
    const cam = Main.GetCam();
    if (pad.mButton.length > 0) {
        for (const btn of pad.mButton)
            btn.Destroy();
        pad.mButton = [];
    }
    camCon.SetPause(pad.IsOn());
    const dir = pad.GetDir();
    if (!dir.IsZero()) {
        const speed = 14.0 * _update.DeltaTime();
        cam.FrontMove(-dir.y * speed);
        cam.CrossMove(-dir.x * speed);
    }
    const eye = cam.GetEye();
    const [nx, nz] = ResolvePos(eye.x, eye.z);
    if (nx !== eye.x || nz !== eye.z || eye.y !== EYE) {
        cam.EyeMoveAndViewCac(new CVec3(nx, EYE, nz));
    }
    const input = gAtl.Frame().Input();
    if (input.KeyUp(CInput.eKey.LButton) && input.GetUI() === null && input.DragState() === CInput.eDragState.None) {
        const mouse = input.Mouse();
        const ray = cam.GetRay(mouse.x, mouse.y);
        let picked = null;
        let best = Infinity;
        for (const col of Main.Pick(ray)) {
            const owner = col.GetOwner();
            const art = owner ? gArtworks.find(a => a.key === owner.Key()) : null;
            if (!art)
                continue;
            const dist = CMath.V3Distance(cam.GetEye(), art.pos);
            if (dist < best) {
                best = dist;
                picked = art;
            }
        }
        if (picked)
            ShowDocent(picked === gDocentArt ? null : picked);
    }
});
