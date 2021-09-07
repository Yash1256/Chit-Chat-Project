const section1 = document.querySelector('.section1');
const section2 = document.querySelector('.section2');
const nextBtn = document
  .querySelector('.nextBtn')
  .addEventListener('click', function () {
    section1.style.display = 'none';
    section2.style.display = 'block';
  });
