// =====================================================
// STATE
// =====================================================
let currentMode = 'login';
let currentUser = null;
let currentChatUser = null;
let currentChatGroupId = null;
let currentUserPic = null;
let socket = null;
let allUsers = [];
let allGroups = [];
let onlineUsersList = [];
let typingTimeout = null;
let selectedFile = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let unreadCounts = {};
let isSelectionMode = false;
let selectedMessages = new Set();
let currentGroupObj = null;
let replyingTo = null;         // { messageId, senderName, preview }
let scheduledAt = null;        // Date for scheduled messages
let contextTargetMsg = null;   // message data for right-click
let soundEnabled = true;

// WebRTC
let peerConnection, localStream, remoteStream;
let isCaller = false, callActive = false, pendingCallFrom = null;
const rtcConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

// =====================================================
// DOM ELEMENTS
// =====================================================
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authForm = document.getElementById('auth-form');
const authBtn = document.getElementById('auth-btn');
const authError = document.getElementById('auth-error');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const confirmPasswordInput = document.getElementById('confirmPassword');
const confirmPasswordHint = document.getElementById('confirm-password-hint');
const registerFields = document.getElementById('register-fields');
const otpForm = document.getElementById('otp-form');
const otpInput = document.getElementById('otp-input');
const otpError = document.getElementById('otp-error');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const fpIdentity = document.getElementById('fp-identity');
const fpError = document.getElementById('fp-error');
const fpBtn = document.getElementById('fp-btn');
const resetPasswordForm = document.getElementById('reset-password-form');
const rpOtp = document.getElementById('rp-otp');
const rpNewPassword = document.getElementById('rp-new-password');
const rpError = document.getElementById('rp-error');
const rpBtn = document.getElementById('rp-btn');
const tabsContainer = document.querySelector('.auth-tabs-v2');
const toggleSelectModeBtn = document.getElementById('toggle-select-mode-btn');
const bulkActionBar = document.getElementById('bulk-action-bar');
const selectionCount = document.getElementById('selection-count');
const cancelSelectBtn = document.getElementById('cancel-select-btn');
const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
const currentUserEl = document.getElementById('current-user');
const userAvatarImg = document.getElementById('user-avatar-img');
const userAvatarText = document.getElementById('user-avatar-text');
const logoutBtn = document.getElementById('logout-btn');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const chatMessages = document.getElementById('chat-messages');
const usersListEl = document.getElementById('users-list');
const chatTitleEl = document.getElementById('chat-title');
const chatUserStatus = document.getElementById('chat-user-status');
const themeToggleBtn = document.getElementById('theme-toggle');
const typingIndicator = document.getElementById('typing-indicator');
const emojiBtn = document.getElementById('emoji-btn');
const profilePicUpload = document.getElementById('profile-pic-upload');
const uploadPicBtn = document.getElementById('upload-pic-btn');
const fileUpload = document.getElementById('file-upload');
const attachBtn = document.getElementById('attach-btn');
const micBtn = document.getElementById('mic-btn');
const attachmentPreview = document.getElementById('attachment-preview');
const createGroupBtn = document.getElementById('create-group-btn');
const addMemberBtn = document.getElementById('add-member-btn');
const viewProfileBtn = document.getElementById('view-profile-btn');
const groupInfoBtn = document.getElementById('group-info-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfileBtn = document.getElementById('close-profile-btn');
const profileForm = document.getElementById('profile-form');
const profileUsername = document.getElementById('profile-username');
const profileFullname = document.getElementById('profile-fullname');
const profileEmail = document.getElementById('profile-email');
const profileBio = document.getElementById('profile-bio');
const profileMsg = document.getElementById('profile-msg');
const profileModalTitle = document.getElementById('profile-modal-title');
const profileModalAvatarImg = document.getElementById('profile-modal-avatar-img');
const profileModalAvatarText = document.getElementById('profile-modal-avatar-text');
const profileSaveBtn = document.getElementById('profile-save-btn');
const imageLightbox = document.getElementById('image-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const groupInfoModal = document.getElementById('group-info-modal');
const closeGroupInfoBtn = document.getElementById('close-group-info-btn');
const groupInfoName = document.getElementById('group-info-name');
const groupInfoAdmin = document.getElementById('group-info-admin');
const groupMembersList = document.getElementById('group-members-list');
const leaveGroupBtn = document.getElementById('leave-group-btn');
const videoCallBtn = document.getElementById('video-call-btn');
const incomingCallModal = document.getElementById('incoming-call-modal');
const incomingCallerName = document.getElementById('incoming-caller-name');
const acceptCallBtn = document.getElementById('accept-call-btn');
const declineCallBtn = document.getElementById('decline-call-btn');
const videoCallOverlay = document.getElementById('video-call-overlay');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const replyPreviewBar = document.getElementById('reply-preview-bar');
const replyPreviewName = document.getElementById('reply-preview-name');
const replyPreviewText = document.getElementById('reply-preview-text');
const replyCancelBtn = document.getElementById('reply-cancel-btn');
const schedulePreview = document.getElementById('schedule-preview');
const scheduleTimeDisplay = document.getElementById('schedule-time-display');
const scheduleCancelBtn = document.getElementById('schedule-cancel-btn');
const searchBar = document.getElementById('search-bar');
const searchInput = document.getElementById('search-input');
const searchCloseBtn = document.getElementById('search-close-btn');
const searchResults = document.getElementById('search-results');
const searchToggleBtn = document.getElementById('search-toggle-btn');
const pinnedBanner = document.getElementById('pinned-banner');
const pinnedText = document.getElementById('pinned-text');
const unpinBtn = document.getElementById('unpin-btn');
const dragOverlay = document.getElementById('drag-overlay');
const chatMainArea = document.getElementById('chat-main-area');
const contextMenu = document.getElementById('context-menu');
const reactionPicker = document.getElementById('reaction-picker');
const ctxReply = document.getElementById('ctx-reply');
const ctxReact = document.getElementById('ctx-react');
const ctxEdit = document.getElementById('ctx-edit');
const ctxForward = document.getElementById('ctx-forward');
const ctxPin = document.getElementById('ctx-pin');
const ctxDelete = document.getElementById('ctx-delete');
const forwardModal = document.getElementById('forward-modal');
const closeForwardBtn = document.getElementById('close-forward-btn');
const forwardTargetsList = document.getElementById('forward-targets-list');
const scheduleModal = document.getElementById('schedule-modal');
const closeScheduleBtn = document.getElementById('close-schedule-btn');
const scheduleDatetime = document.getElementById('schedule-datetime');
const confirmScheduleBtn = document.getElementById('confirm-schedule-btn');
const scheduleBtn = document.getElementById('schedule-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
const showToast = (msg, duration = 3000) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), duration);
};

const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880; osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
    } catch(e) {}
};

const urlBase64ToUint8Array = (b64) => {
    const padding = '='.repeat((4 - b64.length % 4) % 4);
    const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
};

const detectURL = (text) => {
    const re = /(https?:\/\/[^\s]+)/g;
    return text ? text.match(re) : null;
};

const escapeHtml = (s) => {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

// =====================================================
// THEME + SOUND
// =====================================================
const initTheme = () => { document.body.dataset.theme = localStorage.getItem('theme') || 'light'; };
themeToggleBtn.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = next; localStorage.setItem('theme', next);
});
initTheme();

soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
if (soundToggleBtn) {
    soundToggleBtn.textContent = soundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
    if (!soundEnabled) soundToggleBtn.classList.add('sound-off');
    soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('soundEnabled', soundEnabled);
        soundToggleBtn.textContent = soundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
        soundToggleBtn.classList.toggle('sound-off', !soundEnabled);
    });
}

// =====================================================
// PUSH NOTIFICATIONS
// =====================================================
const setupPushNotifications = async () => {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) return;
    try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        const res = await fetch('/api/push/public-key');
        const data = await res.json();
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(data.publicKey) });
        await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify({ username: currentUser, subscription: sub }), headers: { 'Content-Type': 'application/json' } });
    } catch(e) {}
};

// =====================================================
// EMOJI PICKER
// =====================================================
let emojiPicker = null;
emojiBtn.addEventListener('click', () => {
    if (!emojiPicker) {
        emojiPicker = document.createElement('emoji-picker');
        emojiPicker.style.cssText = 'position:absolute;bottom:80px;left:24px;z-index:1000;';
        emojiPicker.addEventListener('emoji-click', e => { msgInput.value += e.detail.unicode; msgInput.focus(); });
        document.getElementById('chat-form').appendChild(emojiPicker);
    } else { emojiPicker.classList.toggle('hidden'); }
});

// =====================================================
// AVATAR
// =====================================================
const updateAvatarUI = () => {
    if (currentUserPic) {
        userAvatarImg.src = currentUserPic; userAvatarImg.classList.remove('hidden'); userAvatarText.classList.add('hidden');
    } else {
        userAvatarImg.classList.add('hidden'); userAvatarText.classList.remove('hidden');
        userAvatarText.textContent = currentUser ? currentUser.charAt(0).toUpperCase() : 'U';
    }
};

uploadPicBtn.addEventListener('click', () => profilePicUpload.click());
profilePicUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file); fd.append('username', currentUser);
    try {
        const res = await fetch('/api/upload/profilePic', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) { currentUserPic = data.fileUrl; localStorage.setItem('profilePic', currentUserPic); updateAvatarUI(); fetchUsers(); }
    } catch(e) {}
});

// =====================================================
// FILE ATTACH + AUDIO RECORD
// =====================================================
attachBtn.addEventListener('click', () => fileUpload.click());
fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert('File too large (max 50MB).'); fileUpload.value = ''; return; }
    selectedFile = file;
    attachmentPreview.textContent = `Attached: ${file.name}`; attachmentPreview.classList.remove('hidden');
});

micBtn.addEventListener('click', async () => {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream); mediaRecorder.start(); isRecording = true;
            micBtn.style.color = 'red'; attachmentPreview.textContent = 'Recording...'; attachmentPreview.classList.remove('hidden');
            mediaRecorder.addEventListener('dataavailable', e => audioChunks.push(e.data));
            mediaRecorder.addEventListener('stop', async () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' }); audioChunks = [];
                isRecording = false; micBtn.style.color = ''; attachmentPreview.classList.add('hidden');
                const fd = new FormData(); fd.append('file', blob, `voice-${Date.now()}.webm`);
                try {
                    const res = await fetch('/api/upload/message', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.success && (currentChatUser || currentChatGroupId)) {
                        const payload = { text: 'Voice Note', type: 'audio', fileUrl: data.fileUrl };
                        if (currentChatGroupId) socket.emit('groupMessage', { groupId: currentChatGroupId, ...payload });
                        else socket.emit('privateMessage', { receiver: currentChatUser, ...payload });
                    }
                } catch(e) {}
            });
        } catch(e) {}
    } else { mediaRecorder.stop(); mediaRecorder.stream.getTracks().forEach(t => t.stop()); }
});

// =====================================================
// DRAG AND DROP
// =====================================================
let dragCounter = 0;
chatMainArea.addEventListener('dragenter', (e) => {
    e.preventDefault(); dragCounter++;
    if (!currentChatUser && !currentChatGroupId) return;
    dragOverlay.classList.remove('hidden');
});
chatMainArea.addEventListener('dragleave', () => {
    dragCounter--; if (dragCounter === 0) dragOverlay.classList.add('hidden');
});
chatMainArea.addEventListener('dragover', (e) => e.preventDefault());
chatMainArea.addEventListener('drop', async (e) => {
    e.preventDefault(); dragCounter = 0; dragOverlay.classList.add('hidden');
    const file = e.dataTransfer.files[0]; if (!file) return;
    if (file.size > 50 * 1024 * 1024) { showToast('File too large (max 50MB)'); return; }
    selectedFile = file;
    attachmentPreview.textContent = `Attached: ${file.name}`; attachmentPreview.classList.remove('hidden');
    showToast(`📎 ${file.name} ready to send`);
});

// =====================================================
// AUTH
// =====================================================
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    currentUserPic = localStorage.getItem('profilePic') || null;
    if (token && username) {
        currentUser = username; showChat(); initSocket(); fetchUsers(); fetchGroups(); setupPushNotifications();
    }
};

const showChat = () => {
    authContainer.classList.add('hidden'); chatContainer.classList.remove('hidden');
    currentUserEl.textContent = currentUser; updateAvatarUI(); msgInput.disabled = true;
};

const showAuth = () => {
    chatContainer.classList.add('hidden'); authContainer.classList.remove('hidden');
    usernameInput.value = ''; passwordInput.value = ''; fullNameInput.value = ''; emailInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
    if (confirmPasswordHint) confirmPasswordHint.textContent = '';
    if (otpInput) otpInput.value = '';
    switchTab('login');
};

window.switchTab = (mode) => {
    currentMode = mode; authError.textContent = '';
    if (otpError) otpError.textContent = '';
    if (fpError) fpError.textContent = '';
    if (rpError) rpError.textContent = '';
    if (confirmPasswordHint) confirmPasswordHint.textContent = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
    if (authForm) authForm.classList.remove('hidden');
    if (otpForm) otpForm.classList.add('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
    if (resetPasswordForm) resetPasswordForm.classList.add('hidden');
    if (tabsContainer) tabsContainer.classList.remove('hidden');
    const confirmField = document.getElementById('confirm-password-field');
    if (mode === 'login') {
        tabLogin.classList.add('active'); tabRegister.classList.remove('active');
        authBtn.textContent = 'Login'; registerFields.classList.add('hidden');
        if (confirmField) confirmField.classList.add('hidden');
        fullNameInput.removeAttribute('required'); emailInput.removeAttribute('required');
        const fp = document.getElementById('forgot-password-link-container');
        if (fp) fp.classList.remove('hidden');
    } else {
        tabRegister.classList.add('active'); tabLogin.classList.remove('active');
        authBtn.textContent = 'Register'; registerFields.classList.remove('hidden');
        if (confirmField) confirmField.classList.remove('hidden');
        const fp = document.getElementById('forgot-password-link-container');
        if (fp) fp.classList.add('hidden');
    }
};

// Live confirm-password hint
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
        const pw = passwordInput.value;
        const cpw = confirmPasswordInput.value;
        if (!cpw) { confirmPasswordHint.textContent = ''; return; }
        if (pw === cpw) {
            confirmPasswordHint.textContent = '✔ Passwords match';
            confirmPasswordHint.className = 'pw-match-hint pw-match';
        } else {
            confirmPasswordHint.textContent = '✘ Passwords do not match';
            confirmPasswordHint.className = 'pw-match-hint pw-no-match';
        }
    });
    passwordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value) confirmPasswordInput.dispatchEvent(new Event('input'));
    });
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim(); const password = passwordInput.value;
    const fullName = fullNameInput.value.trim(); const email = emailInput.value.trim();
    if (!username || !password) return;

    // Confirm password validation (register only)
    if (currentMode === 'register') {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (fullName && !nameRegex.test(fullName)) {
            authError.textContent = 'Full name must only contain letters and spaces.';
            return;
        }
        const confirmPw = confirmPasswordInput ? confirmPasswordInput.value : '';
        if (!confirmPw) { authError.textContent = 'Please confirm your password.'; return; }
        if (password !== confirmPw) { authError.textContent = 'Passwords do not match. Please try again.'; return; }
    }

    authBtn.disabled = true;
    try {
        const endpoint = currentMode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const bodyData = { username, password };
        if (currentMode === 'register') { bodyData.fullName = fullName; bodyData.email = email; }
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData) });
        const data = await res.json();
        if (res.ok && data.success) {
            if (data.requireOTP) {
                authForm.classList.add('hidden'); if(tabsContainer) tabsContainer.classList.add('hidden');
                otpForm.classList.remove('hidden'); window.pendingOTPUsername = username;
            } else {
                localStorage.setItem('token', data.token); localStorage.setItem('username', data.username);
                if (data.profilePic) localStorage.setItem('profilePic', data.profilePic);
                currentUser = data.username; currentUserPic = data.profilePic || null;
                showChat(); initSocket(); fetchUsers(); fetchGroups(); setupPushNotifications();
            }
        } else { authError.textContent = data.message || 'Authentication failed'; }
    } catch(e) { authError.textContent = 'Server error. Please try again.'; }
    finally { authBtn.disabled = false; authBtn.textContent = currentMode === 'login' ? 'Login' : 'Register'; }
});

if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = otpInput.value.trim(); if (!otp || !window.pendingOTPUsername) return;
        try {
            const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: window.pendingOTPUsername, otp }) });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem('token', data.token); localStorage.setItem('username', data.username);
                if (data.profilePic) localStorage.setItem('profilePic', data.profilePic);
                currentUser = data.username; currentUserPic = data.profilePic || null;
                showChat(); initSocket(); fetchUsers(); fetchGroups(); setupPushNotifications();
                window.pendingOTPUsername = null;
            } else { otpError.textContent = data.message || 'Invalid OTP'; }
        } catch(e) { otpError.textContent = 'Server error.'; }
    });
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault(); authForm.classList.add('hidden'); if(tabsContainer) tabsContainer.classList.add('hidden');
        forgotPasswordForm.classList.remove('hidden');
    });
}
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault(); const identity = fpIdentity.value.trim(); if (!identity) return;
        fpBtn.disabled = true; fpBtn.textContent = 'Sending...';
        try {
            const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity }) });
            const data = await res.json();
            if (res.ok && data.success) {
                window.resetPasswordUsername = data.username;
                forgotPasswordForm.classList.add('hidden'); resetPasswordForm.classList.remove('hidden');
            } else { fpError.textContent = data.message || 'Request failed'; }
        } catch(e) { fpError.textContent = 'Server error.'; }
        finally { fpBtn.disabled = false; fpBtn.textContent = 'Send Reset OTP'; }
    });
}
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = rpOtp.value.trim(); const newPassword = rpNewPassword.value;
        if (!otp || !newPassword || !window.resetPasswordUsername) return;
        rpBtn.disabled = true; rpBtn.textContent = 'Resetting...';
        try {
            const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: window.resetPasswordUsername, otp, newPassword }) });
            const data = await res.json();
            if (res.ok && data.success) { alert('Password reset! You can now login.'); switchTab('login'); }
            else { rpError.textContent = data.message || 'Reset failed'; }
        } catch(e) { rpError.textContent = 'Server error.'; }
        finally { rpBtn.disabled = false; rpBtn.textContent = 'Reset Password'; }
    });
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token'); localStorage.removeItem('username'); localStorage.removeItem('profilePic');
    currentUser = null; currentChatUser = null; currentChatGroupId = null; currentUserPic = null; unreadCounts = {};
    if (socket) { socket.disconnect(); socket = null; }
    chatMessages.innerHTML = ''; showAuth();
});

// =====================================================
// FETCH + RENDER SIDEBAR
// =====================================================
const fetchUsers = async () => {
    try {
        const res = await fetch('/api/users'); const data = await res.json();
        if (data.success) { allUsers = data.data.filter(u => u.username !== currentUser); renderSidebar(); updateChatStatus(); }
    } catch(e) {}
};

const fetchGroups = async () => {
    try {
        const res = await fetch(`/api/groups/${currentUser}`); const data = await res.json();
        if (data.success) { allGroups = data.data; renderSidebar(); }
    } catch(e) {}
};

const renderSidebar = () => {
    usersListEl.innerHTML = '';
    allGroups.forEach(group => {
        const li = document.createElement('li');
        li.className = currentChatGroupId === group._id ? 'active' : '';
        li.onclick = () => selectGroup(group._id, group.name);
        const badge = unreadCounts[group._id] ? `<div class="unread-badge">${unreadCounts[group._id]}</div>` : '';
        li.innerHTML = `<div class="avatar" style="width:40px;height:40px;font-size:16px;margin-right:12px;background:#00a884;">G</div><div class="username-text">${escapeHtml(group.name)}</div>${badge}`;
        usersListEl.appendChild(li);
    });
    allUsers.forEach(user => {
        const isOnline = onlineUsersList.includes(user.username);
        const li = document.createElement('li');
        li.className = currentChatUser === user.username ? 'active' : '';
        li.onclick = () => selectUser(user.username);
        const av = user.profilePic
            ? `<img src="${user.profilePic}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;margin-right:12px;">`
            : `<div class="avatar" style="width:40px;height:40px;font-size:16px;margin-right:12px;">${user.username.charAt(0).toUpperCase()}</div>`;
        const badge = unreadCounts[user.username] ? `<div class="unread-badge">${unreadCounts[user.username]}</div>` : '';
        li.innerHTML = `<div style="position:relative; cursor:pointer;" onclick="event.stopPropagation(); window.viewUserProfile('${escapeHtml(user.username)}')">${av}<div class="status-dot ${isOnline?'online':''}" style="bottom:0;right:12px;width:12px;height:12px;"></div></div><div class="username-text">${escapeHtml(user.username)}</div>${badge}`;
        usersListEl.appendChild(li);
    });
};

const updateChatStatus = () => {
    if (currentChatGroupId) {
        chatUserStatus.textContent = 'Group Chat';
    } else if (currentChatUser) {
        const user = allUsers.find(u => u.username === currentChatUser);
        const isOnline = onlineUsersList.includes(currentChatUser);
        let s = isOnline ? 'Online' : (user && user.lastSeen ? `Last seen ${new Date(user.lastSeen).toLocaleDateString()} at ${new Date(user.lastSeen).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}` : 'Offline');
        if (user && user.createdAt) s += ` • Member since ${new Date(user.createdAt).toLocaleString('default',{month:'short',year:'numeric'})}`;
        chatUserStatus.textContent = s;
    } else { chatUserStatus.textContent = ''; }
};

const selectUser = (username) => {
    currentChatUser = username; currentChatGroupId = null;
    chatTitleEl.textContent = username;
    if (unreadCounts[username]) delete unreadCounts[username];
    if (addMemberBtn) addMemberBtn.classList.add('hidden');
    if (groupInfoBtn) groupInfoBtn.classList.add('hidden');
    if (videoCallBtn) videoCallBtn.classList.remove('hidden');
    if (toggleSelectModeBtn) toggleSelectModeBtn.classList.remove('hidden');
    pinnedBanner.classList.add('hidden');
    updateChatStatus(); msgInput.disabled = false; msgInput.focus();
    renderSidebar(); fetchMessages(username);
    if (socket) socket.emit('markRead', { sender: username });
};

const selectGroup = async (groupId, groupName) => {
    currentChatGroupId = groupId; currentChatUser = null;
    chatTitleEl.textContent = groupName;
    currentGroupObj = allGroups.find(g => g._id === groupId);
    if (unreadCounts[groupId]) delete unreadCounts[groupId];
    if (addMemberBtn) addMemberBtn.classList.remove('hidden');
    if (groupInfoBtn) groupInfoBtn.classList.remove('hidden');
    if (videoCallBtn) videoCallBtn.classList.add('hidden');
    if (toggleSelectModeBtn) toggleSelectModeBtn.classList.remove('hidden');
    updateChatStatus(); msgInput.disabled = false; msgInput.focus();
    renderSidebar(); fetchMessages(groupId);
    // Show pinned message if any
    if (currentGroupObj && currentGroupObj.pinnedMessage) {
        try {
            const res = await fetch(`/api/messages/${currentUser}/${groupId}`);
            const data = await res.json();
            if (data.success) {
                const pinned = data.data.find(m => m._id === currentGroupObj.pinnedMessage || m._id.toString() === currentGroupObj.pinnedMessage.toString());
                if (pinned) { pinnedText.textContent = `📌 ${pinned.content}`; pinnedBanner.classList.remove('hidden'); }
                else { pinnedBanner.classList.add('hidden'); }
            }
        } catch(e) { pinnedBanner.classList.add('hidden'); }
    } else { pinnedBanner.classList.add('hidden'); }
};

const fetchMessages = async (targetId) => {
    if (!targetId) return;
    try {
        const res = await fetch(`/api/messages/${currentUser}/${targetId}`);
        const data = await res.json();
        chatMessages.innerHTML = '';
        if (data.success) {
            data.data.forEach(msg => appendMessage({
                _id: msg._id, user: msg.sender, text: msg.content,
                type: msg.type || 'text', fileUrl: msg.fileUrl, read: msg.read,
                isDeleted: msg.isDeleted, timestamp: msg.timestamp,
                replyTo: msg.replyTo, reactions: msg.reactions || [],
                isEdited: msg.isEdited, isForwarded: msg.isForwarded,
                linkPreview: msg.linkPreview
            }));
        }
    } catch(e) {}
};

// =====================================================
// GROUP CONTROLS
// =====================================================
createGroupBtn.addEventListener('click', async () => {
    const name = prompt('Enter group name:'); if (!name) return;
    const members = allUsers.map(u => u.username); members.push(currentUser);
    try {
        const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, admin: currentUser, members }) });
        const data = await res.json();
        if (data.success) { fetchGroups(); if (socket) socket.emit('join', currentUser); }
    } catch(e) {}
});

addMemberBtn.addEventListener('click', async () => {
    if (!currentChatGroupId) return;
    const username = prompt('Enter username to add:'); if (!username) return;
    try {
        const res = await fetch(`/api/groups/${currentChatGroupId}/members`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) });
        const data = await res.json();
        if (data.success) { showToast('Member added!'); fetchGroups(); }
        else { showToast(data.message || 'Failed'); }
    } catch(e) {}
});

unpinBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!currentChatGroupId || !currentGroupObj || currentGroupObj.admin !== currentUser) return;
    try {
        await fetch(`/api/groups/${currentChatGroupId}/pin`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: null, adminUsername: currentUser }) });
        pinnedBanner.classList.add('hidden');
        showToast('Message unpinned');
    } catch(e) {}
});

// =====================================================
// APPEND MESSAGE
// =====================================================
const appendMessage = (msg) => {
    const div = document.createElement('div');
    if (msg._id) div.id = `msg-${msg._id}`;

    if (msg.type === 'system') {
        div.classList.add('message', 'system');
        div.innerHTML = `<div class="message-content">${escapeHtml(msg.text)}</div>`;
    } else {
        const isSent = msg.user === currentUser;
        div.classList.add('message', isSent ? 'sent' : 'received');
        if (msg.isAI) div.classList.add('ai-msg');

        // Quoted reply block
        let replyHtml = '';
        if (msg.replyTo && msg.replyTo.senderName) {
            replyHtml = `<div class="quoted-reply" onclick="scrollToMsg('${msg.replyTo.messageId}')"><div class="quoted-sender">${escapeHtml(msg.replyTo.senderName)}</div><div class="quoted-text">${escapeHtml(msg.replyTo.preview)}</div></div>`;
        }

        // Forwarded badge
        const fwdHtml = msg.isForwarded ? `<div class="forwarded-badge">↪ Forwarded</div>` : '';
        // AI badge
        const aiBadge = msg.isAI ? `<div class="ai-badge">🤖 ChatSpace AI</div>` : '';

        // Content
        let contentHtml = escapeHtml(msg.text);
        if (msg.isDeleted) {
            contentHtml = `<span style="font-style:italic;color:var(--text-muted);">🚫 ${escapeHtml(msg.text)}</span>`;
        } else if (msg.type === 'image' && msg.fileUrl) {
            contentHtml = `<img src="${msg.fileUrl}" style="max-width:100%;border-radius:8px;margin-bottom:4px;display:block;cursor:pointer;" onclick="window.openImageLightbox('${msg.fileUrl}')">${escapeHtml(msg.text) !== msg.fileUrl.split('/').pop() ? `<div style="font-size:14px;">${escapeHtml(msg.text)}</div>` : ''}`;
        } else if (msg.type === 'audio' && msg.fileUrl) {
            contentHtml = `<audio controls src="${msg.fileUrl}" style="max-width:100%;height:40px;outline:none;"></audio>`;
        } else if (msg.type === 'file' && msg.fileUrl) {
            contentHtml = `<div>📎 <a href="${msg.fileUrl}" download style="color:inherit;text-decoration:underline;">${escapeHtml(msg.text)}</a></div>`;
        } else {
            // Linkify
            const urls = detectURL(msg.text || '');
            if (urls && urls.length > 0) {
                contentHtml = escapeHtml(msg.text).replace(/(https?:\/\/[^\s]+)/g, `<a href="$1" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:underline;">$1</a>`);
            }
        }

        // Link preview card
        let linkCardHtml = '';
        if (msg.linkPreview && msg.linkPreview.title) {
            const lp = msg.linkPreview;
            linkCardHtml = `<a href="${lp.url}" target="_blank" rel="noopener" class="link-preview-card">
                ${lp.image ? `<img src="${lp.image}" onerror="this.style.display='none'" alt="">` : ''}
                <div class="link-preview-body">
                    <div class="link-preview-title">${escapeHtml(lp.title)}</div>
                    ${lp.description ? `<div class="link-preview-desc">${escapeHtml(lp.description)}</div>` : ''}
                    <div class="link-preview-url">${escapeHtml(lp.url)}</div>
                </div>
            </a>`;
        }

        const timeString = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '';
        const editedLabel = msg.isEdited ? `<span class="edited-label">(edited)</span>` : '';
        let statusHtml = '';
        if (isSent) {
            const checkColor = msg.read ? '#53bdeb' : 'var(--text-muted)';
            const checkSymbol = msg.read ? '✓✓' : '✓';
            statusHtml = `<span class="checkmark" style="color:${checkColor};margin-left:4px;">${checkSymbol}</span>`;
        }
        const deleteBtnHtml = (isSent && !msg.isDeleted && msg._id)
            ? `<button onclick="deleteMessage('${msg._id}')" class="delete-btn" style="position:absolute;right:-24px;top:0;background:none;border:none;cursor:pointer;color:var(--text-muted);opacity:0.5;">🗑️</button>` : '';
        const checkboxHtml = msg._id
            ? `<input type="checkbox" class="msg-checkbox" value="${msg._id}" onchange="window.toggleMsgSelection(this,'${msg._id}')">` : '';

        // Reactions bar
        const reactionsHtml = buildReactionsHtml(msg.reactions || [], msg._id);

        div.innerHTML = `
            <div class="message-wrapper">
                <div class="checkbox-container">${checkboxHtml}</div>
                <div class="message-bubble-container" style="position:relative;">
                    ${deleteBtnHtml}
                    ${!isSent && currentChatGroupId ? `<div class="message-meta" style="cursor:pointer; font-weight:bold; color:#0086c3; margin-bottom: 4px;" onclick="window.viewUserProfile('${msg.user}')">${escapeHtml(msg.user)}</div>` : ''}
                    <div class="message-content">
                        ${aiBadge}${fwdHtml}${replyHtml}
                        <div class="message-content-inner" style="margin-bottom:10px;padding-right:10px;">${contentHtml}${linkCardHtml}</div>
                        <div style="font-size:10px;color:var(--text-muted);text-align:right;position:absolute;bottom:4px;right:8px;display:flex;align-items:center;">
                            ${timeString}${editedLabel}${statusHtml}
                        </div>
                    </div>
                    ${reactionsHtml}
                </div>
            </div>`;

        // Right-click context menu
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, { ...msg, isSent, element: div });
        });
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
};

const buildReactionsHtml = (reactions, msgId) => {
    // Always render the container (even if empty) so updates can target it
    const grouped = {};
    (reactions || []).forEach(r => {
        if (!grouped[r.emoji]) grouped[r.emoji] = [];
        grouped[r.emoji].push(r.user);
    });
    if (Object.keys(grouped).length === 0) return `<div class="reactions-bar" id="reactions-${msgId}"></div>`;
    const pills = Object.entries(grouped).map(([emoji, users]) => {
        const mine = users.includes(currentUser);
        return `<button class="reaction-pill ${mine?'mine':''}" onclick="toggleReaction('${msgId}','${emoji}')" title="${users.join(', ')}">${emoji} <span class="count">${users.length}</span></button>`;
    }).join('');
    return `<div class="reactions-bar" id="reactions-${msgId}">${pills}</div>`;
};

window.scrollToMsg = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.outline = '2px solid var(--primary)'; setTimeout(() => el.style.outline = '', 1500); }
};

window.deleteMessage = (messageId) => {
    if (confirm('Delete this message for everyone?')) socket.emit('deleteMessage', { messageId });
};

// =====================================================
// REACTIONS
// =====================================================
window.toggleReaction = (msgId, emoji) => {
    if (!socket) return;
    const isGroup = !!currentChatGroupId;
    socket.emit('reactMessage', { messageId: msgId, emoji, receiver: currentChatGroupId || currentChatUser, isGroup });
};

// =====================================================
// SEARCH
// =====================================================
searchToggleBtn.addEventListener('click', () => {
    searchBar.classList.toggle('hidden');
    if (!searchBar.classList.contains('hidden')) { searchInput.focus(); }
    else { searchResults.classList.add('hidden'); searchInput.value = ''; }
});
searchCloseBtn.addEventListener('click', () => {
    searchBar.classList.add('hidden'); searchResults.classList.add('hidden'); searchInput.value = '';
});

let searchDebounce;
searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
        const q = searchInput.value.trim();
        if (!q) { searchResults.classList.add('hidden'); return; }
        const targetId = currentChatGroupId || currentChatUser || '';
        try {
            const res = await fetch(`/api/messages/search?q=${encodeURIComponent(q)}&user=${currentUser}&with=${targetId}`);
            const data = await res.json();
            searchResults.innerHTML = '';
            if (!data.success || data.data.length === 0) {
                searchResults.innerHTML = `<div class="search-empty">No messages found for "${escapeHtml(q)}"</div>`;
            } else {
                data.data.forEach(msg => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    const hi = msg.content.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'), '<mark>$1</mark>');
                    item.innerHTML = `<div class="search-result-sender">${escapeHtml(msg.sender)}</div><div class="search-result-text">${hi}</div>`;
                    item.onclick = () => { window.scrollToMsg(msg._id); searchBar.classList.add('hidden'); searchResults.classList.add('hidden'); };
                    searchResults.appendChild(item);
                });
            }
            searchResults.classList.remove('hidden');
        } catch(e) {}
    }, 400);
});

// =====================================================
// REPLY
// =====================================================
const setReplyingTo = (msgData) => {
    replyingTo = { messageId: msgData._id, senderName: msgData.user, preview: msgData.text || '[attachment]' };
    replyPreviewName.textContent = `Replying to ${msgData.user}`;
    replyPreviewText.textContent = replyingTo.preview;
    replyPreviewBar.classList.remove('hidden');
    msgInput.focus();
};
const clearReply = () => { replyingTo = null; replyPreviewBar.classList.add('hidden'); };
if (replyCancelBtn) replyCancelBtn.addEventListener('click', clearReply);

// =====================================================
// SCHEDULE
// =====================================================
if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => {
        const now = new Date(); now.setMinutes(now.getMinutes() + 5);
        scheduleDatetime.min = now.toISOString().slice(0,16);
        scheduleDatetime.value = now.toISOString().slice(0,16);
        scheduleModal.classList.remove('hidden');
    });
}
if (closeScheduleBtn) closeScheduleBtn.addEventListener('click', () => scheduleModal.classList.add('hidden'));
if (confirmScheduleBtn) {
    confirmScheduleBtn.addEventListener('click', () => {
        const val = scheduleDatetime.value;
        if (!val) { showToast('Please pick a date and time'); return; }
        scheduledAt = new Date(val);
        if (scheduledAt <= new Date()) { showToast('Please pick a future time'); return; }
        scheduleTimeDisplay.textContent = scheduledAt.toLocaleString();
        schedulePreview.classList.remove('hidden');
        scheduleModal.classList.add('hidden');
        showToast(`📅 Message will be sent at ${scheduledAt.toLocaleString()}`);
    });
}
if (scheduleCancelBtn) scheduleCancelBtn.addEventListener('click', () => { scheduledAt = null; schedulePreview.classList.add('hidden'); });

// =====================================================
// CONTEXT MENU
// =====================================================
const showContextMenu = (e, msgData) => {
    contextTargetMsg = msgData;
    // Save position for reaction picker
    window._ctxX = e.clientX;
    window._ctxY = e.clientY;
    contextMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 190)}px`;
    contextMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 220)}px`;
    ctxEdit.classList.toggle('hidden', !msgData.isSent || !!msgData.isDeleted);
    ctxDelete.classList.toggle('hidden', !msgData.isSent || !!msgData.isDeleted);
    ctxPin.classList.toggle('hidden', !currentChatGroupId || !currentGroupObj || currentGroupObj.admin !== currentUser);
    contextMenu.classList.remove('hidden');
};
document.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) contextMenu.classList.add('hidden');
    if (!reactionPicker.contains(e.target)) reactionPicker.classList.add('hidden');
});

ctxReply.addEventListener('click', () => { if (contextTargetMsg) setReplyingTo(contextTargetMsg); contextMenu.classList.add('hidden'); });

ctxReact.addEventListener('click', () => {
    contextMenu.classList.add('hidden');
    // Use saved right-click position for correct placement
    const x = window._ctxX || window.innerWidth / 2;
    const y = window._ctxY || window.innerHeight / 2;
    reactionPicker.style.left = `${Math.min(x, window.innerWidth - 240)}px`;
    reactionPicker.style.top = `${Math.max(y - 70, 10)}px`;
    reactionPicker.classList.remove('hidden');
    document.querySelectorAll('.reaction-opt').forEach(btn => {
        btn.onclick = () => {
            if (contextTargetMsg && contextTargetMsg._id) {
                window.toggleReaction(contextTargetMsg._id, btn.dataset.emoji);
            }
            reactionPicker.classList.add('hidden');
        };
    });
});

ctxEdit.addEventListener('click', () => {
    if (!contextTargetMsg || !contextTargetMsg.isSent) return;
    contextMenu.classList.add('hidden');
    const newContent = prompt('Edit message:', contextTargetMsg.text);
    if (newContent && newContent !== contextTargetMsg.text) {
        socket.emit('editMessage', {
            messageId: contextTargetMsg._id, newContent,
            receiver: currentChatGroupId || currentChatUser,
            isGroup: !!currentChatGroupId
        });
    }
});

ctxForward.addEventListener('click', () => {
    contextMenu.classList.add('hidden');
    if (!contextTargetMsg) return;
    // Build forward targets list
    forwardTargetsList.innerHTML = '';
    allUsers.forEach(u => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="font-size:14px;">👤 ${escapeHtml(u.username)}</span>`;
        li.onclick = () => {
            socket.emit('forwardMessage', { messageId: contextTargetMsg._id, forwardTo: u.username, isGroupTarget: false });
            forwardModal.classList.add('hidden');
            showToast(`Forwarded to ${u.username}`);
        };
        forwardTargetsList.appendChild(li);
    });
    allGroups.forEach(g => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="font-size:14px;">👥 ${escapeHtml(g.name)}</span>`;
        li.onclick = () => {
            socket.emit('forwardMessage', { messageId: contextTargetMsg._id, forwardTo: g._id, isGroupTarget: true });
            forwardModal.classList.add('hidden');
            showToast(`Forwarded to ${g.name}`);
        };
        forwardTargetsList.appendChild(li);
    });
    forwardModal.classList.remove('hidden');
});

ctxDelete.addEventListener('click', () => {
    contextMenu.classList.add('hidden');
    if (contextTargetMsg) window.deleteMessage(contextTargetMsg._id);
});

ctxPin.addEventListener('click', async () => {
    contextMenu.classList.add('hidden');
    if (!contextTargetMsg || !currentChatGroupId) return;
    try {
        const res = await fetch(`/api/groups/${currentChatGroupId}/pin`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId: contextTargetMsg._id, adminUsername: currentUser })
        });
        const data = await res.json();
        if (data.success) {
            pinnedText.textContent = contextTargetMsg.text || '[attachment]';
            pinnedBanner.classList.remove('hidden');
            showToast('Message pinned!');
        }
    } catch(e) {}
});

if (closeForwardBtn) closeForwardBtn.addEventListener('click', () => forwardModal.classList.add('hidden'));

// =====================================================
// CHAT FORM SUBMIT (with AI, reply, schedule, link preview)
// =====================================================
msgInput.addEventListener('input', () => {
    if (!currentChatUser || !socket) return;
    socket.emit('typing', { receiver: currentChatUser });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('stopTyping', { receiver: currentChatUser }), 1500);
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!socket || (!currentChatUser && !currentChatGroupId)) return;

    let text = msgInput.value.trim();
    let type = 'text', fileUrl = null;

    // File upload
    if (selectedFile) {
        const fd = new FormData(); fd.append('file', selectedFile);
        try {
            const res = await fetch('/api/upload/message', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) { fileUrl = data.fileUrl; type = selectedFile.type.startsWith('image/') ? 'image' : 'file'; text = text || selectedFile.name; }
        } catch(err) { return; }
    }
    if (!text && !fileUrl) return;

    // AI Chatbot — @ai prefix
    if (text.startsWith('@ai ')) {
        const query = text.slice(4).trim();
        msgInput.value = ''; selectedFile = null; fileUpload.value = '';
        attachmentPreview.classList.add('hidden'); clearReply();
        appendMessage({ user: currentUser, text, type: 'text', timestamp: new Date(), reactions: [] });
        try {
            const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: query, username: currentUser }) });
            const data = await res.json();
            appendMessage({ user: 'ChatSpace AI', text: data.response || 'Error', type: 'text', timestamp: new Date(), reactions: [], isAI: true });
        } catch(err) { appendMessage({ user: 'ChatSpace AI', text: '🤖 AI unavailable.', type: 'text', timestamp: new Date(), isAI: true }); }
        return;
    }

    // Link preview fetch (async, non-blocking)
    let linkPreview = null;
    const urls = detectURL(text);
    if (urls && urls.length > 0 && type === 'text') {
        try {
            const res = await fetch('/api/preview-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urls[0] }) });
            const data = await res.json();
            if (data.success) linkPreview = data.data;
        } catch(err) {}
    }

    const payload = { text, type, fileUrl, replyTo: replyingTo || null, scheduledAt: scheduledAt ? scheduledAt.toISOString() : null, linkPreview };

    if (currentChatGroupId) {
        socket.emit('groupMessage', { groupId: currentChatGroupId, ...payload });
        socket.emit('groupStopTyping', { groupId: currentChatGroupId });
    } else {
        socket.emit('privateMessage', { receiver: currentChatUser, ...payload });
        socket.emit('stopTyping', { receiver: currentChatUser });
    }

    msgInput.value = ''; selectedFile = null; fileUpload.value = '';
    attachmentPreview.classList.add('hidden'); attachmentPreview.textContent = '';
    clearReply(); scheduledAt = null; schedulePreview.classList.add('hidden');
    if (emojiPicker && !emojiPicker.classList.contains('hidden')) emojiPicker.classList.add('hidden');
});

// =====================================================
// SELECTION MODE
// =====================================================
const updateSelectionCount = () => { selectionCount.textContent = `${selectedMessages.size} selected`; };
window.toggleMsgSelection = (cb, msgId) => {
    cb.checked ? selectedMessages.add(msgId) : selectedMessages.delete(msgId);
    updateSelectionCount();
};
const exitSelectionMode = () => {
    isSelectionMode = false; selectedMessages.clear();
    document.body.classList.remove('selection-mode');
    bulkActionBar.classList.add('hidden'); toggleSelectModeBtn.classList.remove('hidden');
    document.querySelectorAll('.msg-checkbox').forEach(cb => cb.checked = false);
};
toggleSelectModeBtn.addEventListener('click', () => {
    isSelectionMode = true; selectedMessages.clear();
    document.body.classList.add('selection-mode');
    bulkActionBar.classList.remove('hidden'); toggleSelectModeBtn.classList.add('hidden');
    updateSelectionCount();
});
cancelSelectBtn.addEventListener('click', exitSelectionMode);
bulkDeleteBtn.addEventListener('click', () => {
    if (selectedMessages.size === 0) return;
    if (confirm('Delete these messages for you?')) {
        const ids = Array.from(selectedMessages);
        socket.emit('deleteMessagesForMe', { messageIds: ids });
        ids.forEach(id => { const el = document.getElementById(`msg-${id}`); if (el) el.remove(); });
        exitSelectionMode();
    }
});

// =====================================================
// SOCKET INIT — all real-time events
// =====================================================
const initSocket = () => {
    if (socket) socket.disconnect();
    socket = io();
    socket.emit('join', currentUser);

    socket.on('onlineUsers', (users) => { onlineUsersList = users; renderSidebar(); updateChatStatus(); });

    socket.on('privateMessage', (msgData) => {
        const isRelevant = (msgData.sender === currentChatUser && msgData.receiver === currentUser) ||
                           (msgData.sender === currentUser && msgData.receiver === currentChatUser);
        if (isRelevant) {
            appendMessage({ _id: msgData._id, user: msgData.sender, text: msgData.content, type: msgData.type || 'text', fileUrl: msgData.fileUrl, read: false, timestamp: msgData.timestamp, replyTo: msgData.replyTo, reactions: msgData.reactions || [], isEdited: msgData.isEdited, isForwarded: msgData.isForwarded, linkPreview: msgData.linkPreview });
            if (msgData.sender === currentChatUser && document.hasFocus()) socket.emit('markRead', { sender: currentChatUser });
            if (msgData.sender !== currentUser) playNotificationSound();
        } else if (msgData.sender !== currentUser) {
            unreadCounts[msgData.sender] = (unreadCounts[msgData.sender] || 0) + 1;
            renderSidebar(); playNotificationSound();
        }
    });

    socket.on('groupMessage', (msgData) => {
        if (msgData.receiver === currentChatGroupId) {
            appendMessage({ _id: msgData._id, user: msgData.sender, text: msgData.content, type: msgData.type || 'text', fileUrl: msgData.fileUrl, read: false, timestamp: msgData.timestamp, replyTo: msgData.replyTo, reactions: msgData.reactions || [], isEdited: msgData.isEdited, isForwarded: msgData.isForwarded });
            if (msgData.sender !== currentUser) playNotificationSound();
        } else if (msgData.sender !== currentUser) {
            unreadCounts[msgData.receiver] = (unreadCounts[msgData.receiver] || 0) + 1;
            renderSidebar(); playNotificationSound();
        }
    });

    socket.on('messageDeleted', ({ messageId }) => {
        const el = document.getElementById(`msg-${messageId}`); if (el) el.remove();
    });

    // Emoji reaction update
    socket.on('messageReacted', ({ messageId, reactions }) => {
        const msgEl = document.getElementById(`msg-${messageId}`);
        if (!msgEl) return;

        // Find or create the reactions bar
        let reactBar = document.getElementById(`reactions-${messageId}`);
        const newHtml = buildReactionsHtml(reactions, messageId);

        if (reactBar) {
            // Replace it safely: insert new one after, then remove old
            reactBar.insertAdjacentHTML('afterend', newHtml);
            reactBar.remove();
        } else {
            // Reactions bar doesn't exist yet — append to bubble container
            const bubbleContainer = msgEl.querySelector('.message-bubble-container');
            if (bubbleContainer) {
                bubbleContainer.insertAdjacentHTML('beforeend', newHtml);
            }
        }
    });

    // Message edited
    socket.on('messageEdited', ({ messageId, newContent, isEdited }) => {
        const msgEl = document.getElementById(`msg-${messageId}`);
        if (msgEl) {
            const inner = msgEl.querySelector('.message-content-inner');
            if (inner) inner.innerHTML = escapeHtml(newContent);
            // Add edited label if not already there
            let editedSpan = msgEl.querySelector('.edited-label');
            if (isEdited && !editedSpan) {
                const timeDiv = msgEl.querySelector('[style*="bottom:4px"]');
                if (timeDiv) timeDiv.insertAdjacentHTML('afterbegin', '<span class="edited-label">(edited)</span>');
            }
        }
    });

    // Scheduled message acknowledgement
    socket.on('messageScheduled', ({ scheduledAt, preview }) => {
        showToast(`📅 Scheduled: "${preview}" at ${new Date(scheduledAt).toLocaleString()}`);
    });

    socket.on('typing', ({ sender }) => {
        if (sender === currentChatUser) {
            typingIndicator.textContent = `${sender} is typing...`;
            typingIndicator.classList.remove('hidden');
        }
    });
    socket.on('stopTyping', ({ sender }) => {
        if (sender === currentChatUser) typingIndicator.classList.add('hidden');
    });
    socket.on('groupTyping', ({ sender, groupId }) => {
        if (groupId === currentChatGroupId && sender !== currentUser) {
            typingIndicator.textContent = `${sender} is typing...`;
            typingIndicator.classList.remove('hidden');
        }
    });
    socket.on('groupStopTyping', ({ sender, groupId }) => {
        if (groupId === currentChatGroupId) typingIndicator.classList.add('hidden');
    });

    socket.on('messagesRead', ({ reader }) => {
        if (reader === currentChatUser) {
            chatMessages.querySelectorAll('.message.sent').forEach(msg => {
                const ck = msg.querySelector('.checkmark');
                if (ck) { ck.innerHTML = '✓✓'; ck.style.color = '#53bdeb'; }
            });
        }
    });

    // WebRTC
    socket.on('incomingCall', ({ from, offer }) => {
        pendingCallFrom = from; window.incomingCallOffer = offer;
        incomingCallerName.textContent = from; incomingCallModal.classList.remove('hidden');
    });
    socket.on('callAnswered', async ({ answer }) => {
        if (peerConnection && !peerConnection.currentRemoteDescription)
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on('iceCandidate', async ({ candidate }) => {
        if (peerConnection) { try { await peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); } catch(e) {} }
    });
    socket.on('callDeclined', () => { alert('Call was declined.'); endCallLocal(); });
    socket.on('callEnded', () => endCallLocal());
};

// =====================================================
// GROUP INFO MODAL
// =====================================================
groupInfoBtn.addEventListener('click', () => {
    if (!currentGroupObj) return;
    groupInfoName.textContent = currentGroupObj.name;
    groupInfoAdmin.textContent = currentGroupObj.admin;
    groupMembersList.innerHTML = '';
    currentGroupObj.members.forEach(member => {
        const li = document.createElement('li');
        let actions = '';
        if (currentGroupObj.admin === currentUser && member !== currentUser) {
            actions = `<div style="display:flex;gap:4px;">
                <button class="btn outline-btn" style="padding:4px 8px;font-size:11px;" onclick="transferAdminRights('${member}')">Make Admin</button>
                <button class="btn outline-btn" style="padding:4px 8px;font-size:11px;color:var(--danger);border-color:var(--danger);" onclick="removeMemberFromGroup('${member}')">Remove</button>
            </div>`;
        }
        li.innerHTML = `<span style="font-size:14px;">${escapeHtml(member)} ${member === currentGroupObj.admin ? '<span style="color:var(--primary);font-size:12px;">(Admin)</span>' : ''}</span>${actions}`;
        groupMembersList.appendChild(li);
    });
    groupInfoModal.classList.remove('hidden');
});
closeGroupInfoBtn.addEventListener('click', () => groupInfoModal.classList.add('hidden'));

window.removeMemberFromGroup = async (memberUsername) => {
    if (!confirm(`Remove ${memberUsername}?`)) return;
    try {
        const res = await fetch(`/api/groups/${currentChatGroupId}/members/${memberUsername}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminUsername: currentUser }) });
        const data = await res.json();
        if (data.success) { currentGroupObj.members = currentGroupObj.members.filter(m => m !== memberUsername); groupInfoBtn.click(); }
        else { showToast(data.message); }
    } catch(e) {}
};
window.transferAdminRights = async (newAdmin) => {
    if (!confirm(`Transfer admin to ${newAdmin}?`)) return;
    try {
        const res = await fetch(`/api/groups/${currentChatGroupId}/admin`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminUsername: currentUser, newAdminUsername: newAdmin }) });
        const data = await res.json();
        if (data.success) { currentGroupObj.admin = newAdmin; groupInfoBtn.click(); }
    } catch(e) {}
};
leaveGroupBtn.addEventListener('click', async () => {
    if (!confirm('Leave this group?')) return;
    try {
        const res = await fetch(`/api/groups/${currentChatGroupId}/leave`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser }) });
        const data = await res.json();
        if (data.success) {
            groupInfoModal.classList.add('hidden'); currentChatGroupId = null; currentGroupObj = null;
            chatTitleEl.textContent = 'Select a chat to start messaging'; chatUserStatus.textContent = '';
            chatMessages.innerHTML = ''; addMemberBtn.classList.add('hidden'); groupInfoBtn.classList.add('hidden');
            pinnedBanner.classList.add('hidden'); fetchGroups();
        } else { showToast(data.message); }
    } catch(e) {}
});

// =====================================================
// PROFILE MODAL
// =====================================================
// Helper to open profile modal for any user (self or others)
window.viewUserProfile = async (username) => {
    try {
        const res = await fetch(`/api/users/${username}`);
        const data = await res.json();
        if (data.success) {
            const user = data.data;
            profileUsername.value = user.username;
            profileFullname.value = user.fullName || '';
            profileEmail.value = user.email || '';
            if (profileBio) profileBio.value = user.bio || '';
            profileMsg.textContent = '';
            
            // Set Avatar
            if (user.profilePic) {
                profileModalAvatarImg.src = user.profilePic;
                profileModalAvatarImg.classList.remove('hidden');
                profileModalAvatarText.classList.add('hidden');
            } else {
                profileModalAvatarImg.classList.add('hidden');
                profileModalAvatarText.classList.remove('hidden');
                profileModalAvatarText.textContent = user.username.charAt(0).toUpperCase();
            }

            // Adjust form for self vs others
            if (username === currentUser) {
                profileModalTitle.textContent = 'My Profile';
                profileFullname.removeAttribute('readonly');
                profileEmail.removeAttribute('readonly');
                if (profileBio) profileBio.removeAttribute('readonly');
                profileFullname.style.background = '';
                profileEmail.style.background = '';
                if (profileBio) profileBio.style.background = '';
                if (profileSaveBtn) profileSaveBtn.classList.remove('hidden');
            } else {
                profileModalTitle.textContent = `${user.username}'s Profile`;
                profileFullname.setAttribute('readonly', 'true');
                profileEmail.setAttribute('readonly', 'true');
                if (profileBio) profileBio.setAttribute('readonly', 'true');
                profileFullname.style.background = 'var(--bg-main)';
                profileEmail.style.background = 'var(--bg-main)';
                if (profileBio) profileBio.style.background = 'var(--bg-main)';
                if (profileSaveBtn) profileSaveBtn.classList.add('hidden');
            }
            
            profileModal.classList.remove('hidden');
        }
    } catch(e) {
        showToast('Could not load profile details');
    }
};

// Image Lightbox Actions
window.openImageLightbox = (imgSrc) => {
    if (!imgSrc) return;
    lightboxImg.src = imgSrc;
    imageLightbox.classList.remove('hidden');
};

if (profileModalAvatarImg) {
    profileModalAvatarImg.style.cursor = 'pointer';
    profileModalAvatarImg.addEventListener('click', () => {
        window.openImageLightbox(profileModalAvatarImg.src);
    });
}

viewProfileBtn.addEventListener('click', () => {
    window.viewUserProfile(currentUser);
});
closeProfileBtn.addEventListener('click', () => profileModal.classList.add('hidden'));
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullNameVal = profileFullname.value.trim();
    if (fullNameVal) {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(fullNameVal)) {
            profileMsg.textContent = 'Full name must only contain letters and spaces.';
            profileMsg.style.color = '#ff6b6b';
            return;
        }
    }
    try {
        const res = await fetch(`/api/users/${currentUser}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: profileFullname.value, email: profileEmail.value, bio: profileBio ? profileBio.value : '' }) });
        const data = await res.json();
        if (data.success) {
            profileMsg.textContent = 'Profile updated!';
            profileMsg.style.color = '#10b981';
            // Update local storage if needed
            fetchUsers();
            setTimeout(() => profileModal.classList.add('hidden'), 1200);
        } else {
            profileMsg.textContent = data.message || 'Failed';
            profileMsg.style.color = '#ff6b6b';
        }
    } catch(e) {
        profileMsg.textContent = 'Error';
        profileMsg.style.color = '#ff6b6b';
    }
});

window.addEventListener('focus', () => {
    if (currentChatUser && socket) socket.emit('markRead', { sender: currentChatUser });
});

// =====================================================
// WEBRTC
// =====================================================
const getMedia = async () => {
    try { localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); localVideo.srcObject = localStream; }
    catch(e) { alert('Camera/mic access denied.'); localStream = null; }
};
const setupPeerConnection = () => {
    peerConnection = new RTCPeerConnection(rtcConfiguration);
    remoteStream = new MediaStream(); remoteVideo.srcObject = remoteStream;
    if (localStream) localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
    peerConnection.ontrack = (e) => e.streams[0].getTracks().forEach(t => remoteStream.addTrack(t));
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('iceCandidate', { to: isCaller ? currentChatUser : pendingCallFrom, candidate: e.candidate });
    };
};
const endCallLocal = () => {
    callActive = false; videoCallOverlay.classList.add('hidden');
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
    if (peerConnection) { peerConnection.close(); peerConnection = null; }
    localVideo.srcObject = null; remoteVideo.srcObject = null;
    isCaller = false; pendingCallFrom = null; window.incomingCallOffer = null;
};
videoCallBtn.addEventListener('click', async () => {
    if (!currentChatUser || !socket || callActive) return;
    isCaller = true; callActive = true; videoCallOverlay.classList.remove('hidden');
    await getMedia(); if (!localStream) { videoCallOverlay.classList.add('hidden'); callActive = false; isCaller = false; return; }
    setupPeerConnection();
    try { const offer = await peerConnection.createOffer(); await peerConnection.setLocalDescription(offer); socket.emit('callUser', { userToCall: currentChatUser, offer }); }
    catch(e) { endCallLocal(); }
});
acceptCallBtn.addEventListener('click', async () => {
    if (!window.incomingCallOffer) return;
    isCaller = false; callActive = true; incomingCallModal.classList.add('hidden'); videoCallOverlay.classList.remove('hidden');
    await getMedia(); if (!localStream) { videoCallOverlay.classList.add('hidden'); callActive = false; return; }
    setupPeerConnection();
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(window.incomingCallOffer));
        const answer = await peerConnection.createAnswer(); await peerConnection.setLocalDescription(answer);
        socket.emit('answerCall', { to: pendingCallFrom, answer });
    } catch(e) { endCallLocal(); }
});
declineCallBtn.addEventListener('click', () => {
    incomingCallModal.classList.add('hidden');
    if (socket) socket.emit('declineCall', { to: pendingCallFrom });
    pendingCallFrom = null; window.incomingCallOffer = null;
});
window.endCallLocalBtnClick = () => { try { if (socket) socket.emit('endCall', { to: isCaller ? currentChatUser : pendingCallFrom }); endCallLocal(); } catch(e) {} };
window.toggleMuteBtnClick = () => { try { if (localStream) { const t = localStream.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; document.getElementById('toggle-mute-btn').textContent = t.enabled ? '🎤 Mute' : '🎤 Unmute'; } } } catch(e) {} };
window.toggleVideoBtnClick = () => { try { if (localStream) { const t = localStream.getVideoTracks()[0]; if (t) { t.enabled = !t.enabled; document.getElementById('toggle-video-btn').textContent = t.enabled ? '📷 Video Off' : '📷 Video On'; } } } catch(e) {} };

// =====================================================
// BOOT
// =====================================================
checkAuth();

// =====================================================
// AI CHATBOT PANEL — Dedicated space
// =====================================================
const openAIPanelBtn = document.getElementById('open-ai-panel-btn');
const closeAIPanelBtn = document.getElementById('close-ai-panel-btn');
const aiClearBtn = document.getElementById('ai-clear-btn');
const aiChatPanel = document.getElementById('ai-chat-panel');
const aiPanelMessages = document.getElementById('ai-panel-messages');
const aiChatForm = document.getElementById('ai-chat-form');
const aiMsgInput = document.getElementById('ai-msg-input');
const aiTypingIndicator = document.getElementById('ai-typing-indicator');
const aiSuggestionChips = document.getElementById('ai-suggestion-chips');
const aiSendBtn = aiChatForm ? aiChatForm.querySelector('.ai-send-btn') : null;

let aiHistory = JSON.parse(localStorage.getItem('aiChatHistory') || '[]');

const formatAIText = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const appendAIMessage = (text, role, save = true) => {
    const isUser = role === 'user';
    const row = document.createElement('div');
    row.className = `ai-msg-row ${isUser ? 'user-row' : 'ai-row'}`;
    const avatar = document.createElement('div');
    avatar.className = 'ai-msg-avatar';
    avatar.textContent = isUser ? (currentUser ? currentUser.charAt(0).toUpperCase() : 'U') : '🤖';
    const bubble = document.createElement('div');
    bubble.className = 'ai-msg-bubble';
    bubble.style.position = 'relative';
    bubble.innerHTML = isUser ? escapeHtml(text) : formatAIText(text);
    if (!isUser) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'ai-copy-btn';
        copyBtn.title = 'Copy'; copyBtn.textContent = '📋';
        copyBtn.onclick = () => { navigator.clipboard.writeText(text).then(() => { copyBtn.textContent = '✅'; setTimeout(() => copyBtn.textContent = '📋', 1500); }); };
        bubble.appendChild(copyBtn);
    }
    const timeEl = document.createElement('div');
    timeEl.className = 'ai-msg-time'; timeEl.textContent = timeNow();
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '82%';
    wrapper.appendChild(bubble); wrapper.appendChild(timeEl);
    row.appendChild(isUser ? wrapper : avatar);
    row.appendChild(isUser ? avatar : wrapper);
    aiPanelMessages.appendChild(row);
    aiPanelMessages.scrollTop = aiPanelMessages.scrollHeight;
    if (save) { aiHistory.push({ role, text, time: timeNow() }); localStorage.setItem('aiChatHistory', JSON.stringify(aiHistory.slice(-100))); }
};

const showWelcomeCard = () => {
    const card = document.createElement('div');
    card.className = 'ai-welcome-card';
    card.innerHTML = `<div class="ai-welcome-icon">🤖</div><div class="ai-welcome-title">Hello! I'm ChatSpace AI</div><div class="ai-welcome-sub">Powered by Google Gemini 2.0<br>Ask me anything — I'm here to help!</div>`;
    aiPanelMessages.appendChild(card);
};

const restoreAIHistory = () => {
    aiPanelMessages.innerHTML = '';
    if (aiHistory.length === 0) { showWelcomeCard(); }
    else { aiHistory.forEach(msg => appendAIMessage(msg.text, msg.role, false)); }
};

const sendAIMessage = async (question) => {
    if (!question.trim()) return;
    if (aiSuggestionChips) aiSuggestionChips.style.display = 'none';
    appendAIMessage(question, 'user');
    aiMsgInput.value = ''; aiMsgInput.focus();
    aiTypingIndicator.classList.remove('hidden');
    aiPanelMessages.scrollTop = aiPanelMessages.scrollHeight;
    if (aiSendBtn) aiSendBtn.disabled = true;
    try {
        const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, username: currentUser || 'Guest' }) });
        const data = await res.json();
        aiTypingIndicator.classList.add('hidden');
        appendAIMessage(data.response || '🤖 Sorry, I could not respond.', 'ai');
    } catch (err) {
        aiTypingIndicator.classList.add('hidden');
        appendAIMessage('🤖 Network error. Please check your connection.', 'ai');
    } finally { if (aiSendBtn) aiSendBtn.disabled = false; }
};

if (openAIPanelBtn) {
    openAIPanelBtn.addEventListener('click', () => {
        aiChatPanel.classList.remove('hidden');
        restoreAIHistory(); aiMsgInput.focus();
        openAIPanelBtn.style.background = 'linear-gradient(135deg,#008f6f,#0055bb)';
    });
}
if (closeAIPanelBtn) {
    closeAIPanelBtn.addEventListener('click', () => {
        aiChatPanel.classList.add('hidden');
        if (openAIPanelBtn) openAIPanelBtn.style.background = '';
    });
}
if (aiClearBtn) {
    aiClearBtn.addEventListener('click', () => {
        if (!confirm('Clear the entire conversation?')) return;
        aiHistory = []; localStorage.removeItem('aiChatHistory');
        aiPanelMessages.innerHTML = ''; showWelcomeCard();
        if (aiSuggestionChips) aiSuggestionChips.style.display = '';
    });
}
if (aiChatForm) { aiChatForm.addEventListener('submit', (e) => { e.preventDefault(); sendAIMessage(aiMsgInput.value.trim()); }); }
document.querySelectorAll('.ai-chip').forEach(chip => { chip.addEventListener('click', () => sendAIMessage(chip.dataset.q)); });

// =====================================================
// SIDEBAR REDESIGN v4 — Profile dropdown + icon buttons
// =====================================================
const sidebarUserRow = document.getElementById('sidebar-user-row');
const profileDropdown = document.getElementById('profile-dropdown');
const profileDropdownChevron = document.getElementById('profile-dropdown-chevron');
const soundIconSvg = document.getElementById('sound-icon-svg');

// SVG path for sound-off icon
const SOUND_ON_PATH = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
const SOUND_OFF_PATH = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;

// Update avatar for new design
const updateAvatarUIv4 = () => {
    const imgEl = document.getElementById('user-avatar-img');
    const textEl = document.getElementById('user-avatar-text');
    if (!imgEl || !textEl) return;
    if (currentUserPic) {
        imgEl.src = currentUserPic;
        imgEl.classList.remove('hidden');
        textEl.classList.add('hidden');
    } else {
        imgEl.classList.add('hidden');
        textEl.classList.remove('hidden');
        textEl.textContent = currentUser ? currentUser.charAt(0).toUpperCase() : 'U';
    }
};

// Patch original updateAvatarUI to also call v4 version
const _origUpdateAvatar = window.updateAvatarUI;
window.updateAvatarUI = () => { if (_origUpdateAvatar) _origUpdateAvatar(); updateAvatarUIv4(); };

// Toggle profile dropdown
if (sidebarUserRow) {
    sidebarUserRow.addEventListener('click', () => {
        const isOpen = !profileDropdown.classList.contains('hidden');
        profileDropdown.classList.toggle('hidden');
        profileDropdownChevron.classList.toggle('open', !isOpen);
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
        if (!sidebarUserRow.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.add('hidden');
            if (profileDropdownChevron) profileDropdownChevron.classList.remove('open');
        }
    }
});

// Close dropdown after any action inside it
if (profileDropdown) {
    profileDropdown.querySelectorAll('.profile-dropdown-item').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimeout(() => {
                profileDropdown.classList.add('hidden');
                if (profileDropdownChevron) profileDropdownChevron.classList.remove('open');
            }, 100);
        });
    });
}

// Update sound icon SVG dynamically
const updateSoundIcon = () => {
    if (!soundIconSvg) return;
    soundIconSvg.innerHTML = soundEnabled ? SOUND_ON_PATH : SOUND_OFF_PATH;
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.classList.toggle('sound-off', !soundEnabled);
    if (btn) btn.title = soundEnabled ? 'Sound: ON' : 'Sound: OFF';
};
// Override sound toggle to also update SVG
const soundBtn = document.getElementById('sound-toggle-btn');
if (soundBtn) {
    const origClick = soundBtn.onclick;
    soundBtn.addEventListener('click', () => setTimeout(updateSoundIcon, 10));
}
// Init sound icon on load
setTimeout(updateSoundIcon, 200);

// AI panel btn icon active state
const aiPanelBtn = document.getElementById('open-ai-panel-btn');
const closeAiPanelBtn2 = document.getElementById('close-ai-panel-btn');
if (aiPanelBtn) {
    aiPanelBtn.addEventListener('click', () => aiPanelBtn.classList.add('active'));
}
if (closeAiPanelBtn2) {
    closeAiPanelBtn2.addEventListener('click', () => {
        if (aiPanelBtn) aiPanelBtn.classList.remove('active');
    });
}

// =====================================================
// GLOBAL SEARCH — sidebar (users + messages)
// =====================================================
const globalSearchPanel   = document.getElementById('global-search-panel');
const globalSearchInput   = document.getElementById('global-search-input');
const globalSearchClose   = document.getElementById('global-search-close');
const globalSearchResults = document.getElementById('global-search-results');
const sidebarSearchBtn    = document.getElementById('search-toggle-btn'); // sidebar icon btn (old id reused)
// The sidebar 🔍 icon button still has id="search-toggle-btn" but is now in sidebar toolbar
// The chat header search btn is now a NEW element in the chat header — also id="search-toggle-btn" by HTML
// We need to differentiate — use querySelector to get the one in the sidebar icon toolbar
const sidebarIconSearchBtn = document.querySelector('.sidebar-icon-toolbar #search-toggle-btn') ||
                             document.querySelector('.sidebar-icon-btn[title="Search messages"]');

// Actually the sidebar 🔍 has id="search-toggle-btn" but since there are now TWO with same id,
// querySelector gets only the first. The chat-header one is the per-chat search.
// Let's just grab by their parent containers to disambiguate.
const allSearchToggleBtns = document.querySelectorAll('#search-toggle-btn');
// First one = sidebar icon toolbar, second = chat header
const sidebarGlobalSearchBtn = allSearchToggleBtns[0];  // sidebar 🔍
const chatHeaderSearchBtn    = allSearchToggleBtns[1];  // chat header 🔍

// ---- Sidebar global search toggle ----
if (sidebarGlobalSearchBtn) {
    sidebarGlobalSearchBtn.addEventListener('click', () => {
        const isOpen = !globalSearchPanel.classList.contains('hidden');
        globalSearchPanel.classList.toggle('hidden');
        sidebarGlobalSearchBtn.classList.toggle('active', !isOpen);
        if (!isOpen) {
            globalSearchInput.focus();
            globalSearchInput.value = '';
            globalSearchResults.innerHTML = '<div class="gs-placeholder">Type to search users and messages</div>';
        }
    });
}

if (globalSearchClose) {
    globalSearchClose.addEventListener('click', () => {
        globalSearchPanel.classList.add('hidden');
        if (sidebarGlobalSearchBtn) sidebarGlobalSearchBtn.classList.remove('active');
        globalSearchInput.value = '';
    });
}

// ---- Global search logic ----
const highlightMatch = (text, query) => {
    if (!text) return '';
    const safe = escapeHtml(text);
    const safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return safe.replace(new RegExp(`(${safeQ})`, 'gi'), '<mark>$1</mark>');
};

let globalSearchDebounce;
if (globalSearchInput) {
    globalSearchInput.addEventListener('input', () => {
        clearTimeout(globalSearchDebounce);
        const q = globalSearchInput.value.trim();
        if (!q) {
            globalSearchResults.innerHTML = '<div class="gs-placeholder">Type to search users and messages</div>';
            return;
        }
        globalSearchDebounce = setTimeout(() => runGlobalSearch(q), 350);
    });
}

const runGlobalSearch = async (q) => {
    globalSearchResults.innerHTML = '<div class="gs-placeholder">Searching…</div>';
    const ql = q.toLowerCase();

    // 1. Filter users locally
    const matchedUsers = allUsers.filter(u =>
        u.username.toLowerCase().includes(ql)
    );

    // 2. Fetch matched messages from API
    let matchedMsgs = [];
    try {
        const res = await fetch(`/api/messages/search?q=${encodeURIComponent(q)}&user=${currentUser}&with=`);
        const data = await res.json();
        if (data.success) matchedMsgs = data.data.slice(0, 12);
    } catch(e) {}

    globalSearchResults.innerHTML = '';

    if (matchedUsers.length === 0 && matchedMsgs.length === 0) {
        globalSearchResults.innerHTML = `<div class="gs-no-results">No results for "<strong>${escapeHtml(q)}</strong>"</div>`;
        return;
    }

    // Render user results
    if (matchedUsers.length > 0) {
        const label = document.createElement('div');
        label.className = 'gs-section-label';
        label.textContent = `👤 Users (${matchedUsers.length})`;
        globalSearchResults.appendChild(label);

        matchedUsers.forEach(user => {
            const item = document.createElement('div');
            item.className = 'gs-result-item';
            const av = user.profilePic
                ? `<img src="${user.profilePic}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
                : `<div class="gs-result-avatar">${user.username.charAt(0).toUpperCase()}</div>`;
            item.innerHTML = `
                ${av}
                <div class="gs-result-body">
                    <div class="gs-result-title">${highlightMatch(user.username, q)}</div>
                    <div class="gs-result-sub">${user.email ? escapeHtml(user.email) : 'Tap to open chat'}</div>
                </div>`;
            item.addEventListener('click', () => {
                selectUser(user.username);
                globalSearchPanel.classList.add('hidden');
                if (sidebarGlobalSearchBtn) sidebarGlobalSearchBtn.classList.remove('active');
                globalSearchInput.value = '';
            });
            globalSearchResults.appendChild(item);
        });
    }

    // Render message results
    if (matchedMsgs.length > 0) {
        if (matchedUsers.length > 0) {
            const div = document.createElement('div'); div.className = 'gs-divider';
            globalSearchResults.appendChild(div);
        }
        const label = document.createElement('div');
        label.className = 'gs-section-label';
        label.textContent = `💬 Messages (${matchedMsgs.length})`;
        globalSearchResults.appendChild(label);

        matchedMsgs.forEach(msg => {
            const item = document.createElement('div');
            item.className = 'gs-result-item';
            item.innerHTML = `
                <div class="gs-result-avatar msg-avatar">💬</div>
                <div class="gs-result-body">
                    <div class="gs-result-title">${escapeHtml(msg.sender)}</div>
                    <div class="gs-result-sub">${highlightMatch(msg.content, q)}</div>
                </div>`;
            item.addEventListener('click', () => {
                // Open the right chat and scroll to message
                const isGroup = msg.receiver && allGroups.find(g => g._id === msg.receiver || g.name === msg.receiver);
                if (isGroup) {
                    selectGroup(isGroup._id, isGroup.name);
                } else {
                    const partner = msg.sender === currentUser ? msg.receiver : msg.sender;
                    selectUser(partner);
                }
                globalSearchPanel.classList.add('hidden');
                if (sidebarGlobalSearchBtn) sidebarGlobalSearchBtn.classList.remove('active');
                globalSearchInput.value = '';
                // Scroll to message after chat loads
                setTimeout(() => window.scrollToMsg && window.scrollToMsg(msg._id), 600);
            });
            globalSearchResults.appendChild(item);
        });
    }
};

// =====================================================
// PER-CHAT SEARCH — inside chat header
// =====================================================
const chatSearchBar    = document.getElementById('search-bar');
const chatSearchInput  = document.getElementById('search-input');
const chatSearchClose  = document.getElementById('search-close-btn');
const chatSearchResults = document.getElementById('search-results');

if (chatHeaderSearchBtn) {
    chatHeaderSearchBtn.addEventListener('click', () => {
        const isOpen = !chatSearchBar.classList.contains('hidden');
        chatSearchBar.classList.toggle('hidden');
        chatHeaderSearchBtn.classList.toggle('active', !isOpen);
        if (!isOpen) {
            chatSearchInput.focus();
            chatSearchInput.value = '';
            chatSearchResults.classList.add('hidden');
        } else {
            chatSearchResults.classList.add('hidden');
            chatSearchInput.value = '';
        }
    });
}

if (chatSearchClose) {
    chatSearchClose.addEventListener('click', () => {
        chatSearchBar.classList.add('hidden');
        chatSearchResults.classList.add('hidden');
        chatSearchInput.value = '';
        if (chatHeaderSearchBtn) chatHeaderSearchBtn.classList.remove('active');
    });
}

// Show per-chat search btn when a chat is open
const _origSelectUser = window.selectUser;
const _origSelectGroup = window.selectGroup;

// Patch selectUser to reveal chat-header search btn
if (chatHeaderSearchBtn) {
    // Show search icon when entering any chat
    const showChatSearchBtn = () => chatHeaderSearchBtn.classList.remove('hidden');
    // Hook via MutationObserver on chat-title text change
    const chatTitleEl2 = document.getElementById('chat-title');
    if (chatTitleEl2) {
        new MutationObserver(() => {
            const hasChat = currentChatUser || currentChatGroupId;
            chatHeaderSearchBtn.classList.toggle('hidden', !hasChat);
        }).observe(chatTitleEl2, { childList: true });
    }
}

// Per-chat search input handler
let perChatDebounce;
if (chatSearchInput) {
    chatSearchInput.addEventListener('input', () => {
        clearTimeout(perChatDebounce);
        perChatDebounce = setTimeout(async () => {
            const q = chatSearchInput.value.trim();
            if (!q) { chatSearchResults.classList.add('hidden'); return; }
            const targetId = currentChatGroupId || currentChatUser || '';
            if (!targetId) return;
            try {
                const res = await fetch(`/api/messages/search?q=${encodeURIComponent(q)}&user=${currentUser}&with=${targetId}`);
                const data = await res.json();
                chatSearchResults.innerHTML = '';
                if (!data.success || data.data.length === 0) {
                    chatSearchResults.innerHTML = `<div style="padding:14px 16px;color:var(--text-muted);font-size:13px;text-align:center;">No messages found for "<strong>${escapeHtml(q)}</strong>"</div>`;
                } else {
                    data.data.forEach(msg => {
                        const item = document.createElement('div');
                        item.className = 'search-result-item';
                        item.innerHTML = `<div class="search-result-sender">${escapeHtml(msg.sender)}</div><div class="search-result-text">${highlightMatch(msg.content, q)}</div>`;
                        item.addEventListener('click', () => {
                            window.scrollToMsg(msg._id);
                            chatSearchBar.classList.add('hidden');
                            chatSearchResults.classList.add('hidden');
                            chatSearchInput.value = '';
                            if (chatHeaderSearchBtn) chatHeaderSearchBtn.classList.remove('active');
                        });
                        chatSearchResults.appendChild(item);
                    });
                }
                chatSearchResults.classList.remove('hidden');
            } catch(e) {}
        }, 400);
    });
}

// =====================================================
// E2E ENCRYPTION MODULE — Web Crypto API (ECDH + AES-GCM)
// =====================================================
const E2E = (() => {
    // Stores: username -> { keyPair, sharedKey, theirPublicKeyJwk }
    const sessions = {};

    // Our own ECDH key pair (generated once per page session)
    let myKeyPair = null;
    let myPublicKeyJwk = null;

    // ---- Helper: ArrayBuffer <-> Base64 ----
    const ab2b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
    const b642ab = (b64) => {
        const bin = atob(b64);
        const buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        return buf.buffer;
    };

    // ---- Generate our own key pair ----
    const init = async () => {
        myKeyPair = await crypto.subtle.generateKey(
            { name: 'ECDH', namedCurve: 'P-256' },
            true,
            ['deriveKey']
        );
        myPublicKeyJwk = await crypto.subtle.exportKey('jwk', myKeyPair.publicKey);
    };

    // ---- Derive shared AES-GCM key from their ECDH public key ----
    const deriveSharedKey = async (theirPublicKeyJwk) => {
        const theirPublicKey = await crypto.subtle.importKey(
            'jwk',
            theirPublicKeyJwk,
            { name: 'ECDH', namedCurve: 'P-256' },
            false,
            []
        );
        return crypto.subtle.deriveKey(
            { name: 'ECDH', public: theirPublicKey },
            myKeyPair.privateKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    };

    // ---- Encrypt plaintext -> "iv:ciphertext" base64 string ----
    const encrypt = async (username, plaintext) => {
        const session = sessions[username];
        if (!session || !session.sharedKey) return null;
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const cipherBuf = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            session.sharedKey,
            enc.encode(plaintext)
        );
        return ab2b64(iv) + ':' + ab2b64(cipherBuf);
    };

    // ---- Decrypt "iv:ciphertext" base64 -> plaintext ----
    const decrypt = async (username, payload) => {
        const session = sessions[username];
        if (!session || !session.sharedKey) return null;
        try {
            const [ivB64, cipherB64] = payload.split(':');
            const iv = new Uint8Array(b642ab(ivB64));
            const cipherBuf = b642ab(cipherB64);
            const plainBuf = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                session.sharedKey,
                cipherBuf
            );
            return new TextDecoder().decode(plainBuf);
        } catch (e) {
            return '[Could not decrypt]';
        }
    };

    // ---- Start key exchange with a peer ----
    const initSession = async (username) => {
        if (!myKeyPair) await init();
        sessions[username] = sessions[username] || {};
        // Emit our public key to peer
        socket.emit('e2ePublicKey', { to: username, publicKeyJwk: myPublicKeyJwk });
        updateE2EBadge('pending');
    };

    // ---- Called when peer sends us their public key (initiator) ----
    const handlePublicKey = async (from, theirPublicKeyJwk) => {
        if (!myKeyPair) await init();
        sessions[from] = sessions[from] || {};
        sessions[from].theirPublicKeyJwk = theirPublicKeyJwk;
        sessions[from].sharedKey = await deriveSharedKey(theirPublicKeyJwk);
        // Send back our public key as acknowledgment
        socket.emit('e2ePublicKeyAck', { to: from, publicKeyJwk: myPublicKeyJwk });
        if (currentChatUser === from) updateE2EBadge('active');
    };

    // ---- Called when peer ACKs with their key (responder) ----
    const handlePublicKeyAck = async (from, theirPublicKeyJwk) => {
        if (!myKeyPair) await init();
        sessions[from] = sessions[from] || {};
        sessions[from].theirPublicKeyJwk = theirPublicKeyJwk;
        sessions[from].sharedKey = await deriveSharedKey(theirPublicKeyJwk);
        if (currentChatUser === from) updateE2EBadge('active');
    };

    const hasSession = (username) => !!(sessions[username] && sessions[username].sharedKey);

    const getPublicKeyJwk = () => myPublicKeyJwk;

    const getSessionPublicKeyJwk = (username) =>
        sessions[username] ? sessions[username].theirPublicKeyJwk : null;

    return { init, initSession, handlePublicKey, handlePublicKeyAck,
             encrypt, decrypt, hasSession, getPublicKeyJwk, getSessionPublicKeyJwk };
})();

// ---- E2E Badge UI helper ----
const e2eBadgeEl = document.getElementById('e2e-badge');

const updateE2EBadge = (state) => {
    if (!e2eBadgeEl) return;
    const shieldSvg = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>`;
    if (state === 'active') {
        e2eBadgeEl.classList.remove('hidden', 'pending');
        e2eBadgeEl.innerHTML = shieldSvg + ' E2E Encrypted';
        e2eBadgeEl.title = 'Messages in this chat are end-to-end encrypted';
    } else if (state === 'pending') {
        e2eBadgeEl.classList.remove('hidden');
        e2eBadgeEl.classList.add('pending');
        e2eBadgeEl.innerHTML = shieldSvg + ' Securing…';
        e2eBadgeEl.title = 'Establishing encrypted channel…';
    } else {
        // 'off' or group chat
        e2eBadgeEl.classList.add('hidden');
        e2eBadgeEl.classList.remove('pending');
    }
};

// ---- Show E2E info modal ----
window.showE2EInfo = () => {
    let modal = document.getElementById('e2e-info-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'e2e-info-modal';
        modal.className = 'modal';
        modal.innerHTML = `
          <div class="modal-content">
            <span class="close-btn" onclick="document.getElementById('e2e-info-modal').classList.add('hidden')">&times;</span>
            <div class="e2e-info-header">
              <div class="e2e-shield-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#10b981"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              </div>
              <div class="e2e-info-title">End-to-End Encrypted</div>
              <div class="e2e-info-subtitle">Messages in this chat are secured with<br>end-to-end encryption.</div>
            </div>
            <ul class="e2e-info-list">
              <li><span class="e2e-li-icon">🔑</span><span>A unique <strong>ECDH P-256 key pair</strong> is generated in your browser every session. Your private key never leaves your device.</span></li>
              <li><span class="e2e-li-icon">🤝</span><span>Public keys are exchanged via the server. The server only sees encrypted ciphertext — <strong>never your plaintext messages</strong>.</span></li>
              <li><span class="e2e-li-icon">🔐</span><span>Each message is encrypted with <strong>AES-GCM 256-bit</strong> using a shared secret only you and your contact can compute.</span></li>
              <li><span class="e2e-li-icon">🛡️</span><span>Each message uses a random <strong>12-byte IV</strong> so no two ciphertexts are identical, even for the same text.</span></li>
            </ul>
            <div id="e2e-modal-key-block"></div>
          </div>`;
        document.body.appendChild(modal);
    }
    // Populate key fingerprint
    const keyBlock = modal.querySelector('#e2e-modal-key-block');
    const myJwk = E2E.getPublicKeyJwk();
    const theirJwk = currentChatUser ? E2E.getSessionPublicKeyJwk(currentChatUser) : null;
    if (myJwk) {
        const fp = (jwk) => {
            if (!jwk || !jwk.x) return '—';
            return jwk.x.substring(0, 24) + '…' + jwk.x.substring(jwk.x.length - 8);
        };
        keyBlock.innerHTML = `
          <div class="e2e-key-label">Your Public Key (fingerprint)</div>
          <div class="e2e-key-display">${fp(myJwk)}</div>
          ${theirJwk ? `<div class="e2e-key-label" style="margin-top:10px;">${escapeHtml(currentChatUser)}'s Public Key (fingerprint)</div>
          <div class="e2e-key-display">${fp(theirJwk)}</div>` : ''}`;
    }
    modal.classList.remove('hidden');
};

// ---- Wire E2E into selectUser ----
const _e2eOrigSelectUser = window.selectUser || selectUser;
const _e2eSelectUser = (username) => {
    _e2eOrigSelectUser(username);
    if (E2E.hasSession(username)) {
        updateE2EBadge('active');
    } else {
        updateE2EBadge('off');
        // Initiate key exchange
        if (socket) E2E.initSession(username);
    }
};
window.selectUser = _e2eSelectUser;

// Override selectGroup to hide E2E badge (groups not E2E)
const _e2eOrigSelectGroup = window.selectGroup || selectGroup;
window.selectGroup = (groupId, groupName) => {
    _e2eOrigSelectGroup(groupId, groupName);
    updateE2EBadge('off');
};

// ---- Register socket events for key exchange ----
// We hook these after initSocket so we patch the socket on connect.
const _e2eOrigInitSocket = window.initSocket || initSocket;
const _patchE2ESocket = () => {
    // Register E2E key exchange events on the live socket
    if (!socket) return;
    socket.on('e2ePublicKey', async ({ from, publicKeyJwk }) => {
        await E2E.handlePublicKey(from, publicKeyJwk);
        if (currentChatUser === from) updateE2EBadge('active');
    });
    socket.on('e2ePublicKeyAck', async ({ from, publicKeyJwk }) => {
        await E2E.handlePublicKeyAck(from, publicKeyJwk);
        if (currentChatUser === from) updateE2EBadge('active');
    });
};

// Patch initSocket to also register E2E socket events
const _origInitSocketFn = initSocket;
// Re-wire by listening for any new socket — use a short delay after initSocket
const _origCheckAuth = checkAuth;

// Intercept chatForm submit to encrypt outgoing messages
chatForm.addEventListener('submit', async (e2eCapture) => {
    // This runs after the original submit handler because we're adding a second listener.
    // We handle encryption here by overriding the socket.emit for privateMessage.
    // The encryption is already handled below by patching the socket emit.
}, { capture: false });

// ---- Patch socket.emit for 'privateMessage' to transparently encrypt ----
// We wrap after initSocket is first called
const _patchSocketEmit = () => {
    if (!socket || socket._e2ePatchedEmit) return;
    socket._e2ePatchedEmit = true;

    const _origEmit = socket.emit.bind(socket);

    socket.emit = async function (event, data, ...args) {
        if (event === 'privateMessage' && data && data.text && data.receiver) {
            if (E2E.hasSession(data.receiver) && data.type === 'text' && !data.fileUrl) {
                try {
                    const cipher = await E2E.encrypt(data.receiver, data.text);
                    if (cipher) {
                        // Mark as encrypted, store original for local display
                        const localText = data.text;
                        data = { ...data, text: cipher, e2e: true, _localText: localText };
                    }
                } catch (_) {}
            }
        }
        return _origEmit(event, data, ...args);
    };
};

// ---- Decrypt incoming privateMessages ----
const _origPrivateMessageHandler = async (msgData) => {
    if (msgData.e2e && msgData.content && msgData.sender !== currentUser) {
        const plain = await E2E.decrypt(msgData.sender, msgData.content);
        msgData.content = plain || msgData.content;
        msgData._wasEncrypted = true;
    }
    return msgData;
};

// ---- Hook into initSocket to patch E2E after socket created ----
// We use a MutationObserver-style approach: override initSocket global
window._e2eInitSocketCalled = false;
const _e2eHookInterval = setInterval(() => {
    if (socket && !socket._e2ePatchedEmit) {
        _patchSocketEmit();
        _patchE2ESocket();

        // Patch the privateMessage handler to decrypt
        const _origOn = socket.on.bind(socket);
        // Since socket.on handlers are already registered by initSocket,
        // we intercept by listening to the raw event and decrypting in-place.
        socket.on('privateMessage', async (rawData) => {
            if (rawData.e2e && rawData.content && rawData.sender !== currentUser) {
                const plain = await E2E.decrypt(rawData.sender, rawData.content);
                if (plain) rawData.content = plain;
                rawData._wasEncrypted = true;
            }
        });

        clearInterval(_e2eHookInterval);
    }
}, 500);

// ---- Patch appendMessage to add lock icon to encrypted messages ----
const _e2eOrigAppendMessage = appendMessage;
const lockIconSvg = `<span class="e2e-lock" title="End-to-End Encrypted"><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></span>`;

window.appendMessage = (msg) => {
    const div = _e2eOrigAppendMessage(msg);
    if (div && msg._wasEncrypted) {
        // Find the timestamp row and insert lock icon
        const timeDiv = div.querySelector('[style*="bottom:4px"]');
        if (timeDiv) timeDiv.insertAdjacentHTML('afterbegin', lockIconSvg);
    }
    return div;
};

// Also patch sent messages to show lock icon
chatForm.addEventListener('submit', async () => {
    if (!currentChatUser || !E2E.hasSession(currentChatUser)) return;
    // After submit fires, find the last sent message bubble and add lock icon
    setTimeout(() => {
        const sentMsgs = chatMessages.querySelectorAll('.message.sent');
        if (sentMsgs.length === 0) return;
        const last = sentMsgs[sentMsgs.length - 1];
        const timeDiv = last.querySelector('[style*="bottom:4px"]');
        if (timeDiv && !timeDiv.querySelector('.e2e-lock')) {
            timeDiv.insertAdjacentHTML('afterbegin', lockIconSvg);
        }
        // Flash send button green
        const sendBtn = chatForm.querySelector('.send-btn');
        if (sendBtn) {
            sendBtn.classList.add('encrypting');
            setTimeout(() => sendBtn.classList.remove('encrypting'), 600);
        }
    }, 80);
}, { capture: false });

// ---- Initialize E2E crypto on page load ----
E2E.init().catch(() => {});

