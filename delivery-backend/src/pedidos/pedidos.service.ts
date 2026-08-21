import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePedidoDto } from "./dto/create-pedido.dto";
import { UpdatePedidoDto } from "./dto/update-pedido.dto";

// O enum StatusPedido usa @map no schema porque "em preparo" e "saiu para entrega"
// não são identificadores Prisma válidos (têm espaço). O client sempre expõe a chave
// (em_preparo), nunca o valor mapeado — então convertemos aqui nos dois sentidos para
// bater com as strings que o front usa (CONSTANTS.STATUS_SEQUENCIA).
const STATUS_LABELS: Record<string, string> = {
    recebido: 'recebido',
    em_preparo: 'em preparo',
    saiu_para_entrega: 'saiu para entrega',
    entregue: 'entregue',
    cancelado: 'cancelado',
};

const STATUS_KEYS: Record<string, string> = Object.fromEntries(
    Object.entries(STATUS_LABELS).map(([key, label]) => [label, key]),
);

function toDbStatus(label: string) {
    return STATUS_KEYS[label] ?? label;
}

function toLabelStatus(key: string) {
    return STATUS_LABELS[key] ?? key;
}

function toNumber(v: unknown) {
    return v === null || v === undefined ? v : parseFloat(v.toString());
}

function serializePedido(pedido: any) {
    return {
        ...pedido,
        status: toLabelStatus(pedido.status),
        valorTotal: toNumber(pedido.valorTotal),
        itens: (pedido.itens ?? []).map((item: any) => ({
            ...item,
            precoUnitario: toNumber(item.precoUnitario),
        })),
    };
}

function mapItensCreate(itens: any[] = []) {
    return itens.map((item) => ({
        produtoId: Number(item.produtoId),
        quantidade: Number(item.quantidade),
        precoUnitario: item.precoUnitario,
        observacoes: item.observacoes ?? null,
    }));
}

@Injectable()
export class PedidosService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        const pedidos = await this.prisma.pedido.findMany({ include: { itens: true } });
        return pedidos.map(serializePedido);
    }

    async findOne(id: number) {
        const pedido = await this.prisma.pedido.findUnique({ where: { id }, include: { itens: true } });
        return pedido ? serializePedido(pedido) : null;
    }

    async create(data: CreatePedidoDto) {
        const { clienteId, status, valorTotal, motivoCancelamento, dataHora, itens } = data;

        const pedido = await this.prisma.pedido.create({
            data: {
                clienteId: Number(clienteId),
                status: toDbStatus(status ?? 'recebido') as any,
                valorTotal,
                motivoCancelamento: motivoCancelamento ?? null,
                ...(dataHora && { dataHora: new Date(dataHora) }),
                itens: { create: mapItensCreate(itens) },
            },
            include: { itens: true },
        });

        return serializePedido(pedido);
    }

    async update(id: number, data: UpdatePedidoDto) {
        const { clienteId, status, valorTotal, motivoCancelamento, dataHora, itens } = data;

        const pedido = await this.prisma.pedido.update({
            where: { id },
            data: {
                ...(clienteId !== undefined && { clienteId: Number(clienteId) }),
                ...(status !== undefined && { status: toDbStatus(status) as any }),
                ...(valorTotal !== undefined && { valorTotal }),
                ...(motivoCancelamento !== undefined && { motivoCancelamento }),
                ...(dataHora !== undefined && { dataHora: new Date(dataHora) }),
                ...(itens !== undefined && {
                    itens: {
                        deleteMany: {},
                        create: mapItensCreate(itens),
                    },
                }),
            },
            include: { itens: true },
        });

        return serializePedido(pedido);
    }
}
