import { CSubject } from "../../../Artgine/artgine/app/subject/CSubject.js";
import { CPaintCube } from "../../../Artgine/artgine/app/component/paint/CPaint3D.js";
import { CLightPlanet } from "../../../Artgine/artgine/app/component/CLightPlanet.js";
import { CShaderAttr } from "../../../Artgine/artgine/render/CShaderAttr.js";
import { CVec1 } from "../../../Artgine/artgine/geometry/CVec1.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
export function MCSkyBuild(_canvas, _hour, _lite = false) {
    const ligSub = _canvas.PushSub(new CSubject());
    const lig = ligSub.PushComp(new CLightPlanet());
    lig.PushDefault();
    lig.SetDirect();
    if (_lite) {
        lig.SetShadow3D("shadow", 0, 0, -1);
        lig.mCascadeDivide[0] = 500;
        lig.mCascadeDivide[1] = 1000;
        lig.SetShadowDistance(1500);
    }
    else {
        lig.SetShadow3D("shadow", 0, 0, 0);
        lig.mCascadeDivide[0] = 400;
        lig.mCascadeDivide[1] = 800;
        lig.mCascadeDivide[2] = 1500;
        lig.SetShadowDistance(2700);
    }
    lig.SetTime(_hour);
    const sky = _canvas.PushSub(new CSubject());
    sky.SetSca(new CVec3(100, 100, 100));
    const cube = sky.PushComp(new CPaintCube(""));
    cube.Sky(true, true, true, true, false);
    const attr = [
        ["cloudCoverage", 0.5],
        ["cloudStart", 15000],
        ["cloudHeight", 10000],
        ["cloudLightDistance", 10000],
        ["cloudPlanetRadius", 6300000],
        ["cloudSpeed", new CVec3(1, 0, 0)],
        ["cloudStep", 32],
        ["cloudDither", 0],
        ["cloudLightStep", 4],
        ["cloudScale", 100000],
        ["cloudExtinction", 3.5],
        ["cloudScatter", 10],
        ["cloudAmbient", 0.1],
    ];
    for (const [key, val] of attr)
        cube.PushCShaderAttr(new CShaderAttr(key, typeof val == "number" ? new CVec1(val) : val));
    return lig;
}
