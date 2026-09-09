const r=require('express').Router(),c=require('../controllers/newsletterController');r.post('/',c.subscribe);module.exports=r;
