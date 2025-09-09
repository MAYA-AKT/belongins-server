const { MongoClient, ServerApiVersion } = require('mongodb');
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
      
    app.post('/add-items',async(req,res)=>{
      const newItems = req.body;
      const items = await db.insertOne(newItems);
       res.status(200).send({message:'item successfully inserted',items});
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