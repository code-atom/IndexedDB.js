import * as Helpers from "./Helpers/Util";
import * as DbContextStorage from "./Contract/IDbContextStorageContainer";
import * as DbContext from "./Contract/IDbContext";
import * as DbContextContainer from "./DbContextContainer";
export namespace indexedDB {
    export class DbContextStorageFactory {
        private ContextContainer: DbContextStorage.indexedDB.IDbContextStorageContainer;
        constructor(dbNative: IDBFactory) {
            this.ContextContainer = new DbContextContainer.indexedDB.DbContextConatiner(dbNative);
        }
        get Context(): DbContext.IndexedDb.IDBContext {
            return this.ContextContainer.Get();
        }

    }
}