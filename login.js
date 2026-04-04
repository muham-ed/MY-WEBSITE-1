// ===== login.js =====
const messageDiv = document.getElementById('message');
const titleEl = document.getElementById('title');
const mainBtn = document.getElementById('mainBtn');
const toggleMode = document.getElementById('toggleMode');
const nameField = document.getElementById('nameField');
let isSignUp = false;

function showMessage(type, text) {
    messageDiv.style.display = 'block';
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
}

toggleMode.addEventListener('click', () => {
    isSignUp = !isSignUp;
    if (isSignUp) {
        titleEl.textContent = 'إنشاء حساب جديد';
        mainBtn.textContent = 'إنشاء الحساب';
        toggleMode.textContent = 'لديك حساب؟ سجل دخول';
        nameField.classList.add('show');
    } else {
        titleEl.textContent = 'تسجيل الدخول';
        mainBtn.textContent = 'دخول';
        toggleMode.textContent = 'ليس لديك حساب؟ سجل الآن';
        nameField.classList.remove('show');
    }
});

function validate() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    if (!email || !pass) { showMessage('error', '❌ الرجاء ملء جميع الحقول'); return false; }
    if (!email.includes('@')) { showMessage('error', '❌ بريد إلكتروني غير صالح'); return false; }
    if (pass.length < 6) { showMessage('error', '❌ كلمة المرور 6 أحرف على الأقل'); return false; }
    if (isSignUp && !document.getElementById('name').value.trim()) { showMessage('error', '❌ الرجاء إدخال الاسم'); return false; }
    return true;
}

function saveUser(user) {
    localStorage.setItem('userId', user.uid);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.displayName || document.getElementById('name')?.value?.trim() || 'مستخدم');
}

const errMsgs = {
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/invalid-credential': 'بيانات الدخول غير صالحة',
    'auth/email-already-in-use': 'البريد مستخدم بالفعل',
    'auth/too-many-requests': 'محاولات كثيرة، حاول لاحقاً',
    'auth/popup-closed-by-user': 'تم إغلاق نافذة التسجيل',
};

mainBtn.addEventListener('click', async () => {
    if (!validate()) return;
    mainBtn.disabled = true; mainBtn.textContent = 'جاري...';
    try {
        let cred;
        if (isSignUp) {
            cred = await auth.createUserWithEmailAndPassword(document.getElementById('email').value.trim(), document.getElementById('password').value.trim());
            await cred.user.updateProfile({ displayName: document.getElementById('name').value.trim() });
        } else {
            cred = await auth.signInWithEmailAndPassword(document.getElementById('email').value.trim(), document.getElementById('password').value.trim());
        }
        saveUser(cred.user);
        showMessage('success', '✅ تم بنجاح! جاري التوجيه...');
        setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    } catch (e) {
        mainBtn.disabled = false;
        mainBtn.textContent = isSignUp ? 'إنشاء الحساب' : 'دخول';
        showMessage('error', '❌ ' + (errMsgs[e.code] || e.message));
    }
});

document.getElementById('googleBtn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const btn = document.getElementById('googleBtn');
    btn.disabled = true; btn.textContent = 'جاري...';
    auth.signInWithPopup(provider)
        .then(r => { saveUser(r.user); showMessage('success','✅ تم! جاري التوجيه...'); setTimeout(()=>{window.location.href='index.html';},1500); })
        .catch(e => {
            btn.disabled = false;
            btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" width="20" alt="Google"> الدخول بواسطة Google';
            showMessage('error','❌ ' + (errMsgs[e.code] || e.message));
        });
});

document.addEventListener('keypress', e => { if (e.key === 'Enter') mainBtn.click(); });

auth.onAuthStateChanged(user => {
    if (user && window.location.pathname.includes('login')) {
        showMessage('info','👋 أنت مسجل الدخول! جاري التوجيه...');
        setTimeout(()=>{window.location.href='index.html';},2000);
    }
});

window.addEventListener('load', () => {
    setTimeout(()=>{ showMessage('info','👋 مرحباً! سجل دخولك لمتابعة تقدمك'); },600);
});