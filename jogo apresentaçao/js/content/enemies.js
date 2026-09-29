/* Catálogo de inimigos comuns. Chefes permanecem configurados no núcleo até a próxima migração. */
window.TomatoContent = window.TomatoContent || {};
window.TomatoContent.enemyKinds = Object.freeze({
  toxic:{name:'Fungoso',theme:'fungus',r:18,hp:42,speed:48,damage:8,color:'#9aae42',xp:4},
  normal:{name:'Podrinho',theme:'rot',r:15,hp:25,speed:63,damage:9,color:'#9a629f',xp:1},
  fast:{name:'Parasita',theme:'parasite',r:12,hp:16,speed:112,damage:7,color:'#c77b88',xp:1},
  tank:{name:'Tanque Podre',theme:'tank',r:21,hp:72,speed:39,damage:15,color:'#9a7658',xp:3},
  shooter:{name:'Cuspidor',theme:'spitter',r:16,hp:38,speed:52,damage:8,color:'#9b5ca8',xp:3},
  explosive:{name:'Bomba de Mofo',theme:'mold',r:16,hp:30,speed:70,damage:22,color:'#b9655f',xp:3},
  elite:{name:'Necrobrot',theme:'necro',r:24,hp:150,speed:58,damage:19,color:'#78934c',xp:8},
  healer:{name:'Broto Pútrido',theme:'mold',r:18,hp:54,speed:57,damage:7,color:'#a86f87',xp:4},
  charger:{name:'Aríete Podre',theme:'rot',r:18,hp:48,speed:62,damage:17,color:'#9e615c',xp:4},
  splitter:{name:'Gêmeo Fúngico',theme:'fungus',r:20,hp:62,speed:50,damage:12,color:'#8b6f95',xp:5},
  shieldBug:{name:'Cascarudo Podre',theme:'tank',r:22,hp:105,speed:43,damage:16,color:'#786b57',xp:7},
  sniperBug:{name:'Olho de Mofo',theme:'spitter',r:17,hp:46,speed:45,damage:18,color:'#886080',xp:7}
});
