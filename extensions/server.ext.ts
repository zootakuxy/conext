import {line} from "../index";
import {DEFAULT} from "../core/DEFAULT";

line.command('server', 'start the server', ( yargs) => {

    return yargs.positional('dirname', {
        describe: 'Configs dir',
        default: DEFAULT.dirname
    }).positional('serverPort', {
        describe: 'port to bind on',
        default: DEFAULT.serverPort
    });

}, (argv) => {
    console.log( "adsda")
    const server = require( "../core/server/index" );
    server.launcher( argv );
})