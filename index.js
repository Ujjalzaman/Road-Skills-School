const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const port = 5000;
// require('dotenv'.config);
// require.apply('dotenv').config;

//midleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('constructors'));
app.use(fileUpload());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.htf6k.mongodb.net/drivingSchool?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("drivingSchool").collection("appointment");
  const ConstructorstCollection = client.db("drivingSchool").collection("constructors");
  console.log("connected")

  app.post('/addAppointment', (req, res) => {
    const appointment = req.body;
    console.log(appointment)
    appointmentCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  app.post('/AddServices', (req, res) =>{
    const service = req.body;
    console.log(service);
  })

  app.post("/lessonByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    console.log(date.date);
    ConstructorstCollection.find({ email: email })
      .toArray((err, constructor) => {
        const filter = { date: date.date }
        if (constructor.length == 0) {
          filter.email = email;
        }
        appointmentCollection.find(filter)
          .toArray((err, documents) => {
            res.send(documents)
          })

        // res.send(documents)
      })
  })

  app.get('/lesson', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.get('/Alllesson', (req, res) => {
    appointmentCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });
  // addAConstructor

  app.post('/addAConstructor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    ConstructorstCollection.insertOne({ name, email, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })



  app.get('/constructors', (req, res) => {
    ConstructorstCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.post('/isConstructor', (req, res) => {
    const email = req.body.email;
    ConstructorstCollection.find({ email: email })
      .toArray((err, doctors) => {
        res.send(doctors.length > 0);
      })
  })



});

app.get('/', (req, res) => {
  res.send("hello from db it's working working")
})
app.listen(process.env.PORT || port);