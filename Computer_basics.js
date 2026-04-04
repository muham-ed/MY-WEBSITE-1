// ===== إعدادات Firebase الصحيحة =====
    const firebaseConfig = {
        apiKey: "AIzaSyDG3CAjOyNDqNF5ISkUnFz5ZGHlSwCicq8",
        authDomain: "my-website-1-93d68.firebaseapp.com",
        projectId: "my-website-1-93d68",
        storageBucket: "my-website-1-93d68.firebasestorage.app",
        messagingSenderId: "811350331643",
        appId: "1:811350331643:web:4fa42821093d629d1f605e",
        measurementId: "G-P4J6584N2T"
    };

    // تهيئة Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // ===== متغيرات عامة =====
    let currentUserId = localStorage.getItem('userId');
    let userName = localStorage.getItem('userName') || 'مستخدم';
    let userEmail = localStorage.getItem('userEmail');
    let completedLessons = JSON.parse(localStorage.getItem('comp_completedLessons')) || [];
    let earnedBadges = JSON.parse(localStorage.getItem('comp_earnedBadges')) || [];
    let quizHighScore = parseInt(localStorage.getItem('comp_quizHighScore')) || 0;
    let startTime = parseInt(localStorage.getItem('comp_studyStartTime')) || Date.now();
    let totalStudyTime = parseInt(localStorage.getItem('comp_totalStudyTime')) || 0;

    // ===== التحقق من حالة المصادقة =====
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUserId = user.uid;
            userName = user.displayName || 'مستخدم';
            userEmail = user.email;
            
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('userName', userName);
            localStorage.setItem('userEmail', userEmail);
            
            displayUserInfo();
            loadUserProgress();
        } else {
            currentUserId = null;
            userName = null;
            userEmail = null;
            
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            
            document.getElementById('userInfoCard').style.display = 'none';
        }
    });

    // ===== عرض معلومات المستخدم =====
    function displayUserInfo() {
        if (currentUserId) {
            document.getElementById('userInfoCard').style.display = 'flex';
            document.getElementById('displayName').textContent = userName || 'مستخدم';
            document.getElementById('displayEmail').textContent = userEmail || '';
        }
    }

    // ===== تسجيل الخروج =====
    async function logout() {
        try {
            await auth.signOut();
            localStorage.clear();
            window.location.reload();
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
        }
    }

    // ===== تحميل تقدم المستخدم من Firebase =====
    async function loadUserProgress() {
        if (!currentUserId) return;
        
        try {
            const userRef = db.collection('users').doc(currentUserId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.completedCourses && userData.completedCourses.computer_basics) {
                    completedLessons = userData.completedCourses.computer_basics;
                    localStorage.setItem('comp_completedLessons', JSON.stringify(completedLessons));
                    
                    updateProgress();
                    updateLessonButtons();
                    updateStats();
                }
            }
        } catch (error) {
            console.error('خطأ في تحميل التقدم:', error);
        }
    }

    // ===== حفظ تقدم المستخدم في Firebase =====
    async function saveProgressToFirebase() {
        if (!currentUserId) return;
        
        try {
            const userRef = db.collection('users').doc(currentUserId);
            await userRef.set({
                completedCourses: {
                    computer_basics: completedLessons
                },
                progress: {
                    computer_basics: (completedLessons.length / 6) * 100
                }
            }, { merge: true });
        } catch (error) {
            console.error('خطأ في حفظ التقدم:', error);
        }
    }

    // ===== تحديث الإحصائيات =====
    function updateStats() {
        document.getElementById('completedLessonsCount').innerText = completedLessons.length;
        document.getElementById('earnedBadgesCount').innerText = earnedBadges.length;
        document.getElementById('quizHighScore').innerText = quizHighScore;
        
        const now = Date.now();
        const sessionTime = Math.floor((now - startTime) / 60000);
        document.getElementById('studyTime').innerText = totalStudyTime + sessionTime;
    }

    // ===== دوال الدروس =====
    function toggleLesson(lessonId) {
        const index = completedLessons.indexOf(lessonId);
        
        if (index === -1) {
            completedLessons.push(lessonId);
            celebrateLesson(lessonId);
            totalStudyTime += 5; // إضافة 5 دقائق لكل درس
            localStorage.setItem('comp_totalStudyTime', totalStudyTime);
        } else {
            completedLessons.splice(index, 1);
        }
        
        localStorage.setItem('comp_completedLessons', JSON.stringify(completedLessons));
        saveProgressToFirebase();
        updateProgress();
        updateLessonButtons();
        checkBadges();
        updateStats();
    }

    function celebrateLesson(lessonId) {
        const lessonNames = {
            1: 'مقدمة في الحاسوب',
            2: 'وحدة المعالجة (CPU)',
            3: 'الذاكرة العشوائية (RAM)',
            4: 'وحدات التخزين (SSD/HDD)',
            5: 'الشاشة (Monitor)',
            6: 'اختصارات الكيبورد'
        };
        
        showReward('أحسنت!', `لقد أكملت درس: ${lessonNames[lessonId]}`);
        celebrate();
    }

    function celebrate() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    function showReward(title, desc) {
        document.getElementById('rewardTitle').innerText = title;
        document.getElementById('rewardDesc').innerText = desc;
        document.getElementById('rewardModal').classList.add('show');
        
        // إخفاء المودال تلقائياً بعد 3 ثواني
        setTimeout(() => {
            document.getElementById('rewardModal').classList.remove('show');
        }, 3000);
    }

    function closeReward() {
        document.getElementById('rewardModal').classList.remove('show');
    }

    function updateProgress() {
        const percent = (completedLessons.length / 6) * 100;
        document.getElementById('progressBar').style.width = percent + '%';
        document.getElementById('progressPercent').textContent = Math.round(percent) + '%';
        document.getElementById('completedCount').textContent = completedLessons.length + '/6';
        document.getElementById('completedCount2').textContent = completedLessons.length;
        document.getElementById('remainingLessons').textContent = 6 - completedLessons.length;
        
        for (let i = 1; i <= 6; i++) {
            const dot = document.getElementById(`lessonDot${i}`);
            if (dot) {
                if (completedLessons.includes(i)) {
                    dot.innerHTML = '●';
                    dot.style.color = '#10b981';
                    dot.classList.add('completed');
                } else {
                    dot.innerHTML = '○';
                    dot.style.color = '#4cc9f0';
                    dot.classList.remove('completed');
                }
            }
        }
    }

    function updateLessonButtons() {
        for (let i = 1; i <= 6; i++) {
            const btn = document.getElementById(`lesson-btn-${i}`);
            if (btn) {
                if (completedLessons.includes(i)) {
                    btn.innerHTML = '<i class="fas fa-check-circle"></i> تم';
                    btn.style.background = '#10b981';
                    btn.style.borderColor = '#10b981';
                    btn.classList.add('completed');
                } else {
                    btn.innerHTML = '<i class="fas fa-circle"></i> إكمال';
                    btn.style.background = 'rgba(255,255,255,0.1)';
                    btn.style.borderColor = '#4cc9f0';
                    btn.classList.remove('completed');
                }
            }
        }
    }

    function resetCourse() {
        if (confirm('⚠️ هل أنت متأكد من إعادة تعيين تقدم الدورة؟')) {
            completedLessons = [];
            earnedBadges = [];
            quizHighScore = 0;
            totalStudyTime = 0;
            startTime = Date.now();
            
            localStorage.setItem('comp_completedLessons', JSON.stringify(completedLessons));
            localStorage.setItem('comp_earnedBadges', JSON.stringify(earnedBadges));
            localStorage.setItem('comp_quizHighScore', quizHighScore);
            localStorage.setItem('comp_totalStudyTime', totalStudyTime);
            localStorage.setItem('comp_studyStartTime', startTime);
            
            saveProgressToFirebase();
            updateProgress();
            updateLessonButtons();
            updateBadgesDisplay();
            document.getElementById('certificateSection').style.display = 'none';
            showReward('تم', '✅ تم إعادة تعيين الدورة');
        }
    }

    // ===== التحقق من الشارات =====
    function checkBadges() {
        if (completedLessons.length >= 3 && !earnedBadges.includes('beginner')) {
            earnedBadges.push('beginner');
            showReward('إنجاز جديد!', 'حصلت على شارة مبتدئ');
        }
        
        if (completedLessons.length === 6 && !earnedBadges.includes('intermediate')) {
            earnedBadges.push('intermediate');
            showReward('إنجاز جديد!', 'حصلت على شارة متوسط');
        }
        
        if (completedLessons.length === 6 && !earnedBadges.includes('expert')) {
            earnedBadges.push('expert');
            showReward('تهانينا! 🏆', 'أكملت جميع الدروس!');
            showCertificate();
        }
        
        localStorage.setItem('comp_earnedBadges', JSON.stringify(earnedBadges));
        updateBadgesDisplay();
    }

    function updateBadgesDisplay() {
        const badges = document.querySelectorAll('.badge-item');
        badges.forEach(badge => {
            const badgeType = badge.dataset.badge;
            if (earnedBadges.includes(badgeType) || 
                (badgeType === 'quiz-master' && quizHighScore === 10)) {
                badge.classList.add('earned');
            }
        });
    }

    // ===== شريط البحث =====
    document.getElementById('searchLessons').addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('.lesson-card').forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const topics = card.textContent.toLowerCase();
            if (title.includes(searchTerm) || topics.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // ===== تحميل الدروس =====
    function downloadLesson(lessonNumber) {
        // إذا كان المستخدم يريد تحميل الدرس الأول (رقم 1)
        if (lessonNumber === 1) {
            // محاولة تحميل ملف البوربوينت
            const link = document.createElement('a');
            link.href = 'اول درس.pptx'; // تأكد أن الملف موجود في نفس المسار
            link.download = 'الدرس_الاول_مقدمة_في_الحاسوب.pptx'; // الاسم الذي سيظهر عند التحميل
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showReward('تم التحميل', '✅ تم تحميل ملف العرض التقديمي للدرس الأول');
            return; // نخرج من الدالة حتى لا ينفذ الكود القديم
        }
        
        // للدروس الأخرى، استمر في النص القديم
        const lessons = {
            2: { title: "وحدة المعالجة CPU", content: "الدرس الثاني: وحدة المعالجة المركزية (CPU)\n\nدور المعالج كـ 'العقل المدبر'\nالفرق بين عدد الأنوية والسرعة (GHz vs Cores)\nمقارنة بين Intel, AMD, Apple Silicon\nاختيار المعالج المناسب لاستخدامك" },
            3: { title: "الذاكرة العشوائية RAM", content: "الدرس الثالث: الذاكرة العشوائية (RAM)\n\nمفهوم 'مساحة العمل المؤقتة'\nالفرق بين DDR4 و DDR5\n8GB vs 16GB vs 32GB - أيهما تختار؟\nتجربة عملية: فتح برامج متعددة" },
            4: { title: "وحدات التخزين SSD HDD", content: "الدرس الرابع: وحدات التخزين (SSD/HDD)\n\nالفرق بين التخزين المؤقت والدائم\nمقارنة بين SSD و HDD (سرعة - سعر - سعة)\nNVMe vs SATA\nمشروع: حساب سرعة نقل الملفات" },
            5: { title: "الشاشة Monitor", content: "الدرس الخامس: الشاشة (Monitor)\n\nالدقة: Full HD, 4K, 8K\nمعدل التحديث 60Hz - 240Hz وتأثيره\nIPS vs OLED vs TN\nتجربة مقارنة الشاشات" },
            6: { title: "اختصارات الكيبورد", content: "الدرس السادس: اختصارات لوحة المفاتيح\n\nأهم الاختصارات: Ctrl + C, Ctrl + V, Ctrl + Z\nمحرر تجريبي للتدريب العملي\nنصائح لتسريع العمل\nمشروع: كتابة نص بالاختصارات فقط" }
        };
        
        const lesson = lessons[lessonNumber];
        const content = `${lesson.content}\n\n📥 تم التحميل من موقع Mohamed Alaa - مسار التطور التقني\nhttps://muham-ed.github.io/MY-WEBSITE-1/Computer_basics.html`;
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `الدرس_${lessonNumber}_${lesson.title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showReward('تم التحميل', `✅ تم تحميل الدرس ${lessonNumber}`);
    }

    // ===== المحرر التفاعلي =====
    function runPractice() {
        const editor = document.getElementById('practiceEditor');
        const output = document.getElementById('practiceOutput');
        const text = editor.innerText || editor.textContent;
        
        let result = '';
        if (text.includes('Ctrl + C') || text.includes('Ctrl + V')) {
            result = '✅ تم محاكاة النسخ واللصق بنجاح!';
            celebrate();
        } else {
            result = `📝 النص الذي كتبته:\n--------------------\n${text}\n--------------------\n✅ تم التنفيذ بنجاح`;
        }
        
        output.innerHTML = result;
    }

    function copyPractice() {
        const editor = document.getElementById('practiceEditor');
        const text = editor.innerText || editor.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showReward('تم النسخ', '✅ تم نسخ النص');
        });
    }

    function resetPractice() {
        const editor = document.getElementById('practiceEditor');
        const output = document.getElementById('practiceOutput');
        editor.innerHTML = 'مرحباً بكم في دورة أساسيات الحاسوب\nهذا نص تجريبي لتجربة الاختصارات\nجرب تستخدم Ctrl + C و Ctrl + V';
        output.innerHTML = '// النتيجة هتظهر هنا بعد ما تضغط تشغيل';
    }

    // ===== نظام الاختبار =====
    const quizQuestions = [
        { q: "ما هي وظيفة CPU؟", a: ["التخزين", "المعالجة", "العرض", "الإدخال"], c: 1 },
        { q: "ما الفرق بين RAM و HDD؟", a: ["RAM أسرع", "HDD أسرع", "نفس الشيء", "لا فرق"], c: 0 },
        { q: "ما اختصار نسخ؟", a: ["Ctrl+V", "Ctrl+C", "Ctrl+X", "Ctrl+Z"], c: 1 },
        { q: "ما اختصار لصق؟", a: ["Ctrl+V", "Ctrl+C", "Ctrl+X", "Ctrl+Z"], c: 0 },
        { q: "أيها أسرع SSD أم HDD؟", a: ["SSD", "HDD", "نفس السرعة", "يعتمد"], c: 0 },
        { q: "ما وظيفة RAM؟", a: ["تخزين دائم", "ذاكرة مؤقتة", "معالجة", "عرض"], c: 1 },
        { q: "ما اختصار تراجع؟", a: ["Ctrl+Y", "Ctrl+Z", "Ctrl+A", "Ctrl+S"], c: 1 },
        { q: "أي شركة تصنع معالجات؟", a: ["Intel", "NVIDIA", "Samsung", "Dell"], c: 0 },
        { q: "ما معنى 4K في الشاشات؟", a: ["الدقة", "السرعة", "الحجم", "الوزن"], c: 0 },
        { q: "ما اختصار حفظ؟", a: ["Ctrl+P", "Ctrl+S", "Ctrl+F", "Ctrl+E"], c: 1 }
    ];

    let currentQuiz = 0;
    let quizScore = 0;

    function loadQuiz() {
        if (currentQuiz >= quizQuestions.length) {
            showQuizResults();
            return;
        }

        const q = quizQuestions[currentQuiz];
        document.getElementById('quizQuestion').innerText = `سؤال ${currentQuiz + 1}/${quizQuestions.length}: ${q.q}`;
        document.getElementById('quizScore').innerText = `${quizScore}/${quizQuestions.length}`;
        
        const optionsDiv = document.getElementById('quizOptions');
        optionsDiv.innerHTML = '';
        
        q.a.forEach((opt, idx) => {
            const div = document.createElement('div');
            div.className = 'quiz-option';
            div.innerHTML = `<span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span><span>${opt}</span>`;
            div.onclick = () => selectQuizOption(idx);
            optionsDiv.appendChild(div);
        });

        document.getElementById('quizProgress').style.width = ((currentQuiz + 1) / quizQuestions.length * 100) + '%';
    }

    function selectQuizOption(index) {
        const q = quizQuestions[currentQuiz];
        const options = document.querySelectorAll('.quiz-option');
        
        options.forEach(opt => opt.classList.remove('selected'));
        options[index].classList.add('selected');
        
        setTimeout(() => {
            if (index === q.c) {
                quizScore++;
                options[index].classList.add('correct');
                celebrate();
            } else {
                options[index].classList.add('wrong');
                options[q.c].classList.add('correct');
            }
            
            currentQuiz++;
            document.getElementById('quizScore').innerText = `${quizScore}/${quizQuestions.length}`;
            setTimeout(loadQuiz, 1500);
        }, 500);
    }

    function showQuizResults() {
        const percentage = (quizScore / quizQuestions.length) * 100;
        
        if (quizScore > quizHighScore) {
            quizHighScore = quizScore;
            localStorage.setItem('comp_quizHighScore', quizHighScore);
        }
        
        if (quizScore === quizQuestions.length && !earnedBadges.includes('quiz-master')) {
            earnedBadges.push('quiz-master');
            localStorage.setItem('comp_earnedBadges', JSON.stringify(earnedBadges));
            showReward('عبقري! 🧠', 'أجبت على جميع الأسئلة بشكل صحيح');
        }
        
        const resultHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 3rem;">${percentage >= 70 ? '🎉' : '📚'}</div>
                <div style="font-size: 2rem; color: ${percentage >= 70 ? '#10b981' : '#ef4444'};">${quizScore}/${quizQuestions.length}</div>
                <div style="font-size: 1.2rem; margin: 20px;">${percentage.toFixed(1)}%</div>
                <button onclick="resetQuiz()" class="lesson-btn complete-lesson-btn" style="background: #4361ee; width:auto; padding:10px 30px;">
                    <i class="fas fa-redo-alt"></i> حاول مرة أخرى
                </button>
            </div>
        `;
        
        document.getElementById('quizQuestion').innerHTML = '🎯 انتهى الاختبار!';
        document.getElementById('quizOptions').innerHTML = resultHTML;
        updateBadgesDisplay();
    }

    function resetQuiz() {
        currentQuiz = 0;
        quizScore = 0;
        loadQuiz();
    }

    // ===== إنشاء وتحميل الملخص =====
    document.getElementById('generateNotesBtn').addEventListener('click', function(e) {
        e.preventDefault();
        
        const summary = `==========================================
📚 ملخص دورة أساسيات الحاسوب 📚
==========================================

إعداد: Mohamed Alaa

================= المكونات الأساسية =================

1️⃣ وحدة المعالجة المركزية (CPU):
• عقل الكمبيوتر
• سرعة تصل إلى 5 جيجاهيرتز
• Intel, AMD, Apple Silicon

2️⃣ الذاكرة العشوائية (RAM):
• مساحة العمل المؤقتة
• 8GB للمستخدم العادي، 16-32GB للمحترفين
• DDR4, DDR5

3️⃣ وحدات التخزين:
• SSD: سريع (500-7000 MB/s)
• HDD: سعات كبيرة (1-20TB)

4️⃣ الشاشة:
• Full HD, 4K, 8K
• معدل تحديث 60-240Hz

================= أهم الاختصارات =================

Ctrl + C : نسخ
Ctrl + V : لصق
Ctrl + X : قص
Ctrl + Z : تراجع
Ctrl + Y : إعادة
Ctrl + A : تحديد الكل
Ctrl + S : حفظ
Ctrl + P : طباعة
Ctrl + F : بحث
Win + E : مستكشف الملفات

==========================================
Mohamed Alaa - مسار التطور التقني
https://muham-ed.github.io/MY-WEBSITE-1/
==========================================`;
        
        const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ملخص_أساسيات_الحاسوب.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showReward('تم', '✅ تم إنشاء وتحميل الملخص');
    });

    // ===== الأسئلة الشائعة =====
    function toggleFaq(id) {
        const faqItem = event.currentTarget;
        faqItem.classList.toggle('active');
    }

    // ===== تقييم الدورة =====
    function rateCourse(stars) {
        document.getElementById('ratingMessage').innerHTML = `شكراً لتقييمك! (${stars} نجوم)`;
        localStorage.setItem('comp_courseRating', stars);
        
        const allStars = document.querySelectorAll('.star');
        allStars.forEach((star, index) => {
            if (index < stars) {
                star.style.opacity = '1';
            } else {
                star.style.opacity = '0.5';
            }
        });
    }

    // ===== الشهادة =====
    function showCertificate() {
        document.getElementById('certificateSection').style.display = 'block';
        
        const name = localStorage.getItem('userName') || 'محمد علاء';
        document.getElementById('certificateName').innerText = name;
        
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('certificateDate').innerText = today.toLocaleDateString('ar-EG', options);
    }

    function downloadCertificate() {
        const name = localStorage.getItem('userName') || 'محمد علاء';
        const today = new Date().toLocaleDateString('ar-EG');
        const content = `
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║              مسار التطور التقني                          ║
║         Mohamed Alaa - Technical Development Path        ║
║                                                          ║
║                    شهادة إتمام                           ║
║               Certificate of Completion                  ║
║                                                          ║
║   تمنح هذه الشهادة إلى                                    ║
║                                                          ║
║              ${name}                                      ║
║                                                          ║
║   لإتمامه بنجاح دورة                                    ║
║                                                          ║
║         "أساسيات الحاسوب - Computer Basics"              ║
║                                                          ║
║   6 دروس | 5 مشاريع عملية                                ║
║                                                          ║
║   التاريخ: ${today}                                       ║
║                                                          ║
║                                   محمد علاء               ║
║                                   Mohamed Alaa           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

📌 رابط الدورة: https://muham-ed.github.io/MY-WEBSITE-1/Computer_basics.html
        `;
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `شهادة_${name.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showReward('تم التحميل', '✅ تم تحميل الشهادة');
    }

    // ===== مشاركة الإنجاز =====
    function shareAchievement() {
        const text = `🎓 لقد أكملت ${completedLessons.length} دروس في دورة أساسيات الحاسوب على منصة مسار التطور التقني!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }

    // ===== الوضع ليلي/نهاري =====
    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        const btn = document.getElementById('themeToggle');
        if (document.body.classList.contains('light-mode')) {
            btn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('comp_theme', 'light');
        } else {
            btn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('comp_theme', 'dark');
        }
    }

    // ===== تحميل العرض التقديمي (لزر العرض الرئيسي) =====
    document.getElementById('downloadPptBtn').addEventListener('click', function(e) {
        e.preventDefault();
        
        // تحميل ملف البوربوينت مباشرة
        const link = document.createElement('a');
        link.href = 'اول درس.pptx';
        link.download = 'الدرس_الاول_مقدمة_في_الحاسوب.pptx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showReward('تم التحميل', '✅ تم تحميل ملف العرض التقديمي');
    });

    // ===== زر العودة للأعلى =====
    window.addEventListener('scroll', function() {
        const btn = document.getElementById('backToTop');
        btn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
    });

    // ===== حفظ وقت البدء =====
    localStorage.setItem('comp_studyStartTime', startTime);

    // ===== تهيئة الصفحة =====
    document.addEventListener('DOMContentLoaded', function() {
        displayUserInfo();
        updateProgress();
        updateLessonButtons();
        updateBadgesDisplay();
        updateStats();
        
        const savedRating = localStorage.getItem('comp_courseRating');
        if (savedRating) {
            rateCourse(parseInt(savedRating));
        }
        
        const savedTheme = localStorage.getItem('comp_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        setTimeout(loadQuiz, 500);
        
        if (completedLessons.length === 6) {
            showCertificate();
        }
        
        setInterval(() => {
            const now = Date.now();
            const sessionTime = Math.floor((now - startTime) / 60000);
            document.getElementById('studyTime').innerText = totalStudyTime + sessionTime;
        }, 60000);
    });

    // ===== تحميل مشاريع الدورة =====
    window.downloadProject = function(key, name) {
        const projects = {
            'laptop-vs-desktop': `مشروع: مقارنة أداء لابتوب ومكتبي
==========================================

المهمة: قارن بين جهاز لابتوب وجهاز مكتبي

📋 جدول المقارنة:
┌─────────────┬──────────────┬──────────────┐
│ المعيار     │ اللابتوب     │ المكتبي      │
├─────────────┼──────────────┼──────────────┤
│ السعر       │ أغلى         │ أرخص        │
│ الأداء      │ متوسط        │ أعلى         │
│ التنقل      │ ممتاز        │ ثابت         │
│ الترقية     │ محدودة       │ سهلة         │
│ عمر البطارية│ 4-10 ساعات  │ لا يوجد      │
│ الشاشة      │ مدمجة        │ خارجية       │
└─────────────┴──────────────┴──────────────┘

📝 خطوات المشروع:
1. اكتب مواصفات كلا الجهازين
2. ابحث عن الأسعار في السوق المحلي
3. حدد الاستخدام المناسب لكل جهاز
4. اكتب توصيتك النهائية مع السبب

✅ أرسل نتائجك عبر واتساب: +201060828627`,

            'ram-test': `مشروع: اختبار RAM والتخزين
==========================================

🧪 التجربة العملية:

الخطوة 1 - اختبار RAM:
• افتح Task Manager (Ctrl+Shift+Esc)
• اذهب لتبويب Performance
• انظر استخدام الذاكرة مع 1 برنامج مفتوح
• ثم افتح 5 برامج وقارن
• سجل النتائج

الخطوة 2 - اختبار التخزين:
• افتح برنامج CrystalDiskMark (مجاني)
• شغّل اختبار السرعة
• سجل: سرعة القراءة Sequential
• سجل: سرعة الكتابة Sequential

📊 سجّل نتائجك:
┌──────────────────┬──────────┐
│ RAM المستخدمة   │          │
│ أقصى استخدام RAM│          │
│ سرعة القراءة   │          │
│ سرعة الكتابة   │          │
└──────────────────┴──────────┘

✅ قارن نتائجك مع المعدلات الطبيعية:
• SSD جيد: 500+ MB/s
• HDD عادي: 80-160 MB/s`,

            'shortcuts': `مشروع: دليل الاختصارات الشخصي
==========================================

⌨️ أهم اختصارات Windows:

📁 إدارة الملفات:
Ctrl+C     → نسخ
Ctrl+X     → قص
Ctrl+V     → لصق
Ctrl+Z     → تراجع
Ctrl+Y     → إعادة
Ctrl+A     → تحديد الكل
Ctrl+S     → حفظ
Delete     → حذف للسلة
Shift+Del  → حذف نهائي

🪟 إدارة النوافذ:
Win+D      → إظهار سطح المكتب
Win+E      → فتح File Explorer
Win+L      → قفل الشاشة
Win+←/→   → تقسيم الشاشة
Alt+Tab    → التبديل بين النوافذ
Alt+F4     → إغلاق البرنامج

🌐 تصفح الإنترنت:
Ctrl+T     → تبويب جديد
Ctrl+W     → إغلاق التبويب
Ctrl+R     → تحديث الصفحة
Ctrl+F     → بحث في الصفحة
Ctrl+L     → الذهاب لشريط العنوان
Ctrl+H     → سجل التصفح

📝 تحرير النصوص:
Ctrl+B     → غامق
Ctrl+I     → مائل
Ctrl+U     → تسطير
Ctrl+Home  → بداية المستند
Ctrl+End   → نهاية المستند

✅ تدرّب على 3 اختصارات كل يوم!`,

            'specs-analysis': `مشروع: تحليل مواصفات جهازك
==========================================

🔍 كيف تعرف مواصفات جهازك:

الطريقة 1 - Windows:
• اضغط Win+R
• اكتب: msinfo32
• اضغط OK
• ستجد كل المواصفات

الطريقة 2 - Settings:
• Settings → System → About
• ستجد: المعالج، الذاكرة، النظام

📋 سجّل مواصفات جهازك:
┌─────────────────┬──────────────────┐
│ المواصفة        │ جهازك            │
├─────────────────┼──────────────────┤
│ المعالج (CPU)  │                  │
│ سرعة المعالج   │                  │
│ عدد الأنوية    │                  │
│ الذاكرة (RAM)  │                  │
│ نظام التشغيل   │                  │
│ سعة التخزين    │                  │
│ بطاقة الرسومات │                  │
└─────────────────┴──────────────────┘

📊 تقييم جهازك:
• 4GB RAM = مناسب للمكتب فقط
• 8GB RAM = مناسب للاستخدام العام
• 16GB+ RAM = مثالي للبرمجة والتصميم`,

            'home-network': `مشروع: إعداد شبكة منزلية
==========================================

🌐 خطوات إعداد الراوتر:

المرحلة 1 - التوصيل الفيزيائي:
□ وصّل كابل الإنترنت من الموديم للراوتر (WAN Port)
□ وصّل الراوتر بالكهرباء
□ انتظر 2-3 دقائق للتشغيل

المرحلة 2 - الدخول للإعدادات:
□ افتح المتصفح
□ اكتب: 192.168.1.1 أو 192.168.0.1
□ Username: admin | Password: admin
   (راجع الملصق خلف الراوتر)

المرحلة 3 - الإعدادات الأساسية:
□ غيّر اسم الشبكة (SSID) لاسم واضح
□ غيّر كلمة مرور الواي فاي لكلمة قوية
□ غيّر كلمة مرور الراوتر الافتراضية
□ اختر تشفير WPA3 أو WPA2

المرحلة 4 - الأمان:
□ فعّل Firewall
□ أخفِ اسم الشبكة (Hide SSID) - اختياري
□ راجع الأجهزة المتصلة

📝 سجّل معلومات شبكتك:
اسم الشبكة:     ________________
كلمة المرور:   ________________
IP الراوتر:    ________________
DNS الأساسي:   ________________`
        };

        const text = projects[key] || 'المحتوى قيد الإعداد';
        const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `مشروع_${name}.txt`;
        a.click();
    };

    // ===== تحميل جدول الاختصارات =====
    window.downloadShortcuts = function() {
        window.downloadProject('shortcuts', 'اختصارات الكيبورد');
    };
    // ===== استكمال الدوال الناقصة =====

// دالة toggleFaq للأسئلة الشائعة
window.toggleFaq = function(id) {
    const faqItem = event.currentTarget;
    faqItem.classList.toggle('active');
};

// دالة rateCourse للتقييم
window.rateCourse = function(stars) {
    document.getElementById('ratingMessage').innerHTML = `شكراً لتقييمك! (${stars} نجوم)`;
    localStorage.setItem('comp_courseRating', stars);
    
    const allStars = document.querySelectorAll('.star');
    allStars.forEach((star, index) => {
        if (index < stars) {
            star.style.opacity = '1';
        } else {
            star.style.opacity = '0.5';
        }
    });
};

// دالة resetQuiz لإعادة الاختبار
window.resetQuiz = function() {
    currentQuiz = 0;
    quizScore = 0;
    loadQuiz();
};

// دالة closeReward لإغلاق مودال المكافآت
window.closeReward = function() {
    document.getElementById('rewardModal').classList.remove('show');
};

// دالة shareAchievement لمشاركة الإنجاز
window.shareAchievement = function() {
    const completedCount = document.getElementById('completedLessonsCount').innerText;
    const text = `🎓 لقد أكملت ${completedCount} دروس في دورة أساسيات الحاسوب على منصة مسار التطور التقني!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

// دالة downloadCertificate لتحميل الشهادة
window.downloadCertificate = function() {
    const name = localStorage.getItem('userName') || 'محمد علاء';
    const today = new Date().toLocaleDateString('ar-EG');
    const content = `شهادة إتمام دورة أساسيات الحاسوب\n\nالطالب: ${name}\nالتاريخ: ${today}\n\nتم إكمال 6 دروس بنجاح\n\nمحمد علاء - مسار التطور التقني`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `شهادة_${name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showReward('تم التحميل', '✅ تم تحميل الشهادة');
};

// دالة downloadProject لتحميل المشاريع
window.downloadProject = function(key, name) {
    const projects = {
        'laptop-vs-desktop': 'مشروع مقارنة أداء لابتوب ومكتبي...',
        'ram-test': 'مشروع اختبار RAM والتخزين...',
        'shortcuts': 'مشروع دليل الاختصارات الشخصي...',
        'specs-analysis': 'مشروع تحليل مواصفات جهازك...',
        'home-network': 'مشروع إعداد شبكة منزلية...'
    };
    
    const text = projects[key] || `مشروع: ${name}\n\nالمحتوى قيد الإعداد.\n\nسيتم إضافته قريباً.`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `مشروع_${name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showReward('تم التحميل', `✅ تم تحميل مشروع ${name}`);
};

// دالة downloadShortcuts لتحميل جدول الاختصارات
window.downloadShortcuts = function() {
    window.downloadProject('shortcuts', 'اختصارات الكيبورد');
};

// دالة logout لتسجيل الخروج
window.logout = async function() {
    try {
        await firebase.auth().signOut();
        localStorage.clear();
        window.location.reload();
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
    }
};

// دالة resetCourse لإعادة تعيين الدورة
window.resetCourse = function() {
    if (confirm('⚠️ هل أنت متأكد من إعادة تعيين تقدم الدورة؟')) {
        completedLessons = [];
        earnedBadges = [];
        quizHighScore = 0;
        totalStudyTime = 0;
        startTime = Date.now();
        
        localStorage.setItem('comp_completedLessons', JSON.stringify(completedLessons));
        localStorage.setItem('comp_earnedBadges', JSON.stringify(earnedBadges));
        localStorage.setItem('comp_quizHighScore', quizHighScore);
        localStorage.setItem('comp_totalStudyTime', totalStudyTime);
        localStorage.setItem('comp_studyStartTime', startTime);
        
        updateProgress();
        updateLessonButtons();
        updateBadgesDisplay();
        document.getElementById('certificateSection').style.display = 'none';
        showReward('تم', '✅ تم إعادة تعيين الدورة');
    }
};

// دالة toggleTheme لتبديل الوضع
window.toggleTheme = function() {
    document.body.classList.toggle('light-mode');
    const btn = document.getElementById('themeToggle');
    if (document.body.classList.contains('light-mode')) {
        btn.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('comp_theme', 'light');
    } else {
        btn.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('comp_theme', 'dark');
    }
};

// دالة toggleLesson لإكمال الدرس
window.toggleLesson = function(lessonId) {
    const index = completedLessons.indexOf(lessonId);
    
    if (index === -1) {
        completedLessons.push(lessonId);
        celebrateLesson(lessonId);
        totalStudyTime += 5;
        localStorage.setItem('comp_totalStudyTime', totalStudyTime);
    } else {
        completedLessons.splice(index, 1);
    }
    
    localStorage.setItem('comp_completedLessons', JSON.stringify(completedLessons));
    updateProgress();
    updateLessonButtons();
    checkBadges();
    updateStats();
};

// دالة downloadLesson لتحميل الدرس
window.downloadLesson = function(lessonNumber) {
    const lessons = {
        1: { title: "مقدمة في الحاسوب", content: "الدرس الأول: مقدمة في الحاسوب\n\nتعريف الحاسوب ووظائفه الأساسية\nLaptop vs Desktop vs Server\nأهم المصطلحات للمبتدئين" },
        2: { title: "وحدة المعالجة CPU", content: "الدرس الثاني: وحدة المعالجة المركزية (CPU)\n\nدور المعالج كـ 'العقل المدبر'\nالفرق بين عدد الأنوية والسرعة\nاختيار المعالج المناسب" },
        3: { title: "الذاكرة العشوائية RAM", content: "الدرس الثالث: الذاكرة العشوائية (RAM)\n\nمفهوم مساحة العمل المؤقتة\nالفرق بين DDR4 و DDR5\n8GB vs 16GB vs 32GB" },
        4: { title: "وحدات التخزين SSD HDD", content: "الدرس الرابع: وحدات التخزين\n\nالفرق بين SSD و HDD\nNVMe vs SATA\nاختيار التخزين المناسب" },
        5: { title: "الشاشة Monitor", content: "الدرس الخامس: الشاشة\n\nالدقة: Full HD, 4K, 8K\nمعدل التحديث 60Hz - 240Hz\nIPS vs OLED vs TN" },
        6: { title: "اختصارات الكيبورد", content: "الدرس السادس: اختصارات الكيبورد\n\nأهم الاختصارات اليومية\nنصائح لتسريع العمل\nمحرر تجريبي للتدريب" }
    };
    
    const lesson = lessons[lessonNumber];
    if (lessonNumber === 1) {
        const link = document.createElement('a');
        link.href = 'اول درس.pptx';
        link.download = 'الدرس_الاول_مقدمة_في_الحاسوب.pptx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showReward('تم التحميل', '✅ تم تحميل ملف العرض التقديمي');
        return;
    }
    
    const content = `${lesson.content}\n\n📥 تم التحميل من موقع Mohamed Alaa - مسار التطور التقني`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `الدرس_${lessonNumber}_${lesson.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showReward('تم التحميل', `✅ تم تحميل الدرس ${lessonNumber}`);
};

console.log('تم تحميل Computer_basics.js بنجاح');