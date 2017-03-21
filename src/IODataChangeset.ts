import { IODataRequest } from "./IODataRequest"

export interface IODataChangeset {
    readonly Id:string;
    readonly Body:string;

    addRequest(request:IODataRequest):void

}
