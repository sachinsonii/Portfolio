/* ---- Theme toggle ---- */
(function(){
  var root=document.documentElement;
  var btn=document.querySelector('.theme-toggle');
  if(!btn)return;
  var KEY='theme';
  var mq=matchMedia('(prefers-color-scheme:light)');

  function current(){
    var t=root.getAttribute('data-theme');
    return (t==='light'||t==='dark')?t:(mq.matches?'light':'dark');
  }
  function apply(t,save){
    root.setAttribute('data-theme',t);
    btn.setAttribute('aria-pressed',t==='light'?'true':'false');
    btn.setAttribute('aria-label',t==='light'?'Switch to dark theme':'Switch to light theme');
    if(save){try{localStorage.setItem(KEY,t)}catch(e){}}
  }
  apply(current(),false);

  btn.addEventListener('click',function(){
    apply(current()==='light'?'dark':'light',true);
  });

  function onSysChange(){
    var stored=null;
    try{stored=localStorage.getItem(KEY)}catch(e){}
    if(stored!=='light'&&stored!=='dark')apply(mq.matches?'light':'dark',false);
  }
  if(mq.addEventListener)mq.addEventListener('change',onSysChange);
  else if(mq.addListener)mq.addListener(onSysChange);
})();

/* ---- Nav / menu ---- */
(function(){
  var b=document.querySelector('.burger'),m=document.getElementById('menu');
  b.addEventListener('click',function(){
    var o=m.classList.toggle('open');
    b.setAttribute('aria-expanded',o);
  });
  m.addEventListener('click',function(e){
    if(e.target.tagName==='A'){
      m.classList.remove('open');
      b.setAttribute('aria-expanded',false);
    }
  });
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
    });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});

  // hero network
  var cv=document.getElementById('net'),
      cx=cv.getContext('2d'),W,H,
      dpr=Math.min(window.devicePixelRatio||1,2),
      rm=matchMedia('(prefers-reduced-motion:reduce)').matches,
      mouse={x:-999,y:-999},running=true;
  var labels=['AI','ML','CV','RL','Research','Systems'],N=[];
  function css(v){
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#7cf0c8';
  }
  function size(){
    var r=cv.parentNode.getBoundingClientRect();
    W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;
    cx.setTransform(dpr,0,0,dpr,0,0);
    var count=W<600?22:48;N=[];
    for(var i=0;i<count;i++){
      N.push({
        x:Math.random()*W,y:Math.random()*H,
        vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,
        l:i<labels.length?labels[i]:null
      });
    }
  }
  function draw(){
    cx.clearRect(0,0,W,H);
    var a=css('--acc'),f=css('--mut'),maxd=W<600?100:150;
    cx.globalAlpha=.5;
    for(var i=0;i<N.length;i++){
      var p=N[i];
      if(!rm){
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1;
        if(p.y<0||p.y>H)p.vy*=-1;
        var dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<140&&d>0){p.x+=dx/d*1.2;p.y+=dy/d*1.2}
      }
      for(var j=i+1;j<N.length;j++){
        var q=N[j],ex=p.x-q.x,ey=p.y-q.y,e=Math.sqrt(ex*ex+ey*ey);
        if(e<maxd){
          cx.strokeStyle=a;cx.globalAlpha=(1-e/maxd)*.35;
          cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke();
        }
      }
      cx.globalAlpha=p.l?.9:.5;
      cx.fillStyle=p.l?a:f;
      cx.beginPath();cx.arc(p.x,p.y,p.l?4:2,0,6.283);cx.fill();
      if(p.l){
        cx.font='11px '+css('--mono');
        cx.fillStyle=f;
        cx.fillText(p.l.toUpperCase(),p.x+8,p.y+4);
      }
    }
    cx.globalAlpha=1;
  }
  function loop(){if(running&&!rm)requestAnimationFrame(loop);draw()}
  size();loop();
  addEventListener('resize',function(){size();if(rm)draw()});
  // redraw on theme change
  new MutationObserver(function(){draw()})
    .observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  cv.parentNode.addEventListener('pointermove',function(e){
    var r=cv.getBoundingClientRect();
    mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
  });
  cv.parentNode.addEventListener('pointerleave',function(){mouse.x=mouse.y=-999});
  new IntersectionObserver(function(es){
    var v=es[0].isIntersecting;
    if(v&&!running){running=true;loop()}
    running=v;
  }).observe(cv);
})();

/* ---- creative layer ---- */
(function(){
  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,
      fine=matchMedia('(pointer:fine)').matches;

  // progress
  var pg=document.getElementById('prog');
  addEventListener('scroll',function(){
    var h=document.documentElement;
    pg.style.transform='scaleX('+(scrollY/Math.max(1,h.scrollHeight-innerHeight))+')';
  },{passive:true});

  // scramble name
  var h1=document.querySelector('h1'),fin=h1.textContent;
  if(!rm){
    var ch='01<>/{}#ΣΔλ∇',f=0;
    h1.setAttribute('aria-label',fin);
    var iv=setInterval(function(){
      f++;
      h1.textContent=fin.split('').map(function(c,k){
        return c===' '||k<f/2?c:ch[Math.random()*ch.length|0];
      }).join('');
      if(f>fin.length*2+2){clearInterval(iv);h1.textContent=fin}
    },45);
  }

  // cursor ring + magnetic buttons
if(fine&&!rm){
  var r=document.createElement('div');
  r.id='ring';
  r.setAttribute('aria-hidden','true');
  document.body.appendChild(r);

  var mx=0,my=0,rx=0,ry=0;
  var snapEl=null;

  // Every element that visually reacts to hover
  var HOVERABLE=[
    'a[href]',
    'button',
    '.pcard',           // project cards (front + back face)
    '.titem',           // tech stack chips
    '.rg>div',          // research grid cells
    '.job',             // experience rows
    '.pub',             // publication rows
    '.scholar',         // scholar CTA box
    '.photo',           // profile photo
    '.tag',             // focus / project tags
    '.parrow',          // project arrows
    '.pdot',            // project dots
    '.logo',            // site logo
    '.mq div'           // marquee track
  ].join(',');

  // Large enough for project cards (~540×360) but small enough to
  // skip whole sections. Tune to taste.
  var MAX_W=700, MAX_H=420;

  function reset(){
    r.style.width='';
    r.style.height='';
    r.style.marginLeft='';
    r.style.marginTop='';
    r.style.borderRadius='';
    r.classList.remove('big');
  }

  function setSnap(el){
    if(el===snapEl)return;
    snapEl=el;

    if(!el){ reset(); return; }

    var rect=el.getBoundingClientRect();
    if(rect.width>MAX_W||rect.height>MAX_H){
      snapEl=null;
      reset();
      return;
    }

    var cs=getComputedStyle(el);
    r.style.width=rect.width+'px';
    r.style.height=rect.height+'px';
    r.style.marginLeft=(-rect.width/2)+'px';
    r.style.marginTop=(-rect.height/2)+'px';
    r.style.borderRadius=cs.borderRadius;
    r.classList.add('big');
  }

  (function frame(){
    var tx,ty,ease;
    if(snapEl){
      var br=snapEl.getBoundingClientRect();
      tx=br.left+br.width/2;
      ty=br.top+br.height/2;
      ease=0.22;
    }else{
      tx=mx;ty=my;ease=0.18;
    }
    rx+=(tx-rx)*ease;
    ry+=(ty-ry)*ease;
    r.style.transform='translate('+rx+'px,'+ry+'px)';
    requestAnimationFrame(frame);
  })();

  addEventListener('pointermove',function(e){
    mx=e.clientX;my=e.clientY;
    r.style.opacity=1;
    var el=e.target.closest(HOVERABLE);
    if(el!==snapEl)setSnap(el);
  });

  document.addEventListener('mouseleave',function(){
    r.style.opacity=0;
    setSnap(null);
  });
}
})();

/* ---- TECH STACK slider ---- */
(function(){
  var el=document.getElementById('tslider');
  if(!el)return;
  var track=document.getElementById('ttrack'),
      list=track.querySelector('.tlist');
  if(!list)return;
  var clone=list.cloneNode(true);
  clone.setAttribute('aria-hidden','true');
  track.appendChild(clone);

  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var paused=false,dragging=false,startX=0,startScroll=0,pos=0;

  el.addEventListener('pointerenter',function(){paused=true});
  el.addEventListener('pointerleave',function(){paused=false});
  el.addEventListener('focusin',function(){paused=true});
  el.addEventListener('focusout',function(){paused=false});

  el.addEventListener('scroll',function(){
    if(Math.abs(el.scrollLeft-pos)>2) pos=el.scrollLeft;
  },{passive:true});

  el.addEventListener('pointerdown',function(e){
    if(e.pointerType!=='mouse')return;
    dragging=true;startX=e.clientX;startScroll=el.scrollLeft;pos=el.scrollLeft;
    el.classList.add('drag');
    if(el.setPointerCapture){try{el.setPointerCapture(e.pointerId)}catch(_){}}
    e.preventDefault();
  });
  el.addEventListener('pointermove',function(e){
    if(!dragging)return;
    el.scrollLeft=startScroll-(e.clientX-startX);
    pos=el.scrollLeft;
  });
  ['pointerup','pointercancel','pointerleave'].forEach(function(t){
    el.addEventListener(t,function(){dragging=false;el.classList.remove('drag')});
  });

  pos=el.scrollLeft;
  (function frame(){
    var half=el.scrollWidth/2;
    if(half>0){
      if(el.scrollLeft>=half){el.scrollLeft-=half;pos-=half}
      else if(el.scrollLeft<0){el.scrollLeft+=half;pos+=half}
      if(!rm&&!paused&&!dragging){
        pos+=0.6;
        if(pos>=half)pos-=half;
        el.scrollLeft=pos;
      }
    }
    requestAnimationFrame(frame);
  })();

  new IntersectionObserver(function(es){
    el.dataset.visible=es[0].isIntersecting?'1':'0';
  },{threshold:.05}).observe(el);
})();

/* ---- PROJECTS : 2-card auto slider with click-to-flip cards ---- */
(function(){
  var slider=document.getElementById('pslider');
  if(!slider)return;
  var viewport=slider.querySelector('.pviewport'),
      track=document.getElementById('ptrack'),
      dots=document.getElementById('pdots'),
      cards=Array.prototype.slice.call(track.children),
      prevB=slider.querySelector('[data-dir="-1"]'),
      nextB=slider.querySelector('[data-dir="1"]'),
      rm=matchMedia('(prefers-reduced-motion:reduce)').matches,
      index=0,pages=1,paused=false,inView=true;

  /* Flip on click / keyboard */
  cards.forEach(function(card){
    var front=card.querySelector('.flip-front'),
        back=card.querySelector('.flip-back');
    if(!front||!back)return;
    function flip(){card.classList.toggle('flipped')}
    function unflip(){card.classList.remove('flipped')}
    front.addEventListener('click',flip);
    back.addEventListener('click',function(e){
      if(e.target.closest('.go'))return;
      unflip();
    });
    card.addEventListener('keydown',function(e){
      if(e.key==='Escape')unflip();
    });
    card.addEventListener('transitionend',function(e){
      if(e.propertyName!=='transform')return;
      if(card.classList.contains('flipped')){
        var link=back.querySelector('.go');
        if(link&&document.activeElement===front)link.focus();
      }else{
        if(document.activeElement===back||back.contains(document.activeElement))front.focus();
      }
    });
  });

  function gap(){
    var g=parseFloat(getComputedStyle(track).columnGap);
    return isNaN(g)?20:g;
  }
  function cardStep(){
    return cards[0].getBoundingClientRect().width+gap();
  }
  function perView(){
    return Math.max(1,Math.round(viewport.clientWidth/cardStep()));
  }

  function render(){
    var pv=perView(),
        offset=index*pv*cardStep(),
        maxOffset=Math.max(0,track.scrollWidth-viewport.clientWidth);
    if(offset>maxOffset)offset=maxOffset;
    track.style.transform='translateX('+(-offset)+'px)';

    Array.prototype.forEach.call(dots.children,function(d,i){
      d.classList.toggle('on',i===index);
      d.setAttribute('aria-current',i===index?'true':'false');
    });
    cards.forEach(function(c,i){
      var vis=i>=index*pv && i<(index+1)*pv;
      if(!vis)c.classList.remove('flipped');
      if('inert' in c){c.inert=!vis}
      else if(vis){c.removeAttribute('tabindex')}else{c.setAttribute('tabindex','-1')}
    });
  }
  function build(){
    pages=Math.max(1,Math.ceil(cards.length/perView()));
    if(index>pages-1)index=pages-1;
    dots.innerHTML='';
    for(var i=0;i<pages;i++){
      (function(i){
        var btn=document.createElement('button');
        btn.type='button';btn.className='pdot';btn.dataset.i=i;
        btn.setAttribute('aria-label','Go to slide '+(i+1));
        btn.addEventListener('click',function(){go(i)});
        dots.appendChild(btn);
      })(i);
    }
    render();
  }
  function go(i){index=(i+pages)%pages;render()}

  prevB.addEventListener('click',function(){go(index-1)});
  nextB.addEventListener('click',function(){go(index+1)});
  slider.addEventListener('pointerenter',function(){paused=true});
  slider.addEventListener('pointerleave',function(){paused=false});
  slider.addEventListener('focusin',function(){paused=true});
  slider.addEventListener('focusout',function(){paused=false});
  slider.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'){go(index+1);e.preventDefault()}
    if(e.key==='ArrowLeft'){go(index-1);e.preventDefault()}
  });

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){inView=es[0].isIntersecting},{threshold:.2}).observe(slider);
  }
  if(!rm){
    setInterval(function(){
      if(!paused&&inView&&!document.hidden&&pages>1)go(index+1);
    },4800);
  }
  var rt;
  addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150)});
  build();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(build);
})();

