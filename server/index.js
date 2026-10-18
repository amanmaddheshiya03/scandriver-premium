import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();
const PORT=process.env.PORT||4000;
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'change-this-admin-password';
const DB=path.join(__dirname,'data','db.json');
app.use(cors());app.use(express.json({limit:'100kb'}));
function readDB(){try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return {bookings:[],drivers:[]}}}
function writeDB(db){fs.writeFileSync(DB,JSON.stringify(db,null,2))}
function clean(v,max=300){return String(v??'').trim().slice(0,max)}
function required(body,fields){const missing=fields.filter(f=>!clean(body[f]));return missing}
function admin(req,res,next){const key=req.headers['x-admin-password'];if(!key||key!==ADMIN_PASSWORD)return res.status(401).json({error:'Admin password is incorrect.'});next()}
app.get('/api/health',(req,res)=>res.json({ok:true,service:'ScanDriver API',time:new Date().toISOString()}));
app.get('/api/services',(req,res)=>res.json({services:[
{id:'hourly',name:'Hourly driver',description:'Driver for errands, appointments and everyday plans.'},
{id:'daily',name:'Full-day driver',description:'Professional driving support for your day.'},
{id:'weekly',name:'Weekly driver',description:'Flexible driving support for the week.'},
{id:'monthly',name:'Monthly driver',description:'Long-term driver arrangement for work or family.'},
{id:'outstation',name:'Outstation driver',description:'Driver support for city-to-city journeys.'},
{id:'airport',name:'Airport transfer',description:'Driver support for airport pickup or drop.'},
{id:'corporate',name:'Corporate driver',description:'Professional driver support for business travel.'},
{id:'event',name:'Event & wedding',description:'Driver support for events and special occasions.'}
]}));
app.post('/api/bookings',(req,res)=>{
 const b=req.body||{},missing=required(b,['name','phone','service','pickup','date','time']);
 if(missing.length)return res.status(400).json({error:`Please complete: ${missing.join(', ')}.`});
 if(clean(b.phone).replace(/\D/g,'').length<8)return res.status(400).json({error:'Enter a valid contact number.'});
 const db=readDB(),booking={id:crypto.randomUUID(),reference:'SD-'+Date.now().toString().slice(-7),name:clean(b.name,100),phone:clean(b.phone,30),service:clean(b.service,60),trip:clean(b.trip,40),vehicle:clean(b.vehicle,40),pickup:clean(b.pickup,300),drop:clean(b.drop,300),date:clean(b.date,20),time:clean(b.time,20),duration:clean(b.duration,80),notes:clean(b.notes,1000),status:'New',createdAt:new Date().toISOString()};
 db.bookings.unshift(booking);writeDB(db);res.status(201).json({message:'Enquiry saved successfully.',booking:{id:booking.id,reference:booking.reference,status:booking.status}});
});
app.post('/api/drivers',(req,res)=>{
 const b=req.body||{},missing=required(b,['name','phone','city','experience']);
 if(missing.length)return res.status(400).json({error:`Please complete: ${missing.join(', ')}.`});
 const db=readDB(),driver={id:crypto.randomUUID(),reference:'DRV-'+Date.now().toString().slice(-6),name:clean(b.name,100),phone:clean(b.phone,30),city:clean(b.city,100),experience:clean(b.experience,50),licence:clean(b.licence,60),availability:clean(b.availability,60),createdAt:new Date().toISOString(),status:'New'};
 db.drivers.unshift(driver);writeDB(db);res.status(201).json({message:'Driver application saved.',reference:driver.reference});
});
app.post('/api/admin/login',(req,res)=>{if(clean(req.body?.password,200)!==ADMIN_PASSWORD)return res.status(401).json({error:'Incorrect password.'});res.json({ok:true,message:'Admin session accepted for this browser session.'})});
app.get('/api/admin/summary',admin,(req,res)=>{const db=readDB();res.json({bookings:db.bookings,drivers:db.drivers,counts:{totalBookings:db.bookings.length,newBookings:db.bookings.filter(b=>b.status==='New').length,confirmed:db.bookings.filter(b=>b.status==='Confirmed').length,drivers:db.drivers.length}})});
app.patch('/api/admin/bookings/:id',admin,(req,res)=>{const db=readDB(),b=db.bookings.find(x=>x.id===req.params.id),status=clean(req.body?.status,30);if(!b)return res.status(404).json({error:'Booking not found.'});if(!['New','Contacted','Confirmed','Completed','Cancelled'].includes(status))return res.status(400).json({error:'Invalid status.'});b.status=status;b.updatedAt=new Date().toISOString();writeDB(db);res.json({message:'Booking status updated.',booking:b})});
app.delete('/api/admin/bookings/:id',admin,(req,res)=>{const db=readDB(),old=db.bookings.length;db.bookings=db.bookings.filter(x=>x.id!==req.params.id);if(old===db.bookings.length)return res.status(404).json({error:'Booking not found.'});writeDB(db);res.json({message:'Booking removed.'})});
app.use((req,res)=>res.status(404).json({error:'API route not found.'}));
app.listen(PORT,()=>console.log(`ScanDriver API running at http://localhost:${PORT}`));