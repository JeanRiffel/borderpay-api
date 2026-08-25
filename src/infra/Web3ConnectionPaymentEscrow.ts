import Web3 from 'web3';
import Web3Connection from '../domain/payment-escrow/entity/Web3Connection';

class Web3ConnectionPaymentEscrow implements Web3Connection {
  private _web3: Web3;

  constructor(provider: string) {
    this._web3 = new Web3(new Web3.providers.HttpProvider(provider));
  }

  getConnection(): Web3 {
    return this._web3;
  }
}

export default Web3ConnectionPaymentEscrow;
