/// <reference path="./Contract/IDbContextStorageContainer.ts" />
/// <reference path="./SampleContext.ts" />

namespace IndexedDB {
    export class DbContextConatiner implements IDbContextStorageContainer {
        private _context: SampleContext;
        constructor(databaseNative: IDBFactory) {
            this._context = new SampleContext(databaseNative);
        }
        public Get(): IDBContext {
            return this._context;
        }
    }
}
