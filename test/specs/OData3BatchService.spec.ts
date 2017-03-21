import * as odata from "./../../src/batch-odata";
import * as uuidService from "./../mocks/MockUUID";
import * as nock from 'nock';
import * as uuid from 'uuid';

describe("Service: OData3BatchService", () => {
    var service:odata.IODataBatchService;
    var confirmResolve:jasmine.Spy;
    var confirmReject:jasmine.Spy;

    var service:odata.IODataBatchService;
    var uuid:uuidService.MockUUID;
    var confirmResolve:jasmine.Spy;
    var confirmReject:jasmine.Spy;

    it("should handle no uuid injected", () => {
        service = new odata.OData3BatchService();
        let batch = service.createBatch("$batch");
        expect(batch.Id).toBeDefined();
    });

    beforeEach(function(){
        uuid = new uuidService.MockUUID();
        service = new odata.OData3BatchService(uuid);
        confirmResolve = jasmine.createSpy("confirmResolve");
        confirmReject = jasmine.createSpy("confirmReject");
    });

    afterEach(function() {
        confirmResolve.calls.reset();
        confirmReject.calls.reset();
    });

    it("Service should exist", () => {
        expect(service).toBeDefined();
    });

    describe("Function: createRequest", () => {
        it("Service should implement createRequest", () => {
            expect(service.createRequest).toBeDefined();
        });

        it("should create an odata request without a content id", () => {
            let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"}, null);
            expect(request instanceof odata.OData3Request).toEqual(true);
            let expected = "Content-Type: application/http\r\n"
                + "Content-Transfer-Encoding:binary\r\n"
                + "\r\n"
                + "GET RequestUrl HTTP/1.1\r\n"
                + "DataServiceVersion: 3.0;NetFx\r\n"
                + "MaxDataServiceVersion: 3.0;NetFx\r\n"
                + "Content-Type: application/json;odata=minimalmetadata\r\n"
                + "Accept: application/json;odata=minimalmetadata\r\n"
                + "Accept-Charset: UTF-8\r\n"
                + "\r\n\r\n"
                + "{\"foo\":\"bar\"}"
                + "\r\n"

            expect(request.Body).toEqual(expected);
        });

        it("should create an odata request with a content id", () => {
            let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},"1");
            expect(request instanceof odata.OData3Request).toEqual(true);
            let expected = "Content-Type: application/http\r\n"
                + "Content-Transfer-Encoding:binary\r\n"
                + "\r\n"
                + "GET RequestUrl HTTP/1.1\r\n"
                + "DataServiceVersion: 3.0;NetFx\r\n"
                + "MaxDataServiceVersion: 3.0;NetFx\r\n"
                + "Content-Type: application/json;odata=minimalmetadata\r\n"
                + "Accept: application/json;odata=minimalmetadata\r\n"
                + "Accept-Charset: UTF-8\r\n"
                + "Content-ID:1\r\n\r\n"
                + "{\"foo\":\"bar\"}"
                + "\r\n"
            expect(request.Body).toEqual(expected);
        });
    });
    
    describe("Function: createChangeset", () => {
        it("Service should implement createChangeset", () => {
            expect(service.createChangeset).toBeDefined();
        });

        it("should create a changeset", () => {
            let changeset:odata.IODataChangeset = service.createChangeset();
            let expected = "Content-Type: multipart/mixed; boundary=changeset_12345670-1000-a000-89ab-000000000000\r\n"
                + "Content-Transfer-Encoding:binary\r\n"
                + "\r\n"
                + "--changeset_12345670-1000-a000-89ab-000000000000--\r\n"

            expect(changeset.Id).toEqual("changeset_12345670-1000-a000-89ab-000000000000");
            expect(changeset.Body).toEqual(expected);
        });
    });

    describe("Function: createBatch", () => {
        it("Service should implement createBatch", () => {
            expect(service.createBatch).toBeDefined();
        });

        it("should create an odata batch", () => {
            let batch:odata.IODataBatch = service.createBatch("BatchUrl");
            expect(batch instanceof odata.OData3Batch).toEqual(true);
            expect(batch.Url).toEqual("BatchUrl");
            expect(batch.Id).toEqual("batch_12345670-1000-a000-89ab-000000000000");
            expect(batch.Headers).toEqual(jasmine.objectContaining({
                    "Accept": "multipart/mixed",
                    "Content-Type": "multipart/mixed;boundary=" + batch.Id,
                    "DataServiceVersion": "3.0;NetFx",
                    "MaxDataServiceVersion": "3.0;NetFx"
                }));
            expect(batch.Body).toEqual("--batch_12345670-1000-a000-89ab-000000000000\r\n--batch_12345670-1000-a000-89ab-000000000000--\r\n")
        });
    });

    describe("Function: submitBatch", () => {
        describe("Response Handling", () => {
            it("should handle a successful batch response", (done) => {
                
                let resultData = {"odata.metadata":"https://aoc-api-edr-dev.courts.wa.gov/DataServices/AocEdrDataService.svc/$metadata#DataSources/@Element","Key":"918","CreateTimeStamp":"2017-02-09T11:00:11.109449","CreateCredential":"AOC","UpdateTimeStamp":"2017-02-09T11:00:11.109449","UpdateCredential":"AOC","CodeDescription":"Data source for EDR Dev","BeginDate":null,"EndDate":null};
                
                let response = "--batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa\r\n"
                    + "Content-Type: application/http\r\n"
                    + "Content-Transfer-Encoding: binary\r\n"
                    + "\r\n"
                    + "HTTP/1.1 200 OK\r\n"
                    + "DataServiceVersion: 3.0;\r\n"
                    + "Content-Type: application/json;odata=minimalmetadata;streaming=true;charset=utf-8\r\n"
                    + "X-Content-Type-Options: nosniff\r\n"
                    + "Cache-Control: no-cache\r\n"
                    + "\r\n"
                    + "{\"foo\":\"bar\"}\r\n"
                    + "--batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa--\r\n"
                var scope = nock('https://odata.service.net')
                    .post('/$batch')
                    .reply(202, response, {"Content-Type":"multipart/mixed; boundary=batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa"});

                let batch:odata.IODataBatch = service.createBatch("https://odata.service.net/$batch");
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);

                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve();
                        expect(responses.length).toEqual(1);
                        let response = responses[0];
                        expect(response.ResponseCode).toEqual("200");
                        expect(response.Success).toBeTruthy();
                        expect(response.Headers.length).toEqual(4);
                        expect(response.Data).toEqual('{"foo":"bar"}');
                        resolve();
                                        
                    }).catch(reject => {
                        confirmReject();
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).toHaveBeenCalled();
                    expect(confirmReject).not.toHaveBeenCalled();
                    done();
                });
            });

            it("should handle a successful batch response w/proxy set (coverage only, proxy is handled at the request level", (done) => {
                
                let resultData = {"odata.metadata":"https://aoc-api-edr-dev.courts.wa.gov/DataServices/AocEdrDataService.svc/$metadata#DataSources/@Element","Key":"918","CreateTimeStamp":"2017-02-09T11:00:11.109449","CreateCredential":"AOC","UpdateTimeStamp":"2017-02-09T11:00:11.109449","UpdateCredential":"AOC","CodeDescription":"Data source for EDR Dev","BeginDate":null,"EndDate":null};
                
                let response = "--batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa\r\n"
                    + "Content-Type: application/http\r\n"
                    + "Content-Transfer-Encoding: binary\r\n"
                    + "\r\n"
                    + "HTTP/1.1 200 OK\r\n"
                    + "DataServiceVersion: 3.0;\r\n"
                    + "Content-Type: application/json;odata=minimalmetadata;streaming=true;charset=utf-8\r\n"
                    + "X-Content-Type-Options: nosniff\r\n"
                    + "Cache-Control: no-cache\r\n"
                    + "\r\n"
                    + "{\"foo\":\"bar\"}\r\n"
                    + "--batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa--\r\n"
                var scope = nock('https://odata.service.net')
                    .post('/$batch')
                    .reply(202, response, {"Content-Type":"multipart/mixed; boundary=batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa"});

                let batch:odata.IODataBatch = service.createBatch("https://odata.service.net/$batch");
                batch.setProxy("https://127.0.0.1",true);
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);

                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve();
                        expect(responses.length).toEqual(1);
                        let response = responses[0];
                        expect(response.ResponseCode).toEqual("200");
                        expect(response.Success).toBeTruthy();
                        expect(response.Headers.length).toEqual(4);
                        expect(response.Data).toEqual('{"foo":"bar"}');
                        resolve();
                                        
                    }).catch(reject => {
                        confirmReject();
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).toHaveBeenCalled();
                    expect(confirmReject).not.toHaveBeenCalled();
                    done();
                });
            });

            it("should handle a successful batch response with unsuccessful items", (done) => {
                var resultData = {"odata.error":{"code":"","message":{"lang":"en-US","value":"{\"ErrorCode\":404,\"ComponentErrors\":[{\"ComponentDescription\":\"Data Service Framework\",\"ErrorDetails\":[{\"ErrorCode\":404,\"ErrorDescription\":\"DataServiceException\",\"ErrorDetails\":[\"Resource not found for the segment 'DataSources'.\"]}]}]}"}}};
                        
                let response = "--batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa\r\n"
                    + "Content-Type: application/http\r\n"
                    + "Content-Transfer-Encoding: binary\r\n"
                    + "\r\n"
                    + "HTTP/1.1 404 Not Found\r\n"
                    + "DataServiceVersion: 3.0;\r\n"
                    + "Content-Type: application/json;odata=minimalmetadata;streaming=true;charset=utf-8\r\n"
                    + "X-Content-Type-Options: nosniff\r\n"
                    + "Cache-Control: no-cache\r\n"
                    + "\r\n"
                    + JSON.stringify(resultData) + "\r\n"
                    + "--batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa--\r\n"

                var scope = nock('https://odata.service.net')
                    .post('/$batch')
                    .reply(202, response, {"Content-Type":"multipart/mixed; boundary=batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa"});

                let batch:odata.IODataBatch = service.createBatch("https://odata.service.net/$batch");
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);

                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve();
                        expect(responses.length).toEqual(1);
                        let response = responses[0];
                        expect(response.ResponseCode).toEqual("404");
                        expect(response.Success).toBeFalsy();
                        expect(response.Headers.length).toEqual(4);
                        expect(response.Data).toEqual(JSON.stringify(resultData));  
                        resolve();              
                    }).catch(reject => {
                        confirmReject()
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).toHaveBeenCalled();
                    expect(confirmReject).not.toHaveBeenCalled();
                    done();
                });
            });

            it("should handle a successful batch response with a bad content-type boundary header", (done) => {
                let resultData = {"odata.error":{"code":"","message":{"lang":"en-US","value":"{\"ErrorCode\":404,\"ComponentErrors\":[{\"ComponentDescription\":\"Data Service Framework\",\"ErrorDetails\":[{\"ErrorCode\":404,\"ErrorDescription\":\"DataServiceException\",\"ErrorDetails\":[\"Resource not found for the segment 'DataSources'.\"]}]}]}"}}};
                let response = "--batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa\r\n"
                    + "Content-Type: application/http\r\n"
                    + "Content-Transfer-Encoding: binary\r\n"
                    + "\r\n"
                    + "HTTP/1.1 404 Not Found\r\n"
                    + "DataServiceVersion: 3.0;\r\n"
                    + "Content-Type: application/json;odata=minimalmetadata;streaming=true;charset=utf-8\r\n"
                    + "X-Content-Type-Options: nosniff\r\n"
                    + "Cache-Control: no-cache\r\n"
                    + "\r\n"
                    + JSON.stringify(resultData) + "\r\n"
                    + "--batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa--\r\n"
                    

                let scope = nock('https://odata.service.net')
                    .post('/$batch')
                    .reply(202, response, {"Content-Type":"multipart/mixed;"});
                    
                let batch:odata.IODataBatch = service.createBatch("https://odata.service.net/$batch");
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);
                
                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve(); 
                        resolve();             
                    }).catch(reject => {
                        confirmReject();
                        expect(reject.toString()).toEqual("Error: Bad content-type header, no multipart boundary");
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).not.toHaveBeenCalled();
                    expect(confirmReject).toHaveBeenCalled();
                    done();
                });                
            });

            it("should handle a request error", (done) => {
                let scope = nock('https://odata.service.net')
                    .post('/$batch')
                    .replyWithError("ThisIsBad!");
                    
                let batch:odata.IODataBatch = service.createBatch("https://odata.service.net/$batch");
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);

                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve(); 
                        resolve();             
                    }).catch(reject => {
                        confirmReject();
                        expect(reject.toString()).toEqual("Error: ThisIsBad!");
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).not.toHaveBeenCalled();
                    expect(confirmReject).toHaveBeenCalled();
                    done();
                });       
            });

             it("should handle an unsuccessful response", (done) => {
                let batch:odata.IODataBatch = service.createBatch("http://odata.service.net/$batch");
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);

                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve();   
                        resolve();          
                    }).catch(reject => {
                        confirmReject()
                        expect(reject).toEqual("Only accepts an https url.")
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).not.toHaveBeenCalled();
                    expect(confirmReject).toHaveBeenCalled();
                    done();
                });               
            });

            it("should handle an unsuccessful response", (done) => {
                let scope = nock('https://odata.service.net')
                    .post('/$batch')
                    .reply(500, "Internal Server Error");

                let batch:odata.IODataBatch = service.createBatch("https://odata.service.net/$batch");
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);

                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve();   
                        resolve();          
                    }).catch(reject => {
                        confirmReject()
                        expect(reject.statusCode).toEqual(500);
                        expect(reject.statusText).toEqual("Internal Server Error");
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).not.toHaveBeenCalled();
                    expect(confirmReject).toHaveBeenCalled();
                    done();
                });               
            });

            it("should handle a successful response with unparseable response", (done) => {
                var resultData = {"odata.error":{"code":"","message":{"lang":"en-US","value":"{\"ErrorCode\":404,\"ComponentErrors\":[{\"ComponentDescription\":\"Data Service Framework\",\"ErrorDetails\":[{\"ErrorCode\":404,\"ErrorDescription\":\"DataServiceException\",\"ErrorDetails\":[\"Resource not found for the segment 'DataSources'.\"]}]}]}"}}};
                
                let response = "ThisIsn'tAGoodResponse";

                 let scope = nock('https://odata.service.net')
                    .post('/$batch')
                    .reply(202,response,{"Content-Type":"multipart/mixed; boundary=batchresponse_da3621a8-2e2b-4780-aa13-21eb29b8d3fa"});

                let batch:odata.IODataBatch = service.createBatch("https://odata.service.net/$batch");
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);

                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve();
                        expect(responses.length).toEqual(0);    
                        resolve();  
                    }).catch(reject => {
                        confirmReject();
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).toHaveBeenCalled();
                    expect(confirmReject).not.toHaveBeenCalled();
                    done();
                });                
            });

            it("should handle a successful response with a changeset", (done) => {
                let response = "--batchresponse_e19cb240-b355-403e-a11c-4b930379dea5\r\n"
                    + "Content-Type: multipart/mixed; boundary=changesetresponse_00e33c9c-19d2-4edb-9a19-d731bd2746cd\r\n"
                    + "\r\n"
                    + "--changesetresponse_00e33c9c-19d2-4edb-9a19-d731bd2746cd\r\n"
                    + "Content-Type: application/http\r\n"
                    + "Content-Transfer-Encoding: binary\r\n"
                    + "\r\n"
                    + "HTTP/1.1 201 Created\r\n"
                    + "DataServiceVersion: 3.0;\r\n"
                    + "Content-Type: application/json;odata=minimalmetadata;streaming=true;charset=utf-8\r\n"
                    + "Content-ID: 1\r\n"
                    + "X-Content-Type-Options: nosniff\r\n"
                    + "Cache-Control: no-cache\r\n"
                    + "Location: https://aoc-api-edr-dev.courts.wa.gov/DataServices/AocEdrDataService.svc/SecurityCertificates('7f83a9a0f3a411e6a374d7346a129938')\r\n"
                    + "\r\n"
                    + "{'TestResult':'TestResultData'}\r\n"
                    + "--changesetresponse_00e33c9c-19d2-4edb-9a19-d731bd2746cd\r\n"
                    + "Content-Type: application/http\r\n"
                    + "Content-Transfer-Encoding: binary\r\n"
                    + "\r\n"
                    + "HTTP/1.1 204 No Content\r\n"
                    + "X-Content-Type-Options: nosniff\r\n"
                    + "Cache-Control: no-cache\r\n"
                    + "DataServiceVersion: 3.0;\r\n"
                    + "\r\n"
                    + "\r\n"
                    + "--changesetresponse_00e33c9c-19d2-4edb-9a19-d731bd2746cd--\r\n"
                    + "--batchresponse_e19cb240-b355-403e-a11c-4b930379dea5--\r\n";

                let scope = nock('https://odata.service.net')
                    .post('/$batch')
                    .reply(202,response,{"Content-Type":"multipart/mixed; boundary=batchresponse_e19cb240-b355-403e-a11c-4b930379dea5"});

                let batch:odata.IODataBatch = service.createBatch("https://odata.service.net/$batch");
                let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"},null);

                var promise = new Promise((resolve, reject) => {
                    service.submitBatch(batch).then(responses => {
                        confirmResolve();
                        expect(responses.length).toEqual(2);
                        let response = responses[0];
                        expect(response.ResponseCode).toEqual("201");
                        expect(response.ResponseText).toEqual("Created");
                        expect(response.Success).toBeTruthy();
                        expect(response.Headers.length).toEqual(6);
                        expect(response.Data).toEqual("{'TestResult':'TestResultData'}");

                        response = responses[1];
                        expect(response.ResponseCode).toEqual("204");
                        expect(response.ResponseText).toEqual("No Content");
                        expect(response.Success).toBeTruthy();
                        expect(response.Headers.length).toEqual(3);
                        expect(response.Data).toEqual("");
                        resolve();
                    }).catch(reject => {
                        confirmReject()
                        resolve();
                    });
                }).then(() => {
                    expect(confirmResolve).toHaveBeenCalled();
                    expect(confirmReject).not.toHaveBeenCalled();
                    done();
                });          
            });
        });
    });
});