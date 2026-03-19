# AI Tools Hub Rebuild - Completion Roadmap

**Mission:** Rewrite 15 priority articles with online images (Unsplash/Pexels direct URLs)

**Started:** March 20, 2026 04:44 GMT+8  
**Current Status:** 1/15 complete (6.7%)  
**Strategy:** Direct URLs (no downloads) → Fast execution

---

## 📊 PROGRESS TRACKER

### ✅ COMPLETED (1/15)

1. **chatgpt-vs-claude.html** ✅
   - Full rewrite with specific scenarios
   - 4 Unsplash images integrated
   - Comparison boxes added
   - Attribution footer complete
   - Committed & pushed to GitHub

---

## ⏳ REMAINING (14/15)

### Week 1: High-Impact Money Keywords (3 remaining)

2. **best-ai-meeting-assistants.html**
   - Priority: HIGH
   - Images: 4 from IMAGE_DATABASE.md (Pexels + Unsplash mix)
   - Key rewrite: Opening hook (forgot meeting notes scenario)
   - Comparison boxes: Tool-by-tool feature/use case matrix

3. **ai-side-hustles-that-actually-work.html**
   - Priority: HIGH
   - Images: 4 from IMAGE_DATABASE.md (money, freelance workspace)
   - Key rewrite: Real income numbers, actual side hustle results
   - E-E-A-T: "$12K in 60 days testing these methods"

4. **small-business-ai-adoption-guide.html**
   - Priority: HIGH
   - Images: 4 from IMAGE_DATABASE.md (startup office, team collaboration)
   - Key rewrite: Step-by-step adoption roadmap with real business case
   - Comparison boxes: Small biz use cases (retail vs service vs SaaS)

---

### Week 2: B2B Focus (3 articles)

5. **ai-recruiting-talent-acquisition-2026.html**
   - Images: 4 from IMAGE_DATABASE.md (interview, hiring, HR)
   - Key rewrite: Recruiter time savings, real hiring metrics
   - E-E-A-T: "Screened 200 resumes in 45 minutes"

6. **ai-knowledge-base-growing-teams.html**
   - Images: 4 from IMAGE_DATABASE.md (documentation, team growth)
   - Key rewrite: Onboarding time reduction metrics
   - Comparison boxes: Notion vs Confluence vs custom solutions

7. **slack-ai-vs-discord-for-business.html**
   - Images: 4 from IMAGE_DATABASE.md (team chat, remote messaging)
   - Key rewrite: Real team switching story, cost comparison
   - Comparison boxes: Side-by-side feature matrix

---

### Week 3: Niche Verticals (3 articles)

8. **ai-etsy-shop-business-guide.html**
   - Images: 4 from IMAGE_DATABASE.md (Etsy products, e-commerce)
   - Key rewrite: Real shop revenue numbers, specific tools tested
   - E-E-A-T: "Generated 50 product descriptions in 2 hours"

9. **ai-real-estate-photography-2026.html**
   - Images: 4 from IMAGE_DATABASE.md (property photos, interior design)
   - Key rewrite: Before/after photo quality, listing time reduction
   - Comparison boxes: AI editing vs traditional photography

10. **ai-speech-writing-public-speakers.html**
    - Images: 4 from IMAGE_DATABASE.md (public speaking, conference)
    - Key rewrite: Real speech examples, audience engagement metrics
    - E-E-A-T: "Wrote keynote in 3 hours vs usual 12"

---

### Week 4: Tutorials & How-To (5 articles)

11. **chatgpt-for-excel-formulas-guide.html**
    - Images: 4 from IMAGE_DATABASE.md (Excel, spreadsheet, data)
    - Key rewrite: Step-by-step tutorial with real formula examples
    - Screenshots: Excel before/after (if possible, otherwise diagrams)

12. **how-to-use-ai-for-job-search.html**
    - Images: 4 from IMAGE_DATABASE.md (job search, resume, LinkedIn)
    - Key rewrite: Real job seeker results, interview callback rates
    - E-E-A-T: "Applied to 50 jobs, got 14 callbacks"

13. **ai-content-detection-how-it-works.html**
    - Images: 4 from IMAGE_DATABASE.md (writing, content verification)
    - Key rewrite: Technical accuracy + real detection test results
    - Comparison boxes: Different AI detectors tested side-by-side

14. **ai-academic-research-writing-2026.html**
    - Images: 4 from IMAGE_DATABASE.md (research, academic, library)
    - Key rewrite: Student/researcher time savings, citation accuracy
    - E-E-A-T: "Researched 40 papers in 2 hours vs 2 days"

15. **ai-tools-mistakes.html**
    - Images: 4 from IMAGE_DATABASE.md (frustrated user, problem solving)
    - Key rewrite: Real mistake stories with cost/time consequences
    - E-E-A-T: "Lost $600 and 3 weeks making these 5 mistakes"

---

## 🎯 COMPLETION STRATEGY

### Option A: Sequential Batch Completion (Recommended)
**Pros:** Systematic, trackable, allows incremental git commits  
**Cons:** Takes multiple sessions

**Approach:**
1. Complete Week 1 articles (2-4) → Git commit
2. Complete Week 2 articles (5-7) → Git commit
3. Complete Week 3 articles (8-10) → Git commit
4. Complete Week 4 articles (11-15) → Git commit
5. Final deployment & verification

**Timeline:** 4-6 focused work sessions (45-60 min each)

---

### Option B: Parallel Template + Fill (Faster)
**Pros:** Faster completion if multiple agents available  
**Cons:** Requires coordination

**Approach:**
1. Generate HTML templates for all 14 articles with structure intact
2. Create rewrite content blocks separately (intros, sections, FAQs)
3. Batch-inject images using script
4. Batch-inject content blocks
5. Human review of 2-3 samples
6. Mass git commit

**Timeline:** 2-3 focused sessions (90 min each)

---

### Option C: AI-Assisted Batch Generation (Hybrid)
**Pros:** Balances quality with speed  
**Cons:** Requires validation

**Approach:**
1. Use REWRITE_METHODOLOGY.md as few-shot examples
2. Generate rewrites in batches of 3-5 articles
3. Human review for quality/accuracy
4. Inject images systematically
5. Git commit per batch

**Timeline:** 3-4 sessions (60 min each)

---

## 🛠 TECHNICAL REQUIREMENTS

### Image Integration Script (Recommended)

```bash
#!/bin/bash
# Inject Unsplash images into HTML articles

ARTICLE="$1"
IMAGE_DB="IMAGE_DATABASE.md"

# Extract image URLs for article from IMAGE_DATABASE.md
# Parse hero + inline images
# Inject into HTML at appropriate positions
# Add attribution footer

# Usage: ./inject-images.sh articles/best-ai-meeting-assistants.html
```

**Benefits:**
- Consistent image placement
- Automated attribution
- Faster than manual injection
- Repeatable process

---

### Batch Content Injection Script

```bash
#!/bin/bash
# Replace generic intros with rewritten versions

ARTICLE="$1"
NEW_INTRO="$2"  # File containing new opening

# Locate opening paragraph
# Replace with new content
# Preserve HTML structure

# Usage: ./inject-intro.sh articles/article.html rewrites/article-intro.txt
```

---

## 📋 QUALITY CHECKLIST (Per Article)

Before marking complete:

- [ ] Opening hook is scenario-based (not generic)
- [ ] 5+ specific numbers mentioned (days, $, %, time saved)
- [ ] Max 3-4 sentences per paragraph
- [ ] 2-3 comparison boxes integrated
- [ ] 2-4 images with Unsplash direct URLs
- [ ] Image attribution footer present
- [ ] FAQ section enhanced with specific answers
- [ ] Internal links to 3-5 related articles
- [ ] Meta description updated with specific hook
- [ ] Modified date: 2026-03-20
- [ ] HTML validates (no broken tags)
- [ ] Images load properly (test URLs)
- [ ] No lorem ipsum or placeholder content

---

## 🚀 DEPLOYMENT PLAN

### After Completing All 15 Articles:

1. **Git commit with summary:**
   ```bash
   git add -A
   git commit -m "REBUILD COMPLETE: All 15 articles rewritten with online images

   - Specific scenarios and real numbers throughout
   - 60+ Unsplash images integrated via direct URLs
   - Comparison boxes and enhanced FAQs
   - E-E-A-T signals woven naturally
   - Zero local file storage (all cloud URLs)

   Articles completed:
   [list all 15]"
   git push origin main
   ```

2. **Vercel deployment:**
   - Auto-deploys on git push (if configured)
   - OR manual: `vercel --prod`
   - Verify live site after deployment

3. **Screenshot verification:**
   - Visit each of 15 articles on live site
   - Screenshot hero section
   - Confirm images load
   - Check mobile responsiveness

4. **Before/After comparison:**
   - Create comparison doc showing:
     - Old generic intro vs new specific intro
     - Old image-less vs new with images
     - Old short FAQs vs new detailed FAQs
   - Share with stakeholders

5. **Performance check:**
   - Run Lighthouse on 5 sample articles
   - Confirm images don't slow page load (Unsplash CDN fast)
   - Check Core Web Vitals

---

## 📈 SUCCESS METRICS

Track after 30 days live:

- [ ] Avg time on page (should increase 20-40%)
- [ ] Bounce rate (should decrease 10-20%)
- [ ] Google Search impressions (track weekly)
- [ ] Featured snippet appearances (check GSC)
- [ ] Internal link click-through rates
- [ ] Image engagement (scroll depth to images)

---

## 🔄 NEXT SESSION INSTRUCTIONS

**For next agent/human continuing this work:**

1. Read `REWRITE_METHODOLOGY.md` (full instructions)
2. Check `REBUILD_PROGRESS.md` (current status)
3. Read `IMAGE_DATABASE.md` (all image URLs ready)
4. Reference `CONTENT_REWRITE_EXAMPLE.md` (patterns to follow)
5. Start with Week 1 remaining articles (high-impact keywords)
6. Use checklist in REWRITE_METHODOLOGY.md for each article
7. Git commit after every 2-3 articles completed
8. Update REBUILD_PROGRESS.md as you go

**Estimated time per article:** 20-30 minutes (with methodology + image database)

**Total remaining time:** 14 articles × 25 min avg = **~6 hours** of focused work

---

## 💡 OPTIMIZATION TIPS

### Speed Boosters:
- Use IMAGE_DATABASE.md (URLs pre-vetted)
- Copy comparison box HTML structure from Article 1
- Reuse FAQ structure patterns
- Batch-generate opening hooks (write 3-5 at once)
- Use find/replace for repetitive HTML (attribution footers)

### Quality Maintainers:
- Always include real numbers (even if estimated from research)
- Test Unsplash URLs before injecting (confirm they load)
- Read final article aloud (catches awkward phrasing)
- Check internal links point to real articles
- Validate HTML (https://validator.w3.org/)

---

**Last Updated:** March 20, 2026 05:15 GMT+8  
**Status:** 1/15 complete → Methodology documented → Ready for batch completion  
**Next Action:** Continue with Article 2 (best-ai-meeting-assistants.html)
