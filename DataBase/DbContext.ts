namespace DbManager {
    export class Operation {
        static Create = "add";
        static Update = 'put';
        static Delete = 'delete';
    }
   export class DbContext implements IDBContext, ICRUDContext {
        public errorHandler = Util.Log;
        constructor(private databaseNative: IDBFactory, public dbName: string, public models: string[]) {
            this.begin();
        }

        public begin(): Promise<any> {
            var self = this;
            var creationRequest = self.databaseNative.open(this.dbName);
            var promise = Util.CreatePromise();
            creationRequest.onsuccess = function (event: any) {
                promise.resolve(event.target.result);
            }
            creationRequest.onupgradeneeded = function (event: any) {
                var db = event.target.result;
                for (var model of self.models) {
                    var dbStore = db.createObjectStore(model, { keyPath: 'id', autoIncrement: true });
                }
                promise.resolve(db);
            }
            return promise;
        }

        public add(model: string, data: any): Promise<any> {
            return this.dbaccess(model, data, Operation.Create);
        }

        public delete(model: string, id: any): Promise<any> {
            return this.dbaccess(model, id, Operation.Delete);
        }

        public update(model: string, data: any) {
            return this.dbaccess(model, data, Operation.Update);
        }

        private dbaccess(model: string, data: any, op: string): Promise<any> {
            var self = this;
            return this.begin()
                .then(function (db: IDBDatabase) {
                    var promise = Util.CreatePromise();
                    var trans: IDBTransaction;
                    var tbl: IDBObjectStore;
                    trans = db.transaction([model], "readwrite");
                    tbl = trans.objectStore(model);
                    tbl[op](data);
                    trans.oncomplete = function () {
                        promise.resolve();
                        Util.Log("successfully");
                    };
                    trans.onerror = function () {
                        promise.reject();
                        Util.Log("Fail");
                    };
                    return promise;
                })
        }

        public read(model: string, id: any): Promise<any> {
            return this.begin()
                .then(function (db) {
                    var data: any;
                    var promise = Util.CreatePromise();
                    var trans: IDBTransaction;
                    var tbl: IDBObjectStore;
                    trans = db.transaction([model], IDBTransaction.READ_ONLY);
                    tbl = trans.objectStore(model);
                    var req = tbl.get(id);
                    req.onsuccess = function (evt: any) {
                        data = evt.target.result;
                        Util.Log("successfully");
                    };
                    req.onerror = function () {
                        promise.reject();
                        Util.Log("Fail");
                    };
                    trans.oncomplete = function () {
                        promise.resolve(data);
                    };
                    return promise;
                });
        }

        public all(model: string): Promise<any> {
            return this.begin().then(function (db: IDBDatabase) {
                var dbCollection: any[];
                var promise = Util.CreatePromise();
                var trans: IDBTransaction;
                var tbl: IDBObjectStore;
                trans = db.transaction([model], IDBTransaction.READ_ONLY);
                tbl = trans.objectStore(model);
                var req = tbl.openCursor();
                req.onsuccess = function (evt: any) {
                    var cursor = evt.target.result;
                    if (cursor) {
                        dbCollection.push(cursor.value);
                        cursor.continue()
                    }
                };
                req.onerror = function () {
                    promise.reject();
                    Util.Log("Fail");
                };
                trans.oncomplete = function () {
                    promise.resolve(dbCollection);
                    Util.Log("successfully");
                };
                return promise;
            });
        }

        public deleteDb(): Promise<any> {
            var self = this;
            return this.begin()
                .then(function (db: IDBDatabase) {
                    db.close();
                    var promise = Util.CreatePromise();
                    var req = self.databaseNative.deleteDatabase(self.dbName);
                    req.onsuccess = function () {
                        promise.resolve();
                        Util.Log("Deleted database successfully");
                    };
                    req.onerror = function () {
                        promise.reject();
                        Util.Log("Couldn't delete database");
                    };
                    req.onblocked = function () {
                        promise.reject();
                        Util.Log("Couldn't delete database due to the operation being blocked");
                    };
                    return promise;
                });
        }

        public resetDb(): Promise<any> {
            return this.delete().then(this.init);
        }
    }
}