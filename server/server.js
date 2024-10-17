const express = require('express');
const { dbconnect, client } = require('./mongoConfig');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors');
ObjectId = require('mongodb').ObjectId
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://192.168.1.5:9000' // Replace with your React app's origin
}));


// hash user password
const hashUserPw = async (reqbody) => {
    const password = reqbody.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username: reqbody.username, password: hashedPassword };

    return newUser;
}


app.post('/api/register', async (req, res) => {
    //PULL THIS OUT
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);
    const dbName = 'expensify';
    const db = client.db(dbName);
    const collectionName = db.collection('users');
    ////////////////////////////////////////////////////////////////


    res.setHeader('Access-Control-Allow-Methods', 'Post');
    try {
        await client.connect();
        const document = req.body; // Get data from the POST request body
        const newUser = await hashUserPw(document);


        const findUser = await collectionName.findOne({ username: newUser.username });
        console.log('new user', findUser);
        if (findUser) {
            return res.status(409).json({ userexist: true, message: 'User already exists, please log in' });
        } else {
            const result = await collectionName.insertOne(newUser);
            return res.status(201).json({ message: "User Registerd Succesfully", insertId: result.insertedId });
        }



    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error inserting document" });
    } finally {
        await client.close();
    }
});





app.post('/api/login', async (req, res) => {
    //PULL THIS OUT
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);
    const dbName = 'expensify';
    const db = client.db(dbName);
    const collectionName = db.collection('users');
    ////////////////////////////////////////////////////////////////

    res.setHeader('Access-Control-Allow-Methods', 'POST');
    // Secret key for JWT (you can store this securely in environment variables)
    const JWT_SECRET = 'This is the secret key';


    try {
        await client.connect();
        const document = req.body; // Get data from the POST request body
        if (!document.username || !document.password) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const findUser = await collectionName.findOne({ username: document.username });
        const isPasswordValid = await bcrypt.compare(document.password, findUser.password);
        if (findUser && isPasswordValid) {

            // const token = jwt.sign(
            //     { userId: findUser._id, username: findUser.username },
            //     JWT_SECRET,
            //     { expiresIn: '1h' } // Token expires in 1 hour
            // );

            res.status(200).json({ message: "Login successful", isValid: true, userid: findUser._id });
        } else {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }


});

app.get('/api/getallexpenses', async (req, res) => {
    //remove this
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    try {
        await client.connect();

        const expenses = await dbconnect.find().toArray();

        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});


app.get('/api/expenses/:userId', async (req, res) => {
    //remove this
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    const userId = req.params.userId;
    console.log('userID', userId);
    try {
        await client.connect();

        const expenses = await dbconnect.find({ userid: userId }).toArray();

        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});

//SEND AS JSON GENIOUS
app.post('/api/addexpense', async (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    try {
        await client.connect();
        const document = req.body; // Get data from the POST request body

        const result = await dbconnect.insertOne(document);

        return res.status(201).json({ message: "Document inserted", result: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error inserting document" });
    } finally {
        await client.close();
    }
});

app.delete('/api/deleteexpense/:id', async (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'DELETE');
    try {
        await client.connect();
        const id = req.params.id;
        console.log(id);
        const result = await dbconnect.deleteOne({ _id: new ObjectId(id) });
        console.log(result);
        res.status(200).json({ message: "Document deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting document" });
    } finally {
        await client.close();
    }
});

app.patch('/api/editexpense', async (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'PATCH');
    try {
        await client.connect();
        const expense = req.body;
        const id = expense._id;
        delete expense._id;

        const result = await dbconnect.updateOne({ _id: new ObjectId(id) }, { $set: expense });
        res.status(200).json({ message: "Document updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating document" });
    } finally {
        await client.close();
    }
});

app.get('/api/getexpense/:id', async (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    try {
        await client.connect();
        const id = req.params.id;
        const expense = await dbconnect.findOne({ _id: new ObjectId(id) });
        res.status(200).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting document" });
    } finally {
        await client.close();
    }
});

app.get('/api/fuck', async (req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    try {
        const wtf = (n) => {
            let counter = n;

            return () => {
                return counter++
            }
        }

        const n = wtf(2)
        console.log(n)

        res.status(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting document" });
    } finally {
        console.log('cmonson')
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


