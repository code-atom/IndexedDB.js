namespace DbManager {
    class DbContextWrapper implements IDbContextWrapper {
        public Context: IDBContext;
        constructor(context: IDBContext) {
            this.Context = context;
        }
    }
}