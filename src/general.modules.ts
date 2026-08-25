import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PaymentEscrowModule } from './domain/payment-escrow/module/payment-escrow.module';
import * as cors from 'cors';

@Module({
  imports: [PaymentEscrowModule],
})
export class GeneralModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors({ origin: process.env.FRONT_END_ADDRESS }))
      .forRoutes('*');
  }
}
