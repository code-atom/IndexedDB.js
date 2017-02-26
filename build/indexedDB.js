var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var IndexedDB;
(function (IndexedDB) {
    var Util = (function () {
        function Util() {
        }
        Util.CreatePromise = function () {
            var promiseHandler = {};
            var promise = new Promise(function (resolve, reject) {
                promiseHandler.resolve = resolve;
                promiseHandler.reject = reject;
            });
            return Object.assign(promise, promiseHandler);
        };
        Util.Log = function (ex) {
            console.log(ex);
        };
        return Util;
    }());
    IndexedDB.Util = Util;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var DbContext = (function () {
        function DbContext(databaseNative, dbName) {
            this.dbName = dbName;
            this._dbNative = databaseNative;
            this.dbName = this.dbName || 'SampleDB';
            this.Begin();
        }
        DbContext.prototype.Begin = function () {
            var self = this;
            var creationRequest = self._dbNative.open(this.dbName);
            var promise = IndexedDB.Util.CreatePromise();
            creationRequest.onsuccess = function (event) {
                promise.resolve(event.target.result);
            };
            creationRequest.onupgradeneeded = function (event) {
                var db = event.target.result;
                self.ModelBuilding(db);
                promise.resolve(db);
            };
            return promise;
        };
        DbContext.prototype.Delete = function () {
            var self = this;
            return this.Begin()
                .then(function (db) {
                db.close();
                var promise = IndexedDB.Util.CreatePromise();
                var req = self._dbNative.deleteDatabase(self.dbName);
                req.onsuccess = function () {
                    promise.resolve();
                    IndexedDB.Util.Log("Deleted database successfully");
                };
                req.onerror = function () {
                    promise.reject();
                    IndexedDB.Util.Log("Couldn't delete database");
                };
                req.onblocked = function () {
                    promise.reject();
                    IndexedDB.Util.Log("Couldn't delete database due to the operation being blocked");
                };
                return promise;
            });
        };
        DbContext.prototype.Reset = function () {
            return this.Delete().then(this.Begin);
        };
        DbContext.prototype.CreateObjectSet = function (model) {
            var self = this;
            return this.Begin()
                .then(function (db) {
                var dbStoreReq = db.createObjectStore(model);
                return dbStoreReq;
            });
        };
        return DbContext;
    }());
    IndexedDB.DbContext = DbContext;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var SampleContext = (function (_super) {
        __extends(SampleContext, _super);
        function SampleContext(_dbNative) {
            return _super.call(this, _dbNative, "SampleContext") || this;
        }
        SampleContext.prototype.ModelBuilding = function (database) {
            this.Sample1 = database.createObjectStore("Sample1");
        };
        return SampleContext;
    }(IndexedDB.DbContext));
    IndexedDB.SampleContext = SampleContext;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var DbContextConatiner = (function () {
        function DbContextConatiner(databaseNative) {
            this._context = new IndexedDB.SampleContext(databaseNative);
        }
        DbContextConatiner.prototype.Get = function () {
            return this._context;
        };
        return DbContextConatiner;
    }());
    IndexedDB.DbContextConatiner = DbContextConatiner;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var DbContextStorageFactory = (function () {
        function DbContextStorageFactory(dbNative) {
            this.ContextContainer = new IndexedDB.DbContextConatiner(dbNative);
        }
        Object.defineProperty(DbContextStorageFactory.prototype, "Context", {
            get: function () {
                return this.ContextContainer.Get();
            },
            enumerable: true,
            configurable: true
        });
        return DbContextStorageFactory;
    }());
    IndexedDB.DbContextStorageFactory = DbContextStorageFactory;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var BaseRepository = (function () {
        function BaseRepository(ObjectStore) {
            this._ObjectStore = ObjectStore;
        }
        BaseRepository.prototype.Add = function (TObject) {
            var promise = IndexedDB.Util.CreatePromise();
            var creationRequest = this._ObjectStore.add(TObject);
            creationRequest.onerror = function (event) {
                promise.reject();
                IndexedDB.Util.Log("Fail");
            };
            creationRequest.onsuccess = function (event) {
                promise.resolve();
                IndexedDB.Util.Log("Fail");
            };
            return promise;
        };
        BaseRepository.prototype.Update = function (TObject) {
            var promise = IndexedDB.Util.CreatePromise();
            var creationRequest = this._ObjectStore.put(TObject);
            creationRequest.onerror = function (event) {
                promise.reject();
                IndexedDB.Util.Log("Fail");
            };
            creationRequest.onsuccess = function (event) {
                promise.resolve();
                IndexedDB.Util.Log("Fail");
            };
            return promise;
        };
        BaseRepository.prototype.Delete = function (Key) {
            var promise = IndexedDB.Util.CreatePromise();
            var deleteRequest = this._ObjectStore.delete(Key);
            deleteRequest.onerror = function (event) {
                promise.reject();
                IndexedDB.Util.Log("Fail");
            };
            deleteRequest.onsuccess = function (event) {
                promise.resolve();
                IndexedDB.Util.Log("success");
            };
            return promise;
        };
        BaseRepository.prototype.Get = function (TKey) {
            var promise = IndexedDB.Util.CreatePromise();
            var retrievalRequest = this._ObjectStore.get(TKey);
            retrievalRequest.onsuccess = function (evt) {
                var data = evt.target.result;
                IndexedDB.Util.Log("successfully");
                promise.resolve(data);
            };
            retrievalRequest.onerror = function () {
                promise.reject();
                IndexedDB.Util.Log("Fail");
            };
            return promise;
        };
        BaseRepository.prototype.GetAll = function () {
            var dbCollection = [];
            var promise = IndexedDB.Util.CreatePromise();
            var getAllRequest = this._ObjectStore.openCursor();
            getAllRequest.onsuccess = function (evt) {
                var cursor = evt.target.result;
                if (cursor) {
                    dbCollection.push(cursor.value);
                    cursor.continue();
                }
                else {
                    IndexedDB.Util.Log("success");
                    promise.resolve(dbCollection);
                }
            };
            getAllRequest.onerror = function () {
                promise.reject();
                IndexedDB.Util.Log("Fail");
            };
            return promise;
        };
        return BaseRepository;
    }());
    IndexedDB.BaseRepository = BaseRepository;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var SampleRepository = (function (_super) {
        __extends(SampleRepository, _super);
        function SampleRepository() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return SampleRepository;
    }(IndexedDB.BaseRepository));
    IndexedDB.SampleRepository = SampleRepository;
})(IndexedDB || (IndexedDB = {}));
//# sourceMappingURL=indexedDB.js.map