import { CConsol } from "../../../Artgine/artgine/basic/CConsol.js";
import { CServerMain } from "../../../Artgine/artgine/network/CServerMain.js";
import { CScoreServer } from "../../../Artgine/artgine/server/CScoreServer.js";
import { CSignalingServer } from "../../../Artgine/artgine/server/signaling/CSignalingServer.js";

CConsol.Log("Server Start",CConsol.eColor.gray);
new CSignalingServer().SetServerMain(CServerMain.Main());
new CScoreServer().SetServerMain(CServerMain.Main());