/**
 * Automated SEO Audit Script
 * Checks all articles for: missing meta, broken links, thin content, missing schema
 * Run monthly to maintain quality
 */
const fs = require('fs');
const path = require('path');

const articlesDir = './articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));

const issues = {
  missing_title: [],
  missing_description: [],
  missing_og_image: [],
  missing_canonical: [],
  missing_schema: [],
  thin_content: [],
  missing_h1: [],
  duplicate_titles: {},
  missing_alt_text: [],
  no_internal_links: [],
};

const titles = {};

files.forEach(f => {
  const filepath = path.join(articlesDir, f);
  const html = fs.readFileSync(filepath, 'utf-8');
  
  // Check title
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  if (!titleMatch || !titleMatch[1].trim()) {
    issues.missing_title.push(f);
  } else {
    const title = titleMatch[1].trim();
    if (!titles[title]) titles[title] = [];
    titles[title].push(f);
  }
  
  // Check meta description
  if (!html.includes('name="description"')) {
    issues.missing_description.push(f);
  }
  
  // Check og:image
  if (!html.includes('og:image')) {
    issues.missing_og_image.push(f);
  }
  
  // Check canonical
  if (!html.includes('rel="canonical"')) {
    issues.missing_canonical.push(f);
  }
  
  // Check schema
  if (!html.includes('application/ld+json')) {
    issues.missing_schema.push(f);
  }
  
  // Check content length (thin content < 500 words)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    const text = bodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text.split(' ').length;
    if (words < 500) {
      issues.thin_content.push({ file: f, words });
    }
  }
  
  // Check H1
  if (!html.match(/<h1[^>]*>/i)) {
    issues.missing_h1.push(f);
  }
  
  // Check internal links
  const internalLinks = (html.match(/href="[^"]*\.html"/g) || []).length;
  if (internalLinks < 2) {
    issues.no_internal_links.push(f);
  }
});

// Check duplicate titles
for (const [title, files] of Object.entries(titles)) {
  if (files.length > 1) {
    issues.duplicate_titles[title] = files;
  }
}

// Generate report
let report = '# SEO Audit Report — ' + new Date().toISOString().split('T')[0] + '\n\n';
report += '**Total Articles Scanned:** ' + files.length + '\n\n';

report += '## Summary\n\n';
report += '| Issue | Count |\n|-------|-------|\n';
report += '| Missing Title | ' + issues.missing_title.length + ' |\n';
report += '| Missing Description | ' + issues.missing_description.length + ' |\n';
report += '| Missing OG Image | ' + issues.missing_og_image.length + ' |\n';
report += '| Missing Canonical | ' + issues.missing_canonical.length + ' |\n';
report += '| Missing Schema | ' + issues.missing_schema.length + ' |\n';
report += '| Thin Content (<500 words) | ' + issues.thin_content.length + ' |\n';
report += '| Missing H1 | ' + issues.missing_h1.length + ' |\n';
report += '| Duplicate Titles | ' + Object.keys(issues.duplicate_titles).length + ' |\n';
report += '| No Internal Links | ' + issues.no_internal_links.length + ' |\n';

if (issues.missing_title.length) {
  report += '\n## Missing Titles\n' + issues.missing_title.map(f => '- ' + f).join('\n') + '\n';
}
if (issues.missing_description.length) {
  report += '\n## Missing Descriptions\n' + issues.missing_description.map(f => '- ' + f).join('\n') + '\n';
}
if (issues.thin_content.length) {
  report += '\n## Thin Content\n' + issues.thin_content.map(i => '- ' + i.file + ' (' + i.words + ' words)').join('\n') + '\n';
}
if (Object.keys(issues.duplicate_titles).length) {
  report += '\n## Duplicate Titles\n';
  for (const [title, dups] of Object.entries(issues.duplicate_titles)) {
    report += '- **' + title + '**: ' + dups.join(', ') + '\n';
  }
}

const score = Math.round(100 - (
  (issues.missing_title.length + issues.missing_description.length + 
   issues.missing_og_image.length + issues.missing_canonical.length +
   issues.thin_content.length + issues.missing_h1.length) / files.length * 100
));

report += '\n## Overall SEO Score: ' + score + '/100\n';

fs.writeFileSync('./SEO_AUDIT_REPORT.md', report);
console.log('SEO Audit Complete!');
console.log('Score: ' + score + '/100');
console.log('Issues found:');
console.log('  Missing titles:', issues.missing_title.length);
console.log('  Missing descriptions:', issues.missing_description.length);
console.log('  Missing OG images:', issues.missing_og_image.length);
console.log('  Missing canonical:', issues.missing_canonical.length);
console.log('  Missing schema:', issues.missing_schema.length);
console.log('  Thin content:', issues.thin_content.length);
console.log('  Missing H1:', issues.missing_h1.length);
console.log('  Duplicate titles:', Object.keys(issues.duplicate_titles).length);
console.log('  No internal links:', issues.no_internal_links.length);
