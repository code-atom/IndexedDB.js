/// <reference path="../Contract/IRepository.ts" />
/// <reference path="../Helpers/Util.ts" />

namespace IndexedDB {
    export class Repository {
        private _Store: IDBObjectStore;
        private _StoreName: string;
        constructor(Store: IDBObjectStore, StoreName: string) {
            this._Store = Store;
            this._StoreName = StoreName;
        }

        public Add(TObject: any): Promise<any> {
            var promise = Util.CreatePromise();
            var request = this._Store.add(TObject);
            request.onerror = (event: any) => {
                promise.reject();
                Util.Log("Fail");
            }
            request.onsuccess = (event: any) => {
                promise.resolve();
                Util.Log("success");
            }
            return promise;
        }

        public Update(TObject: any): Promise<any> {
            var promise = Util.CreatePromise();
            var request = this._Store.put(TObject);
            request.onerror = (event: any) => {
                promise.reject();
                Util.Log("Fail");
            }
            request.onsuccess = (event: any) => {
                promise.resolve();
                Util.Log("success");
            }
            return promise;
        }

        public Delete(Key: string | number): Promise<any> {
            var promise = Util.CreatePromise();
            var request = this._Store.delete(Key);
            request.onerror = (event: any) => {
                promise.reject();
                Util.Log("Fail");
            }
            request.onsuccess = (event: any) => {
                promise.resolve();
                Util.Log("success");
            }
            return promise;
        }

        public Get(TKey: any): Promise<any> {

            var promise = Util.CreatePromise();
            var retrievalRequest = this._Store.get(TKey);
            retrievalRequest.onsuccess = function (evt: any) {
                var data = evt.target.result;
                Util.Log("successfully");
                promise.resolve(data);
            };
            retrievalRequest.onerror = function () {
                promise.reject();
                Util.Log("Fail");
            };
            return promise;
        }

        public GetAll(): Promise<any> {
            var dbCollection: any = [];
            var promise = Util.CreatePromise();
            var request = this._Store.openCursor();
            request.onsuccess = function (evt: any) {
                var cursor = evt.target.result;
                if (cursor) {
                    dbCollection.push(cursor.value);
                    cursor.continue()
                } else {
                    Util.Log("success");
                    Util.Log(dbCollection);
                    promise.resolve(dbCollection);
                }
            };
            request.onerror = function () {
                promise.reject();
                Util.Log("Fail");
            };
            return promise;
        }
    }
}