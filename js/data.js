const COURSE = {
  language: "Inglês",
  uiLanguage: "Português",
  units: [
    {
      id: "u1",
      icon: "👋",
      title: "Cumprimentos",
      subtitle: "Diga olá como um profissional",
      color: "#0fb9b1",
      lessons: [
        {
          id: "u1l1",
          title: "Primeiras palavras",
          vocab: [
            ["hello", "olá"],
            ["good morning", "bom dia"],
            ["good night", "boa noite"],
            ["goodbye", "adeus"],
            ["please", "por favor"],
            ["thank you", "obrigado"]
          ],
          sentences: [
            ["Hello! How are you?", "Olá! Como está?"],
            ["Good morning, teacher!", "Bom dia, professora!"]
          ]
        },
        {
          id: "u1l2",
          title: "Apresentações",
          vocab: [
            ["my name is", "o meu nome é"],
            ["nice to meet you", "prazer em conhecê-lo"],
            ["see you later", "até logo"],
            ["welcome", "bem-vindo"],
            ["sorry", "desculpe"],
            ["yes", "sim"],
            ["no", "não"]
          ],
          sentences: [
            ["My name is Ana.", "O meu nome é Ana."],
            ["See you tomorrow!", "Até amanhã!"],
            ["Nice to meet you.", "Prazer em conhecê-lo."]
          ]
        }
      ]
    },
    {
      id: "u2",
      icon: "🔢",
      title: "Números",
      subtitle: "Conte tudo em inglês",
      color: "#f9a825",
      lessons: [
        {
          id: "u2l1",
          title: "De um a dez",
          vocab: [
            ["one", "um"],
            ["two", "dois"],
            ["three", "três"],
            ["four", "quatro"],
            ["five", "cinco"],
            ["six", "seis"],
            ["seven", "sete"],
            ["eight", "oito"],
            ["nine", "nove"],
            ["ten", "dez"]
          ],
          sentences: [
            ["I have two brothers.", "Tenho dois irmãos."],
            ["Three plus four is seven.", "Três mais quatro são sete."]
          ]
        },
        {
          id: "u2l2",
          title: "Números grandes",
          vocab: [
            ["twenty", "vinte"],
            ["fifty", "cinquenta"],
            ["hundred", "cem"],
            ["thousand", "mil"],
            ["how old are you?", "quantos anos tem?"],
            ["how much is it?", "quanto custa?"],
            ["today", "hoje"],
            ["tomorrow", "amanhã"]
          ],
          sentences: [
            ["It costs fifty meticals.", "Custa cinquenta meticais."],
            ["She is seven years old.", "Ela tem sete anos."],
            ["One, two, three, go!", "Um, dois, três, já!"]
          ]
        }
      ]
    },
    {
      id: "u3",
      icon: "👨‍👩‍👧",
      title: "Família",
      subtitle: "Fale das pessoas que ama",
      color: "#ff7b54",
      lessons: [
        {
          id: "u3l1",
          title: "Os meus dados",
          vocab: [
            ["mother", "mãe"],
            ["father", "pai"],
            ["brother", "irmão"],
            ["sister", "irmã"],
            ["grandmother", "avó"],
            ["grandfather", "avô"],
            ["son", "filho"],
            ["daughter", "filha"]
          ],
          sentences: [
            ["This is my mother.", "Esta é a minha mãe."],
            ["My grandfather is old.", "O meu avô é velho."]
          ]
        },
        {
          id: "u3l2",
          title: "Os meus amigos",
          vocab: [
            ["friend", "amigo"],
            ["family", "família"],
            ["child", "criança"],
            ["children", "crianças"],
            ["baby", "bebé"],
            ["love", "amar"],
            ["together", "juntos"]
          ],
          sentences: [
            ["I have three sisters.", "Tenho três irmãs."],
            ["I love my family.", "Amo a minha família."],
            ["We are together.", "Estamos juntos."]
          ]
        }
      ]
    },
    {
      id: "u4",
      icon: "🐟",
      title: "No mercado",
      subtitle: "Compre e negocie em inglês",
      color: "#20bf6b",
      lessons: [
        {
          id: "u4l1",
          title: "Comida e preços",
          vocab: [
            ["fish", "peixe"],
            ["rice", "arroz"],
            ["bread", "pão"],
            ["water", "água"],
            ["oil", "óleo"],
            ["money", "dinheiro"],
            ["price", "preço"]
          ],
          sentences: [
            ["How much is the fish?", "Quanto custa o peixe?"],
            ["The fish is fresh.", "O peixe está fresco."]
          ]
        },
        {
          id: "u4l2",
          title: "Comprar e vender",
          vocab: [
            ["to buy", "comprar"],
            ["to sell", "vender"],
            ["cheap", "barato"],
            ["expensive", "caro"],
            ["shop", "loja"],
            ["market", "mercado"]
          ],
          sentences: [
            ["I want to buy bread.", "Quero comprar pão."],
            ["The rice is cheap today.", "O arroz está barato hoje."],
            ["Please give me one kilo.", "Por favor, dê-me um quilo."]
          ]
        }
      ]
    },
    {
      id: "u5",
      icon: "📚",
      title: "Na escola",
      subtitle: "Aprenda as palavras da sala de aula",
      color: "#5f27cd",
      lessons: [
        {
          id: "u5l1",
          title: "Material escolar",
          vocab: [
            ["school", "escola"],
            ["teacher", "professor"],
            ["student", "estudante"],
            ["book", "livro"],
            ["notebook", "caderno"],
            ["pencil", "lápis"]
          ],
          sentences: [
            ["I go to school every day.", "Vou para a escola todos os dias."]
          ]
        },
        {
          id: "u5l2",
          title: "Na sala de aula",
          vocab: [
            ["blackboard", "quadro"],
            ["to learn", "aprender"],
            ["to read", "ler"],
            ["to write", "escrever"],
            ["question", "pergunta"],
            ["answer", "resposta"],
            ["homework", "trabalho de casa"]
          ],
          sentences: [
            ["The teacher writes on the board.", "O professor escreve no quadro."],
            ["Students read many books.", "Os estudantes leem muitos livros."],
            ["My homework is easy.", "O meu trabalho de casa é fácil."]
          ]
        }
      ]
    },
    {
      id: "u6",
      icon: "🧭",
      title: "Direções e viagem",
      subtitle: "Nunca mais se perca",
      color: "#ee5253",
      lessons: [
        {
          id: "u6l1",
          title: "Onde fica?",
          vocab: [
            ["left", "esquerda"],
            ["right", "direita"],
            ["straight ahead", "em frente"],
            ["near", "perto"],
            ["far", "longe"],
            ["where is...?", "onde fica...?"]
          ],
          sentences: [
            ["Go straight ahead.", "Siga em frente."],
            ["The beach is near.", "A praia fica perto."]
          ]
        },
        {
          id: "u6l2",
          title: "Em viagem",
          vocab: [
            ["road", "estrada"],
            ["bus", "autocarro"],
            ["car", "carro"],
            ["bicycle", "bicicleta"],
            ["beach", "praia"],
            ["to travel", "viajar"]
          ],
          sentences: [
            ["Turn left at the market.", "Vire à esquerda no mercado."],
            ["I travel by bus.", "Viajo de autocarro."]
          ]
        }
      ]
    },
    {
      id: "u7",
      icon: "💼",
      title: "Trabalho",
      subtitle: "Inglês para o seu futuro",
      color: "#0a3d62",
      lessons: [
        {
          id: "u7l1",
          title: "Profissões",
          vocab: [
            ["work", "trabalho"],
            ["nurse", "enfermeira"],
            ["farmer", "agricultor"],
            ["fisherman", "pescador"],
            ["driver", "motorista"],
            ["cook", "cozinheiro"]
          ],
          sentences: [
            ["She is a nurse.", "Ela é enfermeira."],
            ["He drives a taxi.", "Ele conduz um táxi."]
          ]
        },
        {
          id: "u7l2",
          title: "No emprego",
          vocab: [
            ["boss", "chefe"],
            ["meeting", "reunião"],
            ["salary", "salário"],
            ["beautiful", "bonito"],
            ["to speak", "falar"],
            ["English", "inglês"]
          ],
          sentences: [
            ["What is your job?", "Qual é o seu trabalho?"],
            ["I work in Pemba.", "Trabalho em Pemba."],
            ["I speak a little English.", "Falo um pouco de inglês."]
          ]
        }
      ]
    },
    {
      id: "u8",
      icon: "🏥",
      title: "Saúde",
      subtitle: "Palavras que podem salvar vidas",
      color: "#00cec9",
      lessons: [
        {
          id: "u8l1",
          title: "No hospital",
          vocab: [
            ["hospital", "hospital"],
            ["doctor", "médico"],
            ["medicine", "medicamento"],
            ["sick", "doente"],
            ["to help", "ajudar"],
            ["head", "cabeça"]
          ],
          sentences: [
            ["I need a doctor.", "Preciso de um médico."],
            ["Where is the hospital?", "Onde fica o hospital?"]
          ]
        },
        {
          id: "u8l2",
          title: "Como se sente?",
          vocab: [
            ["pain", "dor"],
            ["stomach", "estômago"],
            ["strong", "forte"],
            ["tired", "cansado"],
            ["better", "melhor"],
            ["today I am fine", "hoje estou bem"]
          ],
          sentences: [
            ["I have a headache.", "Tenho dores de cabeça."],
            ["I feel better today.", "Sinto-me melhor hoje."],
            ["Is it far from here?", "Fica longe daqui?"]
          ]
        }
      ]
    },
    {
      id: "u9",
      icon: "⏰",
      title: "Rotina diária",
      subtitle: "Fale dos seus dias",
      color: "#8395a7",
      lessons: [
        {
          id: "u9l1",
          title: "O meu dia",
          vocab: [
            ["to wake up", "acordar"],
            ["to eat", "comer"],
            ["to drink", "beber"],
            ["tea", "chá"],
            ["morning", "manhã"],
            ["night", "noite"]
          ],
          sentences: [
            ["I wake up at six.", "Acordo às seis."],
            ["She drinks tea every morning.", "Ela bebe chá todas as manhãs."]
          ]
        },
        {
          id: "u9l2",
          title: "Falar do tempo",
          vocab: [
            ["always", "sempre"],
            ["never", "nunca"],
            ["every day", "todos os dias"],
            ["what time is it?", "que horas são?"],
            ["lunch", "almoço"],
            ["dinner", "jantar"]
          ],
          sentences: [
            ["We eat dinner together.", "Jantamos juntos."],
            ["What time is it?", "Que horas são?"],
            ["I never wake up late.", "Eu nunca acordo tarde."]
          ]
        }
      ]
    },
    {
      id: "u10",
      icon: "🌴",
      title: "Vida e conversa",
      subtitle: "Converse sobre a vida em Pemba",
      color: "#e17055",
      lessons: [
        {
          id: "u10l1",
          title: "O tempo e a natureza",
          vocab: [
            ["weather", "tempo"],
            ["rain", "chuva"],
            ["sun", "sol"],
            ["hot", "quente"],
            ["cold", "frio"],
            ["the sea", "o mar"]
          ],
          sentences: [
            ["The weather is hot today.", "O tempo está quente hoje."],
            ["The rain is good for the farm.", "A chuva é boa para a machamba."]
          ]
        },
        {
          id: "u10l2",
          title: "Passatempos",
          vocab: [
            ["football", "futebol"],
            ["music", "música"],
            ["to dance", "dançar"],
            ["to sing", "cantar"],
            ["birthday", "aniversário"],
            ["beautiful life", "vida bonita"]
          ],
          sentences: [
            ["I like football.", "Gosto de futebol."],
            ["Happy birthday!", "Feliz aniversário!"],
            ["Life is beautiful.", "A vida é bonita."]
          ]
        }
      ]
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { COURSE };
}
