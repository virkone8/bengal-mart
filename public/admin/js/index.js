const sideMenu = document.querySelector('aside');
const menuBtn = document.querySelector('#menu-btn');
const closeBtn = document.querySelector('#close-btn');
const themeToggler = document.querySelector('.theme-toggler');

//Show Sidebar
menuBtn.addEventListener('click', () => {
  sideMenu.style.display = 'block';
});

//Close Sidebar
closeBtn.addEventListener('click', () => {
  sideMenu.style.display = 'none';
});

//Change theme
themeToggler.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme-variables');

  themeToggler.querySelector('i:nth-child(1)').classList.toggle('active');
  themeToggler.querySelector('i:nth-child(2)').classList.toggle('active');
  // themeToggler.querySelector('i').classList.toggle('active');
});

// JQuery
$(document).ready(function(){
  $(".profile").mouseenter(function(){
    $(".logout").slideDown(1000);
  });
  $(".profile").mouseleave(function(){
    $(".logout").slideUp(1000);
  });
});