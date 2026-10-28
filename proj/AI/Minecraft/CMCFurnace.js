import { MCItem } from "./CMCItem.js";
import { MC_FUEL, MC_SMELT } from "./CMCRecipe.js";
export const MC_SMELT_TIME = 10;
export class CMCFurnace {
    mIn = null;
    mFuel = null;
    mOut = null;
    mBurn = 0;
    mBurnMax = 0;
    mCook = 0;
    CanSmelt() {
        if (this.mIn == null)
            return false;
        const res = MC_SMELT[this.mIn.id];
        if (res == null)
            return false;
        return this.mOut == null || (this.mOut.id == res && this.mOut.n < MCItem(res).stack);
    }
    Update(_dt) {
        const can = this.CanSmelt();
        if (this.mBurn <= 0 && can && this.mFuel != null && MC_FUEL[this.mFuel.id] != null) {
            this.mBurn = this.mBurnMax = MC_FUEL[this.mFuel.id];
            if (--this.mFuel.n <= 0)
                this.mFuel = null;
        }
        if (this.mBurn > 0) {
            this.mBurn = Math.max(0, this.mBurn - _dt);
            if (!can) {
                this.mCook = 0;
                return;
            }
            this.mCook += _dt;
            if (this.mCook < MC_SMELT_TIME)
                return;
            this.mCook = 0;
            const res = MC_SMELT[this.mIn.id];
            if (this.mOut == null)
                this.mOut = { id: res, n: 1, d: 0 };
            else
                this.mOut.n++;
            if (--this.mIn.n <= 0)
                this.mIn = null;
            return;
        }
        this.mCook = Math.max(0, this.mCook - _dt * 2);
    }
}
export class CMCFurnaceMgr {
    mMap = new Map();
    Get(_off) {
        let f = this.mMap.get(_off);
        if (f == null) {
            f = new CMCFurnace();
            this.mMap.set(_off, f);
        }
        return f;
    }
    Remove(_off) {
        const f = this.mMap.get(_off);
        this.mMap.delete(_off);
        return f ?? null;
    }
    Update(_dt) {
        for (const f of this.mMap.values())
            f.Update(_dt);
    }
}
