import { CBehavior } from "../../../Artgine/artgine/app/component/CBehavior.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CPaint2D } from "../../../Artgine/artgine/app/component/paint/CPaint2D.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
export class CEnemyComp extends CBehavior {
    static ePattern = { Straight: 0, Sine: 1, Zigzag: 2, Hover: 3, Dive: 4 };
    static sCharacters = {
        "Scout": {
            id: "Scout", path: "Res/shmup_obj/enemy01.png", w: 44, h: 44,
            hp: 3, score: 100, xp: 1, speed: 130, flip: false,
            pattern: 0, attackType: "Single", shotInterval: 4500
        },
        "Interceptor": {
            id: "Interceptor", path: "Res/shmup_obj/enemy04_32x32.png", w: 30, h: 30,
            hp: 2, score: 80, xp: 1, speed: 170, flip: false,
            pattern: 1, attackType: "Aim", shotInterval: 3200
        },
        "Diver": {
            id: "Diver", path: "Res/shmup_obj/airplane_03_64x64_000.png", w: 40, h: 40,
            hp: 2, score: 120, xp: 1, speed: 150, flip: true,
            pattern: 4, attackType: "None", shotInterval: 99999
        },
        "Vanguard": {
            id: "Vanguard", path: "Res/shmup_obj/enemy02.png", w: 56, h: 56,
            hp: 10, score: 250, xp: 3, speed: 120, flip: false,
            pattern: 3, attackType: "Fan", shotInterval: 1800
        },
        "Stalker": {
            id: "Stalker", path: "Res/shmup_obj/enemy03_48x48.png", w: 40, h: 40,
            hp: 6, score: 220, xp: 3, speed: 80, flip: false,
            pattern: 2, attackType: "Burst", shotInterval: 3800
        },
        "Heavy": {
            id: "Heavy", path: "Res/shmup_obj/airplane_04_64x64.png", w: 76, h: 76,
            hp: 26, score: 500, xp: 6, speed: 55, flip: true,
            pattern: 0, attackType: "Ring", shotInterval: 3600
        }
    };
    mChar = null;
    mHP = 3;
    mMaxHP = 3;
    mScore = 100;
    mTime = 0;
    mBaseX = 0;
    mAmplitude = 110;
    mFrequency = 0.0012;
    mShotTimer = 0;
    mFlashTimer = 0;
    mDead = false;
    mHoverY = 200;
    mHoverState = 0;
    mHoverTimer = 0;
    mBurstLeft = 0;
    mBurstTimer = 0;
    mDiveStarted = false;
    mRB = null;
    mPT = null;
    OnDestroy = null;
    OnShoot = null;
    OnFindPlayer = null;
    Init(_char, _stage, _wave) {
        this.mChar = _char;
        this.mHP = Math.round(_char.hp * (1 + (_stage - 1) * 0.6) * (1 + _wave * 0.03));
        this.mMaxHP = this.mHP;
        this.mScore = _char.score * _stage;
        this.mShotTimer = _char.shotInterval * (Math.random() * 0.3);
        this.mHoverY = 120 + Math.random() * 160;
    }
    Start() {
        this.mPT = this.GetOwner().FindComp(CPaint2D);
        this.mRB = this.GetOwner().FindComp(CRigidBody);
        let cl = new CCollider(this.mPT);
        cl.SetLayer("enemy");
        cl.PushCollisionLayer("player_bullet");
        cl.PushCollisionLayer("player");
        cl.SetCameraOut(true);
        this.GetOwner().PushComp(cl);
        this.mBaseX = this.GetOwner().GetPos().x;
    }
    IsDead() { return this.mDead; }
    IsOnScreen() {
        let pos = this.GetOwner().GetPos();
        return pos.y < 380 && pos.y > -380 && Math.abs(pos.x) < 290;
    }
    Update(_update) {
        if (!this.mChar || this.GetOwner().IsDestroy())
            return;
        super.Update(_update);
        let dm = _update.DeltaMil();
        this.mTime += dm;
        if (this.mFlashTimer > 0) {
            this.mFlashTimer -= dm;
            if (this.mFlashTimer <= 0)
                this.mPT.SetColorModel(new CColor(0, 0, 0, CColor.eModel.RGBAdd));
        }
        const pattern = this.mChar.pattern;
        if (pattern === CEnemyComp.ePattern.Sine) {
            let x = this.mBaseX + Math.sin(this.mTime * this.mFrequency * Math.PI * 2) * this.mAmplitude;
            let pos = this.GetOwner().GetPos();
            this.GetOwner().SetPos(new CVec3(x, pos.y, pos.z));
        }
        else if (pattern === CEnemyComp.ePattern.Zigzag) {
            let phase = (this.mTime * this.mFrequency * 2) % 2;
            let t = phase < 1 ? phase : 2 - phase;
            let x = this.mBaseX + (t * 2 - 1) * this.mAmplitude;
            let pos = this.GetOwner().GetPos();
            this.GetOwner().SetPos(new CVec3(x, pos.y, pos.z));
        }
        else if (pattern === CEnemyComp.ePattern.Hover) {
            this.UpdateHover(dm);
        }
        else if (pattern === CEnemyComp.ePattern.Dive) {
            this.UpdateDive();
        }
        if (this.mBurstLeft > 0) {
            this.mBurstTimer -= dm;
            if (this.mBurstTimer <= 0) {
                this.mBurstLeft--;
                this.mBurstTimer = 130;
                this.Shoot(0, -1, true);
            }
        }
        if (this.mChar.attackType !== "None" && this.IsOnScreen()) {
            if (pattern === CEnemyComp.ePattern.Hover && this.mHoverState !== 1)
                return;
            this.mShotTimer += dm;
            if (this.mShotTimer >= this.mChar.shotInterval) {
                this.mShotTimer = 0;
                this.Fire();
            }
        }
    }
    UpdateHover(_dm) {
        let pos = this.GetOwner().GetPos();
        if (this.mHoverState === 0 && pos.y <= this.mHoverY) {
            this.mHoverState = 1;
            this.mHoverTimer = 3600;
            this.mRB.Push(new CForce("move", new CVec3(0, -1), 8));
        }
        else if (this.mHoverState === 1) {
            this.mHoverTimer -= _dm;
            if (this.mHoverTimer <= 0) {
                this.mHoverState = 2;
                let side = pos.x > 0 ? 1 : -1;
                this.mRB.Push(new CForce("move", new CVec3(side * 0.7, -0.7), this.mChar.speed * 1.6));
            }
        }
    }
    UpdateDive() {
        if (this.mDiveStarted)
            return;
        let pos = this.GetOwner().GetPos();
        if (pos.y > 260)
            return;
        this.mDiveStarted = true;
        let target = this.OnFindPlayer ? this.OnFindPlayer() : null;
        let dir = new CVec3(0, -1);
        if (target) {
            let dx = target.x - pos.x, dy = target.y - pos.y;
            let len = Math.sqrt(dx * dx + dy * dy) || 1;
            dir = new CVec3(dx / len, dy / len);
        }
        this.mRB.Push(new CForce("move", dir, this.mChar.speed * 2.2));
        this.GetOwner().SetRot(new CVec3(0, 0, Math.atan2(dir.y, dir.x) + Math.PI / 2));
    }
    Shoot(_dx, _dy, _aim) {
        if (this.OnShoot)
            this.OnShoot(this.GetOwner().GetPos().Export(), _dx, _dy, _aim);
    }
    Fire() {
        switch (this.mChar.attackType) {
            case "Single":
                this.Shoot(0, -1, false);
                break;
            case "Aim":
                this.Shoot(0, -1, true);
                break;
            case "Burst":
                this.mBurstLeft = 2;
                this.mBurstTimer = 0;
                break;
            case "Fan":
                {
                    let target = this.OnFindPlayer ? this.OnFindPlayer() : null;
                    let pos = this.GetOwner().GetPos();
                    let base = -Math.PI / 2;
                    if (target)
                        base = Math.atan2(target.y - pos.y, target.x - pos.x);
                    for (let i = -1; i <= 1; i++) {
                        let a = base + i * 0.22;
                        this.Shoot(Math.cos(a), Math.sin(a), false);
                    }
                }
                break;
            case "Ring":
                {
                    let n = 10;
                    let off = Math.random() * Math.PI;
                    for (let i = 0; i < n; i++) {
                        let a = off + i * Math.PI * 2 / n;
                        this.Shoot(Math.cos(a), Math.sin(a), false);
                    }
                }
                break;
        }
    }
    TakeDamage(_dmg) {
        if (this.mDead)
            return;
        this.mHP -= _dmg;
        this.mFlashTimer = 70;
        this.mPT.SetColorModel(new CColor(0.9, 0.9, 0.9, CColor.eModel.RGBAdd));
        if (this.mHP <= 0) {
            this.mDead = true;
            let pos = this.GetOwner().GetPos().Export();
            if (this.OnDestroy)
                this.OnDestroy(pos, this.mChar, this.mScore);
            this.GetOwner().Destroy();
        }
    }
    CameraOut(_pArr) {
        if (_pArr.length === 0 || _pArr[0].mLen <= 1)
            return;
        let pos = this.GetOwner().GetPos();
        if (pos.y < -420 || Math.abs(pos.x) > 380)
            this.GetOwner().Destroy();
    }
}
