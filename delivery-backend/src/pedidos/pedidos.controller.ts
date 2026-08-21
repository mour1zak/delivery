import { Controller, Get, Post, Put, Patch, Param, Body } from "@nestjs/common";
import { PedidosService } from "./pedidos.service";
import { CreatePedidoDto } from "./dto/create-pedido.dto";
import { UpdatePedidoDto } from "./dto/update-pedido.dto";

@Controller('pedidos')
export class PedidosController {
    constructor(private readonly pedidosService: PedidosService) {}

    @Get()
    findAll() {
        return this.pedidosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pedidosService.findOne(Number(id));
    }

    @Post()
    create(@Body() data: CreatePedidoDto) {
        return this.pedidosService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdatePedidoDto) {
        return this.pedidosService.update(Number(id), data);
    }

    @Patch(':id')
    patch(@Param('id') id: string, @Body() data: UpdatePedidoDto) {
        return this.pedidosService.update(Number(id), data);
    }
}
