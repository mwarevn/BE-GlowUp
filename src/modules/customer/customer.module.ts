import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    controllers: [CustomerController],
    providers: [CustomerService],
    imports: [UserModule],
})
export class CustomerModule {}
