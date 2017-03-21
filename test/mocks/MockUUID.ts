// Mock UUID
export class MockUUID {
    private _uuids:string[]=[];
    public get uuids() {
        return this._uuids;
    }
    private counter:number = 0;
    private uuid:string="12345670-1000-a000-89ab-000000000000";

    /** Returns a set UUID pattern with incrementing digits */
    v1():string {
        let id = this.uuid.slice(0, 36 - this.counter.toString().length) + this.counter.toString();
        this._uuids.push(id)
        this.counter++;
        return id;
    }
}