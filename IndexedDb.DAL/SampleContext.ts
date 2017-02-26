import * as DbContext from './DbContext';
export namespace indexedDB {
    export class SampleContext extends DbContext.IndexedDb.DbContext {
        constructor(_dbNative: IDBFactory) {
            super(_dbNative, "SampleContext");
        }

        protected ModelBuilding(database :IDBDatabase) {
             this.Sample1 = database.createObjectStore("Sample1")
        }

        public Sample1 : IDBObjectStore;
    }
}