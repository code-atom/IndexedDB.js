namespace IndexedDB {
    export class SampleContext extends DbContext {
        constructor(_dbNative: IDBFactory) {
            super(_dbNative, "SampleContext");
        }
        protected ModelBuilding(database: IDBDatabase) {
            this.CreateObjectSet(database, { name: "Sample1", keyPath: "id", autoIncrement: true });
            this.CreateObjectSet(database, { name: "Sample2", keyPath: "id", autoIncrement: true });
            this.CreateObjectSet(database, { name: "Sample3", keyPath: "id", autoIncrement: true });
            this.CreateObjectSet(database, { name: "Sample4", keyPath: "id", autoIncrement: true });
        }
    }
}
