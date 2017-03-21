import { IODataRequest } from "./IODataRequest"

export class OData3Request implements IODataRequest {

    constructor(
        private method:string,
        private url: string,
        private data:{},
        private contentId:string
        ) {
    }

    get Body():string {
        let body = "Content-Type: application/http\r\n"; 
        body += "Content-Transfer-Encoding:binary\r\n\r\n"
        body += this.method + " " + this.url + " HTTP/1.1\r\n"
        body += this.Headers;
        body += (this.contentId) ? "Content-ID:" + this.contentId + "\r\n": "\r\n";
        body += (this.data) ?  "\r\n" +  JSON.stringify(this.data) + "\r\n" : ""; 
        return body;
    }

    private get Headers():string {
        let headers = "DataServiceVersion: 3.0;NetFx\r\n"
            + "MaxDataServiceVersion: 3.0;NetFx\r\n"
            + "Content-Type: application/json;odata=minimalmetadata\r\n"
            + "Accept: application/json;odata=minimalmetadata\r\n"
            + "Accept-Charset: UTF-8\r\n";
        return headers;
    }
}