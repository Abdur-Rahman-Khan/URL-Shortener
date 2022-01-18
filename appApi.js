const express = require("express");
const app = express();
var mysql = require("mysql");



var myCacheMap = new Map();

// const server = require("http").Server(app);
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.use(express.json());


// Databases
var con = mysql.createConnection({
  host: "localhost",
  user: "Ark", //DB
  password: "Ahmad.11", //DB
  database: "URL",
});
con.connect(function (err) {
  if (err) {
    console.log('Error in Databse connection');
    throw err;
  }
  console.log("Connected Databse!");
});


//Create Short URL

app.post('/api/createshorten/:apiKey', async function (req, res) {
  // create user in req.body
  
let apiKey=req.params.apiKey;
let sqlapi = `SELECT email from emailAPIKeys where apikey = "${apiKey}" ; `;
let dataapi=" ";
con.query(sqlapi, dataapi, (err, result) => {
    if (err) {
      console.log("Something Went Wrong... Try Again...");
      res.send("Please Try again");
    }
    else if(result.length==0){
      console.log("API Key Invalid");
      res.send("API key not valid");
    }
    else{
      Email=result[0].email;
      let sql = "INSERT Into urlMap Set ?";
      let url1 =  makeid();
      let longurl = req.body.urldata;
      if(longurl==undefined){
        res.send("Provide URL"+longurl);
        return;
      }
      let timestamp = new Date();
      let data = {
        email: Email,
        url: longurl,
        shortenedurl: url1,
        creation_timestamp: timestamp
      };
      let query = con.query(sql, data, (err, result) => {
        if (err) {
          res.send("Something Went Wrong... Try Again...")
          // console.log(err);
          return;
        }
        //   res.render("shortURLResponse", { shorturl: url1 });
        res.json({ shorturl: url1 });
      });
    }   
});
});
// Create Custom Short URL
app.post('/api/createcustomshorten/:apiKey', async function (req, res) {
  // create user in req.body
  
let apiKey=req.params.apiKey;
let sqlapi = `SELECT email from emailAPIKeys where apikey = "${apiKey}" ; `;
let dataapi=" ";
con.query(sqlapi, dataapi, (err, result) => {
    if (err) {
      console.log("Something Went Wrong... Try Again...");
      res.send("Please Try again");
    }
    else if(result.length==0){
      console.log("API Key Invalid");
      res.send("API key not valid");
    }
    else{
      Email=result[0].email;
      
      let Url = req.body.longurldata;
    let customurl = req.body.customurldata;
    let TTL = req.body.ttl;
    // console.log("Now",req.body.email);
    // console.log("OK",Url,customurl,TTL);
    let timestamp = new Date();
    if (Url == 'undefined' || Url == '' || customurl == 'undefined' || customurl == '') {
      res.send("No urldata given");
      return;
    }
    if (TTL == undefined || TTL > 120 || TTL == '') {
      TTL = 60;
      // console.log("Yeah");
      // return;
    }
    let sqlinsert = "INSERT Into urlMap Set ?";
    let datainsert = {
      url: Url,
      shortenedurl: customurl,
      ttl: TTL,
      creation_timestamp: timestamp,
      num_of_redirections: 0,
      email: Email
    };


      let sqlsearch = `SELECT * from urlMap where  shortenedurl = "${customurl}" ;`;
      let datasearch = " ";
      con.query(sqlsearch, datasearch, (err, result) => {
        if (err) {
          res.send("Something Went Wrong... Try Again...")
          console.log(err);
          return;
        }
        if (result.length == 0) {
          let query = con.query(sqlinsert, datainsert, (err, result) => {
            if (err) {
              res.send("Something Went Wrong... Try Again...")
              console.log(err);
              return;
            }
            data = " ";
            //   res.render("premiumShortURLResponse", { shorturl: customurl });
            res.json({ shorturl: customurl });
          });
        } else {
          res.send(`Try with other URL, This short Url already exits`);
        }
      });
    }   
});
 
});

// Read Normal Short URL
app.post('/api/readshorten/:apiKey', async function (req, res) {
  // create user in req.body

let apiKey=req.params.apiKey;
let sqlapi = `SELECT email from emailAPIKeys where apikey = "${apiKey}" ; `;
let dataapi=" ";
con.query(sqlapi, dataapi, (err, result) => {
    if (err) {
      console.log("Something Went Wrong... Try Again...");
      res.send("Please Try again");
    }
    else if(result.length==0){
      console.log("API Key Invalid");
      res.send("API key not valid");
    }
    else{
      Email=result[0].email;
      let data = " ";


//     //**********************************To Upadate this LINk************************* /
    link = req.body.shorturl;
    // res.send(link);
    // return;
    if (link == undefined) {
      res.send("Can't Read URL");
      return;
    }

    //Using Cache
    if (myCacheMap.has(link)) {
      // console.log();
      // res.redirect(myCacheMap.get(link));
      res.json({ longURL: myCacheMap.get(link) });
      console.log("Hit from cache");
      //Update redirection count
      let sqlupdate = `UPDATE urlMap SET num_of_redirections = num_of_redirections + 1 where  shortenedurl = "${link}";`;
      let query = con.query(sqlupdate, data, (err, result) => {
        if (err) {
          console.log("Increment failed in redirection counts");
          // throw err;
          return;
        }
      });
      return;
    }
    else {
      //Db query for link of shorturl
      let sql = `SELECT url,ttl,creation_timestamp from urlMap where shortenedurl = "${link}" ; `;
      con.query(sql, data, (err, result) => {
        if (err) {
          res.send("Something Went Wrong... Try Again...")
          return;
        }
        if (result.length == 0) {
          res.send("No URL for this ShortURL exits");
          return;
        }
        else {
          res.json({ longURL: result[0].url });
          halfMyCacheMap();
          myCacheMap.set(link, result[0].url);
          let sqlupdate = `UPDATE urlMap SET num_of_redirections = num_of_redirections + 1 where  shortenedurl = "${link}";`;
          let query = con.query(sqlupdate, data, (err, result) => {
            if (err) {
              //   console.log("Increment failed in redirection counts");
              return;
            }
          });
        }
      });
    }
    }   
});
});

//Delete URL
app.post('/api/deleteurl/:apiKey', async function (req, res) {
  // create user in req.body
  
let apiKey=req.params.apiKey;
let sqlapi = `SELECT email from emailAPIKeys where apikey = "${apiKey}" ; `;
let dataapi=" ";
con.query(sqlapi, dataapi, (err, result) => {
    if (err) {
      console.log("Something Went Wrong... Try Again...");
      res.send("Please Try again");
    }
    else if(result.length==0){
      console.log("API Key Invalid");
      res.send("API key not valid");
    }
    else{
      Email=result[0].email;
      let data = " ";

      //**********************************To Upadate this LINk************************* /
      link = req.body.shorturl;
      if (link == undefined) {
        res.send("Can't Read URL");
        return;
      }
      else {
        //check user has right over URl
  
  
        let sql = `SELECT email,url,ttl,creation_timestamp from urlMap where shortenedurl = "${link}" ; `;
        con.query(sql, data, (err, result) => {
          if (err) {
            res.send("Something Went Wrong... Try Again...")
            return;
          }
          if (result.length == 0) {
            res.send("No URL for this ShortURL exits");
            return;
          }
          // res.json({longURL:result[0].url});
          // halfMyCacheMap();
          // myCacheMap.set(link,result[0].url);
          if (result[0].email == Email) {
            let sqldel = `DELETE from urlMap  where  shortenedurl = "${link}";`;
            let query = con.query(sqldel, data, (err, result) => {
              if (err) {
                //   console.log("Increment failed in redirection counts");
                return;
              }
              res.send("Delete Successful");
            });
          }
          else {
            res.send("Not enough permission");
            return;
          }
  
        });
        //Using Cache
        if (myCacheMap.has(link)) {
          myCacheMap.delete(link);
        }
      }
    }   
});
});

// //Give Link of short URL

/*
var express = require('express')
var bodyParser = require('body-parser')
 
var app = express()
 
const server = require("http").Server(app);
// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
 
// POST /login gets urlencoded bodies
app.post('/login', urlencodedParser, function (req, res) {
    // console.log("Hello");
    // console.log("Helli",res.send('welcome,1 '));
    const obj = JSON.parse(JSON.stringify(req.body)); // req.body = [Object: null prototype] { title: 'product' }
    // temp=typeof(obj)
    console.log(obj); // { title: 'product' }
    // res.send('welcome,1 ')
    // sleep(1);
    // console.log(req.body.username,rollno);
    res.json({a:1});
});
 
// POST /api/users gets JSON bodies
app.post('/api/users', jsonParser, function (req, res) {
  // create user in req.body
});

app.post('/api/:apiKey', jsonParser, function (req, res) {
    // create user in req.body
  });

// app.post('/test/:name/:rollnum=11',(req,res)=>{
//     console.log(req.);
//     res.send("Ok");
// });
*/
//UTILITY FUNCtion

app.listen(7000, (e) => {
  console.log(`listening on cloud API port 7000`);
});

 function makeid(/*length = 5*/) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  result =
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
}

// let myPromise = new Promise(function(resolve) {
//   resolve("I love You !!");
// });
async function validateAPIkey(apiKey) {
  let sql = `SELECT * from urlMap where shortenedurl = "${apiKey}" ; `;
  let data = " ";
  let query = con.query(sql, data, (err, result) => {
    if (err) {
      console.log("Something Went Wrong... Try Again...");
      // new Promise(function(resolve) {
      //   resolve("F");
      // });
      return "F";
    }
    if (result.length == 0) {
      console.log("API Key Invalid");
      // new Promise(function(resolve) {
      //   resolve("F");
      // });
      return "F";
    }
    else {
      return result[0].email;
    }
    // new Promise(function(resolve) {
    //   resolve(result[0].email);
    // });
  });
}


function halfMyCacheMap() {
  if (myCacheMap.size > 3000000) {
    let cnt = 0;
    //Can also Implement it
    myCacheMap.clear();
    //   for (const [key, value] of myCacheMap.entries()) {
    //       myMap.delete(key);
    //       cnt++;
    //       if(cnt>=1500000)
    //         break;
    //   }
  }
}

