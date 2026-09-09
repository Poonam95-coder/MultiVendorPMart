const mongoose=require('mongoose'); const bcrypt=require('bcryptjs');
const AddressSchema=new mongoose.Schema({label:String,address:String,city:String,state:String,zip:String,isDefault:{type:Boolean,default:false},lat:{type:Number,default:0},lng:{type:Number,default:0}},{_id:true});
const UserSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,required:true,select:false},phone:{type:String,default:''},avatar:{type:String,default:''},addresses:{type:[AddressSchema],default:[]},isAdmin:{type:Boolean,default:false}},{timestamps:true});
UserSchema.pre('save',async function(next){if(!this.isModified('password')) return next(); this.password=await bcrypt.hash(this.password,10); next();});
UserSchema.methods.comparePassword=function(p){return bcrypt.compare(p,this.password);};
module.exports=mongoose.model('User',UserSchema);
