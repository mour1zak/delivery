// Funções utilitárias para todo o sistema
class Helpers {
    // Formatação de valores
    static formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    static formatarData(data) {
        return dayjs(data).format('DD/MM/YYYY HH:mm');
    }

    static formatarCPF(cpf) {
        const numeros = cpf.replace(/\D/g, '');
        return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    static formatarTelefone(telefone) {
        const numeros = telefone.replace(/\D/g, '');
        
        if (numeros.length === 11) {
            return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (numeros.length === 10) {
            return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return telefone;
    }

    static formatarCEP(cep) {
        const numeros = cep.replace(/\D/g, '');
        return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    // Validações
    static validarCPF(cpf) {
        const numeros = cpf.replace(/\D/g, '');
        return numeros.length === 11;
    }

    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Máscaras para inputs
    static aplicarMascaraCPF(input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3-');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1.$2.');
            }
            
            e.target.value = value;
        });
    }

    static aplicarMascaraTelefone(input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            
            if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{5})(\d{1})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{1})/, '($1) $2');
            }
            
            e.target.value = value;
        });
    }

    static aplicarMascaraCEP(input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 8) {
                value = value.slice(0, 8);
            }
            
            if (value.length > 5) {
                value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }

    // Gerenciamento de Loading
    static showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading">Carregando</div>';
        }
    }

    static hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const loading = container.querySelector('.loading');
            if (loading) {
                loading.remove();
            }
        }
    }

    // ============================================
    // MENSAGENS DO SISTEMA
    // ============================================

    static async mostrarConfirmacao(mensagem) {
        const result = await Swal.fire({
            title: 'Confirmação',
            text: mensagem,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            reverseButtons: true,
            background: '#12372A',
            color: '#FBFADA',
            confirmButtonColor: '#FBFADA',
            confirmButtonTextColor: '#12372A',
            cancelButtonColor: 'rgba(251, 250, 218, 0.06)',
            cancelButtonTextColor: '#FBFADA',
            backdrop: 'rgba(0, 0, 0, 0.7)',
            input: undefined,
            inputAttributes: undefined
        });
        
        return result.isConfirmed;
    }

    static async mostrarSucesso(mensagem) {
        return Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: mensagem,
            showConfirmButton: true,
            confirmButtonText: 'OK',
            background: '#12372A',
            color: '#FBFADA',
            confirmButtonColor: '#FBFADA',
            confirmButtonTextColor: '#12372A',
            backdrop: 'rgba(0, 0, 0, 0.7)',
            input: undefined,
            inputAttributes: undefined
        });
    }

    static async mostrarErro(mensagem) {
        return Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: mensagem,
            confirmButtonText: 'OK',
            background: '#12372A',
            color: '#FBFADA',
            confirmButtonColor: '#FBFADA',
            confirmButtonTextColor: '#12372A',
            backdrop: 'rgba(0, 0, 0, 0.7)',
            input: undefined,
            inputAttributes: undefined
        });
    }

    static async mostrarAviso(mensagem) {
        return Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: mensagem,
            confirmButtonText: 'OK',
            background: '#12372A',
            color: '#FBFADA',
            confirmButtonColor: '#FBFADA',
            confirmButtonTextColor: '#12372A',
            backdrop: 'rgba(0, 0, 0, 0.7)',
            input: undefined,
            inputAttributes: undefined
        });
    }

    // ============================================
    // VIA CEP - CONSULTA DE CEP
    // ============================================

    static async consultarCEP(cep) {
        const cepLimpo = cep.replace(/\D/g, '');
        
        if (cepLimpo.length !== 8) {
            throw new Error('CEP inválido. Digite 8 números.');
        }
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            
            if (!response.ok) {
                throw new Error('Erro ao consultar CEP');
            }
            
            const data = await response.json();
            
            if (data.erro) {
                throw new Error('CEP não encontrado');
            }
            
            return data;
        } catch (error) {
            console.error('Erro ao consultar CEP:', error);
            throw error;
        }
    }

    // ============================================
    // CÁLCULO DE FRETE E DISTÂNCIA
    // ============================================

    static calcularFrete(distanciaKm) {
        const taxaFixa = 2.00;
        const valorPorKm = 3.00;
        const distancia = Math.max(distanciaKm, 1);
        return taxaFixa + (distancia * valorPorKm);
    }

    static calcularTempoEstimado(distanciaKm) {
        const velocidadeMedia = 20;
        const tempoHoras = distanciaKm / velocidadeMedia;
        const tempoMinutos = Math.ceil(tempoHoras * 60);
        return Math.max(tempoMinutos, 5);
    }

    static calcularDistancia(cepOrigem, cepDestino) {
        const hash1 = this.hashCode(cepOrigem);
        const hash2 = this.hashCode(cepDestino);
        const distancia = ((hash1 % 15) + (hash2 % 10) + 5) / 10;
        return Math.round(distancia * 10) / 10;
    }

    static hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}