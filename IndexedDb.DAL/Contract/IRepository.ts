export namespace indexedDB {
    export interface IRepository<TObjectStore extends IDBObjectStore, TKey extends any> {
         Add(TObject: any) :Promise<any>;
         Update(TObject: any) :Promise<any>;
         Delete(TKey: any) :Promise<any>;
         Get(TKey: any) :Promise<any>;
         GetAll() : Promise<any>;
    }
}