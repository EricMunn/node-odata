import { IODataBatch } from './IODataBatch';
import { IODataRequest } from "./IODataRequest";
import { IODataChangeset } from "./IODataChangeset";

export class OData3Batch implements IODataBatch {
    private _batchId: string;
    private _batchUrl: string;
    private _batchQueue:(IODataRequest|IODataChangeset)[]=[];
    private _headers: Object;
    private _proxyUrl: string;
    private _proxyAllowInsecureCert:boolean;

    private _extend(target:Object, source:Object) {
        for (var prop in source) {
            target[prop] = source[prop];
        }

        return target;
    }

    get Id():string {
        return this._batchId;
    }

    get ProxyUrl():string {
        return this._proxyUrl;
    }

    get ProxyAllowInsecureCert():boolean {
        return this._proxyAllowInsecureCert;
    }

    get Url():string {
        return this._batchUrl;
    }

    get Headers():{} {
         return this._headers;
    }

    get Body():string {
        let bodyHeader = '--' + this.Id + "\r\n";
        let bodyFooter = '--' + this.Id + "--\r\n";
        let body = "";
        this.Queue.forEach(item => {
            body += item.Body + "\r\n";
        })
        return bodyHeader + body + bodyFooter;
    }

    get Queue():(IODataRequest|IODataChangeset)[] {
        return this._batchQueue;
    }

    constructor(url:string,private uuid:any) {
        this._batchId = "batch_" + uuid.v1();
        this._batchUrl = url;
        this._headers = {
            "Accept":"multipart/mixed",
            "Content-Type":"multipart/mixed;boundary="+this.Id,
            "DataServiceVersion":"3.0;NetFx",
            "MaxDataServiceVersion":"3.0;NetFx"
        };
    }

    public addChangeset(changeset:IODataChangeset):void {
        this._batchQueue.push(changeset);
    }
    public addRequest(request:IODataRequest):void{
        this._batchQueue.push(request);
    };

    public addHeaders(headers:Object) {
        this._headers = this._extend(this._headers, headers);
    }

    public getBatchRequest():{url:string,headers:{},body:string} {
        return {
            url: this.Url,
            headers:this.Headers,
            body: this.Body,
        }
    }

    public setProxy(url:string, allowInsecureCert:boolean) {
        this._proxyUrl = url;
        this._proxyAllowInsecureCert = allowInsecureCert;
    }
}