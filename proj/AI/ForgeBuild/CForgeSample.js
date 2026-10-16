import { CForgeRand } from "../../../plugin/ForgeBuild/CForgeRand.js";
import { CForgeScene } from "../../../plugin/ForgeBuild/CForgeScene.js";
import { CForgeCurve, CForgeSpline } from "../../../plugin/ForgeBuild/CForgeSpline.js";
import { CForgeTerrain } from "./CForgeTerrain.js";
import { CForgePoly } from "../../../plugin/ForgeBuild/CForgePoly.js";
import { CForgeTheme } from "../../../plugin/ForgeBuild/CForgeTheme.js";
export class CForgeSample {
    static Rect(_c, _w, _d, _a) {
        const cs = Math.cos(_a), sn = Math.sin(_a);
        return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => [
            _c[0] + x * _w * 0.5 * cs - z * _d * 0.5 * sn,
            _c[1] + x * _w * 0.5 * sn + z * _d * 0.5 * cs,
        ]);
    }
    static sPresets = [["castle", "성곽 마을"], ["fort", "언덕 요새"], ["village", "작은 마을"], ["shapes", "건물 모양 모음"], ["street", "거리 시설(가로등·상점)"]];
    static Shape(_unit, _c, _w, _d, _a) {
        const cs = Math.cos(_a), sn = Math.sin(_a);
        return _unit.map(([x, z]) => { const lx = (x - 0.5) * _w, lz = (z - 0.5) * _d; return [_c[0] + lx * cs - lz * sn, _c[1] + lx * sn + lz * cs]; });
    }
    static House(_h, _poly, _height, _roof = 0) {
        _h.Push(CForgeScene.eKind.Building, { id: 0, seed: 0, poly: _poly, height: _height, roof: _roof, roofH: 0, glue: [] });
    }
    static Preset(_h, _scene, _key) {
        const K = CForgeScene.eKind, C = [64, 64];
        _h.Begin("preset");
        for (const k of CForgeScene.sKindList)
            for (const e of _scene.List(k))
                _h.Remove(k, e.id);
        if (_key == "castle")
            CForgeSample.Random(_h, _scene.mSeed * 31 + 1, C);
        else if (_key == "fort") {
            const ring = [[44, 46, 9], [84, 44, 10], [86, 82, 9], [46, 86, 8.5]];
            _h.Push(K.Wall, { id: 0, seed: 0, pts: [...ring, ring[0].slice()], thick: 1.4, style: 0 });
            ring.forEach((_p, _i) => _h.Push(K.Tower, { id: 0, seed: 0, c: [_p[0], _p[1]], r: _i % 2 ? 3.6 : 2.6, height: 13, roof: 0, roofH: 0, shape: 0 }));
            _h.Push(K.Tower, { id: 0, seed: 0, c: [66, 62], r: 4.2, height: 18, roof: 4, roofH: 0, shape: 1 });
            _h.Push(K.Path, { id: 0, seed: 0, pts: [[64, 20], [65, 40], [66, 55]], width: 2.6 });
            CForgeSample.House(_h, CForgeSample.Shape([[0, 0], [1, 0], [1, 1], [0, 1]], [56, 82], 9, 6, 0.05), 4.5);
            CForgeSample.House(_h, CForgeSample.Shape([[0, 0], [1, 0], [1, 1], [0, 1]], [80, 70], 6, 8, 1.6), 3.5);
        }
        else if (_key == "village") {
            const path = [[30, 70], [45, 62], [62, 64], [78, 56], [98, 60]];
            _h.Push(K.Path, { id: 0, seed: 0, pts: path, width: 2.2 });
            const R = new CForgeRand(_scene.mSeed + 5);
            for (let i = 0; i < 7; i++) {
                const t = (i + 0.5) / 7, k = Math.min(path.length - 2, Math.floor(t * (path.length - 1))), f = t * (path.length - 1) - k;
                const a = path[k], b = path[k + 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), side = i % 2 ? 1 : -1;
                const c = [a[0] + dx * f - dz / l * side * 7, a[1] + dz * f + dx / l * side * 7];
                const unit = i == 2 ? [[0, 0], [1, 0], [1, 0.5], [0.5, 0.5], [0.5, 1], [0, 1]] : [[0, 0], [1, 0], [1, 1], [0, 1]];
                CForgeSample.House(_h, CForgeSample.Shape(unit, c, R.Range(6, 9), R.Range(5, 7), Math.atan2(dz, dx) + R.Range(-0.15, 0.15)), R.Range(3, 6));
                if (i % 3 == 0) {
                    const g = [[c[0] - dz / l * side * 5 - dx / l * 4, c[1] + dx / l * side * 5 - dz / l * 4], [c[0] - dz / l * side * 7, c[1] + dx / l * side * 7], [c[0] - dz / l * side * 5 + dx / l * 4, c[1] + dx / l * side * 5 + dz / l * 4]];
                    _h.Push(K.Fence, { id: 0, seed: 0, pts: g, style: 0 });
                }
            }
            _h.Push(K.Tower, { id: 0, seed: 0, c: [64, 46], r: 2, height: 10, roof: 0, roofH: 0, shape: 0 });
        }
        else if (_key == "shapes") {
            const shapes = [
                [[0, 0], [1, 0], [1, 1], [0, 1]],
                [[0, 0], [1, 0], [1, 0.45], [0.45, 0.45], [0.45, 1], [0, 1]],
                [[0, 0], [1, 0], [1, 1], [0.7, 1], [0.7, 0.4], [0.3, 0.4], [0.3, 1], [0, 1]],
                [[0, 0], [1, 0], [1, 0.4], [0.65, 0.4], [0.65, 1], [0.35, 1], [0.35, 0.4], [0, 0.4]],
                [[0.33, 0], [0.66, 0], [0.66, 0.33], [1, 0.33], [1, 0.66], [0.66, 0.66], [0.66, 1], [0.33, 1], [0.33, 0.66], [0, 0.66], [0, 0.33], [0.33, 0.33]],
                [[0.1, 0], [0.9, 0.1], [1, 0.6], [0.6, 1], [0, 0.8]],
            ];
            shapes.forEach((_u, _i) => {
                const c = [40 + (_i % 3) * 24, 50 + Math.floor(_i / 3) * 26];
                CForgeSample.House(_h, CForgeSample.Shape(_u, c, 12, 11, _i * 0.35), 4 + (_i % 2) * 2.5);
            });
        }
        else if (_key == "street") {
            const MO = CForgeTheme.eMonument, z0 = 64;
            _h.Push(K.Path, { id: 0, seed: 0, pts: [[16, z0], [112, z0]], width: 4, style: 2 });
            for (let i = 0; i < 10; i++) {
                const x = 24 + i * 9, side = i % 2 ? 1 : -1;
                _h.Push(K.Monument, { id: 0, seed: 0, c: [x, z0 + side * 3.6], size: 2.2, over: { mMonument: MO.Lamp } });
            }
            for (let i = 0; i < 5; i++) {
                const x = 30 + i * 18, side = i % 2 ? 1 : -1;
                _h.Push(K.Monument, { id: 0, seed: 0, c: [x, z0 + side * 7.2], size: 2.4, over: { mMonument: MO.Shop } });
            }
        }
        _h.End();
    }
    static LShape(_c, _w, _d, _a) {
        const cs = Math.cos(_a), sn = Math.sin(_a);
        return [[0, 0], [1, 0], [1, 0.45], [0.45, 0.45], [0.45, 1], [0, 1]].map(([x, z]) => {
            const lx = (x - 0.5) * _w, lz = (z - 0.5) * _d;
            return [_c[0] + lx * cs - lz * sn, _c[1] + lx * sn + lz * cs];
        });
    }
    static sMainW = 3;
    static sLaneW = 1.3;
    static sStairW = 1.6;
    static Random(_hist, _seed, _c = [64, 64], _t = null) {
        const K = CForgeScene.eKind, R = new CForgeRand(_seed);
        const G = (_x, _z) => _t == null ? 0 : _t.HeightM(_x, _z);
        const Clip = (_p) => [Math.min(125, Math.max(3, _p[0])), Math.min(125, Math.max(3, _p[1]))];
        const AngGap = (_a, _b) => Math.abs(Math.atan2(Math.sin(_a - _b), Math.cos(_a - _b)));
        _hist.Begin("sample");
        const ring = [];
        const n = R.Int(6, 9), rad = R.Range(16, 22);
        for (let i = 0; i <= n; i++) {
            const a = (i % n) / n * Math.PI * 2, r = rad * R.Range(0.85, 1.1);
            ring.push([_c[0] + Math.cos(a) * r, _c[1] + Math.sin(a) * r, R.Range(2.5, 5.5)]);
        }
        ring[n] = [...ring[0]];
        _hist.Push(K.Wall, { id: 0, seed: 0, pts: ring, thick: 0.9, style: 0 });
        const pa = R.Range(0, Math.PI * 2), ux = Math.cos(pa), uz = Math.sin(pa), vx = -uz, vz = ux;
        const At = (_along, _side) => [_c[0] + ux * _along + vx * _side, _c[1] + uz * _along + vz * _side];
        const gateAng = [pa, pa + Math.PI], towers = [];
        for (let i = 0, tries = 0; i < 2 && tries < 20; tries++) {
            const k = R.Int(0, n - 1), p = ring[k], a = Math.atan2(p[1] - _c[1], p[0] - _c[0]);
            if (gateAng.some(_g => AngGap(a, _g) < 0.6) || towers.some(_q => Math.hypot(_q[0] - p[0], _q[1] - p[1]) < 8))
                continue;
            towers.push([p[0], p[1]]);
            _hist.Push(K.Tower, { id: 0, seed: 0, c: [p[0], p[1]], r: R.Range(1.8, 3.8), height: R.Range(7, 11), roof: CForgeScene.eRoof.Auto, roofH: R.Range(3, 5) });
            i++;
        }
        const reach = rad * 1.3, half = CForgeSample.sMainW * 0.5;
        _hist.Push(K.Path, { id: 0, seed: 0, pts: [-1, -0.5, 0, 0.5, 1].map(_t => At(_t * reach, 0)), width: CForgeSample.sMainW, style: 2 });
        const houses = [], hpoly = [], want = R.Int(4, 7);
        const Blocked = (_a, _b, _pad) => hpoly.some(_p => {
            const q = CForgePoly.Offset(_p, _pad);
            if (CForgePoly.InPoly(_a[0], _a[1], q) || CForgePoly.InPoly(_b[0], _b[1], q))
                return true;
            return q.some((_v, _i) => { const r = CForgePoly.SegInter(_a, _b, _v, q[(_i + 1) % q.length]); return r != null && r.t >= 0 && r.t <= 1 && r.u >= 0 && r.u <= 1; });
        });
        let chAlong = 0, chSide = -1;
        {
            const CL = Math.min(17, Math.max(11, rad * 0.78)), CW = CL * 0.5;
            for (let tries = 0; tries < 20; tries++) {
                const along = R.Range(-0.3, 0.3) * rad, side = R.Chance(0.5) ? 1 : -1, off = half + 2.2 + CW * 0.5;
                const c = At(along, side * off), poly = CForgeSample.Rect(c, CL, CW, pa);
                if (poly.some(_q => Math.hypot(_q[0] - _c[0], _q[1] - _c[1]) > rad * 0.8))
                    continue;
                houses.push([c[0], c[1], Math.hypot(CL, CW) * 0.5]);
                hpoly.push(CForgePoly.Orient(poly));
                _hist.Push(K.Church, { id: 0, seed: 0, poly });
                _hist.Push(K.Path, { id: 0, seed: 0, pts: [At(along, side * (half - 0.05)), At(along, side * (off - CW * 0.5 + 0.2))], width: 2, style: 2 });
                chAlong = along;
                chSide = side;
                break;
            }
        }
        {
            const m = At(chAlong, -chSide * (half + 2.3));
            houses.push([m[0], m[1], 4]);
            hpoly.push(CForgePoly.Orient(CForgeSample.Rect(m, 3, 3, pa)));
            _hist.Push(K.Monument, { id: 0, seed: 0, c: m, size: 2 });
        }
        for (let tries = 0, built = 0; built < want && tries < 60; tries++) {
            const along = R.Range(-0.62, 0.62) * rad, side = R.Chance(0.5) ? 1 : -1, first = built == 0;
            const bw = R.Range(5, 8) + (first ? 2 : 0), bd = R.Range(4.5, 6.5) + (first ? 2 : 0), off = half + 1.6 + bd * 0.5 + R.Range(0, 2);
            const c = At(along, side * off), r = Math.hypot(bw, bd) * 0.5;
            if (Math.hypot(c[0] - _c[0], c[1] - _c[1]) + r > rad * 0.8)
                continue;
            if (houses.some(_h => Math.hypot(_h[0] - c[0], _h[1] - c[1]) < (_h[2] + r) * 0.82))
                continue;
            if (side == -chSide && Math.abs(along - chAlong) < 3.2)
                continue;
            houses.push([c[0], c[1], r]);
            built++;
            const ang = pa + R.Range(-0.06, 0.06);
            const poly = first ? CForgeSample.LShape(c, bw, bd, ang) : CForgeSample.Rect(c, bw, bd, ang);
            hpoly.push(CForgePoly.Orient(poly));
            _hist.Push(K.Building, { id: 0, seed: 0, poly, height: R.Range(3, 6.5), roof: CForgeScene.eRoof.Auto, roofH: R.Range(2, 3.5), glue: [] });
            _hist.Push(K.Path, { id: 0, seed: 0, pts: [At(along, side * (half - 0.05)), At(along, side * (off - bd * 0.5 - 0.35))], width: CForgeSample.sLaneW, style: 1 });
        }
        let riverEnd = 0;
        if (_t != null) {
            const d0 = Math.abs(_t.RiverX(At(-reach, 0)[1]) - At(-reach, 0)[0]), d1 = Math.abs(_t.RiverX(At(reach, 0)[1]) - At(reach, 0)[0]);
            if (Math.min(d0, d1) < 60)
                riverEnd = d0 < d1 ? -1 : 1;
        }
        for (const end of [-1, 1]) {
            const e = At(end * reach, 0), road = [e];
            if (end == riverEnd) {
                const out = At(end * (reach + rad * 0.45), 0);
                const zb = out[1] + R.Range(-3, 3), xr = _t.RiverX(zb), dir = xr > out[0] ? 1 : -1, bank = CForgeTerrain.sBankHalf - 0.2;
                road.push(out, [xr - dir * (bank + 4), zb], [xr - dir * bank, zb]);
                _hist.Push(K.Path, { id: 0, seed: 0, pts: road.map(Clip), width: 2.4, style: 1 });
                _hist.Push(K.Bridge, { id: 0, seed: 0, pts: [[xr - dir * bank, zb], [xr + dir * bank, zb]], width: 3.2 });
                _hist.Push(K.Path, { id: 0, seed: 0, pts: [[xr + dir * bank, zb], [xr + dir * (bank + 6), zb + R.Range(-2, 2)], [xr + dir * (bank + 14), zb + R.Range(-5, 5)]].map(_q => Clip(_q)), width: 2.4, style: 1 });
                const zd = zb + (R.Chance(0.5) ? 1 : -1) * R.Range(9, 13), xd = _t.RiverX(zd), deck = CForgeTerrain.sWaterY + 0.75;
                let ds = -1;
                for (let d = 0.5; d < bank; d += 0.25)
                    if (G(xd - dir * d, zd) >= deck - 0.05) {
                        ds = d;
                        break;
                    }
                if (ds > 3 && zd > 4 && zd < 124) {
                    const de = Math.max(0.6, ds - 6.5);
                    _hist.Push(K.Dock, { id: 0, seed: 0, pts: [[xd - dir * ds, zd], [xd - dir * de, zd]], width: 2, deck });
                    _hist.Push(K.Path, { id: 0, seed: 0, pts: [[xr - dir * (bank + 4), zb], [xd - dir * (ds + 3), (zb + zd) * 0.5 + (zd - zb) * 0.3], [xd - dir * (ds - 0.1), zd]], width: 1.8, style: 1 });
                }
                continue;
            }
            for (let k = 1; k <= 3; k++)
                road.push(At(end * (reach + rad * 0.27 * k), R.Range(-2.5, 2.5) * k));
            _hist.Push(K.Path, { id: 0, seed: 0, pts: road.map(Clip), width: 2.4, style: 1 });
        }
        const curve = new CForgeCurve(CForgeSpline.Sample(ring.map(_q => [_q[0], _q[1], _q[2], G(_q[0], _q[1])]), 0.35));
        const order = [];
        for (let s = R.Range(0, 2.5); s < curve.mLen; s += 2.5)
            order.push(s);
        order.sort(() => R.Next() - 0.5);
        let stairs = 0;
        const placed = [];
        for (const s of order) {
            if (stairs >= 2)
                break;
            const p = curve.At(s).p, rise = p[2], a = Math.atan2(p[1] - _c[1], p[0] - _c[0]);
            if (rise < 2.2 || gateAng.some(_g => AngGap(a, _g) < 0.7) || towers.some(_q => Math.hypot(_q[0] - p[0], _q[1] - p[1]) < 7))
                continue;
            const run = rise * 1.3, q = curve.At(s - run).p;
            if (towers.some(_t2 => Math.hypot(_t2[0] - q[0], _t2[1] - q[1]) < 6))
                continue;
            const dl = Math.hypot(p[0] - q[0], p[1] - q[1]);
            let nx = -(p[1] - q[1]) / dl, nz = (p[0] - q[0]) / dl;
            if (nx * (_c[0] - p[0]) + nz * (_c[1] - p[1]) < 0) {
                nx = -nx;
                nz = -nz;
            }
            const off = 0.45 + CForgeSample.sStairW * 0.5 + 0.1;
            const lo = [q[0] + nx * off, q[1] + nz * off], hi = [p[0] + nx * off, p[1] + nz * off];
            const tx = (p[0] - q[0]) / dl, tz = (p[1] - q[1]) / dl, land = [hi[0] + tx * CForgeSample.sStairW, hi[1] + tz * CForgeSample.sStairW];
            if (towers.some(_t2 => Math.hypot(_t2[0] - land[0], _t2[1] - land[1]) < 5.5) || placed.some(_q => Math.hypot(_q[0] - p[0], _q[1] - p[1]) < run + 10))
                continue;
            if (Blocked(lo, land, CForgeSample.sStairW * 0.5 + 0.6))
                continue;
            const foot = [lo[0] - tx * 0.1, lo[1] - tz * 0.1];
            const along0 = (foot[0] - _c[0]) * ux + (foot[1] - _c[1]) * uz, side = Math.sign((foot[0] - _c[0]) * vx + (foot[1] - _c[1]) * vz);
            let road = null;
            for (const d of [0, 2, -2, 4, -4, 6, -6, 8, -8]) {
                const r = At(Math.min(reach * 0.85, Math.max(-reach * 0.85, along0 + d)), side * (half - 0.05));
                if (!Blocked(r, foot, CForgeSample.sLaneW * 0.5 + 0.3)) {
                    road = r;
                    break;
                }
            }
            if (road == null)
                continue;
            _hist.Push(K.Stair, { id: 0, seed: 0, pts: [lo, hi], width: CForgeSample.sStairW, top: p[3] + rise - G(hi[0], hi[1]) });
            _hist.Push(K.Path, { id: 0, seed: 0, pts: [road, foot], width: CForgeSample.sLaneW, style: 1 });
            stairs++;
            placed.push([p[0], p[1]]);
        }
        const fa = pa + Math.PI * 0.5;
        const fence = [];
        for (let i = 0; i <= 4; i++)
            fence.push([_c[0] + Math.cos(fa) * (rad + 6 + i * 3), _c[1] + Math.sin(fa) * (rad + 6 + i * 3) + R.Range(-1, 1)]);
        _hist.Push(K.Fence, { id: 0, seed: 0, pts: fence, style: 0 });
        _hist.End();
    }
}
