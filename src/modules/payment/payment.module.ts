import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';

@Module({
    imports: [
        VnpayModule,
        VnpayModule.register({
            tmnCode: 'L7ODOMNQ',
            secureSecret: 'U9FPOHV7YZEF78V43PH8ZBCE8GEWO6D0',
            vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
            testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true

            /**
             * Sử dụng enableLog để bật/tắt logger
             * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
             */
            enableLog: true, // tùy chọn

            /**
             * Hàm `loggerFn` sẽ được gọi để ghi log
             * Mặc định, loggerFn sẽ ghi log ra console
             * Bạn có thể ghi đè loggerFn để ghi log ra nơi khác
             *
             * `ignoreLogger` là một hàm không làm gì cả
             */
            loggerFn: ignoreLogger, // tùy chọn
        }),
    ],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
