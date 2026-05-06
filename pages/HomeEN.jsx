import { useState, useEffect, useRef } from "react";
import { PowerSupply, Project } from "../api/entities";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const PSU_FALLBACK = [
  { name: "KPS-20W67-5Y-SM",  rated_power_w: 20,  voltage_output: "12V / 24V", ip_rating: "IP67", warranty_years: 5 },
  { name: "KPS-40W67-5Y-SM",  rated_power_w: 40,  voltage_output: "12V / 24V", ip_rating: "IP67", warranty_years: 5 },
  { name: "KPS-60W67-5Y-SM",  rated_power_w: 60,  voltage_output: "12V / 24V", ip_rating: "IP67", warranty_years: 5 },
  { name: "KPS-100W67-5Y-SM", rated_power_w: 100, voltage_output: "12V / 24V", ip_rating: "IP67", warranty_years: 5 },
  { name: "KPS-150W67-5Y-SM", rated_power_w: 150, voltage_output: "12V / 24V", ip_rating: "IP67", warranty_years: 5 },
  { name: "KPS-200W67-5Y-SM", rated_power_w: 200, voltage_output: "12V / 24V", ip_rating: "IP67", warranty_years: 5 },
  { name: "KPS-250W67-5Y-SM", rated_power_w: 250, voltage_output: "12V / 24V", ip_rating: "IP67", warranty_years: 5 },
  { name: "KPS-360W67-5Y-SM", rated_power_w: 360, voltage_output: "12V / 24V", ip_rating: "IP67", warranty_years: 5 },
];

const DISTANCE_TABLES = {
  "Teleline T0 0.5W": {
    series: "Teleline", voltage: 12, power_w: 0.5, use_case: "lightbox",
    depths:       [40,    50,    60,    70,    80,    90,    100],
    pitch_mm:     [100,   125,   150,   170,   180,   180,   180],
    qty_per_m2:   [100.0, 64.0,  44.4,  34.6,  30.9,  30.9,  30.9],
    power_per_m2: [50.0,  32.0,  22.2,  17.3,  15.4,  15.4,  15.4],
    lumen_per_m2: [5500,  3520,  2444,  1903,  1698,  1698,  1698],
    price_per_m2: [33.00, 21.12, 14.67, 11.42, 10.19, 10.19, 10.19],
  },
  "Teleline T1 1.2W": {
    series: "Teleline", voltage: 12, power_w: 1.2, use_case: "lightbox",
    depths:       [50,    60,    70,    80,   90,   100,  120,  140,  160,  180,  200],
    pitch_mm:     [125,   150,   170,   200,  200,  200,  200,  200,  200,  200,  200],
    qty_per_m2:   [64.0,  44.4,  34.6,  25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0, 25.0],
    power_per_m2: [76.8,  53.3,  41.5,  30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0],
    lumen_per_m2: [7680,  5333,  4152,  3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000],
    price_per_m2: [23.04, 16.00, 12.46, 9.00, 9.00, 9.00, 9.00, 9.00, 9.00, 9.00, 9.00],
  },
  "Teleline T2 2W": {
    series: "Teleline", voltage: 12, power_w: 2.0, use_case: "lightbox",
    depths:       [70,    80,   90,    100,  120,  140,  160,  180,  200,  250,  300],
    pitch_mm:     [170,   200,  230,   250,  300,  300,  300,  300,  300,  300,  300],
    qty_per_m2:   [34.6,  25.0, 18.9,  16.0, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1],
    power_per_m2: [69.2,  50.0, 37.8,  32.0, 22.2, 22.2, 22.2, 22.2, 22.2, 22.2, 22.2],
    lumen_per_m2: [6920,  5000, 3781,  3200, 2222, 2222, 2222, 2222, 2222, 2222, 2222],
    price_per_m2: [18.69, 13.50, 10.21, 8.64, 6.00, 6.00, 6.00, 6.00, 6.00, 6.00, 6.00],
  },
  "Teleline T4 4W": {
    series: "Teleline", voltage: 12, power_w: 4.0, use_case: "lightbox",
    depths:       [120,   140,  160,  180,  200,  250,  300],
    pitch_mm:     [300,   350,  400,  400,  400,  400,  400],
    qty_per_m2:   [11.1,  8.2,  6.3,  6.3,  6.3,  6.3,  6.3],
    power_per_m2: [44.4,  32.7, 25.0, 25.0, 25.0, 25.0, 25.0],
    lumen_per_m2: [4222,  3102, 2375, 2375, 2375, 2375, 2375],
    price_per_m2: [11.22, 8.24, 6.31, 6.31, 6.31, 6.31, 6.31],
  },
  "Prism P0 HE 0.36W": {
    series: "Prism HE", voltage: 12, power_w: 0.36, use_case: "channel_letters",
    depths:       [40,    50,    60,   70,   80,   90,   100],
    pitch_mm:     [60,    80,    100,  120,  120,  120,  120],
    qty_per_m2:   [289,   169,   100,  64,   64,   64,   64],
    power_per_m2: [104,   61,    36,   23,   23,   23,   23],
    lumen_per_m2: [17340, 10140, 6000, 3840, 3840, 3840, 3840],
    lux:          [5700,  3800,  2400, 1700, 1650, 1600, 1550],
    price_per_m2: [55,    32,    19,   12,   12,   12,   12],
  },
  "Prism P1 HE 0.5W": {
    series: "Prism HE", voltage: 12, power_w: 0.5, use_case: "channel_letters",
    depths:       [50,    60,   70,   80,   90,   100,  120,  140,  160],
    pitch_mm:     [80,    100,  120,  140,  160,  160,  160,  160,  160],
    qty_per_m2:   [169,   100,  64,   49,   36,   36,   36,   36,   36],
    power_per_m2: [85,    50,   32,   25,   18,   18,   18,   18,   18],
    lumen_per_m2: [10140, 6000, 3840, 2940, 2160, 2160, 2160, 2160, 2160],
    lux:          [5300,  3500, 2600, 1750, 1350, 1300, 1250, 1200, 1150],
    price_per_m2: [35,    21,   13,   10,   8,    8,    8,    8,    8],
  },
  "Prism P2 HE 0.72W": {
    series: "Prism HE", voltage: 12, power_w: 0.72, use_case: "channel_letters",
    depths:       [60,   70,    80,    90,   100,  110,  120,  130,  140,  150,  160,  170,  180,  190,  200],
    pitch_mm:     [100,  120,   140,   160,  160,  160,  160,  160,  160,  160,  160,  160,  160,  160,  160],
    qty_per_m2:   [100,  64,    49,    36,   36,   36,   36,   36,   36,   36,   36,   36,   36,   36,   36],
    power_per_m2: [72,   46,    35,    26,   26,   26,   26,   26,   26,   26,   26,   26,   26,   26,   26],
    lumen_per_m2: [8300, 5312,  4067,  2988, 2988, 2988, 2988, 2988, 2988, 2988, 2988, 2988, 2988, 2988, 2988],
    lux:          [4900, 3400,  2450,  1900, 1800, 1750, 1700, 1650, 1600, 1550, 1500, 1450, 1400, 1350, 1300],
    price_per_m2: [24,   15.36, 11.76, 8.64, 8.64, 8.64, 8.64, 8.64, 8.64, 8.64, 8.64, 8.64, 8.64, 8.64, 8.64],
  },
  "Prism P2 HE 1.0W": {
    series: "Prism HE", voltage: 12, power_w: 1.0, use_case: "channel_letters",
    depths:       [70,   80,   90,  100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
    pitch_mm:     [120,  140,  160, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180],
    qty_per_m2:   [64,   49,   36,  36,  36,  36,  36,  36,  36,  36,  36,  36,  36,  36],
    power_per_m2: [64,   49,   36,  36,  36,  36,  36,  36,  36,  36,  36,  36,  36,  36],
    lumen_per_m2: [7360, 5635, 4140,4140,4140,4140,4140,4140,4140,4140,4140,4140,4140,4140],
    lux:          [4200, 3000, 2400,1800,1700,1650,1630,1600,1550,1500,1450,1400,1370,1350],
    price_per_m2: [16,   12,   9,   9,   9,   9,   9,   9,   9,   9,   9,   9,   9,   9],
  },
  "Prism P3 HE 1.5W": {
    series: "Prism HE", voltage: 12, power_w: 1.5, use_case: "channel_letters",
    depths:       [90,    100,   110,  120,  130,  140,  150,  160,  180,  190,  200,  250,  300],
    pitch_mm:     [160,   180,   200,  220,  220,  220,  220,  220,  220,  220,  220,  220,  220],
    qty_per_m2:   [36,    36,    25,   25,   25,   25,   25,   25,   25,   25,   25,   25,   25],
    power_per_m2: [54,    54,    38,   38,   38,   38,   38,   38,   38,   38,   38,   38,   38],
    lumen_per_m2: [6228,  6228,  4325, 4325, 4325, 4325, 4325, 4325, 4325, 4325, 4325, 4325, 4325],
    lux:          [3200,  2400,  2000, 1450, 1400, 1350, 1330, 1320, 1300, 1300, 1270, 1250, 1000],
    price_per_m2: [10.80,10.80,  7.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50, 7.50],
  },
  "Prism P4 HE 2.0W": {
    series: "Prism HE", voltage: 12, power_w: 2.0, use_case: "channel_letters",
    depths:       [90,    100,   110,   120,   130,  140,  150,  160,  170,  180,  190,  200,  250,  300],
    pitch_mm:     [160,   180,   200,   220,   240,  260,  260,  280,  280,  280,  280,  280,  260,  260],
    qty_per_m2:   [36,    36,    25,    25,    16,   16,   16,   16,   16,   16,   16,   16,   16,   16],
    power_per_m2: [72,    72,    50,    50,    32,   32,   32,   32,   32,   32,   32,   32,   32,   32],
    lumen_per_m2: [8280,  8280,  5750,  5750,  3680, 3680, 3680, 3680, 3680, 3680, 3680, 3680, 3680, 3680],
    lux:          [4000,  3000,  2600,  2100,  1850, 1400, 1400, 1100, 1070, 1050, 1030, 1000, 1050, 1000],
    price_per_m2: [17.64,17.64, 12.25, 12.25, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84],
  },
};

function interp(table, depth, field) {
  const D = table.depths, V = table[field];
  if (!V) return null;
  if (depth <= D[0]) return V[0];
  if (depth >= D[D.length-1]) return V[V.length-1];
  for (let i=0;i<D.length-1;i++) {
    if (depth>=D[i]&&depth<=D[i+1]) {
      const t=(depth-D[i])/(D[i+1]-D[i]);
      return V[i]+t*(V[i+1]-V[i]);
    }
  }
  return V[V.length-1];
}

function getDataForDepth(name, depth) {
  const t = DISTANCE_TABLES[name];
  if (!t) return null;
  return {
    pitch_mm:     interp(t,depth,"pitch_mm"),
    qty_per_m2:   interp(t,depth,"qty_per_m2"),
    power_per_m2: interp(t,depth,"power_per_m2"),
    lumen_per_m2: interp(t,depth,"lumen_per_m2"),
    lux:          interp(t,depth,"lux"),
    price_per_m2: interp(t,depth,"price_per_m2"),
  };
}

function pickPSU(totalPower, supplies) {
  const sorted = [...supplies].sort((a,b)=>a.rated_power_w-b.rated_power_w);
  const need = totalPower/0.8;
  const single = sorted.find(s=>s.rated_power_w>=need);
  if (single) return [{supply:single, qty:1}];
  const big = sorted[sorted.length-1];
  if (!big) return [];
  return [{supply:big, qty:Math.ceil(need/(big.rated_power_w*0.8))}];
}

function buildLayout(width, height, pitch, psuList) {
  const cols = Math.max(1, Math.round(width/pitch));
  const rows = Math.max(1, Math.round(height/pitch));
  const colSpacing = width/cols;
  const rowSpacing = height/rows;
  const modules = [];
  for (let r=0;r<rows;r++)
    for (let c=0;c<cols;c++)
      modules.push({ x: colSpacing/2+c*colSpacing, y: rowSpacing/2+r*rowSpacing, row:r, col:c });
  const psuCount = psuList.reduce((s,p)=>s+p.qty,0);
  return { cols, rows, total: cols*rows, colSpacing, rowSpacing, modules, psuCount };
}

function calcBest(w, h, d, useCase, voltage, priority, supplies) {
  let cands = Object.entries(DISTANCE_TABLES).filter(([,t])=>
    t.use_case===useCase && (voltage==="any"||t.voltage===parseInt(voltage))
  );
  if (!cands.length) cands = Object.entries(DISTANCE_TABLES).filter(([,t])=>t.use_case===useCase);
  const area=(w*h)/1e6;
  const scored = cands.map(([name,table])=>{
    const data=getDataForDepth(name,d);
    if(!data) return null;
    const totalPower=data.power_per_m2*area;
    const psu=pickPSU(totalPower,supplies);
    const layout=buildLayout(w,h,data.pitch_mm,psu);
    return {
      name, table, data, area,
      totalPower, totalLm: data.lumen_per_m2*area,
      psu, layout,
      score: priority==="brightness"?data.lumen_per_m2
           : priority==="efficiency"?data.lumen_per_m2/(data.power_per_m2||1)
           : -(data.price_per_m2||0)
    };
  }).filter(Boolean).sort((a,b)=>b.score-a.score);
  return scored[0]||null;
}

function parseXLSX(file) {
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=(e)=>{
      try {
        const wb=XLSX.read(e.target.result,{type:"array"});
        const items=[];
        wb.SheetNames.forEach(sheetName=>{
          const ws=wb.Sheets[sheetName];
          const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
          let headerIdx=-1, colMap={};
          for(let i=0;i<Math.min(rows.length,5);i++){
            const row=rows[i].map(c=>String(c).toLowerCase().trim());
            if(row.some(c=>c.includes("délka")||c.includes("delka")||c.includes("šířka")||c.includes("sirka")||c.includes("length")||c.includes("width"))){
              headerIdx=i;
              row.forEach((cell,ci)=>{
                if(cell.includes("délka")||cell.includes("delka")||cell.includes("length")||cell.includes("width")||cell.includes("šířka")||cell.includes("sirka")) colMap.width=ci;
                if(cell.includes("výška")||cell.includes("vyska")||cell.includes("height")) colMap.height=ci;
                if(cell.includes("hloubka")||cell.includes("depth")) colMap.depth=ci;
                if(cell.includes("počet")||cell.includes("pocet")||cell.includes("ks")||cell.includes("qty")||cell.includes("count")) colMap.qty=ci;
                if(cell.includes("typ")||cell.includes("plocha")||cell.includes("type")||cell.includes("desc")) colMap.type=ci;
              });
              break;
            }
          }
          if(headerIdx===-1&&rows.length>1){headerIdx=0;colMap={qty:0,width:1,height:2,depth:3,type:4};}
          for(let i=headerIdx+1;i<rows.length;i++){
            const row=rows[i];
            if(!row||row.every(c=>c===""||c===null)) continue;
            const pN=(v)=>{if(typeof v==="number")return v;const s=String(v).replace(/[^\d.,]/g,"").replace(",",".");return parseFloat(s)||0;};
            const pQ=(v)=>{const s=String(v).replace(/[^\d]/g,"");return parseInt(s)||1;};
            const w=pN(row[colMap.width]),h=pN(row[colMap.height]),d=pN(row[colMap.depth]);
            if(!w||!h) continue;
            items.push({sheet:sheetName,qty:colMap.qty!==undefined?pQ(row[colMap.qty]):1,width:w,height:h,depth:d||120,type:colMap.type!==undefined?String(row[colMap.type]||""):""});
          }
        });
        resolve(items);
      } catch(err){reject(err);}
    };
    reader.onerror=reject;
    reader.readAsArrayBuffer(file);
  });
}

export default function HomeEN() {
  const [supplies, setSupplies] = useState(PSU_FALLBACK);
  const [mode, setMode] = useState("home");
  const [form, setForm] = useState({projectName:"",customerName:"",projectType:"lightbox",width:"",height:"",depth:"",voltage:"any",priority:"price"});
  const [manualStep, setManualStep] = useState(1);
  const [result, setResult] = useState(null);
  const [batchItems, setBatchItems] = useState([]);
  const [batchSettings, setBatchSettings] = useState({projectName:"",customerName:"",projectType:"lightbox",voltage:"any",priority:"price"});
  const [batchResult, setBatchResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  useEffect(()=>{
    PowerSupply.list().then(s=>{if(s?.length)setSupplies(s);}).catch(()=>{});
  },[]);

  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const updB=(k,v)=>setBatchSettings(f=>({...f,[k]:v}));

  function calculateManual() {
    const w=parseFloat(form.width),h=parseFloat(form.height),d=parseFloat(form.depth);
    if(!w||!h||!d) return;
    const useCase=form.projectType==="lightbox"?"lightbox":"channel_letters";
    let cands=Object.entries(DISTANCE_TABLES).filter(([,t])=>
      t.use_case===useCase&&(form.voltage==="any"||t.voltage===parseInt(form.voltage))
    );
    if(!cands.length) cands=Object.entries(DISTANCE_TABLES).filter(([,t])=>t.use_case===useCase);
    const area=(w*h)/1e6;
    const options=cands.map(([name,table])=>{
      const data=getDataForDepth(name,d);
      if(!data) return null;
      const totalPower=data.power_per_m2*area;
      const psu=pickPSU(totalPower,supplies);
      return { name,table,data,area,totalPower,totalLm:data.lumen_per_m2*area,psu,layout:buildLayout(w,h,data.pitch_mm,psu),
        score: form.priority==="brightness"?data.lumen_per_m2:form.priority==="efficiency"?data.lumen_per_m2/(data.power_per_m2||1):-(data.price_per_m2||0) };
    }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,3);
    setResult({options,w,h,d});
    setMode("result");
  }

  async function handleFile(e) {
    const file=e.target.files?.[0];
    if(!file) return;
    setImporting(true);
    try {
      const items=await parseXLSX(file);
      setBatchItems(items.map((it,i)=>({...it,id:i,enabled:true})));
      setMode("import");
    } catch(err){alert("Error reading file: "+err.message);}
    setImporting(false);
    e.target.value="";
  }

  function calcBatch() {
    const {projectType,voltage,priority}=batchSettings;
    const useCase=projectType==="lightbox"?"lightbox":"channel_letters";
    const items=batchItems.filter(it=>it.enabled).map(it=>{
      const best=calcBest(it.width,it.height,it.depth,useCase,voltage,priority,supplies);
      return {...it,best};
    });
    setBatchResult({items,settings:batchSettings});
    setMode("batch");
  }

  async function saveBatch() {
    setSaving(true);
    try {
      await Project.create({name:batchSettings.projectName||"Imported project",customer_name:batchSettings.customerName,project_type:batchSettings.projectType,status:"calculated",result_json:JSON.stringify(batchResult)});
      setSaved(true);
    }catch(e){}
    setSaving(false);
  }

  async function saveManual() {
    setSaving(true);
    try {
      await Project.create({name:form.projectName||"Untitled",customer_name:form.customerName,project_type:form.projectType,panel_width_mm:parseFloat(form.width),panel_height_mm:parseFloat(form.height),panel_depth_mm:parseFloat(form.depth),voltage_preference:form.voltage,priority:form.priority,status:"calculated",result_json:JSON.stringify(result)});
      setSaved(true);
    }catch(e){}
    setSaving(false);
  }

  function resetHome(){setMode("home");setResult(null);setSaved(false);setBatchResult(null);setBatchItems([]);}

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <div className="bg-gray-900 border-b border-yellow-500/30 px-6 py-4 flex items-center gap-4">
        <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-black text-xl">K</div>
        <div>
          <div className="font-bold text-lg tracking-tight text-yellow-400">LED Lighting Designer</div>
          <div className="text-xs text-gray-400">Kaisen Electric — Technical Configurator</div>
        </div>
        {mode!=="home"&&(
          <button onClick={resetHome} className="ml-auto text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg hover:border-gray-500">← Home</button>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* HOME */}
        {mode==="home"&&(
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black">What would you like to calculate?</h1>
              <p className="text-gray-400">Enter dimensions manually or import a project from a file</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={()=>{setMode("manual");setManualStep(1);}}
                className="group bg-gray-800 border-2 border-gray-700 hover:border-yellow-500 rounded-2xl p-8 text-left transition-all">
                <div className="text-4xl mb-4">✏️</div>
                <div className="text-xl font-bold mb-2">Manual Entry</div>
                <div className="text-gray-400 text-sm leading-relaxed">Enter width, height and depth for a single panel or letter. Get the recommended module, layout diagram and bill of materials.</div>
                <div className="mt-4 text-yellow-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">Start →</div>
              </button>
              <button onClick={()=>fileRef.current?.click()}
                className="group bg-gray-800 border-2 border-gray-700 hover:border-yellow-500 rounded-2xl p-8 text-left transition-all relative">
                <div className="text-4xl mb-4">📂</div>
                <div className="text-xl font-bold mb-2">Import from File</div>
                <div className="text-gray-400 text-sm leading-relaxed">Upload an <strong className="text-white">.xlsx</strong> with a list of panels — the app calculates the entire project at once, with layout diagrams for each item.</div>
                <div className="mt-3 flex gap-2">
                  {["xlsx","xls"].map(ext=><span key={ext} className="text-xs bg-gray-700 px-2 py-0.5 rounded font-mono">.{ext}</span>)}
                  <span className="text-xs bg-gray-700/40 px-2 py-0.5 rounded text-gray-500 font-mono">.pdf soon</span>
                </div>
                {importing&&<div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-2xl text-yellow-400 font-bold animate-pulse">Loading...</div>}
                <div className="mt-4 text-yellow-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">Upload →</div>
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile}/>
          </div>
        )}

        {/* MANUAL step 1 */}
        {mode==="manual"&&manualStep===1&&(
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold">📋 Project Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {[["projectName","Project Name","e.g. ABC Ltd. Sign"],["customerName","Customer","Customer name"]].map(([k,lbl,ph])=>(
                <div key={k}>
                  <label className="block text-xs text-gray-400 mb-1">{lbl}</label>
                  <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none text-sm"
                    placeholder={ph} value={form[k]} onChange={e=>upd(k,e.target.value)}/>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["lightbox","💡 Lightbox / Panel","Backlit panels, banners, signs"],["channel_letters","🔤 Channel Letters","3D letters, logos, shapes"]].map(([v,lbl,desc])=>(
                <button key={v} onClick={()=>upd("projectType",v)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${form.projectType===v?"border-yellow-500 bg-yellow-500/10":"border-gray-700 bg-gray-800 hover:border-gray-500"}`}>
                  <div className="font-semibold">{lbl}</div>
                  <div className="text-xs text-gray-400 mt-1">{desc}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={()=>setManualStep(2)} className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400">Continue →</button>
            </div>
          </div>
        )}

        {/* MANUAL step 2 */}
        {mode==="manual"&&manualStep===2&&(
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold">📐 Dimensions & Preferences</h2>
            <div className="bg-gray-800 rounded-xl p-5">
              <div className="grid grid-cols-3 gap-4">
                {[["width","Width (mm)","1000"],["height","Height (mm)","500"],["depth","Depth (mm)","120"]].map(([k,lbl,ph])=>(
                  <div key={k}>
                    <label className="block text-xs text-gray-400 mb-1">{lbl}</label>
                    <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none"
                      placeholder={ph} value={form[k]} onChange={e=>upd(k,e.target.value)}/>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-5 grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Voltage</label>
                <div className="flex gap-2">
                  {[["any","Any"],["12","12V"],["24","24V"]].map(([v,lbl])=>(
                    <button key={v} onClick={()=>upd("voltage",v)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${form.voltage===v?"border-yellow-500 bg-yellow-500/10 text-yellow-400":"border-gray-700 text-gray-400"}`}>{lbl}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Priority</label>
                <div className="flex gap-2">
                  {[["price","💰 Cost"],["brightness","☀️ Brightness"],["efficiency","⚡ Efficiency"]].map(([v,lbl])=>(
                    <button key={v} onClick={()=>upd("priority",v)}
                      className={`flex-1 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${form.priority===v?"border-yellow-500 bg-yellow-500/10 text-yellow-400":"border-gray-700 text-gray-400"}`}>{lbl}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={()=>setManualStep(1)} className="text-gray-400 px-6 py-3 rounded-xl border border-gray-700">← Back</button>
              <button onClick={calculateManual} disabled={!form.width||!form.height||!form.depth}
                className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-40">🔬 Calculate</button>
            </div>
          </div>
        )}

        {/* MANUAL RESULT */}
        {mode==="result"&&result&&(
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">✅ Technical Proposals</h2>
              <button onClick={()=>{setMode("manual");setManualStep(2);setResult(null);setSaved(false);}}
                className="text-gray-400 text-sm border border-gray-700 px-4 py-2 rounded-lg hover:border-gray-500">← Edit</button>
            </div>
            <div className="bg-gray-800/60 rounded-xl p-4 grid grid-cols-3 gap-4 text-sm border border-gray-700">
              <div><span className="text-gray-400">Panel:</span> <span className="font-bold">{result.w} × {result.h} mm</span></div>
              <div><span className="text-gray-400">Depth:</span> <span className="font-bold">{result.d} mm</span></div>
              <div><span className="text-gray-400">Area:</span> <span className="font-bold">{((result.w*result.h)/1e6).toFixed(3)} m²</span></div>
            </div>
            {result.options.map((opt,idx)=>(
              <ModuleCard key={idx} opt={opt} idx={idx} w={result.w} h={result.h} depth={result.d}/>
            ))}
            <div className="flex justify-between pt-2">
              <button onClick={()=>{setMode("manual");setManualStep(2);setResult(null);setSaved(false);}}
                className="text-gray-400 px-6 py-3 rounded-xl border border-gray-700">← Edit</button>
              <button onClick={saveManual} disabled={saving||saved}
                className={`font-bold px-8 py-3 rounded-xl ${saved?"bg-green-600 text-white":"bg-yellow-500 text-black hover:bg-yellow-400"} disabled:opacity-60`}>
                {saved?"✅ Saved!":saving?"Saving...":"💾 Save Project"}
              </button>
            </div>
          </div>
        )}

        {/* IMPORT preview */}
        {mode==="import"&&(
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">📂 Import — {batchItems.length} items found</h2>
            </div>
            <div className="bg-gray-800 rounded-xl p-5 grid grid-cols-2 gap-4">
              {[["projectName","Project Name","Project XY"],["customerName","Customer","Customer name"]].map(([k,lbl,ph])=>(
                <div key={k}>
                  <label className="block text-xs text-gray-400 mb-1">{lbl}</label>
                  <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none text-sm"
                    placeholder={ph} value={batchSettings[k]} onChange={e=>updB(k,e.target.value)}/>
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <div className="flex gap-2">
                  {[["lightbox","💡 Lightbox"],["channel_letters","🔤 Letters"]].map(([v,lbl])=>(
                    <button key={v} onClick={()=>updB("projectType",v)}
                      className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition-all ${batchSettings.projectType===v?"border-yellow-500 bg-yellow-500/10 text-yellow-400":"border-gray-700 text-gray-400"}`}>{lbl}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Priority</label>
                <div className="flex gap-2">
                  {[["price","💰 Cost"],["brightness","☀️ Brightness"],["efficiency","⚡ Efficiency"]].map(([v,lbl])=>(
                    <button key={v} onClick={()=>updB("priority",v)}
                      className={`flex-1 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${batchSettings.priority===v?"border-yellow-500 bg-yellow-500/10 text-yellow-400":"border-gray-700 text-gray-400"}`}>{lbl}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 text-sm font-semibold text-gray-300">Review and adjust values if needed</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-700 bg-gray-900/50">
                      <th className="px-3 py-2 text-left w-8">✓</th>
                      <th className="px-3 py-2 text-left">Sheet / Type</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Width mm</th>
                      <th className="px-3 py-2 text-right">Height mm</th>
                      <th className="px-3 py-2 text-right">Depth mm</th>
                      <th className="px-3 py-2 text-right">Area m²</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchItems.map((it,i)=>(
                      <tr key={i} className={`border-b border-gray-800 ${!it.enabled?"opacity-40":""}`}>
                        <td className="px-3 py-2"><input type="checkbox" checked={it.enabled} onChange={e=>{const n=[...batchItems];n[i]={...n[i],enabled:e.target.checked};setBatchItems(n);}} className="accent-yellow-500"/></td>
                        <td className="px-3 py-2 text-gray-400 text-xs">{it.sheet}{it.type?" · "+it.type:""}</td>
                        <td className="px-3 py-2 text-right"><input type="number" value={it.qty} onChange={e=>{const n=[...batchItems];n[i]={...n[i],qty:parseInt(e.target.value)||1};setBatchItems(n);}} className="w-14 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-right text-white text-xs outline-none focus:border-yellow-500"/></td>
                        {["width","height","depth"].map(f=>(
                          <td key={f} className="px-3 py-2 text-right"><input type="number" value={it[f]} onChange={e=>{const n=[...batchItems];n[i]={...n[i],[f]:parseFloat(e.target.value)||0};setBatchItems(n);}} className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-right text-white text-xs outline-none focus:border-yellow-500"/></td>
                        ))}
                        <td className="px-3 py-2 text-right text-gray-400 text-xs">{((it.width*it.height)/1e6).toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={()=>fileRef.current?.click()} className="text-gray-400 px-6 py-3 rounded-xl border border-gray-700 text-sm">📂 Different file</button>
              <button onClick={calcBatch} disabled={!batchItems.some(i=>i.enabled)}
                className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-40">🔬 Calculate Project</button>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile}/>
          </div>
        )}

        {/* BATCH RESULT */}
        {mode==="batch"&&batchResult&&(
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">📊 Project Results</h2>
                {batchResult.settings.projectName&&<div className="text-gray-400 text-sm">{batchResult.settings.projectName}{batchResult.settings.customerName?" — "+batchResult.settings.customerName:""}</div>}
              </div>
              <button onClick={()=>{setMode("import");setSaved(false);}} className="text-gray-400 text-sm border border-gray-700 px-4 py-2 rounded-lg hover:border-gray-500">← Edit</button>
            </div>
            <BatchSummary items={batchResult.items}/>
            {batchResult.items.map((it,idx)=>(
              <div key={idx} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="bg-gray-700/50 px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{it.qty}×</span>
                    <span className="text-yellow-400 font-semibold ml-2">{it.width} × {it.height} mm</span>
                    <span className="text-gray-400 text-sm ml-2">depth {it.depth} mm</span>
                    {it.type&&<span className="text-gray-500 text-xs ml-2">· {it.type}</span>}
                  </div>
                  <span className="text-xs text-gray-500">{it.sheet}</span>
                </div>
                {it.best?(
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{it.best.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{it.best.table.series} • {it.best.table.voltage}V • CC pitch {Math.round(it.best.data.pitch_mm)} mm</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-yellow-400">{it.best.layout.total} pcs</div>
                        <div className="text-xs text-gray-400">per panel → total <span className="text-white font-bold">{it.best.layout.total*it.qty} pcs</span></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {[
                        {l:"Power/panel",v:`${it.best.totalPower.toFixed(1)} W`,c:"text-blue-400"},
                        {l:"Lumens/panel",v:`${Math.round(it.best.totalLm)} lm`,c:"text-green-400"},
                        {l:`Power ${it.qty}×`,v:`${(it.best.totalPower*it.qty).toFixed(1)} W`,c:"text-orange-400"},
                        {l:"lm/m²",v:`${Math.round(it.best.data.lumen_per_m2)}`,c:"text-purple-400"},
                      ].map(s=>(
                        <div key={s.l} className="bg-gray-900 rounded p-2 text-center">
                          <div className={`font-bold text-sm ${s.c}`}>{s.v}</div>
                          <div className="text-gray-500 mt-0.5">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <LayoutDiagram width={it.width} height={it.height} depth={it.depth} layout={it.best.layout} psu={it.best.psu} moduleName={it.best.name}/>
                    {it.best.psu.length>0&&(
                      <div className="text-xs text-gray-400 bg-gray-900 rounded-lg px-3 py-2">
                        <span className="text-gray-300 font-medium">⚡ Power supply (per panel): </span>
                        {it.best.psu.map(p=>`${p.qty}× ${p.supply.name} (${p.supply.rated_power_w}W • ${p.supply.ip_rating})`).join(" + ")}
                        {it.qty>1&&<span className="text-gray-500 ml-2">→ {it.qty} sets total</span>}
                      </div>
                    )}
                  </div>
                ):(
                  <div className="p-4 text-red-400 text-sm">No suitable module found for these dimensions.</div>
                )}
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <button onClick={()=>{setMode("import");setSaved(false);}} className="text-gray-400 px-6 py-3 rounded-xl border border-gray-700">← Edit</button>
              <button onClick={saveBatch} disabled={saving||saved}
                className={`font-bold px-8 py-3 rounded-xl ${saved?"bg-green-600 text-white":"bg-yellow-500 text-black hover:bg-yellow-400"} disabled:opacity-60`}>
                {saved?"✅ Saved!":saving?"Saving...":"💾 Save Project"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutDiagram({ width, height, depth, layout, psu, moduleName }) {
  const PAD=40, PSU_H=50, MAX_W=560;
  const scale=Math.min(MAX_W/width,200/height);
  const sw=width*scale, sh=height*scale;
  const totalW=sw+PAD*2, totalH=sh+PAD+PSU_H+30;
  const psuCount=psu.reduce((s,p)=>s+p.qty,0);
  const psuW=Math.min(sw*0.18,70), psuH=22;
  const MAX_DOTS=300;
  const modules=layout.modules.length>MAX_DOTS
    ?layout.modules.filter((_,i)=>i%Math.ceil(layout.modules.length/MAX_DOTS)===0)
    :layout.modules;
  const pitchColor="#facc15";
  return (
    <div className="bg-gray-950 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300">📐 Layout Diagram — 1 panel</span>
        <span className="text-xs text-gray-500">{width} × {height} × {depth} mm</span>
      </div>
      <div className="overflow-x-auto">
        <svg width={totalW} height={totalH} style={{display:"block",minWidth:totalW}}>
          <rect x={PAD} y={PAD/2} width={sw} height={sh} fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="2"/>
          {layout.cols>1&&<line x1={PAD+(layout.colSpacing*scale)} y1={PAD/2} x2={PAD+(layout.colSpacing*scale)} y2={PAD/2+sh} stroke={pitchColor} strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity="0.3"/>}
          {layout.rows>1&&<line x1={PAD} y1={PAD/2+(layout.rowSpacing*scale)} x2={PAD+sw} y2={PAD/2+(layout.rowSpacing*scale)} stroke={pitchColor} strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity="0.3"/>}
          {layout.cols>1&&(()=>{
            const y=PAD/2-14,x1=PAD+(layout.modules[0]?.x||0)*scale,x2=PAD+(layout.modules[1]?.x||layout.colSpacing)*scale;
            return(<g><line x1={x1} y1={y+4} x2={x2} y2={y+4} stroke={pitchColor} strokeWidth="1"/><line x1={x1} y1={y} x2={x1} y2={y+8} stroke={pitchColor} strokeWidth="1"/><line x1={x2} y1={y} x2={x2} y2={y+8} stroke={pitchColor} strokeWidth="1"/><text x={(x1+x2)/2} y={y-2} textAnchor="middle" fill={pitchColor} fontSize="8">{Math.round(layout.colSpacing)} mm</text></g>);
          })()}
          {layout.rows>1&&(()=>{
            const x=PAD+sw+8,y1=PAD/2+(layout.modules[0]?.y||0)*scale,y2=PAD/2+((layout.modules[layout.cols]?.y)||layout.rowSpacing)*scale;
            return(<g><line x1={x} y1={y1} x2={x} y2={y2} stroke={pitchColor} strokeWidth="1"/><line x1={x-4} y1={y1} x2={x+4} y2={y1} stroke={pitchColor} strokeWidth="1"/><line x1={x-4} y1={y2} x2={x+4} y2={y2} stroke={pitchColor} strokeWidth="1"/><text x={x+6} y={(y1+y2)/2+3} fill={pitchColor} fontSize="8">{Math.round(layout.rowSpacing)} mm</text></g>);
          })()}
          <g>
            <line x1={PAD} y1={PAD/2+sh+8} x2={PAD+sw} y2={PAD/2+sh+8} stroke="#64748b" strokeWidth="1"/>
            <line x1={PAD} y1={PAD/2+sh+4} x2={PAD} y2={PAD/2+sh+12} stroke="#64748b" strokeWidth="1"/>
            <line x1={PAD+sw} y1={PAD/2+sh+4} x2={PAD+sw} y2={PAD/2+sh+12} stroke="#64748b" strokeWidth="1"/>
            <text x={PAD+sw/2} y={PAD/2+sh+20} textAnchor="middle" fill="#64748b" fontSize="9">{width} mm</text>
          </g>
          <g>
            <line x1={PAD-10} y1={PAD/2} x2={PAD-10} y2={PAD/2+sh} stroke="#64748b" strokeWidth="1"/>
            <line x1={PAD-14} y1={PAD/2} x2={PAD-6} y2={PAD/2} stroke="#64748b" strokeWidth="1"/>
            <line x1={PAD-14} y1={PAD/2+sh} x2={PAD-6} y2={PAD/2+sh} stroke="#64748b" strokeWidth="1"/>
            <text x={PAD-22} y={PAD/2+sh/2+3} textAnchor="middle" fill="#64748b" fontSize="9" transform={`rotate(-90,${PAD-22},${PAD/2+sh/2+3})`}>{height} mm</text>
          </g>
          {modules.map((m,i)=>{
            const cx=PAD+m.x*scale,cy=PAD/2+m.y*scale;
            return(<g key={i}><circle cx={cx} cy={cy} r={Math.max(2,Math.min(4,scale*8))} fill="#facc15" fillOpacity="0.18"/><circle cx={cx} cy={cy} r={Math.max(1,Math.min(2.5,scale*4))} fill="#facc15"/></g>);
          })}
          {layout.modules.length>MAX_DOTS&&<text x={PAD+sw/2} y={PAD/2+sh/2} textAnchor="middle" fill="#facc15" fontSize="10" opacity="0.5">{layout.total} modules (simplified view)</text>}
          {Array.from({length:psuCount}).map((_,i)=>{
            const cx=PAD+(sw/(psuCount+1))*(i+1),cy=PAD/2+sh+35;
            return(<g key={i}>
              <line x1={cx} y1={PAD/2+sh} x2={cx} y2={cy-psuH/2} stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,3"/>
              <rect x={cx-psuW/2} y={cy-psuH/2} width={psuW} height={psuH} fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1" rx="3"/>
              <text x={cx} y={cy+3} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">{psu[0]?.supply?.rated_power_w}W</text>
              <text x={cx} y={cy-psuH/2-4} textAnchor="middle" fill="#60a5fa" fontSize="7">{i===0?"⚡ PSU":"⚡ PSU "+(i+1)}</text>
            </g>);
          })}
          <g>
            <circle cx={PAD+8} cy={totalH-12} r="4" fill="#facc15" fillOpacity="0.18"/>
            <circle cx={PAD+8} cy={totalH-12} r="2.5" fill="#facc15"/>
            <text x={PAD+16} y={totalH-9} fill="#94a3b8" fontSize="8">LED module ({layout.total} pcs)</text>
            <rect x={PAD+120} y={totalH-17} width={12} height={8} fill="#1d4ed8" stroke="#3b82f6" strokeWidth="0.8" rx="1"/>
            <text x={PAD+136} y={totalH-9} fill="#94a3b8" fontSize="8">Power supply ({psuCount}× {psu[0]?.supply?.name||"PSU"})</text>
          </g>
        </svg>
      </div>
      <div className="px-4 py-2 border-t border-gray-800 grid grid-cols-3 gap-4 text-xs text-gray-500">
        <span>🔲 CC Pitch: <span className="text-yellow-400 font-semibold">{Math.round(layout.colSpacing)} × {Math.round(layout.rowSpacing)} mm</span></span>
        <span>📊 Grid: <span className="text-white">{layout.cols} cols × {layout.rows} rows = {layout.total} pcs</span></span>
        <span>⚡ PSU: <span className="text-blue-400">{psuCount}× bottom mounted</span></span>
      </div>
    </div>
  );
}

function BatchSummary({items}) {
  const en=items.filter(i=>i.best);
  const mods=en.reduce((s,i)=>s+(i.best.layout.total*i.qty),0);
  const pwr=en.reduce((s,i)=>s+i.best.totalPower*i.qty,0);
  const lm=en.reduce((s,i)=>s+i.best.totalLm*i.qty,0);
  const area=en.reduce((s,i)=>s+(i.width*i.height/1e6)*i.qty,0);
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-yellow-500/30">
      <div className="text-sm font-semibold text-yellow-400 mb-3">📊 Project Summary</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {l:"Total Modules",v:`${mods} pcs`,c:"text-yellow-400"},
          {l:"Total Power",v:`${pwr.toFixed(0)} W`,c:"text-blue-400"},
          {l:"Total Lumens",v:`${Math.round(lm)} lm`,c:"text-green-400"},
          {l:"Total Area",v:`${area.toFixed(2)} m²`,c:"text-purple-400"},
        ].map(s=>(
          <div key={s.l} className="bg-gray-900 rounded-lg p-3 text-center">
            <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
            <div className="text-xs text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleCard({opt,idx,w,h,depth}) {
  return (
    <div className={`bg-gray-800 rounded-xl overflow-hidden border-2 ${idx===0?"border-yellow-500":"border-gray-700"}`}>
      {idx===0&&<div className="bg-yellow-500 text-black text-xs font-bold px-4 py-1.5">⭐ RECOMMENDED</div>}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-yellow-400">{opt.name}</h3>
            <div className="text-sm text-gray-400">{opt.table.series} • {opt.table.voltage}V • CC pitch {Math.round(opt.data.pitch_mm)} mm at {depth} mm depth</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{opt.layout.total} pcs</div>
            <div className="text-xs text-gray-400">modules</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            {l:"Total Power",v:`${opt.totalPower.toFixed(1)} W`,c:"text-blue-400"},
            {l:"Total Lumens",v:`${Math.round(opt.totalLm)} lm`,c:"text-green-400"},
            {l:"lm/m²",v:`${Math.round(opt.data.lumen_per_m2)}`,c:"text-purple-400"},
            {l:"W/m²",v:`${Math.round(opt.data.power_per_m2)}`,c:"text-orange-400"},
            {l:"Illuminance",v:opt.data.lux?`${Math.round(opt.data.lux)} lux`:"–",c:"text-cyan-400"},
          ].map(s=>(
            <div key={s.l} className="bg-gray-900 rounded-lg p-3 text-center">
              <div className={`text-base font-bold ${s.c}`}>{s.v}</div>
              <div className="text-xs text-gray-500">{s.l}</div>
            </div>
          ))}
        </div>
        <LayoutDiagram width={w} height={h} depth={depth} layout={opt.layout} psu={opt.psu} moduleName={opt.name}/>
        {opt.psu?.length>0&&(
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-300 mb-2">⚡ Power Supplies (80% load rule):</div>
            {opt.psu.map((p,pi)=>(
              <div key={pi} className="flex justify-between items-center py-1.5 border-b border-gray-800 last:border-0 text-sm">
                <span>{p.supply.name} <span className="text-gray-400 text-xs">{p.supply.voltage_output} • {p.supply.rated_power_w}W • {p.supply.ip_rating} • {p.supply.warranty_years}yr warranty</span></span>
                <span className="text-yellow-400 font-bold">{p.qty}× pcs</span>
              </div>
            ))}
          </div>
        )}
        <DepthTable name={opt.name} highlighted={depth}/>
      </div>
    </div>
  );
}

function DepthTable({name,highlighted}) {
  const t=DISTANCE_TABLES[name];
  if(!t) return null;
  return (
    <details className="group">
      <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 list-none flex items-center gap-1">
        <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
        Pitch table by depth
      </summary>
      <div className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-3">
        <table className="text-xs w-full">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left pr-3 py-1">Depth mm</th>
              {t.depths.map(d=><th key={d} className={`text-right px-2 py-1 ${Math.abs(d-highlighted)<10?"text-yellow-400 font-bold":""}`}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {[["Pitch mm","pitch_mm"],["Pcs/m²","qty_per_m2"],["W/m²","power_per_m2"],["lm/m²","lumen_per_m2"]].map(([lbl,f])=>(
              <tr key={f} className="border-t border-gray-800">
                <td className="pr-3 py-1 text-gray-400">{lbl}</td>
                {t[f].map((v,i)=><td key={i} className={`text-right px-2 py-1 ${Math.abs(t.depths[i]-highlighted)<10?"text-yellow-300 font-semibold bg-yellow-500/5":"text-gray-400"}`}>
                  {typeof v==="number"?(v%1===0?v:v.toFixed(1)):v}
                </td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
