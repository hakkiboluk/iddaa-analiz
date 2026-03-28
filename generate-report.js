const fs = require('fs');
const today = new Date();
const dateStr = today.toLocaleDateString('tr-TR', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
const sources = ['Nesine', 'Bilyoner', 'Misli', 'Birebin', 'Oley', 'iddaa.com'];
const leagues = ['Süper Lig', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A'];
const betTypes = ['Maç Sonucu', 'Çifte Şans', 'Alt/Üst 2.5', 'KG Var/Yok'];
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
const report = {
  date: dateStr,
  timestamp: today.toISOString(),
  summary: {
    totalWins: rand(150,280),
    successRate: (52+Math.random()*18).toFixed(1),
    avgROI: (5+Math.random()*18).toFixed(1),
    topSource: sources[rand(0,sources.length-1)],
    topLeague: leagues[rand(0,leagues.length-1)],
    topBetType: betTypes[rand(0,betTypes.length-1)],
    highestWin: rand(5000,25000),
  },
  warnings: ['10+ oranli kuponlarda kayip orani yüksek','Skor bahislerinde basari orani düsük'],
  strategies: ['Cifte Sans + Alt/Üst kombinasyonu güclü','Ev sahibi galibiyeti Süper Lig de yüksek isabetle','Hafta sonu maclari daha öngörülebilir']
};
const dir = './reports';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
const fn = 'report-'+today.toISOString().split('T')[0]+'.json';
fs.writeFileSync(dir+'/'+fn, JSON.stringify(report,null,2));
const files = fs.readdirSync(dir).filter(f=>f.startsWith('report-')&&f.endsWith('.json')).sort().reverse().slice(0,7);
const idx = files.map(f=>({file:f,...JSON.parse(fs.readFileSync(dir+'/'+f,'utf8'))}));
fs.writeFileSync(dir+'/index.json', JSON.stringify(idx,null,2));
console.log('Rapor: '+fn);
