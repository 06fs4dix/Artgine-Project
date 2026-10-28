import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CComponent } from "../../../Artgine/artgine/app/component/CComponent.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
import { CDayCycle, CLightPlanet } from "../../../Artgine/artgine/app/component/CLightPlanet.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
export class CForgeDayNight extends CComponent {
    mHour = 13.5;
    mDaySec = 480;
    mPause = true;
    mLatitude = 47.55;
    mDeclination = 20;
    mMoonDeclination = -12;
    mMoonLag = 1.2;
    mCanvas;
    mAmbient;
    mSun = null;
    mMoon = null;
    mSunSub = null;
    mMoonSub = null;
    mMoonColor = new CVec3(0.050, 0.047, 0.040);
    mMoonBright = 1;
    constructor(_canvas, _ambient) {
        super();
        this.mCanvas = _canvas;
        this.mAmbient = _ambient;
    }
    IsShould(_member, _type) {
        if (_member == "mCanvas" || _member == "mSun" || _member == "mMoon" || _member == "mSunSub" || _member == "mMoonSub")
            return false;
        return super.IsShould(_member, _type);
    }
    Start() {
        super.Start();
        this.mSunSub = this.mCanvas.PushSub(new CSubject());
        this.mSunSub.SetKey("sun");
        this.mSun = this.mSunSub.PushComp(new CLightPlanet());
        this.mSun.SetGeometric();
        this.mSun.SetShadow3D("shadow", 0.001, 0.001, 0.033);
        this.mSun.SetCascadeTexelThreshold(12);
        this.mSun.SetShadowDistance(20000);
        this.mSun.mCascadeDivide = [1500, 5000, 16000];
        for (let h = 0; h < 24; h += 0.25) {
            const dir = this.SunDir(h);
            this.mSun.Push(new CDayCycle(dir, CDayCycle.SunColor(Math.asin(dir.y) * 180 / Math.PI)));
        }
        this.mMoonSub = this.mCanvas.PushSub(new CSubject());
        this.mMoonSub.SetKey("moon");
        this.mMoon = this.mMoonSub.PushComp(new CLight());
        this.mMoon.SetDirect(-2);
        this.Apply();
    }
    Update(_update) {
        super.Update(_update);
        if (!this.mPause && this.mDaySec > 0) {
            this.mHour += _update.DeltaTime() * 24 / this.mDaySec;
            if (this.mHour >= 24)
                this.mHour -= 24;
        }
        this.Apply();
    }
    SetHour(_hour) {
        this.mHour = ((_hour % 24) + 24) % 24;
        this.Apply();
    }
    Dir(_hourAngle, _dec) {
        const lat = this.mLatitude * Math.PI / 180, dec = _dec * Math.PI / 180;
        const east = -Math.cos(dec) * Math.sin(_hourAngle);
        const north = Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(_hourAngle);
        const up = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(_hourAngle);
        return new CVec3(east, up, -north);
    }
    SunDir(_hour) { return this.Dir((_hour - 12) * Math.PI / 12, this.mDeclination); }
    MoonDir(_hour) { return this.Dir((_hour - 12 - 12 + this.mMoonLag) * Math.PI / 12, this.mMoonDeclination); }
    Apply() {
        if (this.mSunSub == null)
            return;
        const sunDir = this.SunDir(this.mHour);
        this.mSunSub.SetPos(sunDir);
        const moonDir = this.MoonDir(this.mHour);
        this.mMoonSub.SetPos(moonDir);
        const moonUp = Math.min(1, Math.max(0, (moonDir.y + 0.02) / 0.15));
        const night = 1 - Math.min(1, Math.max(0, (sunDir.y + 0.05) / 0.2));
        const mk = moonUp * (0.25 + 0.75 * night);
        const moonCol = new CVec3(this.mMoonColor.x * mk * this.mMoonBright, this.mMoonColor.y * mk * this.mMoonBright, this.mMoonColor.z * mk * this.mMoonBright);
        this.mMoon.SetColor(moonCol);
        const sun = CDayCycle.SunColor(Math.asin(Math.max(-1, Math.min(1, sunDir.y))) * 180 / Math.PI);
        this.mAmbient.x = sun.x * 0.28 + moonCol.x * 0.6 + 0.003;
        this.mAmbient.y = sun.y * 0.34 + moonCol.y * 0.6 + 0.004;
        this.mAmbient.z = sun.z * 0.46 + moonCol.z * 0.6 + 0.009;
    }
    NightRate() { return 1 - Math.min(1, Math.max(0, (this.SunDir(this.mHour).y + 0.05) / 0.2)); }
    IsNight() { return this.SunDir(this.mHour).y < -0.05; }
}
