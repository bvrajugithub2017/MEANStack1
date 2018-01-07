const express = require('express');
const app = express();
const mongoose = require('mongoose');
const config = require('./config/database.js');
const path =  require('path');

mongoose.connect(config.uri, (err) => {

    if(err)
        console.log('Cound not connect to MongoDB Database: ', err);
    else
        console.log('Connected Successfully to MongoDB Database: ' + config.db);
});

app.use(express.static(__dirname + "/raju-angular-client/dist"));

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname + "/raju-angular-client/dist/index.html"));
});

//notice that we haven't used "function" keyword and replaced with lambda expression style

var myServer = app.listen(3000, () => {
	var host = myServer.address().address;  
  	var port = myServer.address().port;  
  	console.log('Server listening at http://%s:%s', host, port); 
});