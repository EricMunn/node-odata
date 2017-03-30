///<reference path="./../node_modules/@types/node/index.d.ts"/>
import { IODataBatch } from './IODataBatch';
import { IODataBatchService} from "./IODataBatchService";
import { OData3Changeset } from "./OData3Changeset";
import { OData3Request } from "./OData3Request";
import { IODataResponse, IODataResponseHeader } from "./IODataResponse";
import { OData3Response, OData3ResponseHeader } from "./OData3Response";
import { OData3Batch } from './OData3Batch';
import * as url from 'url';
import * as uuid from 'uuid';
import * as nodeRequest from 'request';
import { HttpHeaders } from "./batch-odata";


export class OData3BatchService implements IODataBatchService {

    private contentTypeRegExp = RegExp("^content-type","i");

    /** Allows injection of uuid module for mocking */
    constructor(private _uuid?:any) {
        if (!_uuid) {
            this._uuid = uuid;
        }
    }

    public createBatch(url:string):OData3Batch {
        var x = new OData3Batch(url, this._uuid);
        return x;
    }

    public createChangeset():OData3Changeset {
        var x = new OData3Changeset(this._uuid);
        return x;
    }

    public createRequest(method:string,url:string,data:{},contentId:string,headers:HttpHeaders):OData3Request {
        var x = new OData3Request(method,url,data,contentId,headers);
        return x;
    }

    public submitBatch(batch:IODataBatch):Promise<IODataResponse[]>{
        var request = batch.getBatchRequest();

        return new Promise((resolve, reject) => {
            if (batch.ProxyAllowInsecureCert) {
                process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
            };
            if (request.url.match(/^https:/)) {
                let metadataUrl = url.parse(request.url);
                let options:any = {
                    method:"POST",
                    url:request.url,
                    headers:request.headers,
                    body:request.body,
                }
                
                if(batch.ProxyUrl) {
                    options.proxy = batch.ProxyUrl;
                }


                var req = nodeRequest(options, (error, response, body) => {
                    if (!error) {
                        if(response.statusCode == "202") {
                            try {
                                var batchResponse = this.parseBatchResponse(response, body);
                                resolve(batchResponse);
                            } catch (error){
                                reject(error);
                            }
                        } else {
                            reject({
                                statusCode:response.statusCode,
                                statusText:body
                            });
                        }
                        return;
                    } else {               
                        reject(error);
                    }
                });
            } else {
                reject("Only accepts an https url.")
            }
        })
    };

    private parseBatchResponse(response, body):IODataResponse[]{
        // Get the content-type header from the response.
        //console.log(response.data)
        var header = response.headers["content-type"];
        var m = header.match(/boundary=([^;]+)/)

        if ( !m ) {
            throw new Error('Bad content-type header, no multipart boundary');
        }

        var boundary = m[1];

        var responses:IODataResponse[] = this.parseBatch(boundary, body)
        return responses;
    }   

    private parseBatch(boundary, body):IODataResponse[] {
        var batchResponses:IODataResponse[] = [];
        //Split the batch result into its associated parts
        var batchPartRegex = RegExp("--" + boundary + "(?:\r\n)?(?:--\r\n)?");
        var batchParts = body.split(batchPartRegex);
        //console.log("Batch Parts:");
        //console.log(batchParts);

        var batchPartBoundaryTypeRegex = RegExp("boundary=(.+)", "m")
        for (var i = 0; i < batchParts.length; i++) {
            var batchPart = batchParts[i];
            if (this.contentTypeRegExp.test(batchPart)) {
                //console.log("-- Content for Batch Part " + i);

                // For each batch part, check to see if the part is a changeset.

                var changeSetBoundaryMatch = batchPart.match(batchPartBoundaryTypeRegex);
                //console.log("----Boundary Search for item " + i)

                if (changeSetBoundaryMatch) {
                    //console.log("----Boundary Found for item " + i)
                    //console.log(changeSetBoundaryMatch)
                    //console.log("Getting changeset")

                    var changeSetBoundary = changeSetBoundaryMatch[1];


                    var changeSetContentRegex = RegExp("(--" + changeSetBoundary + "\r\n[^]+--" + changeSetBoundary + ")", "i")
                    var changeSetBody = batchPart.match(changeSetContentRegex);
                    //console.log("changeSetBody")
                    //console.log(changeSetBody)

                    var changeSetPartRegex = RegExp("--" + changeSetBoundary + "(?:\r\n)?(?:--\r\n)?");
                    var changeSetParts = changeSetBody[1].split(changeSetPartRegex);
                    //console.log("changeSetParts")
                    //console.log(changeSetParts);

                    //console.log("Getting Changeset Parts");

                    var changeSetResponses = this.parseResponses(changeSetParts);

                    //console.log("Change Set Responses");
                    //console.log(changeSetResponses)

                    batchResponses = batchResponses.concat(changeSetResponses);
                } else {
                    //console.log("----Boundary Not Found for batch part " + i)
                    //console.log("----PArsing batch part " + i);
                    if (this.contentTypeRegExp.test(batchPart)) {
                        var response:IODataResponse = this.parseResponse(batchPart);
                        //console.log(response);
                        batchResponses.push(response);
                    }
                }
            }
        }
        //console.log("Batch Responses:");
        //console.log(batchResponses);
        return batchResponses;
    }

    private parseResponse(part):IODataResponse {
        var response:any[] = part.split("\r\n\r\n");
        //console.log(response);
        //response[1] are headers for the part
        //response[2] is the response code and headers
        //response[3] is data
        var httpResponseWithHeaders:any[] = response[1].split("\r\n");
        //console.log("httpResponseWithHeaders");
        //console.log(httpResponseWithHeaders);

        var responseRegex = RegExp("HTTP/1.1 ([0-9]{3}) (.+)");
        var httpCodeAndDesc = httpResponseWithHeaders[0].match(responseRegex);
        //console.log("httpCodeAndDesc");
        //console.log(httpCodeAndDesc);

        var httpCode = httpCodeAndDesc[1];
        var httpDesc = httpCodeAndDesc[2];

        //console.log("httpCode");
        //console.log(httpCode);

        //console.log("httpDesc");
        //console.log(httpDesc);
        var httpHeaders:OData3ResponseHeader[] = [];
        for( var h=1;h<httpResponseWithHeaders.length;h++) {
            var header=httpResponseWithHeaders[h];
            var headerKeyAndValue = header.match("(.+): (.+)");
            //console.log("headerTypeAndValue");
            //console.log(headerTypeAndValue);
            httpHeaders.push({
                Key: headerKeyAndValue[1],
                Value: headerKeyAndValue[2]
            })
        }
        let responseOut:OData3Response = {
            ResponseCode: httpCode,
            ResponseText: httpDesc,
            Headers: httpHeaders,
            Data: response[2].match(/.*/)[0],
            Success: (httpCode.substring(0, 1) != "4" && httpCode.substring(0, 1) != "5")
        };
    
        return responseOut;
    }

    private parseResponses(parts) {
        var responses = [];
        for (var j = 0; j < parts.length; j++) {
            var part = parts[j];
            //console.log("Getting changeset part "+ j)
            //console.log(part);

            //console.log("Getting response from changeset part " + j)
            if (part != "") {
            var response = this.parseResponse(part);

            responses.push(response);
            }
        }
        return responses;
    }
}