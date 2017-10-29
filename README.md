# Facial Recognition App with Vue

## Setting Up
Before continuing, this app requires node $ npm installed on your machine. Once you have confirmed your node installation,

Change directory into the server directory of the app
```
$ cd faceRekognizer/server
```
Install npm packages
```
$ npm install
```
Set up http server To render our static html files, you could use a simple http server like http-server. To install run the command
```
$ npm install http-server -g
```

## Running things

To run the app, in the root directory of our app we start our backend server with this command
```
$ node server
```
You'll get a response like
```
Listening on localhost:3128
This means your backend server is running on http://localhost:3128/
```
You also need to run your http-server by using the command
```
$ http-server
```
Once that's done, you get a response like
```
Starting up http-server, serving ./public
Available on:
  http://127.0.0.1:8080
  http://172.20.10.9:8080
```

Now you can navigate to http://127.0.0.1:8080/ to see the rekognizer at work 😇