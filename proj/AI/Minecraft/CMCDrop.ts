import { CFrame } from "../../../Artgine/artgine/util/CFrame.js";
import { CCanvas } from "../../../Artgine/artgine/app/canvas/CCanvas.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CAlpha } from "../../../Artgine/artgine/render/CAlpha.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { MC_BLOCK } from "./CMCBlock.js";
import { CMCWorld, MC_SIZE } from "./CMCWorld.js";
import { CMCFx } from "./CMCFx.js";
import { CMCBag } from "./CMCBag.js";
import { CMCSound } from "./CMCSound.js";
import { MCItem } from "./CMCItem.js";

const SIZE = 26;
const GRAVITY = 2600;
const PICK_RANGE = 130;
const PICK_DOWN = 170;
const PICK_UP = 190;
const LIFE = 300;
const MAX_DROP = 150;

interface IDrop
{
    sub: CSubject;
    id: number;
    n: number;
    d: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    age: number;
    delay: number;
    ground: boolean;
}

//바닥에 떨어진 아이템. y는 아이템 바닥 높이다
export class CMCDrop
{
    private mCanvas: CCanvas;
    private mWorld: CMCWorld;
    private mArr = new Array<IDrop>();

    constructor(_frame: CFrame, _canvas: CCanvas, _world: CMCWorld)
    {
        this.mCanvas = _canvas;
        this.mWorld = _world;
    }

    Spawn(_id: number, _n: number, _d: number, _x: number, _y: number, _z: number, _delay = 0.4)
    {
        const it = MCItem(_id);
        if (it == null || _n <= 0) return;
        if (this.mArr.length >= MAX_DROP) this.mArr.shift().sub.Destroy();

        const flat = !it.block || _id == MC_BLOCK.Torch;
        const sub = this.mCanvas.PushSub(new CSubject());
        sub.SetSca(new CVec3(SIZE, SIZE, flat ? 1.5 : SIZE));
        const pt = sub.PushComp(new CPaint3D());
        pt.SetTexture(CMCFx.ItemKey(_id));
        if (flat) pt.SetAlphaModel(new CAlpha(1, 0.1));
        const a = Math.random() * Math.PI * 2;
        this.mArr.push({
            sub, id: _id, n: _n, d: _d, x: _x, y: _y, z: _z,
            vx: Math.cos(a) * 120, vy: 450, vz: Math.sin(a) * 120,
            age: 0, delay: _delay, ground: false,
        });
    }

    private Solid(_x: number, _y: number, _z: number): boolean
    {
        const S = MC_SIZE;
        const id = this.mWorld.GetBlock(Math.floor(_x / S), Math.floor(_y / S), Math.floor(_z / S));
        return id != MC_BLOCK.Air && id != MC_BLOCK.Water;
    }

    Update(_dt: number, _pos: CVec3, _bag: CMCBag, _snd: CMCSound)
    {
        const S = MC_SIZE;
        for (let i = this.mArr.length - 1; i >= 0; --i)
        {
            const d = this.mArr[i];
            d.age += _dt;
            d.vy -= GRAVITY * _dt;

            let nx = d.x + d.vx * _dt, nz = d.z + d.vz * _dt, ny = d.y + d.vy * _dt;
            if (this.Solid(nx, d.y + 8, nz))
            {
                nx = d.x;
                nz = d.z;
                d.vx = d.vz = 0;
            }
            d.ground = false;
            if (d.vy <= 0 && this.Solid(nx, ny, nz))
            {
                ny = (Math.floor(ny / S) + 1) * S;
                d.vy = 0;
                d.ground = true;
                const f = Math.max(0, 1 - 10 * _dt);
                d.vx *= f;
                d.vz *= f;
            }
            d.x = nx;
            d.y = ny;
            d.z = nz;

            const bob = d.ground ? Math.sin(d.age * 3) * 3 + 3 : 0;
            d.sub.SetPos(new CVec3(d.x, d.y + SIZE * 0.5 + bob, d.z));
            d.sub.SetRot(new CVec3(0, d.age * 1.8, 0));

            if (d.age > LIFE || d.y < -500)
            {
                d.sub.Destroy();
                this.mArr.splice(i, 1);
                continue;
            }
            if (d.age < d.delay) continue;
            const dx = _pos.x - d.x, dy = d.y - _pos.y, dz = _pos.z - d.z;
            if (dx * dx + dz * dz > PICK_RANGE * PICK_RANGE || dy < -PICK_DOWN || dy > PICK_UP) continue;
            const left = _bag.Add(d.id, d.n, d.d);
            if (left < d.n) _snd.Play("leaves", "hit", 0.8);
            if (left <= 0)
            {
                d.sub.Destroy();
                this.mArr.splice(i, 1);
            }
            else d.n = left;
        }
    }
}
