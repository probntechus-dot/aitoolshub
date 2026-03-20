# Schema Validation Checklist

## ✅ Phase 1: Automated Injection (COMPLETE)
- [x] Script created (`add-schema-markup.js`)
- [x] 117 articles processed
- [x] Article Schema added (117)
- [x] FAQ Schema added (67 articles, 337 Q&A pairs)
- [x] Breadcrumb Schema added (117)
- [x] How-To Schema added (55)
- [x] Git commit completed
- [x] Zero errors during execution

---

## 📋 Phase 2: Validation (DO THIS TODAY)

### 1. Google Rich Results Test (5 Sample URLs)

Test these 5 articles to verify Schema is properly detected:

#### Article with FAQ:
- [ ] https://aitoolshub.com/articles/ai-brand-monitoring-sentiment-2026.html
  - Expected: Article + FAQ + Breadcrumb
  - Paste URL into: https://search.google.com/test/rich-results
  - Screenshot result and save

#### Article with How-To:
- [ ] https://aitoolshub.com/articles/ai-etsy-shop-business-guide.html
  - Expected: Article + How-To + Breadcrumb
  - Test in Rich Results Tool

#### Comparison Article:
- [ ] https://aitoolshub.com/articles/ai-content-detection-how-it-works.html
  - Expected: Article + Breadcrumb (+ possibly FAQ or How-To)

#### Industry Article:
- [ ] https://aitoolshub.com/articles/ai-tools-for-doctors-healthcare.html
  - Expected: Article + Breadcrumb

#### Guide Article:
- [ ] https://aitoolshub.com/articles/ai-startup-ideas-2026-beginners.html
  - Expected: Article + Breadcrumb

### 2. Schema.org Validator

- [ ] Go to: https://validator.schema.org/
- [ ] Test the same 5 URLs above
- [ ] Verify no errors, only warnings (if any)
- [ ] Screenshot each result

### 3. Manual Spot Check (Local Verification)

Run these commands to verify Schema is properly injected:

```bash
# Check if Schema exists
cd /data/.openclaw/workspace/aitoolshub/articles
grep -c '"@context": "https://schema.org"' ai-brand-monitoring-sentiment-2026.html
# Expected: 1

# Validate JSON syntax
node -e "const fs=require('fs'); const html=fs.readFileSync('ai-brand-monitoring-sentiment-2026.html','utf8'); const match=html.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/); JSON.parse(match[1]); console.log('✅ Valid JSON');"

# Count FAQ questions
node -e "const fs=require('fs'); const html=fs.readFileSync('ai-brand-monitoring-sentiment-2026.html','utf8'); const match=html.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/); const json=JSON.parse(match[1]); const faq=json['@graph'].find(s=>s['@type']==='FAQPage'); console.log('FAQ count:', faq?.mainEntity?.length || 0);"
```

- [ ] All 3 tests pass

---

## 🚀 Phase 3: Google Search Console Submission

### 1. Submit Sitemap (If Not Already Done)
- [ ] Go to: Google Search Console → Sitemaps
- [ ] Submit: `https://aitoolshub.com/sitemap.xml`
- [ ] Wait for "Success" status

### 2. Request Indexing for 5 Sample URLs
- [ ] In Search Console, use "URL Inspection" tool
- [ ] Test each of the 5 sample URLs above
- [ ] Click "Request Indexing" for each
- [ ] Note: Google may take 1-7 days to re-index

### 3. Monitor Crawl Stats
- [ ] Go to: Search Console → Settings → Crawl stats
- [ ] Check that Google is actively crawling your site
- [ ] Expected: 50-200 pages/day for a site with 423 articles

---

## 📊 Phase 4: Monitor Results (Week 1-4)

### Week 1: Initial Crawling
- [ ] Check Search Console → Enhancements → Structured Data
- [ ] Verify Article, FAQ, Breadcrumb, How-To appear
- [ ] Check for any errors or warnings

### Week 2-3: Featured Snippets
- [ ] Search for your articles in Google
- [ ] Look for FAQ rich snippets
- [ ] Screenshot any featured snippets that appear
- [ ] Track which articles get snippets (create a list)

### Week 4-8: Performance Tracking
- [ ] Open Search Console → Performance
- [ ] Filter by "Date: Last 28 days"
- [ ] Compare CTR before/after Schema:
  - Baseline (before Schema): _____%
  - After Schema (Week 4): _____%
  - Target improvement: +15-30%

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "Invalid JSON-LD syntax"
**Solution:**
```bash
# Find the broken file
cd /data/.openclaw/workspace/aitoolshub/articles
for f in *.html; do 
  node -e "const fs=require('fs'); const html=fs.readFileSync('$f','utf8'); const match=html.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/); try{JSON.parse(match[1])}catch(e){console.log('❌ $f')}" 2>/dev/null
done
```

### Issue 2: "FAQPage detected but not displayed"
**Check:**
- Are there at least 2 FAQ questions?
- Is the answer text long enough (30+ characters)?
- Wait 1-2 weeks for Google to process

### Issue 3: "How-To not showing in Rich Results"
**Check:**
- Are there at least 3 steps?
- Does each step have a name and description?
- Is the article actually a how-to guide?

---

## 📈 Success Metrics

After 4-8 weeks, measure:

1. **Featured Snippets:**
   - Target: 10-20 articles with FAQ snippets
   - Track in spreadsheet

2. **CTR Improvement:**
   - Baseline: Current average CTR in Search Console
   - Target: +15-30% increase
   - Measure in Search Console → Performance

3. **Impressions:**
   - Monitor if total impressions increase
   - Rich results = more SERP real estate = more visibility

4. **Position:**
   - Articles with Schema may rank higher
   - Track top 10 articles before/after

---

## 🎯 Quick Start (Do This Now)

1. **Immediate (5 minutes):**
   - [ ] Test 1 URL in Google Rich Results Test
   - [ ] Verify Schema is detected

2. **Today (30 minutes):**
   - [ ] Test all 5 sample URLs
   - [ ] Submit sitemap to Search Console
   - [ ] Request indexing for 5 URLs

3. **This Week:**
   - [ ] Monitor Search Console for Schema detection
   - [ ] Check for any errors

4. **Next 4 Weeks:**
   - [ ] Watch for featured snippets
   - [ ] Track CTR changes
   - [ ] Document wins in a Google Sheet

---

## 📝 Notes

- Schema doesn't guarantee featured snippets, but it makes your articles **eligible**
- Google may take 1-4 weeks to process and display rich results
- Not all articles will get snippets — focus on high-quality FAQ content
- Keep FAQ answers concise (50-200 words) for best snippet performance

---

**Last Updated:** 2026-03-20  
**Status:** Ready for validation ✅
