# 📊 Dashboard: Vieses Cognitivos em Plataformas de Hospedagem

Painel interativo (Dashboard) desenvolvido para a disciplina de **Economia (UFSC Blumenau - 2026)**. 

Este projeto visa visualizar e analisar dados reais recolhidos via questionário sobre como a inércia, o excesso de confiança e os gatilhos de urgência afetam as decisões dos consumidores em plataformas de alojamento (como Booking, Airbnb, etc.).

---

## ✨ Funcionalidades

- **Leitura Dinâmica (CSV):** O painel consome os dados em tempo real diretamente de um ficheiro `.csv` exportado do Google Forms, ignorando automaticamente colunas irrelevantes (como carimbos de data/hora).
- **Gráficos Interativos:** Visualização de dados através de gráficos de barras ou circulares (pizza), com animações suaves e legendas dinâmicas ao passar o rato (hover).
- **Filtros Avançados:** - Segmentação das respostas por **Faixa Etária**.
  - Ordenação dos dados (Maior para o Menor, Menor para o Maior ou Alfabética).
  - Alternância rápida entre as perguntas da pesquisa.
- **Insights Integrados:** Cada pergunta apresenta um quadro de "Implicação Analítica", relacionando os dados estatísticos com os conceitos de economia comportamental abordados na pesquisa.
- **Modo de Impressão (Exportação para PDF):** CSS otimizado para ocultar os controlos de interface ao imprimir (Ctrl+P), deixando o gráfico limpo e com fundo branco para inclusão em relatórios e artigos académicos.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com uma arquitetura *front-end* estática e sem servidor (Serverless/No Build), focada na portabilidade e na facilidade de execução:

- **[React 18](https://reactjs.org/)** (via CDN) - Para a criação da interface baseada em componentes.
- **[Recharts](https://recharts.org/)** - Biblioteca de gráficos desenhados em SVG.
- **[Papa Parse](https://www.papaparse.com/)** - Leitura e conversão (parsing) do ficheiro CSV diretamente no navegador.
- **[Babel Standalone](https://babeljs.io/)** - Tradução do código JSX em tempo real no navegador.
- **HTML5 & CSS3 Puro** - Estruturação e estilização da página.

## 📁 Estrutura de Ficheiros

```text
/
├── index.html               # Esqueleto HTML e importação das bibliotecas (CDN)
├── style.css                # Variáveis de cor, design do layout e controlo de animações
├── dashboard_pesquisa.jsx   # Lógica da aplicação, tratamento dos dados e componentes React
└── pesquisa.csv             # Base de dados (Respostas originais do Google Forms)