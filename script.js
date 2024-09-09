// Refined Advanced Card Animation System
class CardAnimationSystem {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.cards = Array.from(this.container.querySelectorAll('.card'));
        this.currentIndex = 0;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchEndX = 0;

        // Configuration
        this.animationDuration = 600; // ms
        this.perspective = 2000; // px
        this.maxRotation = 15; // degrees (reduced for smoother animation)
        this.maxElevation = 30; // px
        this.cardOffset = 5; // px (offset for card stacking)
        this.peekOffset = 20; // px (how much of the next card is visible)
        this.easing = 'cubic-bezier(0.645, 0.045, 0.355, 1.000)'; // Easing function
        
        // Hover animation configuration
        this.hoverRotation = 4; // degrees
        this.hoverElevation = 30; // px

        this.init();
    }

    init() {
        this.setupStyles();
        this.setupEventListeners();
        this.positionCards();
    }

    setupStyles() {
        this.container.style.perspective = `${this.perspective}px`;
        this.cards.forEach((card, index) => {
            card.style.position = 'absolute';
            card.style.width = '100%';
            card.style.height = '100%';
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = `transform ${this.animationDuration}ms ${this.easing}, opacity ${this.animationDuration}ms ${this.easing}`;
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            card.style.borderRadius = '15px';
            card.style.overflow = 'hidden';
        });
    }

    setupEventListeners() {
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    positionCards() {
        this.cards.forEach((card, index) => {
            const offset = index - this.currentIndex;
            const zIndex = this.cards.length - Math.abs(offset);
            const translateZ = -Math.abs(offset) * this.cardOffset;
            const translateY = Math.abs(offset) * this.cardOffset;
            const opacity = 1 - (Math.abs(offset) * 0.2);
            const scale = 1 - (Math.abs(offset) * 0.05);

            card.style.zIndex = zIndex;
            card.style.transform = `translateY(${translateY}px) translateZ(${translateZ}px) scale(${scale})`;
            card.style.opacity = opacity;
        });

        // Adjust the position of the card below to create the peeking effect
        if (this.currentIndex < this.cards.length - 1) {
            const nextCard = this.cards[this.currentIndex + 1];
            nextCard.style.transform = `translateY(${this.peekOffset}px) translateZ(-${this.cardOffset}px) scale(0.95)`;
        }
    }

    switchCard(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const previousIndex = this.currentIndex;
        this.currentIndex = (this.currentIndex + direction + this.cards.length) % this.cards.length;

        const currentCard = this.cards[previousIndex];
        const nextCard = this.cards[this.currentIndex];

        // Animate current card out
        currentCard.style.transform = `translateX(${-direction * 100}%) rotateY(${direction * this.maxRotation}deg)`;
        currentCard.style.opacity = '0';

        // Animate next card in
        nextCard.style.transform = 'translateY(0) translateZ(0) scale(1)';
        nextCard.style.opacity = '1';

        // Reset positions after animation
        setTimeout(() => {
            this.positionCards();
            this.isAnimating = false;
        }, this.animationDuration);
    }

    handleClick(event) {
        const rect = this.container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const direction = x < rect.width / 2 ? -1 : 1;
        this.switchCard(direction);
    }

    handleMouseMove(event) {
        if (this.isAnimating) return;

        const rect = this.container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * this.hoverRotation * 2;
        const rotateX = (y - 0.5) * -this.hoverRotation * 2;
        const translateZ = this.hoverElevation;

        const currentCard = this.cards[this.currentIndex];
        currentCard.style.transform = `translateY(0) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Adjust the peeking card
        if (this.currentIndex < this.cards.length - 1) {
            const nextCard = this.cards[this.currentIndex + 1];
            nextCard.style.transform = `translateY(${this.peekOffset + 5}px) translateZ(-${this.cardOffset}px) scale(0.95)`;
        }
    }

    handleMouseLeave() {
        if (!this.isAnimating) {
            this.positionCards();
        }
    }

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
    }

    handleTouchMove(event) {
        this.touchEndX = event.touches[0].clientX;
    }

    handleTouchEnd() {
        const touchDiff = this.touchStartX - this.touchEndX;
        if (Math.abs(touchDiff) > 50) {
            this.switchCard(touchDiff > 0 ? 1 : -1);
        }
    }
}

// Particle System
class ParticleSystem {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.magicalParticles = this.container.querySelector('.magical-particles');
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    }

    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (Math.abs(x - this.lastMouseX) > 5 || Math.abs(y - this.lastMouseY) > 5) {
            this.createParticle(x, y);
            this.lastMouseX = x;
            this.lastMouseY = y;
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove(touch);
    }

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        this.magicalParticles.appendChild(particle);

        const animation = particle.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`, opacity: 0 }
        ], {
            duration: Math.random() * 1000 + 500,
            easing: 'cubic-bezier(0, .9, .57, 1)',
            delay: Math.random() * 200
        });

        animation.onfinish = () => {
            particle.remove();
        };
    }
}

// Initialize the systems
document.addEventListener('DOMContentLoaded', () => {
    const cardSystem = new CardAnimationSystem('.card-stack');
    const particleSystem = new ParticleSystem('#character-cover');
});