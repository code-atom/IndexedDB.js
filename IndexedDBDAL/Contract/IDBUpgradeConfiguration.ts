namespace IndexedDB {
    export interface IDBUpgradeConfiguration {
        Version : number;
        UpgradeSetting : (db: IDBDatabase) => void
    }
}