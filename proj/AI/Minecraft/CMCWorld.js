import { CVoxelMap, CVTile } from "../../../Artgine/artgine/app/subject/CVoxelMap.js";
import { CVoxPlane } from "../../../Artgine/artgine/app/component/paint/CPaintVoxel.js";
import { CCIndex } from "../../../Artgine/artgine/app/canvas/CCIndex.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CTexture } from "../../../Artgine/artgine/render/CTexture.js";
import { CAtlas } from "../../../Artgine/artgine/util/CAtlas.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CUtilMath } from "../../../Artgine/artgine/geometry/CUtilMath.js";
import { MC_BLOCK, MC_BLOCK_LIST, MCAtlasBuild, MCKey } from "./CMCBlock.js";
import { MCItemBuildIcons } from "./CMCItem.js";
export const MC_SIZE = 100;
export const MC_COLLIDER_LAYER = "voxel";
class CMCNoise {
    mSeed;
    constructor(_seed) {
        this.mSeed = _seed;
    }
    Hash(_x, _y, _z) {
        let h = Math.imul(_x, 374761393) ^ Math.imul(_y, 668265263) ^ Math.imul(_z, 1274126177) ^ Math.imul(this.mSeed, 2246822519);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    }
    Smooth(_t) {
        return _t * _t * (3 - 2 * _t);
    }
    Value3(_x, _y, _z) {
        const ix = Math.floor(_x), iy = Math.floor(_y), iz = Math.floor(_z);
        const fx = this.Smooth(_x - ix), fy = this.Smooth(_y - iy), fz = this.Smooth(_z - iz);
        const l = (_a, _b, _t) => _a + (_b - _a) * _t;
        const x00 = l(this.Hash(ix, iy, iz), this.Hash(ix + 1, iy, iz), fx);
        const x10 = l(this.Hash(ix, iy + 1, iz), this.Hash(ix + 1, iy + 1, iz), fx);
        const x01 = l(this.Hash(ix, iy, iz + 1), this.Hash(ix + 1, iy, iz + 1), fx);
        const x11 = l(this.Hash(ix, iy + 1, iz + 1), this.Hash(ix + 1, iy + 1, iz + 1), fx);
        return l(l(x00, x10, fy), l(x01, x11, fy), fz);
    }
    Fbm2(_x, _z) {
        let sum = 0, amp = 0.5, freq = 1, norm = 0;
        for (let i = 0; i < 3; ++i) {
            sum += this.Value3(_x * freq, 0, _z * freq) * amp;
            norm += amp;
            amp *= 0.5;
            freq *= 2;
        }
        return sum / norm;
    }
}
export class CMCWorld extends CVoxelMap {
    mFaceAtlas = new Map();
    mTorchMap = new Map();
    mSeaLevel = 9;
    async Prepare() {
        this.mAtlasNormal = new CAtlas("Voxel/");
        this.mAtlasMaterial = new CAtlas("Voxel/");
        for (const atlas of [this.mAtlas, this.mAtlasNormal, this.mAtlasMaterial]) {
            atlas.mPadding = 8;
            atlas.SetFilter(CTexture.eFilter.Nearest);
        }
        const idx = await MCAtlasBuild(this.mAtlas, this.mAtlasNormal, this.mAtlasMaterial);
        MCItemBuildIcons();
        for (const b of MC_BLOCK_LIST) {
            const faces = [idx.get(b.top), idx.get(b.bottom), idx.get(b.side)];
            this.mFaceAtlas.set(MCKey(b.id), faces);
            const tile = new CVTile(MCKey(b.id), faces[2], b.id == MC_BLOCK.Water ? "" : MC_COLLIDER_LAYER, b.name);
            tile.mLightPass = b.id == MC_BLOCK.Water || b.id == MC_BLOCK.Glass;
            this.PushTile(tile);
        }
        this.mLight = true;
    }
    PlaneRefresh(_index) {
        super.PlaneRefresh(_index);
        const cnt = this.mBuf.mCount;
        const key = this.mBuf.RGB(_index.x + _index.y * cnt.x + _index.z * cnt.x * cnt.y);
        if (key == 0)
            return;
        const faces = this.mFaceAtlas.get(key);
        if (faces == null)
            return;
        for (let i = 0; i < 6; ++i) {
            const plane = this.mPlane[i];
            if (plane.mDir == CVoxPlane.eDir.Null)
                continue;
            this.mAtlas.GetUV(i == 0 ? faces[0] : i == 1 ? faces[1] : faces[2], plane.mUV);
        }
    }
    IsBlock(_cim, _add) {
        if (!super.IsBlock(_cim, _add))
            return false;
        const nid = this.GetBlock(_cim.x + _add.x, _cim.y + _add.y, _cim.z + _add.z);
        if (nid != MC_BLOCK.Glass)
            return true;
        return this.GetBlock(_cim.x, _cim.y, _cim.z) == MC_BLOCK.Glass;
    }
    InRange(_x, _y, _z) {
        const c = this.mBuf.mCount;
        return _x >= 0 && _x < c.x && _y >= 0 && _y < c.y && _z >= 0 && _z < c.z;
    }
    GetBlock(_x, _y, _z) {
        if (!this.InRange(_x, _y, _z))
            return 0;
        const c = this.mBuf.mCount;
        return this.mBuf.GetBuf()[_x + _y * c.x + _z * c.x * c.y] >>> 24;
    }
    SetBlock(_x, _y, _z, _id) {
        if (!this.InRange(_x, _y, _z))
            return;
        this.TorchSupportCheck(_x, _y, _z);
        this.Bonds(new CCIndex(_x, _y, _z), _id == 0 ? 0 : MCKey(_id));
        if (_id == 0)
            return;
        const dir = CCIndex.DirArr();
        for (let i = 0; i < 6; ++i) {
            if (!this.InRange(_x + dir[i].x, _y + dir[i].y, _z + dir[i].z))
                continue;
            this.mUpdateModify.add(new CCIndex(_x + dir[i].x, _y + dir[i].y, _z + dir[i].z));
        }
    }
    PlaceTorch(_x, _y, _z, _nx, _ny, _nz) {
        if (_ny < 0 || !this.InRange(_x, _y, _z) || this.GetBlock(_x, _y, _z) != MC_BLOCK.Air)
            return false;
        const c = this.mBuf.mCount;
        const off = _x + _y * c.x + _z * c.x * c.y;
        if (this.mTorchMap.has(off))
            return false;
        const S = MC_SIZE;
        let px = (_x + 0.5) * S, py = _y * S, pz = (_z + 0.5) * S;
        if (_ny == 0) {
            px -= _nx * 40;
            pz -= _nz * 40;
            py += 10;
        }
        const root = this.PushChild(new CSubject());
        root.SetPos(new CVec3(px, py, pz));
        const part = (_y0, _sy, _color) => {
            const sub = root.PushChild(new CSubject());
            sub.SetPos(new CVec3(0, _y0, 0));
            sub.SetSca(new CVec3(14, _sy, 14));
            const pt = sub.PushComp(new CPaint3D());
            pt.SetTexture(this.GetFrame().Pal().GetBlackTex());
            pt.SetColorModel(_color);
        };
        part(25, 50, new CColor(0.4, 0.26, 0.12, CColor.eModel.RGBAdd));
        part(57, 14, new CColor(1, 0.65, 0.15, CColor.eModel.RGBAdd));
        this.mTorchMap.set(off, {
            sub: root, sx: _x - _nx, sy: _y - _ny, sz: _z - _nz,
            min: new CVec3(px - 10, py, pz - 10), max: new CVec3(px + 10, py + 64, pz + 10),
        });
        this.TorchPush(new CCIndex(_x, _y, _z), CVoxelMap.LightMax);
        return true;
    }
    RemoveTorch(_off) {
        const t = this.mTorchMap.get(_off);
        if (t == null)
            return;
        t.sub.Destroy();
        this.mTorchMap.delete(_off);
        const c = this.mBuf.mCount;
        this.TorchRemove(new CCIndex(_off % c.x, Math.floor(_off / c.x) % c.y, Math.floor(_off / (c.x * c.y))));
    }
    PickTorch(_ray, _ex, _ey, _ez, _max) {
        let best = null;
        for (const [off, t] of this.mTorchMap) {
            const lray = _ray.Export();
            if (!CUtilMath.RayBoxIS(t.min, t.max, lray))
                continue;
            const p = lray.GetPosition();
            const d = Math.hypot(p.x - _ex, p.y - _ey, p.z - _ez);
            if (d <= _max && (best == null || d < best.dist))
                best = { off, dist: d };
        }
        return best;
    }
    TorchSupportCheck(_x, _y, _z) {
        const c = this.mBuf.mCount;
        for (const [off, t] of Array.from(this.mTorchMap))
            if (t.sx == _x && t.sy == _y && t.sz == _z)
                this.RemoveTorch(off);
        const own = _x + _y * c.x + _z * c.x * c.y;
        if (this.mTorchMap.has(own))
            this.RemoveTorch(own);
    }
    FindSpawn() {
        const c = this.mBuf.mCount;
        const cx = Math.floor(c.x / 2), cz = Math.floor(c.z / 2);
        for (let r = 0; r < Math.min(cx, cz) - 2; ++r) {
            for (let dz = -r; dz <= r; ++dz) {
                for (let dx = -r; dx <= r; ++dx) {
                    if (Math.max(Math.abs(dx), Math.abs(dz)) != r)
                        continue;
                    const x = cx + dx, z = cz + dz;
                    for (let y = c.y - 1; y >= 0; --y) {
                        const id = this.GetBlock(x, y, z);
                        if (id == MC_BLOCK.Air)
                            continue;
                        if (id == MC_BLOCK.Grass && this.GetBlock(x, y + 1, z) == MC_BLOCK.Air && this.GetBlock(x, y + 2, z) == MC_BLOCK.Air)
                            return new CVec3((x + 0.5) * MC_SIZE, (y + 1) * MC_SIZE, (z + 0.5) * MC_SIZE);
                        break;
                    }
                }
            }
        }
        return new CVec3((cx + 0.5) * MC_SIZE, c.y * MC_SIZE, (cz + 0.5) * MC_SIZE);
    }
    Generate(_seed) {
        const c = this.mBuf.mCount;
        const nx = c.x, ny = c.y, nz = c.z;
        const buf = this.mBuf.GetBuf();
        buf.fill(0x000000FF);
        const noise = new CMCNoise(_seed);
        this.mSeaLevel = Math.round(ny * 0.28);
        const sea = this.mSeaLevel;
        const snowLine = Math.round(ny * 0.72);
        const Put = (_x, _y, _z, _id) => {
            if (!this.InRange(_x, _y, _z))
                return;
            buf[_x + _y * nx + _z * nx * ny] = (MCKey(_id) | 0xFF) >>> 0;
        };
        const heights = new Int32Array(nx * nz);
        for (let z = 0; z < nz; ++z) {
            for (let x = 0; x < nx; ++x) {
                const f = noise.Fbm2(x * 0.035, z * 0.035);
                let h = Math.floor(sea + ny * 0.25 + (f - 0.5) * 2 * ny * 0.55);
                h = Math.max(2, Math.min(ny - 9, h));
                heights[x + z * nx] = h;
                const beach = h <= sea + 1;
                let topId = MC_BLOCK.Grass;
                if (beach)
                    topId = MC_BLOCK.Sand;
                else if (h >= snowLine)
                    topId = MC_BLOCK.Snow;
                else if (noise.Value3(x * 0.06, 3, z * 0.06) > 0.78)
                    topId = MC_BLOCK.Gravel;
                for (let y = 0; y <= h; ++y) {
                    let id = MC_BLOCK.Stone;
                    if (y == h)
                        id = topId;
                    else if (y >= h - 3)
                        id = beach ? MC_BLOCK.Sand : MC_BLOCK.Dirt;
                    if (y == 0 || (y == 1 && noise.Hash(x, 1, z) < 0.5))
                        id = MC_BLOCK.Bedrock;
                    if (y > 2 && y < h - 2 && noise.Value3(x * 0.1, y * 0.12, z * 0.1 + 100) > 0.72)
                        continue;
                    Put(x, y, z, id);
                }
                for (let y = h + 1; y <= sea; ++y)
                    Put(x, y, z, MC_BLOCK.Water);
            }
        }
        const veins = [
            { id: MC_BLOCK.CoalOre, lo: 0, hi: 0.0030, maxY: 1.0, size: 6 },
            { id: MC_BLOCK.IronOre, lo: 0.0030, hi: 0.0042, maxY: 0.5, size: 4 },
            { id: MC_BLOCK.GoldOre, lo: 0.0042, hi: 0.0048, maxY: 0.3, size: 3 },
            { id: MC_BLOCK.DiamondOre, lo: 0.0048, hi: 0.0051, maxY: 0.2, size: 3 },
        ];
        const stoneKey = (MCKey(MC_BLOCK.Stone) | 0xFF) >>> 0;
        for (let z = 0; z < nz; ++z) {
            for (let y = 2; y < ny; ++y) {
                for (let x = 0; x < nx; ++x) {
                    if (buf[x + y * nx + z * nx * ny] != stoneKey)
                        continue;
                    const hv = noise.Hash(x * 3 + 1, y * 5 + 2, z * 7 + 3);
                    if (hv >= 0.0051)
                        continue;
                    for (const v of veins) {
                        if (hv < v.lo || hv >= v.hi || y >= ny * v.maxY)
                            continue;
                        Put(x, y, z, v.id);
                        for (let k = 1; k < v.size; ++k) {
                            const ox = x + Math.floor(noise.Hash(x + k * 13, y, z + k) * 3) - 1;
                            const oy = y + Math.floor(noise.Hash(x, y + k * 7, z) * 3) - 1;
                            const oz = z + Math.floor(noise.Hash(x, y, z + k * 3) * 3) - 1;
                            if (this.InRange(ox, oy, oz) && buf[ox + oy * nx + oz * nx * ny] == stoneKey)
                                Put(ox, oy, oz, v.id);
                        }
                        break;
                    }
                }
            }
        }
        const trees = [];
        for (let z = 3; z < nz - 3; ++z) {
            for (let x = 3; x < nx - 3; ++x) {
                const h = heights[x + z * nx];
                if (h <= sea + 1 || this.GetBlock(x, h, z) != MC_BLOCK.Grass)
                    continue;
                if (noise.Hash(x, 7, z) > 0.012)
                    continue;
                if (trees.some(_t => Math.abs(_t[0] - x) < 4 && Math.abs(_t[1] - z) < 4))
                    continue;
                const th = 4 + Math.floor(noise.Hash(x, 9, z) * 2);
                const top = h + th;
                if (top + 2 >= ny)
                    continue;
                trees.push([x, z]);
                for (let ly = top - 1; ly <= top + 2; ++ly) {
                    const r = ly <= top ? 2 : 1;
                    for (let dz = -r; dz <= r; ++dz) {
                        for (let dx = -r; dx <= r; ++dx) {
                            const corner = Math.abs(dx) == r && Math.abs(dz) == r;
                            if (corner && (ly > top || noise.Hash(x + dx, ly, z + dz) < 0.5))
                                continue;
                            if (this.GetBlock(x + dx, ly, z + dz) == MC_BLOCK.Air)
                                Put(x + dx, ly, z + dz, MC_BLOCK.Leaves);
                        }
                    }
                }
                for (let ty = h + 1; ty <= top; ++ty)
                    Put(x, ty, z, MC_BLOCK.Log);
            }
        }
    }
}
