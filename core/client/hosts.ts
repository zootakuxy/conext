import hostile from "hostile";
import {HostEntry} from "../configs";

export function setHosts( host:HostEntry){
    hostile.set(host.address, host.server, function (err) {
        if (err) {
            console.error(err)
        } else {
            console.log('set /etc/hosts successfully!')
        }
    })
}
