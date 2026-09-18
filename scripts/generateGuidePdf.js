const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const mdPath = path.join(rootDir, 'HACKATHON_GUIDE.md');
const htmlPath = path.join(rootDir, 'HACKATHON_GUIDE.html');
const pdfPath = path.join(rootDir, 'HACKATHON_GUIDE.pdf');
const frontendPdfPath = path.join(rootDir, 'frontend', 'HACKATHON_GUIDE.pdf');

const markdown = fs.readFileSync(mdPath, 'utf8');

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inCodeBlock = false;
  let codeBuffer = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>\n`;
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inList) { html += '</ul>\n'; inList = false; }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line)) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += '<hr>\n';
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<div class="doc-header">
        <div class="badge">MOSPI · OFFICIAL STATISTICAL SYSTEM</div>
        <h1>${formatInline(line.slice(2))}</h1>
        <p class="subtitle">Platform Architecture, Customization Directory &amp; Evaluator Cheat Sheet</p>
      </div>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h2>${formatInline(line.slice(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h3>${formatInline(line.slice(4))}</h3>\n`;
      continue;
    }

    // List items
    if (/^\s*[-*]\s+(.*)$/.test(line)) {
      const match = line.match(/^\s*[-*]\s+(.*)$/);
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `  <li>${formatInline(match[1])}</li>\n`;
      continue;
    } else {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
    }

    // Empty lines
    if (!line.trim()) {
      continue;
    }

    // Blockquotes or arrow items
    if (line.startsWith('→ ')) {
      html += `<div class="file-pointer">${formatInline(line)}</div>\n`;
      continue;
    }

    // Questions / bold prompts
    if (line.startsWith('**"')) {
      html += `<div class="qa-block"><div class="question">${formatInline(line)}</div>`;
      // Check if next line is answer
      if (lines[i+1] && !lines[i+1].startsWith('**') && !lines[i+1].startsWith('#')) {
        i++;
        html += `<div class="answer">${formatInline(lines[i])}</div>`;
      }
      html += `</div>\n`;
      continue;
    }

    // Regular paragraph
    html += `<p>${formatInline(line)}</p>\n`;
  }

  if (inList) html += '</ul>\n';
  return html;
}

function formatInline(text) {
  let res = escapeHtml(text);
  // Inline code
  res = res.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // File arrows
  res = res.replace(/→\s*file:\s*<code>([^<]+)<\/code>/g, '<span class="target-tag">file: <b>$1</b></span>');
  return res;
}

const bodyHtml = parseMarkdown(markdown);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>HACKATHON GUIDE — Competency Intelligence</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    line-height: 1.55;
    font-size: 13px;
    margin: 0;
    padding: 0;
  }
  .doc-header {
    border-bottom: 3px solid #3b82f6;
    padding-bottom: 12px;
    margin-bottom: 24px;
  }
  .badge {
    display: inline-block;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: 4px;
    border: 1px solid #bfdbfe;
    margin-bottom: 8px;
  }
  h1 {
    font-size: 24px;
    color: #0f172a;
    margin: 0 0 4px 0;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .subtitle {
    color: #64748b;
    font-size: 12.5px;
    margin: 0;
  }
  h2 {
    font-size: 16px;
    color: #0f172a;
    margin: 22px 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1.5px solid #e2e8f0;
    font-weight: 700;
    page-break-after: avoid;
  }
  h3 {
    font-size: 13.5px;
    color: #1e40af;
    margin: 16px 0 8px 0;
    font-weight: 700;
    page-break-after: avoid;
  }
  p {
    margin: 6px 0;
  }
  strong {
    color: #0f172a;
  }
  code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 11.5px;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1.5px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }
  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 11px;
    overflow-x: auto;
    margin: 8px 0 12px 0;
    page-break-inside: avoid;
  }
  pre code {
    background: transparent;
    color: inherit;
    border: none;
    padding: 0;
  }
  .file-pointer {
    background: #f8fafc;
    border-left: 3px solid #3b82f6;
    padding: 4px 10px;
    margin: 3px 0 6px 0;
    font-size: 12px;
  }
  .target-tag {
    background: #e0f2fe;
    color: #0369a1;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 11.5px;
    border: 1px solid #bae6fd;
  }
  .qa-block {
    background: #fafafa;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 12px;
    margin: 10px 0;
    page-break-inside: avoid;
  }
  .qa-block .question {
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
    font-size: 12.5px;
  }
  .qa-block .answer {
    color: #334155;
    font-size: 12px;
    line-height: 1.5;
  }
  ul {
    margin: 6px 0 10px 18px;
    padding: 0;
  }
  li {
    margin: 3px 0;
    color: #334155;
  }
  hr {
    border: none;
    border-top: 1px dashed #cbd5e1;
    margin: 20px 0;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf8');
console.log('[pdf-gen] Saved styled HTML to:', htmlPath);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (fs.existsSync(edgePath)) {
  console.log('[pdf-gen] Rendering PDF using Microsoft Edge...');
  try {
    const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
    execSync(cmd);
    console.log('[pdf-gen] Successfully created PDF at:', pdfPath);

    // Copy to frontend so it can also be downloaded directly from the web app
    fs.copyFileSync(pdfPath, frontendPdfPath);
    console.log('[pdf-gen] Copied to frontend for web download:', frontendPdfPath);
  } catch (err) {
    console.error('[pdf-gen] Edge print failed:', err.message);
  }
} else {
  console.error('[pdf-gen] Edge not found at:', edgePath);
}
