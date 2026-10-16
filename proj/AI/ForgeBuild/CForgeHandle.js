import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CComponent } from "../../../Artgine/artgine/app/component/CComponent.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CForgeScene } from "../../../Artgine/plugin/ForgeBuild/CForgeScene.js";
import { CForgeSpline } from "../../../Artgine/plugin/ForgeBuild/CForgeSpline.js";
import { CForgeAdjust } from "../../../Artgine/plugin/ForgeBuild/CForgeAdjust.js";
export class CForgeHandle extends CComponent {
    static sColor = [[1, 1, 1], [1, 0.82, 0.25], [1, 0.45, 0.2]];
    static sSize = 0.55;
    mScene;
    mHistory;
    mTerrain;
    mSync;
    mCanvas;
    mCam;
    mCamCon;
    mShow = true;
    mList = [];
    mPool = [];
    mHover = null;
    mDrag = null;
    mLastClick = null;
    mSel = null;
    mOnSelect = null;
    mPress = null;
    constructor(_scene, _history, _terrain, _sync, _canvas, _cam, _camCon) {
        super();
        this.mScene = _scene;
        this.mHistory = _history;
        this.mTerrain = _terrain;
        this.mSync = _sync;
        this.mCanvas = _canvas;
        this.mCam = _cam;
        this.mCamCon = _camCon;
    }
    Collect() {
        const K = CForgeScene.eKind, G = (_x, _z) => this.mTerrain.HeightM(_x, _z), out = [];
        for (const w of this.mScene.List(K.Wall)) {
            const n = CForgeSpline.IsClosed(w.pts) ? w.pts.length - 1 : w.pts.length;
            for (let i = 0; i < n; i++)
                out.push({ kind: K.Wall, id: w.id, idx: i, x: w.pts[i][0], y: G(w.pts[i][0], w.pts[i][1]) + Math.min(CForgeAdjust.sWallH[1], w.pts[i][2]) + 0.5, z: w.pts[i][1] });
        }
        for (const b of this.mScene.List(K.Building)) {
            let g = -Infinity;
            for (const q of b.poly)
                g = Math.max(g, G(q[0], q[1]));
            const h = this.mSync.Resolved(K.Building, b.id)?.height ?? 4;
            b.poly.forEach((_q, _i) => out.push({ kind: K.Building, id: b.id, idx: _i, x: _q[0], y: g + 0.25 + h + 0.4, z: _q[1] }));
        }
        for (const t of this.mScene.List(K.Tower)) {
            const r = this.mSync.Resolved(K.Tower, t.id);
            out.push({ kind: K.Tower, id: t.id, idx: -1, x: t.c[0], y: G(t.c[0], t.c[1]) + (r?.height ?? 8) + (r?.flat ? 1.8 : (r?.roofH ?? 4) + 0.8), z: t.c[1] });
        }
        for (const m of this.mScene.List(K.Monument)) {
            const c = this.mSync.Resolved(K.Monument, m.id)?.c ?? m.c;
            out.push({ kind: K.Monument, id: m.id, idx: -1, x: c[0], y: G(c[0], c[1]) + 1.2, z: c[1] });
        }
        for (const c of this.mScene.List(K.Church))
            c.poly.forEach((_q, _i) => out.push({ kind: K.Church, id: c.id, idx: _i, x: _q[0], y: G(_q[0], _q[1]) + 1.2, z: _q[1] }));
        for (const k of [K.Path, K.Fence, K.Bridge, K.Stair, K.Dock])
            for (const e of this.mScene.List(k))
                e.pts.forEach((_q, _i) => out.push({ kind: k, id: e.id, idx: _i, x: _q[0], y: G(_q[0], _q[1]) + (k == K.Bridge ? 1.6 : 0.6) + (k == K.Stair && _i == e.pts.length - 1 ? e.top ?? 0 : 0), z: _q[1] }));
        this.mList = out;
    }
    Update(_update) {
        super.Update(_update);
        const input = this.GetOwner().GetFrame().Input(), U = CForgeScene.sUnit;
        this.Collect();
        const m = input.Mouse(), ray = this.mCam.GetRay(m.x, m.y);
        const o = ray.GetOriginal(), d = ray.GetDirect();
        const ro = [o.x / U, o.y / U, o.z / U], rd = [d.x, d.y, d.z];
        if (this.mDrag != null) {
            if (input.KeyDown(CInput.eKey.LButton))
                this.DragMove(ro, rd, m.y, input.KeyDown(CInput.eKey.Shift));
            else
                this.DragEnd();
        }
        else {
            this.mHover = null;
            if (this.mShow && input.GetUI() == null) {
                let best = Infinity;
                for (const h of this.mList) {
                    const px = h.x - ro[0], py = h.y - ro[1], pz = h.z - ro[2];
                    const t = px * rd[0] + py * rd[1] + pz * rd[2];
                    if (t <= 0)
                        continue;
                    const dd = Math.hypot(px - rd[0] * t, py - rd[1] * t, pz - rd[2] * t);
                    if (dd < Math.max(0.45, t * 0.016) && t < best) {
                        best = t;
                        this.mHover = h;
                    }
                }
            }
            if (this.mHover == null && input.KeyDown(CInput.eKey.LButton, true) && input.GetUI() == null)
                this.mPress = [m.x, m.y];
            if (this.mPress != null && !input.KeyDown(CInput.eKey.LButton)) {
                if (Math.hypot(m.x - this.mPress[0], m.y - this.mPress[1]) < 6 && this.mSel != null) {
                    this.mSel = null;
                    this.mOnSelect?.();
                }
                this.mPress = null;
            }
            if (this.mHover != null && input.KeyDown(CInput.eKey.LButton, true)) {
                const h = this.mHover, now = performance.now(), L = this.mLastClick;
                const dbl = L != null && L.kind == h.kind && L.id == h.id && L.idx == h.idx && now - L.t < 350;
                this.mLastClick = dbl ? null : { kind: h.kind, id: h.id, idx: h.idx, t: now };
                if (this.mSel == null || this.mSel.kind != h.kind || this.mSel.id != h.id) {
                    this.mSel = { kind: h.kind, id: h.id };
                    this.mOnSelect?.();
                }
                if (input.KeyDown(CInput.eKey.LControl))
                    this.RemovePoint(h);
                else if (dbl)
                    this.InsertPoint(h);
                else
                    this.DragBegin(h, ro, rd, m.y);
            }
        }
        this.Draw();
    }
    DragBegin(_h, _ro, _rd, _my) {
        const e = CForgeScene.Clone(this.mScene.Find(_h.kind, _h.id));
        if (e == null)
            return;
        let v0 = 0;
        if (_h.kind == CForgeScene.eKind.Wall)
            v0 = e.pts[_h.idx][2];
        else if (_h.kind == CForgeScene.eKind.Building || _h.kind == CForgeScene.eKind.Tower)
            v0 = e.height;
        else if (_h.kind == CForgeScene.eKind.Stair)
            v0 = e.top ?? 0;
        let ox = 0, oz = 0;
        if (Math.abs(_rd[1]) > 1e-4) {
            const t = (_h.y - _ro[1]) / _rd[1];
            ox = _h.x - (_ro[0] + _rd[0] * t);
            oz = _h.z - (_ro[2] + _rd[2] * t);
        }
        this.mDrag = { h: _h, ent: e, y0: _my, v0, dist: Math.hypot(_h.x - _ro[0], _h.y - _ro[1], _h.z - _ro[2]), ox, oz, links: this.FindLinks(_h, e) };
        this.mCamCon.mLock = true;
        this.mHistory.Begin("drag");
    }
    FindLinks(_h, _e) {
        const K = CForgeScene.eKind, out = [];
        if (_h.kind == K.Wall) {
            const p = _e.pts[_h.idx];
            for (const t of this.mScene.List(K.Tower))
                if (Math.hypot(t.c[0] - p[0], t.c[1] - p[1]) < t.r + 0.5)
                    out.push({ kind: K.Tower, ent: CForgeScene.Clone(t), idx: [-1], org: [[t.c[0], t.c[1]]] });
        }
        else if (_h.kind == K.Tower) {
            for (const w of this.mScene.List(K.Wall)) {
                const idx = [], org = [];
                w.pts.forEach((_q, _i) => { if (Math.hypot(_q[0] - _e.c[0], _q[1] - _e.c[1]) < _e.r + 0.5) {
                    idx.push(_i);
                    org.push([_q[0], _q[1]]);
                } });
                if (idx.length > 0)
                    out.push({ kind: K.Wall, ent: CForgeScene.Clone(w), idx, org });
            }
        }
        return out;
    }
    DragMove(_ro, _rd, _my, _shift) {
        const D = this.mDrag, e = D.ent, h = D.h, K = CForgeScene.eKind;
        if (_shift) {
            const lim = h.kind == K.Wall ? CForgeAdjust.sWallH : h.kind == K.Building ? CForgeAdjust.sBuildingH : h.kind == K.Stair ? CForgeHandle.sStairTop : CForgeAdjust.sTowerH;
            const v = Math.min(lim[1], Math.max(lim[0], D.v0 + (_my - D.y0) * D.dist * 0.0006));
            if (h.kind == K.Wall) {
                e.pts[h.idx][2] = v;
                if (CForgeSpline.IsClosed(e.pts) && h.idx == 0)
                    e.pts[e.pts.length - 1][2] = v;
            }
            else if (h.kind == K.Building || h.kind == K.Tower)
                e.height = v;
            else if (h.kind == K.Stair)
                e.top = v;
            else
                return;
            this.mHistory.Push(h.kind, e, "drag");
            return;
        }
        {
            if (Math.abs(_rd[1]) < 1e-4)
                return;
            const t = (h.y - _ro[1]) / _rd[1];
            if (t <= 0)
                return;
            const S = CForgeScene.sSize;
            const x = Math.min(S - 1, Math.max(1, _ro[0] + _rd[0] * t + D.ox)), z = Math.min(S - 1, Math.max(1, _ro[2] + _rd[2] * t + D.oz));
            const dx = x - h.x, dz = z - h.z;
            if (h.kind == K.Tower || h.kind == K.Monument)
                e.c = [x, z];
            else if (h.kind == K.Building || h.kind == K.Church)
                e.poly[h.idx] = [x, z];
            else {
                const closed = CForgeSpline.IsClosed(e.pts);
                e.pts[h.idx][0] = x;
                e.pts[h.idx][1] = z;
                if (closed && h.idx == 0) {
                    e.pts[e.pts.length - 1][0] = x;
                    e.pts[e.pts.length - 1][1] = z;
                }
            }
            for (const l of D.links) {
                if (l.kind == K.Tower)
                    l.ent.c = [l.org[0][0] + dx, l.org[0][1] + dz];
                else
                    l.idx.forEach((_i, _k) => { l.ent.pts[_i][0] = l.org[_k][0] + dx; l.ent.pts[_i][1] = l.org[_k][1] + dz; });
                this.mHistory.Push(l.kind, l.ent, "drag");
            }
        }
        this.mHistory.Push(h.kind, e, "drag");
    }
    DragEnd() {
        this.mDrag = null;
        this.mCamCon.mLock = false;
        this.mHistory.End();
    }
    static sStairTop = [0, 12];
    static MinCount(_kind) { return _kind == CForgeScene.eKind.Building || _kind == CForgeScene.eKind.Church ? 3 : 2; }
    RemovePoint(_h) {
        const e = CForgeScene.Clone(this.mScene.Find(_h.kind, _h.id));
        if (e == null)
            return;
        if (_h.kind == CForgeScene.eKind.Tower || _h.kind == CForgeScene.eKind.Monument) {
            this.mHistory.Remove(_h.kind, _h.id, "remove");
            return;
        }
        const key = _h.kind == CForgeScene.eKind.Building || _h.kind == CForgeScene.eKind.Church ? "poly" : "pts";
        const arr = e[key];
        const closed = key == "pts" && CForgeSpline.IsClosed(arr);
        const n = closed ? arr.length - 1 : arr.length;
        if (n - 1 < CForgeHandle.MinCount(_h.kind) + (closed ? 1 : 0)) {
            this.mHistory.Remove(_h.kind, _h.id, "remove");
            return;
        }
        arr.splice(_h.idx, 1);
        if (closed)
            arr[arr.length - 1] = arr[0].slice();
        this.mHistory.Push(_h.kind, e, "remove point");
    }
    InsertPoint(_h) {
        const e = CForgeScene.Clone(this.mScene.Find(_h.kind, _h.id));
        if (e == null || _h.kind == CForgeScene.eKind.Tower || _h.kind == CForgeScene.eKind.Monument || _h.kind == CForgeScene.eKind.Stair)
            return;
        const key = _h.kind == CForgeScene.eKind.Building || _h.kind == CForgeScene.eKind.Church ? "poly" : "pts";
        const arr = e[key];
        let a = _h.idx, b = _h.idx + 1, at = _h.idx + 1;
        if (b >= arr.length) {
            if (key == "poly") {
                b = 0;
                at = arr.length;
            }
            else {
                a = _h.idx - 1;
                b = _h.idx;
                at = _h.idx;
            }
        }
        if (a < 0)
            return;
        arr.splice(at, 0, arr[a].map((_v, _k) => (_v + arr[b][_k]) * 0.5));
        this.mHistory.Push(_h.kind, e, "insert point");
    }
    Draw() {
        const U = CForgeScene.sUnit, s = CForgeHandle.sSize * U, list = this.mShow ? this.mList : [];
        while (this.mPool.length < list.length) {
            const sub = this.mCanvas.PushSub(new CSubject());
            const pt = sub.PushComp(new CPaint3D(this.mCanvas.GetFrame().Pal().GetBoxMesh()));
            pt.SetColorModel(new CColor(1, 1, 1, CColor.eModel.RGBAdd));
            this.mPool.push({ sub, pt, col: 0 });
        }
        for (let i = 0; i < this.mPool.length; i++) {
            const p = this.mPool[i], h = list[i];
            if (h == null) {
                if (p.sub.IsEnable())
                    p.sub.SetEnable(false);
                continue;
            }
            if (!p.sub.IsEnable())
                p.sub.SetEnable(true);
            const same = (_o) => _o != null && _o.kind == h.kind && _o.id == h.id && _o.idx == h.idx;
            const col = this.mDrag != null && same(this.mDrag.h) ? 2 : same(this.mHover) ? 1 : 0;
            if (col != p.col) {
                const c = CForgeHandle.sColor[col];
                p.pt.SetColorModel(new CColor(c[0], c[1], c[2], CColor.eModel.RGBAdd));
                p.col = col;
            }
            p.sub.SetPos(new CVec3(h.x * U, h.y * U, h.z * U));
            p.sub.SetSca(new CVec3(s, s, s));
        }
    }
}
