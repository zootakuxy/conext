import path from "path";
import fs from "fs";
import {DEFAULT} from "../DEFAULT";


export interface Configs  {
    dirname?:string,
    identifier?:string,
    hosts:{ [p:string]:HostEntry}
    apps:{ [p:string]:AppEntry}
    server?:string
    clientPort?:number,
    serverPort?:number,
    timeout?:number,
    filters?:string[]
    parsers:(( parseEntry:any, opts:ParseOptions )=>void)[]
}

export type AppEntry = {
    name:string,
    port:number,
    address:string,
    ref:string,
    disable:boolean
}
export type HostEntry = {
    server?:string,
    address?:string,
    application:number
    ref:string,
    disable?:boolean
}


export type ParseOptions = {
    action:"create"|"delete"|"change",
    write:boolean,
    delete:boolean,
    filename:string,
    dirname:string,
    ref:string,
    path:string
}


function __get<K extends keyof Configs, T extends Configs[K]>( key:K ):T{
    return require("./parsers/configs").loadConfigs?.current?.[key] || DEFAULT[ key] as any;
}

class NoPortConfigs implements Configs{
    parsers:(( parseEntry:any, opts:ParseOptions )=>void)[]  = [];
    hosts = {};
    apps = {};
    acceptFile( fileName ){
        return this.expression.find( next => next.test( fileName ) );
    }
    get expression() {
        return configs.filters.map( value => new RegExp(`/${ value }$`))
    }
}

const conf:NoPortConfigs = new NoPortConfigs();

// @ts-ignore
export const configs:NoPortConfigs&Configs = new Proxy( conf, {
    get(target: {}, p: string | symbol, receiver: any): any {
        let value = target[ p ];
        //@ts-ignore
        if( !value ) return __get( String(p) );
        else return value;
    }
})

export function autoload( basedir?:string ){
    console.log(configs)
    fs.readdirSync( path.join(__dirname, "parsers" ) ).map( fileName => {
        let state = fs.statSync( path.join( __dirname, "parsers", fileName ) );
        if( !state.isFile() ) return;
        if( !/.*.js$/.test( fileName ) ) return;
        return require( path.join( __dirname, "parsers", fileName ) );
    });

    fs.readdirSync( basedir ).map( fileName => {
        let state = fs.statSync( path.join( basedir, fileName ) );
        if( !state.isFile() ) return;
        if( !/.*.js$/.test( fileName ) ) return;
        return require( path.join( basedir, fileName ) );
    });
    require("./listen").configsListen();
}

