import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";


@Global() // aqui que temos uma novidade,  como aqui vamos ter varios modulos (ClientesModule, ProdutosModule, PedidosModule), e todos eles vão precisar do PrismaService teremos que compartilhar ele com outros lugares.
//sem o @Global voce teria que importar PrismaModule manualmente, em cada modulo novo que precisar dele, isso ficaria repetitivo e facil de esquecer. Com o @Global, voce registra o PrismaModule uma unica vez para qualquer modulo no projeto ja conseguir injetar PrismaService no constructor, sem precisar importar nada extra.

@Module({
    providers: [PrismaService], // registra o servico nesse modulo. A novidade é exports:
    exports: [PrismaService], // isso diz, "Outros módulos também podem usar esse servico, não so quem esta dentro deste módulo."
})
export class PrismaModule {}
