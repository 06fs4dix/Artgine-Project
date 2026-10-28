import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CCamCon } from "../../../Artgine/artgine/util/CCamCon.js";
export class CForgeWalk extends CCamCon {
    mRadius = 0.3;
    mEyeH = 1.62;
    mBodyH = 1.75;
    mStepUp = 0.45;
    mStepDown = 0.5;
    mGravity = 24;
    mJumpV = 6.5;
    mWalk = 3.2;
    mRun = 5.6;
    mWalkable = 0.72;
    mReach = 2.3;
    mFov = 1.35;
    mPrevFov = null;
    mOn = false;
    mPos = [64, 0, 64];
    mVel = [0, 0, 0];
    mYaw = 0;
    mPitch = 0;
    mGround = false;
    mTerrain = (_x, _z) => 0;
    mHulls = () => [];
    mSubs = () => [];
    mOnExit = null;
    mKey = new Set();
    mLook = [0, 0];
    mFocus = null;
    mTri = [];
    mGrid = new Map();
    mDyn = [];
    mHud = null;
    mCross = null;
    mLocked = false;
    mPrev = new Map();
    sCell = 4;
    constructor(_input) { super(_input); }
    Rebuild() {
        this.mTri = [];
        this.mGrid.clear();
        let id = 0;
        for (const h of this.mHulls())
            for (const t of this.ToTris(h, id)) {
                this.mTri.push(t);
                id++;
                this.Insert(t);
            }
    }
    ToTris(_h, _id) {
        const out = [];
        let cx = 0, cy = 0, cz = 0;
        for (const q of _h) {
            cx += q[0];
            cy += q[1];
            cz += q[2];
        }
        cx /= _h.length;
        cy /= _h.length;
        cz /= _h.length;
        for (let i = 0; i + 2 < _h.length; i += 3) {
            const a = _h[i], b = _h[i + 1], c = _h[i + 2];
            const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
            let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
            const l = Math.hypot(n[0], n[1], n[2]);
            if (l < 1e-9)
                continue;
            n = [n[0] / l, n[1] / l, n[2] / l];
            const mx = (a[0] + b[0] + c[0]) / 3 - cx, my = (a[1] + b[1] + c[1]) / 3 - cy, mz = (a[2] + b[2] + c[2]) / 3 - cz;
            if (n[0] * mx + n[1] * my + n[2] * mz < 0)
                n = [-n[0], -n[1], -n[2]];
            out.push({ a, b, c, n, id: _id + out.length });
        }
        return out;
    }
    Insert(_t) {
        const S = this.sCell, x0 = Math.floor(Math.min(_t.a[0], _t.b[0], _t.c[0]) / S), x1 = Math.floor(Math.max(_t.a[0], _t.b[0], _t.c[0]) / S);
        const z0 = Math.floor(Math.min(_t.a[2], _t.b[2], _t.c[2]) / S), z1 = Math.floor(Math.max(_t.a[2], _t.b[2], _t.c[2]) / S);
        for (let x = x0; x <= x1; x++)
            for (let z = z0; z <= z1; z++) {
                const k = x * 73856093 ^ z * 19349663;
                let l = this.mGrid.get(k);
                if (l == null) {
                    l = [];
                    this.mGrid.set(k, l);
                }
                l.push(_t);
            }
    }
    Near(_x, _z, _r) {
        const S = this.sCell, out = [], seen = new Set();
        for (let x = Math.floor((_x - _r) / S); x <= Math.floor((_x + _r) / S); x++)
            for (let z = Math.floor((_z - _r) / S); z <= Math.floor((_z + _r) / S); z++) {
                const l = this.mGrid.get(x * 73856093 ^ z * 19349663);
                if (l == null)
                    continue;
                for (const t of l)
                    if (!seen.has(t.id)) {
                        seen.add(t.id);
                        out.push(t);
                    }
            }
        for (const t of this.mDyn)
            out.push(t);
        return out;
    }
    RefreshDyn() {
        this.mDyn = [];
        let id = -1000000;
        for (const s of this.mSubs())
            for (const h of s.GetBlockers())
                for (const t of this.ToTris(h, id)) {
                    this.mDyn.push(t);
                    id -= 1;
                }
    }
    Closest(_p, _t) {
        const a = _t.a, b = _t.b, c = _t.c;
        const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], ap = [_p[0] - a[0], _p[1] - a[1], _p[2] - a[2]];
        const D = (x, y) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
        const d1 = D(ab, ap), d2 = D(ac, ap);
        if (d1 <= 0 && d2 <= 0)
            return a;
        const bp = [_p[0] - b[0], _p[1] - b[1], _p[2] - b[2]], d3 = D(ab, bp), d4 = D(ac, bp);
        if (d3 >= 0 && d4 <= d3)
            return b;
        const vc = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) {
            const v = d1 / (d1 - d3);
            return [a[0] + ab[0] * v, a[1] + ab[1] * v, a[2] + ab[2] * v];
        }
        const cp = [_p[0] - c[0], _p[1] - c[1], _p[2] - c[2]], d5 = D(ab, cp), d6 = D(ac, cp);
        if (d6 >= 0 && d5 <= d6)
            return c;
        const vb = d5 * d2 - d1 * d6;
        if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            const w = d2 / (d2 - d6);
            return [a[0] + ac[0] * w, a[1] + ac[1] * w, a[2] + ac[2] * w];
        }
        const va = d3 * d6 - d5 * d4;
        if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
            const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
            return [b[0] + (c[0] - b[0]) * w, b[1] + (c[1] - b[1]) * w, b[2] + (c[2] - b[2]) * w];
        }
        const den = 1 / (va + vb + vc), v = vb * den, w = vc * den;
        return [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w];
    }
    RayDown(_x, _z, _maxY, _near) {
        let best = -Infinity;
        for (const t of _near) {
            if (t.n[1] < this.mWalkable)
                continue;
            const a = t.a, b = t.b, c = t.c, d = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
            if (Math.abs(d) < 1e-12)
                continue;
            const l1 = ((b[2] - c[2]) * (_x - c[0]) + (c[0] - b[0]) * (_z - c[2])) / d, l2 = ((c[2] - a[2]) * (_x - c[0]) + (a[0] - c[0]) * (_z - c[2])) / d, l3 = 1 - l1 - l2;
            if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6)
                continue;
            const y = l1 * a[1] + l2 * b[1] + l3 * c[1];
            if (y <= _maxY && y > best)
                best = y;
        }
        return best;
    }
    GroundAt(_x, _z, _maxY, _near) {
        let best = this.mTerrain(_x, _z);
        const r = this.mRadius * 0.7;
        for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) {
            const y = this.RayDown(_x + dx, _z + dz, _maxY, _near);
            if (y > best)
                best = y;
        }
        return best;
    }
    Push() {
        const r = this.mRadius, p = this.mPos, near = this.Near(p[0], p[2], r + 1.5);
        for (let it = 0; it < 4; it++) {
            let moved = false;
            for (const h of [this.mStepUp + 0.1, 1.05, this.mBodyH - r]) {
                const c = [p[0], p[1] + h, p[2]];
                for (const t of near) {
                    const wall = Math.abs(t.n[1]) < this.mWalkable, ceil = t.n[1] <= -this.mWalkable && h > 1.2;
                    if (!wall && !ceil)
                        continue;
                    const q = this.Closest(c, t), dx = c[0] - q[0], dy = c[1] - q[1], dz = c[2] - q[2], dd = Math.hypot(dx, dy, dz);
                    if (dd >= r || dd < 1e-9)
                        continue;
                    const k = (r - dd) / dd;
                    p[0] += dx * k;
                    p[2] += dz * k;
                    if (ceil) {
                        p[1] += Math.min(0, dy * k);
                        if (this.mVel[1] > 0)
                            this.mVel[1] = 0;
                    }
                    moved = true;
                }
            }
            if (!moved)
                break;
        }
    }
    Tick(_dt) {
        const dt = Math.min(Math.max(_dt, 0), 0.05), K = this.mKey;
        this.mYaw += this.mLook[0];
        this.mPitch = Math.min(1.45, Math.max(-1.45, this.mPitch + this.mLook[1]));
        this.mLook[0] = 0;
        this.mLook[1] = 0;
        if (K.has("ArrowLeft"))
            this.mYaw += 1.8 * dt;
        if (K.has("ArrowRight"))
            this.mYaw -= 1.8 * dt;
        if (K.has("ArrowUp"))
            this.mPitch = Math.min(1.45, this.mPitch + 1.2 * dt);
        if (K.has("ArrowDown"))
            this.mPitch = Math.max(-1.45, this.mPitch - 1.2 * dt);
        const f = [Math.sin(this.mYaw), Math.cos(this.mYaw)], rt = [-f[1], f[0]];
        let mx = 0, mz = 0;
        if (K.has("KeyW")) {
            mx += f[0];
            mz += f[1];
        }
        if (K.has("KeyS")) {
            mx -= f[0];
            mz -= f[1];
        }
        if (K.has("KeyD")) {
            mx += rt[0];
            mz += rt[1];
        }
        if (K.has("KeyA")) {
            mx -= rt[0];
            mz -= rt[1];
        }
        const ml = Math.hypot(mx, mz), sp = (K.has("ShiftLeft") || K.has("ShiftRight") ? this.mRun : this.mWalk) * (this.mGround ? 1 : 0.7);
        const wx = ml > 0 ? mx / ml * sp : 0, wz = ml > 0 ? mz / ml * sp : 0;
        this.mVel[0] = wx;
        this.mVel[2] = wz;
        if (K.has("Space") && this.mGround) {
            this.mVel[1] = this.mJumpV;
            this.mGround = false;
        }
        this.RefreshDyn();
        const p = this.mPos, steps = Math.max(1, Math.ceil(Math.hypot(wx, wz) * dt / 0.15));
        for (let s = 0; s < steps; s++) {
            p[0] += wx * dt / steps;
            p[2] += wz * dt / steps;
            this.Push();
        }
        const near = this.Near(p[0], p[2], 1.5), gy = this.GroundAt(p[0], p[2], p[1] + this.mStepUp, near);
        if (this.mGround && this.mVel[1] <= 0 && p[1] - gy <= this.mStepDown && p[1] - gy >= -this.mStepUp) {
            p[1] = gy;
            this.mVel[1] = 0;
        }
        else {
            this.mGround = false;
            this.mVel[1] -= this.mGravity * dt;
            p[1] += this.mVel[1] * dt;
            if (p[1] <= gy && this.mVel[1] <= 0) {
                p[1] = gy;
                this.mVel[1] = 0;
                this.mGround = true;
            }
            this.Push();
        }
    }
    Sim(_sec, _keys = [], _yaw) {
        if (_yaw != null)
            this.mYaw = _yaw;
        this.mKey = new Set(_keys);
        for (let t = 0; t < _sec; t += 1 / 60) {
            this.Tick(1 / 60);
        }
        this.mKey = new Set();
        return this.mPos.map(_v => +_v.toFixed(3));
    }
    Place(_x, _y, _z, _yaw = this.mYaw) {
        this.mPos = [_x, _y, _z];
        this.mVel = [0, 0, 0];
        this.mYaw = _yaw;
        this.mPitch = 0;
        this.mGround = false;
    }
    Focus() {
        const e = [this.mPos[0], this.mPos[1] + this.mEyeH, this.mPos[2]], f = [Math.sin(this.mYaw) * Math.cos(this.mPitch), Math.sin(this.mPitch), Math.cos(this.mYaw) * Math.cos(this.mPitch)];
        let best = null, bs = Infinity;
        for (const s of this.mSubs())
            for (const a of s.GetActions()) {
                const dx = a.pos[0] - e[0], dy = a.pos[1] - e[1], dz = a.pos[2] - e[2], d = Math.hypot(dx, dy, dz);
                if (d > this.mReach || d < 0.01)
                    continue;
                const dot = (dx * f[0] + dy * f[1] + dz * f[2]) / d;
                if (dot < 0.55)
                    continue;
                const score = d - dot * 0.8;
                if (score < bs) {
                    bs = score;
                    best = { sub: s, key: a.key, kind: a.kind, on: a.on, label: CForgeWalk.Label(a.kind, a.on) };
                }
            }
        this.mFocus = best;
        return best;
    }
    static Label(_kind, _on) {
        if (_kind == "door")
            return _on ? "문 닫기" : "문 열기";
        if (_kind == "chair")
            return _on ? "의자 넣기" : "의자 빼기";
        if (_kind == "window")
            return _on ? "창문 닫기" : "창문 열기";
        return _on ? "끄기" : "켜기";
    }
    Interact() {
        const f = this.Focus();
        if (f == null)
            return false;
        f.sub.ForgeAction(f.key, !f.on);
        return true;
    }
    Enter(_x, _z, _yaw) {
        if (this.mOn)
            return;
        this.mOn = true;
        this.Rebuild();
        this.Place(_x, this.mTerrain(_x, _z) + 0.05, _z, _yaw);
        this.mKey = new Set();
        const el = document, canvas = document.querySelector("canvas");
        this.mWDown = (e) => {
            if (!this.mOn)
                return;
            if (e.target?.tagName == "INPUT" || e.target?.tagName == "SELECT")
                return;
            if (e.code == "Escape" || e.code == "KeyV") {
                this.Leave();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }
            if (e.code == "KeyE" && !e.repeat) {
                this.Interact();
                e.preventDefault();
                return;
            }
            this.mKey.add(e.code);
            if (e.code == "Space" || e.code.startsWith("Arrow"))
                e.preventDefault();
        };
        this.mWUp = (e) => { this.mKey.delete(e.code); };
        this.mWMove = (e) => { if (!this.mLocked && (e.buttons & 1) == 0)
            return; this.mLook[0] -= e.movementX * 0.0025; this.mLook[1] -= e.movementY * 0.0025; };
        this.mWLock = () => {
            const was = this.mLocked;
            this.mLocked = document.pointerLockElement != null;
            if (was && !this.mLocked)
                this.Leave();
        };
        el.addEventListener("keydown", this.mWDown, true);
        el.addEventListener("keyup", this.mWUp, true);
        el.addEventListener("mousemove", this.mWMove);
        el.addEventListener("pointerlockchange", this.mWLock);
        try {
            canvas?.requestPointerLock?.();
        }
        catch { }
        this.MakeHud();
    }
    mWDown = null;
    mWUp = null;
    mWMove = null;
    mWLock = null;
    Leave() {
        if (!this.mOn)
            return;
        this.mOn = false;
        if (this.mPrevFov != null && this.mCamera != null)
            this.mCamera.SetFov(this.mPrevFov);
        this.mPrevFov = null;
        document.removeEventListener("keydown", this.mWDown, true);
        document.removeEventListener("keyup", this.mWUp, true);
        document.removeEventListener("mousemove", this.mWMove);
        document.removeEventListener("pointerlockchange", this.mWLock);
        if (document.pointerLockElement != null)
            document.exitPointerLock();
        this.mLocked = false;
        this.mHud?.remove();
        this.mCross?.remove();
        this.mHud = null;
        this.mCross = null;
        this.mOnExit?.();
    }
    MakeHud() {
        const c = document.createElement("div");
        c.style.cssText = "position:fixed;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:rgba(255,255,255,0.85);box-shadow:0 0 3px rgba(0,0,0,0.7);pointer-events:none;z-index:9998";
        const h = document.createElement("div");
        h.style.cssText = "position:fixed;left:50%;bottom:18%;transform:translateX(-50%);padding:6px 14px;border-radius:8px;background:rgba(20,16,12,0.72);color:#fff;font:600 15px sans-serif;pointer-events:none;z-index:9998;display:none;white-space:nowrap";
        document.body.appendChild(c);
        document.body.appendChild(h);
        this.mCross = c;
        this.mHud = h;
    }
    Update(_update) {
        super.Update(_update);
        if (!this.mOn || this.mCamera == null)
            return;
        this.Tick(_update.DeltaTime());
        const f = this.Focus();
        if (this.mHud != null) {
            if (f == null)
                this.mHud.style.display = "none";
            else {
                this.mHud.style.display = "";
                this.mHud.textContent = `[E] ${f.label}`;
            }
        }
        if (this.mPrevFov == null)
            this.mPrevFov = this.mCamera.mFov;
        if (this.mCamera.mFov != this.mFov)
            this.mCamera.SetFov(this.mFov);
        const U = 100, p = this.mPos, cp = Math.cos(this.mPitch), eye = new CVec3(p[0] * U, (p[1] + this.mEyeH) * U, p[2] * U);
        this.mCamera.Init(eye, new CVec3(eye.x + Math.sin(this.mYaw) * cp * U, eye.y + Math.sin(this.mPitch) * U, eye.z + Math.cos(this.mYaw) * cp * U));
    }
}
