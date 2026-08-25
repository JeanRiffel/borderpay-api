import { Module } from '@nestjs/common';
import { PaymentEscrowController } from '../controller/payment-escrow.controller';
import { PaymentEscrowService } from '../service/payment-escrow.service';

@Module({
  imports: [],
  controllers: [PaymentEscrowController],
  providers: [PaymentEscrowService],
})
export class PaymentEscrowModule {}
