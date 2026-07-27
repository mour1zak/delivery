// Dashboard Controller - VERSÃO BURGUR #12372A COM CARROSSEL DE CLIENTES
class DashboardController {
    constructor() {
        this.pedidos = [];
        this.clientes = [];
        this.produtos = [];
        this.cache = {};
        this.init();
    }

    async init() {
        try {
            // Mostrar skeleton loading
            this.mostrarSkeletonLoading();
            
            // Carregar dados em paralelo
            await this.carregarDados();
            
            // Renderizar tudo de uma vez (mais rápido)
            this.renderizarTodos();
            
        } catch (error) {
            console.error('Erro ao inicializar dashboard:', error);
            Helpers.mostrarErro('Erro ao carregar dados do dashboard');
        }
    }

    mostrarSkeletonLoading() {
        // Status Cards
        document.getElementById('statusCards').innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
        
        // Faturamento
        document.getElementById('faturamentoContent').innerHTML = `
            <div class="loading-skeleton">
                <div class="skeleton-row">
                    <div class="skeleton skeleton-card" style="height:160px;"></div>
                    <div class="skeleton skeleton-card" style="height:160px;"></div>
                </div>
                <div class="skeleton-row">
                    <div class="skeleton skeleton-card-small"></div>
                    <div class="skeleton skeleton-card-small"></div>
                    <div class="skeleton skeleton-card-small"></div>
                    <div class="skeleton skeleton-card-small"></div>
                </div>
            </div>
        `;
        
        // Ranking Produtos
        document.getElementById('rankingProdutosContent').innerHTML = `
            <div class="loading-skeleton">
                ${Array(5).fill(0).map(() => `
                    <div class="skeleton skeleton-ranking-item"></div>
                `).join('')}
            </div>
        `;
        
        // Ranking Clientes
        document.getElementById('rankingClientesContent').innerHTML = `
            <div class="loading-skeleton">
                ${Array(5).fill(0).map(() => `
                    <div class="skeleton skeleton-ranking-item"></div>
                `).join('')}
            </div>
        `;
        
        // Últimos Pedidos
        document.getElementById('ultimosPedidosContent').innerHTML = `
            <div class="loading-skeleton">
                ${Array(5).fill(0).map(() => `
                    <div class="skeleton skeleton-ranking-item"></div>
                `).join('')}
            </div>
        `;
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
            
            this.cache = { pedidos: this.pedidos, clientes: this.clientes, produtos: this.produtos };
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            throw error;
        }
    }

    renderizarTodos() {
        this.renderizarCards();
        this.renderizarFaturamento();
        this.renderizarRankingProdutos();
        this.renderizarRankingClientes();
        this.renderizarUltimosPedidos();
        this.inicializarGPS();
        this.configurarFiltro();
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
            [CONSTANTS.STATUS_PEDIDO.RECEBIDO]: { 
                label: 'RECEBIDOS',
                bg: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            },
            [CONSTANTS.STATUS_PEDIDO.EM_PREPARO]: { 
                label: 'EM PREPARO',
                bg: 'https://images.pexels.com/photos/31094822/pexels-photo-31094822.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            },
            [CONSTANTS.STATUS_PEDIDO.SAIU_PARA_ENTREGA]: { 
                label: 'EM ENTREGA',
                bg: 'https://images.pexels.com/photos/31600263/pexels-photo-31600263.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            },
            [CONSTANTS.STATUS_PEDIDO.ENTREGUE]: { 
                label: 'ENTREGUES',
                bg: 'https://images.pexels.com/photos/12725423/pexels-photo-12725423.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            },
            [CONSTANTS.STATUS_PEDIDO.CANCELADO]: { 
                label: 'CANCELADOS',
                bg: 'https://images.pexels.com/photos/6294297/pexels-photo-6294297.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            }
        };
        
        container.innerHTML = Object.entries(statusConfig).map(([status, config]) => {
            return `
                <div class="status-card">
                    <div class="card-bg" style="background-image: url('${config.bg}');" loading="lazy"></div>
                    <div class="overlay"></div>
                    <div class="card-content">
                        <p>${config.label}</p>
                        <h3>${contagem[status] || 0}</h3>
                    </div>
                </div>
            `;
        }).join('');
        
        this.lazyLoadImages();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('.card-bg, .item-bg');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        });
        
        images.forEach(img => observer.observe(img));
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
        
        const imagens = {
            total: 'https://images.pexels.com/photos/259234/pexels-photo-259234.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
            ticket: 'https://images.pexels.com/photos/6266453/pexels-photo-6266453.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
            lanche: 'https://images.pexels.com/photos/34146358/pexels-photo-34146358.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
            bebida: 'https://images.pexels.com/photos/28525184/pexels-photo-28525184.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
            sobremesa: 'https://images.pexels.com/photos/37026352/pexels-photo-37026352.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
            acompanhamento: 'https://images.pexels.com/photos/5860680/pexels-photo-5860680.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
        };
        
        container.innerHTML = `
            <div class="faturamento-details">
                <div class="faturamento-item destaque">
                    <div class="item-bg" style="background-image: url('${imagens.total}');" loading="lazy"></div>
                    <div class="item-overlay"></div>
                    <div class="item-content">
                        <h4>Faturamento Total</h4>
                        <p class="valor">${Helpers.formatarMoeda(faturamentoTotal)}</p>
                    </div>
                </div>
                
                <div class="faturamento-item destaque">
                    <div class="item-bg" style="background-image: url('${imagens.ticket}');" loading="lazy"></div>
                    <div class="item-overlay"></div>
                    <div class="item-content">
                        <h4>Ticket Médio</h4>
                        <p class="valor">${ticketMedio ? Helpers.formatarMoeda(ticketMedio) : 'N/D'}</p>
                    </div>
                </div>
                
                <div class="faturamento-item">
                    <div class="item-bg" style="background-image: url('${imagens.lanche}');" loading="lazy"></div>
                    <div class="item-overlay"></div>
                    <div class="item-content">
                        <h4>Lanche</h4>
                        <p class="valor">${Helpers.formatarMoeda(faturamentoCategorias.lanche || 0)}</p>
                    </div>
                </div>
                
                <div class="faturamento-item">
                    <div class="item-bg" style="background-image: url('${imagens.bebida}');" loading="lazy"></div>
                    <div class="item-overlay"></div>
                    <div class="item-content">
                        <h4>Bebida</h4>
                        <p class="valor">${Helpers.formatarMoeda(faturamentoCategorias.bebida || 0)}</p>
                    </div>
                </div>
                
                <div class="faturamento-item">
                    <div class="item-bg" style="background-image: url('${imagens.sobremesa}');" loading="lazy"></div>
                    <div class="item-overlay"></div>
                    <div class="item-content">
                        <h4>Sobremesa</h4>
                        <p class="valor">${Helpers.formatarMoeda(faturamentoCategorias.sobremesa || 0)}</p>
                    </div>
                </div>
                
                <div class="faturamento-item">
                    <div class="item-bg" style="background-image: url('${imagens.acompanhamento}');" loading="lazy"></div>
                    <div class="item-overlay"></div>
                    <div class="item-content">
                        <h4>Acompanhamento</h4>
                        <p class="valor">${Helpers.formatarMoeda(faturamentoCategorias.acompanhamento || 0)}</p>
                    </div>
                </div>
            </div>
        `;
        
        this.lazyLoadImages();
    }

    renderizarRankingProdutos() {
        const container = document.getElementById('rankingProdutosContent');
        const ranking = this.getRankingProdutos();
        
        if (ranking.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhum dado disponível</div>';
            return;
        }
        
        if (ranking.length <= 4) {
            container.innerHTML = `
                <div class="ranking-cards">
                    ${ranking.map((item, index) => `
                        <div class="ranking-card-item">
                            <div class="rank-number">${index + 1}</div>
                            <div class="rank-name">${item.nome.toUpperCase()}</div>
                            <div class="rank-value">${item.quantidade} vendidos</div>
                        </div>
                    `).join('')}
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <ul class="ranking-list">
                ${ranking.map((item, index) => `
                    <li class="ranking-item">
                        <span class="ranking-position">${index + 1}</span>
                        <span class="rank-name-table">${item.nome.toUpperCase()}</span>
                        <span class="rank-value-table">${item.quantidade} vendidos</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // ============================================
    // RANKING DE CLIENTES - CARROSSEL COM FLIP
    // ============================================

   // ============================================
// RANKING DE CLIENTES - CARROSSEL VERTICAL COM FLIP AO CLICAR
// ============================================

renderizarRankingClientes() {
    const container = document.getElementById('rankingClientesContent');
    const ranking = this.getRankingClientes();
    
    if (ranking.length === 0) {
        container.innerHTML = `
            <div class="clientes-empty">
                <div class="empty-icon">👥</div>
                <p>Nenhum cliente com pedidos entregues ainda</p>
            </div>
        `;
        return;
    }
    
    if (ranking.length <= 3) {
        container.innerHTML = this.renderizarClientesCards(ranking);
        return;
    }
    
    container.innerHTML = this.renderizarClientesCarrossel(ranking);
    setTimeout(() => this.inicializarCarrossel(), 100);
}

renderizarClientesCards(ranking) {
    const medalhas = ['🥇', '🥈', '🥉'];
    
    return `
        <div class="clientes-carrossel">
            <div class="clientes-carrossel-wrapper" style="justify-content: center;">
                ${ranking.map((item, index) => this.renderizarClienteCard(item, index, medalhas[index])).join('')}
            </div>
        </div>
    `;
}

renderizarClientesCarrossel(ranking) {
    const medalhas = ['🥇', '🥈', '🥉'];
    const totalCards = ranking.length;
    const cardsPorPagina = this.getCardsPorPaginaVertical();
    const totalPaginas = Math.ceil(totalCards / cardsPorPagina);
    
    let html = `
        <div class="clientes-carrossel" data-total="${totalPaginas}" data-atual="0">
            <div class="clientes-carrossel-wrapper" style="transform: translateY(0px);">
    `;
    
    ranking.forEach((item, index) => {
        const medalha = medalhas[index] || `#${index + 1}`;
        html += this.renderizarClienteCard(item, index, medalha);
    });
    
    html += `
            </div>
            ${totalPaginas > 1 ? `
                <button class="carrossel-btn prev" onclick="dashboard.anteriorCarrossel()">▲</button>
                <button class="carrossel-btn next" onclick="dashboard.proximoCarrossel()">▼</button>
                <div class="carrossel-indicators">
                    ${Array.from({ length: totalPaginas }, (_, i) => `
                        <span class="dot ${i === 0 ? 'active' : ''}" onclick="dashboard.irParaPaginaCarrossel(${i})"></span>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    return html;
}

renderizarClienteCard(item, index, medalha) {
    const pedidosCliente = this.pedidos.filter(p => p.clienteId === item.clienteId && p.status === CONSTANTS.STATUS_PEDIDO.ENTREGUE);
    const qtdPedidos = pedidosCliente.length;
    const ticketMedio = qtdPedidos > 0 ? item.valor / qtdPedidos : 0;
    
    let topClass = '';
    if (index === 0) topClass = 'top-1';
    else if (index === 1) topClass = 'top-2';
    else if (index === 2) topClass = 'top-3';
    
    const isTop = index < 3;
    const medalhaIcon = isTop ? medalha : '';
    
    // Caminho da imagem do cliente - usando a imagem que você colocou no assets
    const avatarImg = '/assets/pexels-paulseling-12266786-removebg-preview.png'
    
    return `
        <div class="cliente-card-flip ${topClass}" onclick="dashboard.toggleFlip(this)">
            <div class="cliente-card-flip-inner">
                <!-- FRENTE DO CARD -->
                <div class="cliente-card-front">
                    ${medalhaIcon ? `<span class="medalha">${medalhaIcon}</span>` : ''}
                    <span class="rank-number-big">${index + 1}</span>
                    
                    <!-- Avatar com imagem flutuante -->
                    <div class="cliente-avatar">
                        <img src="${avatarImg}" alt="${item.nome}">
                    </div>
                    
                    <div class="cliente-info">
                        <div class="cliente-nome">${item.nome.toUpperCase()}</div>
                        <div class="cliente-valor">${Helpers.formatarMoeda(item.valor)}</div>
                        <div class="cliente-pedidos">${qtdPedidos} pedido${qtdPedidos > 1 ? 's' : ''}</div>
                        <div class="cliente-hint">Clique para detalhes</div>
                    </div>
                </div>
                
                <!-- VERSO DO CARD -->
                <div class="cliente-card-back">
                    <div class="back-item">
                        <span class="back-label">Total</span>
                        <span class="back-value">${Helpers.formatarMoeda(item.valor)}</span>
                    </div>
                    <div class="back-item">
                        <span class="back-label">Pedidos</span>
                        <span class="back-value">${qtdPedidos}</span>
                    </div>
                    <div class="back-item">
                        <span class="back-label">Ticket Médio</span>
                        <span class="back-value">${Helpers.formatarMoeda(ticketMedio)}</span>
                    </div>
                    <div class="back-item">
                        <span class="back-badge">${isTop ? '🌟 Premium' : 'Fiel'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// FLIP AO CLICAR
// ============================================

toggleFlip(element) {
    element.classList.toggle('flipped');
    
    // Se houver outros cards flipados, desvira
    const allCards = document.querySelectorAll('.cliente-card-flip.flipped');
    allCards.forEach(card => {
        if (card !== element) {
            card.classList.remove('flipped');
        }
    });
}

// ============================================
// CONTROLE DO CARROSSEL VERTICAL
// ============================================

getCardsPorPaginaVertical() {
    const height = window.innerHeight;
    const cardHeight = 140;
    const gap = 16;
    const totalHeight = cardHeight + gap;
    
    if (height < 600) return 2;
    if (height < 800) return 3;
    if (height < 1000) return 4;
    return 5;
}

inicializarCarrossel() {
    const carrossel = document.querySelector('.clientes-carrossel');
    if (!carrossel) return;
    
    // Adicionar scroll com mouse (roda do mouse)
    this.adicionarScrollMouse(carrossel);
    
    const wrapper = carrossel.querySelector('.clientes-carrossel-wrapper');
    const cards = wrapper.querySelectorAll('.cliente-card-flip');
    const cardsPorPagina = this.getCardsPorPaginaVertical();
    const totalPaginas = Math.ceil(cards.length / cardsPorPagina);
    
    const dots = carrossel.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === 0);
    });
}

adicionarScrollMouse(carrossel) {
    let isScrolling = false;
    let timeout;
    
    carrossel.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        if (isScrolling) return;
        isScrolling = true;
        
        const delta = e.deltaY;
        const wrapper = carrossel.querySelector('.clientes-carrossel-wrapper');
        const cards = wrapper.querySelectorAll('.cliente-card-flip');
        const cardsPorPagina = this.getCardsPorPaginaVertical();
        const totalPaginas = Math.ceil(cards.length / cardsPorPagina);
        const atual = parseInt(carrossel.dataset.atual || 0);
        
        let proximaPagina = atual;
        if (delta > 0) {
            proximaPagina = Math.min(atual + 1, totalPaginas - 1);
        } else if (delta < 0) {
            proximaPagina = Math.max(atual - 1, 0);
        }
        
        if (proximaPagina !== atual) {
            this.irParaPaginaCarrossel(proximaPagina);
        }
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            isScrolling = false;
        }, 300);
    }, { passive: false });
}

proximoCarrossel() {
    const carrossel = document.querySelector('.clientes-carrossel');
    if (!carrossel) return;
    
    const wrapper = carrossel.querySelector('.clientes-carrossel-wrapper');
    const cards = wrapper.querySelectorAll('.cliente-card-flip');
    const cardsPorPagina = this.getCardsPorPaginaVertical();
    const totalPaginas = Math.ceil(cards.length / cardsPorPagina);
    const atual = parseInt(carrossel.dataset.atual || 0);
    const proximo = Math.min(atual + 1, totalPaginas - 1);
    
    this.irParaPaginaCarrossel(proximo);
}

anteriorCarrossel() {
    const carrossel = document.querySelector('.clientes-carrossel');
    if (!carrossel) return;
    
    const atual = parseInt(carrossel.dataset.atual || 0);
    const anterior = Math.max(atual - 1, 0);
    
    this.irParaPaginaCarrossel(anterior);
}

irParaPaginaCarrossel(pagina) {
    const carrossel = document.querySelector('.clientes-carrossel');
    if (!carrossel) return;
    
    const wrapper = carrossel.querySelector('.clientes-carrossel-wrapper');
    const cards = wrapper.querySelectorAll('.cliente-card-flip');
    const cardsPorPagina = this.getCardsPorPaginaVertical();
    const totalPaginas = Math.ceil(cards.length / cardsPorPagina);
    
    if (pagina < 0 || pagina >= totalPaginas) return;
    
    const cardHeight = cards[0]?.offsetHeight + 16 || 156;
    const translateY = -pagina * cardsPorPagina * cardHeight;
    
    wrapper.style.transform = `translateY(${translateY}px)`;
    carrossel.dataset.atual = pagina;
    
    const dots = carrossel.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === pagina);
    });
}

    renderizarUltimosPedidos(status = '') {
        const container = document.getElementById('ultimosPedidosContent');
        let pedidos = this.getPedidosByStatus(status);
        
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
                                    <td>${this.getNomeCliente(pedido.clienteId).toUpperCase()}</td>
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
                    <h4>Pedido ${pedido.id} - ${cliente ? cliente.nome.toUpperCase() : 'Cliente'}</h4>
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
        const pedido = this.pedidos.find(p => p.id == pedidoId);
        if (!pedido) {
            await Helpers.mostrarErro('Pedido não encontrado');
            return;
        }
        
        const cliente = this.clientes.find(c => c.id === pedido.clienteId);
        
        let html = `
            <div style="text-align: left; color: #FBFADA;">
                <p style="margin: 8px 0;"><strong>Cliente:</strong> ${cliente ? cliente.nome.toUpperCase() : 'N/A'}</p>
                <p style="margin: 8px 0;"><strong>Data:</strong> ${Helpers.formatarData(pedido.dataHora)}</p>
                <p style="margin: 8px 0;"><strong>Status:</strong> <span style="background: rgba(251, 250, 218, 0.15); padding: 4px 12px; border-radius: 20px;">${pedido.status.toUpperCase()}</span></p>
                <p style="margin: 8px 0;"><strong>Valor Total:</strong> <span style="color: #FBFADA; font-size: 1.2rem;">${Helpers.formatarMoeda(pedido.valorTotal)}</span></p>
                <h4 style="color: #FBFADA; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid rgba(251, 250, 218, 0.1); padding-bottom: 8px;">ITENS DO PEDIDO</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
        `;
        
        if (pedido.itens && pedido.itens.length > 0) {
            pedido.itens.forEach(item => {
                const produto = this.produtos.find(p => p.id === item.produtoId);
                const nomeProduto = produto ? produto.nome.toUpperCase() : 'PRODUTO NÃO ENCONTRADO';
                const subtotal = item.precoUnitario * item.quantidade;
                html += `
                    <li style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 500;">${nomeProduto}</span>
                        <span style="color: rgba(251, 250, 218, 0.7);">
                            Qtd: ${item.quantidade} × ${Helpers.formatarMoeda(item.precoUnitario)}
                            <span style="color: #FBFADA; font-weight: 600; margin-left: 8px;">${Helpers.formatarMoeda(subtotal)}</span>
                        </span>
                    </li>
                `;
            });
        } else {
            html += `<li style="padding: 12px 0; color: rgba(255,255,255,0.3); text-align: center;">Nenhum item neste pedido</li>`;
        }
        
        html += '</ul></div>';
        
        await Swal.fire({
            title: `Pedido #${pedido.id}`,
            html: html,
            width: '600px',
            confirmButtonText: 'FECHAR',
            background: '#12372A',
            color: '#FBFADA',
            confirmButtonColor: '#FBFADA',
            confirmButtonTextColor: '#12372A',
            buttonsStyling: true
        });
    }
}

// ============================================
// RESIZE - Atualizar carrossel ao redimensionar
// ============================================

window.addEventListener('resize', () => {
    if (dashboard) {
        const carrossel = document.querySelector('.clientes-carrossel');
        if (carrossel) {
            const atual = parseInt(carrossel.dataset.atual || 0);
            dashboard.irParaPaginaCarrossel(atual);
        }
    }
});

// Inicializar dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardController();
});