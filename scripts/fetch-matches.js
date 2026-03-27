const fs=require('fs'),https=require('https'),path=require('path');
const DD=path.join(__dirname,'..','data'),MF=path.join(DD,'matches.json'),TF=path.join(DD,'teams.json'),LF=path.join(DD,'log.json');
function get(u){return new Promise((ok,no)=>{https.get(u,{headers:{'User-Agent':'Mozilla/5.0'}},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{try{ok(JSON.parse(d))}catch(e){no(e)}})}).on('error',no)})}
function fd(d){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()}
function id(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
async function run(){
if(!fs.existsSync(DD))fs.mkdirSync(DD,{recursive:true});
let all=[];try{all=JSON.parse(fs.readFileSync(MF,'utf8'))}catch(e){}
const have=new Set(all.map(d=>d.date));let nc=0;
for(let i=1;i<=3;i++){
const dt=new Date();dt.setDate(dt.getDate()-i);const iso=id(dt);
if(have.has(iso)){console.log('Skip '+iso);continue}
try{const j=await get('https://vd.mackolik.com/livedata?date='+fd(dt));
const ms=(j.m||[]).filter(m=>m[6]==='MS').map(m=>{const l=m[36]||[];
return{home:m[2],away:m[4],hG:m[12]||0,aG:m[13]||0,o1:parseFloat(m[18])||0,oX:parseFloat(m[19])||0,o2:parseFloat(m[20])||0,oU:parseFloat(m[21])||0,oO:parseFloat(m[22])||0,country:l[1]||'',league:l[3]||'',result:(m[12]||0)>(m[13]||0)?'1':(m[12]||0)<(m[13]||0)?'2':'X'}});
if(ms.length){all.push({date:iso,matches:ms});nc+=ms.length;console.log('✅ '+iso+': '+ms.length)}
await new Promise(r=>setTimeout(r,500));
}catch(e){console.error('❌ '+iso+': '+e.message)}}
all.sort((a,b)=>a.date.localeCompare(b.date));
const cut=new Date();cut.setDate(cut.getDate()-90);const ci=id(cut);
all=all.filter(d=>d.date>=ci);
fs.writeFileSync(MF,JSON.stringify(all));
const teams={};
all.forEach(d=>d.matches.forEach(m=>{
[m.home,m.away].forEach(n=>{if(!teams[n])teams[n]={name:n,w:0,d:0,l:0,gf:0,ga:0,matches:0,form:[],homeW:0,homeD:0,homeL:0,awayW:0,awayD:0,awayL:0}});
const h=teams[m.home],a=teams[m.away];h.matches++;a.matches++;h.gf+=m.hG;h.ga+=m.aG;a.gf+=m.aG;a.ga+=m.hG;
if(m.result==='1'){h.w++;h.homeW++;a.l++;a.awayL++;h.form.push('W');a.form.push('L')}
else if(m.result==='2'){h.l++;h.homeL++;a.w++;a.awayW++;h.form.push('L');a.form.push('W')}
else{h.d++;h.homeD++;a.d++;a.awayD++;h.form.push('D');a.form.push('D')}}));
Object.values(teams).forEach(t=>t.form=t.form.slice(-15));
fs.writeFileSync(TF,JSON.stringify(teams));
let log=[];try{log=JSON.parse(fs.readFileSync(LF,'utf8'))}catch(e){}
log.push({date:new Date().toISOString(),newMatches:nc,totalDays:all.length,totalMatches:all.reduce((a,d)=>a+d.matches.length,0),totalTeams:Object.keys(teams).length});
fs.writeFileSync(LF,JSON.stringify(log.slice(-30),null,2));
console.log('✅ Done! '+nc+' new, '+all.length+' days, '+Object.keys(teams).length+' teams')}
run().catch(e=>{console.error(e);process.exit(1)});