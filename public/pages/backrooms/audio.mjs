export class Sound {
  constructor(){this.muted=false;this.nodes=[];}
  start(){this.active=true;try{this.context ||= new (window.AudioContext||window.webkitAudioContext)();this.context.resume().catch(()=>{});if(this.muted||this.nodes.length)return;const c=this.context,t=c.currentTime;this.bus=c.createGain();this.bus.gain.setValueAtTime(0,t);this.bus.gain.linearRampToValueAtTime(.07,t+2);this.bus.connect(c.destination);
    // Original evolving drone, detuned pad and fluorescent hum; no audio downloads.
    for(const [hz,level,rate] of [[55,.2,.071],[82.41,.1,.053],[110.3,.055,.043],[164.81,.035,.031],[50,.04,.09]]){const osc=c.createOscillator(),gain=c.createGain(),lfo=c.createOscillator(),depth=c.createGain();osc.frequency.value=hz;gain.gain.value=level;lfo.frequency.value=rate;depth.gain.value=level*.35;lfo.connect(depth);depth.connect(gain.gain);osc.connect(gain);gain.connect(this.bus);osc.start();lfo.start();this.nodes.push(osc,lfo,gain,depth);}
  }catch{}}
  tone(ok){if(this.muted||!this.context)return;try{const t=this.context.currentTime;const gain=this.context.createGain();gain.connect(this.context.destination);gain.gain.setValueAtTime(.035,t);gain.gain.exponentialRampToValueAtTime(.001,t+.4);const osc=this.context.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(ok?520:150,t);osc.frequency.exponentialRampToValueAtTime(ok?780:90,t+.3);osc.connect(gain);osc.start();osc.stop(t+.4);}catch{}}
  cancelSpeech(){this.speechToken=(this.speechToken||0)+1;clearTimeout(this.speechTimer);try{window.speechSynthesis?.cancel();}catch{}this.utterance=null;}
  speak(text,done=()=>{}){
    this.cancelSpeech();
    if(this.muted||!window.speechSynthesis||!window.SpeechSynthesisUtterance){done(false);return;}
    const token=this.speechToken;
    try{
      const u=new SpeechSynthesisUtterance(text);this.utterance=u;u.lang='es-ES';u.rate=.85;
      u.voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('es'))||null;
      const finish=ok=>{if(token!==this.speechToken)return;clearTimeout(this.speechTimer);this.utterance=null;done(ok);};
      u.onend=()=>finish(true);u.onerror=()=>finish(false);
      u.onstart=()=>clearTimeout(this.speechTimer);
      this.speechTimer=setTimeout(()=>{this.cancelSpeech();done(false);},8000);
      speechSynthesis.speak(u);
    }catch{this.cancelSpeech();done(false);}
  }
  walk(distance){
    if(!this.active||this.muted||!this.context||!distance)return;
    this.stepDistance=(this.stepDistance||0)+distance;
    if(this.stepDistance<.95)return;this.stepDistance%=.95;
    try{
      const c=this.context,t=c.currentTime;
      this.stepBuffer ||= c.createBuffer(1,Math.ceil(c.sampleRate*.14),c.sampleRate);
      const data=this.stepBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2);
      const n=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
      n.buffer=this.stepBuffer;filter.type='lowpass';filter.frequency.value=480+Math.random()*180;
      gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(this.utterance ? .025 : .075,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+.14);
      n.connect(filter);filter.connect(gain);gain.connect(c.destination);n.start();
      this.footNodes ||= new Set();const nodes=[n,filter,gain];this.footNodes.add(nodes);
      n.onended=()=>{nodes.forEach(node=>node.disconnect());this.footNodes.delete(nodes);};
    }catch{}
  }
  error(){if(this.muted||!this.context)return;try{const c=this.context,t=c.currentTime,g=c.createGain(),osc=c.createOscillator();g.connect(c.destination);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.06,t+.04);g.gain.exponentialRampToValueAtTime(.001,t+.85);osc.type='triangle';osc.frequency.setValueAtTime(125,t);osc.frequency.exponentialRampToValueAtTime(43,t+.8);osc.connect(g);osc.start();osc.stop(t+.9);osc.onended=()=>{osc.disconnect();g.disconnect();};const b=c.createBuffer(1,Math.ceil(c.sampleRate*.65),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2);const n=c.createBufferSource(),f=c.createBiquadFilter(),v=c.createGain();n.buffer=b;f.type='bandpass';f.frequency.setValueAtTime(720,t);f.frequency.exponentialRampToValueAtTime(160,t+.6);f.Q.value=2;v.gain.value=.065;n.connect(f);f.connect(v);v.connect(c.destination);n.start();n.onended=()=>{n.disconnect();f.disconnect();v.disconnect();};}catch{}}
  setMuted(muted){const active=this.active;this.muted=muted;this.stop();if(active)this.start();}
  stop(){this.active=false;this.cancelSpeech();this.stepDistance=0;for(const nodes of this.footNodes||[]){try{nodes[0].stop();nodes.forEach(n=>n.disconnect());}catch{}}this.footNodes?.clear();for(const node of this.nodes){try{node.stop?.();node.disconnect();}catch{}}this.nodes=[];this.bus?.disconnect();}
}
