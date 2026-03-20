#!/usr/bin/env node

/**
 * SCHEMA VALIDATION SCRIPT
 * Validates that Schema markup was properly injected
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, 'articles');

// Sample files to validate
const SAMPLE_FILES = [
  'ai-brand-monitoring-sentiment-2026.html',
  'ai-etsy-shop-business-guide.html',
  'ai-tools-for-doctors-healthcare.html',
  'ai-content-detection-how-it-works.html',
  'ai-startup-ideas-2026-beginners.html'
];

function validateFile(filename) {
  const filepath = path.join(ARTICLES_DIR, filename);
  const html = fs.readFileSync(filepath, 'utf8');
  
  // Find all Schema scripts
  const schemaRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const matches = [...html.matchAll(schemaRegex)];
  
  console.log(`\n=== ${filename} ===`);
  console.log(`Found ${matches.length} Schema script(s)`);
  
  let hasGraph = false;
  let schemas = [];
  
  matches.forEach((match, index) => {
    try {
      const json = JSON.parse(match[1]);
      
      // Check if it's our new @graph Schema
      if (json['@graph']) {
        hasGraph = true;
        const types = json['@graph'].map(s => s['@type']);
        
        console.log(`\n✅ Schema #${index + 1}: Valid JSON-LD with @graph`);
        console.log(`   Types: ${types.join(', ')}`);
        
        // Count FAQs
        const faq = json['@graph'].find(s => s['@type'] === 'FAQPage');
        if (faq) {
          console.log(`   FAQ questions: ${faq.mainEntity.length}`);
        }
        
        // Count How-To steps
        const howTo = json['@graph'].find(s => s['@type'] === 'HowTo');
        if (howTo) {
          console.log(`   How-To steps: ${howTo.step.length}`);
        }
        
        schemas.push(...types);
      } else if (json['@type']) {
        console.log(`   Schema #${index + 1}: ${json['@type']} (legacy format)`);
        schemas.push(json['@type']);
      }
    } catch (e) {
      console.log(`❌ Schema #${index + 1}: Invalid JSON - ${e.message}`);
    }
  });
  
  if (hasGraph) {
    console.log(`\n✅ SUCCESS: New @graph Schema detected`);
  } else {
    console.log(`\n⚠️  WARNING: No @graph Schema found (may have been skipped if already had Schema)`);
  }
  
  return { filename, hasGraph, schemas };
}

// Main
console.log('🔍 Validating Schema Markup...\n');
console.log('='.repeat(70));

const results = SAMPLE_FILES.map(validateFile);

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 SUMMARY');
console.log('='.repeat(70));

const withGraph = results.filter(r => r.hasGraph).length;
const withoutGraph = results.filter(r => !r.hasGraph).length;

console.log(`✅ Files with new @graph Schema: ${withGraph}`);
console.log(`⚠️  Files without @graph (likely already had Schema): ${withoutGraph}`);

if (withGraph === SAMPLE_FILES.length) {
  console.log(`\n🎉 ALL SAMPLES PASSED! Schema injection was successful.`);
} else if (withGraph > 0) {
  console.log(`\n✅ Partial success - some files already had Schema before script ran.`);
} else {
  console.log(`\n❌ No @graph schemas found - something may be wrong.`);
}
