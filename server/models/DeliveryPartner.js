const mongoose=require('mongoose'); const bcrypt=require('bcryptjs');
const schema=new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true},password:{type:String,required:true,select:false},phone:{type:String,required:true},avatar:{type:String,default:''},vehicleType:{type:String,enum:['bike','scooter','car'],default:'bike'},isActive:{type:Boolean,default:true}},{timestamps:true});
schema.pre('save',async function(next){if(!this.isModified('password')) return next();this.password=await bcrypt.hash(this.password,10);next();}); schema.methods.comparePassword=function(p){return bcrypt.compare(p,this.password)};
module.exports=mongoose.model('DeliveryPartner',schema);
