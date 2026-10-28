import { MC_BLOCK, MC_TEX_URL, MCFindBlock, MCPixels, PixelsToURL } from "./CMCBlock.js";
export const MC_ITEM = {
    Stick: 100,
    Coal: 101,
    IronIngot: 102,
    GoldIngot: 103,
    Diamond: 104,
};
const TOOL_BASE = 110;
const TOOL_TYPE = ["pickaxe", "axe", "shovel", "sword"];
const TIER_NAME = ["Wooden", "Stone", "Iron", "Diamond"];
const TIER_DUR = [59, 131, 250, 1561];
const TIER_SPEED = [2, 4, 6, 8];
const TIER_COLOR = [[168, 134, 80], [128, 128, 128], [222, 222, 226], [80, 232, 226]];
export function MCToolId(_type, _tier) {
    return TOOL_BASE + _type * 10 + _tier;
}
const ITEMS = new Map();
const EXTRA_IDS = [MC_BLOCK.Torch];
function Def(_id, _name, _icon, _stack = 64, _tool = "", _tier = 0, _dur = 0) {
    ITEMS.set(_id, { id: _id, name: _name, icon: _icon, stack: _stack, block: false, tool: _tool, tier: _tier, dur: _dur });
    EXTRA_IDS.push(_id);
}
Def(MC_ITEM.Stick, "Stick", "stick");
Def(MC_ITEM.Coal, "Coal", "coal");
Def(MC_ITEM.IronIngot, "Iron Ingot", "iron_ingot");
Def(MC_ITEM.GoldIngot, "Gold Ingot", "gold_ingot");
Def(MC_ITEM.Diamond, "Diamond", "diamond");
for (let t = 0; t < TOOL_TYPE.length; ++t) {
    for (let r = 0; r < TIER_NAME.length; ++r) {
        const type = TOOL_TYPE[t];
        Def(MCToolId(t, r), TIER_NAME[r] + " " + type[0].toUpperCase() + type.slice(1), "tool_" + type + "_" + r, 1, type, r, TIER_DUR[r]);
    }
}
export function MCItem(_id) {
    let it = ITEMS.get(_id);
    if (it != null)
        return it;
    const b = MCFindBlock(_id);
    if (b == null)
        return null;
    it = { id: _id, name: b.name, icon: _id == MC_BLOCK.Torch ? "torch" : b.side, stack: 64, block: true, tool: "", tier: 0, dur: 0 };
    ITEMS.set(_id, it);
    return it;
}
export function MCExtraItemIds() {
    return EXTRA_IDS;
}
const Rule = (_hard, _tool = "", _need = -1, _drop = -1) => ({ hard: _hard, tool: _tool, need: _need, drop: _drop });
const MC_RULE = {
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
export function MCMineInfo(_id, _held) {
    const r = MC_RULE[_id] ?? Rule(1);
    const it = _held == null ? null : MCItem(_held.id);
    const tool = it == null ? "" : it.tool;
    const harvest = r.need < 0 || (tool == "pickaxe" && it.tier >= r.need);
    const speed = tool != "" && tool == r.tool ? TIER_SPEED[it.tier] : 1;
    return { time: Math.max(0.05, r.hard * (harvest ? 1.5 : 5) / speed), harvest };
}
export function MCDropOf(_id) {
    const r = MC_RULE[_id] ?? Rule(1);
    return r.drop < 0 ? _id : r.drop;
}
function Lit(_c, _v) {
    return [Math.max(0, Math.min(255, _c[0] + _v)), Math.max(0, Math.min(255, _c[1] + _v)), Math.max(0, Math.min(255, _c[2] + _v))];
}
function Pal(_c) {
    return { H: _c, h: Lit(_c, 40), d: Lit(_c, -45), S: [150, 108, 58], s: [104, 72, 36], g: [84, 84, 92] };
}
function Art(_rows, _pal) {
    const out = new Uint8ClampedArray(16 * 16 * 4);
    for (let y = 0; y < 16; ++y) {
        for (let x = 0; x < 16; ++x) {
            const c = _pal[(_rows[y] ?? "")[x] ?? "."];
            if (c == null)
                continue;
            const o = (x + y * 16) * 4;
            out[o] = c[0];
            out[o + 1] = c[1];
            out[o + 2] = c[2];
            out[o + 3] = 255;
        }
    }
    return out;
}
function PickaxeArt() {
    const g = [];
    for (let y = 0; y < 16; ++y)
        g.push(new Array(16).fill("."));
    const put = (_x, _y, _c) => {
        if (_x >= 0 && _x < 16 && _y >= 0 && _y < 16)
            g[_y][_x] = _c;
    };
    for (let i = 0; i <= 10; ++i) {
        put(1 + i, 14 - i, "s");
        put(2 + i, 14 - i, "S");
    }
    for (const [radius, c] of [[7.2, "h"], [6.2, "H"], [5.2, "d"]]) {
        for (let deg = -112; deg <= 22; deg += 1.5) {
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
function StickArt() {
    const rows = [];
    for (let r = 0; r < 16; ++r)
        rows.push(r < 2 || r > 14 ? ".".repeat(16) : ".".repeat(15 - r) + "sS" + ".".repeat(r - 1));
    return rows;
}
const ICON_ART = {
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
export function MCItemBuildIcons() {
    for (const name in ICON_ART)
        MC_TEX_URL.set(name, PixelsToURL(ICON_ART[name]()));
}
export function MCItemPixels(_id) {
    const it = MCItem(_id);
    if (_id == MC_BLOCK.Torch)
        return ICON_ART.torch_item();
    if (it.block)
        return MCPixels(MCFindBlock(_id).side);
    return ICON_ART[it.icon]();
}
