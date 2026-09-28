# Lacunas do acervo visual

Registro honesto do que ainda não tem referência visual confiável. O slot abaixo mostra o placeholder holográfico "SINAL PERDIDO", e o veículo correspondente usa um modelo 3D de interpretação, identificado na interface como **MODELO CONCEITUAL**.

## Como completar

1. Salve a imagem em `novas/` com o nome do slot (por exemplo `v09_veiculo.jpg`).
2. Em `tools/processar_assets.py`, troque `None` pela origem do slot na lista `SLOTS` (e o recorte, se precisar).
3. Rode `npm run assets` e depois `npm run build`.

## Slot com placeholder

| Slot | Conteúdo esperado | Situação |
|-|-|-|
| `v09_veiculo` | Veículo do Lorde Batman | Nenhum veículo dos Lordes da Justiça aparece em "A Better World". A única estrutura deles registrada na DCAU Wiki é a Torre de Vigilância, que é uma estação espacial. O jato continua conceitual. |

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
- **Veículo de Thomas Wayne:** a referência canônica encontrada é uma motocicleta, então o carro conceitual de Flashpoint foi trocado por um modelo 3D de moto.
- **Veículo da era Azrael:** não há registro de um Batmóvel próprio de Azrael. Foi usado o Batmóvel dos quadrinhos de dezembro de 1994, do arco "Prodigal", publicado logo após o fim da saga A Queda do Morcego.

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
