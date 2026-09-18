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
- `tomato (2).html` — interface e núcleo de jogo atual.

Execute `node tests/validate-project.js` para validar a sintaxe e confirmar que todos os arquivos externos estão carregados pelo jogo.

O próximo passo seguro é mover um sistema por vez do núcleo: renderização, combate, inimigos e interface. Dessa forma, cada mudança continua testável e não quebra o jogo que já funciona.
