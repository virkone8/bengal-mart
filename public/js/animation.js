$(document).ready(function(){
     $('.hello-banner').owlCarousel({
      items:1,
      margin: 20,
      loop:true,
      dots:false,
      // nav:true,
      autoplay:true,
      autoplayTimeout: 2000,
      animateOut: 'slideOutDown',
      animateIn: 'flipInX',
      // navText:['<i class="fa-solid fa-chevron-left"></i>','<i class="fa-solid fa-chevron-right"></i>'],
      // stagePadding:50,
    //   responsive:{
    //         0:{
    //             items:1,
    //             nav:true
    //         },
    //         600:{
    //             items:3,
    //             nav:false
    //         },
    //         1000:{
    //             items:5,
    //             nav:true,
    //             loop:false
    //         }
    // }
     })

      $('.deal').owlCarousel({
      items:7,
      margin: 40,
      loop:true,
      dots:false,
      // nav:true,
      autoplay:true,
      autoplayTimeout: 2000,
      autoWidth:true,
      // navText:['<i class="fa-solid fa-chevron-left"></i>','<i class="fa-solid fa-chevron-right"></i>'],
      // stagePadding:50,
    //   responsive:{
    //         0:{
    //             items:5,
    //             nav:true
    //         },
    //         600:{
    //             items:7,
    //             nav:false
    //         },
    //         1000:{
    //             items:7,
    //             nav:true,
    //             loop:false
    //         },
    //         2000:{
    //             items:7,
    //             nav:true,
    //             loop:false
    //         }

    // }
     })

   })