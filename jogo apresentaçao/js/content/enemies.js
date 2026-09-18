/* Catálogo de inimigos comuns. Chefes permanecem configurados no núcleo até a próxima migração. */
window.TomatoContent = window.TomatoContent || {};
window.TomatoContent.enemyKinds = Object.freeze({
  toxic:{r:18,hp:42,speed:48,damage:8,color:'#8acb35',xp:4},normal:{r:15,hp:25,speed:63,damage:9,color:'#9d5ddb',xp:1},fast:{r:12,hp:16,speed:112,damage:7,color:'#6eb94c',xp:1},tank:{r:21,hp:72,speed:39,damage:15,color:'#e59145',xp:3},shooter:{r:16,hp:38,speed:52,damage:8,color:'#58a9d8',xp:3},explosive:{r:16,hp:30,speed:70,damage:22,color:'#e34b45',xp:3},elite:{r:24,hp:150,speed:58,damage:19,color:'#c35ee0',xp:8},healer:{r:18,hp:54,speed:57,damage:7,color:'#e45c83',xp:4},charger:{r:18,hp:48,speed:62,damage:17,color:'#e05f3f',xp:4},splitter:{r:20,hp:62,speed:50,damage:12,color:'#72a9d9',xp:5},shieldBug:{r:22,hp:105,speed:43,damage:16,color:'#468ca5',xp:7},sniperBug:{r:17,hp:46,speed:45,damage:18,color:'#5e657d',xp:7}
});
