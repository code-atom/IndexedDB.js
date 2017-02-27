/// <reference path="./Contract/IDbContext.ts" />
/// <reference path="./Helpers/Util.ts" />

namespace IndexedDB {
    export abstract class DbContext implements IDBContext {
        private _dbNative: IDBFactory;
        private _version = 1;
        private _DBPromise: Promise<any>;
        constructor(databaseNative: IDBFactory, public dbName?: string) {
            this._dbNative = databaseNative;
            this.dbName = this.dbName || 'SampleDB';
        }
        public Begin = function () {
            if (!this._DBPromise) {
                this._DBPromise = this.begin();
            }
            return this._DBPromise;
        }
        public begin = function () {
            var self = this;
            var creationRequest = self._dbNative.open(this.dbName, this.Upgrade != undefined ? this.Upgrade.Version : this._version);
            var promise = Util.CreatePromise();
            if (creationRequest.readyState === "done") {
                promise.resolve(creationRequest.result);
            }

            creationRequest.onsuccess = function (event: any) {
                promise.resolve(event.target.result);
            }

            creationRequest.onupgradeneeded = function (event: any) {
                var db = event.target.result as IDBDatabase;
                self.ModelBuilding(db);
                if (self.Upgrade) {
                    self.Upgrade.UpgradeSetting.call(self, db);
                }
            }
            creationRequest.onerror = (event: any) => {
                Util.Log('Error while opening the database');
                promise.reject(event);
            }

            return promise;
        }

        public Delete(): Promise<any> {
            var self = this;
            return this.Begin()
                .then(function (db: IDBDatabase) {
                    db.close();
                    var promise = Util.CreatePromise();
                    var req = self._dbNative.deleteDatabase(self.dbName);
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

        public Reset(): Promise<any> {
            return this.Delete().then(this.Begin);
        }

        public CreateObjectSet(databse: IDBDatabase, model: IModelConfig): void {
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
        }

        protected abstract ModelBuilding(databse: IDBDatabase): void;

        public Upgrade: IDBUpgradeConfiguration;

    }
}