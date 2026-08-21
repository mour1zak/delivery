import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export const CATEGORIAS_PRODUTO = ['lanche', 'bebida', 'sobremesa', 'acompanhamento'] as const;

export class CreateProdutoDto {
    @IsString()
    @IsNotEmpty({ message: 'nome é obrigatório' })
    @MaxLength(255)
    nome: string;

    @IsIn(CATEGORIAS_PRODUTO, { message: `categoria deve ser uma das seguintes: ${CATEGORIAS_PRODUTO.join(', ')}` })
    categoria: (typeof CATEGORIAS_PRODUTO)[number];

    @IsNumber()
    @IsPositive({ message: 'preco deve ser maior que zero' })
    preco: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    tipoProducao?: string;

    @IsOptional()
    @IsBoolean()
    disponivel?: boolean;
}
