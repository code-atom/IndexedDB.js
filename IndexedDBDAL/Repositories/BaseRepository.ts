/// <reference path="../Contract/IRepository.ts" />
/// <reference path="../Helpers/Util.ts" />

namespace IndexedDB {
    export class BaseRepository<TObjectStore extends IDBObjectStore, TKey extends string | number> implements IRepository<TObjectStore, TKey>{
        private _ObjectStore: IDBObjectStore;
        constructor(ObjectStore: TObjectStore) {
            this._ObjectStore = ObjectStore;
        }

        public Add(TObject: any): Promise<any> {
            var promise = Util.CreatePromise();
            var creationRequest = this._ObjectStore.add(TObject);
            creationRequest.onerror = (event: any) => {
                promise.reject();
                Util.Log("Fail");
            }
            creationRequest.onsuccess = (event: any) => {
                promise.resolve();
                Util.Log("Fail");
            }
            return promise;
        }

        public Update(TObject: any): Promise<any> {
            var promise = Util.CreatePromise();
            var creationRequest = this._ObjectStore.put(TObject);
            creationRequest.onerror = (event: any) => {
                promise.reject();
                Util.Log("Fail");
            }
            creationRequest.onsuccess = (event: any) => {
                promise.resolve();
                Util.Log("Fail");
            }
            return promise;
        }

        public Delete(Key: TKey): Promise<any> {
            var promise = Util.CreatePromise();
            var deleteRequest = this._ObjectStore.delete(Key);
            deleteRequest.onerror = (event: any) => {
                promise.reject();
                Util.Log("Fail");
            }
            deleteRequest.onsuccess = (event: any) => {
                promise.resolve();
                Util.Log("success");
            }
            return promise;
        }

        public Get(TKey: any): Promise<any> {
            var promise = Util.CreatePromise();
            var retrievalRequest = this._ObjectStore.get(TKey);
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
            var dbCollection : any = [];
            var promise = Util.CreatePromise();
            var getAllRequest = this._ObjectStore.openCursor();
            getAllRequest.onsuccess = function (evt: any) {
                var cursor = evt.target.result;
                if (cursor) {
                    dbCollection.push(cursor.value);
                    cursor.continue()
                } else {
                    Util.Log("success");
                    promise.resolve(dbCollection);
                }
            };
            getAllRequest.onerror = function () {
                promise.reject();
                Util.Log("Fail");
            };
            return promise;
        }
    }
}