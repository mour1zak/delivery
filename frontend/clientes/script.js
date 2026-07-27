// Clientes Controller
class ClientesController {
    constructor() {
        this.clientes = [];
        this.clienteId = null; // Para edição
        this.init();
    }

    async init() {
        // Verificar se é página de listagem ou cadastro
        if (window.location.pathname.includes('listagem.html')) {
            await this.initListagem();
        } else if (window.location.pathname.includes('cadastro.html')) {
            await this.initCadastro();
        }
    }

    // ============ LISTAGEM ============
    async initListagem() {
        await this.carregarClientes();
        this.renderizarTabela();
        this.configurarBusca();
    }

    async carregarClientes() {
        try {
            const container = document.getElementById('clientesContent');
            container.innerHTML = '<div class="loading">Carregando</div>';

            this.clientes = await api.get('clientes');
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            Helpers.mostrarErro('Erro ao carregar lista de clientes');
        }
    }

    renderizarTabela(clientesFiltrados = null) {
        const container = document.getElementById('clientesContent');
        const clientes = clientesFiltrados || this.clientes;

        if (!clientes || clientes.length === 0) {
            container.innerHTML = `
            <div class="no-data">
                <p>Nenhum cliente cadastrado</p>
                <a href="cadastro.html" class="btn btn-primary mt-20">Cadastrar Primeiro Cliente</a>
            </div>
        `;
            return;
        }

        container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Telefone</th>
                        <th>Endereço</th>
                        <th>Situação</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientes.map(cliente => `
                        <tr class="${cliente.ativo ? '' : 'cliente-inativo'}">
                            <td>${cliente.nome}</td>
                            <td>${Helpers.formatarCPF(cliente.cpf)}</td>
                            <td>${cliente.telefone}</td>
                            <td>${cliente.endereco}</td>
                            <td>
                                <span class="status-badge ${cliente.ativo ? 'status-ativo' : 'status-inativo'}">
                                    ${cliente.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-secondary btn-sm" onclick="clientesController.editarCliente(${cliente.id})">
                                        Editar
                                    </button>
                                    <button class="btn ${cliente.ativo ? 'btn-warning' : 'btn-success'} btn-sm" 
                                            onclick="clientesController.toggleStatus(${cliente.id})">
                                        ${cliente.ativo ? 'Inativar' : 'Reativar'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    }

    configurarBusca() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();

            if (!termo) {
                this.renderizarTabela();
                return;
            }

            const filtrados = this.clientes.filter(cliente =>
                cliente.nome.toLowerCase().includes(termo) ||
                cliente.cpf.includes(termo) ||
                cliente.telefone.includes(termo)
            );

            this.renderizarTabela(filtrados);
        });
    }

    async toggleStatus(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (!cliente) return;

        const acao = cliente.ativo ? 'inativar' : 'reativar';
        const confirmado = await Helpers.mostrarConfirmacao(
            `Deseja ${acao} o cliente ${cliente.nome}?`
        );

        if (!confirmado) return;

        try {
            await api.patch(`clientes/${id}`, { ativo: !cliente.ativo });

            await Helpers.mostrarSucesso(`Cliente ${acao}do com sucesso!`);
            await this.carregarClientes();
            this.renderizarTabela();
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            Helpers.mostrarErro(`Erro ao ${acao} cliente`);
        }
    }

    editarCliente(id) {
        window.location.href = `cadastro.html?id=${id}`;
    }

    // ============ CADASTRO/EDIÇÃO ============
    async initCadastro() {
        this.configurarMascaras();

        // Verificar se é edição (tem ID na URL)
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            this.clienteId = parseInt(id);
            document.getElementById('formTitle').textContent = '✏️ Editar Cliente';
            await this.carregarDadosCliente();
        }

        this.configurarFormulario();
    }

    configurarMascaras() {
        const cpfInput = document.getElementById('cpf');
        const telefoneInput = document.getElementById('telefone');
        const cepInput = document.getElementById('cep');

        if (cpfInput) Helpers.aplicarMascaraCPF(cpfInput);
        if (telefoneInput) Helpers.aplicarMascaraTelefone(telefoneInput);
        if (cepInput) Helpers.aplicarMascaraCEP(cepInput);
    }

    async carregarDadosCliente() {
        try {
            const cliente = await api.get(`clientes/${this.clienteId}`);

            if (cliente) {
                document.getElementById('nome').value = cliente.nome;
                document.getElementById('cpf').value = Helpers.formatarCPF(cliente.cpf);
                document.getElementById('telefone').value = cliente.telefone;
                document.getElementById('endereco').value = cliente.endereco;
                document.getElementById('referencia').value = cliente.referencia || '';
                document.getElementById('bairro').value = cliente.bairro || '';
                document.getElementById('cep').value = cliente.cep || '';
            }
        } catch (error) {
            console.error('Erro ao carregar cliente:', error);
            Helpers.mostrarErro('Erro ao carregar dados do cliente');
            window.location.href = 'listagem.html';
        }
    }

    configurarFormulario() {
        const form = document.getElementById('clienteForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarCliente();
        });
    }

    async validarCPFUnico(cpf) {
        const cpfLimpo = cpf.replace(/\D/g, '');

        // Buscar todos os clientes (para verificar duplicidade)
        const clientes = await api.get('clientes');

        const duplicado = clientes.find(c => {
            const cpfCliente = c.cpf.replace(/\D/g, '');
            return cpfCliente === cpfLimpo && c.id !== this.clienteId;
        });

        return !duplicado;
    }

    async salvarCliente() {
        const formData = {
            nome: document.getElementById('nome').value.trim(),
            cpf: document.getElementById('cpf').value,
            telefone: document.getElementById('telefone').value,
            endereco: document.getElementById('endereco').value.trim(),
            referencia: document.getElementById('referencia').value.trim(),
            bairro: document.getElementById('bairro').value.trim(),
            cep: document.getElementById('cep').value
        };

        // Validações
        if (!formData.nome) {
            Helpers.mostrarAviso('Nome é obrigatório');
            return;
        }

        if (!Helpers.validarCPF(formData.cpf)) {
            Helpers.mostrarAviso('CPF inválido. Digite 11 números');
            return;
        }

        if (!formData.telefone || formData.telefone.replace(/\D/g, '').length < 10) {
            Helpers.mostrarAviso('Telefone inválido');
            return;
        }

        if (!formData.endereco) {
            Helpers.mostrarAviso('Endereço é obrigatório');
            return;
        }

        // Validar CPF único
        const cpfUnico = await this.validarCPFUnico(formData.cpf);
        if (!cpfUnico) {
            Helpers.mostrarErro('CPF já cadastrado para outro cliente');
            return;
        }

        try {
            if (this.clienteId) {
                // Edição
                await api.put(`clientes/${this.clienteId}`, {
                    ...formData,
                    ativo: true, // Mantém ativo na edição
                    id: this.clienteId
                });

                await Helpers.mostrarSucesso('Cliente atualizado com sucesso!');
            } else {
                // Criação
                await api.post('clientes', {
                    ...formData,
                    ativo: true // Cliente criado como ativo
                });

                await Helpers.mostrarSucesso('Cliente cadastrado com sucesso!');
            }

            // Redirecionar para listagem
            setTimeout(() => {
                window.location.href = 'listagem.html';
            }, 1000);
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            Helpers.mostrarErro('Erro ao salvar cliente');
        }
    }
}

// Inicializar controller
let clientesController;
document.addEventListener('DOMContentLoaded', () => {
    clientesController = new ClientesController();
});