// Editable PowerPoint authoring source. Run through regenerate.ps1.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(here),build=path.join(root,'.presentation-build');
const modules=process.env.VW_NODE_MODULES || 'C:/Users/Sergiu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const req=createRequire(import.meta.url);
const {Presentation,PresentationFile}=await import(pathToFileURL(req.resolve('@oai/artifact-tool',{paths:[modules]})).href);
const content=JSON.parse(await fs.readFile(path.join(here,'deck_content.json'),'utf8'));
const csv=(await fs.readFile(path.join(here,'verified_chart_data.csv'),'utf8')).trim().split(/\r?\n/).map(l=>l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v=>v.replace(/^"|"$/g,'')));
const data=csv.slice(1).map(r=>Object.fromEntries(csv[0].map((h,i)=>[h,r[i]])));
const means=k=>Array.from({length:6},(_,i)=>Number(data.find(r=>r.vehicle.startsWith('Vehicle '+k)&&Number(r.order)===i).nox_gkm||0));
const bg='#FAFAF7',ink='#132C3B',muted='#52616A',blue='#2864B4',orange='#C35724',green='#008778',red='#B6293E';
const font='Arial';
function txt(s,text,x,y,w,h,size=28,color=ink,bold=false){
 const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 a.text=text;a.text.style={fontSize:size,typeface:font,color,bold,autoFit:'none',verticalAlignment:'top'};return a;
}
function foot(s,source,n){
 // Short visible references; full citations and URLs are in the native notes.
 let ref=source.replaceAll('WVU/ICCT, In-Use Emissions Testing of Light-Duty Diesel Vehicles in the U.S., 15 May 2014','WVU/ICCT (2014)').replaceAll('EPA, Notice of Violation CAA-09-18-15, 18 September 2015','EPA NOV (2015)').replaceAll('United States v. Volkswagen AG, Plea Agreement, 11 January 2017, Exhibit 2 (Statement of Facts)','VW plea agreement (2017), Statement of Facts');
 if(ref.length>220)ref='WVU/ICCT (2014); EPA NOV (2015); VW plea agreement (2017), Statement of Facts. Exact pages in notes.';
 txt(s,ref,52,663,1125,44,14,muted);txt(s,String(n),1200,668,28,24,16,muted);
}
function head(s,d,n){txt(s,d.title,52,36,1175,103,d.kind==='cover'?54:43,ink,true);if(d.kind!=='chart')foot(s,d.source,n)}
function compare(s,d){
 d.body.forEach((b,i)=>{let x=54+i*612;txt(s,b[0],x,180,550,40,26,i?orange:blue,true);txt(s,b[1],x,233,548,66,35,ink,true);txt(s,b[2],x,319,542,136,29,muted)});
 if(d.bottom)txt(s,d.bottom,54,524,1165,104,28,ink,true);
}
function chart(s,d){
 txt(s,'Mean NOx emissions (g/km)',55,130,540,35,24,ink,true);
 s.charts.add('bar',{
 position:{left:40,top:174,width:1200,height:420},
 categories:['Study lab\nFTP-75','R1\nHighway','R2\nLos Angeles','R3\nRural hills','R4\nSan Diego','R5\nSan Francisco'],
 series:[
 {name:'Vehicle A',values:means('A'),fill:blue},
 {name:'Vehicle B',values:means('B'),fill:orange},
 {name:'Vehicle C',values:means('C'),fill:green},
 {name:'Standard: 0.043 g/km',values:Array(6).fill(.043),fill:red}],
 barOptions:{direction:'column',grouping:'clustered',gapWidth:72,overlap:0},
 hasLegend:true,legend:{position:'top',textStyle:{typeface:font,fontSize:22,fill:ink}},
 xAxis:{textStyle:{typeface:font,fontSize:20,fill:ink},line:{fill:'#A2AAAD',width:1},majorGridlines:null},
 yAxis:{min:0,max:2,majorUnit:.5,numberFormatCode:'0.0',textStyle:{typeface:font,fontSize:20,fill:muted},majorGridlines:{fill:'#D9DEDF',width:.6},line:{fill:'none',width:0}},
 dataLabels:{showValue:false},chartFill:bg,plotAreaFill:bg,chartLine:{fill:'none',width:0},displayBlanksAs:'gap'
 });
 txt(s,'Error bars: reported ±1 standard deviation. No result: C lab, C R4, A R5.',54,607,1170,28,20,muted);
 txt(s,'Standard = certification benchmark. Three vehicles; no fleet-wide estimate.',54,635,1170,26,20,muted);
 foot(s,'WVU/ICCT (2014), Table 4.3 p. 65 (road); p. 64 (lab); Table 4.1 p. 59 (standard).',d.number);
}
function evidence(s,d){d.body.forEach((b,i)=>{const x=54+i*405;txt(s,b[0],x,190,370,47,34,[blue,orange,green][i],true);txt(s,b[1],x,264,369,48,29,ink,true);txt(s,b[2],x,336,365,143,28,muted)});if(d.bottom)txt(s,d.bottom,54,547,1160,62,35,ink,true)}
function rows(s,d){d.body.forEach((b,i)=>{let top=168+i*145;txt(s,b[0],54,top,352,80,30,[blue,orange,green][i%3],true);txt(s,b[1],445,top,755,105,29,ink)});}
function study(s,d){d.body.forEach((b,i)=>{const x=54+i*405;txt(s,'Vehicle '+b[0],x,180,350,58,35,[blue,orange,green][i],true);txt(s,b[1],x,268,340,95,62,ink,true);txt(s,b[2],x,380,360,75,29,muted)});txt(s,d.bottom,54,528,1160,106,29,ink,true)}
function ratios(s,d){d.body.forEach((b,i)=>{let x=54+i*614;txt(s,b[0],x,168,530,112,78,i?orange:blue,true);txt(s,b[1],x,303,540,59,36,ink);txt(s,b[2],x,390,535,103,29,muted)});txt(s,d.bottom,54,551,1168,65,27,ink,true)}
function checklist(s,d){d.body.forEach((b,i)=>{let y=157+i*115;txt(s,b[0],54,y,68,72,43,blue,true);txt(s,b[1],145,y+2,260,75,29,ink,true);txt(s,b[2],432,y+2,765,89,27,muted)})}
function software(s,d){
 txt(s,'Software recognises the test conditions',54,166,1165,64,34,ink,true);
 d.body.forEach((b,i)=>{const x=54+i*612;txt(s,b[0],x,263,540,49,31,i?orange:blue,true);txt(s,b[1],x,337,540,55,34,ink,true);txt(s,b[2],x,416,540,101,29,muted)});
 txt(s,d.bottom,54,575,1165,44,24,muted);
}
function sourceSlide(s,d){d.body.forEach((b,i)=>{let x=54+i*405;txt(s,b[0],x,177,369,48,27,[blue,orange,green][i],true);txt(s,b[1],x,244,371,84,31,ink,true);txt(s,b[2],x,365,373,215,25,muted)});}
for(const [key,rowsData] of [['team',content.team],['standalone',content.standalone]]){
 const p=Presentation.create({slideSize:{width:1280,height:720}});
 for(let i=0;i<rowsData.length;i++){
  let d={...rowsData[i],number:i+1},s=p.slides.add();s.background.fill=bg;head(s,d,i+1);
  if(d.kind==='cover'){txt(s,d.body[0],54,340,1160,61,32,blue,true);txt(s,d.body[1],54,428,1050,110,33,muted);txt(s,'Standalone fallback • approximately 15 minutes',54,574,1160,40,24,muted);}
  else if(d.kind==='chart')chart(s,d);
  else if(d.kind==='compare')compare(s,d);
  else if(d.kind==='ethics'){d.body.forEach((b,j)=>{const x=54+j*612;txt(s,b[0],x,190,550,80,34,j?orange:blue,true);txt(s,b[1],x,326,540,220,34,ink)});}
  else if(d.kind==='evidence')evidence(s,d);
  else if(d.kind==='study')study(s,d);
  else if(d.kind==='ratios')ratios(s,d);
  else if(d.kind==='checklist')checklist(s,d);
  else if(d.kind==='software')software(s,d);
  else if(d.kind==='sources')sourceSlide(s,d);
  else rows(s,d);
  let citationLinks=Object.entries(content.urls).map(([k,v])=>`${k}: ${v}`).join('\n');
  s.speakerNotes.textFrame.setText(`${d.seconds?'Planned time: '+d.seconds+' seconds.':'Optional appendix; outside speaking time.'}\n\n${d.notes}\n\nSOURCE (not spoken): ${d.source}\n${citationLinks}`);
 }
 await (await PresentationFile.exportPptx(p)).save(path.join(build,key+'_raw.pptx'));
 console.log('Authored '+key+': '+rowsData.length+' slides');
}
