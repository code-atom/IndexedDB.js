namespace IndexedDB {
    export type UnitOfWorkOption = "readwrite" | "readonly";

    export class UnitOfWork {
        private _DbContext: IDBContext;
        private _models: string[];
        constructor(DbContext: IDBContext, models: string[]) {
            this._DbContext = DbContext;
            this._models = models;
        }
        public Begin(option: UnitOfWorkOption, callback: (transactionRepository: any) => void): void {
            var self = this;
            this._DbContext
                .Begin()
                .then(function (db: IDBDatabase) {
                    var object = Object.create(null);
                    var transaction = db.transaction(self._models, option);
                    for (var model of this._models) {
                        var objectStore = transaction.objectStore(model);
                        object[model] = new Repository(objectStore, model);
                    }
                    if(!callback) throw new Error('specify the scope callback function');
                    callback(object);
                });
        }
    }
}