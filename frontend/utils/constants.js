// Constantes do Sistema de Delivery
const CONSTANTS = {
    STATUS_PEDIDO: {
        RECEBIDO: 'recebido',
        EM_PREPARO: 'em preparo',
        SAIU_PARA_ENTREGA: 'saiu para entrega',
        ENTREGUE: 'entregue',
        CANCELADO: 'cancelado'
    },

    CATEGORIAS_PRODUTO: ['lanche', 'bebida', 'sobremesa', 'acompanhamento'],

    STATUS_SEQUENCIA: [
        'recebido',
        'em preparo', 
        'saiu para entrega',
        'entregue'
    ],

    MOTIVOS_CANCELAMENTO: [
        'Problema no pagamento',
        'Problema no endereço',
        'Cliente desistiu',
        'Restaurante sem capacidade',
        'Outro'
    ],

    API_URL: 'http://localhost:3000'
};

// Congelar objeto para evitar modificações
Object.freeze(CONSTANTS);