# Tomato Survivor

Abra `tomato (2).html` para jogar. Os scripts externos são clássicos (não ES Modules), então o jogo continua funcionando ao abrir o arquivo diretamente no navegador.

## Organização

- `js/config.js` — canvas, limites e qualidade de desempenho.
- `js/audio.js` — sintetizador de efeitos sonoros.
- `js/quality.js` — perfis Alta, Equilibrada e Desempenho; use **Q** ou o botão `GRÁF` em partida.
- `js/content/addons.js` — conteúdo expansível, como armas adicionais.
- `js/content/enemies.js` — catálogo dos inimigos comuns.
- `js/state/player.js` — factory do estado inicial do jogador.
- `js/combat/collision-grid.js` — índice espacial usado pelas colisões de projéteis.
- `js/render/culling.js` — descarte de objetos fora da câmera.
- `js/render/arena-decor.js` — cenário procedural pré-renderizado e caixas/barris visuais que se despedaçam com tiros.
- `js/render/ui-layout.js` — posicionamento de textos dentro da tela e fora dos painéis da HUD.
- `tomato (2).html` — interface e núcleo de jogo atual.

Execute `node tests/validate-project.js` para validar a sintaxe e confirmar que todos os arquivos externos estão carregados pelo jogo.
Execute `node tests/smoke-runtime.js` para exercitar inicialização, desenho e 180 frames de cada personagem sem depender de um navegador.
Execute `node tests/regression-runtime.js` para validar transições, Arsenal, economia, input, colisões contínuas, quatro chefes, vinte ondas e consistência do loop em 60/120/144/240 FPS simulados.
Execute `node tests/audio-runtime.js` para validar recuperação e liberação dos nós de áudio com mocks.
Execute `node tests/layout-math.js` para validar geometria de safe area e chamadas ao Canvas em 1280×720, 1366×768, 1920×1080 e 2560×1440 simulados.

Esses testes usam `tests/harness.js`: relógio e timers determinísticos, DOM simplificado e Canvas simulado. Não medem FPS real, não executam um motor CSS e não substituem inspeção visual/console de navegador. O acesso de prévia ao arquivo local foi bloqueado na sessão de auditoria.

O próximo passo seguro é mover um sistema por vez do núcleo: renderização, combate, inimigos e interface. Dessa forma, cada mudança continua testável e não quebra o jogo que já funciona.
