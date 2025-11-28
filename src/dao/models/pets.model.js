import mongoose from "mongoose";
const schema = new mongoose.Schema({
 name:String,
 specie:String,
 age:Number
});
export const PetsModel = mongoose.model("Pets", schema);