import { CPad } from "../../../Artgine/artgine/app/subject/CPad.js";
const BTN_JUMP = { size: 0.17, right: 0.05, bottom: 0.05, top: -1 };
const BTN_BREAK = { size: 0.145, right: 0.24, bottom: 0.14, top: -1 };
const BTN_PLACE = { size: 0.145, right: 0.07, bottom: 0.25, top: -1 };
const BTN_FLY = { size: 0.105, right: 0.03, bottom: -1, top: 0.03 };
const BTN_BAG = { size: 0.105, right: 0.155, bottom: -1, top: 0.03 };
const PAD_RATIO = 0.3;
export class CMCTouch {
    mMoveX = 0;
    mMoveY = 0;
    mJump = false;
    mBreak = false;
    mPlace = false;
    mBag = false;
    mLayoutCb = null;
    mPad;
    mPadScale = 0;
    mPadReady = false;
    mFly = false;
    mLookX = 0;
    mLookY = 0;
    mLookId = -1;
    mLastX = 0;
    mLastY = 0;
    mBtn = [];
    mPortrait;
    static IsTouch() {
        if (new URLSearchParams(location.search).get("touch") == "1")
            return true;
        return navigator.maxTouchPoints > 0 && window.matchMedia("(pointer:coarse)").matches;
    }
    constructor(_ui) {
        this.mPad = new CPad();
        this.mPad.mPadType = CPad.ePadType.None;
        _ui.PushSub(this.mPad);
        const root = document.createElement("div");
        root.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:1001;touch-action:none;user-select:none;-webkit-user-select:none;";
        const zone = document.createElement("div");
        zone.style.cssText = "position:absolute;right:0;top:0;width:55%;height:100%;pointer-events:auto;touch-action:none;";
        zone.addEventListener("touchstart", (_e) => {
            _e.preventDefault();
            for (const t of Array.from(_e.changedTouches)) {
                if (this.mLookId >= 0)
                    break;
                this.mLookId = t.identifier;
                this.mLastX = t.clientX;
                this.mLastY = t.clientY;
            }
        }, { passive: false });
        zone.addEventListener("touchmove", (_e) => {
            _e.preventDefault();
            for (const t of Array.from(_e.changedTouches)) {
                if (t.identifier != this.mLookId)
                    continue;
                this.mLookX += t.clientX - this.mLastX;
                this.mLookY += t.clientY - this.mLastY;
                this.mLastX = t.clientX;
                this.mLastY = t.clientY;
            }
        }, { passive: false });
        const lookEnd = (_e) => {
            for (const t of Array.from(_e.changedTouches))
                if (t.identifier == this.mLookId)
                    this.mLookId = -1;
        };
        zone.addEventListener("touchend", lookEnd);
        zone.addEventListener("touchcancel", lookEnd);
        root.append(zone);
        this.Button(root, "▲", BTN_JUMP, (_d) => { this.mJump = _d; });
        this.Button(root, "⛏", BTN_BREAK, (_d) => { this.mBreak = _d; });
        this.Button(root, "▣", BTN_PLACE, (_d) => { this.mPlace = _d; });
        this.Button(root, "✈", BTN_FLY, (_d) => { if (_d)
            this.mFly = true; });
        this.Button(root, "🎒", BTN_BAG, (_d) => { if (_d)
            this.mBag = true; });
        this.mPortrait = document.createElement("div");
        this.mPortrait.style.cssText = "position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);color:#fff;font-size:clamp(16px,5vmin,30px);text-align:center;z-index:1003;pointer-events:auto;white-space:pre;";
        this.mPortrait.textContent = "화면을 가로로 돌려 주세요\n↻";
        document.body.append(root, this.mPortrait);
        document.addEventListener("touchmove", (_e) => _e.preventDefault(), { passive: false });
        window.addEventListener("resize", () => this.Layout());
        window.addEventListener("orientationchange", () => this.Layout());
        this.Layout();
    }
    Button(_root, _label, _cfg, _on) {
        const off = "rgba(255,255,255,0.22)";
        const b = document.createElement("div");
        b.textContent = _label;
        b.style.cssText = "position:absolute;pointer-events:auto;touch-action:none;border-radius:50%;border:2px solid rgba(255,255,255,0.6);color:#fff;display:flex;align-items:center;justify-content:center;text-shadow:0 0 4px #000;background:" + off + ";";
        b.addEventListener("pointerdown", (_e) => {
            _e.preventDefault();
            b.setPointerCapture(_e.pointerId);
            b.style.background = "rgba(255,255,255,0.5)";
            _on(true);
        });
        const up = () => {
            b.style.background = off;
            _on(false);
        };
        b.addEventListener("pointerup", up);
        b.addEventListener("pointercancel", up);
        _root.append(b);
        this.mBtn.push({ el: b, size: _cfg.size, right: _cfg.right, bottom: _cfg.bottom, top: _cfg.top });
    }
    Layout() {
        const w = window.innerWidth, h = window.innerHeight;
        const u = Math.min(w, h);
        for (const b of this.mBtn) {
            const sz = Math.round(u * b.size);
            const s = b.el.style;
            s.width = sz + "px";
            s.height = sz + "px";
            s.fontSize = Math.round(sz * 0.38) + "px";
            s.right = "calc(env(safe-area-inset-right,0px) + " + Math.round(u * b.right) + "px)";
            if (b.bottom >= 0) {
                s.bottom = "calc(env(safe-area-inset-bottom,0px) + " + Math.round(u * b.bottom) + "px)";
                s.top = "auto";
            }
            else {
                s.top = "calc(env(safe-area-inset-top,0px) + " + Math.round(u * b.top) + "px)";
                s.bottom = "auto";
            }
        }
        this.mPortrait.style.display = h > w ? "flex" : "none";
        if (this.mLayoutCb != null)
            this.mLayoutCb(u, w, h);
    }
    Update() {
        const scale = Math.max(0.8, Math.min(1.8, Math.min(window.innerWidth, window.innerHeight) * PAD_RATIO / 100));
        if (this.mPad.GetFrame() != null && (!this.mPadReady || Math.abs(scale - this.mPadScale) > 0.05)) {
            this.mPadScale = scale;
            this.mPad.SetPadScale(scale);
            this.mPad.Stick(CPad.eStickType.Circle, false);
            this.mPadReady = true;
        }
        const d = this.mPad.GetDir();
        this.mMoveX = d.x;
        this.mMoveY = d.y;
    }
    TakeLook() {
        const r = { x: this.mLookX, y: this.mLookY };
        this.mLookX = 0;
        this.mLookY = 0;
        return r;
    }
    TakeBag() {
        const r = this.mBag;
        this.mBag = false;
        return r;
    }
    TakeFly() {
        const r = this.mFly;
        this.mFly = false;
        return r;
    }
}
