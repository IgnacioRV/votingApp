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
   var delPollUrl = window.location.origin+'/api/delPoll';


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
            $("#list").text("");
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
              var val = "button" + index;
              var delID = "del" + index;
              var buttonTitle = poll.title.slice(0,40);
              if (poll.title.length > 37) buttonTitle += "...";
              var r2 = "<div class = 'btn-group container'> <button id = '"+val+"' class = 'btn btn-default col-xs-8'>"+buttonTitle+"</button><button id = '"+delID+"' class = 'btn btn-danger'>X</button></div>";
              $("#list").append(r2); 
              $("#button"+index).click(function() {
                location.href = "/"+name+"/"+poll._id;
                console.log(poll.title);
              });
              $("#del"+index).click(function() {
                 $.ajax({
                            url: delPollUrl,
                            data: { 
                              "id": poll._id
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
