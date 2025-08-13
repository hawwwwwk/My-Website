// DOM hooks
const log = document.getElementById('log');
const form = document.getElementById('chatForm');
const input = document.getElementById('msg');
const avatar = document.getElementById('jobAvatar');
const typingEl = document.getElementById('typingIndicator');

modeSelect.addEventListener('change', () => {
    currentMode = modeSelect.value;
    avatar.parentElement.classList.remove(
        'avatar-flirty-tint',
        'avatar-angry-tint',
        'avatar-sarcastic-tint'
    );
    if (currentMode === 'flirty') avatar.parentElement.classList.add('avatar-flirty-tint');
    if (currentMode === 'angry') avatar.parentElement.classList.add('avatar-angry-tint');
    if (currentMode === 'sarcastic') avatar.parentElement.classList.add('avatar-sarcastic-tint');
});



function addMsg(text, who) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${who}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
}

// response logics
function chooseResponse(userText) {
    switch (currentMode) {
        case 'flirty':
            return "ngnnngnmnmns.. .. job .hroak...";
        case 'angry':
            return "🐺 GRRRR !!!!";
        case 'sarcastic':
            return "okay";
        default:
            return "shut up, nerd.";
    }
}

async function typeAsBot(fullText, cps = 25) {
    typingEl.style.visibility = 'visible';
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    wrap.appendChild(bubble);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;

    for (let i = 0; i < fullText.length; i++) {
        bubble.textContent += fullText[i];
        microBop();
        await wait(1000 / cps);
    }

    typingEl.style.visibility = 'hidden';
}

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// avatar movement
let bopTimer = null;
function microBop() {
    avatar.classList.remove('bop');
    const dx = (Math.random() * 2 - 1) * 2.0;
    const dy = (Math.random() * 2 - 1) * 2.0;
    const rot = (Math.random() * 2 - 1) * 1.2;
    avatar.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;

    avatar.classList.add('bop');
    clearTimeout(bopTimer);
    bopTimer = setTimeout(() => {
        avatar.style.transform = 'translate(0,0) rotate(0)';
    }, 90);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'me');
    input.value = '';
    typingEl.style.visibility = 'visible';
    await wait(250 + Math.random() * 250);
    const reply = chooseResponse(text);
    await typeAsBot(reply, 30);
});

// intro
addMsg("Connection established. Type when ready.", 'bot');
