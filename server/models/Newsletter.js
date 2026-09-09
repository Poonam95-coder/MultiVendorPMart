const mongoose=require('mongoose'); module.exports=mongoose.model('Newsletter',new mongoose.Schema({email:{type:String,unique:true,lowercase:true,required:true}},{timestamps:true}));
