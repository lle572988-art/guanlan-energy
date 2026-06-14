#!/bin/bash
# MetaphysicFlow Phase 3 — cron templates (static HTML repo)
#
# Install: crontab -e → paste CRON ENTRIES below
# Paths assume repo at ~/Desktop/my-website-latest — adjust PROJECT_DIR

PROJECT_DIR="${PROJECT_DIR:-$HOME/Desktop/my-website-latest}"
LOG_DIR="$PROJECT_DIR/seo-engine/phase3/output/logs"
mkdir -p "$LOG_DIR"

cat << CRON_ENTRIES
# MetaphysicFlow Phase 3 (static HTML)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Daily 06:00 — Reddit scan + reply drafts (DeepSeek via AI_API_KEY)
0 6 * * * cd $PROJECT_DIR && AI_API_KEY=\$AI_API_KEY python3 seo-engine/phase3/social-monitor/social_monitor.py --mode full >> $LOG_DIR/social-monitor.log 2>&1

# Daily 07:30 — Reddit 玄学焦虑截流雷达 (Resend alert)
30 7 * * * cd $PROJECT_DIR && RESEND_API_KEY=\$RESEND_API_KEY TEST_EMAIL=\$TEST_EMAIL node seo-engine/phase3/social-monitor/reddit_radar.mjs >> $LOG_DIR/reddit-radar.log 2>&1

# Weekly Fri 07:00 — Schema audit sample + sitemap refresh
0 7 * * 5 cd $PROJECT_DIR/seo-engine && node phase3/schema-engine/audit-schema.js --sample >> $LOG_DIR/schema-audit.log 2>&1 && npm run seo:sitemap >> $LOG_DIR/sitemap.log 2>&1

# Weekly Mon — Phase 2 competitor intel
0 7 * * 1 cd $PROJECT_DIR/seo-engine && npm run phase2:competitor-intel >> $LOG_DIR/competitor-intel.log 2>&1

CRON_ENTRIES

echo ""
echo "MetaphysicFlow Phase 3 cron templates printed above."
echo "Set: export AI_API_KEY='...'  (DeepSeek — same as Vercel)"
echo "Logs: $LOG_DIR"
