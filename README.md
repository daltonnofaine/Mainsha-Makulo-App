# 🦜 Mainsha Makulu English

Um app gratuito para aprender inglês de forma divertida, feito para a
comunidade **Mainsha Makulu** e para o mercado de **Pemba, Moçambique**.

Funciona como o Duolingo: lições curtas, XP, sequências (🔥 streaks),
corações, gemas, ligas semanais e conquistas — com interface em
**português** e áudio em inglês.

## ✨ Funcionalidades

- **Trilha de aprendizagem** com 10 unidades e 20 lições desbloqueáveis
- **4 tipos de exercícios**: escolha múltipla, escuta (texto-para-voz),
  ligar traduções e construir frases com banco de palavras
- **Gamificação**: XP, níveis, streaks diários, meta diária configurável,
  corações (regeneram a cada 30 min ou com 💎), gemas e conquistas
- **Liga semanal** com 30 participantes da comunidade (funciona offline,
  os rivais são simulados de forma determinística)
- **Funciona offline** (PWA): instale no telemóvel e use sem internet,
  o progresso fica guardado no dispositivo
- **Sem contas, sem dados recolhidos**: tudo fica no telemóvel do aluno

## 🚀 Como usar (5 minutos para publicar)

É um site 100% estático — sem base de dados, sem servidor, sem build:

### Opção 1: Netlify Drop (mais fácil)

1. Aceda a <https://app.netlify.com/drop>
2. Arraste a pasta inteira deste projeto para a página
3. O app fica online num endereço como `mainsha-makulu.netlify.app`

### Opção 2: GitHub Pages

1. Coloque estes ficheiros num repositório do GitHub
2. Em **Settings → Pages**, escolha o ramo (branch) `main` e a pasta `/ (root)`
3. Aceda a `https://<utilizador>.github.io/<repo>/`

> O botão **Instalar app** do navegador aparece automaticamente em
> telemóveis Android (Chrome) quando o site é publicado em HTTPS.

### Testar no computador

```bash
cd mainsha-makulu-english
python3 -m http.server 8000
# abra http://localhost:8000
```

## 📚 Como adicionar ou editar lições (sem programar)

Todo o conteúdo está em `js/data.js`. Cada lição tem este formato:

```js
{
  id: "u1l1",               // id único, não repetir
  title: "Primeiras palavras",
  vocab: [                  // [inglês, português]
    ["hello", "olá"],
    ["good morning", "bom dia"]
  ],
  sentences: [              // frases para construir
    ["Hello! How are you?", "Olá! Como está?"]
  ]
}
```

- **vocab** gera automaticamente exercícios de escolha múltipla, escuta
  e de ligar pares (as alternativas erradas vêm de outras palavras da
  unidade)
- **sentences** gera exercícios de construir frases
- Para adicionar uma unidade nova, copie um bloco `unit` completo e mude
  o `id`, o título, a cor e o ícone

Depois de editar, recarregue a página. Para o app instalado, será
necessário atualizar a versão da cache em `sw.js` (mude `mm-english-v1`
para `mm-english-v2`).

## 🧪 Testes

O motor do jogo tem testes automáticos em Node (sem dependências):

```bash
node test/smoke.test.js
```

## 🗂️ Estrutura

```
index.html          página principal
css/styles.css      estilos (tema: verde-azulado do Índico)
js/data.js          conteúdo do curso (vocabulário e frases)
js/engine.js        motor de jogo (sessões, XP, streaks, ligas)
js/app.js           interface e ecrãs
sw.js               service worker (cache offline)
manifest.webmanifest   instalação como app (PWA)
icon.svg            ícone do app
icons/icon-512.svg  ícone "maskable" para instalação
```

## 🎨 Personalizar a identidade

- Nome do app: `manifest.webmanifest` e `index.html` (`<title>`)
- Cores: Variáveis (variables) no topo de `css/styles.css` (`--teal`, `--coral`, `--sun`)
- Mascote e mensagens: `js/app.js` (procure `🦜`)

## 💡 Próximos passos sugeridos

- Mais unidades: situações reais de Pemba (turismo na praia, pesca,
  entrevista de emprego, banco, farmácia)
- Modo "revisão" com palavras erradas guardadas
- Sincronização entre telemóveis quando houver orçamento para um
  servidor (Firebase/Supabase)
- Vozes em inglês gravadas por professores da própria comunidade

---

Feito com 💙 para a comunidade Mainsha Makulu.
