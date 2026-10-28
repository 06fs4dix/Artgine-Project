import { CCamera } from "../../../Artgine/artgine/render/CCamera.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CBound } from "../../../Artgine/artgine/geometry/CBound.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CCIndex } from "../../../Artgine/artgine/app/canvas/CCIndex.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CInput } from "../../../Artgine/artgine/system/CInput.js";
import { CPreferences } from "../../../Artgine/artgine/basic/CPreferences.js";
import { CMCWorld, MC_COLLIDER_LAYER, MC_SIZE } from "./CMCWorld.js";
import { CMCHud } from "./CMCHud.js";
import { CMCTouch } from "./CMCTouch.js";
import { MC_BLOCK, MC_SOUND_KIND } from "./CMCBlock.js";
import { CMCBag, MC_HOTBAR_COUNT } from "./CMCBag.js";
import { CMCFx } from "./CMCFx.js";
import { CMCDrop } from "./CMCDrop.js";
import { CMCFurnaceMgr } from "./CMCFurnace.js";
import { IMCStack, MCDropOf, MCItem, MCMineInfo } from "./CMCItem.js";
import { CMCHand } from "./CMCHand.js";
import { CMCSound } from "./CMCSound.js";

const HALF_W = 30;
const BODY_H = 180;
const EYE_H = 162;
const JUMP_SPEED = 1500;
const JUMP_TIME = 0.4;
const WALK_SPEED = 430;
const SPRINT_SPEED = 560;
const FLY_SPEED = 1000;
const REACH = 500;
const ACT_DELAY = 0.22;
const BREAK_DELAY = 0.2;
const BASE_FOV = 1.5;
const STEP_DIST = 190;
const WARM_FRAME = 10;

const NUM_KEY = [
    CInput.eKey.Num1, CInput.eKey.Num2, CInput.eKey.Num3, CInput.eKey.Num4, CInput.eKey.Num5,
    CInput.eKey.Num6, CInput.eKey.Num7, CInput.eKey.Num8, CInput.eKey.Num9,
];

export class CMCPlayer
{
    mWorld: CMCWorld;
    mCam: CCamera;
    mHud: CMCHud;
    mFx: CMCFx;
    mHand: CMCHand;
    mSnd: CMCSound;
    mBag: CMCBag;
    mDrop: CMCDrop;
    mFurnace = new CMCFurnaceMgr();
    mBody: CSubject;
    mRB: CRigidBody;
    mInput: CInput;
    mPF: CPreferences;
    mHandle: HTMLElement;

    mYaw = Math.PI;
    mPitch = 0;
    mFly = false;
    mInWater = false;
    mSlot = 0;
    mLocked = false;
    mActCd = 0;
    mInfoCd = 0;
    mSelKey = "";
    mMine = 0;
    mHitCd = 0;
    mSwingCd = 0;
    mStepDist = 0;
    mLastX = 0;
    mLastZ = 0;
    mFov = BASE_FOV;
    mTouch: CMCTouch = null;
    mWarm = 0;

    constructor(_world: CMCWorld, _cam: CCamera, _fx: CMCFx, _hand: CMCHand, _snd: CMCSound, _bag: CMCBag, _body: CSubject, _input: CInput, _pf: CPreferences, _handle: HTMLElement, _touch: CMCTouch = null)
    {
        this.mTouch = _touch;
        this.mWorld = _world;
        this.mCam = _cam;
        this.mFx = _fx;
        this.mHand = _hand;
        this.mSnd = _snd;
        this.mBag = _bag;
        this.mDrop = new CMCDrop(_fx.mFrame, _fx.mCanvas, _world);
        this.mBag.mOnDrop = (_s: IMCStack) => this.DropAtPlayer(_s);
        this.mBody = _body;
        this.mInput = _input;
        this.mPF = _pf;
        this.mHandle = _handle;

        const bound = new CBound();
        bound.SetType(CBound.eType.Box);
        bound.mMin.x = -HALF_W; bound.mMin.y = 0; bound.mMin.z = -HALF_W;
        bound.mMax.x = HALF_W; bound.mMax.y = BODY_H; bound.mMax.z = HALF_W;
        const cl = this.mBody.PushComp(new CCollider());
        cl.InitBound(bound);
        cl.SetLayer("player");
        cl.PushCollisionLayer(MC_COLLIDER_LAYER);
        cl.SetPushRate(1);
        this.mRB = this.mBody.PushComp(new CRigidBody());
        this.mRB.SetGravity(1);

        this.mHud = new CMCHud(() =>
        {
            this.mSnd.Unlock();
            if (this.mTouch != null)
            {
                this.StartTouch();
                return;
            }
            this.mHandle.focus();
            this.mHandle.requestPointerLock();
        }, Array.from({ length: MC_HOTBAR_COUNT }, (_v, i) => this.mBag.Hotbar(i)));
        if (this.mTouch != null)
        {
            this.mHud.SetTouch((_slot: number) => this.SetSlot(_slot));
            this.mTouch.mLayoutCb = (_u: number, _w: number, _h: number) => this.mHud.Layout(_u, _w, _h);
            this.mTouch.Layout();
        }
        this.mBag.mOnChange = () =>
        {
            for (let i = 0; i < MC_HOTBAR_COUNT; ++i) this.mHud.SetItem(i, this.mBag.Hotbar(i));
        };
        this.mBag.mOnClose = () =>
        {
            this.ReleaseMouse();
            this.mHud.SetLocked(this.mLocked || this.mBag.IsOpen());
            if (this.mTouch == null)
            {
                this.mHandle.focus();
                this.mHandle.requestPointerLock();
            }
        };
        document.addEventListener("keydown", (_e: KeyboardEvent) =>
        {
            if (_e.code == "Escape" && this.mBag.IsOpen())
            {
                this.mBag.Close();
                return;
            }
            if (_e.code != "KeyE" || _e.repeat) return;
            _e.preventDefault();
            this.ToggleBag();
        });
        this.Respawn();

        document.addEventListener("pointerlockchange", () =>
        {
            this.mLocked = document.pointerLockElement == this.mHandle;
            this.mHud.SetLocked(this.mLocked || this.mBag.IsOpen());
            if (this.mLocked) this.mHandle.focus();
        });
        document.addEventListener("mousemove", (_e: MouseEvent) =>
        {
            if (!this.mLocked || document.pointerLockElement != this.mHandle) return;
            this.mYaw -= _e.movementX * 0.0025;
            this.mPitch -= _e.movementY * 0.0025;
            this.mPitch = Math.max(-1.55, Math.min(1.55, this.mPitch));
        });
        document.addEventListener("contextmenu", (_e: Event) => _e.preventDefault());
    }

    //아이템창이 열려 있으면 이동, 시점, 파괴/설치 입력을 받지 않는다
    private Active(): boolean
    {
        return this.mLocked && !this.mBag.IsOpen();
    }

    private ToggleBag()
    {
        if (this.mBag.IsOpen())
        {
            this.mBag.Close();
            return;
        }
        if (!this.mLocked) return;
        this.mHud.SetLocked(true);
        this.mBag.OpenInventory();
        if (this.mTouch == null) document.exitPointerLock();
    }

    //엔진은 마우스 버튼 뗌을 캔버스에서만 받는다. 창이 열린 채로 떼면 눌린 상태로 남아 창이 닫히자마자 다시 열린다
    private ReleaseMouse()
    {
        this.mInput.mKeyPress[CInput.eKey.LButton] = false;
        this.mInput.mKeyPress[CInput.eKey.RButton] = false;
    }

    private OpenStation(_id: number, _hit: CCIndex)
    {
        this.ReleaseMouse();
        this.mHud.SetLocked(true);
        if (_id == MC_BLOCK.Furnace)
        {
            const c = this.mWorld.mBuf.mCount;
            this.mBag.OpenFurnace(this.mFurnace.Get(_hit.x + _hit.y * c.x + _hit.z * c.x * c.y));
        }
        else this.mBag.OpenTable();
        if (this.mTouch == null) document.exitPointerLock();
    }

    private DropAtPlayer(_s: IMCStack)
    {
        const p = this.mBody.GetPos();
        this.mDrop.Spawn(_s.id, _s.n, _s.d, p.x + Math.sin(this.mYaw) * 90, p.y + 110, p.z + Math.cos(this.mYaw) * 90, 1.5);
    }

    private OnBroken(_id: number, _hit: CCIndex, _harvest: boolean, _held: IMCStack)
    {
        const S = MC_SIZE;
        const x = (_hit.x + 0.5) * S, y = _hit.y * S + 20, z = (_hit.z + 0.5) * S;
        if (_id == MC_BLOCK.Furnace)
        {
            const c = this.mWorld.mBuf.mCount;
            const f = this.mFurnace.Remove(_hit.x + _hit.y * c.x + _hit.z * c.x * c.y);
            if (f != null)
                for (const s of [f.mIn, f.mFuel, f.mOut])
                    if (s != null) this.mDrop.Spawn(s.id, s.n, s.d, x, y, z);
        }
        if (_harvest)
        {
            const drop = MCDropOf(_id);
            if (drop != 0) this.mDrop.Spawn(drop, 1, 0, x, y, z);
        }
        const it = _held == null ? null : MCItem(_held.id);
        if (it != null && it.tool != "") this.mBag.Damage(this.mSlot, it.tool == "sword" ? 2 : 1);
    }

    private StartTouch()
    {
        const el = document.documentElement as any;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
        const ori = screen.orientation as any;
        if (ori != null && ori.lock) ori.lock("landscape").catch(() => { });
        this.mLocked = true;
        this.mHud.SetLocked(true);
    }

    Respawn()
    {
        this.mBody.SetPos(this.mWorld.FindSpawn());
        this.mRB.Remove("j");
    }

    private SetSlot(_slot: number)
    {
        const n = MC_HOTBAR_COUNT;
        this.mSlot = ((_slot % n) + n) % n;
        this.mHud.SetSlot(this.mSlot);
    }

    private SetGravity(_on: boolean)
    {
        if (_on)
        {
            if (this.mRB.GetGravity() == 0) this.mRB.SetGravity(1);
            return;
        }
        if (this.mRB.GetGravity() == 0) return;
        this.mRB.SetGravity(0);
        this.mRB.Remove("g");
        this.mRB.mForceGravity = null;
    }

    private Control()
    {
        const inp = this.mInput;
        const S = MC_SIZE;
        const pos = this.mBody.GetPos();
        this.mInWater = this.mWorld.GetBlock(Math.floor(pos.x / S), Math.floor((pos.y + 60) / S), Math.floor(pos.z / S)) == MC_BLOCK.Water;

        let mx = 0, mz = 0, up = 0, jump = false;
        if (this.Active())
        {
            const t = this.mTouch;
            let f = (inp.KeyDown(CInput.eKey.W) ? 1 : 0) - (inp.KeyDown(CInput.eKey.S) ? 1 : 0);
            let r = (inp.KeyDown(CInput.eKey.D) ? 1 : 0) - (inp.KeyDown(CInput.eKey.A) ? 1 : 0);
            if (t != null)
            {
                f += t.mMoveY;
                r += t.mMoveX;
            }
            const sy = Math.sin(this.mYaw), cy = Math.cos(this.mYaw);
            mx = sy * f - cy * r;
            mz = cy * f + sy * r;
            const len = Math.hypot(mx, mz);
            if (len > 1) { mx /= len; mz /= len; }
            jump = inp.KeyDown(CInput.eKey.Space) || (t != null && t.mJump);
            up = (jump ? 1 : 0) - (inp.KeyDown(CInput.eKey.Shift) && this.mFly ? 1 : 0);

            if (inp.KeyDown(CInput.eKey.F, true) || (t != null && t.TakeFly())) this.mFly = !this.mFly;
            if (t != null && t.TakeBag()) this.ToggleBag();
            for (let i = 0; i < NUM_KEY.length; ++i)
                if (inp.KeyDown(NUM_KEY[i], true)) this.SetSlot(i);
            if (inp.KeyDown(CInput.eKey.Wheel)) this.SetSlot(this.mSlot + (inp.Wheel() > 0 ? 1 : -1));
        }

        this.SetGravity(!this.mFly && !this.mInWater);

        let speed = this.mFly ? FLY_SPEED : (this.Active() && inp.KeyDown(CInput.eKey.Shift) ? SPRINT_SPEED : WALK_SPEED);
        if (this.mInWater && !this.mFly) speed *= 0.6;
        const vy = this.mFly ? up : 0;
        const dir = new CVec3(mx, vy, mz);
        const len = Math.hypot(mx, vy, mz);
        if (len > 0)
        {
            dir.x /= len; dir.y /= len; dir.z /= len;
            this.mRB.Push(new CForce("move", dir, speed));
        }
        else this.mRB.Remove("move");

        if (this.mInWater && !this.mFly)
            this.mRB.Push(new CForce("swim", CVec3.Up(), up > 0 ? 320 : -120));
        else
            this.mRB.Remove("swim");

        if (jump && !this.mFly && !this.mInWater && this.mRB.IsGround() && this.mRB.Find("j") == null)
        {
            const j = new CForce("j", CVec3.Up(), JUMP_SPEED);
            j.SetDirVel(CVec3.Up(), JUMP_SPEED, CVec3.Up(), 0);
            j.SetDelay(JUMP_TIME);
            j.SetRemove(true);
            this.mRB.Push(j);
        }

        if (pos.y < -2000) this.Respawn();
    }

    private Overlap(_x: number, _y: number, _z: number): boolean
    {
        const S = MC_SIZE;
        const p = this.mBody.GetPos();
        return p.x + HALF_W > _x * S && p.x - HALF_W < (_x + 1) * S &&
            p.y + BODY_H > _y * S && p.y < (_y + 1) * S &&
            p.z + HALF_W > _z * S && p.z - HALF_W < (_z + 1) * S;
    }

    private Interact(_dt: number, _ex: number, _ey: number, _ez: number)
    {
        let hit: CCIndex = null;
        let pick = null;
        let torch: { off: number, dist: number } = null;
        if (this.Active())
        {
            const ray = this.mCam.GetRay(this.mPF.mWidth * 0.5, this.mPF.mHeight * 0.5);
            let blockDist = Infinity;
            pick = this.mWorld.PickBox(ray);
            if (pick.pick != CCIndex.eDir.Null)
            {
                const p = ray.GetPosition();
                const d = Math.hypot(p.x - _ex, p.y - _ey, p.z - _ez);
                if (d <= REACH && this.mWorld.GetBlock(pick.x, pick.y, pick.z) != MC_BLOCK.Water)
                {
                    hit = new CCIndex(pick.x, pick.y, pick.z);
                    blockDist = d;
                }
            }
            torch = this.mWorld.PickTorch(ray, _ex, _ey, _ez, REACH);
            if (torch != null && torch.dist < blockDist) hit = null;
            else torch = null;
        }

        const key = hit == null ? "" : hit.x + "," + hit.y + "," + hit.z;
        if (key != this.mSelKey)
        {
            this.mSelKey = key;
            this.mMine = 0;
            this.mFx.SetCrack(-1);
            if (hit == null) this.mFx.HideTarget();
            else this.mFx.ShowTarget(hit.x, hit.y, hit.z);
        }

        this.mActCd -= _dt;
        this.mHitCd -= _dt;
        this.mSwingCd -= _dt;

        //터치 기기에서는 엔진이 손가락이 닿기만 해도 LButton을 켠다. 화면 버튼만 입력으로 쓴다
        const t = this.mTouch;
        const left = t != null ? t.mBreak : this.mInput.KeyDown(CInput.eKey.LButton);
        const right = t != null ? t.mPlace : this.mInput.KeyDown(CInput.eKey.RButton);

        if (left && hit == null && torch == null && this.mSwingCd <= 0)
        {
            this.mHand.Swing();
            this.mSwingCd = 0.3;
        }

        if (left && torch != null)
        {
            if (this.mActCd <= 0)
            {
                const c = this.mWorld.mBuf.mCount;
                this.mDrop.Spawn(MC_BLOCK.Torch, 1, 0, (torch.off % c.x + 0.5) * MC_SIZE, (Math.floor(torch.off / c.x) % c.y) * MC_SIZE + 20, (Math.floor(torch.off / (c.x * c.y)) + 0.5) * MC_SIZE);
                this.mWorld.RemoveTorch(torch.off);
                this.mHand.Swing();
                this.mSnd.Play("wood", "break");
                this.mActCd = ACT_DELAY;
            }
            return;
        }

        if (left && hit != null && hit.y > 0)
        {
            const id = this.mWorld.GetBlock(hit.x, hit.y, hit.z);
            const kind = MC_SOUND_KIND[id];
            if (this.mSwingCd <= 0)
            {
                this.mHand.Swing();
                this.mSwingCd = 0.3;
            }
            if (this.mActCd > 0) return;
            const held = this.mBag.Hotbar(this.mSlot);
            const info = MCMineInfo(id, held);
            this.mMine += _dt / info.time;
            if (this.mHitCd <= 0)
            {
                this.mSnd.Play(kind, "hit");
                this.mHitCd = 0.22;
            }
            if (this.mMine < 1)
            {
                this.mFx.SetCrack(Math.floor(this.mMine * 10));
                return;
            }
            this.mWorld.SetBlock(hit.x, hit.y, hit.z, MC_BLOCK.Air);
            this.mFx.Burst(id, hit.x, hit.y, hit.z);
            this.OnBroken(id, hit, info.harvest, held);
            this.mSnd.Play(kind, "break");
            this.mMine = 0;
            this.mFx.SetCrack(-1);
            this.mActCd = BREAK_DELAY;
            return;
        }

        this.mMine = 0;
        this.mFx.SetCrack(-1);

        if (right && hit != null && this.mActCd <= 0)
        {
            const target = this.mWorld.GetBlock(hit.x, hit.y, hit.z);
            if (target == MC_BLOCK.CraftingTable || target == MC_BLOCK.Furnace)
            {
                this.OpenStation(target, hit);
                this.mActCd = ACT_DELAY;
                return;
            }
            pick.PickMove();
            const stack = this.mBag.Hotbar(this.mSlot);
            const item = stack == null ? 0 : stack.id;
            const info = stack == null ? null : MCItem(item);
            let placed = false;
            if (info != null && info.block)
            {
                if (item == MC_BLOCK.Torch)
                {
                    placed = this.mWorld.PlaceTorch(pick.x, pick.y, pick.z, pick.x - hit.x, pick.y - hit.y, pick.z - hit.z);
                }
                else
                {
                    const cur = this.mWorld.GetBlock(pick.x, pick.y, pick.z);
                    if (this.mWorld.InRange(pick.x, pick.y, pick.z) && (cur == MC_BLOCK.Air || cur == MC_BLOCK.Water) && !this.Overlap(pick.x, pick.y, pick.z))
                    {
                        this.mWorld.SetBlock(pick.x, pick.y, pick.z, item);
                        placed = true;
                    }
                }
            }
            if (placed)
            {
                this.mHand.Swing();
                this.mSnd.Play(MC_SOUND_KIND[item], "place");
                this.mBag.Take(this.mSlot, 1);
            }
            this.mActCd = ACT_DELAY;
        }
    }

    Update(_update: CUpdate)
    {
        const dt = Math.min(_update.DeltaTime(), 0.05);

        if (this.mTouch != null)
        {
            this.mTouch.Update();
            const look = this.mTouch.TakeLook();
            if (this.Active())
            {
                this.mYaw -= look.x * 0.006;
                this.mPitch = Math.max(-1.55, Math.min(1.55, this.mPitch - look.y * 0.006));
            }
        }

        //월드를 처음 만든 프레임들에는 콜라이더가 정적 옥트리에 아직 안 들어가 있어서, 풀어 두면 땅을 뚫고 떨어진다
        if (this.mWorld.mUpdateRes || this.mWorld.mFaceSlot == null) this.mWarm = 0;
        else if (this.mWarm < WARM_FRAME) this.mWarm++;
        if (this.mWarm < WARM_FRAME)
        {
            this.SetGravity(false);
            this.Respawn();
        }
        else this.Control();

        const pos = this.mBody.GetPos();
        const ex = pos.x, ey = pos.y + EYE_H, ez = pos.z;
        const cp = Math.cos(this.mPitch);
        const fx = Math.sin(this.mYaw) * cp, fy = Math.sin(this.mPitch), fz = Math.cos(this.mYaw) * cp;
        this.mCam.Init(new CVec3(ex, ey, ez), new CVec3(ex + fx, ey + fy, ez + fz));

        const S = MC_SIZE;
        const mdx = pos.x - this.mLastX, mdz = pos.z - this.mLastZ;
        this.mLastX = pos.x;
        this.mLastZ = pos.z;
        const moved = this.mWarm >= WARM_FRAME ? Math.hypot(mdx, mdz) : 0;
        const walk = this.mRB.IsGround() && !this.mFly ? Math.min(1, moved / Math.max(dt, 0.001) / WALK_SPEED) : 0;
        this.mStepDist += this.mRB.IsGround() ? moved : 0;
        if (this.mStepDist >= STEP_DIST)
        {
            this.mStepDist = 0;
            this.mSnd.Play(MC_SOUND_KIND[this.mWorld.GetBlock(Math.floor(pos.x / S), Math.floor((pos.y - 1) / S), Math.floor(pos.z / S))], "step");
        }

        const sprint = moved / Math.max(dt, 0.001) > WALK_SPEED * 1.2 ? 1 : 0;
        this.mFov += ((BASE_FOV + sprint * 0.12) - this.mFov) * Math.min(1, dt * 8);
        this.mCam.SetFov(this.mFov);

        this.mHud.SetUnderwater(this.mWorld.GetBlock(Math.floor(ex / S), Math.floor(ey / S), Math.floor(ez / S)) == MC_BLOCK.Water);

        const held = this.mBag.Hotbar(this.mSlot);
        this.mHand.SetItem(held == null ? 0 : held.id);
        this.mHand.Update(dt, new CVec3(ex, ey, ez), new CVec3(ex + fx, ey + fy, ez + fz), walk);

        this.Interact(dt, ex, ey, ez);

        this.mDrop.Update(dt, pos, this.mBag, this.mSnd);
        this.mFurnace.Update(dt);
        this.mBag.Update(dt);

        this.mInfoCd -= dt;
        if (this.mInfoCd <= 0)
        {
            this.mInfoCd = 0.25;
            const S = MC_SIZE;
            this.mHud.SetInfo(
                "XYZ " + (pos.x / S).toFixed(1) + " / " + (pos.y / S).toFixed(1) + " / " + (pos.z / S).toFixed(1) +
                "\nItem: " + (held == null ? "-" : MCItem(held.id).name) + (this.mFly ? "   [FLY]" : ""));
        }
    }
}
