import { CAtlas } from "../../../Artgine/artgine/util/CAtlas.js";

export const MC_BLOCK = {
    Air: 0,
    Grass: 1,
    Dirt: 2,
    Stone: 3,
    Sand: 4,
    Log: 5,
    Leaves: 6,
    Planks: 7,
    Cobble: 8,
    Water: 9,
    Brick: 10,
    Torch: 11,
    Gravel: 12,
    Snow: 13,
    CoalOre: 14,
    IronOre: 15,
    GoldOre: 16,
    DiamondOre: 17,
    Glass: 18,
    Bookshelf: 19,
    Obsidian: 20,
    Bedrock: 21,
    CraftingTable: 22,
    Furnace: 23,
};

export interface IMCBlock
{
    id: number;
    name: string;
    top: string;
    bottom: string;
    side: string;
}

export const MC_BLOCK_LIST: IMCBlock[] = [
    { id: MC_BLOCK.Grass, name: "Grass", top: "grass_top", bottom: "dirt", side: "grass_side" },
    { id: MC_BLOCK.Dirt, name: "Dirt", top: "dirt", bottom: "dirt", side: "dirt" },
    { id: MC_BLOCK.Stone, name: "Stone", top: "stone", bottom: "stone", side: "stone" },
    { id: MC_BLOCK.Sand, name: "Sand", top: "sand", bottom: "sand", side: "sand" },
    { id: MC_BLOCK.Log, name: "Log", top: "log_top", bottom: "log_top", side: "log_side" },
    { id: MC_BLOCK.Leaves, name: "Leaves", top: "leaves", bottom: "leaves", side: "leaves" },
    { id: MC_BLOCK.Planks, name: "Planks", top: "planks", bottom: "planks", side: "planks" },
    { id: MC_BLOCK.Cobble, name: "Cobblestone", top: "cobble", bottom: "cobble", side: "cobble" },
    { id: MC_BLOCK.Water, name: "Water", top: "water", bottom: "water", side: "water" },
    { id: MC_BLOCK.Brick, name: "Brick", top: "brick", bottom: "brick", side: "brick" },
    { id: MC_BLOCK.Gravel, name: "Gravel", top: "gravel", bottom: "gravel", side: "gravel" },
    { id: MC_BLOCK.Snow, name: "Snow", top: "snow", bottom: "snow", side: "snow" },
    { id: MC_BLOCK.CoalOre, name: "Coal Ore", top: "coal_ore", bottom: "coal_ore", side: "coal_ore" },
    { id: MC_BLOCK.IronOre, name: "Iron Ore", top: "iron_ore", bottom: "iron_ore", side: "iron_ore" },
    { id: MC_BLOCK.GoldOre, name: "Gold Ore", top: "gold_ore", bottom: "gold_ore", side: "gold_ore" },
    { id: MC_BLOCK.DiamondOre, name: "Diamond Ore", top: "diamond_ore", bottom: "diamond_ore", side: "diamond_ore" },
    { id: MC_BLOCK.Glass, name: "Glass", top: "glass", bottom: "glass", side: "glass" },
    { id: MC_BLOCK.Bookshelf, name: "Bookshelf", top: "planks", bottom: "planks", side: "bookshelf" },
    { id: MC_BLOCK.Obsidian, name: "Obsidian", top: "obsidian", bottom: "obsidian", side: "obsidian" },
    { id: MC_BLOCK.Bedrock, name: "Bedrock", top: "bedrock", bottom: "bedrock", side: "bedrock" },
    { id: MC_BLOCK.CraftingTable, name: "Crafting Table", top: "crafting_top", bottom: "planks", side: "crafting_side" },
    { id: MC_BLOCK.Furnace, name: "Furnace", top: "cobble", bottom: "cobble", side: "furnace_side" },
];

export function MCKey(_id: number): number
{
    return (_id << 24) >>> 0;
}

export const MC_TORCH_ITEM: IMCBlock = { id: MC_BLOCK.Torch, name: "Torch", top: "torch", bottom: "torch", side: "torch" };

export function MCFindBlock(_id: number): IMCBlock
{
    if (_id == MC_BLOCK.Torch) return MC_TORCH_ITEM;
    return MC_BLOCK_LIST.find(_b => _b.id == _id);
}

export const MC_TEX_URL = new Map<string, string>();

type TPix = (_x: number, _y: number, _rnd: () => number) => number[];
const ORE_SPOT = [[3, 3], [4, 3], [3, 4], [10, 5], [11, 5], [11, 6], [6, 11], [7, 11], [7, 12], [12, 12], [13, 11]];

function OrePix(_x: number, _y: number, _r: () => number, _ore: number[]): number[]
{
    for (const s of ORE_SPOT)
        if (s[0] == _x && s[1] == _y) return Jit(_ore, 14, _r);
    return Jit([127, 127, 127], 14, _r);
}


function Rng(_seed: number): () => number
{
    let a = _seed >>> 0;
    return () =>
    {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function Jit(_base: number[], _var: number, _rnd: () => number): number[]
{
    const v = (_rnd() - 0.5) * 2 * _var;
    return [_base[0] + v, _base[1] + v, _base[2] + v];
}

function Shade(_c: number[], _v: number): number[]
{
    return [_c[0] + _v, _c[1] + _v, _c[2] + _v];
}

const TEX_DEF: { name: string, pix: TPix }[] = [
    { name: "grass_top", pix: (_x, _y, _r) => Jit([96, 165, 56], 22, _r) },
    { name: "dirt", pix: (_x, _y, _r) => Jit([134, 96, 67], 18, _r) },
    {
        name: "grass_side", pix: (_x, _y, _r) =>
        {
            const depth = 3 + (((_x * 7 + 3) % 5) < 2 ? 1 : 0);
            return _y < depth ? Jit([96, 165, 56], 22, _r) : Jit([134, 96, 67], 18, _r);
        }
    },
    { name: "stone", pix: (_x, _y, _r) => Jit([127, 127, 127], 14, _r) },
    { name: "sand", pix: (_x, _y, _r) => Jit([219, 206, 140], 10, _r) },
    { name: "log_side", pix: (_x, _y, _r) => Shade(Jit([104, 82, 52], 10, _r), _x % 4 == 0 ? -20 : 0) },
    {
        name: "log_top", pix: (_x, _y, _r) =>
        {
            const d = Math.hypot(_x - 7.5, _y - 7.5);
            if (d > 7) return Jit([104, 82, 52], 8, _r);
            return Math.floor(d * 0.9) % 2 ? Jit([170, 140, 90], 8, _r) : Jit([140, 110, 66], 8, _r);
        }
    },
    { name: "leaves", pix: (_x, _y, _r) => _r() < 0.2 ? [30, 85, 25] : Jit([58, 128, 44], 20, _r) },
    {
        name: "planks", pix: (_x, _y, _r) =>
        {
            let c = Jit([166, 134, 80], 10, _r);
            if (_y % 4 == 3) c = Shade(c, -40);
            else if (_x == (((_y >> 2) & 1) ? 3 : 11)) c = Shade(c, -25);
            return c;
        }
    },
    {
        name: "cobble", pix: (_x, _y, _r) =>
        {
            const ox = _x + ((_y >> 2) & 1) * 2;
            if (_y % 4 == 0 || ox % 4 == 0) return [70, 70, 70];
            const s = 100 + (((ox >> 2) * 37 + (_y >> 2) * 91) % 40);
            return Jit([s, s, s], 8, _r);
        }
    },
    {
        name: "water", pix: (_x, _y, _r) =>
        {
            const c = Jit([46, 98, 206], 10, _r);
            return (_x + _y * 2) % 7 == 0 ? Shade(c, 25) : c;
        }
    },
    {
        name: "brick", pix: (_x, _y, _r) =>
        {
            const off = ((_y >> 2) & 1) * 4;
            if (_y % 4 == 3 || (_x + off) % 8 == 7) return Jit([196, 196, 186], 6, _r);
            return Jit([156, 72, 54], 14, _r);
        }
    },
    { name: "gravel", pix: (_x, _y, _r) => _r() < 0.22 ? Jit([88, 86, 84], 10, _r) : Jit([132, 127, 122], 18, _r) },
    { name: "snow", pix: (_x, _y, _r) => Jit([244, 248, 250], 6, _r) },
    { name: "coal_ore", pix: (_x, _y, _r) => OrePix(_x, _y, _r, [34, 34, 34]) },
    { name: "iron_ore", pix: (_x, _y, _r) => OrePix(_x, _y, _r, [216, 175, 147]) },
    { name: "gold_ore", pix: (_x, _y, _r) => OrePix(_x, _y, _r, [250, 232, 70]) },
    { name: "diamond_ore", pix: (_x, _y, _r) => OrePix(_x, _y, _r, [93, 230, 240]) },
    {
        name: "glass", pix: (_x, _y, _r) =>
        {
            if (_x == 0 || _y == 0 || _x == 15 || _y == 15) return [196, 228, 232, 255];
            if ((_x == _y && _x < 7) || (_x == _y + 1 && _x < 7)) return [225, 242, 246, 255];
            return [255, 255, 255, 0];
        }
    },
    {
        name: "bookshelf", pix: (_x, _y, _r) =>
        {
            if (_y < 2 || (_y >= 7 && _y < 9) || _y >= 14) return Jit([166, 134, 80], 8, _r);
            const cols = [[150, 40, 40], [50, 90, 150], [60, 130, 70], [170, 130, 50], [110, 60, 140]];
            const c = cols[Math.floor(_x / 2 + (_y > 8 ? 2 : 0)) % cols.length];
            return _x % 2 == 0 && _r() < 0.15 ? [40, 30, 20] : Jit(c, 14, _r);
        }
    },
    { name: "obsidian", pix: (_x, _y, _r) => _r() < 0.1 ? [58, 34, 90] : Jit([20, 12, 32], 8, _r) },
    { name: "bedrock", pix: (_x, _y, _r) => _r() < 0.3 ? Jit([30, 30, 30], 8, _r) : Jit([86, 86, 86], 22, _r) },
    {
        name: "crafting_top", pix: (_x, _y, _r) =>
        {
            if (_x == 0 || _y == 0 || _x == 15 || _y == 15) return Jit([112, 80, 42], 6, _r);
            if (_x % 5 == 0 || _y % 5 == 0) return Jit([86, 58, 28], 6, _r);
            return Jit([172, 138, 84], 10, _r);
        }
    },
    {
        name: "crafting_side", pix: (_x, _y, _r) =>
        {
            if (_y < 4) return Jit([92, 62, 30], 8, _r);
            if (_x == 0 || _x == 15) return Jit([112, 80, 42], 6, _r);
            if (_x >= 3 && _x <= 6 && _y >= 6 && _y <= 8) return Jit([176, 176, 180], 8, _r);
            if (_x == 4 && _y >= 9 && _y <= 13) return Jit([96, 66, 32], 6, _r);
            if (_x >= 9 && _x <= 12 && _y == 7 + (_x - 9)) return Jit([200, 200, 204], 6, _r);
            if (_x == 10 && _y >= 10 && _y <= 13) return Jit([96, 66, 32], 6, _r);
            return Jit([166, 134, 80], 10, _r);
        }
    },
    {
        name: "furnace_side", pix: (_x, _y, _r) =>
        {
            if (_x == 0 || _y == 0 || _x == 15 || _y == 15) return Jit([92, 92, 92], 6, _r);
            if (_x >= 4 && _x <= 11 && _y >= 6 && _y <= 12)
                return _y == 12 ? Jit([120, 50, 14], 10, _r) : Jit([30, 30, 30], 6, _r);
            return Jit([128, 128, 128], 14, _r);
        }
    },
];

function MakePixels(_def: { name: string, pix: TPix }, _seed: number): Uint8ClampedArray
{
    const out = new Uint8ClampedArray(16 * 16 * 4);
    const rnd = Rng(_seed);
    for (let y = 0; y < 16; ++y)
    {
        for (let x = 0; x < 16; ++x)
        {
            const c = _def.pix(x, y, rnd);
            const o = (x + y * 16) * 4;
            out[o] = c[0];
            out[o + 1] = c[1];
            out[o + 2] = c[2];
            out[o + 3] = c.length > 3 ? c[3] : 255;
        }
    }
    return out;
}

export function MCPixels(_name: string): Uint8ClampedArray
{
    const i = TEX_DEF.findIndex(_d => _d.name == _name);
    return MakePixels(TEX_DEF[i], 1000 + i * 17);
}

export function PixelsToURL(_pix: Uint8ClampedArray): string
{
    const cv = document.createElement("canvas");
    cv.width = 16;
    cv.height = 16;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(16, 16);
    img.data.set(_pix);
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL("image/png");
}

//재질맵 R=AO, G=거칠기, B=금속. 알파는 쓰지 않는다(0이면 캔버스가 RGB를 지운다)
const MC_MATERIAL: { [name: string]: number[] } = {
    grass_top: [1, 1, 0], dirt: [1, 1, 0], grass_side: [1, 1, 0], stone: [1, 0.85, 0], sand: [1, 1, 0],
    log_side: [1, 0.9, 0], log_top: [1, 0.9, 0], leaves: [1, 1, 0], planks: [1, 0.7, 0], cobble: [1, 0.9, 0],
    water: [1, 0.1, 0], brick: [1, 0.85, 0], gravel: [1, 1, 0], snow: [1, 0.8, 0],
    coal_ore: [1, 0.9, 0], iron_ore: [1, 0.9, 0], gold_ore: [1, 0.9, 0], diamond_ore: [1, 0.9, 0],
    glass: [1, 0.05, 0], bookshelf: [1, 0.8, 0], obsidian: [1, 0.15, 0], bedrock: [1, 0.95, 0],
    crafting_top: [1, 0.7, 0], crafting_side: [1, 0.7, 0], furnace_side: [1, 0.9, 0],
};
//광석 점 자리는 돌이 아니라 광물이라 따로 매끈하고 금속성을 준다
const MC_ORE_MATERIAL: { [name: string]: number[] } = {
    coal_ore: [1, 0.5, 0], iron_ore: [1, 0.4, 0.8], gold_ore: [1, 0.3, 0.9], diamond_ore: [1, 0.15, 0.1],
};

function MakeMaterialPixels(_name: string, _color: Uint8ClampedArray): Uint8ClampedArray
{
    const out = new Uint8ClampedArray(16 * 16 * 4);
    const base = MC_MATERIAL[_name];
    const ore = MC_ORE_MATERIAL[_name];
    for (let y = 0; y < 16; ++y)
    {
        for (let x = 0; x < 16; ++x)
        {
            const o = (x + y * 16) * 4;
            const spot = ore != null && ORE_SPOT.some(_s => _s[0] == x && _s[1] == y);
            const m = spot ? ore : base;
            out[o] = m[0] * 255;
            out[o + 1] = m[1] * 255;
            out[o + 2] = m[2] * 255;
            out[o + 3] = 255;
        }
    }
    return out;
}

//밝기를 높이로 보고 만든 탄젠트 공간 노말. x=이미지 오른쪽(U), y=이미지 위쪽, 타일 가장자리는 반대편으로 이어서 읽는다
function MakeNormalPixels(_name: string, _color: Uint8ClampedArray): Uint8ClampedArray
{
    const out = new Uint8ClampedArray(16 * 16 * 4);
    const flat = _name == "water" || _name == "glass";
    const h = (_x: number, _y: number) =>
    {
        const o = (((_x + 16) % 16) + ((_y + 16) % 16) * 16) * 4;
        return (_color[o] * 0.299 + _color[o + 1] * 0.587 + _color[o + 2] * 0.114) / 255;
    };
    for (let y = 0; y < 16; ++y)
    {
        for (let x = 0; x < 16; ++x)
        {
            let nx = 0, ny = 0;
            if (!flat)
            {
                nx = -(h(x + 1, y) - h(x - 1, y)) * 0.5 * MC_NORMAL_STRENGTH;
                ny = -(h(x, y - 1) - h(x, y + 1)) * 0.5 * MC_NORMAL_STRENGTH;
            }
            const len = Math.hypot(nx, ny, 1);
            const o = (x + y * 16) * 4;
            out[o] = (nx / len * 0.5 + 0.5) * 255;
            out[o + 1] = (ny / len * 0.5 + 0.5) * 255;
            out[o + 2] = (1 / len * 0.5 + 0.5) * 255;
            out[o + 3] = 255;
        }
    }
    return out;
}
const MC_NORMAL_STRENGTH = 5;

export type TMCSound = "stone" | "dirt" | "grass" | "wood" | "sand" | "leaves" | "water";

export const MC_SOUND_KIND: { [id: number]: TMCSound } = {
    [MC_BLOCK.Grass]: "grass",
    [MC_BLOCK.Dirt]: "dirt",
    [MC_BLOCK.Stone]: "stone",
    [MC_BLOCK.Sand]: "sand",
    [MC_BLOCK.Log]: "wood",
    [MC_BLOCK.Leaves]: "leaves",
    [MC_BLOCK.Planks]: "wood",
    [MC_BLOCK.Cobble]: "stone",
    [MC_BLOCK.Water]: "water",
    [MC_BLOCK.Brick]: "stone",
    [MC_BLOCK.Torch]: "wood",
    [MC_BLOCK.Gravel]: "dirt",
    [MC_BLOCK.Snow]: "sand",
    [MC_BLOCK.CoalOre]: "stone",
    [MC_BLOCK.IronOre]: "stone",
    [MC_BLOCK.GoldOre]: "stone",
    [MC_BLOCK.DiamondOre]: "stone",
    [MC_BLOCK.Glass]: "stone",
    [MC_BLOCK.Bookshelf]: "wood",
    [MC_BLOCK.Obsidian]: "stone",
    [MC_BLOCK.Bedrock]: "stone",
    [MC_BLOCK.CraftingTable]: "wood",
    [MC_BLOCK.Furnace]: "stone",
};

function MakeTorchIconURL(): string
{
    const cv = document.createElement("canvas");
    cv.width = 16;
    cv.height = 16;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#7a5530";
    ctx.fillRect(7, 6, 2, 10);
    ctx.fillStyle = "#ffb020";
    ctx.fillRect(6, 2, 4, 4);
    ctx.fillStyle = "#fff0a0";
    ctx.fillRect(7, 3, 2, 2);
    return cv.toDataURL("image/png");
}

//색, 노말, 재질 아틀라스는 같은 크기를 같은 순서로 넣어 UV가 모두 같아야 한다
export async function MCAtlasBuild(_atlas: CAtlas, _normal: CAtlas, _material: CAtlas): Promise<Map<string, number>>
{
    MC_TEX_URL.set("torch", MakeTorchIconURL());
    const map = new Map<string, number>();
    for (let i = 0; i < TEX_DEF.length; ++i)
    {
        const name = TEX_DEF[i].name;
        const color = MakePixels(TEX_DEF[i], 1000 + i * 17);
        const url = PixelsToURL(color);
        MC_TEX_URL.set(name, url);
        const idx = await _atlas.Push(url) as number;
        //색 아틀라스는 CVoxelMap이 기본 타일을 앞에 넣어 두므로, 나머지는 같은 번호가 될 때까지 앞자리를 채운다
        const extra: [CAtlas, string][] = [[_normal, PixelsToURL(MakeNormalPixels(name, color))], [_material, PixelsToURL(MakeMaterialPixels(name, color))]];
        for (const [atlas, extraURL] of extra)
        {
            let n = await atlas.Push(extraURL) as number;
            while (n < idx) n = await atlas.Push(extraURL) as number;
            if (n != idx) console.error("MCAtlasBuild: 아틀라스 인덱스가 어긋남 " + name);
        }
        map.set(name, idx);
    }
    return map;
}
