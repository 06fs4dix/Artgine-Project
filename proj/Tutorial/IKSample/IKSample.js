import "../../../Artgine/artgine/artgine.js";
import { CPreferences } from "../../../Artgine/artgine/basic/CPreferences.js";
var gPF = new CPreferences();
gPF.mTargetWidth = 0;
gPF.mTargetHeight = 0;
gPF.mRenderer = "GL";
gPF.m32fDepth = false;
gPF.mTexture16f = false;
gPF.mAnti = true;
gPF.mBatchPool = true;
gPF.mXR = false;
gPF.mDeveloper = true;
gPF.mIAuto = true;
gPF.mCanvas = "";
gPF.mServer = 'webServer';
gPF.mGitHub = false;
gPF.mVersion = "mqg7brr3_50";
import { CAtelier } from "../../../Artgine/artgine/app/CAtelier.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([], "");
import { CComponent } from "../../../Artgine/artgine/app/component/CComponent.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { CMath } from "../../../Artgine/artgine/geometry/CMath.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CAnimation, CClipMorph, CClipPRS } from "../../../Artgine/artgine/app/component/CAnimation.js";
import { CAniFlow } from "../../../Artgine/artgine/app/component/CAniFlow.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
import { CLoaderOption } from "../../../Artgine/artgine/util/CLoader.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CCamCon3DThirdPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CAimIK, CAttacher, CLookAtIK, CSpringBone, CSpringChain, CSpringCollider } from "../../../Artgine/plugin/CResolverComp/CResolverComp.js";
const MODEL = "Res/Shino.glb";
var Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("3D");
const camcon = new CCamCon3DThirdPerson(gAtl.Frame().Input());
gAtl.Brush().GetCam3D().SetCamCon(camcon);
gAtl.Brush().GetCam3D().Init(new CVec3(-900, 650, -1100), new CVec3(0, 330, 0));
camcon.SetPos(new CVec3(0, 330, 0));
let back = new CSubject();
back.PushComp(new CPaint3D(Main.GetFrame().Pal().GetBoxMesh())).SetColorModel(new CColor(0.25, 0.27, 0.3, CColor.eModel.RGBAdd));
back.SetSca(new CVec3(2000, 2, 2000));
Main.PushSub(back);
let ligSub = new CSubject();
ligSub.SetPos(new CVec3(0.4, 1, 0.6));
let lig = new CLight();
lig.SetDirect();
lig.SetColor(new CVec3(1, 1, 1));
ligSub.PushComp(lig);
Main.PushSub(ligSub);
let pt;
let target1 = new CSubject();
pt = new CPaint3D(Main.GetFrame().Pal().GetBoxMesh());
pt.SetColorModel(new CColor(0, 1, 0, CColor.eModel.RGBAdd));
target1.PushComp(pt);
target1.SetBlackBoard(true);
target1.SetSca(new CVec3(20, 20, 20));
target1.SetPos(new CVec3(60, 120, -200));
Main.PushSub(target1);
let target2 = new CSubject();
pt = new CPaint3D(Main.GetFrame().Pal().GetBoxMesh());
pt.SetColorModel(new CColor(0, 0, 1, CColor.eModel.RGBAdd));
target2.PushComp(pt);
target2.SetBlackBoard(true);
target2.SetPos(new CVec3(0, 550, -500));
target2.SetSca(new CVec3(20, 20, 20));
let ani2 = new CAnimation();
ani2.Push(new CClipPRS(0, 5, [new CVec3(0, 550, -500), new CVec3(-500, 550, -500), new CVec3(500, 550, -500), new CVec3(0, 550, -500)], CClipPRS.eType.Pos));
target2.PushComp(new CAniFlow(ani2));
Main.PushSub(target2);
let target3 = new CSubject();
pt = new CPaint3D(Main.GetFrame().Pal().GetBoxMesh());
pt.SetColorModel(new CColor(1, 1, 0, CColor.eModel.RGBAdd));
target3.PushComp(pt);
target3.SetBlackBoard(true);
target3.SetSca(new CVec3(2, 60, 2));
target3.SetRot(new CVec3(1.5, 0, 0));
Main.PushSub(target3);
await gAtl.Frame().Load().Exe(MODEL, new CLoaderOption().Set("mColorTex", true));
class CRestPose extends CComponent {
    mOnReady;
    mArmDown;
    mSwing;
    mPeriod;
    mFrame = 0;
    mTime = 0;
    mTmp = new CMat();
    constructor(mOnReady, mArmDown = 1.2, mSwing = 1.1, mPeriod = 3) {
        super();
        this.mOnReady = mOnReady;
        this.mArmDown = mArmDown;
        this.mSwing = mSwing;
        this.mPeriod = mPeriod;
        this.mSysc = CComponent.eSysn.AniFlow;
    }
    Update(_update) {
        super.Update(_update);
        const tree = this.GetOwner().FindComp(CPaint3D)?.GetTree();
        if (tree == null)
            return;
        this.mTime += _update.DeltaTime();
        const lift = this.mSwing * (0.5 - 0.5 * Math.cos(this.mTime * Math.PI * 2 / this.mPeriod));
        for (const [side, dir] of [["L", 1], ["R", -1]]) {
            const arm = tree.Find("J_Bip_" + side + "_UpperArm");
            if (arm == null)
                return;
            const angle = (this.mArmDown - (side == "L" ? lift : 0)) * dir;
            arm.mData.rot.Import(new CVec4(0, 0, Math.sin(angle / 2), Math.cos(angle / 2)));
            RefreshBone(arm, this.mTmp);
        }
        if (this.mFrame == 1)
            this.mOnReady();
        this.mFrame++;
    }
}
function RefreshBone(_node, _tmp) {
    const data = _node.mData;
    data.MatUpdate();
    CMath.MatMul(data.pst, _node.mParent.mData.pst, _tmp);
    data.pst.Import(_tmp);
    data.pst.UnitCheck();
    data.updateMat = CUpdate.eType.Updated;
    for (let ch = _node.mChild; ch != null; ch = ch.mColleague)
        RefreshBone(ch, _tmp);
}
class CUpperSway extends CComponent {
    mAngle;
    mPeriod;
    mBustSize;
    mBone;
    mTime = 0;
    mBase = new Map();
    mDelta = new CVec4();
    mTmp = new CMat();
    constructor(mAngle = 0.4, mPeriod = 1.0, mBustSize = 1.6, mBone = ["J_Bip_C_Spine", "J_Bip_C_Chest", "J_Bip_C_UpperChest"]) {
        super();
        this.mAngle = mAngle;
        this.mPeriod = mPeriod;
        this.mBustSize = mBustSize;
        this.mBone = mBone;
        this.mSysc = CComponent.eSysn.AniFlow;
    }
    Update(_update) {
        super.Update(_update);
        const tree = this.GetOwner().FindComp(CPaint3D)?.GetTree();
        if (tree == null)
            return;
        this.mTime += _update.DeltaTime();
        const angle = this.mAngle / this.mBone.length * Math.sin(this.mTime * Math.PI * 2 / this.mPeriod);
        this.mDelta.x = 0;
        this.mDelta.y = 0;
        this.mDelta.z = Math.sin(angle / 2);
        this.mDelta.w = Math.cos(angle / 2);
        let top = null;
        for (const name of this.mBone) {
            const node = tree.Find(name);
            if (node == null)
                continue;
            let base = this.mBase.get(name);
            if (base == null) {
                base = new CVec4();
                base.Import(node.mData.rot);
                this.mBase.set(name, base);
            }
            CMath.QutMul(base, this.mDelta, node.mData.rot);
            if (top == null)
                top = node;
        }
        for (const name of ["J_Sec_L_Bust1", "J_Sec_R_Bust1"])
            tree.Find(name)?.mData.sca.Import(new CVec3(this.mBustSize, this.mBustSize, this.mBustSize));
        if (top != null)
            RefreshBone(top, this.mTmp);
    }
}
const SPRING_MODE = "link";
function SetupSpringLink(_spring) {
    for (const root of ["J_Sec_L_Bust1", "J_Sec_R_Bust1"]) {
        const chain = _spring.PushChain(new CSpringChain(root, 0.75, 0.05, 0, 0));
        chain.mVRM = true;
        chain.mCollision = false;
    }
    _spring.PushLink(["J_Sec_L_SkirtBack", "J_Sec_L_SkirtFront", "J_Sec_L_SkirtSide", "J_Sec_R_SkirtBack", "J_Sec_R_SkirtFront", "J_Sec_R_SkirtSide"], ["J_Bip_L_UpperLeg", "J_Bip_R_UpperLeg", "J_Bip_L_LowerLeg", "J_Bip_R_LowerLeg"], { stiffness: 0.5, drag: 0.05 });
    _spring.PushLink("HairJoint-*", ["J_Bip_C_Head", "J_Bip_C_Neck", "J_Bip_C_UpperChest", "J_Bip_C_Spine", "J_Bip_L_UpperArm", "J_Bip_R_UpperArm"], { stiffness: 0.4, drag: 0.4 });
}
function SetupSpringManual(_spring) {
    const U = 39.37;
    const colliders = [
        ["J_Bip_C_Spine", 0, 0, 0, 0.12, 0],
        ["J_Bip_C_UpperChest", 0, 0.0028, -0.0096, 0.1, 1],
        ["J_Bip_C_UpperChest", -0.05, 0.0596, 0.0278, 0.07, 1],
        ["J_Bip_C_UpperChest", 0.05, 0.0596, 0.0278, 0.07, 1],
        ["J_Bip_C_Neck", 0, 0.0281, -0.0167, 0.05, 2],
        ["J_Bip_C_Head", 0, 0.1007, 0.0126, 0.1005, 3],
        ["J_Bip_L_UpperArm", 0.0005, -0.0099, 0.001, 0.05, 4],
        ["J_Bip_L_UpperArm", -0.0745, -0.0134, 0.0004, 0.05, 4],
        ["J_Bip_L_UpperArm", -0.1494, -0.0169, -0.0003, 0.05, 4],
        ["J_Bip_L_LowerArm", 0, 0, 0, 0.03, 5],
        ["J_Bip_L_LowerArm", -0.0498, -0.0001, -0.0041, 0.035, 5],
        ["J_Bip_L_LowerArm", -0.0997, -0.0002, -0.0082, 0.03, 5],
        ["J_Bip_L_LowerArm", -0.1495, -0.0003, -0.0123, 0.03, 5],
        ["J_Bip_L_Hand", -0.0199, -0.0001, -0.0016, 0.03, 6],
        ["J_Bip_R_UpperArm", -0.0005, -0.0099, 0.001, 0.05, 7],
        ["J_Bip_R_UpperArm", 0.0745, -0.0134, 0.0004, 0.05, 7],
        ["J_Bip_R_UpperArm", 0.1494, -0.0169, -0.0003, 0.05, 7],
        ["J_Bip_R_LowerArm", 0, 0, 0, 0.03, 8],
        ["J_Bip_R_LowerArm", 0.0498, -0.0001, -0.0041, 0.035, 8],
        ["J_Bip_R_LowerArm", 0.0997, -0.0002, -0.0082, 0.03, 8],
        ["J_Bip_R_LowerArm", 0.1495, -0.0003, -0.0123, 0.03, 8],
        ["J_Bip_R_Hand", 0.0199, -0.0001, -0.0016, 0.03, 9],
        ["J_Bip_L_UpperLeg", 0, 0, 0, 0.081, 10],
        ["J_Bip_L_UpperLeg", 0.0069, -0.1198, 0.0022, 0.081, 10],
        ["J_Bip_L_UpperLeg", 0.0126, -0.2196, 0.0039, 0.081, 10],
        ["J_Bip_R_UpperLeg", 0, 0, 0, 0.081, 11],
        ["J_Bip_R_UpperLeg", -0.0069, -0.1198, 0.0022, 0.081, 11],
        ["J_Bip_R_UpperLeg", -0.0126, -0.2196, 0.0039, 0.081, 11],
    ];
    for (const [bone, x, y, z, radius, group] of colliders)
        _spring.PushCollider(new CSpringCollider(bone, new CVec3(x * U, y * U, z * U), radius * U, null, group));
    const hairRoots = [
        "HairJoint-1906a1ce-1b58-4a73-8500-32a1e759a35c", "HairJoint-0d9961ed-f925-45ac-b491-6815dbb9da79",
        "HairJoint-b6d75a88-8b98-4f07-9970-2e20ae497072", "HairJoint-40bf39dd-d75d-44d7-a3f8-400ac041517f",
        "HairJoint-15cbe406-4099-45b5-856c-8c5abbdadeef", "HairJoint-60421b4c-bee2-4d6b-8ff9-a2cc1da1bea4",
        "HairJoint-028f7d9a-b8a4-4d92-b7c6-bcf3a0f01695", "HairJoint-ec053d53-1f0e-461d-92d1-b15ce5b0440b",
        "HairJoint-b47a78b7-5d12-4c93-b611-8522faa11860", "HairJoint-d89208f3-3830-47fb-bc1c-a064cec35a18",
        "HairJoint-5e784232-233f-4061-8194-8f591be00b81", "HairJoint-a37fc5ef-4292-4cd9-806e-bd3ea7c61ff8",
        "HairJoint-17dd99c0-b8b4-401e-8479-b7feae55acc4", "HairJoint-795840ac-cc55-4cb0-ab5f-81c16bf834df",
        "HairJoint-0070fd8e-1d1d-4216-a5a2-df0d52726bc6",
    ];
    const chains = [
        [["J_Sec_L_Bust1", "J_Sec_R_Bust1"], 0.75, 0.05, 0, 0.02, []],
        [["J_Sec_L_SkirtBack", "J_Sec_L_SkirtFront", "J_Sec_L_SkirtSide",
                "J_Sec_R_SkirtBack", "J_Sec_R_SkirtFront", "J_Sec_R_SkirtSide"], 0.5, 0.05, 0, 0.02, [10, 11]],
        [hairRoots, 0.4, 0.4, 0, 0.024, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ];
    for (const [roots, stiffness, drag, gravity, hitRadius, groups] of chains) {
        for (const root of roots) {
            const chain = _spring.PushChain(new CSpringChain(root, stiffness, drag, gravity, hitRadius * U));
            chain.mVRM = true;
            chain.mColliderGroup = groups;
            chain.mCollision = groups.length > 0;
        }
    }
}
function BoostBust(_spring, _jiggle = 0.12, _stiffness = 1.5, _drag = 0.02, _stretch = 0.2) {
    for (const chain of _spring.mChain) {
        if (!chain.mRoot.includes("Bust"))
            continue;
        chain.mJiggle = _jiggle;
        chain.mJiggleStiffness = _stiffness;
        chain.mJiggleDrag = _drag;
        chain.mJiggleStretch = _stretch;
    }
}
let pole = new CSubject();
pole.SetPos(new CVec3(60, 250, -2000));
Main.PushSub(pole);
let obj = new CSubject();
let pt3d = new CPaint3D(MODEL);
if (new URLSearchParams(location.search).get("light") == "1")
    pt3d.PushTag(CPaint.eTag.Light);
obj.PushComp(pt3d);
const aniBlink = new CAnimation();
aniBlink.Push(new CClipMorph(3.5, 0.08, "Fcl_EYE_Close", 0, 1));
aniBlink.Push(new CClipMorph(3.58, 0.12, "Fcl_EYE_Close", 1, 0));
aniBlink.Push(new CClipMorph(3.7, 0.3, "Fcl_EYE_Close", 0, 0));
obj.PushComp(new CAniFlow(aniBlink));
obj.SetSca(new CVec3(10, 10, 10));
obj.PushComp(new CUpperSway());
obj.PushComp(new CAimIK("J_Bip_R_Foot", target1, 3)).SetPole(pole);
obj.PushComp(new CAttacher("J_Bip_L_Hand", target3));
obj.PushComp(new CLookAtIK("J_Bip_C_Neck", target2));
const spring = obj.PushComp(new CSpringBone());
if (SPRING_MODE == "auto")
    spring.ImportVRM(MODEL).then(() => BoostBust(spring));
else {
    if (SPRING_MODE == "manual")
        SetupSpringManual(spring);
    else
        SetupSpringLink(spring);
    BoostBust(spring);
}
Main.PushSub(obj);
