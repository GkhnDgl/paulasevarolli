// Listen for scroll events on the window
window.addEventListener('scroll', () => {
  // Get the current vertical scroll position
  const scrollY = window.scrollY;
  // Select the hero section element
  const hero = document.querySelector('.hero');
  // Select the h1 element inside hero
  const h1 = document.querySelector('.hero h1');
  // Select the p element inside hero
  const p = document.querySelector('.hero p');
  // Select the button element inside hero
  const btn = document.querySelector('.hero-btn');

  // If scrolled more than 50px, start the shrinking effect
  if (scrollY > 50) {
    // Calculate progress from 0 to 1 based on scroll distance (full at 150px scroll)
    const progress = Math.min((scrollY - 50) / 100, 1); // start after 50px, full at 150px
    // Calculate new height for hero (shrinks from 90vh to 20vh)
    const newHeight = 90 - 70 * progress; // from 90vh to 20vh
    // Apply the new height to hero
    hero.style.height = newHeight + 'vh';
    // Calculate new font size for h1 (shrinks from 90px to 24px)
    const newFontSize = 90 - 66 * progress; // from 90px to 24px
    // Apply the new font size to h1
    h1.style.fontSize = newFontSize + 'px';
    // Fade out the paragraph and button based on progress
    p.style.opacity = 1 - progress;
    btn.style.opacity = 1 - progress;
  } else {
    // Reset to initial state when scrolled back to top
    hero.style.position = 'relative';
    hero.style.height = '90vh';
    h1.style.fontSize = '90px';
    p.style.opacity = 1;
    btn.style.opacity = 1;
    document.body.style.paddingTop = '0';
  }
});

// Function to show subpage
function showSubpage(service) {
  // Hide main sections
  document.querySelector('.about').style.display = 'none';
  document.querySelector('.services').style.display = 'none';
  document.querySelector('.contact').style.display = 'none';
  // Show the selected subpage
  document.getElementById(service).style.display = 'block';
  // Scroll to top
  window.scrollTo(0, 0);
}

// Function to show main page
function showMain() {
  // Hide all subpages
  document.querySelectorAll('.subpage').forEach(sub => sub.style.display = 'none');
  // Show main sections
  document.querySelector('.about').style.display = 'block';
  document.querySelector('.services').style.display = 'block';
  document.querySelector('.contact').style.display = 'block';
  // Scroll to top
  window.scrollTo(0, 0);
}

// Add event listeners to service cards
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const service = card.getAttribute('data-service');
      showSubpage(service);
    });
    // Make cursor pointer
    card.style.cursor = 'pointer';
  });
});