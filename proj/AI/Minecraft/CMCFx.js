import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CAnimation, CClipDestroy } from "../../../Artgine/artgine/app/component/CAnimation.js";
import { CAniFlow } from "../../../Artgine/artgine/app/component/CAniFlow.js";
import { CTexture } from "../../../Artgine/artgine/render/CTexture.js";
import { CAlpha } from "../../../Artgine/artgine/render/CAlpha.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { MC_BLOCK_LIST, MCFindBlock, MCPixels } from "./CMCBlock.js";
import { MCExtraItemIds, MCItemPixels } from "./CMCItem.js";
import { MC_SIZE } from "./CMCWorld.js";
const CRACK_STAGE = 10;
const CRUMB_VARIANT = 2;
const EDGE = 1.8;
export function MCBuildTexture(_frame, _key, _w, _h, _rgba) {
    const tex = new CTexture();
    tex.SetSize(_w, _h);
    tex.CreateBuf();
    tex.GetBuf()[0].set(_rgba);
    tex.SetFilter(CTexture.eFilter.Nearest);
    tex.SetMipMap(CTexture.eMipmap.None);
    _frame.Ren().BuildTexture(tex);
    _frame.Res().Push(_key, tex);
}
export class CMCFx {
    mFrame;
    mCanvas;
    mOutline;
    mCrack;
    mCrackPT;
    mCrackStage = -1;
    mDebris = 10;
    static ItemKey(_id) { return "mc_item_" + _id; }
    static CrumbKey(_id, _v) { return "mc_crumb_" + _id + "_" + _v; }
    static CrackKey(_stage) { return "mc_crack_" + _stage; }
    constructor(_frame, _canvas) {
        this.mFrame = _frame;
        this.mCanvas = _canvas;
        this.BuildTextures();
        this.BuildOutline();
        this.BuildCrack();
    }
    BuildTextures() {
        for (const b of MC_BLOCK_LIST) {
            const px = MCPixels(b.side);
            MCBuildTexture(this.mFrame, CMCFx.ItemKey(b.id), 16, 16, px);
            for (let v = 0; v < CRUMB_VARIANT; ++v) {
                const ox = 2 + v * 6, oy = 3 + v * 4;
                const crumb = new Uint8ClampedArray(4 * 4 * 4);
                for (let y = 0; y < 4; ++y)
                    for (let x = 0; x < 4; ++x)
                        for (let c = 0; c < 4; ++c)
                            crumb[(x + y * 4) * 4 + c] = px[((ox + x) + (oy + y) * 16) * 4 + c];
                MCBuildTexture(this.mFrame, CMCFx.CrumbKey(b.id, v), 4, 4, crumb);
            }
        }
        for (const id of MCExtraItemIds())
            MCBuildTexture(this.mFrame, CMCFx.ItemKey(id), 16, 16, MCItemPixels(id));
        let seed = 4242;
        const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
        const walks = [];
        for (let w = 0; w < 4; ++w) {
            let x = 7 + Math.floor(rnd() * 3), y = 7 + Math.floor(rnd() * 3);
            const dx = w % 2 == 0 ? 1 : -1, dy = w < 2 ? 1 : -1;
            const pts = [];
            for (let s = 0; s < 28; ++s) {
                pts.push([x, y]);
                if (rnd() < 0.55)
                    x += dx;
                else
                    y += dy;
                if (rnd() < 0.2)
                    x -= dx * (rnd() < 0.5 ? 1 : 0);
                x = Math.max(0, Math.min(15, x));
                y = Math.max(0, Math.min(15, y));
            }
            walks.push(pts);
        }
        for (let st = 0; st < CRACK_STAGE; ++st) {
            const img = new Uint8ClampedArray(16 * 16 * 4);
            const keep = Math.ceil(28 * (st + 1) / CRACK_STAGE);
            for (const pts of walks) {
                for (let s = 0; s < keep; ++s) {
                    const o = (pts[s][0] + pts[s][1] * 16) * 4;
                    img[o] = 40;
                    img[o + 1] = 40;
                    img[o + 2] = 40;
                    img[o + 3] = 190;
                }
            }
            MCBuildTexture(this.mFrame, CMCFx.CrackKey(st), 16, 16, img);
        }
    }
    Box(_parent, _pos, _sca) {
        const sub = _parent.PushChild(new CSubject());
        sub.SetPos(_pos);
        sub.SetSca(_sca);
        const pt = sub.PushComp(new CPaint3D());
        pt.SetTexture(this.mFrame.Pal().GetBlackTex());
        return sub;
    }
    BuildOutline() {
        this.mOutline = this.mCanvas.PushSub(new CSubject());
        this.mOutline.SetSca(0);
        const S = MC_SIZE, e = EDGE, L = S + e;
        for (const a of [0, S]) {
            for (const b of [0, S]) {
                this.Box(this.mOutline, new CVec3(S * 0.5, a, b), new CVec3(L, e, e));
                this.Box(this.mOutline, new CVec3(a, S * 0.5, b), new CVec3(e, L, e));
                this.Box(this.mOutline, new CVec3(a, b, S * 0.5), new CVec3(e, e, L));
            }
        }
    }
    BuildCrack() {
        this.mCrack = this.mCanvas.PushSub(new CSubject());
        this.mCrack.SetSca(0);
        this.mCrackPT = this.mCrack.PushComp(new CPaint3D());
        this.mCrackPT.SetTexture(CMCFx.CrackKey(0));
        this.mCrackPT.SetAlphaModel(new CAlpha(1, 0.1));
    }
    ShowTarget(_x, _y, _z) {
        this.mOutline.SetPos(new CVec3(_x * MC_SIZE, _y * MC_SIZE, _z * MC_SIZE));
        this.mOutline.SetSca(1);
        this.mCrack.SetPos(new CVec3((_x + 0.5) * MC_SIZE, (_y + 0.5) * MC_SIZE, (_z + 0.5) * MC_SIZE));
    }
    HideTarget() {
        this.mOutline.SetSca(0);
        this.SetCrack(-1);
    }
    SetCrack(_stage) {
        if (_stage == this.mCrackStage)
            return;
        this.mCrackStage = _stage;
        if (_stage < 0) {
            this.mCrack.SetSca(0);
            return;
        }
        this.mCrackPT.SetTexture(CMCFx.CrackKey(Math.min(_stage, CRACK_STAGE - 1)));
        this.mCrack.SetSca(MC_SIZE * 1.004);
    }
    Burst(_id, _x, _y, _z) {
        if (MCFindBlock(_id) == null)
            return;
        for (let i = 0; i < this.mDebris; ++i) {
            const sub = this.mCanvas.PushSub(new CSubject());
            sub.SetPos(new CVec3((_x + 0.2 + Math.random() * 0.6) * MC_SIZE, (_y + 0.2 + Math.random() * 0.6) * MC_SIZE, (_z + 0.2 + Math.random() * 0.6) * MC_SIZE));
            const sz = 9 + Math.random() * 8;
            sub.SetSca(new CVec3(sz, sz, sz));
            sub.SetRot(new CVec3(Math.random() * 6, Math.random() * 6, Math.random() * 6));
            const pt = sub.PushComp(new CPaint3D());
            pt.SetTexture(CMCFx.CrumbKey(_id, i % CRUMB_VARIANT));
            const rb = sub.PushComp(new CRigidBody());
            rb.SetGravity(1);
            const dir = new CVec3(Math.random() * 2 - 1, 0.5 + Math.random() * 0.9, Math.random() * 2 - 1);
            const len = Math.hypot(dir.x, dir.y, dir.z);
            dir.x /= len;
            dir.y /= len;
            dir.z /= len;
            const speed = 260 + Math.random() * 220;
            const f = new CForce("burst", dir, speed);
            f.SetDirVel(dir, speed, dir, 0);
            f.SetDelay(0.3);
            f.SetRemove(true);
            rb.Push(f);
            const ani = new CAnimation();
            ani.Push(new CClipDestroy(0.9));
            sub.PushComp(new CAniFlow(ani));
        }
    }
}
