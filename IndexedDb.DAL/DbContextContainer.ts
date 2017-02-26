import * as DbContextStorage from "./Contract/IDbContextStorageContainer";
import * as DbContext from "./Contract/IDbContext";
import * as SampleContext from "./SampleContext";
export namespace indexedDB {
    export class DbContextConatiner implements DbContextStorage.indexedDB.IDbContextStorageContainer {
        private _context : SampleContext.indexedDB.SampleContext;
        constructor(databaseNative: IDBFactory) {
            this._context = new SampleContext.indexedDB.SampleContext(databaseNative);
        }
        public Get(): DbContext.IndexedDb.IDBContext {
            return this._context;
        }
    }
}