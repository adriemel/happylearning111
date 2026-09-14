// Lightweight original vector character, animated without external images or timers.
export class DefeatSequence {
  constructor(){
    this.element=document.createElement('div');this.element.id='defeat';this.element.hidden=true;
    this.element.innerHTML=`<div class="defeat-shade"></div><div class="defeat-monster" aria-hidden="true">
      <svg viewBox="0 0 360 420" xmlns="http://www.w3.org/2000/svg">

        <defs><linearGradient id="entitySkin" x2=".8" y2="1"><stop stop-color="#96988b"/><stop offset=".5" stop-color="#505952"/><stop offset="1" stop-color="#20272a"/></linearGradient></defs>
        <ellipse cx="174" cy="398" rx="115" ry="16" fill="#000" opacity=".65"/>
        <g stroke="#161d20" stroke-width="5" stroke-linejoin="round">
          <path d="M134 276L123 337L98 395L129 396L160 339L176 293M185 291L204 344L213 399L245 400L232 334L216 273" fill="#252e30"/>
          <path d="M125 138L85 155L62 242L36 319L49 332L71 293L88 248L111 207M222 139L262 169L282 228L299 273L278 284L257 235L232 206" fill="url(#entitySkin)"/>
          <path d="M129 124L109 177L123 228L118 296L172 321L224 294L216 229L235 178L214 124Z" fill="url(#entitySkin)"/>
          <path d="M133 164L170 186L209 157M133 190L169 208L211 183M133 215L173 231L211 211M147 248L177 257L207 245" fill="none" stroke="#252f30" stroke-width="7"/>
          <path d="M138 42Q172 10 210 43L219 89L205 132L178 155L146 129L130 88Z" fill="url(#entitySkin)"/>
          <path d="M138 68L165 77L157 94L139 86ZM181 77L211 62L207 85L185 95Z" fill="#080d10"/>
          <path d="M145 81L154 83M191 82L200 78" stroke="#d4dcb6" stroke-width="3"/>
          <path d="M174 85L165 110L180 112" fill="none" stroke="#333b36"/>
          <path d="M157 122L181 115L194 121L182 136L166 139Z" fill="#090e10" stroke-width="2"/>
          <path d="M139 49L154 59L150 70M202 43L189 58M204 101L197 111L202 118" fill="none" stroke="#333e37" stroke-width="2"/>
          <path d="M41 310L23 344M47 318L34 356M54 314L48 350" fill="none" stroke="#626f62" stroke-width="6"/>
          <g transform="rotate(17 285 263)"><path d="M280 260L277 147Q301 167 307 187L303 252Z" fill="#aebcb9"/><path d="M284 170L288 242" stroke="#e0e7dc" stroke-width="2"/><path d="M272 255L311 255" stroke="#596256" stroke-width="8"/><rect x="282" y="260" width="19" height="42" rx="3" fill="#3b3530"/></g>
          <path d="M270 270L283 263L299 270L299 286L282 293L272 285Z" fill="#626e61"/>
        </g>
      </svg></div><div class="defeat-flash"></div><div class="defeat-message" role="status"><small>ERWISCHT!</small><strong>DU BIST<br>GESTORBEN</strong><span>Das war wohl die falsche Tür …</span></div>`;
    document.body.append(this.element);this.monster=this.element.querySelector('.defeat-monster');this.flash=this.element.querySelector('.defeat-flash');this.message=this.element.querySelector('.defeat-message');
  }
  start(){this.elapsed=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.element.hidden=false;this.update(0);}
  update(dt){
    this.elapsed+=dt;const t=this.elapsed,approach=Math.min(1,t/1.25);
    const scale=this.reduced?.82:.12+approach*approach*1.2;
    const sway=this.reduced?0:Math.sin(t*22)*(1-approach)*9;
    this.monster.style.transform=`translate(-50%,-50%) rotate(${sway}deg) scale(${scale})`;
    this.monster.style.opacity=t>1.45?Math.max(.2,1-(t-1.45)*2):1;
    this.flash.style.opacity=this.reduced?.15:Math.max(0,1-Math.abs(t-1.32)/.24)*.78;
    this.message.style.opacity=t>=1.4?1:0;
    return t>=3.2;
  }
  stop(){this.element.hidden=true;}
}
