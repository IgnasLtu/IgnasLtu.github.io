document.addEventListener('DOMContentLoaded', function () {
  const board = document.getElementById('skillBoard');
  if (!board) return; 

  const PLANNED = 'Planuojama';
  const LEARNING = 'Mokomasi';
  const DONE = 'Atlikta';
  const STATES = [PLANNED, LEARNING, DONE];

  const skills = [
    { id: 1, name: 'Python programavimas',            state: DONE,     xp: 60 },
    { id: 2, name: 'Oracle SQL duomenų bazės',        state: DONE,     xp: 40 },
    { id: 3, name: 'Git ir GitHub',                   state: DONE,     xp: 30 },
    { id: 4, name: 'MATLAB modeliavimas',             state: DONE,     xp: 50 },
    { id: 5, name: 'Duomenų analizė (NumPy, Pandas)', state: LEARNING, xp: 60 },
    { id: 6, name: 'Mašininis mokymasis',             state: LEARNING, xp: 80 },
    { id: 7, name: 'HTML ir CSS',                     state: PLANNED,  xp: 70 },
    { id: 8, name: 'JavaScript',                      state: PLANNED,  xp: 90 },
  ];

  const LEVELS = [
    { level: 1, min: 0,   nextMin: 50,   rank: 'Pradedantysis' },
    { level: 2, min: 50,  nextMin: 150,  rank: 'Praktikantas' },
    { level: 3, min: 150, nextMin: 300,  rank: 'Specialistas' },
    { level: 4, min: 300, nextMin: null, rank: 'Profesionalas' }
  ];

  const AVATAR_PATHS = {
    level1: 'assets/img/avatar-1.svg',
    level2: 'assets/img/avatar-2.svg',
    level3: 'assets/img/avatar-3.svg',
    level4: 'assets/img/avatar-4.svg'
  };

  function calculateTotalXP() {
    let total = 0;
    for (const skill of skills) {
      if (skill.state === DONE) {
        total += skill.xp;
      }
    }
    return total;
  }

  function getLevelInfo(xp) {
    let current = LEVELS[0];
    for (const lvl of LEVELS) {
      if (xp >= lvl.min) {
        current = lvl;
      }
    }
    return current;
  }

  function calculateProgress(xp, lvl) {
    if (lvl.nextMin === null) {
      return 100;
    }
    const earned = xp - lvl.min;
    const needed = lvl.nextMin - lvl.min;
    return Math.round((earned / needed) * 100);
  }

  function getAvatarSrc(level) {
    if (level === 1) {
      return AVATAR_PATHS.level1;
    } else if (level === 2) {
      return AVATAR_PATHS.level2;
    } else if (level === 3) {
      return AVATAR_PATHS.level3;
    } else {
      return AVATAR_PATHS.level4;
    }
  }

  const columnBodies = {}; 
  const columnCounts = {}; 

  function buildBoard() {
    STATES.forEach(function (state) {
      const column = document.createElement('div');
      column.className = 'sk-column';
      column.dataset.state = state;

      const header = document.createElement('div');
      header.className = 'sk-column-header';

      const title = document.createElement('h3');
      title.textContent = state;

      const count = document.createElement('span');
      count.className = 'sk-count';

      const body = document.createElement('div');
      body.className = 'sk-column-body';

      header.appendChild(title);
      header.appendChild(count);
      column.appendChild(header);
      column.appendChild(body);
      board.appendChild(column);

      columnBodies[state] = body;
      columnCounts[state] = count;
    });
  }

  function createSkillCard(skill) {
    const card = document.createElement('div');
    card.className = 'sk-card';

    const name = document.createElement('h4');
    name.textContent = skill.name;

    const xp = document.createElement('span');
    xp.className = 'sk-xp-badge';
    xp.textContent = skill.xp + ' XP';

    const select = document.createElement('select');
    select.className = 'sk-select';
    select.setAttribute('aria-label', 'Keisti įgūdžio „' + skill.name + '“ būseną');

    STATES.forEach(function (state) {
      const option = document.createElement('option');
      option.value = state;
      option.textContent = state;
      if (state === skill.state) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', function () {
      changeSkillState(skill.id, select.value);
    });

    card.appendChild(name);
    card.appendChild(xp);
    card.appendChild(select);
    return card;
  }

  function renderBoard() {
    STATES.forEach(function (state) {
      columnBodies[state].textContent = '';
    });

    skills.forEach(function (skill) {
      columnBodies[skill.state].appendChild(createSkillCard(skill));
    });

    STATES.forEach(function (state) {
      const inColumn = skills.filter(function (s) { return s.state === state; }).length;
      columnCounts[state].textContent = inColumn;

      if (inColumn === 0) {
        const empty = document.createElement('p');
        empty.className = 'sk-empty';
        empty.textContent = 'Čia kol kas nėra įgūdžių';
        columnBodies[state].appendChild(empty);
      }
    });
  }

  function renderProfile() {
    const xp = calculateTotalXP();
    const lvl = getLevelInfo(xp);
    const progress = calculateProgress(xp, lvl);

    document.getElementById('totalXp').textContent = xp;
    document.getElementById('levelNumber').textContent = lvl.level;
    document.getElementById('rankName').textContent = lvl.rank;

    document.getElementById('xpBarFill').style.width = progress + '%';
    document.getElementById('xpBar').setAttribute('aria-valuenow', progress);

    const barText = document.getElementById('xpBarText');
    if (lvl.nextMin === null) {
      barText.textContent = 'Pasiektas aukščiausias lygis (100 %)';
    } else {
      const earned = xp - lvl.min;
      const needed = lvl.nextMin - lvl.min;
      barText.textContent = earned + ' / ' + needed + ' XP (' + progress + ' %) iki ' + (lvl.level + 1) + ' lygio';
    }

    updateAvatar(lvl);
  }

  function updateAvatar(lvl) {
    const avatar = document.getElementById('avatarImg');
    const newSrc = getAvatarSrc(lvl.level);

    if (!avatar.src.endsWith(newSrc)) {
      avatar.src = newSrc;
      avatar.classList.add('sk-avatar-pop');
      avatar.addEventListener('animationend', function () {
        avatar.classList.remove('sk-avatar-pop');
      }, { once: true });
    }
    avatar.alt = 'Vartotojo avataras: ' + lvl.rank + ' (' + lvl.level + ' lygis)';
  }

  function renderStats() {
    const total = skills.length;
    const done = skills.filter(function (s) { return s.state === DONE; }).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statPercent').textContent = percent + '%';
  }

  function changeSkillState(id, newState) {
    const skill = skills.find(function (s) { return s.id === id; });
    if (!skill) return;

    skill.state = newState; 
    updateAll();            
  }

  function updateAll() {
    renderBoard();
    renderProfile();
    renderStats();
  }

  buildBoard();
  updateAll();
});
