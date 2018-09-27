# Copy documents between mongo collections
A little module to copy documents from a MongoDB Collection to another one, also in another MongoDB.

## How to use it
Just copy the files into your working directory and follow the *proof.js* lines.

## How it is made
Given that the origin Collection and the destination Collection can be in different MongoDBs, even in different Connection Addresses (for instance, origin: mongodb://192.42.123.6:27017 and destination: mongodb://152.32.163.6:27017), this module will retrieve documents from the origin in order to put them into the destination.<br>
It is mainly a 3 steps Promise chain:
1.  Extracts the Mongoose Schema of the origin MongoDB, with [extract-mongo-schema](https://www.npmjs.com/package/extract-mongo-schema) and save as a temporary JSON file;
2.  Gets the documents from the origin MongoDB;
3.  Inserts the retrieved Documents into the destination Collection, in the destination MongoDB, using the Schema of the Collection, extracted from the temporary JSON file.
4.  Deletes the temporary JSON of point 1.


