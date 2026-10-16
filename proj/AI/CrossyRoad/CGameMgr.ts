import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CCanvas } from "../../../Artgine/artgine/app/canvas/CCanvas.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CAniFlow } from "../../../Artgine/artgine/app/component/CAniFlow.js";
import { CClipPRS, CClipDestroy } from "../../../Artgine/artgine/app/component/CAnimation.js";
import { CUI, CUIHTML } from "../../../Artgine/artgine/app/subject/CUI.js";
import { CPaintHTML } from "../../../Artgine/artgine/app/component/paint/CPaint2D.js";
import { CBound } from "../../../Artgine/artgine/geometry/CBound.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CModal } from "../../../Artgine/artgine/basic/CModal.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CStorage } from "../../../Artgine/artgine/system/CStorage.js";
import { CCamShakeNoise } from "../../../Artgine/artgine/util/CCamShake.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CLane, ILaneHost } from "./CLane.js";
import { CPlayerComp, IPlayerHost } from "./CPlayerComp.js";
import { CVoxelModel, CSfx, RGB, V3, ClipPRS, OnceAni, TILE, COL_MAX } from "./CVoxelModel.js";
import { CTheme } from "./CTheme.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";

const CAM_OFFSET = new CVec3(36, 170, 110);
const CAM_DIST = Math.hypot(36, 170, 110);
const LAND_FOV = 3.14 / 4;
const PORT_WIDTH = TILE * 8.5;
const GEN_AHEAD = 22;
const KEEP_BEHIND = 9;
const EAGLE_GAP = 2.8;
const EAGLE_SPEED = 230;
const BEST_KEY = "CrossyRoad_best";
const COIN_KEY = "CrossyRoad_coin";
const THEME_KEY = "CrossyRoad_theme";

const S = (_css: string) => `font-family:'Segoe UI',sans-serif;font-weight:900;color:#fff;`
    + `text-shadow:3px 3px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;white-space:nowrap;${_css}`;

export class CGameMgr extends CSubject implements ILaneHost, IPlayerHost
{
    static eState = {
        Ready: 0,
        Play: 1,
        Eagle: 2,
        Dead: 3,
        Over: 4,
    };

    mCanvas: CCanvas = null;
    mUICanvas: CCanvas = null;

    mState = CGameMgr.eState.Ready;
    mLanes = new Map<number, CLane>();
    mGenRow = 0;
    mStreakType = CLane.eType.Grass;
    mStreakLeft = 0;
    mPathCol = 0;

    mPlayer: CSubject = null;
    mPC: CPlayerComp = null;
    mBody: CSubject = null;

    mScore = 0;
    mBest = 0;
    mCoin = 0;
    mFocus = 0;
    mCamX = 0;
    mStateTime = 0;
    mInputLock = 0;
    mDeathKind = "";

    mEagle: CSubject = null;
    mEagleZ = 0;
    mEagleGrab = false;

    mTouchX = 0;
    mTouchY = 0;
    mTouchEndX = 0;
    mTouchEndY = 0;
    mTouchOn = false;

    mScoreEl: HTMLElement = null;
    mBestEl: HTMLElement = null;
    mCoinEl: HTMLElement = null;
    mMsgUI: CUIHTML = null;
    mMsgEl: HTMLElement = null;
    mModal: CModal = null;
    mThemeModal: CModal = null;
    mTitleEl: HTMLElement = null;
    mThemeBtn: HTMLButtonElement = null;
    mShake: CCamShakeNoise = null;

    override Start()
    {
        this.mBest = Number(CStorage.Get(BEST_KEY, 0)) || 0;
        this.mCoin = Number(CStorage.Get(COIN_KEY, 0)) || 0;
        CTheme.Select(String(CStorage.Get(THEME_KEY, "classic")));

        this.mShake = new CCamShakeNoise();
        this.mShake.Set3D(4, 1.5);
        this.mCanvas.GetCam().SetCamShake(this.mShake);

        this.BuildHUD();
    }

    private BuildHUD()
    {
        let scoreUI = this.mUICanvas.PushSub(new CUIHTML());
        scoreUI.Init(`<div><div class="score" style="${S("font-size:64px;line-height:64px")}">0</div>`
            + `<div class="best" style="${S("font-size:20px;margin-top:4px")}">TOP 0</div></div>`);
        scoreUI.SetAnchorX(CUI.eAnchor.Min, 24);
        scoreUI.SetAnchorY(CUI.eAnchor.Max, 20);
        let scoreRoot = (scoreUI.mUIPT as CPaintHTML).GetElement();
        this.mScoreEl = scoreRoot.querySelector(".score") as HTMLElement;
        this.mBestEl = scoreRoot.querySelector(".best") as HTMLElement;

        let coinUI = this.mUICanvas.PushSub(new CUIHTML());
        coinUI.Init(`<div style="${S("font-size:34px;display:flex;align-items:center;gap:10px")}">`
            + `<span class="coin">0</span><span style="display:inline-block;width:26px;height:26px;background:#ffd21a;`
            + `border:3px solid #b8860b;border-radius:4px"></span></div>`);
        coinUI.SetAnchorX(CUI.eAnchor.Max, 24);
        coinUI.SetAnchorY(CUI.eAnchor.Max, 76);
        this.mCoinEl = (coinUI.mUIPT as CPaintHTML).GetElement().querySelector(".coin") as HTMLElement;

        let themeUI = this.mUICanvas.PushSub(new CUIHTML());
        // CPaintHTML이 루트 요소에 pointer-events:none을 걸기 때문에 버튼은 한 단계 안쪽에 두고 auto로 되살린다
        themeUI.Init(`<div><button style="${S("font-size:18px;background:rgba(0,0,0,0.35);border:3px solid #fff;"
            + "border-radius:10px;padding:6px 14px;cursor:pointer;pointer-events:auto")}">버전</button></div>`);
        themeUI.SetAnchorX(CUI.eAnchor.Max, 20);
        themeUI.SetAnchorY(CUI.eAnchor.Max, 18);
        this.mThemeBtn = (themeUI.mUIPT as CPaintHTML).GetElement().querySelector("button") as HTMLButtonElement;
        this.mThemeBtn.onclick = () => this.OpenThemeMenu();

        this.mMsgUI = this.mUICanvas.PushSub(new CUIHTML());
        this.mMsgUI.Init(`<div style="${S("font-size:min(30px,5.2vw);text-align:center")}">`
            + `<div class="title" style="font-size:min(54px,11vw);color:#ffd21a;margin-bottom:8px">CROSSY ROAD</div>`
            + `방향키 / WASD / 탭·스와이프로 시작`
            + `<div style="font-size:min(18px,4vw);margin-top:6px">오른쪽 위 [버전]에서 테마 변경</div></div>`);
        this.mMsgUI.SetAnchorY(CUI.eAnchor.Min, 90);
        this.mMsgEl = (this.mMsgUI.mUIPT as CPaintHTML).GetElement();
        this.mTitleEl = this.mMsgEl.querySelector(".title") as HTMLElement;
        this.ApplyTheme();
    }

    private ApplyTheme()
    {
        const theme = CTheme.Cur();
        const sky = theme.mSky;
        // 그림자맵도 이 색으로 지워지는데 알파가 1이면 빈 텍셀을 가림으로 판정한다(Shadow.ts Sam2DCompare). 0이면 캔버스가 투명해져 하늘이 사라진다
        this.GetFrame().Dev().SetClearColor(true, new CVec4(sky[0], sky[1], sky[2], 0.99));
        this.mTitleEl.textContent = theme.mTitle;
        this.mThemeBtn.textContent = "버전: " + theme.mName + " ▾";
    }

    private OpenThemeMenu()
    {
        if (this.mThemeModal != null && this.mThemeModal.IsShow()) return;
        let body = document.createElement("div");
        body.style.cssText = "padding:14px 12px;font-family:'Segoe UI',sans-serif";
        body.innerHTML = `<div style="font-size:24px;font-weight:900;text-align:center;margin-bottom:10px">버전 선택</div>`;
        for (const theme of CTheme.sList)
        {
            const on = theme == CTheme.Cur();
            const c = theme.mIcon.map((v) => Math.round(Math.min(1, v) * 255)).join(",");
            let btn = document.createElement("button");
            btn.style.cssText = `display:flex;align-items:center;gap:12px;width:100%;margin:6px 0;padding:10px 12px;text-align:left;`
                + `border-radius:12px;cursor:pointer;background:${on ? "#fff6cc" : "#f4f4f4"};border:3px solid ${on ? "#f0b400" : "#ddd"}`;
            btn.innerHTML = `<span style="flex:none;width:34px;height:34px;border-radius:8px;border:3px solid #333;background:rgb(${c})"></span>`
                + `<span><b style="font-size:18px">${theme.mName}${on ? " ✔" : ""}</b><br>`
                + `<span style="font-size:13px;color:#777">${theme.mDesc}</span></span>`;
            btn.onclick = () => this.SelectTheme(theme.mKey);
            body.append(btn);
        }
        let close = document.createElement("button");
        close.className = "btn btn-secondary w-100 mt-2";
        close.textContent = "닫기";
        close.onclick = () => this.CloseThemeMenu();
        body.append(close);

        this.mThemeModal = new CModal("CrossyRoadTheme");
        this.mThemeModal.SetTitle(CModal.eTitle.None);
        this.mThemeModal.SetBody(body);
        this.mThemeModal.SetSize(320, 480);
        this.mThemeModal.SetZIndex(CModal.eSort.Top);
        this.mThemeModal.Open(CModal.ePos.Center);
        this.mCanvas.SetPause(true);
    }

    private CloseThemeMenu()
    {
        if (this.mThemeModal != null) this.mThemeModal.Close();
        this.mThemeModal = null;
        this.mCanvas.SetPause(false);
        // 버튼 클릭으로 포커스가 HTML로 넘어가면 캔버스 keydown이 안 들어오므로 되돌린다
        this.GetFrame().Win()?.Handle().focus();
    }

    private SelectTheme(_key: string)
    {
        CTheme.Select(_key);
        CStorage.Set(THEME_KEY, CTheme.Cur().mKey);
        this.ApplyTheme();
        this.CloseThemeMenu();
        this.NewGame();
    }

    private RefreshHUD()
    {
        this.mScoreEl.textContent = this.mScore + "";
        this.mBestEl.textContent = "TOP " + this.mBest;
        this.mCoinEl.textContent = this.mCoin + "";
    }

    NewGame()
    {
        for (let lane of this.mLanes.values())
            lane.Destroy();
        this.mLanes.clear();
        if (this.mPlayer != null) this.mPlayer.Destroy();
        if (this.mEagle != null) this.mEagle.Destroy();
        this.mEagle = null;
        if (this.mModal != null) this.mModal.Close();
        this.mModal = null;

        this.mScore = 0;
        this.mFocus = 0;
        this.mCamX = 0;
        this.mPathCol = 0;
        this.mStreakLeft = 0;
        this.mGenRow = -KEEP_BEHIND;
        this.mInputLock = 0.25;
        this.SetState(CGameMgr.eState.Ready);

        this.GenerateLanes(GEN_AHEAD);
        this.BuildPlayer();
        this.mMsgEl.style.visibility = "visible";
        this.RefreshHUD();
        this.UpdateCamera(1);
    }

    private SetState(_state: number)
    {
        this.mState = _state;
        this.mStateTime = 0;
    }

    private BuildPlayer()
    {
        this.mPlayer = new CSubject();
        this.mPlayer.SetKey("Player");
        this.mBody = new CSubject();
        CTheme.Cur().Player(this.mBody);
        this.mPlayer.PushChild(this.mBody);

        let hopAni = OnceAni();
        hopAni.Push(ClipPRS(0, 0.065, V3(0, 0, 0), V3(0, 4, 0), CClipPRS.eType.Pos));
        hopAni.Push(ClipPRS(0.065, 0.065, V3(0, 4, 0), V3(0, 0, 0), CClipPRS.eType.Pos));
        hopAni.Push(ClipPRS(0, 0.04, V3(1, 1, 1), V3(1.04, 0.92, 1.04), CClipPRS.eType.Sca));
        hopAni.Push(ClipPRS(0.04, 0.05, V3(1.04, 0.92, 1.04), V3(0.98, 1.04, 0.98), CClipPRS.eType.Sca));
        hopAni.Push(ClipPRS(0.09, 0.05, V3(0.98, 1.04, 0.98), V3(1, 1, 1), CClipPRS.eType.Sca));
        let bumpAni = OnceAni();
        bumpAni.Push(ClipPRS(0, 0.05, V3(0, 0, 0), V3(0, 1, 0), CClipPRS.eType.Pos));
        bumpAni.Push(ClipPRS(0.05, 0.05, V3(0, 1, 0), V3(0, 0, 0), CClipPRS.eType.Pos));

        let pc = new CPlayerComp();
        pc.mHost = this;
        pc.mBody = this.mBody;
        pc.mHopAF = this.mBody.PushComp(new CAniFlow(hopAni));
        pc.mBumpAF = this.mBody.PushComp(new CAniFlow(bumpAni));
        this.mPlayer.PushComp(pc);
        this.mPC = pc;

        let bound = new CBound();
        bound.SetType(CBound.eType.Box);
        bound.mMin = V3(-TILE * 0.3, 0, -TILE * 0.3);
        bound.mMax = V3(TILE * 0.3, 8, TILE * 0.3);
        let cl = this.mPlayer.PushComp(new CCollider(bound));
        cl.SetLayer("player");
        cl.PushCollisionLayer(["car", "train"]);
        cl.SetEvent(CCollider.eEvent.Trigger);

        this.mPlayer.SetPos(V3(0, 0, 0));
        // PushSub 이후에 PushComp한 콜라이더는 Start되지 않아(GI 미연결) 충돌이 안 잡히므로 조립을 끝낸 뒤 등록한다
        this.mCanvas.PushSub(this.mPlayer);
    }

    // ------------------------------------------------------------------
    // 레인 생성
    // ------------------------------------------------------------------
    private Difficulty(_row: number)
    {
        return Math.min(1, Math.max(0, _row) / 300);
    }

    private NextType(_row: number)
    {
        if (_row <= 3) return CLane.eType.Grass;
        if (this.mStreakLeft > 0)
        {
            this.mStreakLeft--;
            return this.mStreakType;
        }
        const d = this.Difficulty(_row);
        const weights = [0.3 - d * 0.12, 0.36 + d * 0.06, 0.22 + d * 0.03, 0.12 + d * 0.03];
        let total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        let type = 0;
        for (; type < weights.length - 1; ++type)
        {
            if (r < weights[type]) break;
            r -= weights[type];
        }
        if (type == this.mStreakType && type == CLane.eType.Rail) type = CLane.eType.Grass;

        let maxLen = 1;
        switch (type)
        {
            case CLane.eType.Grass: maxLen = 2; break;
            case CLane.eType.Road: maxLen = 2 + Math.round(d * 3); break;
            case CLane.eType.River: maxLen = 2 + Math.round(d * 2); break;
            case CLane.eType.Rail: maxLen = 2; break;
        }
        this.mStreakType = type;
        this.mStreakLeft = Math.floor(Math.random() * maxLen);
        return type;
    }

    private GenerateLanes(_toRow: number)
    {
        while (this.mGenRow <= _toRow)
        {
            const row = this.mGenRow++;
            const prev = this.mLanes.get(row - 1);
            const prevType = prev ? prev.mLaneType : CLane.eType.Grass;
            const type = this.NextType(row);

            const prevPath = this.mPathCol;
            if (row > 3)
                this.mPathCol = Math.max(-COL_MAX + 1, Math.min(COL_MAX - 1, this.mPathCol + Math.floor(Math.random() * 3) - 1));
            let freeCols = new Set<number>();
            for (let c = Math.min(prevPath, this.mPathCol); c <= Math.max(prevPath, this.mPathCol); ++c)
                freeCols.add(c);
            if (row >= -2 && row <= 1)
                for (let c = -2; c <= 2; ++c) freeCols.add(c);

            let lane = new CLane();
            lane.Build(this.mCanvas, this, type, row, {
                difficulty: this.Difficulty(row),
                prevType: prevType,
                freeCols: freeCols,
                wall: row < -2,
                coin: row > 4 && Math.random() < (type == CLane.eType.Grass ? 0.18 : 0.07),
            });
            this.mCanvas.PushSub(lane);
            this.mLanes.set(row, lane);
        }
    }

    private CullLanes()
    {
        const minRow = Math.floor(this.mFocus) - KEEP_BEHIND;
        for (let [row, lane] of this.mLanes)
        {
            if (row < minRow)
            {
                lane.Destroy();
                this.mLanes.delete(row);
            }
        }
    }

    // ------------------------------------------------------------------
    // IPlayerHost / ILaneHost
    // ------------------------------------------------------------------
    CanMove(_row: number, _x: number): boolean
    {
        if (this.mState != CGameMgr.eState.Play && this.mState != CGameMgr.eState.Ready) return false;
        let lane = this.mLanes.get(_row);
        if (lane == null) return false;
        if (Math.abs(_x) > (COL_MAX + 0.5) * TILE) return false;
        return !lane.IsBlocked(Math.round(_x / TILE));
    }

    OnHop()
    {
        if (this.mState == CGameMgr.eState.Ready)
        {
            this.SetState(CGameMgr.eState.Play);
            this.mMsgEl.style.visibility = "hidden";
        }
        CSfx.Play(["hop0", "hop1", "hop2"], 0.35);
    }

    OnLand(_pc: CPlayerComp)
    {
        let lane = this.mLanes.get(_pc.mRow);
        if (lane == null) return;

        if (lane.mLaneType ==CLane.eType.River)
        {
            let ride = lane.FindRide(_pc.mX);
            if (ride == null)
            {
                this.Die("water");
                return;
            }
            const tiles = Math.max(1, Math.round(ride.len / TILE));
            let slot = Math.round((_pc.mX - ride.x) / TILE + (tiles - 1) * 0.5);
            slot = Math.max(0, Math.min(tiles - 1, slot));
            _pc.mRide = ride;
            _pc.mRideOff = (slot - (tiles - 1) * 0.5) * TILE;
            _pc.mX = ride.x + _pc.mRideOff;
            CSfx.Play("log", 0.4);
        }
        else
        {
            _pc.mRide = null;
            _pc.mX = Math.round(_pc.mX / TILE) * TILE;
        }

        if (lane.TakeCoin(Math.round(_pc.mX / TILE)))
        {
            this.mCoin++;
            CStorage.Set(COIN_KEY, this.mCoin);
            CSfx.Play("coin", 0.5);
        }

        if (_pc.mRow > this.mScore)
        {
            this.mScore = _pc.mRow;
            if (this.mScore > this.mBest)
                this.mBest = this.mScore;
        }
        this.RefreshHUD();
    }

    OnLaneEvent(_lane: CLane, _event: string)
    {
        const near = Math.abs(_lane.mRow - this.mPC.mRow) <= 7;
        if (!near || this.mState == CGameMgr.eState.Over) return;
        if (_event == "warn") CSfx.Play("bell", 0.45);
        else if (_event == "train") CSfx.Play("train", 0.35);
    }

    Die(_kind: string)
    {
        if (this.mState != CGameMgr.eState.Play && this.mState != CGameMgr.eState.Ready) return;
        this.SetState(CGameMgr.eState.Dead);
        this.mDeathKind = _kind;
        this.mPC.mDead = true;
        this.mPC.mBumpAF.mPlay = false;
        const pos = this.mPlayer.GetPos().Export() as CVec3;
        const bodyPos = this.mBody.GetPos().Export() as CVec3;
        const bodySca = this.mBody.GetSca().Export() as CVec3;
        let ani = OnceAni();

        if (_kind == "car")
        {
            const sideways = Math.abs(Math.sin(this.mBody.GetRot().y)) > 0.5;
            const flat = sideways ? V3(1.3, 1.1, 0.14) : V3(0.14, 1.1, 1.3);
            ani.Push(ClipPRS(0, 0.07, bodyPos, V3(0, 0, 0), CClipPRS.eType.Pos));
            ani.Push(ClipPRS(0, 0.07, bodySca, flat, CClipPRS.eType.Sca));
            this.Burst(pos, this.BodyColor(), 8, 12);
            CSfx.Play("hit", 0.7);
            this.mShake.Shake(350);
        }
        else if (_kind == "train")
        {
            this.mBody.SetEnable(false);
            this.Burst(pos, this.BodyColor(), 18, 26);
            CSfx.Play("hit", 0.8);
            this.mShake.Shake(600);
        }
        else
        {
            ani.Push(ClipPRS(0, 0.12, bodyPos, V3(0, -4, 0), CClipPRS.eType.Pos));
            ani.Push(ClipPRS(0.12, 0.45, V3(0, -4, 0), V3(0, -16, 0), CClipPRS.eType.Pos));
            ani.Push(ClipPRS(0, 0.5, bodySca, V3(0.8, 0.8, 0.8), CClipPRS.eType.Sca));
            this.Splash(pos);
            CSfx.Play("splash", 0.7);
        }
        this.mPC.mHopAF.SetAni(ani);
    }

    private BodyColor()
    {
        const c = CTheme.Cur().mBodyColor;
        return RGB(c[0], c[1], c[2]);
    }

    private Splash(_pos: CVec3)
    {
        const water = -2;
        for (let i = 0; i < 16; ++i)
        {
            let p = new CSubject();
            CVoxelModel.Particle(p, i % 3 == 0 ? RGB(0.7, 0.9, 1.0) : RGB(0.97, 0.99, 1.0), 1 + Math.random() * 1.2);
            const a = Math.random() * Math.PI * 2;
            const r = 2 + Math.random() * 6;
            const st = V3(_pos.x + Math.cos(a) * 2, water, _pos.z + Math.sin(a) * 2);
            const top = V3(_pos.x + Math.cos(a) * r * 0.6, water + 7 + Math.random() * 7, _pos.z + Math.sin(a) * r * 0.6);
            const ed = V3(_pos.x + Math.cos(a) * r, water - 1, _pos.z + Math.sin(a) * r);
            let ani = OnceAni();
            ani.Push(ClipPRS(0, 0.2, st, top, CClipPRS.eType.Pos));
            ani.Push(ClipPRS(0.2, 0.3, top, ed, CClipPRS.eType.Pos));
            ani.Push(ClipPRS(0.35, 0.15, V3(1, 1, 1), V3(0.01, 0.01, 0.01), CClipPRS.eType.Sca));
            ani.Push(new CClipDestroy(0.5));
            p.PushComp(new CAniFlow(ani));
            p.SetPos(st);
            this.mCanvas.PushSub(p);
        }
        for (let i = 0; i < 12; ++i)
        {
            let p = new CSubject();
            CVoxelModel.Box(p, V3(0, 0, 0), V3(2.2, 0.4, 2.2), RGB(0.95, 0.98, 1.0), false);
            const a = i / 12 * Math.PI * 2;
            const st = V3(_pos.x + Math.cos(a) * 3, water + 0.2, _pos.z + Math.sin(a) * 3);
            const ed = V3(_pos.x + Math.cos(a) * 11, water + 0.2, _pos.z + Math.sin(a) * 11);
            let ani = OnceAni();
            ani.Push(ClipPRS(0, 0.6, st, ed, CClipPRS.eType.Pos));
            ani.Push(ClipPRS(0.2, 0.4, V3(1, 1, 1), V3(0.01, 1, 0.01), CClipPRS.eType.Sca));
            ani.Push(new CClipDestroy(0.6));
            p.PushComp(new CAniFlow(ani));
            p.SetPos(st);
            this.mCanvas.PushSub(p);
        }
    }

    private StartEagle()
    {
        this.SetState(CGameMgr.eState.Eagle);
        this.mPC.mFreeze = true;
        this.mEagle = new CSubject();
        CTheme.Cur().Eagle(this.mEagle);
        this.mEagleZ = this.mPlayer.GetPos().z - 220;
        this.mEagleGrab = false;
        this.mEagle.SetPos(V3(this.mPC.mX, 14, this.mEagleZ));
        this.mCanvas.PushSub(this.mEagle);
        CSfx.Play("eagle", 0.6);
    }

    private UpdateEagle(_dt: number)
    {
        const pz = -this.mPC.RowF() * TILE;
        this.mEagleZ += EAGLE_SPEED * _dt;
        this.mEagle.SetPos(V3(this.mPC.mX, 14, this.mEagleZ));
        if (!this.mEagleGrab && this.mEagleZ >= pz)
        {
            this.mEagleGrab = true;
            this.mDeathKind = "eagle";
            this.mPC.mDead = true;
            this.mPC.mHopAF.mPlay = false;
            CSfx.Play("hit", 0.6);
            this.mShake.Shake(300);
        }
        if (this.mEagleGrab)
            this.mPlayer.SetPos(V3(this.mPC.mX, 4, this.mEagleZ));
        if (this.mEagleZ > pz + 260)
            this.GameOver();
    }

    private Burst(_pos: CVec3, _color: CColor, _count: number, _power: number)
    {
        for (let i = 0; i < _count; ++i)
        {
            let p = new CSubject();
            CVoxelModel.Particle(p, _color, 1 + Math.random() * 1.6);
            const a = Math.random() * Math.PI * 2;
            const r = _power * (0.4 + Math.random() * 0.6);
            const st = V3(_pos.x, 5, _pos.z);
            const mid = V3(_pos.x + Math.cos(a) * r * 0.6, 8 + Math.random() * _power * 0.8, _pos.z + Math.sin(a) * r * 0.6);
            const ed = V3(_pos.x + Math.cos(a) * r, 0.5, _pos.z + Math.sin(a) * r);
            let ani = OnceAni();
            ani.Push(ClipPRS(0, 0.22, st, mid, CClipPRS.eType.Pos));
            ani.Push(ClipPRS(0.22, 0.35, mid, ed, CClipPRS.eType.Pos));
            ani.Push(ClipPRS(0, 0.9, V3(0, 0, 0), V3(Math.random() * 6, Math.random() * 6, 0), CClipPRS.eType.Rot));
            ani.Push(ClipPRS(0.6, 0.4, V3(1, 1, 1), V3(0.01, 0.01, 0.01), CClipPRS.eType.Sca));
            ani.Push(new CClipDestroy(1.0));
            p.PushComp(new CAniFlow(ani));
            p.SetPos(st);
            this.mCanvas.PushSub(p);
        }
    }

    private GameOver()
    {
        if (this.mState == CGameMgr.eState.Over) return;
        this.SetState(CGameMgr.eState.Over);
        CStorage.Set(BEST_KEY, this.mBest);
        CSfx.Play("over", 0.5);

        let body = document.createElement("div");
        body.style.cssText = "text-align:center;padding:18px 10px;font-family:'Segoe UI',sans-serif";
        body.innerHTML = `<div style="font-size:34px;font-weight:900">GAME OVER</div>`
            + `<div style="font-size:15px;color:#888;margin-bottom:6px">${CTheme.Cur().mDeathText[this.mDeathKind] || ""}</div>`
            + `<div style="font-size:20px">점수 <b style="font-size:40px">${this.mScore}</b></div>`
            + `<div style="font-size:16px;margin:6px 0 16px">최고 ${this.mBest} · 코인 ${this.mCoin}</div>`;
        let btn = document.createElement("button");
        btn.className = "btn btn-success btn-lg px-5 fw-bold";
        btn.textContent = "다시 하기 (Space)";
        btn.onclick = () => this.NewGame();
        body.append(btn);

        this.mModal = new CModal("CrossyRoadOver");
        this.mModal.SetTitle(CModal.eTitle.None);
        this.mModal.SetBody(body);
        this.mModal.SetSize(340, 280);
        this.mModal.SetZIndex(CModal.eSort.Top);
        this.mModal.Open(CModal.ePos.Center);
    }

    // ------------------------------------------------------------------
    // 입력 / 카메라 / 업데이트
    // ------------------------------------------------------------------
    private ReadInput()
    {
        let input = this.GetFrame().Input();
        const K = CInput.eKey;
        if (this.mThemeModal != null)
        {
            if (!this.mThemeModal.IsShow()) this.mThemeModal = null;
            return;
        }
        if (this.mState == CGameMgr.eState.Over)
        {
            if (input.KeyDown(K.Space, true) || input.KeyDown(K.Enter, true))
                this.NewGame();
            return;
        }
        if (this.mState != CGameMgr.eState.Play && this.mState != CGameMgr.eState.Ready) return;

        if (input.KeyDown(K.Up, true) || input.KeyDown(K.W, true) || input.KeyDown(K.Space, true)) this.mPC.TryMove(0, 1);
        else if (input.KeyDown(K.Down, true) || input.KeyDown(K.S, true)) this.mPC.TryMove(0, -1);
        else if (input.KeyDown(K.Left, true) || input.KeyDown(K.A, true)) this.mPC.TryMove(-1, 0);
        else if (input.KeyDown(K.Right, true) || input.KeyDown(K.D, true)) this.mPC.TryMove(1, 0);

        // 엔진은 터치가 100px 넘게 튀면 같은 손가락도 새 항목으로 추가하므로 Mouse()(첫 항목)가 아니라 마지막 항목을 매 프레임 기록한다.
        // y는 화면 아래가 0인 좌표(CWindow: 높이 - pageY)라 위로 스와이프하면 dy가 양수다
        const mouseVec = input.MouseVec();
        const last = mouseVec.length > 0 ? mouseVec[mouseVec.length - 1] : null;
        if (input.KeyDown(K.LButton, true) && last != null)
        {
            this.mTouchX = this.mTouchEndX = last.x;
            this.mTouchY = this.mTouchEndY = last.y;
            this.mTouchOn = true;
        }
        else if (this.mTouchOn && last != null)
        {
            this.mTouchEndX = last.x;
            this.mTouchEndY = last.y;
        }
        if (this.mTouchOn && input.KeyUp(K.LButton))
        {
            this.mTouchOn = false;
            const dx = this.mTouchEndX - this.mTouchX;
            const dy = this.mTouchEndY - this.mTouchY;
            if (Math.abs(dx) < 25 && Math.abs(dy) < 25) this.mPC.TryMove(0, 1);
            else if (Math.abs(dx) > Math.abs(dy)) this.mPC.TryMove(dx > 0 ? 1 : -1, 0);
            else this.mPC.TryMove(0, dy > 0 ? 1 : -1);
        }
    }

    private UpdateCamera(_dt: number)
    {
        const rowF = this.mPC.RowF();
        if (this.mState == CGameMgr.eState.Play)
            this.mFocus += (0.2 + this.Difficulty(this.mScore) * 0.2) * _dt;
        if (rowF > this.mFocus)
            this.mFocus += (rowF - this.mFocus) * Math.min(1, _dt * 4);
        const tx = Math.max(-25, Math.min(25, this.mPC.mX * 0.6));
        this.mCamX += (tx - this.mCamX) * Math.min(1, _dt * 3);

        const portrait = this.Portrait();
        const ahead = (1 + portrait * 2) * TILE;
        const sideFix = -ahead * CAM_OFFSET.x / CAM_OFFSET.z;
        let look = V3(this.mCamX + sideFix, 0, -this.mFocus * TILE - ahead);
        let eye = V3(look.x + CAM_OFFSET.x, look.y + CAM_OFFSET.y, look.z + CAM_OFFSET.z);
        let cam = this.mCanvas.GetCam();
        const landWidth = 2 * CAM_DIST * Math.tan(LAND_FOV * 0.5);
        const width = landWidth + (PORT_WIDTH - landWidth) * portrait;
        const fov = 2 * Math.atan(width * 0.5 / CAM_DIST);
        if (Math.abs(cam.mFov - fov) > 0.0001)
        {
            cam.SetFov(fov);
            cam.mReset = true;
        }
        cam.Init(eye, look);
    }

    // 엔진 원근 투영은 기본이 가로 기준 화각이라 세로 화면에서는 세로 시야가 크게 넓어져 멀리서 본 것처럼 작아진다.
    // 0(가로 화면)~1(세로 비율 0.45 이하)로 돌려주고, 이 값으로 보이는 가로 폭과 주시점을 보간한다
    private Portrait()
    {
        const pf = this.GetFrame().PF();
        const aspect = pf.mWidth / Math.max(1, pf.mHeight);
        return 1 - Math.max(0, Math.min(1, (aspect - 0.45) / 0.55));
    }

    override Update(_update: CUpdate): void
    {
        const dt = _update.DeltaTime();
        if (dt <= 0) return;
        if (this.mPC == null)
        {
            // 큐에서 Start() 중인 서브젝트가 PushSub한 서브젝트는 캔버스 등록에서 누락되므로 첫 Update에서 월드를 만든다
            this.NewGame();
            return;
        }
        this.mStateTime += dt;

        if (this.mInputLock > 0) this.mInputLock -= dt;
        else this.ReadInput();

        this.GenerateLanes(Math.max(this.mPC.mRow, Math.floor(this.mFocus)) + GEN_AHEAD);
        this.CullLanes();

        if (this.mState == CGameMgr.eState.Play && this.mPC.RowF() < this.mFocus - EAGLE_GAP)
            this.StartEagle();

        if (this.mState == CGameMgr.eState.Eagle)
            this.UpdateEagle(dt);
        else if (this.mState == CGameMgr.eState.Dead && this.mStateTime > 1.1)
            this.GameOver();

        this.UpdateCamera(dt);
    }
}
