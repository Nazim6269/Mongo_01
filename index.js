const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3001;

//use middleware function
app.use(express.json());
//for receiving form data
app.use(express.urlencoded({ extended: true }));

// mongoose.connect('mongodb://127.0.0.1:27017/test',{useNewUrlParser: true,useUnifiedTopology: true})
//     .then(() => console.log('meow'))
//     .catch((error) => console.log(error)
//     )

// const mongoose = require('mongoose')
// mongoose.connect('mongodb://localhost:27017/testProducts').then(() => console.log('db is connected')).catch((error) => {
//     console.log(error);
//     process.exit(1);
// })

//connection to mongodb
const usingAwait = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
  try {
    console.log("db is connected");
  } catch (error) {
    console.log("db is not connectd");
    console.log(error.message);
    process.exit(1);
  }
};

//creating a schema
const createSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    dafault: Date.now,
  },
});

//creating a model
const createModel = mongoose.model("products", createSchema);

//handle get request or read data
app.get("/", (req, res) => {
  res.send("I am home Page");
});

app.get("/product", async (req, res) => {
  try {
    const productInfo = await createModel.find().limit(2); //because of using limit() show only two documents
    if (productInfo) {
      res.status(200).send(productInfo);
    } else {
      res.status(404).send({ message: "info not found" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//specific document based on id
app.get("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const productInfo = await createModel.find({ _id: id });

    if (productInfo) {
      res.status(200).send({
        message: "return single product info",
        data: productInfo,
      });
    } else {
      res.status(404).send({ message: "info not found" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//handle post/create request
app.post("/product", async (req, res) => {
  try {
    //get data from body
    const title = req.body.title;
    const price = req.body.price;

    //store data in database for single documents
    const newProduct = new createModel({
      title: title,
      price: price,
    });
    const resMessage = await newProduct.save();

    //store data in database for multiple documents
    // const resMessage = await createModel.insertMany([{
    //     title: "bugatti",
    //     price: "1230"
    // }, {
    //     title: "bmw",
    //     price: "230"
    // }])
    res.status(201).send(resMessage);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//handle delete request
app.delete("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const resMessage = await createModel.deleteOne({ _id: id });
    if (resMessage) {
      res.status(200).send({
        success: true,
        message: "has been deleted",
        data: resMessage,
      });
    } else {
      res.status(404).send({
        message: "not deleted",
      });
    }
  } catch (error) {
    res.status(505).send({ message: error });
  }
});

//update or put data
app.put("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const title = req.body.title;
    const updatedData = await createModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
        },
      },
      {
        new: true, //to see update data
      }
    ); //findByIdAndUpdate is used to see update data
    if (updatedData) {
      res.status(200).send({
        success: true,
        message: "data has been updated",
        data: updatedData,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "data not deleted",
      });
    }
  } catch (error) {
    res.status(505).send({ message: error });
  }
});

//server is listening
app.listen(PORT, async () => {
  console.log(`server is running at http://localhost:${PORT}`);
  await usingAwait();
});
