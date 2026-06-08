import { CCanvas } from "https://06fs4dix.github.io/Artgine/artgine/app/canvas/CCanvas.js";
import { CSubject } from "https://06fs4dix.github.io/Artgine/artgine/app/subject/CSubject.js";
import { CUpdate } from "https://06fs4dix.github.io/Artgine/artgine/basic/Basic.js";
import { CBlackBoardRef } from "https://06fs4dix.github.io/Artgine/artgine/basic/CObject.js";
import { CVec3 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec3.js";
import { CPacShooting } from "./CPacShooting.js";

// type 인코딩: level * 10 + movePattern(0~3)
export class RoomSystem extends CSubject {
    mMon = new CBlackBoardRef<CSubject>("Monster");
    mMain = new CBlackBoardRef<CCanvas>("Main");

    mPTime = 0;
    mPType = 0;
    mTime = 0;
    mState = 0;
    mCCount = 0;
    mMonKey = 0;
    mLevel = 1;
    mLTime = 10;

    override Start() { }

    Spawn(_x: number, _y: number, _moveType: number) {
        let key = this.mMonKey + "mon";
        this.mMonKey++;
        this.PushPacket(CPacShooting.MonCreate(key, new CVec3(_x, _y), this.mLevel * 10 + _moveType));
    }

    override Update(_update: CUpdate): void {
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

        // 패턴 0: 대기 후 랜덤 패턴 선택
        if (this.mPType == 0) {
            if (this.mPTime > 2) {
                ResetFun();
                this.mPType = Math.trunc(Math.random() * 4 + 1); // 1~4
            }
        }

        // 패턴 1: 가로 라인 (직선/지그재그 혼합)
        else if (this.mPType == 1) {
            if (this.mTime <= 0) {
                let ran = Math.trunc(Math.random() * 16 - 10);
                for (let i = -9; i <= 9; ++i) {
                    if (i >= ran && i <= ran + 3) continue;
                    let moveType = (i % 2 === 0) ? 0 : 1; // 홀짝 교대로 직선/지그재그
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

        // 패턴 2: 3기 소대 연속 (고속)
        else if (this.mPType == 2) {
            if (this.mTime <= 0) {
                if (this.mState == -1)
                    this.mState = Math.trunc(Math.random() * 19 - 10);

                for (let i = 0; i < 3; ++i) {
                    this.Spawn((this.mState + i) * 32, 500, 2); // 고속 타입
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

        // 패턴 3: V자 편대 (중앙+날개, 넓은 지그재그)
        else if (this.mPType == 3) {
            if (this.mTime <= 0) {
                // V 형태: 중앙 → 바깥쪽으로 Y 오프셋 추가
                const arms = [0, -2, 2, -4, 4, -6, 6];
                for (let i = 0; i < arms.length; i++) {
                    const xOff = arms[i] * 32;
                    const yOff = Math.abs(arms[i]) * 18;
                    this.Spawn(xOff, 500 - yOff, 3); // 넓은 지그재그
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

        // 패턴 4: 양측 컬럼 (좌우에서 동시 밀려옴, 지그재그)
        else if (this.mPType == 4) {
            if (this.mTime <= 0) {
                this.Spawn(-250, 500, 1); // 지그재그
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
