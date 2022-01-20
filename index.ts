require( 'source-map-support' ).install();
process.on( "uncaughtExceptionMonitor", error => console.log( error ));
process.on( "uncaughtException", error => console.log( error ));
process.on( "unhandledRejection", error => console.log( error ));


import { hideBin } from "yargs/helpers";
import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";


export const line = yargs( hideBin( process.argv ));
line.option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
})

//language=file-reference
let extensions = fs.readdirSync( path.join( __dirname, "./extensions" ), ).filter( (filename) => {
    return [
        /.*.ext.js$/,
        /.*.extension.js$/,
        /.*.command.js$/,
        /.*.cmd.js$/,
    ].find( value => value.test( filename ));
});

extensions.forEach( extension => {
    //language=file-reference
    require( path.join( __dirname, "./extensions", extension ) )
})



line.parse();
