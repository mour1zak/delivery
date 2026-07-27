// Produtos Controller
class ProdutosController {
    constructor() {
        this.produtos = [];
        this.produtoId = null;
        this.pedidos = []; // Para validação de exclusão
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
    }

    async carregarDados() {
        try {
            const [produtos, pedidos] = await Promise.all([
                api.get('produtos'),
                api.get('pedidos')
            ]);

            this.produtos = produtos || [];
            this.pedidos = pedidos || [];
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Helpers.mostrarErro('Erro ao carregar produtos');
        }
    }

    renderizarTabela(produtosFiltrados = null) {
        const container = document.getElementById('produtosContent');
        const produtos = produtosFiltrados || this.produtos;

        if (!produtos || produtos.length === 0) {
            container.innerHTML = `
            <div class="no-data">
                <p>Nenhum produto cadastrado</p>
                <a href="cadastro.html" class="btn btn-primary mt-20">Cadastrar Primeiro Produto</a>
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
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Disponível</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${produtos.map(produto => `
                        <tr class="${produto.disponivel ? '' : 'produto-indisponivel'}">
                            <td>${produto.nome}</td>
                            <td><span class="categoria-badge">${produto.categoria}</span></td>
                            <td>${Helpers.formatarMoeda(produto.preco)}</td>
                            <td>
                                <span class="status-badge ${produto.disponivel ? 'status-ativo' : 'status-inativo'}">
                                    ${produto.disponivel ? 'Sim' : 'Não'}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-secondary btn-sm" onclick="produtosController.editarProduto(${produto.id})">
                                        Editar
                                    </button>
                                    <button class="btn ${produto.disponivel ? 'btn-warning' : 'btn-success'} btn-sm" 
                                            onclick="produtosController.toggleDisponibilidade(${produto.id})">
                                        ${produto.disponivel ? 'Indisponível' : 'Disponível'}
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="produtosController.excluirProduto(${produto.id})">
                                        Excluir
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

    configurarFiltros() {
        const select = document.getElementById('categoriaFilter');

        // Popular categorias
        select.innerHTML = `
            <option value="">Todas as Categorias</option>
            ${CONSTANTS.CATEGORIAS_PRODUTO.map(cat => `
                <option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            `).join('')}
        `;

        select.addEventListener('change', (e) => {
            const categoria = e.target.value;

            if (!categoria) {
                this.renderizarTabela();
                return;
            }

            const filtrados = this.produtos.filter(p => p.categoria === categoria);
            this.renderizarTabela(filtrados);
        });
    }

    async toggleDisponibilidade(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;

        const acao = produto.disponivel ? 'marcar como indisponível' : 'marcar como disponível';
        const confirmado = await Helpers.mostrarConfirmacao(
            `Deseja ${acao} o produto "${produto.nome}"?`
        );

        if (!confirmado) return;

        try {
            await api.patch(`produtos/${id}`, { disponivel: !produto.disponivel });

            await Helpers.mostrarSucesso(`Produto ${produto.disponivel ? 'indisponível' : 'disponível'} agora!`);
            await this.carregarDados();
            this.renderizarTabela();
        } catch (error) {
            console.error('Erro ao alterar disponibilidade:', error);
            Helpers.mostrarErro('Erro ao alterar disponibilidade do produto');
        }
    }

    async excluirProduto(id) {
        const produto = this.produtos.find(p => p.id === id);
        if (!produto) return;

        // Verificar se produto está em pedidos
        const emUso = this.pedidos.some(pedido =>
            pedido.itens && pedido.itens.some(item => item.produtoId === id)
        );

        if (emUso) {
            await Helpers.mostrarAviso(
                `O produto "${produto.nome}" não pode ser excluído pois está vinculado a pedidos.\n\n` +
                `Sugestão: Marque-o como indisponível.`
            );
            return;
        }

        const confirmado = await Helpers.mostrarConfirmacao(
            `Tem certeza que deseja excluir o produto "${produto.nome}"?\n\nEsta ação não pode ser desfeita!`
        );

        if (!confirmado) return;

        try {
            await api.delete(`produtos/${id}`);

            await Helpers.mostrarSucesso('Produto excluído com sucesso!');
            await this.carregarDados();
            this.renderizarTabela();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            Helpers.mostrarErro('Erro ao excluir produto');
        }
    }

    editarProduto(id) {
        window.location.href = `cadastro.html?id=${id}`;
    }

    // ============ CADASTRO/EDIÇÃO ============
    async initCadastro() {
        this.popularCategorias();

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            this.produtoId = parseInt(id);
            document.getElementById('formTitle').textContent = '✏️ Editar Produto';
            await this.carregarDadosProduto();
        }

        this.configurarFormulario();
    }

    popularCategorias() {
        const select = document.getElementById('categoria');
        select.innerHTML = `
            <option value="">Selecione uma categoria...</option>
            ${CONSTANTS.CATEGORIAS_PRODUTO.map(cat => `
                <option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            `).join('')}
        `;
    }

    async carregarDadosProduto() {
        try {
            const produto = await api.get(`produtos/${this.produtoId}`);

            if (produto) {
                document.getElementById('nome').value = produto.nome;
                document.getElementById('categoria').value = produto.categoria;
                document.getElementById('preco').value = produto.preco;
                document.getElementById('tipoProducao').value = produto.tipoProducao || '';
            }
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            Helpers.mostrarErro('Erro ao carregar dados do produto');
            window.location.href = 'listagem.html';
        }
    }

    configurarFormulario() {
        const form = document.getElementById('produtoForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.salvarProduto();
        });
    }

    async salvarProduto() {
        const formData = {
            nome: document.getElementById('nome').value.trim(),
            categoria: document.getElementById('categoria').value,
            preco: parseFloat(document.getElementById('preco').value),
            tipoProducao: document.getElementById('tipoProducao').value.trim()
        };

        // Validações
        if (!formData.nome) {
            Helpers.mostrarAviso('Nome do produto é obrigatório');
            return;
        }

        if (!formData.categoria) {
            Helpers.mostrarAviso('Categoria é obrigatória');
            return;
        }

        if (!formData.preco || formData.preco <= 0) {
            Helpers.mostrarAviso('Preço deve ser maior que zero');
            return;
        }

        try {
            if (this.produtoId) {
                // Edição
                await api.put(`produtos/${this.produtoId}`, {
                    ...formData,
                    disponivel: true, // Mantém disponível na edição
                    id: this.produtoId
                });

                await Helpers.mostrarSucesso('Produto atualizado com sucesso!');
            } else {
                // Criação
                await api.post('produtos', {
                    ...formData,
                    disponivel: true // Produto criado como disponível
                });

                await Helpers.mostrarSucesso('Produto cadastrado com sucesso!');
            }

            setTimeout(() => {
                window.location.href = 'listagem.html';
            }, 1000);
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            Helpers.mostrarErro('Erro ao salvar produto');
        }
    }
}

// Inicializar controller
let produtosController;
document.addEventListener('DOMContentLoaded', () => {
    produtosController = new ProdutosController();
});