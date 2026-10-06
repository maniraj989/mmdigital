/**
 * MM DIGITAL GARAGE — Application JavaScript
 * Master Redesign Architecture matching Reference Specification
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // =========================================================================
    // 1. DYNAMIC COPYRIGHT YEAR
    // =========================================================================
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // =========================================================================
    // 2. THEME SWITCHER LOGIC
    // =========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');

    function getPreferredTheme() {
        const stored = localStorage.getItem('mm-theme');
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }
        return 'light'; // Default to light warm-ivory matching reference image
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mm-theme', theme);

        if (themeToggleBtn) {
            const nextTheme = theme === 'dark' ? 'light' : 'dark';
            themeToggleBtn.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
            themeToggleBtn.setAttribute('title', `Switch to ${nextTheme} mode`);
        }
    }

    // Apply preferred theme on load
    applyTheme(getPreferredTheme());

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
        });
    }

    // =========================================================================
    // 3. STICKY HEADER SCROLL EFFECT
    // =========================================================================
    const header = document.querySelector('header.site-header');

    function checkHeaderScroll() {
        if (!header) return;
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', checkHeaderScroll, { passive: true });
    checkHeaderScroll();

    // =========================================================================
    // 4. MOBILE MENU ACCESSIBILITY & NAVIGATION
    // =========================================================================
    const mobileBtn = document.querySelector('.mobile-menu-btn') || document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.header-nav') || document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            mobileBtn.setAttribute('aria-expanded', String(isActive));
            const icon = mobileBtn.querySelector('i');
            if (icon) {
                if (isActive) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileBtn.setAttribute('aria-expanded', 'false');
                    const icon = mobileBtn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileBtn.setAttribute('aria-expanded', 'false');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // =========================================================================
    // 5. PROPOSAL REQUEST MODAL INTERACTION
    // =========================================================================
    const contactModal = document.getElementById('contact-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');

    function openModal() {
        if (!contactModal) return;
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const firstInput = contactModal.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    function closeModal() {
        if (!contactModal) return;
        contactModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && contactModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // =========================================================================
    // 5A. MODAL PROPOSAL REQUEST FORM SUBMISSION (Resend Email API)
    // =========================================================================
    const modalForm = document.querySelector('.modal-contact-form');
    const formAlert = document.getElementById('modal-form-alert');

    if (modalForm) {
        modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous alert
            if (formAlert) {
                formAlert.style.display = 'none';
                formAlert.className = 'form-status-box';
                formAlert.innerHTML = '';
            }

            const formData = new FormData(modalForm);
            const firstName = (formData.get('firstName') || '').trim();
            const lastName = (formData.get('lastName') || '').trim();
            const email = (formData.get('email') || '').trim();
            const phone = (formData.get('phone') || '').trim();
            const notes = (formData.get('notes') || '').trim();
            const gotcha = formData.get('_gotcha') || '';

            // Collect all checked capabilities
            const checkedServices = [];
            modalForm.querySelectorAll('input[name="services"]:checked').forEach(cb => {
                if (cb.value) checkedServices.push(cb.value);
            });

            // Client-side validation
            if (!firstName) {
                showModalError('Please enter your first name.');
                const fInput = modalForm.querySelector('#first-name');
                if (fInput) fInput.focus();
                return;
            }

            if (!lastName) {
                showModalError('Please enter your last name.');
                const lInput = modalForm.querySelector('#last-name');
                if (lInput) lInput.focus();
                return;
            }

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showModalError('Please enter a valid business email address.');
                const eInput = modalForm.querySelector('#email-addr');
                if (eInput) eInput.focus();
                return;
            }

            const submitBtn = modalForm.querySelector('button[type="submit"]');
            const origText = submitBtn ? submitBtn.innerHTML : 'Submit Inquiry &rarr;';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Submitting Proposal...';
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        formType: 'proposal',
                        firstName,
                        lastName,
                        email,
                        phone,
                        services: checkedServices,
                        notes,
                        _gotcha: gotcha
                    })
                });

                const result = await response.json().catch(() => ({}));

                if (response.ok && result.success) {
                    if (formAlert) {
                        formAlert.className = 'form-status-box success';
                        formAlert.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 6px;"></i> ' + 
                            (result.message || 'Thank you! Your proposal request has been received. Our team will contact you within 24 business hours.');
                        formAlert.style.display = 'block';
                    }
                    modalForm.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-check"></i> Inquiry Received!';
                        setTimeout(() => {
                            submitBtn.innerHTML = origText;
                        }, 5000);
                    }
                } else {
                    const errMsg = result.message || 'Failed to submit proposal request. Please check your details or email us directly at mmdigitagarage@gmail.com.';
                    showModalError(errMsg);
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = origText;
                    }
                }
            } catch (fetchErr) {
                showModalError('Network error: Unable to reach the server. Please check your internet connection or email us directly at mmdigitagarage@gmail.com.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origText;
                }
            }

            function showModalError(msg) {
                if (formAlert) {
                    formAlert.className = 'form-status-box error';
                    formAlert.innerHTML = '<i class="fas fa-exclamation-circle" style="margin-right: 6px;"></i> ' + msg;
                    formAlert.style.display = 'block';
                }
            }
        });
    }

    // =========================================================================
    // 5B. CTA PROJECT INQUIRY FORM SUBMISSION (Resend Email API)
    // =========================================================================
    const ctaForm = document.getElementById('ctaContactForm');
    const ctaStatus = document.getElementById('ctaFormStatus');
    const ctaSubmitBtn = document.getElementById('ctaSubmitBtn');

    if (ctaForm) {
        ctaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous status
            if (ctaStatus) {
                ctaStatus.style.display = 'none';
                ctaStatus.className = 'cta-form-status';
                ctaStatus.innerHTML = '';
            }

            const formData = new FormData(ctaForm);
            const name = (formData.get('name') || '').trim();
            const email = (formData.get('email') || '').trim();
            const phone = (formData.get('phone') || '').trim();
            const service = (formData.get('service') || '').trim();
            const details = (formData.get('details') || '').trim();
            const gotcha = formData.get('_gotcha') || '';

            // Client-side validation
            if (!name) {
                showCtaError('Please enter your full name.');
                const nInput = ctaForm.querySelector('#cta-name');
                if (nInput) nInput.focus();
                return;
            }

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showCtaError('Please enter a valid business email address.');
                const eInput = ctaForm.querySelector('#cta-email');
                if (eInput) eInput.focus();
                return;
            }

            if (!service) {
                showCtaError('Please select a required service.');
                const sInput = ctaForm.querySelector('#cta-service');
                if (sInput) sInput.focus();
                return;
            }

            const origBtnHtml = ctaSubmitBtn ? ctaSubmitBtn.innerHTML : '<span>Send Inquiry &rarr;</span>';
            if (ctaSubmitBtn) {
                ctaSubmitBtn.disabled = true;
                ctaSubmitBtn.innerHTML = '<span><i class="fas fa-circle-notch fa-spin"></i> Sending Inquiry...</span>';
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        formType: 'inquiry',
                        name,
                        email,
                        phone,
                        service,
                        details,
                        _gotcha: gotcha
                    })
                });

                const result = await response.json().catch(() => ({}));

                if (response.ok && result.success) {
                    if (ctaStatus) {
                        ctaStatus.className = 'cta-form-status success';
                        ctaStatus.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 6px;"></i> ' + 
                            (result.message || 'Thank you! Your inquiry has been sent successfully. Our team will contact you shortly.');
                        ctaStatus.style.display = 'block';
                    }
                    ctaForm.reset();
                    if (ctaSubmitBtn) {
                        ctaSubmitBtn.disabled = false;
                        ctaSubmitBtn.innerHTML = '<span><i class="fas fa-check"></i> Inquiry Sent!</span>';
                        setTimeout(() => {
                            ctaSubmitBtn.innerHTML = origBtnHtml;
                        }, 5000);
                    }
                } else {
                    const errMsg = result.message || 'Unable to submit your inquiry. Please verify your details or email us directly at mmdigitagarage@gmail.com.';
                    showCtaError(errMsg);
                    if (ctaSubmitBtn) {
                        ctaSubmitBtn.disabled = false;
                        ctaSubmitBtn.innerHTML = origBtnHtml;
                    }
                }
            } catch (fetchErr) {
                showCtaError('Connection error: Unable to reach the server. Please check your network connection or email us directly at mmdigitagarage@gmail.com.');
                if (ctaSubmitBtn) {
                    ctaSubmitBtn.disabled = false;
                    ctaSubmitBtn.innerHTML = origBtnHtml;
                }
            }

            function showCtaError(msg) {
                if (ctaStatus) {
                    ctaStatus.className = 'cta-form-status error';
                    ctaStatus.innerHTML = '<i class="fas fa-exclamation-circle" style="margin-right: 6px;"></i> ' + msg;
                    ctaStatus.style.display = 'block';
                }
            }
        });

        // Real-time error dismissal when typing or selecting
        ctaForm.querySelectorAll('input, select, textarea').forEach(input => {
            const clearErr = () => {
                if (ctaStatus && ctaStatus.classList.contains('error')) {
                    ctaStatus.style.display = 'none';
                }
            };
            input.addEventListener('input', clearErr);
            input.addEventListener('change', clearErr);
        });
    }

    // =========================================================================
    // 6. TEAM CAROUSEL SCROLLING CONTROLS (Accommodates Full Team Showcase with Loop)
    // =========================================================================
    const teamGrid = document.querySelector('.team-grid-four');
    const teamPrev = document.querySelector('.team-prev');
    const teamNext = document.querySelector('.team-next');

    if (teamGrid && teamPrev && teamNext) {
        const getTeamStep = () => {
            const firstCard = teamGrid.querySelector('.team-card-item');
            if (!firstCard) return 300;
            const style = window.getComputedStyle(teamGrid);
            const gap = parseFloat(style.gap) || 20;
            return firstCard.offsetWidth + gap;
        };

        teamNext.addEventListener('click', () => {
            const step = getTeamStep();
            const maxScroll = teamGrid.scrollWidth - teamGrid.clientWidth;
            if (teamGrid.scrollLeft >= maxScroll - 15) {
                teamGrid.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                teamGrid.scrollBy({ left: step, behavior: 'smooth' });
            }
        });

        teamPrev.addEventListener('click', () => {
            const step = getTeamStep();
            if (teamGrid.scrollLeft <= 15) {
                const maxScroll = teamGrid.scrollWidth - teamGrid.clientWidth;
                teamGrid.scrollTo({ left: maxScroll, behavior: 'smooth' });
            } else {
                teamGrid.scrollBy({ left: -step, behavior: 'smooth' });
            }
        });

        // Mouse Drag to Scroll for Team Carousel
        let isDownTeam = false;
        let startXTeam = 0;
        let scrollStartLeftTeam = 0;

        teamGrid.addEventListener('mousedown', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            isDownTeam = true;
            teamGrid.classList.add('is-dragging');
            startXTeam = e.pageX - teamGrid.offsetLeft;
            scrollStartLeftTeam = teamGrid.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
            if (isDownTeam) {
                isDownTeam = false;
                teamGrid.classList.remove('is-dragging');
            }
        });

        teamGrid.addEventListener('mousemove', (e) => {
            if (!isDownTeam) return;
            e.preventDefault();
            const x = e.pageX - teamGrid.offsetLeft;
            const walk = (x - startXTeam) * 1.5;
            teamGrid.scrollLeft = scrollStartLeftTeam - walk;
        });
    }

    // =========================================================================
    // 6B. FEATURED WORK EMPTY LINK GUARD (Prevents navigation on pending links)
    // =========================================================================
    document.querySelectorAll('.work-card-item').forEach(card => {
        card.addEventListener('click', (e) => {
            const href = card.getAttribute('href');
            if (!href || href.trim() === '' || href === '#' || href.startsWith('javascript:')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // =========================================================================
    // 7. SERVICES SLIDER (Display 3 Services on Desktop with Slider Controls)
    // =========================================================================
    const servicesTrack = document.getElementById('servicesSliderTrack');
    const servicesPrev = document.querySelector('.services-prev');
    const servicesNext = document.querySelector('.services-next');
    const servicesDotsContainer = document.getElementById('servicesSliderDots');
    const servicesCurrentSlide = document.getElementById('servicesCurrentSlide');
    const servicesTotalSlides = document.getElementById('servicesTotalSlides');

    if (servicesTrack) {
        const cards = Array.from(servicesTrack.querySelectorAll('.service-card-item'));
        const totalCards = cards.length;

        if (servicesTotalSlides) {
            servicesTotalSlides.textContent = String(totalCards).padStart(2, '0');
        }

        const getCardStep = () => {
            const firstCard = cards[0];
            if (!firstCard) return 360;
            const style = window.getComputedStyle(servicesTrack);
            const gap = parseFloat(style.gap) || 24;
            return firstCard.offsetWidth + gap;
        };

        const updateActiveState = () => {
            const trackLeft = servicesTrack.getBoundingClientRect().left;
            let closestIndex = 0;
            let minDiff = Infinity;

            cards.forEach((card, idx) => {
                const diff = Math.abs(card.getBoundingClientRect().left - trackLeft);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = idx;
                }
            });

            if (servicesCurrentSlide) {
                servicesCurrentSlide.textContent = String(closestIndex + 1).padStart(2, '0');
            }

            if (servicesDotsContainer) {
                const dots = servicesDotsContainer.querySelectorAll('.services-slider-dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === closestIndex);
                    dot.setAttribute('aria-current', idx === closestIndex ? 'true' : 'false');
                });
            }
        };

        // Create pagination dots
        if (servicesDotsContainer) {
            servicesDotsContainer.innerHTML = '';
            cards.forEach((card, idx) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = `services-slider-dot ${idx === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to service ${idx + 1}`);
                dot.addEventListener('click', () => {
                    const step = getCardStep();
                    servicesTrack.scrollTo({ left: idx * step, behavior: 'smooth' });
                });
                servicesDotsContainer.appendChild(dot);
            });
        }

        if (servicesNext) {
            servicesNext.addEventListener('click', () => {
                const step = getCardStep();
                const maxScroll = servicesTrack.scrollWidth - servicesTrack.clientWidth;
                if (servicesTrack.scrollLeft >= maxScroll - 15) {
                    servicesTrack.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    servicesTrack.scrollBy({ left: step, behavior: 'smooth' });
                }
            });
        }

        if (servicesPrev) {
            servicesPrev.addEventListener('click', () => {
                const step = getCardStep();
                if (servicesTrack.scrollLeft <= 15) {
                    const maxScroll = servicesTrack.scrollWidth - servicesTrack.clientWidth;
                    servicesTrack.scrollTo({ left: maxScroll, behavior: 'smooth' });
                } else {
                    servicesTrack.scrollBy({ left: -step, behavior: 'smooth' });
                }
            });
        }

        // Mouse Drag to Scroll
        let isDown = false;
        let startX = 0;
        let scrollStartLeft = 0;

        servicesTrack.addEventListener('mousedown', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            isDown = true;
            servicesTrack.classList.add('is-dragging');
            startX = e.pageX - servicesTrack.offsetLeft;
            scrollStartLeft = servicesTrack.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                servicesTrack.classList.remove('is-dragging');
            }
        });

        servicesTrack.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - servicesTrack.offsetLeft;
            const walk = (x - startX) * 1.5;
            servicesTrack.scrollLeft = scrollStartLeft - walk;
        });

        // Scroll listener with requestAnimationFrame
        let ticking = false;
        servicesTrack.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveState();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Window resize update
        window.addEventListener('resize', updateActiveState);

        // Initial state update
        updateActiveState();
    }

    // =========================================================================
    // 9. CLIENT TESTIMONIALS SLIDER CONTROLS (Swipe, Pagination, Auto-rotation)
    // =========================================================================
    const testTrack = document.getElementById('testimonialsSliderTrack');
    const testPrev = document.querySelector('.testimonials-prev');
    const testNext = document.querySelector('.testimonials-next');
    const testDotsContainer = document.getElementById('testimonialsDots');
    const testCurrentPage = document.getElementById('testimonialsCurrentPage');
    const testTotalPages = document.getElementById('testimonialsTotalPages');

    if (testTrack) {
        const cards = Array.from(testTrack.querySelectorAll('.testimonial-card-item'));
        const totalCards = cards.length;

        const getTestStep = () => {
            const firstCard = cards[0];
            if (!firstCard) return 380;
            const style = window.getComputedStyle(testTrack);
            const gap = parseFloat(style.gap) || 28;
            return firstCard.offsetWidth + gap;
        };

        const updateTestActiveState = () => {
            const trackLeft = testTrack.getBoundingClientRect().left;
            let closestIndex = 0;
            let minDiff = Infinity;

            cards.forEach((card, idx) => {
                const diff = Math.abs(card.getBoundingClientRect().left - trackLeft);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIndex = idx;
                }
            });

            if (testCurrentPage) {
                testCurrentPage.textContent = String(closestIndex + 1).padStart(2, '0');
            }

            if (testDotsContainer) {
                const dots = testDotsContainer.querySelectorAll('.testimonials-dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === closestIndex);
                    dot.setAttribute('aria-selected', idx === closestIndex ? 'true' : 'false');
                });
            }
        };

        // Create pagination dots
        if (testDotsContainer) {
            testDotsContainer.innerHTML = '';
            cards.forEach((card, idx) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = `testimonials-dot ${idx === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to testimonial ${idx + 1}`);
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
                dot.addEventListener('click', () => {
                    const step = getTestStep();
                    testTrack.scrollTo({ left: idx * step, behavior: 'smooth' });
                });
                testDotsContainer.appendChild(dot);
            });
        }

        if (testTotalPages) {
            testTotalPages.textContent = String(totalCards).padStart(2, '0');
        }

        // Navigation Next
        const goToNext = () => {
            const step = getTestStep();
            const maxScroll = testTrack.scrollWidth - testTrack.clientWidth;
            if (testTrack.scrollLeft >= maxScroll - 15) {
                testTrack.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                testTrack.scrollBy({ left: step, behavior: 'smooth' });
            }
        };

        // Navigation Prev
        const goToPrev = () => {
            const step = getTestStep();
            if (testTrack.scrollLeft <= 15) {
                const maxScroll = testTrack.scrollWidth - testTrack.clientWidth;
                testTrack.scrollTo({ left: maxScroll, behavior: 'smooth' });
            } else {
                testTrack.scrollBy({ left: -step, behavior: 'smooth' });
            }
        };

        if (testNext) {
            testNext.addEventListener('click', goToNext);
        }

        if (testPrev) {
            testPrev.addEventListener('click', goToPrev);
        }

        // Mouse Drag to Scroll
        let isDownTest = false;
        let startXTest = 0;
        let scrollStartLeftTest = 0;

        testTrack.addEventListener('mousedown', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            isDownTest = true;
            testTrack.classList.add('is-dragging');
            startXTest = e.pageX - testTrack.offsetLeft;
            scrollStartLeftTest = testTrack.scrollLeft;
            stopAutoPlay();
        });

        window.addEventListener('mouseup', () => {
            if (isDownTest) {
                isDownTest = false;
                testTrack.classList.remove('is-dragging');
                startAutoPlay();
            }
        });

        testTrack.addEventListener('mousemove', (e) => {
            if (!isDownTest) return;
            e.preventDefault();
            const x = e.pageX - testTrack.offsetLeft;
            const walk = (x - startXTest) * 1.5;
            testTrack.scrollLeft = scrollStartLeftTest - walk;
        });

        // Auto-rotation every 7 seconds (if user prefers motion)
        let autoPlayTimer = null;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function startAutoPlay() {
            if (prefersReducedMotion) return;
            if (autoPlayTimer) clearInterval(autoPlayTimer);
            autoPlayTimer = setInterval(() => {
                goToNext();
            }, 7000);
        }

        function stopAutoPlay() {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
            }
        }

        // Pause auto-rotation on hover, focus, or touch
        testTrack.addEventListener('mouseenter', stopAutoPlay);
        testTrack.addEventListener('mouseleave', startAutoPlay);
        testTrack.addEventListener('touchstart', stopAutoPlay, { passive: true });
        testTrack.addEventListener('touchend', startAutoPlay, { passive: true });
        testTrack.addEventListener('focusin', stopAutoPlay);
        testTrack.addEventListener('focusout', startAutoPlay);

        // Start auto-play initially
        startAutoPlay();

        // Scroll listener with requestAnimationFrame
        let tickingTest = false;
        testTrack.addEventListener('scroll', () => {
            if (!tickingTest) {
                window.requestAnimationFrame(() => {
                    updateTestActiveState();
                    tickingTest = false;
                });
                tickingTest = true;
            }
        }, { passive: true });

        // Window resize update
        window.addEventListener('resize', updateTestActiveState);

        // Initial state update
        updateTestActiveState();
    }

    // =========================================================================
    // PROJECT LINKS: GUARD EMPTY/PENDING LINKS
    // =========================================================================
    document.querySelectorAll('.is-pending-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const url = link.getAttribute('data-project-url') || link.getAttribute('href');
            if (!url || url.trim() === '' || url === '#') {
                e.preventDefault();
            }
        });
    });

    // =========================================================================
    // AGENCY ACHIEVEMENTS & STATISTICS (Central Config & Smooth Counter)
    // =========================================================================
    /**
     * Central Editable Configuration for Agency Statistics.
     * Update target numbers, suffixes, and labels here as figures are verified.
     */
    const AGENCY_STATS_CONFIG = {
        'stat-brands': {
            target: 55,
            suffix: '+',
            isPlaceholder: true,
            label: 'Brands & Businesses Served'
        },
        'stat-projects': {
            target: 130,
            suffix: '+',
            isPlaceholder: true,
            label: 'Projects Completed'
        },
        'stat-services': {
            target: 25,
            suffix: '+',
            isPlaceholder: true,
            label: 'Digital Services'
        },
        'stat-satisfaction': {
            target: 97,
            suffix: '%',
            isPlaceholder: true,
            label: 'Client Satisfaction'
        }
    };

    const statsSection = document.getElementById('stats');
    if (statsSection) {
        const statNumberEls = statsSection.querySelectorAll('.stat-number');
        let statsAnimated = false;

        const animateStats = () => {
            if (statsAnimated) return;
            statsAnimated = true;

            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            statNumberEls.forEach(el => {
                const statId = el.getAttribute('data-stat-id');
                const config = AGENCY_STATS_CONFIG[statId];
                const target = config ? config.target : parseInt(el.getAttribute('data-target') || '0', 10);

                if (prefersReducedMotion) {
                    el.textContent = target;
                    return;
                }

                // Smooth count-up animation
                const duration = 1600; // ms
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Cubic ease-out curve
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const currentVal = Math.floor(easeOut * target);

                    el.textContent = currentVal;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        el.textContent = target;
                    }
                };

                requestAnimationFrame(updateCount);
            });
        };

        if ('IntersectionObserver' in window) {
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateStats();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.25,
                rootMargin: '0px 0px -40px 0px'
            });

            statsObserver.observe(statsSection);
        } else {
            // Fallback for older browsers
            animateStats();
        }
    }
});