namespace IndexedDB {
    export interface IDBContext {
        Begin(): Promise<any>;
        Reset(): Promise<any>;
        Delete(): Promise<any>;
        Upgrade : IDBUpgradeConfiguration;
    }
    export interface IModelConfig {
        name: string,
        keyPath: any,
        autoIncrement : any
    }
}