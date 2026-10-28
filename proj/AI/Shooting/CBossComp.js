import { CBehavior } from "../../../artgine/app/component/CBehavior.js";
import { CCollider } from "../../../artgine/app/component/CCollider.js";
import { CPaint2D } from "../../../artgine/app/component/paint/CPaint2D.js";
import { CVec3 } from "../../../artgine/geometry/CVec3.js";
import { CColor } from "../../../artgine/render/CColor.js";
export class CBossComp extends CBehavior {
    static sGunOffX = 66;
    static sGunOffY = -34;
    mHP = 900;
    mMaxHP = 900;
    mPhase = 1;
    mBulletSpeed = 200;
    mTime = 0;
    mEnterTimer = 2600;
    mEnterStartY = 540;
    mBaseY = 230;
    mFanTimer = 0;
    mGunTimer = 0;
    mGunSide = 1;
    mSpiralTimer = 0;
    mSpiralAngle = 0;
    mSpiralOn = true;
    mSpiralCycle = 3000;
    mRingTimer = 0;
    mBeamTimer = 2500;
    mInvulTimer = 0;
    mFlashTimer = 0;
    mDead = false;
    mDieTimer = 0;
    mDieFxTimer = 0;
    mPT = null;
    mGunL = null;
    mGunR = null;
    OnShoot = null;
    OnBeam = null;
    OnDamage = null;
    OnPhase = null;
    OnDying = null;
    OnDestroy = null;
    OnFindPlayer = null;
    Start() {
        this.mPT = this.GetOwner().FindComp(CPaint2D);
        let cl = new CCollider(this.mPT);
        cl.SetLayer("enemy");
        cl.PushCollisionLayer("player_bullet");
        cl.PushCollisionLayer("player");
        this.GetOwner().PushComp(cl);
    }
    IsDead() { return this.mDead; }
    IsInvulnerable() { return this.mDead || this.mEnterTimer > 0 || this.mInvulTimer > 0; }
    PlayerPos() {
        let p = this.OnFindPlayer ? this.OnFindPlayer() : null;
        return p ? p : new CVec3(0, -300);
    }
    GunPos(_side) {
        let pos = this.GetOwner().GetPos();
        return new CVec3(pos.x + CBossComp.sGunOffX * _side, pos.y + CBossComp.sGunOffY, 0.12);
    }
    Aim(_from) {
        let p = this.PlayerPos();
        return Math.atan2(p.y - _from.y, p.x - _from.x);
    }
    Shoot(_pos, _angle, _speedMul, _kind) {
        if (this.OnShoot)
            this.OnShoot(_pos.Export(), Math.cos(_angle), Math.sin(_angle), this.mBulletSpeed * _speedMul, _kind);
    }
    Update(_update) {
        if (this.GetOwner().IsDestroy())
            return;
        super.Update(_update);
        let dm = _update.DeltaMil();
        if (this.mFlashTimer > -1000) {
            let prev = this.mFlashTimer;
            this.mFlashTimer -= dm;
            if (prev > 0 && this.mFlashTimer <= 0)
                this.mPT.SetColorModel(new CColor(0, 0, 0, CColor.eModel.RGBAdd));
        }
        if (this.mDead) {
            this.UpdateDying(dm, _update.DeltaTime());
            return;
        }
        if (this.mEnterTimer > 0) {
            this.mEnterTimer -= dm;
            let t = 1 - Math.max(0, this.mEnterTimer) / 2600;
            t = 1 - (1 - t) * (1 - t);
            let pos = this.GetOwner().GetPos().Export();
            pos.y = this.mEnterStartY + (this.mBaseY - this.mEnterStartY) * t;
            this.GetOwner().SetPos(pos);
            this.AimGuns();
            return;
        }
        if (this.mInvulTimer > 0)
            this.mInvulTimer -= dm;
        this.mTime += dm;
        let speed = this.mPhase === 3 ? 0.0007 : 0.00045;
        let amp = this.mPhase === 3 ? 190 : 150;
        let pos = this.GetOwner().GetPos().Export();
        pos.x = Math.sin(this.mTime * speed * Math.PI * 2) * amp;
        pos.y = this.mBaseY + Math.sin(this.mTime * 0.0013) * 22;
        this.GetOwner().SetPos(pos);
        this.AimGuns();
        if (this.mInvulTimer > 0)
            return;
        if (this.mPhase === 1)
            this.UpdatePhase1(dm);
        else if (this.mPhase === 2)
            this.UpdatePhase2(dm);
        else
            this.UpdatePhase3(dm);
    }
    AimGuns() {
        if (this.mGunL)
            this.mGunL.SetRot(new CVec3(0, 0, this.Aim(this.GunPos(-1))));
        if (this.mGunR)
            this.mGunR.SetRot(new CVec3(0, 0, this.Aim(this.GunPos(1))));
    }
    CorePos() {
        let pos = this.GetOwner().GetPos();
        return new CVec3(pos.x, pos.y - 20, 0.12);
    }
    FireGun(_count, _spread, _speedMul) {
        let gp = this.GunPos(this.mGunSide);
        this.mGunSide *= -1;
        let base = this.Aim(gp);
        for (let i = 0; i < _count; i++) {
            let a = base + (i - (_count - 1) / 2) * _spread;
            this.Shoot(gp, a, _speedMul, "gun");
        }
    }
    FireRing(_count, _speedMul) {
        let cp = this.CorePos();
        let off = Math.random() * Math.PI;
        for (let i = 0; i < _count; i++)
            this.Shoot(cp, off + i * Math.PI * 2 / _count, _speedMul, "big");
    }
    UpdatePhase1(_dm) {
        this.mFanTimer += _dm;
        if (this.mFanTimer >= 1900) {
            this.mFanTimer = 0;
            let cp = this.CorePos();
            let base = this.Aim(cp);
            for (let i = -3; i <= 3; i++)
                this.Shoot(cp, base + i * 0.16, 1.0, "big");
        }
        this.mGunTimer += _dm;
        if (this.mGunTimer >= 1000) {
            this.mGunTimer = 0;
            this.FireGun(3, 0.09, 1.35);
        }
    }
    UpdatePhase2(_dm) {
        this.mSpiralCycle -= _dm;
        if (this.mSpiralCycle <= 0) {
            this.mSpiralOn = !this.mSpiralOn;
            this.mSpiralCycle = this.mSpiralOn ? 3000 : 1800;
            if (!this.mSpiralOn)
                this.FireRing(14, 0.85);
        }
        if (this.mSpiralOn) {
            this.mSpiralTimer += _dm;
            if (this.mSpiralTimer >= 110) {
                this.mSpiralTimer = 0;
                let cp = this.CorePos();
                for (let k = 0; k < 3; k++)
                    this.Shoot(cp, this.mSpiralAngle + k * Math.PI * 2 / 3, 0.85, "spiral");
                this.mSpiralAngle += 0.21;
            }
        }
        else {
            this.mGunTimer += _dm;
            if (this.mGunTimer >= 500) {
                this.mGunTimer = 0;
                this.FireGun(1, 0, 1.6);
            }
        }
    }
    UpdatePhase3(_dm) {
        this.mBeamTimer += _dm;
        if (this.mBeamTimer >= 5000) {
            this.mBeamTimer = 0;
            if (this.OnBeam)
                this.OnBeam(this.CorePos());
        }
        this.mRingTimer += _dm;
        if (this.mRingTimer >= 2200) {
            this.mRingTimer = 0;
            this.FireRing(16, 0.8);
        }
        this.mGunTimer += _dm;
        if (this.mGunTimer >= 800) {
            this.mGunTimer = 0;
            this.FireGun(5, 0.12, 1.3);
        }
    }
    UpdateDying(_dm, _dt) {
        this.mDieTimer -= _dm;
        this.mDieFxTimer -= _dm;
        let pos = this.GetOwner().GetPos().Export();
        pos.y -= 18 * _dt;
        pos.x += (Math.random() - 0.5) * 6;
        this.GetOwner().SetPos(pos);
        if (this.mDieFxTimer <= 0) {
            this.mDieFxTimer = 110;
            let p = new CVec3(pos.x + (Math.random() - 0.5) * 240, pos.y + (Math.random() - 0.5) * 130);
            if (this.OnDying)
                this.OnDying(p);
            this.mPT.SetColorModel(new CColor(0.8, 0.5, 0.3, CColor.eModel.RGBAdd));
            this.mFlashTimer = 50;
        }
        if (this.mDieTimer <= 0) {
            if (this.OnDestroy)
                this.OnDestroy(pos);
            this.GetOwner().Destroy();
        }
    }
    TakeDamage(_dmg) {
        if (this.IsInvulnerable())
            return;
        this.mHP -= _dmg;
        if (this.OnDamage)
            this.OnDamage(Math.max(0, this.mHP), this.mMaxHP);
        if (this.mFlashTimer <= -90) {
            this.mPT.SetColorModel(new CColor(0.3, 0.3, 0.3, CColor.eModel.RGBAdd));
            this.mFlashTimer = 40;
        }
        if (this.mHP <= 0) {
            this.mDead = true;
            this.mDieTimer = 2200;
            this.mDieFxTimer = 0;
            return;
        }
        let ratio = this.mHP / this.mMaxHP;
        let phase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
        if (phase !== this.mPhase) {
            this.mPhase = phase;
            this.mInvulTimer = 1300;
            this.mGunTimer = 0;
            this.mRingTimer = 0;
            this.mBeamTimer = 2500;
            if (this.OnPhase)
                this.OnPhase(phase, this.GetOwner().GetPos().Export());
        }
    }
}
