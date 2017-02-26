import * as IRepository from "../Contract/IRepository";
import * as Helpers from "../Helpers/Util";
export namespace indexedDB.Repository {
    export class BaseRepository<TObjectStore extends IDBObjectStore, TKey extends any> implements IRepository.indexedDB.IRepository<TObjectStore, TKey>{
        private _ObjectStore: IDBObjectStore;
        constructor(ObjectStore: TObjectStore) {
            this._ObjectStore = ObjectStore;
        }

        public Add(TObject : any) : Promise<any> {
            var promise = Helpers.IndexedDb.Helpers.Util.CreatePromise();
            var creationRequest = this._ObjectStore.add(TObject);
            creationRequest.onerror = (event : any) => {
                
            }
            return promise;
        }
    }
}