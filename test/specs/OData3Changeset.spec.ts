import * as odata from "./../../src/batch-odata";
import * as uuidService from "./../mocks/MockUUID";

describe("Service: OData3BatchService", () => {
    var service:odata.IODataBatchService;
    var confirmResolve:jasmine.Spy;
    var confirmReject:jasmine.Spy;

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
        it("should create an odata changeset", () => {
            let changeset:odata.IODataChangeset = new odata.OData3Changeset(uuid);
            expect(changeset instanceof odata.OData3Changeset).toEqual(true);

            let expected = "Content-Type: multipart/mixed; boundary=changeset_12345670-1000-a000-89ab-000000000000\r\n"
                + "Content-Transfer-Encoding:binary\r\n"
                + "\r\n"
                + "--changeset_12345670-1000-a000-89ab-000000000000--\r\n"

            expect(changeset.Id).toEqual("changeset_12345670-1000-a000-89ab-000000000000");
            expect(changeset.Body).toEqual(expected);
        });
    });

    describe("Function: addRequest", () => {
        it("should create an odata request without a content id", () => {
            let changeset:odata.IODataChangeset = new odata.OData3Changeset(uuid);
            expect(changeset instanceof odata.OData3Changeset).toEqual(true);
            let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"}, null);
            changeset.addRequest(request);
           
            let expected = "Content-Type: multipart/mixed; boundary=changeset_12345670-1000-a000-89ab-000000000000\r\n"
                + "Content-Transfer-Encoding:binary\r\n"
                + "\r\n"
                + "--changeset_12345670-1000-a000-89ab-000000000000\r\n"
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
                + "--changeset_12345670-1000-a000-89ab-000000000000--\r\n";
            expect(changeset.Body).toEqual(expected);
        });

        it("should create an odata request with a content id", () => {
            let changeset:odata.IODataChangeset = new odata.OData3Changeset(uuid);
            expect(changeset instanceof odata.OData3Changeset).toEqual(true);
            let request = service.createRequest("GET", "RequestUrl",{"foo":"bar"}, "1");
            changeset.addRequest(request);
           
            let expected = "Content-Type: multipart/mixed; boundary=changeset_12345670-1000-a000-89ab-000000000000\r\n"
                + "Content-Transfer-Encoding:binary\r\n"
                + "\r\n"
                + "--changeset_12345670-1000-a000-89ab-000000000000\r\n"
                + "Content-Type: application/http\r\n"
                + "Content-Transfer-Encoding:binary\r\n"
                + "\r\n"
                + "GET RequestUrl HTTP/1.1\r\n"
                + "DataServiceVersion: 3.0;NetFx\r\n"
                + "MaxDataServiceVersion: 3.0;NetFx\r\n"
                + "Content-Type: application/json;odata=minimalmetadata\r\n"
                + "Accept: application/json;odata=minimalmetadata\r\n"
                + "Accept-Charset: UTF-8\r\n"
                + "Content-ID:1\r\n"
                + "\r\n"
                + "{\"foo\":\"bar\"}"
                + "\r\n\r\n"
                + "--changeset_12345670-1000-a000-89ab-000000000000--\r\n";
            expect(changeset.Body).toEqual(expected);
        });
    });
});