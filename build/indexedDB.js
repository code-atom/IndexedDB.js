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
            this._version = 1;
            this.Begin = function () {
                if (!this._DBPromise) {
                    this._DBPromise = this.begin();
                }
                return this._DBPromise;
            };
            this.begin = function () {
                var self = this;
                var creationRequest = self._dbNative.open(this.dbName, this.Upgrade != undefined ? this.Upgrade.Version : this._version);
                var promise = IndexedDB.Util.CreatePromise();
                if (creationRequest.readyState === "done") {
                    promise.resolve(creationRequest.result);
                }
                creationRequest.onsuccess = function (event) {
                    promise.resolve(event.target.result);
                };
                creationRequest.onupgradeneeded = function (event) {
                    var db = event.target.result;
                    self.ModelBuilding(db);
                    if (self.Upgrade) {
                        self.Upgrade.UpgradeSetting.call(self, db);
                    }
                };
                creationRequest.onerror = function (event) {
                    IndexedDB.Util.Log('Error while opening the database');
                    promise.reject(event);
                };
                return promise;
            };
            this._dbNative = databaseNative;
            this.dbName = this.dbName || 'SampleDB';
        }
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
        DbContext.prototype.CreateObjectSet = function (databse, model) {
            if (!databse.objectStoreNames.contains(model.name)) {
                var idbOSConf = { keyPath: model.keyPath, autoIncrement: true };
                if (typeof model.autoIncrement !== 'undefined') {
                    idbOSConf.autoIncrement = model.autoIncrement;
                }
                databse.createObjectStore(model.name, idbOSConf);
            }
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
            this.CreateObjectSet(database, { name: "Sample1", keyPath: "id", autoIncrement: true });
            this.CreateObjectSet(database, { name: "Sample2", keyPath: "id", autoIncrement: true });
            this.CreateObjectSet(database, { name: "Sample3", keyPath: "id", autoIncrement: true });
            this.CreateObjectSet(database, { name: "Sample4", keyPath: "id", autoIncrement: true });
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
        function BaseRepository(ObjectStore, StoreName) {
            this._DBContext = ObjectStore;
            this._StoreName = StoreName;
        }
        BaseRepository.prototype.Add = function (TObject) {
            var self = this;
            return this._DBContext.Begin().then(function (db) {
                var promise = IndexedDB.Util.CreatePromise();
                var transaction = db.transaction([self._StoreName], "readwrite");
                var objectStore = transaction.objectStore(self._StoreName);
                var request = objectStore.add(TObject);
                request.onerror = function (event) {
                    promise.reject();
                    IndexedDB.Util.Log("Fail");
                };
                transaction.oncomplete = function (event) {
                    promise.resolve();
                    IndexedDB.Util.Log("success");
                };
                return promise;
            }, this.ErrorHandler);
        };
        BaseRepository.prototype.Update = function (TObject) {
            var self = this;
            return this._DBContext.Begin().then(function (db) {
                var promise = IndexedDB.Util.CreatePromise();
                var transaction = db.transaction([self._StoreName], "readwrite");
                var objectStore = transaction.objectStore(self._StoreName);
                objectStore.put(TObject);
                transaction.onerror = function (event) {
                    promise.reject();
                    IndexedDB.Util.Log("Fail");
                };
                transaction.oncomplete = function (event) {
                    promise.resolve();
                    IndexedDB.Util.Log("success");
                };
                return promise;
            }, this.ErrorHandler);
        };
        BaseRepository.prototype.Delete = function (Key) {
            var self = this;
            return this._DBContext.Begin().then(function (db) {
                var promise = IndexedDB.Util.CreatePromise();
                var transaction = db.transaction([self._StoreName], "readwrite");
                var objectStore = transaction.objectStore(self._StoreName);
                objectStore.delete(Key);
                transaction.onerror = function (event) {
                    promise.reject();
                    IndexedDB.Util.Log("Fail");
                };
                transaction.oncomplete = function (event) {
                    promise.resolve();
                    IndexedDB.Util.Log("success");
                };
                return promise;
            }, this.ErrorHandler);
        };
        BaseRepository.prototype.Get = function (TKey) {
            var self = this;
            return this._DBContext.Begin().then(function (db) {
                var promise = IndexedDB.Util.CreatePromise();
                var transaction = db.transaction(self._StoreName, IDBTransaction.READ_ONLY);
                var objectStore = transaction.objectStore(self._StoreName);
                var retrievalRequest = objectStore.get(TKey);
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
            }, this.ErrorHandler);
        };
        BaseRepository.prototype.GetAll = function () {
            var self = this;
            return this._DBContext.Begin().then(function (db) {
                var dbCollection = [];
                var promise = IndexedDB.Util.CreatePromise();
                var transaction = db.transaction(self._StoreName, IDBTransaction.READ_ONLY);
                var objectStore = transaction.objectStore(self._StoreName);
                objectStore.openCursor().onsuccess = function (evt) {
                    var cursor = evt.target.result;
                    if (cursor) {
                        dbCollection.push(cursor.value);
                        cursor.continue();
                    }
                };
                transaction.oncomplete = function (event) {
                    IndexedDB.Util.Log("success");
                    IndexedDB.Util.Log(dbCollection);
                    promise.resolve(dbCollection);
                };
                transaction.onerror = function () {
                    promise.reject();
                    IndexedDB.Util.Log("Fail");
                };
                return promise;
            }, this.ErrorHandler);
        };
        BaseRepository.prototype.ErrorHandler = function (ex) {
            IndexedDB.Util.Log(ex);
        };
        return BaseRepository;
    }());
    IndexedDB.BaseRepository = BaseRepository;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var SampleRepository = (function (_super) {
        __extends(SampleRepository, _super);
        function SampleRepository(ObjectStore) {
            return _super.call(this, ObjectStore, "Sample1") || this;
        }
        return SampleRepository;
    }(IndexedDB.BaseRepository));
    IndexedDB.SampleRepository = SampleRepository;
})(IndexedDB || (IndexedDB = {}));
//# sourceMappingURL=indexedDB.js.map