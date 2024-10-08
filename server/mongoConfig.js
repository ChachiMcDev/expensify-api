const { MongoClient, ObjectId } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'expensify';
const db = client.db(dbName);
const collectionName = db.collection('tests');

module.exports = {
    client,
    dbconnect: collectionName
};