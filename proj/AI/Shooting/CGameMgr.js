import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CUI, CUIHTML } from "../../../Artgine/artgine/app/subject/CUI.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CModal } from "../../../Artgine/artgine/basic/CModal.js";
const S = (css) => `font-family:sans-serif;${css}`;
const UPGRADES = [
    { id: "Multi", name: "멀티 샷", desc: "발사 줄기가 늘어납니다.", color: "#4cf", max: 4 },
    { id: "Power", name: "파워 업", desc: "모든 탄의 데미지 +1", color: "#f55", max: 5 },
    { id: "Rapid", name: "연사력 강화", desc: "발사 간격 15% 감소", color: "#5f9", max: 5 },
    { id: "Pierce", name: "관통탄", desc: "탄이 적을 1회 더 관통합니다.", color: "#fc4", max: 3 },
    { id: "Missile", name: "호밍 미사일", desc: "적을 쫓아가는 유도 미사일 발사", color: "#f84", max: 4 },
    { id: "Option", name: "옵션 드론", desc: "주위를 돌며 함께 사격하는 드론 +1", color: "#8af", max: 4 },
    { id: "Speed", name: "부스터", desc: "이동 속도 15% 증가", color: "#ff6", max: 3 },
    { id: "Magnet", name: "자석", desc: "경험치 흡수 범위 60% 증가", color: "#c8f", max: 3 },
    { id: "MaxHP", name: "장갑 강화", desc: "최대 HP +2, HP 2 회복", color: "#6f6", max: 3 },
    { id: "Heal", name: "긴급 수리", desc: "HP를 모두 회복합니다.", color: "#0f8", max: 999 },
    { id: "Bomb", name: "폭탄 보급", desc: "폭탄 +1 (X키: 화면 전체 공격)", color: "#fff", max: 999 },
];
const WAVE_TIME = 7000;
const BOSS_WAVE = 12;
const MAX_BOMB = 5;
export class CGameMgr extends CSubject {
    mScore = 0;
    mStage = 1;
    mWave = 1;
    mWaveTimer = 0;
    mSpawnTimer = 0;
    mSpawnInterval = 1300;
    mGameOver = false;
    mGameOverDelay = 0;
    mBossActive = false;
    mBossTriggered = false;
    mWarningTimer = 0;
    mLevel = 1;
    mXP = 0;
    mXPNeed = 12;
    mPendingLevel = 0;
    mCombo = 0;
    mMaxCombo = 0;
    mComboTimer = 0;
    mStartDelay = 3000;
    mAnnounceTimer = 0;
    mAnnounceUI = null;
    mBossHPUI = null;
    mUpgradeModal = null;
    mUpgradeChoices = [];
    mUpgradeCards = [];
    mUpgradeSel = 0;
    mUpgradeOpenTime = 0;
    mPlayer = null;
    mHPFill = null;
    mHPText = null;
    mBombEl = null;
    mScoreEl = null;
    mWaveEl = null;
    mStageEl = null;
    mComboEl = null;
    mXPFill = null;
    mLevelEl = null;
    mBossHPFill = null;
    OnSpawnEnemy = null;
    OnSpawnBoss = null;
    OnRestart = null;
    OnPause = null;
    OnUpgrade = null;
    OnLevelUp = null;
    OnWarning = null;
    Start() {
        let topLeft = new CUIHTML();
        topLeft.Init(`<div style="${S('display:flex;flex-direction:column;gap:5px;white-space:nowrap')}">
                <div class="score-el" style="color:#fff;font-size:22px;font-weight:bold;
                    text-shadow:0 0 8px #0af,1px 1px 0 #000">SCORE 0</div>
                <div style="display:flex;align-items:center;gap:6px">
                    <span style="color:#f66;font-size:14px;font-weight:bold;text-shadow:1px 1px 0 #000">HP</span>
                    <div style="width:130px;height:12px;background:#222;border:1px solid #f66;
                        border-radius:6px;overflow:hidden;box-shadow:0 0 8px #f22">
                        <div class="hp-fill" style="width:100%;height:100%;
                            background:linear-gradient(90deg,#f22,#f96);transition:width 0.15s"></div>
                    </div>
                    <span class="hp-text" style="color:#fff;font-size:13px;text-shadow:1px 1px 0 #000">10/10</span>
                </div>
                <div class="bomb-el" style="color:#ffd84a;font-size:15px;font-weight:bold;
                    text-shadow:0 0 6px #fa0,1px 1px 0 #000">BOMB ●●●</div>
            </div>`);
        topLeft.SetAnchorX(CUI.eAnchor.Min, 20);
        topLeft.SetAnchorY(CUI.eAnchor.Max, 20);
        topLeft.SetPos(new CVec3(0, 0, 0.5));
        this.PushChild(topLeft);
        let tl = topLeft.mUIPT.GetElement();
        this.mScoreEl = tl.querySelector(".score-el");
        this.mHPFill = tl.querySelector(".hp-fill");
        this.mHPText = tl.querySelector(".hp-text");
        this.mBombEl = tl.querySelector(".bomb-el");
        let topRight = new CUIHTML();
        topRight.Init(`<div style="${S('display:flex;flex-direction:column;align-items:flex-end;gap:4px;white-space:nowrap')}">
                <div style="color:#fff;font-size:20px;font-weight:bold;text-shadow:0 0 8px #0af,1px 1px 0 #000">
                    <span class="stage-el">ST.1</span>&nbsp;<span class="wave-el">WAVE 1</span>
                </div>
                <div class="combo-el" style="color:#ff5;font-size:24px;font-weight:bold;font-style:italic;
                    text-shadow:0 0 10px #f80,2px 2px 0 #000;opacity:0">x0 COMBO</div>
            </div>`);
        topRight.SetAnchorX(CUI.eAnchor.Max, 20);
        topRight.SetAnchorY(CUI.eAnchor.Max, 20);
        topRight.SetPos(new CVec3(0, 0, 0.5));
        this.PushChild(topRight);
        let tr = topRight.mUIPT.GetElement();
        this.mStageEl = tr.querySelector(".stage-el");
        this.mWaveEl = tr.querySelector(".wave-el");
        this.mComboEl = tr.querySelector(".combo-el");
        let bottom = new CUIHTML();
        bottom.Init(`<div style="${S('display:flex;align-items:center;gap:8px;white-space:nowrap')}">
                <span class="level-el" style="color:#7ff;font-size:16px;font-weight:bold;
                    text-shadow:0 0 8px #0ff,1px 1px 0 #000">LV 1</span>
                <div style="width:440px;height:10px;background:#112;border:1px solid #3cf;
                    border-radius:5px;overflow:hidden;box-shadow:0 0 10px #09f">
                    <div class="xp-fill" style="width:0%;height:100%;
                        background:linear-gradient(90deg,#08f,#7ff);transition:width 0.15s"></div>
                </div>
            </div>`);
        bottom.SetAnchorX(CUI.eAnchor.Min, 30);
        bottom.SetAnchorY(CUI.eAnchor.Min, 14);
        bottom.SetPos(new CVec3(0, 0, 0.5));
        this.PushChild(bottom);
        let bt = bottom.mUIPT.GetElement();
        this.mXPFill = bt.querySelector(".xp-fill");
        this.mLevelEl = bt.querySelector(".level-el");
        this.ShowAnnounce(`<div style="${S('color:#ff0;font-size:64px;font-weight:bold;letter-spacing:10px;'
            + 'text-shadow:0 0 20px #f80, 2px 2px 0 #000;white-space:nowrap')}">READY?</div>`, 0);
    }
    ShowAnnounce(_html, _time, _y = 0) {
        if (this.mAnnounceUI)
            this.mAnnounceUI.Destroy();
        this.mAnnounceUI = new CUIHTML();
        this.mAnnounceUI.Init(_html);
        this.mAnnounceUI.SetPos(new CVec3(0, _y, 0.9));
        this.PushChild(this.mAnnounceUI);
        this.mAnnounceTimer = _time;
    }
    Update(_update) {
        let dm = _update.DeltaMil();
        if (this.mGameOver) {
            if (this.mGameOverDelay > 0) {
                this.mGameOverDelay -= dm;
                if (this.mGameOverDelay <= 0)
                    this.ShowGameOverUI();
                return;
            }
            if (this.GetFrame().Input().KeyUp(CInput.eKey.R))
                if (this.OnRestart)
                    this.OnRestart();
            return;
        }
        if (this.mStartDelay > 0) {
            this.mStartDelay -= dm;
            if (this.mStartDelay <= 0) {
                this.ShowAnnounce(`<div style="${S('color:#0ff;font-size:80px;font-weight:bold;letter-spacing:5px;'
                    + 'text-shadow:0 0 30px #0ff, 2px 2px 0 #000;white-space:nowrap')}">GO!!</div>`, 1000);
            }
            return;
        }
        if (this.mAnnounceTimer > 0) {
            this.mAnnounceTimer -= dm;
            if (this.mAnnounceTimer <= 0 && this.mAnnounceUI) {
                this.mAnnounceUI.Destroy();
                this.mAnnounceUI = null;
            }
        }
        if (this.mComboTimer > 0) {
            this.mComboTimer -= dm;
            if (this.mComboTimer <= 0) {
                this.mCombo = 0;
                this.RefreshCombo();
            }
        }
        if (this.mWarningTimer > 0) {
            this.mWarningTimer -= dm;
            if (this.mWarningTimer <= 0) {
                this.mBossActive = true;
                this.ShowBossHP();
                if (this.OnSpawnBoss)
                    this.OnSpawnBoss();
            }
            return;
        }
        if (this.mBossActive || this.mBossTriggered)
            return;
        this.mWaveTimer += dm;
        if (this.mWaveTimer > WAVE_TIME) {
            this.mWaveTimer -= WAVE_TIME;
            this.mWave++;
            if (this.mWaveEl)
                this.mWaveEl.textContent = "WAVE " + this.mWave;
            if (this.mWave >= BOSS_WAVE) {
                this.mBossTriggered = true;
                this.ShowWarning();
                return;
            }
        }
        this.mSpawnTimer -= dm;
        if (this.mSpawnTimer > 0)
            return;
        this.mSpawnInterval = Math.max(650, 1500 - this.mWave * 45 - (this.mStage - 1) * 120);
        this.mSpawnTimer = this.mSpawnInterval;
        this.SpawnTick();
    }
    IsUnlocked(_id) {
        if (this.mStage > 1)
            return true;
        const unlock = { Scout: 1, Interceptor: 2, Diver: 4, Vanguard: 5, Stalker: 7, Heavy: 9 };
        return this.mWave >= (unlock[_id] || 1);
    }
    Spawn(_id, _x, _yOff = 0) {
        if (this.OnSpawnEnemy)
            this.OnSpawnEnemy(_id, _x, _yOff);
    }
    SpawnTick() {
        let formationChance = 0.15 + this.mWave * 0.02 + (this.mStage - 1) * 0.08;
        if (Math.random() < formationChance && this.SpawnFormation())
            return;
        let pool = ["Scout", "Interceptor", "Diver", "Vanguard", "Stalker", "Heavy"].filter(id => this.IsUnlocked(id));
        let base = this.mWave < 6 ? 1 : 2;
        let count = base + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            let id = pool[Math.floor(Math.random() * pool.length)];
            this.Spawn(id, Math.random() * 460 - 230, Math.random() * 80);
        }
    }
    SpawnFormation() {
        let list = [];
        let cx = Math.random() * 300 - 150;
        list.push(() => {
            const v = [[0, 0], [-42, 42], [42, 42], [-84, 84], [84, 84]];
            for (let [ox, oy] of v)
                this.Spawn("Scout", cx + ox, oy);
        });
        if (this.IsUnlocked("Interceptor"))
            list.push(() => {
                for (let i = 0; i < 5; i++)
                    this.Spawn("Interceptor", -160 + i * 80, 0);
            });
        if (this.IsUnlocked("Diver"))
            list.push(() => {
                for (let i = 0; i < 4; i++)
                    this.Spawn("Diver", cx, i * 70);
            });
        if (this.IsUnlocked("Vanguard"))
            list.push(() => {
                this.Spawn("Vanguard", -130, 0);
                this.Spawn("Vanguard", 130, 0);
            });
        if (this.IsUnlocked("Heavy"))
            list.push(() => {
                this.Spawn("Heavy", cx, 0);
                this.Spawn("Scout", cx - 70, 50);
                this.Spawn("Scout", cx + 70, 50);
            });
        if (list.length === 0)
            return false;
        list[Math.floor(Math.random() * list.length)]();
        return true;
    }
    ShowWarning() {
        this.mWarningTimer = 3000;
        this.ShowAnnounce(`<div style="${S('display:flex;flex-direction:column;align-items:center;gap:6px')}">
                <style>@keyframes shwarn{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(1.06)}}</style>
                <div style="width:600px;height:6px;background:repeating-linear-gradient(45deg,#f00 0 14px,#000 14px 28px)"></div>
                <div style="color:#f22;font-size:70px;font-weight:bold;letter-spacing:8px;white-space:nowrap;
                    text-shadow:0 0 25px #f00,3px 3px 0 #000;animation:shwarn 0.5s infinite">WARNING</div>
                <div style="color:#fbb;font-size:18px;letter-spacing:4px;white-space:nowrap;
                    text-shadow:1px 1px 0 #000">HUGE ENEMY APPROACHING</div>
                <div style="width:600px;height:6px;background:repeating-linear-gradient(45deg,#f00 0 14px,#000 14px 28px)"></div>
            </div>`, 3000, 40);
        if (this.OnWarning)
            this.OnWarning();
    }
    AddKill(_score) {
        if (this.mGameOver)
            return;
        this.mCombo++;
        this.mMaxCombo = Math.max(this.mMaxCombo, this.mCombo);
        this.mComboTimer = 2200;
        let mult = 1 + Math.min(this.mCombo, 50) * 0.04;
        this.AddScore(Math.round(_score * mult));
        this.RefreshCombo();
    }
    RefreshCombo() {
        if (!this.mComboEl)
            return;
        if (this.mCombo >= 3) {
            this.mComboEl.style.opacity = "1";
            this.mComboEl.textContent = "x" + this.mCombo + " COMBO";
            this.mComboEl.style.fontSize = Math.min(38, 22 + this.mCombo * 0.3) + "px";
        }
        else
            this.mComboEl.style.opacity = "0";
    }
    AddScore(_score) {
        this.mScore += _score;
        if (this.mScoreEl)
            this.mScoreEl.textContent = "SCORE " + this.mScore;
    }
    AddXP(_xp) {
        if (this.mGameOver)
            return;
        this.mXP += _xp;
        while (this.mXP >= this.mXPNeed) {
            this.mXP -= this.mXPNeed;
            this.mLevel++;
            this.mXPNeed = 12 + (this.mLevel - 1) * 8;
            this.mPendingLevel++;
        }
        this.RefreshXP();
        if (this.mPendingLevel > 0 && this.mUpgradeModal == null) {
            if (this.OnLevelUp)
                this.OnLevelUp();
            this.ShowUpgradeUI();
        }
    }
    RefreshXP() {
        if (this.mXPFill)
            this.mXPFill.style.width = (this.mXP / this.mXPNeed * 100) + "%";
        if (this.mLevelEl)
            this.mLevelEl.textContent = "LV " + this.mLevel;
    }
    UpdateHP(_hp, _maxHP) {
        if (this.mHPFill)
            this.mHPFill.style.width = Math.max(0, _hp / _maxHP * 100) + "%";
        if (this.mHPText)
            this.mHPText.textContent = Math.max(0, _hp) + "/" + _maxHP;
    }
    UpdateBomb(_bomb) {
        if (this.mBombEl)
            this.mBombEl.textContent = "BOMB " + ("●".repeat(_bomb) || "-");
    }
    ShowBossHP() {
        this.mBossHPUI = new CUIHTML();
        this.mBossHPUI.Init(`<div style="${S('display:flex;flex-direction:column;align-items:center;gap:4px;white-space:nowrap')}">
                <span style="color:#f80;font-size:13px;font-weight:bold;
                    text-shadow:0 0 8px #f40,1px 1px 0 #000">BOSS</span>
                <div style="width:12px;height:380px;background:#211;display:flex;flex-direction:column;justify-content:flex-end;
                    border:1px solid #f80;border-radius:6px;overflow:hidden;box-shadow:0 0 12px #f60">
                    <div class="boss-fill" style="width:100%;height:100%;
                        background:linear-gradient(0deg,#f20,#fb0);transition:height 0.1s"></div>
                </div>
            </div>`);
        this.mBossHPUI.SetAnchorX(CUI.eAnchor.Max, 12);
        this.mBossHPUI.SetAnchorY(CUI.eAnchor.Max, 140);
        this.mBossHPUI.SetPos(new CVec3(0, 0, 0.8));
        this.PushChild(this.mBossHPUI);
        this.mBossHPFill = this.mBossHPUI.mUIPT.GetElement().querySelector(".boss-fill");
    }
    UpdateBossHP(_hp, _max) {
        if (this.mBossHPFill)
            this.mBossHPFill.style.height = Math.max(0, (_hp / _max) * 100) + "%";
    }
    ShowClear() {
        this.mBossActive = false;
        if (this.mBossHPUI) {
            this.mBossHPUI.Destroy();
            this.mBossHPUI = null;
        }
        this.mBossHPFill = null;
        let bonus = 5000 * this.mStage;
        this.AddScore(bonus);
        this.mStage++;
        this.mBossTriggered = false;
        this.mWave = 1;
        this.mWaveTimer = 0;
        this.mSpawnTimer = 4000;
        if (this.mStageEl)
            this.mStageEl.textContent = "ST." + this.mStage;
        if (this.mWaveEl)
            this.mWaveEl.textContent = "WAVE 1";
        this.ShowAnnounce(`<div style="${S('display:flex;flex-direction:column;align-items:center;gap:8px')}">
                <div style="color:#ff0;font-size:46px;font-weight:bold;white-space:nowrap;
                    text-shadow:0 0 25px #fa0,2px 2px 0 #000">STAGE CLEAR!</div>
                <div style="color:#fff;font-size:20px;white-space:nowrap;text-shadow:1px 1px 0 #000">BONUS +${bonus}</div>
                <div style="color:#0ff;font-size:34px;font-weight:bold;white-space:nowrap;margin-top:14px;
                    text-shadow:0 0 20px #0ff,2px 2px 0 #008">STAGE ${this.mStage} - ${this.GetStageName()}</div>
            </div>`, 3500, 30);
    }
    GetStageName() {
        const names = ["", "ROOKIE", "VETERAN", "ACE", "LEGEND", "NIGHTMARE"];
        return names[Math.min(this.mStage, names.length - 1)];
    }
    ShowGameOver() {
        if (this.mGameOver)
            return;
        this.mGameOver = true;
        this.mGameOverDelay = 1600;
        if (this.mBossHPUI) {
            this.mBossHPUI.Destroy();
            this.mBossHPUI = null;
        }
    }
    ShowGameOverUI() {
        this.ShowAnnounce(`<div style="${S('width:380px;padding:26px 0;background:rgba(10,0,0,0.78);border:2px solid #f33;'
            + 'border-radius:14px;box-shadow:0 0 30px #f00;display:flex;flex-direction:column;'
            + 'align-items:center;justify-content:center;gap:10px')}">
                <div style="color:#fff;font-size:52px;font-weight:bold;white-space:nowrap;
                    text-shadow:0 0 20px #f00,2px 2px 0 #c00">GAME OVER</div>
                <div style="color:#ff0;font-size:20px;font-weight:bold;white-space:nowrap">SCORE ${this.mScore}</div>
                <div style="color:#ddd;font-size:15px;white-space:nowrap">
                    STAGE ${this.mStage} &nbsp;|&nbsp; LV ${this.mLevel} &nbsp;|&nbsp; MAX COMBO ${this.mMaxCombo}</div>
                <div style="color:#aaa;font-size:17px;margin-top:6px">Press R to Restart</div>
            </div>`, 0, 20);
    }
    PickChoices() {
        let pc = this.mPlayer;
        let pool = UPGRADES.filter(u => {
            if (pc.GetLv(u.id) >= u.max)
                return false;
            if (u.id === "Heal" && pc.mHP >= pc.mMaxHP)
                return false;
            if (u.id === "Bomb" && pc.mBomb >= MAX_BOMB)
                return false;
            return true;
        });
        for (let i = pool.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, 3);
    }
    ShowUpgradeUI() {
        if (this.OnPause)
            this.OnPause(true);
        let choices = this.PickChoices();
        let pc = this.mPlayer;
        let html = `<div style="${S('display:flex;flex-direction:column;align-items:center;gap:16px;padding:10px 0')}">
            <div style="color:#ff0;font-size:38px;font-weight:bold;letter-spacing:4px;
                text-shadow:0 0 18px #f80,2px 2px 0 #000">LEVEL UP!</div>
            <div style="display:flex;gap:14px;justify-content:center">`;
        choices.forEach((c, i) => {
            let lv = pc.GetLv(c.id);
            let lvText = c.max > 100 ? "" : `Lv ${lv} → ${lv + 1}`;
            html += `<div class="upg-card" data-idx="${i}" style="position:relative;width:160px;height:210px;cursor:pointer;
                background:linear-gradient(180deg,#223,#0a0a14);border:2px solid ${c.color};border-radius:12px;
                padding:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;
                text-align:center;gap:10px;box-shadow:0 0 16px ${c.color}66,inset 0 0 18px ${c.color}33;
                transition:transform .12s,box-shadow .12s;user-select:none">
                <div style="position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:12px;
                    background:${c.color};color:#000;font-size:15px;font-weight:bold;line-height:24px">${i + 1}</div>
                <div style="color:${c.color};font-size:21px;font-weight:bold;text-shadow:0 0 8px ${c.color}">${c.name}</div>
                <div style="color:#9ab;font-size:13px">${lvText}</div>
                <div style="color:#ddd;font-size:14px;line-height:1.45">${c.desc}</div>
            </div>`;
        });
        html += `</div>
            <div style="color:#8ab;font-size:13px">← → 선택 &nbsp;·&nbsp; Enter / Space 결정 &nbsp;·&nbsp; 1 2 3 바로 선택</div>
        </div>`;
        let modal = new CModal();
        modal.SetTitle(CModal.eTitle.None);
        modal.SetResize(false);
        modal.SetBG("dark");
        modal.SetOverlay(true);
        modal.SetCloseEsc(false);
        modal.SetZIndex(CModal.eSort.Top);
        modal.SetSize(560, 360);
        modal.SetBody(html);
        modal.Open(CModal.ePos.Center);
        this.mUpgradeModal = modal;
        this.mUpgradeChoices = choices;
        this.mUpgradeCards = [];
        this.mUpgradeOpenTime = performance.now();
        let cards = modal.GetBody().querySelectorAll(".upg-card");
        cards.forEach((el) => {
            let card = el;
            let idx = Number(card.dataset.idx);
            this.mUpgradeCards[idx] = card;
            card.onmouseenter = () => this.SetUpgradeSel(idx);
            card.onclick = () => this.PickUpgrade(choices[idx].id);
        });
        this.SetUpgradeSel(0);
    }
    SetUpgradeSel(_idx) {
        this.mUpgradeSel = _idx;
        this.mUpgradeCards.forEach((card, i) => {
            let color = this.mUpgradeChoices[i].color;
            let on = i === _idx;
            card.style.transform = on ? "translateY(-6px) scale(1.05)" : "none";
            card.style.boxShadow = on ? `0 0 32px ${color},inset 0 0 22px ${color}55` : `0 0 16px ${color}66,inset 0 0 18px ${color}33`;
        });
    }
    UpgradeInput(_input) {
        if (this.mUpgradeModal == null || this.mUpgradeCards.length === 0)
            return;
        if (performance.now() - this.mUpgradeOpenTime < 350)
            return;
        let n = this.mUpgradeCards.length;
        const K = CInput.eKey;
        if (_input.KeyDown(K.Left, true) || _input.KeyDown(K.A, true))
            this.SetUpgradeSel((this.mUpgradeSel + n - 1) % n);
        else if (_input.KeyDown(K.Right, true) || _input.KeyDown(K.D, true))
            this.SetUpgradeSel((this.mUpgradeSel + 1) % n);
        const numKeys = [K.Num1, K.Num2, K.Num3];
        for (let i = 0; i < n && i < numKeys.length; i++) {
            if (_input.KeyDown(numKeys[i], true)) {
                this.PickUpgrade(this.mUpgradeChoices[i].id);
                return;
            }
        }
        if (_input.KeyDown(K.Enter, true) || _input.KeyDown(K.Space, true) || _input.KeyDown(K.Z, true))
            this.PickUpgrade(this.mUpgradeChoices[this.mUpgradeSel].id);
    }
    PickUpgrade(_id) {
        if (this.mUpgradeModal) {
            this.mUpgradeModal.Close();
            this.mUpgradeModal = null;
        }
        this.mUpgradeCards = [];
        this.mPlayer.ApplyUpgrade(_id);
        if (this.OnUpgrade)
            this.OnUpgrade(_id);
        this.mPendingLevel--;
        if (this.mPendingLevel > 0) {
            this.ShowUpgradeUI();
            return;
        }
        if (this.OnPause)
            this.OnPause(false);
        this.GetFrame().Win().Handle().focus();
    }
}
