const candidates = [
  { id:1, name:'Айгерим Сейткали', initials:'АС', avBg:'#9FE1CB', avColor:'#085041',
    school:'НИШ, Жамбыл', score:87, tier:'high', aiFlag:false, rank:1,
    dims:{leadership:91,motivation:88,growth:85,authenticity:90,experience:76},
    tags:[{l:'Лидерство',c:'tag-green'},{l:'Проект',c:'tag-blue'},{l:'Низкий AI-риск',c:'tag-green'}],
    explain:'Кандидат демонстрирует устойчивые поведенческие паттерны лидерства через конкретные действия (организация, сбор подписей). Эссе содержит специфические детали и личный нарратив.',
    growth:'Рост от локальной инициативы к системному воздействию — характерный трек для лидеров с высоким потенциалом.',
    iq:['Что стало самым сложным моментом в организации кампании за уборку свалки?','Как вы справлялись с демотивацией команды?']
  },
  { id:2, name:'Бекзат Нурланов', initials:'БН', avBg:'#B5D4F4', avColor:'#0C447C',
    school:'Гимназия №1, Астана', score:81, tier:'high', aiFlag:false, rank:2,
    dims:{leadership:80,motivation:82,growth:78,authenticity:84,experience:83},
    tags:[{l:'Технологии',c:'tag-blue'},{l:'Предпринимательство',c:'tag-blue'}],
    explain:'Сильный технический фундамент с предпринимательским опытом (3 реализованных проекта). Мотивация чётко артикулирована.',
    growth:'Стабильный рост компетенций, подтверждённый внешними достижениями.',
    iq:['Расскажите о неудачном проекте — что пошло не так?','Как вы выбираете, чему уделить приоритет?']
  },
  { id:3, name:'Данара Омарова', initials:'ДО', avBg:'#CECBF6', avColor:'#3C3489',
    school:'Колледж, г. Тараз', score:79, tier:'high', aiFlag:false, rank:3,
    dims:{leadership:77,motivation:85,growth:82,authenticity:79,experience:70},
    tags:[{l:'Мотивация',c:'tag-green'},{l:'Рост-траектория',c:'tag-blue'}],
    explain:'Высокая мотивация с чётко описанным личным путём. Опыт ограничен, но нарратив роста убедителен.',
    growth:'Резкий перелом в успеваемости и активности за последний год — сигнал роста.',
    iq:['Что изменилось год назад, что вы так быстро развились?','Какую проблему в своём городе вы хотели бы решить?']
  },
  { id:4, name:'Тимур Касымов', initials:'ТК', avBg:'#FAC775', avColor:'#412402',
    school:'НУШ Алматы', score:72, tier:'review', aiFlag:true, rank:4,
    dims:{leadership:65,motivation:70,growth:68,authenticity:55,experience:88},
    tags:[{l:'Высокий AI-риск',c:'tag-red'},{l:'Сильный опыт',c:'tag-blue'}],
    explain:'Богатый формальный опыт, но эссе имеет признаки генерации ИИ: однородный синтаксис, отсутствие конкретных деталей.',
    growth:'Траектория достижений линейна — возможно, продиктована внешними стимулами.',
    iq:['Напишите 3-4 предложения об этом эссе своими словами прямо сейчас.','Какое решение вы приняли вопреки мнению окружающих?']
  },
  { id:5, name:'Мадина Ержанова', initials:'МЕ', avBg:'#F5C4B3', avColor:'#712B13',
    school:'Школа №47, Шымкент', score:68, tier:'review', aiFlag:false, rank:5,
    dims:{leadership:72,motivation:75,growth:70,authenticity:80,experience:42},
    tags:[{l:'Потенциал',c:'tag-amber'},{l:'Мало опыта',c:'tag-gray'}],
    explain:'Высокая аутентичность и чёткое ощущение цели, но формальный опыт минимален.',
    growth:'Органический рост без институциональной поддержки — высокая ценность.',
    iq:['Расскажите о случае, когда вы взяли инициативу без просьбы.','Что бы вы сделали, если бы у вас было 100 000 тенге и месяц?']
  }
];

const dimensions = [
  {key:'leadership',  label:'Лидерский потенциал', weight:30, color:'#2D7A5F'},
  {key:'motivation',  label:'Мотивация и ценности', weight:25, color:'#378ADD'},
  {key:'growth',      label:'Рост-траектория',       weight:20, color:'#7F77DD'},
  {key:'authenticity',label:'Аутентичность',          weight:15, color:'#B8860B'},
  {key:'experience',  label:'Практический опыт',      weight:10, color:'#D85A30'}
];

let customWeights = {leadership:30,motivation:25,growth:20,authenticity:15,experience:10};
let selectedForCompare = new Set();
let currentFilter = 'all';
let currentSort = {key:'score', dir:-1};
let currentSearch = '';

const humanComments = {}; 

function detectLeadershipSignals(essay) {
  const text = (essay || '').toLowerCase();

  const actionVerbs = [
    { pattern: /организов|организую|организовал/g,     label: 'Организаторская инициатива',    pts: 8 },
    { pattern: /создал|создала|создаю|запустил/g,      label: 'Запуск собственного проекта',   pts: 10 },
    { pattern: /руководил|руководила|возглавил/g,      label: 'Руководство командой',          pts: 9 },
    { pattern: /инициировал|предложил|инициировала/g,  label: 'Личная инициатива',             pts: 7 },
    { pattern: /собрал команду|нашёл инвестора/g,      label: 'Ресурсная мобилизация',         pts: 10 },
    { pattern: /пивот|изменил стратегию|переориентир/g,label: 'Адаптивное лидерство',          pts: 9 },
    { pattern: /наставник|ментор|помог другим/g,       label: 'Развитие других',               pts: 7 },
    { pattern: /координировал|координировала/g,        label: 'Координация процессов',         pts: 6 },
  ];

  const outcomeMarkers = [
    { pattern: /(\d+)\s*%/g,                           label: 'Измеримый результат (%%)',      pts: 8 },
    { pattern: /(\d+)\s*(млн|тыс|человек|участник)/g,  label: 'Конкретный масштаб',            pts: 9 },
    { pattern: /рост|увеличил|вырос|повысил/g,         label: 'Доказанный рост',               pts: 6 },
    { pattern: /x\d+|в\s*\d+\s*раз/g,                 label: 'Кратный рост',                  pts: 10 },
  ];

  const resilienceMarkers = [
    { pattern: /кризис|проблем|столкнул|трудност/g,    label: 'Опыт преодоления трудностей',   pts: 5 },
    { pattern: /несмотря|вопреки|без помощи/g,         label: 'Самостоятельность',             pts: 6 },
    { pattern: /провалился|неудач|ошибл/g,             label: 'Рефлексия над ошибками',        pts: 7 },
  ];

  const allMarkers = [...actionVerbs, ...outcomeMarkers, ...resilienceMarkers];
  const found = [];
  let score = 0;

  allMarkers.forEach(m => {
    const matches = text.match(m.pattern);
    if (matches && matches.length > 0) {
      found.push({ label: m.label, pts: m.pts });
      score += Math.min(m.pts * matches.length, m.pts * 2);
    }
  });

  return { signals: found, score: Math.min(score, 100) };
}

function detectAIText(essay) {
  const text = essay || '';
  const words = text.split(/\s+/).filter(Boolean);
  const flags = [];
  let riskScore = 0;

  const templatePhrases = [
    'в современном мире', 'в заключение хотелось бы', 'немаловажную роль',
    'на сегодняшний день', 'следует отметить', 'таким образом',
    'хотелось бы отметить', 'в рамках данного', 'не вызывает сомнений',
    'является неотъемлемой', 'особую актуальность', 'в свете вышесказанного',
    'я считаю себя лидером', 'хочу развиваться', 'мечтаю создать компанию',
    'буду рад любой возможности', 'готов работать в команде',
    'верю что образование', 'ключ к успеху'
  ];
  const foundTemplates = templatePhrases.filter(p => text.toLowerCase().includes(p));
  if (foundTemplates.length >= 3) {
    riskScore += 30;
    flags.push(`Клише AI-текстов (${foundTemplates.length}): «${foundTemplates.slice(0,2).join('», «')}»`);
  } else if (foundTemplates.length >= 1) {
    riskScore += 12;
    flags.push(`Шаблонные фразы (${foundTemplates.length})`);
  }

  const concreteMarkers = /\d+\s*(млн|тыс|%|человек|участник|подписч|год|месяц|день)|[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+(?: [А-ЯЁ][а-яё]+)?|\d{4}\s*год/g;
  const concreteMatches = (text.match(concreteMarkers) || []).length;
  if (concreteMatches === 0) {
    riskScore += 25;
    flags.push('Нет конкретных фактов, дат, имён или цифр');
  } else if (concreteMatches >= 4) {
    riskScore = Math.max(0, riskScore - 15);
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length >= 4) {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avg = lengths.reduce((a,b) => a+b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    if (variance < 8 && avg > 15) {
      riskScore += 20;
      flags.push('Однородная длина предложений — характерно для AI');
    }
  }

  const firstPersonSpecific = /(я помню|тогда я|в тот момент|это было когда|однажды|в \d{4})/i;
  if (!firstPersonSpecific.test(text) && words.length > 60) {
    riskScore += 10;
    flags.push('Отсутствие конкретных личных воспоминаний');
  }

  const { score: lsScore } = detectLeadershipSignals(essay);
  if (lsScore >= 30) riskScore = Math.max(0, riskScore - 15);

  riskScore = Math.min(riskScore, 100);
  const level = riskScore >= 55 ? 'высокий' : riskScore >= 30 ? 'средний' : 'низкий';

  return { score: riskScore, flags, level };
}

function localAnalyzeCandidate(name, school, essay, achievements, grades) {
  const { signals: lsSignals, score: lsScore } = detectLeadershipSignals(essay);
  const aiAnalysis = detectAIText(essay);

  const leadership = Math.min(100, lsScore + (lsSignals.length >= 4 ? 10 : 0));

  const hasPersonalStory = /(я вырос|с детства|моя семья|в нашем городе|в ауле|моя мама|мой отец)/i.test(essay);
  const hasGoal = /(хочу|стремлюсь|планирую|моя цель|планирую)/i.test(essay);
  const motivation = Math.min(100,
    (hasPersonalStory ? 35 : 10) +
    (hasGoal ? 20 : 5) +
    (lsScore * 0.3)
  );

  const hasGrowthNarrative = /(начал с|вырос от|раньше я|теперь|за год|через год|стало лучше)/i.test(essay);
  const hasChallenge = /(преодолел|справился|несмотря на|вопреки|трудность|кризис)/i.test(essay);
  const growth = Math.min(100,
    (hasGrowthNarrative ? 40 : 15) +
    (hasChallenge ? 25 : 5) +
    (lsSignals.length * 5)
  );

  const authenticity = Math.max(10, 100 - aiAnalysis.score);

  const achText = (achievements || '').toLowerCase();
  const expSignals = [
    /победит|1 место|чемпион/.test(achText) ? 20 : 0,
    /международн|international|global/.test(achText) ? 25 : 0,
    /грант|стипенд/.test(achText) ? 15 : 0,
    /проект|запустил|создал/.test(achText) ? 15 : 0,
    /волонтёр|нко|общественн/.test(achText) ? 10 : 0,
    grades.includes('A') || grades.includes('Отличник') ? 15 : grades.includes('B') ? 8 : 3,
  ];
  const experience = Math.min(100, expSignals.reduce((a,b) => a+b, 0));

  const total = Math.round(
    leadership   * (customWeights.leadership   / 100) +
    motivation   * (customWeights.motivation   / 100) +
    growth       * (customWeights.growth       / 100) +
    authenticity * (customWeights.authenticity / 100) +
    experience   * (customWeights.experience   / 100)
  );

  const explanationParts = [];
  if (lsSignals.length >= 3) {
    explanationParts.push(`Обнаружены сильные сигналы лидерства: ${lsSignals.slice(0,3).map(s=>s.label).join(', ')}.`);
  } else if (lsSignals.length > 0) {
    explanationParts.push(`Выявлены признаки лидерства: ${lsSignals.map(s=>s.label).join(', ')}.`);
  } else {
    explanationParts.push('Конкретные поведенческие сигналы лидерства в эссе не найдены.');
  }
  if (aiAnalysis.level === 'низкий') {
    explanationParts.push('Эссе написано аутентично — содержит личные детали и конкретные факты.');
  } else if (aiAnalysis.level === 'высокий') {
    explanationParts.push('Текст эссе содержит признаки AI-генерации — рекомендуется живое интервью.');
  }
  if (hasPersonalStory) {
    explanationParts.push('Кандидат раскрывает личный контекст, что повышает достоверность мотивации.');
  }

  const strengths = [];
  if (leadership >= 60) strengths.push('Лидерские инициативы с измеримым результатом');
  if (authenticity >= 70) strengths.push('Высокая аутентичность эссе');
  if (experience >= 50) strengths.push('Подтверждённые достижения');
  if (hasPersonalStory) strengths.push('Яркий личный нарратив');
  if (strengths.length === 0) strengths.push('Готовность к развитию');

  const concerns = [];
  if (aiAnalysis.level !== 'низкий') concerns.push(`AI-риск в эссе: ${aiAnalysis.level}`);
  if (leadership < 40) concerns.push('Мало конкретных лидерских примеров');
  if (experience < 30) concerns.push('Ограниченный формальный опыт');
  if (concerns.length === 0) concerns.push('Существенных опасений не выявлено');

  const recommendation = total >= 75 ? 'рекомендован' : total >= 55 ? 'на рассмотрение' : 'не рекомендован';

  return {
    leadership, motivation, growth, authenticity, experience,
    ai_risk: aiAnalysis.level,
    ai_flags: aiAnalysis.flags,
    leadership_signals: lsSignals,
    recommendation,
    key_strengths: strengths,
    concerns,
    explain: explanationParts.join(' '),
    interview_questions: [
      lsSignals.length > 0
        ? `Расскажите подробнее о моменте, когда вам пришлось принять трудное решение в проекте.`
        : `Приведите конкретный пример, когда вы взяли инициативу без чьей-либо просьбы.`,
      aiAnalysis.level === 'высокий'
        ? `Напишите прямо сейчас 3–4 предложения своими словами: что вас привело в inVision U?`
        : `Какая неудача в вашем опыте стала для вас самым важным уроком?`
    ],
    _source: 'local'
  };
}

(function() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 35; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1
    });
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(26,77,62,${p.opacity})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
function animateCounter(el, target, duration) {
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
setTimeout(() => {
  animateCounter(document.getElementById('counter-total'), 247, 1500);
  animateCounter(document.getElementById('counter-short'), 38, 1200);
  animateCounter(document.getElementById('counter-dims'), 5, 800);
}, 200);

(function() {
  const items = [
    '🏆 Айгерим Сейткали — балл 87 — рекомендована',
    '🔍 Новая заявка от Бекзат Нурланов поступила',
    '⚠️ AI-флаг: Тимур Касымов — требуется интервью',
    '✓ Данара Омарова одобрена для интервью',
    '📊 247 заявок обработано за сезон 2025',
    '🌱 38 кандидатов в шортлисте ждут комиссию',
    '🤖 Детектор AI-текстов: 14 флагов активировано',
    '📋 Мадина Ержанова — потенциал высокий, опыт ограничен',
  ];
  const doubled = [...items, ...items];
  document.getElementById('ticker').innerHTML = doubled.map(t => `
    <span class="ticker-item"><span class="ticker-dot"></span>${t}</span>
  `).join('');
})();

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 60;
  document.getElementById('main-header').classList.toggle('scrolled', scrolled);
  document.getElementById('scroll-top').classList.toggle('visible', window.scrollY > 300);
});

function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  btn.classList.add('active');
  if (id === 'shortlist') showListSection();
  if (id === 'activity') renderActivityPage();
}

function getFilteredCandidates() {
  let list = candidates;
  if (currentFilter === 'high') list = list.filter(c => c.tier === 'high');
  else if (currentFilter === 'review') list = list.filter(c => c.tier === 'review');
  else if (currentFilter === 'flag') list = list.filter(c => c.aiFlag);
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.school.toLowerCase().includes(q));
  }
  list = [...list].sort((a, b) => {
    const va = currentSort.key === 'name' ? a.name : a.score;
    const vb = currentSort.key === 'name' ? b.name : b.score;
    return currentSort.dir * (va > vb ? 1 : -1);
  });
  return list;
}

function renderCandidates() {
  const tbody = document.getElementById('candidates-tbody');
  const list = getFilteredCandidates();
  tbody.innerHTML = list.map((c, i) => {
    const humanAdj = humanComments[c.id] ? humanComments[c.id].adjustment : 0;
    const displayScore = Math.max(0, Math.min(100, c.score + humanAdj));
    const humanBadge = humanAdj !== 0
      ? `<span style="font-size:10px;color:${humanAdj>0?'var(--accent-mid)':'var(--danger)'};margin-left:4px;">${humanAdj>0?'+':''}${humanAdj}</span>`
      : '';
    return `
    <tr class="candidate-row entering" onclick="showDetail(${c.id})" style="animation-delay:${i * 0.05}s">
      <td><div class="rank-num ${currentFilter==='all'&&i<3?'r'+(i+1):''}">${c.rank}</div></td>
      <td>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="avatar" style="background:${c.avBg};color:${c.avColor};">${c.initials}</div>
          <div>
            <div class="cand-name">${c.name}</div>
            <div class="cand-meta">${c.school}</div>
          </div>
        </div>
      </td>
      <td>${c.tags.map(t => `<span class="tag ${t.c}">${t.l}</span>`).join('')}</td>
      <td class="score-cell">
        <span class="score-big ${displayScore>=80?'score-hi':displayScore>=70?'score-md':'score-lo'}">${displayScore}</span>
        <span class="score-max">/100</span>${humanBadge}
      </td>
      <td style="text-align:center;" onclick="event.stopPropagation()">
        <div class="compare-check ${selectedForCompare.has(c.id)?'checked':''}" onclick="toggleCompare(${c.id})"></div>
      </td>
    </tr>`;
  }).join('');
}

function filterCandidates(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCandidates();
}

function searchCandidates(val) {
  currentSearch = val;
  renderCandidates();
}

function sortBy(key) {
  if (currentSort.key === key) currentSort.dir *= -1;
  else { currentSort.key = key; currentSort.dir = key === 'score' ? -1 : 1; }
  document.querySelectorAll('th[id^="th-"]').forEach(th => th.classList.remove('sort-active'));
  document.getElementById('th-' + key).classList.add('sort-active');
  renderCandidates();
}

function toggleCompare(id) {
  if (selectedForCompare.has(id)) selectedForCompare.delete(id);
  else if (selectedForCompare.size < 3) selectedForCompare.add(id);
  else { showToast('⚠', 'Максимум 3 кандидата для сравнения'); return; }
  renderCandidates();
  updateCompareBar();
}

function updateCompareBar() {
  const bar = document.getElementById('compare-bar');
  const n = selectedForCompare.size;
  bar.classList.toggle('visible', n > 1);
  document.getElementById('compare-label').textContent = `Выбрано ${n} кандидата`;
  const avs = [...selectedForCompare].map(id => {
    const c = candidates.find(x => x.id === id);
    return `<div class="compare-avatar" style="background:${c.avBg};color:${c.avColor};">${c.initials}</div>`;
  }).join('');
  document.getElementById('compare-avatars').innerHTML = avs;
}

function clearCompare() {
  selectedForCompare.clear();
  renderCandidates();
  updateCompareBar();
}

function openCompare() {
  const selected = [...selectedForCompare].map(id => candidates.find(c => c.id === id));
  const dimKeys = ['leadership','motivation','growth','authenticity','experience'];
  const dimLabels = ['Лидерство','Мотивация','Рост','Аутентичность','Опыт'];
  const colors = ['#2D7A5F','#378ADD','#7F77DD','#B8860B','#D85A30'];

  let html = `<div style="display:grid;grid-template-columns:repeat(${selected.length},1fr);gap:1rem;margin-bottom:1.5rem;">`;
  selected.forEach(c => {
    const humanAdj = humanComments[c.id] ? humanComments[c.id].adjustment : 0;
    const displayScore = Math.max(0, Math.min(100, c.score + humanAdj));
    html += `<div style="text-align:center;">
      <div class="avatar" style="background:${c.avBg};color:${c.avColor};width:52px;height:52px;font-size:18px;margin:0 auto 8px;">${c.initials}</div>
      <div style="font-weight:500;">${c.name}</div>
      <div style="font-size:12px;color:var(--text-3);">${c.school}</div>
      <div style="font-family:'DM Serif Display',serif;font-size:36px;margin-top:8px;color:${displayScore>=80?'var(--accent-mid)':displayScore>=70?'var(--gold)':'var(--danger)'};">${displayScore}</div>
      ${humanAdj !== 0 ? `<div style="font-size:11px;color:${humanAdj>0?'var(--accent-mid)':'var(--danger)'};">Human: ${humanAdj>0?'+':''}${humanAdj}</div>` : ''}
    </div>`;
  });
  html += '</div>';

  dimKeys.forEach((k, di) => {
    html += `<div class="weight-row"><div class="weight-header"><span style="color:${colors[di]};font-size:13px;">${dimLabels[di]}</span></div>`;
    html += `<div style="display:grid;grid-template-columns:repeat(${selected.length},1fr);gap:8px;">`;
    selected.forEach(c => {
      html += `<div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:4px;">${c.dims[k]}/100</div>
        <div class="bar-track"><div class="bar-fill" style="width:${c.dims[k]}%;background:${colors[di]};"></div></div>
      </div>`;
    });
    html += '</div></div>';
  });

  document.getElementById('compare-content').innerHTML = html;
  document.getElementById('compare-modal').classList.add('open');
}

function closeCompare(e) {
  if (!e || e.target === document.getElementById('compare-modal')) {
    document.getElementById('compare-modal').classList.remove('open');
  }
}

function showDetail(id) {
  const c = candidates.find(x => x.id === id);
  document.getElementById('list-section').style.display = 'none';
  const detailSec = document.getElementById('detail-section');
  detailSec.style.display = 'block';

  const aiHtml = c.aiFlag
    ? `<div class="ai-flag ai-flag-bad">⚠ Высокий риск использования генеративного ИИ — рекомендуется живое интервью</div>`
    : `<div class="ai-flag ai-flag-ok">✓ Эссе соответствует признакам аутентичного авторского текста</div>`;

  const dimBars = dimensions.map(d => `
    <div class="dim-row">
      <div class="dim-header">
        <span class="dim-name">${d.label} <span style="font-size:11px;color:var(--text-3);">· вес ${d.weight}%</span></span>
        <span class="dim-score">${c.dims[d.key]}</span>
      </div>
      <div class="bar-track"><div class="bar-fill" data-target="${c.dims[d.key]}" style="background:${d.color};width:0%;"></div></div>
    </div>
  `).join('');

  const radarHtml = buildRadar(c);
  const humanData = humanComments[id] || {comment:'', adjustment:0, reviewer:''};
  const humanAdj = humanData.adjustment || 0;
  const finalScore = Math.max(0, Math.min(100, c.score + humanAdj));

  const explainRows = buildExplainRows(c);

  document.getElementById('detail-content').innerHTML = `
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem;align-items:start;">
      <div>
        <div class="card" style="margin-bottom:1.25rem;animation:page-in 0.4s both;">
          <div class="card-body">
            <div class="detail-header">
              <div class="avatar detail-avatar" style="background:${c.avBg};color:${c.avColor};">${c.initials}</div>
              <div style="flex:1;">
                <div style="font-family:'DM Serif Display',serif;font-size:22px;">${c.name}</div>
                <div style="font-size:13px;color:var(--text-3);margin-top:2px;">${c.school}</div>
                <div style="margin-top:8px;">${c.tags.map(t=>`<span class="tag ${t.c}">${t.l}</span>`).join('')}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div class="detail-score-big ${finalScore>=80?'score-hi':finalScore>=70?'score-md':'score-lo'}">${finalScore}</div>
                <div style="font-size:12px;color:var(--text-3);">итоговый балл${humanAdj!==0?` (AI: ${c.score} + Human: ${humanAdj>0?'+':''}${humanAdj})`:''}
                </div>
              </div>
            </div>
            ${aiHtml}
          </div>
        </div>

        <!-- Explainable AI section -->
        <div class="card" style="margin-bottom:1.25rem;animation:page-in 0.4s 0.04s both;">
          <div class="card-header">
            <div class="card-title">🔍 Разбор оценки (Explainable AI)</div>
            <span class="tag tag-blue">Прозрачность</span>
          </div>
          <div class="card-body">
            <div style="font-size:12px;color:var(--text-3);margin-bottom:12px;">Каждая строка объясняет, почему поставлен именно этот балл.</div>
            ${explainRows}
          </div>
        </div>

        <div class="card" style="margin-bottom:1.25rem;animation:page-in 0.4s 0.05s both;">
          <div class="card-header"><div class="card-title">Объяснение оценки</div></div>
          <div class="card-body">
            <div class="explain-box">${c.explain}</div>
            <div class="explain-box accent">${c.growth}</div>
          </div>
        </div>

        <div class="card" style="margin-bottom:1.25rem;animation:page-in 0.4s 0.1s both;">
          <div class="card-header"><div class="card-title">Рекомендуемые вопросы для интервью</div></div>
          <div class="card-body">
            ${c.iq.map(q => `<div class="iq-item"><span style="color:var(--accent-mid);flex-shrink:0;">→</span>"${q}"</div>`).join('')}
          </div>
        </div>

        <!-- Human-in-the-loop section -->
        <div class="card" style="animation:page-in 0.4s 0.15s both;border-left:3px solid var(--accent-mid);">
          <div class="card-header">
            <div class="card-title">👤 Human-in-the-loop — оценка рекрутера</div>
            <span class="tag tag-green">Финальное слово за комиссией</span>
          </div>
          <div class="card-body">
            <div style="font-size:12px;color:var(--text-3);margin-bottom:14px;">
              Ваш комментарий и корректировка повлияют на итоговый балл и сохранятся в профиле кандидата.
            </div>
            <div class="form-group">
              <label class="form-label">Рецензент</label>
              <input class="form-input" id="human-reviewer-${id}" placeholder="Ваше имя / роль в комиссии"
                value="${humanData.reviewer||''}" style="max-width:320px;">
            </div>
            <div class="form-group">
              <label class="form-label">Комментарий комиссии</label>
              <textarea class="form-textarea" id="human-comment-${id}" rows="3"
                placeholder="Впечатления, наблюдения, флаги… Этот текст виден только комиссии.">${humanData.comment||''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Корректировка итогового балла</label>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <input type="range" min="-20" max="20" step="1" value="${humanAdj}"
                  id="human-adj-${id}" oninput="updateHumanAdjPreview(${id})"
                  style="width:200px;accent-color:var(--accent-mid);">
                <span style="font-size:18px;font-weight:500;min-width:48px;color:var(--accent-mid);"
                  id="human-adj-preview-${id}">${humanAdj>0?'+':''}${humanAdj}</span>
                <span style="font-size:12px;color:var(--text-3);">Итог: <strong id="human-final-preview-${id}">${finalScore}</strong>/100</span>
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
              <button class="btn btn-primary" onclick="saveHumanReview(${id}, ${c.score})">💾 Сохранить оценку</button>
              <button class="btn btn-ghost" onclick="resetHumanReview(${id})">Сбросить</button>
            </div>
            ${humanData.comment ? `<div style="margin-top:12px;padding:10px 14px;background:var(--accent-light);border-radius:var(--radius);font-size:12px;color:var(--accent);">
              ✓ Рецензия сохранена${humanData.reviewer ? ' — ' + humanData.reviewer : ''} · ${humanData.timestamp || ''}
            </div>` : ''}
          </div>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:1.25rem;animation:page-in 0.4s 0.05s both;">
          <div class="card-header"><div class="card-title">Радар потенциала</div></div>
          <div class="card-body">
            <div class="radar-wrap">${radarHtml}</div>
          </div>
        </div>

        <div class="card" style="margin-bottom:1.25rem;animation:page-in 0.4s 0.1s both;">
          <div class="card-header"><div class="card-title">Оценка по измерениям</div></div>
          <div class="card-body">${dimBars}</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;animation:page-in 0.4s 0.15s both;">
          <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="approveCandidate('${c.name}')">✓ Одобрить для интервью</button>
          <button class="btn btn-ghost" style="width:100%;justify-content:center;" onclick="showToast('📋','Заявка отправлена на доп. проверку')">Запросить доп. проверку</button>
          <button class="btn btn-ghost" style="width:100%;justify-content:center;" onclick="exportCandidate('${c.name}')">↓ Экспорт профиля</button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    document.querySelectorAll('#detail-content .bar-fill').forEach(el => {
      if (el.dataset.target) el.style.width = el.dataset.target + '%';
    });
  }, 100);
}

/**
 * Build Explainable AI rows showing exactly why a score was given.
 */
function buildExplainRows(c) {
  const rows = [
    { label: 'Лидерский потенциал',  val: c.dims.leadership,   weight: customWeights.leadership,   color:'#2D7A5F',
      note: c.dims.leadership >= 80 ? '+' + Math.round(c.dims.leadership * 0.3) + ' за конкретные лидерские действия с результатами'
          : c.dims.leadership >= 55 ? '+' + Math.round(c.dims.leadership * 0.3) + ' за умеренные сигналы лидерства'
          : '-' + Math.round((80 - c.dims.leadership) * 0.15) + ' за отсутствие конкретных примеров инициативы' },
    { label: 'Мотивация и ценности', val: c.dims.motivation,   weight: customWeights.motivation,   color:'#378ADD',
      note: c.dims.motivation >= 80 ? '+' + Math.round(c.dims.motivation * 0.25) + ' за личный нарратив и чёткую цель'
          : '+' + Math.round(c.dims.motivation * 0.25) + ' за артикулированную мотивацию' },
    { label: 'Рост-траектория',       val: c.dims.growth,       weight: customWeights.growth,       color:'#7F77DD',
      note: c.dims.growth >= 80 ? '+' + Math.round(c.dims.growth * 0.2) + ' за доказанный нелинейный рост'
          : '+' + Math.round(c.dims.growth * 0.2) + ' за признаки развития' },
    { label: 'Аутентичность эссе',   val: c.dims.authenticity, weight: customWeights.authenticity, color:'#B8860B',
      note: c.dims.authenticity >= 80 ? '+' + Math.round(c.dims.authenticity * 0.15) + ' за специфичные детали — низкий AI-риск'
          : c.dims.authenticity < 60 ? '-' + Math.round((80 - c.dims.authenticity) * 0.1) + ' за признаки шаблонности'
          : '+' + Math.round(c.dims.authenticity * 0.15) + ' — аутентичность в норме' },
    { label: 'Практический опыт',    val: c.dims.experience,   weight: customWeights.experience,   color:'#D85A30',
      note: c.dims.experience >= 80 ? '+' + Math.round(c.dims.experience * 0.1) + ' за значимые внешние достижения'
          : '+' + Math.round(c.dims.experience * 0.1) + ' за имеющийся опыт' },
  ];

  return rows.map(row => {
    const contribution = Math.round(row.val * row.weight / 100);
    const isPos = row.val >= 60;
    return `<div class="explain-box" style="border-left:3px solid ${row.color};border-radius:0 var(--radius) var(--radius) 0;background:${isPos?'var(--accent-light)':'var(--danger-light)'};margin-bottom:8px;display:flex;align-items:flex-start;gap:12px;">
      <div style="min-width:48px;text-align:right;">
        <span style="font-size:16px;font-weight:700;color:${isPos?'var(--accent-mid)':'var(--danger)'};">${isPos?'+':''}${contribution}</span>
        <div style="font-size:10px;color:var(--text-3);">из ${row.weight}</div>
      </div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:500;color:var(--text);margin-bottom:2px;">${row.label} — ${row.val}/100</div>
        <div style="font-size:12px;color:var(--text-2);">${row.note}</div>
      </div>
      <div style="flex-shrink:0;">
        <div class="bar-track" style="width:60px;">
          <div style="height:100%;width:${row.val}%;background:${row.color};border-radius:4px;transition:width 1s;"></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function updateHumanAdjPreview(id) {
  const adj = parseInt(document.getElementById(`human-adj-${id}`).value) || 0;
  const c = candidates.find(x => x.id === id);
  const finalScore = Math.max(0, Math.min(100, c.score + adj));
  document.getElementById(`human-adj-preview-${id}`).textContent = (adj > 0 ? '+' : '') + adj;
  document.getElementById(`human-final-preview-${id}`).textContent = finalScore;
}

function saveHumanReview(id, baseScore) {
  const comment  = document.getElementById(`human-comment-${id}`).value.trim();
  const reviewer = document.getElementById(`human-reviewer-${id}`).value.trim();
  const adj      = parseInt(document.getElementById(`human-adj-${id}`).value) || 0;

  humanComments[id] = {
    comment,
    reviewer,
    adjustment: adj,
    timestamp: new Date().toLocaleTimeString('ru', {hour:'2-digit', minute:'2-digit'})
  };

  renderCandidates();
  showToast('💾', `Рецензия сохранена. Итоговый балл: ${Math.max(0,Math.min(100,baseScore+adj))}`);

  const feedEl = document.getElementById('activity-feed');
  if (feedEl) {
    const c = candidates.find(x => x.id === id);
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `<div class="feed-dot" style="background:#2D7A5F;"></div>
      <div>
        <div class="feed-text">👤 <strong>${reviewer||'Комиссия'}</strong> оставил(а) рецензию на <strong>${c.name}</strong>${adj!==0?` (${adj>0?'+':''}${adj} к баллу)`:''}</div>
        <div class="feed-time">Только что</div>
      </div>`;
    feedEl.insertBefore(item, feedEl.firstChild);
  }
}

function resetHumanReview(id) {
  delete humanComments[id];
  if (document.getElementById(`human-comment-${id}`))   document.getElementById(`human-comment-${id}`).value = '';
  if (document.getElementById(`human-reviewer-${id}`))  document.getElementById(`human-reviewer-${id}`).value = '';
  if (document.getElementById(`human-adj-${id}`))       document.getElementById(`human-adj-${id}`).value = '0';
  updateHumanAdjPreview(id);
  renderCandidates();
  showToast('🔄', 'Рецензия сброшена');
}

function buildRadar(c) {
  const keys   = ['leadership','motivation','growth','authenticity','experience'];
  const labels = ['Лидерство','Мотивация','Рост','Аутентичность','Опыт'];
  const n = keys.length;
  const cx = 100, cy = 100, r = 75;
  const angles = keys.map((_, i) => (i / n) * Math.PI * 2 - Math.PI / 2);

  const getPoint = (angle, val) => {
    const rr = (val / 100) * r;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  };

  const gridPolygons = [20, 40, 60, 80, 100].map(pct => {
    const pts = angles.map(a => getPoint(a, pct).join(',')).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>`;
  }).join('');

  const axisLines = angles.map(a => {
    const [x, y] = getPoint(a, 100);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>`;
  }).join('');

  const dataPoints = angles.map((a, i) => getPoint(a, c.dims[keys[i]]));
  const polygon = `<polygon points="${dataPoints.map(p => p.join(',')).join(' ')}" fill="rgba(45,122,95,0.15)" stroke="#2D7A5F" stroke-width="2" stroke-linejoin="round"/>`;
  const dots = dataPoints.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#2D7A5F" stroke="white" stroke-width="2"/>`).join('');

  const labelItems = angles.map((a, i) => {
    const [x, y] = getPoint(a, 120);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="rgba(0,0,0,0.4)" font-family="DM Sans,sans-serif">${labels[i]}</text>`;
  }).join('');

  return `<svg width="200" height="200" viewBox="0 0 200 200">${gridPolygons}${axisLines}${polygon}${dots}${labelItems}</svg>`;
}

function showListSection() {
  document.getElementById('list-section').style.display = 'block';
  document.getElementById('detail-section').style.display = 'none';
  document.getElementById('detail-content').innerHTML = '';
  renderCandidates();
}

function approveCandidate(name) {
  showToast('✓', `${name} одобрена для интервью!`);
  incrementStat('stat-approved');
}

function exportCandidate(name) {
  showToast('↓', `Профиль ${name} подготовлен к экспорту`);
}

function showToast(icon, text, duration = 3500) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${text}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function updateFormProgress() {
  const fields = ['inp-name','inp-school','inp-essay','inp-achievements'];
  const filled = fields.filter(id => document.getElementById(id).value.trim().length > 0).length;
  const pct = Math.round((filled / fields.length) * 100);
  const circumference = 88;
  const offset = circumference - (pct / 100) * circumference;
  document.getElementById('form-progress-circle').style.strokeDashoffset = offset;
  document.getElementById('form-progress-label').textContent = pct + '%';
}

function updateCharCount(el, counterId, max) {
  const len = el.value.length;
  const counter = document.getElementById(counterId);
  counter.textContent = len + ' / ' + max;
  counter.className = 'char-counter' + (len > max * 0.9 ? ' danger' : len > max * 0.75 ? ' warn' : '');
}

function renderWeightBars() {
  document.getElementById('weight-bars').innerHTML = dimensions.map(d => `
    <div class="weight-row">
      <div class="weight-header"><span style="color:var(--text-2);">${d.label}</span><span style="font-weight:500;">${d.weight}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${d.weight * 3.2}%;background:${d.color};"></div></div>
    </div>
  `).join('');
}

function renderWeightSliders() {
  document.getElementById('weight-sliders').innerHTML = dimensions.map(d => `
    <div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <label style="font-size:13px;color:var(--text-2);">${d.label}</label>
        <span style="font-size:13px;font-weight:500;color:${d.color};" id="wval-${d.key}">${customWeights[d.key]}%</span>
      </div>
      <input type="range" min="5" max="60" step="5" value="${customWeights[d.key]}"
        style="width:100%;accent-color:${d.color};"
        oninput="updateWeight('${d.key}', this.value)">
    </div>
  `).join('');
}

function updateWeight(key, val) {
  customWeights[key] = parseInt(val);
  document.getElementById('wval-' + key).textContent = val + '%';
  const total = Object.values(customWeights).reduce((a,b) => a+b, 0);
  const tag = document.getElementById('weights-sum-tag');
  tag.textContent = 'Сумма: ' + total + '%';
  tag.className = 'tag ' + (total === 100 ? 'tag-green' : 'tag-red');
}

const feedEvents = [
  {icon:'✓', color:'#2D7A5F', text:'<strong>Айгерим Сейткали</strong> одобрена для интервью', time:'2 мин назад'},
  {icon:'🔍', color:'#378ADD', text:'Поступила новая заявка от <strong>Бекзат Нурланов</strong>', time:'15 мин назад'},
  {icon:'⚠', color:'#B8860B', text:'AI-флаг поднят: <strong>Тимур Касымов</strong> — требуется доп. проверка', time:'34 мин назад'},
  {icon:'📊', color:'#7F77DD', text:'Анализ заявки <strong>Данара Омарова</strong> завершён — балл 79', time:'1 ч назад'},
  {icon:'👥', color:'#1A4D3E', text:'Комиссия просмотрела <strong>12 заявок</strong> за сегодня', time:'2 ч назад'},
];

function renderActivityPage() {
  const feed = document.getElementById('activity-feed');
  feed.innerHTML = feedEvents.map((e, i) => `
    <div class="feed-item" style="animation-delay:${i * 0.08}s;">
      <div class="feed-dot" style="background:${e.color};"></div>
      <div>
        <div class="feed-text">${e.text}</div>
        <div class="feed-time">${e.time}</div>
      </div>
    </div>
  `).join('');

  const online = [
    {name:'Комиссар Ержан А.', status:'Просматривает шортлист', active:true},
    {name:'Модератор Айна С.', status:'Проверяет AI-флаги', active:true},
    {name:'Ассистент Мейрам Т.', status:'Не активен', active:false},
  ];
  document.getElementById('online-list').innerHTML = online.map(u => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);">
      <div style="width:8px;height:8px;border-radius:50%;background:${u.active?'#2D7A5F':'var(--text-3)'};flex-shrink:0;"></div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:500;">${u.name}</div>
        <div style="font-size:11px;color:var(--text-3);">${u.status}</div>
      </div>
    </div>
  `).join('');
}

let feedCount = 0;
const newEvents = [
  {icon:'📋', color:'#1A3E6E', text:'<strong>Мадина Ержанова</strong> добавлена в очередь на рассмотрение', time:'Только что'},
  {icon:'✓', color:'#2D7A5F', text:'Экспорт профиля <strong>Бекзат Нурланов</strong> завершён', time:'Только что'},
  {icon:'🔔', color:'#B8860B', text:'Напоминание: 3 заявки истекают через 24 часа', time:'Только что'},
];

function addFeedItem() {
  const e = newEvents[feedCount % newEvents.length];
  feedCount++;
  const feed = document.getElementById('activity-feed');
  const item = document.createElement('div');
  item.className = 'feed-item';
  item.style.animationDelay = '0s';
  item.innerHTML = `<div class="feed-dot" style="background:${e.color};"></div><div><div class="feed-text">${e.text}</div><div class="feed-time">${e.time}</div></div>`;
  feed.insertBefore(item, feed.firstChild);
  incrementStat('stat-analyzed');
  showToast('🔔', 'Новое событие добавлено в ленту');
}

function incrementStat(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = parseInt(el.textContent) + 1;
}

function clearForm() {
  ['inp-name','inp-school','inp-essay','inp-achievements'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('analyze-result').innerHTML = `
    <div class="card" style="height:100%;display:flex;align-items:center;justify-content:center;min-height:300px;">
      <div style="text-align:center;color:var(--text-3);">
        <div style="font-size:40px;margin-bottom:12px;">🔍</div>
        <div style="font-size:14px;">Заполните форму и нажмите<br>«Анализировать» для получения оценки</div>
      </div>
    </div>`;
  updateFormProgress();
}

const sampleCandidates = [
  {name:'Нурсултан Аймагамбетов', school:'Колледж, г. Кызылорда',
   essay:'Я вырос в семье учителей в Кызылорде. Видя, как родители работают без современных инструментов, я создал школьное приложение для управления домашними заданиями. За 6 месяцев его установили 200 учеников. Это научило меня, что технологии должны решать реальные проблемы, а не быть показухой.',
   achievements:'Разработал мобильное приложение, призёр хакатона Qazaqstan'},
  {name:'Зарина Байжанова', school:'НИШ, г. Шымкент',
   essay:'В 16 лет я организовала клуб дебатов в своей школе, когда узнала, что многие одноклассники боятся публично говорить. Через год у нас было 40 участников и первое место на городском турнире. Я убеждена: лидерство — это не должность, а привычка помогать другим раскрыться.',
   achievements:'Чемпион области по дебатам, ментор для 15 школьников'}
];
let sampleIdx = 0;

function loadSampleCandidate() {
  const s = sampleCandidates[sampleIdx % sampleCandidates.length];
  sampleIdx++;
  document.getElementById('inp-name').value = s.name;
  document.getElementById('inp-school').value = s.school;
  document.getElementById('inp-essay').value = s.essay;
  document.getElementById('inp-achievements').value = s.achievements;
  updateFormProgress();
  updateCharCount(document.getElementById('inp-essay'), 'essay-counter', 2000);
  showToast('📋', 'Пример кандидата загружен');
}

async function analyzeCandidate() {
  const name         = document.getElementById('inp-name').value.trim();
  const school       = document.getElementById('inp-school').value.trim();
  const essay        = document.getElementById('inp-essay').value.trim();
  const achievements = document.getElementById('inp-achievements').value.trim();
  const grades       = document.getElementById('inp-grades').value;

  if (!name || !essay) { showToast('⚠', 'Введите имя и эссе кандидата'); return; }

  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.innerHTML = `Анализирую <span class="dots"><span></span><span></span><span></span></span>`;

  const local = localAnalyzeCandidate(name, school, essay, achievements, grades);
  const localTotal = Math.round(
    local.leadership   * (customWeights.leadership   / 100) +
    local.motivation   * (customWeights.motivation   / 100) +
    local.growth       * (customWeights.growth       / 100) +
    local.authenticity * (customWeights.authenticity / 100) +
    local.experience   * (customWeights.experience   / 100)
  );

  showAnalysisResult(name, school, grades, local, localTotal, true);

  const prompt = `Ты — система поддержки отбора кандидатов в inVision U (инновационный университет с 100% грантами в Казахстане). Верни ТОЛЬКО валидный JSON без Markdown, без пояснений.

Кандидат:
- Имя: ${name}
- Школа/регион: ${school || 'не указано'}
- Успеваемость: ${grades}
- Достижения: ${achievements || 'не указаны'}
- Эссе (${essay.split(' ').length} слов): ${essay}

Твоя задача — глубокий анализ по критериям inVision U:
1. leadership (0-100): ищи КОНКРЕТНЫЕ поведенческие сигналы — глаголы действия, измеримые результаты, командные роли
2. motivation (0-100): наличие личного нарратива, специфичность цели, связь с миссией университета
3. growth (0-100): нелинейный личный рост, преодоление трудностей, рефлексия над ошибками
4. authenticity (0-100): оригинальность стиля, конкретные детали, отсутствие клише — это НЕ AI-риск, это наоборот
5. experience (0-100): подтверждённые достижения, проекты, волонтёрство

ВАЖНО: Оценка "пути, а не статуса" — кандидат из малого города с реальным проектом ценится выше формальных достижений без инициативы.

Формат ответа (строго JSON):
{"leadership":0,"motivation":0,"growth":0,"authenticity":0,"experience":0,"ai_risk":"низкий","recommendation":"рекомендован","key_strengths":["сила1","сила2"],"concerns":["опасение1"],"explain":"2-3 предложения на русском — конкретно, без воды","interview_questions":["вопрос1?","вопрос2?"],"growth_trajectory":"1 предложение о траектории роста","leadership_signals":["сигнал1","сигнал2"]}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text = data.content.map(i => i.text || '').join('');
    const r = JSON.parse(text.replace(/```json|```/g, '').trim());
    r.ai_flags = local.ai_flags;
    r._source = 'claude';

    const total = Math.round(
      r.leadership   * (customWeights.leadership   / 100) +
      r.motivation   * (customWeights.motivation   / 100) +
      r.growth       * (customWeights.growth       / 100) +
      r.authenticity * (customWeights.authenticity / 100) +
      r.experience   * (customWeights.experience   / 100)
    );

    showAnalysisResult(name, school, grades, r, total, false);
    incrementStat('stat-analyzed');
    showToast('✓', `Глубокий анализ Claude завершён — балл: ${total}`);

  } catch (e) {
    showToast('⚠', `Claude недоступен — показан локальный анализ (${e.message})`);
    console.warn('Claude API error:', e);
  }

  btn.disabled = false;
  btn.innerHTML = 'Анализировать';
}

function showAnalysisResult(name, school, grades, r, total, isLoading) {
  const scoreClass = total >= 80 ? 'score-hi' : total >= 65 ? 'score-md' : 'score-lo';
  const recTag     = r.recommendation === 'рекомендован' ? 'tag-green' : r.recommendation === 'на рассмотрение' ? 'tag-amber' : 'tag-red';
  const aiCls      = r.ai_risk === 'высокий' ? 'ai-flag-bad' : r.ai_risk === 'средний' ? 'ai-flag-warn' : 'ai-flag-ok';
  const aiIcon     = r.ai_risk === 'высокий' ? '⚠' : r.ai_risk === 'средний' ? '~' : '✓';

  const dimCols    = ['#2D7A5F','#378ADD','#7F77DD','#B8860B','#D85A30'];
  const dimKeys    = ['leadership','motivation','growth','authenticity','experience'];
  const dimShort   = ['Лидерство','Мотивация','Рост','Аутентичность','Опыт'];

  const radarC  = { dims: { leadership: r.leadership, motivation: r.motivation, growth: r.growth, authenticity: r.authenticity, experience: r.experience } };
  const radarSvg = buildRadar(radarC);

  const lsSignals = r.leadership_signals || [];
  const lsBlock = lsSignals.length > 0
    ? `<div style="margin-bottom:12px;">
        <div class="section-heading">Сигналы лидерства в тексте</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${lsSignals.map(s => `<span class="tag tag-green">✓ ${s}</span>`).join('')}
        </div>
       </div>`
    : `<div class="explain-box" style="color:var(--text-3);margin-bottom:12px;">Конкретные сигналы лидерства не выявлены — рекомендуется уточняющее интервью.</div>`;

  const aiFlags = r.ai_flags || [];
  const aiFlagsBlock = aiFlags.length > 0
    ? `<div style="margin-bottom:12px;">
        <div class="section-heading">Маркеры AI-детекции</div>
        ${aiFlags.map(f => `<div style="font-size:12px;color:var(--warn);padding:4px 0;border-bottom:1px solid var(--border);">⚠ ${f}</div>`).join('')}
       </div>`
    : '';

  const explainBreakdown = dimKeys.map((k, i) => {
    const val = r[k];
    const contribution = Math.round(val * (customWeights[k] / 100));
    const isPos = val >= 60;
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:13px;font-weight:700;color:${isPos?'var(--accent-mid)':'var(--danger)'};min-width:36px;text-align:right;">${isPos?'+':''}${contribution}</span>
      <span style="font-size:12px;color:var(--text-2);flex:1;">${dimShort[i]} (${val}/100 × ${customWeights[k]}%)</span>
      <div style="width:50px;height:4px;background:var(--surface2);border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:${val}%;background:${dimCols[i]};border-radius:2px;"></div>
      </div>
    </div>`;
  }).join('');

  const sourceTag = isLoading
    ? `<span class="tag tag-amber">⏳ Локальный анализ</span>`
    : `<span class="tag tag-green">✓ Анализ Claude AI</span>`;

  document.getElementById('analyze-result').innerHTML = `
    <div class="result-box" style="animation:page-in 0.4s both;">
      <div class="result-header">
        <div>
          <div style="font-family:'DM Serif Display',serif;font-size:22px;">${name}</div>
          <div style="font-size:13px;opacity:0.7;margin-top:2px;">${school || '—'} · ${grades}</div>
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
            <span class="tag ${recTag}" style="font-size:12px;">${r.recommendation}</span>
            ${sourceTag}
          </div>
        </div>
        <div style="text-align:right;">
          <div class="result-score-num">${total}</div>
          <div style="font-size:13px;opacity:0.6;">/100 итоговый балл</div>
        </div>
      </div>

      <div class="result-body">
        <div class="ai-flag ${aiCls}" style="margin-bottom:1.25rem;">${aiIcon} AI-риск в эссе: <strong>${r.ai_risk}</strong></div>

        <!-- Score breakdown -->
        <div class="card" style="margin-bottom:1rem;border:1px solid var(--border);">
          <div class="card-header" style="padding:12px 16px;">
            <div class="card-title">🔍 Разбор по измерениям (Explainable AI)</div>
          </div>
          <div style="padding:8px 16px 12px;">${explainBreakdown}</div>
        </div>

        <div class="dim-mini-grid">
          ${dimKeys.map((k, i) => `
            <div class="dim-mini">
              <div class="dim-mini-score" style="color:${dimCols[i]}">${r[k]}</div>
              <div class="dim-mini-label">${dimShort[i]}</div>
            </div>`).join('')}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;align-items:start;">
          <div>
            <div class="section-heading">Объяснение</div>
            <div class="explain-box">${r.explain}</div>
            ${r.growth_trajectory ? `<div class="explain-box accent">${r.growth_trajectory}</div>` : ''}
            ${lsBlock}
            ${aiFlagsBlock}
          </div>
          <div>
            <div class="section-heading">Радар потенциала</div>
            <div style="display:flex;justify-content:center;">${radarSvg}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
          <div>
            <div class="section-heading">Сильные стороны</div>
            ${(r.key_strengths || []).map(s => `<span class="tag tag-green" style="margin:2px;display:inline-flex;">${s}</span>`).join('')}
          </div>
          <div>
            <div class="section-heading">Опасения</div>
            ${(r.concerns || []).map(s => `<span class="tag tag-amber" style="margin:2px;display:inline-flex;">${s}</span>`).join('')}
          </div>
        </div>

        <div style="margin-bottom:1.25rem;">
          <div class="section-heading">Вопросы для интервью</div>
          ${(r.interview_questions || []).map(q => `<div class="iq-item"><span style="color:var(--accent-mid);">→</span>"${q}"</div>`).join('')}
        </div>

        <!-- Human-in-the-loop in analysis result -->
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:1rem;margin-bottom:1rem;">
          <div style="font-size:13px;font-weight:500;color:var(--text);margin-bottom:10px;">👤 Human-in-the-loop — добавить рецензию</div>
          <textarea id="result-human-comment" class="form-textarea" rows="2"
            placeholder="Комментарий комиссии (необязательно)…" style="margin-bottom:8px;"></textarea>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:12px;color:var(--text-3);">Корр. балла:</span>
            <input type="range" min="-15" max="15" step="1" value="0"
              id="result-human-adj" oninput="document.getElementById('result-adj-preview').textContent=(+this.value>0?'+':'')+this.value"
              style="flex:1;accent-color:var(--accent-mid);">
            <span id="result-adj-preview" style="min-width:28px;font-weight:600;font-size:13px;">0</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="addResultToShortlist('${name.replace(/'/g,"\\'")}', ${total})">Добавить в шортлист</button>
            <button class="btn btn-ghost" onclick="showToast('↓','Профиль ${name.replace(/'/g,"\\'")} подготовлен к экспорту')">Экспорт</button>
          </div>
        </div>
      </div>
    </div>`;
}

function addResultToShortlist(name, baseScore) {
  const adj = parseInt(document.getElementById('result-human-adj').value) || 0;
  const comment = document.getElementById('result-human-comment').value.trim();
  const finalScore = Math.max(0, Math.min(100, baseScore + adj));
  showToast('✓', `${name} добавлен в шортлист. Итоговый балл: ${finalScore}`);
  incrementStat('stat-approved');
  incrementStat('stat-analyzed');

  const feedEl = document.getElementById('activity-feed');
  if (feedEl) {
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `<div class="feed-dot" style="background:#2D7A5F;"></div>
      <div>
        <div class="feed-text">✓ <strong>${name}</strong> добавлен в шортлист — балл <strong>${finalScore}</strong>${comment ? ` · «${comment.slice(0,40)}…»` : ''}</div>
        <div class="feed-time">Только что</div>
      </div>`;
    feedEl.insertBefore(item, feedEl.firstChild);
  }
}
renderCandidates();
renderWeightBars();
renderWeightSliders();
updateFormProgress();
updateCharCount(document.getElementById('inp-essay'), 'essay-counter', 2000);

setTimeout(() => {
  document.querySelectorAll('.bar-fill').forEach(el => {
    if (el.dataset.target) el.style.width = el.dataset.target + '%';
  });
  document.querySelectorAll('#weight-bars .bar-fill').forEach(el => {
    el.style.width = el.style.width;
  });
}, 200);