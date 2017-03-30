import {HttpHeaders} from "./batch-odata"

export interface IODataRequest {
    readonly Body:string;
    addHeaders(headers:HttpHeaders);
}
