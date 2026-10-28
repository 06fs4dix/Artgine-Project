import { MC_BLOCK, MC_TEX_URL, MCFindBlock, MCPixels, PixelsToURL } from "./CMCBlock.js";

export type TMCTool = "pickaxe" | "axe" | "shovel" | "sword";

//n은 개수, d는 도구가 입은 손상량이다. null이면 빈 칸이다
export interface IMCStack
{
    id: number;
    n: number;
    d: number;
}

export interface IMCItem
{
    id: number;
    name: string;
    icon: string;
    stack: number;
    block: boolean;
    tool: TMCTool | "";
    tier: number;
    dur: number;
}

export const MC_ITEM = {
    Stick: 100,
    Coal: 101,
    IronIngot: 102,
    GoldIngot: 103,
    Diamond: 104,
};

const TOOL_BASE = 110;
const TOOL_TYPE: TMCTool[] = ["pickaxe", "axe", "shovel", "sword"];
const TIER_NAME = ["Wooden", "Stone", "Iron", "Diamond"];
const TIER_DUR = [59, 131, 250, 1561];
const TIER_SPEED = [2, 4, 6, 8];
const TIER_COLOR = [[168, 134, 80], [128, 128, 128], [222, 222, 226], [80, 232, 226]];

export function MCToolId(_type: number, _tier: number): number
{
    return TOOL_BASE + _type * 10 + _tier;
}

const ITEMS = new Map<number, IMCItem>();
const EXTRA_IDS: number[] = [MC_BLOCK.Torch];

function Def(_id: number, _name: string, _icon: string, _stack = 64, _tool: TMCTool | "" = "", _tier = 0, _dur = 0)
{
    ITEMS.set(_id, { id: _id, name: _name, icon: _icon, stack: _stack, block: false, tool: _tool, tier: _tier, dur: _dur });
    EXTRA_IDS.push(_id);
}

Def(MC_ITEM.Stick, "Stick", "stick");
Def(MC_ITEM.Coal, "Coal", "coal");
Def(MC_ITEM.IronIngot, "Iron Ingot", "iron_ingot");
Def(MC_ITEM.GoldIngot, "Gold Ingot", "gold_ingot");
Def(MC_ITEM.Diamond, "Diamond", "diamond");
for (let t = 0; t < TOOL_TYPE.length; ++t)
{
    for (let r = 0; r < TIER_NAME.length; ++r)
    {
        const type = TOOL_TYPE[t];
        Def(MCToolId(t, r), TIER_NAME[r] + " " + type[0].toUpperCase() + type.slice(1), "tool_" + type + "_" + r, 1, type, r, TIER_DUR[r]);
    }
}

export function MCItem(_id: number): IMCItem
{
    let it = ITEMS.get(_id);
    if (it != null) return it;
    const b = MCFindBlock(_id);
    if (b == null) return null;
    it = { id: _id, name: b.name, icon: _id == MC_BLOCK.Torch ? "torch" : b.side, stack: 64, block: true, tool: "", tier: 0, dur: 0 };
    ITEMS.set(_id, it);
    return it;
}

//블록 목록에 없어서 별도 텍스처가 필요한 아이템(횃불 포함)
export function MCExtraItemIds(): number[]
{
    return EXTRA_IDS;
}

//----- 채굴 규칙 -----

interface IMCRule
{
    hard: number;
    tool: TMCTool | "";
    need: number;
    drop: number;
}

//need는 수확에 필요한 곡괭이 등급이다. -1이면 아무 도구 없이도 수확한다. drop -1은 자기 자신, 0은 없음
const Rule = (_hard: number, _tool: TMCTool | "" = "", _need = -1, _drop = -1): IMCRule => ({ hard: _hard, tool: _tool, need: _need, drop: _drop });

const MC_RULE: { [id: number]: IMCRule } = {
    [MC_BLOCK.Grass]: Rule(0.6, "shovel", -1, MC_BLOCK.Dirt),
    [MC_BLOCK.Dirt]: Rule(0.5, "shovel"),
    [MC_BLOCK.Stone]: Rule(1.5, "pickaxe", 0, MC_BLOCK.Cobble),
    [MC_BLOCK.Sand]: Rule(0.5, "shovel"),
    [MC_BLOCK.Log]: Rule(2, "axe"),
    [MC_BLOCK.Leaves]: Rule(0.2, "", -1, 0),
    [MC_BLOCK.Planks]: Rule(2, "axe"),
    [MC_BLOCK.Cobble]: Rule(2, "pickaxe", 0),
    [MC_BLOCK.Brick]: Rule(2, "pickaxe", 0),
    [MC_BLOCK.Gravel]: Rule(0.6, "shovel"),
    [MC_BLOCK.Snow]: Rule(0.2, "shovel"),
    [MC_BLOCK.CoalOre]: Rule(3, "pickaxe", 0, MC_ITEM.Coal),
    [MC_BLOCK.IronOre]: Rule(3, "pickaxe", 1),
    [MC_BLOCK.GoldOre]: Rule(3, "pickaxe", 2),
    [MC_BLOCK.DiamondOre]: Rule(3, "pickaxe", 2, MC_ITEM.Diamond),
    [MC_BLOCK.Glass]: Rule(0.3, "", -1, 0),
    [MC_BLOCK.Bookshelf]: Rule(1.5, "axe"),
    [MC_BLOCK.Obsidian]: Rule(50, "pickaxe", 3),
    [MC_BLOCK.Bedrock]: Rule(Infinity, "", -1, 0),
    [MC_BLOCK.CraftingTable]: Rule(2.5, "axe"),
    [MC_BLOCK.Furnace]: Rule(3.5, "pickaxe", 0),
};

//채굴 시간(초)과 수확 여부. 시간은 경도 x (수확 가능 1.5, 불가 5) / 도구 속도다
export function MCMineInfo(_id: number, _held: IMCStack): { time: number, harvest: boolean }
{
    const r = MC_RULE[_id] ?? Rule(1);
    const it = _held == null ? null : MCItem(_held.id);
    const tool = it == null ? "" : it.tool;
    const harvest = r.need < 0 || (tool == "pickaxe" && it.tier >= r.need);
    const speed = tool != "" && tool == r.tool ? TIER_SPEED[it.tier] : 1;
    return { time: Math.max(0.05, r.hard * (harvest ? 1.5 : 5) / speed), harvest };
}

export function MCDropOf(_id: number): number
{
    const r = MC_RULE[_id] ?? Rule(1);
    return r.drop < 0 ? _id : r.drop;
}

//----- 아이콘 -----

type TPal = { [c: string]: number[] };

function Lit(_c: number[], _v: number): number[]
{
    return [Math.max(0, Math.min(255, _c[0] + _v)), Math.max(0, Math.min(255, _c[1] + _v)), Math.max(0, Math.min(255, _c[2] + _v))];
}

function Pal(_c: number[]): TPal
{
    return { H: _c, h: Lit(_c, 40), d: Lit(_c, -45), S: [150, 108, 58], s: [104, 72, 36], g: [84, 84, 92] };
}

function Art(_rows: string[], _pal: TPal): Uint8ClampedArray
{
    const out = new Uint8ClampedArray(16 * 16 * 4);
    for (let y = 0; y < 16; ++y)
    {
        for (let x = 0; x < 16; ++x)
        {
            const c = _pal[(_rows[y] ?? "")[x] ?? "."];
            if (c == null) continue;
            const o = (x + y * 16) * 4;
            out[o] = c[0];
            out[o + 1] = c[1];
            out[o + 2] = c[2];
            out[o + 3] = 255;
        }
    }
    return out;
}

//머리는 손잡이와 직각인 대각선 방향으로 휘고, 휜 쪽(위 오른쪽)이 바깥이다
function PickaxeArt(): string[]
{
    const g: string[][] = [];
    for (let y = 0; y < 16; ++y) g.push(new Array<string>(16).fill("."));
    const put = (_x: number, _y: number, _c: string) =>
    {
        if (_x >= 0 && _x < 16 && _y >= 0 && _y < 16) g[_y][_x] = _c;
    };
    for (let i = 0; i <= 10; ++i)
    {
        put(1 + i, 14 - i, "s");
        put(2 + i, 14 - i, "S");
    }
    for (const [radius, c] of [[7.2, "h"], [6.2, "H"], [5.2, "d"]] as [number, string][])
    {
        for (let deg = -112; deg <= 22; deg += 1.5)
        {
            const a = deg * Math.PI / 180;
            put(Math.round(5.5 + radius * Math.cos(a)), Math.round(9.5 + radius * Math.sin(a)), c);
        }
    }
    return g.map(_r => _r.join(""));
}
const ART_AXE = [
    "................",
    "....hhhhh.......",
    "...hHHHHHh......",
    "...hHHHHHHd.....",
    "...hHHHHHsSd....",
    "....dHHdsS......",
    ".....ddsS.......",
    "......sS........",
    ".....sS.........",
    "....sS..........",
    "...sS...........",
    "..sS............",
    ".sS.............",
    "sS..............",
    "................",
    "................",
];
const ART_SHOVEL = [
    ".........hhh....",
    "........hHHHh...",
    "........hHHHd...",
    "........hHHHd...",
    "........dHHHd...",
    ".........ddd....",
    ".........sS.....",
    "........sS......",
    ".......sS.......",
    "......sS........",
    ".....sS.........",
    "....sS..........",
    "...sS...........",
    "..sS............",
    ".sS.............",
    "sS..............",
];
const ART_SWORD = [
    "..............hH",
    ".............hHd",
    "............hHd.",
    "...........hHd..",
    "..........hHd...",
    ".........hHd....",
    "........hHd.....",
    ".......hHd......",
    "......hHd.......",
    "..gg.hHd........",
    "...gg...........",
    "....gg..........",
    "...s.gg.........",
    "..sS..gg........",
    ".sS.............",
    "sS..............",
];
const ART_INGOT = [
    "................",
    "................",
    "................",
    "................",
    "................",
    ".....hhhhhhh....",
    "....hHHHHHHHd...",
    "...hHHHHHHHHHd..",
    "..hHHHHHHHHHHHd.",
    "..dddddddddddd..",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
];
const ART_COAL = [
    "................",
    "................",
    "................",
    "................",
    "......dddd......",
    "....ddHHHHdd....",
    "...dHHhHHHHHd...",
    "...dHHHHHhHHd...",
    "...dHHHHHHHHd...",
    "....ddHHHHdd....",
    ".....dddddd.....",
    "................",
    "................",
    "................",
    "................",
    "................",
];
const ART_DIAMOND = [
    "................",
    "................",
    "................",
    ".......hh.......",
    "......hHHd......",
    ".....hHHHHd.....",
    "....hHHHHHHd....",
    "...hHHHHHHHHd...",
    "....dHHHHHHd....",
    ".....dHHHHd.....",
    "......dHHd......",
    ".......dd.......",
    "................",
    "................",
    "................",
    "................",
];
const ART_TORCH = [
    "................",
    "................",
    "......ffff......",
    "......fyyf......",
    "......fyyf......",
    "......ffff......",
    ".......bb.......",
    ".......bb.......",
    ".......bb.......",
    ".......bb.......",
    ".......bb.......",
    ".......bb.......",
    ".......bb.......",
    ".......bb.......",
    ".......bb.......",
    ".......bb.......",
];

function StickArt(): string[]
{
    const rows: string[] = [];
    for (let r = 0; r < 16; ++r)
        rows.push(r < 2 || r > 14 ? ".".repeat(16) : ".".repeat(15 - r) + "sS" + ".".repeat(r - 1));
    return rows;
}

const ICON_ART: { [name: string]: () => Uint8ClampedArray } = {
    stick: () => Art(StickArt(), Pal([0, 0, 0])),
    coal: () => Art(ART_COAL, Pal([48, 48, 52])),
    iron_ingot: () => Art(ART_INGOT, Pal([226, 226, 230])),
    gold_ingot: () => Art(ART_INGOT, Pal([252, 222, 84])),
    diamond: () => Art(ART_DIAMOND, Pal([88, 232, 226])),
    torch_item: () => Art(ART_TORCH, { f: [255, 176, 32], y: [255, 240, 160], b: [122, 85, 48] }),
};
const TOOL_ART = [PickaxeArt(), ART_AXE, ART_SHOVEL, ART_SWORD];
for (let t = 0; t < TOOL_TYPE.length; ++t)
    for (let r = 0; r < TIER_COLOR.length; ++r)
        ICON_ART["tool_" + TOOL_TYPE[t] + "_" + r] = () => Art(TOOL_ART[t], Pal(TIER_COLOR[r]));

//칸 아이콘으로 쓸 이미지 주소를 만든다. 블록은 CMCBlock.MCAtlasBuild가 이미 넣어 두었다
export function MCItemBuildIcons()
{
    for (const name in ICON_ART)
        MC_TEX_URL.set(name, PixelsToURL(ICON_ART[name]()));
}

//손과 바닥에 떨어진 아이템 텍스처용 16x16 RGBA
export function MCItemPixels(_id: number): Uint8ClampedArray
{
    const it = MCItem(_id);
    if (_id == MC_BLOCK.Torch) return ICON_ART.torch_item();
    if (it.block) return MCPixels(MCFindBlock(_id).side);
    return ICON_ART[it.icon]();
}
