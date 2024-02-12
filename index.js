import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import fetch from "node-fetch";
//import session from "express-session";
import axios from "axios";
import http from "https";
import { State } from "country-state-city";
//import { Vonage } from "@vonage/server-sdk";
import { City } from "country-state-city";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://aadityatyagi975:" + process.env.ATLAS_PASS + "@cluster0.n76ryam.mongodb.net/emergitrack", {
  useNewUrlParser: true,
  //useUnifiedTopology: true,
  //useCreateIndex: true,
});

const db = mongoose.connection;

// Event listeners
db.on('connected', () => {
  console.log('MongoDB connected successfully');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
const driverUserSchema=new mongoose.Schema({
  name:String,
  email:String
});
const RegisteredHospital=new mongoose.Schema({
  hospitalName:String,
  hospitalAddress:String,
  password:String,
  patient:[{
    patientName:Sring,
    patientNum:String,
    patientAddress:String,
    patientStatus:String,
    ambuTrack:String
  }],
  driver:[{
    driverName:String,
    driverNum:String,
    driverId:String,
    driverStatus:String,
    patientAssign:String
  }]
});
const driverUser=mongoose.model("driverUser",driverUserSchema);
const hospitallist=mongoose.model("hospitallist",RegisteredHospital);
app.get("/",(req,res)=>{
  var allState=(State.getStatesOfCountry("IN"));
  var allCities={};
  for(var i=0;i<allState.length;i++){
    var city=City.getCitiesOfState("IN",allState[i].isoCode);
    allCities[allState[i].name]=city;
  }
  var allCitiesString=JSON.stringify(allCities);
  res.render("driver-home",{allState:allState,allCitiesString:allCitiesString});
});
var latitude;
var longitude;
app.post("/",async(req,res)=>{
  try {
    var state=req.body.state;
    var city=req.body.city;
    var apiUrl="https://nominatim.openstreetmap.org/search";
    var params={
      q:city+", "+state,
      format:"json",
      limit:1
    };
    var queryString=Object.keys(params).map(function(key){
      return encodeURIComponent(key)+"="+encodeURIComponent(params[key]);
    }).join("&");
    var url=apiUrl+"?"+queryString;
    var response=await fetch(url);
    const data=await response.json();
    if(data.length>0){
      latitude=data[0].lat;
      longitude=data[0].lon;
    }else{
      console.log("Coordinates not found for the specified location");
    }
    res.redirect("/hospital");
  } catch (error) {
    console.log('An error occured: '+error);
    
  }
});
app.get("/hospital",(req,res)=>{
  const options={
    method:'GET',
    hostname:'api.foursquare.com',
    port:null,
    path:'/v3/places/search?ll='+latitude+'%2C'+longitude+'&radius=100000&categories=15000&limit=50',
    headers:{
      accept:'application/json',
      Authorization:process.env.FOURSQUARE_AUTH
    }
  };
  const apiRequest=http.request(options,function(apiResponse){
    let responseBody='';
    apiResponse.on('data',function(chunk){
      responseBody+=chunk;
    });
    apiResponse.on('end', function () {
      const data = JSON.parse(responseBody);
      const hospitals = data['results'];
      const filteredHospitals = hospitals.map(hospital => {
        return {
          name: hospital['name'],
          address : hospital['location']['formatted_address']
        };
      });
      res.render("hospital",{hospital:filteredHospitals});
    });
  });

  apiRequest.end();
});

