/**
 * Social Media Post Generator
 * Turns each blog article into Twitter, LinkedIn, and Facebook posts
 * Output: social-posts.json
 */
const fs = require('fs');
const path = require('path');

const articlesDir = './articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
const baseUrl = 'https://aitoolshub-psi.vercel.app/articles/';

const posts = [];

files.forEach(f => {
  try {
    const html = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);
    
    const title = titleMatch ? titleMatch[1].replace(/ — AI Tools Hub| \| AI Tools Hub/g, '').trim() : '';
    const desc = descMatch ? descMatch[1] : '';
    const url = baseUrl + f.replace('.html', '');
    
    if (!title) return;
    
    // Twitter post (280 char limit)
    const twitterPost = title.length > 200 
      ? title.substring(0, 197) + '...\n\n' + url
      : title + '\n\n' + url + '\n\n#AI #AITools #Tech2026';
    
    // LinkedIn post
    const linkedinPost = `🤖 ${title}\n\n${desc.substring(0, 200)}...\n\nRead the full review: ${url}\n\n#AI #ArtificialIntelligence #Technology #SmallBusiness #AITools`;
    
    // Facebook post
    const facebookPost = `${title}\n\n${desc}\n\n👉 ${url}`;
    
    posts.push({
      article: f,
      title,
      url,
      twitter: twitterPost,
      linkedin: linkedinPost,
      facebook: facebookPost,
      scheduled: false
    });
  } catch(e) {}
});

fs.writeFileSync('./social-posts.json', JSON.stringify(posts, null, 2));
console.log('Generated ' + posts.length + ' social media post sets (Twitter + LinkedIn + Facebook)');
console.log('Output: social-posts.json');
