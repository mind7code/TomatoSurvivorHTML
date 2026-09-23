const assert=require('assert/strict');
const {createGame}=require('./harness');
for(const [width,height] of [[1280,720],[1366,768],[1920,1080],[2560,1440]]){
  const g=createGame({width,height});g.execute('startGame()');g.runFrames(60,1);
  // Testa a geometria de rótulos; os retângulos são sintéticos, não medições de CSS.
  const blockers=[{x:0,y:0,width:width*.38,height:height*.11},{x:width*.86,y:0,width:width*.14,height:height*.43},{x:width*.3,y:height*.86,width:width*.4,height:height*.14}];
  const place=g.sandbox.TomatoRender.placeLabel;
  for(const [x,y] of [[-20,-10],[width+20,height+10],[width*.9,30],[width*.5,height-20],[width*.5,height*.5]]){
    const p=place(x,y,120,24,{width,height},blockers);assert(p,'Há espaço disponível fora da HUD');
    assert(p.x-60>=0&&p.x+60<=width&&p.y-24>=0&&p.y<=height);
    assert(!blockers.some(r=>p.x+60>r.x&&p.x-60<r.x+r.width&&p.y>r.y&&p.y-24<r.y+r.height));
  }
  assert.equal(place(30,30,100,24,{width,height},[{x:0,y:0,width,height}]),null);
  assert.equal(g.messages.filter(m=>m.type==='error').length,0);
}
console.log('Canvas simulado e geometria de safe area aprovados: 1280x720,1366x768,1920x1080,2560x1440. Sem validação visual/CSS em navegador.');
