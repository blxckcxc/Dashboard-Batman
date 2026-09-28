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
  - iluminação de estúdio (key, fill e rim), com holofotes azul e âmbar em movimento;
  - névoa, piso reflexivo com grade holográfica, poeira em partículas e feixe de escaneamento;
  - câmera orbital livre, com zoom, pan e amortecimento.
- **Três modos de visualização:** Realista (PBR metálico), Wireframe holográfico e Raio-X/Blueprint, este com motor, chassi e assento internos destacados em âmbar.
- **Vault de trajes:**
  - pod holográfico com shader de holograma;
  - troca de variante com glitch;
  - hotspots de materiais clicáveis;
  - botão **Remover máscara**, com dissolução do traje para o rosto e, quando houver, para o traje civil e o mentor.
- **Garagem:**
  - 14 veículos procedurais, com pneus, aros e turbinas com pós-combustão animada;
  - visão de **cockpit** com instrumentos, **ignição** e inspeção de **blindagem** em raio-X;
  - hotspots por raycasting: clicar numa peça abre a análise dela.
- **HUD Wayne Tech:**
  - arquivo do multiverso com selo Top 5;
  - ficha com abas (Ficha, Trajes, Veículo, Feitos);
  - radar da Batcaverna, monitor de ameaças e telemetria.
- **Áudio sintetizado (Web Audio API):** boot, clique, transição, som pneumático da máscara, zumbido do raio-X, ignição e transformação.
- **Responsivo:** no celular, a cena fica em cima e os painéis empilham embaixo.

## Controles

| Tecla | Ação |
|-|-|
| Setas | Versão anterior ou seguinte |
| 1, 2, 3 | Realista, Wireframe, Raio-X |
| T, V | Vault de trajes, Garagem |
| R | Remover máscara (no vault) |
| I | Ignição (na garagem) |
| C | Entrar ou sair do cockpit |
| Esc | Fechar detalhe e sair do cockpit |

**Links diretos:** o endereço guarda o estado no formato `#versão/estação/modo/variante/ação`. Por exemplo, `index.html#v05/veiculo/xray/1/ignicao` abre a Série Arkham na garagem, em raio-X, no modo tanque e com a ignição ligada.

## Estrutura

```
index.html                         página principal (carrega dist/app.css e dist/app.js)
DASHBOARD_BATMAN_MULTIVERSO.html   versão em arquivo único, gerada pelo build
src/main.js                        orquestração do app
src/data/versoes.js                dados canônicos das 12 versões
src/core/                          cena, modos de visualização e hotspots
src/veiculos/                      kit de peças e catálogo de veículos procedurais
src/trajes/pod.js                  pod holográfico e shader de revelação
src/audio/sfx.js                   efeitos sonoros sintetizados
src/ui/                            HUD e radar
src/styles/main.css                estilos do HUD
assets/                            imagens padronizadas e manifest.json
tools/processar_assets.py          padronização do acervo (Python com Pillow)
tools/build.mjs                    build offline (esbuild)
LACUNAS.md                         o que ainda falta no acervo e como completar
```

## Como gerar de novo

Requer Node 18 ou superior e, para reprocessar imagens, Python com Pillow.

```
npm install
npm run assets
npm run build
```

O build:
1. embute as imagens e as fontes (Orbitron, Rajdhani e Inter, licença OFL);
2. confere que nenhum arquivo próprio contém hífen duplo;
3. empacota tudo num script clássico, o que permite abrir via `file://` sem servidor.

**Exceção à regra do hífen duplo:** o código de terceiros empacotado em `dist/` (three.js) não é alterado e fica fora dessa conferência.

## Fatos e fontes

- **Fatos canônicos** (estreias, criadores, vozes): conferidos na Wikipedia (en/pt) em 28/09/2026. O que não pôde ser confirmado ficou de fora.
- **Engenharia de trajes e veículos:** os textos são descrições do universo ficcional, identificadas como dossiê Wayne Tech.
- **Imagens:** vêm do acervo local e das wikis Fandom. As URLs estão em `novas/_origem_downloads.json` e `assets/manifest.json`.

## Créditos e aviso legal

- **Projeto:** de fã, sem fins comerciais. Batman, personagens, veículos e imagens relacionadas são propriedade da DC Comics e da Warner Bros. Discovery.
- **Repositório:** é público e contém imagens protegidas por direitos autorais, usadas apenas como referência. Se houver pedido de remoção dos titulares, elas devem ser retiradas.
- **Bibliotecas e fontes:** three.js (MIT), esbuild (MIT), fontes Orbitron, Rajdhani e Inter (SIL Open Font License).
