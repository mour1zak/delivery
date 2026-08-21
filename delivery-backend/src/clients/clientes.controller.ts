import { Controller, Get, Post, Put, Patch, Param, Body } from "@nestjs/common";
import { ClientesService } from "./clients.service";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { UpdateClienteDto } from "./dto/update-cliente.dto";

@Controller('clientes')
export class ClientesController {
    constructor (private readonly clientesService: ClientesService) {}

    @Get()
    findAll() {
        return this.clientesService.findALL()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clientesService.findOne(Number(id))
    }

     @Post()
    Create(@Body() data: CreateClienteDto) {
        return this.clientesService.create(data)
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateClienteDto) {
        return this.clientesService.update(Number(id), data)
    }

    @Patch(':id')
    patch(@Param('id') id: string, @Body() data: UpdateClienteDto) {
        return this.clientesService.update(Number(id), data)
    }
 }
