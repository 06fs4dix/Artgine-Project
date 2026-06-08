import { CSubject } from "https://06fs4dix.github.io/Artgine/artgine/app/subject/CSubject.js";
import { CBlackBoardRef } from "https://06fs4dix.github.io/Artgine/artgine/basic/CObject.js";
import { CVec3 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec3.js";
import { CPacShooting } from "./CPacShooting.js";
export class RoomSystem extends CSubject {
    mMon = new CBlackBoardRef("Monster");
    mMain = new CBlackBoardRef("Main");
    mPTime = 0;
    mPType = 0;
    mTime = 0;
    mState = 0;
    mCCount = 0;
    mMonKey = 0;
    mLevel = 1;
    mLTime = 10;
    Start() { }
    Spawn(_x, _y, _moveType) {
        let key = this.mMonKey + "mon";
        this.mMonKey++;
        this.PushPacket(CPacShooting.MonCreate(key, new CVec3(_x, _y), this.mLevel * 10 + _moveType));
    }
    Update(_update) {
        let ResetFun = () => {
            this.mTime = 0;
            this.mState = -1;
            this.mPTime = 0;
            this.mCCount = 0;
        };
        this.mLTime += _update.DeltaTime();
        this.mPTime += _update.DeltaTime();
        if (this.mLTime > 10) {
            this.mLevel += 1;
            this.mLTime = 0;
        }
        if (this.mPType == 0) {
            if (this.mPTime > 2) {
                ResetFun();
                this.mPType = Math.trunc(Math.random() * 4 + 1);
            }
        }
        else if (this.mPType == 1) {
            if (this.mTime <= 0) {
                let ran = Math.trunc(Math.random() * 16 - 10);
                for (let i = -9; i <= 9; ++i) {
                    if (i >= ran && i <= ran + 3)
                        continue;
                    let moveType = (i % 2 === 0) ? 0 : 1;
                    this.Spawn(i * 32, 500, moveType);
                }
                this.mTime = 2;
            }
            if (this.mPTime > 10) {
                ResetFun();
                this.mPType = 0;
            }
            this.mTime -= _update.DeltaTime();
        }
        else if (this.mPType == 2) {
            if (this.mTime <= 0) {
                if (this.mState == -1)
                    this.mState = Math.trunc(Math.random() * 19 - 10);
                for (let i = 0; i < 3; ++i) {
                    this.Spawn((this.mState + i) * 32, 500, 2);
                }
                this.mTime = 0.5;
                this.mCCount++;
                if (this.mCCount >= 3) {
                    this.mState = -1;
                    this.mCCount = 0;
                }
            }
            if (this.mPTime > 10) {
                ResetFun();
                this.mPType = 0;
            }
            this.mTime -= _update.DeltaTime();
        }
        else if (this.mPType == 3) {
            if (this.mTime <= 0) {
                const arms = [0, -2, 2, -4, 4, -6, 6];
                for (let i = 0; i < arms.length; i++) {
                    const xOff = arms[i] * 32;
                    const yOff = Math.abs(arms[i]) * 18;
                    this.Spawn(xOff, 500 - yOff, 3);
                }
                this.mTime = 3.5;
                this.mCCount++;
                if (this.mCCount >= 3) {
                    ResetFun();
                    this.mPType = 0;
                }
            }
            if (this.mPTime > 14) {
                ResetFun();
                this.mPType = 0;
            }
            this.mTime -= _update.DeltaTime();
        }
        else if (this.mPType == 4) {
            if (this.mTime <= 0) {
                this.Spawn(-250, 500, 1);
                this.Spawn(250, 500, 1);
                this.mTime = 0.35;
                this.mCCount++;
                if (this.mCCount >= 10) {
                    ResetFun();
                    this.mPType = 0;
                }
            }
            if (this.mPTime > 12) {
                ResetFun();
                this.mPType = 0;
            }
            this.mTime -= _update.DeltaTime();
        }
    }
}
