namespace IndexedDB {
    export class SampleContext extends DbContext {
        public Sample1: IDBObjectStore;
        constructor(_dbNative: IDBFactory) {
            super(_dbNative, "SampleContext");
        }

        protected ModelBuilding(database: IDBDatabase) {
            this.Sample1 = database.createObjectStore("Sample1")
        }
    }
}
