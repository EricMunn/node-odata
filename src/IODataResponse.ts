export interface IODataResponse {
    ResponseCode:string,
    ResponseText:string,
    Headers:IODataResponseHeader[],
    Data:string,
    Success:boolean
}

export interface IODataResponseHeader {
    Key:string,
    Value:string
}