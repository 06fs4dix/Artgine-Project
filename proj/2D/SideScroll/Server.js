import { CConsol } from "../../../Artgine/artgine/basic/CConsol.js";
import { CServerMain } from "../../../Artgine/artgine/network/CServerMain.js";
import { CScoreServer } from "../../../Artgine/artgine/server/CScoreServer.js";
CConsol.Log("Server Start", CConsol.eColor.gray);
new CScoreServer().SetServerMain(CServerMain.Main());
