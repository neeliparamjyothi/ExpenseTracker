const express=require("express");
const mysql=require("mysql2");
const app=express();
const port=8080;
const path=require("path");
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname,"public")));
const { v4: uuidv4 } = require('uuid');
var connection=mysql.createConnection({
  host:'127.0.0.1',
  user:'root',
  password:'Jyothi@123',
  database:'delta_app'
});

connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connected!:)');
  }
});
let paths={
    tracker:"https://m.media-amazon.com/images/I/61JfO8-6-FL._AC_UF1000,1000_QL80_.jpg",
    delete:"https://t4.ftcdn.net/jpg/03/46/38/39/360_F_346383913_JQecl2DhpHy2YakDz1t3h0Tk3Ov8hikq.jpg"
    }
app.get("/",(req,res)=>{
    res.render("home.ejs",{paths});
})
app.get("/expenses",(req,res)=>{
  let id=uuidv4();
  let username=req.query.user;
let q=`insert into users(id,name) values('${username}','${id}')`;
 try{
  connection.query(q,(err,result)=>{
    if(err) throw err;
        res.render("expense.ejs");
  });
}catch(err){
  console.log("not found");
  res.send("some error in DB");
 }
})
app.post("/userdata",(req,res)=>{
  let id=uuidv4();
  let amount=req.body.amount;
  let transaction=req.body.transaction;
  let date=req.body.date;
let q=`insert into data values(${amount},'${transaction}','${date}','${id}')`;
try{
  connection.query(q,(err,result)=>{
     if(err) throw err;
       res.render("expense.ejs");
  });
}catch(err){
  console.log("some error");
  res.send("some error in db");
}
})
app.get("/users/:id/edit",(req,res)=>{
  let {id}=req.params;
  let q=`select * from data where id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
       if(err) throw err;
       console.log(result);
       let ans=result[0];
       console.log(ans.id)
        res.render("edit.ejs",{ans});
    });
  }catch(err){
    console.log("some error");
    res.send("some error in db");
  }
  
})
app.patch("/users/:id",(req,res)=>{
  let {id}=req.params;
  const amount=req.body.amount;
  const transaction=req.body.transaction;
  const date=req.body.date;
   console.log(id);
  let q=`update data set amount=${amount},type='${transaction}',date='${date}' where id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
       if(err) throw err;
        res.redirect("/result");
    });
  }catch(err){
    console.log("some error");
    res.send("some error in db");
  }
});
app.get("/show",(req,res)=>{
  let q=`select * from data`;
  try{
    connection.query(q,(err,result)=>{
       if(err) throw err;
       let data=result;
       let q1=`SELECT type,SUM(amount) AS total_amount FROM data GROUP BY type;`
      try{
         connection.query(q1,(err,result)=>{
       if(err) throw err;
       let income = 0;
       let expense = 0;
       
       result.forEach(row => {
         if (row.type === 'income') {
           income = row.total_amount;
         } else if (row.type === 'expense') {
           expense = row.total_amount;
         }
       });
       let balance=income-expense;
         res.render("show.ejs",{income,expense,balance,data});
       });
       }catch(err){
        console.log("some error");
        res.send("some error in db");
      }
    })}catch(err){
    console.log("some error");
    res.send("some error in db");
  }
})
app.get("/users/:id/delete",(req,res)=>{
  let {id}=req.params;
  let q=`delete from data where id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
       if(err) throw err;
        res.redirect("/result");
    });
  }catch(err){
    console.log("some error");
    res.send("some error in db");
  }
})
app.get("/result",(req,res)=>{
  let q=`SELECT type,SUM(amount) AS total_amount FROM data GROUP BY type;`
  try{
    connection.query(q,(err,result)=>{
       if(err) throw err;
       let income = 0;
       let expense = 0;
       
       result.forEach(row => {
         if (row.type === 'income') {
           income = row.total_amount;
         } else if (row.type === 'expense') {
           expense = row.total_amount;
         }
       });
       
       let q1=`select * from data`;
       try{
         connection.query(q1,(err,result)=>{
            if(err) throw err;
            let data=result;
            let balance=income-expense;
              res.render("show.ejs",{expense,income,balance,data});
         });
       }catch(err){
         console.log("some error");
         res.send("some error in db");
       }
    });
  }catch(err){
    console.log("some error");
    res.send("some error in db");
  }
})
app.listen(port,()=>{
    console.log("app is listening in port 8080");
})
