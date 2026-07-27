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
    // MENSAGENS DO SISTEMA - CORREÇÃO DEFINITIVA
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
            // REMOVER QUALQUER INPUT
            showConfirmButton: true,
            showCancelButton: true,
            // Estilos
            background: '#12372A',
            color: '#FBFADA',
            confirmButtonColor: '#FBFADA',
            confirmButtonTextColor: '#12372A',
            cancelButtonColor: 'rgba(251, 250, 218, 0.06)',
            cancelButtonTextColor: '#FBFADA',
            backdrop: 'rgba(0, 0, 0, 0.7)',
            // Remover HTML extra
            html: null,
            footer: null,
            // FORÇAR NÃO TER INPUT
            input: undefined,
            inputAttributes: undefined,
            inputOptions: undefined,
            inputPlaceholder: undefined,
            inputValue: undefined,
            inputValidator: undefined,
            inputAutoFocus: false,
            inputAutoTrim: false
        });
        
        return result.isConfirmed;
    }

    static async mostrarSucesso(mensagem) {
        return Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: mensagem,
            timer: 2500,
            showConfirmButton: true,
            confirmButtonText: 'OK',
            background: '#12372A',
            color: '#FBFADA',
            confirmButtonColor: '#FBFADA',
            confirmButtonTextColor: '#12372A',
            backdrop: 'rgba(0, 0, 0, 0.7)',
            html: null,
            footer: null,
            // FORÇAR NÃO TER INPUT
            input: undefined,
            inputAttributes: undefined,
            inputOptions: undefined,
            inputPlaceholder: undefined,
            inputValue: undefined,
            inputValidator: undefined,
            inputAutoFocus: false,
            inputAutoTrim: false
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
            html: null,
            footer: null,
            // FORÇAR NÃO TER INPUT
            input: undefined,
            inputAttributes: undefined,
            inputOptions: undefined,
            inputPlaceholder: undefined,
            inputValue: undefined,
            inputValidator: undefined,
            inputAutoFocus: false,
            inputAutoTrim: false
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
            html: null,
            footer: null,
            // FORÇAR NÃO TER INPUT
            input: undefined,
            inputAttributes: undefined,
            inputOptions: undefined,
            inputPlaceholder: undefined,
            inputValue: undefined,
            inputValidator: undefined,
            inputAutoFocus: false,
            inputAutoTrim: false
        });
    }
}