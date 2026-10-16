import { CBehavior } from "../../../Artgine/artgine/app/component/CBehavior.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
export class CGemComp extends CBehavior {
    static sPlayer = null;
    static sMagnet = 110;
    mXP = 1;
    mVel = new CVec3();
    mTime = 0;
    mAttract = false;
    OnCollect = null;
    Start() {
        let a = Math.random() * Math.PI * 2;
        let s = 60 + Math.random() * 140;
        this.mVel = new CVec3(Math.cos(a) * s, Math.sin(a) * s + 60);
        this.mTime = 0;
        this.mAttract = false;
    }
    Update(_update) {
        if (this.GetOwner().IsDestroy())
            return;
        super.Update(_update);
        let dt = _update.DeltaTime();
        this.mTime += dt;
        let pos = this.GetOwner().GetPos().Export();
        let player = CGemComp.sPlayer;
        let hasPlayer = player != null && !player.IsDestroy();
        if (hasPlayer && this.mTime > 0.35) {
            let pp = player.GetPos();
            let dx = pp.x - pos.x, dy = pp.y - pos.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 22) {
                if (this.OnCollect)
                    this.OnCollect(this.mXP, pos);
                this.GetOwner().Destroy();
                return;
            }
            if (this.mAttract || dist < CGemComp.sMagnet) {
                this.mAttract = true;
                let s = 500 + this.mTime * 400;
                this.mVel.x += (dx / dist * s - this.mVel.x) * Math.min(1, dt * 8);
                this.mVel.y += (dy / dist * s - this.mVel.y) * Math.min(1, dt * 8);
            }
        }
        if (!this.mAttract) {
            let k = Math.min(1, dt * 3);
            this.mVel.x += (0 - this.mVel.x) * k;
            this.mVel.y += (-70 - this.mVel.y) * k;
        }
        pos.x += this.mVel.x * dt;
        pos.y += this.mVel.y * dt;
        this.GetOwner().SetPos(pos);
        this.GetOwner().SetRot(new CVec3(0, 0, this.mTime * 3));
        if (pos.y < -430)
            this.GetOwner().Destroy();
    }
}
