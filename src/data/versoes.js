// Dados canônicos das 12 versões. Fatos de estreia, criadores e vozes conferidos na Wikipedia (en/pt) em 28/09/2026.
// Os textos de engenharia dos trajes e veículos são descrições do universo ficcional (dossiê Wayne Tech).

// Posições dos hotspots no plano do traje (x e y em frações de -0.5 a 0.5), conforme o enquadramento da imagem.
const LAYOUTS = {
  corpo: { lentes: [0, 0.37], peitoral: [0.02, 0.2], cinto: [0, 0.02], luvas: [0.24, -0.02], capa: [-0.3, 0.06] },
  meio: { lentes: [0, 0.3], peitoral: [0, 0.04], cinto: [0, -0.3], luvas: [0.3, -0.22], capa: [-0.38, -0.04] },
  busto: { lentes: [0, 0.2], peitoral: [0, -0.18], capa: [-0.38, -0.26] },
};

const ROTULOS = {
  lentes: 'Lentes e capuz',
  peitoral: 'Blindagem peitoral',
  cinto: 'Cinto de utilidades',
  luvas: 'Manoplas',
  capa: 'Capa',
};

function hotspotsTraje(layout, textos) {
  const pos = LAYOUTS[layout];
  return Object.keys(pos)
    .filter((k) => textos[k])
    .map((k) => ({ id: k, titulo: ROTULOS[k], x: pos[k][0], y: pos[k][1], texto: textos[k] }));
}

function traje(id, nome, img, layout, textos, extra = {}) {
  return { id, nome, img, layout, hotspots: hotspotsTraje(layout, textos), ...extra };
}

// Textos-base de engenharia por tipo de peça, combinados com os específicos de cada versão.
const BASE = {
  lentes: 'Lentes polarizadas com HUD de visão de detetive, leitura térmica e amplificação de baixa luz.',
  peitoral: 'Malha de Kevlar com trama tripla sobre placas de compósito de fibra de carbono e titânio.',
  cinto: 'Compartimentos com batarangues, gancho de escalada, cápsulas de fumaça e kit forense.',
  luvas: 'Manoplas com lâminas serrilhadas e reforço de impacto nos nós dos dedos.',
  capa: 'Tecido de memória molecular: com corrente elétrica, enrijece e vira asa de planagem.',
};

function t(sobrescreve = {}) {
  return { ...BASE, ...sobrescreve };
}

export const VERSOES = [
  {
    id: 'v01', ranking: 1, nome: 'Batman DCAU',
    subtitulo: 'Série Animada 1992 · As Novas Aventuras 1997 · Liga da Justiça Sem Limites',
    era: '1992 a 2006', universo: 'DC Animated Universe', ameaca: 'Coringa',
    ficha: [
      ['Estreia', '5 de setembro de 1992 · Batman: The Animated Series (Fox Kids)'],
      ['Criadores', 'Bruce Timm e Eric Radomski (Warner Bros. Animation)'],
      ['Voz original', 'Kevin Conroy'],
      ['Dublagem brasileira', 'Márcio Seixas, voz oficial do Batman nas animações da DC por mais de 20 anos'],
      ['Continuação', 'The New Batman Adventures, a partir de 13 de setembro de 1997 (Kids\' WB)'],
    ],
    bio: 'O Batman definitivo da animação: detetive metódico, estrategista frio e protetor incansável de Gotham. Da Gotham art déco de 1992 às missões da Liga da Justiça, manteve o mesmo código: nunca matar e nunca desistir.',
    feitos: [
      'Membro fundador da Liga da Justiça no DCAU.',
      'Treinou Dick Grayson, Barbara Gordon e Tim Drake como parceiros em Gotham.',
      'Já aposentado, tornou-se o mentor de Terry McGinnis, o Batman do Futuro.',
    ],
    frases: [{ texto: 'I am vengeance, I am the night, I am Batman!', fonte: 'Nothing to Fear (Batman: The Animated Series, 1992)' }],
    identidade: { nome: 'Bruce Wayne', rosto: 'v01_rosto' },
    trajes: [
      traje('1992', 'Clássico 1992', 'v01_traje_1992', 'meio', t({ lentes: 'Lentes brancas antirreflexo: o olhar sem pupilas que definiu a série.', capa: 'Capa longa em cinza azulado, desenhada para a silhueta art déco da série.' })),
      traje('tnba', 'As Novas Aventuras 1997', 'v01_traje_tnba', 'busto', t({ peitoral: 'Traje redesenhado em 1997: sem a oval amarela, morcego negro direto sobre o peito.', capa: 'Capa negra e mais longa, integrada ao capuz com orelhas alongadas.' })),
      traje('fogo', 'Traje à prova de fogo', 'v01_traje_fogo', 'corpo', t({ peitoral: 'Camadas refratárias com isolamento térmico contra chamas e calor extremo.', luvas: 'Luvas de isolamento térmico com vedação nos punhos.', capa: 'Sem capa longa: reduz a superfície exposta ao fogo.' })),
    ],
    veiculos: [
      { id: 'btas', nome: 'Batmóvel BTAS 1992', img: 'v01_veiculo_btas', modelo: 'btas',
        specs: [['Estilo', 'Art déco com capô alongado'], ['Propulsão', 'Motor com pós-combustor a jato'], ['Cockpit', 'Dois lugares com canopy blindado'], ['Série', 'Batman: The Animated Series (1992)']],
        textos: { cockpit: 'Cockpit de dois lugares sob canopy blindado, com painel analógico estilo anos 40.', turbina: 'Pós-combustor a jato no traseiro: a chama azul e laranja das perseguições da série.', blindagem: 'Carroceria blindada com grade frontal em forma de morcego.', rodas: 'Rodas parcialmente cobertas por saias aerodinâmicas.' } },
      { id: 'tnba', nome: 'Batmóvel TNBA 1997', img: 'v01_veiculo_tnba', modelo: 'tnba',
        specs: [['Estilo', 'Redesenho aerodinâmico de 1997'], ['Propulsão', 'Motor com pós-combustor'], ['Série', 'The New Batman Adventures (1997)']],
        textos: { cockpit: 'Cockpit rebaixado e mais estreito, integrado à linha contínua da carroceria.', turbina: 'Pós-combustor central de alta potência.', blindagem: 'Carroceria negra lisa, sem cromados, com faróis em fenda.', rodas: 'Rodas cobertas, perfil baixo.' } },
    ],
  },
  {
    id: 'v02', ranking: 2, nome: 'Batman Christian Bale',
    subtitulo: 'Trilogia O Cavaleiro das Trevas · Christopher Nolan',
    era: '2005 a 2012', universo: 'Trilogia de Christopher Nolan', ameaca: 'Bane',
    ficha: [
      ['Estreia', 'Batman Begins (2005)'],
      ['Direção', 'Christopher Nolan, roteiro de Begins com David S. Goyer'],
      ['Ator', 'Christian Bale'],
      ['Filmes', 'Batman Begins (2005), O Cavaleiro das Trevas (2008), O Cavaleiro das Trevas Ressurge (2012)'],
    ],
    bio: 'Treinado pela Liga das Sombras e equipado pela divisão de Ciências Aplicadas de Lucius Fox, o Batman de Nolan é um símbolo construído para ser maior que o homem. Realista e tático, enfrenta a máfia, o Coringa e Bane numa Gotham à beira do colapso.',
    feitos: [
      'Colocou o Tumbler, protótipo militar, nas ruas de Gotham (Batman Begins).',
      'Assumiu a culpa pelos crimes de Harvey Dent para preservar a esperança da cidade (O Cavaleiro das Trevas).',
      'Escapou do Poço e salvou Gotham da bomba de Bane (O Cavaleiro das Trevas Ressurge).',
    ],
    frases: [{ texto: "It's not who I am underneath, but what I do that defines me.", fonte: 'Batman Begins (2005)' }],
    identidade: { nome: 'Bruce Wayne', rosto: 'v02_rosto' },
    trajes: [
      traje('tdk', 'Traje modular (O Cavaleiro das Trevas)', 'v02_traje_tdk', 'busto', t({ lentes: 'Capuz separado do pescoço: o novo traje permite virar a cabeça.', peitoral: 'Placas modulares sobre malha, mais leves e móveis que o traje de Begins.', capa: 'Tecido de memória que enrijece com corrente elétrica e vira asa rígida de planagem.' })),
      traje('begins', 'Traje Batman Begins', 'v02_traje_begins', 'corpo', t({ peitoral: 'Traje de infantaria Nomex com placas de Kevlar reforçadas, das Ciências Aplicadas.', capa: 'Tecido de memória que enrijece com corrente elétrica e vira asa rígida de planagem.' })),
    ],
    veiculos: [
      { id: 'tumbler', nome: 'Tumbler', img: 'v02_veiculo_tumbler', modelo: 'tumbler',
        specs: [['Origem', 'Protótipo de veículo de ponte militar das Ciências Aplicadas'], ['Propulsão', 'Motor a combustão e jato traseiro para saltos'], ['Blindagem', 'Placas angulares sobre chassi tubular'], ['Modo de fuga', 'Ejeção do Batpod (O Cavaleiro das Trevas)']],
        textos: { cockpit: 'Posição de pilotagem centralizada, deitada, com visão por fendas blindadas.', turbina: 'Jato traseiro usado para saltar entre telhados em Batman Begins.', blindagem: 'Placas angulares de blindagem sobre chassi tubular de ponte militar.', rodas: 'Pneus traseiros de grande diâmetro e eixos dianteiros expostos, sem eixo central.', armas: 'Canhões frontais montados sob as placas do nariz.' } },
      { id: 'batpod', nome: 'Batpod', img: 'v02_veiculo_batpod', modelo: 'batpod',
        specs: [['Origem', 'Ejetado do Tumbler danificado (O Cavaleiro das Trevas)'], ['Pilotagem', 'Piloto deitado sobre o chassi'], ['Armas', 'Canhões frontais e lançadores de gancho']],
        textos: { cockpit: 'O piloto se deita sobre o chassi, com os braços apoiados nos cubos das rodas.', rodas: 'Rodas de grande largura, as mesmas que saem do Tumbler na ejeção.', armas: 'Canhões e lançadores de gancho na dianteira.', blindagem: 'Chassi estreito e baixo, entre as duas rodas.' } },
    ],
  },
  {
    id: 'v03', ranking: 3, nome: 'Batman do Futuro',
    subtitulo: 'Batman Beyond · Terry McGinnis com a mentoria de Bruce Wayne',
    era: '1999 a 2001', universo: 'DCAU, Neo-Gotham', ameaca: 'Blight',
    ficha: [
      ['Estreia', '10 de janeiro de 1999 (The WB)'],
      ['Criadores', 'Paul Dini, Bruce Timm e Alan Burnett'],
      ['Vozes originais', 'Will Friedle (Terry McGinnis) · Kevin Conroy (Bruce Wayne)'],
      ['Cenário', 'Neo-Gotham, décadas depois da aposentadoria de Bruce Wayne'],
    ],
    bio: 'Em Neo-Gotham, o adolescente Terry McGinnis veste o traje experimental da Batcaverna para vingar a morte do pai. Bruce Wayne, idoso, torna-se seu mentor: a experiência do velho Batman guia os reflexos do novo.',
    feitos: [
      'Derrotou Derek Powers, o empresário responsável pela morte de seu pai.',
      'Enfrentou o Coringa ressurgido em O Retorno do Coringa (2000).',
      'Tornou-se o Batman de uma nova geração, sob a supervisão de Bruce Wayne.',
    ],
    frases: [],
    identidade: { nome: 'Terry McGinnis', rosto: 'v03_rosto', civil: 'v03_civil', mentor: 'v03_mentor' },
    trajes: [
      traje('nano', 'Traje de nanopolímeros', 'v03_traje_nano', 'busto', t({ lentes: 'Lentes com zoom, visão térmica e comunicação direta com a Batcaverna.', peitoral: 'Nanopolímero que amplifica a força muscular em várias vezes.', capa: 'Sem capa: asas retráteis sob os braços e propulsores nas botas.' })),
      traje('exo', 'Exoesqueleto protótipo (Bruce, 2019)', 'v03_traje_exo', 'meio', t({ peitoral: 'Exoesqueleto blindado que compensava a idade de Bruce: servomotores nos membros.', lentes: 'Visor integrado ao capacete do exoesqueleto.', luvas: 'Punhos mecânicos acionados por servomotor.' })),
    ],
    veiculos: [
      { id: 'beyond', nome: 'Batmóvel voador', img: 'v03_veiculo', modelo: 'beyond',
        specs: [['Tipo', 'Veículo aéreo de Neo-Gotham'], ['Propulsão', 'Propulsores verticais e traseiros'], ['Controle', 'Pilotagem manual ou remota a partir da Batcaverna']],
        textos: { cockpit: 'Cockpit monoposto sob canopy fumê, com HUD holográfico.', turbina: 'Propulsores traseiros e verticais: o carro voa entre os arranha-céus.', blindagem: 'Casco em forma de asa de morcego, com barbatanas traseiras alongadas.', rodas: 'Sem rodas: repulsores ventrais para pouso e decolagem vertical.' } },
    ],
  },
  {
    id: 'v04', ranking: 4, nome: 'Batman O Cavaleiro das Trevas',
    subtitulo: 'The Dark Knight Returns · Frank Miller (1986)',
    era: '1986', universo: 'Terra-31', ameaca: 'Líder Mutante',
    ficha: [
      ['Estreia', 'The Dark Knight Returns, minissérie em quatro edições (DC Comics, 1986)'],
      ['Criadores', 'Frank Miller, com arte-final de Klaus Janson e cores de Lynn Varley'],
      ['Voz no filme animado', 'Peter Weller (Batman: The Dark Knight Returns, 2012 e 2013)'],
    ],
    bio: 'Aos 55 anos, depois de uma década aposentado, Bruce Wayne volta a vestir o manto numa Gotham tomada pela gangue dos Mutantes. Mais pesado, mais brutal e em rota de colisão com o governo e com o próprio Superman.',
    feitos: [
      'Voltou da aposentadoria e derrotou o líder dos Mutantes.',
      'Converteu a gangue em Filhos do Batman.',
      'Enfrentou o Superman com uma armadura mecânica.',
    ],
    frases: [],
    identidade: { nome: 'Bruce Wayne, 55 anos', rosto: 'v04_rosto' },
    trajes: [
      traje('cinza', 'Traje cinza pesado', 'v04_traje_cinza', 'meio', t({ peitoral: 'Traje cinza com o morcego negro de linhas grossas, sem a oval amarela.', capa: 'Capa pesada e longa, que acompanha a massa do Batman idoso.' })),
      traje('armadura', 'Armadura mecânica anti-Superman', 'v04_traje_armadura', 'corpo', t({ peitoral: 'Armadura motorizada alimentada pela rede elétrica, feita para enfrentar o Superman.', luvas: 'Manoplas de impacto que multiplicam a força do soco.', lentes: 'Capacete fechado com visor em fenda.' })),
    ],
    veiculos: [
      { id: 'tanque', nome: 'Batmóvel tanque', img: 'v04_veiculo_tanque', modelo: 'tanque',
        specs: [['Tipo', 'Tanque urbano de controle de distúrbios'], ['Tração', 'Esteiras'], ['Armas', 'Canhões com munição não letal']],
        textos: { cockpit: 'Posto de comando interno, com periscópio e visores blindados.', blindagem: 'Casco inclinado de placas pesadas, capaz de atravessar barricadas.', rodas: 'Esteiras de tanque com rodas de apoio.', armas: 'Torre com canhões de munição não letal.', turbina: 'Motor diesel de alto torque na traseira.' } },
    ],
  },
  {
    id: 'v05', ranking: 5, nome: 'Batman Série Arkham',
    subtitulo: 'Arkham Asylum · City · Origins · Knight',
    era: '2009 a 2015', universo: 'Arkhamverse', ameaca: 'Cavaleiro de Arkham',
    ficha: [
      ['Estreia', 'Batman: Arkham Asylum, agosto de 2009'],
      ['Estúdios', 'Rocksteady Studios (Asylum, City, Knight) · WB Games Montréal (Origins)'],
      ['Vozes originais', 'Kevin Conroy (Asylum, City, Knight) · Roger Craig Smith (Origins)'],
      ['Jogos principais', 'Asylum (2009), City (2011), Origins (2013), Knight (2015)'],
    ],
    bio: 'Estrategista blindado da série Arkham: detetive forense com a visão de detetive, predador silencioso nas sombras e piloto do Batmóvel mais armado da história. Enfrenta o Coringa, o Espantalho e o misterioso Cavaleiro de Arkham.',
    feitos: [
      'Retomou o controle do Asilo Arkham numa única noite (Arkham Asylum).',
      'Sobreviveu ao Protocolo 10 de Hugo Strange em Arkham City.',
      'Encerrou a guerra do Espantalho e executou o Protocolo Knightfall (Arkham Knight).',
    ],
    frases: [],
    identidade: { nome: 'Bruce Wayne', rosto: 'v05_rosto' },
    trajes: [
      traje('city', 'Batsuit Arkham City', 'v05_traje_city', 'meio', t({ peitoral: 'Traje montado em cápsula de lançamento para troca rápida em campo.' })),
      traje('knight', 'Batsuit v8.03 Arkham Knight', 'v05_traje_knight', 'corpo', t({ peitoral: 'Placas de blindagem sobrepostas com reforço balístico, feitas para o combate contra milícias armadas.', luvas: 'Manoplas com servoassistência para os golpes de força.' })),
      traje('xe', 'Traje XE criogênico', 'v05_traje_xe', 'corpo', t({ peitoral: 'Traje de ambiente extremo com núcleos de aquecimento: resiste ao frio do Sr. Frio.', lentes: 'Visor selado contra congelamento e armas químicas.', luvas: 'Manoplas térmicas incandescentes.' })),
    ],
    veiculos: [
      { id: 'perseguicao', nome: 'Batmóvel · modo perseguição', img: 'v05_veiculo_perseguicao', modelo: 'arkham', modo: 'perseguicao',
        specs: [['Modos', 'Perseguição e batalha, alternados em segundos'], ['Propulsão', 'Motor com pós-combustor'], ['Armas', 'Canhão principal, metralhadora Vulcan e mísseis'], ['Extras', 'Guincho e controle remoto']],
        textos: { cockpit: 'Cockpit blindado com assento ejetor e controle remoto do veículo.', turbina: 'Pós-combustor traseiro para arrancadas e saltos.', blindagem: 'Blindagem pesada contra os drones do Cavaleiro de Arkham.', rodas: 'Rodas giratórias que permitem o deslocamento lateral no modo de batalha.', armas: 'Canhão principal, metralhadora Vulcan e mísseis, recolhidos no modo perseguição.' } },
      { id: 'batalha', nome: 'Batmóvel · modo tanque', img: 'v05_veiculo_tanque', modelo: 'arkham', modo: 'tanque',
        specs: [['Modo', 'Batalha: rodas giradas e torre exposta'], ['Armas', 'Canhão principal, metralhadora Vulcan e mísseis'], ['Deslocamento', 'Lateral, estilo tanque']],
        textos: { cockpit: 'Cockpit blindado com assento ejetor.', turbina: 'Pós-combustor desativado no modo tanque.', blindagem: 'Carroceria elevada no modo de batalha.', rodas: 'Rodas giradas a 90 graus para deslocamento lateral.', armas: 'Torre com canhão principal e metralhadora Vulcan exposta.' } },
    ],
  },
  {
    id: 'v06', ranking: 6, nome: 'Batman Absoluto',
    subtitulo: 'Absolute Batman · DC All In · Scott Snyder e Nick Dragotta',
    era: '2024', universo: 'Universo Absoluto', ameaca: 'Não catalogada',
    ficha: [
      ['Estreia', 'Absolute Batman #1, 9 de outubro de 2024'],
      ['Criadores', 'Scott Snyder (roteiro) e Nick Dragotta (arte)'],
      ['Selo', 'Universo Absoluto (DC All In)'],
    ],
    bio: 'Sem fortuna e sem mansão: um engenheiro civil de 24 anos, criado no Beco do Crime, que projeta o próprio equipamento e a própria armadura. Vários de seus inimigos clássicos foram amigos de infância, e Alfred Pennyworth é um agente do MI6 que o vigia.',
    feitos: [
      'Constrói armadura e armas com conhecimento de engenharia, sem a fortuna dos Wayne.',
      'Protege o Beco do Crime como um de seus próprios moradores.',
    ],
    frases: [],
    identidade: { nome: 'Bruce Wayne', rosto: 'v06_rosto' },
    trajes: [
      traje('padrao', 'Traje Absoluto', 'v06_traje_padrao', 'corpo', t({ peitoral: 'Morcego no peito que também funciona como machado destacável.', luvas: 'Manoplas com espinhos e anéis de impacto.' })),
      traje('capa', 'Traje com capa de combate', 'v06_traje_capa', 'corpo', t({ peitoral: 'Porte massivo e blindagem de engenheiro: peças projetadas e soldadas por ele mesmo.' })),
      traje('machado', 'Traje com machado', 'v06_traje_machado', 'corpo', t({ luvas: 'Machado de batalha empunhado como ferramenta e arma.' })),
    ],
    veiculos: [
      { id: 'absoluto', nome: 'Veículo tático Absoluto', img: 'v06_veiculo', modelo: 'absoluto', conceitual: true,
        specs: [['Registro', 'Modelo conceitual Wayne Tech, sem referência oficial no arquivo'], ['Tipo', 'Blindado de engenheiro, montado com peças pesadas']],
        textos: { cockpit: 'Cabine alta e protegida por grades soldadas.', blindagem: 'Chapas pesadas com espinhos, na mesma linguagem do traje.', rodas: 'Rodas off road de grande diâmetro.', turbina: 'Motor dianteiro de alto torque.' } },
    ],
  },
  {
    id: 'v07', ranking: 7, nome: 'Batman Novos 52',
    subtitulo: 'HQs de Scott Snyder e Greg Capullo · Filmes animados DCAMU',
    era: '2011 a 2016', universo: 'Novos 52 · DC Animated Movie Universe', ameaca: 'Corte das Corujas',
    ficha: [
      ['Estreia', 'Batman (vol. 2) #1, setembro de 2011 (Novos 52)'],
      ['Criadores', 'Scott Snyder (roteiro) e Greg Capullo (arte)'],
      ['Voz nos filmes animados', "Jason O'Mara (DC Animated Movie Universe, 2013 a 2020)"],
    ],
    bio: 'O Batman da era Novos 52 descobre a Corte das Corujas, sociedade secreta que governa Gotham desde a fundação da cidade, e enfrenta o Coringa em Morte da Família e Fim de Jogo. Nos filmes animados do DCAMU, lidera a Liga da Justiça e treina Damian Wayne.',
    feitos: [
      'Sobreviveu ao labirinto da Corte das Corujas.',
      'Enfrentou o Coringa em Morte da Família e Fim de Jogo.',
      'Usou a armadura Justice Buster contra a Liga da Justiça (Fim de Jogo).',
    ],
    frases: [],
    identidade: { nome: 'Bruce Wayne', rosto: 'v07_rosto' },
    trajes: [
      traje('padrao', 'Traje padrão (DCAMU)', 'v07_traje_padrao', 'busto', t({ peitoral: 'Traje com placas segmentadas e morcego negro integrado.' })),
      traje('hush', 'Traje Batman: Silêncio', 'v07_traje_hush', 'busto', t({ peitoral: 'Traje azul e cinza com cinto amarelo, versão clássica do DCAMU.' })),
      traje('thrasher', 'Armadura Thrasher', 'v07_traje_thrasher', 'corpo', t({ peitoral: 'Armadura pesada de combate. Sem registro visual no arquivo.' }), { semImagem: true }),
      traje('buster', 'Justice Buster', 'v07_traje_buster', 'corpo', t({ peitoral: 'Armadura criada para enfrentar a Liga da Justiça. Sem registro visual no arquivo.' }), { semImagem: true }),
    ],
    veiculos: [
      { id: 'n52', nome: 'Batmóvel DCAMU', img: 'v07_veiculo', modelo: 'n52',
        specs: [['Tipo', 'Esportivo blindado'], ['Destaque', 'Linhas baixas com luzes vermelhas'], ['Universo', 'DC Animated Movie Universe']],
        textos: { cockpit: 'Cockpit monoposto rebaixado.', turbina: 'Turbina traseira central.', blindagem: 'Carroceria baixa e angular com frisos vermelhos.', rodas: 'Rodas largas de perfil baixo.' } },
    ],
  },
  {
    id: 'v08', ranking: 8, nome: 'Batman 2004',
    subtitulo: 'The Batman · Série animada',
    era: '2004 a 2008', universo: 'The Batman', ameaca: 'Coringa',
    ficha: [
      ['Estreia', '11 de setembro de 2004 (Kids\' WB)'],
      ['Criadores', 'Michael Goguen e Duane Capizzi · design de personagens de Jeff Matsuda'],
      ['Voz original', 'Rino Romano'],
    ],
    bio: 'Os primeiros anos da carreira do Batman numa Gotham estilizada: um vigilante jovem, ágil e acrobático, com gadgets de alta tecnologia e uma galeria de vilões redesenhada. Com o tempo, ganha a parceria de Batgirl e Robin.',
    feitos: [
      'Enfrentou versões reimaginadas do Coringa, do Pinguim e de Bane.',
      'Formou parceria com Batgirl e Robin.',
    ],
    frases: [],
    identidade: { nome: 'Bruce Wayne', rosto: 'v08_rosto' },
    trajes: [
      traje('padrao', 'Traje The Batman', 'v08_traje_padrao', 'corpo', t({ peitoral: 'Traje cinza com oval amarela e capa de interior azul.' })),
      traje('noturno', 'Patrulha noturna', 'v08_traje_noturno', 'meio', t()),
    ],
    veiculos: [
      { id: 'esportivo', nome: 'Batmóvel esportivo', img: 'v08_veiculo_esportivo', modelo: 'tb04',
        specs: [['Tipo', 'Esportivo de alta performance'], ['Destaque', 'Iluminação azul e aletas traseiras']],
        textos: { cockpit: 'Cockpit baixo com painel azul.', turbina: 'Turbina traseira com brilho azul.', blindagem: 'Carroceria negra com frisos iluminados em azul.', rodas: 'Rodas traseiras largas.' } },
      { id: 'pesado', nome: 'Veículo pesado', img: 'v08_veiculo_pesado', modelo: 'tb04pesado', conceitual: true,
        specs: [['Registro', 'Modelo conceitual Wayne Tech, sem referência oficial no arquivo'], ['Tipo', 'Blindado pesado de apoio']],
        textos: { cockpit: 'Cabine elevada e blindada.', blindagem: 'Placas pesadas com iluminação azul.', rodas: 'Seis rodas de tração.', armas: 'Canhão de rede e lançador de ganchos.' } },
    ],
  },
  {
    id: 'v09', ranking: 9, nome: 'Lorde Batman',
    subtitulo: 'Lordes da Justiça · Liga da Justiça, "Um Mundo Melhor"',
    era: '2003', universo: 'Terra-50', ameaca: 'Superman Lorde',
    ficha: [
      ['Estreia', '"A Better World", Liga da Justiça, 1 de novembro de 2003'],
      ['Produção', 'Warner Bros. Animation (DCAU)'],
      ['Voz original', 'Kevin Conroy'],
      ['Multiverso', 'Terra-50, incorporada ao cânone das HQs em The Multiversity Guidebook #1 (2015)'],
    ],
    bio: 'Num universo paralelo, depois que o Superman matou o presidente Lex Luthor, a Liga se tornou os Lordes da Justiça: um regime que acabou com o crime pela força. Este Batman aceitou a ordem absoluta e os vilões de Arkham foram lobotomizados.',
    feitos: [
      'Participou do regime que zerou o crime em sua Terra.',
      'Ajudou a capturar a Liga da Justiça original.',
    ],
    frases: [],
    identidade: { nome: 'Bruce Wayne (Terra-50)', rosto: 'v09_rosto' },
    trajes: [
      traje('lorde', 'Traje Lorde Batman', 'v09_traje', 'busto', t({ peitoral: 'Morcego cinza estilizado: a marca do regime dos Lordes.', lentes: 'Capuz com lentes brancas e expressão mais dura.' })),
      traje('duelo', 'Diante do Batman original', 'v09_traje_duelo', 'busto', t()),
    ],
    veiculos: [
      { id: 'jato', nome: 'Jato dos Lordes', img: 'v09_veiculo', modelo: 'jato', conceitual: true,
        specs: [['Registro', 'Modelo conceitual Wayne Tech, sem referência oficial no arquivo'], ['Tipo', 'Jato de interceptação']],
        textos: { cockpit: 'Cockpit monoposto sob canopy.', turbina: 'Dois motores a jato com pós-combustão.', blindagem: 'Asas em forma de morcego.', armas: 'Mísseis sob as asas.' } },
    ],
  },
  {
    id: 'v10', ranking: 10, nome: 'Batman Thomas Wayne',
    subtitulo: 'Flashpoint · Ponto de Ignição',
    era: '2011', universo: 'Linha temporal Flashpoint', ameaca: 'Professor Zoom',
    ficha: [
      ['Estreia', 'Flashpoint (2011), de Geoff Johns e Andy Kubert'],
      ['Minissérie', 'Batman: Knight of Vengeance, de Brian Azzarello e Eduardo Risso'],
      ['Voz no filme animado', 'Kevin McKidd (Justice League: The Flashpoint Paradox, 2013)'],
    ],
    bio: 'Na linha temporal alterada de Flashpoint, quem morreu no Beco do Crime foi o menino Bruce. Thomas Wayne virou um Batman brutal e sem limites; Martha, enlouquecida pelo luto, tornou-se o Coringa.',
    feitos: [
      'Ajudou Barry Allen a restaurar a linha do tempo original.',
      'Entregou a Barry uma carta para o filho Bruce.',
    ],
    frases: [],
    identidade: { nome: 'Thomas Wayne', rosto: 'v10_rosto', civil: 'v10_civil' },
    trajes: [
      traje('flashpoint', 'Batman Flashpoint', 'v10_traje_flashpoint', 'corpo', t({ lentes: 'Lentes vermelhas: o olhar escarlate do Batman de Flashpoint.', peitoral: 'Morcego vermelho sobre traje escuro, com coldres.', cinto: 'Cinto com coldres de pistola: este Batman atira.' })),
      traje('queda', 'Batman Flashpoint (capa)', 'v10_traje_queda', 'corpo', t()),
      traje('duelo', 'Em combate', 'v10_traje_duelo', 'corpo', t()),
    ],
    veiculos: [
      { id: 'flashpoint', nome: 'Batmóvel Flashpoint', img: 'v10_veiculo', modelo: 'flashpoint', conceitual: true,
        specs: [['Registro', 'Modelo conceitual Wayne Tech, sem referência oficial no arquivo'], ['Tipo', 'Muscle car blindado com detalhes vermelhos']],
        textos: { cockpit: 'Cockpit de dois lugares.', turbina: 'Escapamentos duplos com pós-combustão vermelha.', blindagem: 'Carroceria clássica reforçada.', rodas: 'Rodas largas de muscle car.' } },
    ],
  },
  {
    id: 'v11', ranking: 11, nome: 'Batman Azrael',
    subtitulo: 'Jean-Paul Valley · A Queda do Morcego (Knightfall)',
    era: '1993 a 1994', universo: 'Pós-Crise', ameaca: 'Bane',
    ficha: [
      ['Estreia do personagem', 'Batman: Sword of Azrael #1, outubro de 1992'],
      ['Criadores', "Denny O'Neil e Joe Quesada"],
      ['Arco', 'Knightfall, Knightquest e KnightsEnd (1993 e 1994)'],
    ],
    bio: 'Condicionado desde criança pela Ordem de São Dumas, Jean-Paul Valley assumiu o manto quando Bane quebrou as costas de Bruce Wayne. Seu Batman foi ficando cada vez mais violento, até Bruce se recuperar e retomar o capuz.',
    feitos: [
      'Derrotou Bane usando a armadura AzBat.',
      'Protegeu Gotham durante a recuperação de Bruce Wayne.',
    ],
    frases: [],
    identidade: { nome: 'Jean-Paul Valley', rosto: 'v11_rosto' },
    trajes: [
      traje('azrael', 'Azrael', 'v11_traje_azrael', 'corpo', t({ peitoral: 'Armadura da Ordem de São Dumas em vermelho e branco.', capa: 'Capa vermelha da tradição de São Dumas.' })),
      traje('azbat', 'AzBat', 'v11_traje_azbat', 'corpo', t({ peitoral: 'Armadura AzBat: placas pesadas e dourado sobre azul.', luvas: 'Manoplas com lâminas e lança-dardos.' })),
      traje('garras', 'AzBat com garras', 'v11_traje_azbat_garras', 'corpo', t({ luvas: 'Garras de metal em leque, lançadas das manoplas.' })),
    ],
    veiculos: [
      { id: 'knightfall', nome: 'Batmóvel da era Knightfall', img: 'v11_veiculo', modelo: 'knightfall', conceitual: true,
        specs: [['Registro', 'Modelo conceitual Wayne Tech, sem referência oficial no arquivo'], ['Tipo', 'Batmóvel dos anos 90']],
        textos: { cockpit: 'Cockpit monoposto.', turbina: 'Turbina central.', blindagem: 'Carroceria em cunha com aletas.', rodas: 'Rodas cobertas.' } },
    ],
  },
  {
    id: 'v12', ranking: 12, nome: 'Batman Lego',
    subtitulo: 'Uma Aventura LEGO (2014) · LEGO Batman: O Filme (2017)',
    era: '2014 a 2017', universo: 'Universo LEGO', ameaca: 'Coringa LEGO',
    ficha: [
      ['Estreia', 'Uma Aventura LEGO (2014), de Phil Lord e Christopher Miller'],
      ['Filme solo', 'LEGO Batman: O Filme (2017), direção de Chris McKay'],
      ['Voz original', 'Will Arnett'],
    ],
    bio: 'Mestre construtor, fã de heavy metal e dono de um ego do tamanho da Batcaverna. Em LEGO Batman: O Filme, precisa enfrentar o maior medo que tem, fazer parte de uma família, ao lado de Robin, Batgirl e Alfred.',
    feitos: [
      'Monta veículos com as peças disponíveis em segundos.',
      'Salvou Gotham trabalhando em equipe com a própria família.',
    ],
    frases: [{ texto: 'Black. All important movies start with a black screen.', fonte: 'LEGO Batman: O Filme (2017)' }],
    identidade: { nome: 'Bruce Wayne (LEGO)', rosto: 'v12_rosto' },
    trajes: [
      traje('lego', 'Batman LEGO', 'v12_traje', 'corpo', t({ peitoral: 'Tronco de minifigura com morcego impresso e abdômen desenhado.', capa: 'Capa de tecido de minifigura.', cinto: 'Cinto amarelo impresso no torso.' })),
      traje('notebook', 'No Batcomputador', 'v12_traje_notebook', 'corpo', t()),
    ],
    veiculos: [
      { id: 'lego', nome: 'Batmóvel LEGO', img: 'v12_veiculo_34', modelo: 'lego',
        specs: [['Referência', 'Conjunto LEGO 70905 The Batmobile (LEGO Batman: O Filme)'], ['Construção', 'Peças LEGO com rodas off road de aro vermelho']],
        textos: { cockpit: 'Cockpit com canopy amarelo translúcido.', turbina: 'Motor exposto com escapamentos cromados.', blindagem: 'Blocos negros com asas de morcego.', rodas: 'Rodas off road com aros vermelhos.' } },
    ],
  },
];

export const TOP5 = VERSOES.filter((v) => v.ranking <= 5).map((v) => v.id);
