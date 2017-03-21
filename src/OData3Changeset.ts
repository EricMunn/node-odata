import { IODataRequest } from "./IODataRequest"
import { IODataResponse } from "./IODataResponse"
import { IODataChangeset } from "./IODataChangeset"
import * as uuid from 'uuid';

export class OData3Changeset implements IODataChangeset {
    private _changesetId: string;
    private _requestQueue:(IODataRequest)[]=[];

    constructor(private uuid:any) {
        this._changesetId = "changeset_" + uuid.v1();
    }

    get Id():string {
        return this._changesetId;
    }

    get Body():string{
        let body = "Content-Type: multipart/mixed; boundary=" + this.Id + "\r\n";
        body += "Content-Transfer-Encoding:binary\r\n\r\n";
        this._requestQueue.forEach(item => {
            body += "--" + this.Id + "\r\n";
            body += item.Body + "\r\n";
        })
        body += "--" + this.Id + "--" + "\r\n";
        return body;
    }

    public addRequest(request:IODataRequest):void{
        this._requestQueue.push(request);
    };    
}