import * as THREE from './vendor/three.module.js';
export class World {
  constructor(container) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); container.append(this.renderer.domElement);
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#817952'); this.scene.fog = new THREE.Fog('#817952', 12, 30);
    this.camera = new THREE.PerspectiveCamera(68, 1, .1, 45); this.camera.rotation.order = 'YXZ';
    this.scene.add(new THREE.HemisphereLight(0xfff3bf, 0x51482c, 2.4));
    this.materials = {}; this.geometry = new THREE.BoxGeometry(1, 1, 1);
    const carpet=document.createElement('canvas');carpet.width=carpet.height=64;const ctx=carpet.getContext('2d');
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){const v=95+((x*17+y*31+x*y)%27);ctx.fillStyle=`rgb(${v+13},${v+5},${v-22})`;ctx.fillRect(x,y,1,1);}
    const texture=new THREE.CanvasTexture(carpet);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(12,24);texture.colorSpace=THREE.SRGBColorSpace;
    this.materials['#827654']=new THREE.MeshLambertMaterial({map:texture});
    this.materials['#f6f3d4']=new THREE.MeshBasicMaterial({color:'#f6f3d4'});
    this.group = new THREE.Group(); this.scene.add(this.group); this.doors = []; this.yaw = 0; this.pitch = 0;
    this.makeDetails();this.resize();
  }
  makeDetails(){
    this.decalGeometry=new THREE.PlaneGeometry(1,1);this.decals={};
    const make=(name,draw)=>{
      const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');draw(g);
      const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
      this.decals[name]=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide});
    };
    make('writing',g=>{g.translate(256,256);g.rotate(-.07);g.fillStyle='#383c2bc4';g.textAlign='center';g.font='bold 44px monospace';g.fillText('¿HAY ALGUIEN?',0,-28);g.font='28px monospace';g.fillText('SECTOR 07',0,28);g.lineWidth=5;g.strokeStyle='#383c2b88';g.beginPath();g.moveTo(-125,70);g.lineTo(100,70);g.lineTo(65,55);g.moveTo(100,70);g.lineTo(68,88);g.stroke();});
    make('scratches',g=>{g.strokeStyle='#423e2caa';for(let i=0;i<6;i++){g.lineWidth=2+i%3;g.beginPath();g.moveTo(95+i*48,100+i%2*40);g.lineTo(70+i*46,370-i*13);g.stroke();}});
    make('slime',g=>{const glow=g.createRadialGradient(260,260,15,256,256,220);glow.addColorStop(0,'#799629c9');glow.addColorStop(.65,'#435726bf');glow.addColorStop(1,'#39472600');g.fillStyle=glow;g.beginPath();for(let i=0;i<=60;i++){const a=i/60*Math.PI*2,r=160+22*Math.sin(a*5)+18*Math.cos(a*3);g.lineTo(256+Math.cos(a)*r,256+Math.sin(a)*r*.75);}g.fill();for(let i=0;i<12;i++){g.strokeStyle='#bdd47777';g.lineWidth=2;g.beginPath();g.ellipse(150+i*17,225+Math.sin(i*9)*45,3+i%5,2+i%3,0,0,Math.PI*2);g.stroke();}});
    make('shadow',g=>{const shade=g.createRadialGradient(255,305,30,255,305,200);shade.addColorStop(0,'#151c18c4');shade.addColorStop(.55,'#1b21188a');shade.addColorStop(1,'#18201600');g.fillStyle=shade;g.fillRect(0,0,512,512);g.fillStyle='#151c1888';g.beginPath();g.ellipse(252,165,32,46,0,0,Math.PI*2);g.ellipse(250,295,47,98,.08,0,Math.PI*2);g.fill();});
    make('damp',g=>{for(let i=0;i<18;i++){g.fillStyle='#514b2820';g.beginPath();g.ellipse(80+i*20,180+Math.sin(i*4)*95,25+i%3*12,70+i%5*22,.1,0,Math.PI*2);g.fill();}});
  }
  decal(name,x,y,z,w,h,rotationY=0,floor=false){const m=new THREE.Mesh(this.decalGeometry,this.decals[name]);m.position.set(x,y,z);m.scale.set(w,h,1);if(floor)m.rotation.x=-Math.PI/2;else m.rotation.y=rotationY;this.group.add(m);return m;}
  material(color) { return this.materials[color] ||= new THREE.MeshLambertMaterial({ color }); }
  box(x,y,z,w,h,d,color) { const m = new THREE.Mesh(this.geometry,this.material(color)); m.position.set(x,y,z);m.scale.set(w,h,d);this.group.add(m);return m; }
  resize() { this.camera.aspect = innerWidth / innerHeight; this.camera.fov = this.camera.aspect < .8 ? 110 : 68; this.camera.updateProjectionMatrix(); this.renderer.setSize(innerWidth,innerHeight); }
  room(labels, index, final) {
    for(const d of this.doors){d.sign.geometry.dispose();d.sign.material.map.dispose();d.sign.material.dispose();}
    this.group.clear(); document.querySelector('#labels').replaceChildren(); this.doors=[];this.obstacles=[];this.openIndex=-1;this.final=final;
    this.camera.position.set(0,1.65,3.5);this.yaw=0;this.pitch=0;
    this.box(0,-.1,-2,12,.2,24,'#827654');this.box(0,3.3,-2,12,.2,24,'#b4ac87');
    for(const x of [-6,6]) this.box(x,1.6,-2,.2,3.4,24,index%2?'#b8ac72':'#bdb480');
    this.box(0,1.6,6,12,3.4,.2,'#b8ac72');
    for(let x=-5.5;x<=5.5;x+=.55)for(const side of [-6,6])this.box(side*.997,1.6,x,.025,3.1,.014,'#a99f6d');
    for(let z=-10;z<6;z+=2){this.box(0,3.17,z,12,.025,.03,'#8f8c71');this.box(0,3.13,z,1.9,.05,.42,'#f6f3d4');}
    for(let x=-4;x<=4;x+=2)this.box(x,3.17,-2,.025,.025,24,'#8f8c71');
    const positions=labels.length===2?[-2.6,2.6]:[-3.6,0,3.6];
    // Segment the front wall around door openings; the corridor beyond stays enclosed.
    let left=-6;
    positions.forEach((x,i)=>{
      const edge=x-.95;this.box((left+edge)/2,1.6,-5,edge-left,3.4,.2,'#b8ac72');left=x+.95;
      this.box(x,2.94,-5,1.9,.7,.2,'#b8ac72');
      this.box(x-1,1.3,-4.94,.12,2.6,.25,'#4d4e38');this.box(x+1,1.3,-4.94,.12,2.6,.25,'#4d4e38');this.box(x,2.6,-4.94,2.1,.1,.25,'#4d4e38');
      const mesh=this.box(x,1.27,-5,1.82,2.52,.14,'#686d4a');
      const knob=this.box(x+.65,1.15,-4.86,.12,.12,.1,'#d7d9ac');
      const label=document.createElement('div');label.className='door-label world-sign-text';label.textContent=labels[i];document.querySelector('#labels').append(label);
      const sign=this.makeSign(labels[i],x);
      this.doors.push({x,mesh,knob,label,sign,failed:false,open:false});
    });this.box((left+6)/2,1.6,-5,6-left,3.4,.2,'#b8ac72');
    this.box(0,1.6,-13,12,3.4,.2,final?'#eaf5e2':'#a59d71');
    this.box(-5.8,.07,1,.15,.15,8,'#5a5841');this.box(5.8,.07,1,.15,.15,8,'#5a5841');
    this.exit=this.box(0,1.5,-12.8,2.2,3,.04,final?'#f7ffed':'#d1cea7');
    if(final){const sign=document.createElement('div');sign.className='door-label open';sign.textContent='AUSGANG ↗';document.querySelector('#labels').append(sign);this.exitLabel=sign;}else this.exitLabel=null;
    this.decorate(index);
  }
  makeSign(text,x){
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=224;
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.56),new THREE.MeshBasicMaterial({map}));
    sign.position.set(x,2.96,-4.84);sign.userData={text,canvas};this.paintSign(sign);this.group.add(sign);return sign;
  }
  paintSign(sign,state='normal'){
    const {canvas,text}=sign.userData,g=canvas.getContext('2d');
    g.fillStyle=state==='failed'?'#604843':state==='open'?'#d6eaa5':'#eee7c9';g.fillRect(0,0,768,224);
    g.strokeStyle='#6c674d';g.lineWidth=12;g.strokeRect(6,6,756,212);
    let lines=[],size=84;
    for(;size>=18;size-=2){
      g.font=`700 ${size}px system-ui, sans-serif`;lines=[];let line='';
      for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(line&&g.measureText(next).width>712){lines.push(line);line=word;}else line=next;}
      if(line)lines.push(line);
      if(lines.length*size*1.18<=180&&lines.every(l=>g.measureText(l).width<=712))break;
    }
    g.fillStyle=state==='failed'?'#ffffff':'#24291e';g.textAlign='center';g.textBaseline='middle';
    lines.forEach((line,i)=>g.fillText(line,384,112+(i-(lines.length-1)/2)*size*1.18,712));sign.material.map.needsUpdate=true;
  }
  decorate(index){
    this.decal('writing',-5.88,1.8,.2,2.5,2.5,Math.PI/2);
    this.decal('scratches',5.88,1.6,-1.5,1.5,1.8,-Math.PI/2);
    this.decal('damp',5.87,2.15,2.5,2.8,2.4,-Math.PI/2);
    this.decal('damp',-5.87,2.4,-3.2,2,1.7,Math.PI/2);
    this.decal('slime',(index%2?1:-1)*3.5,.025,1.5,2.8,2.2,0,true);
    this.decal('shadow',index%2?5.35:-5.35,1.25,-4.88,1.05,2.5);
    this.decal('scratches',1.8,1.6,5.88,2,2,Math.PI);

    // Props never depend on answer placement; all three approaches stay clear.
    const side=Math.random()<.5?-1:1,x=side*4.9,z=-.8+Math.random()*2;
    this.box(x,.52,z,.75,.12,.72,'#504b36');this.box(x,.98,z+.3,.75,.8,.12,'#69634a');
    for(const dx of [-.28,.28])for(const dz of [-.26,.26])this.box(x+dx,.25,z+dz,.055,.5,.055,'#45483e');
    this.obstacles.push({x,z,r:.65});
    for(let i=0;i<4+Math.floor(Math.random()*5);i++){const paper=this.box((Math.random()-.5)*8,.012,Math.random()*6-2,.16+Math.random()*.16,.015,.22,'#c5bda0');paper.rotation.y=Math.random()*Math.PI;}
    const fx=-side*(1+Math.random()*1.4);
    for(let i=0;i<7;i++){const print=this.box(fx+(i%2?.13:-.13),.014,2.5-i*.34,.10,.006,.23,'#6c654a');print.rotation.y=.2;}
    const corner=new THREE.Vector3(-side*5.87,3.12,-4.78);
    const strand=(a,b)=>{const delta=b.clone().sub(a),m=this.box(...a.clone().add(b).multiplyScalar(.5).toArray(),.008,delta.length(),.008,'#d0c9ac');m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());};
    const rays=[];for(let i=0;i<6;i++){const angle=i/5*Math.PI/2,end=corner.clone().add(new THREE.Vector3(side*Math.cos(angle)*1.1,-Math.sin(angle)*1.1,0));rays.push(end);strand(corner,end);}
    for(const radius of [.25,.5,.75,1])for(let i=0;i<5;i++)strand(corner.clone().lerp(rays[i],radius),corner.clone().lerp(rays[i+1],radius));
  }
  look(dx,dy,sensitivity=1) { this.yaw-=dx*.004*sensitivity;this.pitch=Math.max(-.7,Math.min(.7,this.pitch-dy*.003*sensitivity)); }
  move(side,forward,dt) {
    const length=Math.max(1,Math.hypot(side,forward)),speed=3*dt;
    const p=this.camera.position;
    let x=p.x+(Math.cos(this.yaw)*side-Math.sin(this.yaw)*forward)/length*speed;
    let z=p.z+(-Math.sin(this.yaw)*side-Math.cos(this.yaw)*forward)/length*speed;
    x=Math.max(-5.65,Math.min(5.65,x));z=Math.min(5.55,z);
    const open=this.doors[this.openIndex];
    if(z< -4.55 && (!open || Math.abs(x-open.x)>.65)) { if(p.z>=-4.55)z=-4.55; else if(p.z> -5.6)x=p.x; }
    if(p.z< -4.55 && p.z> -5.6 && open)x=Math.max(open.x-.65,Math.min(open.x+.65,x));
    for(const o of this.obstacles){if(Math.hypot(x-o.x,z-o.z)<o.r){if(Math.hypot(p.x-o.x,z-o.z)>=o.r)x=p.x;else if(Math.hypot(x-o.x,p.z-o.z)>=o.r)z=p.z;else{x=p.x;z=p.z;}}}
    this.lastDistance=Math.hypot(x-p.x,Math.max(-12,z)-p.z);
    p.set(x,1.65,Math.max(-12,z));
  }
  nearest() { if(this.camera.position.z< -5.4)return -1;return this.doors.findIndex(d=>Math.hypot(d.x-this.camera.position.x,-4.6-this.camera.position.z)<1.55); }
  open(i) { this.openIndex=i;this.doors[i].open=true;this.doors[i].label.classList.add('open');this.paintSign(this.doors[i].sign,'open'); }
  fail(i) {this.doors[i].failed=true;this.doors[i].shake=.7;this.doors[i].label.classList.add('failed');this.paintSign(this.doors[i].sign,'failed');}
  render(dt) {
    this.camera.rotation.set(this.pitch,this.yaw,0);
    for(const d of this.doors){if(d.shake>0){d.shake=Math.max(0,d.shake-dt);const offset=matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.sin(d.shake*65)*.09*d.shake/.7;d.mesh.position.x=d.x+offset;d.knob.position.x=d.x+.65+offset;}if(d.open){d.mesh.position.y=Math.min(4,d.mesh.position.y+dt*3);d.knob.visible=false;}}
    if(this.exitLabel)this.project(this.exitLabel,0,2.7,-12.5);
    this.renderer.render(this.scene,this.camera);
  }
  project(label,x,y,z){const v=new THREE.Vector3(x,y,z).project(this.camera);label.style.display=v.z<1&&v.z> -1&&Math.abs(v.x)<1.2?'block':'none';label.style.left=`${Math.max(65,Math.min(innerWidth-65,(v.x*.5+.5)*innerWidth))}px`;label.style.top=`${(-v.y*.5+.5)*innerHeight}px`;label.style.maxWidth=`${Math.min(200,innerWidth/3-12)}px`;}
}
