'use strict';

(function () {
   
   var submitButton = document.querySelector('#Submit');
   var uname = document.querySelector('#username');
   var pwd = document.querySelector('#password'); 
   var apiUrl = window.location.origin +'/api/login';

   
   submitButton.addEventListener('click', function () {
    
        $.ajax({
            url: apiUrl,
             data: { 
              "name": uname.value, 
              "pwd": pwd.value
          },
          contentType: 'application/json; charset=utf-8',
          cache: false,
          type: "POST",
          success: function(response) {
              alert(response.message);
              //IF CORRECT IT SHOULD REDIRECT TO MAIN PAGE 
              if (response.status == "Ok") {
                location.href = "/main";
              }
          },
          error: function(xhr) {
            console.log("error")
          }
      });
   }, false);


})();