'use strict'

// A server that uses a database. 

// express provides basic server functions
const express = require("express");

// our database operations
const dbo = require('./databaseOps');
//dbo.clearDB();

// object that provides interface for express
const app = express();

// use this instead of the older body-parser
app.use(express.json());

// make all the files in 'public' available on the Web
app.use(express.static('public'))

// when there is nothing following the slash in the url, return the main page of the app.
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});


app.get("/reminder", (request, response) => {
  let recentActivity = null;
  dbo.reminder()
    .then(function(data) {
      let today = new Date(Date.now());
      today = (JSON.stringify(today)).substr(1, 10);
      for (let i = 0; i < data.length; i++) {
        if (data[i]["date"] < today) {
          if (recentActivity == null || data[i]["date"] >= recentActivity["date"]) {
            if (recentActivity != null) {
              dbo.delete_act(recentActivity);
            }
            recentActivity = data[i];
          }
        }
      }
      if (recentActivity == null) {
        response.send({ message: "No Date to Send" })
      } else {
        response.send(recentActivity);
      }
    });
});

app.get("/week/:date/:activity", (request, response) => {
  console.log(`Got request for ${request.params.date} and ${request.params.activity}`);

  let activity = request.params.activity;
  let dateRequested = new Date(Number(request.params.date));

  let currDate = new Date();
  let dateFromWeekAgo = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() - 6);

  if (activity == "Empty" && dateRequested <= currDate) {
    // Find the most recent database entry and use that for activity
    dbo.recentAct()
      .then(function(recentActivity) {
        console.log("Most recent activity was " + recentActivity);
        let dateMin = new Date(dateRequested.getFullYear(), dateRequested.getMonth(), dateRequested.getDate() - 6);
        dbo.getWeekData(recentActivity, dateMin.toISOString().split('T')[0], dateRequested.toISOString().split('T')[0])
          .then(function(actRange) {
            console.log("Got data from recent activity");
            console.log(actRange);
            let arr = Array()
            for(let i = 5; i >= -1; i--){
              let createday = new Date(dateRequested.getFullYear(), dateRequested.getMonth(), dateRequested.getDate() - i);
              let csd = createday.getTime();
              arr.push(csd);
            }
            let formatedData = formatChartData(actRange);
            let act = recentActivity;
            let seven = arr.map(function(obj) {
              return {
              activity: act,
              date: obj,
              value: 0
              }
            });
            let fullarr = seven.concat(formatedData);
            console.log(fullarr);
            response.send(fullarr);
          })
          .catch(
            function(error) {
              console.log("Error getting the list of activities", error);
            });
      })
      .catch(
        function(error) {
          console.log("Error getting that most recent activity", error);
        });
  } else {
    if (dateRequested > currDate) {
      console.log("No data to send back");
      // Send back message refusing the query
      response.send({ message: "That week is not entirely in the past!" });
    } else {
      // Send back list of entries from the database between 2 dates

      let dateMin = new Date(dateRequested.getFullYear(), dateRequested.getMonth(), dateRequested.getDate() - 6);
      let arr = Array()
      for(let i = 5; i >= -1; i--){
        let createday = new Date(dateRequested.getFullYear(), dateRequested.getMonth(), dateRequested.getDate() - i);
        let csd = createday.getTime();
        arr.push(csd);
      }
      dbo.getWeekData(activity, dateMin.toISOString().split('T')[0], dateRequested.toISOString().split('T')[0])
        .then(function(actRange) {
          if (actRange.length == 0) {
            let seven = arr.map(function(obj) {
              return {
              activity: activity,
              date: obj,
              value: 0
              }
            });
            response.send(seven);
          }
          else {
            let formatedData = formatChartData(actRange);
            let act = actRange[0]['activity'];
            let seven = arr.map(function(obj) {
              return {
              activity: act,
              date: obj,
              value: 0
              }
            });
            let fullarr = seven.concat(formatedData);
            response.send(fullarr);
          }
        })
        .catch(
          function(error) {
            console.log("Error getting that weeks activity", error);
          });
    }
  }
})

function formatChartData(activities) {
  // Need to populate 0's for other days as well.
  let formatedData = activities.map(function(obj) {
    return {
      activity: obj.activity,
      date: new Date(obj.date).getTime() + 86400000,
      value: obj.amount
    }
  });
  
  return formatedData;
}

app.post("/delete/yesreminder", function(request, response, next) {
  console.log(request.body);
  dbo.delete_act(request.body)
    .catch(
      function(error) {
        console.log("Error deleting the activity", error);
      }
    );
});

// handle pastActivity post requests
app.post('/store/pastActivity', function(request, response, next) {

  console.log("Trying to Store in DB");
  dbo.storePastActivity(request.body)
    .catch(
      function(error) {
        console.log("Error Storing Past Activity in DB", error);
      }
    );

  console.log(
    "Server recieved a post request for /store/pastActivity with body: ",
    request.body
  );
  response.send({
    message: "I recieved your POST request at /pastActivity"
  });
});

// handle futureActivity post requests
app.post('/store/futureActivity', function(request, response, next) {

  console.log("Trying to Store in DB");
  dbo.storeFuturePlan(request.body)
    .catch(
      function(error) {
        console.log("Error Storing Past Activity in DB", error);
      }
    );

  console.log(
    "Server recieved a post request /store/futureActivity with body: ",
    request.body
  );
  response.send({
    message: "I recieved your POST request at /futureActivity"
  });
});


// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});

