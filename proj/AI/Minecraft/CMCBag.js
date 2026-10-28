import { CModal } from "../../../Artgine/artgine/basic/CModal.js";
import { MC_TEX_URL } from "./CMCBlock.js";
import { MCItem } from "./CMCItem.js";
import { MCCraft, MC_FUEL, MC_SMELT } from "./CMCRecipe.js";
import { MC_SMELT_TIME } from "./CMCFurnace.js";
export const MC_HOTBAR_COUNT = 9;
const BAG_COUNT = 36;
export function MCInitSlot(_el) {
    const cnt = document.createElement("span");
    cnt.style.cssText = "position:absolute;right:2px;bottom:0;font-size:12px;font-weight:bold;color:#fff;text-shadow:1px 1px 0 #000,-1px 1px 0 #000;pointer-events:none;";
    const bar = document.createElement("div");
    bar.style.cssText = "position:absolute;left:8%;right:8%;bottom:2px;height:3px;background:#000;display:none;pointer-events:none;";
    const fill = document.createElement("div");
    fill.style.cssText = "height:100%;";
    bar.append(fill);
    _el.append(cnt, bar);
}
export function MCPaintSlot(_el, _s) {
    const it = _s == null ? null : MCItem(_s.id);
    _el.style.backgroundImage = it == null ? "none" : "url(" + MC_TEX_URL.get(it.icon) + ")";
    _el.title = it == null ? "" : it.name + (it.dur > 0 ? " (" + (it.dur - _s.d) + "/" + it.dur + ")" : "");
    const cnt = _el.children[0];
    const bar = _el.children[1];
    cnt.textContent = _s != null && _s.n > 1 ? String(_s.n) : "";
    if (it != null && it.dur > 0 && _s.d > 0) {
        const ratio = 1 - _s.d / it.dur;
        const fill = bar.firstElementChild;
        fill.style.width = (ratio * 100) + "%";
        fill.style.background = "hsl(" + Math.round(ratio * 120) + ",90%,50%)";
        bar.style.display = "block";
    }
    else
        bar.style.display = "none";
}
export class CMCBag {
    mSlot = new Array(BAG_COUNT).fill(null);
    mCursor = null;
    mModal = null;
    mOnChange = null;
    mOnClose = null;
    mOnDrop = null;
    mKind = "";
    mGrid = new Array();
    mFurnace = null;
    mRef = new Array();
    mCursorEl = null;
    mFlame = null;
    mArrow = null;
    mCd = 0;
    mCursorMove = (_e) => this.MoveCursor(_e.clientX, _e.clientY);
    Hotbar(_i) {
        return this.mSlot[_i];
    }
    IsOpen() {
        return this.mModal != null;
    }
    AddRange(_a, _b, _id, _n, _d) {
        const it = MCItem(_id);
        let left = _n;
        if (it.stack > 1) {
            for (let i = _a; i < _b && left > 0; ++i) {
                const s = this.mSlot[i];
                if (s == null || s.id != _id || s.n >= it.stack)
                    continue;
                const m = Math.min(left, it.stack - s.n);
                s.n += m;
                left -= m;
            }
        }
        for (let i = _a; i < _b && left > 0; ++i) {
            if (this.mSlot[i] != null)
                continue;
            const m = Math.min(left, it.stack);
            this.mSlot[i] = { id: _id, n: m, d: _d };
            left -= m;
        }
        return left;
    }
    Add(_id, _n, _d = 0) {
        if (MCItem(_id) == null)
            return _n;
        const left = this.AddRange(0, BAG_COUNT, _id, _n, _d);
        this.Changed();
        return left;
    }
    Room(_id, _n) {
        const it = MCItem(_id);
        let cap = 0;
        for (const s of this.mSlot) {
            if (s == null)
                cap += it.stack;
            else if (s.id == _id && it.stack > 1)
                cap += it.stack - s.n;
        }
        return cap >= _n;
    }
    Take(_slot, _n) {
        const s = this.mSlot[_slot];
        if (s == null)
            return;
        s.n -= _n;
        if (s.n <= 0)
            this.mSlot[_slot] = null;
        this.Changed();
    }
    Damage(_slot, _amount) {
        const s = this.mSlot[_slot];
        if (s == null)
            return;
        const it = MCItem(s.id);
        if (it.dur <= 0)
            return;
        s.d += _amount;
        if (s.d >= it.dur)
            this.mSlot[_slot] = null;
        this.Changed();
    }
    Changed() {
        if (this.mModal != null)
            this.Refresh();
        if (this.mOnChange != null)
            this.mOnChange();
    }
    Give(_s) {
        const left = this.AddRange(0, BAG_COUNT, _s.id, _s.n, _s.d);
        if (left > 0 && this.mOnDrop != null)
            this.mOnDrop({ id: _s.id, n: left, d: _s.d });
    }
    GridW() {
        return this.mKind == "table" ? 3 : 2;
    }
    CraftResult() {
        const r = MCCraft(this.mGrid, this.GridW());
        return r == null ? null : { id: r.id, n: r.n, d: 0 };
    }
    ConsumeGrid() {
        for (let i = 0; i < this.mGrid.length; ++i) {
            const s = this.mGrid[i];
            if (s == null)
                continue;
            if (--s.n <= 0)
                this.mGrid[i] = null;
        }
    }
    Merge(_s, _get, _set) {
        const t = _get();
        const max = MCItem(_s.id).stack;
        if (t == null) {
            _set({ id: _s.id, n: _s.n, d: _s.d });
            _s.n = 0;
        }
        else if (t.id == _s.id && max > 1) {
            const m = Math.min(_s.n, max - t.n);
            t.n += m;
            _s.n -= m;
        }
    }
    MakeSlot(_size, _ref) {
        const el = document.createElement("div");
        el.style.cssText = "position:relative;width:" + _size + "px;height:" + _size + "px;box-sizing:border-box;background:#3a3a3a;border:2px solid #1c1c1c;border-right-color:#6a6a6a;border-bottom-color:#6a6a6a;image-rendering:pixelated;background-size:78% 78%;background-repeat:no-repeat;background-position:center;touch-action:none;cursor:pointer;";
        MCInitSlot(el);
        el.addEventListener("pointerdown", (_e) => {
            _e.preventDefault();
            this.Click(_ref, _e);
        });
        el.addEventListener("contextmenu", (_e) => _e.preventDefault());
        return el;
    }
    NewRef(_size, _get, _set, _bag = -1, _take = null) {
        const ref = { get: _get, set: _set, el: null, bag: _bag, out: _take != null, take: _take };
        ref.el = this.MakeSlot(_size, ref);
        this.mRef.push(ref);
        return ref;
    }
    Click(_ref, _e) {
        const right = _e.button == 2;
        if (_ref.out) {
            this.ClickOut(_ref, _e.shiftKey);
            return;
        }
        if (_e.shiftKey) {
            this.Shift(_ref);
            return;
        }
        const s = _ref.get();
        const c = this.mCursor;
        if (!right) {
            if (c == null) {
                _ref.set(null);
                this.mCursor = s;
            }
            else if (s == null) {
                _ref.set(c);
                this.mCursor = null;
            }
            else if (s.id == c.id && MCItem(s.id).stack > 1) {
                const m = Math.min(c.n, MCItem(s.id).stack - s.n);
                s.n += m;
                c.n -= m;
                if (c.n <= 0)
                    this.mCursor = null;
            }
            else {
                _ref.set(c);
                this.mCursor = s;
            }
        }
        else if (c == null) {
            if (s != null) {
                const take = Math.ceil(s.n / 2);
                this.mCursor = { id: s.id, n: take, d: s.d };
                s.n -= take;
                if (s.n <= 0)
                    _ref.set(null);
            }
        }
        else if (s == null) {
            _ref.set({ id: c.id, n: 1, d: c.d });
            if (--c.n <= 0)
                this.mCursor = null;
        }
        else if (s.id == c.id && s.n < MCItem(s.id).stack) {
            s.n++;
            if (--c.n <= 0)
                this.mCursor = null;
        }
        else {
            _ref.set(c);
            this.mCursor = s;
        }
        this.Changed();
    }
    ClickOut(_ref, _shift) {
        const r = _ref.get();
        if (r == null)
            return;
        if (_shift) {
            for (let i = 0; i < 64; ++i) {
                const cur = _ref.get();
                if (cur == null || !this.Room(cur.id, cur.n))
                    break;
                const res = { id: cur.id, n: cur.n, d: cur.d };
                _ref.take();
                this.AddRange(0, BAG_COUNT, res.id, res.n, res.d);
            }
            this.Changed();
            return;
        }
        const c = this.mCursor;
        if (c != null && (c.id != r.id || MCItem(c.id).stack <= 1 || c.n + r.n > MCItem(c.id).stack))
            return;
        const res = { id: r.id, n: r.n, d: r.d };
        _ref.take();
        if (c == null)
            this.mCursor = res;
        else
            c.n += res.n;
        this.Changed();
    }
    Shift(_ref) {
        const s = _ref.get();
        if (s == null)
            return;
        if (_ref.bag >= 0) {
            const f = this.mFurnace;
            if (this.mKind == "furnace" && f != null) {
                if (MC_SMELT[s.id] != null)
                    this.Merge(s, () => f.mIn, (_v) => { f.mIn = _v; });
                else if (MC_FUEL[s.id] != null)
                    this.Merge(s, () => f.mFuel, (_v) => { f.mFuel = _v; });
            }
            if (s.n > 0) {
                const hot = _ref.bag < MC_HOTBAR_COUNT;
                s.n = this.AddRange(hot ? MC_HOTBAR_COUNT : 0, hot ? BAG_COUNT : MC_HOTBAR_COUNT, s.id, s.n, s.d);
            }
        }
        else
            s.n = this.AddRange(0, BAG_COUNT, s.id, s.n, s.d);
        if (s.n <= 0)
            _ref.set(null);
        this.Changed();
    }
    MoveCursor(_x, _y) {
        if (this.mCursorEl == null)
            return;
        this.mCursorEl.style.left = (_x - 20) + "px";
        this.mCursorEl.style.top = (_y - 20) + "px";
    }
    Title(_text) {
        const d = document.createElement("div");
        d.textContent = _text;
        d.style.cssText = "color:#333;font-size:13px;margin:8px 0 4px;";
        return d;
    }
    Refresh() {
        for (const ref of this.mRef)
            MCPaintSlot(ref.el, ref.get());
        if (this.mCursorEl != null) {
            MCPaintSlot(this.mCursorEl, this.mCursor);
            this.mCursorEl.style.display = this.mCursor == null ? "none" : "block";
        }
        const f = this.mFurnace;
        if (f != null && this.mFlame != null) {
            this.mFlame.firstElementChild.style.height = (f.mBurn > 0 ? f.mBurn / f.mBurnMax * 100 : 0) + "%";
            this.mArrow.firstElementChild.style.width = Math.min(100, f.mCook / MC_SMELT_TIME * 100) + "%";
        }
    }
    Update(_dt) {
        if (this.mModal == null || this.mFurnace == null)
            return;
        this.mCd -= _dt;
        if (this.mCd > 0)
            return;
        this.mCd = 0.1;
        this.Refresh();
    }
    OpenInventory() {
        this.Open("inv", null);
    }
    OpenTable() {
        this.Open("table", null);
    }
    OpenFurnace(_f) {
        this.Open("furnace", _f);
    }
    Bar(_vertical, _color, _w, _h) {
        const bar = document.createElement("div");
        bar.style.cssText = "position:relative;background:#555;border:2px solid #222;box-sizing:border-box;width:" + _w + "px;height:" + _h + "px;";
        const fill = document.createElement("div");
        fill.style.cssText = _vertical ? "position:absolute;left:0;right:0;bottom:0;height:0;background:" + _color + ";" : "position:absolute;left:0;top:0;bottom:0;width:0;background:" + _color + ";";
        bar.append(fill);
        return bar;
    }
    Open(_kind, _furnace) {
        if (this.mModal != null)
            return;
        this.mKind = _kind;
        this.mFurnace = _furnace;
        const gw = this.GridW();
        this.mGrid = new Array(gw * gw).fill(null);
        this.mRef = [];
        this.mFlame = null;
        this.mArrow = null;
        const W = Math.min(520, window.innerWidth - 12);
        const H = Math.min(640, window.innerHeight - 12);
        const size = Math.max(24, Math.min(46, Math.floor((W - 48) / MC_HOTBAR_COUNT), Math.floor((H - 150) / 8)));
        const body = document.createElement("div");
        body.style.cssText = "background:#c6c6c6;border:3px solid #555;padding:10px;box-sizing:border-box;width:100%;height:100%;overflow:auto;font-family:monospace;user-select:none;-webkit-user-select:none;";
        body.addEventListener("contextmenu", (_e) => _e.preventDefault());
        const head = document.createElement("div");
        head.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:8px;";
        const title = this.Title(_kind == "table" ? "작업대" : _kind == "furnace" ? "화로" : "제작");
        title.style.fontSize = "15px";
        const close = document.createElement("button");
        close.textContent = "닫기 (E)";
        close.className = "btn btn-sm btn-dark";
        close.style.flex = "none";
        close.onclick = () => this.Close();
        head.append(title, close);
        body.append(head);
        const craft = document.createElement("div");
        craft.style.cssText = "display:flex;align-items:center;justify-content:center;gap:14px;margin:8px 0;";
        if (_kind == "furnace") {
            const f = _furnace;
            const col = document.createElement("div");
            col.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:6px;";
            this.mFlame = this.Bar(true, "#ff9a1a", 12, Math.round(size * 0.6));
            col.append(this.NewRef(size, () => f.mIn, (_s) => { f.mIn = _s; }).el, this.mFlame, this.NewRef(size, () => f.mFuel, (_s) => { f.mFuel = _s; }).el);
            this.mArrow = this.Bar(false, "#fff", Math.round(size * 1.1), 14);
            craft.append(col, this.mArrow, this.NewRef(size, () => f.mOut, (_s) => { f.mOut = _s; }, -1, () => { f.mOut = null; }).el);
        }
        else {
            const grid = document.createElement("div");
            grid.style.cssText = "display:grid;grid-template-columns:repeat(" + gw + ",1fr);gap:2px;";
            for (let i = 0; i < gw * gw; ++i)
                grid.append(this.NewRef(size, () => this.mGrid[i], (_s) => { this.mGrid[i] = _s; }).el);
            const arrow = document.createElement("div");
            arrow.textContent = "→";
            arrow.style.cssText = "font-size:30px;color:#444;";
            craft.append(grid, arrow, this.NewRef(size, () => this.CraftResult(), () => { }, -1, () => this.ConsumeGrid()).el);
        }
        body.append(craft);
        body.append(this.Title("인벤토리"));
        const store = document.createElement("div");
        store.style.cssText = "display:grid;grid-template-columns:repeat(" + MC_HOTBAR_COUNT + ",1fr);gap:2px;";
        for (let i = MC_HOTBAR_COUNT; i < BAG_COUNT; ++i)
            store.append(this.NewRef(size, () => this.mSlot[i], (_s) => { this.mSlot[i] = _s; }, i).el);
        body.append(store);
        body.append(this.Title("핫바"));
        const hot = document.createElement("div");
        hot.style.cssText = "display:grid;grid-template-columns:repeat(" + MC_HOTBAR_COUNT + ",1fr);gap:2px;";
        for (let i = 0; i < MC_HOTBAR_COUNT; ++i)
            hot.append(this.NewRef(size, () => this.mSlot[i], (_s) => { this.mSlot[i] = _s; }, i).el);
        body.append(hot);
        this.mCursorEl = document.createElement("div");
        this.mCursorEl.style.cssText = "position:fixed;width:40px;height:40px;pointer-events:none;z-index:100000;image-rendering:pixelated;background-size:100% 100%;background-repeat:no-repeat;display:none;";
        MCInitSlot(this.mCursorEl);
        document.body.append(this.mCursorEl);
        document.addEventListener("pointermove", this.mCursorMove);
        this.mModal = new CModal("MCBag");
        this.mModal.SetCloseEsc(false);
        this.mModal.SetTitle(CModal.eTitle.None);
        this.mModal.SetBody(body);
        this.mModal.SetSize(W, H);
        this.mModal.SetZIndex(CModal.eSort.Top);
        this.mModal.Open(CModal.ePos.Center);
        this.Refresh();
    }
    Close() {
        if (this.mModal == null)
            return;
        for (const s of this.mGrid)
            if (s != null)
                this.Give(s);
        this.mGrid = [];
        if (this.mCursor != null)
            this.Give(this.mCursor);
        this.mCursor = null;
        this.mModal.Close();
        this.mModal = null;
        this.mFurnace = null;
        this.mKind = "";
        this.mRef = [];
        document.removeEventListener("pointermove", this.mCursorMove);
        if (this.mCursorEl != null)
            this.mCursorEl.remove();
        this.mCursorEl = null;
        if (this.mOnChange != null)
            this.mOnChange();
        if (this.mOnClose != null)
            this.mOnClose();
    }
}
