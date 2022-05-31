import { BigNumber, providers, utils, Wallet } from "ethers";
import { CeloTransactionRequest } from "./transactions";
export declare class CeloWallet extends Wallet {
    /**
     * Override to skip checkTransaction step which rejects Celo tx properties
     * https://github.com/ethers-io/ethers.js/blob/master/packages/abstract-signer/src.ts/index.ts
     */
    populateTransaction(transaction: utils.Deferrable<CeloTransactionRequest>): Promise<any>;
    /**
     * Override to serialize transaction using custom serialize method
     * https://github.com/ethers-io/ethers.js/blob/master/packages/wallet/src.ts/index.ts
     */
    signTransaction(transaction: CeloTransactionRequest): Promise<string>;
    /**
     * Override just for type fix
     * https://github.com/ethers-io/ethers.js/blob/master/packages/wallet/src.ts/index.ts
     */
    sendTransaction(transaction: utils.Deferrable<CeloTransactionRequest>): Promise<providers.TransactionResponse>;
    /**
     * Override to skip checkTransaction step which rejects Celo tx properties
     * https://github.com/ethers-io/ethers.js/blob/master/packages/abstract-signer/src.ts/index.ts
     */
    estimateGas(transaction: utils.Deferrable<CeloTransactionRequest>): Promise<BigNumber>;
    /**
     * Override to support alternative gas currencies
     * https://github.com/celo-tools/ethers.js/blob/master/packages/abstract-signer/src.ts/index.ts
     */
    getGasPrice(feeCurrencyAddress?: string): Promise<BigNumber>;
}
