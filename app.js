const express = require("express");
const app = express();
const ejs = require("ejs");
var mysql = require("mysql");
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kingtemp204000@gmail.com", //EMAIL
    pass: "ShubhamGupta", //Password
  },
});

function helperForSendOTP(emaildb, otpdb,apiKey) {
  console.log("OTP:", otpdb);
  

  var mailOptions = {
    from: "kingtemp204000@gmail.com", //Your Email
    to: emaildb,
    subject: "OTP for URL shortener",
    text: `Your OTP for URL shortener is ${otpdb}. It will expire in 5 minutes. Your API key is  "${apiKey}".`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

var myCacheMap=new Map();

const server = require("http").Server(app);
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.set("view engine", "ejs");
// Databases
var con = mysql.createConnection({
  host: "localhost",
  user: "Ark", //DB
  password: "", //DB
  database: "URL",
});
con.connect(function (err) {
  if (err) {
    console.log('Error in Databse connection');
    throw err;
  }
  console.log("Connected Databse!");
});


//Just random Things Done To generate Graph
const tableData = [
  {
    url: "https://www.google.com",
    shortenedurl: "okgoogly123",
    creation_timestamp: "12-Jan-2022",
    num_of_redirections: 0,
  },
  {
    url: "https://www.google.com",
    shortenedurl: "okgoogly123",
    creation_timestamp: "12-Jan-2022",
    num_of_redirections: 0,
  },
  {
    url: "https://www.google.com",
    shortenedurl: "okgoogly123",
    creation_timestamp: "12-Jan-2022",
    num_of_redirections: 0,
  },
  {
    url: "https://www.google.com",
    shortenedurl: "okgoogly123",
    creation_timestamp: "12-Jan-2022",
    num_of_redirections: 0,
  },
  {
    url: "https://www.google.com",
    shortenedurl: "okgoogly123",
    creation_timestamp: "12-Jan-2022",
    num_of_redirections: 0,
  },
  {
    url: "https://www.google.com",
    shortenedurl: "okgoogly123",
    creation_timestamp: "12-Jan-2022",
    num_of_redirections: 0,
  },
];
const graphData = [];
for (let i = 0; i < 15; i++) {
  graphData.push({
    curr_date: `${i+1}-Jan-2022`,
    readcount: Math.random() * 60,
    writecount: Math.random() * 60,
  });
}

/***************************GET *******************/
app.get("/", (req, res) => {
  // console.log();
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  res.render("homepage", {
    shorturl: "tfuykfc",
    email: "yoyo@iitbhilai.ac.in",
    data: JSON.stringify(tableData),
    graphData: JSON.stringify(graphData),
  });
});

app.get("/:shorturl", (req, res) => {
  // console.log(req.params.shorturl);
  console.log(":params received");
  let data = " ";
  link = req.params.shorturl;
  if(link==undefined){
    res.send("Can't Read URL");
    return;
  }
  else{
  // res.send("Have to redirect");
  // return;
  
    if(myCacheMap.has(link)){
      // console.log();
      res.redirect(myCacheMap.get(link));
      // console.log("Hit from cache");
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
    else{
    
    // let Time = new Date();
      let sql = `SELECT url,ttl,creation_timestamp from urlMap where shortenedurl = "${link}" ; `;
      // console.log(sql);
      let query = con.query(sql, data, (err, result) => {
        if (err) {
          res.send("Something Went Wrong... Try Again...")
          console.log(err);
          // throw err;
          return ;
        }
        if(result.length==0){
          res.send("No URL for this ShortURL exits");
          return;
        }
        else{
        // console.log(result[0].url);
        // res.send("Done");
        //Expiry Logic
        // if((Time-result[0].creation_timestamp)>(result[0].ttl*24*60*60*1000)){
        //   res.send('Link Expired');
        //   return;
        // }
          res.redirect(result[0].url);
          halfMyCacheMap();
          myCacheMap.set(link,result[0].url);
        }
        let sqlupdate = `UPDATE urlMap SET num_of_redirections = num_of_redirections + 1 where  shortenedurl = "${link}";`;
        let query = con.query(sqlupdate, data, (err, result) => {
          if (err) {
            console.log("Increment failed in redirection counts");
            // throw err;
            return;
          }
        });
      });
    }
  }
});

/**************************POST *****************8*/
app.post("/nonpremiumurl", async (req, res) => {
  // console.log(req.body.urldata);
  let sql = "INSERT Into urlMap Set ?";
  let flag = true;

  let timestamp = new Date();
  let url1 = await makeid();
  let data = {
    url: req.body.urldata,
    shortenedurl: url1,
    creation_timestamp: timestamp,
  };

  let sqlsearch = `SELECT * from urlMap where  shortenedurl = "${url1}" ;`;
  let querysearch = con.query(sqlsearch, data, (err, result) => {
    if (err) {
      res.send("Something Went Wrong... Try Again...")
      console.log(err);
      // throw err;
      return ;
    }
    if (result.length == 0) {
      let query = con.query(sql, data, (err, result) => {
        if (err) {
          res.send("Something Went Wrong... Try Again...")
          console.log(err);
          // throw err;
          return ;
        }
        flag = false;
        // res.send(`Our1 shorthened Url is: s.u/${url1}` );
        res.render("shortURLResponse", { shorturl: url1 });
      });
    } else {
      let url1 = makeid();
      let data = { url: req.body.urldata, shortenedurl: url1 };
      let sqlsearch = `SELECT * from urlMap where  shortenedurl = "${url1}" ;`;
      let query = con.query(sql, data, (err, result) => {
        if (err) {
          res.send("Something Went Wrong... Try Again...")
          console.log(err);
          // throw err;
          return ;
        }
        // console.log(result);
        flag = false;
        res.render("shortURLResponse", { shorturl: url1 });
      });
    }
  });
});

app.post("/nonpremiumOTPcreate", (req, res) => {
  Email = req.body.jsonemail;
  // console.log(Email);
  res.send("Ok Sending to JS fetch");
  //Create OTP
  let Otp = Math.floor(Math.random() * 100000);
  let Time = new Date();
  //Store OTP and store in DB

  //Query DB if OTP exists for email
  // if expired overwrite it
  // if not expired then do nothing
  let sql = "INSERT Into emailOTP Set ?";
  let data = { email: Email, otp: Otp, time: Time };
  let sqlsearch = `SELECT * from emailOTP where  email = "${Email}" ;`;
  {
    let querysearch = con.query(sqlsearch, data, (err, result) => {
      if (err) {
        // res.send("Something Went Wrong... Try Again...")
        console.log(err);
        // throw err;
        return ;
      }
      // console.log(result,result.length);
      if (result.length > 0) {
        let sqldelete = `DELETE from emailOTP where  email = "${Email}" ;`;
        let querydelete = con.query(sqldelete, data, (err, result) => {
          if (err) {
            // res.send("Something Went Wrong... Try Again...")
            console.log(err);
            // throw err;
            return ;
          }
          // console.log(result);
        });
      }
      let query = con.query(sql, data, (err, result) => {
        if (err) {
          // res.send("Something Went Wrong... Try Again...")
          console.log(err);
          // throw err;
          return ;
        }

        //SEND OTP to user
        //via mailto function
        //Third party API for mail sending
        // email, otp
        // console.log("Calling Helper to send OTP to mail");
        let apiKey=makeAPIKey();
        let sqlAPISearch= `SELECT * from emailAPIKeys where  email = "${Email}" ;`;
        con.query(sqlAPISearch, data, (err, result) => {
          if (err) {
            // res.send("Something Went Wrong... Try Again...")
            console.log(err);
            // throw err;
            return ;
          }
          if(result.length>0){
            apiKey=result[0].apikey;
          }
          else{
            let sqlAPIinsert="INSERT Into emailAPIKeys Set ?";
            let data = { email: Email, apikey:apiKey };
            con.query(sqlAPIinsert, data, (err, result) => {
              if (err) {
                // res.send("Something Went Wrong... Try Again...")
                console.log(err);
                // throw err;
                return ;
              }
            });
          }
          helperForSendOTP(Email, Otp, apiKey);
        });
      });
    });
  }
});

app.post("/nonpremiumOTPverify", (req, res) => {
  // console.log("Receiveing OTP", req.body.otp, req.body.email);

  Email = req.body.email;
  
  let Time = new Date();
  let OTPgiven = req.body.otp;
  //Store OTP and store in DB
  let data = " ";
  if(Email==""||OTPgiven==""){
    res.send("No Email/OTP Found");
    return;
  }
  //Query DB if OTP exists for email
  // if expired overwrite it
  // if not expired then do nothing

  // let sqlforGraph = `select url, shortenedurl, creation_timestamp, num_of_redirections
  //       from urlMap
  //       where email = "${Email}"
  //       order by creation_timestamp DESC
  //       limit 15;`;

  let sqlforGraph = `select url, shortenedurl, creation_timestamp, num_of_redirections
        from urlMap
        where email = "${Email}"
        order by creation_timestamp DESC
        limit 15;`;

  
  let sqlsearch = `SELECT * from emailOTP where  email = "${Email}" ;`;
  {
    let querysearch = con.query(sqlsearch, data, (err, result) => {
      if (err) {
        res.send("Something Went Wrong... Try Again...")
        console.log(err);
        // throw err;
        return ;
      }
      // console.log(result,result.length);
      if (result.length > 0) {
        let timetaken = Time - result[0].time;
        timetaken /= 1000;
        // console.log(timetaken);
        if (result[0].otp == OTPgiven) {
          //Time verified
          if (timetaken <= 300) {
            // res.send('Found OTP correct...');
            con.query(sqlforGraph, data, (err, result) => {
              if (err) {
                res.send("Something Went Wrong... Try Again...")
                console.log(err);
                // throw err;
                return ;
              }
              // console.log(result);
              // res.render("premiumForm", { email: Email, data: result }); // dataGraph: result
              // console.log("Data",data);
              result = result.map((v) => Object.assign({}, v));
              res.render("premiumForm", {
                email: Email,
                data: JSON.stringify(result),
              }); // dataGraph: result
            });
          }
          // res.sendFile(__dirname+'/public/premiumSecondPage/index2.html');
          else res.send("OTP expired");
        } else res.send("OTP sent wrong");
        // res.sendFile(__dirname+'/public/premiumSecondPage/index2.html');
      } else {
        res.send("No OTP found");
      }
    });
  }
});

app.post("/test", (req, res) => {
  // console.log(req.body);
  res.send("Testing Route..");
});

app.post("/customurl", (req, res) => {
  let Url = req.body.urldata;
  let customurl = req.body.customurldata;
  let TTL = req.body.TTL;
  // console.log("Now",req.body.email);
  // console.log("OK",Url,customurl,TTL);
  let timestamp = new Date();
  if(Url=='undefined'||Url==''||customurl=='undefined'||customurl==''){
    res.send("No urldata given");
    return;
  }
  if(TTL==undefined||TTL>120||TTL==''){
    TTL=60;
    // console.log("Yeah");
    // return;
  }
  // res.send("Sorry123");
  // return;
  let sqlforGraph = `select url, shortenedurl, creation_timestamp, num_of_redirections
        from urlMap
        where email = "${Email}"
        order by creation_timestamp DESC
        limit 15;`;

  let sqlinsert = "INSERT Into urlMap Set ?";
  let datainsert = {
    url: Url,
    shortenedurl: customurl,
    ttl: TTL,
    creation_timestamp: timestamp,
    num_of_redirections: 0,
    email: req.body.email
  };

  let sqlsearch = `SELECT * from urlMap where  shortenedurl = "${customurl}" ;`;
  let datasearch = " ";
  let querysearch = con.query(sqlsearch, datainsert, (err, result) => {
    if (err) {
      res.send("Something Went Wrong... Try Again...")
      console.log(err);
      // throw err;
      return ;
    }
    if (result.length == 0) {
      let query = con.query(sqlinsert, datainsert, (err, result) => {
        if (err) {
          res.send("Something Went Wrong... Try Again...")
          console.log(err);
          // throw err;
          return ;
        }
        // console.log(result);
        // res.sendFile(__dirname+'/public/premiumThirdPage/index4.html');
        // res.send(`Our shorthened Url is: s.u/${customurl}` );

        data=" ";
        con.query(sqlforGraph, data, (err, result) => {
          if (err) {
            res.send("Something Went Wrong... Try Again...")
            console.log(err);
            // throw err;
            return ;
          }
          // console.log(result);
          // res.render("premiumShortURLResponse", { shorturl: customurl });
          result = result.map((v) => Object.assign({}, v));
          // console.log("result : ", result);
          res.render("premiumShortURLResponse", {
            shorturl: customurl,
            data: JSON.stringify(result),
          });
        });
      });
    } else {
      // console.log(result);
      res.send(
        `Try with other URL, This short Url already exits: s.u/${customurl}`
      );
    }
  });
});

/***********************Utilty Functions *******************/
server.listen(8000, (e) => {
  console.log(`listening on port 8000`);
});

async function makeid(/*length = 5*/) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  result =
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength)) +
    characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
}
async function makeAPIKey(/*length = 5*/) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for(let i=0;i<11;i++){
  result =
    characters.charAt(Math.floor(Math.random() * charactersLength)) ;
  }
  return result;
}

async function halfMyCacheMap(){
  if(myCacheMap.size>3000000){
    let cnt=0;
    //Can also Implement it
    // myCacheMap.clear();
    for (const [key, value] of myCacheMap.entries()) {
        myMap.delete(key);
        cnt++;
        if(cnt>=1500000)
          break;
    }
  }
}
