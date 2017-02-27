/// <reference path="../SampleContext.ts" />

namespace IndexedDB {
    export class SampleRepository extends BaseRepository<SampleContext, number>{
        constructor(ObjectStore: SampleContext) {
            super(ObjectStore, "Sample1");
        }
    }
}