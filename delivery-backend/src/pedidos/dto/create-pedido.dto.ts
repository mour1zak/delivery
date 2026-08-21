import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsIn,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    ValidateNested,
} from 'class-validator';
import { ItemPedidoDto } from './item-pedido.dto';

export const STATUS_PEDIDO = ['recebido', 'em preparo', 'saiu para entrega', 'entregue', 'cancelado'] as const;

export class CreatePedidoDto {
    @IsInt()
    @IsPositive({ message: 'clienteId é obrigatório e deve ser válido' })
    clienteId: number;

    @IsOptional()
    @IsIn(STATUS_PEDIDO, { message: `status deve ser um dos seguintes: ${STATUS_PEDIDO.join(', ')}` })
    status?: (typeof STATUS_PEDIDO)[number];

    @IsNumber()
    @IsPositive({ message: 'valorTotal deve ser maior que zero' })
    valorTotal: number;

    @IsOptional()
    @IsString()
    motivoCancelamento?: string;

    @IsOptional()
    @IsDateString()
    dataHora?: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'o pedido deve ter ao menos um item' })
    @ValidateNested({ each: true })
    @Type(() => ItemPedidoDto)
    itens: ItemPedidoDto[];
}
