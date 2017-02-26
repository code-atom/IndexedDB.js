import * as DbContext from "./IDbContext";
export namespace indexedDB {
    export interface IDbContextStorageContainer {
        Get() :DbContext.IndexedDb.IDBContext;
    }
}