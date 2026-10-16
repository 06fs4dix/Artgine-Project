import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CCamCon } from "../../../Artgine/artgine/util/CCamCon.js";
export class CForgeCamCon extends CCamCon {
    mTarget = new CVec3(6400, 300, 6400);
    mYaw = 0.6;
    mPitch = 0.62;
    mDist = 5200;
    mMinDist = 600;
    mMaxDist = 14000;
    mMinPitch = 0.12;
    mMaxPitch = 1.35;
    mBoundMin = 0;
    mBoundMax = 12800;
    mGroundY = null;
    mCurTarget = null;
    mCurYaw = 0;
    mCurPitch = 0;
    mCurDist = 0;
    constructor(_input) {
        super(_input);
        this.mRotKey = CInput.eKey.LButton;
        this.mPosKey = CInput.eKey.RButton;
    }
    Look(_target, _yaw, _pitch, _dist, _snap = false) {
        this.mTarget = _target.Export();
        this.mYaw = _yaw;
        this.mPitch = _pitch;
        this.mDist = _dist;
        if (_snap)
            this.mCurTarget = null;
    }
    Update(_update) {
        super.Update(_update);
        if (this.mCamera == null || this.mPause)
            return;
        const dt = Math.min(Math.max(_update.DeltaTime(), 1 / 240), 1 / 10);
        this.mYaw -= this.mRotY * 0.005 * this.mRotSensitivity;
        this.mPitch = Math.min(this.mMaxPitch, Math.max(this.mMinPitch, this.mPitch - this.mRotX * 0.004 * this.mRotSensitivity));
        if (this.mZoom != 0)
            this.mDist = Math.min(this.mMaxDist, Math.max(this.mMinDist, this.mDist * Math.exp(-this.mZoom * 0.006 * this.mZoomSensitivity)));
        if (this.mPosX != 0 || this.mPosY != 0) {
            const k = this.mDist * 0.0016 * this.mPosSensitivity;
            const fx = -Math.sin(this.mYaw), fz = -Math.cos(this.mYaw);
            const f = -this.mPosX * k, r = this.mPosY * k;
            this.mTarget.x = Math.min(this.mBoundMax, Math.max(this.mBoundMin, this.mTarget.x + fx * f - fz * r));
            this.mTarget.z = Math.min(this.mBoundMax, Math.max(this.mBoundMin, this.mTarget.z + fz * f + fx * r));
        }
        if (this.mGroundY != null)
            this.mTarget.y = this.mGroundY(this.mTarget.x, this.mTarget.z);
        if (this.mCurTarget == null) {
            this.mCurTarget = this.mTarget.Export();
            this.mCurYaw = this.mYaw;
            this.mCurPitch = this.mPitch;
            this.mCurDist = this.mDist;
        }
        const a = 1 - Math.pow(0.5, dt / 0.06);
        this.mCurTarget.x += (this.mTarget.x - this.mCurTarget.x) * a;
        this.mCurTarget.y += (this.mTarget.y - this.mCurTarget.y) * a;
        this.mCurTarget.z += (this.mTarget.z - this.mCurTarget.z) * a;
        this.mCurYaw += (this.mYaw - this.mCurYaw) * a;
        this.mCurPitch += (this.mPitch - this.mCurPitch) * a;
        this.mCurDist += (this.mDist - this.mCurDist) * a;
        const cp = Math.cos(this.mCurPitch), sp = Math.sin(this.mCurPitch);
        const eye = new CVec3(this.mCurTarget.x + Math.sin(this.mCurYaw) * cp * this.mCurDist, this.mCurTarget.y + sp * this.mCurDist, this.mCurTarget.z + Math.cos(this.mCurYaw) * cp * this.mCurDist);
        if (this.mGroundY != null)
            eye.y = Math.max(eye.y, this.mGroundY(eye.x, eye.z) + 150);
        this.mCamera.Init(eye, this.mCurTarget.Export());
    }
}
