import { IODataBatch } from "./IODataBatch"
import { IODataResponse } from "./IODataResponse"
import { IODataRequest } from "./IODataRequest"
import { IODataChangeset } from "./IODataChangeset"

/** A service providing OData Batch functionality using Angular $http */
export interface IODataBatchService {
    createBatch(url:string):IODataBatch;
    createChangeset():IODataChangeset;
    createRequest(method:string,url:string,data:{},contentId:string):IODataRequest;

    submitBatch(batch:IODataBatch):Promise<IODataResponse[]>;

}