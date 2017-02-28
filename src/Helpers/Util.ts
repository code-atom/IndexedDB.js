namespace IndexedDB {
    export class Util {
        static enableDebug: boolean = true;
        static CreatePromise(): any {
            var promiseHandler = <IPromiseHandler>{};
            var promise = new Promise(function (resolve, reject) {
                promiseHandler.resolve = resolve;
                promiseHandler.reject = reject;
            });
            return Object.assign(promise, promiseHandler);
        }
        static Log(ex: any): void {
            if (Util.enableDebug)
                console.log(ex);
        }
    }
    export interface IPromiseHandler {
        resolve(value?: any): void;
        reject(value?: any): void;
    }
}