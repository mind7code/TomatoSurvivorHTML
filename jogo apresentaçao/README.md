# Tomato Survivor

Abra `tomato (2).html` para jogar. Os scripts externos são clássicos (não ES Modules), então o jogo continua funcionando ao abrir o arquivo diretamente no navegador.

No desktop, mova o mouse para mirar, clique com o botão esquerdo para atacar e segure para disparar continuamente. Todas as armas seguem a mira; escopetas e armas de múltiplos projéteis mantêm seu cone de dispersão. Armas corpo a corpo golpeiam na direção do cursor. WASD/setas movem, Espaço dá arrancada e P pausa. Soltar o botão, perder foco ou abrir um menu interrompe o disparo.

A sequência visual da referência foi adaptada às armas existentes: mira, disparo/golpe, recuo e retorno. Os quadros de clarão, projétil e cartucho vêm de `assets/effects/firing-reference.png` (imagem fornecida, preservada sem alterações), desenhados com composição aditiva para os efeitos sobre fundo escuro. As armas mantêm silhuetas, cadências e pesos próprios. O gerador de imagem transparente não estava autenticado; nenhuma imagem gerada foi incorporada.

## Organização

- `js/config.js` — canvas, limites e qualidade de desempenho.
- `js/audio.js` — sintetizador de efeitos sonoros.
- `js/quality.js` — perfis com ajuste automático de efeitos e resolução quando os frames atrasam; use **Q** ou o botão `GRÁF` para mudar a preferência. Dano, inimigos e limites de projéteis não são reduzidos.
- `css/game.css` — estilos da interface, separados do núcleo do jogo.
- `js/content/weapons.js` — catálogo principal de armas.
- `js/content/addons.js` — conteúdo expansível, como armas adicionais.
- `js/content/enemies.js` — catálogo dos inimigos comuns.
- `js/state/player.js` — factory do estado inicial do jogador.
- `js/combat/collision-grid.js` — índice espacial usado pelas colisões de projéteis.
- `js/combat/pointer-aim.js` — mira em coordenadas lógicas, captura do mouse e clique/segurar.
- `js/render/culling.js` — descarte de objetos fora da câmera.
- `js/render/sprite-cache.js` — cache limitado de desenhos transparentes para inimigos, armas e XP. As armas usam os desenhos Canvas nativos, inclusive nos ícones, sem os fundos dos PNGs antigos.
- `js/render/weapon-animation.js` — animação de ataque adaptada ao recuo e à cadência de cada arma.
- `js/render/firing-sheet.js` — quadros de efeitos da referência, reutilizados em cache.
- `js/render/arena-decor.js` — cenário procedural pré-renderizado e caixas/barris visuais que se despedaçam com tiros.
- `js/render/ui-layout.js` — posicionamento de textos dentro da tela e fora dos painéis da HUD.
- `tomato (2).html` — interface e núcleo de jogo atual.

Execute `node tests/validate-project.js` para validar a sintaxe e confirmar que todos os arquivos externos estão carregados pelo jogo.
Execute `node tests/smoke-runtime.js` para exercitar inicialização, desenho e 180 frames de cada personagem sem depender de um navegador.
Execute `node tests/regression-runtime.js` para validar transições, Arsenal, economia, input, colisões contínuas, quatro chefes, vinte ondas e consistência do loop em 60/120/144/240 FPS simulados.
Execute `node tests/audio-runtime.js` para validar recuperação e liberação dos nós de áudio com mocks.
Execute `node tests/layout-math.js` para validar geometria de safe area e chamadas ao Canvas em 1280×720, 1366×768, 1920×1080 e 2560×1440 simulados.
Execute `node tests/performance-runtime.js` para verificar mira nos quatro quadrantes, impactos próximos ao cano, qualidade adaptativa e reutilização dos desenhos de 160 NPCs.
Execute `node tests/pointer-combat.js` para verificar clique/segurar/soltar, seis armas na mesma mira, câmera/DPI, cancelamento de input, animações e cadência em 60/120/144/240 Hz.

Esses testes usam `tests/harness.js`: relógio e timers determinísticos, DOM simplificado e Canvas simulado. Não medem FPS real nem executam um motor CSS.

`node tests/browser-performance.js` abre uma instância isolada do Edge em segundo plano e mede 240 frames com 160 NPCs, seis armas, 300 projéteis mantidos continuamente e cerca de 500 itens de XP. Imprime FPS, percentil 95, custos de desenho/simulação e erros, e salva uma captura em `tests/browser-performance.png`. Defina `TOMATO_BROWSER` para usar outro executável Chromium. A instrumentação fica apenas no servidor local do teste e não é exposta pelo jogo normal.

Uma medição anterior no Edge headless, com 160 NPCs e seis armas (sem sustentar 300 projéteis), atingiu 60,15 FPS, p95 de 16,9 ms e nenhum frame acima de 25 ms em 240 frames. A medição final com 300 projéteis contínuos não foi confirmada nesta sessão por bloqueio da revisão automática de execução. O resultado depende do hardware e da carga; não representa garantia de 60 FPS em todos os cenários.

O próximo passo seguro é mover um sistema por vez do núcleo: renderização, combate, inimigos e interface. Dessa forma, cada mudança continua testável e não quebra o jogo que já funciona.
