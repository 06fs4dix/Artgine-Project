import { CBehavior } from "../../../Artgine/artgine/app/component/CBehavior.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CPaint2D } from "../../../Artgine/artgine/app/component/paint/CPaint2D.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPlane } from "../../../Artgine/artgine/geometry/CPlane.js";
import { CBound } from "../../../Artgine/artgine/geometry/CBound.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";
import { CAlpha } from "../../../Artgine/artgine/render/CAlpha.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CBulletComp } from "./CBulletComp.js";
import { CEnemyComp } from "./CEnemyComp.js";
import { CGemComp } from "./CGemComp.js";
import { CFx } from "./CFx.js";
const STREAMS = [
    [[0, 0]],
    [[-10, 0], [10, 0]],
    [[0, 0], [-12, -0.12], [12, 0.12]],
    [[0, 0], [-10, -0.1], [10, 0.1], [-18, -0.22], [18, 0.22]],
    [[-6, 0], [6, 0], [-12, -0.1], [12, 0.1], [-18, -0.22], [18, 0.22], [-24, -0.36], [24, 0.36]],
];
const EVOLVE_TEX = [
    "Res/shmup_obj/airplane_01_64x64.png",
    "Res/shmup_obj/spaceship_001_64x64.png",
    "Res/shmup_obj/spaceship_003_64x64.png",
];
export class CPlayerComp extends CBehavior {
    static sHitSize = 6;
    mMaxSpeed = 380;
    mAccel = 2600;
    mFriction = 0.9;
    mVelocity = new CVec3(0, 0, 0);
    mShotTimer = 0;
    mBaseInterval = 140;
    mMaxHP = 10;
    mHP = 10;
    mInvincibleTimer = 0;
    mInvincibleDuration = 1600;
    mBomb = 3;
    mMissileTimer = 0;
    mMissileSide = 1;
    mOptionAngle = 0;
    mTime = 0;
    mDead = false;
    mEvolveTier = 0;
    mMuzzleTimer = 0;
    mAlphaOn = true;
    mLv = {};
    mRB = null;
    mPT = null;
    mFlame = null;
    mMuzzle = null;
    mOptions = [];
    OnShoot = null;
    OnMissile = null;
    OnDamage = null;
    OnBomb = null;
    OnEvolve = null;
    Start() {
        this.mPT = this.GetOwner().FindComp(CPaint2D);
        this.mRB = new CRigidBody();
        this.GetOwner().PushComp(this.mRB);
        let screenCl = new CCollider(this.mPT);
        screenCl.SetCameraOut(true);
        this.GetOwner().PushComp(screenCl);
        let hitBound = new CBound();
        hitBound.mMin = new CVec3(-CPlayerComp.sHitSize, -CPlayerComp.sHitSize, -50);
        hitBound.mMax = new CVec3(CPlayerComp.sHitSize, CPlayerComp.sHitSize, 50);
        hitBound.mType = CBound.eType.Box;
        let hitCl = new CCollider(hitBound);
        hitCl.SetLayer("player");
        hitCl.PushCollisionLayer("enemy_bullet");
        hitCl.PushCollisionLayer("enemy");
        this.GetOwner().PushComp(hitCl);
        let core = new CSubject();
        let cpt = new CPaint2D("Res/shmup_effects/flash5_64x64x4x2.png", new CVec2(CPlayerComp.sHitSize * 2 + 4, CPlayerComp.sHitSize * 2 + 4));
        cpt.SetTexCodi(0, 0, 64, 64, 256, 128);
        cpt.SetColorModel(new CColor(1, 0.55, 0.85, CColor.eModel.RGBMul));
        CFx.Bloom(cpt, 0.8);
        core.PushComp(cpt);
        core.SetPos(new CVec3(0, 0, 0.02));
        this.GetOwner().PushChild(core);
        let noneTex = CFx.WhiteTex();
        this.mFlame = new CSubject();
        let fpt = new CPaint2D(noneTex, new CVec2(9, 20));
        fpt.SetColorModel(new CColor(1, 0.55, 0.15, CColor.eModel.RGBMul));
        CFx.Bloom(fpt, 0.9);
        this.mFlame.PushComp(fpt);
        this.mFlame.SetPos(new CVec3(0, -30, -0.01));
        this.GetOwner().PushChild(this.mFlame);
        this.mMuzzle = new CSubject();
        let mpt = new CPaint2D(null, new CVec2(30, 30));
        mpt.SetTexture("Res/shmup_effects/flash5_64x64x4x2.png");
        mpt.SetTexCodi(0, 0, 64, 64, 256, 128);
        CFx.Bloom(mpt, 0.5);
        this.mMuzzle.PushComp(mpt);
        this.mMuzzle.SetPos(new CVec3(0, 34, 0.01));
        this.mMuzzle.SetSca(new CVec3(0, 0, 1));
        this.GetOwner().PushChild(this.mMuzzle);
    }
    GetLv(_id) { return this.mLv[_id] || 0; }
    ShotInterval() { return this.mBaseInterval * Math.pow(0.85, this.GetLv("Rapid")); }
    Damage() { return 1 + this.GetLv("Power"); }
    TotalLv() {
        let sum = 0;
        for (let k in this.mLv)
            sum += this.mLv[k];
        return sum;
    }
    Update(_update) {
        if (this.GetOwner().IsDestroy())
            return;
        super.Update(_update);
        let dt = _update.DeltaTime();
        let dm = _update.DeltaMil();
        this.mTime += dt;
        let input = this.GetOwner().GetFrame().Input();
        let dx = 0, dy = 0;
        if (input.KeyDown(CInput.eKey.Left) || input.KeyDown(CInput.eKey.A))
            dx -= 1;
        if (input.KeyDown(CInput.eKey.Right) || input.KeyDown(CInput.eKey.D))
            dx += 1;
        if (input.KeyDown(CInput.eKey.Up) || input.KeyDown(CInput.eKey.W))
            dy += 1;
        if (input.KeyDown(CInput.eKey.Down) || input.KeyDown(CInput.eKey.S))
            dy -= 1;
        if (dx !== 0 || dy !== 0) {
            let len = Math.sqrt(dx * dx + dy * dy);
            this.mVelocity.x += (dx / len) * this.mAccel * dt;
            this.mVelocity.y += (dy / len) * this.mAccel * dt;
        }
        this.mVelocity.x *= this.mFriction;
        this.mVelocity.y *= this.mFriction;
        let speed = Math.sqrt(this.mVelocity.x ** 2 + this.mVelocity.y ** 2);
        if (speed > this.mMaxSpeed) {
            let ratio = this.mMaxSpeed / speed;
            this.mVelocity.x *= ratio;
            this.mVelocity.y *= ratio;
        }
        this.mRB.Clear();
        if (Math.abs(this.mVelocity.x) > 1 || Math.abs(this.mVelocity.y) > 1)
            this.mRB.Push(new CForce("move", this.mVelocity, 1));
        else
            this.mVelocity.x = this.mVelocity.y = this.mVelocity.z = 0;
        this.GetOwner().SetRot(new CVec3(0, 0, -this.mVelocity.x / this.mMaxSpeed * 0.18));
        let fs = 0.8 + Math.random() * 0.5 + Math.max(0, dy) * 0.4;
        this.mFlame.SetSca(new CVec3(0.8 + Math.random() * 0.3, fs, 1));
        this.UpdateInvincible(dm);
        this.UpdateOptions(dt);
        if (this.mMuzzleTimer > 0) {
            this.mMuzzleTimer -= dm;
            let s = Math.max(0, this.mMuzzleTimer / 60);
            this.mMuzzle.SetSca(new CVec3(s, s, 1));
        }
        if (input.KeyDown(CInput.eKey.X, true) && this.mBomb > 0) {
            this.mBomb--;
            this.mInvincibleTimer = Math.max(this.mInvincibleTimer, 2000);
            if (this.OnBomb)
                this.OnBomb(this.GetOwner().GetPos().Export(), this.mBomb);
        }
        let firing = input.KeyDown(CInput.eKey.Space) || input.KeyDown(CInput.eKey.Z);
        this.mShotTimer -= dm;
        if (this.mShotTimer <= 0 && firing) {
            this.mShotTimer = this.ShotInterval();
            this.FireVolley();
        }
        let missileLv = this.GetLv("Missile");
        if (missileLv > 0 && firing) {
            this.mMissileTimer -= dm;
            if (this.mMissileTimer <= 0) {
                this.mMissileTimer = 900 / (1 + (missileLv - 1) * 0.5);
                let pos = this.GetOwner().GetPos().Export();
                pos.x += 20 * this.mMissileSide;
                this.mMissileSide *= -1;
                if (this.OnMissile)
                    this.OnMissile(pos, 2 + this.GetLv("Power"));
            }
        }
    }
    FireVolley() {
        if (!this.OnShoot)
            return;
        let pos = this.GetOwner().GetPos();
        let dmg = this.Damage();
        let pierce = this.GetLv("Pierce");
        let size = 16 + this.GetLv("Power") * 2 + pierce * 2;
        let streams = STREAMS[Math.min(this.GetLv("Multi"), STREAMS.length - 1)];
        for (let [ox, a] of streams)
            this.OnShoot(new CVec3(pos.x + ox, pos.y + 30, 0.1), Math.sin(a), Math.cos(a), dmg, pierce, size);
        let optDmg = Math.max(1, Math.ceil(dmg * 0.6));
        for (let opt of this.mOptions) {
            let op = opt.GetPos();
            this.OnShoot(new CVec3(pos.x + op.x, pos.y + op.y + 14, 0.1), 0, 1, optDmg, 0, 12);
        }
        this.mMuzzleTimer = 60;
        let s = 0.8 + Math.random() * 0.4;
        this.mMuzzle.SetSca(new CVec3(s, s, 1));
        this.mMuzzle.SetRot(new CVec3(0, 0, Math.random() * Math.PI * 2));
    }
    UpdateInvincible(_dm) {
        let on = true;
        if (this.mInvincibleTimer > 0) {
            this.mInvincibleTimer -= _dm;
            on = this.mInvincibleTimer <= 0 || Math.floor(this.mTime * 16) % 2 === 0;
        }
        if (on !== this.mAlphaOn) {
            this.mAlphaOn = on;
            this.mPT.SetAlphaModel(new CAlpha(on ? 1 : 0.25));
        }
    }
    UpdateOptions(_dt) {
        let n = this.mOptions.length;
        if (n === 0)
            return;
        this.mOptionAngle += _dt * 2.6;
        for (let i = 0; i < n; i++) {
            let a = this.mOptionAngle + i * Math.PI * 2 / n;
            this.mOptions[i].SetPos(new CVec3(Math.cos(a) * 50, Math.sin(a) * 26 - 8, 0.02));
        }
    }
    RebuildOptions() {
        let want = this.GetLv("Option");
        while (this.mOptions.length < want) {
            let opt = new CSubject();
            let pt = new CPaint2D("Res/shmup_obj/airplane_05_48x48_000.png", new CVec2(26, 26));
            CFx.Bloom(pt, 0.35);
            opt.PushComp(pt);
            this.GetOwner().PushChild(opt);
            this.mOptions.push(opt);
        }
    }
    ApplyUpgrade(_id) {
        this.mLv[_id] = this.GetLv(_id) + 1;
        switch (_id) {
            case "Heal":
                this.mHP = this.mMaxHP;
                break;
            case "MaxHP":
                this.mMaxHP += 2;
                this.mHP = Math.min(this.mMaxHP, this.mHP + 2);
                break;
            case "Speed":
                this.mMaxSpeed *= 1.15;
                this.mAccel *= 1.15;
                break;
            case "Magnet":
                CGemComp.sMagnet *= 1.6;
                break;
            case "Bomb":
                this.mBomb++;
                break;
            case "Option":
                this.RebuildOptions();
                break;
        }
        if (this.OnDamage)
            this.OnDamage(this.mHP, this.mMaxHP);
        this.CheckEvolve();
    }
    CheckEvolve() {
        let total = this.TotalLv() - this.GetLv("Heal") - this.GetLv("Bomb");
        let tier = total >= 11 ? 2 : total >= 5 ? 1 : 0;
        if (tier <= this.mEvolveTier)
            return;
        this.mEvolveTier = tier;
        this.mPT.SetTexture(EVOLVE_TEX[tier]);
        this.mInvincibleTimer = Math.max(this.mInvincibleTimer, 1500);
        if (this.OnEvolve)
            this.OnEvolve(this.GetOwner().GetPos().Export(), tier);
    }
    CameraOut(_pArr) {
        if (!_pArr || _pArr.length === 0)
            return;
        let pos = this.GetOwner().GetPos().Export();
        let rad = 28;
        for (let p of _pArr) {
            switch (p.mPlane) {
                case CPlane.eDir.Left:
                    pos.x += (1 + p.mLen) * rad;
                    this.mVelocity.x *= -0.5;
                    break;
                case CPlane.eDir.Right:
                    pos.x -= (1 + p.mLen) * rad;
                    this.mVelocity.x *= -0.5;
                    break;
                case CPlane.eDir.Top:
                    pos.y -= (1 + p.mLen) * rad;
                    this.mVelocity.y *= -0.5;
                    break;
                case CPlane.eDir.Bottom:
                    pos.y += (1 + p.mLen) * rad;
                    this.mVelocity.y *= -0.5;
                    break;
            }
        }
        this.GetOwner().SetPos(pos);
    }
    Collision(_org, _size, _tar, _push) {
        if (this.mDead || this.mInvincibleTimer > 0)
            return;
        for (let i = 0; i < _size; i++) {
            let owner = _tar[i].GetOwner();
            if (owner == null)
                continue;
            let dmg = CBulletComp.FindDamageable(owner);
            if (dmg != null && dmg.IsDead())
                continue;
            if (owner.FindComp(CEnemyComp) != null)
                dmg.TakeDamage(8);
            this.Hit();
            return;
        }
    }
    Hit() {
        this.mHP--;
        this.mInvincibleTimer = this.mInvincibleDuration;
        if (this.mHP <= 0)
            this.mDead = true;
        if (this.OnDamage)
            this.OnDamage(this.mHP, this.mMaxHP);
        if (this.mDead)
            this.GetOwner().Destroy();
    }
}
