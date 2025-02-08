const express = require('express')
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000
const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send({ mess: 'local server is running' })
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xihi8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db('eventDB').collection('users')
    const eventCollection = client.db('eventDB').collection('events')


    app.post('/jwt', async (req, res) => {
      const data = req.body;
      const token = jwt.sign(data, process.env.Secure_Web_Token, { expiresIn: '7h' })
      res.send({ token })
    })
    
    // user related APIs
    app.post('/users', async (req, res) => {
      const data = req.body;
      const result = await userCollection.insertOne(data);
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    app.put('/users', async (req, res) => {
      const data = req.body;
      const query = { email: data.email }
      const option = { upsert: true };
      const updateDoc = {
        $set: data
      }
      const result = await userCollection.updateOne(query, updateDoc, option)
      res.send(result)
    })

    // guest login
    app.post('/guest-login', async (req, res) => {
      const guestUser = {
        email: 'guest_' + Date.now() + '@gmail.com',
        role: 'guest',
      };
      const token = jwt.sign(guestUser, process.env.Secure_Web_Token, { expiresIn: '7h' })
      res.send({ token })
    })

    // Events related APIs

    app.post('/events', async (req, res) => {
      const data = req.body;
      const result = await eventCollection.insertOne(data);
      res.send(result)
    })

    app.get('/events', async (req, res) => {
      const data = await eventCollection.find().toArray();
      res.send(data)
    })

    app.get('/events/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await eventCollection.findOne(query);
      res.send(result)
    })
    app.patch('/events/:id', async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: req.body

      }
      const result = await eventCollection.updateOne(query, updateDoc);
      res.send(result)
    })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, (req, res) => {
  console.log(`server is running on port ${port}`)
})
