const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const toys = "./toys.json";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dowmgti.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db("miniMotors").collection("allToys");

    app.get("/allToys", async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {
        projection: {
          category: 1,
          name: 1,
          price: 1,
          img: 1,
          available_quantity: 1,
          subcategory: 1,
          rating: 1,
          sellerName: 1,
          sellerEmail: 1,
          toy_details: 1,
          seller_details: 1,
        },
      };

      const result = await toysCollection.findOne(query, options);
      res.send(result);
    });

    app.get("/allToy", async (req, res) => {
      let query = {};
      const prices = req.query.price;

      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }

      const options = {
        sort: { price: prices },
      };

      const result = await toysCollection.find(query, options).toArray();
      res.send(result);
    });

    app.get("/filter/:text", async (req, res) => {
      let query = {};
      if (req.query.text == "Monster" || req.query.text == "Police" || req.query.text == "Classic") {
        const result = await toysCollection.find(query, { subcategory: req.query.text }).toArray();
        return res.send(result);
      }
    });

    app.delete("/allToy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/allToy/:id", async (req, res) => {
      // const id = req.params.id;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.put("/allToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toys = {
        $set: {
          available_quantity: updatedToy.available_quantity,
          price: updatedToy.price,
          toy_details: updatedToy.toy_details,
        },
      };
      const result = await toysCollection.updateOne(filter, toys, options);
      res.send(result);
    });

    app.post("/allToys", async (req, res) => {
      const allToys = req.body;
      const result = await toysCollection.insertOne(allToys);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("mini motors are running...");
});

app.listen(port, () => {
  console.log(`mini motors are running on port : ${port}`);
});
