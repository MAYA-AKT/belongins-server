const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 3000;
const app = express();




// middleware 
app.use(express.json());
app.use(cors());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ngg3kc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    await client.connect();

    const db = client.db("belongings").collection('items');
    const recoverdb = client.db("belongings").collection('recover');

    app.post('/add-items', async (req, res) => {
      const newItems = { ...req.body, createdAt: new Date() };
      console.log('new items', newItems);

      const items = await db.insertOne(newItems);
      res.status(200).send({ message: 'item successfully inserted', items });
    });

    // get 6 Latest Find & Lost Items by the most recent date.
    app.get('/get-items', async (req, res) => {
      const items = await db
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.status(200).send(items);
    });

    app.get('/item-details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await db.findOne(query);
      res.send(result)

    });

    app.get('/all-items', async (req, res) => {
      const items = await db.
        find().
        sort({ _id: -1 }).
        toArray();
      res.send(items);
    });

    app.get('/my-items/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const result = await db.find(filter).toArray();
      res.status(200).send(result);
    });

    app.put('/update-item/:id', async (req, res) => {
      const id = req.params.id;
      const updateItem = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: updateItem
      }
      const result = await db.updateOne(filter, updateDoc, options);
      res.send(result);

    })

    app.delete('/delete-item/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await db.deleteOne(query);
      res.status(200).send(result);

    });

    app.post('/recoveries-item', async (req, res) => {
      const recoverItem = req.body;
      
      const item = await db.findOne({_id:new ObjectId(recoverItem.itemId)});
      if(item.status === 'recoverd'){
        return res.status(400).json({ message: "Item already recovered!" });
      }

      const saveDb = await recoverdb.insertOne(recoverItem);
      await db.updateOne({_id:new ObjectId(recoverItem.itemId)},{
         $set:{
          status:'recoverd'
         }
      });
      res.send({message: 'Recovery saved and item updated!' ,saveDb});



      
    })

























    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Belongins are Found');
});

app.listen(port, () => {
  console.log(`server is running on port : ${port}`);

})