import path from "path";
import {Configs} from "./configs";

export const DEFAULT:Configs = {
    clientPort: 3100,
    serverPort: 3200,
    timeout: 5000,
    hosts:{},
    filters:[ "*.entry.conf", "*.host.conf" ],
    server: "127.0.0.1",
    parsers:[],
    apps: {},
    dirname: path.join( process.cwd(), ".configs")
}