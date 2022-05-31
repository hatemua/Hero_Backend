const { ethers, wallet } = require("ethers");
const ActivistManagementabi = require("../abi/ActivistManagement.json");
require('dotenv').config();
const { CeloProvider, CeloWallet, StaticCeloProvider } = require("@celo-tools/celo-ethers-wrapper");

module.exports = class activistManagement {

    constructor() {
        this.contractAddr = process.env.ACTIVISTMANGEMENT;
        this.provider = process.env.PROVIDER;
        this.privKey = process.env.PRIVATEKEY;
    };
    async addActivist(nom, prenom, email, numTel, url, ActivistAddress) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);

            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.addActivist(
                nom,
                prenom,
                email,
                numTel,
                url,
                ActivistAddress.toString(),
            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return receipt.toString();
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async searchActivistByAddress(activistWallet) {

        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.searchActivistByAddress(
                activistWallet,

            );
            console.log(`looking for activist${activistWallet}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async searchActivistById(idActivist) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.searchActivistById(
                parseInt(idActivist),
            );
            console.log(`looking for activist${idActivist}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }

    async getPrenomActivistById(idActivist) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getPrenomActivistById(
                parseInt(idActivist),
            );
            console.log(`looking for activist${idActivist}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getNomActivistById(idActivist) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getNomActivistById(
                parseInt(idActivist),
            );
            console.log(`looking for activist${idActivist}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getEmailActivistById(idActivist) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getEmailActivistById(
                parseInt(idActivist),
            );
            console.log(`looking for activist${idActivist}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getNumTelActivistById(idActivist) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getNumTelActivistById(
                parseInt(idActivist),
            );
            console.log(`looking for activist${idActivist}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getURLActivistBytId(idActivist) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getURLActivistBytId(
                parseInt(idActivist),
            );
            console.log(`looking for activist${idActivist}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getNomActivistByAddress(activistWallet) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getNomActivistByAddress(
                activistWallet,
            );
            console.log(`looking for activist${activistWallet}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getPrenomActivistByAddress(activistWallet) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getPrenomActivistByAddress(
                activistWallet,
            );
            console.log(`looking for activist${activistWallet}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getEmailActivistByAddress(activistWallet) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getEmailActivistByAddress(
                activistWallet,
            );
            console.log(`looking for activist${activistWallet}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getNumTelActivistByAddress(activistWallet) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getNumTelActivistByAddress(
                activistWallet,
            );
            console.log(`looking for activist${activistWallet}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async getURLActivistBytAddress(activistWallet) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const activist = await activistContract.getURLActivistBytAddress(
                activistWallet,
            );
            console.log(`looking for activist${activistWallet}`);
            console.log(`activist is ${activist}`);
            console.log(`Transaction.hash:${activist}`);
            return activist.toString();
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
    async updateActivistByAddress(ActivistAddress, nom, prenom, email, numTel, url) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            console.log(account);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.updateActivistByAddress(
                ActivistAddress,
                nom,
                prenom,
                email,
                numTel,
                url,
                // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }

            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return decodedData;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async setNomActivistbyAddress(ActivistAddress, nom) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.setNomActivistbyAddress(
                ActivistAddress,
                nom,
                // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }
            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return decodedData;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async setPrenomActivistbyAddress(ActivistAddress, prenom) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.setPrenomActivistbyAddress(
                ActivistAddress,
                prenom,
                // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }
            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return decodedData;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async setEmailActivistbyAddress(ActivistAddress, email) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.setEmailActivistbyAddress(
                ActivistAddress,
                email,
                // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }
            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return decodedData;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async setNumTelActivistbyAddress(ActivistAddress, numtel) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.setNumTelActivistbyAddress(
                ActivistAddress,
                numtel,
                // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }
            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return decodedData;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async setUrlActivistbyAddress(ActivistAddress, url) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.setUrlActivistbyAddress(
                ActivistAddress,
                url,
                // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }
            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return decodedData;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async deleteActivistByAddress(ActivistAddress) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.deleteActivistByAddress(
                ActivistAddress,

                // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }
            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return decodedData;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async deleteActivistByOwnerByAddress(ActivistAddress) {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );
            console.log("*******ok******");
            const tx = await activistContract.deleteActivistByOwnerByAddress(
                ActivistAddress,

                // { gasPrice: gasPrice.gasPrice.toHexString(), gasLimit: ethers.BigNumber.from(150000).toHexString() }
            );
            console.log("creating Activist");
            console.log(`Transaction.hash:${tx.hash}`);

            const receipt = await tx.wait();
            console.log(receipt)
            const iface = new ethers.utils.Interface(ActivistManagementabi);
            let decodedData = iface.parseTransaction({ data: tx.data, value: tx.value });
            return decodedData;
            // return { transaction: tx.hash, block: reciept.blockNumber, projId: tx }
        }
        catch (err) {
            console.log(err);
            return { error: err };
        }

    }
    async getAllActivists() {
        try {
            var provider = new StaticCeloProvider(this.provider);
            await provider.ready;
            const account = new CeloWallet(this.privKey, provider);
            const activistContract = new ethers.Contract(this.contractAddr,
                ActivistManagementabi,
                account,

            );

            const tx = await activistContract.index();
            var ActivistTable = new Array();
            var wallet;
            var activist;
            for (var i = 0; i < tx; i++) {
                wallet = await activistContract.ActivistList(i);
                activist = await activistContract.addressToActivist(wallet);
                ActivistTable.push(activist.toString() + ',' + wallet.toString());
            }
            console.log(ActivistTable)
            return ActivistTable;
        } catch (err) {
            console.log(err);
            return { error: err };
        }
    }
}


