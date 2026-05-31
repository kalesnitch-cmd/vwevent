/* ==========================================================================
   VERY WELL DÉCOR — INTERACTIVE MAIN JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Premium Custom Cursor --- */
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    
    let mouseX = 0, mouseY = 0; // Mouse positions
    let posX = 0, posY = 0;     // Follower positions

    if (cursor && follower && window.matchMedia('(min-width: 769px)').matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Instantly move the core dot
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        });

        // Animate the follower circle with lag/damping
        const animateCursor = () => {
            posX += (mouseX - posX) * 0.15;
            posY += (mouseY - posY) * 0.15;

            follower.style.left = `${posX}px`;
            follower.style.top = `${posY}px`;

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Hover effect for interactive elements
        const interactives = document.querySelectorAll('a, button, input, select, textarea, .gallery-item, .quiz-option, [role="button"]');
        interactives.forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursor.classList.add('hovered');
                follower.classList.add('hovered');
            });
            item.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovered');
                follower.classList.remove('hovered');
            });
        });
    }


    // State variable shared between dragging and lightbox clicking
    let mouseMovedDuringDrag = false;




    /* --- 1.6. Notification Sound Generator & Date Defaults --- */
    function playNotificationSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            // Resume if suspended (browser security policies)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            
            const now = ctx.currentTime;
            
            // Richer, louder C-major arpeggio (C5 -> E5 -> G5 -> C6) for a luxury brand feel
            const notes = [523.25, 659.25, 783.99, 1046.50]; 
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + index * 0.08);
                
                gain.gain.setValueAtTime(0.2, now + index * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.45);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(now + index * 0.08);
                osc.stop(now + index * 0.08 + 0.45);
            });
        } catch (err) {
            console.error("Audio Context playback error:", err);
        }
    }

    const setTodayDate = () => {
        const dateInput = document.getElementById('form-date');
        const quizDateInput = document.getElementById('quiz-date');
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        
        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;
        
        const formattedToday = `${yyyy}-${mm}-${dd}`;
        if (dateInput) {
            dateInput.value = formattedToday;
            dateInput.min = formattedToday;
        }
        if (quizDateInput) {
            quizDateInput.value = formattedToday;
            quizDateInput.min = formattedToday;
        }
    };
    
    // Set today's date on initial load
    setTodayDate();

    /* --- 2. Sticky Header --- */
    const header = document.querySelector('.main-header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load


    /* --- 3. Mobile Menu Overlay --- */
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (menuToggle && mobileMenuOverlay) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (mobileMenuOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }


    /* --- 4. Hero Background Slider --- */
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const prevBtn = document.querySelector('.slide-control-btn.prev');
    const nextBtn = document.querySelector('.slide-control-btn.next');
    
    let currentSlide = 0;
    let slideInterval;

    const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    };

    const nextSlide = () => {
        let index = (currentSlide + 1) % slides.length;
        showSlide(index);
    };

    const prevSlide = () => {
        let index = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(index);
    };

    if (slides.length > 0) {
        // Init auto slide (5s)
        slideInterval = setInterval(nextSlide, 5000);

        // Control buttons
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearInterval(slideInterval);
                nextSlide();
                slideInterval = setInterval(nextSlide, 5000);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                clearInterval(slideInterval);
                prevSlide();
                slideInterval = setInterval(nextSlide, 5000);
            });
        }

        // Dot navigation
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const targetIdx = parseInt(e.target.getAttribute('data-slide'));
                clearInterval(slideInterval);
                showSlide(targetIdx);
                slideInterval = setInterval(nextSlide, 5000);
            });
        });
    }


    /* --- 5. Portfolio Filtering & Horizontal Scroll --- */
    const gallery = document.querySelector('.portfolio-grid');
    const progressFillBar = document.querySelector('.progress-bar-fill');

    const updateGalleryProgress = () => {
        if (!gallery || !progressFillBar) return;
        const maxScroll = gallery.scrollWidth - gallery.clientWidth;
        const percentage = maxScroll > 0 ? (gallery.scrollLeft / maxScroll) * 100 : 0;
        progressFillBar.style.width = `${percentage}%`;
    };

    if (gallery) {
        gallery.addEventListener('scroll', updateGalleryProgress);
        window.addEventListener('resize', updateGalleryProgress);

        // Mousewheel vertical -> horizontal translation (standard mode)
        gallery.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                gallery.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        // Drag to scroll
        let isDown = false;
        let startX;
        let scrollLeftStart;

        gallery.addEventListener('mousedown', (e) => {
            isDown = true;
            gallery.classList.add('active-drag');
            startX = e.pageX - gallery.offsetLeft;
            scrollLeftStart = gallery.scrollLeft;
            mouseMovedDuringDrag = false; // Reset drag flag on mousedown
        });

        gallery.addEventListener('mouseleave', () => {
            isDown = false;
            gallery.classList.remove('active-drag');
        });

        gallery.addEventListener('mouseup', () => {
            isDown = false;
            gallery.classList.remove('active-drag');
        });

        gallery.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - gallery.offsetLeft;
            const walk = (x - startX) * 1.5; // scroll speed multiplier
            
            // If dragging exceeds 5px, set flag
            if (Math.abs(walk) > 5) {
                mouseMovedDuringDrag = true;
            }
            
            gallery.scrollLeft = scrollLeftStart - walk;
            updateGalleryProgress();
        });

        // Gallery Left/Right Arrow Navigation
        const nextNavBtn = document.querySelector('.gallery-nav-btn.next');
        const prevNavBtn = document.querySelector('.gallery-nav-btn.prev');

        if (nextNavBtn) {
            nextNavBtn.addEventListener('click', () => {
                gallery.scrollBy({ left: 380, behavior: 'smooth' });
            });
        }
        if (prevNavBtn) {
            prevNavBtn.addEventListener('click', () => {
                gallery.scrollBy({ left: -380, behavior: 'smooth' });
            });
        }
    }

    // Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterButtons.length > 0 && galleryItems.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle active class in buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    // Animation exit
                    item.style.transform = 'scale(0.8)';
                    item.style.opacity = '0';
                    
                    setTimeout(() => {
                        if (filterValue === 'all' || item.classList.contains(filterValue)) {
                            item.style.display = 'block';
                            setTimeout(() => {
                                item.style.transform = 'scale(1)';
                                item.style.opacity = '1';
                                if (gallery) {
                                    gallery.scrollLeft = 0;
                                    updateGalleryProgress();
                                }
                            }, 50);
                        } else {
                            item.style.display = 'none';
                        }
                    }, 400); // Match CSS transition timing
                });
            });
        });
    }


    /* --- 6. Portfolio Lightbox --- */
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-nav.prev-pic');
    const lightboxNext = document.querySelector('.lightbox-nav.next-pic');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxLocation = document.getElementById('lightbox-location');

    let visibleGalleryItems = [];
    let currentImgIndex = 0;

    const updateLightboxImage = () => {
        const item = visibleGalleryItems[currentImgIndex];
        const img = item.querySelector('img');
        const title = item.querySelector('h3').textContent;
        const cat = item.querySelector('.category').textContent;
        
        const locEl = item.querySelector('.location');
        const loc = locEl ? locEl.innerHTML : '';

        lightboxImg.src = item.getAttribute('data-src');
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title;
        lightboxCategory.textContent = cat;
        
        if (loc) {
            lightboxLocation.innerHTML = loc;
            lightboxLocation.style.display = 'flex';
        } else {
            lightboxLocation.innerHTML = '';
            lightboxLocation.style.display = 'none';
        }
    };

    if (lightboxModal && galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Do not open lightbox if we were just dragging to scroll
                if (mouseMovedDuringDrag) {
                    return;
                }
                
                // Collect context container
                const albumContainer = item.closest('.album-container');
                if (albumContainer) {
                    // Option B: cycle only inside this specific album
                    visibleGalleryItems = Array.from(albumContainer.querySelectorAll('.gallery-item'));
                } else {
                    // Option A or Main page: cycle through currently visible grid items
                    visibleGalleryItems = Array.from(galleryItems).filter(i => {
                        const compStyle = window.getComputedStyle(i);
                        return compStyle.display !== 'none' && i.closest('.portfolio-preview-grid, .portfolio-full-grid');
                    });
                }
                currentImgIndex = visibleGalleryItems.indexOf(item);
                
                updateLightboxImage();
                
                lightboxModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close functions
        const closeLightbox = () => {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });

        // Navigation controls
        if (lightboxNext) {
            lightboxNext.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImgIndex = (currentImgIndex + 1) % visibleGalleryItems.length;
                updateLightboxImage();
            });
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImgIndex = (currentImgIndex - 1 + visibleGalleryItems.length) % visibleGalleryItems.length;
                updateLightboxImage();
            });
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!lightboxModal.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
            if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
        });

        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        lightboxModal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightboxModal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const threshold = 50; // minimum distance in px to register a swipe
            const diffX = touchEndX - touchStartX;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX < 0) {
                    // Swiped left -> Next Image
                    currentImgIndex = (currentImgIndex + 1) % visibleGalleryItems.length;
                    updateLightboxImage();
                } else {
                    // Swiped right -> Previous Image
                    currentImgIndex = (currentImgIndex - 1 + visibleGalleryItems.length) % visibleGalleryItems.length;
                    updateLightboxImage();
                }
            }
        };
    }


    /* --- 7. Interactive Wedding Style Quiz --- */
    const quizForm = document.getElementById('wedding-quiz-form');
    const quizSteps = document.querySelectorAll('.quiz-step');
    const quizStepNums = document.querySelectorAll('.quiz-steps-indicators .step-num');
    const progressFill = document.querySelector('.quiz-progress-bar .progress-fill');
    
    const prevStepBtn = document.querySelector('.quiz-nav-btn.prev-step');
    const nextStepBtn = document.querySelector('.quiz-nav-btn.next-step');
    const submitQuizBtn = document.querySelector('.quiz-nav-btn.submit-quiz');

    let activeStepIndex = 0; // 0-indexed corresponding to steps 1-5

    const updateQuizUI = () => {
        // Toggle steps visibility
        quizSteps.forEach((step, idx) => {
            step.classList.toggle('active', idx === activeStepIndex);
        });

        // Update progress bar
        const progressPercentage = ((activeStepIndex + 1) / quizSteps.length) * 100;
        if (progressFill) progressFill.style.width = `${progressPercentage}%`;

        // Update step num indicators
        quizStepNums.forEach((num, idx) => {
            num.classList.toggle('active', idx === activeStepIndex);
            num.classList.toggle('completed', idx < activeStepIndex);
        });

        // Toggle navigation buttons
        if (activeStepIndex === 0) {
            prevStepBtn.style.display = 'none';
            nextStepBtn.style.display = 'inline-flex';
            submitQuizBtn.style.display = 'none';
        } else if (activeStepIndex === quizSteps.length - 1) { // Results screen (step 5)
            prevStepBtn.style.display = 'inline-flex';
            nextStepBtn.style.display = 'none';
            submitQuizBtn.style.display = 'inline-flex';
        } else {
            prevStepBtn.style.display = 'inline-flex';
            nextStepBtn.style.display = 'inline-flex';
            submitQuizBtn.style.display = 'none';
        }
    };

    const calculateQuizResult = () => {
        // Extract selected answers
        const location = document.querySelector('input[name="location"]:checked')?.value || 'banquet-hall';
        const colors = document.querySelector('input[name="colors"]:checked')?.value || 'pastels';
        const guests = document.querySelector('input[name="guests"]:checked')?.value || 'medium';
        const vibe = document.querySelector('input[name="vibe"]:checked')?.value || 'classic';

        // Result text containers
        const resultStyleName = document.querySelector('.recommended-style-name');
        const resultStyleDesc = document.querySelector('.recommended-style-desc');
        const resultPriceVal = document.querySelector('.estimated-price');

        // Logic variables
        let recommendedStyle = "Классическая Элегантность";
        let styleDesc = "Вашему выбору идеально соответствует торжественный классический декор с обилием цветов, хрустальными канделябрами, изящной сервировкой и теплым свечением сотен свечей.";
        let estimatedPrice = "";

        // Style Vibe Matching
        if (vibe === 'classic') {
            recommendedStyle = "Классическое Величие";
            styleDesc = "Роскошный декор с обилием пышной флористики (розы, гортензии), зеркальными элементами, хрустальными люстрами и классическим убранством.";
        } else if (vibe === 'modern') {
            recommendedStyle = "Геометрический Модерн";
            styleDesc = "Современный минимализм, строгие геометрические формы, игра света и неона, монохромные флористические акценты и стильные индустриальные детали.";
        } else if (vibe === 'other-vibe') {
            recommendedStyle = "Индивидуальный концепт";
            styleDesc = "Вы выбрали собственный вариант атмосферы! Мы разработаем неповторимую концепцию оформления с нуля, учитывая ваши пожелания, выбранную локацию и цветовую гамму.";
        } else if (vibe === 'cozy') {
            recommendedStyle = "Уютный Ужин в Семейном кругу";
            styleDesc = "Душевный камерный декор. Внимание к деталям: индивидуальные карточки меню, текстильные салфетки, эвкалипт и множество маленьких свечей.";
        }

        if (colors === 'other-color' && vibe !== 'other-vibe') {
            styleDesc += " Цветовая гамма оформления будет полностью адаптирована под ваши пожелания.";
        } else if (colors === 'white-crystal' && vibe === 'classic') {
            styleDesc = "Хрустальный блеск и изысканная роскошь. Оформление с использованием прозрачных элементов, подвесных кристаллов, зеркал и белоснежной флористики.";
        }

        // Budget Estimation based on guests count and style factor
        let baseCost = 280000;
        if (guests === 'lite') {
            baseCost = 120000;
            estimatedPrice = `от 50 000 до 100 000 руб.`;
        } else if (guests === 'medium') {
            baseCost = 280000;
            estimatedPrice = `от 100 000 до 200 000 руб.`;
        } else if (guests === 'large') {
            baseCost = 550000;
            estimatedPrice = `от 200 000 до 350 000 руб.`;
        } else if (guests === 'royal') {
            baseCost = 900000;
            estimatedPrice = `от 400 000+ руб. (Royal Custom)`;
        }

        // Write content to result screen
        if (resultStyleName) resultStyleName.textContent = recommendedStyle;
        if (resultStyleDesc) resultStyleDesc.textContent = styleDesc;
        if (resultPriceVal) resultPriceVal.textContent = estimatedPrice;
    };

    if (quizForm && quizSteps.length > 0) {
        // Next Button Click
        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => {
                if (activeStepIndex < quizSteps.length - 1) {
                    activeStepIndex++;
                    
                    // If moving to results (step 5), compute values
                    if (activeStepIndex === quizSteps.length - 1) {
                        calculateQuizResult();
                    }
                    
                    updateQuizUI();
                }
            });
        }

        // Prev Button Click
        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => {
                if (activeStepIndex > 0) {
                    activeStepIndex--;
                    updateQuizUI();
                }
            });
        }

        // Quiz Submission
        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('quiz-name').value;
            const phone = document.getElementById('quiz-phone').value;
            const date = document.getElementById('quiz-date')?.value || '';
            const preference = document.querySelector('input[name="quiz-contact-preference"]:checked')?.value || 'whatsapp';
            const style = document.querySelector('.recommended-style-name')?.textContent || '';
            const budget = document.querySelector('.estimated-price')?.textContent || '';

            // Extract raw answer text labels to send to Telegram
            const locationEl = document.querySelector('input[name="location"]:checked')?.closest('.quiz-option')?.querySelector('.option-title');
            const colorEl = document.querySelector('input[name="colors"]:checked')?.closest('.quiz-option')?.querySelector('.option-title');
            const guestsEl = document.querySelector('input[name="guests"]:checked')?.closest('.quiz-option')?.querySelector('.option-title');
            const vibeEl = document.querySelector('input[name="vibe"]:checked')?.closest('.quiz-option')?.querySelector('.option-title');
            
            const answersText = {
                location: locationEl?.textContent?.trim() || '',
                color: colorEl?.textContent?.trim() || '',
                guests: guestsEl?.textContent?.trim() || '',
                vibe: vibeEl?.textContent?.trim() || ''
            };

            // Play notification chime
            playNotificationSound();

            // Send notification to Telegram bot
            fetch('https://verywell-decor.vercel.app/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'quiz',
                    name,
                    phone,
                    date,
                    style,
                    budget,
                    preference,
                    answers: answersText
                })
            }).catch(err => console.error('Telegram notification error:', err));
            
            // Show Success Modal
            const successModal = document.getElementById('success-modal');
            const successMsg = document.getElementById('success-message');
            
            if (successModal) {
                if (successMsg) {
                    successMsg.innerHTML = `Спасибо, <strong>${name}</strong>! Мы получили ваши ответы по квизу. Мы свяжемся с вами по номеру <strong>${phone}</strong> в течение 2 часов с готовым индивидуальным расчетом сметы и разбором стиля.`;
                }
                successModal.classList.add('active');
            }

            // Reset Quiz
            quizForm.reset();
            activeStepIndex = 0;
            updateQuizUI();
        });
    }


    /* --- 8. Pricing Package Autofil into Contact Form --- */
    const packageSelect = document.getElementById('form-package');
    const selectPackageBtns = document.querySelectorAll('.select-package');

    if (packageSelect && selectPackageBtns.length > 0) {
        selectPackageBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const packageName = btn.getAttribute('data-package');
                
                // Map names to select values
                if (packageName.includes('LITE')) {
                    packageSelect.value = 'lite';
                } else if (packageName.includes('PREMIUM')) {
                    packageSelect.value = 'premium';
                } else if (packageName.includes('ROYAL')) {
                    packageSelect.value = 'royal';
                }
                
                // Scroll to contacts
                const contactSection = document.getElementById('contacts');
                if (contactSection) {
                    window.scrollTo({
                        top: contactSection.offsetTop - 80, // Offset for header
                        behavior: 'smooth'
                    });
                }
            });
        });
    }


    /* --- 9. Contact Form Submission --- */
    const contactForm = document.getElementById('wedding-contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value;
            const phone = document.getElementById('form-phone').value;
            const date = document.getElementById('form-date').value;
            const packageVal = document.getElementById('form-package').options[document.getElementById('form-package').selectedIndex].text;
            const message = document.getElementById('form-message').value;
            const preference = document.querySelector('input[name="contact-preference"]:checked')?.value || 'whatsapp';

            // Play notification chime
            playNotificationSound();

            // Send notification to Telegram bot
            fetch('https://verywell-decor.vercel.app/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'contact',
                    name,
                    phone,
                    date,
                    packageVal,
                    message,
                    preference
                })
            }).catch(err => console.error('Telegram notification error:', err));

            // Show Success Modal
            const successModal = document.getElementById('success-modal');
            const successMsg = document.getElementById('success-message');

            if (successModal) {
                if (successMsg) {
                    successMsg.innerHTML = `Спасибо за доверие, <strong>${name}</strong>! Заявка на расчет сметы успешно отправлена. Мы свяжемся с вами по номеру <strong>${phone}</strong> в ближайшее время для обсуждения деталей вашего торжества.`;
                }
                successModal.classList.add('active');
            }

            contactForm.reset();
            setTodayDate(); // Re-apply today's date default
        });
    }

    // Success Modal Close buttons
    const successModal = document.getElementById('success-modal');
    const successCloseBtns = document.querySelectorAll('.success-close, .close-success-btn');

    if (successModal && successCloseBtns.length > 0) {
        successCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                successModal.classList.remove('active');
            });
        });

        // Close on overlay click
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }


    /* --- 10. Scroll & Load Reveal Animations --- */
    // Trigger Hero Entrance animations immediately on load
    const heroElements = document.querySelectorAll('.animate-on-load');
    setTimeout(() => {
        heroElements.forEach(el => el.classList.add('loaded'));
    }, 150);

    // Intersection Observer for scroll animations
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, revealOptions);

    const elementsToReveal = document.querySelectorAll('.reveal-slide-left, .reveal-slide-right, .reveal-slide-up, .reveal-fade-in');
    elementsToReveal.forEach(el => revealObserver.observe(el));

    // Portfolio Grid Scroll Peek Hint Animation
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (portfolioGrid) {
        const peekObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        portfolioGrid.scrollBy({ left: 100, behavior: 'smooth' });
                        setTimeout(() => {
                            portfolioGrid.scrollTo({ left: 0, behavior: 'smooth' });
                        }, 800);
                    }, 1200);
                    observer.unobserve(portfolioGrid);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px' });
        
        peekObserver.observe(portfolioGrid);
    }


    /* --- 11. Active Nav Link Highlighter --- */
    const navSections = document.querySelectorAll('section[id]');
    const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');

    if (navSections.length > 0 && desktopLinks.length > 0) {
        const observerOptions = {
            root: null, // viewport
            rootMargin: '-30% 0px -60% 0px', // check elements around the upper-middle of the screen
            threshold: 0
        };

        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    desktopLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        const isMatch = href === `#${sectionId}` || href.endsWith(`#${sectionId}`);
                        link.classList.toggle('active', isMatch);
                    });
                }
            });
        }, observerOptions);

        navSections.forEach(section => navObserver.observe(section));
    }


    /* --- 13. Portfolio Albums: Pagination & Expanding --- */
    const albums = document.querySelectorAll('.album-container');
    if (albums.length > 0) {
        albums.forEach(album => {
            const toggleBtn = album.querySelector('.toggle-album-btn');
            const banner = album.querySelector('.album-banner');
            const loadMoreBtn = album.querySelector('.load-more-album-btn');
            const items = album.querySelectorAll('.gallery-item');
            
            let visibleCount = 9;

            const updateAlbumPagination = () => {
                items.forEach((item, idx) => {
                    if (idx < visibleCount) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 30);
                    } else {
                        item.style.display = 'none';
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.95)';
                    }
                });

                if (loadMoreBtn) {
                    if (visibleCount >= items.length) {
                        loadMoreBtn.style.display = 'none';
                    } else {
                        loadMoreBtn.style.display = 'inline-flex';
                    }
                }
            };

            // Initialize pagination on load
            updateAlbumPagination();

            // Toggle Expand/Collapse
            const toggle = () => {
                const isExpanded = album.classList.toggle('expanded');
                
                if (toggleBtn) {
                    if (isExpanded) {
                        toggleBtn.innerHTML = 'Свернуть альбом <i data-lucide="chevron-up"></i>';
                    } else {
                        toggleBtn.innerHTML = 'Открыть альбом <i data-lucide="chevron-down"></i>';
                    }
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            };

            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggle();
                });
            }

            if (banner) {
                banner.addEventListener('click', toggle);
            }

            // Load More click
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    visibleCount += 9;
                    updateAlbumPagination();
                });
            }
        });
    }

    /* --- 14. Floating Back to Top Button --- */
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* --- 15. Mobile Floating Widgets Toggle --- */
    const widgetsWrapper = document.querySelector('.floating-contact-widgets');
    const widgetsTrigger = document.querySelector('.widgets-trigger');
    
    if (widgetsWrapper && widgetsTrigger) {
        widgetsTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            widgetsWrapper.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!widgetsWrapper.contains(e.target)) {
                widgetsWrapper.classList.remove('active');
            }
        });
    }

    /* --- 16. Cookie Consent Notice --- */
    const cookieNotice = document.getElementById('cookie-notice');
    const cookieAcceptBtn = document.getElementById('cookie-accept-btn');
    
    if (cookieNotice && cookieAcceptBtn) {
        // Check if user already accepted cookie consent
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Show notice with a slight delay
            setTimeout(() => {
                cookieNotice.classList.add('show');
            }, 1500);
        }
        
        cookieAcceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'accepted');
            cookieNotice.classList.remove('show');
        });
    }

    /* --- 12. Initialize Icons --- */
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

});
