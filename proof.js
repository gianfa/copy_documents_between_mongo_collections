
const copier = require('./copy_documents_between_mongodb');


// Parameters
let url_source = "mongodb://localhost:27018";   // Url of the DB from which to take the documents.
let url_dest   = "mongodb://localhost:27018";   // Url of the DB into which the documents will be inserted.
let orig_dbName   = "DB1";                      // Name of the DB from which to take the documents.
let dest_dbName   = "DB2";                      // Name of the DB into which the documents will be inserted.
let coll_source   = "collection1";              // Name of the Collection from which to take the documents.
let coll_dest     = "collection2";              // Name of the Collection into which the documents will be inserted.

// Execute
copier.copy_documents_between_mongodb(url_source, url_dest, orig_dbName, dest_dbName, coll_source, coll_dest);
