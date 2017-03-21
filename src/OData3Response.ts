import { IODataResponse, IODataResponseHeader } from "./IODataResponse";

export class OData3Response implements IODataResponse {
    public ResponseCode:string;
    public ResponseText:string;
    public Headers:IODataResponseHeader[];
    public Data:string;
    public Success:boolean;
}

export class OData3ResponseHeader implements IODataResponseHeader {
    public Key:string
    public Value:string
}