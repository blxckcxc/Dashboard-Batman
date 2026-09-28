# Lacunas do acervo visual

Registro honesto do que ainda não tem referência visual confiável. Esses slots mostram o placeholder holográfico "SINAL PERDIDO" e, no caso dos veículos, um modelo 3D conceitual identificado na interface como **MODELO CONCEITUAL**.

## Como completar

1. Salve a imagem em `novas/` com o nome do slot (por exemplo `v04_rosto.jpg`).
2. Em `tools/processar_assets.py`, troque `None` pela origem do slot na lista `SLOTS` (e o recorte, se precisar).
3. Rode `npm run assets` e depois `npm run build`.

## Slots com placeholder

| Slot | Conteúdo esperado | Termos de busca sugeridos |
|-|-|-|
| `v04_rosto` | Bruce Wayne aos 55 anos, sem máscara (The Dark Knight Returns) | "Dark Knight Returns Bruce Wayne unmasked", "Batman Earth-31 Bruce Wayne" |
| `v06_rosto` | Bruce Wayne do Universo Absoluto, sem máscara | "Absolute Batman Bruce Wayne unmasked", "Absolute Batman #1 Bruce Wayne" |
| `v06_veiculo` | Veículo do Batman Absoluto | "Absolute Batman Batmobile", "Absolute Batman vehicle Dragotta" |
| `v07_traje_thrasher` | Armadura Thrasher | "Batman Thrasher suit" |
| `v07_traje_buster` | Armadura Justice Buster (Batman: Fim de Jogo) | "Batman Endgame Justice Buster armor", "Batman #35 2014 armor" |
| `v07_rosto` | Bruce Wayne dos Novos 52 ou do DCAMU, sem máscara | "DCAMU Bruce Wayne", "Son of Batman Bruce Wayne" |
| `v08_rosto` | Bruce Wayne de The Batman (2004) | "The Batman 2004 Bruce Wayne Rino Romano" |
| `v08_veiculo_pesado` | Veículo pesado de The Batman (2004) | "The Batman 2004 vehicles" |
| `v09_veiculo` | Veículo do Lorde Batman | nenhum veículo específico foi localizado nos episódios "A Better World" |
| `v10_veiculo` | Veículo do Batman de Flashpoint | "Flashpoint Batman Thomas Wayne Batmobile" |
| `v11_veiculo` | Veículo da era Knightfall | "Knightfall Batmobile 1993 comic" |

## Substituições feitas

- **Traje anti-frio do BTAS:** não foi localizado um traje térmico canônico com imagem. No lugar dele entrou o **traje à prova de fogo** do DCAU (DCAU Wiki, Fireproof Batsuit), que é a variante de proteção térmica documentada.
- **Veículos conceituais:** Absoluto, Lorde Batman, Thomas Wayne, Azrael e o pesado de 2004 usam modelos procedurais de interpretação, marcados na ficha técnica como sem referência oficial.

## Origem das imagens

- `novas/_origem_downloads.json`: URL, data e tamanho de cada imagem baixada das wikis Fandom (28/09/2026).
- `assets/manifest.json`: origem de cada slot final (acervo local ou download).
