const { Contract, ethers, utils, providers } = require("ethers")
const BigNumber = require("bignumber.js");
const ActivistManagementabi = require("../abi/ActivistManagement.json");

const { CeloProvider, CeloWallet, StaticCeloProvider } = require("@celo-tools/celo-ethers-wrapper");
module.exports = class activistWallet {
    constructor() {

        this.contractAddr = process.env.ACTIVISTMANGEMENT;
        this.provider = process.env.PROVIDER;
        this.privKey = process.env.PRIVATEKEY;
    }

    async addActivist(nom, prenom, email, numTel, url, ActivistAddress) {
        var provider = new StaticCeloProvider(this.provider);
        await provider.ready;
        const account = new CeloWallet(this.privKey, provider);
        const contract = new ethers.Contract(this.contractAddr,
            ActivistManagementabi,
            account);
        const tx = await contract.addActivist(nom,
            prenom,
            email,
            numTel,
            url,
            ActivistAddress,
            // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }
        );
        const reciept = tx.wait();
        return reciept.toString()



    }
};