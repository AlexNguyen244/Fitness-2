//import data from './data.js';
import barchart from './barchart.js';

barchart.init('chart-anchor', 500, 300);

function changeAxis(data, activity) {
  if (activity == 'Empty') {
    barchart.render(data, 'Day of the Week', '');
  }
  if (activity == 'Walk') {
    barchart.render(data, 'Day of the Week', 'Kilometers Walked');
  }
  if (activity == 'Run') {
    barchart.render(data, 'Day of the Week', 'Kilometers Run');
  }
  if (activity == 'Swim') {
    barchart.render(data, 'Day of the Week', 'Laps Swam');
  }
  if (activity == 'Bike') {
    barchart.render(data, 'Day of the Week', 'Kilometers Biked');
  }
  if (activity == 'Yoga') {
    barchart.render(data, 'Day of the Week', 'Minutes of Yoga');
  }
  if (activity == 'Soccer') {
    barchart.render(data, 'Day of the Week', 'Minutes of Soccer');
  }
  if (activity == 'Basketball') {
    barchart.render(data, 'Day of the Week', 'Minutes of Basketball');
  }
}

let go_button = document.getElementById('goButton');
go_button.addEventListener('click', updateChart);

let view_progress_button = document.getElementById('viewProgressButton');
view_progress_button.addEventListener('click', viewProgressOn);

let exit_view_progress_button = document.getElementById('exitViewProg');
exit_view_progress_button.addEventListener('click', viewProgressOff);

function viewProgressOn() {
  updateChart();
  document.getElementById('overlay').style.display = 'flex';
}

function updateChart() {
  let activity = document.getElementById('viewProg-pAct-activity').value;
  let date = document.getElementById('viewProg-pAct-date').valueAsDate.getTime();

  date = date + new Date().getTimezoneOffset() * 60000;
  fetch(`/week/${date}/${activity}`)
    .then(response => {
      response.json()
        .then(activity => {
          // Console logging according to the demo video
          console.log(activity);
            if (typeof (activity['message']) == 'string') {
              window.alert(activity['message']);
              let noData = activity;
              changeAxis(noData, "Empty");
            } else {
              let formatedData = formatChartData(activity);
              changeAxis(formatedData, activity[0]['activity']);
              document.getElementById('viewProg-pAct-activity').value = activity[0]['activity'];
            }
        })
        .catch(function(error) {
          console.log('Error getting activity', error);
        });
    })
    .catch(function(error) {
      console.log('Error with getting data from db', error);
    });
}


function formatChartData(activities) {
  // Format response into readable chart data
  let formatedData = activities.map(function(obj) {
    return {
      date: obj.date,
      value: obj.value
    }
  });
  
  return formatedData;
}




