import { Module } from '@nestjs/common';
import { ClientesModule } from './clients/clientes.module';
import { ProdutosModule } from './produtos/produtos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ClientesModule, ProdutosModule, PedidosModule],
})
export class AppModule {}
