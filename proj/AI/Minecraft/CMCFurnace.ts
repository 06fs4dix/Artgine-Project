import { IMCStack, MCItem } from "./CMCItem.js";
import { MC_FUEL, MC_SMELT } from "./CMCRecipe.js";

export const MC_SMELT_TIME = 10;

export class CMCFurnace
{
    mIn: IMCStack = null;
    mFuel: IMCStack = null;
    mOut: IMCStack = null;
    mBurn = 0;
    mBurnMax = 0;
    mCook = 0;

    private CanSmelt(): boolean
    {
        if (this.mIn == null) return false;
        const res = MC_SMELT[this.mIn.id];
        if (res == null) return false;
        return this.mOut == null || (this.mOut.id == res && this.mOut.n < MCItem(res).stack);
    }

    Update(_dt: number)
    {
        const can = this.CanSmelt();
        if (this.mBurn <= 0 && can && this.mFuel != null && MC_FUEL[this.mFuel.id] != null)
        {
            this.mBurn = this.mBurnMax = MC_FUEL[this.mFuel.id];
            if (--this.mFuel.n <= 0) this.mFuel = null;
        }
        if (this.mBurn > 0)
        {
            this.mBurn = Math.max(0, this.mBurn - _dt);
            if (!can)
            {
                this.mCook = 0;
                return;
            }
            this.mCook += _dt;
            if (this.mCook < MC_SMELT_TIME) return;
            this.mCook = 0;
            const res = MC_SMELT[this.mIn.id];
            if (this.mOut == null) this.mOut = { id: res, n: 1, d: 0 };
            else this.mOut.n++;
            if (--this.mIn.n <= 0) this.mIn = null;
            return;
        }
        this.mCook = Math.max(0, this.mCook - _dt * 2);
    }
}

//화로 블록 칸 번호별 상태. 창을 닫아도 계속 진행한다
export class CMCFurnaceMgr
{
    private mMap = new Map<number, CMCFurnace>();

    Get(_off: number): CMCFurnace
    {
        let f = this.mMap.get(_off);
        if (f == null)
        {
            f = new CMCFurnace();
            this.mMap.set(_off, f);
        }
        return f;
    }
    Remove(_off: number): CMCFurnace
    {
        const f = this.mMap.get(_off);
        this.mMap.delete(_off);
        return f ?? null;
    }
    Update(_dt: number)
    {
        for (const f of this.mMap.values()) f.Update(_dt);
    }
}
