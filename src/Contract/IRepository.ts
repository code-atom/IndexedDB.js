namespace IndexedDB {
    export interface IRepository<TDBContext extends IDBContext, TKey extends any> {
        Add(TObject: any): Promise<any>;
        Update(TObject: any): Promise<any>;
        Delete(TKey: any): Promise<any>;
        Get(TKey: any): Promise<any>;
        GetAll(): Promise<any>;
    }
}