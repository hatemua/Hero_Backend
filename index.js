const express = require("express");
const https = require('https');

const Web3 = require("web3");
const axios = require("axios");
var aes256 = require("aes256");
const cors = require('cors');
const fs = require("fs");
const { newKitFromWeb3 }=  require('@celo/contractkit');
const abiUserContract = require("./abi/abiUserContract.json");
const abiERC20 = require("./abi/abiERC20.json");
const activistManagement = require("./utils/activistManagement");
const DAO = require("./utils/DAO");

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;
const { CeloProvider, CeloWallet, StaticCeloProvider } = require("@celo-tools/celo-ethers-wrapper");

const { ethers, Wallet } = require("ethers");
const { Console } = require("console");
const ProviderNetwork = "https://alfajores-forno.celo-testnet.org";
const contractAddress = "0x79c0A6Fa247216bF70EEc3E85E554Ee6cD04Fa66";
const privKey = "713b86cbd9689ccc2bd09bf4ca9030e4e3b4e484d7161b05dc45239ebdcaa0eb";

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

   const reciept =await tx.wait();
   return {transaction:tx.hash,block:reciept.blockNumber}
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

app.post("/TestDecrypt", async (req, res) => {
  console.log(AESDecryption("0033143485548+-*/","WiKHiqsSUNJqFSg/5jCnDDEY064fCdgF"));
});


app.post("/CreateWallet", async (req, res) => {
  // var web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com'));
  // A=web3.eth.accounts.create("87h0u74+-*/");
  // var A=web3.eth.accounts.wallet.load("87h0u74+-*/");

  // res.end( JSON.stringify(A));
  const phoneNumber = req.body.phoneNumber;
  const password = req.body.password;

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
  const toblock = await Inscription(phoneNumber,temp.IpfsHash,pureWallet.address);
  res.end(
    JSON.stringify(
      {
        mnomonic: pureWallet._mnemonic().phrase,
        address: pureWallet.address,
        autre: pureWallet._signingKey(),
      })
  );
});
app.post("/CreateWalletActivist", async (req, res) => {
  // var web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-rpc.com'));
  // A=web3.eth.accounts.create("87h0u74+-*/");
  // var A=web3.eth.accounts.wallet.load("87h0u74+-*/");

  // res.end( JSON.stringify(A));
  const phoneNumber = req.body.phoneNumber;
  const password = req.body.password;
  console.log(phoneNumber);
 
 

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
   const bigAmounnt = ethers.utils.parseEther(amount);
  s=[]
  let k=[];
    for (var i =0 ; i<= finA.length ; i++)
    {
      k.push('"'+(finA[i] * 10**18).toString()+'"');
    }
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

app.post("/balanceOf", async (req, res) => {
  const user = req.body.user;
  const Token = req.body.Token;

 BalanceOf(Token,user).then((resp) => {
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
const options = {
    key: fs.readFileSync('/opt/lampp/htdocs/HeroCoin/hegemony.donftify.digital/privkey1.pem'),
    cert: fs.readFileSync('/opt/lampp/htdocs/HeroCoin/hegemony.donftify.digital/fullchain1.pem')
  
};
app.listen(process.env.PORT || 8000, () => {
  console.log("Serveur à l'écoute on ");
});



const server = https.createServer(options,app);
server.listen(8080);