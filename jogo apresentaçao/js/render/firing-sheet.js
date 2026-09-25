/* A imagem fornecida é preservada inteira. Recortes são feitos só ao desenhar. */
window.TomatoRender = window.TomatoRender || {};
window.TomatoRender.createFiringSheet = cache => {
  const image=typeof Image==='function'?new Image():null;
  if(image){image.decoding='async';image.src='./assets/effects/firing-reference.png';}
  function frame(key,rect,width,height,color){
    if(!image?.complete||!image.naturalWidth)return null;
    return cache.get('sheet:'+key+':'+color,width,height,g=>{
      const sx=image.naturalWidth/2048,sy=image.naturalHeight/683;
      g.drawImage(image,rect[0]*sx,rect[1]*sy,rect[2]*sx,rect[3]*sy,0,0,width,height);
      if(color){g.globalCompositeOperation='multiply';g.globalAlpha=.42;g.fillStyle=color;g.fillRect(0,0,width,height)}
    },1);
  }
  return {
    muzzle(index,color){const xs=[66,178,288,391,486,581,666,747];return frame('muzzle:'+index,[xs[index],540,96,104],96,104,color);},
    bullet(){return frame('bullet',[202,378,170,56],102,34,'');},
    casing(){return frame('casing',[1660,572,35,25],14,10,'');}
  };
};
