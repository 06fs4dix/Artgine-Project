import { CBehavior } from "../../../artgine/app/component/CBehavior.js";
import { CForce } from "../../../artgine/app/component/CForce.js";
import { CRigidBody } from "../../../artgine/app/component/CRigidBody.js";
import { CVec3 } from "../../../artgine/geometry/CVec3.js";
import { CBulletComp } from "./CBulletComp.js";
import { CFx } from "./CFx.js";
export class CMissileComp extends CBehavior {
    mSpeed = 420;
    mTurn = 7;
    mAngle = Math.PI / 2;
    mTarget = null;
    mSearchTimer = 0;
    mTrailTimer = 0;
    mRB = null;
    OnTrail = null;
    Start() {
        this.mRB = this.GetOwner().FindComp(CRigidBody);
    }
    FindTarget() {
        let pos = this.GetOwner().GetPos();
        let best = null;
        let bestD = Infinity;
        for (let [, sub] of CFx.sCanvas.GetSubMap()) {
            if (sub.IsDestroy())
                continue;
            let dmg = CBulletComp.FindDamageable(sub);
            if (dmg == null || dmg.IsDead())
                continue;
            let sp = sub.GetPos();
            if (sp.y > 400)
                continue;
            let dx = sp.x - pos.x, dy = sp.y - pos.y;
            let d = dx * dx + dy * dy;
            if (d < bestD) {
                bestD = d;
                best = sub;
            }
        }
        return best;
    }
    Update(_update) {
        if (this.GetOwner().IsDestroy())
            return;
        super.Update(_update);
        let dt = _update.DeltaTime();
        this.mSearchTimer -= dt;
        if (this.mTarget == null || this.mTarget.IsDestroy() || this.mSearchTimer <= 0) {
            this.mTarget = this.FindTarget();
            this.mSearchTimer = 0.25;
        }
        if (this.mTarget) {
            let pos = this.GetOwner().GetPos();
            let tp = this.mTarget.GetPos();
            let want = Math.atan2(tp.y - pos.y, tp.x - pos.x);
            let diff = want - this.mAngle;
            while (diff > Math.PI)
                diff -= Math.PI * 2;
            while (diff < -Math.PI)
                diff += Math.PI * 2;
            let step = this.mTurn * dt;
            this.mAngle += Math.max(-step, Math.min(step, diff));
        }
        this.mSpeed = Math.min(900, this.mSpeed + 600 * dt);
        this.mRB.Push(new CForce("move", new CVec3(Math.cos(this.mAngle), Math.sin(this.mAngle)), this.mSpeed));
        this.GetOwner().SetRot(new CVec3(0, 0, this.mAngle - Math.PI / 2));
        this.mTrailTimer -= dt;
        if (this.mTrailTimer <= 0 && this.OnTrail) {
            this.mTrailTimer = 0.03;
            this.OnTrail(this.GetOwner().GetPos().Export());
        }
    }
}
