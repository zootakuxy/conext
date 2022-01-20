import fs, {Stats} from "fs";
import watch from "recursive-watch";



import path from "path";
import ini from "ini";
import {configs, ParseOptions} from "./index";
export function configsListen () {

    let exists = [];

    let readDir = ( nextdir?:string, parentRef?:string )=>{
        let _files = [];
        if( !nextdir ) nextdir = configs.dirname;
        fs.readdirSync( nextdir ).forEach( nextFile => {
            let filename = parentRef? path.join( parentRef, nextFile ) : nextFile;
            let _next = path.join( nextdir, nextFile );
            let _ref = `file://${ _next }`;

            let state = fs.statSync( _next );
            if( configs.acceptFile( _ref ) && state.isFile() ) {
                let opts:ParseOptions = {
                    ref: _ref,
                    action: "change",
                    filename: filename,
                    delete: false,
                    write: true,
                    path: _next,
                    dirname: configs.dirname
                }

                configs.parsers.forEach( next => {
                    let initParser  = ini.parse( fs.readFileSync( _next ).toString("utf-8" ) );
                    next( initParser, opts );
                });
                _files.push( _ref );
            }
            if( state.isDirectory() ) _files.push(...readDir( _next, _ref ));
        });
        return _files;
    }


    exists.push( ...readDir() );

    watch( configs.dirname, ( filename ) => {
        let ref = `file://${filename}`;
        let action:"create"|"delete"|"change";

        if(! ( configs.acceptFile( filename.toString() ) ) ) return;
        if( fs.existsSync( filename ) && !fs.statSync( filename ).isFile() ) return;

        if( !fs.existsSync( filename ) ) action = "delete";
        else if( fs.existsSync( filename ) && !exists.includes( filename ) ) action = "create";
        else if( fs.existsSync( filename ) && exists.includes( filename ) ) action = "change";

        if( action === "delete" ) exists = exists.filter( value => value !== filename );
        else if( action === "create" ) exists.push( filename );

        let initParser;
            if( fs.existsSync( filename ) ) initParser = ini.parse( fs.readFileSync( filename ).toString("utf-8" ) );
            else  initParser = null;

        let opts:ParseOptions = {
            ref,
            action,
            filename,
            delete: action === "delete",
            write: action === "create" || action === "change",
            path: filename,
            dirname: configs.dirname
        }

        configs.parsers.forEach( next => {
            next( initParser||{}, opts );
        });
        console.log( "NEW CHANGE CONFIG APPLY..." )
    });

}
