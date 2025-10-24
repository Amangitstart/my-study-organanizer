(function(){
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const yearSpan = document.getElementById('year');
  const authSection = document.getElementById('authSection');
  const appSection = document.getElementById('appSection');
  const userMenu = document.getElementById('userMenu');
  const userEmailSpan = document.getElementById('userEmail');
  const logoutBtn = document.getElementById('logoutBtn');

  // Tabs in auth
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginPanel = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');

  // Forms
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Subnav
  const subnav = document.querySelector('.subnav');
  const subnavLinks = document.querySelectorAll('.subnav-link');

  // Subjects elements
  const addSubjectForm = document.getElementById('addSubjectForm');
  const newSubjectName = document.getElementById('newSubjectName');
  const subjectsList = document.getElementById('subjectsList');

  // Subject dialog + topics
  const subjectDialog = document.getElementById('subjectDialog');
  const subjectDialogTitle = document.getElementById('subjectDialogTitle');
  const addTopicForm = document.getElementById('addTopicForm');
  const newTopicTitle = document.getElementById('newTopicTitle');
  const pendingTopics = document.getElementById('pendingTopics');
  const completedTopics = document.getElementById('completedTopics');

  // Assignments
  const addAssignmentForm = document.getElementById('addAssignmentForm');
  const assignmentTitle = document.getElementById('assignmentTitle');
  const assignmentSubject = document.getElementById('assignmentSubject');
  const assignmentDue = document.getElementById('assignmentDue');
  const assignmentStatus = document.getElementById('assignmentStatus');
  const assignmentsList = document.getElementById('assignmentsList');
  const assignmentAlerts = document.getElementById('assignmentAlerts');

  // Notes
  const addNoteForm = document.getElementById('addNoteForm');
  const noteTitle = document.getElementById('noteTitle');
  const noteSubject = document.getElementById('noteSubject');
  const noteText = document.getElementById('noteText');
  const noteFileInput = document.getElementById('noteFile');
  const uploadNoteFileBtn = document.getElementById('uploadNoteFileBtn');
  const notesList = document.getElementById('notesList');
  const filesList = document.getElementById('filesList');

  // PYQ
  const addPyqForm = document.getElementById('addPyqForm');
  const pyqSubject = document.getElementById('pyqSubject');
  const pyqYear = document.getElementById('pyqYear');
  const pyqFile = document.getElementById('pyqFile');
  const pyqList = document.getElementById('pyqList');

  // Marks
  const marksForm = document.getElementById('marksForm');
  const m1 = document.getElementById('m1');
  const m2 = document.getElementById('m2');
  const m3 = document.getElementById('m3');
  const finalMax = document.getElementById('finalMax');
  const passingTotal = document.getElementById('passingTotal');
  const marksResult = document.getElementById('marksResult');

  // Share/Requests
  const shareAssignmentForm = document.getElementById('shareAssignmentForm');
  const shareAssignmentId = document.getElementById('shareAssignmentId');
  const shareNote = document.getElementById('shareNote');
  const sharedFeed = document.getElementById('sharedFeed');
  const requestForm = document.getElementById('requestForm');
  const requestSubject = document.getElementById('requestSubject');
  const requestTitle = document.getElementById('requestTitle');
  const requestDesc = document.getElementById('requestDesc');
  const requestsList = document.getElementById('requestsList');

  // Global shared/request feed (visible across accounts on same device)
  const LS_SHARED = 'study_shared_feed_v1';
  const LS_REQUESTS = 'study_requests_v1';
  function getShared(){
    try { return JSON.parse(localStorage.getItem(LS_SHARED) || '[]'); } catch { return []; }
  }
  function setShared(items){ localStorage.setItem(LS_SHARED, JSON.stringify(items)); }
  function getRequests(){
    try { return JSON.parse(localStorage.getItem(LS_REQUESTS) || '[]'); } catch { return []; }
  }
  function setRequests(items){ localStorage.setItem(LS_REQUESTS, JSON.stringify(items)); }

  // --- Theme ---
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
  themeToggle?.addEventListener('click', () => {
    const newTheme = root.classList.contains('dark') ? 'light' : 'dark';
    setTheme(newTheme);
  });
  function setTheme(theme){
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }
  yearSpan && (yearSpan.textContent = new Date().getFullYear().toString());

  // --- Simple auth with localStorage ---
  const LS_USERS = 'study_users_v1';
  const LS_SESSION = 'study_session_v1';
  function getUsers(){
    try { return JSON.parse(localStorage.getItem(LS_USERS) || '{}'); } catch { return {}; }
  }
  function setUsers(users){ localStorage.setItem(LS_USERS, JSON.stringify(users)); }
  async function hash(str){
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function getSession(){
    try { return JSON.parse(localStorage.getItem(LS_SESSION) || 'null'); } catch { return null; }
  }
  function setSession(email){ localStorage.setItem(LS_SESSION, JSON.stringify({ email })); }
  function clearSession(){ localStorage.removeItem(LS_SESSION); }

  function requireAuthUI(){
    const session = getSession();
    if (session?.email){
      authSection.hidden = true;
      appSection.hidden = false;
      userMenu.hidden = false;
      userEmailSpan.textContent = session.email;
      loadAllData();
    } else {
      authSection.hidden = false;
      appSection.hidden = true;
      userMenu.hidden = true;
    }
  }

  // Auth tab toggle
  loginTab?.addEventListener('click', ()=>activateTab('login'));
  signupTab?.addEventListener('click', ()=>activateTab('signup'));
  function activateTab(which){
    const isLogin = which === 'login';
    loginTab.classList.toggle('active', isLogin);
    signupTab.classList.toggle('active', !isLogin);
    loginPanel.classList.toggle('hidden', !isLogin);
    signupPanel.classList.toggle('hidden', isLogin);
    loginTab.setAttribute('aria-selected', String(isLogin));
    signupTab.setAttribute('aria-selected', String(!isLogin));
  }

  // Signup
  signupForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = (document.getElementById('signupEmail')).value.trim().toLowerCase();
    const pass = (document.getElementById('signupPassword')).value;
    const users = getUsers();
    if (users[email]){ alert('Account already exists'); return; }
    const passwordHash = await hash(pass);
    users[email] = { passwordHash };
    setUsers(users);
    setSession(email);
    requireAuthUI();
  });

  // Login
  loginForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = (document.getElementById('loginEmail')).value.trim().toLowerCase();
    const pass = (document.getElementById('loginPassword')).value;
    const users = getUsers();
    const user = users[email];
    if (!user){ alert('No account. Please sign up.'); return; }
    const passwordHash = await hash(pass);
    if (passwordHash !== user.passwordHash){ alert('Incorrect password'); return; }
    setSession(email);
    requireAuthUI();
  });

  // Logout
  logoutBtn?.addEventListener('click', ()=>{ clearSession(); requireAuthUI(); });

  // --- Data Model per user (localStorage) ---
  const NS = 'study_data_v1';
  function keyFor(email){ return `${NS}:${email}`; }
  function loadData(){
    const session = getSession();
    if (!session) return null;
    try { return JSON.parse(localStorage.getItem(keyFor(session.email)) || '{}'); } catch { return {}; }
  }
  function saveData(data){
    const session = getSession();
    if (!session) return;
    localStorage.setItem(keyFor(session.email), JSON.stringify(data));
  }

  function loadAllData(){
    const data = ensureDefaults(loadData());
    renderSubjects(data);
    renderAssignments(data);
    renderNotes(data);
    renderPYQ(data);
    renderShareAndRequests(data);
    renderMarks(data);
  }
  function ensureDefaults(data){
    const base = data && typeof data === 'object' ? data : {};
    base.subjects = base.subjects || [];
    base.assignments = base.assignments || [];
    base.notes = base.notes || [];
    base.files = base.files || [];
    base.pyqs = base.pyqs || [];
    base.shared = base.shared || [];
    base.requests = base.requests || [];
    base.marks = base.marks || { m1:0, m2:0, m3:0, finalMax:100, passingTotal:40 };
    return base;
  }

  // --- Subnav switching ---
  subnav?.addEventListener('click', (e)=>{
    const btn = e.target.closest('.subnav-link');
    if (!btn) return;
    subnavLinks.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
    document.getElementById(btn.dataset.target)?.classList.remove('hidden');
  });

  // --- Subjects & topics ---
  addSubjectForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = newSubjectName.value.trim();
    if (!name) return;
    const data = ensureDefaults(loadData());
    const id = `sub_${Date.now().toString(36)}`;
    data.subjects.push({ id, name, topics: [] });
    saveData(data);
    newSubjectName.value='';
    renderSubjects(data);
  });

  function renderSubjects(data){
    subjectsList.innerHTML = '';
    data.subjects.forEach(s=>{
      const el = document.createElement('div');
      el.className='card';
      el.innerHTML = `
        <div class="item">
          <div class="row">
            <strong>${escapeHtml(s.name)}</strong>
            <span class="badge">${s.topics.filter(t=>!t.done).length} pending</span>
            <span class="badge">${s.topics.filter(t=>t.done).length} done</span>
          </div>
          <div class="row">
            <button class="btn btn-secondary sm" data-act="open" data-id="${s.id}">Open</button>
            <button class="btn btn-secondary sm" data-act="rename" data-id="${s.id}">Rename</button>
            <button class="btn btn-secondary sm" data-act="delete" data-id="${s.id}">Delete</button>
          </div>
        </div>`;
      subjectsList.appendChild(el);
    });
  }

  subjectsList?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    const data = ensureDefaults(loadData());
    const subject = data.subjects.find(s=>s.id===id);
    if (!subject) return;

    if (act==='open'){
      openSubjectDialog(subject);
    } else if (act==='rename'){
      const name = prompt('New subject name', subject.name);
      if (name){ subject.name = name.trim(); saveData(data); renderSubjects(data); }
    } else if (act==='delete'){
      if (confirm('Delete subject?')){
        data.subjects = data.subjects.filter(s=>s.id!==id);
        saveData(data); renderSubjects(data);
      }
    }
  });

  function openSubjectDialog(subject){
    subjectDialogTitle.textContent = subject.name;
    renderTopics(subject);
    if (typeof subjectDialog.showModal === 'function') subjectDialog.showModal();
  }

  function renderTopics(subject){
    pendingTopics.innerHTML='';
    completedTopics.innerHTML='';
    subject.topics.forEach((t)=>{
      const li = document.createElement('li');
      li.className='item';
      li.innerHTML = `
        <div class="row">
          <input type="checkbox" ${t.done?'checked':''} data-id="${t.id}" />
          <span>${escapeHtml(t.title)}</span>
        </div>
        <div class="row">
          <button class="btn btn-secondary sm" data-edit="${t.id}">Edit</button>
          <button class="btn btn-secondary sm" data-del="${t.id}">Delete</button>
        </div>`;
      (t.done? completedTopics : pendingTopics).appendChild(li);
    });

    pendingTopics.onclick = completedTopics.onclick = (e)=>{
      const btn = e.target.closest('button');
      const chk = e.target.closest('input[type="checkbox"]');
      const data = ensureDefaults(loadData());
      const s = data.subjects.find(s=>s.id===subject.id);
      if (!s) return;
      if (chk){
        const t = s.topics.find(t=>t.id===chk.dataset.id);
        if (!t) return;
        t.done = chk.checked;
        saveData(data);
        renderTopics(s);
        renderSubjects(data);
      } else if (btn && btn.dataset.edit){
        const t = s.topics.find(t=>t.id===btn.dataset.edit);
        const title = prompt('Edit topic title', t?.title || '');
        if (title){ t.title = title.trim(); saveData(data); renderTopics(s); renderSubjects(data); }
      } else if (btn && btn.dataset.del){
        if (confirm('Delete topic?')){
          s.topics = s.topics.filter(t=>t.id!==btn.dataset.del);
          saveData(data); renderTopics(s); renderSubjects(data);
        }
      }
    }
  }

  addTopicForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const title = newTopicTitle.value.trim();
    if (!title) return;
    const data = ensureDefaults(loadData());
    const s = data.subjects.find(s=>s.name===subjectDialogTitle.textContent);
    if (!s) return;
    s.topics.push({ id: `t_${Date.now().toString(36)}`, title, done:false });
    saveData(data);
    newTopicTitle.value='';
    renderTopics(s);
    renderSubjects(data);
  });

  subjectDialog?.addEventListener('close', ()=>{
    // no-op
  });

  // --- Assignments ---
  addAssignmentForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = ensureDefaults(loadData());
    data.assignments.push({
      id:`a_${Date.now().toString(36)}`,
      title: assignmentTitle.value.trim(),
      subject: assignmentSubject.value.trim(),
      due: assignmentDue.value,
      status: assignmentStatus.value
    });
    saveData(data);
    assignmentTitle.value=''; assignmentSubject.value=''; assignmentDue.value=''; assignmentStatus.value='pending';
    renderAssignments(data);
  });

  function renderAssignments(data){
    assignmentsList.innerHTML='';
    assignmentAlerts.innerHTML='';
    const today = new Date();
    const soonMs = 1000*60*60*24*2; // 2 days
    data.assignments.forEach(a=>{
      const dueDate = a.due ? new Date(a.due) : null;
      const li = document.createElement('div');
      li.className='item';
      const dueStr = dueDate ? dueDate.toLocaleDateString() : '—';
      li.innerHTML = `
        <div class="row">
          <strong>${escapeHtml(a.title)}</strong>
          <span class="badge">${escapeHtml(a.subject||'General')}</span>
          <span class="badge">Due: ${dueStr}</span>
          <span class="badge">${a.status}</span>
        </div>
        <div class="row">
          <button class="btn btn-secondary sm" data-edit="${a.id}">Edit</button>
          <button class="btn btn-secondary sm" data-del="${a.id}">Delete</button>
        </div>`;
      assignmentsList.appendChild(li);

      if (dueDate && a.status!=='done'){
        const delta = dueDate - today;
        if (delta < 0){
          addAlert('danger', `Overdue: ${a.title} (due ${dueStr})`);
        } else if (delta < soonMs){
          addAlert('warn', `Due soon: ${a.title} (due ${dueStr})`);
        }
      }
    });

    assignmentsList.onclick = (e)=>{
      const btn = e.target.closest('button');
      if (!btn) return;
      const data = ensureDefaults(loadData());
      if (btn.dataset.edit){
        const a = data.assignments.find(x=>x.id===btn.dataset.edit);
        if (!a) return;
        const title = prompt('Title', a.title) || a.title;
        const subject = prompt('Subject', a.subject) || a.subject;
        const due = prompt('Due date (YYYY-MM-DD)', a.due) || a.due;
        const status = prompt('Status (pending/in_progress/done)', a.status) || a.status;
        Object.assign(a, { title: title.trim(), subject: subject.trim(), due, status });
        saveData(data); renderAssignments(data);
      } else if (btn.dataset.del){
        if (confirm('Delete assignment?')){
          data.assignments = data.assignments.filter(x=>x.id!==btn.dataset.del);
          saveData(data); renderAssignments(data);
        }
      }
    }
  }

  function addAlert(type, text){
    const div = document.createElement('div');
    div.className = `alert ${type}`;
    div.textContent = text;
    assignmentAlerts.appendChild(div);
  }

  // --- Notes (text + files) ---
  addNoteForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = ensureDefaults(loadData());
    const note = { id:`n_${Date.now().toString(36)}`, title: noteTitle.value.trim(), subject: noteSubject.value.trim(), text: noteText.value.trim() };
    data.notes.push(note);
    saveData(data);
    noteTitle.value=''; noteSubject.value=''; noteText.value='';
    renderNotes(data);
  });

  uploadNoteFileBtn?.addEventListener('click', async ()=>{
    const file = noteFileInput.files?.[0];
    if (!file) { alert('Select a file'); return; }
    const data = ensureDefaults(loadData());
    const fileEntry = { id:`f_${Date.now().toString(36)}`, name: file.name, type: file.type, size: file.size, createdAt: Date.now() };
    // Read as data URL for local preview storage
    const reader = new FileReader();
    reader.onload = ()=>{
      fileEntry.dataUrl = reader.result;
      data.files.push(fileEntry);
      saveData(data);
      renderNotes(data);
      noteFileInput.value='';
    };
    reader.readAsDataURL(file);
  });

  function renderNotes(data){
    notesList.innerHTML='';
    filesList.innerHTML='';
    data.notes.forEach(n=>{
      const li = document.createElement('li');
      li.className='item';
      li.innerHTML = `
        <div class="row">
          <strong>${escapeHtml(n.title)}</strong>
          <span class="badge">${escapeHtml(n.subject||'General')}</span>
        </div>
        <div class="row">
          <button class="btn btn-secondary sm" data-edit="${n.id}">Edit</button>
          <button class="btn btn-secondary sm" data-del="${n.id}">Delete</button>
        </div>`;
      notesList.appendChild(li);
    });
    notesList.onclick = (e)=>{
      const btn = e.target.closest('button');
      if (!btn) return;
      const data = ensureDefaults(loadData());
      if (btn.dataset.edit){
        const n = data.notes.find(x=>x.id===btn.dataset.edit);
        if (!n) return;
        const title = prompt('Title', n.title) || n.title;
        const subject = prompt('Subject', n.subject) || n.subject;
        const text = prompt('Text', n.text) || n.text;
        Object.assign(n, { title: title.trim(), subject: subject.trim(), text: text.trim() });
        saveData(data); renderNotes(data);
      } else if (btn.dataset.del){
        if (confirm('Delete note?')){
          data.notes = data.notes.filter(x=>x.id!==btn.dataset.del);
          saveData(data); renderNotes(data);
        }
      }
    }

    data.files.forEach(f=>{
      const li = document.createElement('li');
      li.className='item';
      const sizeKb = Math.round(f.size/1024);
      li.innerHTML = `
        <div class="row">
          <strong>${escapeHtml(f.name)}</strong>
          <span class="badge">${sizeKb} KB</span>
        </div>
        <div class="row">
          <a class="btn btn-secondary sm" href="${f.dataUrl}" download="${escapeHtml(f.name)}">Download</a>
          <button class="btn btn-secondary sm" data-del-file="${f.id}">Delete</button>
        </div>`;
      filesList.appendChild(li);
    });
    filesList.onclick = (e)=>{
      const btn = e.target.closest('button');
      if (!btn) return;
      const data = ensureDefaults(loadData());
      if (btn.dataset.delFile){
        if (confirm('Delete file?')){
          data.files = data.files.filter(x=>x.id!==btn.dataset.delFile);
          saveData(data); renderNotes(data);
        }
      }
    }
  }

  // --- PYQ ---
  addPyqForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (!pyqFile.files?.[0]){ alert('Choose a file'); return; }
    const file = pyqFile.files[0];
    const reader = new FileReader();
    reader.onload = ()=>{
      const data = ensureDefaults(loadData());
      data.pyqs.push({ id:`p_${Date.now().toString(36)}`, subject: pyqSubject.value.trim(), year: Number(pyqYear.value), name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
      saveData(data);
      renderPYQ(data);
      pyqSubject.value=''; pyqYear.value=''; pyqFile.value='';
    };
    reader.readAsDataURL(file);
  });

  function renderPYQ(data){
    pyqList.innerHTML='';
    // sort by subject then year desc
    const sorted = [...data.pyqs].sort((a,b)=> a.subject.localeCompare(b.subject) || b.year - a.year);
    sorted.forEach(p=>{
      const li = document.createElement('li');
      li.className='item';
      const sizeKb = Math.round(p.size/1024);
      li.innerHTML = `
        <div class="row">
          <strong>${escapeHtml(p.subject)}</strong>
          <span class="badge">${p.year}</span>
          <span class="badge">${sizeKb} KB</span>
        </div>
        <div class="row">
          <a class="btn btn-secondary sm" href="${p.dataUrl}" download="${escapeHtml(p.name)}">Download</a>
          <button class="btn btn-secondary sm" data-del="${p.id}">Delete</button>
        </div>`;
      pyqList.appendChild(li);
    });
    pyqList.onclick = (e)=>{
      const btn = e.target.closest('button');
      if (!btn) return;
      const data = ensureDefaults(loadData());
      if (btn.dataset.del){
        if (confirm('Delete PYQ?')){
          data.pyqs = data.pyqs.filter(x=>x.id!==btn.dataset.del);
          saveData(data); renderPYQ(data);
        }
      }
    }
  }

  // --- Marks tracker ---
  marksForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = ensureDefaults(loadData());
    const vals = { m1:Number(m1.value), m2:Number(m2.value), m3:Number(m3.value), finalMax:Number(finalMax.value), passingTotal:Number(passingTotal.value) };
    data.marks = vals;
    saveData(data);
    renderMarks(data);
  });

  function renderMarks(data){
    marksResult.innerHTML='';
    const { m1:am1, m2:am2, m3:am3, finalMax:amax, passingTotal:pt } = data.marks || {};
    const current = (Number(am1)||0) + (Number(am2)||0) + (Number(am3)||0);
    const needed = Math.max(0, Number(pt) - current);
    const warn = needed > amax ? `Even ${amax} marks in final won't reach ${pt}.` : `Need ${needed} in final to reach ${pt}.`;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${needed>amax? 'danger' : needed>0 ? 'warn':'ok'}`;
    alertDiv.textContent = warn;
    marksResult.appendChild(alertDiv);
  }

  // --- Share & Requests ---
  shareAssignmentForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const session = getSession();
    const items = getShared();
    items.unshift({ id:`s_${Date.now().toString(36)}`, assignmentId: shareAssignmentId.value.trim(), note: shareNote.value.trim(), at: Date.now(), by: session?.email || 'anonymous' });
    setShared(items);
    shareAssignmentId.value=''; shareNote.value='';
    renderShareAndRequests();
  });

  requestForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const session = getSession();
    const items = getRequests();
    items.unshift({ id:`r_${Date.now().toString(36)}`, subject: requestSubject.value.trim(), title: requestTitle.value.trim(), desc: requestDesc.value.trim(), at: Date.now(), by: session?.email || 'anonymous' });
    setRequests(items);
    requestSubject.value=''; requestTitle.value=''; requestDesc.value='';
    renderShareAndRequests();
  });

  function renderShareAndRequests(){
    sharedFeed.innerHTML='';
    const sharedItems = getShared();
    sharedItems.forEach(s=>{
      const li = document.createElement('li');
      li.className='item';
      const time = new Date(s.at).toLocaleString();
      li.innerHTML = `
        <div class="row">
          <strong>#${escapeHtml(s.assignmentId)}</strong>
          <span class="badge">${time}</span>
          <span class="badge">by ${escapeHtml(s.by||'')}</span>
        </div>
        <div class="row">
          <span>${escapeHtml(s.note || '')}</span>
          <button class="btn btn-secondary sm" data-del-share="${s.id}">Remove</button>
        </div>`;
      sharedFeed.appendChild(li);
    });
    sharedFeed.onclick = (e)=>{
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.delShare){
        const items = getShared().filter(x=>x.id!==btn.dataset.delShare);
        setShared(items); renderShareAndRequests();
      }
    }

    requestsList.innerHTML='';
    const reqItems = getRequests();
    reqItems.forEach(r=>{
      const li = document.createElement('li');
      li.className='item';
      const time = new Date(r.at).toLocaleString();
      li.innerHTML = `
        <div class="row">
          <strong>${escapeHtml(r.subject)} — ${escapeHtml(r.title)}</strong>
          <span class="badge">${time}</span>
          <span class="badge">by ${escapeHtml(r.by||'')}</span>
        </div>
        <div class="row">
          <span>${escapeHtml(r.desc || '')}</span>
          <button class="btn btn-secondary sm" data-del-req="${r.id}">Remove</button>
        </div>`;
      requestsList.appendChild(li);
    });
    requestsList.onclick = (e)=>{
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.delReq){
        const items = getRequests().filter(x=>x.id!==btn.dataset.delReq);
        setRequests(items); renderShareAndRequests();
      }
    }
  }

  // --- utils ---
  function escapeHtml(str){
    return String(str || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[ch]);
  }

  // Initialize
  requireAuthUI();
})();