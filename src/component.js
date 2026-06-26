
class Component extends DCLogic {
  state = { measure:null, showQwen:true, selFam:null, qStage:'all', scope:'all', hover:null, hx:0, hy:0, hw:0, hh:0 };

  componentDidMount(){ this._tick(0); }
  _tick(n){ if(window.TAXO){ this.forceUpdate(); } else if(n<80){ setTimeout(()=>this._tick(n+1),40); } }

  setShare=()=>this.setState({measure:'share'});
  setRate=()=>this.setState({measure:'rate'});
  setCount=()=>this.setState({measure:'count'});
  setTxRate=()=>this.setState({measure:'txrate'});
  toggleQwen=()=>this.setState(s=>({showQwen:!s.showQwen}));
  pickFam=(k)=>this.setState(s=>({selFam:s.selFam===k?null:k, qStage:'all'}));
  clearSel=()=>this.setState({selFam:null});
  setQStage=(c)=>this.setState(s=>({qStage:s.qStage===c?'all':c}));
  setScope=(v)=>this.setState(s=>({scope:s.scope===v?'all':v}));
  allBench=()=>this.setState({scope:'all'});
  onFlowMove=(e)=>{ const r=e.currentTarget.getBoundingClientRect(); this.setState({hx:e.clientX-r.left, hy:e.clientY-r.top, hw:r.width, hh:r.height}); };
  onFlowLeave=()=>this.setState({hover:null});

  PALSETS={
    editorial:{ user_adversarial_testing:'#3F6FA3', answer_source_expected_answer:'#C25E73', grader_meta_evaluation:'#4E9B86', source_compliance_check:'#C98A3B', tests_coverage_gaps:'#876BA8', monitor_policy_enforcement:'#61748A', script_format_strictness:'#A8923B', noise:'#C3C8CF', 'user behavior testing':'#3F6FA3', 'answer_source expected answer':'#C25E73', 'grader boundary testing':'#4E9B86' },
    spectrum:{ user_adversarial_testing:'#2E6FD6', answer_source_expected_answer:'#E0518E', grader_meta_evaluation:'#1FA86B', source_compliance_check:'#E8862E', tests_coverage_gaps:'#9B57C9', monitor_policy_enforcement:'#3C4756', script_format_strictness:'#C49A1E', noise:'#B9C0C9', 'user behavior testing':'#2E6FD6', 'answer_source expected answer':'#E0518E', 'grader boundary testing':'#1FA86B' },
    muted:{ user_adversarial_testing:'#6E89A6', answer_source_expected_answer:'#B58794', grader_meta_evaluation:'#7FA89A', source_compliance_check:'#C0A57E', tests_coverage_gaps:'#9588A8', monitor_policy_enforcement:'#7C8794', script_format_strictness:'#AFA47E', noise:'#CBD0D6', 'user behavior testing':'#6E89A6', 'answer_source expected answer':'#B58794', 'grader boundary testing':'#7FA89A' }
  };
  CAT={ capability:'#2E6E8E', safety:'#C0443B', natural:'#3F8E54' };
  COLLBL=['Base','SFT','DPO','RLVR','Qwen'];
  BENCHDESC={
    aime:{tag:'Competition math', desc:'Problems from the 2024 American Invitational Mathematics Examination (AIME I & II), each with an integer answer, testing multi-step mathematical reasoning.', src:'https://huggingface.co/datasets/Maxwell-Jia/AIME_2024'},
    gpqa_diamond:{tag:'Graduate science QA', desc:'The hardest 198-question subset of GPQA: expert-written, “Google-proof” graduate-level biology, physics, and chemistry multiple-choice questions.', src:'https://arxiv.org/abs/2311.12022'},
    humaneval:{tag:'Code generation', desc:'164 hand-written Python problems with a function signature, docstring, and unit tests, measuring functional correctness of generated code (pass@k).', src:'https://github.com/openai/human-eval'},
    mmlu_pro:{tag:'Multi-domain reasoning', desc:'A harder MMLU variant: 12,000+ reasoning-focused questions across 14 domains, with ten answer choices instead of four to cut guessing.', src:'https://arxiv.org/abs/2406.01574'},
    advbench:{tag:'Harmful-request elicitation', desc:'An adversarial safety set of ~500 harmful-behavior instructions and ~500 harmful strings, testing whether attacks can elicit disallowed content from aligned models.', src:'https://arxiv.org/abs/2307.15043'},
    agentharm:{tag:'Agent harm & refusal', desc:'110 malicious agent tasks (440 with augmentations) across 11 harm categories, testing whether tool-using agents refuse harmful requests and stay capable when jailbroken.', src:'https://arxiv.org/abs/2410.09024'},
    fortress_adversarial:{tag:'Nat-sec safeguards', desc:'FORTRESS: 500 expert-crafted adversarial prompts, each paired with a benign version, across CBRNE, terrorism, and illicit-activity domains, scoring safeguard risk and over-refusal.', src:'https://arxiv.org/abs/2506.14922'},
    harmfulqa:{tag:'Harmful-question refusal', desc:'A safety dataset of 1,960 harmful questions across 10 topics (built via Chain-of-Utterances), with safe and jailbroken responses for red-teaming and alignment.', src:'https://arxiv.org/abs/2308.09662'},
    jailbreakbench:{tag:'Jailbreak robustness', desc:'An open jailbreak-robustness benchmark with 100 harmful and 100 benign behaviors, an evolving repository of jailbreak artifacts, and a standard evaluation pipeline.', src:'https://arxiv.org/abs/2404.01318'},
    wildchat:{tag:'In-the-wild chats', desc:'A corpus of ~1M real user-ChatGPT conversations (2.5M+ turns) collected with consent, spanning many languages and diverse, sometimes toxic, real-world use.', src:'https://arxiv.org/abs/2405.01470'}
  };

  activeEvals(T){
    const s=this.state.scope;
    if(s==='all') return null; // null = all
    if(s.startsWith('cat:')){ const c=s.slice(4); return T.evals.filter(e=>e.cat===c).map(e=>e.key); }
    if(s.startsWith('eval:')) return [s.slice(5)];
    return null;
  }
  effCounts(fam, evals){ // -> [5]
    if(!evals) return fam.counts;
    const out=[0,0,0,0,0];
    evals.forEach(e=>{ const a=fam.byEval[e]; if(a) for(let i=0;i<5;i++) out[i]+=a[i]; });
    return out;
  }

  renderVals(){
    const h=React.createElement;
    const T=window.TAXO;
    if(!T) return { ready:false, hasSel:false, legend:[], benchGroups:[], flowChart:null, detRows:[], detBench:[], detQuotes:[], stageChips:[], tipShow:false, flowMin:440, benchDescShow:false, benchDescTag:'', benchDescText:'', benchDescUrl:'', detClass:[], onFlowMove:this.onFlowMove, onFlowLeave:this.onFlowLeave };
    const st=this.state, P=this.props||{};
    const measure = st.measure || P.defaultMeasure || 'rate';
    const share = measure==='share';
    const COLLBL=this.COLLBL, CAT=this.CAT;
    const PAL=this.PALSETS[P.palette]||this.PALSETS.editorial;
    const ribOp=(P.ribbonOpacity!=null)?+P.ribbonOpacity:0.2;
    const hideNoise=!!P.hideNoise;
    const flowMin=P.flowHeight||440;
    const col=(k)=>PAL[k]||'#888';
    const fmtPct=(v)=> (v*100).toFixed(v>0&&v<0.095?1:0)+'%';
    const cols = st.showQwen ? [0,1,2,3,4] : [0,1,2,3];
    const lin=[0,1,2,3];

    const evals = this.activeEvals(T);
    // effective counts per family under scope
    const EFF={}; T.families.forEach(f=>EFF[f.key]=this.effCounts(f,evals));
    const lintot=(f)=> EFF[f.key][0]+EFF[f.key][1]+EFF[f.key][2]+EFF[f.key][3];
    // STABLE order from full counts (so bands keep position across scopes)
    const fullTot=(f)=> f.counts[0]+f.counts[1]+f.counts[2]+f.counts[3];
    let order=T.families.slice().sort((a,b)=> ((a.key==='noise')-(b.key==='noise')) || (fullTot(b)-fullTot(a)));
    if(hideNoise) order=order.filter(f=>f.key!=='noise');
    const TOT=[0,1,2,3,4].map(c=>order.reduce((s,f)=>s+EFF[f.key][c],0));
    // denominators (transcripts fed to extractor) for the active scope
    const SAMP=[0,1,2,3,4].map(c=> evals ? evals.reduce((s,e)=>s+((T.sampleTotals[e]||[])[c]||0),0) : (T.stageSamples?T.stageSamples[c]:0));
    const rateMode = measure==='rate';
    const txRateMode = measure==='txrate';
    const hasData=(c)=>{const act=evals||T.evals.map(e=>e.key);return act.some(e=>(T.sampleTotals[e]||[])[c]>0);};
    // equal-weighted rate per family per stage (each benchmark weighted evenly)
    const EWRATE={};
    T.families.forEach(f=>{EWRATE[f.key]=[0,1,2,3,4].map(c=>{
      const act=evals||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)return 0;
      return val.reduce((s,e)=>s+((f.byEval[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
    });});
    const EWRTOT=[0,1,2,3,4].map(c=>order.reduce((s,f)=>s+EWRATE[f.key][c],0));
    // transcript metagaming rate per stage (equal-weighted)
    const TXMGR=T.transcriptMgCounts?[0,1,2,3,4].map(c=>{
      const act=evals||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)return 0;
      return val.reduce((s,e)=>s+((T.transcriptMgCounts[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
    }):null;
    const fmtRate=(v)=> v<=0?'0': v<0.1? (+v.toFixed(3)).toString() : v.toFixed(2);

    // ---------- benchmark filter bar ----------
    const evTot=(k)=> T.evalTotals[k] ? (T.evalTotals[k][0]+T.evalTotals[k][1]+T.evalTotals[k][2]+T.evalTotals[k][3]) : 0;
    const totalAll = T.totals[0]+T.totals[1]+T.totals[2]+T.totals[3];
    const filtering = st.scope!=='all';
    const INK='#23231F';
    const chipBase='font-family:\'Spline Sans\',sans-serif;font-size:11px;padding:3px 11px;border-radius:999px;cursor:pointer;white-space:nowrap;';
    const benchGroups = T.catOrder.map(cat=>{
      const es=T.evals.filter(e=>e.cat===cat);
      const gtot=es.reduce((s,e)=>s+evTot(e.key),0);
      const catActive = st.scope==='cat:'+cat;
      const labelDim = filtering && !catActive;
      return {
        label:T.catLabel[cat]||cat, total:gtot,
        onClick:()=>this.setScope('cat:'+cat),
        labelStyle:'align-self:flex-start;font-family:\'Spline Sans Mono\',monospace;font-size:10px;font-weight:'+(catActive?'700':'600')+';letter-spacing:.12em;text-transform:uppercase;cursor:pointer;border:none;background:none;padding:0 0 3px;border-bottom:2px solid '+(catActive?INK:'transparent')+';color:'+(catActive?INK:(labelDim?'#C7C3B9':'#6B6A65')),
        chips: es.map(e=>{ const selected=st.scope==='eval:'+e.key;
          let s;
          if(selected) s='background:'+INK+';color:#fff;border:1px solid '+INK+';font-weight:600';
          else if(catActive) s='background:#ECEAE4;color:#33332E;border:1px solid #C7C3B9';
          else s='background:#FFFFFF;color:#54534E;border:1px solid #E0DDD5'+(filtering?';opacity:.38':'');
          return { label:e.label, count:evTot(e.key), onClick:()=>this.setScope('eval:'+e.key), style:chipBase+s }; })
      };
    });
    const allBenchStyle = filtering
      ? 'font-family:\'Spline Sans Mono\',monospace;font-size:10px;font-weight:700;letter-spacing:.04em;padding:4px 13px;border-radius:999px;cursor:pointer;background:#FFFFFF;color:'+INK+';border:1.5px solid '+INK+';white-space:nowrap'
      : 'font-family:\'Spline Sans Mono\',monospace;font-size:10px;font-weight:600;letter-spacing:.04em;padding:4px 13px;border-radius:999px;cursor:default;background:'+INK+';color:#fff;border:1.5px solid '+INK+';white-space:nowrap';
    let scopeReadout='all 10 benchmarks', scopeShort='all benchmarks';
    if(st.scope.startsWith('cat:')){ const c=st.scope.slice(4); scopeReadout=(T.catLabel[c]||c)+' benchmarks'; scopeShort=(T.catLabel[c]||c); }
    else if(st.scope.startsWith('eval:')){ const e=T.evals.find(x=>x.key===st.scope.slice(5)); scopeReadout=e?e.label:''; scopeShort=e?e.label:''; }
    const allBenchLabel = filtering ? '✕  Clear filter' : ('All benchmarks · '+totalAll);
    const benchNote = filtering ? ('— showing: '+scopeShort) : '— filter the view by class or a single benchmark';

    // ---------- legend ----------
    const legend = order.map(f=>{
      const peak=Math.max(...lin.map(c=> EWRATE[f.key][c]), 1e-9);
      const spark=lin.map(c=>({ color:col(f.key), h: Math.max(2,(EWRATE[f.key][c])/peak*18).toFixed(1)+'px' }));
      const on=st.selFam===f.key;
      return { key:f.key, label:f.label, color:col(f.key), total:lintot(f), spark,
        onClick:()=>this.pickFam(f.key),
        rowStyle:'display:flex;flex-direction:column;gap:6px;padding:9px 9px;border-radius:8px;cursor:pointer;'+(on?'background:#EAF1EF;box-shadow:inset 2px 0 0 '+col(f.key)+';':'')+(st.selFam&&!on?'opacity:.4;':'') };
    });

    // ---------- flow chart ----------
    const W=1000,H=604,top=24,bot=92,ph=H-top-bot,baseY=top+ph,barW=58;
    const cx=[140,360,580,800,950];
    const maxTot=Math.max(...cols.map(c=>TOT[c]),1);
    // fixed global scale: largest possible stacked bar across EVERY scope, so the y-axis stays consistent when filtering
    const _SCOPES=[null, ...T.catOrder.map(c=>T.evals.filter(e=>e.cat===c).map(e=>e.key)), ...T.evals.map(e=>[e.key])];
    let GRATE=1e-9, GTOT=1;
    _SCOPES.forEach(ev=>{ for(let c=0;c<5;c++){
      const sp = ev ? ev.reduce((s,e)=>s+((T.sampleTotals[e]||[])[c]||0),0) : (T.stageSamples?T.stageSamples[c]:0);
      const tt = order.reduce((s,f)=> s + (ev ? ev.reduce((a,e)=>a+((f.byEval[e]||[])[c]||0),0) : f.counts[c]), 0);
      if(sp) GRATE=Math.max(GRATE, tt/sp); GTOT=Math.max(GTOT, tt);
    }});
    // stable axis max for equal-weighted rate across all scopes
    let GRATE_EW=1e-9;
    _SCOPES.forEach(ev=>{for(let c=0;c<5;c++){
      const act=ev||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)continue;
      const rt=val.reduce((s,e)=>{const cnt=order.reduce((a,f)=>a+((f.byEval[e]||[])[c]||0),0);return s+cnt/T.sampleTotals[e][c];},0)/val.length;
      GRATE_EW=Math.max(GRATE_EW,rt);
    }});
    // stable axis max for transcript MG rate across all scopes
    let GRATE_TX=1e-9;
    if(T.transcriptMgCounts){_SCOPES.forEach(ev=>{for(let c=0;c<5;c++){
      const act=ev||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)continue;
      const rt=val.reduce((s,e)=>s+((T.transcriptMgCounts[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
      GRATE_TX=Math.max(GRATE_TX,rt);
    }});}
    const niceCeil=(v)=>{ if(v<=0)return 1; const mg=Math.pow(10,Math.floor(Math.log10(v))); const n=v/mg; return mg*[1,1.2,1.5,2,2.5,3,4,5,6,8,10].find(x=>x>=n-1e-9); };
    const AXR_EW = niceCeil(GRATE_EW), AXR_TX = niceCeil(GRATE_TX), AXR = niceCeil(GRATE), AXT = niceCeil(GTOT);
    const segH=(fkey,cnt,c)=> share?(cnt/(TOT[c]||1))*ph: rateMode?(EWRATE[fkey][c]/AXR_EW)*ph: txRateMode&&TXMGR?((TOT[c]>0?cnt/TOT[c]:0)*TXMGR[c]/AXR_TX)*ph: (cnt/AXT)*ph;
    const seg={};
    cols.forEach(c=>{ let y=baseY; seg[c]=order.map(f=>{ const cnt=EFF[f.key][c], hh=segH(f.key,cnt,c); const o={key:f.key,count:cnt,y0:y-hh,y1:y,h:hh}; y-=hh; return o; }); });
    const segByKey=(c,k)=> seg[c][order.findIndex(f=>f.key===k)];
    const ribbon=(x1,a0,a1,x2,b0,b1)=>{ const mx=(x1+x2)/2; return `M${x1},${a0} C${mx},${a0} ${mx},${b0} ${x2},${b0} L${x2},${b1} C${mx},${b1} ${mx},${a1} ${x1},${a1} Z`; };
    const fk=[];
    [0,1,2].forEach(c=>{ order.forEach(f=>{ const a=segByKey(c,f.key), b=segByKey(c+1,f.key); if(a.h<0.4&&b.h<0.4)return; const dim=st.selFam&&st.selFam!==f.key; fk.push(h('path',{key:'r'+c+f.key,d:ribbon(cx[c]+barW/2,a.y0,a.y1,cx[c+1]-barW/2,b.y0,b.y1),fill:col(f.key),opacity:dim?(ribOp*0.2):ribOp,stroke:'none',style:{cursor:'pointer'},onMouseEnter:()=>this.setState({hover:{f:f.key,ribbon:true}})})); }); });
    cols.forEach(c=>{ seg[c].forEach(s=>{ if(s.h<0.4)return; const dim=st.selFam&&st.selFam!==s.key; const hov=st.hover&&st.hover.f===s.key&&st.hover.c===c; fk.push(h('rect',{key:'b'+c+s.key,x:cx[c]-barW/2,y:s.y0,width:barW,height:Math.max(1,s.h),fill:col(s.key),opacity:dim?0.16:(hov?1:0.9),rx:1.5,style:{cursor:'pointer'},onClick:()=>this.pickFam(s.key),onMouseEnter:()=>this.setState({hover:{f:s.key,c}}),onMouseLeave:()=>this.setState({hover:null})})); }); });
    if(st.showQwen){ fk.push(h('line',{key:'qd',x1:875,x2:875,y1:top-2,y2:baseY+36,stroke:'#D9D7D0',strokeWidth:1,strokeDasharray:'2 5'})); fk.push(h('text',{key:'qt',x:950,y:top+12,textAnchor:'middle',style:{font:'11px "Spline Sans Mono",monospace',fill:'#B7B5AE',letterSpacing:'.12em'}},'OFF-LINEAGE')); }
    cols.forEach(c=>{ fk.push(h('text',{key:'xl'+c,x:cx[c],y:baseY+27,textAnchor:'middle',style:{font:(c===4?'600 13.5px':'600 17px')+' "Spline Sans",sans-serif',fill: c===4?'#8A8780':'#1D1D1B'}}, c===4?(T.qwen&&T.qwen.label||'Qwen3-32B'):COLLBL[c]));
      const sub = rateMode?(hasData(c)?fmtRate(EWRTOT[c])+' /tx':'no data'): txRateMode?(TXMGR&&hasData(c)?fmtPct(TXMGR[c])+' of tx':'no data'): ('n='+TOT[c]);
      fk.push(h('text',{key:'xn'+c,x:cx[c],y:baseY+43,textAnchor:'middle',style:{font:(rateMode?'600 12.5px':'12px')+' "Spline Sans Mono",monospace',fill: rateMode?'#46453F':'#A6A49D'}}, sub));
      if(rateMode) fk.push(h('text',{key:'xs'+c,x:cx[c],y:baseY+55,textAnchor:'middle',style:{font:'10px "Spline Sans Mono",monospace',fill:'#B7B5AE'}}, SAMP[c]?(TOT[c]+' / '+SAMP[c]):'')); });
    // ---------- x axis caption: Olmo 3 post-training lineage ----------
    { const xb0=cx[0]-barW/2, xb3=cx[3]+barW/2, yb=baseY+68, xmid=(cx[0]+cx[3])/2;
      fk.push(h('path',{key:'xbr',d:`M${xb0},${yb-5} L${xb0},${yb} L${xb3},${yb} L${xb3},${yb-5}`,fill:'none',stroke:'#D4D1CA',strokeWidth:1}));
      fk.push(h('text',{key:'xbt',x:xmid,y:yb+15,textAnchor:'middle',style:{font:'600 10.5px "Spline Sans Mono",monospace',fill:'#7A7872',letterSpacing:'.12em'}},'OLMO 3 POST-TRAINING CHECKPOINTS')); }
    // ---------- y axis ----------
    const axisMax = share?1: rateMode?AXR_EW: txRateMode?AXR_TX: AXT;
    const yOf = (v)=> baseY - (axisMax ? (v/axisMax)*ph : 0);
    const axisX = 92, lastCx = cx[cols[cols.length-1]], gridX2 = lastCx + barW/2;
    const fmtY = (v)=> (share||txRateMode)?Math.round(v*100)+'%': rateMode?(+v.toFixed(2)).toString(): String(Math.round(v));
    const yTitle = (share?'% of stage': rateMode?'quotes / transcript': txRateMode?'% transcripts w/ metagaming':'quote count').toUpperCase();
    const yAxis=[];
    [0,0.25,0.5,0.75,1].forEach((t,i)=>{ const v=t*axisMax, y=yOf(v);
      yAxis.push(h('line',{key:'yg'+i,x1:axisX,x2:gridX2,y1:y,y2:y,stroke:'#ECEAE4',strokeWidth:1,strokeDasharray:i===0?'none':'2 5'}));
      yAxis.push(h('text',{key:'ylb'+i,x:axisX-8,y:y+3.5,textAnchor:'end',style:{font:'10px "Spline Sans Mono",monospace',fill:'#A6A49D'}}, fmtY(v))); });
    yAxis.push(h('line',{key:'yaxis',x1:axisX,x2:axisX,y1:top,y2:baseY,stroke:'#D9D7D0',strokeWidth:1}));
    yAxis.push(h('text',{key:'ytitle',transform:'translate(20,'+(top+ph/2)+') rotate(-90)',textAnchor:'middle',style:{font:'9.5px "Spline Sans Mono",monospace',fill:'#B7B5AE',letterSpacing:'.1em'}}, yTitle));
    fk.unshift(...yAxis);
    const flowChart=h('svg',{viewBox:`0 0 ${W} ${H}`,preserveAspectRatio:'xMidYMid meet',onMouseMove:this.onFlowMove,style:{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}},fk);

    const flowSub = (share?'share of each stage’s verbalizations':rateMode?'metagaming quotes per transcript — height = rate':'absolute quote counts (height scaled to peak stage)') + ' · '+scopeShort;

    // ---------- tooltip ----------
    let hoverInfo='';
    if(st.selFam){ const f=T.families.find(x=>x.key===st.selFam); hoverInfo='selected · '+f.label; }
    let tipShow=false,tipX=0,tipY=0,tipTransform='translate(14px,14px)',tipColor='#888',tipLabel='',tipLine1='',tipLine2='';
    if(st.hover){
      const f=T.families.find(x=>x.key===st.hover.f);
      tipShow=true; tipX=st.hx; tipY=st.hy; tipColor=col(f.key); tipLabel=f.label;
      const flipX=st.hx>(st.hw-200), flipY=st.hy>(st.hh-66);
      tipTransform='translate('+(flipX?'calc(-100% - 14px)':'14px')+', '+(flipY?'calc(-100% - 14px)':'14px')+')';
      if(st.hover.ribbon){ tipLine1='carries across the lineage'; tipLine2=scopeShort; }
      else { const c=st.hover.c; tipLine1=COLLBL[c]+(c===4?' · reference':' · stage');
        tipLine2 = rateMode
          ? (hasData(c)? (fmtRate(EWRATE[f.key][c])+' /tx  ·  n='+EFF[f.key][c]) : 'no responses')
          : txRateMode
          ? (TXMGR&&hasData(c)? fmtPct(TXMGR[c])+' of transcripts  ·  n='+SAMP[c] : 'no data')
          : ('n='+EFF[f.key][c]+'   ·   '+fmtPct(EFF[f.key][c]/(TOT[c]||1))+' of stage'); }
    }

    // ---------- detail panel ----------
    const selFamObj = st.selFam ? T.families.find(f=>f.key===st.selFam) : null;
    let detRows=[], detBench=[], detQuotes=[], stageChips=[], detClass=[], selName='', selKicker='', selColor='#888', quoteCount='', moreQuotes='';
    if(selFamObj){
      selColor=col(selFamObj.key);
      selName=selFamObj.label;
      const ec=EFF[selFamObj.key], sTot=ec[0]+ec[1]+ec[2]+ec[3];
      selKicker=sTot+' quotes across lineage · '+scopeShort;
      const famMaxRate=Math.max(...cols.map(c=>EWRATE[selFamObj.key][c]),1e-9);
      detRows=cols.map(c=>{ const cnt=ec[c], shr=cnt/(TOT[c]||1), rr=EWRATE[selFamObj.key][c];
        const big = share?fmtPct(shr): rateMode?(hasData(c)?fmtRate(rr)+' /tx':'—'): txRateMode?'—' : String(cnt);
        const small = rateMode?('n='+cnt) : share?('n='+cnt):fmtPct(shr);
        const bw = share?Math.min(1,shr) : rateMode?(rr/famMaxRate) : Math.min(1,shr);
        return { label:COLLBL[c], big, small, barW:(bw*100).toFixed(1)+'%', lblColor:c===4?'#A6A49D':'#46453F', barDash:c===4?'background-image:repeating-linear-gradient(90deg,'+selColor+' 0 5px,transparent 5px 8px);':'' }; });
      // eval-class makeup of this family per checkpoint (capability / safety / natural)
      const _evCat={}; T.evals.forEach(e=>_evCat[e.key]=e.cat);
      const _esD = evals || T.evals.map(e=>e.key);
      detClass=cols.map(c=>{ const by={capability:0,safety:0,natural:0};
        _esD.forEach(k=>{ const a=selFamObj.byEval[k]; if(a) by[_evCat[k]] += (a[c]||0); });
        const tt=by.capability+by.safety+by.natural;
        return { label:COLLBL[c], total:tt, lblColor:c===4?'#A6A49D':'#46453F',
          segs:T.catOrder.filter(cl=>by[cl]>0).map(cl=>({ w:(by[cl]/tt*100).toFixed(2)+'%', color:this.CAT[cl], lbl:(T.catLabel[cl]||cl)+': '+by[cl] })) }; });
      // benchmark mix for this family (lineage counts), all benchmarks regardless of scope
      const mix=T.evals.map(e=>{ const a=selFamObj.byEval[e.key]; const n=a?(a[0]+a[1]+a[2]+a[3]):0; return {e, n}; }).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
      const mixMax=Math.max(...mix.map(x=>x.n),1);
      detBench=mix.map(({e,n})=>{ const active=st.scope==='eval:'+e.key; return { label:e.label, count:n, color:selColor, barW:Math.max(4,(n/mixMax)*90).toFixed(0)+'px',
        onClick:()=>this.setScope('eval:'+e.key),
        rowStyle:'display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;cursor:pointer;'+(active?'background:#EFEDE7;':'') }; });
      // quotes filtered by scope (eval) + stage
      const inScope=(q)=> !evals || q.ev.some(e=>evals.includes(e));
      let src=(selFamObj.quotes||[]).filter(inScope);
      const filt = st.qStage==='all' ? src : src.filter(q=>q.cols.includes(st.qStage));
      const badgeStyle=(c)=> c===4
        ? 'font-family:\'Spline Sans Mono\',monospace;font-size:8.5px;font-weight:600;letter-spacing:.04em;color:#8A8780;border:1px solid #D4D1CA;padding:1px 5px;border-radius:3px'
        : 'font-family:\'Spline Sans Mono\',monospace;font-size:8.5px;font-weight:600;letter-spacing:.04em;color:#3A4A45;background:#E4ECE9;padding:1px 5px;border-radius:3px';
      const elabel=(k)=>{ const e=T.evals.find(x=>x.key===k); return e?e.label:k; };
      detQuotes=filt.slice(0,16).map(q=>{ const showEv = evals ? q.ev.filter(e=>evals.includes(e)) : q.ev; const ev0=showEv[0]||q.ev[0];
        return { t:q.t, evLabel: elabel(ev0)+(showEv.length>1?' +'+(showEv.length-1):''), catColor:T.catColor[q.c]||'#999',
          badges:q.cols.map(c=>({ label:COLLBL[c], style:badgeStyle(c) })) }; });
      moreQuotes = filt.length>16 ? ('+ '+(filt.length-16)+' more (of '+filt.length+' sampled)') : '';
      quoteCount = filt.length+' shown'+(st.qStage==='all'?'':' · '+COLLBL[st.qStage]);
      stageChips=['all',...cols].map(c=>{ const active=st.qStage===c; const lbl=c==='all'?'All':COLLBL[c];
        return { label:lbl, onClick:()=>this.setQStage(c),
          style:'font-family:\'Spline Sans Mono\',monospace;font-size:10px;padding:3px 9px;border-radius:5px;cursor:pointer;border:1px solid '+(active?'#2C6E63':'#DCD9D2')+';background:'+(active?'#2C6E63':'#FFFFFF')+';color:'+(active?'#FFFFFF':'#5C5B57') }; });
    }

    const onStyle='flex:1;padding:7px 3px;font-family:\'Spline Sans Mono\',monospace;font-size:10.5px;font-weight:600;cursor:pointer;border:none;background:#2C6E63;color:#fff';
    const offStyle='flex:1;padding:7px 3px;font-family:\'Spline Sans Mono\',monospace;font-size:10.5px;font-weight:500;cursor:pointer;border:none;background:#FFFFFF;color:#7A7872';
    const measureHint = share?'Each stage normalized to 100%. Composition only — ignores how much metagaming occurs.'
      : rateMode?'Quotes per transcript (equal-weighted across benchmarks, so each benchmark contributes equally regardless of sample count).'
      : txRateMode?'Fraction of transcripts containing at least one metagaming verbalization, equal-weighted across benchmarks.'
      : 'Raw quote counts. Confounded — sampling differs by benchmark and stage.';

    // ---------- benchmark description (shown when a single benchmark is selected) ----------
    let benchDescShow=false, benchDescTag='', benchDescText='', benchDescUrl='';
    if(st.scope.startsWith('eval:')){ const d=this.BENCHDESC[st.scope.slice(5)]; if(d){ benchDescShow=true; benchDescTag=d.tag; benchDescText=d.desc; benchDescUrl=d.src; } }

    return {
      ready:true, legend, flowChart, flowSub, hoverInfo, flowMin,
      benchGroups, totalAll, allBench:this.allBench, allBenchStyle, allBenchLabel, benchNote, scopeReadout, scopeShort,
      measureHint,
      benchDescShow, benchDescTag, benchDescText, benchDescUrl,
      shareBtnStyle: share?onStyle:offStyle, rateBtnStyle: rateMode?onStyle:offStyle, txRateBtnStyle: txRateMode?onStyle:offStyle, countBtnStyle: (!share&&!rateMode&&!txRateMode)?onStyle:offStyle,
      setShare:this.setShare, setRate:this.setRate, setTxRate:this.setTxRate, setCount:this.setCount, toggleQwen:this.toggleQwen, showQwen:st.showQwen,
      clearSel:this.clearSel, clearLabel:(st.selFam)?'clear':'',
      clearBtnStyle:'font-family:\'Spline Sans Mono\',monospace;font-size:9.5px;color:#2C6E63;background:none;border:none;cursor:pointer;padding:0;'+(st.selFam?'':'visibility:hidden'),
      hasSel:!!selFamObj,
      selName, selKicker, selColor, detRows, detClass, detBench, detQuotes, quoteCount, moreQuotes, stageChips,
      tipShow, tipX, tipY, tipTransform, tipColor, tipLabel, tipLine1, tipLine2,
      onFlowMove:this.onFlowMove, onFlowLeave:this.onFlowLeave
    };
  }
}
