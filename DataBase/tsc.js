var DbManager;
(function (DbManager) {
    var Operation = (function () {
        function Operation() {
        }
        return Operation;
    }());
    Operation.Create = "add";
    Operation.Update = 'put';
    Operation.Delete = 'delete';
    DbManager.Operation = Operation;
    var DbContext = (function () {
        function DbContext(databaseNative, dbName, models) {
            this.databaseNative = databaseNative;
            this.dbName = dbName;
            this.models = models;
            this.errorHandler = DbManager.Util.Log;
            this.begin();
        }
        DbContext.prototype.begin = function () {
            var self = this;
            var creationRequest = self.databaseNative.open(this.dbName);
            var promise = DbManager.Util.CreatePromise();
            creationRequest.onsuccess = function (event) {
                promise.resolve(event.target.result);
            };
            creationRequest.onupgradeneeded = function (event) {
                var db = event.target.result;
                for (var _i = 0, _a = self.models; _i < _a.length; _i++) {
                    var model = _a[_i];
                    var dbStore = db.createObjectStore(model, { keyPath: 'id', autoIncrement: true });
                }
                promise.resolve(db);
            };
            return promise;
        };
        DbContext.prototype.add = function (model, data) {
            return this.dbaccess(model, data, Operation.Create);
        };
        DbContext.prototype["delete"] = function (model, id) {
            return this.dbaccess(model, id, Operation.Delete);
        };
        DbContext.prototype.update = function (model, data) {
            return this.dbaccess(model, data, Operation.Update);
        };
        DbContext.prototype.dbaccess = function (model, data, op) {
            var self = this;
            return this.begin()
                .then(function (db) {
                var promise = DbManager.Util.CreatePromise();
                var trans;
                var tbl;
                trans = db.transaction([model], "readwrite");
                tbl = trans.objectStore(model);
                tbl[op](data);
                trans.oncomplete = function () {
                    promise.resolve();
                    DbManager.Util.Log("successfully");
                };
                trans.onerror = function () {
                    promise.reject();
                    DbManager.Util.Log("Fail");
                };
                return promise;
            });
        };
        DbContext.prototype.read = function (model, id) {
            return this.begin()
                .then(function (db) {
                var data;
                var promise = DbManager.Util.CreatePromise();
                var trans;
                var tbl;
                trans = db.transaction([model], IDBTransaction.READ_ONLY);
                tbl = trans.objectStore(model);
                var req = tbl.get(id);
                req.onsuccess = function (evt) {
                    data = evt.target.result;
                    DbManager.Util.Log("successfully");
                };
                req.onerror = function () {
                    promise.reject();
                    DbManager.Util.Log("Fail");
                };
                trans.oncomplete = function () {
                    promise.resolve(data);
                };
                return promise;
            });
        };
        DbContext.prototype.all = function (model) {
            return this.begin().then(function (db) {
                var dbCollection;
                var promise = DbManager.Util.CreatePromise();
                var trans;
                var tbl;
                trans = db.transaction([model], IDBTransaction.READ_ONLY);
                tbl = trans.objectStore(model);
                var req = tbl.openCursor();
                req.onsuccess = function (evt) {
                    var cursor = evt.target.result;
                    if (cursor) {
                        dbCollection.push(cursor.value);
                        cursor["continue"]();
                    }
                };
                req.onerror = function () {
                    promise.reject();
                    DbManager.Util.Log("Fail");
                };
                trans.oncomplete = function () {
                    promise.resolve(dbCollection);
                    DbManager.Util.Log("successfully");
                };
                return promise;
            });
        };
        DbContext.prototype.deleteDb = function () {
            var self = this;
            return this.begin()
                .then(function (db) {
                db.close();
                var promise = DbManager.Util.CreatePromise();
                var req = self.databaseNative.deleteDatabase(self.dbName);
                req.onsuccess = function () {
                    promise.resolve();
                    DbManager.Util.Log("Deleted database successfully");
                };
                req.onerror = function () {
                    promise.reject();
                    DbManager.Util.Log("Couldn't delete database");
                };
                req.onblocked = function () {
                    promise.reject();
                    DbManager.Util.Log("Couldn't delete database due to the operation being blocked");
                };
                return promise;
            });
        };
        DbContext.prototype.resetDb = function () {
            return this["delete"]().then(this.init);
        };
        return DbContext;
    }());
    DbManager.DbContext = DbContext;
})(DbManager || (DbManager = {}));
var DbManager;
(function (DbManager) {
    var DbContextWrapper = (function () {
        function DbContextWrapper(context) {
            this.Context = context;
        }
        return DbContextWrapper;
    }());
})(DbManager || (DbManager = {}));
var DbManager;
(function (DbManager) {
    var Util = (function () {
        function Util() {
        }
        Util.CreatePromise = function () {
            var obj = {
                resolve: null,
                reject: null
            };
            var promise = new Promise(function (resolve, reject) {
                obj.resolve = resolve;
                obj.reject = reject;
            });
            return Object.assign(promise, obj);
        };
        Util.Log = function (ex) {
            console.log(ex);
        };
        return Util;
    }());
    DbManager.Util = Util;
})(DbManager || (DbManager = {}));
//# sourceMappingURL=tsc.js.map