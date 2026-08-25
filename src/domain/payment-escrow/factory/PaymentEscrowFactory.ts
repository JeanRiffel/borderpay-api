import { PaymentEscrowSmartContract } from '../entity/PaymentEscrowSmartContract';
import Web3ConnectionPaymentEscrow from '../../../infra/Web3ConnectionPaymentEscrow';
import PaymentEscrowContract from '../entity/PaymentEscrowContract';

class PaymentEscrowFactory {
  buildSmartContractPaymentEscrow(): PaymentEscrowSmartContract {
    const web3ConnectionPaymentEscrow = new Web3ConnectionPaymentEscrow(
      process.env.RPC_ADDRESS,
    );
    return new PaymentEscrowContract(web3ConnectionPaymentEscrow);
  }
}

export default PaymentEscrowFactory;
