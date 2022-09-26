const express = require("express");
const https = require('https');
// const mysql = require('mysql');
// const formidable = require('formidable');
const uniqid = require("uniqid");
var path = require('path');
const client = require("mailchimp-marketing");

const Web3 = require("web3");
const axios = require("axios");
var aes256 = require("aes256");
const cors = require('cors');
// var nodemailer = require('nodemailer');
//const stripe = require('stripe')('sk_test_...');
const { initDriver, getdriver } = require("./neo4j");
const fs = require("fs");
const { newKitFromWeb3 }=  require('@celo/contractkit');
const abiUserContract = require("./abi/abiUserContract.json");
const abiERC20 = require("./abi/abiERC20.json");
const activistManagement = require("./utils/activistManagement");
const DAO = require("./utils/DAO");
var neo4j = require('neo4j-driver');
const multer = require("multer")
const app = express();  
const stripeRoutes = require("./stripe/routes/payement.routes");
const groupeRoutes = require("./groupe/routes/route");
const activistRoutes = require("./activist/router/router");
const customerRoutes = require("./customer/router/router");
var Datastore = require("nedb");
const { createCustomer,addPrice,createProduct, createAccount } = require("./stripe/utils/utils");
const findEmail = require("./utils/findEmail");
var db = {};

app.use(cors());
app.use(express.json());
const port = process.env.PORT;
const { CeloProvider, CeloWallet, StaticCeloProvider } = require("@celo-tools/celo-ethers-wrapper");

const { ethers, Wallet } = require("ethers");
const { Console } = require("console");
const ProviderNetwork = "https://alfajores-forno.celo-testnet.org";
const contractAddress = "0x79c0A6Fa247216bF70EEc3E85E554Ee6cD04Fa66";
const privKey = "713b86cbd9689ccc2bd09bf4ca9030e4e3b4e484d7161b05dc45239ebdcaa0eb";
const Neo4jPass = '87h0u74+-*/';
db.coins = new Datastore("./utils/_db/coins.db");


db.coins.loadDatabase();

app.use(express.json());




const BalanceOf = async (contractAddress,user) => {
	try {
	
	var provider = new StaticCeloProvider(ProviderNetwork);
  await provider.ready;
  const account = new CeloWallet(privKey, provider);
	
	
  


		
	
	
	const UsersContract = new ethers.Contract(contractAddress,
    abiERC20
	,account);

	console.log("****ok*****");
	
	const tx = await UsersContract.balanceOf(
    user
    ) ;
	

	

   return {res: ethers.utils.formatUnits(tx, "ether")
  }
	} catch (err) {
    console.log(err);
   return {error:err};
  }

};


const sendEmailmailchimp = async (email) => {

	

    client.setConfig({
      apiKey: "843285995a8d1ec6313120717df05f3a-us8",
      server: "us8"
    });
    
    const run = async () => {
      const response = await client.automations.getWorkflowEmailSubscriberQueue(
        "8670455",
        email
      );
      return response;
    };
    run();
  
	
};




const sendEmail = async (Email) => {
    Code = Math.floor(Math.random() * 10000);
    db.coins.insert({Email:Email,Code:Code}, function (err, newDocs) {});
    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true,
      auth: {
          user: 'hatem@darblockchain.io',
          pass: 'Darblockchain.io'
      }
  });
  
  // send email
  const A = await transporter.sendMail({
      from: 'hatem@darblockchain.io',
      to: Email,
      subject: "Validation Code",
      text: Code.toString()
  });
  console.log(A);
  return("ok");
};



const Inscription = async (Phone,URL,Wallet) => {
	try {
	 
	var provider = new StaticCeloProvider(ProviderNetwork);
  await provider.ready;
  const account = new CeloWallet(privKey, provider);
	
	
  


		
	
	
	const UsersContract = new ethers.Contract(contractAddress,
    abiUserContract
	,account);

	console.log("****ok*****");
	
	const tx = await UsersContract.addUtilisateur(
"" ,"" , "" ,Phone ,URL,Wallet
    ) ;
	

	
console.log("trans");
console.log(`Transaction hash:${tx.hash}`);

   //const reciept =await tx.wait();
   return {transaction:tx.hash}
	} catch (err) {
    console.log(err);
   return {error:err};
  }

};

const AESEncyption = (key , plainText) => {
 
    const encrypted = aes256.encrypt(key, plainText);
    return (encrypted);
  };

  const AESDecryption =  (key , encrypted) => {
 
  var decrypted = aes256.decrypt(key, encrypted);

    return (decrypted);
  };

const pinJSONToIPFS = async (pinataApiKey, pinataSecretApiKey, JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
        .then(function (response) {
            console.log(response.data.IpfsHash);
            return response.data;
        })
        .catch(function (error) {
            //handle error here
        });
};
app.use(stripeRoutes);
app.use("/circle",groupeRoutes);
app.use("/mobelizer",activistRoutes);
app.use("/supporter",customerRoutes);
app.post("/TestDecrypt", async (req, res) => {
  console.log(AESDecryption("0033143485548+-*/","WiKHiqsSUNJqFSg/5jCnDDEY064fCdgF"));
});

app.post("/createTag",async(req,res)=>{
  const name = req.body.name;
  await initDriver();
  var driver = getdriver();
  var session = driver.session({
    database: 'Hero'
  })
  const tag = await session.run("match(t:Tag{Name:$name})return t",{
    name
  })
  if(tag.records.length>0){
    return res.status(400).json("Tag alerady exists !");
  }
  await session.run("merge(t:Tag{Name:$name})",{
    name
  });
  return res.status(200).json("Tag created successfully !");

})
app.post("/createLocation",async(req,res)=>{
  const name = req.body.name;
  await initDriver();
  var driver = getdriver();
  var session = driver.session({
    database: 'Hero'
  })
  const tag = await session.run("match(l:Location{Name:$name})return l",{
    name
  })
  if(tag.records.length>0){
    return res.status(400).json("Location alerady exists !");
  }
  await session.run("merge(l:Location{Name:$name})",{
    name
  });
  return res.status(200).json("Location created successfully !");

})
app.post("/CreateWallet", async (req, res) => {
  // var web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com'));
  // A=web3.eth.accounts.create("87h0u74+-*/");
  // var A=web3.eth.accounts.wallet.load("87h0u74+-*/");

  // res.end( JSON.stringify(A));
  const phoneNumber = req.body.Email;
  let password = req.body.password;
  const googleId =  req.body.googleId;
  const imageUrl=req.body.imageUrl;
  const  name=req.body.name;
  const lastname=req.body.lastname;
  const HeroId = req.body.HeroId;
  console.log(name,lastname);
  let search=await SearchUser(phoneNumber);
  if (search == 0)
  {
    if (googleId != "")
    {
      password=googleId;
    }
   
    console.log("ok");
  const providerMumbai = new ethers.providers.JsonRpcProvider(
    ProviderNetwork
    );
 
  const pureWallet = ethers.Wallet.createRandom();
  
  const wallet = new Wallet(pureWallet, providerMumbai);
  console.log(password+"+"+phoneNumber);
  console.log(AESEncyption(password+"+"+phoneNumber,pureWallet._mnemonic().phrase));
  //const temp = await pinJSONToIPFS("98ec2b41b43bef139ebc","4d443842873fb35c1f2866312fcad6d397a4172a8f08527e3714e35c989365c2",{
   // mnomonic: AESEncyption(password+"+-*/"+phoneNumber,pureWallet._mnemonic().phrase),
   // address: AESEncyption(password+"+-*/"+phoneNumber,pureWallet.address),
   // autre: AESEncyption(password+"+-*/"+phoneNumber,pureWallet._signingKey().privateKey),
   // password:AESEncyption(phoneNumber+"+-*/",password)
 // });
   let MNEMONIC= AESEncyption(password+"+-*/"+phoneNumber,pureWallet._mnemonic().phrase);
   let WalletAddress = pureWallet.address;
   let Password = AESEncyption(phoneNumber+"+-*/"+password,password);
   let privKey = AESEncyption(password+"+-*/"+phoneNumber,pureWallet._signingKey().privateKey);
  const {customerId,state}=await InsertUserDB(phoneNumber,WalletAddress,privKey,MNEMONIC,Password,googleId,imageUrl,name,lastname,HeroId);
  console.log("************");


  const toblock = await Inscription(phoneNumber,"",pureWallet.address);
  return res.status(200).json({
    mnomonic: pureWallet._mnemonic().phrase,
    address: pureWallet.address,
    autre: pureWallet._signingKey(),
    customerId:customerId,
    imageUrl:imageUrl,
    name:name,
    lastname:lastname
  });
  
  }
  else{
    console.log(search);

    return res.status(200).json({
      mnomonic: search.Mnemoni,
      address: search.WalletAddress,
      autre: search.privKey,
      customerId:search.CustomerId,
      imageUrl:imageUrl,
      name:name,
      lastname:lastname
    });
  }
  
});

app.post("/userInfo", async(req, res) => {
  console.log("ok");
  const Email = req.body.Email;
  const s =await getUserInfo(Email);

    res.end(JSON.stringify(s));
});
app.get("/getFile:file", async (req, response) => {
    let file = req.params.file.replace(":","");
    var filePath = './uploads/' + file;
    

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }
    console.log("./uploads/"+file);
    fs.readFile("./uploads/"+file, function(error, content) {
      console.log(content);
      if (error) {
          if(error.code == 'ENOENT'){
              fs.readFile('./404.html', function(error, content) {
                  response.writeHead(200, { 'Content-Type': contentType });
                  response.end(content, 'utf-8');
              });
          }
          else {
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
              response.end(); 
          }
      }
      else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
      }
  });
})
app.post("/UpdateUserInfo", async (req, res) => {
  // var web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com'));
  // A=web3.eth.accounts.create("87h0u74+-*/");
  // var A=web3.eth.accounts.wallet.load("87h0u74+-*/");

  // res.end( JSON.stringify(A));
  const Email = req.body.Email;
  let newEmail = req.body.newEmail;
  
  const  name=req.body.name;
  const HeroId=req.body.HeroId;
  const CountryTolive=req.body.CountryTolive;

  const {state}=await UpdateUserDB(Email,newEmail,name,HeroId,CountryTolive,url);
  console.log("************");
  res.send(
    {
      Email:newEmail,name:name,HeroId:HeroId,CountryTolive:CountryTolive,url:url    }
  );

  
  
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      // Uploads is the Upload_folder_name
      cb(null, "./uploads")
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now()+"-" +file.originalname )
  }
})

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 100 * 1000 * 1000;
var upload = multer({ 
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb){
  
      // Set the filetypes, it is optional
      var filetypes = /jpeg|jpg|png|avi|mp4|m4v/;
      var mimetype = filetypes.test(file.mimetype);

      var extname = filetypes.test(path.extname(
                  file.originalname).toLowerCase());
      
      if (mimetype && extname) {
          return cb(null, true);
      }
      if (file == null)
      {
        return cb(null, true);
      }
    
      cb("Error: File upload only supports the "
              + "following filetypes - " + filetypes);
    } 

// mypic is the name of file attribute
})


app.post("/uploadProfilePhoto",upload.single("myFile"), async(req, res) =>{

    
  const obj = JSON.parse(JSON.stringify(req.body)); 
  
  console.log("*********");
 
  console.log(obj);
  let Email = obj.Email;
  let url;
  if (res.req.file == undefined)
  {
    url = obj.url;
  }
  else
  {
  url = res.req.file.filename;
  }
  let newEmail = obj.newEmail;
  let name=obj.name;
  let HeroId = obj.HeroId;
  let CountryTolive = obj.CountryTolive;
   const {state}=await UpdateUserDB(Email,newEmail,name,HeroId,CountryTolive,url);
  console.log("************");
  res.send(
    {
      Email:newEmail,name:name,HeroId:HeroId,CountryTolive:CountryTolive,url:url   }
  );
  
});


app.post("/uploadUpdatesFile", upload.single("myFile"), async(req, res) =>{

    
  const obj = JSON.parse(JSON.stringify(req.body)); 
      console.log(res);
      let groupe = obj.circle.replace(":","");
      let url = res.req.file.filename;
      let desc = obj.Description;
      let typeMedia=obj.typeMedia;
      let mobilizer = obj.mobilizer;
    const A = await addMedia(groupe,url,desc,groupe+" "+mobilizer+" "+Date.now(),typeMedia,mobilizer);
    console.log(A);
    
    res.send(
      {
        groupe:groupe,url:url,desc:desc,typeMedia:typeMedia,mobilizer:mobilizer,time:Date.now(),id:A,likes:0
      }
    );
  
});

const addMedia = async(groupe,url,desc,title,typeMedia,mobilizer)=>{
  const id = uniqid();
  await initDriver();
 var driver = getdriver();
 var session = driver.session({
         database: 'Hero',
         defaultAccessMode: neo4j.session.WRITE
 })
 await session.run("merge(p:Post{id:$id,title:$title,description:$desc,media:$url,type:$typeMedia,time:$time,mobilizer:$mobilizer,likes:$likes,dislikes:$dislikes,comments:$comments}) with p as p match(g:Groupe{Name:$groupe}) merge(g)-[:CREATED]->(p)",{
     title,
     url:url || "",
     groupe,
     desc,
     id,
     time:Date.now(),
     typeMedia:typeMedia||"",
     mobilizer:mobilizer,
     likes:neo4j.int(0),
     dislikes:neo4j.int(0),
     comments:neo4j.int(0)
 });
 return (id);
 console.log("Media added successfully !");
}

app.post("/CreateWalletMobelizer", async (req, res) => {
  // var web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com'));
  // A=web3.eth.accounts.create("87h0u74+-*/");
  // var A=web3.eth.accounts.wallet.load("87h0u74+-*/");

  // res.end( JSON.stringify(A));
  const {email,phoneNumber,password,country,grName}=req.body;
  
  await initDriver();
  var driver = getdriver();
  var session = driver.session({
    database: 'Hero'
    })
  var Emailexistens = await findEmail(email);
  console.log(Emailexistens)
  if(Emailexistens>0){
    return res.status(400).json("Email already exists !")
  }
  //var account = await createAccount("US",email,1,1,1901,"mahersi","male","222222222","youssef","0000000000","new york","usa","usa","address_full_match",12345,"state","0000");
  /*if(!account){
    return res.status(500).send("stripe account creation failed !")
  }*/
  const providerMumbai = new ethers.providers.JsonRpcProvider(
    ProviderNetwork
  );

  const pureWallet = ethers.Wallet.createRandom();
  
  const wallet = new Wallet(pureWallet, providerMumbai);
  console.log(password+"+"+phoneNumber);
  console.log(AESEncyption(password+"+"+phoneNumber,pureWallet._mnemonic().phrase));
  /*
  const temp = await pinJSONToIPFS("98ec2b41b43bef139ebc","4d443842873fb35c1f2866312fcad6d397a4172a8f08527e3714e35c989365c2",{
    mnomonic: AESEncyption(password+"+-"+phoneNumber,pureWallet._mnemonic().phrase),
    address: AESEncyption(password+"+-"+phoneNumber,pureWallet.address),
    autre: AESEncyption(password+"+-"+phoneNumber,pureWallet._signingKey().privateKey),
    password:AESEncyption(phoneNumber+"+-",password)
  });*/
  console.log("************");
 await session.run("merge(a:Activist{email:$Email,phoneNumber:$phoneNumber,accountId:$actId,Media:$media})return a", {
    Email:email,
    phoneNumber:phoneNumber,
    //Wallet:pureWallet.address,
    actId:"account.id",
    media:[]
  });
  await session.run("match(a:Activist{email:$Email}),(g:Groupe{Name:$grName})set g.members=g.members+1 merge(a)-[:PART_OF]->(g)",{
    Email:email,
    grName
  })
  //const toblock = await Inscription(phoneNumber,temp.IpfsHash,pureWallet.address);
  res.end(
    JSON.stringify(
      {
       created:"created"
      })
  );
});
app.post("/GetActivistByID", async (req, res) => {
  const ID = req.body.ID;
  const _activistManagement = new activistManagement();
  _activistManagement.searchActivistById(ID).then((resp) => {
    // convert a currency unit from wei to ether
    console.log(resp);
    res.end(JSON.stringify(resp));
  });
});



app.post("/DepositCusdCredit", async (req, res) => {
  const contributer = req.body.contributer;
  const amount = req.body.amount;
  const array = req.body.array;
  console.log(array);

  var thArrAct = array.split('%')[0].split(",");

  console.log(thArrAct);
  const arrAmm = array.split('%')[1].split("=")[1];
  console.log(arrAmm);
   var finA =arrAmm.split(',');
   console.log('dddd',finA);
   const bigAmounnt = ethers.utils.parseEther(amount);
  s=[]
  let k=[];
    for (var i =0 ; i< finA.length ; i++)
    {
      k.push((finA[i] * 10**18).toString());
    }
    console.log(k);
  const _activistManagement = new activistManagement();
   
  _activistManagement.DepositCusdCredit(ethers.BigNumber.from(bigAmounnt.toString()),
    contributer,
    thArrAct,
    k) .then((resp) => {
    // convert a currency unit from wei to ether
    res.end(JSON.stringify(resp));
  });
});
app.post("/widhdraw", async (req, res) => {
  const activist = req.body.activist;
  const _activistManagement = new activistManagement();
  _activistManagement.widhdraw(activist).then((resp) => {
    // convert a currency unit from wei to ether
    console.log(resp);
    res.end(JSON.stringify(resp));
  });
});
async function query(sql, params) {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "87h0u74+-*/",
    database: 'Survey'
  });
  let re;
  let res=connection.query(sql, params, (err, res) => {
    if(err) throw err;
  
    console.log('Last insert ID:', res.insertId);
    re=res.insertId;
    return res.insertId;
  });
  return re;
  
}
app.post("/InserData", async (req, res) => {
  let Full_Name= req.body.Full_Name;
  let Email= req.body.Email;
  let Birth_date= req.body.Birth_date;
  let City= req.body.City;
  let ExitesYouHero= JSON.stringify(req.body.ExitesYouHero);
  let climatesChanges=JSON.stringify(req.body.climatesChanges);
  let MonthlySubs=req.body.MonthlySubs;
  let source = req.body.source || "Pledge1";

  let sql="INSERT INTO survey SET ?"
  let params={
    Full_Name : Full_Name,
    Email : Email,
    Birth_date : Birth_date,
    City : City,
    ExitesYouHero : ExitesYouHero,
    climatesChanges : climatesChanges,
    MonthlySubs : MonthlySubs,
    Source : source};
  let result = await query(sql, params);
  console.log(result);
  res.end(JSON.stringify("ok"));
 
});
async function SearchUser(Email) {
  await initDriver();
  var driver = getdriver();
  var session = driver.session({
    database: 'Hero',
    defaultAccessMode: neo4j.session.READ
  })
  let result = await session
  .run('Match (n:Customer {email:$Email}) return n', {
    Email:Email
  });
  console.log("fff",result.records);
  if (result.records.length > 0)
  {
  const singleRecord = result.records[0]
  const node = singleRecord.get(0)
  console.log(node);
  return (node.properties);
  }

  return 0;
  
}
app.post("/SearchUserFromEmailDB", async (req, res) => {
  const Email = req.body.Email;
  let result = await SearchUser(Email);
  console.log(result);
  res.end(JSON.stringify(result));

})
async function UpdateUserDB(Email,newEmail,name,HeroId,CountryTolive,url) {

  // var driver = neo4j.driver(
  //   'neo4j://hegemony.donftify.digital:7687',
  //   neo4j.auth.basic('neo4j', '87h0u74+-*/')
  // )
   
  //  await initDriver();
  //  var driver = getdriver();
  // var session = driver.session({
  //   database: 'Hero',
  //   defaultAccessMode: neo4j.session.WRITE
  // })
  var driver = neo4j.driver(
    'neo4j://hegemony.donftify.digital',
    neo4j.auth.basic('neo4j', '87h0u74+-*/')
  )
 
  var session = driver.session({
    database: 'Hero'
  })
  console.log(session)
  // const product = await createProduct("test",[],"testProducts");
  // const price1 = await addPrice(product.id,1000,"usd","Subscription","month");
  // const price2 = await addPrice(product.id,2000,"usd","Subscription","month");
  // const price3 = await addPrice(product.id,5000,"usd","Subscription","month");
  
  // if(!customer || !product || !price1 || !price2 || !price3){
  //   console.log("test");
  //   return {customerId:null,state:false};
  // }
  
  await session
  .run('match (n:Customer{email:$email}) set n.email=$newEmail,n.imageUrl=$url ,n.name=$name, n.HeroId=$HeroId ,n.CountryTolive=$CountryTolive', {
    email: Email,
    newEmail:newEmail,
    name:name,
    HeroId:HeroId,
    CountryTolive:CountryTolive,
    url : url
    
  });
  return {state :true};
 
}
async function getUserInfo(Email) {

  // var driver = neo4j.driver(
  //   'neo4j://hegemony.donftify.digital:7687',
  //   neo4j.auth.basic('neo4j', '87h0u74+-*/')
  // )
   
  //  await initDriver();
  //  var driver = getdriver();
  // var session = driver.session({
  //   database: 'Hero',
  //   defaultAccessMode: neo4j.session.WRITE
  // })
  var driver = neo4j.driver(
    'neo4j://hegemony.donftify.digital',
    neo4j.auth.basic('neo4j', '87h0u74+-*/')
  )
 
  var session = driver.session({
    database: 'Hero'
  })
  console.log(session)
  // const product = await createProduct("test",[],"testProducts");
  // const price1 = await addPrice(product.id,1000,"usd","Subscription","month");
  // const price2 = await addPrice(product.id,2000,"usd","Subscription","month");
  // const price3 = await addPrice(product.id,5000,"usd","Subscription","month");
  
  // if(!customer || !product || !price1 || !price2 || !price3){
  //   console.log("test");
  //   return {customerId:null,state:false};
  // }

  const result = await session
  .run('match (n:Customer{email:$email}) return n', {
    email: Email,
   
    /*tttttt */
  });
  console.log(result);
  return result.records;
 
}
async function InsertUserDB(Email,WalletAddress,privKey,MNEMONIC,Password,googleId,imageUrl,name,lastname,HeroId) {

  // var driver = neo4j.driver(
  //   'neo4j://hegemony.donftify.digital:7687',
  //   neo4j.auth.basic('neo4j', '87h0u74+-*/')
  // )
   
  //  await initDriver();
  //  var driver = getdriver();
  // var session = driver.session({
  //   database: 'Hero',
  //   defaultAccessMode: neo4j.session.WRITE
  // })
  var driver = neo4j.driver(
    'neo4j://hegemony.donftify.digital',
    neo4j.auth.basic('neo4j', '87h0u74+-*/')
  )
 
  var session = driver.session({
    database: 'Hero'
  })
  console.log(session)
  const customer = await createCustomer(Email);
  // const product = await createProduct("test",[],"testProducts");
  // const price1 = await addPrice(product.id,1000,"usd","Subscription","month");
  // const price2 = await addPrice(product.id,2000,"usd","Subscription","month");
  // const price3 = await addPrice(product.id,5000,"usd","Subscription","month");
  
  // if(!customer || !product || !price1 || !price2 || !price3){
  //   console.log("test");
  //   return {customerId:null,state:false};
  // }
  if(!customer ){
    console.log("test");
    return {customerId:null,state:false};
  }
  await session
  .run('MERGE (c:Customer {email:$Email,walletAddress:$WalletAddress,privKey:$privKey,password:$Password,Mnemoni:$Mnemonic,CustomerId:$customerid,googleId:$googleId,imageUrl:$imageUrl,name:$name,lastname:$lastname,HeroId:$HeroId})RETURN c', {
   
    Email: Email,
    WalletAddress,
    privKey: privKey,
    Password:Password,
    Mnemonic : MNEMONIC,
    customerid:customer.id,
    googleId:googleId,imageUrl:imageUrl,name:name,lastname:lastname,HeroId:HeroId
    
  });
  return {customerId:customer.id,state :true};
 
}
app.post("/balanceOf", async (req, res) => {
  const user = req.body.user;
  const Token = req.body.Token;

 BalanceOf(Token,user).then((resp) => {
    // convert a currency unit from wei to ether
    res.end(JSON.stringify(resp));
  });
});

app.post("/sendEmailmailchimp", async (req, res) => {
  const email = req.body.email;

  sendEmailmailchimp(email).then((resp) => {
    // convert a currency unit from wei to ether
    res.end(JSON.stringify(resp));
  });
});
app.post("/sendEmail", async (req, res) => {
  const Email = req.body.Email;
  console.log("A");
 sendEmail(Email).then((resp) => {
    // convert a currency unit from wei to ether
    res.end(JSON.stringify(resp));
  });
});
app.post("/VoteProp", async (req, res) => {
  const _privKey = req.body.privKey;
  const _id = req.body.id;
  const _vote = req.body.vote;
  const _DAO = new DAO();

  _DAO.voteOnProposal( _id, _vote,_privKey).then((resp) => {
    // convert a currency unit from wei to ether
    res.end(JSON.stringify(resp));
  });
});



app.post("/GetProposal", async (req, res) => {
  const _id = req.body.id;
  const _DAO = new DAO();

  _DAO.printProposal( _id).then((resp) => {
    // convert a currency unit from wei to ether
    res.end(JSON.stringify(resp));
  });
});
app.post("/GetIndexProp", async (req, res) => {
  const _DAO = new DAO();

  _DAO.printProposalsNumber().then((resp) => {
    // convert a currency unit from wei to ether
    res.end(JSON.stringify(resp));
  });
});
app.post("/CheckPassword", async (req, res) => {
  const numeroTel = req.body.email;
  const password = req.body.password;
  
  var driver = neo4j.driver(
    'neo4j://hegemony.donftify.digital',
    neo4j.auth.basic('neo4j', '87h0u74+-*/')
  )
 
  var session = driver.session({
    database: 'Hero'
  })
  //console.log(AESDecryption(numeroTel+"+-*/"+password,decPassword));
  const result=await session
  .run('match (c:Customer{email:$Email})RETURN c', { 
    Email:numeroTel,
    
  });
  console.log ()
    if (result.records.length==0)
    { 
      res.end(JSON.stringify({found:"Email not found"}));
      
    }
    else{
      const BB =  AESDecryption(numeroTel+"+-*/"+password,result.records[0]._fields[0].properties.password)
      if(BB==password)
      {  let user = result.records[0]._fields[0].properties; 
        res.end(JSON.stringify({found:"",infor:
       { Email: user.email,
HeroId: user.HeroId,
googleId: user.googleId,
imageUrl: user.imageUrl,
lastname: user.lastname,
name:user.name,
wallet:  {
  mnemonic :user.Mnemoni,
customerId:user.CustomerId,
imageUrl: user.imageUrl,
lastname:user.lastname,

name:user.name
}  
}
      }));
    }
    else
    {      
      res.end(JSON.stringify({found:"please check your password"}));
  }
    }
   
    
});
app.post("/CheckEmail", async (req, res) => {
  const numeroTel = req.body.email;
  const password = req.body.password;
  
  var driver = neo4j.driver(
    'neo4j://hegemony.donftify.digital',
    neo4j.auth.basic('neo4j', '87h0u74+-*/')
  )
 
  var session = driver.session({
    database: 'Hero'
  })
  //console.log(AESDecryption(numeroTel+"+-*/"+password,decPassword));
  const result=await session
  .run('match (c:Customer{email:$Email})RETURN c', { 
    Email:numeroTel,
    
  });
    if (result.records.length==0)
    { 
      res.end(JSON.stringify({found:false}));
      
    }
    res.end(JSON.stringify({found:true}));
   
    
});
app.post("/GetIndexActiv", async (req, res) => {
  const _activistManagement = new activistManagement();
  _activistManagement.getIndex().then((resp) => {
    // convert a currency unit from wei to ether
    res.end(JSON.stringify(resp));
  });
});
app.post("/HistoryTransactions", async (req, res) => {
  const UserAddress = req.body.User;
  const _activistManagement = new activistManagement();
  const indexAct = await _activistManagement.getIndex();
  console.log(indexAct);
  const Tx=[];
  for (let i=1 ; i < parseInt(indexAct.index) ;i++ )
  {
    const act = await _activistManagement.searchActivistById(i);
    const fond = await _activistManagement.getTransactions(UserAddress,act.Wallet);
    console.log(fond);
    if (fond != 0)
    {
    Tx.push({...act,contribution:fond});
    }
  }
  res.end(JSON.stringify(Tx));
  
});
 const options = {
    key: fs.readFileSync('/opt/lampp/htdocs/HeroCoin/hegemony.donftify.digital/privkey2.pem'),
     cert: fs.readFileSync('/opt/lampp/htdocs/HeroCoin/hegemony.donftify.digital/fullchain2.pem')
  
 };
/*
app.listen(process.env.PORT || 8000, () => {
  console.log("Serveur à l'écoute on ");
});
*/


const server = https.createServer(options,app);
 server.listen(8080);
