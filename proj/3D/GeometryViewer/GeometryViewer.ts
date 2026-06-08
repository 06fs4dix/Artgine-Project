//Version
import "https://06fs4dix.github.io/Artgine/artgine/artgine.js"

//Class
import {CClass} from "https://06fs4dix.github.io/Artgine/artgine/basic/CClass.js";

//Atelier
import {CPreferences} from "https://06fs4dix.github.io/Artgine/artgine/basic/CPreferences.js";
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
gPF.mWASM = false;
gPF.mCanvas = "";
gPF.mServer = 'local';
gPF.mGitHub = false;
gPF.mVersion = "mq4m3t4v_84";

import {CAtelier} from "https://06fs4dix.github.io/Artgine/artgine/app/CAtelier.js";

import {CPlugin} from "https://06fs4dix.github.io/Artgine/artgine/util/CPlugin.js";
var gAtl = new CAtelier();
gAtl.mPF = gPF;
await gAtl.Init([],"");
//The content above this line is automatically set by the program. Do not modify.⬆✋🚫⬆☠️💥🔥

//EntryPoint
import {CObject} from "https://06fs4dix.github.io/Artgine/artgine/basic/CObject.js"
import { CVec2 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec2.js";
import { CMeshCreateInfo } from "https://06fs4dix.github.io/Artgine/artgine/render/CMeshCreateInfo.js";
import { CVertexFormat } from "https://06fs4dix.github.io/Artgine/artgine/render/CShader.js";
import { CVec3 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec3.js";
import { CFecth } from "https://06fs4dix.github.io/Artgine/artgine/network/CFecth.js";
import { CUtilRender } from "https://06fs4dix.github.io/Artgine/artgine/render/CUtilRender.js";

import { CVec4 } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CVec4.js";
import { CMath } from "https://06fs4dix.github.io/Artgine/artgine/geometry/CMath.js";
import { CCamCon3DFirstPerson } from "https://06fs4dix.github.io/Artgine/artgine/util/CCamCon.js";
import { CModalFrameView } from "https://06fs4dix.github.io/Artgine/artgine/util/CModalUtil.js";
import { CPath } from "https://06fs4dix.github.io/Artgine/artgine/basic/CPath.js";
import { CRenderPass } from "https://06fs4dix.github.io/Artgine/artgine/render/CRenderPass.js";
import { CConfirm } from "https://06fs4dix.github.io/Artgine/artgine/basic/CModal.js";
import { CSubject } from "https://06fs4dix.github.io/Artgine/artgine/app/subject/CSubject.js";
import { CPaint3D } from "https://06fs4dix.github.io/Artgine/artgine/app/component/paint/CPaint3D.js";
var Can3D = gAtl.NewCanvas('Can3D');
Can3D.SetCameraKey("3D");


await gAtl.Frame().Load().Exe("Shader.ts");

let camcon=Can3D.GetCam().SetCamCon(new CCamCon3DFirstPerson(gAtl.Frame().Input()));
camcon.SetZoomSensitivity(10);
Can3D.GetCam().Init(new CVec3(250, 10000, -150), new CVec3(-600, 750, 350));

let newCenter : CVec2;
function LonLatToWebMercator(_lon : number, _lat : number) : CVec2 {
    const R = 6378137;
    let x = R * _lon * Math.PI / 180;
    let y = R * Math.log(Math.tan(Math.PI/4 + _lat * Math.PI/360));

    if(newCenter == null) {
        newCenter = new CVec2(x, y);
        x = 0;
        y = 0;
    }
    else {
        x -= newCenter.x;
        y -= newCenter.y;
    }

    return new CVec2(x, y);
}

type Geometry = {
    type: string;
    coordinates: any;
};

type Feature = {
    type: "Feature";
    properties: any;
    geometry: Geometry;
};

type FeatureCollection = {
    type: "FeatureCollection";
    features: Feature[];
};

// 웹에서 GeoJSON 데이터를 가져오는 함수들
async function getNaturalEarthData(category: string, scale: string = "110m"): Promise<any> {
    // 실제로 작동하는 Natural Earth 데이터 URL들
    const dataUrls = {
        "countries": "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
        "cities": "https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json",
        "us_states": "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json",
        "world_cities": "https://raw.githubusercontent.com/eesur/country-codes-lat-long/master/country-codes-lat-long-alpha3.json"
    };
    
    try {
        const url = dataUrls[category] || dataUrls["countries"];
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Natural Earth 데이터 로드 실패 (${category}):`, error);
        return null;
    }
}

async function getGADMData(countryCode: string, level: number = 0): Promise<any> {
    // CORS 문제가 없는 공개 데이터 소스들
    const dataUrls = {
        "KOR": "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-geo.json",
        "USA": "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json",
        "JPN": "https://raw.githubusercontent.com/dataofjapan/landarea/master/data/japan.geojson"
    };
    
    try {
        const url = dataUrls[countryCode] || dataUrls["KOR"];
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`GADM 데이터 로드 실패 (${countryCode}):`, error);
        return null;
    }
}

async function getOpenStreetMapData(query: string): Promise<any> {
    // 더 간단한 OSM 쿼리 사용
    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const simpleQuery = "way[building](37.5665,126.9780,37.5865,126.9980);out geom;";
    
    try {
        const response = await fetch(overpassUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(simpleQuery)}`
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`OpenStreetMap 데이터 로드 실패:`, error);
        return null;
    }
}

// 다양한 데이터 소스에서 GeoJSON 가져오기
async function loadGeoJSONData(): Promise<any> {
    console.log("GeoJSON data loading started...");
    
    // 사용자에게 데이터 소스 선택 요청
    return new Promise((resolve) => {
        CConfirm.List("Select Data Source!", [
            // 웹 데이터 옵션
            async () => {
                console.log("Web data loading selected");
                const webData = await loadWebData();
                resolve(webData);
            },
            // 로컬 파일 옵션
            async () => {
                console.log("Local file loading selected");
                const localData = await loadLocalGeoJSONFile();
                resolve(localData);
            }
        ], ["🌐 Web Load(Korea)", "💾 Local File"]);
    });
}

// 웹 데이터 로드 함수
async function loadWebData(): Promise<any> {
    console.log("Web data loading started...");
    
    // 1. 한국 시군구 데이터
    console.log("1. Loading Korea administrative districts data...");
    let gadmData = await getGADMData("KOR", 1);
    if (gadmData) {
        console.log("✅ Korea administrative districts data loaded successfully");
        return gadmData;
    }
    
    // 2. 미국 주 데이터
    console.log("2. Loading US states data...");
    gadmData = await getGADMData("USA", 0);
    if (gadmData) {
        console.log("✅ US states data loaded successfully");
        return gadmData;
    }
    
    // 3. 국가 경계 데이터
    console.log("3. Loading country boundaries data...");
    let naturalEarthData = await getNaturalEarthData("countries");
    if (naturalEarthData) {
        console.log("✅ Country boundaries data loaded successfully");
        return naturalEarthData;
    }
    
    // 4. 도시 데이터
    console.log("4. Loading cities data...");
    naturalEarthData = await getNaturalEarthData("cities");
    if (naturalEarthData) {
        console.log("✅ Cities data loaded successfully");
        return naturalEarthData;
    }
    
    // 웹 데이터 로드 실패 시 로컬 파일로 폴백
    console.log("Web data loading failed, falling back to local file...");
    const localData = await loadLocalGeoJSONFile();
    if (localData) {
        return localData;
    }
    
    // 최종적으로 샘플 데이터 사용
    console.log("Final fallback: Using built-in sample data");
    return createSampleData();
}

// 로컬 파일에서 GeoJSON 데이터 로드 (웹 접속 불가 시 사용)
async function loadLocalGeoJSONFile(): Promise<any> {
    try {
        console.log("Attempting to load local test.geojson file...");
        
        // CFecth를 사용하여 로컬 파일 로드
        const localData = await CFecth.Exe(CPath.WebPageUrl() + "test.geojson", null, "json");
        if (localData) {
            console.log("✅ Local test.geojson file loaded successfully");
            return localData;
        }
    } catch (error) {
        console.error("Local file loading failed:", error);
    }
    
    // test.json도 시도
    try {
        console.log("Attempting to load local test.json file...");
        const localData = await CFecth.Exe(CPath.WebPageUrl() + "test.json", null, "json");
        if (localData) {
            console.log("✅ Local test.json file loaded successfully");
            return localData;
        }
    } catch (error) {
        console.error("Local test.json file loading failed:", error);
    }
    
    return null;
}

// 샘플 데이터 생성 함수 (test.json과 동일한 형식)
function createSampleData(): any {
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-123.0249569, 49.2407190],
                        [-123.0241582, 49.2407165],
                        [-123.0240445, 49.2406847],
                        [-123.0239311, 49.2407159],
                        [-123.0238530, 49.2407157],
                        [-123.0238536, 49.2404548],
                        [-123.0249568, 49.2404582],
                        [-123.0249569, 49.2407190]
                    ]]
                },
                "properties": {
                    "valuePerSqm": 4563,
                    "growth": 0.3592
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-123.0713722, 49.2720583],
                        [-123.0697150, 49.2720458],
                        [-123.0697259, 49.2715034],
                        [-123.0713824, 49.2715159],
                        [-123.0713722, 49.2720583]
                    ]]
                },
                "properties": {
                    "valuePerSqm": 2270,
                    "growth": 0.2653
                }
            }
        ]
    };
}

function CreateMeshCreateInfo(_feature : Feature) : CMeshCreateInfo {
    const rVal = new CMeshCreateInfo();
    const posb = rVal.Create(CVertexFormat.eIdentifier.Position);
    const uvb = rVal.Create(CVertexFormat.eIdentifier.UV);
    const norb = rVal.Create(CVertexFormat.eIdentifier.Normal);
    const inb = rVal.Create(CVertexFormat.eIdentifier.Index);

    const outerRing = _feature.geometry.coordinates[0];
    const n = outerRing.length;

    const maxHeight = 1000;

    // ============================
    // 1. 상단 삼각형용 vertex
    // ============================
    const topStartIndex = posb.bufF.Size(3); // 시작 인덱스
    for (let i = 0; i < n; i++) {
        const [lon, lat] = outerRing[i];
        const pos = LonLatToWebMercator(lon, lat);

        posb.bufF.Push(new CVec3(pos.x, _feature.properties.growth * maxHeight, pos.y));  // 상단
        uvb.bufF.Push(new CVec2(i / (n - 1), 1));
        norb.bufF.Push(new CVec3(0, 1, 0));          // 위쪽 노멀
    }

    // 상단 삼각형 (팬)
    for (let i = 1; i < n - 1; i++) {
        inb.bufI.push(
            topStartIndex, 
            topStartIndex + i, 
            topStartIndex + i + 1
        );
    }

    // ============================
    // 2. 측면 삼각형용 vertex
    // ============================
    const sideStartIndex = posb.bufF.Size(3); // 시작 인덱스
    for (let i = 0; i < n; i++) {
        const [lon, lat] = outerRing[i];
        const pos = LonLatToWebMercator(lon, lat);

        // 하단
        posb.bufF.Push(new CVec3(pos.x, 0, pos.y));
        uvb.bufF.Push(new CVec2(0, 0));
        norb.bufF.Push(new CVec3(0, 0, 0)); // 나중에 외적 계산

        // 상단
        posb.bufF.Push(new CVec3(pos.x, _feature.properties.growth * maxHeight, pos.y));
        uvb.bufF.Push(new CVec2(1, 1));
        norb.bufF.Push(new CVec3(0, 0, 0));
    }

    // 측면 삼각형 인덱스 + 노멀
    for (let i = 0; i < n - 1; i++) {
        const h0 = sideStartIndex + i * 2;
        const h1 = h0 + 1;
        const h2 = h0 + 2;
        const h3 = h2 + 1;

        inb.bufI.push(h0, h2, h1);
        inb.bufI.push(h1, h2, h3);

        // 측면 노멀 계산 (외적)
        const ax = posb.bufF.X1(h2*3) - posb.bufF.X1(h0*3);
        const ay = posb.bufF.X1(h2*3+1) - posb.bufF.X1(h0*3+1);
        const az = posb.bufF.X1(h2*3+2) - posb.bufF.X1(h0*3+2);

        const bx = posb.bufF.X1(h1*3) - posb.bufF.X1(h0*3);
        const by = posb.bufF.X1(h1*3+1) - posb.bufF.X1(h0*3+1);
        const bz = posb.bufF.X1(h1*3+2) - posb.bufF.X1(h0*3+2);

        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;

        norb.bufF.V3(h0, new CVec3(nx, ny, nz));
        norb.bufF.V3(h1, new CVec3(nx, ny, nz));
        norb.bufF.V3(h2, new CVec3(nx, ny, nz));
        norb.bufF.V3(h3, new CVec3(nx, ny, nz));
    }

    rVal.vertexCount = posb.bufF.Size(3);
    rVal.indexCount = inb.bufI.length;

    return rVal;
}

function AddMeshCreateInfo(_feature : Feature, _originalMesh : CMeshCreateInfo) : CMeshCreateInfo {
    const rVal = _originalMesh;
    const posb = rVal.GetVFType(CVertexFormat.eIdentifier.Position)[0];
    const uvb = rVal.GetVFType(CVertexFormat.eIdentifier.UV)[0];
    const norb = rVal.GetVFType(CVertexFormat.eIdentifier.Normal)[0];
    const colb = rVal.GetVFType(CVertexFormat.eIdentifier.Color)[0];
    const inb = rVal.GetVFType(CVertexFormat.eIdentifier.Index)[0];

    const outerRing = _feature.geometry.coordinates[0];
    const n = outerRing.length;

    // growth 속성이 없으면 기본값 사용
    const growth = _feature.properties?.growth || Math.random() * 0.5;
    const col = GrowthToColor(growth);

    const maxHeight = 1000;

    // ============================
    // 1. 상단 삼각형용 vertex
    // ============================
    const topStartIndex = posb.bufF.Size(3); // 시작 인덱스
    for (let i = 0; i < n; i++) {
        const [lon, lat] = outerRing[i];
        const pos = LonLatToWebMercator(lon, lat);

        posb.bufF.Push(new CVec3(pos.x, growth * maxHeight, pos.y));  // 상단
        uvb.bufF.Push(new CVec2(i / (n - 1), 1));
        norb.bufF.Push(new CVec3(0, 1, 0));          // 위쪽 노멀
        colb.bufF.Push(col);
    }

    // 상단 삼각형 (팬)
    for (let i = 1; i < n - 1; i++) {
        inb.bufI.push(
            topStartIndex, 
            topStartIndex + i, 
            topStartIndex + i + 1
        );
    }

    // ============================
    // 2. 측면 삼각형용 vertex
    // ============================
    const sideStartIndex = posb.bufF.Size(3); // 시작 인덱스
    for (let i = 0; i < n; i++) {
        const [lon, lat] = outerRing[i];
        const pos = LonLatToWebMercator(lon, lat);

        // 하단
        posb.bufF.Push(new CVec3(pos.x, 0, pos.y));
        uvb.bufF.Push(new CVec2(0, 0));
        norb.bufF.Push(new CVec3(0, 0, 0)); // 나중에 외적 계산
        colb.bufF.Push(col);

        // 상단
        posb.bufF.Push(new CVec3(pos.x, growth * maxHeight, pos.y));
        uvb.bufF.Push(new CVec2(1, 1));
        norb.bufF.Push(new CVec3(0, 0, 0));
        colb.bufF.Push(col);
    }

    // 측면 삼각형 인덱스 + 노멀
    for (let i = 0; i < n - 1; i++) {
        const h0 = sideStartIndex + i * 2;
        const h1 = h0 + 1;
        const h2 = h0 + 2;
        const h3 = h2 + 1;

        inb.bufI.push(h0, h2, h1);
        inb.bufI.push(h1, h2, h3);

        // 측면 노멀 계산 (외적)
        const ax = posb.bufF.X1(h2*3) - posb.bufF.X1(h0*3);
        const ay = posb.bufF.X1(h2*3+1) - posb.bufF.X1(h0*3+1);
        const az = posb.bufF.X1(h2*3+2) - posb.bufF.X1(h0*3+2);

        const bx = posb.bufF.X1(h1*3) - posb.bufF.X1(h0*3);
        const by = posb.bufF.X1(h1*3+1) - posb.bufF.X1(h0*3+1);
        const bz = posb.bufF.X1(h1*3+2) - posb.bufF.X1(h0*3+2);

        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;

        norb.bufF.V3(h0, new CVec3(nx, ny, nz));
        norb.bufF.V3(h1, new CVec3(nx, ny, nz));
        norb.bufF.V3(h2, new CVec3(nx, ny, nz));
        norb.bufF.V3(h3, new CVec3(nx, ny, nz));
    }

    rVal.vertexCount = posb.bufF.Size(3);
    rVal.indexCount = inb.bufI.length;

    return rVal;
}

function extractPolygonsFromGeoJSON(geoJson: any): Feature[] {
    const polygons: Feature[] = [];

    // 단일 Feature
    if (geoJson.type === "Feature") {
        polygons.push(...splitFeatureToPolygons(geoJson));
    }
    // FeatureCollection
    else if (geoJson.type === "FeatureCollection" && Array.isArray(geoJson.features)) {
        geoJson.features.forEach((f: Feature) => {
            polygons.push(...splitFeatureToPolygons(f));
        });
    } else {
        console.warn("Unsupported GeoJSON type:", geoJson.type);
    }

    return polygons;
}

function splitFeatureToPolygons(feature: Feature): Feature[] {
    const result: Feature[] = [];

    if (feature.geometry.type === "Polygon") {
        result.push(feature);
    } else if (feature.geometry.type === "MultiPolygon") {
        const coordsArray = feature.geometry.coordinates; // [[[...],[...]], [[...],[...]], ...]
        coordsArray.forEach((coords: number[][][]) => {
            result.push({
                type: "Feature",
                properties: { ...feature.properties },
                geometry: {
                    type: "Polygon",
                    coordinates: coords,
                },
            });
        });
    }

    return result;
}

function GrowthToColor(_value: number): CVec3 {
    // Clamp value
    const v = Math.max(0, Math.min(1, _value));

    // 파랑 -> 빨강 그라데이션
    const r = v;           // 빨강 비율
    const g = 0;           // 초록 없음
    const b = 1 - v;       // 파랑 비율

    return new CVec3(r, g, b);
}

// 웹에서 GeoJSON 데이터 로드
let geoJsonData, polygonArr;
try {
    geoJsonData = await loadGeoJSONData();
    polygonArr = extractPolygonsFromGeoJSON(geoJsonData);
    console.log(`✅ Total ${polygonArr.length} polygons loaded successfully`);
} catch (error) {
    console.error("GeoJSON data loading failed:", error);
    // 에러 발생 시 빈 배열로 초기화
    polygonArr = [];
}

// polygonArr이 비어있으면 처리하지 않음
if (polygonArr.length === 0) {
    console.warn("No polygons to process.");
} else {
    const obj = new CSubject();
    Can3D.PushSub(obj);

    const createInfo = new CMeshCreateInfo();
    createInfo.Create(CVertexFormat.eIdentifier.Position);
    createInfo.Create(CVertexFormat.eIdentifier.UV);
    createInfo.Create(CVertexFormat.eIdentifier.Normal);
    createInfo.Create(CVertexFormat.eIdentifier.Color);
    createInfo.Create(CVertexFormat.eIdentifier.Index);

    for(const polygon of polygonArr) {
        AddMeshCreateInfo(polygon, createInfo);
    }

    const mesh = CUtilRender.CMeshCreateInfoToCMesh(createInfo, gAtl.Frame().Pal().GetBlackTex());
    gAtl.Frame().Res().Push("polygon", mesh);

    const pt = new CPaint3D("polygon");
    pt.PushRenderPass(new CRenderPass("Pre3Test"));
    obj.PushComp(pt);
}

new CModalFrameView();





