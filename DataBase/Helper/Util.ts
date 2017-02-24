namespace DbManager {
    export class Util {
        static CreatePromise(): any {
            var obj = {
                resolve: null,
                reject: null
            };
            var promise = new Promise(function (resolve, reject) {
                obj.resolve = resolve;
                obj.reject = reject;
            });
            return Object.assign(promise, obj);
        }
        static Log(ex): void {
            console.log(ex);
        }
    }
}