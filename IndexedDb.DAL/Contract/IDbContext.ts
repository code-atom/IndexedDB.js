export namespace IndexedDb {
    export interface IDBContext {
        Reset(): Promise<any>;
        Delete() : Promise<any>;
        CreateObjectSet(model: string) :Promise<IDBObjectStore>
    }
}