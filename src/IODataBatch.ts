import { IODataRequest } from "./IODataRequest"
import { IODataChangeset } from "./IODataChangeset"

export interface IODataBatch {
    readonly Id:string;
    readonly Url:string;
    readonly Body:string;
    readonly ProxyUrl:string;
    readonly ProxyAllowInsecureCert:boolean;
    readonly Headers:{};
    readonly Queue:(IODataChangeset|IODataRequest)[];

    addChangeset(changeset:IODataChangeset):void;
    addRequest(request:IODataRequest):void;
    addHeaders(headers:Object):void;
    getBatchRequest():{url:string,headers:{},body:string};
    setProxy(url:string,allowInsecureCert:boolean)
    
}


