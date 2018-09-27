/*
 *  Automatic Collections transfer from 
 *      mongoDb.DB1.collection1 to Locale.DB2.collection2
 *
 * @author: Gianfrancesco Angelini
 * @status: working/developing
 * @issues:
 *      - Often holds something pending, not terminating the code
*/



// Imports
const fs    = require('fs');
const exec  = require('child_process').exec;
const MongoClient = require('mongodb').MongoClient;
const mongoose  = require('mongoose');
const clonedeep = require("lodash.clonedeep");



/* Documents Getter 
 * Here we define the Promise to get all the Documents from the Collection 'development'.
 * @param {string} dbUrl  - Url of the DB from which to take the documents.
 * @param {string} dbName - Name of the DB from which to take the documents.
 * @param {string} coll   - Name of the Collection from which to take the documents.
 * @param {string} astext - If true it resolves a stringified version of the results.
 * @returns {Promise} 
*/
var get_documents_from_collection = ( dbUrl, dbName, coll, astext=false ) => {
    return new Promise( (resolve, reject) => {
        MongoClient.connect( dbUrl, {useNewUrlParser: true}, function(err, db) {
            if (err) throw err;
            //Access to DB
            var dbo = db.db(dbName);
            //Query
            dbo.collection( coll ).find({}).toArray( (err, result) => {
                if (err) throw err;
                //console.log(result.toString());
                if(astext){ resolve( JSON.stringify( result ) );  }
                else{ resolve(result);  }
                db.close();
            })
        });
    });//Promise   
};//get_documents_from_collection



/* Document Inserter
 * Inserts a Documents Array into a MongoDB Collection
 * @param {string} dest_url - Url of the DB into which the documents will be inserted.
 * @param {string} dest_dbName - Name of the DB into which the documents will be inserted.
 * @param {string} dest_coll   - Name of the Collection into which the documents will be inserted.
 * @param {JSON} - The Schema of the collection
 * @returns {boolean}
 */ 
var insert_documents_into_collection = (dest_url, dest_dbName, dest_coll, docSchema, dox) =>{
    mongoose.connect( dest_url+'/'+dest_dbName, {useNewUrlParser: true} );
    // 2. Check the connection
    var con = mongoose.connection;
    con.on('error', function (err){
        console.log('connection error', err);
    });
    // 3. Let's rock!
    con.once('open', () =>{
        console.log('\nconnected!\n');
        console.log(dox);
        //##  Stuff on DB
        const testile = mongoose.model('testile', docSchema, dest_coll);
        console.log( '\n\t\t saving the documents.. \n' );
        tests_array = [];
        dox.forEach( (doc)=>{
            mod = new testile( doc );
            tests_array.push( mod );
            mod.save( (err, savedMod)=>{
                if (err){ 
                    console.error(err);
                    return false;
                }
                console.log( "'"+savedMod.name +"'" + " document inserted to " + dest_coll );
            });
        });//forEach
        return true;
    });//con.on
};//insert_documents_to_collection



/* 
 * Schema Retriever
 * Retrieves the DB Mongoose Schemas from a MongoDB, and save it in a JSON file.
 * @param {string} orig_url - Url of the DB from which to take the documents.
 * @param {string} orig_dbName - Name of the DB from which to take the documents.
 */ 
let retrieveSchemas  = async ( orig_url, orig_dbName ) => {
    const extrSchema = 'temp_extr_schema.json';
    const comm = 'extract-mongo-schema -d '+ orig_url + '/' + orig_dbName +' -o '+ extrSchema +' -f json';
    exec( comm, function(err, stdout, stderr) {
        if (err) rej(err);
    });
    let wait_for_file = ( isin )=>{ //if isin == false waits
        if(isin) return;
        setTimeout( () => "done!", 50 ); //0.1s
        return;
    };
    let fex = false;
    while( !fex ){
        wait_for_file(fex);
        if (fs.existsSync(extrSchema)) {
            fex = true;
        }
        //console.log('FEX: '+fex);
    }
    return extrSchema;
};//


/*
 * Deletes a file
 * @param {string} fname - the name of the file to delete
 * @returns{Promise}
 */
var del_file = (fname)=>{
    return new Promise( (res, rej)=>{
        fs.unlink(fname);
        res( true );
    });//Promise
};//del_file


/*
 * Transfer all Documents to another DB
 * Copies all the documents from one db collection to another one.
 * It uses the schema of the collection.
 * @param {string} orig_url - Url of the DB from which to take the documents.
 * @param {string} dest_url - Url of the DB into which the documents will be inserted.
 * @param {string} orig_dbName - Name of the DB from which to take the documents.
 * @param {string} dest_dbName - Name of the DB into which the documents will be inserted.
 * @param {string} orig_coll   - Name of the Collection from which to take the documents.
 * @param {string} dest_coll   - Name of the Collection into which the documents will be inserted.
 * @returns {boolean}
 */ 
let copy_documents_between_mongodb = async function( orig_url, dest_url, orig_dbName, dest_dbName, orig_coll, dest_coll ){
    // 1. Extract the Schema from origin
    let sc = await retrieveSchemas( orig_url, orig_dbName ); 
    let schemaObj_json = await require('./'+sc);
    //const collSchema   =  Object.assign( {}, schemaObj_json[orig_coll] );
    collSchema = clonedeep( schemaObj_json[orig_coll] );
    console.log( 'collSchema:\n\t ' + collSchema.toString() );
    let collectionSchema = collSchema; //v
    // 2. Retrieve Documents from origin
    try{
        let dox = await get_documents_from_collection( orig_url, orig_dbName, orig_coll, astext=false );
        console.log( 'dox:\n\t' + dox.toString() );
        const schemaObj= await mongoose.Schema(collectionSchema);
        // 3. Inserting Documents into destination DB
        try{
            await insert_documents_into_collection( dest_url, dest_dbName, dest_coll, schemaObj, dox );
            // 4. Delete the temp file just created
            fs.unlinkSync(sc);
            return true;
        }
        catch(er){
            console.log('uho!');
            throw console.trace( 'Something went wrong with Docs insertion' );
        }
    }
    catch(er){
        console.log('uho!');
        throw new Error( 'Something went wrong with Documents retrieving from origin DB' );
    }
   
};

module.exports = {};
module.exports.get_documents_from_collection = get_documents_from_collection;
module.exports.insert_documents_into_collection = insert_documents_into_collection;
module.exports.retrieveSchemas = retrieveSchemas;
module.exports.copy_documents_between_mongodb = copy_documents_between_mongodb;
