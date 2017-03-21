import * as odata from "./../../src/batch-odata";
import * as uuidService from "./../mocks/MockUUID";

// import * as angular from 'angular';

// angular.module('AngularODataTestModule', [])
//     .service("odata3BatchService",odata.OData3BatchService)
//     .service("uuid",MockUUID);

describe("Service: OData3BatchService", () => {
    var service:odata.IODataBatchService;
    var uuid:uuidService.MockUUID;
    var confirmResolve:jasmine.Spy;
    var confirmReject:jasmine.Spy;

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

    describe("Function: constructor", () => {
        it("should create an odata batch", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
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

    describe("Function: createChangeset", () => {
        it("Service should implement createChangeset", () => {
            expect(service.createChangeset).toBeDefined();
        });

        it("should create a changeset", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            let changeset:odata.IODataChangeset = service.createChangeset();
            batch.addChangeset(changeset);
           
            
            let expected = "--batch_12345670-1000-a000-89ab-000000000000\r\n"
                + "Content-Type: multipart/mixed; boundary=changeset_12345670-1000-a000-89ab-000000000001\r\n"
                + "Content-Transfer-Encoding:binary\r\n"
                + "\r\n"
                + "--changeset_12345670-1000-a000-89ab-000000000001--\r\n"
                + "\r\n"
                + "--batch_12345670-1000-a000-89ab-000000000000--\r\n"
          expect(batch.Body).toEqual(expected);
          expect(batch.Queue.length).toEqual(1);
        });
    });
    

    describe("Function: addRequest", () => {
        it("should create an odata request without a content id", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"}, null);
            batch.addRequest(request);
            
            let expected = "--batch_12345670-1000-a000-89ab-000000000000\r\n"
                + "Content-Type: application/http\r\n"
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
                + "\r\n\r\n"
                + "--batch_12345670-1000-a000-89ab-000000000000--\r\n"

            expect(batch.Body).toEqual(expected);
        });
    });

    describe("Function: setProxy", () => {
        it("should implement setProxy", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            expect(batch.setProxy).toBeDefined();
        });

        it("should set proxy URL and allow insecure certs", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            batch.setProxy("http://127.0.0.1:8888", true);
            expect(batch.ProxyUrl).toEqual("http://127.0.0.1:8888");
            expect(batch.ProxyAllowInsecureCert).toBe(true);

        });

        it("should set proxy URL and disallow insecure certs", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            batch.setProxy("http://127.0.0.1:8888", false);
            expect(batch.ProxyUrl).toEqual("http://127.0.0.1:8888");
            expect(batch.ProxyAllowInsecureCert).toBe(false);

        });
    });

    describe("Function: addHeaders", () => {
        it("should implement addHeaders", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            expect(batch.addHeaders).toBeDefined();
        });

        it("should set headers", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            expect(batch.Headers).toEqual(jasmine.objectContaining({
                "Accept":"multipart/mixed",
                "Content-Type":"multipart/mixed;boundary="+batch.Id,
                "DataServiceVersion":"3.0;NetFx",
                "MaxDataServiceVersion":"3.0;NetFx"
            }));
            batch.addHeaders({
                "foo":"bar"
            });
            expect(batch.Headers).toEqual(jasmine.objectContaining({
                "Accept":"multipart/mixed",
                "Content-Type":"multipart/mixed;boundary="+batch.Id,
                "DataServiceVersion":"3.0;NetFx",
                "MaxDataServiceVersion":"3.0;NetFx",
                 "foo":"bar"
            }));
        });

        it("should set proxy URL and disallow insecure certs", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            batch.setProxy("http://127.0.0.1:8888", false);
            expect(batch.ProxyUrl).toEqual("http://127.0.0.1:8888");
            expect(batch.ProxyAllowInsecureCert).toBe(false);

        });
    });

    describe("Function: getBatchRequest", () => {
        it("should implement getBatchRequest", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            expect(batch.getBatchRequest).toBeDefined();
        });

        it("should return odata batch data", () => {
            let batch:odata.IODataBatch = new odata.OData3Batch("BatchUrl",uuid);
            let batchRequest = batch.getBatchRequest();
            expect(batchRequest.url).toEqual("BatchUrl");
            expect(batchRequest.headers).toEqual(jasmine.objectContaining({
                    "Accept": "multipart/mixed",
                    "Content-Type": "multipart/mixed;boundary=" + batch.Id,
                    "DataServiceVersion": "3.0;NetFx",
                    "MaxDataServiceVersion": "3.0;NetFx"
                }));
            expect(batchRequest.body).toEqual("--batch_12345670-1000-a000-89ab-000000000000\r\n--batch_12345670-1000-a000-89ab-000000000000--\r\n")
        });
    });
});