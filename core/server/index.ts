import {autoload, configs,} from "../configs";
import net from "net";
import {ConnectionType} from "../share";
import path from "path";

export type ServerStartOpts = {
    serverPort?:number,
}

export function launcher( opts:ServerStartOpts ){
    if( !opts ) opts = {};
    const { configs } =require( "../configs" );
    Object.keys( opts ).forEach( key => {
        if( ![ "serverPort", "dirname" ].includes( key )) return;
        if( !opts[key] ) return;
        configs[ key ] = opts[ key ];
    })
    //language=file-reference
    autoload( path.join( __dirname, "./parsers" ) );
    start();
}


export const root: {
    servers: { [p:string]: net.Socket}
    connections: { [p:string]: net.Socket}
} = { servers: {}, connections: {}}


export function start(){

    net.createServer(function(from) {
        from.on( "error", err => { } );

        from.once( "data", data => {
            let header = JSON.parse( data.toString() );
            console.log( header);
            let type:ConnectionType = header.type;
            let server = header.server;
            let origin = header.origin;

            let anchor = header.anchor;
            let application = header.application;


            if( type === ConnectionType.SERVER ){
                root.servers[ origin ] = from;
                return
            } else if( type === ConnectionType.CONNECTION ){
                let connectionId = `${ origin }://${Math.trunc( Math.random() * 99999999 )}`;
                let next = root.servers[ server ];
                next.write( JSON.stringify({
                    type: ConnectionType.ANCHOR,
                    anchor: connectionId,
                    server: server,
                    application: application
                }));

                root.connections[ connectionId ] = from;
                return;

            } else if( type === ConnectionType.ANCHOR ){
                let preview = root.connections[ anchor ];
                preview.pipe( from );
                from.pipe( preview );
                preview.write( ConnectionType.ANCHOR_CONTINUE );
                from.write( ConnectionType.ANCHOR_CONTINUE );
            } else if( type === ConnectionType.ANCHOR_REJECT ){
                let preview = root.connections[ anchor ];
                let next = from;
                preview.write( ConnectionType.ANCHOR_REJECT );
                next.write( ConnectionType.ANCHOR_REJECT );
            }
        });


    }).listen( configs.serverPort );
}