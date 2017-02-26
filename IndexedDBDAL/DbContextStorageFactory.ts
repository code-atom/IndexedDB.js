namespace IndexedDB {
    export class DbContextStorageFactory {
        private ContextContainer: IDbContextStorageContainer;
        constructor(dbNative: IDBFactory) {
            this.ContextContainer = new DbContextConatiner(dbNative);
        }
        get Context(): IDBContext {
            return this.ContextContainer.Get();
        }

    }
}