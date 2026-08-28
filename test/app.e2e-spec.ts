import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GeneralModule } from '../src/general.modules';
import { PaymentEscrowSmartContract } from '../src/domain/payment-escrow/entity/PaymentEscrowSmartContract';
import { PaymentStatus } from '../src/domain/payment-escrow/entity/Payment';
import PaymentEscrowFactory from '../src/domain/payment-escrow/factory/PaymentEscrowFactory';

// PaymentEscrowService builds its dependencies manually (`new PaymentEscrowFactory()`)
// instead of through Nest's DI container, so — same as the unit tests — the factory
// module is mocked directly rather than overridden as a provider. This keeps the e2e
// suite runnable without a real RPC node / deployed contract.
jest.mock('../src/domain/payment-escrow/factory/PaymentEscrowFactory');

describe('PaymentEscrowController (e2e)', () => {
  let app: INestApplication;
  let mockPaymentEscrowSmartContract: jest.Mocked<PaymentEscrowSmartContract>;

  beforeEach(async () => {
    mockPaymentEscrowSmartContract = {
      contractName: jest.fn(),
      createPayment: jest.fn(),
      fundPayment: jest.fn(),
      releasePayment: jest.fn(),
      refundPayment: jest.fn(),
      withdraw: jest.fn(),
      getPayment: jest.fn(),
    };

    (PaymentEscrowFactory as jest.Mock).mockImplementation(() => ({
      buildSmartContractPaymentEscrow: jest
        .fn()
        .mockReturnValue(mockPaymentEscrowSmartContract),
    }));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GeneralModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /payment-escrow/create creates a payment', async () => {
    mockPaymentEscrowSmartContract.createPayment.mockResolvedValue({
      transactionHash: '0xabc',
    });

    await request(app.getHttpServer())
      .post('/payment-escrow/create')
      .send({
        paymentId: '0x01',
        beneficiary: '0xBeneficiary',
        sender: '0xSender',
      })
      .expect(200)
      .expect({ result: { transactionHash: '0xabc' } });

    expect(mockPaymentEscrowSmartContract.createPayment).toHaveBeenCalledWith(
      '0x01',
      '0xBeneficiary',
      '0xSender',
    );
  });

  it('GET /payment-escrow/payment/:paymentId returns the payment', async () => {
    const payment = {
      sender: '0xSender',
      beneficiary: '0xBeneficiary',
      amount: '1000000000000000000',
      status: PaymentStatus.Funded,
    };
    mockPaymentEscrowSmartContract.getPayment.mockResolvedValue(payment);

    await request(app.getHttpServer())
      .get('/payment-escrow/payment/0x01')
      .expect(200)
      .expect({ payment });
  });

  it('GET /payment-escrow/contract-name returns the contract name', async () => {
    mockPaymentEscrowSmartContract.contractName.mockResolvedValue(
      'The PaymentEscrow Contract is OnLine',
    );

    await request(app.getHttpServer())
      .get('/payment-escrow/contract-name')
      .expect(200)
      .expect({ contractName: 'The PaymentEscrow Contract is OnLine' });
  });

  it('POST /payment-escrow/release returns 500 with the error message on failure', async () => {
    mockPaymentEscrowSmartContract.releasePayment.mockRejectedValue(
      new Error('reverted'),
    );

    const response = await request(app.getHttpServer())
      .post('/payment-escrow/release')
      .send({ paymentId: '0x01' })
      .expect(500);

    expect(response.body.message).toBe('Something went wrong');
  });
});
