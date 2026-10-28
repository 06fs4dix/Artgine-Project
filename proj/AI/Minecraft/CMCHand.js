import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CRenderPass } from "../../../Artgine/artgine/render/CRenderPass.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { CMath } from "../../../Artgine/artgine/geometry/CMath.js";
import { CUtilMath } from "../../../Artgine/artgine/geometry/CUtilMath.js";
import { CAlpha } from "../../../Artgine/artgine/render/CAlpha.js";
import { MC_BLOCK } from "./CMCBlock.js";
import { CMCFx } from "./CMCFx.js";
import { MCItem } from "./CMCItem.js";
const SWING_TIME = 0.28;
const EQUIP_TIME = 0.22;
export class CMCHand {
    mFrame;
    mPivot;
    mItem = null;
    mId = -1;
    mSwing = 0;
    mEquip = 0;
    mTime = 0;
    mBob = 0;
    mTorch = false;
    mFlat = false;
    constructor(_frame, _canvas) {
        this.mFrame = _frame;
        this.mPivot = _canvas.PushSub(new CSubject());
    }
    NoDepth(_pt) {
        const rp = new CRenderPass(this.mFrame.Pal().Sl3DKey(), CRenderPass.ePriority.NoDepth);
        rp.mDepthTest = false;
        _pt.PushRenderPass(rp);
    }
    Box(_parent, _pos, _sca, _tex, _color = null, _cut = false) {
        const sub = _parent.PushChild(new CSubject());
        sub.SetPos(_pos);
        sub.SetSca(_sca);
        const pt = sub.PushComp(new CPaint3D());
        pt.SetTexture(_tex);
        if (_color != null)
            pt.SetColorModel(_color);
        if (_cut)
            pt.SetAlphaModel(new CAlpha(1, 0.1));
        this.NoDepth(pt);
        return sub;
    }
    SetItem(_id) {
        if (_id == this.mId)
            return;
        this.mId = _id;
        this.mEquip = 1;
        if (this.mItem != null)
            this.mItem.Destroy();
        this.mItem = null;
        const it = MCItem(_id);
        if (it == null)
            return;
        this.mItem = this.mPivot.PushChild(new CSubject());
        this.mTorch = _id == MC_BLOCK.Torch;
        this.mFlat = !it.block;
        if (this.mTorch) {
            const black = this.mFrame.Pal().GetBlackTex();
            this.Box(this.mItem, new CVec3(0, 0, 0), new CVec3(3.2, 15, 3.2), black, new CColor(0.4, 0.26, 0.12, CColor.eModel.RGBAdd));
            this.Box(this.mItem, new CVec3(0, 9, 0), new CVec3(3.2, 3.2, 3.2), black, new CColor(1, 0.65, 0.15, CColor.eModel.RGBAdd));
        }
        else if (this.mFlat)
            this.Box(this.mItem, new CVec3(0, 0, 0), new CVec3(20, 20, 0.08), CMCFx.ItemKey(_id), null, true);
        else
            this.Box(this.mItem, new CVec3(0, 0, 0), new CVec3(11, 11, 11), CMCFx.ItemKey(_id));
    }
    Swing() {
        this.mSwing = 1;
    }
    Update(_dt, _eye, _look, _walk) {
        const view = new CMat();
        CUtilMath.CameraLookAtRH(_eye, _look, new CVec3(0, 1, 0), view);
        const inv = CMath.MatInvert(view);
        const rot = CMath.MatDecomposeRotMat(inv, true, true, true);
        this.mPivot.SetPos(_eye);
        this.mPivot.SetRot(CMath.MatToQut(rot));
        if (this.mItem == null)
            return;
        this.mTime += _dt;
        this.mBob += _dt * 9 * _walk;
        if (this.mSwing > 0)
            this.mSwing = Math.max(0, this.mSwing - _dt / SWING_TIME);
        if (this.mEquip > 0)
            this.mEquip = Math.max(0, this.mEquip - _dt / EQUIP_TIME);
        const sw = Math.sin((1 - this.mSwing) * Math.PI) * (this.mSwing > 0 ? 1 : 0);
        const bx = Math.cos(this.mBob * 0.5) * 2.2 * _walk;
        const by = Math.abs(Math.sin(this.mBob * 0.5)) * -2.8 * _walk;
        const x = 21 + bx * 0.6 - sw * 6;
        const y = (this.mTorch ? -12 : -12.5) + by * 0.6 - sw * 5 - this.mEquip * 30;
        const z = -56 - sw * 10;
        this.mItem.SetPos(new CVec3(x, y, z));
        this.mItem.SetRot(this.mTorch ? new CVec3(0.45 - sw * 0.9, -0.2, -0.25) : this.mFlat ? new CVec3(-sw * 1.1, 0, -0.1) : new CVec3(0.25 - sw * 0.9, -0.55 + sw * 0.25, 0));
    }
}
