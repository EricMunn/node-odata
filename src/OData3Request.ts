import { IODataRequest } from "./IODataRequest";
import { HttpHeaders } from "./batch-odata"

export class OData3Request implements IODataRequest {
    private _headers:HttpHeaders;

    constructor(
        private method:string,
        private url: string,
        private data:{},
        private contentId:string,
        private headers:HttpHeaders
        
        ) {
            this._headers = {
                "DataServiceVersion": "3.0;NetFx",
                "MaxDataServiceVersion": "3.0;NetFx",
                "Content-Type": "application/json;odata=minimalmetadata",
                "Accept": "application/json;odata=minimalmetadata",
                "Accept-Charset": "UTF-8"
            };
            this._headers = <HttpHeaders>this._extend(this._headers, headers);
    }

    private _extend(target:Object, source:Object) {
        for (let prop in source) {
            target[prop] = source[prop];
        }

        return target;
    }

    get Body():string {
        let body = "Content-Type: application/http\r\n"; 
        body += "Content-Transfer-Encoding:binary\r\n\r\n"
        body += this.method + " " + this.url + " HTTP/1.1\r\n"
        for(let prop in this.Headers) {
            body += prop + ": " + this.Headers[prop]  + "\r\n";
        }
        body += (this.contentId) ? "Content-ID:" + this.contentId + "\r\n": "\r\n";
        body += (this.data) ?  "\r\n" +  JSON.stringify(this.data) + "\r\n" : ""; 
        return body;
    }

    private get Headers():HttpHeaders {
        return this._headers;
    }

    public addHeaders(headers:HttpHeaders) {
        this._headers = <HttpHeaders>this._extend(this._headers, headers);
    }
}