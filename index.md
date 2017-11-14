#  Introduction
Face Detection and Recognition have become an increasingly popular topic these days. It’s really a great advantage for a machine to know which user is in a picture. The applications of facial recognition in our world today are endless. From Face iD unlock to identifying criminals on the run using real-time analysis of video feed.

# What we’ll build 

In this article, we’ll build a demo app with Kairos service in which **users can upload different images of labeled faces and also try to recognize a person from an uploaded face**

![Training](https://d2mxuefqeaa7sj.cloudfront.net/s_FBC56310FE2CC617EEC9D695418C2A6BF4844F321C2C32A65F5B7D3FBBA8A9C3_1509317428917_Screen+Shot+2017-10-29+at+10.46.21+PM.png)

![Recognition](https://d2mxuefqeaa7sj.cloudfront.net/s_FBC56310FE2CC617EEC9D695418C2A6BF4844F321C2C32A65F5B7D3FBBA8A9C3_1509317476665_Screen+Shot+2017-10-29+at+10.49.10+PM.png)

## What is Kairos 

[Kairos](https://kairos.com) is a leading AI engine provider which provides ‘Human Analytics’ features like Face Detection, Face Identification, Face Verification etc. More [features](https://kairos.com/features) here. These features can be used to gather unique, real-time insights about users as they interact with your product.

## Getting Started 

The front-end part of the application is built with a Progressive Javascript Framework [Vue.js](https://vuejs.org/) and a node server on the backend which handles the interaction with Kairos API. 

### Dependencies

Before we begin you need some things set up on your local machine

- [Node](https://nodejs.org/) installed
- Node Package Manager ([npm](https://www.npmjs.com/) ) installed

Once you confirm your installation you can continue.

**Step 1: ** Create a Kairos Account

[Sign up](https://developer.kairos.com/signup) for a free account.

![](https://d2mxuefqeaa7sj.cloudfront.net/s_FBC56310FE2CC617EEC9D695418C2A6BF4844F321C2C32A65F5B7D3FBBA8A9C3_1509320636470_Screen+Shot+2017-10-29+at+11.43.31+PM.png)


After signing up you’ll be redirected to the dashboard with your credentials


![](https://d2mxuefqeaa7sj.cloudfront.net/s_FBC56310FE2CC617EEC9D695418C2A6BF4844F321C2C32A65F5B7D3FBBA8A9C3_1509320906421_Screen+Shot+2017-10-29+at+11.43.12+PM.png)


PS: Note your `App ID` and  `Key` ( you’ll need them later )

**Step 2:** Set Up A Node Server

Initialize a `package.json` file :

```bash
npm init
```

Install necessary modules :

```bash
npm install fs express connect-multiparty kairos-api cors body-parser --save
```

fs -  we need this to convert our image into a `base64`  mode for attachment
express - we need this to enable our API routes
connect-multiparty -  needed to parse HTTP requests with content-type multipart/form-data
kairos-api - Node SDK for Kairos
cors - we need this to enable cors 
body-parser -  we need this to attach the request body on express req object

Create an `index.js` file in your root directory and require the installed dependencies :

```js
    const fs = require('fs');
    const cors = require('cors');
    const express = require('express');
    const Kairos = require('kairos-api');
    const bodyParser = require('body-parser');
    const multipart = require('connect-multiparty');
    
    const app = express();
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    const multipartMiddleware = multipart();
```
Next, configure your Kairos client,


    // API Configurations for KAIROS
    let kairo_client = new Kairos('APP_ID', 'APP_KEY');

Replace `APP_ID` and `APP_KEY` with the details from your dashboard

Add the route for uploading images to Kairos for training. Let's call it `/upload`

```js
    app.post('/upload', multipartMiddleware, function(req, res) {
        // get base64 version of image and send that to Kairos for training
        let base64image = fs.readFileSync(req.files.image.path, 'base64');
        var params = {
            image: base64image,
            subject_id: req.body.name,
            gallery_name: 'rekognize',
        };
        console.log('sending to Kairos for training');
        kairos_client.enroll(params).then(function(result) {
            console.log('Image Attributes : \n' + result.body );
            return res.json({'status' : true });
        }).catch(function(err) { 
            console.log(err);
            return res.json({'status' : false});
        });
    });
```
Add the route for recognizing a person from an uploaded face. Let's call it `/verify`

```js
    app.post('/verify', multipartMiddleware, function(req, res) {
        // get base64 version of image and send that to Kairos for recognition
        let base64image = fs.readFileSync(req.files.image.path, 'base64');
        var params = {
            image: base64image,
            gallery_name: 'rekognize',
        };
        console.log('sending to Kairos for recognition');
        kairos_client.recognize(params).then(function(result) {
            console.log('Server responded with : \n' + result);
            return res.json(result.body);
        }).catch(function(err) { 
            console.log(err);
            return res.json({'status' : false});
        });  
    });
```

Once the user makes a `POST` request to the `/upload` route,  the route gets the image file from the HTTP Request, converts it to a `base64` version and then uploads it to Kairos with the `identifier`  for the image and the `gallery` you want the image to be in. You get a JSON Response telling you whether the upload was successful or not. 

Also, when the user makes a `POST` request to the `/verify` route, the route gets the image file from the HTTP Request, converts it to a `base64` version and then sends it to Kairos with the `gallery` name for it to check if there’s anyone with a similar face to the face being uploaded in the picture.
Kairos then sends a JSON Response with the result of the operation and we take further action on based on the response.


**Step 3:** Build the Frontend

To build the frontend, we would be using Vue.js as already mentioned earlier. 

Install the Vue CLI :

```bash
    npm install -g vue-cli
```

Create a simple Vue project using the Vue CLI tool installed earlier:

```bash
    vue init simple facerecognizer
```

Inside the `facerecognizer` directory, create an index.html file and add the following code to it

```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>👱 👩 Rekognizer</title>
        <script src="https://unpkg.com/vue"></script>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">    
    </head>
    <body class="container">
        <div class="wrapper">
            <div class="app-title">
                <p>👱 👩 Rekognizer</p>
            </div>
            <ul class="nav nav-pills nav-fill mb-3" id="pills-tab" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="pills-upload-tab" data-toggle="pill" href="#pills-upload" role="tab" aria-controls="pills-upload" aria-selected="true">Upload</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="pills-verify-tab" data-toggle="pill" href="#pills-verify" role="tab" aria-controls="pills-verify" aria-selected="false">Rekognize</a>
                </li>
            </ul>
            <div class="tab-content" id="pills-tabContent">
                <div class="tab-pane fade show active" id="pills-upload" role="tabpanel" aria-labelledby="pills-upload-tab">
                    <!-- core part for image upload to add image to kairo gallery -->
                    <div class="row">
                        <div class="col-md-6">
                            <form enctype="multipart/form-data" @submit.prevent="onSubmit">
                                <div class="form-group">
                                    <label for="">Name:</label>
                                    <input type="text" required class="form-control" placeholder="eg Ore" name="subject_name" v-model="model.name">
                                </div>
                                <div class="form-group">
                                    <label for="">File:</label>
                                    <input type="file" class="form-control" accept="image/*" name="image" v-on:change="upload($event.target.files)">
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-primary" >Upload</button>
                                    {{ loading }}
                                    {{ uploadStatus }}
                                </div>
                            </form>
                        </div>
                        <div class="col-md-6">
                            <p style="text-align:center;">Image Preview</p>
                            <div class="col-md-6" style="text-align:center;">
                                <img id="originalface" class="img-responsive" alt="" width="200" height="200">
                                <p style="text-align:center;">{{ model.name }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="pills-verify" role="tabpanel" aria-labelledby="pills-verify-tab">
                    <!-- core part for image upload to verify -->
                    <div class="row">
                        <div class="col-md-6">
                            <form enctype="multipart/form-data" @submit.prevent="onSubmit">
                                
                                <div class="form-group">
                                    <label for="">Upload Picture of Person to Recognise:</label>
                                    <input type="file" class="form-control" accept="image/*" name="image" v-on:change="upload($event.target.files)">
                                </div>
                                
                                <div class="form-group">
                                    <button class="btn btn-primary" >Rekognize</button>
                                    <span class="fa fa-spin fa-spinner" id="verify_spinner" style="display:none;" aria-hidden="true"></span>                            
                                    {{ loading }}
                                </div>
                            </form>
                        </div>
                        
                        <div class="col-md-6">
                            <p style="text-align:center;">Image Preview</p>
                            <div class="col-md-6" style="text-align:center;">
                                <img id="face_preview2" class="img-responsive" alt="" width="200" height="200">
                                <p style="text-align:center;">{{ resultStatus }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .wrapper{
                padding-top: 20px;
            }
            .app-title{
                text-align: center;
                margin-bottom : 10px;
            }
        </style>
        <script>
            var upload = new Vue({
                el: '#pills-upload',
                data: function() {
                    return {
                        model: {
                            name: '',
                            image: null,
                            item: ''
                        },
                        loading: '',
                        uploadStatus: '',
                    }
                },
                methods: {
                    upload: function(files) {
                        this.model.image = files[0];
                        this.uploadStatus = '';
                        this.showPreview(files[0]);
                    },
                    showPreview: function(file) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            document.getElementById("originalface").src = e.target.result;
                        };
                        // read the image file as a data URL.
                        reader.readAsDataURL(file);
                    },
                    onSubmit: function() {
                        // Assemble form data
                        const formData = new FormData()
                        formData.append('image', this.model.image);
                        formData.append('name', this.model.name);
                        this.loading = "Uploading....Please be patient."
                        // Post to server
                        axios.post('http://localhost:3128/upload', formData)
                        .then(res => {
                            // Post a status message saying the upload complete
                            this.loading = '';
                            this.uploadStatus = 'Image has been uploaded successfully 🤓';
                        })
                    }
                }
            })
            var verify = new Vue({
                el: '#pills-verify',
                data: function(){
                    return{
                        model: {
                            image : null,
                        },
                        loading: '',
                        resultStatus: '',
                        resultDetails: '',
                    }
                },
                methods: {
                    upload: function(files) {
                        this.model.image = files[0];
                        this.resultStatus = '';
                        this.showPreview(files[0]);
                    },
                    showPreview: function(file) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            document.getElementById("face_preview2").src = e.target.result;
                        };
                        // read the image file as a data URL.
                        reader.readAsDataURL(file);
                    },
                    onSubmit: function() {
                        // Assemble form data
                        const formData = new FormData()
                        formData.append('image', this.model.image);
                        formData.append('name', this.model.name);
                        this.loading = "Attempting to recognize you..please wait."
                        // Post to server
                        axios.post('http://localhost:3128/verify', formData)
                        .then(res => {
                            // Post a status message saying the upload complete
                            this.loading = '';
                            if( !res.data.Errors){
                                if(res.data.images[0].transaction.status != "success"){
                                    this.resultStatus = '😕 don\'t know who you are! Try uploading a picture of yourself first in upload section';
                                }else{
                                    this.resultStatus = 'What\'s good ' + res.data.images[0].transaction.subject_id + '! 🤓';
                                }
                                this.resultDetails = res.data.images[0].transaction;
                            }else{
                                this.resultStatus = '😕 don\'t know who you are! Try uploading a picture first in upload section';
                            }
                        })
                    }
                }
            })
        </script>
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>  
    </body>
    </html>
```
Now you can run the app.

Let us examine the code and understand what is going on here :

```html
    <form enctype="multipart/form-data" @submit.prevent="onSubmit">
        <div class="form-group">
            <label for="">Name:</label>
            <input type="text" required class="form-control" placeholder="eg Ore" name="subject_name" v-model="model.name">
        </div>
        <div class="form-group">
            <label for="">File:</label>
            <input type="file" class="form-control" accept="image/*" name="image" v-on:change="upload($event.target.files)">
        </div>
        <div class="form-group">
            <button class="btn btn-primary" >Upload</button>
            {{ loading }}
            {{ uploadStatus }}
        </div>
    </form>
```
We bind the upload form to an upload event handler. Once a user selects a file, there is a  `showPreview` method called in the Vue instance below is invoked which shows a thumbnail preview of the image about to be uploaded to Kairos.


![Training](https://d2mxuefqeaa7sj.cloudfront.net/s_FBC56310FE2CC617EEC9D695418C2A6BF4844F321C2C32A65F5B7D3FBBA8A9C3_1509317428917_Screen+Shot+2017-10-29+at+10.46.21+PM.png)


Now let's examine the Vue instance the upload form is linked to

```js
    var upload = new Vue({
        el: '#pills-upload',
        data: function() {
            return {
                model: {
                    name: '',
                    image: null,
                    item: ''
                },
                loading: '',
                uploadStatus: '',
            }
        },
        methods: {
            upload: function(files) {
                this.model.image = files[0];
                this.uploadStatus = '';
                this.showPreview(files[0]);
            },
            showPreview: function(file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById("face_preview1").src = e.target.result;
                };
                // read the image file as a data URL.
                reader.readAsDataURL(file);
            },
            onSubmit: function() {
                // Assemble form data
                const formData = new FormData()
                formData.append('image', this.model.image);
                formData.append('name', this.model.name);
                this.loading = "Uploading image....Please be patient."
                // Post to server
                axios.post('http://localhost:3128/upload', formData)
                .then(res => {
                    // Post a status message
                    this.loading = '';
                    if( res.status == true){
                        this.uploadStatus = 'Image has been uploaded successfully 🤓';
                    }else{
                        this.uploadStatus = '😕 there was an issue with the upload, try again';
                    }
                })
            }
        }
    })
```
When the form is submitted, it calls the `onSubmit` function in our Vue method. The `onSubmit` method then makes a post request to the backend and returns data back to the frontend.

For the `recognition` part :

```html
    <form enctype="multipart/form-data" @submit.prevent="onSubmit">                       
        <div class="form-group">
            <label for="">Upload Picture of Person to Recognise:</label>
            <input type="file" class="form-control" accept="image/*" name="image" v-on:change="upload($event.target.files)">
        </div>
        
        <div class="form-group">
            <button class="btn btn-primary" >Rekognize</button>
            <span class="fa fa-spin fa-spinner" id="verify_spinner" style="display:none;" aria-hidden="true"></span>                            
            {{ loading }}
        </div>
    </form>
```

This is quite similar to the upload part, we bind the form to an event handler which makes the post request to the backend server that sends details to Kairos and gets JSON Response


![Recognition](https://d2mxuefqeaa7sj.cloudfront.net/s_FBC56310FE2CC617EEC9D695418C2A6BF4844F321C2C32A65F5B7D3FBBA8A9C3_1509317476665_Screen+Shot+2017-10-29+at+10.49.10+PM.png)


Vue instance the `recognise` form is linked to :

```js
    var verify = new Vue({
        el: '#pills-verify',
        data: function(){
            return{
                model: {
                    image : null,
                },
                loading: '',
                resultStatus: '',
                resultDetails: '',
            }
        },
        methods: {
            upload: function(files) {
                this.model.image = files[0];
                this.resultStatus = '';
                this.showPreview(files[0]);
            },
            showPreview: function(file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    document.getElementById("face_preview2").src = e.target.result;
                };
                // read the image file as a data URL.
                reader.readAsDataURL(file);
            },
            onSubmit: function() {
                // Assemble form data
                const formData = new FormData()
                formData.append('image', this.model.image);
                formData.append('name', this.model.name);
                this.loading = "Attempting to recognize you..please wait."
                // Post to server
                axios.post('http://localhost:3128/verify', formData)
                .then(res => {
                    // Post a status message saying the upload complete
                    this.loading = '';
                    if( !res.data.Errors){
                        if(res.data.images[0].transaction.status != "success"){
                            this.resultStatus = '😕 don\'t know who you are! Try uploading a picture of yourself first in upload section';
                        }else{
                            this.resultStatus = 'What\'s good ' + res.data.images[0].transaction.subject_id + '! 🤓';
                        }
                        this.resultDetails = res.data.images[0].transaction;
                    }else{
                        this.resultStatus = '😕 don\'t know who you are! Try uploading a picture first in upload section';
                    }
                })
            }
        }
    })
```

The backend server returns the response from Kairos. We all know it’s not every-time we Kairos will be able to successfully identify the face. In the JSON response, we check if there was an error i.e if Kairos couldn’t find a matching face and we let the user know. If a matching face is successfully found, we send a welcome message.


![Result when face could not be recognized](https://d2mxuefqeaa7sj.cloudfront.net/s_FBC56310FE2CC617EEC9D695418C2A6BF4844F321C2C32A65F5B7D3FBBA8A9C3_1509382793405_Screen+Shot+2017-10-30+at+4.59.35+PM.png)


Feel free to check out the [source code](https://github.com/orehga/faceRekognizer) here.

# Conclusion

We have seen how to make a Simple Face Recognition App. The applications of this are quite numerous, you could add face authentication as one of the ways to authenticate your users or you could also just use it to know who is interacting with your product to provide personalized experiences for your users.

Feel free to leverage the free account given to you by Kairos to give your #NextBillionUsers a great experience!

### More Resources

[Overlay Glasses/Masks on Avatars with Vue.js and Cloudinary](https://scotch.io/tutorials/overlay-glassesmasks-on-avatars-with-vuejs-and-cloudinary)