(() => {
  const COLOR = { info: '#4e9a6b', ok: '#6fd694', err: '#c96b4a', easter: '#b68235' };

  const COMMANDS = {
    help: () => [{ text: 'commands: ls, pwd, whoami, date, cat <file>, links, clear', color: COLOR.info }],
    ls: () => [{ text: 'about.txt  skills.txt  contact.txt  links.txt', color: COLOR.ok }],
    pwd: () => [{ text: '/home/billy', color: COLOR.ok }],
    whoami: () => [{ text: 'billy', color: COLOR.ok }],
    date: () => [{ text: new Date().toString(), color: COLOR.ok }],
    'cat about.txt': () => [{ text: "backend dev, devops habit. builds things that don't page him at 3am.", color: COLOR.ok }],
    'cat skills.txt': () => [{ text: 'php, laravel, docker, ci/cd, gcp/aws/azure, linux', color: COLOR.ok }],
    'cat contact.txt': () => [{ text: 'me@billytoledo.com', color: COLOR.ok }],
    links: () => [{ text: 'github.com/billytoledo', color: COLOR.ok }],
    flux: () => [{ text: '1.21 GIGAWATTS', color: COLOR.easter }],
  };

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (cmd === '') return [];
    if (COMMANDS[cmd]) return COMMANDS[cmd]();
    return [{ text: `command not found: ${raw}`, color: COLOR.err }];
  }

  function initTerminal() {
    const wrap = document.getElementById('terminal');
    const output = document.getElementById('terminal-output');
    const inputText = document.getElementById('terminal-input-text');
    const input = document.getElementById('terminal-input');
    if (!wrap || !output || !inputText || !input) return;

    let lines = [
      { text: 'SYSTEM READY.', color: COLOR.info },
      { text: "type 'help' for a list of commands", color: COLOR.info },
    ];
    const history = [];
    let historyIndex = 0;

    function render() {
      output.innerHTML = '';
      const frag = document.createDocumentFragment();
      for (const line of lines) {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        div.style.color = line.color;
        div.textContent = line.text;
        frag.appendChild(div);
      }
      output.appendChild(frag);
      inputText.textContent = input.value;
      output.scrollTop = output.scrollHeight;
    }

    wrap.addEventListener('click', () => input.focus());
    input.addEventListener('input', render);
    input.addEventListener('keydown', (e) => {
      // ctrl+l: clear screen, keep history (standard shell behavior)
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        lines = [];
        render();
        return;
      }
      // ctrl+c: cancel current line
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        lines = [...lines, { text: `billy@localhost:~$ ${input.value}^C`, color: COLOR.ok }];
        input.value = '';
        historyIndex = history.length;
        render();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length === 0) return;
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex];
        render();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (history.length === 0) return;
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = history[historyIndex] || '';
        render();
        return;
      }
      if (e.key !== 'Enter') return;
      const raw = input.value;
      if (raw.trim() !== '') history.push(raw);
      historyIndex = history.length;
      if (raw.trim().toLowerCase() === 'clear') {
        lines = [];
        input.value = '';
        render();
        return;
      }
      lines = [...lines, { text: `billy@localhost:~$ ${raw}`, color: COLOR.ok }, ...runCommand(raw)];
      input.value = '';
      render();
    });

    render();
  }

  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const root = document.documentElement;

    function sync() {
      const isLight = root.getAttribute('data-theme') === 'light';
      btn.textContent = isLight ? '☾ dark' : '☀ light';
      btn.setAttribute('aria-pressed', String(isLight));
    }

    btn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        localStorage.removeItem('theme');
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
      sync();
    });

    sync();
  }

  function initTux() {
    const el = document.querySelector('.tux-walker');
    if (!el) return;
    // ponytail: checked once at load, not on resize/OS-setting change — fine for a decorative easter egg
    if (!window.matchMedia('(min-width: 721px)').matches) return;
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

    const SPEED = 35; // px/second
    let x = -60;

    function walkTo(targetX) {
      el.classList.remove('is-sleeping', 'is-waving');
      el.classList.add('is-walking');
      const duration = Math.max(2, Math.abs(targetX - x) / SPEED);
      el.style.transitionDuration = duration + 's';
      el.style.left = targetX + 'px';
      x = targetX;
      setTimeout(idle, duration * 1000);
    }

    function idle() {
      el.classList.remove('is-walking');
      el.classList.add(Math.random() < 0.5 ? 'is-waving' : 'is-sleeping');
      const idleFor = 2500 + Math.random() * 3500;
      setTimeout(() => {
        const maxX = window.innerWidth - 40;
        walkTo(Math.random() * (maxX + 80) - 40);
      }, idleFor);
    }

    el.style.left = x + 'px';
    walkTo(Math.random() * window.innerWidth * 0.6);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTerminal();
    initTheme();
    initTux();
  });
})();
