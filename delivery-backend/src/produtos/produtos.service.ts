import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProdutoDto } from "./dto/create-produto.dto";
import { UpdateProdutoDto } from "./dto/update-produto.dto";

function toNumber(v: unknown) {
    return v === null || v === undefined ? v : parseFloat(v.toString());
}

function serializeProduto(produto: any) {
    return { ...produto, preco: toNumber(produto.preco) };
}

@Injectable()
export class ProdutosService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        const produtos = await this.prisma.produto.findMany();
        return produtos.map(serializeProduto);
    }

    async findOne(id: number) {
        const produto = await this.prisma.produto.findUnique({ where: { id } });
        return produto ? serializeProduto(produto) : null;
    }

    async create(data: CreateProdutoDto) {
        const produto = await this.prisma.produto.create({ data: data as any });
        return serializeProduto(produto);
    }

    async update(id: number, data: UpdateProdutoDto) {
        const produto = await this.prisma.produto.update({ where: { id }, data: data as any });
        return serializeProduto(produto);
    }

    async remove(id: number) {
        await this.prisma.produto.delete({ where: { id } });
        return { deleted: true };
    }
}
