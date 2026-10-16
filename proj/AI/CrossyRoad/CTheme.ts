import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CColor } from "../../../Artgine/artgine/render/CColor.js";
import { CVoxelModel, RGB, V3 } from "./CVoxelModel.js";

type RGB3 = number[];
const B = CVoxelModel.Box;
const C = (_c: RGB3) => RGB(_c[0], _c[1], _c[2]);

export class CTheme
{
    mKey = "classic";
    mName = "클래식";
    mDesc = "닭 · 도로 · 강 · 기차";
    mTitle = "CROSSY ROAD";
    mIcon: RGB3 = [0.96, 0.96, 0.94];
    mSky: RGB3 = [0.42, 0.74, 0.96];
    mGrass: RGB3[] = [[0.56, 0.83, 0.38], [0.51, 0.78, 0.35], [0.45, 0.68, 0.3], [0.41, 0.63, 0.28]];
    mRoad: RGB3[] = [[0.36, 0.37, 0.41], [0.3, 0.31, 0.35]];
    mRoadMark: RGB3 = [0.92, 0.92, 0.88];
    mRiver: RGB3[] = [[0.33, 0.68, 0.96], [0.28, 0.6, 0.9]];
    mRail: RGB3[] = [[0.5, 0.46, 0.43], [0.43, 0.4, 0.37]];
    mSleeper: RGB3 = [0.45, 0.3, 0.2];
    mRailBar: RGB3 = [0.68, 0.68, 0.72];
    mCarColors: RGB3[] = [
        [0.95, 0.3, 0.25], [0.25, 0.55, 0.95], [0.98, 0.78, 0.15],
        [0.4, 0.8, 0.35], [0.7, 0.35, 0.85], [1.0, 0.55, 0.2],
    ];
    mBodyColor: RGB3 = [0.97, 0.97, 0.95];
    mDeathText: Record<string, string> = {
        car: "차에 치였어요!",
        train: "기차에 치였어요!",
        water: "물에 빠졌어요!",
        edge: "통나무와 함께 떠내려갔어요!",
        eagle: "독수리에게 잡혀갔어요!",
    };

    Player(_root: CSubject) { CVoxelModel.Chicken(_root); }
    Tree(_root: CSubject, _h: number) { CVoxelModel.Tree(_root, _h); }
    Rock(_root: CSubject) { CVoxelModel.Rock(_root); }
    Car(_root: CSubject, _color: CColor, _dir: number) { CVoxelModel.Car(_root, _color, _dir); }
    Truck(_root: CSubject, _color: CColor, _dir: number) { CVoxelModel.Truck(_root, _color, _dir); }
    Log(_root: CSubject, _len: number) { CVoxelModel.Log(_root, _len); }
    TrainCar(_root: CSubject, _off: number, _len: number, _dir: number, _engine: boolean)
    {
        CVoxelModel.TrainCar(_root, _off, _len, _engine ? RGB(0.85, 0.15, 0.15) : RGB(0.2, 0.4, 0.8), _engine);
    }
    Coin(_root: CSubject) { CVoxelModel.Coin(_root); }
    Eagle(_root: CSubject) { CVoxelModel.Eagle(_root); }

    protected Bird(_root: CSubject, _body: RGB3, _wing: RGB3, _head: RGB3, _beak: RGB3)
    {
        B(_root, V3(0, 0, 0), V3(8, 5, 12), C(_body));
        B(_root, V3(0, 0.5, 0), V3(34, 1.2, 8), C(_wing));
        B(_root, V3(0, 2, 7.5), V3(5, 4.5, 4.5), C(_head));
        B(_root, V3(0, 1.5, 10.5), V3(2, 1.8, 2.5), C(_beak));
        B(_root, V3(0, -0.5, -8), V3(6, 1.2, 5), C(_head));
    }

    static sList: CTheme[] = [];
    static sCur: CTheme = null;
    static Cur() { return CTheme.sCur; }
    static Select(_key: string)
    {
        CTheme.sCur = CTheme.sList.find((t) => t.mKey == _key) || CTheme.sList[0];
        return CTheme.sCur;
    }
}

class CThemeMonster extends CTheme
{
    override mKey = "monster";
    override mName = "몬스터";
    override mDesc = "풀숲 · 야생 몬스터 · 연잎 · 전기 열차";
    override mTitle = "MONSTER ROAD";
    override mIcon: RGB3 = [1.0, 0.62, 0.78];
    override mSky: RGB3 = [0.55, 0.82, 1.0];
    override mGrass: RGB3[] = [[0.47, 0.8, 0.33], [0.43, 0.75, 0.3], [0.3, 0.58, 0.25], [0.28, 0.55, 0.23]];
    override mRoad: RGB3[] = [[0.8, 0.66, 0.45], [0.72, 0.58, 0.38]];
    override mRoadMark: RGB3 = [0.88, 0.76, 0.55];
    override mRiver: RGB3[] = [[0.3, 0.62, 0.95], [0.25, 0.55, 0.88]];
    override mRail: RGB3[] = [[0.62, 0.55, 0.48], [0.55, 0.48, 0.42]];
    override mCarColors: RGB3[] = [[0.55, 0.5, 0.62], [0.35, 0.65, 0.6], [0.85, 0.5, 0.25], [0.6, 0.45, 0.3], [0.45, 0.55, 0.85]];
    override mBodyColor: RGB3 = [1.0, 0.62, 0.78];
    override mDeathText: Record<string, string> = {
        car: "야생 몬스터에게 들이받혔어요!",
        train: "전기 열차에 치였어요!",
        water: "물에 빠졌어요!",
        edge: "연잎과 함께 떠내려갔어요!",
        eagle: "거대 새에게 잡혀갔어요!",
    };

    override Player(_root: CSubject)
    {
        const pink = RGB(1.0, 0.62, 0.78);
        const dark = RGB(0.85, 0.45, 0.62);
        const purple = RGB(0.55, 0.3, 0.7);
        B(_root, V3(0, 5, 0), V3(7, 7, 7), pink);
        B(_root, V3(2.2, 9.5, 0.5), V3(1.6, 2.4, 1.6), pink);
        B(_root, V3(-2.2, 9.5, 0.5), V3(1.6, 2.4, 1.6), pink);
        B(_root, V3(2.2, 11.1, 0.5), V3(1.1, 0.9, 1.1), purple);
        B(_root, V3(-2.2, 11.1, 0.5), V3(1.1, 0.9, 1.1), purple);
        for (const s of [1, -1])
        {
            B(_root, V3(s * 1.6, 6.4, -3.6), V3(1.7, 2.1, 0.3), RGB(1, 1, 1));
            B(_root, V3(s * 1.5, 6.2, -3.8), V3(0.9, 1.3, 0.2), RGB(0.05, 0.05, 0.1));
            B(_root, V3(s * 2.9, 4.6, -3.6), V3(1.2, 0.8, 0.2), RGB(1.0, 0.35, 0.4));
            B(_root, V3(s * 1.8, 0.8, -0.3), V3(2, 1.6, 2.6), dark);
        }
        B(_root, V3(0, 4.2, 4.2), V3(1.6, 1.6, 2), dark);
        B(_root, V3(0, 5.6, 5.2), V3(1.4, 1.8, 1.2), purple);
    }
    override Tree(_root: CSubject, _h: number)
    {
        B(_root, V3(0, 2, 0), V3(3, 4, 3), RGB(0.5, 0.33, 0.2));
        const green = RGB(0.2, 0.52, 0.24);
        B(_root, V3(0, 4 + _h * 0.5, 0), V3(9, _h - 2, 6), green);
        B(_root, V3(0, 4 + _h * 0.5, 0), V3(6, _h, 9), green);
        B(_root, V3(4.6, 3 + _h * 0.6, -2), V3(1.5, 1.5, 1.5), RGB(0.95, 0.25, 0.3), false);
        B(_root, V3(-2, 4 + _h * 0.4, 4.6), V3(1.5, 1.5, 1.5), RGB(0.3, 0.45, 0.95), false);
    }
    override Rock(_root: CSubject)
    {
        const blades: number[][] = [[-2.5, -2.5, 6], [0, -2.8, 7], [2.5, -2.2, 5.5], [-2.8, 0, 5], [0, 0, 7.5], [2.6, 0.3, 6], [-2, 2.6, 6.5], [0.5, 2.7, 5], [2.8, 2.5, 7]];
        for (const b of blades)
            B(_root, V3(b[0], b[2] * 0.5, b[1]), V3(1.6, b[2], 1.6), RGB(0.22, 0.55, 0.2));
    }
    private Beast(_root: CSubject, _color: CColor, _dir: number, _len: number)
    {
        const leg = RGB(0.25, 0.22, 0.25);
        B(_root, V3(0, 5, 0), V3(_len - 4, 6, 8), _color);
        B(_root, V3(_dir * (_len * 0.5 - 2), 5.5, 0), V3(4, 5, 6.5), _color);
        B(_root, V3(_dir * (_len * 0.5 + 0.8), 6.5, 0), V3(1.6, 1.6, 1.6), RGB(0.96, 0.94, 0.85));
        B(_root, V3(_dir * (_len * 0.5 + 0.5), 8, 0), V3(1.2, 2.4, 1.2), RGB(0.96, 0.94, 0.85));
        B(_root, V3(_dir * (_len * 0.5 - 1.5), 7, 3.3), V3(1, 1.2, 0.3), RGB(0.05, 0.05, 0.05));
        B(_root, V3(_dir * (_len * 0.5 - 1.5), 7, -3.3), V3(1, 1.2, 0.3), RGB(0.05, 0.05, 0.05));
        B(_root, V3(0, 8.4, 0), V3(_len - 8, 1.2, 4), RGB(0.95, 0.85, 0.3));
        for (const lx of [-(_len * 0.5 - 4), _len * 0.5 - 4])
            for (const lz of [-2.8, 2.8])
                B(_root, V3(lx, 1, lz), V3(2.4, 2, 2.4), leg);
    }
    override Car(_root: CSubject, _color: CColor, _dir: number) { this.Beast(_root, _color, _dir, 16); }
    override Truck(_root: CSubject, _color: CColor, _dir: number) { this.Beast(_root, _color, _dir, 26); }
    override Log(_root: CSubject, _len: number)
    {
        B(_root, V3(0, -0.6, 0), V3(_len, 1.4, 8), RGB(0.3, 0.68, 0.3));
        B(_root, V3(0, -0.5, 0), V3(_len - 2, 1.4, 6), RGB(0.38, 0.78, 0.36));
        B(_root, V3(_len * 0.25, 0.6, 1.5), V3(2, 1.2, 2), RGB(1.0, 0.6, 0.8));
        B(_root, V3(_len * 0.25, 1.1, 1.5), V3(0.8, 0.6, 0.8), RGB(1.0, 0.9, 0.3));
    }
    override TrainCar(_root: CSubject, _off: number, _len: number, _dir: number, _engine: boolean)
    {
        CVoxelModel.TrainCar(_root, _off, _len, _engine ? RGB(1.0, 0.82, 0.12) : RGB(0.95, 0.95, 0.9), _engine);
        B(_root, V3(_off, 4.2, 0), V3(_len - 1.2, 1.2, 9.3), RGB(0.12, 0.12, 0.14));
        if (_engine)
            B(_root, V3(_off + _dir * _len * 0.2, 14.8, 0), V3(1, 3, 1), RGB(1.0, 0.95, 0.4));
    }
    override Coin(_root: CSubject)
    {
        B(_root, V3(0, 0, 0), V3(4, 4, 4), RGB(0.95, 0.25, 0.35));
        B(_root, V3(0, 2.6, 0), V3(1, 1.4, 1), RGB(0.3, 0.2, 0.1));
        B(_root, V3(1, 2.8, 0), V3(2, 0.6, 1.4), RGB(0.3, 0.7, 0.25));
    }
    override Eagle(_root: CSubject) { this.Bird(_root, [0.62, 0.4, 0.25], [0.55, 0.32, 0.2], [0.95, 0.8, 0.5], [1.0, 0.45, 0.2]); }
}

class CThemeOcean extends CTheme
{
    override mKey = "ocean";
    override mName = "바다";
    override mDesc = "게 · 상어 · 뗏목 · 고래";
    override mTitle = "OCEAN ROAD";
    override mIcon: RGB3 = [0.2, 0.7, 0.9];
    override mSky: RGB3 = [0.5, 0.86, 0.98];
    override mGrass: RGB3[] = [[0.96, 0.88, 0.64], [0.93, 0.84, 0.6], [0.88, 0.78, 0.55], [0.85, 0.75, 0.52]];
    override mRoad: RGB3[] = [[0.45, 0.85, 0.85], [0.4, 0.78, 0.8]];
    override mRoadMark: RGB3 = [0.85, 0.97, 0.97];
    override mRiver: RGB3[] = [[0.12, 0.4, 0.78], [0.1, 0.35, 0.7]];
    override mRail: RGB3[] = [[0.3, 0.55, 0.72], [0.26, 0.5, 0.66]];
    override mSleeper: RGB3 = [0.25, 0.47, 0.62];
    override mRailBar: RGB3 = [0.95, 0.95, 0.9];
    override mCarColors: RGB3[] = [[0.55, 0.6, 0.68], [0.45, 0.52, 0.62], [0.62, 0.66, 0.72], [0.4, 0.47, 0.56]];
    override mBodyColor: RGB3 = [0.95, 0.3, 0.2];
    override mDeathText: Record<string, string> = {
        car: "상어에게 물렸어요!",
        train: "고래에게 휩쓸렸어요!",
        water: "깊은 바다에 빠졌어요!",
        edge: "뗏목과 함께 떠내려갔어요!",
        eagle: "갈매기에게 잡혀갔어요!",
    };

    override Player(_root: CSubject)
    {
        const red = RGB(0.95, 0.3, 0.2);
        const dark = RGB(0.78, 0.2, 0.15);
        B(_root, V3(0, 3.8, 0), V3(7.5, 3.6, 6), red);
        B(_root, V3(0, 5.8, 0.3), V3(5.5, 1, 4.5), dark);
        for (const s of [1, -1])
        {
            B(_root, V3(s * 1.6, 6.8, -1.8), V3(0.7, 2.4, 0.7), red);
            B(_root, V3(s * 1.6, 8.4, -1.8), V3(1.4, 1.4, 1.4), RGB(1, 1, 1));
            B(_root, V3(s * 1.6, 8.4, -2.55), V3(0.8, 0.8, 0.2), RGB(0.05, 0.05, 0.05));
            B(_root, V3(s * 4.3, 4.2, -2.8), V3(2.6, 2.6, 2.6), red);
            B(_root, V3(s * 4.3, 4.2, -4.4), V3(1, 1.4, 1), dark);
            for (const lz of [-1.5, 0.5, 2.5])
                B(_root, V3(s * 4.3, 1.4, lz), V3(2.4, 0.8, 0.8), dark);
        }
    }
    override Tree(_root: CSubject, _h: number)
    {
        const top = 6 + _h;
        B(_root, V3(0, top * 0.5, 0), V3(1.8, top, 1.8), RGB(0.6, 0.45, 0.28));
        B(_root, V3(0, top - _h * 0.3, 0), V3(2.2, 1, 2.2), RGB(0.5, 0.36, 0.22));
        const leaf = RGB(0.25, 0.65, 0.3);
        B(_root, V3(0, top + 0.4, 0), V3(12, 1.1, 3), leaf);
        B(_root, V3(0, top + 0.4, 0), V3(3, 1.1, 12), leaf);
        B(_root, V3(0, top + 1.2, 0), V3(4, 1.4, 4), RGB(0.3, 0.72, 0.34));
        B(_root, V3(1.3, top - 1, 1.3), V3(1.5, 1.5, 1.5), RGB(0.45, 0.3, 0.15), false);
        B(_root, V3(-1.3, top - 1, 0.6), V3(1.5, 1.5, 1.5), RGB(0.45, 0.3, 0.15), false);
    }
    override Rock(_root: CSubject)
    {
        const coral = RGB(1.0, 0.45, 0.5);
        B(_root, V3(0, 0.8, 0), V3(7, 1.6, 6.5), RGB(0.85, 0.8, 0.75));
        B(_root, V3(-1.8, 3.5, -0.8), V3(1.6, 5.5, 1.6), coral);
        B(_root, V3(1.5, 4.5, 0.5), V3(1.6, 7.5, 1.6), coral);
        B(_root, V3(0.2, 3, 2), V3(1.4, 4.5, 1.4), RGB(1.0, 0.65, 0.35));
        B(_root, V3(2.6, 6, 0.5), V3(2, 1.2, 1.2), coral);
    }
    override Car(_root: CSubject, _color: CColor, _dir: number)
    {
        B(_root, V3(0, 4, 0), V3(14, 5, 6), _color);
        B(_root, V3(_dir * 8, 3.6, 0), V3(3, 3.6, 4.4), _color);
        B(_root, V3(0, 1.8, 0), V3(13, 1.4, 5.4), RGB(0.95, 0.95, 0.93));
        B(_root, V3(-_dir * 1, 8, 0), V3(3.5, 3.5, 1), _color);
        B(_root, V3(-_dir * 8.4, 5, 0), V3(2, 6, 1), _color);
        B(_root, V3(_dir * 6, 5, 3.05), V3(1, 1, 0.2), RGB(0.05, 0.05, 0.05));
        B(_root, V3(_dir * 6, 5, -3.05), V3(1, 1, 0.2), RGB(0.05, 0.05, 0.05));
        B(_root, V3(_dir * 1, 3, 3.3), V3(3, 0.8, 2), _color);
        B(_root, V3(_dir * 1, 3, -3.3), V3(3, 0.8, 2), _color);
    }
    override Truck(_root: CSubject, _color: CColor, _dir: number)
    {
        const black = RGB(0.1, 0.1, 0.12);
        const white = RGB(0.96, 0.96, 0.96);
        B(_root, V3(0, 5, 0), V3(22, 8, 8), black);
        B(_root, V3(_dir * 12, 4.5, 0), V3(3, 6, 6.5), black);
        B(_root, V3(_dir * 1, 1.5, 0), V3(18, 1.4, 7), white);
        B(_root, V3(_dir * 8, 6.8, 4.05), V3(3.5, 1.6, 0.2), white);
        B(_root, V3(_dir * 8, 6.8, -4.05), V3(3.5, 1.6, 0.2), white);
        B(_root, V3(-_dir * 1, 11.5, 0), V3(3, 5, 1.2), black);
        B(_root, V3(-_dir * 12.5, 6, 0), V3(2.5, 8, 1.2), black);
    }
    override Log(_root: CSubject, _len: number)
    {
        B(_root, V3(0, -1.3, 0), V3(_len, 3, 7.5), RGB(0.72, 0.52, 0.3));
        const tiles = Math.max(1, Math.round(_len / 10));
        for (let i = 0; i <= tiles; ++i)
            B(_root, V3(-_len * 0.5 + 0.5 + (_len - 1) * i / tiles, 0.3, 0), V3(1, 0.4, 7.7), RGB(0.5, 0.34, 0.18), false);
    }
    override TrainCar(_root: CSubject, _off: number, _len: number, _dir: number, _engine: boolean)
    {
        const blue = RGB(0.25, 0.4, 0.7);
        B(_root, V3(_off, 7, 0), V3(_len, 11, 10), blue);
        B(_root, V3(_off, 2, 0), V3(_len, 3, 9), RGB(0.85, 0.88, 0.92));
        if (_engine)
        {
            B(_root, V3(_off + _dir * _len * 0.3, 9, 5.05), V3(2, 2, 0.3), RGB(0.05, 0.05, 0.05));
            B(_root, V3(_off + _dir * _len * 0.3, 9, -5.05), V3(2, 2, 0.3), RGB(0.05, 0.05, 0.05));
            B(_root, V3(_off, 14, 0), V3(1.2, 4, 1.2), RGB(0.8, 0.95, 1.0), false);
        }
        else
            B(_root, V3(_off, 13.5, 0), V3(_len * 0.3, 2, 2), blue);
    }
    override Coin(_root: CSubject)
    {
        B(_root, V3(0, -1.2, 0), V3(5, 1, 4), RGB(0.95, 0.75, 0.8));
        B(_root, V3(0, 0.6, 0), V3(3.4, 3.4, 3.4), RGB(0.98, 0.96, 1.0));
        B(_root, V3(0.8, 1.4, -1.2), V3(1, 1, 1.2), RGB(1.2, 1.2, 1.25));
    }
    override Eagle(_root: CSubject) { this.Bird(_root, [0.95, 0.95, 0.95], [0.6, 0.63, 0.68], [0.98, 0.98, 0.98], [1.0, 0.8, 0.1]); }
}

class CThemeWinter extends CTheme
{
    override mKey = "winter";
    override mName = "겨울";
    override mDesc = "펭귄 · 눈길 · 얼음 · 제설차";
    override mTitle = "SNOW ROAD";
    override mIcon: RGB3 = [0.9, 0.95, 1.0];
    override mSky: RGB3 = [0.72, 0.84, 0.95];
    override mGrass: RGB3[] = [[0.95, 0.97, 1.0], [0.9, 0.93, 0.98], [0.85, 0.88, 0.94], [0.8, 0.84, 0.9]];
    override mRoad: RGB3[] = [[0.45, 0.5, 0.58], [0.4, 0.44, 0.52]];
    override mRoadMark: RGB3 = [0.95, 0.95, 1.0];
    override mRiver: RGB3[] = [[0.25, 0.5, 0.75], [0.22, 0.45, 0.7]];
    override mRail: RGB3[] = [[0.7, 0.72, 0.78], [0.64, 0.66, 0.72]];
    override mBodyColor: RGB3 = [0.15, 0.15, 0.2];
    override mDeathText: Record<string, string> = {
        car: "차에 치였어요!",
        train: "기차에 치였어요!",
        water: "얼음물에 빠졌어요!",
        edge: "얼음과 함께 떠내려갔어요!",
        eagle: "독수리에게 잡혀갔어요!",
    };

    override Player(_root: CSubject)
    {
        const black = RGB(0.12, 0.12, 0.16);
        const orange = RGB(1.0, 0.6, 0.1);
        B(_root, V3(0, 5, 0.3), V3(6, 8, 5.5), black);
        B(_root, V3(0, 4.3, -2.6), V3(4.4, 5.6, 0.4), RGB(0.97, 0.97, 0.97));
        B(_root, V3(0, 7.6, -3.3), V3(1.6, 1, 1.6), orange);
        for (const s of [1, -1])
        {
            B(_root, V3(s * 1.4, 8.3, -2.55), V3(1.2, 1.2, 0.3), RGB(1, 1, 1));
            B(_root, V3(s * 1.4, 8.3, -2.75), V3(0.6, 0.7, 0.2), RGB(0.02, 0.02, 0.02));
            B(_root, V3(s * 3.3, 4.8, 0.3), V3(0.6, 4.5, 2.6), black);
            B(_root, V3(s * 1.4, 0.5, -0.6), V3(1.8, 1, 2.6), orange);
        }
    }
    override Tree(_root: CSubject, _h: number)
    {
        B(_root, V3(0, 1.5, 0), V3(2.4, 3, 2.4), RGB(0.42, 0.28, 0.18));
        const green = RGB(0.15, 0.42, 0.28);
        const snow = RGB(0.97, 0.98, 1.0);
        const tier = (_h + 4) / 3;
        for (let i = 0; i < 3; ++i)
        {
            const w = 9 - i * 2.5;
            const y = 3 + tier * (i + 0.5);
            B(_root, V3(0, y, 0), V3(w, tier, w), green);
            B(_root, V3(0, y + tier * 0.5, 0), V3(w - 1.5, 0.8, w - 1.5), snow);
        }
    }
    override Rock(_root: CSubject)
    {
        const snow = RGB(0.97, 0.98, 1.0);
        B(_root, V3(0, 2.5, 0), V3(7, 5, 7), snow);
        B(_root, V3(0, 7, 0), V3(5, 4, 5), snow);
        B(_root, V3(0, 7, -3), V3(0.8, 0.8, 2), RGB(1.0, 0.5, 0.1));
        B(_root, V3(1.1, 7.8, -2.55), V3(0.6, 0.6, 0.2), RGB(0.05, 0.05, 0.05));
        B(_root, V3(-1.1, 7.8, -2.55), V3(0.6, 0.6, 0.2), RGB(0.05, 0.05, 0.05));
        B(_root, V3(0, 5.2, 0), V3(5.4, 1, 5.4), RGB(0.85, 0.2, 0.2));
    }
    override Car(_root: CSubject, _color: CColor, _dir: number)
    {
        CVoxelModel.Car(_root, _color, _dir);
        B(_root, V3(-_dir * 1.5, 9.3, 0), V3(8, 0.9, 6.5), RGB(0.97, 0.98, 1.0));
    }
    override Truck(_root: CSubject, _color: CColor, _dir: number)
    {
        CVoxelModel.Truck(_root, RGB(1.0, 0.72, 0.1), _dir);
        B(_root, V3(_dir * 13.4, 2.8, 0), V3(1.2, 4.5, 10), RGB(0.95, 0.5, 0.1));
        B(_root, V3(_dir * 9, 9.6, 0), V3(2, 1.2, 2), RGB(1.4, 0.6, 0.1));
    }
    override Log(_root: CSubject, _len: number)
    {
        B(_root, V3(0, -1.4, 0), V3(_len, 3, 8), RGB(0.8, 0.9, 0.98));
        B(_root, V3(0, -0.3, 0), V3(_len - 2, 1.2, 6.5), RGB(0.95, 0.98, 1.0));
    }
    override TrainCar(_root: CSubject, _off: number, _len: number, _dir: number, _engine: boolean)
    {
        CVoxelModel.TrainCar(_root, _off, _len, _engine ? RGB(0.1, 0.42, 0.25) : RGB(0.75, 0.15, 0.15), _engine);
        B(_root, V3(_off, 12.9, 0), V3(_len - 2, 0.8, 8.5), RGB(0.97, 0.98, 1.0));
    }
    override Eagle(_root: CSubject) { this.Bird(_root, [0.9, 0.9, 0.92], [0.8, 0.8, 0.84], [0.97, 0.97, 0.97], [0.25, 0.25, 0.25]); }
}

CTheme.sList = [new CTheme(), new CThemeMonster(), new CThemeOcean(), new CThemeWinter()];
CTheme.sCur = CTheme.sList[0];
