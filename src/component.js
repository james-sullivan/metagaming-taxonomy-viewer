
// ---- circle packing (faithful port of d3-hierarchy pack/enclose; shuffle omitted for
// determinism — n is tiny here). cp_packEnclose(circles[{r}]) assigns x,y (centered on the
// enclosing circle) and returns the enclosing radius. Used by the type/subtype circle graph.
function cp_place(b,a,c){var dx=b.x-a.x,x,a2,dy=b.y-a.y,y,b2,d2=dx*dx+dy*dy;
  if(d2){a2=a.r+c.r,a2*=a2;b2=b.r+c.r,b2*=b2;
    if(a2>b2){x=(d2+b2-a2)/(2*d2);y=Math.sqrt(Math.max(0,b2/d2-x*x));c.x=b.x-x*dx-y*dy;c.y=b.y-x*dy+y*dx;}
    else{x=(d2+a2-b2)/(2*d2);y=Math.sqrt(Math.max(0,a2/d2-x*x));c.x=a.x+x*dx-y*dy;c.y=a.y+x*dy+y*dx;}}
  else{c.x=a.x+c.r;c.y=a.y;}}
function cp_intersects(a,b){var dr=a.r+b.r-1e-6,dx=b.x-a.x,dy=b.y-a.y;return dr>0&&dr*dr>dx*dx+dy*dy;}
function cp_score(node){var a=node._,b=node.next._,ab=a.r+b.r,dx=(a.x*b.r+b.x*a.r)/ab,dy=(a.y*b.r+b.y*a.r)/ab;return dx*dx+dy*dy;}
function CpNode(c){this._=c;this.next=null;this.previous=null;}
function cp_packEnclose(circles){var i,n=circles.length,a,b,c,j,k,sj,sk,aa,ca;
  if(!n)return 0;
  a=circles[0];a.x=0;a.y=0;if(!(n>1))return a.r;
  b=circles[1];a.x=-b.r;b.x=a.r;b.y=0;if(!(n>2))return a.r+b.r;
  cp_place(b,a,c=circles[2]);
  a=new CpNode(a);b=new CpNode(b);c=new CpNode(c);
  a.next=c.previous=b;b.next=a.previous=c;c.next=b.previous=a;
  pack:for(i=3;i<n;++i){
    cp_place(a._,b._,c=circles[i]);c=new CpNode(c);
    j=b.next;k=a.previous;sj=b._.r;sk=a._.r;
    do{ if(sj<=sk){ if(cp_intersects(j._,c._)){b=j;a.next=b;b.previous=a;--i;continue pack;} sj+=j._.r;j=j.next; }
        else{ if(cp_intersects(k._,c._)){a=k;a.next=b;b.previous=a;--i;continue pack;} sk+=k._.r;k=k.previous; } }
    while(j!==k.next);
    c.previous=a;c.next=b;a.next=b.previous=b=c;
    aa=cp_score(a);
    while((c=c.next)!==b)if((ca=cp_score(c))<aa){a=c;aa=ca;}
    b=a.next;
  }
  a=[b._];c=b;while((c=c.next)!==b)a.push(c._);
  c=cp_enclose(a);
  for(i=0;i<n;++i){a=circles[i];a.x-=c.x;a.y-=c.y;}
  return c.r;}
function cp_enclose(circles){var i=0,n=circles.length,B=[],p,e;
  while(i<n){p=circles[i];if(e&&cp_enclosesWeak(e,p))++i;else{e=cp_encloseBasis(B=cp_extendBasis(B,p));i=0;}}
  return e;}
function cp_extendBasis(B,p){var i,j;
  if(cp_enclosesWeakAll(p,B))return[p];
  for(i=0;i<B.length;++i){if(cp_enclosesNot(p,B[i])&&cp_enclosesWeakAll(cp_encloseBasis2(B[i],p),B))return[B[i],p];}
  for(i=0;i<B.length-1;++i){for(j=i+1;j<B.length;++j){
    if(cp_enclosesNot(cp_encloseBasis2(B[i],B[j]),p)&&cp_enclosesNot(cp_encloseBasis2(B[i],p),B[j])&&cp_enclosesNot(cp_encloseBasis2(B[j],p),B[i])&&cp_enclosesWeakAll(cp_encloseBasis3(B[i],B[j],p),B))return[B[i],B[j],p];}}
  throw new Error();}
function cp_enclosesNot(a,b){var dr=a.r-b.r,dx=b.x-a.x,dy=b.y-a.y;return dr<0||dr*dr<dx*dx+dy*dy;}
function cp_enclosesWeak(a,b){var dr=a.r-b.r+Math.max(a.r,b.r,1)*1e-9,dx=b.x-a.x,dy=b.y-a.y;return dr>0&&dr*dr>dx*dx+dy*dy;}
function cp_enclosesWeakAll(a,B){for(var i=0;i<B.length;++i){if(!cp_enclosesWeak(a,B[i]))return false;}return true;}
function cp_encloseBasis(B){switch(B.length){case 1:return cp_encloseBasis1(B[0]);case 2:return cp_encloseBasis2(B[0],B[1]);case 3:return cp_encloseBasis3(B[0],B[1],B[2]);}}
function cp_encloseBasis1(a){return{x:a.x,y:a.y,r:a.r};}
function cp_encloseBasis2(a,b){var x1=a.x,y1=a.y,r1=a.r,x2=b.x,y2=b.y,r2=b.r,x21=x2-x1,y21=y2-y1,r21=r2-r1,l=Math.sqrt(x21*x21+y21*y21);
  return{x:(x1+x2+x21/l*r21)/2,y:(y1+y2+y21/l*r21)/2,r:(l+r1+r2)/2};}
function cp_encloseBasis3(a,b,c){var x1=a.x,y1=a.y,r1=a.r,x2=b.x,y2=b.y,r2=b.r,x3=c.x,y3=c.y,r3=c.r,
  a2=x1-x2,a3=x1-x3,b2=y1-y2,b3=y1-y3,c2=r2-r1,c3=r3-r1,
  d1=x1*x1+y1*y1-r1*r1,d2=d1-x2*x2-y2*y2+r2*r2,d3=d1-x3*x3-y3*y3+r3*r3,
  ab=a3*b2-a2*b3,
  xa=(b2*d3-b3*d2)/(ab*2)-x1,xb=(b3*c2-b2*c3)/ab,
  ya=(a3*d2-a2*d3)/(ab*2)-y1,yb=(a2*c3-a3*c2)/ab,
  A=xb*xb+yb*yb-1,B=2*(r1+xa*xb+ya*yb),C=xa*xa+ya*ya-r1*r1,
  r=-(Math.abs(A)>1e-6?(B+Math.sqrt(B*B-4*A*C))/(2*A):C/B);
  return{x:x1+xa+xb*r,y:y1+ya+yb*r,r:r};}
// greedy word-wrap into <=maxLines lines of <=maxChars; ellipsize the last if it overflows.
function cp_wrap(text,maxChars,maxLines){
  var words=String(text).split(/\s+/).filter(Boolean),lines=[],cur='';
  for(var i=0;i<words.length;i++){var w=words[i],t=cur?cur+' '+w:w;
    if(t.length<=maxChars||!cur)cur=t;else{lines.push(cur);cur=w;}}
  if(cur)lines.push(cur);
  if(lines.length<=maxLines)return lines;
  var kept=lines.slice(0,maxLines),last=kept[maxLines-1];
  if(last.length>maxChars-1)last=last.slice(0,maxChars-1).replace(/\s+$/,'');
  kept[maxLines-1]=last+'…';return kept;}

class Component extends DCLogic {
  state = { dataset:null, measure:null, modelGroup:'all', hiddenFams:{}, hiddenStages:{}, selFam:null, qStage:'all', implFilter:null, scope:'all', accThr:70, veaOnly:false, openTx:null, openTxQuote:'', openTxOrig:'', openTxFam:'', openTxCw:'', hover:null, hx:0, hy:0, hw:0, hh:0 };

  componentDidMount(){ this._tick(0); }
  _tick(n){ if(window.TAXO){ this.forceUpdate(); } else if(n<80){ setTimeout(()=>this._tick(n+1),40); } }

  setShare=()=>this.setState({measure:'share'});
  setRate=()=>this.setState({measure:'rate'});
  setCount=()=>this.setState({measure:'count'});
  setTxRate=()=>this.setState({measure:'txrate'});
  setModelGroup=(g)=>this.setState({modelGroup:g});
  // switching lineage MUST reset all per-lineage UI state or the view mis-renders
  setDataset=(id)=>this.setState({dataset:id, selFam:null, hiddenFams:{}, hiddenStages:{}, scope:'all', qStage:'all', implFilter:null, modelGroup:'all', veaOnly:false, openTx:null, openTxQuote:'', openTxOrig:'', openTxFam:'', openTxCw:'', hover:null});
  toggleFam=(k)=>this.setState(s=>{ const h=Object.assign({},s.hiddenFams); if(h[k]) delete h[k]; else h[k]=true; return {hiddenFams:h}; });
  showAllFams=()=>this.setState({hiddenFams:{}});
  toggleStage=(i)=>this.setState(s=>{ const h=Object.assign({},s.hiddenStages); if(h[i]) delete h[i]; else h[i]=true; return {hiddenStages:h}; });
  showAllStages=()=>this.setState({hiddenStages:{}});
  pickFam=(k)=>this.setState(s=>({selFam:s.selFam===k?null:k, qStage:'all', implFilter:null}));
  clearSel=()=>this.setState({selFam:null});
  setQStage=(c)=>this.setState(s=>({qStage:s.qStage===c?'all':c}));
  setImplFilter=(t)=>this.setState(s=>({implFilter:s.implFilter===t?null:t}));
  setScope=(v)=>this.setState(s=>({scope:s.scope===v?'all':v}));
  allBench=()=>this.setState({scope:'all'});
  setAccThr=(t)=>this.setState({accThr:t});
  setVeaAll=()=>this.setState({veaOnly:false});
  setVeaOnly=()=>this.setState({veaOnly:true});
  setCompView=(v)=>this.setState({compView:v});
  showTx=(tk,qt,oq,fam,cw)=>this.setState({openTx:tk, openTxQuote:qt||'', openTxOrig:oq||qt||'', openTxFam:fam||'', openTxCw:cw||''});
  closeTx=()=>this.setState({openTx:null, openTxQuote:'', openTxOrig:'', openTxFam:'', openTxCw:''});
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
  effCounts(fam, evals){ // -> [n_stages]; VEA-only mode sources veaCount/veaByEval instead
    const veaOnly=!!this.state.veaOnly;
    const NS=(fam.counts||[]).length;
    if(!evals) return veaOnly ? (fam.veaCount||new Array(NS).fill(0)) : fam.counts;
    const src = veaOnly ? (fam.veaByEval||{}) : fam.byEval;
    const out=new Array(NS).fill(0);
    evals.forEach(e=>{ const a=src[e]; if(a) for(let i=0;i<NS;i++) out[i]+=(a[i]||0); });
    return out;
  }
  // VEA-only mirror of a per-implication counts/byEval lookup, used by both composition
  // views (subValAt) and the detail-panel implication trajectories (_svAt).
  implValAt(im, c, evals){
    const veaOnly=!!this.state.veaOnly;
    const counts = veaOnly ? im.veaCounts : im.counts;
    const byEval = veaOnly ? im.veaByEval : im.byEval;
    return (evals && byEval) ? evals.reduce((a,e)=>a+(((byEval[e])||[])[c]||0),0) : ((counts||[])[c]||0);
  }

  renderVals(){
    const h=React.createElement;
    const TX=window.TAXO;
    const isMulti=!!(TX && TX.schema===2 && TX.datasets);
    const dsId=isMulti ? ((this.state.dataset && TX.datasets[this.state.dataset]) ? this.state.dataset : TX.default) : null;
    const T=isMulti ? TX.datasets[dsId] : TX;
    const LMETA=isMulti ? (TX.lineages[dsId]||{}) : {};
    if(!T) return { ready:false, hasSel:false, legend:[], benchGroups:[], flowChart:null, flowTitle:'Composition by stage', compViewChips:[], statQuotes:'', statResponses:'', statBenchmarks:'', detRows:[], detBench:[], detQuotes:[], detImpls:[], detImplsPanel:null, stageChips:[], stageToggles:[], lineageOptions:[], lineageChips:[], lineageShow:false, headerKicker:'Metagaming taxonomy', headerTitle:'How does the taxonomy of metagaming verbalizations change across post-training?', tipShow:false, flowMin:440, benchDescShow:false, benchDescTag:'', benchDescText:'', benchDescUrl:'', detQuoteGroups:[], implFilterChip:null, detClass:[], veaSplit:[], accBands:[], accThrChips:[], accReady:false, eaSub:'', veaColLbl:'', mgColLbl:'', veaSwatch:'#7A3E9A', mgSwatch:'#2C6E63', modelGroupChips:[], showAllFams:this.showAllFams, anyHidden:false, anyStageHidden:false, showAllStages:this.showAllStages, veaAvailable:false, veaAllBtnStyle:'', veaOnlyBtnStyle:'', veaScopeHint:'', setVeaAll:this.setVeaAll, setVeaOnly:this.setVeaOnly, txOpen:false, txModel:'', txFamily:'', txEval:'', txSid:'', txQuote:'', txOrig:'', txHasOrig:false, txParts:[], txPrompt:'', txHasPrompt:false, closeTx:this.closeTx, onFlowMove:this.onFlowMove, onFlowLeave:this.onFlowLeave };
    const st=this.state, P=this.props||{};
    const measure = st.measure || P.defaultMeasure || 'rate';
    const share = measure==='share';
    const CAT=this.CAT;
    // ----- "VEA only" whole-view toggle: restricts every count/rate/quote/transcript below
    // to eval_aware-labeled data (veaCount/veaByEval/veaTxByEval mirrors of the ALL-quote
    // fields). Only offered when this lineage actually has VEA-labeled quotes.
    const veaOnly = !!st.veaOnly;
    const veaAvailable = (T.families||[]).some(f=>(f.veaLabeled||[]).some(v=>v>0));
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
    // per-stage checkboxes (schema 2): hide unchecked stages from every view
    const stageFiltered = cols.filter(c=>!st.hiddenStages[c]);
    if(stageFiltered.length) cols=stageFiltered;
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
    const fullTot=(f)=> (lin.length?lin:ALLC).reduce((s,c)=>s+((veaOnly?f.veaCount:f.counts)[c]||0),0);
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
    // VEA coverage check: does this stage/scope have any VEA-labeled quote at all? Used
    // (only under veaOnly) to distinguish a true zero from a stage the VEA judge never covered.
    const veaHasData=(c)=>{const act=evals||T.evals.map(e=>e.key);return (T.families||[]).some(f=>act.some(e=>((f.veaLabByEval&&f.veaLabByEval[e])||[])[c]>0));};
    const hasDataEff=(c)=> veaOnly ? (hasData(c)&&veaHasData(c)) : hasData(c);
    // equal-weighted rate per family per stage (each benchmark weighted evenly)
    const EWRATE={};
    T.families.forEach(f=>{EWRATE[f.key]=ALLC.map(c=>{
      const act=evals||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)return 0;
      const src = veaOnly ? (f.veaByEval||{}) : f.byEval;
      return val.reduce((s,e)=>s+((src[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
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
      const src = veaOnly ? (f.veaTxByEval||{}) : f.txByEval;
      return val.reduce((s,e)=>s+(((src&&src[e])||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
    });});
    // transcript metagaming (or, under veaOnly, eval-aware) rate per stage (equal-weighted)
    const TXSRC = veaOnly ? T.transcriptVeaCounts : T.transcriptMgCounts;
    const TXMGR=TXSRC?ALLC.map(c=>{
      const act=evals||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)return 0;
      return val.reduce((s,e)=>s+((TXSRC[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
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
    // surface the "VEA only" whole-view filter everywhere scopeShort/scopeReadout are shown
    // (flow chart caption, eval-awareness panel, family detail kicker, etc.)
    if(veaOnly){ scopeReadout+=' · VEA only'; scopeShort+=' · VEA only'; }
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
    // Tx% grouped bars are centered on their checkpoint column, but the shared cxOf pins the outer
    // columns against the y-axis / right edge, which crushed group width into spindly bars. In Tx%
    // mode use inset centers (gcxOf) that reserve room for half a group at each edge; the x-labels
    // and caption route through CX() so they stay aligned. In other modes CX() === cxOf, so the
    // shared axis rendering is unchanged.
    const gHalf2=150, gLx=100+gHalf2, gRx=W-24-gHalf2;
    const gcxOf={}; cols.forEach((c,i)=>{ gcxOf[c]= cols.length===1?(gLx+gRx)/2 : gLx+(_slot[i]/_span)*(gRx-gLx); });
    const CX=(c)=> txRateMode?gcxOf[c]:cxOf[c];
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
    if(TXSRC){_SCOPES.forEach(ev=>{for(let c=0;c<NS;c++){
      const act=ev||T.evals.map(e=>e.key);
      const val=act.filter(e=>(T.sampleTotals[e]||[])[c]>0);
      if(!val.length)continue;
      const rt=val.reduce((s,e)=>s+((TXSRC[e]||[])[c]||0)/T.sampleTotals[e][c],0)/val.length;
      GRATE_TX=Math.max(GRATE_TX,rt);
    }});}
    // axis max for the PER-FAMILY transcript rate (Tx% view). Scale to the CURRENT scope's
    // per-family rates (EWTXRATE) so the tallest family bar fills the plot. Maxing across every
    // single-benchmark scope (the way the stacked measures do) pinned this near 1.0 -- an entity
    // can sit in ~100% of one safety benchmark's transcripts -- which shrank the default
    // all-benchmarks bars to ~1/3 height. This stays stable across checkpoints + stage hiding
    // (the base->post comparison that matters); scope switches rescale, and the scope is labeled.
    let GRATE_TXFAM=1e-9;
    order.forEach(f=>{ for(const c of ALLC){ GRATE_TXFAM=Math.max(GRATE_TXFAM, EWTXRATE[f.key][c]||0); } });
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
      // group width = most of the inter-group spacing (bounded), so bars fill the room the inset
      // centers create instead of the old ~108px clamp against the y-axis.
      let gspace=gRx-gLx; for(let i=1;i<cols.length;i++) gspace=Math.min(gspace, Math.abs(gcxOf[cols[i]]-gcxOf[cols[i-1]]));
      const GW=Math.min(2*gHalf2, 46*nf+16, 0.82*gspace);
      const innerGap=Math.max(2, Math.min(10, 90/nf));
      const bw2=Math.max(6,(GW-innerGap*(nf-1))/nf);
      cols.forEach(c=>{ if(!hasDataEff(c))return; order.forEach((f,fi)=>{
        const rt=EWTXRATE[f.key][c], hgt=(rt/AXR_TXFAM)*ph;
        const x=CX(c)-GW/2+fi*(bw2+innerGap);
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
    if(linVis.length && refVis.length){ const qd=(CX(linVis[linVis.length-1])+CX(refVis[0]))/2;
      fk.push(h('line',{key:'qd',x1:qd,x2:qd,y1:top-2,y2:baseY+36,stroke:'#D9D7D0',strokeWidth:1,strokeDasharray:'2 5'}));
      const refMid=(CX(refVis[0])+CX(refVis[refVis.length-1]))/2;
      fk.push(h('text',{key:'qt',x:refMid,y:top+12,textAnchor:'middle',style:{font:'11px "Spline Sans Mono",monospace',fill:'#B7B5AE',letterSpacing:'.12em'}},'OFF-LINEAGE')); }
    cols.forEach(c=>{ const isRef=STAGES[c].is_reference;
      fk.push(h('text',{key:'xl'+c,x:CX(c),y:baseY+27,textAnchor:'middle',style:{font:(isRef?'600 13px':'600 17px')+' "Spline Sans",sans-serif',fill: isRef?'#8A8780':'#1D1D1B'}}, COLLBL[c]));
      const sub = rateMode?(hasDataEff(c)?fmtRate(EWRTOT[c])+' /tx':'no data'): txRateMode?(TXMGR&&hasDataEff(c)?fmtPct(TXMGR[c])+(veaOnly?' any VEA':' any mg'):'no data'): ('n='+TOT[c]);
      fk.push(h('text',{key:'xn'+c,x:CX(c),y:baseY+43,textAnchor:'middle',style:{font:(rateMode?'600 12.5px':'12px')+' "Spline Sans Mono",monospace',fill: (rateMode||txRateMode)?'#46453F':'#A6A49D'}}, sub));
      if(rateMode||txRateMode) fk.push(h('text',{key:'xs'+c,x:CX(c),y:baseY+55,textAnchor:'middle',style:{font:'10px "Spline Sans Mono",monospace',fill:'#B7B5AE'}}, SAMP[c]?(rateMode?(TOT[c]+' / '+SAMP[c]):('n='+SAMP[c]+' tx')):'')); });
    // ---------- x axis caption: Olmo 3 post-training lineage ----------
    if(linVis.length>=2){ const xb0=CX(linVis[0])-barW/2, xb3=CX(linVis[linVis.length-1])+barW/2, yb=baseY+68, xmid=(CX(linVis[0])+CX(linVis[linVis.length-1]))/2;
      const axisCap=(LMETA.axisCaption||'OLMo 3 post-training checkpoints').toUpperCase();
      fk.push(h('path',{key:'xbr',d:`M${xb0},${yb-5} L${xb0},${yb} L${xb3},${yb} L${xb3},${yb-5}`,fill:'none',stroke:'#D4D1CA',strokeWidth:1}));
      fk.push(h('text',{key:'xbt',x:xmid,y:yb+15,textAnchor:'middle',style:{font:'600 10.5px "Spline Sans Mono",monospace',fill:'#7A7872',letterSpacing:'.12em'}},axisCap)); }
    // ---------- y axis ----------
    const axisMax = share?1: rateMode?AXR_EW: txRateMode?AXR_TXFAM: AXT;
    const yOf = (v)=> baseY - (axisMax ? (v/axisMax)*ph : 0);
    const axisX = 92, lastCx = CX(cols[cols.length-1]), gridX2 = lastCx + barW/2;
    const fmtY = (v)=> (share||txRateMode)?Math.round(v*100)+'%': rateMode?(+v.toFixed(2)).toString(): String(Math.round(v));
    const yTitle = (share?'% of stage': rateMode?'quotes / transcript': txRateMode?'% transcripts w/ family quote':'quote count').toUpperCase();
    const yAxis=[];
    [0,0.25,0.5,0.75,1].forEach((t,i)=>{ const v=t*axisMax, y=yOf(v);
      yAxis.push(h('line',{key:'yg'+i,x1:axisX,x2:gridX2,y1:y,y2:y,stroke:'#ECEAE4',strokeWidth:1,strokeDasharray:i===0?'none':'2 5'}));
      yAxis.push(h('text',{key:'ylb'+i,x:axisX-8,y:y+3.5,textAnchor:'end',style:{font:'10px "Spline Sans Mono",monospace',fill:'#A6A49D'}}, fmtY(v))); });
    yAxis.push(h('line',{key:'yaxis',x1:axisX,x2:axisX,y1:top,y2:baseY,stroke:'#D9D7D0',strokeWidth:1}));
    yAxis.push(h('text',{key:'ytitle',transform:'translate(20,'+(top+ph/2)+') rotate(-90)',textAnchor:'middle',style:{font:'9.5px "Spline Sans Mono",monospace',fill:'#B7B5AE',letterSpacing:'.1em'}}, yTitle));
    fk.unshift(...yAxis);
    let flowChart=h('svg',{viewBox:`0 0 ${W} ${H}`,preserveAspectRatio:'xMidYMid meet',onMouseMove:this.onFlowMove,style:{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}},fk);

    let flowSub = (share?'share of each stage’s verbalizations':rateMode?'metagaming quotes per transcript — height = rate':txRateMode?'% of transcripts with ≥1 quote in each family — one bar per family, not stacked':'absolute quote counts (height scaled to peak stage)') + ' · '+scopeShort;
    let flowTitle = txRateMode?'Transcript coverage by family':'Composition by stage';

    // ---------- central composition view: circle-pack OR nested stacked bars (toggle) ------
    // Both show the type→subtype composition across the lineage stages and respond to the
    // benchmark filter. Circles: one pack per stage (area ∝ quotes at that stage). Bars: one
    // stacked bar per stage; each TYPE is a segment, subdivided into its SUBTYPE slices.
    {
      const compView = st.compView || 'bars';
      // scope-aware subtype value at stage si (per-eval counts when a benchmark is filtered;
      // veaOnly-aware via implValAt, so the total (EFF) and named-subtype counts stay on the
      // same basis and the "other/unclustered" remainder doesn't go negative)
      const subValAt=(im,si)=> this.implValAt(im,si,evals);
      // per (type, stage): named subtype entries + a muted "unclustered" remainder, scope-aware
      const subList=(f,si)=>{
        const named=(f.implications||[]).map(im=>({ text:im.text, val:subValAt(im,si) }))
          .filter(k=>k.val>0).sort((a,b)=>b.val-a.val);
        const total=EFF[f.key][si]||0, rem=total-named.reduce((a,k)=>a+k.val,0);
        const kids=named.slice();
        if(rem>0.5) kids.push({ text:'other / unclustered', val:rem, remainder:true });
        return { kids, total };
      };

      if(compView==='circles'){
        const CW=1320, LABH=40, GAPF=0.10, EM=0.03;
        // Square-ish cells: cap the pack band at the cell WIDTH so a circular pack fills its
        // cell vertically too (a circle can't fill a tall narrow cell — that left big vertical
        // gaps). Shortening the viewBox also lets the SVG scale up to the container width, so
        // the bubbles get bigger. Few wide columns fall back to 520 (already filled vertically).
        const CH=LABH+Math.round(Math.max(180,Math.min(520, CW/Math.max(1,cols.length))));
        const packStage=(si)=>{
          const nodes=[];
          order.forEach(f=>{
            const {kids,total}=subList(f,si);
            if(!kids.length) return;
            const circ=kids.map(k=>({ r:Math.sqrt(k.val)*(1+GAPF), data:k }));
            nodes.push({ key:f.key, label:f.label, color:col(f.key), total, circ, R:cp_packEnclose(circ) });
          });
          if(!nodes.length) return { ecs:[], topR:1e-9, total:0 };
          const ecs=nodes.map(n=>({ r:n.R*(1+EM), node:n }));
          return { ecs, topR:cp_packEnclose(ecs), total:nodes.reduce((a,n)=>a+n.total,0) };
        };
        const packs=cols.map(c=>packStage(c));
        if(packs.some(p=>p.ecs.length)){
          const NS2=cols.length, cellW=CW/NS2, cyc=(CH-LABH)/2;
          // COMMON scale across every stage: one scale factor, derived from the largest stage's
          // pack, is shared by all cells. Because every subtype radius is sqrt(count), a fixed
          // scale means a circle's rendered AREA is proportional to its quote count in EVERY
          // cell — a subtype with the same count draws the same size at any stage, so size is
          // directly comparable left→right. The biggest stage fills its cell; smaller stages
          // render proportionally smaller (rather than each stage stretching to fill its cell).
          const maxTopR=Math.max(...packs.map(p=>p.topR||1e-9));
          const s=Math.min(cellW*0.98, (CH-LABH)*0.98)/(2*maxTopR);
          const els=[];
          const topLabels=[];   // entity names floated OUTSIDE small bubbles: drawn last, decluttered
          const drawNode=(ec,cx,idp,dim,on,stageLabel,stageTot)=>{
            const n=ec.node, ex=cx+ec.x*s, ey=cyc+ec.y*s, eR=n.R*s;
            const pctOf=(v)=> stageTot? ' ('+(100*v/stageTot).toFixed(1)+'% of '+stageLabel+' quotes)' : '';
            els.push(h('circle',{key:'e'+idp,cx:ex.toFixed(1),cy:ey.toFixed(1),r:eR.toFixed(1),
              fill:n.color,fillOpacity:dim?0.04:0.09,stroke:n.color,strokeOpacity:dim?0.3:(on?1:0.75),strokeWidth:on?2.4:1.3,
              style:{cursor:'pointer'},onClick:()=>this.pickFam(n.key),
              onMouseEnter:()=>this.setState({hover:{circ:true,color:n.color,label:n.label,l1:stageLabel+' · type · '+n.circ.length+' subtype'+(n.circ.length===1?'':'s'),l2:n.total+' quotes'+pctOf(n.total)+' · area ∝ quotes (common scale)'}})}));
            n.circ.forEach((cc,ci)=>{
              const kx=ex+cc.x*s, ky=ey+cc.y*s, kr=(cc.r/(1+GAPF))*s, rem=cc.data.remainder;
              // sub-bubble display name: cluster text with the leading entity/type word stripped
              // (same rule the visible bubble label uses), so the tooltip matches the bubble name.
              const _lw=String(cc.data.text||'').split(/\s+/);
              const kName=rem?'other / unclustered':((_lw.length>1 && _lw[0].toLowerCase()===String(n.label).toLowerCase())?_lw.slice(1).join(' '):cc.data.text);
              els.push(h('circle',{key:'k'+idp+'_'+ci,cx:kx.toFixed(1),cy:ky.toFixed(1),r:Math.max(1,kr).toFixed(1),
                fill:rem?'#9E9C95':n.color,fillOpacity:dim?0.1:(rem?0.3:0.55),stroke:'#FBFAF8',strokeWidth:0.7,
                style:{cursor:'pointer'},onClick:()=>this.pickFam(n.key),
                onMouseEnter:()=>this.setState({hover:{circ:true,color:rem?'#9E9C95':n.color,label:kName,l1:n.label+' · '+stageLabel+(rem?' · subtype (unclustered)':' · subtype'),l2:cc.data.val+' quote'+(cc.data.val===1?'':'s')+pctOf(cc.data.val)+' · area ∝ quotes (common scale)'}})}));
              if(kr>=15 && !dim){
                const lbl=rem?'other':kName;
                const fs=Math.min(13,Math.max(8,kr*0.26));
                const cpl=Math.max(4,Math.floor(kr*1.5/(fs*0.53)));
                const mxl=Math.max(1,Math.min(4,Math.floor(kr*1.55/(fs*1.12))));
                const lines=cp_wrap(lbl,cpl,mxl), lh=fs*1.12, y0=ky-(lines.length-1)*lh/2+fs*0.34;
                lines.forEach((ln,li)=> els.push(h('text',{key:'kl'+idp+'_'+ci+'_'+li,x:kx.toFixed(1),y:(y0+li*lh).toFixed(1),textAnchor:'middle',
                  style:{font:'600 '+fs.toFixed(1)+'px "Spline Sans",sans-serif',fill:rem?'#54534E':'#26261F',paintOrder:'stroke',stroke:'#FBFAF8',strokeWidth:'2.2px',pointerEvents:'none'}},ln))); }
            });
            // every entity bubble always shows its name. Big circle: label inside near the top.
            // Small circle: defer to topLabels so it is drawn last (on top of every bubble) with a
            // pill background + collision declutter, instead of hiding under neighbouring data.
            const elFs=Math.min(13,Math.max(9,eR*0.18));
            if(eR>=24){
              els.push(h('text',{key:'el'+idp,x:ex.toFixed(1),y:(ey-eR+13).toFixed(1),textAnchor:'middle',
                style:{font:'700 '+elFs.toFixed(1)+'px "Spline Sans",sans-serif',fill:dim?'#B7B5AE':n.color,paintOrder:'stroke',stroke:'#F6F5F2',strokeWidth:'3px',pointerEvents:'none',cursor:'pointer'},onClick:()=>this.pickFam(n.key)},n.label));
            } else {
              topLabels.push({id:idp,fkey:n.key,x:ex,y:ey-eR-4,text:n.label,color:n.color,dim:dim,fs:elFs});
            }
          };
          packs.forEach((p,pi)=>{
            const stg=cols[pi], cx=cellW*pi+cellW/2;
            if(pi>0) els.push(h('line',{key:'dv'+pi,x1:(cellW*pi).toFixed(1),x2:(cellW*pi).toFixed(1),y1:6,y2:(CH-LABH-2).toFixed(1),stroke:'#ECEAE4',strokeWidth:1}));
            p.ecs.slice().sort((a,b)=>b.node.R-a.node.R).forEach(ec=>{ const on=st.selFam===ec.node.key, dim=st.selFam&&!on; drawNode(ec,cx,pi+'_'+ec.node.key,dim,on,COLLBL[stg],p.total); });
            const slab=cp_wrap(COLLBL[stg], Math.max(8,Math.floor(cellW/6.4)), 2);
            slab.forEach((ln,li)=> els.push(h('text',{key:'sl'+pi+'_'+li,x:cx.toFixed(1),y:(CH-LABH+15+li*12.5).toFixed(1),textAnchor:'middle',
              style:{font:(STAGES[stg].is_reference?'600 ':'700 ')+'11.5px "Spline Sans",sans-serif',fill:STAGES[stg].is_reference?'#8A8780':'#33332E'}},ln)));
            els.push(h('text',{key:'sn'+pi,x:cx.toFixed(1),y:(CH-6).toFixed(1),textAnchor:'middle',
              style:{font:'10px "Spline Sans Mono",monospace',fill:'#A6A49D'}}, p.total+' quotes'));
          });
          // draw the outside-the-bubble entity names last, on top of every bubble, each on an
          // opaque pill; nudge colliding pills upward so the names never overlap other data.
          if(topLabels.length){
            topLabels.sort((a,b)=>a.x-b.x || a.y-b.y);
            const placed=[];
            topLabels.forEach(tl=>{
              const w=Math.max(16, tl.text.length*tl.fs*0.56)+8, hgt=tl.fs+5;
              let cy=Math.max(tl.fs+2, tl.y);
              for(let it=0; it<60; it++){
                const x0=tl.x-w/2, x1=tl.x+w/2, y0=cy-hgt, y1=cy+3;
                if(!placed.some(q=> x0<q.x1 && x1>q.x0 && y0<q.y1 && y1>q.y0)) break;
                cy-=hgt*0.92; if(cy<tl.fs+2){ cy=tl.fs+2; break; }
              }
              const x0=tl.x-w/2, x1=tl.x+w/2, y0=cy-hgt, y1=cy+3;
              placed.push({x0,x1,y0,y1});
              els.push(h('rect',{key:'elbg'+tl.id,x:x0.toFixed(1),y:(cy-tl.fs).toFixed(1),width:w.toFixed(1),height:(tl.fs+4).toFixed(1),rx:3,
                fill:'#FFFFFF',fillOpacity:0.9,stroke:tl.dim?'#E4E2DC':tl.color,strokeOpacity:0.4,strokeWidth:0.8,
                style:{cursor:'pointer'},onClick:()=>this.pickFam(tl.fkey)}));
              els.push(h('text',{key:'ellb'+tl.id,x:tl.x.toFixed(1),y:cy.toFixed(1),textAnchor:'middle',
                style:{font:'700 '+tl.fs.toFixed(1)+'px "Spline Sans",sans-serif',fill:tl.dim?'#B7B5AE':tl.color,pointerEvents:'none'}},tl.text));
            });
          }
          flowChart=h('svg',{viewBox:'0 0 '+CW+' '+CH,preserveAspectRatio:'xMidYMid meet',onMouseMove:this.onFlowMove,
            style:{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}},els);
          flowTitle='Type & subtype composition across the lineage';
          flowSub='one circle-pack per stage (left→right) · circle = TYPE, inner = SUBTYPE (grey = unclustered) · area ∝ quotes, common scale across stages (hover for counts) · N per stage below · '+scopeShort;
        }
      } else if(txRateMode){
        // ----- Tx% grouped bars: one bar PER FAMILY per stage, NOT stacked. Tx% is independent
        // per family (a transcript can match more than one), so it can't be summed into a
        // stacked TYPE segment the way share/rate can — mirrors the top flow chart's Tx% layout.
        const W2=1320, H2=560, top=18, bot=64, axX=64, plotR=1298, ph2=H2-top-bot, baseY2=top+ph2;
        const N=cols.length;
        const nf=order.length||1;
        // Reserve room for half a group at each edge so the outer groups aren't crushed against
        // the axis (the old xL hugged it, forcing ~3px bars). Group width then uses most of the
        // inter-column spacing.
        const gHalf=Math.min(150,(plotR-axX-40)/2);
        const xL=axX+20+gHalf, xR=plotR-14-gHalf, cxOf=(k)=> N===1?(xL+xR)/2 : xL + k/(N-1)*(xR-xL);
        let gspace=xR-xL; for(let k=1;k<N;k++) gspace=Math.min(gspace, Math.abs(cxOf(k)-cxOf(k-1)));
        const GW=Math.min(2*gHalf, 46*nf+16, 0.82*gspace);
        const innerGap=Math.max(2, Math.min(10, 90/nf));
        const bw2=Math.max(6,(GW-innerGap*(nf-1))/nf);
        if(cols.some(c=>hasDataEff(c))){
          const els=[];
          [0,0.25,0.5,0.75,1].forEach((t,i)=>{ const y=baseY2 - t*ph2;
            els.push(h('line',{key:'yg'+i,x1:axX,x2:plotR,y1:y.toFixed(1),y2:y.toFixed(1),stroke:'#ECEAE4',strokeWidth:1,strokeDasharray:i?'2 5':'none'}));
            els.push(h('text',{key:'yl'+i,x:(axX-8).toFixed(1),y:(y+3).toFixed(1),textAnchor:'end',style:{font:'10px "Spline Sans Mono",monospace',fill:'#A6A49D'}}, Math.round(t*100)+'%')); });
          els.push(h('text',{key:'yt',transform:'translate(16,'+(top+ph2/2)+') rotate(-90)',textAnchor:'middle',style:{font:'9.5px "Spline Sans Mono",monospace',fill:'#B7B5AE',letterSpacing:'.1em'}}, '% TRANSCRIPTS W/ FAMILY QUOTE'));
          cols.forEach((c,k)=>{
            const cx=cxOf(k), stageLabel=COLLBL[c], dataHere=hasDataEff(c);
            if(dataHere){ order.forEach((f,fi)=>{
              const rt=EWTXRATE[f.key][c], hgt=(rt/AXR_TXFAM)*ph2;
              const x=cx-GW/2+fi*(bw2+innerGap), dim=st.selFam&&st.selFam!==f.key;
              els.push(h('rect',{key:'tb'+c+f.key,x:x.toFixed(1),y:(baseY2-hgt).toFixed(1),width:bw2.toFixed(1),height:Math.max(1,hgt).toFixed(1),
                fill:col(f.key),opacity:dim?0.16:0.92,rx:1.5,style:{cursor:'pointer'},onClick:()=>this.pickFam(f.key),
                onMouseEnter:()=>this.setState({hover:{circ:true,color:col(f.key),label:f.label,l1:stageLabel+' · type',l2:fmtPct(rt)+' of transcripts have a '+f.label.toLowerCase()+' quote'}})})); }); }
            const slab=cp_wrap(stageLabel, 18, 2);
            slab.forEach((ln,li)=> els.push(h('text',{key:'sx'+k+'_'+li,x:cx.toFixed(1),y:(baseY2+17+li*12).toFixed(1),textAnchor:'middle',style:{font:(STAGES[c].is_reference?'600 ':'700 ')+'11.5px "Spline Sans",sans-serif',fill:STAGES[c].is_reference?'#8A8780':'#33332E'}},ln)));
            els.push(h('text',{key:'sc'+k,x:cx.toFixed(1),y:(baseY2+17+slab.length*12).toFixed(1),textAnchor:'middle',style:{font:'10px "Spline Sans Mono",monospace',fill:'#A6A49D'}}, dataHere?('n='+(SAMP[c]||0)+' tx'):'no data'));
          });
          flowChart=h('svg',{viewBox:'0 0 '+W2+' '+H2,preserveAspectRatio:'xMidYMid meet',onMouseMove:this.onFlowMove,
            style:{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}},els);
          flowTitle='Transcript coverage by family';
          flowSub='one group of bars per stage · height = % of transcripts with ≥1 quote in that family (equal-weighted across benchmarks) · independent per family, bars do not sum · '+scopeShort;
        }
      } else {
        // ----- nested stacked bars: one bar per stage; TYPE segments, SUBTYPE sub-slices -----
        const W2=1320, H2=560, top=18, bot=64, axX=64, plotR=1298, ph2=H2-top-bot, baseY2=top+ph2;
        const share = measure==='share';
        const stages2=cols.map(si=>{
          const fams=order.map(f=>{ const {total}=subList(f,si); return { key:f.key, color:col(f.key), label:f.label, total }; }).filter(x=>x.total>0);
          return { si, fams, tot:fams.reduce((a,x)=>a+x.total,0), den:SAMP[si]||0 };
        });
        if(stages2.some(s=>s.tot>0)){
          const N=cols.length;
          const metric=(s)=> share?1 : (s.den? s.tot/s.den : s.tot);
          const axMax = share?1 : niceCeil(Math.max(...stages2.map(metric),1e-9));
          const hOf=(s,cnt)=> share? (s.tot? cnt/s.tot : 0)*ph2 : ((s.den? cnt/s.den : 0)/axMax)*ph2;
          const xL=axX+34, xR=plotR-90, cxOf=(k)=> N===1?(xL+xR)/2 : xL + k/(N-1)*(xR-xL);
          const barW=Math.min(130, Math.max(26, (N>1?(xR-xL)/(N-1):xR-xL)*0.46));
          const els=[];
          [0,0.25,0.5,0.75,1].forEach((t,i)=>{ const y=baseY2 - t*ph2;
            els.push(h('line',{key:'yg'+i,x1:axX,x2:plotR,y1:y.toFixed(1),y2:y.toFixed(1),stroke:'#ECEAE4',strokeWidth:1,strokeDasharray:i?'2 5':'none'}));
            els.push(h('text',{key:'yl'+i,x:(axX-8).toFixed(1),y:(y+3).toFixed(1),textAnchor:'end',style:{font:'10px "Spline Sans Mono",monospace',fill:'#A6A49D'}}, share?Math.round(t*100)+'%':(+(t*axMax).toFixed(2)).toString())); });
          els.push(h('text',{key:'yt',transform:'translate(16,'+(top+ph2/2)+') rotate(-90)',textAnchor:'middle',style:{font:'9.5px "Spline Sans Mono",monospace',fill:'#B7B5AE',letterSpacing:'.1em'}}, share?'SHARE OF STAGE':'QUOTES / TRANSCRIPT'));
          // pass 1: per-stage TYPE segment extents (top/bottom y per family) — for the flow ribbons.
          const layout=stages2.map((s,k)=>{ const cx=cxOf(k); let y=baseY2; const segs=new Map();
            s.fams.forEach(fm=>{ const segH=hOf(s,fm.total); segs.set(fm.key,{y0:y-segH,y1:y,total:fm.total,label:fm.label}); y-=segH; });
            return { cx, segs }; });
          // pass 2: FLOW ribbons between consecutive (non-reference) stages, one band per TYPE,
          // drawn behind the bars so each type visibly flows stage→stage like the top chart.
          const ribbon=(x1,a0,a1,x2,b0,b1)=>{ const mx=(x1+x2)/2; return `M${x1},${a0} C${mx},${a0} ${mx},${b0} ${x2},${b0} L${x2},${b1} C${mx},${b1} ${mx},${a1} ${x1},${a1} Z`; };
          const ribOp2=Math.min(0.5, ribOp+0.16);   // bars-view ribbons read a touch stronger
          for(let k=0;k+1<stages2.length;k++){
            if(STAGES[cols[k]].is_reference || STAGES[cols[k+1]].is_reference) continue;
            const A=layout[k], B=layout[k+1];
            order.forEach(f=>{ const a=A.segs.get(f.key), b=B.segs.get(f.key); if(!a||!b) return;
              if((a.y1-a.y0)<0.5 && (b.y1-b.y0)<0.5) return;
              const dim=st.selFam&&st.selFam!==f.key;
              // tuck the ribbon ends ~2px UNDER each bar so the flow is visibly continuous with the
              // segment (no anti-aliased seam at the exact bar edge that reads as an offset).
              els.push(h('path',{key:'rb'+k+'_'+f.key,d:ribbon(A.cx+barW/2-2,a.y0,a.y1,B.cx-barW/2+2,b.y0,b.y1),
                fill:col(f.key),opacity:dim?ribOp2*0.25:ribOp2,stroke:'none',style:{cursor:'pointer'},
                onClick:()=>this.pickFam(f.key),
                onMouseEnter:()=>this.setState({hover:{circ:true,color:col(f.key),label:a.label,l1:COLLBL[cols[k]]+' → '+COLLBL[cols[k+1]]+' · flow',l2:a.total+' → '+b.total+' quotes · type carried across stages'}})})); });
          }
          // pass 3: bars — one solid segment per TYPE with the floating hover tooltip (matches the bubble chart).
          stages2.forEach((s,k)=>{
            const cx=cxOf(k), stageLabel=COLLBL[cols[k]]; let y=baseY2;
            s.fams.forEach(fm=>{
              const segH=hOf(s,fm.total), dim=st.selFam&&st.selFam!==fm.key;
              els.push(h('rect',{key:'b'+k+'_'+fm.key,x:(cx-barW/2).toFixed(1),y:(y-segH).toFixed(1),width:barW.toFixed(1),height:Math.max(0.4,segH).toFixed(1),
                fill:fm.color,fillOpacity:dim?0.16:0.88,stroke:'#FBFAF8',strokeWidth:0.6,
                style:{cursor:'pointer'},onClick:()=>this.pickFam(fm.key),
                onMouseEnter:()=>this.setState({hover:{circ:true,color:fm.color,label:fm.label,l1:stageLabel+' · type',l2:fm.total+' quote'+(fm.total===1?'':'s')+(s.tot?' ('+(100*fm.total/s.tot).toFixed(1)+'% of stage)':'')}})}));
              y-=segH;
            });
            const slab=cp_wrap(COLLBL[cols[k]], 18, 2);
            slab.forEach((ln,li)=> els.push(h('text',{key:'sx'+k+'_'+li,x:cx.toFixed(1),y:(baseY2+17+li*12).toFixed(1),textAnchor:'middle',style:{font:(STAGES[cols[k]].is_reference?'600 ':'700 ')+'11.5px "Spline Sans",sans-serif',fill:STAGES[cols[k]].is_reference?'#8A8780':'#33332E'}},ln)));
            els.push(h('text',{key:'sc'+k,x:cx.toFixed(1),y:(baseY2+17+slab.length*12).toFixed(1),textAnchor:'middle',style:{font:'10px "Spline Sans Mono",monospace',fill:'#A6A49D'}}, s.tot+' quotes'));
          });
          const last=stages2[stages2.length-1];
          if(last){ let yl=baseY2; const lx=(cxOf(N-1)+barW/2+10);
            last.fams.forEach(fm=>{ const segH=hOf(last,fm.total);
              if(segH>=13){ const dim=st.selFam&&st.selFam!==fm.key;
                els.push(h('text',{key:'fl'+fm.key,x:lx.toFixed(1),y:(yl-segH/2+3.5).toFixed(1),textAnchor:'start',style:{font:'600 11px "Spline Sans",sans-serif',fill:dim?'#B7B5AE':fm.color,cursor:'pointer'},onClick:()=>this.pickFam(fm.key)},fm.label)); }
              yl-=segH; }); }
          flowChart=h('svg',{viewBox:'0 0 '+W2+' '+H2,preserveAspectRatio:'xMidYMid meet',onMouseMove:this.onFlowMove,
            style:{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}},els);
          flowTitle='Type composition across the lineage';
          flowSub='stacked bars per stage · segments = TYPES · ribbons trace each type stage→stage · '+(share?'each stage = 100%':'height = quotes / transcript, common scale')+' · hover for counts · '+scopeShort;
        }
      }
    }
    const compView = st.compView || 'bars';
    const compViewChips=[{k:'bars',label:'Stacked bars'},{k:'circles',label:'Circle pack'}].map(o=>({
      label:o.label, onClick:()=>this.setCompView(o.k),
      style: chipBase + (compView===o.k ? 'background:#2C6E63;color:#fff;border:1px solid #2C6E63;font-weight:600' : 'background:#FFFFFF;color:#54534E;border:1px solid #E0DDD5') }));

    // ---------- tooltip ----------
    let hoverInfo='';
    if(st.selFam){ const f=T.families.find(x=>x.key===st.selFam); hoverInfo='selected · '+f.label; }
    let tipShow=false,tipX=0,tipY=0,tipTransform='translate(14px,14px)',tipColor='#888',tipLabel='',tipLine1='',tipLine2='';
    if(st.hover){
      tipShow=true; tipX=st.hx; tipY=st.hy;
      const flipX=st.hx>(st.hw-200), flipY=st.hy>(st.hh-66);
      tipTransform='translate('+(flipX?'calc(-100% - 14px)':'14px')+', '+(flipY?'calc(-100% - 14px)':'14px')+')';
      if(st.hover.circ){ tipColor=st.hover.color; tipLabel=st.hover.label; tipLine1=st.hover.l1; tipLine2=st.hover.l2; }
      else {
      const f=T.families.find(x=>x.key===st.hover.f);
      tipColor=col(f.key); tipLabel=f.label;
      if(st.hover.ribbon){ tipLine1='carries across the lineage'; tipLine2=scopeShort; }
      else { const c=st.hover.c; tipLine1=COLLBL[c]+(STAGES[c].is_reference?' · reference':' · stage');
        tipLine2 = rateMode
          ? (hasDataEff(c)? (fmtRate(EWRATE[f.key][c])+' /tx  ·  n='+EFF[f.key][c]) : 'no responses')
          : txRateMode
          ? (hasDataEff(c)? fmtPct(EWTXRATE[f.key][c])+' of transcripts have a '+f.label.toLowerCase()+' quote' : 'no data')
          : ('n='+EFF[f.key][c]+'   ·   '+fmtPct(EFF[f.key][c]/(TOT[c]||1))+' of stage'); }
      }
    }

    // ---------- detail panel ----------
    const selFamObj = st.selFam ? T.families.find(f=>f.key===st.selFam) : null;
    let detRows=[], detBench=[], detQuotes=[], detQuoteGroups=[], stageChips=[], detClass=[], detImpls=[], detImplsPanel=null, selName='', selKicker='', selColor='#888', quoteCount='', moreQuotes='', implFilterChip=null;
    if(selFamObj){
      selColor=col(selFamObj.key);
      selName=selFamObj.label;
      const ec=EFF[selFamObj.key], sTot=lin.reduce((s,c)=>s+(ec[c]||0),0);
      // VEA share of this family (eval_aware quotes / VEA-labeled quotes across lineage). Omitted
      // under veaOnly since sTot is already VEA-restricted (the ratio would be a tautological 100%).
      const _vL=(selFamObj.veaLabeled||[]).reduce((a,b)=>a+b,0), _vE=(selFamObj.veaCount||[]).reduce((a,b)=>a+b,0);
      selKicker=sTot+' quotes across lineage · '+scopeShort+((_vL&&!veaOnly)?' · '+Math.round(_vE/_vL*100)+'% VEA (of '+_vL+' labeled)':'');
      const famMaxRate=Math.max(...cols.map(c=>EWRATE[selFamObj.key][c]),1e-9);
      const famMaxTxRate=Math.max(...cols.map(c=>EWTXRATE[selFamObj.key][c]),1e-9);
      detRows=cols.map(c=>{ const cnt=ec[c], shr=cnt/(TOT[c]||1), rr=EWRATE[selFamObj.key][c], tr=EWTXRATE[selFamObj.key][c];
        const big = share?fmtPct(shr): rateMode?(hasDataEff(c)?fmtRate(rr)+' /tx':'—'): txRateMode?(hasDataEff(c)?fmtPct(tr):'—') : String(cnt);
        const small = rateMode?('n='+cnt) : txRateMode?('n='+cnt) : share?('n='+cnt):fmtPct(shr);
        const bw = share?Math.min(1,shr) : rateMode?(rr/famMaxRate) : txRateMode?(tr/famMaxTxRate) : Math.min(1,shr);
        return { label:COLLBL[c], big, small, barW:(bw*100).toFixed(1)+'%', lblColor:STAGES[c].is_reference?'#A6A49D':'#46453F', barDash:STAGES[c].is_reference?'background-image:repeating-linear-gradient(90deg,'+selColor+' 0 5px,transparent 5px 8px);':'' }; });
      // eval-class makeup of this family per checkpoint (capability / safety / natural)
      const _evCat={}; T.evals.forEach(e=>_evCat[e.key]=e.cat);
      const _esD = evals || T.evals.map(e=>e.key);
      const _classSrc = veaOnly ? (selFamObj.veaByEval||{}) : selFamObj.byEval;
      detClass=cols.map(c=>{ const by={capability:0,safety:0,natural:0};
        _esD.forEach(k=>{ const a=_classSrc[k]; if(a) by[_evCat[k]] += (a[c]||0); });
        const tt=by.capability+by.safety+by.natural;
        return { label:COLLBL[c], total:tt, lblColor:STAGES[c].is_reference?'#A6A49D':'#46453F',
          segs:T.catOrder.filter(cl=>by[cl]>0).map(cl=>({ w:(by[cl]/tt*100).toFixed(2)+'%', color:this.CAT[cl], lbl:(T.catLabel[cl]||cl)+': '+by[cl] })) }; });
      // implication CLUSTER trajectories (schema 2): each cluster's per-stage rate across
      // the lineage, so you can read how it grows/shrinks through post-training. rate =
      // quotes / gradeable transcripts at that stage (T.stageSamples, pooled across
      // benchmarks — the same denominator the flow chart uses). Shared 0-based y-scale to
      // the entity's peak rate so a small cluster reads as HONESTLY small (not auto-scaled
      // per cluster); the trend arrow + total count keep the trajectory legible even when a
      // small cluster's line is nearly flat. Native <title> gives exact per-stage values.
      // scope-aware: per-eval counts when a benchmark filter is active, else pooled per-stage.
      const _svAt=(im,c)=> this.implValAt(im,c,evals);
      const _denAt=(c)=> evals ? evals.reduce((a,e)=>a+((T.sampleTotals[e]||[])[c]||0),0) : ((T.stageSamples||[])[c]||0);
      // strip the leading entity name so these titles read like the bubble labels (which drop
      // the first word when it repeats the type/entity name); e.g. "Source Expected Answer" -> "Expected Answer".
      const _stripFam=(s)=>{ const lw=String(s).split(/\s+/); return (lw.length>1 && lw[0].toLowerCase()===String(selFamObj.label).toLowerCase())?lw.slice(1).join(' '):s; };
      const implItems=(selFamObj.implications||[]).map(im=>{
        const cs=cols.map(c=>_svAt(im,c));                 // per-VISIBLE-stage (aligned to cols), scope-aware
        const total=cs.reduce((a,v)=>a+v,0);
        const rates=cols.map((c,k)=>{ const d=_denAt(c); return d?cs[k]/d:0; });
        return { text:im.text, disp:_stripFam(im.text), total, cs, rates };
      }).filter(x=>x.total>0).sort((a,b)=>b.total-a.total).slice(0,14);
      detImpls=implItems;   // truthiness guard for the template section
      if(implItems.length){
        const nPts=cols.length;
        const SW=86, SH=22, PADX=3, PADY=3, plotH=SH-2*PADY, sBase=SH-PADY;
        const implPeak=Math.max(...implItems.flatMap(x=>x.rates),1e-9);
        const xAt=(k)=> nPts<=1?SW/2: PADX+(k/(nPts-1))*(SW-2*PADX);
        const yAt=(r)=> sBase-(r/implPeak)*plotH;
        const mkSpark=(item)=>{
          const pts=item.rates.map((r,k)=>[xAt(k),yAt(r)]);
          const line=pts.map((p,k)=>(k?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
          const kids=[];
          if(nPts>1){ const area=line+' L'+xAt(nPts-1).toFixed(1)+' '+sBase+' L'+xAt(0).toFixed(1)+' '+sBase+' Z';
            kids.push(h('path',{key:'a',d:area,fill:selColor,opacity:0.12,stroke:'none'}));
            kids.push(h('path',{key:'l',d:line,fill:'none',stroke:selColor,strokeWidth:1.5,strokeLinejoin:'round',strokeLinecap:'round'})); }
          pts.forEach((p,k)=>{ const last=k===nPts-1;
            kids.push(h('circle',{key:'c'+k,cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:last?2.4:1.5,fill:last?selColor:'#FFFFFF',stroke:selColor,strokeWidth:1})); });
          kids.push(h('title',{key:'ti'},selFamObj.label+' · '+item.disp+'\n'+cols.map((c,k)=>COLLBL[c]+': '+item.cs[k]+' quotes ('+item.rates[k].toFixed(3)+'/tx)').join('\n')));
          return h('svg',{width:SW,height:SH,viewBox:'0 0 '+SW+' '+SH,style:{display:'block',flex:'none',overflow:'visible'}},kids);
        };
        const rows=implItems.map((item,ii)=>{
          let arrow='',aColor='#B7B5AE';
          if(nPts>1){ const dv=item.rates[nPts-1]-item.rates[0];
            if(Math.abs(dv)<1e-9){arrow='→';} else if(dv>0){arrow='▲';aColor=selColor;} else {arrow='▼';aColor='#B0ADA6';} }
          const on=st.implFilter===item.text;
          return h('div',{key:'ir'+ii,onClick:()=>this.setImplFilter(item.text),
            style:{display:'flex',alignItems:'center',gap:'7px',padding:'2px 6px',borderRadius:'5px',cursor:'pointer',background:on?'#EAF1EF':'transparent',boxShadow:on?('inset 2px 0 0 '+selColor):'none'}},[
            h('span',{key:'t',title:item.disp,style:{flex:'1 1 auto',minWidth:0,fontSize:'11px',lineHeight:1.25,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',wordBreak:'break-word',fontWeight:on?600:400}},item.disp),
            mkSpark(item),
            h('span',{key:'n',style:{flex:'none',width:'22px',textAlign:'right',fontFamily:"'Spline Sans Mono',monospace",fontSize:'9.5px',color:'#93918B',fontVariantNumeric:'tabular-nums'}},String(item.total)),
            h('span',{key:'a',style:{flex:'none',width:'11px',textAlign:'center',fontFamily:"'Spline Sans Mono',monospace",fontSize:'10px',color:aColor}},arrow),
          ]);
        });
        const ends = nPts<=1 ? ('single stage: '+COLLBL[cols[0]]) : ('left→right: '+COLLBL[cols[0]]+' → '+COLLBL[cols[nPts-1]]);
        const cap = (st.implFilter?'click a cluster again to clear the filter':'click a cluster to filter the quotes below')+' · '+ends+' · rate = quotes/transcript, shared scale (peak '+implPeak.toFixed(3)+'/tx) · pooled across benchmarks';
        detImplsPanel=h('div',{},[
          h('div',{key:'rows',style:{display:'flex',flexDirection:'column',gap:'3px'}},rows),
          h('div',{key:'cap',style:{fontFamily:"'Spline Sans Mono',monospace",fontSize:'9px',lineHeight:1.5,color:'#B7B5AE',marginTop:'8px'}},cap),
        ]);
      }
      // benchmark mix for this family (lineage counts), all benchmarks regardless of scope
      const mix=T.evals.map(e=>{ const a=_classSrc[e.key]; const n=a?lin.reduce((s,c)=>s+(a[c]||0),0):0; return {e, n}; }).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
      const mixMax=Math.max(...mix.map(x=>x.n),1);
      detBench=mix.map(({e,n})=>{ const active=st.scope==='eval:'+e.key; return { label:e.label, count:n, color:selColor, barW:Math.max(4,(n/mixMax)*90).toFixed(0)+'px',
        onClick:()=>this.setScope('eval:'+e.key),
        rowStyle:'display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;cursor:pointer;'+(active?'background:#EFEDE7;':'') }; });
      // quotes filtered by scope (eval) + stage + implication cluster (click a cluster row above)
      // + veaOnly (exact per-quote filter, since q.vea is set on the individual quote object)
      const inScope=(q)=> !evals || q.ev.some(e=>evals.includes(e));
      let src=(selFamObj.quotes||[]).filter(inScope);
      if(veaOnly) src=src.filter(q=>q.vea==='eval_aware');
      if(st.implFilter) src=src.filter(q=>q.impl===st.implFilter);
      const filt = st.qStage==='all' ? src : src.filter(q=>q.cols.includes(st.qStage));
      const badgeStyle=(c)=> STAGES[c].is_reference
        ? 'font-family:\'Spline Sans Mono\',monospace;font-size:8.5px;font-weight:600;letter-spacing:.04em;color:#8A8780;border:1px solid #D4D1CA;padding:1px 5px;border-radius:3px'
        : 'font-family:\'Spline Sans Mono\',monospace;font-size:8.5px;font-weight:600;letter-spacing:.04em;color:#3A4A45;background:#E4ECE9;padding:1px 5px;border-radius:3px';
      const elabel=(k)=>{ const e=T.evals.find(x=>x.key===k); return e?e.label:k; };
      // VEA badge (purple) on eval_aware quotes; shows the 0-100 accuracy when present.
      const veaBadgeStyle='font-family:\'Spline Sans Mono\',monospace;font-size:8.5px;font-weight:700;letter-spacing:.04em;color:#7A3E9A;background:#F0E6F7;padding:1px 5px;border-radius:3px';
      const hasTx=(tk)=> !!(T.transcripts && tk && (tk in T.transcripts));
      const mapQ=(q)=>{ const showEv = evals ? q.ev.filter(e=>evals.includes(e)) : q.ev; const ev0=showEv[0]||q.ev[0];
        const badges=q.cols.filter(c=>c<NS).map(c=>({ label:COLLBL[c], style:badgeStyle(c) }));
        if(q.vea==='eval_aware') badges.push({ label:(q.acc!=null?'VEA '+q.acc:'VEA'), style:veaBadgeStyle });
        const tx=hasTx(q.tk);
        return { t:q.t, oq:q.oq||'', cw:q.cw||'', impl:q.impl||'', evLabel: elabel(ev0)+(showEv.length>1?' +'+(showEv.length-1):''), catColor:T.catColor[q.c]||'#999',
          badges, hasTx:tx, txHint: tx?'view transcript ↗':'',
          onClick: tx?(()=>this.showTx(q.tk,q.t,q.oq||q.t,selFamObj.label,q.cw||'')):(()=>{}),
          rowCursor: tx?'pointer':'default' }; };
      // group example verbalizations into a subsection per implication CLUSTER within this
      // family (same clusters as the trajectory list above); strip the leading entity word
      // from the heading like the bubble labels.
      const _catName=(c)=>{ const lw=String(c).split(/\s+/); return (lw.length>1 && lw[0].toLowerCase()===String(selFamObj.label).toLowerCase())?lw.slice(1).join(' '):c; };
      const gmap=new Map();
      filt.forEach(q=>{ let raw=(q.impl||'').trim(); if(!raw) raw='__other__';
        if(!gmap.has(raw)) gmap.set(raw,[]); gmap.get(raw).push(q); });
      const PERCAT=6;
      detQuoteGroups=[...gmap.entries()]
        .map(([k,qs])=>({ key:k, name:k==='__other__'?'Other / unclustered':_catName(k), n:qs.length, quotes:qs }))
        .sort((a,b)=> (a.key==='__other__'?1:0)-(b.key==='__other__'?1:0) || b.n-a.n)
        .map(g=>({ cat:g.name, count:g.n+(g.n===1?' quote':' quotes'), quotes:g.quotes.slice(0,PERCAT).map(mapQ),
                   more: g.n>PERCAT?('+ '+(g.n-PERCAT)+' more in this category'):'' }));
      detQuotes=filt.slice(0,16).map(mapQ);   // retained for compatibility; template renders groups
      moreQuotes='';
      quoteCount = filt.length+' quotes · '+detQuoteGroups.length+' categor'+(detQuoteGroups.length===1?'y':'ies')+(st.qStage==='all'?'':' · '+COLLBL[st.qStage]);
      if(st.implFilter) implFilterChip={ label:'✕ '+_catName(st.implFilter), onClick:()=>this.setImplFilter(st.implFilter),
        style:'display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:\'Spline Sans Mono\',monospace;font-size:10px;font-weight:600;padding:4px 10px;border-radius:999px;cursor:pointer;border:1px solid '+selColor+';background:'+selColor+';color:#fff;text-align:left' };
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

    // ---------- "VEA only" whole-view toggle ----------
    const veaAllBtnStyle = !veaOnly?onStyle:offStyle, veaOnlyBtnStyle = veaOnly?onStyle:offStyle;
    const veaScopeHint = veaOnly
      ? 'Every count, rate, chart, quote, and transcript above is restricted to eval-aware (VEA) verbalizations. VEA coverage is partial across models/benchmarks — "no data" (above) means unjudged, not necessarily zero.'
      : 'VEA = the model verbalizes awareness it may be evaluated/graded, a subset of metagaming. Switch to restrict the whole view to VEA-positive quotes and transcripts only.';

    // ---------- benchmark description (shown when a single benchmark is selected) ----------
    let benchDescShow=false, benchDescTag='', benchDescText='', benchDescUrl='';
    if(st.scope.startsWith('eval:')){ const d=this.BENCHDESC[st.scope.slice(5)]; if(d){ benchDescShow=true; benchDescTag=d.tag; benchDescText=d.desc; benchDescUrl=d.src; } }

    // ---------- model-group selector (the "set" dropdown, as a segmented control) ----------
    const GROUPS=[{k:'all',label:'All models'}];
    if(LIN.length) GROUPS.push({k:'lineage',label:LMETA.groupLabel||'OLMo lineage'});
    if(REF.length) GROUPS.push({k:'reference',label:'Reference'});
    const modelGroupChips = GROUPS.map(g=>({ label:g.label, onClick:()=>this.setModelGroup(g.k),
      style: chipBase + ((st.modelGroup||'all')===g.k
        ? 'background:#2C6E63;color:#fff;border:1px solid #2C6E63;font-weight:600'
        : 'background:#FFFFFF;color:#54534E;border:1px solid #E0DDD5') }));

    // ---------- lineage selector (schema 2) + per-stage checkboxes ----------
    const lineageShow = isMulti && (TX.lineageOrder||[]).length>=1;
    const lineageOptions = isMulti ? (TX.lineageOrder||[]).map(id=>({
      value:id, label:(TX.lineages[id]||{}).label||id, selected:id===dsId })) : [];
    const onLineageChange=(e)=>this.setDataset(e&&e.target?e.target.value:e);
    const lineageChips = lineageOptions.map(o=>({ label:o.label,
      onClick:()=>this.setDataset(o.value),
      style: chipBase + (o.selected
        ? 'background:#23231F;color:#fff;border:1px solid #23231F;font-weight:600'
        : 'background:#FFFFFF;color:#54534E;border:1px solid #E0DDD5') }));
    const headerKicker = 'Metagaming taxonomy · ' + (isMulti ? ((LMETA.label||dsId)+' lineage') : 'post-training');
    const headerTitle = 'How does the taxonomy of metagaming verbalizations change across post-training?';
    // stage checkboxes clone the family-checkbox mechanism; hiding a stage drops its
    // column from the chart and every aggregate (cols is filtered above).
    const mgBase = mg==='lineage'?LIN : mg==='reference'?REF : ALLC;
    const stageToggles = mgBase.map(c=>({ label:COLLBL[c], checked:!st.hiddenStages[c],
      onToggle:()=>this.toggleStage(c),
      rowStyle:'display:flex;align-items:center;gap:5px;font-family:\'Spline Sans\',sans-serif;font-size:11px;color:'+(st.hiddenStages[c]?'#B7B5AE':'#33332E')+';cursor:pointer;white-space:nowrap' }));
    const anyStageHidden = Object.keys(st.hiddenStages||{}).length>0;

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
      // under veaOnly the whole view is already restricted to eval-aware quotes, so the
      // "metagaming-only" bucket is zeroed rather than shown as a residual non-VEA slice.
      const mgN  = veaOnly ? 0 : Math.max(0, labN - veaN), tot = veaN + mgN;
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
    let txOpen=false, txModel='', txFamily='', txEval='', txSid='', txQuote='', txOrig='', txHasOrig=false, txParts=[], txCwParts=[], txHasCw=false, txPrompt='', txHasPrompt=false;
    if(st.openTx && T.transcripts && (st.openTx in T.transcripts)){
      txOpen=true;
      const full=T.transcripts[st.openTx]||'';
      // the prompt the subject actually saw (system+user), added to the bundle by the exporter
      txPrompt=(T.prompts && T.prompts[st.openTx])||''; txHasPrompt=!!txPrompt.trim();
      txQuote=st.openTxQuote||'';
      const pp=st.openTx.split('::'), mdl=pp[0], evk=pp[1], sid=pp.slice(2).join('::');
      const stg=(T.stages||[]).find(s=>s.model===mdl), evo=(T.evals||[]).find(e=>e.key===evk);
      txModel=stg?stg.label:mdl; txEval=evo?evo.label:evk; txSid=sid; txFamily=st.openTxFam||'';
      // header shows BOTH the cleaned/clustering phrase and the verbatim original;
      // only surface the original box when it actually differs from the cleaned form.
      txOrig=st.openTxOrig||''; txHasOrig = !!txOrig && txOrig!==txQuote;
      // best-effort highlight using the VERBATIM quote (openTxOrig); fall back to the
      // cleaned display text, then to a 40-char prefix probe.
      const hl='background:#FFF1A8;color:#23231F;font-weight:600;border-radius:2px';
      const needle=st.openTxOrig||txQuote;
      let idx = needle ? full.indexOf(needle) : -1, qlen = needle.length;
      if(idx<0 && needle){ const probe=needle.slice(0,40); if(probe){ idx=full.indexOf(probe); qlen=Math.min(needle.length,40); } }
      txParts = idx>=0
        ? [{text:full.slice(0,idx),style:''},{text:full.slice(idx,idx+qlen),style:hl},{text:full.slice(idx+qlen),style:''}]
        : [{text:full,style:''}];
      // context window: highlight the original quote within the surrounding text
      const cwRaw = st.openTxCw||'';
      if(cwRaw){ txHasCw=true;
        const cwNeedle=st.openTxOrig||txQuote;
        let ci=cwNeedle?cwRaw.indexOf(cwNeedle):-1, clen=cwNeedle.length;
        if(ci<0&&cwNeedle){ const p=cwNeedle.slice(0,40); if(p){ci=cwRaw.indexOf(p);clen=Math.min(cwNeedle.length,40);} }
        txCwParts = ci>=0
          ? [{text:cwRaw.slice(0,ci),style:''},{text:cwRaw.slice(ci,ci+clen),style:hl},{text:cwRaw.slice(ci+clen),style:''}]
          : [{text:cwRaw,style:''}];
      }
    }

    return {
      ready:true, legend, flowChart, flowSub, flowTitle, hoverInfo, flowMin, compViewChips,
      statQuotes, statResponses, statBenchmarks,
      benchGroups, totalAll, allBench:this.allBench, allBenchStyle, allBenchLabel, benchNote, scopeReadout, scopeShort,
      measureHint,
      benchDescShow, benchDescTag, benchDescText, benchDescUrl,
      modelGroupChips, showAllFams:this.showAllFams, anyHidden,
      veaAvailable, veaAllBtnStyle, veaOnlyBtnStyle, veaScopeHint, setVeaAll:this.setVeaAll, setVeaOnly:this.setVeaOnly,
      veaSplit, veaColLbl:'eval-aware (VEA)', mgColLbl:'metagaming-only', veaSwatch:VEA_COL, mgSwatch:MG_COL,
      accReady, accBands, accThrChips, accThr, eaSub,
      shareBtnStyle: share?onStyle:offStyle, rateBtnStyle: rateMode?onStyle:offStyle, txRateBtnStyle: txRateMode?onStyle:offStyle, countBtnStyle: (!share&&!rateMode&&!txRateMode)?onStyle:offStyle,
      setShare:this.setShare, setRate:this.setRate, setTxRate:this.setTxRate, setCount:this.setCount,
      clearSel:this.clearSel, clearLabel:(st.selFam)?'clear':'',
      clearBtnStyle:'font-family:\'Spline Sans Mono\',monospace;font-size:9.5px;color:#2C6E63;background:none;border:none;cursor:pointer;padding:0;'+(st.selFam?'':'visibility:hidden'),
      hasSel:!!selFamObj,
      selName, selKicker, selColor, detRows, detClass, detBench, detImpls, detImplsPanel, detQuotes, detQuoteGroups, implFilterChip, quoteCount, moreQuotes, stageChips,
      lineageShow, lineageOptions, lineageChips, onLineageChange, headerKicker, headerTitle,
      stageToggles, anyStageHidden, showAllStages:this.showAllStages,
      txOpen, txModel, txFamily, txEval, txSid, txQuote, txOrig, txHasOrig, txParts, txHasCw, txCwParts, txPrompt, txHasPrompt, closeTx:this.closeTx,
      tipShow, tipX, tipY, tipTransform, tipColor, tipLabel, tipLine1, tipLine2,
      onFlowMove:this.onFlowMove, onFlowLeave:this.onFlowLeave
    };
  }
}
