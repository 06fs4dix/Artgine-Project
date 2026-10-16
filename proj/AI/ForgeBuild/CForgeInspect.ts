import { CForgeScene } from "../../../plugin/ForgeBuild/CForgeScene.js";
import { CForgeHistory } from "../../../plugin/ForgeBuild/CForgeHistory.js";
import { CForgeTheme } from "../../../plugin/ForgeBuild/CForgeTheme.js";
import { CForgeRand } from "../../../plugin/ForgeBuild/CForgeRand.js";
import { CForgeHouseGen } from "../../../plugin/ForgeBuild/CForgeHouseGen.js";
import { CForgeSync } from "./CForgeSync.js";
import { CForgeHandle } from "./CForgeHandle.js";

//색 칸: 테마 항목 이름, 표시 이름, 후보 목록인지, 생성기가 후보를 고르는 방법(양수 = 해시 소금, -1 = 시드 나머지, 0 = 첫 후보)
interface IForgeColField { key : string; label : string; list : boolean; salt : number; }
type ForgeSelField = [string, string, [string, number][], number];

//선택한 오브젝트 검사창: 재질 종류와 색을 그 오브젝트만 덮어쓴다(장면 데이터 over → 공장 mOverride). 바꿀 때마다 실행 취소 한 번
export class CForgeInspect
{
    static sKindName : Record<string, string> = { wall : "성벽", building : "건물", tower : "탑", path : "길", fence : "울타리", bridge : "다리", stair : "계단", church : "교회", dock : "선착장", monument : "기념탑" };
    static sListKind = new Set(["mHouseWall", "mRoofKind"]);

    mEl : HTMLElement;
    mScene : CForgeScene;
    mHistory : CForgeHistory;
    mSync : CForgeSync;
    mHandle : CForgeHandle;
    private mLast = "";

    constructor(_el : HTMLElement, _scene : CForgeScene, _history : CForgeHistory, _sync : CForgeSync, _handle : CForgeHandle)
    {
        this.mEl = _el; this.mScene = _scene; this.mHistory = _history; this.mSync = _sync; this.mHandle = _handle;
        _handle.mOnSelect = () => this.Render();
    }

    private Ent() : any
    {
        const s = this.mHandle.mSel;
        return s == null ? null : this.mScene.Find<any>(s.kind, s.id);
    }

    //실행 취소·다른 경로로 바뀌었으면 다시 그린다(색 고르는 중에는 건드리지 않는다)
    Refresh()
    {
        if(this.mEl.contains(document.activeElement)) return;
        const e = this.Ent(), key = JSON.stringify([this.mHandle.mSel, e?.over ?? null, e?.style ?? null, this.mSync.mTheme, this.mSync.Resolved(this.mHandle.mSel?.kind, e?.id)?.seed ?? 0]);
        if(key != this.mLast) this.Render();
    }

    Render()
    {
        const e = this.Ent();
        this.mLast = JSON.stringify([this.mHandle.mSel, e?.over ?? null, e?.style ?? null, this.mSync.mTheme, this.mSync.Resolved(this.mHandle.mSel?.kind, e?.id)?.seed ?? 0]);
        if(e == null) { this.mEl.innerHTML = ""; return; }
        const K = CForgeScene.eKind, kind = this.mHandle.mSel.kind, r = this.mSync.Resolved(kind, e.id);
        const over = e.over ?? {}, seed = r?.seed ?? e.seed, T = CForgeTheme.Of({ theme : this.mSync.mTheme, over }), E = CForgeTheme.eCulture, jp = T.mCulture == E.Japan, cn = T.mCulture == E.China;
        const MO = CForgeTheme.eMonument, FE = CForgeTheme.eFence;
        const RK = ["mRoof", "mThatch", "mShingle", "mTurf", "mRoof", "mRoof"], roofOpt : [string, number][] = [["기와", 0], ["초가", 1], ["너와", 2], ["잔디", 3], ["둥근 테라코타", 4], ["금속판", 5]];
        const C = (_key : string, _label : string, _list : boolean = false, _salt : number = 0) : IForgeColField => ({ key : _key, label : _label, list : _list, salt : _salt });
        const sels : ForgeSelField[] = [], cols : IForgeColField[] = [];
        if(kind == K.Building)
        {
            const rr = { ...(r ?? {}), seed, theme : this.mSync.mTheme, over };
            const wall = CForgeHouseGen.WallOf(rr), rk = CForgeHouseGen.RoofOf(rr), euro = wall < 4 || wall >= 10;
            sels.push(["mHouseWall", "벽 재질", [["회벽", 0], ["널판", 1], ["통나무", 2], ["돌", 3], ["벽돌", 10], ["흰 칠 널판", 11], ["기와집", 4], ["초가집", 5], ["마치야", 6], ["일본 초가", 7], ["사합원채", 8], ["휘파 민가", 9]], over.mHouseWall?.[0] ?? -1]);
            if(euro) sels.push(["mRoofKind", "지붕 재질", roofOpt, over.mRoofKind?.[0] ?? -1]);
            if(wall == 8) cols.push(C("mBrick", "벽돌"), C("mPillar", "기둥·창"), C("mBeam", "들보"));
            else if(wall == 10) cols.push(C("mBrick", "벽돌"));
            else if(wall == 11) cols.push(C("mClapboard", "벽", true, 1));
            else cols.push(wall == 3 ? C("mStone", "벽(돌)") : C(["mPlaster", "mPlankWall", "mLogWall", "mStone", "mPlaster", "mMud", "mPlaster", "mMud", "", "mPlaster"][wall], "벽", true, 1));
            cols.push(C(euro ? RK[rk] : wall == 5 || wall == 7 ? "mThatch" : "mRoof", "지붕", true, 3));
            if(wall == 8 || wall == 9) cols.push(C("mWallStone", "돌"));
            if(wall == 6 || wall == 7) cols.push(C("mBoard", "판벽"), C("mWood", "목재"), C("mStone", "돌"));
            if(wall == 6) cols.push(C("mCloth", "노렌", true, 5));
            if(wall < 6 || wall >= 10) cols.push(C("mShutter", "덧창", true, 2), C("mWood", "목재·문"), C("mStone", "돌"));
            if(euro && T.mBalcony) cols.push(C("mIron", "철 난간"));
            if(euro && T.mFlowerBox) cols.push(C("mFlower", "꽃", true, 4));
        }
        else if(kind == K.Wall)
        {
            sels.push(["mWallKind", "재질", [["돌", 0], ["목책", 1]], over.mWallKind ?? -1]);
            const st = e.style ?? 0, pal = st == 4 || (st == 0 && T.mWallKind == 1);
            if(pal) cols.push(C("mLogWood", "통나무", true, 0), C("mWood", "가로대"));
            else if(jp && T.mWallStyle == 1) cols.push(C("mGreen", "흙 둑"), C("mBoard", "판벽"), C("mShingle", "판자 지붕", true, 0));
            else if(jp) cols.push(C("mWallBody", "돌 축대"), C("mPlaster", "흙담", true, 0), C("mWallStone", "굽돌"), C("mWallCap", "기와"));
            else if(cn) cols.push(C("mWallBody", T.mWallStyle == 1 ? "판축 흙" : "벽돌"), C("mWallStone", "굽돌"), C("mWallCap", "갓돌"), C("mPillar", "성루 기둥"), C("mRoof", "성루 지붕", true, -1));
            else if(!T.East() && T.mWallStyle == 2) cols.push(C("mWallBody", "돌 벽"), C("mWallCap", "띠·흉벽 갓돌"), C("mGreen", "흙 둔덕"));
            else if(!T.East() && T.mWallStyle == 3) cols.push(C(T.mChurchMat == 2 ? "mBrick" : "mWallBody", "담"), C("mWallCap", "갓돌"), C("mIron", "쇠 문"));
            else cols.push(C("mWallBody", T.East() && T.mWallStyle == 1 ? "판축 흙" : "벽"), C("mWallStone", "기단"), C("mWallCap", T.East() ? "기와" : "덮개돌"));
        }
        else if(kind == K.Tower)
        {
            sels.push(["mTowerKind", "재질", [["돌", 0], ["나무 망루", 1]], over.mTowerKind ?? -1]);
            if(T.mTowerKind == 1)
            {
                sels.push(["mRoofKind", "지붕 재질", roofOpt, over.mRoofKind?.[0] ?? -1]);
                cols.push(C("mWood", "목재"), C(RK[T.mRoofKind[seed % T.mRoofKind.length]], "지붕", true, -1));
            }
            else if(T.mTowerStyle == 1) cols.push(C("mWallBody", "돌 벽"), C("mWallCap", "띠·초소 지붕"), C("mGreen", "윗면 풀"));
            else if(T.mTowerStyle == 2) cols.push(C(T.mChurchMat == 2 ? "mBrick" : T.mChurchMat == 3 ? "mClapboard" : "mTowerBody", "몸체", T.mChurchMat == 3, 0), C("mStone", "띠·테"), C("mRoof", "지붕", true, -1));
            else if(jp) cols.push(C("mWallBody", "돌 축대"), C("mTowerBody", "벽"), C("mBoard", "판벽"), C("mRoof", "지붕", true, -1));
            else if(cn) cols.push(C("mTowerBody", T.mWallStyle == 1 ? "판축 흙" : "벽돌"), C("mPillar", "기둥"), C("mBeam", "단청"), C("mRoof", "지붕", true, -1));
            else cols.push(C("mTowerBody", "몸체"), C("mWallStone", "기단·띠"), C("mRoof", "지붕", true, -1));
        }
        else if(kind == K.Fence)
        {
            const f = T.mFence;
            if(f == FE.Bamboo) cols.push(C("mBamboo", "대나무"));
            else if(f == FE.FlowerWall) cols.push(C("mPlaster", "벽", true, 0), C("mRoof", "기와", true, 0));
            else if(f == FE.Doldam) cols.push(C("mStone", "돌"), C("mWallCap", "기와"));
            else if(f == FE.DryStone) cols.push(C("mStone", "돌"), C("mWallCap", "갓돌"));
            else if(f == FE.Balustrade) cols.push(C("mStone", "돌"));
            else if(f == FE.Railing) cols.push(C("mStone", "받침·기둥"), C("mIron", "창살"));
            else if(f == FE.BrickWall) cols.push(C("mBrick", "벽돌"), C("mRoof", "기와", true, 0));
            else cols.push(C("mFenceWood", "나무"));
        }
        else if(kind == K.Path)
        {
            sels.push(["style", "종류", [["흙길", 1], ["돌길", 2]], e.style > 0 ? e.style : -1]);
            if(e.style == 2) cols.push(C("mPebble", "포장돌", true, 0), C("mStone", "연석"));
            else cols.push(C("mDirt", "흙"), C("mPebble", "자갈", true, 0));
        }
        else if(kind == K.Church && T.Temple())
            cols.push(C("mStone", "기단"), C("mPillar", "기둥"), C("mBeam", jp ? "들보" : "단청"), cn ? C("mGlaze", "유리기와") : C("mRoof", "지붕", true, -1));
        else if(kind == K.Church)
        {
            const ck = T.mChurch;
            if(ck == 1) cols.push(C("mWood", "몸체·장식"), C("mShingle", "지붕", true, -1));
            else if(ck == 2 || ck == 3) cols.push(C("mTowerBody", "벽"), C(ck == 3 ? "mStone" : "mWallStone", "돌 장식"), C("mRoof", "지붕", true, -1));
            else
            {
                sels.push(["style", "재질", [["돌", 1], ["나무", 2]], e.style > 0 ? e.style : -1]);
                if(T.mChurchMat == 2) cols.push(C("mBrick", "벽돌"), C("mStone", "돌 장식"), C("mRoof", "지붕", true, -1));
                else if(T.mChurchMat == 3) cols.push(C("mClapboard", "벽", true, 0), C("mRoof", "지붕", true, -1));
                else if(e.style == 2 || (e.style != 1 && T.mWallKind == 1)) cols.push(C("mPlankWall", "벽", true, -1), C("mShingle", "지붕", true, -1));
                else cols.push(C("mTowerBody", "벽"), C("mRoof", "지붕", true, -1));
                cols.push(C("mWallStone", "기단·버팀벽"));
            }
        }
        else if(kind == K.Dock) cols.push(C("mWood", "목재"));
        else if(kind == K.Monument)
        {
            const m = T.mMonument;
            if(m != MO.Lamp && m != MO.Shop) sels.push(["style", "높이", [["낮은 탑(삼층)", 1], ["높은 탑(오층)", 2]], e.style > 0 ? e.style : -1]);
            if(m == MO.Lamp) cols.push(C("mWood", "목재"), C("mIron", "쇠"), C("mStone", "돌"));
            else if(m == MO.Shop) cols.push(C("mWood", "목재"), C("mCloth", "차양", true, -1), C("mBoard", "간판"));
            else if(m == MO.WoodPagoda) cols.push(C("mStone", "기단"), C("mPillar", "몸체"), C("mRoof", "지붕", true, -1), C("mMetal", "상륜"));
            else if(m == MO.BrickPagoda || m == MO.DenseEave) cols.push(C("mWallBody", "벽돌"), C("mRoof", "처마", true, -1), C("mMetal", "탑찰"));
            else if(m == MO.OctaPagoda) cols.push(C("mStone", "돌"), C("mMetal", "상륜"));
            else if(m == MO.Column) cols.push(C("mStone", "돌"), C("mMetal", "꼭대기 장식"));
            else if(m == MO.Cross) cols.push(C("mStone", "돌"), C("mMetal", "십자가"));
            else cols.push(C("mStone", "돌"));
        }
        else if(kind == K.Bridge || kind == K.Stair)
        {
            sels.push(["style", "재질", [["돌", 1], ["나무", 2]], e.style > 0 ? e.style : -1]);
            if(e.style == 2 || (e.style != 1 && T.mWallKind == 1)) cols.push(C("mWood", "목재"));
            else if(kind == K.Bridge && T.East()) cols.push(C("mStone", "돌"));
            else if(kind == K.Bridge) cols.push(C("mWallStone", "몸체"), C("mWallCap", "난간돌"));
            else cols.push(C("mStone", "디딤돌"), C("mWallStone", "옆벽"));
        }
        const name = kind == K.Church ? (T.Temple() ? "사찰" : ["교회", "스타브 교회", "로마네스크 교회", "돔 교회"][T.mChurch] ?? "교회")
            : kind == K.Monument ? ["장터 십자가", "석탑", "목탑", "벽돌탑", "룬스톤", "오벨리스크", "개선문", "기념 기둥", "팔각 석탑", "오륜탑", "밀첨탑"][T.mMonument] ?? (T.mMonument == MO.Lamp ? "가로등" : T.mMonument == MO.Shop ? "상점" : T.mMonument == MO.PlazaFountain ? "광장 분수" : "기념탑")
            : kind == K.Tower && T.mTowerKind != 1 && T.mTowerStyle > 0 ? ["", "능보", "시계탑"][T.mTowerStyle] : CForgeInspect.sKindName[kind] ?? kind;

        const Hex = (_c : number[]) => "#" + _c.map(_v => Math.max(0, Math.min(255, Math.round(_v * 255))).toString(16).padStart(2, "0")).join("");
        const Cur = (_f : IForgeColField) : number[] => {
            const v = (T as any)[_f.key];
            if(!_f.list) return v;
            const i = _f.salt > 0 ? CForgeRand.Hash(seed, _f.salt) % v.length : _f.salt < 0 ? seed % v.length : 0;
            return v[i];
        };
        this.mEl.innerHTML = `<div style="border-top:1px solid rgba(120,90,60,0.25);margin-top:6px;padding-top:6px;">
  <div class="d-flex justify-content-between align-items-center mb-1"><b>선택: ${name} #${e.id}</b>
    <button class="btn btn-sm btn-outline-secondary py-0" data-ins="reset" title="이 오브젝트의 덮어쓰기를 모두 지운다">타입 기본값</button></div>
  ${sels.map(([k, n, opts, cur]) => `<div class="d-flex align-items-center gap-2 mb-1"><span style="width:62px;white-space:nowrap">${n}</span><select class="form-select form-select-sm" data-sel="${k}">
    <option value="-1"${cur < 0 ? " selected" : ""}>타입 따름</option>${opts.map(([on, ov]) => `<option value="${ov}"${cur == ov ? " selected" : ""}>${on}</option>`).join("")}</select></div>`).join("")}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;">${cols.map(_f => `<label class="d-flex align-items-center gap-1" style="white-space:nowrap">
    <input type="color" data-col="${_f.key}" data-list="${_f.list ? 1 : 0}" value="${Hex(Cur(_f))}" style="width:28px;height:22px;padding:0;border:none;background:none;">${_f.label}${over[_f.key] != null ? " ✎" : ""}</label>`).join("")}</div>
</div>`;
        this.mEl.querySelector<HTMLElement>("[data-ins=reset]").onclick = () => this.Apply(_o => { for(const k in _o) delete _o[k]; });
        this.mEl.querySelectorAll<HTMLSelectElement>("[data-sel]").forEach(_s => {
            _s.onchange = () => this.Apply(_o => {
                const v = Number(_s.value), k = _s.dataset.sel;
                if(v < 0) delete _o[k];
                else _o[k] = CForgeInspect.sListKind.has(k) ? [v] : v;
            }, _s.dataset.sel == "style" ? Math.max(0, Number(_s.value)) : null);
        });
        this.mEl.querySelectorAll<HTMLInputElement>("[data-col]").forEach(_c => {
            _c.onchange = () => this.Apply(_o => {
                const h = _c.value, rgb = [1, 3, 5].map(_i => parseInt(h.substr(_i, 2), 16) / 255);
                _o[_c.dataset.col] = _c.dataset.list == "1" ? [rgb] : rgb;
            });
        });
    }

    //_style가 있으면 덮어쓰기 대신 개체 형태 번호(style)를 바꾼다
    private Apply(_fn : (_over : Record<string, any>) => void, _style : number = null)
    {
        const s = this.mHandle.mSel, e = CForgeScene.Clone(this.Ent());
        if(e == null) return;
        const o = { ...(e.over ?? {}) };
        if(_style != null) e.style = _style;
        else _fn(o);
        if(Object.keys(o).length == 0) delete e.over; else e.over = o;
        this.mHistory.Push(s.kind, e, "inspect");
        //공장이 다음 틱에 다시 만든 뒤(자동 조정 결과·시드) 다시 그린다
        setTimeout(() => this.Render(), 200);
    }
}
