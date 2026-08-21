import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from "@nestjs/common";
import { ProdutosService } from "./produtos.service";
import { CreateProdutoDto } from "./dto/create-produto.dto";
import { UpdateProdutoDto } from "./dto/update-produto.dto";

@Controller('produtos')
export class ProdutosController {
    constructor(private readonly produtosService: ProdutosService) {}

    @Get()
    findAll() {
        return this.produtosService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.produtosService.findOne(Number(id));
    }

    @Post()
    create(@Body() data: CreateProdutoDto) {
        return this.produtosService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateProdutoDto) {
        return this.produtosService.update(Number(id), data);
    }

    @Patch(':id')
    patch(@Param('id') id: string, @Body() data: UpdateProdutoDto) {
        return this.produtosService.update(Number(id), data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.produtosService.remove(Number(id));
    }
}
