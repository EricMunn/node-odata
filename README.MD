# batch-odata

Node module to provide OData batch services (currently supports v3 only)

## Installation
```
npm install batch-odata --save
```

### Use
Create an instance of the batch service. Create a batch; create a changeset; create and add requests to a batch or changeset; submit batch.

Requests and changesets are submitted in the order they are added.


Create an instance of the batch service:
```
var service = new odata.OData3BatchService();
```

Create a batch:
createBatch(endpointUrl:string)
```
var batch = service.createBatch("https://YourBatchEndpoint.com/$batch");
```

Create a request:
createRequest(method:string,url:string,data:{},contentId:string)
```
var request = service.createRequest("GET", "SomeEntity('EntityKey')", null, null);
```

Add the request to the batch:
```
batch.addRequest(request);
```

Create a changeset:
createChangeset();
```
var changeset = service.createChangeset();
```

Add a request to a changeset:
```
changeset.addRequest(request);
```

Simple batch with one GET operation
```
var odata = require("batch-odata");
var service = new odata.OData3BatchService();
var batch = service.createBatch("https://YourBatchEndpoint.com/$batch");
var request = service.createRequest("GET", "SomeEntity('EntityKey')", null, null);
batch.addRequest(batch);
service.submitBatch(batch);
    .then(function (responses) {
        responses.forEach(function (response) {
            //Do something with response
        });
    };
```

Batch with changeset
```
var odata = require("batch-odata");
var service = new odata.OData3BatchService();
var batch = service.createBatch("https://YourBatchEndpoint.com/$batch");
var changeset = service.createChangeset();
var request = service.createRequest("POST", "YourEntity", {"foo":"bar"}, "1");
changeset.addRequest(request);
batch.addChangeset(changeset);
service.submitBatch(batch)
    .then(function (responses) {
        responses.forEach(function (response) {
            //Do something with response
        });
    };
```

## Build for distribution
```
npm run dist
```
Compiles, builds to dist folder, increments version patch level and creates npm package file.

## Development
```
npm run compile:dev
```
Cleans src and test folders of .js and .js.map files and recompiles.

## Testing
```
npm test
```
Starts a single run of the test suite.
