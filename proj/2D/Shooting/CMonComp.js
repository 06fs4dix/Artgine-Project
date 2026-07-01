import { CBehavior } from "../../../Artgine/artgine/app/component/CBehavior.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
export class CMonComp extends CBehavior {
    mMoveType = 0;
    mTime = 0;
    mZigDir = 1;
    mRB = null;
    SetMoveType(_type) {
        this.mMoveType = _type;
        this.mTime = 0;
        this.mZigDir = 1;
        if (this.mRB != null)
            this.ApplyMovement();
    }
    Start() {
        this.mRB = this.GetOwner().FindComp(CRigidBody);
        this.ApplyMovement();
    }
    ApplyMovement() {
        if (!this.mRB)
            return;
        this.mRB.Clear();
        switch (this.mMoveType) {
            case 0:
                this.mRB.Push(new CForce("move", new CVec3(0, -1), 100));
                break;
            case 1:
                this.mRB.Push(new CForce("move", new CVec3(0, -1), 75));
                this.mRB.Push(new CForce("side", new CVec3(this.mZigDir, 0), 140));
                break;
            case 2:
                this.mRB.Push(new CForce("move", new CVec3(0, -1), 230));
                break;
            case 3:
                this.mRB.Push(new CForce("move", new CVec3(0, -1), 50));
                this.mRB.Push(new CForce("side", new CVec3(this.mZigDir, 0), 220));
                break;
        }
    }
    Update(_update) {
        if (this.mMoveType !== 1 && this.mMoveType !== 3)
            return;
        this.mTime += _update.DeltaTime();
        const interval = this.mMoveType === 1 ? 0.7 : 1.5;
        if (this.mTime >= interval) {
            this.mZigDir *= -1;
            this.mTime = 0;
            this.ApplyMovement();
        }
    }
}
