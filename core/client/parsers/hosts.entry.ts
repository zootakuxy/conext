import { configs, HostEntry} from "../../configs";
import {setHosts} from "../hosts";

export function resolveHost( entry:HostEntry ){
    if( !entry.server ) return;
    if( !entry.address ) return;
    if( !entry.application && !entry["app"] ) return;
    if( !entry.application && entry[ "app" ] ){
        entry.application = entry[ "app" ];
        delete entry[ "app" ];
    }
    if( typeof entry.server !== "string" ) entry.server = null;
    if( typeof entry.application !== "string" ) entry.application = null;
    if( typeof entry.address !== "string" ) entry.address = null;
}

export function checkEntry ( next:HostEntry ){
    resolveHost( next );

    if( !next.server  ) return console.error( new Error( "Skipped entry... no domains sets" ), next );
    if( !next.address  ) return console.error( new Error( "Skipped entry... no address sets" ), next );
    if( !next.application  ) return console.error( new Error( "Skipped entry... no application sets" ), next );
    return true;
}

configs.parsers.push(function entryParser(parseEntry:{host?:{[p:string]:HostEntry }}, opts ){
    Object.keys( configs.hosts ).forEach( key => {
        let _next = configs.hosts[ key ];
        if( _next.ref === opts.ref ) delete configs.hosts[ key ]
    });

    if( opts.delete ) return;
    if( !parseEntry?.host ) return;

    Object.keys( parseEntry?.host||{} ).forEach( key => {
        let next = parseEntry?.host[ key ];
        next.ref = opts.ref;

        if( !checkEntry( next )) return;
        if( next.disable ) return  console.log( "Skipped entry... entry has disable", next  );
        configs.hosts[ next.address ] = next;
        setHosts( next );
    });
});