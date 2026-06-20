/* ==========================================================================
   VERY WELL DÉCOR — INTERACTIVE MAIN JS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {




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
    const mainHeader = document.querySelector('.main-header');

    if (menuToggle && mobileMenuOverlay) {
        const closeMobileMenu = () => {
            menuToggle.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            if (mainHeader) {
                mainHeader.classList.remove('menu-open');
            }
            document.body.style.overflow = '';
        };

        menuToggle.setAttribute('aria-expanded', 'false');

        menuToggle.addEventListener('click', () => {
            const isOpen = menuToggle.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            if (mainHeader) {
                mainHeader.classList.toggle('menu-open', isOpen);
            }
            
            // Prevent body scroll when menu is open
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && mobileMenuOverlay.classList.contains('active')) {
                closeMobileMenu();
            }
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





    /* --- 9. Contact Form Submission --- */
    const contactForm = document.getElementById('wedding-contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value;
            const phone = document.getElementById('form-phone').value;
            const date = document.getElementById('form-date').value;
            const packageEl = document.getElementById('form-package');
            const packageVal = packageEl ? packageEl.options[packageEl.selectedIndex].text : (document.querySelector('h1')?.textContent || 'С сайта');
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
                        if (href.includes('#') || isMatch) {
                            link.classList.toggle('active', isMatch);
                        }
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

        // Auto-expand and scroll to album from hash in URL (e.g. portfolio.html#album-arch)
        const handleHashAlbum = () => {
            const hash = window.location.hash;
            if (hash) {
                try {
                    const targetAlbum = document.querySelector(hash);
                    if (targetAlbum && targetAlbum.classList.contains('album-container')) {
                        if (!targetAlbum.classList.contains('expanded')) {
                            const toggleBtn = targetAlbum.querySelector('.toggle-album-btn');
                            if (toggleBtn) {
                                toggleBtn.click();
                            } else {
                                targetAlbum.classList.add('expanded');
                            }
                        }
                        setTimeout(() => {
                            targetAlbum.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 250);
                    }
                } catch (err) {
                    console.warn("Invalid selector for hash:", hash, err);
                }
            }
        };

        window.addEventListener('load', handleHashAlbum);
        window.addEventListener('hashchange', handleHashAlbum);
    }

    /* --- 14. Floating Back to Top Button --- */
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        const updateBackToTopVisibility = () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
                backToTopBtn.classList.add('is-visible');
            } else {
                backToTopBtn.classList.remove('visible');
                backToTopBtn.classList.remove('is-visible');
            }
        };

        updateBackToTopVisibility();
        window.addEventListener('scroll', updateBackToTopVisibility);

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

    /* --- 17. Interactive Service Sliders --- */
    const serviceSliders = document.querySelectorAll('.service-slider');
    serviceSliders.forEach(slider => {
        const slides = slider.querySelectorAll('.service-slide');
        if (slides.length <= 1) return;
        
        let currentIdx = 0;
        setInterval(() => {
            slides[currentIdx].classList.remove('active');
            currentIdx = (currentIdx + 1) % slides.length;
            slides[currentIdx].classList.add('active');
        }, 5000);
    });
    /* --- 18. Homepage Testimonials Slider --- */
    const testimonialsContainer = document.querySelector('.testimonials-container');
    if (testimonialsContainer) {
        const slides = testimonialsContainer.querySelectorAll('.testimonial-slide');
        const dots = testimonialsContainer.querySelectorAll('.testimonials-dot');
        const prevBtn = testimonialsContainer.querySelector('.testimonial-nav-btn.prev');
        const nextBtn = testimonialsContainer.querySelector('.testimonial-nav-btn.next');
        const track = testimonialsContainer.querySelector('.testimonials-track');
        
        let currentIndex = 0;
        let slideInterval;

        const showTestimonial = (index) => {
            // Bounds check
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            slides[index].classList.add('active');
            dots[index].classList.add('active');
            
            if (track) {
                track.style.transform = `translateX(-${index * 100}%)`;
            }
            
            currentIndex = index;
        };

        const nextTestimonial = () => {
            showTestimonial(currentIndex + 1);
        };

        const prevTestimonial = () => {
            showTestimonial(currentIndex - 1);
        };

        // Click handlers
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                clearInterval(slideInterval);
                nextTestimonial();
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                clearInterval(slideInterval);
                prevTestimonial();
                startAutoSlide();
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const targetIdx = parseInt(e.currentTarget.getAttribute('data-slide'));
                clearInterval(slideInterval);
                showTestimonial(targetIdx);
                startAutoSlide();
            });
        });

        // Auto slide every 7 seconds
        const startAutoSlide = () => {
            slideInterval = setInterval(nextTestimonial, 7000);
        };

        // Touch swipe support for mobile
        const slider = testimonialsContainer.querySelector('.testimonials-slider');
        if (slider) {
            let touchStartX = 0;
            let touchEndX = 0;

            slider.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            slider.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            const handleSwipe = () => {
                const swipeThreshold = 50;
                const diffX = touchEndX - touchStartX;

                if (Math.abs(diffX) > swipeThreshold) {
                    clearInterval(slideInterval);
                    if (diffX > 0) {
                        // Swipe right -> previous slide
                        prevTestimonial();
                    } else {
                        // Swipe left -> next slide
                        nextTestimonial();
                    }
                    startAutoSlide();
                }
            };
        }

        // Start
        startAutoSlide();
    }
    /* --- 19. Set Active Navigation Link based on URL --- */
    const setActiveNavLink = () => {
        const currentUrl = new URL(window.location.href);
        let currentPath = currentUrl.pathname.replace(/\/$/, "").replace(/\.html$/, "");
        
        // Normalize directory prefix /vwevent-v2
        currentPath = currentPath.replace(/^\/vwevent-v2/, "");
        if (currentPath === '' || currentPath === '/index') {
            currentPath = '/';
        }

        const matchLink = (linkSelector) => {
            const navLinks = document.querySelectorAll(linkSelector);
            navLinks.forEach(link => {
                // Use link.href which contains the fully resolved absolute URL by the browser
                let linkPath = "";
                try {
                    const linkUrl = new URL(link.href);
                    linkPath = linkUrl.pathname.replace(/\/$/, "").replace(/\.html$/, "");
                } catch (e) {
                    return;
                }
                
                // Normalize directory prefix /vwevent-v2
                linkPath = linkPath.replace(/^\/vwevent-v2/, "");
                if (linkPath === '' || linkPath === '/index') {
                    linkPath = '/';
                }

                // Check if current path matches or starts with linkPath
                let isMatch = false;
                if (linkPath === '/') {
                    isMatch = currentPath === '/';
                } else {
                    // Match exact path or subpages
                    isMatch = currentPath === linkPath || currentPath.startsWith(linkPath + '/');
                }

                link.classList.toggle('active', isMatch);
            });
        };

        matchLink('.desktop-nav .nav-link');
        matchLink('.mobile-nav .mobile-nav-link');
    };

    setActiveNavLink();

    /* --- 12. Initialize Icons --- */
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }


    /* --- Custom Cursor Logic (Dynamic Dark/Light Modes) --- */
    const initCustomCursor = () => {
        // Only run on desktop devices (width > 768px)
        if (window.innerWidth <= 768) return;

        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        const follower = document.createElement('div');
        follower.className = 'custom-cursor-follower';

        document.body.appendChild(cursor);
        document.body.appendChild(follower);

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let followerX = 0;
        let followerY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Check if cursor is over a dark background element to adjust contrast
            const element = document.elementFromPoint(mouseX, mouseY);
            if (element) {
                const isOverDark = element.closest('.dark-theme') || 
                                   element.closest('#hero') || 
                                   element.closest('#homepage-pricing') ||
                                   element.closest('.hero-section');
                if (isOverDark) {
                    cursor.classList.add('light-mode');
                    follower.classList.add('light-mode');
                } else {
                    cursor.classList.remove('light-mode');
                    follower.classList.remove('light-mode');
                }
            }
        });

        const tick = () => {
            // Smooth lerp for follower (speed factor 0.15)
            cursorX = mouseX;
            cursorY = mouseY;
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;

            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';

            requestAnimationFrame(tick);
        };
        tick();

        // Hover states for interactive elements
        const updateHoverState = () => {
            const hoverTargets = document.querySelectorAll('a, button, [role="button"], .gallery-item, .quiz-option, .swiper-button-next, .swiper-button-prev');
            hoverTargets.forEach(target => {
                // Ensure we don't attach duplicate listeners
                if (target.dataset.cursorBound) return;
                target.dataset.cursorBound = "true";

                target.addEventListener('mouseenter', () => {
                    cursor.classList.add('hovered');
                    follower.classList.add('hovered');
                });
                target.addEventListener('mouseleave', () => {
                    cursor.classList.remove('hovered');
                    follower.classList.remove('hovered');
                });
            });
        };
        // initCustomCursor();
    };
});
