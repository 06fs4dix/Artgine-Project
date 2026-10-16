import { CBehavior } from "../../../Artgine/artgine/app/component/CBehavior.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CPaint2D } from "../../../Artgine/artgine/app/component/paint/CPaint2D.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CTexture } from "../../../Artgine/artgine/render/CTexture.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CAlpha } from "../../../Artgine/artgine/render/CAlpha.js";
import { CFx } from "./CFx.js";
import { CLoaderOption } from "../../../Artgine/artgine/util/CLoader.js";
export class CBackGround extends CSubject {
    mBgPt = null;
    mBgOffset = 0;
    mPlanetTimer = 10000;
    mSpawnCount = 0;
    mMaxSpawn = 2;
    static sPlanetPaths = [
        "Res/giants/star_blue_giant01.png", "Res/giants/star_blue_giant02.png",
        "Res/giants/star_blue_giant03.png", "Res/giants/star_blue_giant04.png",
        "Res/giants/star_red_giant01.png", "Res/giants/star_red_giant02.png",
        "Res/giants/star_red_giant03.png", "Res/giants/star_red_giant04.png",
        "Res/giants/star_white_giant01.png", "Res/giants/star_white_giant02.png",
        "Res/giants/star_white_giant03.png", "Res/giants/star_white_giant04.png",
    ];
    mStars = [];
    mStarSpeed = [];
    Start() {
        this.SetPos(new CVec3(0, 0, -1));
        this.GetFrame().Load().Exe("Res/bg.png", new CLoaderOption().Set("mWrap", CTexture.eWrap.Mirrored));
        this.mBgPt = this.PushComp(new CPaint2D("Res/bg.png", new CVec2(600, 800)));
        let noneTex = CFx.WhiteTex();
        for (let i = 0; i < 60; i++) {
            let near = i < 18;
            let star = this.PushChild(new CSubject());
            let len = near ? 10 + Math.random() * 14 : 2 + Math.random() * 2;
            let pt = star.PushComp(new CPaint2D(noneTex, new CVec2(2, len)));
            let b = 0.5 + Math.random() * 0.5;
            pt.SetColorModel(new CColor(b * 0.8, b * 0.9, b, CColor.eModel.RGBMul));
            pt.SetAlphaModel(new CAlpha(near ? 0.55 : 0.35 + Math.random() * 0.4));
            if (near)
                CFx.Bloom(pt, 0.5);
            star.SetPos(new CVec3(Math.random() * 600 - 300, Math.random() * 800 - 400, 0.1));
            this.mStars.push(star);
            this.mStarSpeed.push(near ? 420 + Math.random() * 260 : 30 + Math.random() * 70);
        }
    }
    Update(_update) {
        this.mBgOffset += _update.DeltaTime() * 0.015;
        this.mBgPt.SetTexCodi(new CVec4(1, 1, 0, this.mBgOffset));
        let dt = _update.DeltaTime();
        for (let i = 0; i < this.mStars.length; i++) {
            let p = this.mStars[i].GetPos().Export();
            p.y -= this.mStarSpeed[i] * dt;
            if (p.y < -420) {
                p.y = 420;
                p.x = Math.random() * 600 - 300;
            }
            this.mStars[i].SetPos(p);
        }
        if (this.mSpawnCount < this.mMaxSpawn) {
            this.mPlanetTimer -= _update.DeltaMil();
            if (this.mPlanetTimer <= 0) {
                this.SpawnRandomPlanet();
                this.mSpawnCount++;
                this.mPlanetTimer = 60000 + Math.random() * 120000;
            }
        }
    }
    SpawnRandomPlanet() {
        let planet = this.PushChild(new CSubject());
        let idx = Math.floor(Math.random() * CBackGround.sPlanetPaths.length);
        let pt = planet.PushComp(new CPaint2D(CBackGround.sPlanetPaths[idx]));
        let scale = 0.05 + Math.random() * 0.35;
        planet.SetSca(new CVec3(scale, scale, scale));
        let x = Math.random() * 500 - 250;
        planet.SetPos(new CVec3(x, 480, 0.4));
        let speed = 15 + Math.random() * 25;
        let rb = planet.PushComp(new CRigidBody());
        rb.Push(new CForce("move", new CVec3(0, -1), speed));
        let cl = planet.PushComp(new CCollider(pt));
        cl.SetCameraOut(true);
        let bv = planet.PushComp(new CBehavior());
        bv.CameraOut = (_pArr) => {
            if (_pArr.length > 0 && _pArr[0].mLen > 5)
                planet.Destroy();
        };
    }
}
