import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class ItemPedidoDto {
    @IsInt()
    @IsPositive({ message: 'produtoId é obrigatório e deve ser válido' })
    produtoId: number;

    @IsInt()
    @Min(1, { message: 'quantidade deve ser no mínimo 1' })
    quantidade: number;

    @IsNumber()
    @IsPositive({ message: 'precoUnitario deve ser maior que zero' })
    precoUnitario: number;

    @IsOptional()
    @IsString()
    observacoes?: string;
}
