
class Component extends DCLogic {
  state = { measure:null, modelGroup:'all', hiddenFams:{}, selFam:null, qStage:'all', scope:'all', accThr:70, openTx:null, openTxQuote:'', openTxOrig:'', openTxFam:'', hover:null, hx:0, hy:0, hw:0, hh:0 };

  componentDidMount(){ this._tick(0); }
  _tick(n){ if(window.TAXO){ this.forceUpdate(); } else if(n<80){ setTimeout(()=>this._tick(n+1),40); } }

  setShare=()=>this.setState({measure:'share'});
  setRate=()=>this.setState({measure:'rate'});
  setCount=()=>this.setState({measure:'count'});
  setTxRate=()=>this.setState({measure:'txrate'});
  setModelGroup=(g)=>this.setState({modelGroup:g});
  toggleFam=(k)=>this.setState(s=>{ const h=Object.assign({},s.hiddenFams); if(h[k]) delete h[k]; else h[k]=true; return {hiddenFams:h}; });
  showAllFams=()=>this.setState({hiddenFams:{}});
  pickFam=(k)=>this.setState(s=>({selFam:s.selFam===k?null:k, qStage:'all'}));
  clearSel=()=>this.setState({selFam:null});
  setQStage=(c)=>this.setState(s=>({qStage:s.qStage===c?'all':c}));
  setScope=(v)=>this.setState(s=>({scope:s.scope===v?'all':v}));
  allBench=()=>this.setState({scope:'all'});
  setAccThr=(t)=>this.setState({accThr:t});
  showTx=(tk,qt,oq,fam)=>this.setState({openTx:tk, openTxQuote:qt||'', openTxOrig:oq||qt||'', openTxFam:fam||''});
  closeTx=()=>this.setState({openTx:null, openTxQuote:'', openTxOrig:'', openTxFam:''});
  onFlowMove=(e)=>{ const r=e.currentTarget.getBoundingClientRect(); this.setState({hx:e.clientX-r.left, hy:e.clientY-r.top, hw:r.width, hh:r.height}); };
  onFlowLeave=()=>this.setState({hover:null});

  PALSETS={
    editorial:{ user_adversarial_testing:'#3F6FA3', answer_source_expected_answer:'#C25E73', grader_meta_evaluation:'#4E9B86', source_compliance_check:'#C98A3B', tests_coverage_gaps:'#876BA8', monitor_policy_enforcement:'#61748A', script_format_strictness:'#A8923B', noise:'#C3C8CF', 'user behavior testing':'#3F6FA3', 'answer_source expected answer':'#C25E73', 'grader boundary testing':'#4E9B86', user_behavioral_testing:'#3F6FA3', grader_system_limits:'#4E9B86', source_testing_compliance:'#C98A3B', tests_coverage_limitations:'#876BA8' },
    spectrum:{ user_adversarial_testing:'#2E6FD6', answer_source_expected_answer:'#E0518E', grader_meta_evaluation:'#1FA86B', source_compliance_check:'#E8862E', tests_coverage_gaps:'#9B57C9', monitor_policy_enforcement:'#3C4756', script_format_strictness:'#C49A1E', noise:'#B9C0C9', 'user behavior testing':'#2E6FD6', 'answer_source expected answer':'#E0518E', 'grader boundary testing':'#1FA86B', user_behavioral_testing:'#2E6FD6', grader_system_limits:'#1FA86B', source_testing_compliance:'#E8862E', tests_coverage_limitations:'#9B57C9' },
    muted:{ user_adversarial_testing:'#6E89A6', answer_source_expected_answer:'#B58794', grader_meta_evaluation:'#7FA89A', source_compliance_check:'#C0A57E', tests_coverage_gaps:'#9588A8', monitor_policy_enforcement:'#7C8794', script_format_strictness:'#AFA47E', noise:'#CBD0D6', 'user behavior testing':'#6E89A6', 'answer_source expected answer':'#B58794', 'grader boundary testing':'#7FA89A', user_behavioral_testing:'#6E89A6', grader_system_limits:'#7FA89A', source_testing_compliance:'#C0A57E', tests_coverage_limitations:'#9588A8' }
  };
  CAT={ capability:'#2E6E8E', safety:'#C0443B', natural:'#3F8E54' };
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
  effCounts(fam, evals){ // -> [n_stages]
    const NS=(fam.counts||[]).length;
    if(!evals) return fam.counts;
    const out=new Array(NS).fill(0);
    evals.forEach(e=>{ const a=fam.byEval[e]; if(a) for(let i=0;i<NS;i++) out[i]+=(a[i]||0); });
    return out;
  }

  renderVals(){
    const h=React.createElement;
    const T=window.TAXO;
    if(!T) return { ready:false, hasSel:false, legend:[], benchGroups:[], flowChart:null, flowTitle:'Composition by stage', statQuotes:'', statResponses:'', statBenchmarks:'', detRows:[], detBench:[], detQuotes:[], stageChips:[], tipShow:false, flowMin:440, benchDescShow:false, benchDescTag:'', benchDescText:'', benchDescUrl:'', detClass:[], veaSplit:[], accBands:[], accThrChips:[], accReady:false, eaSub:'', veaColLbl:'', mgColLbl:'', veaSwatch:'#7A3E9A', mgSwatch:'#2C6E63', modelGroupChips:[], showAllFams:this.showAllFams, anyHidden:false, txOpen:false, txModel:'', txFamily:'', txEval:'', txSid:'', txQuote:'', txParts:[], closeTx:this.closeTx, onFlowMove:this.onFlowMove, onFlowLeave:this.onFlowLeave };
    const st=this.state, P=this.props||{};
    const measure = st.measure || P.defaultMeasure || 'rate';
    const share = measure==='share';
    const CAT=this.CAT;
    // ----- data-driven stages (any number of model columns; lineage vs reference) -----
    const STAGES=T.stages||[];
    const NS=STAGES.length;
    const COLLBL=STAGES.map(s=>s.label);
    const ALLC=STAGES.map((s,i)=>i);
    const LIN=ALLC.filter(i=>!STAGES[i].is_reference);
    const REF=ALLC.filter(i=>STAGES[i].is_reference);
    const PAL=this.PALSETS[P.palette]||this.PALSETS.editorial;
    const ribOp=(P.ribbonOpacity!=null)?+P.ribbonOpacity:0.2;
    const hideNoise=!!P.hideNoise;
    const flowMin=P.flowHeight||440;
    // color lookup: editorial palette first, then the family's own exported color, then grey.
    // The fallback keeps every family colored even if the taxonomy is re-clustered with new keys.
    const famColor={}; (T.families||[]).forEach(f=>{ if(f.color) famColor[f.key]=f.color; });
    const col=(k)=>PAL[k]||famColor[k]||'#888';
    const fmtPct=(v)=> (v*100).toFixed(v>0&&v<0.095?1:0)+'%';
    // ----- model-group selector picks which columns are visible -----
    const mg=st.modelGroup||'all';
    let cols = mg==='lineage'?LIN.slice() : mg==='reference'?REF.slice() : ALLC.slice();
    if(!cols.length) cols=ALLC.slice();
    const lin=LIN.length?LIN:ALLC;
    // header provenance stats (dynamic, so they track the active run's data)
    const _nf=(x)=>x.toLocaleString('en-US');
    const statQuotes=_nf((T.totals||[]).reduce((a,b)=>a+b,0));
    const statResponses=_nf((T.stageSamples||[]).reduce((a,b)=>a+b,0));
    const statBenchmarks=(T.evals||[]).length;

    const evals = this.activeEvals(T);
    // effective counts per family under scope
    const EFF={}; T.families.forEach(f=>EFF[f.key]=this.effCounts(f,evals));
    const lintot=(f)=> lin.reduce((s,c)=>s+(EFF[f.key][c]||0),0);
    // STABLE order from full counts (so bands keep position across scopes)
    const fullTot=(f)=> (lin.length?lin:ALLC).reduce((s,c)=>s+(f.counts[c]||0),0);
    let legendOrder=T.families.slice().sort((a,b)=> ((a.key==='noise')-(b.key==='noise')) || (fullTot(b)-fullTot(a)));
    if(hideNoise) legendOrder=legendOrder.filter(f=>f.key!=='noise');
    // visible families (per-family checkboxes) drive the flow chart + every aggregate
    let order=legendOrder.filter(f=>!st.hiddenFams[f.key]);
    const TOT=ALLC.map(c=>order.reduce((s,f)=>s+EFF[f.key][c],0));
    // denominators (transcripts fed to extractor) for the active scope
    const SAMP=ALLC.map(c=> evals ? evals.reduce((s,e)=>s+((T.sampleTotals[e]||[])[c]||0),0) : (T.stageSamples?T.stageSamples[c]:0));
    const rateMode = measure==='rate';
    const txRateMode = measure==='txrate';
    const hasData=(c)=>{const act=evals||T.evals.map(e=>e.key);return act.some(e=>(T.sampleTotals[e]||[])[c]>0);};
    // equal-weighted rate per family per stage (each benchmark weighted evenly)
    const EWRATE={};
    T.families.forEach(f=>{EWRATE[f.key]=ALLC.map(c=>{
      const act=evals||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)return 0;
      return val.reduce((s,e)=>s+((f.byEval[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
    });});
    const EWRTOT=ALLC.map(c=>order.reduce((s,f)=>s+EWRATE[f.key][c],0));
    // equal-weighted per-family TRANSCRIPT rate: fraction of transcripts with >=1 quote
    // in this family, averaged evenly across active benchmarks. Independent per family
    // (a transcript can land in several families) so these do NOT sum across families.
    const EWTXRATE={};
    T.families.forEach(f=>{EWTXRATE[f.key]=ALLC.map(c=>{
      const act=evals||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)return 0;
      return val.reduce((s,e)=>s+(((f.txByEval&&f.txByEval[e])||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
    });});
    // transcript metagaming rate per stage (equal-weighted)
    const TXMGR=T.transcriptMgCounts?ALLC.map(c=>{
      const act=evals||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)return 0;
      return val.reduce((s,e)=>s+((T.transcriptMgCounts[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
    }):null;
    const fmtRate=(v)=> v<=0?'0': v<0.1? (+v.toFixed(3)).toString() : v.toFixed(2);

    // ---------- benchmark filter bar ----------
    const evTot=(k)=> T.evalTotals[k] ? lin.reduce((s,c)=>s+(T.evalTotals[k][c]||0),0) : 0;
    const totalAll = lin.reduce((s,c)=>s+(T.totals[c]||0),0);
    const filtering = st.scope!=='all';
    const INK='#23231F';
    const chipBase='font-family:\'Spline Sans\',sans-serif;font-size:11px;padding:3px 11px;border-radius:999px;cursor:pointer;white-space:nowrap;';
    // global max mean transcript length across every benchmark x lineage checkpoint,
    // so the mini length bars under each benchmark are on ONE honest scale (not auto-scaled per eval).
    const TL=T.transcriptLengths||{};
    let GLEN=1;
    T.evals.forEach(e=>{ const a=TL[e.key]; if(a)lin.forEach(c=>{ const m=a[c]&&a[c].mean; if(m)GLEN=Math.max(GLEN,m); }); });
    const fmtLen=(m)=> m>=1000?(m/1000).toFixed(m<10000?1:0)+'k':String(Math.round(m));
    // mini length graph as HTML div-bars (same proven pattern as the legend sparkline).
    // Heights share ONE global scale (GLEN) so benchmarks are honestly comparable.
    const lenBarsFor=(ekey,cat)=>{ const a=TL[ekey]||[]; const c0=CAT[cat]||'#999';
      return lin.map(c=>{ const m=(a[c]&&a[c].mean)||0; const hh=m>0?Math.max(1.5,(m/GLEN)*16):0;
        return { color:c0, h:hh.toFixed(1)+'px', title:COLLBL[c]+': '+(m?fmtLen(m):'—')+' chars' }; }); };
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
          const peakLen=Math.max(...lin.map(c=>((TL[e.key]||[])[c]&&TL[e.key][c].mean)||0));
          return { label:e.label, count:evTot(e.key), onClick:()=>this.setScope('eval:'+e.key), style:chipBase+s,
                   lenBars:lenBarsFor(e.key,cat), lenPeak:peakLen?fmtLen(peakLen):'' }; })
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

    // ---------- legend (all families, with per-family checkboxes) ----------
    const legendRate = txRateMode ? EWTXRATE : EWRATE;
    const sparkCols = lin.length?lin:ALLC;
    const legend = legendOrder.map(f=>{
      const peak=Math.max(...sparkCols.map(c=> legendRate[f.key][c]), 1e-9);
      const spark=sparkCols.map(c=>({ color:col(f.key), h: Math.max(2,(legendRate[f.key][c])/peak*18).toFixed(1)+'px' }));
      const on=st.selFam===f.key;
      const hidden=!!st.hiddenFams[f.key];
      return { key:f.key, label:f.label, color:col(f.key), total:lintot(f), spark, checked:!hidden,
        onClick:()=>this.pickFam(f.key), onToggle:()=>this.toggleFam(f.key),
        rowStyle:'display:flex;flex-direction:column;gap:6px;padding:9px 9px;border-radius:8px;cursor:pointer;'+(on?'background:#EAF1EF;box-shadow:inset 2px 0 0 '+col(f.key)+';':'')+(hidden?'opacity:.32;':(st.selFam&&!on?'opacity:.4;':'')) };
    });
    const anyHidden = Object.keys(st.hiddenFams||{}).length>0;

    // ---------- flow chart ----------
    // viewBox aspect ~2.18:1 (wide) so the chart fills the panel width instead of
    // letterboxing with big side margins under preserveAspectRatio=meet.
    const W=1320,H=604,top=24,bot=92,ph=H-top-bot,baseY=top+ph;
    // dynamic x layout for the visible columns: evenly spaced across [xL,xR] with a
    // small extra gap at the lineage->reference boundary (replaces the fixed cx array).
    const xL=150, xR=1235;
    const _slot=[]; let _acc=0;
    cols.forEach((c,i)=>{ if(i>0){ _acc+=1; if(STAGES[c].is_reference && !STAGES[cols[i-1]].is_reference) _acc+=0.55; } _slot.push(_acc); });
    const _span=_slot[_slot.length-1]||1;
    const cxOf={}; cols.forEach((c,i)=>{ cxOf[c]= cols.length===1?(xL+xR)/2 : xL+(_slot[i]/_span)*(xR-xL); });
    const barW = cols.length>6?46:58;
    const maxTot=Math.max(...cols.map(c=>TOT[c]),1);
    // fixed global scale: largest possible stacked bar across EVERY scope, so the y-axis stays consistent when filtering
    const _SCOPES=[null, ...T.catOrder.map(c=>T.evals.filter(e=>e.cat===c).map(e=>e.key)), ...T.evals.map(e=>[e.key])];
    let GRATE=1e-9, GTOT=1;
    _SCOPES.forEach(ev=>{ for(let c=0;c<NS;c++){
      const sp = ev ? ev.reduce((s,e)=>s+((T.sampleTotals[e]||[])[c]||0),0) : (T.stageSamples?T.stageSamples[c]:0);
      const tt = order.reduce((s,f)=> s + (ev ? ev.reduce((a,e)=>a+((f.byEval[e]||[])[c]||0),0) : f.counts[c]), 0);
      if(sp) GRATE=Math.max(GRATE, tt/sp); GTOT=Math.max(GTOT, tt);
    }});
    // stable axis max for equal-weighted rate across all scopes
    let GRATE_EW=1e-9;
    _SCOPES.forEach(ev=>{for(let c=0;c<NS;c++){
      const act=ev||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)continue;
      const rt=val.reduce((s,e)=>{const cnt=order.reduce((a,f)=>a+((f.byEval[e]||[])[c]||0),0);return s+cnt/T.sampleTotals[e][c];},0)/val.length;
      GRATE_EW=Math.max(GRATE_EW,rt);
    }});
    // stable axis max for transcript MG rate across all scopes
    let GRATE_TX=1e-9;
    if(T.transcriptMgCounts){_SCOPES.forEach(ev=>{for(let c=0;c<NS;c++){
      const act=ev||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)continue;
      const rt=val.reduce((s,e)=>s+((T.transcriptMgCounts[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
      GRATE_TX=Math.max(GRATE_TX,rt);
    }});}
    // stable axis max for the PER-FAMILY transcript rate (Tx% view) across all scopes + families
    let GRATE_TXFAM=1e-9;
    _SCOPES.forEach(ev=>{for(let c=0;c<NS;c++){
      const act=ev||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)continue;
      order.forEach(f=>{
        const rt=val.reduce((s,e)=>s+(((f.txByEval&&f.txByEval[e])||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
        GRATE_TXFAM=Math.max(GRATE_TXFAM,rt);
      });
    }});
    const niceCeil=(v)=>{ if(v<=0)return 1; const mg=Math.pow(10,Math.floor(Math.log10(v))); const n=v/mg; return mg*[1,1.2,1.5,2,2.5,3,4,5,6,8,10].find(x=>x>=n-1e-9); };
    const AXR_EW = niceCeil(GRATE_EW), AXR_TX = niceCeil(GRATE_TX), AXR_TXFAM = niceCeil(GRATE_TXFAM), AXR = niceCeil(GRATE), AXT = niceCeil(GTOT);
    const segH=(fkey,cnt,c)=> share?(cnt/(TOT[c]||1))*ph: rateMode?(EWRATE[fkey][c]/AXR_EW)*ph: txRateMode&&TXMGR?((TOT[c]>0?cnt/TOT[c]:0)*TXMGR[c]/AXR_TX)*ph: (cnt/AXT)*ph;
    const seg={};
    cols.forEach(c=>{ let y=baseY; seg[c]=order.map(f=>{ const cnt=EFF[f.key][c], hh=segH(f.key,cnt,c); const o={key:f.key,count:cnt,y0:y-hh,y1:y,h:hh}; y-=hh; return o; }); });
    const segByKey=(c,k)=> seg[c][order.findIndex(f=>f.key===k)];
    const ribbon=(x1,a0,a1,x2,b0,b1)=>{ const mx=(x1+x2)/2; return `M${x1},${a0} C${mx},${a0} ${mx},${b0} ${x2},${b0} L${x2},${b1} C${mx},${b1} ${mx},${a1} ${x1},${a1} Z`; };
    const fk=[];
    if(txRateMode){
      // ----- Tx% view: one bar PER FAMILY per checkpoint (grouped, NOT stacked). -----
      // Each bar = fraction of transcripts with >=1 quote in that family. Bars are
      // independent (a transcript can fall in several families) so they don't stack.
      const nf=order.length||1;
      // group width within a checkpoint, clamped so the leftmost group stays right of the y-axis.
      const GW=Math.min(140, 28*nf+14, 2*(cxOf[cols[0]]-96));
      const innerGap=Math.max(1.5, Math.min(6, 54/nf));
      const bw2=Math.max(3,(GW-innerGap*(nf-1))/nf);
      cols.forEach(c=>{ if(!hasData(c))return; order.forEach((f,fi)=>{
        const rt=EWTXRATE[f.key][c], hgt=(rt/AXR_TXFAM)*ph;
        const x=cxOf[c]-GW/2+fi*(bw2+innerGap);
        const dim=st.selFam&&st.selFam!==f.key, hov=st.hover&&st.hover.f===f.key&&st.hover.c===c;
        fk.push(h('rect',{key:'tb'+c+f.key,x:x,y:baseY-hgt,width:bw2,height:Math.max(1,hgt),fill:col(f.key),opacity:dim?0.16:(hov?1:0.92),rx:1.5,style:{cursor:'pointer'},onClick:()=>this.pickFam(f.key),onMouseEnter:()=>this.setState({hover:{f:f.key,c}}),onMouseLeave:()=>this.setState({hover:null})}));
      }); });
    } else {
      // ----- stacked composition + flow ribbons (share / rate / count) -----
      // ribbons connect consecutive VISIBLE lineage columns only (the flow is the lineage)
      for(let i=0;i+1<cols.length;i++){ const c=cols[i], c2=cols[i+1];
        if(STAGES[c].is_reference||STAGES[c2].is_reference) continue;
        order.forEach(f=>{ const a=segByKey(c,f.key), b=segByKey(c2,f.key); if(a.h<0.4&&b.h<0.4)return; const dim=st.selFam&&st.selFam!==f.key; fk.push(h('path',{key:'r'+c+f.key,d:ribbon(cxOf[c]+barW/2,a.y0,a.y1,cxOf[c2]-barW/2,b.y0,b.y1),fill:col(f.key),opacity:dim?(ribOp*0.2):ribOp,stroke:'none',style:{cursor:'pointer'},onMouseEnter:()=>this.setState({hover:{f:f.key,ribbon:true}})})); });
      }
      cols.forEach(c=>{ seg[c].forEach(s=>{ if(s.h<0.4)return; const dim=st.selFam&&st.selFam!==s.key; const hov=st.hover&&st.hover.f===s.key&&st.hover.c===c; fk.push(h('rect',{key:'b'+c+s.key,x:cxOf[c]-barW/2,y:s.y0,width:barW,height:Math.max(1,s.h),fill:col(s.key),opacity:dim?0.16:(hov?1:0.9),rx:1.5,style:{cursor:'pointer'},onClick:()=>this.pickFam(s.key),onMouseEnter:()=>this.setState({hover:{f:s.key,c}}),onMouseLeave:()=>this.setState({hover:null})})); }); });
    }
    // off-lineage divider + label (only when both lineage and reference columns are visible)
    const linVis=cols.filter(c=>!STAGES[c].is_reference);
    const refVis=cols.filter(c=>STAGES[c].is_reference);
    if(linVis.length && refVis.length){ const qd=(cxOf[linVis[linVis.length-1]]+cxOf[refVis[0]])/2;
      fk.push(h('line',{key:'qd',x1:qd,x2:qd,y1:top-2,y2:baseY+36,stroke:'#D9D7D0',strokeWidth:1,strokeDasharray:'2 5'}));
      const refMid=(cxOf[refVis[0]]+cxOf[refVis[refVis.length-1]])/2;
      fk.push(h('text',{key:'qt',x:refMid,y:top+12,textAnchor:'middle',style:{font:'11px "Spline Sans Mono",monospace',fill:'#B7B5AE',letterSpacing:'.12em'}},'OFF-LINEAGE')); }
    cols.forEach(c=>{ const isRef=STAGES[c].is_reference;
      fk.push(h('text',{key:'xl'+c,x:cxOf[c],y:baseY+27,textAnchor:'middle',style:{font:(isRef?'600 13px':'600 17px')+' "Spline Sans",sans-serif',fill: isRef?'#8A8780':'#1D1D1B'}}, COLLBL[c]));
      const sub = rateMode?(hasData(c)?fmtRate(EWRTOT[c])+' /tx':'no data'): txRateMode?(TXMGR&&hasData(c)?fmtPct(TXMGR[c])+' any mg':'no data'): ('n='+TOT[c]);
      fk.push(h('text',{key:'xn'+c,x:cxOf[c],y:baseY+43,textAnchor:'middle',style:{font:(rateMode?'600 12.5px':'12px')+' "Spline Sans Mono",monospace',fill: (rateMode||txRateMode)?'#46453F':'#A6A49D'}}, sub));
      if(rateMode||txRateMode) fk.push(h('text',{key:'xs'+c,x:cxOf[c],y:baseY+55,textAnchor:'middle',style:{font:'10px "Spline Sans Mono",monospace',fill:'#B7B5AE'}}, SAMP[c]?(rateMode?(TOT[c]+' / '+SAMP[c]):('n='+SAMP[c]+' tx')):'')); });
    // ---------- x axis caption: Olmo 3 post-training lineage ----------
    if(linVis.length>=2){ const xb0=cxOf[linVis[0]]-barW/2, xb3=cxOf[linVis[linVis.length-1]]+barW/2, yb=baseY+68, xmid=(cxOf[linVis[0]]+cxOf[linVis[linVis.length-1]])/2;
      fk.push(h('path',{key:'xbr',d:`M${xb0},${yb-5} L${xb0},${yb} L${xb3},${yb} L${xb3},${yb-5}`,fill:'none',stroke:'#D4D1CA',strokeWidth:1}));
      fk.push(h('text',{key:'xbt',x:xmid,y:yb+15,textAnchor:'middle',style:{font:'600 10.5px "Spline Sans Mono",monospace',fill:'#7A7872',letterSpacing:'.12em'}},'OLMO 3 POST-TRAINING CHECKPOINTS')); }
    // ---------- y axis ----------
    const axisMax = share?1: rateMode?AXR_EW: txRateMode?AXR_TXFAM: AXT;
    const yOf = (v)=> baseY - (axisMax ? (v/axisMax)*ph : 0);
    const axisX = 92, lastCx = cxOf[cols[cols.length-1]], gridX2 = lastCx + barW/2;
    const fmtY = (v)=> (share||txRateMode)?Math.round(v*100)+'%': rateMode?(+v.toFixed(2)).toString(): String(Math.round(v));
    const yTitle = (share?'% of stage': rateMode?'quotes / transcript': txRateMode?'% transcripts w/ family quote':'quote count').toUpperCase();
    const yAxis=[];
    [0,0.25,0.5,0.75,1].forEach((t,i)=>{ const v=t*axisMax, y=yOf(v);
      yAxis.push(h('line',{key:'yg'+i,x1:axisX,x2:gridX2,y1:y,y2:y,stroke:'#ECEAE4',strokeWidth:1,strokeDasharray:i===0?'none':'2 5'}));
      yAxis.push(h('text',{key:'ylb'+i,x:axisX-8,y:y+3.5,textAnchor:'end',style:{font:'10px "Spline Sans Mono",monospace',fill:'#A6A49D'}}, fmtY(v))); });
    yAxis.push(h('line',{key:'yaxis',x1:axisX,x2:axisX,y1:top,y2:baseY,stroke:'#D9D7D0',strokeWidth:1}));
    yAxis.push(h('text',{key:'ytitle',transform:'translate(20,'+(top+ph/2)+') rotate(-90)',textAnchor:'middle',style:{font:'9.5px "Spline Sans Mono",monospace',fill:'#B7B5AE',letterSpacing:'.1em'}}, yTitle));
    fk.unshift(...yAxis);
    const flowChart=h('svg',{viewBox:`0 0 ${W} ${H}`,preserveAspectRatio:'xMidYMid meet',onMouseMove:this.onFlowMove,style:{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}},fk);

    const flowSub = (share?'share of each stage’s verbalizations':rateMode?'metagaming quotes per transcript — height = rate':txRateMode?'% of transcripts with ≥1 quote in each family — one bar per family, not stacked':'absolute quote counts (height scaled to peak stage)') + ' · '+scopeShort;
    const flowTitle = txRateMode?'Transcript coverage by family':'Composition by stage';

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
      else { const c=st.hover.c; tipLine1=COLLBL[c]+(STAGES[c].is_reference?' · reference':' · stage');
        tipLine2 = rateMode
          ? (hasData(c)? (fmtRate(EWRATE[f.key][c])+' /tx  ·  n='+EFF[f.key][c]) : 'no responses')
          : txRateMode
          ? (hasData(c)? fmtPct(EWTXRATE[f.key][c])+' of transcripts have a '+f.label.toLowerCase()+' quote' : 'no data')
          : ('n='+EFF[f.key][c]+'   ·   '+fmtPct(EFF[f.key][c]/(TOT[c]||1))+' of stage'); }
    }

    // ---------- detail panel ----------
    const selFamObj = st.selFam ? T.families.find(f=>f.key===st.selFam) : null;
    let detRows=[], detBench=[], detQuotes=[], stageChips=[], detClass=[], selName='', selKicker='', selColor='#888', quoteCount='', moreQuotes='';
    if(selFamObj){
      selColor=col(selFamObj.key);
      selName=selFamObj.label;
      const ec=EFF[selFamObj.key], sTot=lin.reduce((s,c)=>s+(ec[c]||0),0);
      // VEA share of this family (eval_aware quotes / VEA-labeled quotes across lineage)
      const _vL=(selFamObj.veaLabeled||[]).reduce((a,b)=>a+b,0), _vE=(selFamObj.veaCount||[]).reduce((a,b)=>a+b,0);
      selKicker=sTot+' quotes across lineage · '+scopeShort+(_vL?' · '+Math.round(_vE/_vL*100)+'% VEA (of '+_vL+' labeled)':'');
      const famMaxRate=Math.max(...cols.map(c=>EWRATE[selFamObj.key][c]),1e-9);
      detRows=cols.map(c=>{ const cnt=ec[c], shr=cnt/(TOT[c]||1), rr=EWRATE[selFamObj.key][c];
        const big = share?fmtPct(shr): rateMode?(hasData(c)?fmtRate(rr)+' /tx':'—'): txRateMode?'—' : String(cnt);
        const small = rateMode?('n='+cnt) : share?('n='+cnt):fmtPct(shr);
        const bw = share?Math.min(1,shr) : rateMode?(rr/famMaxRate) : Math.min(1,shr);
        return { label:COLLBL[c], big, small, barW:(bw*100).toFixed(1)+'%', lblColor:STAGES[c].is_reference?'#A6A49D':'#46453F', barDash:STAGES[c].is_reference?'background-image:repeating-linear-gradient(90deg,'+selColor+' 0 5px,transparent 5px 8px);':'' }; });
      // eval-class makeup of this family per checkpoint (capability / safety / natural)
      const _evCat={}; T.evals.forEach(e=>_evCat[e.key]=e.cat);
      const _esD = evals || T.evals.map(e=>e.key);
      detClass=cols.map(c=>{ const by={capability:0,safety:0,natural:0};
        _esD.forEach(k=>{ const a=selFamObj.byEval[k]; if(a) by[_evCat[k]] += (a[c]||0); });
        const tt=by.capability+by.safety+by.natural;
        return { label:COLLBL[c], total:tt, lblColor:STAGES[c].is_reference?'#A6A49D':'#46453F',
          segs:T.catOrder.filter(cl=>by[cl]>0).map(cl=>({ w:(by[cl]/tt*100).toFixed(2)+'%', color:this.CAT[cl], lbl:(T.catLabel[cl]||cl)+': '+by[cl] })) }; });
      // benchmark mix for this family (lineage counts), all benchmarks regardless of scope
      const mix=T.evals.map(e=>{ const a=selFamObj.byEval[e.key]; const n=a?lin.reduce((s,c)=>s+(a[c]||0),0):0; return {e, n}; }).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
      const mixMax=Math.max(...mix.map(x=>x.n),1);
      detBench=mix.map(({e,n})=>{ const active=st.scope==='eval:'+e.key; return { label:e.label, count:n, color:selColor, barW:Math.max(4,(n/mixMax)*90).toFixed(0)+'px',
        onClick:()=>this.setScope('eval:'+e.key),
        rowStyle:'display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;cursor:pointer;'+(active?'background:#EFEDE7;':'') }; });
      // quotes filtered by scope (eval) + stage
      const inScope=(q)=> !evals || q.ev.some(e=>evals.includes(e));
      let src=(selFamObj.quotes||[]).filter(inScope);
      const filt = st.qStage==='all' ? src : src.filter(q=>q.cols.includes(st.qStage));
      const badgeStyle=(c)=> STAGES[c].is_reference
        ? 'font-family:\'Spline Sans Mono\',monospace;font-size:8.5px;font-weight:600;letter-spacing:.04em;color:#8A8780;border:1px solid #D4D1CA;padding:1px 5px;border-radius:3px'
        : 'font-family:\'Spline Sans Mono\',monospace;font-size:8.5px;font-weight:600;letter-spacing:.04em;color:#3A4A45;background:#E4ECE9;padding:1px 5px;border-radius:3px';
      const elabel=(k)=>{ const e=T.evals.find(x=>x.key===k); return e?e.label:k; };
      // VEA badge (purple) on eval_aware quotes; shows the 0-100 accuracy when present.
      const veaBadgeStyle='font-family:\'Spline Sans Mono\',monospace;font-size:8.5px;font-weight:700;letter-spacing:.04em;color:#7A3E9A;background:#F0E6F7;padding:1px 5px;border-radius:3px';
      const hasTx=(tk)=> !!(T.transcripts && tk && (tk in T.transcripts));
      detQuotes=filt.slice(0,16).map(q=>{ const showEv = evals ? q.ev.filter(e=>evals.includes(e)) : q.ev; const ev0=showEv[0]||q.ev[0];
        const badges=q.cols.filter(c=>c<NS).map(c=>({ label:COLLBL[c], style:badgeStyle(c) }));
        if(q.vea==='eval_aware') badges.push({ label:(q.acc!=null?'VEA '+q.acc:'VEA'), style:veaBadgeStyle });
        const tx=hasTx(q.tk);
        return { t:q.t, evLabel: elabel(ev0)+(showEv.length>1?' +'+(showEv.length-1):''), catColor:T.catColor[q.c]||'#999',
          badges, hasTx:tx, txHint: tx?'view transcript ↗':'',
          onClick: tx?(()=>this.showTx(q.tk,q.t,q.oq||q.t,selFamObj.label)):(()=>{}),
          rowCursor: tx?'pointer':'default' }; });
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
      : txRateMode?'One bar per family = fraction of transcripts with ≥1 quote in that family (equal-weighted across benchmarks). Independent per family, so bars do not sum.'
      : 'Raw quote counts. Confounded — sampling differs by benchmark and stage.';

    // ---------- benchmark description (shown when a single benchmark is selected) ----------
    let benchDescShow=false, benchDescTag='', benchDescText='', benchDescUrl='';
    if(st.scope.startsWith('eval:')){ const d=this.BENCHDESC[st.scope.slice(5)]; if(d){ benchDescShow=true; benchDescTag=d.tag; benchDescText=d.desc; benchDescUrl=d.src; } }

    // ---------- model-group selector (the "set" dropdown, as a segmented control) ----------
    const GROUPS=[{k:'all',label:'All models'}];
    if(LIN.length) GROUPS.push({k:'lineage',label:'OLMo lineage'});
    if(REF.length) GROUPS.push({k:'reference',label:'Reference'});
    const modelGroupChips = GROUPS.map(g=>({ label:g.label, onClick:()=>this.setModelGroup(g.k),
      style: chipBase + ((st.modelGroup||'all')===g.k
        ? 'background:#2C6E63;color:#fff;border:1px solid #2C6E63;font-weight:600'
        : 'background:#FFFFFF;color:#54534E;border:1px solid #E0DDD5') }));

    // ---------- Eval-awareness by model (Feature A: MG vs VEA split; Feature B: accuracy) ----------
    // Both recompute over (visible families x active evals), so the family checkboxes
    // and benchmark scope filter compose. Summing all families reproduces the flat totals.
    const actEv = evals || T.evals.map(e=>e.key);
    const VEA_COL='#7A3E9A', MG_COL='#2C6E63';
    const veaSplit = cols.map(c=>{
      let veaN=0, labN=0;
      order.forEach(f=>{ actEv.forEach(e=>{
        veaN += ((f.veaByEval&&f.veaByEval[e])||[])[c]||0;
        labN += ((f.veaLabByEval&&f.veaLabByEval[e])||[])[c]||0;
      }); });
      const mgN  = Math.max(0, labN - veaN), tot = veaN + mgN;
      const veaPct = tot? veaN/tot : 0, mgPct = tot? mgN/tot : 0;
      return { label:COLLBL[c], lblColor:STAGES[c].is_reference?'#A6A49D':'#46453F', veaN, mgN, tot,
               veaW:(veaPct*100).toFixed(2)+'%', mgW:(mgPct*100).toFixed(2)+'%',
               veaColor:VEA_COL, mgColor:MG_COL,
               veaPctTxt: tot? Math.round(veaPct*100)+'%' : '—',
               title:'VEA '+veaN+' · metagaming-only '+mgN+' of '+tot }; });
    const accReady = (T.families||[]).some(f=>f.accHistByEval);
    const accThr = st.accThr!=null ? st.accThr : 70;
    const ACCBAND=['#C0443B','#D98A3B','#7FB07A','#2C6E63'], ACCLBL=['0–49','50–69','70–89','90–100'];
    const BAND_LO=[0,5,7,9], BAND_HI=[4,6,8,9], thrBucket=Math.round(accThr/10);
    const accBands = cols.map(c=>{
      const h10=[0,0,0,0,0,0,0,0,0,0];
      order.forEach(f=>{ const fh=f.accHistByEval; if(fh) actEv.forEach(e=>{ const a=(fh[e]||[])[c]; if(a) for(let b=0;b<10;b++) h10[b]+=(a[b]||0); }); });
      const tot=h10.reduce((a,b)=>a+b,0);
      // build segments low->high; insert a bold cutoff divider before the first
      // included band so it's obvious which bands are counted vs excluded.
      const bands=[]; let divDone=false;
      ACCBAND.forEach((color,bi)=>{
        const inc = BAND_LO[bi]>=thrBucket;
        if(inc && !divDone){ bands.push({ divider:true, w:'3px', color:'#23231F', op:'1', filt:'none', n:0, lbl:'cutoff ≥ '+accThr }); divDone=true; }
        let n=0; for(let b=BAND_LO[bi]; b<=BAND_HI[bi]; b++) n+=h10[b];
        bands.push({ divider:false, w: tot?(n/tot*100).toFixed(2)+'%':'0%', color, n,
                     op: inc?'1':'0.4', filt: inc?'none':'grayscale(0.8)',
                     lbl: ACCLBL[bi]+': '+n+(inc?'  · counted (≥'+accThr+')':'  · excluded (<'+accThr+')') }); });
      let ge=0; for(let b=thrBucket;b<10;b++) ge+=h10[b];
      return { label:COLLBL[c], lblColor:STAGES[c].is_reference?'#A6A49D':'#46453F', tot, bands, geN:ge,
               geTxt: tot? Math.round(ge/tot*100)+'%' : '—' }; });
    const accThrChips=[50,70,90].map(t=>({ label:'≥ '+t, onClick:()=>this.setAccThr(t),
      style: chipBase + (accThr===t
        ? 'background:#2C6E63;color:#fff;border:1px solid #2C6E63;font-weight:600'
        : 'background:#FFFFFF;color:#54534E;border:1px solid #E0DDD5') }));
    const eaSub = scopeShort + (anyHidden ? ' · '+order.length+'/'+legendOrder.length+' families' : '');

    // ---------- source-transcript modal (quote -> transcript click) ----------
    let txOpen=false, txModel='', txFamily='', txEval='', txSid='', txQuote='', txParts=[];
    if(st.openTx && T.transcripts && (st.openTx in T.transcripts)){
      txOpen=true;
      const full=T.transcripts[st.openTx]||'';
      txQuote=st.openTxQuote||'';
      const pp=st.openTx.split('::'), mdl=pp[0], evk=pp[1], sid=pp.slice(2).join('::');
      const stg=(T.stages||[]).find(s=>s.model===mdl), evo=(T.evals||[]).find(e=>e.key===evk);
      txModel=stg?stg.label:mdl; txEval=evo?evo.label:evk; txSid=sid; txFamily=st.openTxFam||'';
      // best-effort highlight using the VERBATIM quote (openTxOrig); fall back to the
      // cleaned display text, then to a 40-char prefix probe.
      const hl='background:#FFF1A8;color:#23231F;font-weight:600;border-radius:2px';
      const needle=st.openTxOrig||txQuote;
      let idx = needle ? full.indexOf(needle) : -1, qlen = needle.length;
      if(idx<0 && needle){ const probe=needle.slice(0,40); if(probe){ idx=full.indexOf(probe); qlen=Math.min(needle.length,40); } }
      txParts = idx>=0
        ? [{text:full.slice(0,idx),style:''},{text:full.slice(idx,idx+qlen),style:hl},{text:full.slice(idx+qlen),style:''}]
        : [{text:full,style:''}];
    }

    return {
      ready:true, legend, flowChart, flowSub, flowTitle, hoverInfo, flowMin,
      statQuotes, statResponses, statBenchmarks,
      benchGroups, totalAll, allBench:this.allBench, allBenchStyle, allBenchLabel, benchNote, scopeReadout, scopeShort,
      measureHint,
      benchDescShow, benchDescTag, benchDescText, benchDescUrl,
      modelGroupChips, showAllFams:this.showAllFams, anyHidden,
      veaSplit, veaColLbl:'eval-aware (VEA)', mgColLbl:'metagaming-only', veaSwatch:VEA_COL, mgSwatch:MG_COL,
      accReady, accBands, accThrChips, accThr, eaSub,
      shareBtnStyle: share?onStyle:offStyle, rateBtnStyle: rateMode?onStyle:offStyle, txRateBtnStyle: txRateMode?onStyle:offStyle, countBtnStyle: (!share&&!rateMode&&!txRateMode)?onStyle:offStyle,
      setShare:this.setShare, setRate:this.setRate, setTxRate:this.setTxRate, setCount:this.setCount,
      clearSel:this.clearSel, clearLabel:(st.selFam)?'clear':'',
      clearBtnStyle:'font-family:\'Spline Sans Mono\',monospace;font-size:9.5px;color:#2C6E63;background:none;border:none;cursor:pointer;padding:0;'+(st.selFam?'':'visibility:hidden'),
      hasSel:!!selFamObj,
      selName, selKicker, selColor, detRows, detClass, detBench, detQuotes, quoteCount, moreQuotes, stageChips,
      txOpen, txModel, txFamily, txEval, txSid, txQuote, txParts, closeTx:this.closeTx,
      tipShow, tipX, tipY, tipTransform, tipColor, tipLabel, tipLine1, tipLine2,
      onFlowMove:this.onFlowMove, onFlowLeave:this.onFlowLeave
    };
  }
}
