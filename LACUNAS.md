# Lacunas do acervo visual

Registro honesto do que ainda não tem referência visual confiável. Na interface, toda lacuna aparece como **SEM REFERÊNCIA OFICIAL**, e nada é preenchido com imagem inventada.

## Como completar

1. Salve a imagem em `novas/` com o nome do slot (por exemplo `v09_veiculo.jpg`).
2. Em `tools/processar_assets.py`, troque `None` pela origem do slot na lista `SLOTS` (e o recorte, se precisar).
3. Rode `npm run assets` e depois `npm run build`.

## Slot com placeholder

| Slot | Conteúdo esperado | Situação |
|-|-|-|
| `v09_veiculo` | Veículo do Lorde Batman | Nenhum veículo dos Lordes da Justiça aparece em "A Better World". A única estrutura deles registrada na DCAU Wiki é a Torre de Vigilância, que é uma estação espacial. A garagem mostra o aviso de lacuna, e a planta CAD fica indisponível para esse veículo. |

## Lacunas preenchidas em 28/09/2026

| Slot | Imagem | Origem registrada na wiki |
|-|-|-|
| `v04_rosto` | Bruce Wayne aos 55 anos, sem máscara | The Dark Knight Returns #4, arte de Frank Miller e Klaus Janson, cores de Lynn Varley (DC Database) |
| `v06_rosto` | Bruce Wayne na ficha policial do GCPD | Absolute Batman #1, arte de Nick Dragotta (DC Database) |
| `v06_veiculo` | Batmóvel Absoluto | Absolute Batman #2, arte de Nick Dragotta (DC Database) |
| `v07_traje_thrasher` | Armadura Thrasher | Página "Thrasher Batsuit" da Batman Wiki |
| `v07_traje_buster` | Armadura Justice Buster | Página "Justice Buster Batsuit" da Batman Wiki |
| `v07_rosto` | Bruce Wayne sem máscara | Galeria de Bruce Wayne da DCAMU Wiki; o filme exato não está indicado no arquivo |
| `v08_rosto` | Bruce Wayne | The Batman (2004) Wiki |
| `v08_veiculo_pesado` | Batmóvel Mk III, em estilo tanque | Episódio "Artifacts" (4ª temporada), ano de 2027 (The Batman (2004) Wiki) |
| `v10_veiculo` | Batmoto de Thomas Wayne | Batman #75 (2019), arte de Tony S. Daniel (DC Database) |
| `v11_veiculo` | Batmóvel de 1994 | Robin #12 (1994), arco "Prodigal", arte de Phil Jimenez (DC Database) |

## Substituições feitas

- **Traje anti-frio do BTAS:** não foi localizado um traje térmico canônico com imagem. No lugar dele entrou o **traje à prova de fogo** do DCAU (DCAU Wiki, Fireproof Batsuit), que é a variante de proteção térmica documentada.
- **Veículo de Thomas Wayne:** a referência canônica encontrada é uma motocicleta (Batman #75), e é ela que aparece na garagem.
- **Veículo da era Azrael:** não há registro de um Batmóvel próprio de Azrael. Foi usado o Batmóvel dos quadrinhos de dezembro de 1994, do arco "Prodigal", publicado logo após o fim da saga A Queda do Morcego.

## Lacunas do acervo holográfico 2.5D

O vault mostra só ângulos que existem em fotos de figuras licenciadas ou em arte oficial. Para completar uma variante:
1. salve a imagem em `novas/turnaround/`;
2. registre o ângulo em `TURN` (trajes) ou `VEIC` (veículos), em `tools/processar_holos.py`;
3. rode `npm run holos` e depois `npm run build`.

### Ângulos de traje sem referência

| Variante | Ângulos no acervo | Faltam | Tipo |
|-|-|-|-|
| `v01:tnba` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v01:fogo` | frente | 3/4, perfil, costas | recorte |
| `v02:tdk` | frente | 3/4, perfil, costas | recorte |
| `v02:begins` | frente, 3/4, perfil | costas | recorte |
| `v03:nano` | frente, 3/4, perfil | costas | recorte |
| `v03:exo` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v04:cinza` | frente, 3/4, costas | perfil | recorte |
| `v04:armadura` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v05:city` | frente | 3/4, perfil, costas | recorte |
| `v05:xe` | frente | 3/4, perfil, costas | recorte |
| `v06:padrao` | frente, 3/4, costas | perfil | recorte |
| `v06:capa` | frente | 3/4, perfil, costas | recorte |
| `v06:machado` | frente | 3/4, perfil, costas | recorte |
| `v07:padrao` | frente, 3/4, costas | perfil | recorte |
| `v07:hush` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v07:thrasher` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v07:buster` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v08:padrao` | frente | 3/4, perfil, costas | recorte |
| `v08:noturno` | frente | 3/4, perfil, costas | recorte |
| `v09:lorde` | frente | 3/4, perfil, costas | recorte |
| `v09:duelo` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v10:flashpoint` | frente, costas | 3/4, perfil | recorte |
| `v10:queda` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v10:duelo` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v11:azrael` | frente | 3/4, perfil, costas | recorte |
| `v11:azbat` | frente, 3/4, costas | perfil | recorte |
| `v11:garras` | frente | 3/4, perfil, costas | painel de quadrinho ou cena, sem recorte |
| `v12:lego` | frente | 3/4, perfil, costas | recorte |
| `v12:notebook` | frente | 3/4, perfil, costas | recorte |

### Vistas de veículo

Nenhum veículo tem vista de topo oficial no acervo.

| Veículo | Vistas no acervo | Faltam |
|-|-|-|
| `v01:btas` | 34, lateral | topo, traseira |
| `v01:tnba` | frontal | lateral, topo, 3/4, traseira |
| `v02:tumbler` | acervo, 34 | lateral, topo, traseira |
| `v02:batpod` | 34 | lateral, topo, traseira |
| `v03:beyond` | 34 | lateral, topo, traseira |
| `v04:tanque` | 34 | lateral, topo, traseira |
| `v05:perseguicao` | lateral, frontal | topo, 3/4, traseira |
| `v05:batalha` | 34, traseira | lateral, topo |
| `v06:absoluto` | 34 | lateral, topo, traseira |
| `v07:n52` | 34 | lateral, topo, traseira |
| `v08:esportivo` | 34 | lateral, topo, traseira |
| `v08:pesado` | 34 | lateral, topo, traseira |
| `v09:jato` | nenhuma | lateral, topo, 3/4, traseira |
| `v10:batmoto` | 34 | lateral, topo, traseira |
| `v11:knightfall` | 34 | lateral, topo, traseira |
| `v12:lego` | 34 | lateral, topo, traseira |

### Números nas pranchas técnicas

Só entram medidas confirmadas em mais de uma fonte. Até agora, isso vale apenas para o Tumbler, com dados do veículo de filmagem conferidos na Batman Wiki e na Dark Knight Wiki:
- motor V8 GM de 5,7 L;
- pneus traseiros Interco Super Swamper de 44 pol;
- 2,5 toneladas curtas.

Comprimento e largura ficaram de fora porque as duas fontes divergem. O esquema interno do raio-X e as pranchas dos demais veículos são qualitativos e identificados como interpretação.

## Avatares do painel lateral

Retratos 1:1 do busto gerados por `tools/processar_avatares.py`. Fontes:

| Versão | Fonte |
|-|-|
| v01 | DCAU Wiki, `Batman (BTAS).png` |
| v02 | Batman Wiki, `Batman close up TDKR II.jpeg` |
| v03 | DCAU Wiki, `Batman (Terry McGinnis).png` |
| v04 | Batman Wiki, `Batman-The Dark Knight Returns Part 1.jpeg` (filme animado de 2012) |
| v05 | Arkham Wiki, `Knight.png` |
| v06 | acervo local, `AbsoBatmanRender2.webp` |
| v07 | DC Database, capa textless de Batman vol. 2 #24, de Greg Capullo |
| v08 | Batman Wiki, `Batman2004.png` |
| v09 | acervo local, `baixadas/justice_lord_batman.png` |
| v10 | DC Database, `Thomas Wayne Flashpoint 0002.jpg` (Batman #75) |
| v11 | acervo local, `novas/v11_traje_azbat2.webp` |
| v12 | acervo local, `baixadas/lego_batman_rosto.png` |

## Origem das imagens

- `novas/_origem_downloads.json`: URL, data e tamanho de cada imagem baixada das wikis Fandom.
- `assets/manifest.json`: origem de cada slot final (acervo local ou download).
