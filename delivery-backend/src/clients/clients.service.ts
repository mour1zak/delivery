import { Injectable} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { UpdateClienteDto } from "./dto/update-cliente.dto";

@Injectable()
export class ClientesService {
    constructor(private readonly prisma: PrismaService) {}
        findALL() {
            return this.prisma.cliente.findMany()
        }
        findOne(id: number) {
            return this.prisma.cliente.findUnique({ where: { id } })
        }
        create(data: CreateClienteDto) {
        return this.prisma.cliente.create({ data })
      }

        update(id: number, data: UpdateClienteDto) {
            return this.prisma.cliente.update({ where: { id }, data })
        }
    }
