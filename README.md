# 🥟 Suculentos - Sistema de Pedidos & Gestão de Cozinha

Sistema de autoatendimento (Totem / Mobile) e gestão de cozinha/atendimento (Kanban & Estoque em tempo real) desenvolvido para a pastelaria **Suculentos**.

---

## 🌟 Principais Funcionalidades

### 1. 🥟 Construtor de Pastel Inteligente (Wizard UX)
- **Etapa 1 - Tamanho/Preço Fixo:**
  - `3 Sabores` (R$ 10,00) - Trava dinâmica de até 3 sabores com sugestão de upgrade.
  - `5 Sabores` (R$ 12,00) - O campeão de pedidos com até 5 sabores combinados.
  - `Tudin'h` (R$ 15,00) - Recheio farto com todos os sabores liberados (botão de 1 clique "Marcar Todos").
  - `Lua Cheia` (R$ 20,00) - Tamanho gigante meia-lua com fartura especial.
- **Etapa 2 - Sabores com Trava Dinâmica:**
  - 12 sabores: *Q. Mussarela, Q. Catupiry, Q. Cheddar, Q. Coalho, Carne Moída, Charque, Carne de Sol, Camarão, Calabresa, Bacon, Frango, Presunto*.
  - Bloqueio automático de novas seleções ao atingir a quantidade máxima.
  - Sincronização com o estoque: itens esgotados aparecem desabilitados com badge.
- **Etapa 3 - Complementos (Múltipla Escolha Livre):**
  - *Milho, Ervilha, Batata Palha, Cebola, Tomate, Orégano, Azeitona, Ovo de Codorna, Uva Passa*.
- **Etapa 4 - Molhos & Observações:**
  - *Molho da Casa, Molho Tradicional, Mostarda, Ketchup, Molho de Pimenta, Molho Barbecue*.
  - Campo de observações especiais para o pasteleiro.

### 2. 🥐 Salgados Prontos & 🥤 Bebidas Geladas
- Catálogo com cards visuais, fotos, descrições, preços e adição rápida com 1 clique ao pedido.

### 3. 🛒 Carrinho & Checkout Completo
- Drawer lateral detalhando cada sabor e complemento escolhido.
- Identificação por Nome e Local (Balcão, Mesa ou Viagem).
- Meios de pagamento integrados:
  - **PIX:** Chave e Copia-e-Cola.
  - **Cartão de Débito / Crédito:** Instruções para maquininha.
  - **Dinheiro em Espécie:** Campo dinâmico de *"Troco para quanto?"* com cálculo automático do troco e botões de atalho rápido.
- Confirmação com número de senha e chuva de confetes.

### 4. 👨‍🍳 Painel da Cozinha / Gestão (Kanban em Tempo Real)
- **3 Colunas de Fluxo:** 🟡 *Novos Pedidos* -> 🔵 *Em Preparação* -> 🟢 *Prontos para Retirada*.
- **Cards Otimizados:** Nome do cliente, tempo decorrido, tags visuais coloridas (Sabores em Amarelo/Vermelho, Complementos em Verde, Molhos em Laranja).
- **Alerta Sonoro:** Chime sonoro sintetizado via Web Audio API ao chegar novo pedido.
- **Impressão de Comanda:** Visualizador de comanda térmica no padrão 80mm pronta para imprimir.
- **Simulador de Pedidos:** Botão para testar o fluxo da cozinha instantaneamente.

### 5. ⚡ Gestão de Estoque Instantânea
- Tabela com *switches on/off* para pausar ou liberar qualquer sabor, complemento, molho ou produto.
- Reflete instantaneamente no construtor de pastel do cliente.

### 6. 📊 Métricas & Faturamento
- Faturamento do dia, total de pedidos, ticket médio, participação do PIX e ranking dos sabores mais pedidos.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 14 (App Router)**
- **React 18 & TypeScript**
- **Tailwind CSS** (Design System personalizado com cores e tipografia vibrante)
- **Zustand** (Estado global com persistência no LocalStorage)
- **Lucide React** (Ícones modernos)
- **Canvas Confetti** (Efeito visual de celebração)
- **Web Audio API** (Sons nativos de notificação da cozinha)

---

## 🚀 Como Executar o Projeto Localmente

1. **Instalar Dependências:**
   ```bash
   bun install
   # ou npm install
   ```

2. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   bun dev
   # ou npm run dev
   ```

3. **Acessar a Aplicação:**
   Abra o navegador em: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Como Fazer Deploy na Vercel

1. Suba este repositório para o seu GitHub.
2. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
3. Clique em **"Add New Project"** e selecione o repositório `Projeto lanche`.
4. Mantenha as configurações padrão do Next.js e clique em **"Deploy"**.
5. O sistema estará online em segundos!
