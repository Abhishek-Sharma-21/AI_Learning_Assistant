/**
 * generateStudyNotesPDF
 * Opens a styled, print-ready HTML page in a new window and triggers
 * the browser's native Save-as-PDF dialog. No external libraries needed.
 *
 * @param {object} doc  - The Redux document object
 * @returns {string|null} - Error message if popup was blocked, otherwise null
 */
export function generateStudyNotesPDF(doc) {
  const date = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  /* ── sections ──────────────────────────────────────────────────────── */
  const summaryHTML = doc?.summary?.mainSummary
    ? `<div class="section">
        <div class="section-header">📄 Summary</div>
        <div class="card">${doc.summary.mainSummary}</div>
        ${doc.summary.keyPoints?.length
          ? `<h3 class="sub-heading">Key Points</h3>
             <ul class="bullet-list">
               ${doc.summary.keyPoints.map(p => `<li>${p}</li>`).join('')}
             </ul>`
          : ''}
       </div>`
    : '';

  const topicsHTML = doc?.topics?.length
    ? `<div class="section">
        <div class="section-header">🏷️ Core Topics</div>
        ${doc.topics.map((t, i) => `
          <div class="topic-card">
            <div class="topic-top">
              <span class="topic-num">${i + 1}</span>
              <strong class="topic-title">${t.title}</strong>
              ${t.category ? `<span class="badge">${t.category}</span>` : ''}
            </div>
            ${t.explanation ? `<p class="topic-body">${t.explanation}</p>` : ''}
            ${t.subtopics?.length ? `<p class="meta"><b>Subtopics:</b> ${t.subtopics.join(', ')}</p>` : ''}
            ${t.keywords?.length  ? `<p class="meta"><b>Keywords:</b> ${t.keywords.join(', ')}</p>`  : ''}
          </div>`).join('')}
       </div>`
    : '';

  const flashcardsHTML = doc?.flashcards?.length
    ? `<div class="section">
        <div class="section-header">🃏 Flashcards</div>
        ${doc.flashcards.map((c, i) => `
          <div class="fc-card">
            <p class="fc-q"><span class="q-num">Q${i + 1}</span> ${c.question}</p>
            <p class="fc-a">▶ ${c.answer}</p>
            ${c.category ? `<p class="meta">Category: ${c.category}</p>` : ''}
          </div>`).join('')}
       </div>`
    : '';

  const quizHTML = doc?.quiz?.length
    ? `<div class="section">
        <div class="section-header">❓ Quiz Questions</div>
        ${doc.quiz.map((q, i) => `
          <div class="quiz-card">
            <p class="quiz-q"><span class="q-num">Q${i + 1}</span> ${q.question}</p>
            <ul class="options">
              ${(q.options || []).map((opt, j) => {
                const letter = String.fromCharCode(65 + j);
                const correct = opt === q.correctAnswer;
                return `<li class="${correct ? 'correct' : ''}">
                  <span class="opt-letter">${letter}</span> ${opt}
                  ${correct ? '<span class="tick">✓</span>' : ''}
                </li>`;
              }).join('')}
            </ul>
            ${q.explanation ? `<p class="explanation">💡 ${q.explanation}</p>` : ''}
          </div>`).join('')}
       </div>`
    : '';

  /* ── full HTML ─────────────────────────────────────────────────────── */
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${doc.title} — Study Notes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; }

    /* Cover */
    .cover { background: #0f172a; color: #fff; padding: 48px; border-left: 8px solid #10b981; margin-bottom: 40px; }
    .cover .label { color: #10b981; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px; }
    .cover h1 { font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.2; margin-bottom: 12px; }
    .cover .meta { color: #94a3b8; font-size: 11px; }

    /* Section */
    .section { margin: 0 40px 36px; page-break-inside: avoid; }
    .section-header { background: #10b981; color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; }

    /* Summary */
    .card { background: #f8fafc; border-left: 4px solid #10b981; border-radius: 6px; padding: 16px 20px; font-size: 13px; line-height: 1.7; color: #475569; margin-bottom: 16px; }
    .sub-heading { font-size: 13px; font-weight: 700; color: #1e293b; margin: 16px 0 8px; }
    .bullet-list { padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
    .bullet-list li { font-size: 12.5px; color: #475569; padding-left: 20px; position: relative; line-height: 1.6; }
    .bullet-list li::before { content: ''; position: absolute; left: 4px; top: 7px; width: 7px; height: 7px; background: #10b981; border-radius: 50%; }

    /* Topics */
    .topic-card { background: #f8fafc; border-left: 4px solid #10b981; border-radius: 6px; padding: 14px 16px; margin-bottom: 12px; page-break-inside: avoid; }
    .topic-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
    .topic-num { background: #10b981; color: #fff; font-size: 11px; font-weight: 700; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .topic-title { font-size: 13px; font-weight: 700; color: #1e293b; }
    .badge { margin-left: auto; background: #d1fae5; color: #065f46; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 999px; letter-spacing: 0.1em; text-transform: uppercase; }
    .topic-body { font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 6px; }
    .meta { font-size: 11px; color: #94a3b8; margin-top: 4px; }

    /* Flashcards */
    .fc-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; page-break-inside: avoid; }
    .fc-q { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .fc-a { font-size: 13px; color: #10b981; font-weight: 600; padding-left: 12px; }
    .q-num { display: inline-block; background: #0f172a; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 4px; margin-right: 6px; }

    /* Quiz */
    .quiz-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; page-break-inside: avoid; }
    .quiz-q { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
    .options { list-style: none; display: flex; flex-direction: column; gap: 6px; }
    .options li { font-size: 12px; color: #475569; padding: 7px 12px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }
    .options li.correct { background: #ecfdf5; border-color: #10b981; color: #065f46; font-weight: 700; }
    .opt-letter { background: #1e293b; color: #fff; font-size: 10px; font-weight: 700; width: 20px; height: 20px; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .options li.correct .opt-letter { background: #10b981; }
    .tick { margin-left: auto; color: #10b981; font-weight: 900; }
    .explanation { font-size: 11.5px; color: #64748b; font-style: italic; margin-top: 10px; padding: 8px 12px; background: #f8fafc; border-radius: 6px; line-height: 1.6; }

    /* Footer */
    .footer { text-align: center; font-size: 10px; color: #94a3b8; padding: 24px 40px; border-top: 1px solid #e2e8f0; margin-top: 20px; }

    /* Print */
    @media print {
      body, .cover, .section-header { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <p class="label">AI Learning Assistant · Study Notes</p>
    <h1>${doc.title}</h1>
    <p class="meta">Generated: ${date}</p>
  </div>
  ${summaryHTML}
  ${topicsHTML}
  ${flashcardsHTML}
  ${quizHTML}
  <div class="footer">AI Learning Assistant · Study Notes · ${date}</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return 'blocked';
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
  return null;
}
