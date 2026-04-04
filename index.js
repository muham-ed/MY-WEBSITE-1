// ===== Firebase Config =====
const firebaseConfig = {
    apiKey: "AIzaSyDG3CAjOyNDqNF5ISkUnFz5ZGHlSwCicq8",
    authDomain: "my-website-1-93d68.firebaseapp.com",
    projectId: "my-website-1-93d68",
    storageBucket: "my-website-1-93d68.firebasestorage.app",
    messagingSenderId: "811350331643",
    appId: "1:811350331643:web:4fa42821093d629d1f605e",
    measurementId: "G-P4J6584N2T"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ===== متغيرات عامة =====
let completedSteps = JSON.parse(localStorage.getItem('completedSteps')) || [];

// ===== عرض معلومات المستخدم =====
function displayUserInfo() {
    const userWelcome = document.getElementById('userWelcome');
    if (!userWelcome) return;
    
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (userId && userName) {
        userWelcome.style.display = 'inline-flex';
        userWelcome.innerHTML = `
            <i class="fas fa-user-circle"></i>
            مرحباً بك يا ${userName} 👋
            <button onclick="logout()" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
            </button>
        `;
    }
}

// ===== تسجيل الخروج =====
window.logout = async function() {
    try {
        await auth.signOut();
        localStorage.clear();
        window.location.reload();
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
    }
};

// ===== تحميل التقدم =====
function loadProgress() {
    const totalSteps = document.querySelectorAll('.path-item').length;
    let completedCount = 0;

    document.querySelectorAll('.path-item').forEach(item => {
        const step = parseInt(item.getAttribute('data-step'));
        if (completedSteps.includes(step)) {
            item.classList.add('completed');
            completedCount++;
        } else {
            item.classList.remove('completed');
        }
    });

    const percent = totalSteps ? Math.round((completedCount / totalSteps) * 100) : 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${percent}% مكتمل`;
}

// ===== إكمال مرحلة =====
window.completeStep = function(step) {
    if (!completedSteps.includes(step)) {
        completedSteps.push(step);
        localStorage.setItem('completedSteps', JSON.stringify(completedSteps));
        loadProgress();
        
        // تأثير confetti
        if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        
        alert(`🎉 تهانينا! أكملت المرحلة ${step}`);
    }
};

// ===== إعادة تعيين التقدم =====
window.resetProgress = function() {
    if (confirm('⚠️ هل أنت متأكد من إعادة تعيين تقدمك؟')) {
        localStorage.removeItem('completedSteps');
        completedSteps = [];
        loadProgress();
        alert('✅ تم إعادة تعيين التقدم بنجاح');
    }
};

// ===== دوال التحميل =====
window.downloadPlan = function() {
    const content = `خطة التعلم - مسار التطور التقني
تم إعدادها بواسطة محمد علاء
📌 للتوظيف: https://mostaql.com/u/MohamedAlaa2003/portfolio

1. أساسيات الحاسوب     (2-4 أسابيع)
2. أساسيات البرمجة     (4-8 أسابيع)
3. Git & GitHub        (1-2 أسبوع)
4. تطوير الويب         (8-12 أسبوع)
5. قواعد البيانات      (4-6 أسابيع)
6. تحليل البيانات      (6-10 أسابيع)
7. علم البيانات        (10-14 أسبوع)
8. مشاريع عملية        (مستمر)`;
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = 'خطة_التعلم_محمد_علاء.txt';
    a.click();
};

window.downloadSchedule = function() {
    const content = `جدول التعلم الأسبوعي - مسار التطور التقني
تم إعدادها بواسطة محمد علاء
📌 للتوظيف: https://mostaql.com/u/MohamedAlaa2003/portfolio

الأحد    ▸ نظرية + قراءة   (ساعتان)
الاثنين  ▸ تمارين + كود     (ساعتان)
الثلاثاء ▸ مراجعة           (ساعة)
الأربعاء ▸ مشروع             (ساعتان)
الخميس  ▸ تمارين إضافية    (ساعة)
الجمعة  ▸ اختبار ذاتي      (ساعة)
السبت   ▸ راحة / محتوى خفيف

المجموع: 9-10 ساعات أسبوعياً`;
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = 'جدول_التعلم_محمد_علاء.txt';
    a.click();
};

// ===== فلترة الدورات =====
function initFilters() {
    const filterBtns = document.querySelectorAll('.programs-filter .filter-btn');
    const cards = document.querySelectorAll('.program-card');
    
    if (!filterBtns.length) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ===== الأسئلة الشائعة =====
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', function() {
            const item = this.parentElement;
            document.querySelectorAll('.faq-item').forEach(i => {
                if (i !== item) i.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });
}

// ===== Firebase Auth State =====
auth.onAuthStateChanged((user) => {
    if (user) {
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userName', user.displayName || 'مستخدم');
        localStorage.setItem('userEmail', user.email);
        displayUserInfo();
    } else {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        const userWelcome = document.getElementById('userWelcome');
        if (userWelcome) userWelcome.style.display = 'none';
    }
});

// ===== تأثيرات الظهور عند التمرير =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.path-item, .stat-card, .program-card, .career-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== التهيئة =====
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    initFilters();
    initFAQ();
    initScrollAnimations();
    
    if (localStorage.getItem('userId')) {
        displayUserInfo();
    }
    
    // زر العودة للأعلى
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        window.addEventListener('scroll', () => {
            backBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});