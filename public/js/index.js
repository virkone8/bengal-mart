$('document').ready(function (){
  $('.sign-up').click(function (){
    $('.sign-2').css('display','block');
    $('.sign').css('display','none');
  })
  $('.sign-in').click(function (){
    $('.sign').css('display','block');
    $('.sign-2').css('display','none');
  })
})