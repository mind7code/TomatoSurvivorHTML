const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../js/audio.js'),'utf8');
function manager(AudioContext){const warnings=[];const sandbox={window:{AudioContext},console:{warn:(...args)=>warnings.push(args)}};vm.createContext(sandbox);vm.runInContext(source,sandbox);return {audio:sandbox.window.TomatoAudio.createManager(()=>1),warnings};}
async function main(){
  const unsupported=manager();unsupported.audio.play('shoot');unsupported.audio.play('shoot');assert.equal(unsupported.warnings.length,1);
  let instance,resumeCalls=0,disconnects=0,oscillators=0;
  class AudioContext {
    constructor(){instance=this;this.state='suspended';this.currentTime=1;this.destination={};}
    resume(){resumeCalls++;this.state='running';return Promise.resolve();}
    createOscillator(){oscillators++;return {connect(){},disconnect(){disconnects++},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},start(){},stop(){this.onended();}};}
    createGain(){return {connect(){},disconnect(){disconnects++},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}}};}
  }
  const running=manager(AudioContext);running.audio.play('shoot');await Promise.resolve();running.audio.play('hit');
  assert.equal(resumeCalls,1);assert.equal(oscillators,1);assert.equal(disconnects,2);assert.equal(running.warnings.length,0);
  instance.state='closed';running.audio.play('wave');assert.equal(running.warnings.length,1);
  class DeniedContext extends AudioContext { resume(){return Promise.reject(new Error('Permissão negada'));} }
  const denied=manager(DeniedContext);denied.audio.play('wave');await new Promise(resolve=>setImmediate(resolve));assert.equal(denied.warnings.length,1);
  console.log('Áudio: suporte ausente, resume, rejeição e desconexão dos nós aprovados com mocks.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
