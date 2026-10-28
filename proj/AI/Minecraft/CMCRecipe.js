import { MC_BLOCK } from "./CMCBlock.js";
import { MC_ITEM, MCToolId } from "./CMCItem.js";
const RECIPES = [];
function Shaped(_pat, _key, _out, _n = 1) {
    const h = _pat.length;
    const w = Math.max(..._pat.map(_r => _r.length));
    const cell = [];
    for (let y = 0; y < h; ++y) {
        for (let x = 0; x < w; ++x) {
            const ch = _pat[y][x] ?? " ";
            cell.push(ch == " " ? 0 : _key[ch]);
        }
    }
    RECIPES.push({ w, h, cell, out: _out, n: _n });
}
Shaped(["L"], { L: MC_BLOCK.Log }, MC_BLOCK.Planks, 4);
Shaped(["P", "P"], { P: MC_BLOCK.Planks }, MC_ITEM.Stick, 4);
Shaped(["PP", "PP"], { P: MC_BLOCK.Planks }, MC_BLOCK.CraftingTable);
Shaped(["CCC", "C C", "CCC"], { C: MC_BLOCK.Cobble }, MC_BLOCK.Furnace);
Shaped(["C", "S"], { C: MC_ITEM.Coal, S: MC_ITEM.Stick }, MC_BLOCK.Torch, 4);
const MATERIAL = [MC_BLOCK.Planks, MC_BLOCK.Cobble, MC_ITEM.IronIngot, MC_ITEM.Diamond];
for (let tier = 0; tier < MATERIAL.length; ++tier) {
    const key = { M: MATERIAL[tier], S: MC_ITEM.Stick };
    Shaped(["MMM", " S ", " S "], key, MCToolId(0, tier));
    Shaped(["MM", "MS", " S"], key, MCToolId(1, tier));
    Shaped(["M", "S", "S"], key, MCToolId(2, tier));
    Shaped(["M", "M", "S"], key, MCToolId(3, tier));
}
export function MCCraft(_grid, _w) {
    let x0 = _w, x1 = -1, y0 = _w, y1 = -1;
    for (let y = 0; y < _w; ++y) {
        for (let x = 0; x < _w; ++x) {
            if (_grid[x + y * _w] == null)
                continue;
            x0 = Math.min(x0, x);
            x1 = Math.max(x1, x);
            y0 = Math.min(y0, y);
            y1 = Math.max(y1, y);
        }
    }
    if (x1 < 0)
        return null;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
    const match = (_r, _mirror) => {
        for (let y = 0; y < bh; ++y) {
            for (let x = 0; x < bw; ++x) {
                const want = _r.cell[(_mirror ? bw - 1 - x : x) + y * bw];
                const s = _grid[(x0 + x) + (y0 + y) * _w];
                if (want != (s == null ? 0 : s.id))
                    return false;
            }
        }
        return true;
    };
    for (const r of RECIPES) {
        if (r.w != bw || r.h != bh)
            continue;
        if (match(r, false) || match(r, true))
            return { id: r.out, n: r.n };
    }
    return null;
}
export const MC_SMELT = {
    [MC_BLOCK.IronOre]: MC_ITEM.IronIngot,
    [MC_BLOCK.GoldOre]: MC_ITEM.GoldIngot,
    [MC_BLOCK.Cobble]: MC_BLOCK.Stone,
    [MC_BLOCK.Sand]: MC_BLOCK.Glass,
};
export const MC_FUEL = {
    [MC_ITEM.Coal]: 80,
    [MC_BLOCK.Log]: 15,
    [MC_BLOCK.Planks]: 15,
    [MC_ITEM.Stick]: 5,
};
