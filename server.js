const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const port = 5000;

// Connection URI
const uri =
  "mongodb+srv://evelyn2:G4DfrCQTB3BjV8WzRBVD@cluster0.m69rxzs.mongodb.net/";

// Database Name
const dbName = "skincare";

// Collection Name
const collectionName = "skincare";

async function fetchDataFromMongoDB(keyword) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (keyword) {
      const query = {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { brand: { $regex: keyword, $options: "i" } }, 
        ],
      };

      return await db.collection(collectionName).find(query).toArray();
    }

    const cursor = collection.find({});
    const results = await cursor.toArray();

    return results;
  } catch (err) {
    console.error("Error occurred while fetching data:", err);
    throw err;
  } finally {
    await client.close();
  }
}

// Allow all origins
app.use(cors());

app.get("/skincare", async (req, res) => {
  if (!req.query.keyword) {
    try {
      const skincareData = await fetchDataFromMongoDB();
      res.json(skincareData);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch skincare data" });
    }
  } else {
    const skincareDataFiltered = await fetchDataFromMongoDB(req.query.keyword);
    // Send the result as JSON
    res.json(skincareDataFiltered);

  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
