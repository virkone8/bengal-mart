(function ($) {
  'use strict';

  $('[data-toggle="tooltip"]').tooltip();

  $('#exampleModalCenter').modal('show');


 $('.btn').click(function(){
     $('#exampleModalCenter').modal('hide');
  });

  var fullHeight = function () {
    $('.js-fullheight').css('height', $(window).height());
    $(window).resize(function () {
      $('.js-fullheight').css('height', $(window).height());
    });
  };
  fullHeight();
})(jQuery);


