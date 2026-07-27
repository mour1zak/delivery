// Dashboard Controller
class DashboardController {
    constructor() {
        this.pedidos = [];
        this.clientes = [];
        this.produtos = [];
        this.init();
    }

    async init() {
        try {
            await this.carregarDados();
            this.renderizarCards();
            this.renderizarFaturamento();
            this.renderizarRankingProdutos();
            this.renderizarRankingClientes();
            this.renderizarUltimosPedidos();
            this.inicializarGPS();
            this.configurarFiltro();
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
            Helpers.mostrarErro('Erro ao carregar dados do dashboard');
        }
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
            throw error;
        }
    }

    getPedidosEntregues() {
        return this.pedidos.filter(p => p.status === CONSTANTS.STATUS_PEDIDO.ENTREGUE);
    }

    getPedidosByStatus(status) {
        if (!status) return this.pedidos;
        return this.pedidos.filter(p => p.status === status);
    }

    contarPedidosPorStatus() {
        const contagem = {};
        
        Object.values(CONSTANTS.STATUS_PEDIDO).forEach(status => {
            contagem[status] = this.pedidos.filter(p => p.status === status).length;
        });
        
        return contagem;
    }

    calcularFaturamentoTotal() {
        const pedidosEntregues = this.getPedidosEntregues();
        return pedidosEntregues.reduce((total, pedido) => total + pedido.valorTotal, 0);
    }

    calcularFaturamentoPorCategoria() {
        const pedidosEntregues = this.getPedidosEntregues();
        const faturamento = {};
        
        // Inicializar categorias
        CONSTANTS.CATEGORIAS_PRODUTO.forEach(cat => {
            faturamento[cat] = 0;
        });
        
        pedidosEntregues.forEach(pedido => {
            if (pedido.itens) {
                pedido.itens.forEach(item => {
                    const produto = this.produtos.find(p => p.id === item.produtoId);
                    if (produto) {
                        faturamento[produto.categoria] = (faturamento[produto.categoria] || 0) + (item.precoUnitario * item.quantidade);
                    }
                });
            }
        });
        
        return faturamento;
    }

    getRankingProdutos(limit = 10) {
        const pedidosEntregues = this.getPedidosEntregues();
        const ranking = {};
        
        pedidosEntregues.forEach(pedido => {
            if (pedido.itens) {
                pedido.itens.forEach(item => {
                    ranking[item.produtoId] = (ranking[item.produtoId] || 0) + item.quantidade;
                });
            }
        });
        
        // Converter para array e ordenar
        return Object.entries(ranking)
            .map(([produtoId, quantidade]) => ({
                produtoId: parseInt(produtoId),
                quantidade,
                nome: this.getNomeProduto(parseInt(produtoId))
            }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, limit);
    }

    getRankingClientes(limit = 10) {
        const pedidosEntregues = this.getPedidosEntregues();
        const ranking = {};
        
        pedidosEntregues.forEach(pedido => {
            const cliente = this.clientes.find(c => c.id === pedido.clienteId && c.ativo);
            if (cliente) {
                ranking[pedido.clienteId] = (ranking[pedido.clienteId] || 0) + pedido.valorTotal;
            }
        });
        
        return Object.entries(ranking)
            .map(([clienteId, valor]) => ({
                clienteId: parseInt(clienteId),
                valor,
                nome: this.getNomeCliente(parseInt(clienteId))
            }))
            .sort((a, b) => b.valor - a.valor)
            .slice(0, limit);
    }

    calcularTicketMedio() {
        const pedidosEntregues = this.getPedidosEntregues();
        if (pedidosEntregues.length === 0) return null;
        
        const faturamentoTotal = this.calcularFaturamentoTotal();
        return faturamentoTotal / pedidosEntregues.length;
    }

    getNomeCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        return cliente ? cliente.nome : 'Cliente não encontrado';
    }

    getNomeProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        return produto ? produto.nome : 'Produto não encontrado';
    }

    renderizarCards() {
        const container = document.getElementById('statusCards');
        const contagem = this.contarPedidosPorStatus();
        
        const statusConfig = {
            [CONSTANTS.STATUS_PEDIDO.RECEBIDO]: { icon: '📥', color: 'status-recebido', label: 'Recebidos' },
            [CONSTANTS.STATUS_PEDIDO.EM_PREPARO]: { icon: '👨‍🍳', color: 'status-em-preparo', label: 'Em Preparo' },
            [CONSTANTS.STATUS_PEDIDO.SAIU_PARA_ENTREGA]: { icon: '🛵', color: 'status-saiu-entrega', label: 'Em Entrega' },
            [CONSTANTS.STATUS_PEDIDO.ENTREGUE]: { icon: '✅', color: 'status-entregue', label: 'Entregues' },
            [CONSTANTS.STATUS_PEDIDO.CANCELADO]: { icon: '❌', color: 'status-cancelado', label: 'Cancelados' }
        };
        
        container.innerHTML = Object.entries(statusConfig).map(([status, config]) => `
            <div class="status-card ${config.color}">
                <div class="status-icon">${config.icon}</div>
                <h3>${contagem[status]}</h3>
                <p>${config.label}</p>
            </div>
        `).join('');
    }

    renderizarFaturamento() {
        const container = document.getElementById('faturamentoContent');
        
        if (this.pedidos.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhum dado disponível</div>';
            return;
        }
        
        const faturamentoTotal = this.calcularFaturamentoTotal();
        const faturamentoCategorias = this.calcularFaturamentoPorCategoria();
        const ticketMedio = this.calcularTicketMedio();
        
        container.innerHTML = `
            <div class="faturamento-details">
                <div class="faturamento-item">
                    <h4>💰 Faturamento Total</h4>
                    <p>${Helpers.formatarMoeda(faturamentoTotal)}</p>
                </div>
                <div class="faturamento-item">
                    <h4>🎫 Ticket Médio</h4>
                    <p>${ticketMedio ? Helpers.formatarMoeda(ticketMedio) : 'N/D'}</p>
                </div>
                ${Object.entries(faturamentoCategorias).map(([categoria, valor]) => `
                    <div class="faturamento-item">
                        <h4>${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h4>
                        <p>${Helpers.formatarMoeda(valor)}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderizarRankingProdutos() {
        const container = document.getElementById('rankingProdutosContent');
        const ranking = this.getRankingProdutos();
        
        if (ranking.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhum dado disponível</div>';
            return;
        }
        
        container.innerHTML = `
            <ul class="ranking-list">
                ${ranking.map((item, index) => `
                    <li class="ranking-item">
                        <span class="ranking-position">#${index + 1}</span>
                        <span>${item.nome}</span>
                        <span class="badge badge-info">${item.quantidade} vendidos</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    renderizarRankingClientes() {
        const container = document.getElementById('rankingClientesContent');
        const ranking = this.getRankingClientes();
        
        if (ranking.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhum dado disponível</div>';
            return;
        }
        
        container.innerHTML = `
            <ul class="ranking-list">
                ${ranking.map((item, index) => `
                    <li class="ranking-item">
                        <span class="ranking-position">#${index + 1}</span>
                        <span>${item.nome}</span>
                        <span>${Helpers.formatarMoeda(item.valor)}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    renderizarUltimosPedidos(status = '') {
        const container = document.getElementById('ultimosPedidosContent');
        let pedidos = this.getPedidosByStatus(status);
        
        // Ordenar por data (mais recentes primeiro) e limitar a 10
        pedidos = pedidos
            .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
            .slice(0, 10);
        
        if (pedidos.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhum pedido encontrado</div>';
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
                            <th>Valor</th>
                            <th>Detalhes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidos.map(pedido => {
                            const statusClass = this.getStatusClass(pedido.status);
                            return `
                                <tr>
                                    <td>${this.getNomeCliente(pedido.clienteId)}</td>
                                    <td>${Helpers.formatarData(pedido.dataHora)}</td>
                                    <td><span class="badge ${statusClass}">${pedido.status}</span></td>
                                    <td>${Helpers.formatarMoeda(pedido.valorTotal)}</td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="dashboard.verDetalhesPedido(${pedido.id})">
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
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

    configurarFiltro() {
        const select = document.getElementById('statusFilter');
        
        // Popular opções
        select.innerHTML = `
            <option value="">Todos os Status</option>
            ${Object.values(CONSTANTS.STATUS_PEDIDO).map(status => `
                <option value="${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</option>
            `).join('')}
        `;
        
        select.addEventListener('change', (e) => {
            this.renderizarUltimosPedidos(e.target.value);
        });
    }

    inicializarGPS() {
        const pedidosEmEntrega = this.pedidos.filter(
            p => p.status === CONSTANTS.STATUS_PEDIDO.SAIU_PARA_ENTREGA
        );
        
        if (pedidosEmEntrega.length > 0) {
            document.getElementById('gpsSection').style.display = 'block';
            this.simularGPS(pedidosEmEntrega);
        }
    }

    simularGPS(pedidos) {
        const container = document.getElementById('gpsContent');
        
        container.innerHTML = pedidos.map(pedido => {
            const cliente = this.clientes.find(c => c.id === pedido.clienteId);
            return `
                <div class="gps-info mb-20">
                    <h4>Pedido #${pedido.id} - ${cliente ? cliente.nome : 'Cliente'}</h4>
                    <p>📍 Distância estimada: ${Math.floor(Math.random() * 5) + 1} km</p>
                    <p>⏱️ Tempo estimado: ${Math.floor(Math.random() * 20) + 5} min</p>
                    <div class="gps-map">
                        <div class="gps-marker" style="left: ${Math.random() * 80}%; top: ${Math.random() * 80}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async verDetalhesPedido(pedidoId) {
        // Implementar visualização detalhada do pedido
        const pedido = this.pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;
        
        const cliente = this.clientes.find(c => c.id === pedido.clienteId);
        
        let html = `
            <div style="text-align: left;">
                <p><strong>Cliente:</strong> ${cliente ? cliente.nome : 'N/A'}</p>
                <p><strong>Data:</strong> ${Helpers.formatarData(pedido.dataHora)}</p>
                <p><strong>Status:</strong> ${pedido.status}</p>
                <p><strong>Valor Total:</strong> ${Helpers.formatarMoeda(pedido.valorTotal)}</p>
                <h4>Itens:</h4>
                <ul>
        `;
        
        if (pedido.itens) {
            pedido.itens.forEach(item => {
                const produto = this.produtos.find(p => p.id === item.produtoId);
                html += `<li>${produto ? produto.nome : 'Produto'} - Qtd: ${item.quantidade} - ${Helpers.formatarMoeda(item.precoUnitario)}</li>`;
            });
        }
        
        html += '</ul></div>';
        
        await Swal.fire({
            title: `Pedido #${pedidoId}`,
            html: html,
            width: '600px',
            confirmButtonText: 'Fechar'
        });
    }
}

// Inicializar dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardController();
});