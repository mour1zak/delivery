import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from "@nestjs/common";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy { // aqui vamos herdar uma classe inteira, pronta, gerada pelo prisma. PrismaClient ja vem com todos os metodos como prisma.cliente.findMany(), prisma.pedido.create(),etc.

    // em uma analogia simples comprando o carro pronto e so trocando o painel

    // vamos pensar da seguinte forma, PrismaClient é como um carro inteiro , já pronto de fábrica(motor, rodas, tudo funcionando) extends PrismaClient é voce pegando esse carro pronto e so adicionando um painel de controle extra( os metodos onModuleInit/onModuleDestroy) voce nao precisou contruir o motor do zero, so herdou tudo que ja existia e acrecentou  um comportamento a mais.


    constructor() { // por estarmos estendendo o PrismaClient, precisa chamar super(...) - exatamente como voce ja fez com Comandante  chamando super(nome). so que aqui, em vez de passar um nome, voce passa a configuracao de conexao( o adapter que aponta pro seu banco delivery)
        super( {
            adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
        })
    }



         // aqui e quando o nest liga e desliga a luz
        // analogia: e como abrir e fechar a loja

        //aqui é literalmente destrancar a porta da loja de manhã
    async onModuleInit() {    //RODA AUTOMATICAMENTE uma vez, assim que o nest termina de montar toda a aplicacao  -- é aqui que voce abre a conexao com o banco.        
        await this.$connect()
    }

    // ja nesse caso aqui é literalmente trancar a porta a noite.
    async onModuleDestroy() {   // roda quando o servidor esta desligado,, é aqui que voce fecha a conexao de forma organizada, sem deixar "pontas soltas."
        await this.$disconnect()
    }
}