/* ============================================
   CogniTime — Assistente de Estudos
   JS puro: login, Pomodoro, materiais,
   revisão espaçada e simulado.
   ============================================ */

const STORAGE = {
  EMAIL: 'cognitime_email',
  USERS: 'cognitime_users',
  MATERIALS: 'cognitime_materials',
  STATS: 'cognitime_stats',
  LEARNED: 'cognitime_learned',
};

/* ---------- HELPERS ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const load = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function userKey(base) {
  const email = load(STORAGE.EMAIL, null);
  return email ? `${base}_${email}` : base;
}

/* ============================================
   LOGIN
   ============================================ */
const loginScreen = $('#login-screen');
const appScreen = $('#app-screen');
const loginForm = $('#login-form');
const emailInput = $('#email');
const passwordInput = $('#password');

function checkAuth() {
  const email = load(STORAGE.EMAIL, null);
  if (email) {
    enterApp(email);
  } else {
    // pré-preenche último e-mail salvo se houver
    const last = localStorage.getItem('cognitime_last_email');
    if (last) emailInput.value = last;
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  if (!email || password.length < 4) return;

  const users = load(STORAGE.USERS, {});
  if (users[email]) {
    if (users[email] !== password) {
      alert('Senha incorreta para esse e-mail.');
      return;
    }
  } else {
    users[email] = password;
    save(STORAGE.USERS, users);
  }

  save(STORAGE.EMAIL, email);
  localStorage.setItem('cognitime_last_email', email);
  enterApp(email);
});

function enterApp(email) {
  loginScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  $('#user-email').textContent = email;
  renderMaterials();
  renderSchedule();
  populateQuizMaterials();
  updateStats();
  renderLearned();
}

$('#logout-btn').addEventListener('click', () => {
  localStorage.removeItem(STORAGE.EMAIL);
  appScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  passwordInput.value = '';
});

/* ============================================
   TABS
   ============================================ */
$$('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach((t) => t.classList.remove('active'));
    $$('.tab-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    $(`#tab-${tab.dataset.tab}`).classList.add('active');
  });
});

/* ============================================
   POMODORO TIMER
   ============================================ */
let timer = { interval: null, remaining: 25 * 60, running: false, mode: 'focus', cycle: 0 };

const displayEl = $('#timer-display');
const statusEl = $('#timer-status');
const startBtn = $('#start-btn');
const pauseBtn = $('#pause-btn');

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const r = (s % 60).toString().padStart(2, '0');
  return `${m}:${r}`;
}

function renderTimer() { displayEl.textContent = fmt(timer.remaining); }

function setMode(mode) {
  timer.mode = mode;
  const focus = parseInt($('#focus-min').value, 10) || 25;
  const short = parseInt($('#short-break').value, 10) || 5;
  const long = parseInt($('#long-break').value, 10) || 15;
  if (mode === 'focus') { timer.remaining = focus * 60; statusEl.textContent = 'Foco — concentre-se'; }
  else if (mode === 'short') { timer.remaining = short * 60; statusEl.textContent = 'Pausa curta'; }
  else { timer.remaining = long * 60; statusEl.textContent = 'Pausa longa'; }
  renderTimer();
}

startBtn.addEventListener('click', () => {
  if (timer.running) return;
  timer.running = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  timer.interval = setInterval(() => {
    timer.remaining--;
    renderTimer();
    if (timer.remaining <= 0) {
      clearInterval(timer.interval);
      timer.running = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      if (timer.mode === 'focus') {
        const focus = parseInt($('#focus-min').value, 10) || 25;
        recordSession(focus);
        timer.cycle++;
        setMode(timer.cycle % 4 === 0 ? 'long' : 'short');
        notify('Sessão concluída! Hora da pausa.');
      } else {
        setMode('focus');
        notify('Pausa terminada. Vamos focar?');
      }
    }
  }, 1000);
});

pauseBtn.addEventListener('click', () => {
  clearInterval(timer.interval);
  timer.running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
});

$('#reset-btn').addEventListener('click', () => {
  clearInterval(timer.interval);
  timer.running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  setMode('focus');
});

['focus-min', 'short-break', 'long-break'].forEach((id) => {
  $('#' + id).addEventListener('change', () => { if (!timer.running) setMode(timer.mode); });
});

function notify(msg) {
  statusEl.textContent = msg;
  try { new Audio('data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play(); } catch {}
}

function recordSession(min) {
  const today = new Date().toISOString().slice(0, 10);
  const stats = load(userKey(STORAGE.STATS), {});
  stats[today] = stats[today] || { sessions: 0, minutes: 0 };
  stats[today].sessions += 1;
  stats[today].minutes += min;
  save(userKey(STORAGE.STATS), stats);
  updateStats();
}

function updateStats() {
  const today = new Date().toISOString().slice(0, 10);
  const stats = load(userKey(STORAGE.STATS), {});
  const t = stats[today] || { sessions: 0, minutes: 0 };
  $('#sessions-count').textContent = t.sessions;
  $('#focus-total').textContent = t.minutes;
}

setMode('focus');

/* ============================================
   MATERIAIS
   ============================================ */
const materialForm = $('#material-form');
const materialsList = $('#materials-list');

materialForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = $('#material-title').value.trim();
  const subject = $('#material-subject').value.trim();
  const notes = $('#material-notes').value.trim();
  const file = $('#material-file').files[0];

  let fileName = null;
  let fileText = '';
  if (file) {
    fileName = file.name;
    if (file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name)) {
      fileText = await file.text();
    } else {
      fileText = `[Arquivo "${file.name}" anexado — conteúdo binário]`;
    }
  }

  const materials = load(userKey(STORAGE.MATERIALS), []);
  materials.push({
    id: Date.now(),
    title, subject, notes, fileName, fileText,
    createdAt: new Date().toISOString(),
  });
  save(userKey(STORAGE.MATERIALS), materials);

  materialForm.reset();
  renderMaterials();
  renderSchedule();
  populateQuizMaterials();
});

function renderMaterials() {
  const materials = load(userKey(STORAGE.MATERIALS), []);
  materialsList.innerHTML = '';
  if (materials.length === 0) {
    materialsList.innerHTML = '<li class="muted" style="justify-content:center;">Nenhum material ainda. Adicione o primeiro!</li>';
    return;
  }
  materials.forEach((m) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${escapeHtml(m.title)}</strong>
        <div class="meta">${escapeHtml(m.subject)} ${m.fileName ? '• 📎 ' + escapeHtml(m.fileName) : ''}</div>
      </div>
      <button class="del" data-id="${m.id}">Remover</button>`;
    materialsList.appendChild(li);
  });
  materialsList.querySelectorAll('.del').forEach((b) => {
    b.addEventListener('click', () => {
      const id = +b.dataset.id;
      const list = load(userKey(STORAGE.MATERIALS), []).filter((x) => x.id !== id);
      save(userKey(STORAGE.MATERIALS), list);
      renderMaterials();
      renderSchedule();
      populateQuizMaterials();
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ============================================
   CRONOGRAMA DE REVISÃO ESPAÇADA
   Intervalos: 1, 3, 7, 14, 30 dias após criação
   ============================================ */
const SPACING = [1, 3, 7, 14, 30];
const scheduleList = $('#schedule-list');

$('#regen-schedule').addEventListener('click', renderSchedule);

function renderSchedule() {
  const materials = load(userKey(STORAGE.MATERIALS), []);
  const items = [];
  materials.forEach((m) => {
    const base = new Date(m.createdAt);
    SPACING.forEach((d, i) => {
      const date = new Date(base);
      date.setDate(date.getDate() + d);
      items.push({
        date,
        title: m.title,
        subject: m.subject,
        round: i + 1,
      });
    });
  });
  items.sort((a, b) => a.date - b.date);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  scheduleList.innerHTML = '';
  if (items.length === 0) {
    scheduleList.innerHTML = '<p class="muted">Adicione materiais para gerar um cronograma.</p>';
    return;
  }

  items.forEach((it) => {
    const d = new Date(it.date); d.setHours(0, 0, 0, 0);
    const isToday = d.getTime() === today.getTime();
    const isPast = d < today;
    const div = document.createElement('div');
    div.className = 'schedule-item' + (isToday ? ' today' : '');
    div.innerHTML = `
      <div>
        <div class="date">${it.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
        <strong>${escapeHtml(it.title)}</strong>
        <small> — ${escapeHtml(it.subject)} • Revisão ${it.round}ª</small>
      </div>
      <small>${isToday ? '⏰ Hoje' : isPast ? '✓ Passada' : ''}</small>`;
    scheduleList.appendChild(div);
  });
}

/* ============================================
   SIMULADO (gerador local)
   ============================================ */
const quizMatSelect = $('#quiz-material');
const quizContainer = $('#quiz-container');
const quizResult = $('#quiz-result');

function populateQuizMaterials() {
  const materials = load(userKey(STORAGE.MATERIALS), []);
  quizMatSelect.innerHTML = '';
  if (materials.length === 0) {
    quizMatSelect.innerHTML = '<option value="">(adicione materiais primeiro)</option>';
    return;
  }
  materials.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `${m.title} — ${m.subject}`;
    quizMatSelect.appendChild(opt);
  });
}

$('#generate-quiz').addEventListener('click', () => {
  const id = +quizMatSelect.value;
  const count = Math.max(1, Math.min(20, parseInt($('#quiz-count').value, 10) || 5));
  const material = load(userKey(STORAGE.MATERIALS), []).find((m) => m.id === id);
  if (!material) { alert('Selecione um material.'); return; }

  const questions = generateQuiz(material, count);
  renderQuiz(questions);
});

function generateQuiz(material, count) {
  const source = `${material.title}. ${material.notes} ${material.fileText || ''}`.trim();
  const sentences = source
    .split(/[\.\!\?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length >= 5);

  const questions = [];
  const used = new Set();

  for (let i = 0; i < count; i++) {
    if (sentences.length === 0) break;
    let idx, sentence;
    let tries = 0;
    do {
      idx = Math.floor(Math.random() * sentences.length);
      sentence = sentences[idx];
      tries++;
    } while (used.has(idx) && tries < 20);
    used.add(idx);

    const words = sentence.split(' ').filter((w) => w.length > 4);
    if (words.length < 2) {
      questions.push(makeConceptQuestion(material, i + 1));
      continue;
    }
    const answer = words[Math.floor(Math.random() * words.length)].replace(/[^\wÀ-ÿ]/g, '');
    const blanked = sentence.replace(answer, '_____');
    const distractors = pickDistractors(words, answer, 3);
    const options = shuffle([answer, ...distractors]);

    questions.push({
      prompt: `Complete: "${blanked}"`,
      options,
      answer,
      explanation: `A frase original do material é: "${sentence}". A palavra-chave é "${answer}". Revise a seção "${material.title}" da matéria ${material.subject}.`,
      subject: material.subject,
      materialTitle: material.title,
    });
  }

  while (questions.length < count) questions.push(makeConceptQuestion(material, questions.length + 1));
  return questions;
}

function makeConceptQuestion(material, n) {
  return {
    prompt: `Questão ${n}: Qual é o tema principal de "${material.title}"?`,
    options: shuffle([material.subject, 'Geografia', 'História da Arte', 'Educação Física']),
    answer: material.subject,
    explanation: `Este material foi cadastrado dentro da matéria "${material.subject}".`,
    subject: material.subject,
    materialTitle: material.title,
  };
}

function pickDistractors(pool, answer, n) {
  const filtered = pool.map((w) => w.replace(/[^\wÀ-ÿ]/g, '')).filter((w) => w && w !== answer);
  const set = new Set(filtered);
  const arr = [...set];
  shuffle(arr);
  while (arr.length < n) arr.push(['conceito', 'exemplo', 'definição', 'método', 'teoria'][arr.length % 5]);
  return arr.slice(0, n);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderQuiz(questions) {
  quizContainer.innerHTML = '';
  quizResult.innerHTML = '';
  quizResult.classList.remove('show');
  const state = questions.map(() => ({ chosen: null, correct: null }));

  questions.forEach((q, qi) => {
    const box = document.createElement('div');
    box.className = 'quiz-question';
    box.innerHTML = `<h4>${qi + 1}. ${escapeHtml(q.prompt)}</h4>`;
    const opts = document.createElement('div');
    opts.className = 'quiz-options';
    q.options.forEach((opt) => {
      const b = document.createElement('button');
      b.className = 'quiz-option';
      b.textContent = opt;
      b.addEventListener('click', () => {
        if (state[qi].chosen !== null) return;
        state[qi].chosen = opt;
        state[qi].correct = opt === q.answer;
        if (state[qi].correct) recordLearned(q);
        opts.querySelectorAll('.quiz-option').forEach((o) => {
          if (o.textContent === q.answer) o.classList.add('correct');
          else if (o === b) o.classList.add('wrong');
        });
        const exp = document.createElement('div');
        exp.className = 'explanation';
        exp.innerHTML = `<strong>${state[qi].correct ? '✓ Correto!' : '✗ Errado.'}</strong> ${escapeHtml(q.explanation)}`;
        box.appendChild(exp);
        updateQuizResult(state);
      });
      opts.appendChild(b);
    });
    box.appendChild(opts);
    quizContainer.appendChild(box);
  });
}

function updateQuizResult(state) {
  const answered = state.filter((s) => s.chosen !== null).length;
  if (answered < state.length) return;
  const right = state.filter((s) => s.correct).length;
  const pct = Math.round((right / state.length) * 100);
  quizResult.classList.add('show');
  quizResult.innerHTML = `
    <h3>Resultado: ${right}/${state.length} (${pct}%)</h3>
    <p class="muted">${pct >= 70 ? 'Excelente! Continue revisando para fixar.' : 'Reveja o material e tente novamente para superar suas dificuldades.'}</p>`;
}

/* ============================================
   INIT
   ============================================ */
checkAuth();

/* ============================================
   APRENDIZADO (histórico de acertos)
   ============================================ */
const learnedList = $('#learned-list');
const learnedFilter = $('#learned-filter');

function recordLearned(q) {
  const list = load(userKey(STORAGE.LEARNED), []);
  // evita duplicar exatamente o mesmo prompt+resposta
  if (list.some((x) => x.prompt === q.prompt && x.answer === q.answer)) return;
  list.push({
    prompt: q.prompt,
    answer: q.answer,
    explanation: q.explanation,
    subject: q.subject || '—',
    materialTitle: q.materialTitle || '—',
    learnedAt: new Date().toISOString(),
  });
  save(userKey(STORAGE.LEARNED), list);
  renderLearned();
}

function renderLearned() {
  if (!learnedList) return;
  const list = load(userKey(STORAGE.LEARNED), []);
  const subjects = [...new Set(list.map((x) => x.subject))];

  $('#learned-count').textContent = list.length;
  $('#learned-unique').textContent = new Set(list.map((x) => x.prompt)).size;
  $('#learned-subjects').textContent = subjects.length;

  // mantém a seleção atual do filtro
  const current = learnedFilter.value;
  learnedFilter.innerHTML = '<option value="">Todas as matérias</option>' +
    subjects.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  if (subjects.includes(current)) learnedFilter.value = current;

  const filter = learnedFilter.value;
  const filtered = filter ? list.filter((x) => x.subject === filter) : list;

  learnedList.innerHTML = '';
  if (filtered.length === 0) {
    learnedList.innerHTML = '<p class="muted">Ainda não há acertos registrados. Faça um simulado para começar a construir seu histórico de aprendizado.</p>';
    return;
  }

  // mais recentes primeiro
  filtered.slice().reverse().forEach((it) => {
    const div = document.createElement('div');
    div.className = 'schedule-item';
    const when = new Date(it.learnedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    div.innerHTML = `
      <div style="flex:1; min-width:0;">
        <div class="date">✓ ${escapeHtml(it.subject)} — ${escapeHtml(it.materialTitle)}</div>
        <strong style="display:block; margin:4px 0;">${escapeHtml(it.prompt)}</strong>
        <small style="color: var(--aqua);">Resposta: ${escapeHtml(it.answer)}</small>
        <div class="explanation" style="margin-top:8px;">${escapeHtml(it.explanation)}</div>
      </div>
      <small>${when}</small>`;
    learnedList.appendChild(div);
  });
}

learnedFilter.addEventListener('change', renderLearned);
$('#clear-learned').addEventListener('click', () => {
  if (!confirm('Apagar todo o histórico de aprendizado?')) return;
  save(userKey(STORAGE.LEARNED), []);
  renderLearned();
});