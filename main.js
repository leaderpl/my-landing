// ===========================
// Global Variables
// ===========================
let currentCategory = 'all';
let referencesData = [];
let reviewsData = [];

// ===========================
// Navigation Functionality
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollTopBtn = document.getElementById('scrollTop');

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Show/hide scroll to top button
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    // Mobile menu toggle
    mobileToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
    });

    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll to top functionality
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Initialize all sections
    initReferences();
    initReviews();
    initContactForm();
    initReviewForm();
});

// ===========================
// References Section
// ===========================
async function initReferences() {
    try {
        const response = await fetch('tables/references?limit=100');
        const result = await response.json();
        referencesData = result.data || [];
        renderReferences(referencesData);
        setupReferenceFilters();
    } catch (error) {
        console.error('Error loading references:', error);
        document.getElementById('referencesGrid').innerHTML = 
            '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">레퍼런스를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

function renderReferences(data) {
    const grid = document.getElementById('referencesGrid');
    
    if (!data || data.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">레퍼런스가 없습니다.</p>';
        return;
    }

    grid.innerHTML = data.map(ref => `
        <div class="reference-card" data-category="${ref.category}">
            <div class="reference-image ${ref.image_url ? '' : 'placeholder'}">
                ${ref.image_url 
                    ? `<img src="${ref.image_url}" alt="${ref.title}">` 
                    : '<i class="fas fa-graduation-cap"></i>'}
                <span class="reference-badge">${ref.category}</span>
            </div>
            <div class="reference-content">
                <div class="reference-institution">${ref.institution}</div>
                <h3 class="reference-title">${ref.title}</h3>
                <div class="reference-date"><i class="fas fa-calendar-alt"></i> ${ref.date}</div>
                <p class="reference-description">${ref.description}</p>
                ${ref.participants ? `
                    <div class="reference-meta">
                        <i class="fas fa-users"></i>
                        <span>참여 인원: ${ref.participants}명</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function setupReferenceFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            currentCategory = category;
            
            // Filter references
            if (category === 'all') {
                renderReferences(referencesData);
            } else {
                const filtered = referencesData.filter(ref => ref.category === category);
                renderReferences(filtered);
            }
        });
    });
}

// ===========================
// Reviews Section
// ===========================
async function initReviews() {
    try {
        const response = await fetch('tables/reviews?limit=100');
        const result = await response.json();
        // Filter only approved reviews
        reviewsData = (result.data || []).filter(review => review.approved === true);
        renderReviews(reviewsData);
    } catch (error) {
        console.error('Error loading reviews:', error);
        document.getElementById('reviewsGrid').innerHTML = 
            '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">리뷰를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

function renderReviews(data) {
    const grid = document.getElementById('reviewsGrid');
    
    if (!data || data.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">리뷰가 없습니다.</p>';
        return;
    }

    grid.innerHTML = data.map(review => `
        <div class="review-card">
            <i class="fas fa-quote-right review-icon"></i>
            <div class="review-header">
                <div class="review-author">
                    <div class="review-name">${review.name}</div>
                    <div class="review-position">${review.position || ''} ${review.company ? `· ${review.company}` : ''}</div>
                </div>
                <div class="review-rating">
                    ${generateStars(review.rating)}
                </div>
            </div>
            <div class="review-course">${review.course}</div>
            <p class="review-content">${review.content}</p>
        </div>
    `).join('');
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// ===========================
// Review Form
// ===========================
function initReviewForm() {
    const form = document.getElementById('reviewForm');
    const ratingStars = document.querySelectorAll('.rating-input i');
    const ratingInput = document.getElementById('reviewRating');

    // Rating stars functionality
    ratingStars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            ratingInput.value = rating;
            
            // Update star display
            ratingStars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Set initial rating to 5 stars
    ratingStars.forEach(star => star.classList.add('active'));

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('reviewName').value.trim(),
            company: document.getElementById('reviewCompany').value.trim(),
            position: document.getElementById('reviewPosition').value.trim(),
            course: document.getElementById('reviewCourse').value.trim(),
            rating: parseInt(document.getElementById('reviewRating').value),
            content: document.getElementById('reviewContent').value.trim(),
            approved: false // Reviews need approval
        };

        // Validate
        if (!formData.name || !formData.course || !formData.content) {
            showMessage('필수 항목을 모두 입력해주세요.', 'error');
            return;
        }

        if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
            showMessage('평점을 선택해주세요.', 'error');
            return;
        }

        try {
            const response = await fetch('tables/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showMessage('리뷰가 성공적으로 제출되었습니다. 관리자 승인 후 게시됩니다.', 'success');
                form.reset();
                // Reset rating to 5 stars
                ratingInput.value = 5;
                ratingStars.forEach(star => star.classList.add('active'));
            } else {
                throw new Error('Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showMessage('리뷰 제출 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
    });
}

// ===========================
// Contact Form
// ===========================
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contactName').value.trim(),
            email: document.getElementById('contactEmail').value.trim(),
            phone: document.getElementById('contactPhone').value.trim(),
            company: document.getElementById('contactCompany').value.trim(),
            subject: document.getElementById('contactSubject').value.trim(),
            message: document.getElementById('contactMessage').value.trim(),
            status: 'pending'
        };

        // Validate
        if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
            showMessage('필수 항목을 모두 입력해주세요.', 'error');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showMessage('올바른 이메일 주소를 입력해주세요.', 'error');
            return;
        }

        try {
            const response = await fetch('tables/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showMessage('문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.', 'success');
                form.reset();
            } else {
                throw new Error('Failed to submit inquiry');
            }
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            showMessage('문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
    });
}

// ===========================
// Utility Functions
// ===========================
function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 20px 30px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-size: 15px;
        font-weight: 600;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    messageDiv.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 5000);
}

// ===========================
// Animation on Scroll
// ===========================
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe service cards, reference cards, review cards
    document.querySelectorAll('.service-card, .reference-card, .review-card').forEach(el => {
        observer.observe(el);
    });
}

// Call observe when DOM is loaded and after data is rendered
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(observeElements, 500);
});
