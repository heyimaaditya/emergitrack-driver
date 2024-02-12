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

