import { CStream } from "../../../Artgine/artgine/basic/CStream.js";
import { CVec3 } from "../../../Artgine/artgine/geometry/CVec3.js";
import { CVec2 } from "../../../Artgine/artgine/geometry/CVec2.js";
import { CVec4 } from "../../../Artgine/artgine/geometry/CVec4.js";
export class CPacShooting {
    static MonCreate = CStream.DefinePacket({ monKey: "", pos: new CVec3(), type: 0 });
    static UserShot = CStream.DefinePacket({ pos: new CVec3() });
    static Effect = CStream.DefinePacket({ key: "", pos: new CVec3(), size: new CVec2() });
    static Pos = CStream.DefinePacket({ suk: "", nick: "", pos: new CVec3(), dir: new CVec3() });
    static Dead = CStream.DefinePacket({ nick: "" });

    static {
        CStream.RegisterPacketNames(CPacShooting);
    }
}
