# O Panteão das Sombras

**Wayne Tech Interactive Multiverse Supercomputer HUD**: um showroom holográfico interativo com 12 versões do Batman, ranqueadas, cada uma com vault de trajes em turnaround, revelação de identidade, garagem de Batmóveis com planta CAD e ficha canônica.

Funciona 100% offline: basta abrir `index.html` (ou o arquivo único `DASHBOARD_BATMAN_MULTIVERSO.html`) com dois cliques.

## As 12 versões

| # | Versão | Veículos |
|-|-|-|
| 1º | Batman DCAU (1992, 1997, Liga da Justiça) | Batmóvel BTAS 1992 · Batmóvel TNBA 1997 |
| 2º | Batman Christian Bale (Nolan) | Tumbler · Batpod |
| 3º | Batman do Futuro (Terry McGinnis) | Batmóvel voador |
| 4º | O Cavaleiro das Trevas (Frank Miller, 1986) | Batmóvel tanque |
| 5º | Série Arkham | Batmóvel em modo perseguição e modo tanque, com transformação animada |
| 6 | Batman Absoluto (2024) | Batmóvel Absoluto (Absolute Batman #2) |
| 7 | Novos 52 e DCAMU | Batmóvel DCAMU |
| 8 | The Batman (2004) | Esportivo · Batmóvel Mk III, o tanque de 2027 |
| 9 | Lorde Batman | Jato (conceitual, sem referência oficial) |
| 10 | Thomas Wayne (Flashpoint) | Batmoto de Thomas Wayne (Batman #75) |
| 11 | Azrael (Knightfall) | Batmóvel de 1994 (Robin #12, arco Prodigal) |
| 12 | Batman LEGO | Batmóvel de peças LEGO |

## Recursos

- **Interface holográfica 2.5D em WebGL puro:**
  - a arte oficial e as fotos de figuras licenciadas são projetadas por um único canvas WebGL, com um shader próprio;
  - o shader faz contorno de luz, linhas de varredura, cintilação, feixe de escaneamento, glitch com separação RGB nas transições e dissolução por ruído com borda âmbar;
  - não há malhas procedurais nem biblioteca 3D: o custo de GPU medido no painel foi de 0,3 ms por quadro, com folga para 60 FPS.
- **Três modos de visualização:**
  - **Realista:** arte completa com luz dramática;
  - **Wireframe:** linhas vetoriais neon tiradas das bordas reais da imagem (Sobel), ciano no vault e verde na garagem;
  - **Raio-X:** luminância invertida em paleta de varredura óssea; na garagem, soma um esquema interno de cubos, eixos, trem de força, motor e tanque, identificado como interpretação.
- **Vault de trajes em turnaround:**
  - três pedestais (costas, frente e perfil) com os ângulos reais do acervo;
  - arrastar a figura central, usar as setas ou os botões percorre os ângulos com transição holográfica;
  - o turnaround completo de 8 ângulos existe para o BTAS 1992 (figura Mondo), e há de 2 a 5 ângulos para Begins, Beyond, Miller, Arkham Knight, Absoluto, Novos 52, Flashpoint e AzBat;
  - ângulo sem referência mostra o aviso **SEM REFERÊNCIA OFICIAL** em vez de uma imagem inventada;
  - o capuz aparece em três vistas (frente, 3/4 e perfil), com closes oficiais quando existem e, nos outros casos, o recorte da cabeça de cada ângulo;
  - quatro pranchas técnicas: Capuz e Lentes, Placas Torácicas, Cinto Modular e Malha Balística;
  - os pontos de inspeção ficam sobre a figura, ligados às pranchas por linhas-guia, e clicar numa prancha a amplia;
  - **Remover máscara** dissolve o traje no rosto canônico, depois no traje civil e no mentor, quando o acervo tem essas imagens.
- **Garagem:**
  - arte oficial do veículo em holograma, com reflexo no piso;
  - abas Lateral, Topo, 3/4 e Traseira, mais as vistas extras do acervo; vista sem referência fica riscada e mostra o aviso;
  - pontos de inspeção posicionados sobre cada imagem;
  - chama de pós-combustão no bocal da turbina;
  - **cockpit** com zoom na cabine e instrumentos;
  - transformação Arkham por glitch entre os modos perseguição e tanque;
  - **Planta CAD** (tecla P), com as pranchas ao redor do veículo:
    - cockpit;
    - turbina em corte;
    - suspensão e freios de carbono;
    - blindagem reativa e chassi tubular;
    - armas.
  - As pranchas têm variantes para carro, tanque, moto, veículo voador e LEGO.
- **Pranchas técnicas em SVG:**
  - padrão de prancha de engenharia: moldura, grade, carimbo "Wayne Enterprises · Ciências Aplicadas", código DWG, "sem escala", cortes, cotas e chamadas;
  - números só aparecem quando há fonte verificada. Hoje isso vale apenas para o Tumbler: motor V8 GM de 5,7 L, pneus traseiros Interco Super Swamper de 44 pol e massa de 2,5 toneladas curtas, conferidos em duas wikis;
  - o resto é qualitativo.
- **HUD Wayne Tech:**
  - arquivo do multiverso com avatares biométricos 1:1 e selo Top 5;
  - ficha em abas (Ficha, Trajes, Veículo, Feitos);
  - radar, monitor de ameaças e telemetria.
- **Áudio sintetizado (Web Audio API):** boot, clique, transição, som pneumático da máscara, zumbido do raio-X, ignição e transformação.
- **Responsivo:** no celular, o palco fica em cima e os painéis empilham embaixo.

## Controles

| Tecla ou gesto | Ação |
|-|-|
| Setas para cima e para baixo | Versão anterior ou seguinte |
| Setas laterais (vault) | Girar a figura entre os ângulos |
| 1, 2, 3 | Realista, Wireframe, Raio-X |
| T, V | Vault de trajes, Garagem |
| Arrastar (vault) | Percorrer os ângulos da figura central |
| R | Remover máscara (no vault) |
| I | Ignição (na garagem) |
| C | Entrar ou sair do cockpit |
| P | Planta CAD completa (na garagem) |
| Esc | Fechar prancha ampliada, detalhe, planta e cockpit |

**Links diretos:** o endereço guarda o estado no formato `#versão/estação/modo/variante/ação`. Por exemplo, `index.html#v05/veiculo/xray/1/ignicao` abre a Série Arkham na garagem, em raio-X, no modo tanque e com a ignição ligada; `index.html#v01/veiculo/real/0/planta` abre a planta CAD do BTAS.

## Estrutura

```
index.html                         página principal (carrega dist/app.css e dist/app.js)
DASHBOARD_BATMAN_MULTIVERSO.html   versão em arquivo único, gerada pelo build
src/main.js                        orquestração do app
src/holo/motor.js                  motor holográfico WebGL (canvas único, shader e texturas)
src/holo/vault.js                  turnaround em três pedestais, capuz e revelação
src/holo/garagem.js                vistas, ignição, cockpit, raio-x e planta CAD
src/ui/plantas.js                  pranchas técnicas em SVG
src/data/versoes.js                dados canônicos das 12 versões
src/data/perfis.js                 traços dos trajes, tipos de veículo, dados verificados e pontos de inspeção
src/audio/sfx.js                   efeitos sonoros sintetizados
src/ui/hud.js, src/ui/radar.js     HUD e radar
src/styles/main.css                estilos
assets/                            imagens padronizadas, avatares, hologramas e manifestos
tools/processar_assets.py          padronização do acervo (Python com Pillow)
tools/processar_avatares.py        avatares biométricos (Pillow e rembg)
tools/processar_holos.py           recortes holográficos dos turnarounds e vistas (Pillow, SciPy e rembg)
tools/build.mjs                    build offline (esbuild)
LACUNAS.md                         o que ainda falta no acervo e como completar
```

## Como gerar de novo

Requer Node 18 ou superior. Para reprocessar imagens, Python com Pillow; para avatares e hologramas, também o rembg (`pip install "rembg[cpu]"`, que baixa o modelo de recorte na primeira execução) e o SciPy. As fontes dos turnarounds ficam em `novas/turnaround/`, que não vai para o repositório; as origens estão em `novas/_origem_downloads.json`.

```
npm install
npm run assets
npm run avatares
npm run holos
npm run build
```

O build:
1. embute as imagens, os avatares, os hologramas e as fontes (Orbitron, Rajdhani e Inter, licença OFL);
2. gera `src/_gerado/holos.js` com ângulos, caixas de cabeça e vistas;
3. confere que nenhum arquivo próprio contém hífen duplo;
4. empacota tudo num script clássico, o que permite abrir via `file://` sem servidor.

## Fatos e fontes

- **Fatos canônicos** (estreias, criadores, vozes): conferidos na Wikipedia (en/pt) em 28/09/2026. O que não pôde ser confirmado ficou de fora.
- **Engenharia de trajes e veículos:** os textos são descrições do universo ficcional, identificadas como dossiê Wayne Tech.
- **Imagens:** vêm do acervo local e das wikis Fandom. As URLs estão em `novas/_origem_downloads.json` e `assets/manifest.json`.
- **Turnarounds e vistas:** são fotos de produto de figuras e estátuas licenciadas, de lojas oficiais:
  - Mondo: BTAS 1992 e Batman Beyond;
  - Hot Toys: Batman Begins e o Tumbler;
  - McFarlane Toys: TDK, Miller, Arkham Knight, Novos 52 e AzBat;
  - Iron Studios: Absolute Batman.
  Também entram a ficha de design de Andy Kubert para o Flashpoint e capturas de Batman: Arkham Knight (Arkham Wiki). A fonte de cada variante aparece no palco. Os recortes sem fundo foram feitos com rembg.

## Créditos e aviso legal

- **Projeto:** de fã, sem fins comerciais. Batman, personagens, veículos e imagens relacionadas são propriedade da DC Comics e da Warner Bros. Discovery.
- **Repositório:** é público e contém imagens protegidas por direitos autorais, usadas apenas como referência. Se houver pedido de remoção dos titulares, elas devem ser retiradas.
- **Bibliotecas e fontes:** esbuild (MIT), fontes Orbitron, Rajdhani e Inter (SIL Open Font License); os avatares e os hologramas usam o rembg (MIT) com o modelo isnet-general-use, só na etapa de geração.
- **Design de interface:** Wayne Tech é uma marca do universo ficcional; o HUD, o shader e as pranchas técnicas deste projeto são criação própria. As imagens projetadas pertencem aos titulares indicados acima.
