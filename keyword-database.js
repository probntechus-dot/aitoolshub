/**
 * Master SEO Keyword Database
 * Extracts all target keywords from articles and organizes them
 */
const fs = require('fs');
const path = require('path');

const articlesDir = './articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));

const keywordMap = {};

files.forEach(f => {
  try {
    const html = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
    const kwMatch = html.match(/<meta name="keywords" content="(.*?)"/);
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    
    const title = titleMatch ? titleMatch[1].replace(/ — AI Tools Hub| \| AI Tools Hub/g, '').trim() : f;
    
    if (kwMatch) {
      const keywords = kwMatch[1].split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 2);
      keywords.forEach(kw => {
        if (!keywordMap[kw]) {
          keywordMap[kw] = { keyword: kw, articles: [], count: 0 };
        }
        keywordMap[kw].articles.push(f.replace('.html', ''));
        keywordMap[kw].count++;
      });
    }
    
    // Also extract from title
    const titleWords = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);
    
    // Create bigrams from title
    for (let i = 0; i < titleWords.length - 1; i++) {
      const bigram = titleWords[i] + ' ' + titleWords[i+1];
      if (!keywordMap[bigram]) {
        keywordMap[bigram] = { keyword: bigram, articles: [], count: 0 };
      }
      if (!keywordMap[bigram].articles.includes(f.replace('.html', ''))) {
        keywordMap[bigram].articles.push(f.replace('.html', ''));
        keywordMap[bigram].count++;
      }
    }
  } catch(e) {}
});

// Sort by frequency
const sorted = Object.values(keywordMap)
  .sort((a, b) => b.count - a.count)
  .slice(0, 500);

// Generate CSV
let csv = 'Keyword,Article Count,Articles\n';
sorted.forEach(kw => {
  csv += '"' + kw.keyword + '",' + kw.count + ',"' + kw.articles.slice(0, 5).join('; ') + '"\n';
});

fs.writeFileSync('./keyword-database.csv', csv);

// Generate MD report
let md = '# Master Keyword Database\n\n';
md += '**Generated:** ' + new Date().toISOString().split('T')[0] + '\n';
md += '**Total Unique Keywords:** ' + Object.keys(keywordMap).length + '\n';
md += '**Articles Scanned:** ' + files.length + '\n\n';

md += '## Top 50 Keywords by Frequency\n\n';
md += '| Keyword | Articles | Coverage |\n|---------|----------|----------|\n';
sorted.slice(0, 50).forEach(kw => {
  md += '| ' + kw.keyword + ' | ' + kw.count + ' | ' + Math.round(kw.count / files.length * 100) + '% |\n';
});

md += '\n## Keyword Gaps (Potential New Articles)\n\n';
md += 'High-value keywords not well covered:\n\n';

const gapKeywords = [
  'ai tools for teachers', 'ai tools for hr', 'ai tools for nonprofits',
  'ai customer service chatbot', 'ai inventory management', 'ai sales forecasting',
  'ai tools for architects', 'ai tools for musicians', 'ai tools for therapists',
  'best ai crm tools', 'ai tools for churches', 'ai tools for veterinarians'
];

gapKeywords.forEach(kw => {
  const exists = keywordMap[kw];
  md += '- **' + kw + '**: ' + (exists ? exists.count + ' articles' : '❌ No coverage — write this!') + '\n';
});

fs.writeFileSync('./KEYWORD_DATABASE.md', md);
console.log('Keyword database generated!');
console.log('Total unique keywords:', Object.keys(keywordMap).length);
console.log('Top 5:', sorted.slice(0, 5).map(k => k.keyword + ' (' + k.count + ')').join(', '));
