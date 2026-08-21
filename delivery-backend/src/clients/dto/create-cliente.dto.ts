import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClienteDto {
    @IsString()
    @IsNotEmpty({ message: 'nome é obrigatório' })
    @MaxLength(255)
    nome: string;

    @IsString()
    @IsNotEmpty({ message: 'cpf é obrigatório' })
    @MaxLength(20)
    cpf: string;

    @IsString()
    @IsNotEmpty({ message: 'telefone é obrigatório' })
    @MaxLength(20)
    telefone: string;

    @IsString()
    @IsNotEmpty({ message: 'endereco é obrigatório' })
    @MaxLength(255)
    endereco: string;

    @IsString()
    @IsNotEmpty({ message: 'bairro é obrigatório' })
    @MaxLength(100)
    bairro: string;

    @IsString()
    @IsNotEmpty({ message: 'cep é obrigatório' })
    @MaxLength(15)
    cep: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    referencia?: string;

    @IsOptional()
    @IsBoolean()
    ativo?: boolean;
}
