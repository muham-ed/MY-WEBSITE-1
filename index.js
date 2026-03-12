
        // ===== إعدادات Firebase الصحيحة =====
        const firebaseConfig = {
            apiKey: "AIzaSyDP2FvUqV7pAt8pI1G1Mh8oxA_W6_O6Q0k",
            authDomain: "my-website-1-93db8.firebaseapp.com",
            projectId: "my-website-1-93db8",
            storageBucket: "my-website-1-93db8.appspot.com",
            messagingSenderId: "811350331643",
            appId: "1:811350331643:web:03ccde538645de11f1488e"
        };

        // تهيئة Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();

        // ===== عناصر DOM =====
        const userWelcomeDiv = document.getElementById('userWelcome');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        // ===== عرض معلومات المستخدم =====
        function displayUserInfo() {
            const userId = localStorage.getItem('userId');
            const userName = localStorage.getItem('userName');
            
            if (userId && userName) {
                userWelcomeDiv.style.display = 'block';
                userWelcomeDiv.innerHTML = `
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

        // ===== تحميل التقدم المحفوظ =====
        function loadProgress() {
            const completedSteps = JSON.parse(localStorage.getItem('completedSteps')) || [];
            const totalSteps = document.querySelectorAll('.path-item').length;
            let completedCount = 0;
            
            document.querySelectorAll('.path-item').forEach(item => {
                const step = parseInt(item.getAttribute('data-step'));
                
                if (completedSteps.includes(step)) {
                    item.classList.add('completed');
                    completedCount++;
                    
                    const nextStep = step + 1;
                    const nextItem = document.querySelector(`.path-item[data-step="${nextStep}"]`);
                    if (nextItem) {
                        nextItem.classList.remove('locked');
                    }
                } else {
                    const prevStep = step - 1;
                    if (prevStep > 0 && !completedSteps.includes(prevStep)) {
                        item.classList.add('locked');
                    }
                }
            });
            
            const progressPercentage = Math.round((completedCount / totalSteps) * 100);
            if (progressFill) progressFill.style.width = `${progressPercentage}%`;
            if (progressText) progressText.textContent = `${progressPercentage}% مكتمل`;
        }

        // ===== إكمال مرحلة =====
        window.completeStep = function(step) {
            let completedSteps = JSON.parse(localStorage.getItem('completedSteps')) || [];
            
            if (!completedSteps.includes(step)) {
                completedSteps.push(step);
                localStorage.setItem('completedSteps', JSON.stringify(completedSteps));
                
                const completedItem = document.querySelector(`.path-item[data-step="${step}"]`);
                completedItem.classList.add('completed');
                
                const nextStep = step + 1;
                const nextItem = document.querySelector(`.path-item[data-step="${nextStep}"]`);
                if (nextItem) {
                    nextItem.classList.remove('locked');
                }
                
                loadProgress();
                
                alert(`تهانينا! لقد أكملت المرحلة ${step}. يمكنك الآن الانتقال إلى المرحلة التالية.`);
            }
        };

        // ===== إعادة تعيين التقدم =====
        window.resetProgress = function() {
            if (confirm('هل أنت متأكد أنك تريد إعادة تعيين تقدمك؟ سيتم حذف جميع بيانات التقدم.')) {
                localStorage.removeItem('completedSteps');
                
                document.querySelectorAll('.path-item').forEach(item => {
                    item.classList.remove('completed');
                    const step = parseInt(item.getAttribute('data-step'));
                    if (step > 1) {
                        item.classList.add('locked');
                    }
                });
                
                if (progressFill) progressFill.style.width = '0%';
                if (progressText) progressText.textContent = '0% مكتمل';
                
                alert('تم إعادة تعيين تقدمك بنجاح. يمكنك البدء من جديد.');
            }
        };

        // ===== فلترة المسارات التعليمية =====
        const filterBtns = document.querySelectorAll('.programs-filter .filter-btn');
        const programCards = document.querySelectorAll('.program-card');

        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filter = this.dataset.filter;
                    
                    programCards.forEach(card => {
                        if (filter === 'all' || card.dataset.category === filter) {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'scale(1)';
                            }, 10);
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'scale(0.8)';
                            setTimeout(() => {
                                card.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        }

        // ===== التحقق من حالة تسجيل الدخول =====
        auth.onAuthStateChanged((user) => {
            if (user) {
                // مستخدم مسجل الدخول
                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userName', user.displayName || 'مستخدم');
                localStorage.setItem('userEmail', user.email);
                displayUserInfo();
            } else {
                // مستخدم غير مسجل الدخول
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                userWelcomeDiv.style.display = 'none';
            }
        });

        // ===== تأثيرات عند تحميل الصفحة =====
        document.addEventListener('DOMContentLoaded', function() {
            loadProgress();
            
            const pathItems = document.querySelectorAll('.path-item');
            const icons = document.querySelectorAll('.path-icon');
            
            icons.forEach(icon => {
                icon.addEventListener('mouseenter', () => {
                    icon.style.transform = 'scale(1.1)';
                    icon.style.boxShadow = '0 10px 25px rgba(67, 97, 238, 0.6)';
                });
                
                icon.addEventListener('mouseleave', () => {
                    icon.style.transform = 'scale(1)';
                    icon.style.boxShadow = 'none';
                });
            });
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }
                });
            }, { threshold: 0.1 });
            
            pathItems.forEach(item => {
                item.style.opacity = "0";
                item.style.transform = "translateY(20px)";
                item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                observer.observe(item);
            });
            
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-10px)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                });
            });
            
            window.addEventListener('scroll', function() {
                var backToTopButton = document.getElementById('backToTop');
                if (window.pageYOffset > 300) {
                    backToTopButton.style.display = 'block';
                } else {
                    backToTopButton.style.display = 'none';
                }
            });
            
            document.getElementById('backToTop').addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            const faqItems = document.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                question.addEventListener('click', () => {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    item.classList.toggle('active');
                });
            });
            
            // التحقق من وجود مستخدم مسجل الدخول عند التحميل
            if (localStorage.getItem('userId')) {
                displayUserInfo();
            }
        });