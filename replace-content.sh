#!/bin/bash
# Check the exact placeholder pattern in files
cd /data/.openclaw/workspace/adsense-site/articles
for f in best-ai-for-market-research.html best-ai-for-sales-teams-2026.html best-ai-scheduling-tools.html; do
  echo "=== $f ==="
  grep -n "article-content" "$f"
  echo "---"
done
