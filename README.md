## IndexedDB.js
inspired from **[proto-db](https://github.com/jaqmol/proto-db)**. 
IndexedDB.js enable you to access the indexed Database feature of browser with promise-api. IndexedDB.js create a repository for each Object store in IndexedDB database.

Sample Code of Usage :
```javascript
var sampleContextBuilder = new IndexedDB.DbContextBuilder(window.indexedDB);
sampleContextBuilder.CreateDB("Sample");
sampleContextBuilder.ConfigureModel({
        name: "Sample",
        keyPath: "id",
        autoIncrement: false
        });
sampleContextBuilder.Build();
```

## TODO  
 * Unit Test for DbContextbuilder and BaseRepository.
 * Performance measurement and optimization.
 * Query interface to repository.
 * Bug-free :)

