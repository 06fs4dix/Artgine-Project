import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CCanvas } from "../../../Artgine/artgine/app/canvas/CCanvas.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CAniFlow } from "../../../Artgine/artgine/app/component/CAniFlow.js";
import { CAnimation, CClipPRS } from "../../../Artgine/artgine/app/component/CAnimation.js";
import { CBound } from "../../../Artgine/artgine/geometry/CBound.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CVoxelModel, RGB, V3, ClipPRS, TILE, COL_MIN, COL_MAX, SIDE_COL, WRAP_X } from "./CVoxelModel.js";
import { CTheme } from "./CTheme.js";

const T = () => CTheme.Cur();
const C = (_c: number[]) => RGB(_c[0], _c[1], _c[2]);

export interface IMover
{
    sub: CSubject;
    x: number;
    len: number;
}

export interface ILaneHost
{
    OnLaneEvent(_lane: CLane, _event: string): void;
}

export interface ILaneOption
{
    difficulty: number;
    prevType: number;
    freeCols: Set<number>;
    wall: boolean;
    coin: boolean;
}

const TRAIN_SPEED = 300;
const WARN_TIME = 2.4;

export class CLane extends CSubject
{
    static eType = {
        Grass: 0,
        Road: 1,
        River: 2,
        Rail: 3,
    };

    mLaneType = CLane.eType.Grass;
    mRow = 0;
    mDir = 1;
    mMoveSpeed = 0;
    mCanvas: CCanvas = null;
    mHost: ILaneHost = null;
    mMovers: IMover[] = [];
    mBlock = new Set<number>();
    mCoins = new Map<number, CSubject>();

    mRailState = 0;
    mRailTime = 0;
    mSignal: CSubject = null;
    mLamp: CSubject = null;
    mTrain: IMover = null;

    Z() { return -this.mRow * TILE; }

    Build(_canvas: CCanvas, _host: ILaneHost, _type: number, _row: number, _opt: ILaneOption)
    {
        this.mCanvas = _canvas;
        this.mHost = _host;
        this.mLaneType= _type;
        this.mRow = _row;
        this.SetPos(V3(0, 0, this.Z()));
        CVoxelModel.BindMerge(this, this, V3(0, 0, 0));

        switch (_type)
        {
            case CLane.eType.Grass: this.BuildGrass(_opt); break;
            case CLane.eType.Road: this.BuildRoad(_opt); break;
            case CLane.eType.River: this.BuildRiver(_opt); break;
            case CLane.eType.Rail: this.BuildRail(_opt); break;
        }
    }

    private Ground(_top: number, _center: CColor, _side: CColor)
    {
        const h = 6;
        const sideW = (SIDE_COL - COL_MAX - 0.5) * TILE;
        const sideX = (COL_MAX + 0.5) * TILE + sideW * 0.5;
        CVoxelModel.Box(this, V3(0, _top - h * 0.5, 0), V3((COL_MAX - COL_MIN + 1) * TILE, h, TILE), _center);
        CVoxelModel.Box(this, V3(-sideX, _top - h * 0.5, 0), V3(sideW, h, TILE), _side);
        CVoxelModel.Box(this, V3(sideX, _top - h * 0.5, 0), V3(sideW, h, TILE), _side);
    }

    private BuildGrass(_opt: ILaneOption)
    {
        const light = this.mRow % 2 == 0;
        const g = T().mGrass;
        this.Ground(0, C(light ? g[0] : g[1]), C(light ? g[2] : g[3]));

        for (let col = -SIDE_COL + 1; col <= SIDE_COL - 1; ++col)
        {
            const inside = col >= COL_MIN && col <= COL_MAX;
            let chance = inside ? 0.18 + _opt.difficulty * 0.12 : 0.4;
            if (_opt.wall) chance = inside ? 0.9 : 0.6;
            if (inside && _opt.freeCols.has(col)) continue;
            if (Math.random() >= chance) continue;

            let deco = new CSubject();
            CVoxelModel.BindMerge(deco, this, V3(col * TILE, 0, 0));
            if (Math.random() < 0.22)
                T().Rock(deco);
            else
                T().Tree(deco, [6, 10, 14][Math.floor(Math.random() * 3)]);
            if (inside) this.mBlock.add(col);
        }

        if (_opt.coin)
        {
            let cols: number[] = [];
            for (let col = COL_MIN; col <= COL_MAX; ++col)
                if (!this.mBlock.has(col)) cols.push(col);
            if (cols.length > 0)
                this.PushCoin(cols[Math.floor(Math.random() * cols.length)]);
        }
    }

    private BuildRoad(_opt: ILaneOption)
    {
        this.Ground(0, C(T().mRoad[0]), C(T().mRoad[1]));
        if (_opt.prevType == CLane.eType.Road)
        {
            for (let x = -SIDE_COL * TILE; x <= SIDE_COL * TILE; x += TILE * 2)
                CVoxelModel.Box(this, V3(x, 0.1, TILE * 0.5), V3(TILE * 0.9, 0.2, 0.8), C(T().mRoadMark), false);
        }

        this.mDir = Math.random() < 0.5 ? 1 : -1;
        this.mMoveSpeed = (16 + Math.random() * 18) * (1 + _opt.difficulty * 0.7);
        const truck = Math.random() < 0.3;
        const len = truck ? 26 : 16;
        const span = WRAP_X * 2;
        const count = Math.min(Math.floor(span / (len + TILE * 4)), 1 + Math.floor(Math.random() * 2 + _opt.difficulty * 2));
        const spacing = span / count;
        const colors = T().mCarColors;
        const col = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < count; ++i)
        {
            let sub = new CSubject();
            CVoxelModel.BindMerge(sub, sub, V3(0, 0, 0));
            if (truck)
                T().Truck(sub, C(col), this.mDir);
            else
            {
                const c = colors[Math.floor(Math.random() * colors.length)];
                T().Car(sub, C(c), this.mDir);
            }
            this.PushKiller(sub, len, 9, "car");
            const x = -WRAP_X + i * spacing + Math.random() * (spacing - len - TILE * 3);
            this.mMovers.push({ sub: sub, x: x, len: len });
            sub.SetPos(V3(x, 0, this.Z()));
            this.mCanvas.PushSub(sub);
        }

        if (_opt.coin)
            this.PushCoin(COL_MIN + Math.floor(Math.random() * (COL_MAX - COL_MIN + 1)));
    }

    private BuildRiver(_opt: ILaneOption)
    {
        this.Ground(-2, C(T().mRiver[0]), C(T().mRiver[1]));
        this.mDir = this.mRow % 2 == 0 ? 1 : -1;
        this.mMoveSpeed = (9 + Math.random() * 10) * (1 + _opt.difficulty * 0.5);
        const span = WRAP_X * 2;
        const count = 6 + Math.floor(Math.random() * 2) - Math.floor(_opt.difficulty * 2);
        const spacing = span / count;
        for (let i = 0; i < count; ++i)
        {
            const tiles = 3 + Math.floor(Math.random() * 2);
            const len = Math.min(tiles * TILE, Math.floor((spacing - TILE * 1.2) / TILE) * TILE) - 0.5;
            let sub = new CSubject();
            CVoxelModel.BindMerge(sub, sub, V3(0, 0, 0));
            T().Log(sub, len);
            const x = -WRAP_X + i * spacing + len * 0.5;
            this.mMovers.push({ sub: sub, x: x, len: len });
            sub.SetPos(V3(x, 0, this.Z()));
            this.mCanvas.PushSub(sub);
        }
    }

    private BuildRail(_opt: ILaneOption)
    {
        this.Ground(0, C(T().mRail[0]), C(T().mRail[1]));
        for (let x = -SIDE_COL * TILE; x <= SIDE_COL * TILE; x += TILE * 0.5)
            CVoxelModel.Box(this, V3(x, 0.4, 0), V3(1.6, 0.8, 8.5), C(T().mSleeper));
        CVoxelModel.Box(this, V3(0, 1.1, 2.6), V3(SIDE_COL * 2 * TILE, 1, 0.8), C(T().mRailBar));
        CVoxelModel.Box(this, V3(0, 1.1, -2.6), V3(SIDE_COL * 2 * TILE, 1, 0.8), C(T().mRailBar));

        this.mSignal = new CSubject();
        this.mSignal.SetPos(V3((COL_MAX + 1) * TILE, 0, TILE * 0.42));
        CVoxelModel.Box(this.mSignal, V3(0, 7, 0), V3(1.2, 14, 1.2), RGB(0.5, 0.5, 0.52));
        this.mLamp = CVoxelModel.Box(this.mSignal, V3(0, 15, 0), V3(3.2, 3.2, 1.8), RGB(0.25, 0.05, 0.05));
        this.PushChild(this.mSignal);

        this.mDir = Math.random() < 0.5 ? 1 : -1;
        this.mRailState = 0;
        this.mRailTime = 1 + Math.random() * 5 * (1 - _opt.difficulty * 0.5);
    }

    private PushKiller(_sub: CSubject, _len: number, _height: number, _layer: string)
    {
        let bound = new CBound();
        bound.SetType(CBound.eType.Box);
        bound.mMin = V3(-_len * 0.5 + 1, 0, -3.5);
        bound.mMax = V3(_len * 0.5 - 1, _height, 3.5);
        let cl = _sub.PushComp(new CCollider(bound));
        cl.SetLayer(_layer);
        cl.SetEvent(CCollider.eEvent.Trigger);
    }

    private PushCoin(_col: number)
    {
        let coin = new CSubject();
        coin.SetPos(V3(_col * TILE, 5, 0));
        T().Coin(coin);
        let ani = new CAnimation();
        ani.mLoop = true;
        ani.Push(ClipPRS(0, 1.4, V3(0, 0, 0), V3(0, Math.PI * 2, 0), CClipPRS.eType.Rot));
        coin.PushComp(new CAniFlow(ani));
        this.PushChild(coin);
        this.mCoins.set(_col, coin);
    }

    IsBlocked(_col: number)
    {
        return this.mBlock.has(_col);
    }

    FindRide(_x: number): IMover
    {
        if (this.mLaneType!= CLane.eType.River) return null;
        for (let m of this.mMovers)
        {
            if (Math.abs(_x - m.x) <= m.len * 0.5 + 1.5)
                return m;
        }
        return null;
    }

    TakeCoin(_col: number)
    {
        let coin = this.mCoins.get(_col);
        if (coin == null) return false;
        coin.Destroy();
        this.mCoins.delete(_col);
        return true;
    }

    override Update(_update: CUpdate): void
    {
        const dt = _update.DeltaTime();
        if (dt <= 0 || this.IsDestroy()) return;

        if (this.mLaneType== CLane.eType.Road || this.mLaneType== CLane.eType.River)
        {
            for (let m of this.mMovers)
            {
                m.x += this.mDir * this.mMoveSpeed * dt;
                if (m.x > WRAP_X) m.x -= WRAP_X * 2;
                else if (m.x < -WRAP_X) m.x += WRAP_X * 2;
                m.sub.SetPos(V3(m.x, 0, this.Z()));
            }
        }
        else if (this.mLaneType== CLane.eType.Rail)
            this.UpdateRail(dt);
    }

    private UpdateRail(_dt: number)
    {
        this.mRailTime -= _dt;
        const lamp = this.mLamp;
        if (this.mRailState == 0)
        {
            if (this.mRailTime <= 0)
            {
                this.mRailState = 1;
                this.mRailTime = WARN_TIME;
                if (this.mHost) this.mHost.OnLaneEvent(this, "warn");
            }
        }
        else if (this.mRailState == 1)
        {
            const on = Math.floor(this.mRailTime * 8) % 2 == 0;
            CVoxelModel.SetBoxColor(lamp, on ? RGB(1.4, 0.1, 0.1) : RGB(0.25, 0.05, 0.05));
            if (this.mRailTime <= 0)
            {
                this.mRailState = 2;
                this.SpawnTrain();
                if (this.mHost) this.mHost.OnLaneEvent(this, "train");
            }
        }
        else if (this.mRailState == 2 && this.mTrain != null)
        {
            let t = this.mTrain;
            t.x += this.mDir * TRAIN_SPEED * _dt;
            t.sub.SetPos(V3(t.x, 0, this.Z()));
            const on = Math.floor(this.mRailTime * 8) % 2 == 0;
            CVoxelModel.SetBoxColor(lamp, on ? RGB(1.4, 0.1, 0.1) : RGB(0.25, 0.05, 0.05));
            if (t.x * this.mDir > WRAP_X + t.len * 0.5)
            {
                t.sub.Destroy();
                this.mTrain = null;
                this.mRailState = 0;
                this.mRailTime = 3 + Math.random() * 5;
                CVoxelModel.SetBoxColor(lamp, RGB(0.25, 0.05, 0.05));
            }
        }
    }

    private SpawnTrain()
    {
        const carLen = 30;
        const cars = 3 + Math.floor(Math.random() * 3);
        const len = carLen * cars;
        let sub = new CSubject();
        CVoxelModel.BindMerge(sub, sub, V3(0, 0, 0));
        for (let i = 0; i < cars; ++i)
        {
            const off = this.mDir * (len * 0.5 - carLen * 0.5 - i * carLen);
            const engine = i == 0;
            T().TrainCar(sub, off, carLen, this.mDir, engine);
        }
        this.PushKiller(sub, len, 14, "train");
        const x = -this.mDir * (WRAP_X + len * 0.5);
        this.mTrain = { sub: sub, x: x, len: len };
        sub.SetPos(V3(x, 0, this.Z()));
        this.mCanvas.PushSub(sub);
    }

    IsTrainNear()
    {
        return this.mRailState != 0;
    }

    override Destroy()
    {
        for (let m of this.mMovers)
            m.sub.Destroy();
        this.mMovers = [];
        if (this.mTrain != null)
        {
            this.mTrain.sub.Destroy();
            this.mTrain = null;
        }
        super.Destroy();
    }
}
