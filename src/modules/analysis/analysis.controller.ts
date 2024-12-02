import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

@Controller('analysis')
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) {}

    @Post()
    create(@Body() createAnalysisDto: CreateAnalysisDto) {
        return this.analysisService.create(createAnalysisDto);
    }

    @Get('revenue')
    async findAll(
        @Query('start_date') start_date: string,
        @Query('end_date') end_date: string,
        @Query('combo_id') combo_id: string,
        @Query('service_id') service_id: string,
    ) {
        try {
            return await this.analysisService.findAll(start_date, end_date, combo_id, service_id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.analysisService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAnalysisDto: UpdateAnalysisDto) {
        return this.analysisService.update(+id, updateAnalysisDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.analysisService.remove(+id);
    }
}
