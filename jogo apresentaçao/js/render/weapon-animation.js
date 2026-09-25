/* A mesma sequência da referência, adaptada à massa/cadência de cada arma. */
window.TomatoRender = window.TomatoRender || {};
window.TomatoRender.weaponAnimation = (weapon, stats, attackSpeed) => {
  const duration=Math.max(.075,Math.min(.42,stats.rate/Math.max(.1,attackSpeed)*.8));
  const age=weapon.shotAge??Infinity;
  if(age>=duration)return {frame:0,kick:0,lift:0,thrust:0};
  const t=age/duration,frame=Math.min(7,Math.floor(t*8));
  const kick=t<.16?0:Math.sin(Math.PI*Math.min(1,(t-.16)/.84));
  const weight=Math.min(1,Math.max(.16,stats.recoil/14));
  if(stats.type==='melee'){
    const thrust=stats.effect==='thrust'?Math.sin(t*Math.PI)*14:0;
    return {frame,kick:weight*kick*.3,lift:thrust?0:Math.sin(t*Math.PI)*(.45+stats.size*.28)-.15,thrust};
  }
  return {frame,kick:weight*kick,lift:weight*kick*.19,thrust:0};
};
