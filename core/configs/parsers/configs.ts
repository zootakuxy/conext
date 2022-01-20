import {Configs, configs} from "../index";
import fs from "fs";
import path from "path";
import ini from "ini";

export const loadConfigs:{current?:Configs} = {};

function configParser( load:{CONFIGS?:Configs } ){
    if( !load?.CONFIGS ) return;
    console.log( "ConfigsLoad", load.CONFIGS )

    if( Number.isSafeInteger( Number( load?.CONFIGS?.clientPort ) ) )  load.CONFIGS.clientPort = Number( load?.CONFIGS?.clientPort )
    else  load.CONFIGS.clientPort = null;

    if( Number.isSafeInteger( Number( load?.CONFIGS?.serverPort ) ) )  load.CONFIGS.serverPort = Number( load?.CONFIGS?.serverPort )
    else  load.CONFIGS.serverPort = null;

    if( Number.isSafeInteger( Number( load?.CONFIGS?.timeout ) ) )  load.CONFIGS.timeout = Number( load?.CONFIGS?.timeout )
    else load.CONFIGS.timeout = null;

    if( load?.CONFIGS?.filters && typeof load?.CONFIGS?.filters === "string" ) load.CONFIGS.filters = [ load.CONFIGS.filters ];

    else if( Array.isArray( load?.CONFIGS?.filters ) ){
        load.CONFIGS.filters = load?.CONFIGS?.filters.map( value => {
            if( value && typeof value !== "string" ) return null
            return  value
        }).filter( value => !!value);
    }
    loadConfigs.current = load?.CONFIGS;
}

function load(){
    let content:any = ini.parse( fs.readFileSync( path.join( configs.dirname, ".env" ) ).toString("utf-8") );
    configParser( content );
}
if( fs.existsSync( path.join( configs.dirname, ".env" ))) {
    load();
    fs.watchFile( path.join( configs.dirname, ".env" ), load )
}

