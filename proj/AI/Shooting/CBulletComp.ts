import { CBehavior } from "../../../Artgine/artgine/app/component/CBehavior.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPlaneInside } from "../../../Artgine/artgine/geometry/CPlaneInside.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";

export interface IDamageable
{
    TakeDamage(_dmg: number): void;
    IsDead(): boolean;
}

export class CBulletComp extends CBehavior
{
    static sTargetTypes: Array<new (...args: any[]) => any> = [];

    mIsPlayer = true;
    mDamage = 1;
    mPierce = 0;
    mHitSet = new Set<CSubject>();
    OnHit: (pos: CVec3) => void = null;

    static FindDamageable(_sub: CSubject): IDamageable
    {
        for (let type of CBulletComp.sTargetTypes)
        {
            let comp = _sub.FindComp(type);
            if (comp != null) return comp as IDamageable;
        }
        return null;
    }

    override Collision(_org: CCollider, _size: number, _tar: Array<CCollider>, _push: Array<CVec3>): void
    {
        if (this.GetOwner().IsDestroy()) return;

        if (!this.mIsPlayer)
        {
            if (this.OnHit) this.OnHit(this.GetOwner().GetPos().Export() as CVec3);
            this.GetOwner().Destroy();
            return;
        }

        for (let i = 0; i < _size; i++)
        {
            let target = _tar[i].GetOwner();
            if (target == null || target.IsDestroy() || this.mHitSet.has(target)) continue;
            let dmg = CBulletComp.FindDamageable(target);
            if (dmg == null || dmg.IsDead()) continue;

            this.mHitSet.add(target);
            dmg.TakeDamage(this.mDamage);
            if (this.OnHit) this.OnHit(this.GetOwner().GetPos().Export() as CVec3);

            this.mPierce--;
            if (this.mPierce < 0)
            {
                this.GetOwner().Destroy();
                return;
            }
        }
    }

    override CameraOut(_pArr: Array<CPlaneInside>): void
    {
        if (_pArr.length > 0 && _pArr[0].mLen > 2)
            this.GetOwner().Destroy();
    }
}
