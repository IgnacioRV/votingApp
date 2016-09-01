'use strict';

(function () {
   
   var submitButton = document.querySelector('#Submit');
   var uname = document.querySelector('#username');
   var pwd = document.querySelector('#password');
   var mail = document.querySelector('#email');   
   var apiUrl = window.location.origin +'/api/newuser';

   
   submitButton.addEventListener('click', function () {
     $.ajax({
            url: apiUrl,
             data: { 
              "name": uname.value, 
              "pwd": pwd.value, 
              "mail": mail.value
          },
          contentType: 'application/json; charset=utf-8',
          cache: false,
          type: "POST",
          success: function(response) {
              alert(response.message)
              if (response.message == "Ok"){
                 location.href = "/login";
              }
          },
          error: function(xhr) {
            console.log("error")
          }
      });
   }, false);


})();
