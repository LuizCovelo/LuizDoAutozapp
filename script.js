const carousel = document.querySelector('.carousel-inner');
const items = document.querySelectorAll('.carousel-item');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');

let current = 0;

function updateCarousel() {
    carousel.style.transform = `translateX(-${current * 100}%)`;
}

next.addEventListener('click', () => {
    current = (current + 1) % items.length;
    updateCarousel();
});

prev.addEventListener('click', () => {
    current = (current - 1 + items.length) % items.length;
    updateCarousel();
});

setInterval(() => {
    current = (current + 1) % items.length;
    updateCarousel();
}, 5000);
