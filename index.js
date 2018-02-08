const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./config/database.js');
const path =  require('path');
const authenticationRoutes = require('./routes/authentication');
const blogRoutes = require('./routes/blogs');

const bodyParser = require('body-parser');
const cors = require('cors');

const port = process.env.PORT || 3000;

mongoose.connect(config.uri, (err) => {

    if(err)
        console.log('Cound not connect to MongoDB Database: ', err);
    else
        console.log('Connected Successfully to MongoDB Database: ' + config.uri);
});

//MIDDLEWARE
app.use(express.static(__dirname + "/public"));

app.use(cors({
    //specifying the development server's port
    origin: "http://localhost:4200"
    //this part is not required when we run our app on a live server

}));

//make sure that this middleware occurs before the routes
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use('/authentication', authenticationRoutes);//prefix to access our RESTFul API
app.use('/blogs', blogRoutes);//prefix to access our RESTFul API

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname + "/public/index.html"));
});

//notice that we haven't used "function" keyword and replaced with lambda expression style

var myServer = app.listen(port, () => {
	var host = myServer.address().address;  
  	var port = myServer.address().port;  
  	console.log('Server listening at http://%s:%s', host, port); 
});