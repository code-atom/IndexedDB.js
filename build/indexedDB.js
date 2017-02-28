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
            if (Util.enableDebug)
                console.log(ex);
        };
        return Util;
    }());
    Util.enableDebug = true;
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
                    if (self.ModelBuilding) {
                        self.ModelBuilding(db);
                    }
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
                var os = databse.createObjectStore(model.name, idbOSConf);
                if ((typeof model.indexes !== 'undefined') && (model.indexes.length > 0)) {
                    for (var i = 0; i < model.indexes.length; i++) {
                        os.createIndex(model.indexes[i].name, model.indexes[i].keyPath, model.indexes[i].options);
                    }
                }
            }
            else {
            }
        };
        return DbContext;
    }());
    IndexedDB.DbContext = DbContext;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var DbContextBuilder = (function () {
        function DbContextBuilder(_dbNative) {
            this._dbNative = _dbNative;
            this._models = [];
            this._isCreated = false;
        }
        DbContextBuilder.prototype.CreateDB = function (dbName) {
            this._dbName = dbName;
            return this;
        };
        DbContextBuilder.prototype.ConfigureModel = function (model) {
            if (model === undefined || model === null)
                throw new Error('Please mention model detail');
            this._models.push(model);
            return this;
        };
        DbContextBuilder.prototype.UpgradeConfiguration = function (UpgradeConfiguration) {
            if (this._upgradeConfig !== undefined || this._upgradeConfig !== null)
                throw new Error('Upgrade Configuration already provided');
            this._upgradeConfig = UpgradeConfiguration;
            return this;
        };
        DbContextBuilder.prototype.Build = function () {
            if (this._isCreated)
                throw new Error('Context is already Build');
            var that = this;
            var object = Object.create(null);
            var container = new IndexedDB.DbContext(this._dbNative, this._dbName);
            container.Upgrade = this._upgradeConfig;
            container.ModelBuilding = function (db) {
                for (var _i = 0, _a = that._models; _i < _a.length; _i++) {
                    var model = _a[_i];
                    this.CreateObjectSet(db, model);
                }
            };
            for (var _i = 0, _a = this._models; _i < _a.length; _i++) {
                var model = _a[_i];
                object[model.name] = new IndexedDB.BaseRepository(container, model.name);
            }
            this._repositories = object;
            this._isCreated = true;
            return object;
        };
        DbContextBuilder.prototype.GetRepositories = function () {
            if (!this._isCreated)
                throw new Error('Please build the DbContext first');
            return this._repositories;
        };
        DbContextBuilder.Debug = function (flag) {
            IndexedDB.Util.enableDebug = flag;
        };
        return DbContextBuilder;
    }());
    IndexedDB.DbContextBuilder = DbContextBuilder;
})(IndexedDB || (IndexedDB = {}));
var IndexedDB;
(function (IndexedDB) {
    var BaseRepository = (function () {
        function BaseRepository(TContext, StoreName) {
            this._DBContext = TContext;
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
//# sourceMappingURL=indexedDB.js.map