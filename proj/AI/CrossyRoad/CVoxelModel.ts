import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CPaint } from "../../../Artgine/artgine/app/component/paint/CPaint.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CFrame } from "../../../Artgine/artgine/util/CFrame.js";
import { CAudioBuf } from "../../../Artgine/artgine/system/audio/CAudio.js";
import { CAnimation, CClipPRS } from "../../../Artgine/artgine/app/component/CAnimation.js";

export const TILE = 10;
export const COL_MIN = -4;
export const COL_MAX = 4;
export const SIDE_COL = 16;
export const WRAP_X = 230;

export function RGB(_r: number, _g: number, _b: number)
{
    return new CColor(_r, _g, _b, CColor.eModel.RGBAdd);
}
export function V3(_x: number, _y: number, _z: number)
{
    return new CVec3(_x, _y, _z);
}
export function OnceAni()
{
    let ani = new CAnimation();
    ani.mLoop = false;
    return ani;
}
export function ClipPRS(_time: number, _delay: number, _st: CVec3, _ed: CVec3, _type: number)
{
    let clip = new CClipPRS(_time, _delay, _st, _ed, _type);
    // CUtilMath.WeightVec3는 진행률이 0.9999999999999999일 때 w+1이 2로 반올림돼 배열 범위를 넘어 예외가 나고
    // WASM 업데이트 루프가 멈춘다. 2점 베지어(=선형) 경로는 이 문제가 없어서 그쪽으로 우회한다.
    clip.mBezierRangeX = 0;
    return clip;
}

export class CVoxelModel
{
    // 그림자맵에서 비어있는 텍셀은 가려진 것으로 판정되므로, 그림자를 받는 바닥도 ShadowReadOnly 없이 깊이를 써야 한다
    static Box(_parent: CSubject, _pos: CVec3, _size: CVec3, _color: CColor, _shadow = true): CSubject
    {
        let sub = new CSubject();
        sub.SetPos(_pos);
        sub.SetSca(_size);
        let pt = sub.PushComp(new CPaint3D(CFrame.Main().Pal().GetBoxMesh()));
        pt.SetColorModel(_color);
        pt.PushTag(CPaint.eTag.Light);
        if (_shadow)
            pt.PushTag(CPaint.eTag.Shadow);
        _parent.PushChild(sub);
        return sub;
    }
    static SetBoxColor(_box: CSubject, _color: CColor)
    {
        _box.FindComp(CPaint3D).SetColorModel(_color);
    }

    static Chicken(_root: CSubject)
    {
        const white = RGB(0.96, 0.96, 0.94);
        const orange = RGB(1.0, 0.55, 0.1);
        const red = RGB(0.9, 0.15, 0.15);
        const black = RGB(0.05, 0.05, 0.05);
        CVoxelModel.Box(_root, V3(0, 5.5, 0.5), V3(6, 7, 6), white);
        CVoxelModel.Box(_root, V3(0, 5.5, 4), V3(4, 3, 1.5), white);
        CVoxelModel.Box(_root, V3(0, 9.5, -1), V3(1.4, 1.6, 3), red);
        CVoxelModel.Box(_root, V3(0, 7.2, -3.2), V3(1.8, 1.4, 1.6), orange);
        CVoxelModel.Box(_root, V3(0, 5.9, -3.0), V3(1.0, 1.4, 1.0), red);
        CVoxelModel.Box(_root, V3(3.05, 7.8, -1.2), V3(0.3, 1.1, 1.1), black);
        CVoxelModel.Box(_root, V3(-3.05, 7.8, -1.2), V3(0.3, 1.1, 1.1), black);
        CVoxelModel.Box(_root, V3(3.2, 5.2, 0.8), V3(0.6, 3, 3.5), white);
        CVoxelModel.Box(_root, V3(-3.2, 5.2, 0.8), V3(0.6, 3, 3.5), white);
        CVoxelModel.Box(_root, V3(1.4, 1, 0.5), V3(1, 2, 1), orange);
        CVoxelModel.Box(_root, V3(-1.4, 1, 0.5), V3(1, 2, 1), orange);
    }

    static Tree(_root: CSubject, _height: number)
    {
        CVoxelModel.Box(_root, V3(0, 2, 0), V3(3.5, 4, 3.5), RGB(0.45, 0.3, 0.2));
        CVoxelModel.Box(_root, V3(0, 4 + _height * 0.5, 0), V3(8, _height, 8), RGB(0.32, 0.62, 0.24));
    }
    static Rock(_root: CSubject)
    {
        CVoxelModel.Box(_root, V3(0, 2.5, 0), V3(7.5, 5, 7), RGB(0.55, 0.55, 0.58));
        CVoxelModel.Box(_root, V3(0.5, 5.5, 0), V3(5, 1.5, 5), RGB(0.62, 0.62, 0.65));
    }

    static Car(_root: CSubject, _color: CColor, _dir: number)
    {
        CVoxelModel.Box(_root, V3(0, 3.5, 0), V3(16, 4.5, 8), _color);
        CVoxelModel.Box(_root, V3(-_dir * 1.5, 7.3, 0), V3(9, 3.2, 7), RGB(0.9, 0.93, 0.97));
        CVoxelModel.Box(_root, V3(_dir * 3.2, 7.3, 0), V3(0.4, 2.6, 6.4), RGB(0.25, 0.35, 0.45));
        const black = RGB(0.1, 0.1, 0.1);
        for (const wx of [-5, 5])
            for (const wz of [-4, 4])
                CVoxelModel.Box(_root, V3(wx, 1.5, wz), V3(3.2, 3, 1.2), black);
        CVoxelModel.Box(_root, V3(_dir * 8.05, 4, 2.5), V3(0.3, 1.2, 1.5), RGB(1, 1, 0.7));
        CVoxelModel.Box(_root, V3(_dir * 8.05, 4, -2.5), V3(0.3, 1.2, 1.5), RGB(1, 1, 0.7));
    }
    static Truck(_root: CSubject, _color: CColor, _dir: number)
    {
        CVoxelModel.Box(_root, V3(_dir * 9, 5, 0), V3(7, 8, 8), _color);
        CVoxelModel.Box(_root, V3(_dir * 11, 7, 0), V3(3.2, 3, 7.2), RGB(0.25, 0.35, 0.45));
        CVoxelModel.Box(_root, V3(-_dir * 3.5, 6, 0), V3(18, 10, 8.4), RGB(0.92, 0.92, 0.9));
        const black = RGB(0.1, 0.1, 0.1);
        for (const wx of [-10, -3, 9])
            for (const wz of [-4.2, 4.2])
                CVoxelModel.Box(_root, V3(_dir * wx, 1.5, wz), V3(3.2, 3, 1.2), black);
    }
    static Log(_root: CSubject, _len: number)
    {
        CVoxelModel.Box(_root, V3(0, -1.5, 0), V3(_len, 3.5, 7.5), RGB(0.55, 0.36, 0.2));
        CVoxelModel.Box(_root, V3(_len * 0.5 - 0.4, -1.5, 0), V3(1, 3.2, 6.5), RGB(0.8, 0.62, 0.4));
        CVoxelModel.Box(_root, V3(-_len * 0.5 + 0.4, -1.5, 0), V3(1, 3.2, 6.5), RGB(0.8, 0.62, 0.4));
    }
    static TrainCar(_root: CSubject, _offX: number, _len: number, _color: CColor, _engine: boolean)
    {
        CVoxelModel.Box(_root, V3(_offX, 7, 0), V3(_len - 1, 11, 9), _color);
        CVoxelModel.Box(_root, V3(_offX, 9, 0), V3(_len - 5, 3, 9.2), RGB(0.8, 0.9, 1.0));
        if (_engine)
            CVoxelModel.Box(_root, V3(_offX, 13.5, 0), V3(_len * 0.4, 2, 7), RGB(0.2, 0.2, 0.22));
        CVoxelModel.Box(_root, V3(_offX, 1.2, 0), V3(_len - 3, 2.4, 7), RGB(0.15, 0.15, 0.15));
    }
    static Coin(_root: CSubject)
    {
        CVoxelModel.Box(_root, V3(0, 0, 0), V3(4.5, 4.5, 1.2), RGB(1.0, 0.82, 0.1));
        CVoxelModel.Box(_root, V3(0, 0, 0), V3(2, 2, 1.4), RGB(1.0, 0.95, 0.5));
    }
    static Eagle(_root: CSubject)
    {
        const brown = RGB(0.35, 0.22, 0.12);
        CVoxelModel.Box(_root, V3(0, 0, 0), V3(8, 5, 12), brown);
        CVoxelModel.Box(_root, V3(0, 0.5, 0), V3(34, 1.2, 8), brown);
        CVoxelModel.Box(_root, V3(0, 2, 7.5), V3(5, 4.5, 4.5), RGB(0.97, 0.97, 0.95));
        CVoxelModel.Box(_root, V3(0, 1.5, 10.5), V3(2, 1.8, 2.5), RGB(1.0, 0.8, 0.1));
        CVoxelModel.Box(_root, V3(0, -0.5, -8), V3(6, 1.2, 5), RGB(0.95, 0.95, 0.93));
    }
    static Particle(_root: CSubject, _color: CColor, _size: number)
    {
        return CVoxelModel.Box(_root, V3(0, 0, 0), V3(_size, _size, _size), _color, false);
    }
}

export class CSfx
{
    static sMute = false;
    static Play(_key: string | string[], _volume = 0.6)
    {
        if (CSfx.sMute) return;
        let list = typeof _key == "string" ? [_key] : _key;
        let audio = new CAudioBuf(list.map((k) => "Res/sound/" + k + ".ogg"));
        audio.SetRemove(true);
        audio.Volume(_volume);
        audio.Play();
    }
}
