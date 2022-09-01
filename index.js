const express = require("express");
const https = require('https');
const mysql = require('mysql');

const Web3 = require("web3");
const axios = require("axios");
var aes256 = require("aes256");
const cors = require('cors');
var nodemailer = require('nodemailer');
//const stripe = require('stripe')('sk_test_...');
const { initDriver, getdriver } = require("./neo4j");
const fs = require("fs");
const { newKitFromWeb3 }=  require('@celo/contractkit');
const abiUserContract = require("./abi/abiUserContract.json");
const abiERC20 = require("./abi/abiERC20.json");
const activistManagement = require("./utils/activistManagement");
const DAO = require("./utils/DAO");
var neo4j = require('neo4j-driver');
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
  await initDriver("neo4j+s://ee4df690.databases.neo4j.io","neo4j","IGR6RZSiXnGnXM6BfswtQmFtVxkaewEPFjZPPUKzYC8");
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
  await initDriver("neo4j+s://ee4df690.databases.neo4j.io","neo4j","IGR6RZSiXnGnXM6BfswtQmFtVxkaewEPFjZPPUKzYC8");
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
  const phoneNumber = req.body.email;
  const password = req.body.password;
  let search=await SearchUser(phoneNumber);
  if (search == 0)
  {
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
   let Password = AESEncyption(phoneNumber+"+-*/",password);
   let privKey = AESEncyption(password+"+-*/"+phoneNumber,pureWallet._signingKey().privateKey);
  const {customerId,state}=await InsertUserDB(phoneNumber,WalletAddress,privKey,MNEMONIC,Password);
  console.log("************");


  const toblock = await Inscription(phoneNumber,"",pureWallet.address);
  return res.status(200).json({
    mnomonic: pureWallet._mnemonic().phrase,
    address: pureWallet.address,
    autre: pureWallet._signingKey(),
    customerId:customerId
  });

  }
  else{
    console.log(search);
    return res.status(200).json({
      mnomonic: search.Mnemoni,
      address: search.WalletAddress,
      autre: search.privKey,
      customerId:search.CustomerId
    });
  }
  
});
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
  var account = await createAccount(country,phoneNumber);
  if(!account){
    return res.status(500).send("stripe account creation failed !")
  }
  const providerMumbai = new ethers.providers.JsonRpcProvider(
    ProviderNetwork
  );

  const pureWallet = ethers.Wallet.createRandom();
  
  const wallet = new Wallet(pureWallet, providerMumbai);
  console.log(password+"+"+phoneNumber);
  console.log(AESEncyption(password+"+"+phoneNumber,pureWallet._mnemonic().phrase));
  const temp = await pinJSONToIPFS("98ec2b41b43bef139ebc","4d443842873fb35c1f2866312fcad6d397a4172a8f08527e3714e35c989365c2",{
    mnomonic: AESEncyption(password+"+-*/"+phoneNumber,pureWallet._mnemonic().phrase),
    address: AESEncyption(password+"+-*/"+phoneNumber,pureWallet.address),
    autre: AESEncyption(password+"+-*/"+phoneNumber,pureWallet._signingKey().privateKey),
    password:AESEncyption(phoneNumber+"+-*/",password)
  });
  console.log("************");
  console.log(temp);
  console.log(account.id)
 await session.run("merge(a:Activist{email:$Email,phoneNumber:$phoneNumber,wallet:$Wallet,accountId:$actId})return a", {
    Email:email,
    phoneNumber:phoneNumber,
    Wallet:pureWallet.address,
    actId:account.id
  });
  await session.run("match(a:Activist{email:$Email}),(g:Groupe{Name:$grName})set g.members=g.members+1 merge(a)-[:PART_OF]->(g)",{
    Email:email,
    grName
  })
  //const toblock = await Inscription(phoneNumber,temp.IpfsHash,pureWallet.address);
  res.end(
    JSON.stringify(
      {
        mnomonic: pureWallet._mnemonic().phrase,
        address: pureWallet.address,
        autre: pureWallet._signingKey(),
        IpfsHash :temp
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
async function InsertUserDB(Email,WalletAddress,privKey,MNEMONIC,Password) {

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
  .run('MERGE (c:Customer {email:$Email,walletAddress:$WalletAddress,privKey:$privKey,password:$Password,Mnemoni:$Mnemonic,CustomerId:$customerid})RETURN c', {
    Email: Email,
    WalletAddress,
    privKey: privKey,
    Password:Password,
    Mnemonic : MNEMONIC,
    customerid:customer.id
  });
  // await session.run('CREATE (pr1:Price {priceId:$priceIdw,amount:1000}),(pr2:Price {priceId:$priceIdz,amount:2000}),(pr3:Price {priceId:$priceIda,amount:5000}) RETURN pr1,pr2,pr3',{
  //   priceIdw:price1.id,
  //   priceIdz:price2.id,
  //   priceIda:price3.id
  // })
  // await session.run("MATCH(p:Person{CustomerId:$CustomerId})  MATCH(pr:Product{productId:$productId}) MERGE (p)-[:PAID]->(pr) RETURN p",{
  //   CustomerId:customer.id,
  //   productId:product.id,

  // })
  // await session.run("MATCH(pr:Product{productId:$productId}) MATCH (pr1:Price{priceId:$priceId})MERGE (pr)-[:PRICED]->(pr1) RETURN pr",{
  //   productId:product.id,
  //   priceId:price1.id
  // })
  // await session.run("MATCH(pr:Product{productId:$productId}) MATCH (pr1:Price{priceId:$priceId})MERGE (pr)-[:PRICED]->(pr1) RETURN pr",{
  //   productId:product.id,
  //   priceId:price2.id
  // })
  // await session.run("MATCH(pr:Product{productId:$productId}) MATCH (pr1:Price{priceId:$priceId})MERGE (pr)-[:PRICED]->(pr1) RETURN pr",{
  //   productId:product.id,
  //   priceId:price3.id
  // })
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
  const numeroTel = req.body.numeroTel;
  const password = req.body.password;
  
  const _activistManagement = new activistManagement();
  _activistManagement.getCofDatafromNumTel(numeroTel).then((resp) => {
    // convert a currency unit from wei to ether
    decPassword = resp.password;
    console.log (AESDecryption(numeroTel+"+-*/",decPassword));
    if (password == AESDecryption(numeroTel+"+-*/",decPassword))
    {
      res.end(JSON.stringify(
        {
          mnomonic: AESDecryption(password+"+-*/"+numeroTel,resp.mnomonic),
          address: AESDecryption(password+"+-*/"+numeroTel,resp.address),
          autre: AESDecryption(password+"+-*/"+numeroTel, resp.autre),
          numeroPhone:numeroTel,
          
        }
      ));
    }
    else {
    res.end(JSON.stringify({
      error :"error"
    }));
    }
    
  });
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
app.listen(process.env.PORT || 8000, () => {
  console.log("Serveur à l'écoute on ");
});



const server = https.createServer(options,app);
server.listen(8080);
