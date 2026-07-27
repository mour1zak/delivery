# 🍔 Delivery App - Sistema de Delivery para Restaurante

Sistema completo de delivery desenvolvido com tecnologias web vanilla (HTML5, CSS3, JavaScript ES6+) como avaliação final de curso de desenvolvimento web.

## 📋 Funcionalidades Implementadas

### 📊 Dashboard
- Cards de contagem de pedidos por status
- Faturamento total (apenas pedidos entregues)
- Faturamento detalhado por categoria de produto
- Ranking dos produtos mais vendidos
- Ranking dos clientes que mais compraram
- Cálculo de ticket médio
- Filtro por status do pedido
- GPS simulado para entregas em andamento
- Visualização detalhada de pedidos

### 👥 Gestão de Clientes
- Cadastro completo com validações
- Listagem com busca por nome/CPF/telefone
- Máscaras automáticas (CPF, telefone, CEP)
- Validação de CPF único
- Ativação/Inativação de clientes (sem exclusão física)
- Clientes inativos não aparecem em novos pedidos
- Histórico de pedidos preservado

### 🍕 Gestão de Produtos
- Cadastro com categorias predefinidas
- Controle de disponibilidade
- Validação de exclusão (bloqueia se vinculado a pedidos)
- Filtro por categoria
- Preço com formatação monetária
- Indisponibilidade como alternativa à exclusão

### 🛵 Gestão de Pedidos
- Criação de pedidos com múltiplos itens
- Seleção apenas de clientes ativos
- Apenas produtos disponíveis podem ser adicionados
- Cálculo automático do valor total
- Fluxo de status: Recebido → Em Preparo → Saiu para Entrega → Entregue
- Cancelamento com registro de motivo
- Cancelamento permitido apenas nos status "recebido" e "em preparo"
- Busca por nome do cliente
- Paginação de 10 registros
- Snapshot do preço no momento do pedido
- Botões contextuais por status

### 🎯 Funcionalidades Extras (Diferenciais)
- **GPS Simulado**: Visualização de entregas em andamento com distância e tempo estimado
- **Motivos de Cancelamento**: Registro detalhado dos motivos de cancelamento com análise

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend Simulado**: JSON Server
- **Bibliotecas**:
  - SweetAlert2 (obrigatória) - Diálogos e notificações
  - Day.js - Manipulação de datas
- **Padrões**:
  - Async/Await para operações assíncronas
  - Programação orientada a objetos
  - Componentes reutilizáveis
  - CSS customizado sem frameworks

## 📦 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (versão 14 ou superior)
- NPM (gerenciador de pacotes do Node.js)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone [URL_DO_REPOSITÓRIO]
cd C:\delivery