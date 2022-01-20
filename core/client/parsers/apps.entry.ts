import {AppEntry, configs, HostEntry} from "../../configs";
import {setHosts} from "../hosts";

export function resolveHost( entry:AppEntry ){
    if( !entry.address ) return;
    if( !entry.name ) return;
    if( !entry.port ) return;

    if( typeof entry.address !== "string" ) entry.address = null;
    if( typeof entry.name !== "string" ) entry.name = null;
    if( !Number.isSafeInteger( Number( entry.port )) ) entry.port = null;
}

export function checkEntry ( next:AppEntry ){
    resolveHost( next );

    if( !next.name  ) return console.error( new Error( "Skipped entry... no name sets" ), next );
    if( !next.address  ) return console.error( new Error( "Skipped entry... no address sets" ), next );
    if( !next.port  ) return console.error( new Error( "Skipped entry... no port sets" ), next );
    return true;
}

configs.parsers.push(function entryParser(parseEntry:{app?:{[p:string]:AppEntry }}, opts ){
    Object.keys( configs.apps ).forEach( key => {
        let _next = configs.apps[ key ];
        if( _next.ref === opts.ref ) delete configs.hosts[ key ]
    });

    if( opts.delete ) return;
    if( !parseEntry?.app ) return;

    Object.keys( parseEntry?.app||{} ).forEach( key => {
        let next = parseEntry?.app[ key ];
        next.ref = opts.ref;

        if( !checkEntry( next )) return;
        if( next.disable ) return  console.log( "Skipped entry... entry has disable", next  );
        configs.apps[ next.name ] = next;
    });
});