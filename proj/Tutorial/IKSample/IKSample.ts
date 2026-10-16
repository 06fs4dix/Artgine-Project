//Version
import "../../../Artgine/artgine/artgine.js"

//Class
import {CClass} from "../../../Artgine/artgine/basic/CClass.js";

//Atelier
import {CPreferences} from "../../../Artgine/artgine/basic/CPreferences.js";
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

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
import { CComponent } from "../../../Artgine/artgine/app/component/CComponent.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CMat } from "../../../Artgine/artgine/geometry/CMat.js";
import { CMath } from "../../../Artgine/artgine/geometry/CMath.js";
import { CTree } from "../../../Artgine/artgine/basic/CTree.js";
import { CUpdate } from "../../../Artgine/artgine/basic/Basic.js";
import { CAnimation, CClipMorph, CClipPRS } from "../../../Artgine/artgine/app/component/CAnimation.js";
import { CAniFlow } from "../../../Artgine/artgine/app/component/CAniFlow.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CLight } from "../../../Artgine/artgine/app/component/CLight.js";
import { CLoaderOption } from "../../../Artgine/artgine/util/CLoader.js";
import { CMeshCopyNode } from "../../../Artgine/artgine/render/CMeshCopyNode.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CCamCon3DThirdPerson } from "../../../Artgine/artgine/util/CCamCon.js";
import { CAimIK, CAttacher, CLookAtIK, CSpringBone, CSpringChain, CSpringCollider } from "../../../plugin/CResolverComp/CResolverComp.js";

//VRoid 공식 샘플 Sendagaya Shino (CC0)
const MODEL = "Res/Shino.glb";

var Main=gAtl.NewCanvas("Main");
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

let pt : CPaint;
//오른발 목표
let target1 = new CSubject();
pt = new CPaint3D(Main.GetFrame().Pal().GetBoxMesh());
pt.SetColorModel(new CColor(0,1,0,CColor.eModel.RGBAdd));
target1.PushComp(pt);
target1.SetBlackBoard(true);
target1.SetSca(new CVec3(20, 20, 20));
target1.SetPos(new CVec3(60,120,-200));
Main.PushSub(target1);

//시선 목표
let target2 = new CSubject();
pt = new CPaint3D(Main.GetFrame().Pal().GetBoxMesh());
pt.SetColorModel(new CColor(0,0,1,CColor.eModel.RGBAdd));
target2.PushComp(pt);
target2.SetBlackBoard(true);
target2.SetPos(new CVec3(0, 550, -500));
target2.SetSca(new CVec3(20, 20, 20));

let ani2=new CAnimation();
ani2.Push(new CClipPRS(0,5,[new CVec3(0,550,-500),new CVec3(-500,550,-500),new CVec3(500,550,-500),new CVec3(0,550,-500)],CClipPRS.eType.Pos));
target2.PushComp(new CAniFlow(ani2));
Main.PushSub(target2);

//왼손에 붙는 막대
let target3 = new CSubject();
pt = new CPaint3D(Main.GetFrame().Pal().GetBoxMesh());
pt.SetColorModel(new CColor(1,1,0,CColor.eModel.RGBAdd));
target3.PushComp(pt);
target3.SetBlackBoard(true);
target3.SetSca(new CVec3(2, 60, 2));
target3.SetRot(new CVec3(1.5,0,0));
Main.PushSub(target3);

await gAtl.Frame().Load().Exe(MODEL, new CLoaderOption().Set("mColorTex", true));

//애니메이션 없는 VRM(T포즈)의 팔을 내리고 왼팔을 위아래로 흔든다. IK는 다음 프레임에 붙인다.
//첫 프레임은 페인트 월드행렬이 아직 계산 전(단위행렬)이라 그때 IK가 돌면 LookAt 기준 방향이 틀어진다
class CRestPose extends CComponent
{
	private mFrame = 0;
	private mTime = 0;
	private mTmp = new CMat();
	constructor(public mOnReady : () => void, public mArmDown = 1.2, public mSwing = 1.1, public mPeriod = 3)
	{
		super();
		this.mSysc = CComponent.eSysn.AniFlow;
	}
	override Update(_update : CUpdate)
	{
		super.Update(_update);
		const tree = (this.GetOwner().FindComp(CPaint3D) as CPaint3D)?.GetTree();
		if(tree == null) return;
		this.mTime += _update.DeltaTime();
		const lift = this.mSwing * (0.5 - 0.5 * Math.cos(this.mTime * Math.PI * 2 / this.mPeriod));
		for(const [side, dir] of [["L", 1], ["R", -1]] as [string, number][])
		{
			const arm = tree.Find("J_Bip_" + side + "_UpperArm");
			if(arm == null) return;
			const angle = (this.mArmDown - (side == "L" ? lift : 0)) * dir;
			arm.mData.rot.Import(new CVec4(0, 0, Math.sin(angle / 2), Math.cos(angle / 2)));
			RefreshBone(arm, this.mTmp);
		}
		if(this.mFrame == 1)
			this.mOnReady();
		this.mFrame++;
	}
}

function RefreshBone(_node : CTree<CMeshCopyNode>, _tmp : CMat)
{
	const data = _node.mData;
	data.MatUpdate();
	CMath.MatMul(data.pst, _node.mParent.mData.pst, _tmp);
	data.pst.Import(_tmp);
	data.pst.UnitCheck();
	data.updateMat = CUpdate.eType.Updated;
	for(let ch = _node.mChild; ch != null; ch = ch.mColleague)
		RefreshBone(ch, _tmp);
}

//골반 아래는 두고 척추 본들을 앞뒤 축으로 나눠 기울여 상체만 좌우로 흔든다
class CUpperSway extends CComponent
{
	private mTime = 0;
	private mBase = new Map<string, CVec4>();
	private mDelta = new CVec4();
	private mTmp = new CMat();
	constructor(public mAngle = 0.4, public mPeriod = 1.0, public mBustSize = 1.6, public mBone = ["J_Bip_C_Spine", "J_Bip_C_Chest", "J_Bip_C_UpperChest"])
	{
		super();
		this.mSysc = CComponent.eSysn.AniFlow;
	}
	override Update(_update : CUpdate)
	{
		super.Update(_update);
		const tree = (this.GetOwner().FindComp(CPaint3D) as CPaint3D)?.GetTree();
		if(tree == null) return;
		this.mTime += _update.DeltaTime();
		const angle = this.mAngle / this.mBone.length * Math.sin(this.mTime * Math.PI * 2 / this.mPeriod);
		this.mDelta.x = 0;
		this.mDelta.y = 0;
		this.mDelta.z = Math.sin(angle / 2);
		this.mDelta.w = Math.cos(angle / 2);
		let top : CTree<CMeshCopyNode> = null;
		for(const name of this.mBone)
		{
			const node = tree.Find(name);
			if(node == null) continue;
			let base = this.mBase.get(name);
			if(base == null)
			{
				base = new CVec4();
				base.Import(node.mData.rot);
				this.mBase.set(name, base);
			}
			CMath.QutMul(base, this.mDelta, node.mData.rot);
			if(top == null) top = node;
		}
		for(const name of ["J_Sec_L_Bust1", "J_Sec_R_Bust1"])
			tree.Find(name)?.mData.sca.Import(new CVec3(this.mBustSize, this.mBustSize, this.mBustSize));
		if(top != null)
			RefreshBone(top, this.mTmp);
	}
}

//auto = VRM 파일에 저장된 스프링/충돌체 정의를 읽어서 등록, manual = 같은 내용을 코드로 직접 등록,
//link = 흔들 본과 충돌 대상 본 이름만 지정하고 충돌체 모양/본 반경은 메시에서 계산
const SPRING_MODE : "auto" | "manual" | "link" = "link";

//PushLink(흔들 본, 충돌 대상 본 배열, 옵션)
//
//흔들 본(첫 번째 인자) : 흔들릴 체인의 루트 본. 그 아래 자식 관절은 자동으로 체인에 포함된다
//	"본이름"          → 그 본 하나를 루트로 하는 체인 1개
//	["본A", "본B"]    → 본마다 체인 1개씩
//	"접두사*"         → 이름이 접두사로 시작하고 부모는 접두사로 시작하지 않는 본(맨 위)을 모두 루트로 사용
//
//충돌 대상 본(두 번째 인자) : 흔들 본이 부딪힐 몸 쪽 본 이름 배열. []이면 충돌 없이 흔들리기만 한다
//	각 본에 가중치 0.5 이상으로 붙은 정점을 모아 모양을 자동 계산한다(둥글면 구, 길쭉하면 캡슐)
//	충돌체는 본마다 1개만 만들어 여러 PushLink 호출이 공유하고, 체인은 이 배열에 넣은 본하고만 충돌한다
//	정점이 8개 미만인 본(손가락 등)이나 이름이 틀린 본은 경고 없이 건너뛴다
//
//옵션(세 번째 인자, 생략 가능)
//	stiffness : 원래 모양으로 돌아가려는 힘 (기본 0.5)
//	drag      : 감쇠. 클수록 빨리 멈춘다 (기본 0.4)
//	gravity   : 중력 (기본 0)
//	maxAngle  : 최대 꺾임 각도(도). 0이면 제한 없음 (기본 0)
//	hitRadius : 흔들 본 반경(미터). 지정하면 메시 두께 자동 계산 대신 이 값을 쓴다
//	thick     : 자동 계산한 흔들 본 반경에 곱하는 배율 (기본 1)
//
//PushLink는 요청만 쌓아 두고, 실제 계산은 메시가 준비된 첫 프레임에 한 번만 한다
function SetupSpringLink(_spring : CSpringBone)
{
	//가슴 : 충돌이 없어 메시 계산이 필요 없고, 출렁임 값을 바로 넣어야 해서 PushLink 대신 체인을 직접 만든다(BoostBust 참고)
	for(const root of ["J_Sec_L_Bust1", "J_Sec_R_Bust1"])
	{
		const chain = _spring.PushChain(new CSpringChain(root, 0.75, 0.05, 0, 0));
		chain.mVRM = true;
		chain.mCollision = false;
	}

	//치마 : 좌우 앞/옆/뒤 6줄을 각각 체인으로, 허벅지와 종아리 4개 본과 충돌
	_spring.PushLink(["J_Sec_L_SkirtBack", "J_Sec_L_SkirtFront", "J_Sec_L_SkirtSide", "J_Sec_R_SkirtBack", "J_Sec_R_SkirtFront", "J_Sec_R_SkirtSide"],
		["J_Bip_L_UpperLeg", "J_Bip_R_UpperLeg", "J_Bip_L_LowerLeg", "J_Bip_R_LowerLeg"], { stiffness: 0.5, drag: 0.05 });

	//머리카락 : VRoid 머리카락 본은 이름이 GUID라 접두사로 루트 15개를 한 번에 찾는다. 머리/목/가슴/척추/양 위팔과 충돌
	_spring.PushLink("HairJoint-*",
		["J_Bip_C_Head", "J_Bip_C_Neck", "J_Bip_C_UpperChest", "J_Bip_C_Spine", "J_Bip_L_UpperArm", "J_Bip_R_UpperArm"], { stiffness: 0.4, drag: 0.4 });
}

function SetupSpringManual(_spring : CSpringBone)
{
	const U = 39.37;
	//[본, 오프셋 x, y, z(m), 반지름(m), 그룹]. VRM0 원본 오프셋은 Unity 좌표라 z 부호를 뒤집은 값이다
	const colliders : [string, number, number, number, number, number][] = [
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
	for(const [bone, x, y, z, radius, group] of colliders)
		_spring.PushCollider(new CSpringCollider(bone, new CVec3(x * U, y * U, z * U), radius * U, null, group));

	//[루트 본 목록, 강성, 감쇠, 중력, 본 반경(m), 충돌 그룹]. 루트 아래 자식 관절은 자동으로 체인에 포함된다
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
	const chains : [string[], number, number, number, number, number[]][] = [
		[["J_Sec_L_Bust1", "J_Sec_R_Bust1"], 0.75, 0.05, 0, 0.02, []],
		[["J_Sec_L_SkirtBack", "J_Sec_L_SkirtFront", "J_Sec_L_SkirtSide",
			"J_Sec_R_SkirtBack", "J_Sec_R_SkirtFront", "J_Sec_R_SkirtSide"], 0.5, 0.05, 0, 0.02, [10, 11]],
		[hairRoots, 0.4, 0.4, 0, 0.024, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
	];
	for(const [roots, stiffness, drag, gravity, hitRadius, groups] of chains)
	{
		for(const root of roots)
		{
			const chain = _spring.PushChain(new CSpringChain(root, stiffness, drag, gravity, hitRadius * U));
			chain.mVRM = true;
			chain.mColliderGroup = groups;
			chain.mCollision = groups.length > 0;
		}
	}
}

//가슴 체인 첫 관절을 질량-스프링으로 튕기고(최대 거리 m) 튕기는 방향으로 늘인다. 스프링만으로는 상체 움직임에 비해 출렁임이 약하다
//강성을 낮춰 고유 진동을 CUpperSway 주기(1초) 근처로 맞춰야 공명해서 크게 출렁인다. 강성 2.5면 1.8cm, 1.5면 약 3cm, 1.0이면 약 7cm
function BoostBust(_spring : CSpringBone, _jiggle = 0.12, _stiffness = 1.5, _drag = 0.02, _stretch = 0.2)
{
	for(const chain of _spring.mChain)
	{
		if(!chain.mRoot.includes("Bust")) continue;
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
if(new URLSearchParams(location.search).get("light") == "1")	pt3d.PushTag(CPaint.eTag.Light);
obj.PushComp(pt3d);
//눈 깜빡임: 4초 주기, 3.5초에 감고 0.12초에 걸쳐 뜬다. 마지막 클립은 반복 주기를 맞추는 빈 구간이다
const aniBlink = new CAnimation();
aniBlink.Push(new CClipMorph(3.5, 0.08, "Fcl_EYE_Close", 0, 1));
aniBlink.Push(new CClipMorph(3.58, 0.12, "Fcl_EYE_Close", 1, 0));
aniBlink.Push(new CClipMorph(3.7, 0.3, "Fcl_EYE_Close", 0, 0));
obj.PushComp(new CAniFlow(aniBlink));
obj.SetSca(new CVec3(10, 10, 10));
// obj.PushComp(new CRestPose(() => {
// 	//폴 방향(무릎 앞쪽)으로 굽혀서 무릎이 뒤로 꺾이지 않게 한다
// 	obj.PushComp(new CUpperSway());
// 	obj.PushComp(new CAimIK("J_Bip_R_Foot",target1,3)).SetPole(pole);
// 	obj.PushComp(new CAttacher("J_Bip_L_Hand",target3));
// 	obj.PushComp(new CLookAtIK("J_Bip_C_Neck",target2));
// 	//IK 결과 위에서 머리카락/가슴/치마가 흔들린다
// 	const spring = obj.PushComp(new CSpringBone());
// 	if(SPRING_MODE == "auto")
// 		spring.ImportVRM(MODEL).then(() => BoostBust(spring));
// 	else
// 	{
// 		if(SPRING_MODE == "manual")
// 			SetupSpringManual(spring);
// 		else
// 			SetupSpringLink(spring);
// 		BoostBust(spring);
// 	}
// }));
obj.PushComp(new CUpperSway());
	obj.PushComp(new CAimIK("J_Bip_R_Foot",target1,3)).SetPole(pole);
	obj.PushComp(new CAttacher("J_Bip_L_Hand",target3));
	obj.PushComp(new CLookAtIK("J_Bip_C_Neck",target2));
	//IK 결과 위에서 머리카락/가슴/치마가 흔들린다
	const spring = obj.PushComp(new CSpringBone());
	if(SPRING_MODE == "auto")
		spring.ImportVRM(MODEL).then(() => BoostBust(spring));
	else
	{
		if(SPRING_MODE == "manual")
			SetupSpringManual(spring);
		else
			SetupSpringLink(spring);
		BoostBust(spring);
	}
Main.PushSub(obj);
