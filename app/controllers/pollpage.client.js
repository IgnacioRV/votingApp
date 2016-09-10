var name; 
var id; 
var selected; 
var v = [['option', 'votes']];
 var userUrl = window.location.origin+'/api/getuser';
   var addOptUrl = window.location.origin+'/api/addoption';
   var voteForUrl = window.location.origin+'/api/votefor';
   var pollUrl = window.location.origin+'/api/poll';
   var route = window.location.pathname; 
   var voteButton = document.querySelector('#vote');
   var submitButton = document.querySelector('#send');
   var option = document.querySelector("#opt");
(function () {
	// Make an ajax call to get all the poll options and the title, get which poll from the path 
	// Create a button for each option, which on click sends a post to /api/votefor 
	// in the post data we should send the poll and the option we vote for
	voteButton.addEventListener('click', function() { 
              	voteFor(selected);
  	});

  	submitButton.addEventListener('click', function() {
  		$.ajax({
          url: addOptUrl,
          data: {
          	"id": id,
          	"opt": option.value 
          },
          contentType: 'application/json; charset=utf-8',
          cache: false,
          type: "POST",
          success: function(response) {
	          alert(response.message);
	          location.reload();
	      },
          error: function(xhr) {
              console.log("error")
          }
      });

  		console.log("Submitted");
  	});

    id = route.split('/')[2];
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
          data: { 
              "id": id
          },
          cache: false,
          type: "POST",
          success: function(response) {

          	$("#polltitle").text(response.title);
          	console.log(response.title);
          	console.log(response.opt);
            	
            response.opt.forEach((value, index)=>{
              var option = response.opt[index].name;
              var unit = [option, response.opt[index].votes];
              v.push(unit);
              console.log(v);
              console.log("name: "+option +" votes: "+ response.opt[index].votes);
              var r=$('<input/>').attr({
                  type: "button",
                  value: option,
                  class: "btn btn-default",
                  id: "button"+index
              });

              $("#list").append(r); 
              $("#button"+index).click(function() {
              	selected = option;
              	document.getElementById("button"+index).class = "btn btn-info";
              });
                        
            });
            loadChart();
			
          },
          error: function(xhr) {
              console.log("error")
          }
      });

      function loadChart(){
	  google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var data = google.visualization.arrayToDataTable(v);

        var options = {
          title: 'Poll results'
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
        document.getElementById('piechart').style.display = 'none';
      }
  	}
      
})();
function voteFor(option){
	console.log("Voted for " + option);
		$.ajax({
		          url: voteForUrl,
		          data: {
		          	"id": id,
		          	"name": option 
		          },
		          contentType: 'application/json; charset=utf-8',
		          cache: false,
		          type: "POST",
		          success: function(response) {
			          alert(response.message);
			          location.reload();
			      },
		          error: function(xhr) {
		              console.log("error")
		          }
		      });

}
$("#toggle").click(function(){
	console.log("clicked");
      $("#creation").slideToggle(500);
});

$("#showresult").click(function(){
	console.log("clicked");
      $("#piechart").slideToggle(500);
});