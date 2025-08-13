// DOM hooks
const log = document.getElementById('log');
const form = document.getElementById('chatForm');
const input = document.getElementById('msg');
const avatar = document.getElementById('jobAvatar');
const typingEl = document.getElementById('typingIndicator');
const modeSelect = document.getElementById('modeSelect');
const avatarCard = document.querySelector('.chat-avatar-card');

// mode state (safe default)
let currentMode = (modeSelect && modeSelect.value) || 'default';

// apply tint helper
function applyAvatarTint(mode) {
    if (!avatarCard) return;
    avatarCard.classList.remove('avatar-flirty-tint', 'avatar-angry-tint', 'avatar-sarcastic-tint');
    switch (mode) {
        case 'flirty':
            avatarCard.classList.add('avatar-flirty-tint');
            break;
        case 'angry':
            avatarCard.classList.add('avatar-angry-tint');
            break;
        case 'sarcastic':
            avatarCard.classList.add('avatar-sarcastic-tint');
            break;
        default:
            // no tint
            break;
    }
}

// initialize tint for initial mode
applyAvatarTint(currentMode);

// react to mode changes (guarded)
if (modeSelect) {
    modeSelect.addEventListener('change', () => {
        currentMode = modeSelect.value || 'default';
        applyAvatarTint(currentMode);
    });
}

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

// response logic (uses currentMode safely)
function chooseResponse(userText) {
    switch (currentMode) {
        case 'flirty':
            return "nnngnmnmng,.,., .. *job moan*";
        case 'angry':
            return "🐺 DON'T......... DON'T EVEN TRY THAT BUSTER.............";
        case 'sarcastic':
            return "fascinating.";
        default:
            return "shut up nerd";
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
    if (!avatar) return;

    const dx = (Math.random() * 2 - 1) * 3.5; 
    const dy = (Math.random() * 2 - 1) * 3.5;
    const rot = (Math.random() * 2 - 1) * 2; 
    avatar.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;

    // trigger bounce scale animation
    avatar.classList.remove('bop');
    void avatar.offsetWidth;
    avatar.classList.add('bop');

    clearTimeout(bopTimer);
    bopTimer = setTimeout(() => {
        avatar.style.transform = 'translate(0,0) rotate(0)';
    }, 120);
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
