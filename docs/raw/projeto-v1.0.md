# SANKOFA — Jogo Digital de Enigmas sobre a História Geral da África

## Documento de Projeto v1.0

---

**Nome do Projeto:** Sankofa — Fragmentos da África
**Tipo:** Jogo digital educativo (web-based)
**Licença:** Creative Commons BY-SA 4.0 (aberto e livre)
**Base de Conteúdo:** História Geral da África (UNESCO, 8 volumes)
**Versão deste documento:** 1.0 — Maio 2026
**Autor:** [O teu nome completo]
**Afiliação:** Graduado em Ciências Humanas e Sociais (UNILAB) / Ciências da Computação
**Contacto:** [email / telefone]

---

## Índice

1. [Sumário Executivo](#1-sumário-executivo)
2. [Contexto e Problema](#2-contexto-e-problema)
3. [Justificativa e Relevância](#3-justificativa-e-relevância)
4. [Fundamentos Teóricos](#4-fundamentos-teóricos)
5. [Objetivos](#5-objetivos)
6. [Público-Alvo](#6-público-alvo)
7. [Base de Conteúdo: A História Geral da África](#7-base-de-conteúdo-a-história-geral-da-áfrica)
8. [Conceito do Jogo](#8-conceito-do-jogo)
9. [Mecânicas de Jogo](#9-mecânicas-de-jogo)
10. [Estrutura de Mundos e Progressão](#10-estrutura-de-mundos-e-progressão)
11. [Sistema de Ranking e Conquistas](#11-sistema-de-ranking-e-conquistas)
12. [Camada Narrativa: Contos Africanos](#12-camada-narrativa-contos-africanos)
13. [Design Visual e Sonoro](#13-design-visual-e-sonoro)
14. [Arquitetura Técnica](#14-arquitetura-técnica)
15. [Acessibilidade e Inclusão](#15-acessibilidade-e-inclusão)
16. [Plano de Desenvolvimento](#16-plano-de-desenvolvimento)
17. [Parcerias e Colaboração](#17-parcerias-e-colaboração)
18. [Estratégia de Financiamento](#18-estratégia-de-financiamento)
19. [Indicadores de Impacto](#19-indicadores-de-impacto)
20. [Sustentabilidade e Governança](#20-sustentabilidade-e-governança)
21. [Considerações Éticas](#21-considerações-éticas)
22. [Referências](#22-referências)
23. [Anexos](#23-anexos)

---

## 1. Sumário Executivo

**Sankofa — Fragmentos da África** é um projeto de criação de um jogo digital educativo
baseado na coleção **História Geral da África (HGA)** da UNESCO, com o objetivo de
tornar acessível, lúdica e envolvente a aprendizagem sobre as civilizações, culturas,
filosofias e histórias do continente africano e da sua diáspora.

O nome **Sankofa** é originário do povo Acano-Axanti (Gana) e significa literalmente
"volte e busque". O conceito ensina que é preciso resgatar o passado para construir o
futuro. O símbolo de Sankofa — um pássaro que olha para trás enquanto voa para a
frente — representa a essência deste projeto: recuperar as histórias africanas que foram
apagadas, distorcidas ou esquecidas, para que as gerações presentes e futuras possam
construir identidades mais completas e conscientes.

O jogo é estruturado como uma experiência de **aprendizagem implícita (stealth
learning)**, na qual o jogador interage com enigmas, blocos e narrativas sobre a história
africana sem perceber que está a aprender. O foco é na experiência de jogo — desafio,
descoberta, recompensa — com o conhecimento histórico como consequência natural da
participação.

O projeto prevê o desenvolvimento de múltiplas versões ao longo dos anos, começando
por um **protótipo digital acessível via navegador web**, expandindo para **jogo de
tabuleiro físico**, **livros de contos africanos ilustrados** e **ecossistema educativo
completo**.

Este documento apresenta o projeto em sua totalidade, com o objetivo de:
- Submissão a **editais de financiamento** nacionais e internacionais
- Apresentação à **UNESCO** e suas Cátedras
- Articulação com **parceiros acadêmicos e comunitários**
- Servir como documento-base para a **construção do protótipo digital**

---

## 2. Contexto e Problema

### 2.1 O Apagamento da História Africana

A história do continente africano sofreu, ao longo de séculos, um processo sistemático
de distorção, negligência e apagamento. As narrativas dominantes sobre a África,
construídas majoritariamente a partir de perspectivas eurocêntricas, reduziram o
continente a um conjunto de estereótipos:

- A África como lugar de "sem história" (tese refutada pela própria HGA)
- A África como bloco monolítico, ignorando a diversidade de 54 países, milhares de
  grupos étnicos e centenas de línguas
- A história africana reduzida ao período da escravidão, ignorando milênios de
  civilizações complexas
- A África como receptora passiva de influências externas, ignorando suas contribuições
  para a ciência, filosofia, arte, arquitetura e organização política mundiais

### 2.2 A Realidade no Brasil

No Brasil, país com a maior população de descendentes de africanos fora do continente
africano, os efeitos desse apagamento são particularmente graves:

- Pesquisas indicam que parcelas significativas da população desconhecem que a África é
  um continente com múltiplos países, referindo-se a ela como "um país"
- O ensino de história africana nas escolas brasileiras é frequentemente limitado ao
  período da escravidão, reforçando uma narrativa de sofrimento sem contexto de
  civilização, resistência e contribuição
- Crianças afrodescendentes crescem sem acesso a narrativas que valorizem suas
  ancestralidades, impactando diretamente a construção identitária e a autoestima
- A Lei 10.639/2003 (alterada pela Lei 11.645/2008), que torna obrigatório o ensino de
  história e cultura afro-brasileira e africana nas escolas, enfrenta dificuldades
  sistêmicas de implementação, entre as quais a falta de materiais didáticos adequados
  e acessíveis

### 2.3 A Lacuna de Materiais Educacionais Acessíveis

Embora a UNESCO tenha produzido a **História Geral da África** — o maior corpus de
história africana já elaborado, com 8 volumes, mais de 35 anos de trabalho e a
participação de mais de 230 especialistas — este material permanece pouco acessível
para o público geral, especialmente para:

- Professores da educação básica que precisam de materiais prontos para sala de aula
- Famílias afrodescendentes que desejam transmitir histórias africanas às crianças
- Jovens e adultos que não tiveram contato com essas narrativas durante sua formação
- Comunidades quilombolas, terreiros e coletivos culturais que buscam materiais de
  referência

### 2.4 O Problema Central

> **Existe uma desconexão entre a riqueza do conhecimento disponível sobre a história
> africana (materializado na HGA e em produções acadêmicas recentes) e a acessibilidade
> desse conhecimento para públicos amplos, especialmente crianças, jovens e comunidades
> afrodescendentes no Brasil e nos países lusófonos.**

---

## 3. Justificativa e Relevância

### 3.1 Relevância Epistêmica

O projeto situa-se no campo da **justiça epistêmica**, reconhecendo que o acesso ao
conhecimento sobre a própria história é um direito fundamental. A perspectiva
**afrocêntrica** adotada — conforme desenvolvida por pensadores como Cheikh Anta Diop,
Molefi Kete Asante, Théophile Obenga, Renato Noguera e Kabengele Munanga — propõe que
os sujeitos africanos (continentais e diaspóricos) se coloquem como centro de sua
própria narrativa histórica, descentrando a Europa como referência universal.

### 3.2 Relevância Pedagógica

O jogo alinha-se com abordagens pedagógicas contemporâneas que reconhecem o potencial
do **lúdico** como ferramenta de aprendizagem:

- **Aprendizagem implícita (stealth learning):** O conhecimento é absorvido como
  consequência natural da experiência de jogo, sem a resistência gerada por abordagens
  didáticas tradicionais
- **Gamificação educativa:** Elementos como ranking, conquistas, progressão e desafios
  aumentam o engajamento e a motivação intrínseca
- **Pedagogia da autonomia (Paulo Freire):** O jogador é sujeito ativo do processo de
  descoberta, não receptor passivo de informação
- **Multiletramentos:** O jogo integra texto, imagem, som, interação e narrativa,
  atendendo a diferentes estilos de aprendizagem

### 3.3 Relevância Social

- Atende à **Lei 10.639/2003** e **Lei 11.645/2008** ao oferecer material acessível
  sobre história e cultura africana e afro-brasileira
- Contribui para a **construção identitária** de crianças e jovens afrodescendentes
- Promove o **diálogo intercultural**, permitindo que pessoas de diferentes origens
  conheçam a riqueza da história africana
- Fortalece a **autoestima comunitária** ao substituir narrativas de déficit por
  narrativas de civilização, resistência e contribuição

### 3.4 Relevância Institucional (UNESCO)

O projeto articula-se diretamente com múltiplas prioridades da UNESCO:

- **História Geral da África:** Utiliza como base o próprio produto intelectual da
  UNESCO, ampliando seu alcance e impacto
- **Recomendação sobre Recursos Educacionais Abertos (REA) de 2019:** O jogo é
  disponibilizado em acesso aberto com licença Creative Commons
- **ODS 4 — Educação de Qualidade:** Oferece material educativo gratuito e acessível
- **ODS 10 — Redução das Desigualdades:** Promove justiça epistêmica e valorização de
  culturas historicamente marginalizadas
- **Década Internacional dos Afrodescendentes (2015-2024, estendida):** Contribui
  diretamente para os objetivos da década
- **Agenda 2063 da União Africana:** Alinha-se com a aspiração de "uma África com uma
  forte identidade cultural, patrimônio comum, valores e ética"

### 3.5 Relevância Pessoal e Comunitária

O projeto nasce de uma experiência pessoal concreta: a de um pai afrodescendente que
deseja que sua filha cresça ouvindo contos africanos antes dos contos europeus. Essa
motivação, longe de ser meramente individual, representa uma demanda silenciosa de
milhares de famílias afrodescendentes no Brasil e nos países lusófonos.

---

## 4. Fundamentos Teóricos

### 4.1 Afrocentricidade como Paradigma Epistemológico

A afrocentricidade, conforme sistematizada por Molefi Kete Asante e desenvolvida no
contexto lusófono por pensadores como Renato Noguera e Kabengele Munanga, não
constitui uma "versão negra do eurocentrismo", mas sim uma perspectiva epistemológica
que:

- Coloca os sujeitos africanos e afrodescendentes como agentes centrais de sua própria
  narrativa
- Descentra a Europa como referência universal de conhecimento
- Reconhece a pluralidade de epistemologias e cosmovisões
- Valoriza as contribuições civilizacionais africanas em todos os campos do
  conhecimento humano

**Referências-chave:**
- Asante, M. K. (1988). *Afrocentricity*
- Diop, C. A. (1954). *Nations nègres et culture*
- Obenga, T. (1990). *La philosophie africaine de la période pharaonique*
- Noguera, R. (2019). *Afrocentricidade e decolonialidade*
- Munanga, K. (2009). *Rediscutindo a mestiçagem no Brasil*

### 4.2 Aprendizagem Implícita e Stealth Learning

A aprendizagem implícita ocorre quando o indivíduo adquire conhecimento sem ter
consciência explícita do processo de aprendizagem. No contexto de jogos educativos,
isso significa que o jogador:

- Foca na mecânica do jogo (desafio, estratégia, recompensa)
- Absorve informações históricas como parte do "mundo do jogo"
- Integra o conhecimento de forma natural, sem a resistência gerada por contextos
  formais de ensino
- Pode, posteriormente, recuperar e articular o conhecimento adquirido

**Referências-chave:**
- Reber, A. S. (1993). *Implicit Learning and Tacit Knowledge*
- Prensky, M. (2001). *Digital Game-Based Learning*
- Gee, J. P. (2003). *What Video Games Have to Teach Us About Learning and Literacy*
- Squire, K. (2011). *Video Games and Learning: Teaching and Participatory Culture*

### 4.3 Gamificação em Educação

A gamificação é a aplicação de elementos de jogo em contextos não-lúdicos. Os elementos
mais relevantes para este projeto incluem:

- **Pontuação e ranking:** Criam senso de progresso e competição saudável
- **Conquistas (badges):** Reconhecem marcos específicos e incentivam exploração
- **Progressão por níveis:** Estruturam a jornada do jogador em etapas claras
- **Narrativa:** Dá significado emocional às ações do jogador
- **Feedback imediato:** Permite ao jogador ajustar suas estratégias
- **Desafios crescentes:** Mantêm o equilíbrio entre dificuldade e habilidade (estado
  de "flow", conforme Csikszentmihalyi)

**Referências-chave:**
- Deterding, S. et al. (2011). *From Game Design Elements to Gamefulness*
- Hamari, J. et al. (2014). *Does Gamification Work?*
- Kapp, K. M. (2012). *The Gamification of Learning and Instruction*

### 4.4 O Modelo da Iniciativa Educação Aberta (IEA)

O **Jogo da Política em Educação Aberta**, desenvolvido pela IEA em parceria com a
Cátedra UNESCO em EaD (UnB), constitui referência direta para este projeto:

- Demonstrou que jogos educativos com licença aberta podem circular internacionalmente
- Foi utilizado em países como Argentina, Peru, Cuba, EUA, Sérvia, Eslovênia, Namíbia
  e Tanzânia
- Segue o modelo "faça você mesmo" (DIY) com materiais disponíveis para download
- Foi o principal recurso da formação "Líderes Educação Aberta" (UNESCO Brasil,
  2020-2021)

O projeto Sankofa pretende seguir o mesmo modelo de licenciamento aberto e
acessibilidade, adaptando-o ao formato digital e ao conteúdo da HGA.

### 4.5 A Cátedra UNESCO em Educação Aberta e Currículo (UEM)

A Cátedra UNESCO em Educação Aberta e Currículo, lançada em dezembro de 2025 na
Universidade Eduardo Mondlane (Moçambique), representa uma parceira estratégica
potencial:

- Foco nos Países Africanos de Língua Oficial Portuguesa (PALOP)
- Desenvolvimento de currículos híbridos (presenciais, digitais, abertos)
- Centro de formação e capacitação docente
- Alinhamento com o ODS 4 e com a cooperação entre Cátedras UNESCO e redes UNITWIN

---

## 5. Objetivos

### 5.1 Objetivo Geral

Criar um jogo digital educativo, em acesso aberto, baseado na História Geral da África
da UNESCO, que torne acessível e envolvente o conhecimento sobre as civilizações,
culturas e histórias do continente africano e da sua diáspora, através de uma
experiência de aprendizagem implícita mediada por enigmas, narrativas e sistemas de
progressão.

### 5.2 Objetivos Específicos

1. **Desenvolver** um protótipo digital funcional do jogo, acessível via navegador web,
   cobrindo o primeiro módulo de conteúdo (África pré-contacto europeu, séculos I-XV)

2. **Transpor** o conteúdo acadêmico da HGA para formatos lúdicos (enigmas, cartas,
   blocos narrativos) sem perder rigor historiográfico

3. **Implementar** um sistema de ranking e conquistas que estimule o engajamento
   contínuo e a competição saudável entre jogadores

4. **Validar** o protótipo com público-alvo diversificado (estudantes, professores,
   comunidades, especialistas)

5. **Estabelecer** parcerias com instituições educativas, Cátedras UNESCO, movimentos
   negros e comunidades para co-construção e disseminação

6. **Submeter** o projeto a editais de financiamento nacionais e internacionais para
   garantir sustentabilidade e expansão

7. **Criar** uma base de dados de conteúdo historiográfico rigoroso e verificável,
   derivado da HGA, que sirva de referência para educadores

8. **Produzir**, em fases subsequentes, versões físicas do jogo (tabuleiro, cartas) e
   materiais complementares (livros de contos, guias para professores)

---

## 6. Público-Alvo

### 6.1 Público Primário

| Segmento | Faixa etária | Características |
|---|---|---|
| **Crianças** | 8-12 anos | Curiosidade natural, receptividade a narrativas, formação identitária |
| **Adolescentes** | 13-17 anos | Construção de identidade, questionamento, engajamento digital |
| **Jovens adultos** | 18-30 anos | Formação acadêmica/profissional, ativismo, uso intensivo de tecnologia |

### 6.2 Público Secundário

| Segmento | Características |
|---|---|
| **Professores da educação básica** | Busca de materiais para atender à Lei 10.639/2003 |
| **Famílias afrodescendentes** | Desejo de transmitir histórias africanas às crianças |
| **Educadores de museus e centros culturais** | Necessidade de ferramentas interativas para mediação |
| **Estudantes universitários** | Referência complementar para cursos de história, relações étnicas, pedagogia |
| **Comunidades quilombolas e terreiros** | Fortalecimento identitário e cultural |
| **Profissionais da UNESCO e organismos internacionais** | Demonstração de impacto das políticas de educação aberta |

### 6.3 Público Terciário (Internacional)

| Segmento | Região |
|---|---|
| Comunidades afrodescendentes | América Latina, Caribe |
| Professores e estudantes | Países Africanos de Língua Oficial Portuguesa (PALOP) |
| Instituições educativas | África anglófona e francófona (versões futuras em inglês e francês) |
| Diáspora africana global | Europa, América do Norte |

---

## 7. Base de Conteúdo: A História Geral da África

### 7.1 Sobre a Coleção

A **História Geral da África (HGA)** é uma das maiores iniciativas intelectuais da
UNESCO, elaborada ao longo de mais de 35 anos (1964-1999) com a participação de mais
de 230 especialistas, a maioria africana ou de ascendência africana.

O projeto nasceu do reconhecimento de que a história da África era sistematicamente
distorcida, negligenciada ou contada a partir de perspectivas eurocêntricas. A HGA
representa o primeiro esforço coletivo e abrangente de escrever a história da África a
partir de perspectivas africanas.

### 7.2 Estrutura dos Volumes

| Volume | Título | Período/Abordagem |
|---|---|---|
| **I** | Metodologia e pré-história da África | Metodologia historiográfica; origens da humanidade; África pré-histórica |
| **II** | África antiga | Civilizações do Nilo; Egito; Kush; Meroe; Cartago; Axum |
| **III** | África do século VII ao XI | Expansão do Islã; impérios sahelianos; comércio transaariano |
| **IV** | África do século XII ao XVI | Impérios Mali e Songhai; costa leste swahili; reinos da floresta |
| **V** | África do século XVI ao XVIII | Comércio atlântico; resistência; reinos e estados |
| **VI** | África do século XIX até 1880 | Reformas internas; comércio; cristianização e islamização |
| **VII** | África sob dominação colonial (1880-1935) | Partilha de Berlim; ocupação; resistência colonial |
| **VIII** | África desde 1935 | Movimentos de independência; Pan-africanismo; África contemporânea |

### 7.3 Volumes Pedagógicos

A UNESCO produziu também uma **edição pedagógica** da HGA, adaptada para uso em sala
de aula, que constitui referência adicional para este projeto.

### 7.4 Acesso

A coleção completa está disponível em acesso aberto no site da UNESCO:
https://en.unesco.org/general-history-africa

---

## 8. Conceito do Jogo

### 8.1 Metáfora Central

> **A história da África foi fragmentada. Espalhada. Apagada. O jogador encontra
> fragmentos — de mapas, de textos, de imagens, de histórias — e precisa montá-los
> para revelar o que estava escondido.**

Cada fragmento recuperado é uma peça do grande mosaico da história africana. À medida
que o jogador avança, o mosaico fica mais completo, mais rico, mais vivo.

### 8.2 Experiência do Jogador

A jornada do jogador é estruturada em três atos por fase:

**Ato 1 — O Enigma**
O jogador recebe um desafio: um enigma baseado em um elemento da história africana
(civilização, personagem, evento, lugar, conceito). O enigma é formulado como pista
narrativa ou visual, não como pergunta didática.

**Ato 2 — A Montagem**
Ao resolver o enigma, o jogador desbloqueia um **fragmento** (bloco visual + texto
narrativo). O fragmento precisa ser montado no seu lugar correto dentro de um mosaico
maior.

**Ato 3 — A Revelação**
Quando todos os fragmentos de uma fase são montados, revela-se uma imagem completa,
acompanhada de um texto narrativo que contextualiza o que foi descoberto. O jogador
ganha pontos, conquistas e desbloqueia o próximo desafio.

### 8.3 Princípios de Design

| Princípio | Descrição |
|---|---|
| **Jogo primeiro** | O jogo deve ser genuinamente divertido. O conhecimento é consequência, não objetivo declarado |
| **Descoberta, não instrução** | O jogador descobre informações por necessidade mecânica, não por obrigação didática |
| **Respeito à fonte** | Todo conteúdo historiográfico é derivado da HGA e de fontes acadêmicas verificáveis |
| **Diversidade africana** | O jogo reflete a pluralidade do continente: diferentes regiões, culturas, línguas, períodos |
| **Conexão diaspórica** | Pontes entre história africana e cultura afro-brasileira e afro-diaspórica |
| **Acessibilidade** | Funciona em dispositivos modestos, conexões lentas, sem necessidade de cadastro |
| **Licença aberta** | Todo o material é disponibilizado sob Creative Commons BY-SA 4.0 |

---

## 9. Mecânicas de Jogo

### 9.1 Mecânica Principal: Enigma + Montagem

O núcleo do jogo combina dois tipos de atividade que refletem os interesses do
criador (enigmas e montagem de blocos):

#### Tipos de Enigma

**a) Enigma de Pista Narrativa**
O jogador recebe uma descrição poética ou narrativa e precisa identificar a quem ou ao
que se refere.

> *Exemplo:*
> "Fui à cidade sagrada carregando tanto ouro que o meu caminho desvalorizou o metal
> por uma década. Os mercadores do Cairo nunca esqueceram a minha passagem. Quem sou eu?"
> **Resposta: Mansa Musa, imperador do Mali (século XIV)**

**b) Enigma de Mapa**
O jogador vê um mapa com indicações parciais (rotas comerciais, localizações) e precisa
identificar o lugar, a rota ou a civilização.

> *Exemplo:*
> "Estas rotas conectavam o ouro do sul ao sal do norte, atravessando o deserto. Os
> camelos eram os navios deste oceano de areia. Que rotas são estas?"
> **Resposta: Rotas comerciais transaarianas**

**c) Enigma Visual**
O jogador vê uma imagem parcial (fragmento de escultura, padrão têxtil, arquitetura) e
precisa identificar a civilização ou o contexto.

> *Exemplo:*
> "Estas cabeças de bronze com expressões individualizadas são consideradas uma das
> maiores realizações artísticas da África. Foram criadas por qual reino?"
> **Resposta: Reino de Benin (atual Nigéria)**

**d) Enigma de Sequência**
O jogador recebe eventos desordenados e precisa organizá-los cronologicamente.

> *Exemplo:*
> "Ordene: Construção do Grande Zimbabwe / Peregrinação de Mansa Musa / Fundação de
> Axum / Queda de Songhai"
> **Resposta: Fundação de Axum → Peregrinação de Mansa Musa → Construção do Grande
> Zimbabwe → Queda de Songhai**

**e) Enigma de Conexão**
O jogador recebe dois elementos aparentemente desconectados e precisa descobrir a
ligação.

> *Exemplo:*
> "O que liga a Universidade de Sankore (Timbuktu) ao bairro de Liberdade (São Paulo)?"
> **Resposta: A tradição de saberes africanos que resistiu ao colonialismo e se
> reconfigurou na diáspora, nos terreiros e nas comunidades afro-brasileiras**

### 9.2 Mecânica Secundária: Montagem de Mosaico

Cada enigma resolvido desbloqueia um **fragmento visual** que o jogador posiciona no
seu lugar dentro de um mosaico maior. O mosaico representa:

- No nível de fase: uma cena ou mapa de uma civilização
- No nível de mundo: o mapa de uma região da África em um período histórico
- No nível global: o mapa completo do continente africano com todas as civilizações

A montagem mecânica (arrastar e soltar blocos) satisfaz o desejo de "construir" e
oferece uma recompensa visual tangível.

### 9.3 Mecânica de Progressão

**Níveis de Dificuldade:**
- **Explorador** (fácil): Enigmas com mais pistas, menos opções de resposta
- **Guardião** (médio): Enigmas com menos pistas, mais opções
- **Sábio** (difícil): Enigmas abertos, sem opções de resposta, digitados pelo jogador

**Progressão Linear com Ramificações:**
- O jogador avança sequencialmente pelos mundos (1 a 8)
- Dentro de cada mundo, há fases obrigatórias e fases opcionais (exploração livre)
- Fases opcionais desbloqueiam conteúdos extras (curiosidades, contos, biografias)

### 9.4 Mecânica de Repetição (Replay Value)

- **Desafios diários:** Um enigma novo por dia, baseado em conteúdo aleatório da HGA
- **Modo contrarrelógio:** Resolver enigmas contra o tempo para pontuação extra
- **Modo multiplayer (futuro):** Desafiar amigos para resolver enigmas simultaneamente
- **Coleção de fragmentos:** Colecionar todos os fragmentos de um mosaico para desbloquear
  conteúdo secreto

---

## 10. Estrutura de Mundos e Progressão

### 10.1 Visão Geral dos Mundos

O jogo é organizado em **8 mundos**, cada um correspondendo a um período histórico e a
volumes da HGA. Os mundos são lançados incrementalmente, permitindo crescimento
orgânico ao longo dos anos.

---

### MUNDO 1: ORIGENS
**Base:** Volume I da HGA — Metodologia e Pré-história da África
**Período:** Da origem da humanidade ao século I
**Temas centrais:**
- Berço da humanidade (Rift Valley, fósseis de hominídeos)
- Primeiras sociedades humanas
- Revolução neolítica na África
- Diversificação linguística e cultural
- Primeiros reinos e organizações políticas

**Enigmas (10-15):**
1. "Onde os primeiros passos humanos tocaram a terra?" (Vale do Rift)
2. "Estas pinturas rupestres no deserto do Saara mostram um mundo diferente do atual.
   O que mudou?" (O Saara era verde, com lagos e savanas)
3. "Este metal, mais duro que o cobre, transformou a África. Qual é?" (Ferro)
4. "A língua mais antiga e difundida do continente pertence a este grupo linguístico.
   Qual é?" (Família Níger-Congo / Bantu)

**Mosaico:** Mapa da África mostrando as primeiras migrações humanas

**Conquista ao completar:** "Descobridor de Origens" — Desbloqueia o conto "O Primeiro
Fogo"

---

### MUNDO 2: REINOS DO NILO
**Base:** Volume II da HGA — África Antiga
**Período:** Séculos XXX a.C. – VII d.C.
**Temas centrais:**
- Civilização egípcia e suas raízes africanas
- Reino de Kush e Meroe
- Império de Axum
- Núbia cristã
- Relações com o Mediterrâneo e o Oriente

**Enigmas (10-15):**
1. "Esta rainha guerreira nubiana lutou contra os romanos e venceu. Os romanos a
   chamavam de 'Candace'. Qual é o seu nome?" (Amanirenas)
2. "Esta cidade era a capital de um reino que produzia ferro em escala industrial,
   rivalizando com a Europa medieval mil anos antes. Onde ficava?" (Meroe)
3. "Este obelisco de 24 metros, hoje na Itália, foi erguido por qual civilização?"
   (Axum / Reino de Aksum)
4. "Os gregos chamavam esta terra de 'AITHÍOPIA' — terra de rostos queimados pelo sol.
   A que região se referiam?" (Núbia / Alto Egito / Sul do Egito)

**Mosaico:** Mapa do Vale do Nilo com as civilizações sobrepostas

**Conquista ao completar:** "Guardião do Nilo" — Desbloqueia o conto "A Rainha que
Derrotou Roma"

---

### MUNDO 3: IMPÉRIOS DO SAHEL
**Base:** Volumes III e IV da HGA
**Período:** Séculos VII – XVI
**Temas centrais:**
- Império do Gana
- Império do Mali (Sundiata Keita, Mansa Musa)
- Império Songhai (Askia Muhammad)
- Timbuktu como centro de saber (Universidades de Sankore, Djinguereber, Sidi Yahia)
- Comércio transaariano (ouro, sal, manuscritos)

**Enigmas (10-15):**
1. "Este metal era tão abundante no meu reino que eu era chamado de 'homem de ouro'.
   Quando peregrinei à Meca, o meu ouro desvalorizou o mercado do Cairo por uma
   década. Quem sou eu?" (Mansa Musa)
2. "Esta cidade possuía uma das maiores bibliotecas do mundo medieval, com mais de
   700.000 manuscritos. Os estudiosos vinham de todo o mundo islâmico para estudar
   aqui. Que cidade é esta?" (Timbuktu)
3. "Eu nasci com uma deficiência física e fui rejeitado como herdeiro. Mas quando o
   meu reino caiu, fui eu que o reconstruí e fundei o maior império da África
   ocidental. Quem sou eu?" (Sundiata Keita)
4. "O sal era tão valioso quanto o ouro nestas rotas. Os blocos de sal eram trocarados
   grama por grama com ouro em que cidade mercantil?" (Timbuktu / Oudane / Taghaza)

**Mosaico:** Mapa das rotas transaarianas com cidades e recursos

**Conquista ao completar:** "Comerciante do Sahel" — Desbloqueia o conto "O Imperador
que Carregou o Ouro"

---

### MUNDO 4: COSTAS E ROTAS
**Base:** Volumes III e IV da HGA
**Período:** Séculos I – XVI
**Temas centrais:**
- Costa leste africana e civilização swahili
- Cidades-estado: Kilwa, Mombasa, Sofala, Zanzibar
- Grande Zimbabwe
- Comércio do Oceano Índico
- Navegação africana

**Enigmas (10-15):**
1. "Esta cidade-estado era tão rica que cunhava a sua própria moeda de ouro. As suas
   ruínas, em pedra sem argamassa, impressionam até hoje. Que cidade é?" (Kilwa
   Kisiwani)
2. "Esta estrutura monumental de pedra, construída sem argamassa, é a maior estrutura
   pré-colonial a sul do Saara. Os europeus se recusaram a acreditar que africanos a
   teriam construído. O que é?" (Grande Zimbabwe)
3. "Esta língua, falada ao longo da costa leste, é uma mistura de raízes bantu com
   palavras árabes e persas. É hoje uma das línguas mais faladas em África. Qual é?"
   (Suaíli / Swahili)
4. "Os navegadores desta costa comerciavam com a Índia, a China e a Arábia muito antes
   da chegada dos europeus. Que povo era este?" (Marinheiros swahili / bantu)

**Mosaico:** Mapa do Oceano Índico com rotas comerciais

**Conquista ao completar:** "Navegador do Índico" — Desbloqueia o conto "A Pedra que
Fala"

---

### MUNDO 5: FLORESTAS E REINOS
**Base:** Volume IV da HGA
**Período:** Séculos XII – XVI
**Temas centrais:**
- Reino de Benin (esculturas em bronze, organização política)
- Império de Oyo
- Reino do Kongo
- Reinos Lunda e Luba
- Civilizações da floresta tropical

**Enigmas (10-15):**
1. "Estas cabeças de bronze com expressões individualizadas são consideradas uma das
   maiores realizações artísticas da humanidade. Foram criadas por qual reino?"
   (Reino de Benin)
2. "Quando os portugueses chegaram a este reino, encontraram uma administração
   complexa, com um sistema diplomático sofisticado. O reino mantinha relações com
   Portugal como igual. Que reino é este?" (Reino do Kongo)
3. "Esta rainha guerreira liderou a resistência contra os portugueses no atual
   território de Angola. Recusou-se a ser submissa e lutou até o fim. Quem é?"
   (Rainha Nzinga / Njinga)
4. "Este sistema de justiça era tão eficaz que os europeus o compararam aos seus
   próprios tribunais. Os criminosos eram julgados por um conselho de anciãos. A que
   reino pertencia?" (Benin / Oyo)

**Mosaico:** Mapa das florestas e reinos da África ocidental e central

**Conquista ao completar:** "Arte das Florestas" — Desbloqueia o conto "O Bronze que
Fala"

---

### MUNDO 6: RESISTÊNCIA
**Base:** Volumes V e VI da HGA
**Período:** Séculos XV – XIX
**Temas centrais:**
- Tráfico transatlântico de pessoas escravizadas
- Resistência no continente (batalhas, diplomacia)
- Resistência na diáspora (quilombos, revoltas)
- Quilombo dos Palmares (Zumbi, Dandara)
- Capoeira como resistência cultural

**Enigmas (10-15):**
1. "Este quilombo foi o maior das Américas, com mais de 20.000 habitantes. Durou
   quase um século. Qual é o seu nome e quem foi o seu líder mais conhecido?"
   (Quilombo dos Palmares / Zumbi)
2. "Esta arte marcial foi criada por africanos escravizados no Brasil como forma de
   resistência. Disfarçada de dança, preservou técnicas de combate. O que é?"
   (Capoeira)
3. "Esta rainha liderou uma das mais importantes revoltas contra o colonialismo no
   continente. Quando os britânicos ameaçaram o seu povo, ela disse: 'Se vocês, os
   homens de Ashanti, não avançarem, nós o faremos'. Quem é?" (Yaa Asantewaa)
4. "Este líder haitiano, nascido escravizado, libertou o seu país e derrotou o
   exército de Napoleão. Era descendente de qual povo africano?" (Toussaint
   Louverture / povo Fon)

**Mosaico:** Mapa do Atlântico com as rotas da diáspora e pontos de resistência

**Conquista ao completar:** "Guerreiro da Liberdade" — Desbloqueia o conto "Zumbi e
Dandara"

---

### MUNDO 7: O ENCONTRO FORÇADO
**Base:** Volumes V e VI da HGA
**Período:** Séculos XV – XIX
**Temas centrais:**
- Cultura afro-brasileira (candomblé, samba, culinária, línguas)
- Cultura afro-caribenha
- Contribuições africanas à ciência, arte e filosofia mundiais
- Sincretismo e resistência cultural
- Terreiros como espaços de preservação cultural

**Enigmas (10-15):**
1. "Esta religião, trazida da África ocidental, preservou orixás, rituais e
   conhecimentos milenares no Brasil. Os seus terreiros são considerados patrimônio
   cultural. Qual é?" (Candomblé)
2. "Esta palavra, de origem quicongo, significa 'curandeiro' ou 'homem de cura' e
   se tornou sinônimo de curandeiro no Brasil. Qual é?" (Nganga / Inhame)
3. "Esta dança, de origem bantu, é hoje símbolo da cultura brasileira. Nasceu na
   resistência dos escravizados nas senzalas. Qual é?" (Samba / Lundu)
4. "Estas palavras da língua portuguesa brasileira têm origem africana: axé, dendê,
   berimbau, moleque, caçula, banguela. De que línguas africanas vêm?"
   (Iorubá, quicongo, quimbundo)

**Mosaico:** Mapa das conexões entre África e Brasil

**Conquista ao completar:** "Ponte entre Continentes" — Desbloqueia o conto "O Terreiro
que Guardou a Memória"

---

### MUNDO 8: LUTA E LIBERDADE
**Base:** Volumes VII e VIII da HGA
**Período:** Séculos XIX – XXI
**Temas centrais:**
- Partilha de Berlim e colonialismo
- Movimentos de independência (Amílcar Cabral, Patrice Lumumba, Kwame Nkrumah,
  Agostinho Neto, Eduardo Mondlane, Samora Machel, Nelson Mandela)
- Pan-africanismo (W.E.B. Du Bois, Marcus Garvey, Malcolm X)
- União Africana
- África contemporânea: desafios e conquistas

**Enigmas (10-15):**
1. "Eu nasci na Guiné-Bissau e disse: 'A libertação da mente é a primeira libertação'.
   Fui assassinado antes de ver a independência do meu país, mas a minha luta
   continuou. Quem sou eu?" (Amílcar Cabral)
2. "Eu fui o primeiro presidente da República Democrática do Congo. Disse: 'A África
   escreverá a sua própria história'. Fui assassinado meses depois da independência.
   Quem sou eu?" (Patrice Lumumba)
3. "Este conceito propõe a união política de todos os povos africanos. Teve como
   principais articuladores Du Bois, Nkrumah e Garvey. O que é?" (Pan-africanismo)
4. "Este médico e líder revolucionário nasceu em Bissau e dedicou a sua vida à
   libertação da Guiné-Bissau e de Cabo Verde. Quem é?" (Amílcar Cabral)

**Mosaico:** Mapa da África com as datas de independência de cada país

**Conquista ao completar:** "Herdeiro de Sankofa" — Desbloqueia o conto "O Discurso que
Chocou o Mundo"

---

### 10.2 Progressão entre Mundos

