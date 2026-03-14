/**
 * Generate RSS Feed for AI Tools Hub
 */
const fs = require('fs');
const path = require('path');

const articlesDir = './articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
const baseUrl = 'https://aitoolshub-psi.vercel.app';

const articles = [];

files.forEach(f => {
  try {
    const html = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);
    const dateMatch = html.match(/article:published_time.*?content="(\d{4}-\d{2}-\d{2})/);
    
    articles.push({
      title: titleMatch ? titleMatch[1].replace(/&/g, '&amp;').replace(/</g, '&lt;') : f,
      desc: descMatch ? descMatch[1].replace(/&/g, '&amp;').replace(/</g, '&lt;') : '',
      url: baseUrl + '/articles/' + f.replace('.html', ''),
      date: dateMatch ? new Date(dateMatch[1]).toUTCString() : new Date().toUTCString(),
      slug: f.replace('.html', '')
    });
  } catch(e) {}
});

articles.sort((a, b) => new Date(b.date) - new Date(a.date));

let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
rss += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
rss += '<channel>\n';
rss += '  <title>AI Tools Hub</title>\n';
rss += '  <link>' + baseUrl + '</link>\n';
rss += '  <description>Honest AI tool reviews for small business owners</description>\n';
rss += '  <language>en-us</language>\n';
rss += '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n';
rss += '  <atom:link href="' + baseUrl + '/feed.xml" rel="self" type="application/rss+xml"/>\n';

articles.slice(0, 50).forEach(a => {
  rss += '  <item>\n';
  rss += '    <title>' + a.title + '</title>\n';
  rss += '    <link>' + a.url + '</link>\n';
  rss += '    <description>' + a.desc + '</description>\n';
  rss += '    <pubDate>' + a.date + '</pubDate>\n';
  rss += '    <guid>' + a.url + '</guid>\n';
  rss += '  </item>\n';
});

rss += '</channel>\n</rss>';

fs.writeFileSync('./feed.xml', rss);
console.log('RSS feed generated with ' + Math.min(50, articles.length) + ' items');
