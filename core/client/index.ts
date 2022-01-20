import * as net from "net";
import {Server} from "net";
import {autoload, configs} from "../configs";
import {ConnectionType} from "../share";
import path from "path";


export type LauncherStartOpts = {
    port?:number,
    serverPort?:number,
    dirname?:string
    identifier?:string
}



export const client:{ local?:Server, server?: net.Socket} = {}

const abortServer = ( message ) =>{
    setTimeout(()=>{
        process.exit(-1);
    }, 1000 );
    throw new Error( message );
}

export function launcher( opts:LauncherStartOpts ){
    if( !opts ) opts = {};
    console.log( "Opts", opts )
    const { configs } =require( "../configs" );
    Object.keys( opts ).forEach( key => {
        if( ![ "clientPort", "serverPort", "dirname", "identifier" ].includes( key )) return;
        if( !opts[key] ) return;
        configs[ key ] = opts[ key ];
    })
    console.log( "configs.identifier", configs.identifier );
    //language=file-reference
    autoload( path.join( __dirname, "./parsers" ) );
    console.log( "configs.identifier", configs.identifier );
    if( !configs.identifier ) abortServer( "Identifier note sets" );
    connect().then(start);
}

function connect(){
    return new Promise((resolve, reject) => {

        client.server = net.createConnection({
            host: configs.server,
            port: configs.serverPort
        });

        console.log("connect to remote server center..." );
        client.server.on("connect", () => {
            console.log("connect to remote server center... [ok]" );
            client.server.write( JSON.stringify({
                type: ConnectionType.SERVER,
                server: configs.identifier,
                origin: configs.identifier,
            }));
            resolve( true );
        });

        client.server.on( "error", err => {
            setTimeout( ()=>{
                client.server.connect( configs.serverPort );
            }, configs.timeout )
        });

        client.server.on( "data", data => {
            let header = JSON.parse( data.toString() );
            let type:ConnectionType = header.type;
            let anchor = header.anchor;
            let application:string = header.application;

            if( type === ConnectionType.ANCHOR ){
                const remoteConnection = net.createConnection({
                    host: configs.server,
                    port: configs.serverPort
                });

                let localApplication;
                const app = configs.apps[ application ];
                if( app ){
                    localApplication = net.createConnection({
                        host: app.address,
                        port: app.port
                    });
                } else if(Number.isSafeInteger( Number( application )) ) {
                    localApplication = net.createConnection({
                        host: "127.0.0.1",
                        port: Number( application )
                    });
                }

                if( localApplication ){
                    remoteConnection.on( "connect", () => {
                        console.log("remote connect")
                        remoteConnection.write( JSON.stringify({
                            origin: configs.identifier,
                            type: ConnectionType.ANCHOR,
                            anchor: anchor
                        }))
                    })

                    remoteConnection.once( "data", data => {
                        let response = data.toString("utf8");
                        console.log( "next:data", response );
                        remoteConnection.pipe( localApplication );
                        localApplication.pipe( remoteConnection );
                        remoteConnection.on( "error", err => console.log( "to:error" ));
                        localApplication.on( "error", err => console.log( "lserver:error" ));
                    })

                    remoteConnection.on("error", err => console.log("remote:error"))
                    localApplication.on("error", err => console.log("local:error"))
                } else {
                    remoteConnection.write( JSON.stringify({
                        origin: configs.identifier,
                        type: ConnectionType.ANCHOR_REJECT,
                        anchor: anchor,
                    }))
                }
            }
        })
    })
}



function start(){
    console.log( "start local server..." );
    client.local = net.createServer(function(client) {
        console.log( "new connection on ", client.remoteAddress );
        console.log( "new connection on ", client.address() );
        const remoteAddressParts = client.address()["address"].split( ":" );
        const address =  remoteAddressParts[ remoteAddressParts.length-1 ];
        const host = configs.hosts[ address ];

        if( !host ) return client.end( () => { console.log( "Cansel connection with", remoteAddressParts )});
        console.log( "new connection domain", host.server );

        const next = net.createConnection({
            host: configs.server,
            port: configs.serverPort
        });

        next.on("connect", () => {
            next.write( JSON.stringify({
                type: ConnectionType.CONNECTION,
                origin: configs.identifier,
                server: host.server,
                application: host.application
            }))
        })

        next.once("data", data => {
            let response = data.toString("utf8");
            console.log( "connection:data", response );
            if( response === ConnectionType.ANCHOR_CONTINUE ){
                client.pipe(next);
                next.pipe( client );
            } else if ( response === ConnectionType.ANCHOR_REJECT ){
                next.end();
                client.end();
            }
        });

        client.on( "error", err => console.log( "Error:FROM"))
        next.on( "error", err => console.log( "Error:TO"))

    }).listen( configs.clientPort, ()=>{
        console.log( "start local server...[ok]", configs.clientPort )
    } );

}





