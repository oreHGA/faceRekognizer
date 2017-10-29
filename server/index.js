const fs = require('fs');
const cors = require('cors');
const express = require('express');
const Kairos = require('kairos-api');
const JSONStream = require('JSONStream');
const bodyParser = require('body-parser');
const multipart = require('connect-multiparty');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// API Configurations for KAIROS
let kairo_client = new Kairos('7d5eba0f', '3e151a18ef22f9d7f5edb625d9212b05');
// Multiparty middleware
const multipartMiddleware = multipart();

app.post('/upload', multipartMiddleware, function(req, res) {
    // get base64 version of image
    // then send that to Kairos for training
    let base64image = fs.readFileSync(req.files.image.path, 'base64');
    var params = {
        image: base64image,
        subject_id: req.body.name,
        gallery_name: 'rekognize',
    };
    console.log('sending to Kairos for training');
    kairo_client.enroll(params).then(function(result) {
        console.log('Image Attributes : \n' + result.body );
        return res.json({'status' : true });
    }).catch(function(err) { 
        console.log(err);
        return res.json({'status' : false});
    });
});

app.post('/verify', multipartMiddleware, function(req, res) {
    // get base64 version of image
    // then send that to Kairos for recognition
    let base64image = fs.readFileSync(req.files.image.path, 'base64');
    var params = {
        image: base64image,
        gallery_name: 'rekognize',
    };
    console.log('sending to Kairos for recognition');
    kairo_client.recognize(params).then(function(result) {
        console.log('Server responded with : \n' + result);
        return res.json(result.body);
    }).catch(function(err) { 
        console.log(err);
        return res.json({'status' : false});
    });  
});

app.listen(3128);
console.log('Listening on localhost:3128');