'use strict';
$("#toggle").click(function(){
      $("#creation").slideToggle(500);
    });
var name; 

(function () {


   var submitButton = document.querySelector('#send');
   var title = document.querySelector('#tit');
   var opt1 = document.querySelector('#opt1');
   var opt2 = document.querySelector('#opt2');   
   var apiUrl = window.location.origin +'/api/addpoll';
   var pollUrl = window.location.origin+'/api/getpolls';
   var userUrl = window.location.origin+'/api/getuser';

    $.ajax({
          url: userUrl,
          contentType: 'application/json; charset=utf-8',
          cache: false,
          type: "POST",
          success: function(response) {
              name = response.message;
              $("#name").text(name);
          },
          error: function(xhr) {
              console.log("error")
          }
      });
    
    $.ajax({
          url: pollUrl,
          contentType: 'application/json; charset=utf-8',
          cache: false,
          type: "POST",
          success: function(response) {
            response.forEach((value, index)=>{
              var poll = response[index];
              console.log(poll);

              /*
              After calling the API to get the polls from the user we
              iterate and create a button for each poll
              */
              var r=$('<input/>').attr({
                  type: "button",
                  value: poll.title,
                  class: "btn btn-default",
                  id: "button"+index
              });

              $("#list").append(r); 
              $("#button"+index).click(function() {
                location.href = "/"+name+"/"+poll._id;
                console.log(poll.title);
              });

              //----------------------
            });
          },
          error: function(xhr) {
              console.log("error")
          }
      });
   
   submitButton.addEventListener('click', function () {
     $.ajax({
            url: apiUrl,
             data: { 
              "title": title.value, 
              "opt1": opt1.value, 
              "opt2": opt2.value
          },
          contentType: 'application/json; charset=utf-8',
          cache: false,
          type: "POST",
          success: function(response) {
              alert(response.message)
              if (response.status == "Ok"){
                 // location.href = "/login"; 
                 location.reload();
              }
          },
          error: function(xhr) {
            console.log("error")
          }
      });
   }, false);

  
})();
