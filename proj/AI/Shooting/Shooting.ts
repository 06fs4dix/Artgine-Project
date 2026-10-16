//Version
import "../../../Artgine/artgine/artgine.js"

//Class
import {CClass} from "../../../Artgine/artgine/basic/CClass.js";
import { CBackGround } from "./CBackGround.js";
CClass.Push(CBackGround);
import { CBossComp } from "./CBossComp.js";
CClass.Push(CBossComp);
import { CBulletComp } from "./CBulletComp.js";
CClass.Push(CBulletComp);
import { CEnemyComp } from "./CEnemyComp.js";
CClass.Push(CEnemyComp);
import { CGameMgr } from "./CGameMgr.js";
CClass.Push(CGameMgr);
import { CPlayerComp } from "./CPlayerComp.js";
CClass.Push(CPlayerComp);
//Atelier
import {CPreferences} from "../../../Artgine/artgine/basic/CPreferences.js";
var gPF = new CPreferences();
gPF.mTargetWidth = 600;
gPF.mTargetHeight = 800;
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
gPF.mVersion = "mqfz8x75_2";

import {CAtelier} from "../../../Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "../../../Artgine/artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
import { CEvent } from "../../../Artgine/artgine/basic/CEvent.js";
import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint2D } from "../../../Artgine/artgine/app/component/paint/CPaint2D.js";
import { CRigidBody } from "../../../Artgine/artgine/app/component/CRigidBody.js";
import { CForce } from "../../../Artgine/artgine/app/component/CForce.js";
import { CCollider } from "../../../Artgine/artgine/app/component/CCollider.js";
import { CAnimation, CClipCoodi, CClipImg, CClipDestroy, CClipAlpha, CClipPRS } from "../../../Artgine/artgine/app/component/CAnimation.js";
import { CAniFlow } from "../../../Artgine/artgine/app/component/CAniFlow.js";
import { CAlpha } from "../../../Artgine/artgine/render/CAlpha.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CTexture, CTextureInfo } from "../../../Artgine/artgine/render/CTexture.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CRenderPass } from "../../../Artgine/artgine/render/CRenderPass.js";
import { CRPAuto, CRPMgr } from "../../../Artgine/artgine/app/canvas/CRPMgr.js";
import { CCanvasPluginRPMgr } from "../../../Artgine/artgine/app/canvas/CCanvasPluginRPMgr.js";
import { CSurface } from "../../../Artgine/artgine/app/subject/CSurface.js";
import { CCondition } from "../../../Artgine/artgine/util/CCondition.js";
import { SDF } from "../../../Artgine/artgine/z_file/SDF.js";
import { CRPMgrBloom } from "../../../Artgine/plugin/Bloom/Bloom.js";
import { CFx, CDelayComp, CSpinComp } from "./CFx.js";
import { CGemComp } from "./CGemComp.js";
import { CMissileComp } from "./CMissileComp.js";

let Main = gAtl.NewCanvas("Main");
Main.SetCameraKey("2D");
gAtl.Brush().GetCam2D().SetSize(600, 800);

CBulletComp.sTargetTypes.push(CEnemyComp, CBossComp);
CFx.Init(Main, gAtl.Brush().GetCam2D());

Main.PushPlugin(new CCanvasPluginRPMgr(new CRPMgrBloom({
    preset: "OldSchool", intensity: 0.2, threshold: 0.1, softThreshold: 0.5,
    lowFrequencyBoost: 1.4, lowFrequencyBoostCurvation: 0.95, highPassFrequency: 1.0,
})));

let gGameMgr: CGameMgr = null;

function FindPlayerPos(): CVec3
{
    let p = Main.Find("Player");
    return p ? p.GetPos() : null;
}

// ── 플레이어 총알 ─────────────────────────────────────────
function SpawnPlayerBullet(_pos: CVec3, _dx: number, _dy: number, _dmg: number, _pierce: number, _size: number)
{
    let bullet = new CSubject();
    bullet.SetKey("pbullet_" + bullet.Key());

    let pt = new CPaint2D("Res/shmup_obj/bullet_01_32x32.png", new CVec2(_size, _size));
    CFx.Bloom(pt, 0.6);
    if (_pierce > 0) pt.SetColorModel(new CColor(0.1, 0.35, 0.6, CColor.eModel.RGBAdd));
    bullet.PushComp(pt);

    let rb = new CRigidBody();
    rb.Push(new CForce("move", new CVec3(_dx, _dy), 780));
    bullet.PushComp(rb);

    let cl = new CCollider(pt);
    cl.SetLayer("player_bullet");
    cl.PushCollisionLayer("enemy");
    cl.SetCameraOut(true);
    bullet.PushComp(cl);

    let bc = new CBulletComp();
    bc.mIsPlayer = true;
    bc.mDamage = _dmg;
    bc.mPierce = _pierce;
    bc.OnHit = (hitPos) => {
        CFx.Flash(hitPos, 26 + _dmg * 3, 3.2);
        CFx.Sparks(hitPos, 3, 1, 0.8, 0.4, 80, 220, 0.25, 3);
    };
    bullet.PushComp(bc);

    bullet.SetPos(_pos);
    bullet.SetRot(new CVec3(0, 0, Math.atan2(_dy, _dx)));
    Main.PushSub(bullet);
}

// ── 호밍 미사일 ───────────────────────────────────────────
function SpawnMissile(_pos: CVec3, _dmg: number)
{
    let missile = new CSubject();
    missile.SetKey("missile_" + missile.Key());

    let pt = new CPaint2D(CFx.WhiteTex(), new CVec2(6, 16));
    pt.SetColorModel(new CColor(1, 0.55, 0.2, CColor.eModel.RGBMul));
    CFx.Bloom(pt, 0.7);
    missile.PushComp(pt);

    missile.PushComp(new CRigidBody());

    let cl = new CCollider(pt);
    cl.SetLayer("player_bullet");
    cl.PushCollisionLayer("enemy");
    cl.SetCameraOut(true);
    missile.PushComp(cl);

    let bc = new CBulletComp();
    bc.mDamage = _dmg;
    bc.OnHit = (hitPos) => {
        CFx.Flash(hitPos, 56, 2.8);
        CFx.Sparks(hitPos, 8, 1, 0.55, 0.15, 100, 300, 0.35, 4);
        CFx.Shake(0.12);
    };
    missile.PushComp(bc);

    let mc = new CMissileComp();
    mc.mAngle = Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    mc.OnTrail = (p) => CFx.Glow(p, 8, 1, 0.6, 0.25, 0.25, 0.09);
    missile.PushComp(mc);

    _pos.z = 0.1;
    missile.SetPos(_pos);
    Main.PushSub(missile);
}

// ── 적 총알 ───────────────────────────────────────────────
function SpawnEnemyBullet(_pos: CVec3, _dx: number, _dy: number, _speed: number, _kind = "normal")
{
    let bullet = new CSubject();
    let pt: CPaint2D;

    if (_kind === "big")
    {
        pt = new CPaint2D("Res/shmup_obj_boss/enemy_boss01_448x256_all.png", new CVec2(22, 22));
        pt.SetTexCodi(448, 0, 512, 64, 512, 256);
        bullet.PushComp(pt);
    }
    else
    {
        let size = _kind === "gun" ? 16 : 14;
        pt = new CPaint2D(null, new CVec2(size, size));
        if (_kind === "spiral") pt.SetColorModel(new CColor(1, 0.35, 1, CColor.eModel.RGBMul));
        bullet.PushComp(pt);

        let bAni = new CAnimation();
        bAni.mLoop = true;
        bAni.Push(new CClipImg(0, 0, "Res/shmup_obj/enemy_bullet04.png"));
        bAni.Push(new CClipCoodi(0.0,  0.08,  0, 0, 16, 16));
        bAni.Push(new CClipCoodi(0.08, 0.08, 16, 0, 32, 16));
        bAni.Push(new CClipCoodi(0.16, 0.08, 32, 0, 48, 16));
        bAni.Push(new CClipCoodi(0.24, 0.08, 48, 0, 64, 16));
        bullet.PushComp(new CAniFlow(bAni));
    }
    CFx.Bloom(pt, 0.5);

    let rb = new CRigidBody();
    rb.Push(new CForce("move", new CVec3(_dx, _dy), _speed));
    bullet.PushComp(rb);

    let cl = new CCollider(pt);
    cl.SetLayer("enemy_bullet");
    cl.PushCollisionLayer("player");
    cl.SetCameraOut(true);
    bullet.PushComp(cl);

    let bc = new CBulletComp();
    bc.mIsPlayer = false;
    bc.OnHit = (hitPos) => CFx.Flash(hitPos, 40, 2.5);
    bullet.PushComp(bc);

    _pos.z = 0.12;
    bullet.SetPos(_pos);
    Main.PushSub(bullet);
}

// ── 보스 빔 (경고선 → 발사) ────────────────────────────────
function SpawnBeam(_pos: CVec3)
{
    let x = _pos.x, y = _pos.y;

    let warn = new CSubject();
    let wpt = new CPaint2D(CFx.WhiteTex(), new CVec2(4, 800));
    wpt.SetColorModel(new CColor(1, 0.15, 0.2, CColor.eModel.RGBMul));
    CFx.Bloom(wpt, 0.8);
    warn.PushComp(wpt);
    let wani = new CAnimation();
    wani.mLoop = false;
    wani.Push(new CClipAlpha(0, 0.8, new CAlpha(0.15), new CAlpha(0.9)));
    warn.PushComp(new CAniFlow(wani));
    warn.PushComp(new CDelayComp(800, () => {
        let boss = Main.Find("Boss");
        let bc = boss ? boss.FindComp(CBossComp) : null;
        if (bc && !bc.IsDead()) FireBeam(x, y);
    }));
    warn.SetPos(new CVec3(x, y - 400, 0.14));
    Main.PushSub(warn);
}

function FireBeam(_x: number, _y: number)
{
    let beam = new CSubject();
    let pt = new CPaint2D("Res/shmup_obj/enemy_beam01_64x64.png", new CVec2(50, 800));
    CFx.Bloom(pt, 0.6);
    beam.PushComp(pt);

    let cl = new CCollider(pt);
    cl.SetLayer("enemy_bullet");
    cl.PushCollisionLayer("player");
    beam.PushComp(cl);

    let core = new CSubject();
    let cpt = new CPaint2D(CFx.WhiteTex(), new CVec2(14, 800));
    cpt.SetColorModel(new CColor(1, 0.6, 0.9, CColor.eModel.RGBMul));
    CFx.Bloom(cpt, 0.5);
    core.PushComp(cpt);
    core.SetPos(new CVec3(0, 0, 0.01));
    beam.PushChild(core);

    let ani = new CAnimation();
    ani.mLoop = false;
    ani.Push(new CClipPRS(0, 0.12, new CVec3(0.1, 1, 1), new CVec3(1, 1, 1), CClipPRS.eType.Sca));
    ani.Push(new CClipAlpha(1.2, 0.35, new CAlpha(1), new CAlpha(0)));
    ani.Push(new CClipDestroy(1.55));
    beam.PushComp(new CAniFlow(ani));

    beam.SetSca(new CVec3(0.1, 1, 1));
    beam.SetPos(new CVec3(_x, _y - 400, 0.15));
    Main.PushSub(beam);

    CFx.Flash(new CVec3(_x, _y), 120, 2);
    CFx.Sparks(new CVec3(_x, _y), 16, 1, 0.5, 1, 100, 300, 0.5, 5);
    CFx.Shake(0.55);
}

// ── 경험치 보석 ───────────────────────────────────────────
function SpawnGems(_pos: CVec3, _xp: number)
{
    let count = Math.min(_xp, 10);
    let value = Math.ceil(_xp / count);
    for (let i = 0; i < count; i++)
    {
        let gem = new CSubject();
        let big = value > 1;
        let pt = new CPaint2D(CFx.WhiteTex(), new CVec2(big ? 12 : 9, big ? 12 : 9));
        pt.SetColorModel(big ? new CColor(1, 0.85, 0.3, CColor.eModel.RGBMul) : new CColor(0.3, 1, 0.75, CColor.eModel.RGBMul));
        CFx.Bloom(pt, 0.8);
        gem.PushComp(pt);

        let gc = new CGemComp();
        gc.mXP = value;
        gc.OnCollect = (xp, p) => {
            CFx.Glow(p, 18, 0.5, 1, 0.8, 0.2);
            if (gGameMgr) gGameMgr.AddXP(xp);
        };
        gem.PushComp(gc);

        gem.SetPos(new CVec3(_pos.x, _pos.y, 0.08));
        Main.PushSub(gem);
    }
}

// ── 적 생성 ───────────────────────────────────────────────
function SpawnEnemy(_charId: string, _x: number, _yOff: number, _mgr: CGameMgr)
{
    const char = CEnemyComp.sCharacters[_charId];
    if (!char) return;

    let enemy = new CSubject();
    enemy.SetKey("enemy_" + enemy.Key());

    let pt = new CPaint2D(char.path, new CVec2(char.w, char.h));
    enemy.PushComp(pt);
    if (char.flip) enemy.SetRot(new CVec3(0, 0, Math.PI));

    let stage = _mgr.mStage;
    let rb = new CRigidBody();
    rb.Push(new CForce("move", new CVec3(0, -1), char.speed * (1 + (stage - 1) * 0.1)));
    enemy.PushComp(rb);

    let ec = new CEnemyComp();
    ec.Init(char, stage, _mgr.mWave);
    ec.OnFindPlayer = FindPlayerPos;
    ec.OnShoot = (shotPos, dx, dy, aim) => {
        let speed = 150 + (stage - 1) * 20;
        let p = FindPlayerPos();
        if (aim && p)
        {
            let ax = p.x - shotPos.x, ay = p.y - shotPos.y;
            let len = Math.sqrt(ax * ax + ay * ay) || 1;
            dx = ax / len; dy = ay / len;
            speed += 20;
        }
        SpawnEnemyBullet(shotPos, dx, dy, speed);
    };
    ec.OnDestroy = (diePos, c, score) => {
        CFx.Explosion(diePos, Math.max(0.6, c.w / 50));
        _mgr.AddKill(score);
        SpawnGems(diePos, c.xp);
    };
    enemy.PushComp(ec);

    enemy.SetPos(new CVec3(_x, 450 + _yOff, 0.05));
    Main.PushSub(enemy);
}

// ── 보스 생성 ─────────────────────────────────────────────
function NewAtlasPart(_size: number, _sx: number, _sy: number, _ex: number, _ey: number): CSubject
{
    let sub = new CSubject();
    let pt = new CPaint2D("Res/shmup_obj_boss/enemy_boss01_448x256_all.png", new CVec2(_size, _size));
    pt.SetTexCodi(_sx, _sy, _ex, _ey, 512, 256);
    sub.PushComp(pt);
    return sub;
}

function SpawnBoss(_mgr: CGameMgr)
{
    let boss = new CSubject();
    boss.SetKey("Boss");

    let pt = new CPaint2D("Res/shmup_obj_boss/enemy_boss01_448x256_all.png", new CVec2(280, 160));
    pt.SetTexCodi(0, 0, 448, 256, 512, 256);
    boss.PushComp(pt);

    let core = NewAtlasPart(52, 448, 64, 512, 128);
    core.PushComp(new CSpinComp(2.5));
    core.SetPos(new CVec3(0, 16, 0.1));
    boss.PushChild(core);

    let orb = NewAtlasPart(26, 448, 0, 512, 64);
    CFx.Bloom(orb.FindComp(CPaint2D), 1);
    orb.SetPos(new CVec3(0, 16, 0.11));
    boss.PushChild(orb);

    let gunL = NewAtlasPart(44, 448, 128, 512, 192);
    gunL.SetPos(new CVec3(-CBossComp.sGunOffX, CBossComp.sGunOffY, 0.1));
    boss.PushChild(gunL);
    let gunR = NewAtlasPart(44, 448, 128, 512, 192);
    gunR.SetPos(new CVec3(CBossComp.sGunOffX, CBossComp.sGunOffY, 0.1));
    boss.PushChild(gunR);

    let stage = _mgr.mStage;
    let bc = new CBossComp();
    bc.mHP          = 1600 + (stage - 1) * 1200;
    bc.mMaxHP       = bc.mHP;
    bc.mBulletSpeed = 160 + (stage - 1) * 20;
    bc.mGunL = gunL;
    bc.mGunR = gunR;
    bc.OnFindPlayer = FindPlayerPos;
    bc.OnShoot  = (pos, dx, dy, speed, kind) => SpawnEnemyBullet(pos, dx, dy, speed, kind);
    bc.OnBeam   = (pos) => SpawnBeam(pos);
    bc.OnDamage = (hp, max) => _mgr.UpdateBossHP(hp, max);
    bc.OnPhase  = (phase, pos) => {
        CFx.ClearEnemyBullets();
        CFx.Explosion(pos, 2.2);
        CFx.Ring(pos, 700, 0.6, 0.05, 1);
        CFx.ScreenFlash(1, 1, 1, 0.6, 0.45);
        CFx.Shake(0.8);
        _mgr.ShowAnnounce(
            `<div style="font-family:sans-serif;color:#f5a;font-size:40px;font-weight:bold;letter-spacing:6px;
                white-space:nowrap;text-shadow:0 0 20px #f08,2px 2px 0 #000">PHASE ${phase}</div>`, 1400, 60);
    };
    bc.OnDying = (p) => CFx.Explosion(p, 0.9 + Math.random() * 0.8);
    bc.OnDestroy = (pos) => {
        CFx.ClearEnemyBullets();
        CFx.Explosion(pos, 3.2);
        CFx.Ring(pos, 1200, 0.9, 0.05, 1);
        CFx.Sparks(pos, 50, 1, 0.8, 0.4, 150, 600, 1.0, 6);
        CFx.ScreenFlash(1, 1, 1, 0.55, 0.6);
        CFx.Shake(1);
        SpawnGems(pos, 40 + stage * 10);
        _mgr.AddKill(20000 * stage);
        _mgr.ShowClear();
    };
    boss.PushComp(bc);

    boss.SetPos(new CVec3(0, 540, 0));
    Main.PushSub(boss);
}

// ── 폭탄 ──────────────────────────────────────────────────
function ExeBomb(_pos: CVec3, _stage: number)
{
    CFx.ScreenFlash(1, 1, 1, 0.85, 0.6);
    CFx.Ring(_pos, 1600, 0.7, 0.03, 1);
    CFx.Ring(_pos, 900, 0.5, 0.03, 1);
    CFx.Sparks(_pos, 40, 0.6, 0.9, 1, 200, 700, 0.8, 6);
    CFx.Shake(0.9);
    CFx.ClearEnemyBullets();

    for (let [, sub] of Main.GetSubMap())
    {
        if (sub.IsDestroy()) continue;
        let dmg = CBulletComp.FindDamageable(sub);
        if (dmg == null || dmg.IsDead()) continue;
        let isBoss = sub.FindComp(CBossComp) != null;
        dmg.TakeDamage(isBoss ? 60 + _stage * 20 : 40 + _stage * 20);
    }
}

// ── 게임 시작 / 재시작 ────────────────────────────────────
function StartGame()
{
    Main.Clear();
    Main.SetPause(false);
    CGemComp.sMagnet = 140;

    Main.PushSub(new CBackGround());

    let mgr = new CGameMgr();

    let player = new CSubject();
    player.SetKey("Player");
    player.PushComp(new CPaint2D("Res/shmup_obj/airplane_01_64x64.png"));
    let pc = new CPlayerComp();
    let lastHP = pc.mHP;
    pc.OnShoot   = SpawnPlayerBullet;
    pc.OnMissile = SpawnMissile;
    pc.OnDamage  = (hp, maxHP) => {
        mgr.UpdateHP(hp, maxHP);
        if (hp < lastHP)
        {
            let pos = player.GetPos().Export() as CVec3;
            CFx.ScreenFlash(1, 0, 0, 0.4, 0.35);
            CFx.Shake(0.55);
            CFx.Flash(pos, 90, 2);
            CFx.Sparks(pos, 14, 1, 0.3, 0.3, 120, 360, 0.5, 5);
            if (hp <= 0)
            {
                CFx.Explosion(pos, 2.2);
                let p1 = pos.Export() as CVec3; p1.x -= 30; p1.y += 20; CFx.Explosion(p1, 1.2);
                let p2 = pos.Export() as CVec3; p2.x += 30; p2.y -= 10; CFx.Explosion(p2, 1.2);
                CFx.Shake(1);
                mgr.ShowGameOver();
            }
        }
        lastHP = hp;
    };
    pc.OnBomb = (pos, bomb) => {
        mgr.UpdateBomb(bomb);
        ExeBomb(pos, mgr.mStage);
    };
    pc.OnEvolve = (pos, tier) => {
        CFx.Ring(pos, 420, 0.6, 0.05, 1);
        CFx.Sparks(pos, 30, 0.4, 0.9, 1, 150, 450, 0.7, 5);
        CFx.ScreenFlash(0.5, 0.9, 1, 0.5, 0.5);
        CFx.Shake(0.4);
        mgr.ShowAnnounce(
            `<div style="font-family:sans-serif;color:#7ff;font-size:44px;font-weight:bold;letter-spacing:5px;
                white-space:nowrap;text-shadow:0 0 25px #0ff,2px 2px 0 #008">EVOLUTION ${"★".repeat(tier)}</div>`, 1600, -60);
    };
    player.PushComp(pc);
    player.SetPos(new CVec3(0, -300, 0.1));
    Main.PushSub(player);
    CGemComp.sPlayer = player;

    mgr.mPlayer = pc;
    mgr.OnSpawnEnemy = (charId, x, yOff) => SpawnEnemy(charId, x, yOff, mgr);
    mgr.OnSpawnBoss  = () => SpawnBoss(mgr);
    mgr.OnRestart    = () => StartGame();
    mgr.OnPause      = (p) => Main.SetPause(p);
    mgr.OnLevelUp    = () => {
        let pos = player.GetPos();
        CFx.Ring(pos, 360, 0.5, 0.05, 1);
        CFx.Sparks(pos, 24, 1, 0.9, 0.3, 120, 380, 0.6, 5);
        CFx.ScreenFlash(1, 0.9, 0.4, 0.35, 0.4);
    };
    mgr.OnUpgrade    = (id) => {
        let pos = player.GetPos();
        CFx.Glow(pos, 120, 0.6, 1, 0.9, 0.4);
        CFx.Sparks(pos, 18, 0.5, 1, 0.9, 100, 320, 0.5, 4);
        mgr.UpdateBomb(pc.mBomb);
    };
    mgr.OnWarning    = () => {
        CFx.ScreenFlash(1, 0, 0, 0.45, 0.9);
        CFx.Shake(0.35);
    };
    Main.PushSub(mgr);
    gGameMgr = mgr;
}

gAtl.Frame().PushEvent(CEvent.eType.Init, () =>
{
    StartGame();
});

// 업그레이드 창이 떠 있는 동안 Main 캔버스가 일시정지되어 CGameMgr.Update가 돌지 않으므로 프레임 이벤트에서 키 입력을 받는다
gAtl.Frame().PushEvent(CEvent.eType.Update, () =>
{
    if (gGameMgr) gGameMgr.UpgradeInput(gAtl.Frame().Input());
});
