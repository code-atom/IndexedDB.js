import * as Helpers from "./Helpers/Util";
import * as DbContext from "./Contract/IDbContext";
export namespace IndexedDb {
    export abstract class DbContext implements DbContext.IndexedDb.IDBContext {
        private _dbNative: IDBFactory;
        constructor(databaseNative: IDBFactory, public dbName?: string) {
            this._dbNative = databaseNative;
            this.dbName = this.dbName || 'SampleDB';
            this.Begin();
        }
        
        public Begin(): Promise<any> {
            var self = this;
            var creationRequest = self._dbNative.open(this.dbName);
            var promise = Helpers.IndexedDb.Helpers.Util.CreatePromise();
            creationRequest.onsuccess = function (event: any) {
                promise.resolve(event.target.result);
            }
            
            creationRequest.onupgradeneeded = function (event: any) {
                var db = event.target.result as IDBDatabase;
                self.ModelBuilding(db);
                promise.resolve(db);
            }

            return promise;
        }

        public Delete(): Promise<any> {
            var self = this;
            return this.Begin()
                .then(function (db: IDBDatabase) {
                    db.close();
                    var promise = Helpers.IndexedDb.Helpers.Util.CreatePromise();
                    var req = self._dbNative.deleteDatabase(self.dbName);
                    req.onsuccess = function () {
                        promise.resolve();
                        Helpers.IndexedDb.Helpers.Util.Log("Deleted database successfully");
                    };
                    req.onerror = function () {
                        promise.reject();
                        Helpers.IndexedDb.Helpers.Util.Log("Couldn't delete database");
                    };
                    req.onblocked = function () {
                        promise.reject();
                        Helpers.IndexedDb.Helpers.Util.Log("Couldn't delete database due to the operation being blocked");
                    };
                    return promise;
                });
        }

        public Reset(): Promise<any> {
            return this.Delete().then(this.Begin);
        }

        public CreateObjectSet(model: string): Promise<IDBObjectStore> {
            var self = this;
            return this.Begin()
                .then(function (db: IDBDatabase) {
                    var dbStoreReq = db.createObjectStore(model);
                    return dbStoreReq;
                });
        }

        protected abstract ModelBuilding(databse :IDBDatabase);
    }
}