// Pedidos Controller
class PedidosController {
    constructor() {
        this.pedidos = [];
        this.clientes = [];
        this.produtos = [];
        this.pedidoId = null;
        this.itens = [];
        this.paginaAtual = 1;
        this.itensPorPagina = 10;
        this.init();
    }

    async init() {
        if (window.location.pathname.includes('listagem.html')) {
            await this.initListagem();
        } else if (window.location.pathname.includes('cadastro.html')) {
            await this.initCadastro();
        }
    }

    // ============ LISTAGEM ============
    async initListagem() {
        await this.carregarDados();
        this.renderizarTabela();
        this.configurarFiltros();
        this.configurarBusca();
    }

    async carregarDados() {
        try {
            const [pedidos, clientes, produtos] = await Promise.all([
                api.get('pedidos'),
                api.get('clientes'),
                api.get('produtos')
            ]);
            
            this.pedidos = pedidos || [];
            this.clientes = clientes || [];
            this.produtos = produtos || [];
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Helpers.mostrarErro('Erro ao carregar pedidos');
        }
    }

    getNomeCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        return cliente ? cliente.nome : 'Cliente não encontrado';
    }

    getStatusClass(status) {
        const classes = {
            [CONSTANTS.STATUS_PEDIDO.RECEBIDO]: 'badge-info',
            [CONSTANTS.STATUS_PEDIDO.EM_PREPARO]: 'badge-warning',
            [CONSTANTS.STATUS_PEDIDO.SAIU_PARA_ENTREGA]: 'badge-primary',
            [CONSTANTS.STATUS_PEDIDO.ENTREGUE]: 'badge-success',
            [CONSTANTS.STATUS_PEDIDO.CANCELADO]: 'badge-danger'
        };
        return classes[status] || 'badge-secondary';
    }

    getPedidosFiltrados() {
        let pedidos = [...this.pedidos];
        
        // Filtro por status
        const statusFilter = document.getElementById('statusFilter')?.value;
        if (statusFilter) {
            pedidos = pedidos.filter(p => p.status === statusFilter);
        }
        
        // Filtro por busca
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim();
        if (searchTerm) {
            pedidos = pedidos.filter(p => {
                const cliente = this.clientes.find(c => c.id === p.clienteId);
                return cliente && cliente.nome.toLowerCase().includes(searchTerm);
            });
        }
        
        // Ordenar por data (mais recentes primeiro)
        pedidos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
        
        return pedidos;
    }

    getPedidosPaginados() {
        const pedidosFiltrados = this.getPedidosFiltrados();
        const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
        const fim = inicio + this.itensPorPagina;
        
        return {
            pedidos: pedidosFiltrados.slice(inicio, fim),
            total: pedidosFiltrados.length,
            totalPaginas: Math.ceil(pedidosFiltrados.length / this.itensPorPagina)
        };
    }

    renderizarTabela() {
        const container = document.getElementById('pedidosContent');
        const { pedidos, total, totalPaginas } = this.getPedidosPaginados();
        
        if (!pedidos || pedidos.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <p>📭 Nenhum pedido encontrado</p>
                    <a href="cadastro.html" class="btn btn-primary mt-20">Criar Primeiro Pedido</a>
                </div>
            `;
            document.getElementById('pagination').innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Data/Hora</th>
                            <th>Status</th>
                            <th>Valor Total</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidos.map(pedido => {
                            const statusClass = this.getStatusClass(pedido.status);
                            const actions = this.getAcoesPermitidas(pedido);
                            
                            return `
                                <tr>
                                    <td>${this.getNomeCliente(pedido.clienteId)}</td>
                                    <td>${Helpers.formatarData(pedido.dataHora)}</td>
                                    <td>
                                        <span class="badge ${statusClass}">${pedido.status}</span>
                                        ${pedido.motivoCancelamento ? `<br><small class="motivo-cancelamento">${pedido.motivoCancelamento}</small>` : ''}
                                    </td>
                                    <td>${Helpers.formatarMoeda(pedido.valorTotal)}</td>
                                    <td>
                                        <div class="action-buttons">
                                            ${actions.editar ? `<button class="btn btn-secondary btn-sm" onclick="pedidosController.editarPedido(${pedido.id})">✏️ Editar</button>` : ''}
                                            ${actions.avancar ? `<button class="btn btn-success btn-sm" onclick="pedidosController.avancarStatus(${pedido.id})">▶️ Avançar</button>` : ''}
                                            ${actions.cancelar ? `<button class="btn btn-danger btn-sm" onclick="pedidosController.cancelarPedido(${pedido.id})">❌ Cancelar</button>` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        this.renderizarPaginacao(totalPaginas);
    }

    getAcoesPermitidas(pedido) {
        const acoes = {
            editar: false,
            avancar: false,
            cancelar: false
        };
        
        switch (pedido.status) {
            case CONSTANTS.STATUS_PEDIDO.RECEBIDO:
                acoes.editar = true;
                acoes.avancar = true;
                acoes.cancelar = true;
                break;
            case CONSTANTS.STATUS_PEDIDO.EM_PREPARO:
                acoes.avancar = true;
                acoes.cancelar = true;
                break;
            case CONSTANTS.STATUS_PEDIDO.SAIU_PARA_ENTREGA:
                acoes.avancar = true;
                break;
            // entregue e cancelado: sem ações
        }
        
        return acoes;
    }

    renderizarPaginacao(totalPaginas) {
        const container = document.getElementById('pagination');
        
        if (totalPaginas <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '';
        for (let i = 1; i <= totalPaginas; i++) {
            html += `
                <button class="page-btn ${i === this.paginaAtual ? 'active' : ''}" 
                        onclick="pedidosController.mudarPagina(${i})">
                    ${i}
                </button>
            `;
        }
        
        container.innerHTML = html;
    }

    mudarPagina(pagina) {
        this.paginaAtual = pagina;
        this.renderizarTabela();
    }

    configurarFiltros() {
        // Filtro por status
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.innerHTML = `
                <option value="">Todos os Status</option>
                ${Object.values(CONSTANTS.STATUS_PEDIDO).map(status => `
                    <option value="${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</option>
                `).join('')}
            `;
            
            statusFilter.addEventListener('change', () => {
                this.paginaAtual = 1;
                this.renderizarTabela();
            });
        }
    }

    configurarBusca() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', () => {
            this.paginaAtual = 1;
            this.renderizarTabela();
        });
    }

    async avancarStatus(id) {
        const pedido = this.pedidos.find(p => p.id === id);
        if (!pedido) return;
        
        const indexAtual = CONSTANTS.STATUS_SEQUENCIA.indexOf(pedido.status);
        
        if (indexAtual === -1 || indexAtual >= CONSTANTS.STATUS_SEQUENCIA.length - 1) {
            Helpers.mostrarAviso('Não é possível avançar o status deste pedido');
            return;
        }
        
        const novoStatus = CONSTANTS.STATUS_SEQUENCIA[indexAtual + 1];
        const confirmado = await Helpers.mostrarConfirmacao(
            `Avançar pedido #${id} para "${novoStatus}"?`
        );
        
        if (!confirmado) return;
        
        try {
            await api.patch(`pedidos/${id}`, { status: novoStatus });
            
            await Helpers.mostrarSucesso(`Pedido #${id} agora está "${novoStatus}"`);
            await this.carregarDados();
            this.renderizarTabela();
        } catch (error) {
            console.error('Erro ao avançar status:', error);
            Helpers.mostrarErro('Erro ao avançar status do pedido');
        }
    }

    async cancelarPedido(id) {
        const pedido = this.pedidos.find(p => p.id === id);
        if (!pedido) return;
        
        // Solicitar motivo
        const { value: motivo } = await Swal.fire({
            title: 'Cancelar Pedido',
            text: `Selecione o motivo do cancelamento do pedido #${id}`,
            input: 'select',
            inputOptions: {
                ...CONSTANTS.MOTIVOS_CANCELAMENTO.reduce((acc, motivo) => {
                    acc[motivo] = motivo;
                    return acc;
                }, {})
            },
            inputPlaceholder: 'Selecione um motivo',
            showCancelButton: true,
            confirmButtonText: 'Cancelar Pedido',
            cancelButtonText: 'Voltar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Selecione um motivo para o cancelamento';
                }
            }
        });
        
        if (!motivo) return;
        
        try {
            await api.patch(`pedidos/${id}`, {
                status: CONSTANTS.STATUS_PEDIDO.CANCELADO,
                motivoCancelamento: motivo
            });
            
            await Helpers.mostrarSucesso(`Pedido #${id} cancelado com sucesso`);
            await this.carregarDados();
            this.renderizarTabela();
        } catch (error) {
            console.error('Erro ao cancelar pedido:', error);
            Helpers.mostrarErro('Erro ao cancelar pedido');
        }
    }

    editarPedido(id) {
        window.location.href = `cadastro.html?id=${id}`;
    }

    // ============ CADASTRO/EDIÇÃO ============
    async initCadastro() {
        await this.carregarClientesAtivos();
        await this.carregarProdutosDisponiveis();
        
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (id) {
            this.pedidoId = parseInt(id);
            document.getElementById('formTitle').textContent = '✏️ Editar Pedido';
            await this.carregarDadosPedido();
        }
        
        this.configurarFormulario();
    }

    async carregarClientesAtivos() {
        try {
            const clientes = await api.get('clientes');
            this.clientes = clientes.filter(c => c.ativo);
            
            const select = document.getElementById('clienteId');
            if (this.clientes.length === 0) {
                select.innerHTML = '<option value="">Nenhum cliente ativo. Cadastre um cliente primeiro.</option>';
                return;
            }
            
            select.innerHTML = `
                <option value="">Selecione um cliente...</option>
                ${this.clientes.map(c => `<option value="${c.id}">${c.nome} - ${c.telefone}</option>`).join('')}
            `;
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            Helpers.mostrarErro('Erro ao carregar clientes');
        }
    }

    async carregarProdutosDisponiveis() {
        try {
            const produtos = await api.get('produtos');
            this.produtos = produtos.filter(p => p.disponivel);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            Helpers.mostrarErro('Erro ao carregar produtos');
        }
    }

    async carregarDadosPedido() {
        try {
            const pedido = await api.get(`pedidos/${this.pedidoId}`);
            
            if (pedido) {
                document.getElementById('clienteId').value = pedido.clienteId;
                
                // Carregar itens existentes
                this.itens = pedido.itens || [];
                this.renderizarItens();
            }
        } catch (error) {
            console.error('Erro ao carregar pedido:', error);
            Helpers.mostrarErro('Erro ao carregar dados do pedido');
            window.location.href = 'listagem.html';
        }
    }

    adicionarItem() {
        if (this.produtos.length === 0) {
            Helpers.mostrarAviso('Não há produtos disponíveis');
            return;
        }
        
        const item = {
            id: Date.now(), // ID temporário
            produtoId: this.produtos[0].id,
            quantidade: 1,
            precoUnitario: this.produtos[0].preco,
            observacoes: ''
        };
        
        this.itens.push(item);
        this.renderizarItens();
        this.atualizarValorTotal();
    }

    removerItem(id) {
        this.itens = this.itens.filter(item => item.id !== id);
        this.renderizarItens();
        this.atualizarValorTotal();
    }

    atualizarItem(id, field, value) {
        const item = this.itens.find(i => i.id === id);
        if (!item) return;
        
        if (field === 'produtoId') {
            const produto = this.produtos.find(p => p.id === parseInt(value));
            if (produto) {
                item.produtoId = produto.id;
                item.precoUnitario = produto.preco;
            }
        } else if (field === 'quantidade') {
            item.quantidade = parseInt(value) || 1;
        } else if (field === 'observacoes') {
            item.observacoes = value;
        }
        
        this.atualizarValorTotal();
    }

    renderizarItens() {
        const container = document.getElementById('itensContainer');
        
        if (this.itens.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum item adicionado</p>';
            return;
        }
        
        container.innerHTML = this.itens.map(item => {
            const produtoAtual = this.produtos.find(p => p.id === item.produtoId);
            
            return `
                <div class="item-row">
                    <div class="form-group">
                        <label>Produto</label>
                        <select onchange="pedidosController.atualizarItem(${item.id}, 'produtoId', this.value)">
                            ${this.produtos.map(p => `
                                <option value="${p.id}" ${p.id === item.produtoId ? 'selected' : ''}>
                                    ${p.nome} - ${Helpers.formatarMoeda(p.preco)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Quantidade</label>
                        <input type="number" min="1" value="${item.quantidade}" 
                               onchange="pedidosController.atualizarItem(${item.id}, 'quantidade', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label>Preço Unit.</label>
                        <input type="text" value="${Helpers.formatarMoeda(item.precoUnitario)}" disabled>
                    </div>
                    
                    <button type="button" class="btn btn-danger btn-sm" 
                            onclick="pedidosController.removerItem(${item.id})">
                        🗑️
                    </button>
                </div>
            `;
        }).join('');
        
        this.atualizarValorTotal();
    }

    calcularValorTotal() {
        return this.itens.reduce((total, item) => {
            return total + (item.precoUnitario * item.quantidade);
        }, 0);
    }

    atualizarValorTotal() {
        const total = this.calcularValorTotal();
        document.getElementById('valorTotal').textContent = Helpers.formatarMoeda(total);
    }

    configurarFormulario() {
        const form = document.getElementById('pedidoForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarPedido();
        });
    }

    async salvarPedido() {
        const clienteId = parseInt(document.getElementById('clienteId').value);
        
        // Validações
        if (!clienteId) {
            Helpers.mostrarAviso('Selecione um cliente');
            return;
        }
        
        if (this.itens.length === 0) {
            Helpers.mostrarAviso('Adicione pelo menos um item ao pedido');
            return;
        }
        
        // Verificar se há itens com quantidade inválida
        const itemInvalido = this.itens.find(item => !item.quantidade || item.quantidade < 1);
        if (itemInvalido) {
            Helpers.mostrarAviso('Todos os itens devem ter quantidade maior que zero');
            return;
        }
        
        const pedidoData = {
            clienteId,
            dataHora: new Date().toISOString(),
            status: CONSTANTS.STATUS_PEDIDO.RECEBIDO,
            valorTotal: this.calcularValorTotal(),
            itens: this.itens.map(item => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
                observacoes: item.observacoes
            })),
            motivoCancelamento: null
        };
        
        try {
            if (this.pedidoId) {
                // Edição - manter status atual
                const pedidoAtual = await api.get(`pedidos/${this.pedidoId}`);
                pedidoData.status = pedidoAtual.status;
                pedidoData.dataHora = pedidoAtual.dataHora;
                
                await api.put(`pedidos/${this.pedidoId}`, {
                    ...pedidoData,
                    id: this.pedidoId
                });
                
                await Helpers.mostrarSucesso('Pedido atualizado com sucesso!');
            } else {
                // Criação
                await api.post('pedidos', pedidoData);
                await Helpers.mostrarSucesso('Pedido criado com sucesso!');
            }
            
            setTimeout(() => {
                window.location.href = 'listagem.html';
            }, 1000);
        } catch (error) {
            console.error('Erro ao salvar pedido:', error);
            Helpers.mostrarErro('Erro ao salvar pedido');
        }
    }
}

// Inicializar controller
let pedidosController;
document.addEventListener('DOMContentLoaded', () => {
    pedidosController = new PedidosController();
});