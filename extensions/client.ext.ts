import {line} from "../index";
import {DEFAULT} from "../core/DEFAULT";



line.command('client', 'Start local server', ( yargs) => {
    return yargs.positional('dirname', {
        describe: 'Configs dir',
        default: DEFAULT.dirname
    }).positional('identifier', {
        describe: 'Server identifier',
    }).positional('serverPort', {
        describe: 'port to bind on',
        default: DEFAULT.serverPort
    }).positional( "clientPort", {
        describe: "Launcher ports",
        default: DEFAULT.clientPort
    });

}, (argv) => {
    const client = require( "../core/client/index" );
    client.launcher( argv );
})