/* Posição lógica: independente de DPI, tamanho CSS e resolução adaptativa. */
window.TomatoCombat = window.TomatoCombat || {};
window.TomatoCombat.createPointerAim = ({canvas,width,height,isPlaying}) => {
  const state={active:false,down:false,pressed:false,x:width/2,y:height/2,id:null};
  function position(event){
    const rect=canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    state.x=Math.max(0,Math.min(width,(event.clientX-rect.left)*width/rect.width));
    state.y=Math.max(0,Math.min(height,(event.clientY-rect.top)*height/rect.height));
    state.active=true;
  }
  function release(event){
    if(event.pointerId!==state.id)return;
    state.down=false;state.id=null;
  }
  canvas.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||!isPlaying())return;
    position(event);
    if(state.down&&event.buttons===0)release(event);
  });
  canvas.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch'||event.button!==0||!isPlaying())return;
    event.preventDefault();position(event);state.down=true;state.pressed=true;state.id=event.pointerId;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',event=>{release(event);state.pressed=false;});
  canvas.addEventListener('lostpointercapture',event=>{if(event.pointerId===state.id){release(event);state.pressed=false;}});
  addEventListener('pointerup',release);
  return {
    state,
    world(camera,zoom){return {x:camera.x+state.x/zoom,y:camera.y+state.y/zoom};},
    consume(){const fire=state.down||state.pressed;state.pressed=false;return fire;},
    reset(){const id=state.id;state.down=state.pressed=state.active=false;state.id=null;if(id!==null&&canvas.hasPointerCapture?.(id))canvas.releasePointerCapture(id);}
  };
};
