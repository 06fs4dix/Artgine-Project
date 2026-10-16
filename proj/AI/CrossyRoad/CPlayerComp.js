import { CBehavior } from "../../../Artgine/artgine/app/component/CBehavior.js";
import { V3, TILE, COL_MAX } from "./CVoxelModel.js";
const HOP_TIME = 0.13;
export class CPlayerComp extends CBehavior {
    mHost = null;
    mBody = null;
    mHopAF = null;
    mBumpAF = null;
    mRow = 0;
    mX = 0;
    mDead = false;
    mFreeze = false;
    mHopping = false;
    mHopT = 0;
    mFromX = 0;
    mToX = 0;
    mFromRow = 0;
    mToRow = 0;
    mRideSpace = false;
    mQueue = null;
    mRide = null;
    mRideOff = 0;
    RowF() {
        if (!this.mHopping)
            return this.mRow;
        return this.mFromRow + (this.mToRow - this.mFromRow) * this.mHopT;
    }
    TryMove(_dc, _dr) {
        if (this.mDead || this.mFreeze)
            return;
        if (this.mHopping) {
            this.mQueue = [_dc, _dr];
            return;
        }
        this.StartHop(_dc, _dr);
    }
    Face(_dc, _dr) {
        let rot = 0;
        if (_dr < 0)
            rot = Math.PI;
        else if (_dc < 0)
            rot = Math.PI * 0.5;
        else if (_dc > 0)
            rot = -Math.PI * 0.5;
        this.mBody.SetRot(V3(0, rot, 0));
    }
    StartHop(_dc, _dr) {
        this.Face(_dc, _dr);
        const riding = this.mRide != null && _dr == 0;
        let targetX = _dr != 0 ? Math.round(this.mX / TILE) * TILE + _dc * TILE : this.mX + _dc * TILE;
        if (riding)
            targetX = this.mRide.x + this.mRideOff + _dc * TILE;
        if (!this.mHost.CanMove(this.mRow + _dr, targetX)) {
            this.mBumpAF.ResetTime();
            return;
        }
        this.mRideSpace = riding;
        if (riding) {
            this.mFromX = this.mRideOff;
            this.mToX = this.mRideOff + _dc * TILE;
        }
        else {
            this.mRide = null;
            this.mFromX = this.mX;
            this.mToX = targetX;
        }
        this.mFromRow = this.mRow;
        this.mToRow = this.mRow + _dr;
        this.mHopT = 0;
        this.mHopping = true;
        this.mHopAF.ResetTime();
        this.mHost.OnHop();
    }
    Update(_update) {
        super.Update(_update);
        if (this.mDead || this.GetOwner().IsDestroy())
            return;
        const dt = _update.DeltaTime();
        if (this.mHopping) {
            this.mHopT = Math.min(1, this.mHopT + dt / HOP_TIME);
            const x = this.mFromX + (this.mToX - this.mFromX) * this.mHopT;
            if (this.mRideSpace) {
                this.mRideOff = x;
                this.mX = this.mRide.x + x;
            }
            else
                this.mX = x;
            if (this.mHopT >= 1) {
                this.mHopping = false;
                this.mRow = this.mToRow;
                this.mHost.OnLand(this);
                if (!this.mDead && this.mQueue != null) {
                    const q = this.mQueue;
                    this.mQueue = null;
                    this.StartHop(q[0], q[1]);
                }
            }
        }
        else if (this.mRide != null) {
            this.mX = this.mRide.x + this.mRideOff;
        }
        this.GetOwner().SetPos(V3(this.mX, 0, -this.RowF() * TILE));
        if (!this.mDead && this.mRide != null && Math.abs(this.mX) > (COL_MAX + 1.8) * TILE)
            this.mHost.Die("edge");
    }
    Trigger(_org, _size, _tar) {
        super.Trigger(_org, _size, _tar);
        if (this.mDead || this.GetOwner().IsDestroy())
            return;
        for (let i = 0; i < _size; ++i) {
            const layer = _tar[i].GetLayer();
            if (layer == "car" || layer == "train") {
                this.mHost.Die(layer);
                return;
            }
        }
    }
}
