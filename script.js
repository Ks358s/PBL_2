let score = 0;
let currentLevel = 1;
let streak = 0;
let customScenarios = [];
let allScenarios = [];
let answerHistory = [];

function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

const CHANNEL_LABELS = {
    email: 'Email',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    call: 'Phone call'
};

/** Realistic mix: scams and genuine messages (India-focused, senior-relevant). */
const defaultScenarios = [
    {
        id: 1,
        title: "UPI payment request",
        emoji: "📲",
        channel: "sms",
        desc: "You get this text while at home. Is it safe to approve?",
        sender: "JM-PAYTM",
        message: "Dear Customer, Rs.24,999 is requested on your UPI. If not you, click paytm-app-secure.net/block within 10 min or amount will be debited.",
        correct: "Correct. Real apps never ask you to open random links to block a payment. Use only the official Paytm/PhonePe/Google Pay app.",
        incorrect: "Risky. This is a classic UPI collect scam. The link would steal your login or UPI PIN.",
        tip: "Block or report the SMS. Check pending requests only inside your real UPI app — never through a link.",
        answer: "phish"
    },
    {
        id: 2,
        title: "Bank debit alert",
        emoji: "🏦",
        channel: "sms",
        desc: "A routine message after you used your card at a shop. Scam or normal?",
        sender: "HDFCBK",
        message: "Rs.1,250.00 debited from A/c XX5912 on 21-MAR-25 at SWIGGY. Avl Bal Rs.48,320.50. Not you? Call 1800-258-3838",
        correct: "Right. This looks like a standard debit alert: masked account, no link, and a known bank phone number.",
        incorrect: "This one is actually a typical legitimate bank SMS. There is no link and no request for OTP or PIN.",
        tip: "Save your bank's SMS sender IDs. Alerts usually show last digits of account and never ask you to tap a link for refunds.",
        answer: "safe"
    },
    {
        id: 3,
        title: "Account will be frozen",
        emoji: "⚠️",
        channel: "whatsapp",
        desc: "Forwarded message in a family group. Should anyone act on it?",
        sender: "+91 98765 43210 · \"SBI Helpline\"",
        message: "URGENT: Your SBI online banking will be BLOCKED today due to incomplete KYC. Verify immediately: bit.ly/sbi-kyc-verify-now\nDo not ignore — RBI guidelines.",
        correct: "Good catch. Banks do not verify KYC through random WhatsApp links. SBI uses official channels and net banking.",
        incorrect: "Dangerous. This is phishing. The short link could steal passwords or card details.",
        tip: "For KYC, visit your branch or use the official YONO / net banking app only.",
        answer: "phish"
    },
    {
        id: 4,
        title: "Courier / delivery fee",
        emoji: "📦",
        channel: "sms",
        desc: "You are expecting a parcel. Does this SMS mean you should pay?",
        sender: "BLUEDART",
        message: "BlueDart: Shipment on hold. Pay Rs.499 customs/clearance fee now: bluedart-track.in/pay — delivery today only.",
        correct: "Yes — scam. Couriers do not collect customs via random SMS links. Official sites end in known domains.",
        incorrect: "That link is fake. Real Blue Dart / India Post use official portals and rarely ask for instant prepaid links like this.",
        tip: "Track parcels on the seller's site (Amazon, Flipkart) or the courier's official website typed by you in the browser.",
        answer: "phish"
    },
    {
        id: 5,
        title: "Order on the way",
        emoji: "📮",
        channel: "email",
        desc: "You ordered something on Amazon last week. Is this email genuine?",
        sender: "shipment-tracking@amazon.in",
        message: "Your order #402-9911123-7744556 is out for delivery.\nExpected: Today, 6 PM – 9 PM.\nTrack: amazon.in/progress (sign in to your account to view)\nNo payment is required for this delivery.",
        correct: "Good judgment. The sender domain matches Amazon India, and it asks you to sign in on the real site — not a strange payment link.",
        incorrect: "This pattern is typical of a real shipping notice: no fee, no OTP request, and reference to the official domain.",
        tip: "Always type amazon.in yourself or use the app. Do not trust look-alike domains like amaz0n.in.",
        answer: "safe"
    },
    {
        id: 6,
        title: "\"Beta, I need help\"",
        emoji: "👨‍👩‍👧",
        channel: "whatsapp",
        desc: "A message from your child's number — but the tone feels off. What do you do?",
        sender: "Papa · saved as \"Rahul\"",
        message: "Papa my phone broke in college. I'm messaging from friend's phone. Please send 15,000 to this Google Pay number for hostel fees urgently — 9876543210. Don't call I'm in class.",
        correct: "Smart. Even from a saved name, urgent money + \"don't call\" is a red flag. Scammers clone or hack WhatsApp.",
        incorrect: "Never send money only from a text. Call your child on a number you already know, or ask a question only they would know.",
        tip: "Pause, call back on the old number, or verify through another family member before any UPI transfer.",
        answer: "phish"
    },
    {
        id: 7,
        title: "Income tax refund",
        emoji: "📧",
        channel: "email",
        desc: "Email about money from the government. Legitimate?",
        sender: "refunds@income-tax-india.gov-support.com",
        message: "Dear Taxpayer, Refund of Rs.18,420 is approved. Submit bank confirmation within 48 hours or refund will lapse:\nsecure-refund-gov.in/ITR-confirm",
        correct: "Right. The domain is not income-tax.gov.in. Refunds are shown on the official e-filing portal after you log in.",
        incorrect: "Government refunds are never claimed through random email links. Always use https://www.incometax.gov.in",
        tip: "Log in to the official portal only. Ignore emails or SMS asking for bank \"confirmation\" via a link.",
        answer: "phish"
    },
    {
        id: 8,
        title: "Pension credited",
        emoji: "🏛️",
        channel: "sms",
        desc: "Monthly pension day. Is this SMS trustworthy?",
        sender: "GOVINFO",
        message: "Pension for Mar-25 credited to A/c ****7812. Amount: Rs.32,400. For details contact your bank or pension disbursing authority. Do not share OTP.",
        correct: "Reasonable to treat as safe: no link, no request to pay, generic government-style wording and OTP warning.",
        incorrect: "This matches how many pension SMS look: amount, masked account, and no clickable scam link.",
        tip: "If unsure, check your passbook or bank SMS — but never reply with personal details to unknown numbers.",
        answer: "safe"
    },
    {
        id: 9,
        title: "Electricity disconnection",
        emoji: "⚡",
        channel: "sms",
        desc: "Threat to cut power today unless you pay. Real or fake?",
        sender: "BESCOM-BILL",
        message: "FINAL NOTICE: Your electricity will be disconnected in 2 hours due to unpaid bill Rs.3,890. Pay now: bescom-quickpay.in — Discom automated system.",
        correct: "Correct — fake urgency and a non-official payment site are common discom scams.",
        incorrect: "Discoms send notices over time; they do not demand instant payment through random .in links via SMS.",
        tip: "Use only the official discom app or website you already use, or pay at the office.",
        answer: "phish"
    },
    {
        id: 10,
        title: "Automated \"cyber cell\" call",
        emoji: "📞",
        channel: "call",
        desc: "You answer the phone. The robotic voice says:",
        sender: "Caller ID: \"Cyber Crime Mumbai\"",
        message: "This is an automated message from Cyber Crime Wing. Your Aadhaar is linked to money laundering. Press 1 to speak to the investigating officer or your SIM will be blocked in one hour. Do not disconnect.",
        correct: "Right — police and cyber cells do not use robocalls and threats. This is vishing (voice phishing).",
        incorrect: "Real agencies do not block your SIM through an IVR threat. Hang up; never press keys or share OTP.",
        tip: "If worried, visit the local police station or dial 1930 (cyber fraud helpline in many states) using a number you find officially.",
        answer: "phish"
    },
    {
        id: 11,
        title: "OTP from your bank",
        emoji: "🔐",
        channel: "sms",
        desc: "You just tried to log in to net banking. This arrives seconds later.",
        sender: "HDFCBK",
        message: "OTP is 482193 for login to NetBanking. Valid 3 minutes. Do not share with anyone — bank staff will never ask.",
        correct: "Good. An OTP you triggered yourself, with a clear \"do not share\" line, is normal bank security.",
        incorrect: "If you requested login yourself, this SMS is expected. Never share this code; scammers pretend to need it.",
        tip: "Never read OTPs aloud on the phone. If you did not try to log in, change passwords and call the bank.",
        answer: "safe"
    },
    {
        id: 12,
        title: "Free health card for seniors",
        emoji: "🏥",
        channel: "whatsapp",
        desc: "Forwarded health \"scheme\" with a form. Trust it?",
        sender: "Health Desk India (forwarded many times)",
        message: "GOI Ayushman FREE upgrade for 60+ — Rs.5 lakh cover. Register before Sunday: ayushman-senior-apply.xyz/register\nShare with all parents and grandparents 🙏",
        correct: "Correct. Ayushman schemes are applied through official hospitals, CSC, or government portals — not random .xyz links.",
        incorrect: "Official Ayushman information is on pmjay.gov.in. WhatsApp forwards with short deadlines are almost always scams.",
        tip: "Ask your local PHC, ASHA worker, or municipal help desk — not a WhatsApp link.",
        answer: "phish"
    },
    {
        id: 13,
        title: "Wallet KYC \"deadline\"",
        emoji: "💳",
        channel: "email",
        desc: "Email says your wallet will stop working. True?",
        sender: "kyc-notice@paytm-services-mail.com",
        message: "Your Paytm Wallet will be permanently closed in 24 hours due to RBI KYC rules. Complete KYC here: paytm-wallet-kyc.net/update",
        correct: "Scam. RBI does not email you through random domains. KYC is done in the real app or at authorised points.",
        incorrect: "Never use email links for wallet KYC. Open the Paytm app from your phone directly.",
        tip: "Check notifications inside the official app only.",
        answer: "phish"
    },
    {
        id: 14,
        title: "Simple family message",
        emoji: "💬",
        channel: "whatsapp",
        desc: "Short message from your sister. Scam?",
        sender: "Didi",
        message: "Ma, I'll pick up your medicines from Apollo on the way. Reach by 5. Love.",
        correct: "Reasonable to treat as safe: normal plan, no links, no money, no urgency trick — assuming this matches how your family texts.",
        incorrect: "Not every message is a scam. This has no payment request or suspicious link. When unsure, a quick voice call still helps.",
        tip: "Scam messages usually push money, OTP, or links. Plain coordination messages are usually fine if you know the person.",
        answer: "safe"
    }
];

function buildMessageMockup(scenario) {
    const ch = scenario.channel || 'email';
    const sender = escapeHtml(scenario.sender);
    const message = escapeHtml(scenario.message);
    const label = CHANNEL_LABELS[ch] || 'Message';

    if (ch === 'sms') {
        return `
            <div class="msg-shell sms-mockup">
                <div class="msg-shell-header">${label}</div>
                <div class="sms-screen">
                    <div class="sms-meta">From: <strong>${sender}</strong></div>
                    <div class="sms-bubble message-box">${message}</div>
                </div>
            </div>`;
    }
    if (ch === 'whatsapp') {
        return `
            <div class="msg-shell wa-mockup">
                <div class="msg-shell-header">${label}</div>
                <div class="wa-top">${sender}</div>
                <div class="wa-body">
                    <div class="wa-bubble message-box">${message}</div>
                </div>
            </div>`;
    }
    if (ch === 'call') {
        return `
            <div class="msg-shell call-mockup">
                <div class="msg-shell-header">${label}</div>
                <div class="call-banner">⚠️ Caller ID can be faked</div>
                <div class="sms-meta" style="margin-bottom:0.5rem">Shows as: <strong>${sender}</strong></div>
                <div class="call-transcript message-box">${message}</div>
            </div>`;
    }
    return `
        <div class="msg-shell email-mockup">
            <div class="msg-shell-header">${label}</div>
            <div style="padding:1rem 1.1rem">
                <div class="sender-info">From: ${sender}</div>
                <div class="message-box">${message}</div>
            </div>
        </div>`;
}

function initGame() {
    loadCustomScenarios();
    allScenarios = [...defaultScenarios, ...customScenarios];
    renderScenarios();
    updateProgressBar();
}

function renderScenarios() {
    const container = document.getElementById('game-container');
    container.innerHTML = '';

    allScenarios.forEach((scenario, index) => {
        const card = document.createElement('div');
        card.id = `scenario-${scenario.id}`;
        card.className = `scenario-card card-slide-in ${index > 0 ? 'hidden' : ''}`;
        const ch = scenario.channel || 'email';
        const chTag = `<span class="channel-tag">${escapeHtml(CHANNEL_LABELS[ch] || ch)}</span>`;
        card.innerHTML = `
            <div class="scenario-meta">
                <div class="level-badge">${scenario.emoji} Level ${index + 1} ${chTag}</div>
                <h2>${escapeHtml(scenario.title)}</h2>
                <p class="instruction">${escapeHtml(scenario.desc)}</p>
            </div>
            <div class="virtual-phone" aria-label="Virtual phone showing the message">
                <div class="phone-bezel">
                    <div class="phone-speaker" aria-hidden="true"></div>
                    <div class="phone-status-bar">
                        <span class="phone-time">9:41</span>
                        <span class="phone-signal" aria-hidden="true">▮▮▮ LTE</span>
                        <span class="phone-battery" aria-hidden="true">100%</span>
                    </div>
                    <div class="phone-screen">
                        ${buildMessageMockup(scenario)}
                    </div>
                    <div class="phone-chin" aria-hidden="true"></div>
                </div>
            </div>
            <div class="actions">
                <button type="button" class="btn btn-danger" onclick="checkAnswer('phish', ${scenario.id})">Report as scam</button>
                <button type="button" class="btn btn-success" onclick="checkAnswer('safe', ${scenario.id})">Looks safe / OK</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function checkAnswer(choice, scenarioId) {
    const scenario = allScenarios.find(s => s.id === scenarioId);
    const modal = document.getElementById('feedback-modal');
    const title = document.getElementById('feedback-title');
    const text = document.getElementById('feedback-text');
    const tipBox = document.getElementById('tip-box');
    const tipContent = document.getElementById('tip-content');

    let isCorrect = false;
    if (choice === 'phish' && scenario.answer === 'phish') {
        isCorrect = true;
    } else if (choice === 'safe' && scenario.answer === 'safe') {
        isCorrect = true;
    }

    if (isCorrect) {
        score += 10;
        streak++;
        title.innerHTML = "<span class='success-text'>Correct</span>";
        text.innerText = scenario.correct;
    } else {
        score = Math.max(0, score - 5);
        streak = 0;
        title.innerHTML = "<span class='error-text'>Not quite</span>";
        text.innerText = scenario.incorrect;
    }

    answerHistory.push({ scenarioId, correct: isCorrect });
    document.getElementById('points').innerText = score;
    document.getElementById('streak').innerText = streak;
    tipContent.innerText = scenario.tip;
    tipBox.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function closeFeedback() {
    document.getElementById('feedback-modal').classList.add('hidden');
}

function goToNextLevel() {
    closeFeedback();

    const cards = document.querySelectorAll('.scenario-card');
    let currentIndex = -1;

    cards.forEach((card, idx) => {
        if (!card.classList.contains('hidden')) {
            currentIndex = idx;
        }
    });

    if (currentIndex < cards.length - 1) {
        cards[currentIndex].classList.add('hidden');
        cards[currentIndex + 1].classList.remove('hidden');
        currentLevel++;
        document.getElementById('level-num').innerText = currentLevel;
        updateProgressBar();
    } else {
        showGameComplete();
    }
}

function updateProgressBar() {
    const total = Math.max(allScenarios.length, 1);
    const progress = (currentLevel / total) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('progress-text').innerText = `${currentLevel} / ${total}`;
}

function showGameComplete() {
    const modal = document.getElementById('feedback-modal');
    const title = document.getElementById('feedback-title');
    const text = document.getElementById('feedback-text');
    const tipBox = document.getElementById('tip-box');
    const nextBtn = document.getElementById('next-btn');

    const maxScore = allScenarios.length * 10;
    const percentage = (score / maxScore) * 100;
    let message = '';

    if (percentage >= 90) message = 'Excellent — you spotted most traps!';
    else if (percentage >= 70) message = 'Good work — keep practicing.';
    else if (percentage >= 50) message = 'Not bad — review the tips and try again.';
    else message = 'Keep learning — scammers rely on rushing us.';

    title.innerHTML = message;
    text.innerHTML = `<strong>Final score: ${score} / ${maxScore} (${Math.round(percentage)}%)</strong><br><br>You finished this run. When a message feels urgent or asks for money or OTP, slow down and verify through a trusted channel.`;
    tipBox.classList.add('hidden');
    nextBtn.innerText = 'Play again';
    nextBtn.onclick = function () { resetGame(); };

    saveScore(score, maxScore);
    modal.classList.remove('hidden');
}

function resetGame() {
    score = 0;
    currentLevel = 1;
    streak = 0;
    answerHistory = [];
    document.getElementById('points').innerText = '0';
    document.getElementById('level-num').innerText = '1';
    document.getElementById('streak').innerText = '0';

    const nextBtn = document.getElementById('next-btn');
    nextBtn.innerText = 'Next level →';
    nextBtn.onclick = function () { goToNextLevel(); };

    document.querySelectorAll('.scenario-card').forEach((card, idx) => {
        if (idx === 0) card.classList.remove('hidden');
        else card.classList.add('hidden');
    });

    closeFeedback();
    updateProgressBar();
}

function toggleAdminPanel() {
    document.getElementById('admin-modal').classList.toggle('hidden');
    loadScenariosList();
}

function switchAdminTab(tab, btn) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tab + '-tab').classList.remove('hidden');
    if (btn) btn.classList.add('active');
}

function addScenario(event) {
    event.preventDefault();

    const lastId = Math.max(...allScenarios.map(s => s.id), 0);
    const newScenario = {
        id: lastId + 1,
        title: document.getElementById('scenarioTitle').value,
        emoji: document.getElementById('scenarioEmoji').value,
        channel: 'email',
        desc: document.getElementById('scenarioDesc').value,
        sender: document.getElementById('scenarioSender').value,
        message: document.getElementById('scenarioMessage').value,
        answer: document.getElementById('scenarioAnswer').value,
        correct: 'Great answer!',
        incorrect: 'That was not the best choice for this message.',
        tip: document.getElementById('scenarioTip').value
    };

    customScenarios.push(newScenario);
    allScenarios.push(newScenario);
    saveCustomScenarios();
    renderScenarios();

    event.target.reset();
    alert('Scenario added successfully.');
    loadScenariosList();
}

function deleteScenario(id) {
    customScenarios = customScenarios.filter(s => s.id !== id);
    allScenarios = allScenarios.filter(s => s.id !== id);
    saveCustomScenarios();
    renderScenarios();
    loadScenariosList();
    alert('Scenario deleted.');
}

function loadScenariosList() {
    const list = document.getElementById('scenarios-list');
    list.innerHTML = customScenarios.map(s => `
        <div class="scenario-item">
            <div>
                <h4>${escapeHtml(s.emoji)} ${escapeHtml(s.title)}</h4>
                <p>${escapeHtml((s.message || '').substring(0, 50))}...</p>
            </div>
            <button type="button" class="btn btn-danger" onclick="deleteScenario(${s.id})">Delete</button>
        </div>
    `).join('');

    if (customScenarios.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#64748b;">No custom scenarios yet.</p>';
    }
}

function saveCustomScenarios() {
    localStorage.setItem('customScenarios', JSON.stringify(customScenarios));
}

function loadCustomScenarios() {
    const saved = localStorage.getItem('customScenarios');
    customScenarios = saved ? JSON.parse(saved) : [];
}

function toggleLeaderboard() {
    document.getElementById('leaderboard-modal').classList.toggle('hidden');
    loadLeaderboard();
}

function saveScore(points, maxPoints) {
    let scores = JSON.parse(localStorage.getItem('gameScores') || '[]');
    scores.push({
        points,
        maxPoints,
        timestamp: new Date(),
        percentage: (points / maxPoints) * 100
    });
    scores.sort((a, b) => b.points - a.points);
    localStorage.setItem('gameScores', JSON.stringify(scores.slice(0, 10)));
}

function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('gameScores') || '[]');
    const list = document.getElementById('leaderboard-list');

    if (scores.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#64748b;">No scores yet. Complete a run first.</p>';
        return;
    }

    list.innerHTML = scores.map((s, idx) => `
        <div class="leaderboard-item">
            <span class="rank">${idx + 1}</span>
            <span class="score-info">${s.points} / ${s.maxPoints} (${Math.round(s.percentage)}%)</span>
        </div>
    `).join('');
}

window.addEventListener('DOMContentLoaded', initGame);
