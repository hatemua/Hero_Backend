const { ethers, wallet } = require("ethers");
const BigNumber = require('bignumber.js');
const { newKitFromWeb3 }=  require('@celo/contractkit');
const Web3 = require("web3");
const AbiDAO = require("../abi/DAO.json");
const abiERC20 = require("../abi/abiERC20.json");

require('dotenv').config();
const axios = require("axios");
const fetch = require('node-fetch');

const { CeloProvider, CeloWallet, StaticCeloProvider } = require("@celo-tools/celo-ethers-wrapper");
const { consoleLogger } = require("@celo/base");

module.exports = class DAO {

    constructor() {
        this.contractAddr = process.env.ACTIVISTMANGEMENT;
        this.provider = process.env.PROVIDER;
        this.privKey = process.env.PRIVATEKEY;
        this.contractDeposit = process.env.contractDeposit;
        this.DAO = process.env.DAO;
        this.HeroCoin = process.env.HeroCoin;
    };
    
    async voteOnProposal(_id, _vote,priv) {
        try {
            
            var provider = new StaticCeloProvider(this.provider);
            const bigAmounnt = ethers.utils.parseEther("0.01");

            await provider.ready;
            const accountPrincipal = new CeloWallet(this.privKey, provider);
            const account = new CeloWallet(priv, provider);
            const txResponse = await accountPrincipal.sendTransaction({
                to: account.address,
                value: ethers.BigNumber.from("10000000000000000"),
                gasPrice: 1000000000
              });
            
            await txResponse.wait();
            
            const ERC20HeroCoin = new ethers.Contract(this.HeroCoin,
                abiERC20,
                account,
                { gasPrice: 1000000000}
            );
            const tx = await ERC20HeroCoin.approve(
                this.DAO,
                (1 * 10**18).toString()
            );
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();

            const DAO = new ethers.Contract(this.DAO,
                AbiDAO,
                account,

            );
            
            const txVote = await DAO.voteOnProposal(_id,_vote,
                { gasPrice: 1000000000}
                )
           
            return receipt.toString();
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async printProposalsNumber() {
        try {
            console.log(this.DAO);
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            
           
            const DAO = new ethers.Contract(this.DAO,
                AbiDAO,
                account,

            );
            const txVote = await DAO.nextProposal()

           
            return txVote.toString() ;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    
    async printProposal(_id) {
        try {
            console.log(this.DAO);
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            
           
            const DAO = new ethers.Contract(this.DAO,
                AbiDAO,
                account,

            );
            const txVote = await DAO.Proposals(_id
                )
            let nbrYes = parseInt(txVote[4]);
            let nbrNo = parseInt(txVote[5]);

            let PercentageYes =  (nbrYes / (nbrYes + nbrNo) *100);
            let PercentagesNo =  (nbrNo / (nbrYes + nbrNo) *100);
            return {
                "ID": txVote.id,
                "Description" : txVote[2].replace(/\s\s+/g, '<br>'),
                "deadline" : txVote[3],
                "Yes" : Number(PercentageYes).toFixed(2),
                "No" :Number(PercentagesNo).toFixed(2)

            }
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    
}


