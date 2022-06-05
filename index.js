const express = require("express");
const https = require('https');

const Web3 = require("web3");
const axios = require("axios");
var aes256 = require("aes256");
const cors = require('cors');
const fs = require("fs");

const activistManagement = require("./utils/activistManagement");
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;
const { CeloProvider, CeloWallet, StaticCeloProvider } = require("@celo-tools/celo-ethers-wrapper");

const { ethers, Wallet } = require("ethers");
const ProviderNetwork = "https://alfajores-forno.celo-testnet.org";
const contractAddress = "0x93312E88e92b31F88a0b4C7400B3c4E90af7b39d";
const privKey = "713b86cbd9689ccc2bd09bf4ca9030e4e3b4e484d7161b05dc45239ebdcaa0eb";

app.use(express.json());


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

  const AESDecryption = async (key , encrypted) => {
 
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

app.post("/GetActivistByID", async (req, res) => {
  const ID = req.body.ID;
  const _activistManagement = new activistManagement();
  _activistManagement.searchActivistById(ID).then((resp) => {
    // convert a currency unit from wei to ether
    console.log(resp);
    res.end(JSON.stringify(resp));
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
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
app.listen(process.env.PORT || 8000, () => {
  console.log("Serveur à l'écoute on ");
});



const server = https.createServer(options,app);
server.listen(8080);