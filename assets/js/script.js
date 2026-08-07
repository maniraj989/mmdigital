document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Effect
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Toggle icon between bars and times
            const icon = mobileBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');

            // Active link highlighting
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // 3. Scroll Reveal Animation using Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Progress Bar Animation
    const progressBars = document.querySelectorAll('.progress-bar-fill');

    const progressObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });

    // 5. Parallax effect for glow orbs
    const orbs = document.querySelectorAll('.glow-orb');

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const moveX = (x * speed) - (speed / 2);
            const moveY = (y * speed) - (speed / 2);

            // Apply a slight transform in addition to the CSS animation
            orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    // 6. Particle Network Background
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles;

        function initCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            const particleCount = Math.floor(width / 15); // Dynamic count based on screen size

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 0.5
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.4)'; // Neon blue
            ctx.lineWidth = 0.5;

            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Draw point
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Draw connecting lines
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const distance = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(176, 38, 255, ${(1 - distance / 100) * 0.3})`; // Fading purple lines
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(drawParticles);
        }

        window.addEventListener('resize', initCanvas);
        initCanvas();
        drawParticles();
    }

    // 7. Generic Slider Implementation (for Team and Testimonials)
    function initSlider(config) {
        const track = document.querySelector(config.trackSelector);
        const slides = Array.from(document.querySelectorAll(config.slideSelector));
        const nextBtn = document.querySelector(config.nextBtnSelector);
        const prevBtn = document.querySelector(config.prevBtnSelector);
        const dotsContainer = document.querySelector(config.dotsSelector);
        const sliderOuter = document.querySelector(config.outerSelector);

        if (!track || slides.length === 0) return;

        let currentIndex = 0;
        let slidesPerView = 3;
        let autoPlayTimer = null;

        // Generate pagination dots
        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            const totalDots = slides.length - slidesPerView + 1;
            if (totalDots <= 1) return;

            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoplay();
                });
                dotsContainer.appendChild(dot);
            }
        }

        // Calculate slider metrics dynamically based on layout/viewport
        function updateSliderMetrics() {
            const width = window.innerWidth;
            if (width > 992) {
                slidesPerView = 3;
            } else if (width > 768) {
                slidesPerView = 2;
            } else {
                slidesPerView = 1;
            }

            // Cap currentIndex if it exceeds max index
            const maxIndex = slides.length - slidesPerView;
            if (currentIndex > maxIndex) {
                currentIndex = Math.max(0, maxIndex);
            }

            createDots();
            updateSliderPosition();
        }

        // Position the slider track
        function updateSliderPosition() {
            if (slides.length === 0) return;
            const slideWidth = slides[0].getBoundingClientRect().width;
            
            // Gap between slides
            const gap = parseFloat(getComputedStyle(track).gap) || 32;
            const amountToMove = currentIndex * (slideWidth + gap);
            track.style.transform = `translateX(-${amountToMove}px)`;

            // Update disabled status on navigation buttons
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex >= slides.length - slidesPerView;

            // Update dots
            if (dotsContainer) {
                const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
                dots.forEach((dot, idx) => {
                    if (idx === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        }

        // Navigate to specific index
        function goToSlide(index) {
            const maxIndex = slides.length - slidesPerView;
            if (index < 0) {
                currentIndex = 0;
            } else if (index > maxIndex) {
                currentIndex = Math.max(0, maxIndex);
            } else {
                currentIndex = index;
            }
            updateSliderPosition();
        }

        // Button events
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentIndex + 1);
                resetAutoplay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentIndex - 1);
                resetAutoplay();
            });
        }

        // Autoplay functions
        function startAutoplay() {
            autoPlayTimer = setInterval(() => {
                const maxIndex = slides.length - slidesPerView;
                if (currentIndex >= maxIndex) {
                    goToSlide(0); // loop back
                } else {
                    goToSlide(currentIndex + 1);
                }
            }, config.interval || 5000);
        }

        function stopAutoplay() {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
            }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Swipe / Drag Interactivity
        let startX = 0;
        let isDragging = false;
        let currentTranslate = 0;
        let prevTranslate = 0;

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        function dragStart(event) {
            isDragging = true;
            startX = getPositionX(event);
            stopAutoplay();
            
            const style = window.getComputedStyle(track);
            const matrix = new WebKitCSSMatrix(style.transform);
            prevTranslate = matrix.m41;
            track.style.transition = 'none';
        }

        function dragMove(event) {
            if (!isDragging) return;
            const currentX = getPositionX(event);
            const diffX = currentX - startX;
            currentTranslate = prevTranslate + diffX;
            track.style.transform = `translateX(${currentTranslate}px)`;
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

            const movedBy = currentTranslate - prevTranslate;

            if (movedBy < -50 && currentIndex < slides.length - slidesPerView) {
                goToSlide(currentIndex + 1);
            } else if (movedBy > 50 && currentIndex > 0) {
                goToSlide(currentIndex - 1);
            } else {
                goToSlide(currentIndex);
            }

            startAutoplay();
        }

        // Drag listeners for mouse
        track.addEventListener('mousedown', dragStart);
        track.addEventListener('mousemove', dragMove);
        window.addEventListener('mouseup', dragEnd);
        track.addEventListener('mouseleave', dragEnd);

        // Touch listeners for mobile
        track.addEventListener('touchstart', dragStart);
        track.addEventListener('touchmove', dragMove);
        track.addEventListener('touchend', dragEnd);

        // Pause autoplay on hover
        if (sliderOuter) {
            sliderOuter.addEventListener('mouseenter', stopAutoplay);
            sliderOuter.addEventListener('mouseleave', startAutoplay);
        }

        // Init and resize event listeners
        window.addEventListener('resize', updateSliderMetrics);
        
        // Initial setup
        setTimeout(() => {
            updateSliderMetrics();
            startAutoplay();
        }, 100);
    }

    // Initialize Team Slider
    initSlider({
        trackSelector: '.team-slider-track',
        slideSelector: '.team-slide',
        nextBtnSelector: '.team-slider-outer .next-btn',
        prevBtnSelector: '.team-slider-outer .prev-btn',
        dotsSelector: '.team-slider-outer .slider-dots',
        outerSelector: '.team-slider-outer',
        interval: 5000
    });

    // Initialize Testimonials Slider
    initSlider({
        trackSelector: '.testimonial-slider-track',
        slideSelector: '.testimonial-slide',
        nextBtnSelector: '.testimonial-next-btn',
        prevBtnSelector: '.testimonial-prev-btn',
        dotsSelector: '.testimonial-dots',
        outerSelector: '.testimonial-slider-outer',
        interval: 6000
    });
});