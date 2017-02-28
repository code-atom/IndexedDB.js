namespace IndexedDB {
    export interface IDBContext {
        Begin(): Promise<any>;
        Reset(): Promise<any>;
        Delete(): Promise<any>;
        Upgrade: IDBUpgradeConfiguration;
    }
    export interface IModelConfig {
        name: string,
        keyPath: string,
        autoIncrement: any,
        indexes?: IIndexConfig[],
        upgradeMapping?: (model: any) => void;
    }
    export interface IIndexConfig {
        name: string;
        keyPath: string,
        options: any
    }
}