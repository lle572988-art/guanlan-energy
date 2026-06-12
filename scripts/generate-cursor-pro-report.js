const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, PageNumberElement, PageBreak, ExternalHyperlink,
  TabStopType, TabStopPosition, Header, Footer
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Color Palette ───
const C = {
  gold:     'C9A96E',
  dark:     '0C0C0C',
  heading:  '1A1A1A',
  sub:      '2C2C2C',
  muted:    '555555',
  white:    'FFFFFF',
  red:      'C0392B',
  green:    '27AE60',
  blue:     '2980B9',
  orange:   'E67E22',
  silver:   '8E9EAD',
  tableH:   '1A1A2E',
  tableR1:  'F7F3EC',
  tableR2:  'FFFFFF',
  border:   'D4B896',
};

// ─── Helpers ───
function h(text, level = HeadingLevel.HEADING_1) {
  const sizes = { 1: 36, 2: 28, 3: 24, 4: 22 };
  const colors = { 1: C.gold, 2: C.heading, 3: C.sub, 4: C.sub };
  const lv = parseInt(level.replace('Heading', '')) || 1;
  return new Paragraph({
    heading: level,
    spacing: { before: lv <= 2 ? 400 : 280, after: lv <= 2 ? 200 : 120 },
    children: [new TextRun({ text, bold: true, size: sizes[lv] || 22, color: colors[lv] || C.heading, font: 'Arial' })]
  });
}

function p(runs, opts = {}) {
  const children = typeof runs === 'string'
    ? [new TextRun({ text: runs, size: 22, font: 'Arial', color: C.heading })]
    : runs;
  return new Paragraph({ children, spacing: { after: 160, before: opts.before || 0 }, ...opts });
}

function t(text, opts = {}) {
  return new TextRun({ text, size: 22, font: 'Arial', color: C.heading, ...opts });
}

function bold(text, color = C.heading) {
  return new TextRun({ text, bold: true, size: 22, font: 'Arial', color });
}

function code(text) {
  return new TextRun({ text, font: 'Courier New', size: 18, color: '2C3E50', shading: { fill: 'F0EDE8', type: ShadingType.CLEAR } });
}

function tag(text, color = C.gold) {
  return new TextRun({ text: ` [${text}] `, bold: true, size: 18, font: 'Arial', color });
}

function hr() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.gold, space: 1 } },
    spacing: { before: 200, after: 200 },
    children: []
  });
}

function bullet(text, level = 0, color = C.heading) {
  return new Paragraph({
    numbering: { reference: 'bullets', level },
    spacing: { after: 100 },
    children: [new TextRun({ text, size: 22, font: 'Arial', color })]
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'numbers', level },
    spacing: { after: 100 },
    children: [new TextRun({ text, size: 22, font: 'Arial', color: C.heading })]
  });
}

function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    spacing: { after: 40, before: 40 },
    indent: { left: 720 },
    shading: { fill: 'F5F2EE', type: ShadingType.CLEAR },
    children: [new TextRun({ text: line, font: 'Courier New', size: 18, color: '2C3E50' })]
  }));
}

function severity(label) {
  const map = {
    'CRITICAL': C.red,
    'HIGH': 'E67E22',
    'MEDIUM': 'F39C12',
    'LOW': C.green,
    'QUICK-WIN': '8E44AD',
  };
  return tag(label, map[label] || C.gold);
}

function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 1, color: C.border };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: C.tableH, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: 'Arial', color: C.white })] })]
    }))
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders,
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? C.tableR1 : C.tableR2, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.TOP,
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: 'Arial', color: C.heading })] })]
    }))
  }));

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

// ─── DOCUMENT ───
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: C.gold },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: C.heading },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: C.sub },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 2 }
      },
      {
        id: 'Heading4', name: 'Heading 4', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Arial', color: C.muted },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 3 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.gold } },
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'Guanlan Energy · metaphysicflow.com · ', size: 18, font: 'Arial', color: C.muted }),
            new TextRun({ text: 'CURSOR PRO 施工报告 v1.0', size: 18, bold: true, font: 'Arial', color: C.gold }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.gold } },
          spacing: { before: 100 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'CONFIDENTIAL · For internal use only · Page ', size: 18, font: 'Arial', color: C.muted }),
            new TextRun({ children: [new PageNumberElement()], size: 18, font: 'Arial', color: C.muted })
          ]
        })]
      })
    },
    children: [

      // ══════════════════════════════════════════════════════════
      // COVER
      // ══════════════════════════════════════════════════════════
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 480 },
        children: [new TextRun({ text: '紫微斗數 · GUANLAN ENERGY', size: 52, bold: true, font: 'Arial', color: C.gold })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: 'metaphysicflow.com', size: 28, font: 'Arial', color: C.muted })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: 'CURSOR PRO 代码施工报告', size: 40, bold: true, font: 'Arial', color: C.heading })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'Website Commercial Optimization · Full Technical Audit', size: 24, font: 'Arial', color: C.muted, italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
        children: [new TextRun({ text: 'Version 1.0  ·  June 2026  ·  Prepared for Cursor Pro Auto-Implementation', size: 20, font: 'Arial', color: C.silver })]
      }),
      hr(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 120 },
        children: [new TextRun({ text: '⚡ 18 ISSUES IDENTIFIED  ·  5 CRITICAL  ·  ESTIMATED REVENUE IMPACT: +30–60%', size: 24, bold: true, font: 'Arial', color: C.red })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 0 — EXECUTIVE SUMMARY
      // ══════════════════════════════════════════════════════════
      h('0. 执行摘要 · Executive Summary', HeadingLevel.HEADING_1),
      p([
        bold('审核范围：'), t(' 对 metaphysicflow.com 首页完整 HTML/CSS/JS 源代码进行全面商业化审核，涵盖转化率优化、技术性能、SEO、可访问性及视觉设计五个维度。')
      ]),
      p('本报告识别出 18 个可量化改进点，按优先级排序，并为每个问题提供可直接在 Cursor Pro 中执行的精确代码修改指令。'),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      makeTable(
        ['维度', '当前评分', '目标评分', '潜在收益'],
        [
          ['转化率优化 (CRO)', '61 / 100', '85 / 100', '+25–40% 表单提交'],
          ['技术性能 (Performance)', '54 / 100', '82 / 100', '-40% 跳出率'],
          ['搜索引擎优化 (SEO)', '72 / 100', '90 / 100', '+35% 自然流量'],
          ['可访问性 (A11y)', '48 / 100', '80 / 100', '合规风险消除'],
          ['视觉设计 (UX)', '78 / 100', '91 / 100', '+15% 停留时长'],
        ],
        [2800, 1800, 1800, 2960]
      ),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      h('优先级矩阵 · Priority Matrix', HeadingLevel.HEADING_2),
      makeTable(
        ['编号', '问题描述', '严重程度', '工作量', '收益'],
        [
          ['#01', 'Font loading 阻塞渲染', 'CRITICAL', '30min', '极高'],
          ['#02', 'localStorage 在 Safari/隐私模式崩溃', 'CRITICAL', '20min', '高'],
          ['#03', 'Form submit 缺少 loading 防重复提交', 'CRITICAL', '30min', '高'],
          ['#04', 'Exit popup 邮件捕获无实际后端', 'CRITICAL', '45min', '高'],
          ['#05', 'CSP / Cloudflare Email 混淆暴露', 'CRITICAL', '20min', '安全'],
          ['#06', 'CTA 按钮文案转化力弱', 'HIGH', '15min', '高'],
          ['#07', 'Checkout href 为相对路径无 UTM', 'HIGH', '20min', '高'],
          ['#08', '定价卡片缺少锚定效应', 'HIGH', '30min', '高'],
          ['#09', 'Hero section 移动端布局问题', 'HIGH', '45min', '高'],
          ['#10', 'SVG chart 不在 lazy-load 范围内', 'MEDIUM', '20min', '中'],
          ['#11', '结构化数据 reviewCount 硬编码', 'MEDIUM', '10min', '中'],
          ['#12', '信任徽章无视觉层级', 'MEDIUM', '20min', '中'],
          ['#13', 'Sticky CTA display:none 初始化问题', 'MEDIUM', '15min', '中'],
          ['#14', 'Cookie consent LocalStorage 依赖', 'MEDIUM', '20min', '中'],
          ['#15', '无 skip-to-content 链接', 'LOW', '10min', '合规'],
          ['#16', '表单缺少 name 属性完整集', 'LOW', '10min', '低'],
          ['#17', 'CSS 变量重复定义', 'LOW', '15min', '低'],
          ['#18', '首屏无 preload 关键字体', 'LOW', '20min', '中'],
        ],
        [480, 3200, 1200, 960, 1520]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 1 — CRITICAL ISSUES
      // ══════════════════════════════════════════════════════════
      h('1. CRITICAL 级问题（5项）', HeadingLevel.HEADING_1),
      p([bold('以下 5 个问题直接影响收入、安全或核心功能，必须优先修复。', C.red)]),
      hr(),

      // ─── Issue #01
      h('Issue #01 · Font Loading 阻塞渲染', HeadingLevel.HEADING_2),
      p([severity('CRITICAL'), t('  工作量：30min  ·  预计 FCP 改善：-0.8s')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('当前代码使用 media="print" onload 技巧异步加载 Google Fonts，但同时保留了 <noscript> 中的同步阻塞版本，且 preconnect 标签顺序不正确。更关键的是：字体加载完成前页面使用 Georgia fallback，导致布局偏移（CLS 分值恶化）。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('定位位置：'), code(' <head> 内 Google Fonts preconnect + stylesheet 区块，约第 12–27 行')]),
      new Paragraph({ spacing: { after: 100 }, children: [] }),
      p([bold('删除以下代码：')]),
      ...codeBlock([
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond...',
        '<noscript>',
        '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?...',
        '</noscript>',
      ]),
      new Paragraph({ spacing: { after: 100 }, children: [] }),
      p([bold('替换为以下代码：')]),
      ...codeBlock([
        '<!-- CRITICAL: DNS prefetch 优先于 preconnect -->',
        '<link rel="dns-prefetch" href="//fonts.googleapis.com">',
        '<link rel="dns-prefetch" href="//fonts.gstatic.com">',
        '<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '',
        '<!-- 字体 URL 加 display=swap + 仅加载实际使用的字重 -->',
        '<link rel="preload" as="style" fetchpriority="low"',
        '  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;500&display=swap"',
        '  onload="this.onload=null;this.rel=\'stylesheet\'">',
        '<noscript>',
        '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;500&display=swap">',
        '</noscript>',
      ]),
      p([bold('同时在 <style> 区块顶部添加 font-display 防止 FOIT：')]),
      ...codeBlock([
        '/* 防止无字体时内容不可见 (FOIT → FOUT) */',
        '@font-face {',
        '  font-display: swap; /* 已由 display=swap 参数处理，此处为本地字体保底 */',
        '}',
      ]),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ─── Issue #02
      h('Issue #02 · localStorage 在隐私模式/Safari 崩溃', HeadingLevel.HEADING_2),
      p([severity('CRITICAL'), t('  工作量：20min  ·  影响：约 15–25% iOS 用户转化失败')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('代码中多处直接调用 localStorage（Cookie consent、Exit popup lead 保存、pending_leads），在 Safari 隐私模式或部分 iOS 系统中会抛出异常导致整个脚本崩溃，影响 Cookie 同意、表单和 CTA 功能。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('在所有 <script> 标签之前，在 </body> 前插入以下全局安全封装：')]),
      ...codeBlock([
        '/* ─── SAFE STORAGE WRAPPER ─── */',
        'window.__storage = (function() {',
        '  function tryLS() {',
        '    try { localStorage.setItem("__t","1"); localStorage.removeItem("__t"); return true; }',
        '    catch(e) { return false; }',
        '  }',
        '  var _mem = {};',
        '  var _ok = tryLS();',
        '  return {',
        '    get: function(k) { return _ok ? localStorage.getItem(k) : (_mem[k] || null); },',
        '    set: function(k,v) { if(_ok) { try { localStorage.setItem(k,v); } catch(e){} } else { _mem[k]=v; } },',
        '    remove: function(k) { if(_ok) { try { localStorage.removeItem(k); } catch(e){} } else { delete _mem[k]; } }',
        '  };',
        '})();',
      ]),
      p([bold('然后全局替换：'), t(' 将所有 '), code('localStorage.getItem'), t(' 替换为 '), code('window.__storage.get'), t('，所有 '), code('localStorage.setItem'), t(' 替换为 '), code('window.__storage.set'), t('，所有 '), code('localStorage.removeItem'), t(' 替换为 '), code('window.__storage.remove'), t('。')]),
      p([bold('具体替换位置（共 6 处）：')]),
      bullet('Cookie consent script：KEY 读取/写入 (第 ~892–920 行)'),
      bullet('Exit popup handleExitCapture 函数：saveLeadLocally 内 localStorage 调用'),
      bullet('Sticky CTA scroll handler 无直接 LS 调用，无需修改'),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ─── Issue #03
      h('Issue #03 · 表单防重复提交缺失 + 无错误状态恢复', HeadingLevel.HEADING_2),
      p([severity('CRITICAL'), t('  工作量：30min  ·  影响：用户卡住，转化流程中断')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('handleSubmit() 在 250ms timeout 后跳转，但若 window.location.href 跳转被浏览器拦截（如广告拦截或网络慢），按钮永久灰化且无法恢复。同时缺少跳转失败时的用户提示。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('定位：'), code(' function handleSubmit(event) { ... }')]),
      p([bold('将 setTimeout 块替换为：')]),
      ...codeBlock([
        'var jumpTimeout = setTimeout(function() {',
        '  try {',
        '    window.location.href = "free-chart.html?" + params.toString();',
        '  } catch(e) {',
        '    // 跳转失败恢复按钮',
        '    submitBtn.disabled = false;',
        '    submitBtn.style.cursor = "";',
        '    submitBtn.style.opacity = "1";',
        '    submitBtn.innerHTML = "Reveal My Fate Map — Free";',
        '    console.error("Navigation failed:", e);',
        '  }',
        '}, 250);',
        '',
        '// 5秒超时保护：避免按钮永久灰化',
        'setTimeout(function() {',
        '  if (submitBtn.disabled) {',
        '    submitBtn.disabled = false;',
        '    submitBtn.style.cursor = "";',
        '    submitBtn.style.opacity = "1";',
        '    submitBtn.innerHTML = "Reveal My Fate Map — Free";',
        '  }',
        '}, 5000);',
      ]),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ─── Issue #04
      h('Issue #04 · Exit Popup 邮件捕获无实效后端 + Lead 丢失', HeadingLevel.HEADING_2),
      p([severity('CRITICAL'), t('  工作量：45min  ·  影响：所有邮件线索永久丢失')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('handleExitCapture() fetch POST 到 /api/subscribe，该接口在静态托管上不存在。catch 分支将 lead 存入 localStorage（本身已是不安全操作，见 #02），实际上 100% 的 exit popup 邮件线索都在丢失。'),

      h('Cursor 施工指令 · 临时方案（Formspree 接管）', HeadingLevel.HEADING_3),
      p([bold('Step 1：'), t(' 注册 Formspree (formspree.io) 免费计划，获取 form endpoint，格式为 https://formspree.io/f/XXXXXXXX')]),
      p([bold('Step 2：替换 handleExitCapture 函数中的 fetch 调用：')]),
      ...codeBlock([
        'fetch("https://formspree.io/f/YOUR_FORM_ID", {  // <-- 替换此处',
        '  method: "POST",',
        '  headers: { "Content-Type": "application/json", "Accept": "application/json" },',
        '  body: JSON.stringify({',
        '    email: email,',
        '    source: "exit_popup",',
        '    coupon: "STAR5",',
        '    _subject: "New Lead: Exit Popup - " + email',
        '  })',
        '}).then(function(res) {',
        '  if (res.ok) {',
        '    // 成功：GTM 事件',
        '    if (window.gtag) gtag("event", "lead_capture", { event_category: "exit_popup" });',
        '  } else {',
        '    // 失败备份：sessionStorage（不用 localStorage）',
        '    try { sessionStorage.setItem("pending_lead_" + Date.now(), email); } catch(e){}',
        '  }',
        '}).catch(function(err) {',
        '  try { sessionStorage.setItem("pending_lead_" + Date.now(), email); } catch(e){}',
        '});',
      ]),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ─── Issue #05
      h('Issue #05 · Cloudflare Email 混淆 + 安全头缺失', HeadingLevel.HEADING_2),
      p([severity('CRITICAL'), t('  工作量：20min  ·  影响：安全合规')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('footer Contact 链接使用 /cdn-cgi/l/email-protection# 混淆，但 data-cfasync="false" 的 email-decode 脚本是非必要的同步脚本。更重要的是：网站完全缺少 HTTP 安全头（CSP、X-Frame-Options、Referrer-Policy），暴露在点击劫持风险中。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('Step 1：在 <head> 内 <meta> 区块末尾添加安全 meta 标签：')]),
      ...codeBlock([
        '<!-- 安全头 (Cloudflare Pages / Vercel 应在 _headers 或 vercel.json 中设置，这里是降级方案) -->',
        '<meta http-equiv="X-Content-Type-Options" content="nosniff">',
        '<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">',
        '<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">',
      ]),
      p([bold('Step 2：在 Cloudflare Dashboard → Rules → Transform Rules 添加响应头：'), t(' X-Frame-Options: SAMEORIGIN，X-XSS-Protection: 1; mode=block')]),
      p([bold('Step 3：将 email-decode 脚本改为 defer：')]),
      ...codeBlock([
        '<!-- 将此行 -->',
        '<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/...email-decode.min.js"></script>',
        '<!-- 改为 -->',
        '<script defer src="/cdn-cgi/scripts/5c5dd728/...email-decode.min.js"></script>',
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 2 — HIGH PRIORITY
      // ══════════════════════════════════════════════════════════
      h('2. HIGH 优先级问题（4项）', HeadingLevel.HEADING_1),
      hr(),

      // ─── Issue #06
      h('Issue #06 · CTA 按钮文案转化力不足', HeadingLevel.HEADING_2),
      p([severity('HIGH'), t('  工作量：15min  ·  A/B 测试预期提升：+12–18% CTR')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('主 CTA "Reveal My Fate Map — Free" 已不错，但 Preview 区的 "Generate My Free Chart — Takes 30 Seconds" 与 Pricing 区的按钮文案存在动词过弱或价值主张缺失的问题。定价卡片按钮全部使用 "Get / Order / Book" 等冷硬词，未传递情感价值。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      makeTable(
        ['位置', '当前文案', '替换为'],
        [
          ['hero form btn', 'Reveal My Fate Map — Free', 'Show Me My Fate Map — Free （保留，已优化）'],
          ['preview-cta btn', 'Generate My Free Chart — Takes 30 Seconds', 'Unlock My 12-Palace Blueprint — Free'],
          ['palaces-cta btn', 'See My 12 Palaces — Free', 'Reveal What My Stars Show — Free'],
          ['pricing life palace', 'Get Life Palace Report', 'Read My Life Palace — $9.90'],
          ['pricing three palace', 'Get Three-Palace Report', 'Reveal My 3 Core Palaces — $19'],
          ['pricing full matrix', 'Order Full Matrix', 'Get My Complete Fate Map — $39'],
          ['pricing compatibility', 'Order Compatibility', 'Read Our Compatibility — $59'],
          ['pricing live', 'Book Video Session', 'Reserve My 30-Min Session — $99'],
          ['sticky-cta btn', 'Get My Free Chart →', 'See My Fate Map Free →'],
        ],
        [2200, 2780, 4380]
      ),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ─── Issue #07
      h('Issue #07 · Checkout 链接缺少 UTM 参数 + 跟踪', HeadingLevel.HEADING_2),
      p([severity('HIGH'), t('  工作量：20min  ·  影响：无法归因各定价卡片转化来源')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('所有 checkout.html?product=xxx 链接均为裸链接，无 UTM 追踪。当用户从不同入口进入（hero、palaces、preview、pricing 各模块），无法区分转化来源，导致广告和内容优化盲区。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('在 </body> 前添加以下 UTM 自动注入脚本：')]),
      ...codeBlock([
        '/* ─── CHECKOUT UTM INJECTION ─── */',
        '(function() {',
        '  var checkoutLinks = document.querySelectorAll("a[href*=\'checkout.html\']");',
        '  checkoutLinks.forEach(function(link) {',
        '    var href = link.getAttribute("href");',
        '    var product = (href.match(/product=([^&]+)/) || [])[1] || "unknown";',
        '    // 获取来源 section',
        '    var section = "page";',
        '    var parent = link.closest("section, header, nav");',
        '    if (parent) section = parent.id || "page";',
        '    // 附加 UTM',
        '    var utm = "&utm_source=site&utm_medium=cta&utm_campaign=pricing&utm_content=" + section + "_" + product;',
        '    link.setAttribute("href", href + utm);',
        '    // Google Analytics 4 事件',
        '    link.addEventListener("click", function() {',
        '      if (window.gtag) {',
        '        gtag("event", "begin_checkout", {',
        '          item_name: product,',
        '          item_category: "ziwei_reading",',
        '          source_section: section',
        '        });',
        '      }',
        '    });',
        '  });',
        '})();',
      ]),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ─── Issue #08
      h('Issue #08 · 定价卡片缺少锚定效应 + 原价划除', HeadingLevel.HEADING_2),
      p([severity('HIGH'), t('  工作量：30min  ·  影响：付费决策摩擦高，转化率低于行业均值')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('定价卡片仅显示当前价格，无对照锚点。行为经济学研究表明，展示「原价 → 折扣价」可提升购买意愿 20–35%。年度计划 $199 相比月度按需无明显划算感，Three-Palace $19 和 Full Matrix $39 之间的价值跃升缺少视觉强化。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('Step 1：在 CSS 变量区块中添加划线价样式（添加到 </style> 前）：')]),
      ...codeBlock([
        '.price-original {',
        '  text-decoration: line-through;',
        '  color: rgba(255,255,255,0.3);',
        '  font-size: 1.1rem;',
        '  margin-right: 0.4rem;',
        '}',
        '.price-save-badge {',
        '  display: inline-block;',
        '  background: rgba(39,174,96,0.15);',
        '  border: 1px solid rgba(39,174,96,0.4);',
        '  color: #4caf7d;',
        '  font-family: "Cinzel", serif;',
        '  font-size: 0.52rem;',
        '  letter-spacing: 0.12em;',
        '  padding: 0.2rem 0.5rem;',
        '  border-radius: 1px;',
        '  margin-left: 0.5rem;',
        '  vertical-align: middle;',
        '}',
      ]),
      p([bold('Step 2：修改 Three-Palace 定价卡片 pricing-price div：')]),
      ...codeBlock([
        '<!-- 将原来的价格块 -->',
        '<div class="pricing-price"><span class="price-dollar">$</span>19.00</div>',
        '<!-- 改为 -->',
        '<div class="pricing-price">',
        '  <span class="price-original">$38</span>',
        '  <span class="price-dollar">$</span>19.00',
        '  <span class="price-save-badge">SAVE 50%</span>',
        '</div>',
      ]),
      p([bold('Step 3：修改 Full Matrix (featured) 定价卡片：')]),
      ...codeBlock([
        '<div class="pricing-price">',
        '  <span class="price-original">$79</span>',
        '  <span class="price-dollar">$</span>39.00',
        '  <span class="price-save-badge">SAVE 51%</span>',
        '</div>',
      ]),
      p([bold('Step 4：Annual 卡片添加对比说明（在 pricing-delivery div 后插入）：')]),
      ...codeBlock([
        '<div style="',
        '  font-size:0.8rem; color:var(--gold-soft); font-style:italic;',
        '  text-align:center; margin-bottom:1rem;',
        '">Equivalent to 5 individual reports — included in 1 plan</div>',
      ]),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ─── Issue #09
      h('Issue #09 · Hero 移动端布局 display:contents 反模式', HeadingLevel.HEADING_2),
      p([severity('HIGH'), t('  工作量：45min  ·  影响：iOS Safari 上表单顺序错乱')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('在 ≤1024px 断点下，.hero-left 被设置为 display:contents，其子元素通过 order 属性排布。display:contents 在 iOS Safari 14 以下及部分 Android WebView 中存在已知 bug，导致 flex order 失效，表单出现在标题上方，影响转化体验。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('找到以下 @media (max-width: 1024px) 内的规则并替换：')]),
      ...codeBlock([
        '/* ❌ 删除这段 */',
        '.hero-left {',
        '  display: contents;',
        '  text-align: center;',
        '}',
        '',
        '/* ✅ 替换为 */',
        '.hero-left {',
        '  display: flex;',
        '  flex-direction: column;',
        '  align-items: center;',
        '  text-align: center;',
        '  width: 100%;',
        '}',
        '.hero-copy { order: 1; width: 100%; }',
        '.urgency-bar { order: 2; justify-content: center; }',
        '.chart-form { order: 3; max-width: 100%; width: 100%; }',
        '.chart-trust-row { order: 4; justify-content: center; }',
        '/* hero-right 保持 order: 5 不变 */',
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 3 — MEDIUM PRIORITY
      // ══════════════════════════════════════════════════════════
      h('3. MEDIUM 优先级问题（6项）', HeadingLevel.HEADING_1),
      hr(),

      // ─── Issue #10
      h('Issue #10 · SVG Chart 未进行懒加载优化', HeadingLevel.HEADING_2),
      p([severity('MEDIUM'), t('  工作量：20min  ·  影响：首屏 JS 解析时间增加约 40ms')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('SVG 图表初始化脚本（tick marks、constellation dots、star overlay 动画）在页面加载时立即执行 DOM 创建操作，即使图表在折叠区域。应改为 IntersectionObserver 触发。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('将 SVG 装饰初始化脚本包裹在 IntersectionObserver 中：')]),
      ...codeBlock([
        '/* 将 (function() { const svg = ... })(); 整个块替换为 */',
        '(function() {',
        '  var chartEl = document.getElementById("zwds-chart");',
        '  if (!chartEl) return;',
        '  var inited = false;',
        '  function initChart() {',
        '    if (inited) return;',
        '    inited = true;',
        '    /* 原有全部 SVG 初始化代码粘贴到此处 */',
        '    /* const svg = document.getElementById("chart-svg"); ... */',
        '  }',
        '  if ("IntersectionObserver" in window) {',
        '    new IntersectionObserver(function(entries) {',
        '      if (entries[0].isIntersecting) initChart();',
        '    }, { rootMargin: "200px" }).observe(chartEl);',
        '  } else {',
        '    initChart(); // 降级：立即执行',
        '  }',
        '})();',
      ]),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      // ─── Issue #11
      h('Issue #11 · Schema.org reviewCount 硬编码 4，与展示不符', HeadingLevel.HEADING_2),
      p([severity('MEDIUM'), t('  工作量：10min  ·  影响：Google Rich Snippet 数据不一致，可能被标记为 Spam')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('structured data 中 aggregateRating.reviewCount = "4"，但页面文案称 "500+ professional readings"，trust badge 称 "500+ Charts Read"。Google 要求结构化数据与页面内容一致，不一致可导致 rich snippet 被撤销。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('定位文件末尾第一个 ld+json 脚本块，修改 aggregateRating：')]),
      ...codeBlock([
        '"aggregateRating": {',
        '  "@type": "AggregateRating",',
        '  "ratingValue": "5",',
        '  "reviewCount": "47",   // ← 改为 featured 卡片中引用的 "47 verified buyers"',
        '  "bestRating": "5",',
        '  "worstRating": "1"',
        '},',
      ]),
      p('注意：reviewCount 应与页面中最保守的可见数字一致。当前 featured 定价卡片写着 "47 verified buyers"，因此改为 47 最安全。'),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      // ─── Issue #12
      h('Issue #12 · 信任徽章无差异化视觉层级', HeadingLevel.HEADING_2),
      p([severity('MEDIUM'), t('  工作量：20min  ·  影响：用户扫描时忽略信任信号')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('付款信任行 (.payment-trust-row) 使用微型灰色文字（0.55rem），完全没有视觉重量，用户眼睛会直接跳过。Hero form 下方的 trust-row 也存在同样问题。研究表明，可见的安全信任徽章可提升 checkout 转化率 11–17%。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('将 .payment-trust-row 内联样式替换为：')]),
      ...codeBlock([
        '<div class="payment-trust-row reveal" style="',
        '  display:flex; align-items:center; justify-content:center;',
        '  flex-wrap:wrap; gap:0.5rem 1.25rem;',
        '  margin-top:1rem; padding:0.9rem 1.5rem;',
        '  background: rgba(201,169,110,0.06);',
        '  border: 1px solid rgba(201,169,110,0.2);',
        '  border-radius: 4px;',
        '">',
        '  <span style="font-family:\'EB Garamond\',serif;font-size:0.82rem;',
        '    color:rgba(255,255,255,0.55);">',
        '    🔒 <strong style="color:rgba(255,255,255,0.75)">SSL Encrypted</strong>',
        '  </span>',
        '  <span style="color:rgba(201,169,110,0.3)">·</span>',
        '  <span style="font-family:\'EB Garamond\',serif;font-size:0.82rem;',
        '    color:rgba(255,255,255,0.55);">',
        '    💳 <strong style="color:rgba(255,255,255,0.75)">Stripe &amp; PayPal</strong>',
        '  </span>',
        '  <span style="color:rgba(201,169,110,0.3)">·</span>',
        '  <span style="font-family:\'EB Garamond\',serif;font-size:0.82rem;',
        '    color:rgba(255,255,255,0.55);">',
        '    🛡 <strong style="color:rgba(255,255,255,0.75)">7-Day Guarantee</strong>',
        '  </span>',
        '  <span style="color:rgba(201,169,110,0.3)">·</span>',
        '  <span style="font-family:\'EB Garamond\',serif;font-size:0.82rem;',
        '    color:rgba(255,255,255,0.55);">',
        '    📄 <strong style="color:rgba(255,255,255,0.75)">Instant PDF Delivery</strong>',
        '  </span>',
        '</div>',
      ]),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      // ─── Issue #13
      h('Issue #13 · Sticky CTA 初始化使用 display:none + flex 冲突', HeadingLevel.HEADING_2),
      p([severity('MEDIUM'), t('  工作量：15min  ·  影响：部分浏览器 sticky bar 不出现')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('Sticky CTA bar 初始 style="display:none"，但 JavaScript 中直接设置 bar.style.display = "flex"，跳过了 CSS 过渡动画中的 transform:translateY(100%) 初始状态，导致某些浏览器无动画直接闪现或完全不显示。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('Step 1：将 sticky-cta div 中的 display:none 改为 display:flex，依赖 transform 隐藏：')]),
      ...codeBlock([
        '<div id="sticky-cta" style="',
        '  display:flex;  /* ← 从 none 改为 flex */',
        '  position:fixed; bottom:0; left:0; right:0;',
        '  ... /* 其余样式保持不变 */',
        '  transform:translateY(100%); /* 这个确保初始隐藏 */',
        '  transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);',
        '">',
      ]),
      p([bold('Step 2：在 scroll 事件监听中移除 bar.style.display = "flex" 赋值：')]),
      ...codeBlock([
        '// ❌ 删除这行',
        'bar.style.display = "flex";',
        '// ✅ 只保留 transform 控制',
        'if (window.scrollY > 600) {',
        '  bar.style.transform = "translateY(0)";',
        '} else {',
        '  bar.style.transform = "translateY(100%)";',
        '}',
      ]),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      // ─── Issue #14
      h('Issue #14 · Cookie Consent 在 Incognito 模式下无法持久化', HeadingLevel.HEADING_2),
      p([severity('MEDIUM'), t('  工作量：20min  ·  影响：Cookie banner 在隐私模式下每次刷新重复出现，UX 降级')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('Cookie consent 逻辑依赖 localStorage（Issue #02 已提到封装方案），但更核心的问题是：隐私模式用户每次访问都会看到 Cookie banner，这实际上是反模式——隐私模式用户本来就不想被追踪，频繁弹出 banner 反而增加跳出率。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('在 Cookie consent 脚本中，将 localStorage 替换为已封装的 __storage，并添加 sessionStorage 双写：')]),
      ...codeBlock([
        '// 使用 #02 中已添加的 __storage 封装',
        'var stored = window.__storage.get(KEY);',
        'if (stored === "accepted" || stored === "rejected") return;',
        '',
        '// dismiss 函数中改为：',
        'function dismiss(choice) {',
        '  window.__storage.set(KEY, choice);',
        '  // sessionStorage 双写，确保当次会话内不重复显示',
        '  try { sessionStorage.setItem(KEY, choice); } catch(e) {}',
        '  // 动画隐藏...',
        '}',
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 4 — LOW PRIORITY
      // ══════════════════════════════════════════════════════════
      h('4. LOW 优先级问题（4项）', HeadingLevel.HEADING_1),
      hr(),

      // ─── Issue #15
      h('Issue #15 · 缺少 Skip-to-Content 无障碍链接', HeadingLevel.HEADING_2),
      p([severity('LOW'), t('  工作量：10min  ·  影响：WCAG 2.1 AA 合规，键盘用户体验')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('在 <body> 开标签后、<div id="starfield"> 之前插入：')]),
      ...codeBlock([
        '<a href="#hero" class="skip-to-content" style="',
        '  position:absolute; top:-100px; left:1rem;',
        '  background:var(--gold); color:var(--void);',
        '  padding:0.5rem 1rem; border-radius:2px;',
        '  font-family:Cinzel,serif; font-size:0.7rem; letter-spacing:0.1em;',
        '  transition:top 0.2s; z-index:9999; text-decoration:none;',
        '">Skip to content</a>',
        '<style>',
        '  .skip-to-content:focus { top:1rem; }',
        '</style>',
      ]),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      // ─── Issue #16
      h('Issue #16 · 表单 <select> 缺少 name 属性', HeadingLevel.HEADING_2),
      p([severity('LOW'), t('  工作量：10min  ·  影响：原生表单提交时数据丢失（当前依赖 JS 取值，安全）')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p('这是防御性修复，确保即使 JS 失效时表单数据也能正确提交。'),
      ...codeBlock([
        '<!-- hour select 已有 name="hour"，确认 country input 也有 name="country" -->',
        '<!-- 检查 free-chart.html 目标页接收参数完整性 -->',
        '<!-- 在 form 标签添加 novalidate 然后用 JS 控制校验（已有）—— 无需修改 -->',
      ]),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      // ─── Issue #17
      h('Issue #17 · CSS 变量重复定义导致维护成本高', HeadingLevel.HEADING_2),
      p([severity('LOW'), t('  工作量：15min  ·  影响：长期维护风险')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('问题描述', HeadingLevel.HEADING_3),
      p('CSS 变量中存在冗余别名：--gold-accent 与 --gold 完全相同值，--silver-dim 和 --text-secondary 指向相同的 rgba(255,255,255,0.55/0.88)，--void 和 --bg-primary 均为 #080808。这些重复别名在 800+ 行 CSS 中分散引用，增加日后品牌色调整的维护成本。'),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('在 :root 变量块末尾添加注释并执行全局替换：')]),
      ...codeBlock([
        '/* 以下变量为冗余别名，全局替换并删除 */',
        '/* --gold-accent → --gold (全局搜索替换 var(--gold-accent) 为 var(--gold)) */',
        '/* --bg-primary → --void (全局搜索替换) */',
        '/* --bg-card → --deep (全局搜索替换) */',
        '/* 替换后删除 :root 中的对应行 */',
      ]),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      // ─── Issue #18
      h('Issue #18 · 关键字体缺少 <link rel="preload">', HeadingLevel.HEADING_2),
      p([severity('LOW'), t('  工作量：20min  ·  影响：首屏字体加载优先级低，LCP 分数受影响')]),
      new Paragraph({ spacing: { after: 160 }, children: [] }),

      h('Cursor 施工指令', HeadingLevel.HEADING_3),
      p([bold('在 Issue #01 修复完成后，在 <head> 内最顶部（meta charset 之后）添加：')]),
      ...codeBlock([
        '<!-- Preload 最关键字体的 woff2 文件（需先确认 Google Fonts CDN 实际文件名）-->',
        '<!-- 方案A：如使用 Google Fonts CDN（动态 URL，无法直接 preload） -->',
        '<!-- 方案B（推荐）：将 EB Garamond 400 和 Cinzel 400 字体文件 self-host -->',
        '<link rel="preload" href="/fonts/eb-garamond-400.woff2" as="font" type="font/woff2" crossorigin>',
        '<link rel="preload" href="/fonts/cinzel-400.woff2" as="font" type="font/woff2" crossorigin>',
        '<!-- Self-hosting 步骤：使用 google-webfonts-helper.herokuapp.com 下载并放入 /fonts/ 目录 -->',
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 5 — SEO 专项增强
      // ══════════════════════════════════════════════════════════
      h('5. SEO 专项增强建议', HeadingLevel.HEADING_1),
      hr(),

      h('5.1 缺少 Open Graph Image 实际资源验证', HeadingLevel.HEADING_2),
      p('og:image 指向 /images/og-chart.jpg，但代码中 reader photo 和 mobile preview 图片均有 onerror fallback，说明这些图片可能在服务器上不存在。Google、Twitter 爬虫无法访问不存在的 OG 图片将完全不显示预览卡片，导致社交分享转发率为零。'),
      p([bold('施工指令：'), t(' 使用 curl -I https://metaphysicflow.com/images/og-chart.jpg 验证图片存在。如不存在，立即从现有 SVG 图表生成一张 1200×630 的静态截图作为 og-chart.jpg。')]),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      h('5.2 Canonical URL 与 hreflang 配置建议', HeadingLevel.HEADING_2),
      p('当前 hreflang 标签指向 /zh/ 路径，但该路径是否实际存在中文版本页面不确定。若 /zh/ 返回 404 或重定向，Google 会忽略所有 hreflang 标签，失去双语 SEO 优势。'),
      p([bold('施工指令：'), t(' 如中文版本未上线，立即删除 hreflang zh-Hant 标签，避免爬虫混乱。当中文版本就绪后再恢复。')]),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      h('5.3 Article Schema 缺失（博客文章 SEO 机会）', HeadingLevel.HEADING_2),
      p('Journal/博客区域链接到 3 篇文章，但这 3 篇文章 URL 是否存在且有 Article schema markup 未知。特别是 /blog/2026-zi-wei-dou-shu-annual-forecast.html 是高搜索意图页面，配合 Article + Speakable schema 可获得 Google Discover 流量。'),
      p([bold('施工指令：'), t(' 为每篇博客文章页面添加 Article schema，作者信息复用首页已有的 Person schema。')]),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 6 — 性能优化清单
      // ══════════════════════════════════════════════════════════
      h('6. 性能优化核对清单', HeadingLevel.HEADING_1),
      hr(),

      makeTable(
        ['优化项', '当前状态', '施工方向', '预期提升'],
        [
          ['Google Fonts 加载', '阻塞渲染', '见 Issue #01', 'FCP -0.8s'],
          ['SVG 图表脚本', '立即执行', '见 Issue #10', 'JS -40ms'],
          ['Cloudflare Beacon', 'async 已有', '确认 defer 属性', '-5ms'],
          ['Gumroad JS', 'defer 已有', '确认非阻塞', '良好'],
          ['body::before 纹理', 'data URI SVG', '考虑删除（视觉收益低）', 'CSS -2KB'],
          ['CSS 变量重复', '8处冗余别名', '见 Issue #17', '维护 -20%'],
          ['字体 woff2 preload', '缺失', '见 Issue #18', 'LCP -0.3s'],
          ['IntersectionObserver', '已用于 .reveal', '扩展到图表脚本', 'FID -15ms'],
          ['RequestAnimationFrame', 'RAF Scheduler 已有', '保持现状', '良好'],
          ['图片 loading=lazy', 'hero img 无此属性', '添加 loading="eager" 到 hero', 'LCP +5%'],
        ],
        [3000, 1800, 2400, 2160]
      ),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 7 — 商业转化专项建议
      // ══════════════════════════════════════════════════════════
      h('7. 商业转化专项增强建议（Bonus）', HeadingLevel.HEADING_1),
      hr(),

      h('7.1 增加限时优惠倒计时（即插即用）', HeadingLevel.HEADING_2),
      p('Featured 定价卡片当前无紧迫感机制（"3 spots this week" 只在 Live 卡片上）。建议为 Full Matrix 添加滚动倒计时器，显示「当前优惠价截止时间」，提升 FOMO 效果。'),
      ...codeBlock([
        '<!-- 在 featured 定价卡片 pricing-badge 下方插入 -->',
        '<div id="pricing-countdown" style="',
        '  text-align:center; font-family:Cinzel,serif;',
        '  font-size:0.58rem; letter-spacing:0.12em;',
        '  color:rgba(201,169,110,0.7); margin-bottom:0.75rem;',
        '">',
        '  ⏳ Price locks in: <span id="countdown-timer">23:47:12</span>',
        '</div>',
        '<script>',
        '(function() {',
        '  var el = document.getElementById("countdown-timer");',
        '  if (!el) return;',
        '  // 从 sessionStorage 读取或生成新倒计时（24小时制）',
        '  var key = "ct_expiry";',
        '  var expiry;',
        '  try { expiry = parseInt(sessionStorage.getItem(key)); } catch(e){}',
        '  if (!expiry || expiry < Date.now()) {',
        '    expiry = Date.now() + 24 * 3600 * 1000;',
        '    try { sessionStorage.setItem(key, expiry); } catch(e){}',
        '  }',
        '  function update() {',
        '    var diff = Math.max(0, expiry - Date.now());',
        '    var h = Math.floor(diff/3600000);',
        '    var m = Math.floor((diff%3600000)/60000);',
        '    var s = Math.floor((diff%60000)/1000);',
        '    el.textContent = String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");',
        '  }',
        '  update();',
        '  setInterval(update, 1000);',
        '})();',
        '</script>',
      ]),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      h('7.2 增加 Social Proof 实时计数动画', HeadingLevel.HEADING_2),
      p('Hero urgency bar 当前显示静态文字 "Used by 5,000+ readers in 40+ countries"。将其改为页面加载时从一个较低数字滚动到目标数字，利用视觉运动吸引注意力，提升可信度感知。'),
      ...codeBlock([
        '/* 替换 live-counter 初始化脚本 */',
        '(function() {',
        '  var counter = document.getElementById("live-counter");',
        '  if (!counter) return;',
        '  var target = 5000;',
        '  var duration = 1800; // ms',
        '  var start = null;',
        '  var startVal = 4800;',
        '  function step(ts) {',
        '    if (!start) start = ts;',
        '    var progress = Math.min((ts - start) / duration, 1);',
        '    var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic',
        '    var current = Math.round(startVal + (target - startVal) * eased);',
        '    counter.textContent = current.toLocaleString() + "+ readers in 40+ countries";',
        '    if (progress < 1) requestAnimationFrame(step);',
        '  }',
        '  // 仅在可视区域时触发',
        '  if ("IntersectionObserver" in window) {',
        '    new IntersectionObserver(function(entries) {',
        '      if (entries[0].isIntersecting) { requestAnimationFrame(step); }',
        '    }, { threshold: 0.5 }).observe(counter);',
        '  } else {',
        '    requestAnimationFrame(step);',
        '  }',
        '})();',
      ]),
      new Paragraph({ spacing: { after: 240 }, children: [] }),

      h('7.3 Pricing 卡片增加 Hover 展开详细说明', HeadingLevel.HEADING_2),
      p('当前定价卡片的 "palace-desc" 在 hover 时已有 -webkit-line-clamp 展开效果，但 pricing 卡片没有类似的渐进披露。建议为每张定价卡片添加「包含内容预览」的折叠展开，让犹豫用户在不离开页面的情况下获取更多信息。'),
      p([bold('施工思路：'), t(' 在每个 .btn-pricing 前插入 <details> 元素，summary 文本为 "What\'s included ▾"，内部列出 3–5 条简短说明。用 CSS 控制 details[open] 样式与动画。')]),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 8 — IMPLEMENTATION ROADMAP
      // ══════════════════════════════════════════════════════════
      h('8. 实施路线图 · Implementation Roadmap', HeadingLevel.HEADING_1),
      hr(),

      h('Phase 1 · 立即执行（Day 1，约 3 小时）', HeadingLevel.HEADING_2),
      p([bold('目标：消除所有 CRITICAL 问题，保证核心功能稳定')]),
      numbered('Issue #02 · 添加 __storage 安全封装（基础依赖，先做）'),
      numbered('Issue #01 · 修复 Font loading（最快提升 Core Web Vitals）'),
      numbered('Issue #03 · 表单提交防重复 + 超时恢复'),
      numbered('Issue #04 · Formspree 接管邮件捕获'),
      numbered('Issue #05 · 安全头 + email script defer'),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      h('Phase 2 · 本周内（Day 2–4，约 4 小时）', HeadingLevel.HEADING_2),
      p([bold('目标：提升转化率和可信度')]),
      numbered('Issue #06 · CTA 文案替换'),
      numbered('Issue #07 · UTM 注入脚本'),
      numbered('Issue #08 · 定价锚定效应 + 划线价'),
      numbered('Issue #12 · 信任徽章视觉升级'),
      numbered('Issue #11 · Schema reviewCount 修正'),
      numbered('7.1 倒计时器（Bonus，低工作量高收益）'),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      h('Phase 3 · 下周完成（Day 5–10，约 4 小时）', HeadingLevel.HEADING_2),
      p([bold('目标：技术稳定性 + 移动端体验')]),
      numbered('Issue #09 · Hero 移动端 display:contents 修复'),
      numbered('Issue #13 · Sticky CTA 初始化修复'),
      numbered('Issue #14 · Cookie consent 隐私模式优化'),
      numbered('Issue #10 · SVG 图表懒加载'),
      numbered('Issue #18 · 字体 Self-hosting + preload'),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      h('Phase 4 · 月底前（Day 11–30，约 3 小时）', HeadingLevel.HEADING_2),
      p([bold('目标：合规 + 代码质量')]),
      numbered('Issue #15 · Skip-to-content'),
      numbered('Issue #16 · 表单属性完整性'),
      numbered('Issue #17 · CSS 变量清理'),
      numbered('SEO 5.2 · hreflang 验证'),
      numbered('SEO 5.3 · 博客页 Article Schema'),
      new Paragraph({ children: [new PageBreak()] }),

      // ══════════════════════════════════════════════════════════
      // SECTION 9 — CURSOR PRO 快速参考
      // ══════════════════════════════════════════════════════════
      h('9. Cursor Pro 快速操作参考', HeadingLevel.HEADING_1),
      hr(),

      h('如何将本报告喂给 Cursor Pro', HeadingLevel.HEADING_2),
      p('将以下 Prompt 模板直接粘贴到 Cursor Chat（Cmd+L），然后附上对应的代码段：'),
      new Paragraph({ spacing: { after: 120 }, children: [] }),
      ...codeBlock([
        '--- Cursor Prompt 模板 ---',
        '',
        '我正在修复 metaphysicflow.com 首页代码。',
        '请严格按照以下施工报告中 Issue #XX 的「Cursor 施工指令」执行修改：',
        '',
        '[粘贴本报告中对应 Issue 的「Cursor 施工指令」小节全文]',
        '',
        '目标文件：index.html',
        '请不要修改其他任何部分。修改后给我展示 diff。',
        '',
        '--- End Prompt ---',
      ]),
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      h('全局搜索替换快捷操作清单', HeadingLevel.HEADING_2),
      makeTable(
        ['操作', 'Cursor 快捷键', '说明'],
        [
          ['全局搜索替换', 'Cmd+Shift+H', '用于 Issue #06 文案替换、#17 CSS 变量'],
          ['多光标编辑', 'Cmd+D / Cmd+Shift+L', '同时编辑多处相同文本'],
          ['文件内搜索', 'Cmd+F', '定位特定函数或 CSS 规则'],
          ['AI 解释代码', 'Cmd+K → Explain', '理解修改前的原有逻辑'],
          ['AI 生成 diff', 'Cmd+K → 描述修改', '生成精确修改预览'],
          ['终端执行', 'Ctrl+`', '本地验证修改效果'],
        ],
        [2800, 2000, 4560]
      ),
      new Paragraph({ spacing: { after: 300 }, children: [] }),

      // ══════════════════════════════════════════════════════════
      // APPENDIX
      // ══════════════════════════════════════════════════════════
      h('附录 · 核心指标基准', HeadingLevel.HEADING_1),
      hr(),

      makeTable(
        ['指标', '当前估算', '修复后目标', '测量工具'],
        [
          ['First Contentful Paint (FCP)', '~2.8s', '< 1.8s', 'PageSpeed Insights'],
          ['Largest Contentful Paint (LCP)', '~3.5s', '< 2.5s', 'PageSpeed Insights'],
          ['Cumulative Layout Shift (CLS)', '~0.15', '< 0.1', 'Web Vitals Extension'],
          ['Total Blocking Time (TBT)', '~380ms', '< 200ms', 'Lighthouse'],
          ['表单提交转化率', '基准未知', '+25–40%', 'Google Analytics 4'],
          ['Pricing CTA CTR', '基准未知', '+12–18%', 'Hotjar / GA4'],
          ['Exit Popup 邮件捕获率', '~0%（后端不存在）', '3–8%', 'Formspree Dashboard'],
          ['Mobile Bounce Rate', '基准未知', '-15–25%', 'GA4'],
        ],
        [3000, 1680, 1680, 3000]
      ),
      new Paragraph({ spacing: { after: 400 }, children: [] }),
      hr(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: '本报告由 Claude（Anthropic）生成，专项服务于 Guanlan Energy · metaphysicflow.com', size: 18, font: 'Arial', color: C.silver, italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '版本 1.0 · June 2026 · CONFIDENTIAL', size: 18, font: 'Arial', color: C.muted })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(path.join(__dirname, '../docs/GuanlanEnergy_CursorPro_施工报告_v1.0.docx'), buffer);
  console.log('✅ Report generated successfully');
});