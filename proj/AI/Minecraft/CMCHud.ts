import { MC_HOTBAR_COUNT, MCInitSlot, MCPaintSlot } from "./CMCBag.js";
import { IMCStack } from "./CMCItem.js";

export class CMCHud
{
    mRoot: HTMLDivElement;
    mSlotArr: HTMLDivElement[] = [];
    mInfo: HTMLDivElement;
    mStart: HTMLDivElement;
    mWater: HTMLDivElement = null;
    mHot: HTMLDivElement;
    mIconArr: HTMLDivElement[] = [];

    constructor(_onStart: () => void, _items: IMCStack[])
    {
        this.mRoot = document.createElement("div");
        this.mRoot.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:1002;font-family:monospace;color:#fff;user-select:none;";

        const bar = (_css: string) =>
        {
            const d = document.createElement("div");
            d.style.cssText = "position:absolute;background:#fff;mix-blend-mode:difference;" + _css;
            this.mRoot.append(d);
        };
        bar("left:calc(50% - 10px);top:calc(50% - 1px);width:20px;height:2px;");
        bar("left:calc(50% - 1px);top:calc(50% - 10px);width:2px;height:20px;");

        const hot = document.createElement("div");
        hot.style.cssText = "position:absolute;left:50%;bottom:16px;transform:translateX(-50%);display:flex;gap:4px;";
        for (let i = 0; i < MC_HOTBAR_COUNT; ++i)
        {
            const slot = document.createElement("div");
            slot.style.cssText = "position:relative;width:48px;height:48px;background:rgba(0,0,0,0.5);border:3px solid #555;box-sizing:border-box;";
            const icon = document.createElement("div");
            icon.style.cssText = "position:absolute;inset:5px;image-rendering:pixelated;background-size:100% 100%;background-repeat:no-repeat;";
            MCInitSlot(icon);
            const num = document.createElement("span");
            num.textContent = String(i + 1);
            num.style.cssText = "position:absolute;left:2px;top:0;font-size:11px;text-shadow:0 0 3px #000;";
            slot.append(icon, num);
            hot.append(slot);
            this.mSlotArr.push(slot);
            this.mIconArr.push(icon);
        }
        this.mHot = hot;
        this.mRoot.append(hot);

        this.mInfo = document.createElement("div");
        this.mInfo.style.cssText = "position:absolute;left:8px;top:8px;font-size:13px;line-height:1.5;text-shadow:0 0 3px #000;white-space:pre;";
        this.mRoot.append(this.mInfo);

        this.mStart = document.createElement("div");
        this.mStart.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);pointer-events:auto;cursor:pointer;font-size:clamp(14px,3.6vmin,28px);padding:0 4vw;text-align:center;text-shadow:0 0 6px #000;white-space:pre;";
        this.mStart.textContent = "클릭하여 시작\n\nWASD 이동 · Space 점프 · Shift 달리기 · F 비행\n좌클릭 파괴 · 우클릭 설치 · 1~9 / 휠 선택 · E 인벤토리 · 작업대/화로 우클릭 · Esc 일시정지";
        this.mStart.onclick = _onStart;
        this.mRoot.append(this.mStart);

        document.body.append(this.mRoot);
        for (let i = 0; i < MC_HOTBAR_COUNT; ++i) this.SetItem(i, _items[i]);
        this.SetSlot(0);
    }
    //터치 기기용: 슬롯을 작게 하고 눌러서 고르게 한다
    SetTouch(_onSlot: (_slot: number) => void)
    {
        for (let i = 0; i < this.mSlotArr.length; ++i)
        {
            const slot = this.mSlotArr[i];
            slot.style.pointerEvents = "auto";
            slot.addEventListener("pointerdown", (_e: PointerEvent) =>
            {
                _e.preventDefault();
                _onSlot(i);
            });
        }
        this.mStart.textContent = "탭하여 시작\n\n왼쪽 조이스틱 이동 · 오른쪽 화면 드래그 시점\n▲ 점프 · ⛏ 파괴 · ▣ 설치 · ✈ 비행 · 아래 슬롯 탭으로 블록 선택";
    }
    SetItem(_i: number, _s: IMCStack)
    {
        MCPaintSlot(this.mIconArr[_i], _s);
    }
    SetSlot(_slot: number)
    {
        for (let i = 0; i < this.mSlotArr.length; ++i)
            this.mSlotArr[i].style.borderColor = i == _slot ? "#fff" : "#555";
    }
    //터치 기기에서 화면 크기에 맞춰 핫바 슬롯 크기와 위치를 정한다
    Layout(_u: number, _w: number, _h: number)
    {
        const size = Math.max(26, Math.min(46, Math.floor(Math.min(_w * 0.42 / this.mSlotArr.length, _u * 0.13))));
        for (const slot of this.mSlotArr)
        {
            slot.style.width = size + "px";
            slot.style.height = size + "px";
        }
        this.mHot.style.bottom = "calc(env(safe-area-inset-bottom,0px) + 6px)";
    }
    SetUnderwater(_on: boolean)
    {
        if (this.mWater == null)
        {
            this.mWater = document.createElement("div");
            this.mWater.style.cssText = "position:absolute;inset:0;background:rgba(30,80,200,0.38);display:none;";
            this.mRoot.prepend(this.mWater);
        }
        this.mWater.style.display = _on ? "block" : "none";
    }
    SetLocked(_locked: boolean)
    {
        this.mStart.style.display = _locked ? "none" : "flex";
    }
    SetInfo(_text: string)
    {
        this.mInfo.textContent = _text;
    }
}
