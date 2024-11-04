import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    Req,
    Res,
    BadRequestException,
    UseGuards,
    NotFoundException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { uploadSingleImageInterceptor } from 'src/common/configs/upload';
import { Request, Response } from 'express';
import { uploadSingleImageThirdParty } from 'src/common/utils';

@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) {}

    @Post()
    @UseInterceptors(uploadSingleImageInterceptor())
    async create(
        @Body() createCustomerDto: CreateCustomerDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        let avatar = 'https://minhdevs.github.io/introduce/dev.png';
        await uploadSingleImageThirdParty(req)
            .then((resonse) => {
                if (resonse.success) {
                    avatar = resonse.data.link;
                }
            })
            .catch((err) => {});

        try {
            createCustomerDto.avatar = avatar;
            const creadtedStylist = await this.customerService.create(createCustomerDto);

            if (!creadtedStylist) {
                throw new BadRequestException();
            }

            return res.json({ success: true, data: creadtedStylist });
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get()
    async findAll(@Res() res: Response) {
        try {
            const customers = await this.customerService.findAll();
            return res.json({ success: true, data: customers });
        } catch (error) {
            throw new NotFoundException();
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        try {
            const customer = await this.customerService.findOne(id);

            if (!customer) {
                throw new NotFoundException();
            }

            return res.json({ success: true, data: customer });
        } catch (error) {
            throw new ServiceUnavailableException();
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            const deletedCustomer = await this.customerService.remove(id);

            if (!deletedCustomer) {
                throw new NotFoundException();
            }
            return { success: true, message: 'Deleted!' };
        } catch (error) {
            throw new BadRequestException('This account is not exist on system!');
        }
    }
}
