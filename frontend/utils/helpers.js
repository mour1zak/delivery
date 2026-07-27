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
        // Remove tudo que não é número
        const numeros = cpf.replace(/\D/g, '');
        
        // Aplica máscara
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

    // Mensagens do sistema
    static async mostrarConfirmacao(mensagem) {
        const result = await Swal.fire({
            title: 'Confirmação',
            text: mensagem,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            reverseButtons: true
        });
        
        return result.isConfirmed;
    }

    static mostrarSucesso(mensagem) {
        return Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: mensagem,
            timer: 2000,
            showConfirmButton: false
        });
    }

    static mostrarErro(mensagem) {
        return Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: mensagem
        });
    }

    static mostrarAviso(mensagem) {
        return Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: mensagem
        });
    }
}