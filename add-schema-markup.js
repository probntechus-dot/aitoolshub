#!/usr/bin/env node

/**
 * SCHEMA MARKUP AUTOMATION SCRIPT
 * Injects Schema.org JSON-LD markup into articles missing it
 * Covers: Article, FAQ, Breadcrumb, and How-To schemas
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ARTICLES_DIR = path.join(__dirname, 'articles');
const BASE_URL = 'https://aitoolshub.com';

// Track results
const results = {
  processed: 0,
  skipped: 0,
  errors: [],
  modified: []
};

/**
 * Extract metadata from HTML
 */
function extractMetadata(dom, filepath) {
  const doc = dom.window.document;
  const filename = path.basename(filepath);
  
  // Extract title (h1 or title tag)
  const h1 = doc.querySelector('h1');
  const titleTag = doc.querySelector('title');
  const headline = h1 ? h1.textContent.trim() : (titleTag ? titleTag.textContent.trim() : 'Untitled');
  
  // Extract meta description
  const metaDesc = doc.querySelector('meta[name="description"]');
  const description = metaDesc ? metaDesc.getAttribute('content') : '';
  
  // Extract first image
  const firstImg = doc.querySelector('img[src*="unsplash"], img.article-hero, article img');
  let imageUrl = '';
  if (firstImg) {
    let src = firstImg.getAttribute('src');
    if (src && src.startsWith('http')) {
      imageUrl = src;
    } else if (src) {
      imageUrl = `${BASE_URL}${src.startsWith('/') ? src : '/articles/' + src}`;
    }
  }
  
  // Extract dates
  const metaPublished = doc.querySelector('meta[property="article:published_time"]');
  const metaModified = doc.querySelector('meta[property="article:modified_time"]');
  let datePublished = metaPublished ? metaPublished.getAttribute('content') : '2026-03-15';
  let dateModified = metaModified ? metaModified.getAttribute('content') : '2026-03-20';
  
  // Fallback: parse from article-meta
  const articleMeta = doc.querySelector('.article-meta');
  if (articleMeta && !metaPublished) {
    const publishMatch = articleMeta.textContent.match(/Published:\s*(\w+\s+\d+,\s+\d{4})/);
    if (publishMatch) {
      datePublished = new Date(publishMatch[1]).toISOString().split('T')[0];
    }
  }
  
  // Article URL
  const articleUrl = `${BASE_URL}/articles/${filename}`;
  
  return {
    headline,
    description,
    imageUrl,
    datePublished,
    dateModified,
    articleUrl,
    filename
  };
}

/**
 * Extract FAQ questions and answers
 */
function extractFAQs(dom) {
  const doc = dom.window.document;
  const faqs = [];
  
  // Look for FAQ section
  const faqHeaders = Array.from(doc.querySelectorAll('h2, h3')).filter(h => 
    /faq|frequently asked questions/i.test(h.textContent)
  );
  
  if (faqHeaders.length === 0) return null;
  
  // Find all Q&A pairs after FAQ header
  faqHeaders.forEach(faqHeader => {
    let current = faqHeader.nextElementSibling;
    
    while (current) {
      // Stop if we hit another h2 (new section)
      if (current.tagName === 'H2' && !(/^Q:|frequently asked/i.test(current.textContent))) {
        break;
      }
      
      // Match h3 questions (Q: format)
      if (current.tagName === 'H3') {
        const questionText = current.textContent.trim().replace(/^Q:\s*/i, '');
        const answer = current.nextElementSibling;
        
        if (answer && (answer.tagName === 'P' || answer.tagName === 'DIV')) {
          faqs.push({
            question: questionText,
            answer: answer.textContent.trim()
          });
        }
      }
      
      current = current.nextElementSibling;
    }
  });
  
  return faqs.length > 0 ? faqs : null;
}

/**
 * Detect How-To content
 */
function extractHowTo(dom, metadata) {
  const doc = dom.window.document;
  const steps = [];
  
  // Look for step-by-step patterns
  const stepHeaders = Array.from(doc.querySelectorAll('h2, h3')).filter(h => 
    /step \d+|^\d+\.|how to/i.test(h.textContent)
  );
  
  if (stepHeaders.length < 3) return null; // Need at least 3 steps
  
  stepHeaders.forEach((header, index) => {
    const stepText = header.textContent.trim();
    const stepDesc = header.nextElementSibling;
    
    if (stepDesc && stepDesc.tagName === 'P') {
      steps.push({
        name: stepText,
        text: stepDesc.textContent.trim(),
        position: index + 1
      });
    }
  });
  
  if (steps.length < 3) return null;
  
  return {
    name: metadata.headline,
    description: metadata.description,
    steps: steps.slice(0, 10) // Max 10 steps
  };
}

/**
 * Determine category from filename
 */
function getCategoryFromFilename(filename) {
  if (filename.includes('vs') || filename.includes('comparison')) return 'Comparisons';
  if (filename.includes('tools-for')) return 'Industries';
  if (filename.includes('how-to') || filename.includes('guide')) return 'Guides';
  return 'AI Tools';
}

/**
 * Generate Schema markup
 */
function generateSchema(metadata, faqs, howTo) {
  const category = getCategoryFromFilename(metadata.filename);
  
  const graph = [];
  
  // 1. Article Schema
  graph.push({
    "@type": "Article",
    "@id": `${metadata.articleUrl}#article`,
    "headline": metadata.headline,
    "description": metadata.description,
    "image": metadata.imageUrl || `${BASE_URL}/favicon.svg`,
    "datePublished": metadata.datePublished,
    "dateModified": metadata.dateModified,
    "author": {
      "@type": "Person",
      "name": "Sarah Mitchell",
      "jobTitle": "Small Business Owner & AI Tools Reviewer"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "#organization",
      "name": "AI Tools Hub",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`,
        "width": 250,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": metadata.articleUrl
    },
    "articleSection": category
  });
  
  // 2. FAQ Schema (if FAQs exist)
  if (faqs && faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }
  
  // 3. Breadcrumb Schema
  graph.push({
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category,
        "item": `${BASE_URL}/#categories`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": metadata.headline
      }
    ]
  });
  
  // 4. How-To Schema (if applicable)
  if (howTo && howTo.steps.length >= 3) {
    graph.push({
      "@type": "HowTo",
      "name": howTo.name,
      "description": howTo.description,
      "step": howTo.steps.map(step => ({
        "@type": "HowToStep",
        "position": step.position,
        "name": step.name,
        "text": step.text
      }))
    });
  }
  
  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

/**
 * Inject Schema into HTML
 */
function injectSchema(htmlContent, schema) {
  const schemaScript = `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  
  // Insert before </head>
  if (htmlContent.includes('</head>')) {
    return htmlContent.replace('</head>', `    ${schemaScript}\n</head>`);
  }
  
  // Fallback: insert after opening <head>
  return htmlContent.replace('<head>', `<head>\n    ${schemaScript}`);
}

/**
 * Process a single article
 */
function processArticle(filepath) {
  try {
    const htmlContent = fs.readFileSync(filepath, 'utf8');
    
    // Skip if already has Schema
    if (htmlContent.includes('"@context": "https://schema.org"')) {
      results.skipped++;
      return false;
    }
    
    // Parse HTML
    const dom = new JSDOM(htmlContent);
    
    // Extract metadata
    const metadata = extractMetadata(dom, filepath);
    
    // Extract FAQs
    const faqs = extractFAQs(dom);
    
    // Extract How-To
    const howTo = extractHowTo(dom, metadata);
    
    // Generate Schema
    const schema = generateSchema(metadata, faqs, howTo);
    
    // Inject Schema
    const updatedHtml = injectSchema(htmlContent, schema);
    
    // Write back
    fs.writeFileSync(filepath, updatedHtml, 'utf8');
    
    results.processed++;
    results.modified.push({
      file: path.basename(filepath),
      hasFAQ: !!faqs,
      faqCount: faqs ? faqs.length : 0,
      hasHowTo: !!howTo
    });
    
    return true;
    
  } catch (error) {
    results.errors.push({
      file: path.basename(filepath),
      error: error.message
    });
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting Schema Markup Injection...\n');
  
  // Get all HTML files
  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(ARTICLES_DIR, f));
  
  console.log(`📁 Found ${files.length} HTML files\n`);
  
  // Process each file
  files.forEach((filepath, index) => {
    const filename = path.basename(filepath);
    const processed = processArticle(filepath);
    
    if (processed) {
      process.stdout.write(`✅ [${index + 1}/${files.length}] ${filename}\n`);
    } else {
      process.stdout.write(`⏭️  [${index + 1}/${files.length}] ${filename} (already has Schema)\n`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Processed: ${results.processed}`);
  console.log(`⏭️  Skipped (already had Schema): ${results.skipped}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  
  if (results.processed > 0) {
    const withFAQ = results.modified.filter(m => m.hasFAQ).length;
    const withHowTo = results.modified.filter(m => m.hasHowTo).length;
    const totalFAQs = results.modified.reduce((sum, m) => sum + m.faqCount, 0);
    
    console.log(`\n📋 Schema Types Added:`);
    console.log(`   - Article Schema: ${results.processed}`);
    console.log(`   - FAQ Schema: ${withFAQ} articles (${totalFAQs} total Q&A pairs)`);
    console.log(`   - Breadcrumb Schema: ${results.processed}`);
    console.log(`   - How-To Schema: ${withHowTo}`);
  }
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    results.errors.forEach(err => {
      console.log(`   - ${err.file}: ${err.error}`);
    });
  }
  
  console.log('\n✨ Schema markup injection complete!');
}

// Execute
main();
