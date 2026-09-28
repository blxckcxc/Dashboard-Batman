# O Panteão das Sombras

**Wayne Tech Interactive Multiverse Supercomputer HUD & 3D Vault**: um showroom 3D interativo com 12 versões do Batman, ranqueadas, cada uma com vault de trajes, revelação de identidade, garagem de Batmóveis e ficha canônica.

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

- **Cena 3D em Three.js:**
  - estúdio azul-noite próprio para os reflexos PBR, com holofotes azul e âmbar em movimento;
  - névoa, piso reflexivo com grade holográfica, poeira em partículas e feixe de escaneamento;
  - câmera com zoom, pan e amortecimento.
- **Três modos de visualização:** Realista (PBR), Wireframe holográfico e Raio-X/Blueprint, este com as camadas internas destacadas em âmbar.
- **Vault de trajes em turnaround:**
  - manequim 3D procedural de cada variante em três pedestais: costas, frente e perfil;
  - silhueta própria por versão: Miller maciço de orelhas curtas, Beyond esguio sem boca, Arkham com armadura tática, Absoluto com orelhas em lâmina e peito muralha, Justice Buster, AzBat, minifigura LEGO e assim por diante;
  - a figura central gira arrastando com o mouse ou o dedo;
  - vistas do capuz em frente, 3/4 e perfil, e painéis de estudo com capuz, placas torácicas, cinto modular e malha balística;
  - hotspots de materiais: clicar num ponto ou na peça abre o estudo explodido dela em holograma;
  - botão **Remover máscara**: o capuz se dissolve com borda âmbar e o cartão holográfico mostra o rosto, o traje civil e o mentor do acervo.
- **Garagem:**
  - 15 veículos esculpidos em código (16 fichas, contando os dois modos do Arkham) por loft de seções e placas facetadas, com pintura acetinada, rodas com disco de freio e turbinas com pós-combustão animada;
  - **plantas CAD** explodidas: cada ponto de inspeção abre a submontagem (turbina, suspensão e freio, blindagem em camadas, cockpit e armas) e o botão **Planta CAD** mostra todas ao redor do veículo;
  - visão de **cockpit** com instrumentos, **ignição** e inspeção de **blindagem**.
- **HUD Wayne Tech:**
  - arquivo do multiverso com avatares biométricos padronizados (busto 1:1, fundo chumbo e luz de contorno) e selo Top 5;
  - ficha com abas (Ficha, Trajes, Veículo, Feitos), com as imagens canônicas de referência;
  - radar da Batcaverna, monitor de ameaças e telemetria.
- **Áudio sintetizado (Web Audio API):** boot, clique, transição, som pneumático da máscara, zumbido do raio-X, ignição e transformação.
- **Responsivo:** no celular, a cena fica em cima e os painéis empilham embaixo.

Os modelos 3D de trajes e veículos são interpretações feitas a partir das referências oficiais do acervo, não réplicas; a interface identifica isso.

## Controles

| Tecla ou gesto | Ação |
|-|-|
| Setas | Versão anterior ou seguinte |
| 1, 2, 3 | Realista, Wireframe, Raio-X |
| T, V | Vault de trajes, Garagem |
| Arrastar (vault) | Girar a figura central |
| R | Remover máscara (no vault) |
| I | Ignição (na garagem) |
| C | Entrar ou sair do cockpit |
| P | Planta CAD completa (na garagem) |
| Esc | Fechar detalhe, estudo e cockpit |

**Links diretos:** o endereço guarda o estado no formato `#versão/estação/modo/variante/ação`. Por exemplo, `index.html#v05/veiculo/xray/1/ignicao` abre a Série Arkham na garagem, em raio-X, no modo tanque e com a ignição ligada; `index.html#v01/veiculo/real/0/planta` abre a planta CAD do BTAS.

## Estrutura

```
index.html                         página principal (carrega dist/app.css e dist/app.js)
DASHBOARD_BATMAN_MULTIVERSO.html   versão em arquivo único, gerada pelo build
src/main.js                        orquestração do app
src/data/versoes.js                dados canônicos das 12 versões
src/core/                          cena, modos de visualização e hotspots
src/veiculos/loft.js               loft de seções: superfícies suaves por curvas de perfil
src/veiculos/modelos/              veículos esculpidos (animados e de filmes, jogos e HQs)
src/veiculos/cad.js                plantas CAD explodidas das submontagens
src/trajes/manequim.js             manequim 3D procedural
src/trajes/presets.js              silhueta, capuz e cores das 31 variantes de traje
src/trajes/vault.js                turnaround, dissolução do capuz e estudo explodido
src/trajes/capuz.js                vistas do capuz em três ângulos
src/trajes/pod.js                  cartão holográfico de identidade
src/audio/sfx.js                   efeitos sonoros sintetizados
src/ui/                            HUD, radar e painéis de estudo em SVG
src/styles/main.css                estilos do HUD
assets/                            imagens padronizadas, avatares e manifestos
assets/modelos/                    (opcional) GLB que substituem veículos procedurais
tools/processar_assets.py          padronização do acervo (Python com Pillow)
tools/processar_avatares.py        avatares biométricos (Python com Pillow e rembg)
tools/build.mjs                    build offline (esbuild)
LACUNAS.md                         o que ainda falta no acervo e como completar
```

## Como gerar de novo

Requer Node 18 ou superior. Para reprocessar imagens, Python com Pillow; para os avatares, também o rembg (`pip install "rembg[cpu]"`, que baixa o modelo de recorte na primeira execução).

```
npm install
npm run assets
npm run avatares
npm run build
```

O build:
1. embute as imagens, os avatares e as fontes (Orbitron, Rajdhani e Inter, licença OFL);
2. embute os GLB opcionais de `assets/modelos/`;
3. confere que nenhum arquivo próprio contém hífen duplo;
4. empacota tudo num script clássico, o que permite abrir via `file://` sem servidor.

**Exceção à regra do hífen duplo:** o código de terceiros empacotado em `dist/` (three.js) não é alterado e fica fora dessa conferência.

### Modelos GLB opcionais

Um arquivo `assets/modelos/<modelo>.glb` substitui o veículo procedural de mesmo nome (por exemplo `btas.glb`, `tumbler.glb` ou `arkham.glb`, conforme os nomes em `src/veiculos/modelos/`). O modelo é centralizado e escalado para o comprimento do procedural, e mantém os pontos de inspeção, a turbina e a câmera de cockpit. Use apenas modelos cuja licença permita redistribuição, porque o repositório é público.

## Fatos e fontes

- **Fatos canônicos** (estreias, criadores, vozes): conferidos na Wikipedia (en/pt) em 28/09/2026. O que não pôde ser confirmado ficou de fora.
- **Engenharia de trajes e veículos:** os textos são descrições do universo ficcional, identificadas como dossiê Wayne Tech.
- **Imagens:** vêm do acervo local e das wikis Fandom. As URLs estão em `novas/_origem_downloads.json` e `assets/manifest.json`.

## Créditos e aviso legal

- **Projeto:** de fã, sem fins comerciais. Batman, personagens, veículos e imagens relacionadas são propriedade da DC Comics e da Warner Bros. Discovery.
- **Repositório:** é público e contém imagens protegidas por direitos autorais, usadas apenas como referência. Se houver pedido de remoção dos titulares, elas devem ser retiradas.
- **Bibliotecas e fontes:** three.js (MIT), esbuild (MIT), fontes Orbitron, Rajdhani e Inter (SIL Open Font License); os avatares usam o rembg (MIT) com o modelo isnet-general-use, só na etapa de geração.
- **Design de interface:** Wayne Tech é uma marca do universo ficcional; os painéis e modelos deste projeto são criação própria e não reproduzem arte de nenhum artista.
