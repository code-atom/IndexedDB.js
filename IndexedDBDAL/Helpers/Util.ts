namespace IndexedDB {
    export class Util {
        static CreatePromise(): any {
            var promiseHandler = <IPromiseHandler>{};
            var promise = new Promise(function (resolve, reject) {
                promiseHandler.resolve = resolve;
                promiseHandler.reject = reject;
            });
            return Object.assign(promise, promiseHandler);
        }
        static Log(ex: any): void {
            console.log(ex);
        }
    }
    export interface IPromiseHandler {
        resolve(value?: any): void;
        reject(value?: any): void;
    }
}