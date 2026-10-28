import { CBehavior } from "../../../artgine/app/component/CBehavior.js";
export class CBulletComp extends CBehavior {
    static sTargetTypes = [];
    mIsPlayer = true;
    mDamage = 1;
    mPierce = 0;
    mHitSet = new Set();
    OnHit = null;
    static FindDamageable(_sub) {
        for (let type of CBulletComp.sTargetTypes) {
            let comp = _sub.FindComp(type);
            if (comp != null)
                return comp;
        }
        return null;
    }
    Collision(_org, _size, _tar, _push) {
        if (this.GetOwner().IsDestroy())
            return;
        if (!this.mIsPlayer) {
            if (this.OnHit)
                this.OnHit(this.GetOwner().GetPos().Export());
            this.GetOwner().Destroy();
            return;
        }
        for (let i = 0; i < _size; i++) {
            let target = _tar[i].GetOwner();
            if (target == null || target.IsDestroy() || this.mHitSet.has(target))
                continue;
            let dmg = CBulletComp.FindDamageable(target);
            if (dmg == null || dmg.IsDead())
                continue;
            this.mHitSet.add(target);
            dmg.TakeDamage(this.mDamage);
            if (this.OnHit)
                this.OnHit(this.GetOwner().GetPos().Export());
            this.mPierce--;
            if (this.mPierce < 0) {
                this.GetOwner().Destroy();
                return;
            }
        }
    }
    CameraOut(_pArr) {
        if (_pArr.length > 0 && _pArr[0].mLen > 2)
            this.GetOwner().Destroy();
    }
}
