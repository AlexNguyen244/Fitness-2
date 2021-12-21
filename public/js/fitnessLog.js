'use strict';  // always start with this 

//import data from './data.js'
//import barchart from './barchart.js'

/* Set default date in forms to current date */
document.getElementById('pAct-date').valueAsDate = newUTCDate()
document.getElementById('fAct-date').valueAsDate = newUTCDate()

get_reminder();

/* Past Activity 'Add New Activity' Button - Show Form */
let add_past_activity_button = document.getElementById("addPastActivityButton")
add_past_activity_button.addEventListener("click", add_past_activity_onclick);


/* Future Activity 'Add New Activity' Button - Show Form */
let add_future_activity_button = document.getElementById("addFutureActivityButton")
add_future_activity_button.addEventListener("click", add_future_activity_onclick);


/* Past Activity Form Dropdown */
let past_activity_dropdown = document.getElementById("pAct-activity")
past_activity_dropdown.addEventListener("change", past_activity_dropdown_onchange);


/* Past Activity 'Submit' Button - Submit Form */
let submit_past_activity_button = document.getElementById("submitPastActivityButton")
submit_past_activity_button.addEventListener("click", submit_past_activity_onclick);


/* Future Activity 'Submit' Button - Submit Form */
let submit_future_activity_button = document.getElementById("submitFutureActivityButton")
submit_future_activity_button.addEventListener("click", submit_future_activity_onclick)


/**
 * ONCLICK - Hide 'Add New Activity' Button under the Past Section and Show
 * Form to Add a Past Activity
 */
function add_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  pActAdd.classList.add("hide");
  pActForm.classList.remove("hide");
}

/**
 * ONCLICK - Hide 'Add New Activity' Button under the Future Section and Show
 * Form to Add a Future Activity
 */
function add_future_activity_onclick() {
  /* Connect to Past Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");

  /* Show Form, Hide 'Add New Activity' Button */
  fActAdd.classList.add("hide");
  fActForm.classList.remove("hide");
}


/**
 * ONCHANGE - Automatically Change Units in Past Activty Form to accomodate the
 * selected Activity from the dropdown menu
 */
function past_activity_dropdown_onchange() {
  /* Connect to Past Activity Unit Input */
  let pActUnit = document.getElementById("pAct-unit");

  /* Show Form, Hide 'Add New Activity' Button */
  switch (past_activity_dropdown.value) {
    case 'Walk': case 'Run': case 'Bike':
      pActUnit.value = 'km';
      break;
    case 'Swim':
      pActUnit.value = 'laps';
      break;
    case 'Yoga': case 'Soccer': case 'Basketball':
      pActUnit.value = 'minutes';
      break;
    default:
      pActUnit.value = 'units';
  }
}


/**
 * ONCLICK - Validate Past Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_past_activity_onclick() {
  /* Connect to Past Activity Sections */
  let pActAdd = document.getElementById("pAct-Add");
  let pActForm = document.getElementById("pAct-Form");

  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('pAct-date').value,
    activity: document.getElementById('pAct-activity').value,
    scalar: document.getElementById('pAct-scalar').value,
    units: document.getElementById('pAct-unit').value
  }

  if (!past_activity_form_is_valid(data)) {
    alert("Invalid Past Activity. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  pActAdd.classList.remove("hide");
  pActForm.classList.add("hide");

  /* Add 'p' tag above 'Add New Activity' Button */
  let newActivity = create_submission_success_element(
    "Got it! ",
    `${data.activity} for ${data.scalar} ${data.units}. `,
    "Keep it up!"
  )
  insert_latest_response(pActAdd, newActivity)

  console.log('Past Activity Sending:', data);



  /* Post Activity Data to Server */
  fetch(`/store/pastActivity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
    .then(response => response.json())
    .then(data => {
      console.log('Past Activity Success:', data);
    })
    .catch((error) => {
      console.error('Past Activity Error:', error);
    });

  /* Reset Form */
  document.getElementById('pAct-date').valueAsDate = newUTCDate()
  document.getElementById('pAct-activity').value = "Walk"
  document.getElementById('pAct-scalar').value = ""
  document.getElementById('pAct-unit').value = "km"
}


/**
 * ONCLICK - Validate Future Activity Form Contents, Send Data to Server, Remove
 * Form, and Display 'Add ...' Button with confirmation text above
 */
function submit_future_activity_onclick() {
  /* Connect to Future Activity Sections */
  let fActAdd = document.getElementById("fAct-Add");
  let fActForm = document.getElementById("fAct-Form");

  /* Activity Data to Send to Server */
  let data = {
    date: document.getElementById('fAct-date').value,
    activity: document.getElementById('fAct-activity').value
  }

  /* Form Validation */
  if (!future_activity_form_is_valid(data)) {
    alert("Invalid Future Plan. Please fill in the entire form.");
    return
  }

  /* Hide Form, Show 'Add New Activity' Button */
  fActAdd.classList.remove("hide");
  fActForm.classList.add("hide");

  /* Add 'p' tag above 'Add New Activity' Button  */
  let newActivity = create_submission_success_element(
    "Sounds good! Don't forget to come back to update your session for ",
    `${data.activity} on ${reformat_date(data.date)}`,
    "!"
  )
  insert_latest_response(fActAdd, newActivity)

  console.log('Future Plans Sending:', data);

  /* Post Activity Data to Server */
  fetch(`/store/futureActivity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data), // post body
  })
    .then(response => response.json())
    .then(data => {
      console.log('Future Plans Success:', data);
    })
    .catch((error) => {
      console.error('Future Plans Error:', error);
    });

  /* Reset Form */
  document.getElementById('fAct-date').valueAsDate = newUTCDate()
  document.getElementById('fAct-activity').value = "Walk"
}


/**
 * Create DOM element for acknowledgment message to send to user for submitting a form
 * @param {string} beg - regular starting section
 * @param {string} mid - bolded middle section
 * @param {string} end - regular trailing text
 * @returns {HTMLElement} DOM element combining beg, mid, end
 */
function create_submission_success_element(beg, mid, end) {
  /* Create all HTML elements to add */
  let newMessage = document.createElement('p')
  let baseText = document.createElement('span')
  let dynamicText = document.createElement('strong')
  let exclamationText = document.createElement('span')

  /* Update textContent of all generated DOM elements */
  baseText.textContent = beg
  dynamicText.textContent = mid
  exclamationText.textContent = end

  /* Append all text contents back to back in wrapper 'p' tag */
  newMessage.appendChild(baseText)
  newMessage.appendChild(dynamicText)
  newMessage.appendChild(exclamationText)

  return newMessage
}


/**
 * Checks if past activity data is valid
 * @param {Object} data
 * @param {string} data.date - format 'mm-dd-yyyy'
 * @param {string} data.activity
 * @param {string} data.scalar - time or distance integer or float
 * @param {string} data.units - units for scalar value
 * @returns {boolean} Boolean represents if data is valid
 */
function past_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-', '/'))
  if (date != "Invalid Date" && date > newUTCDate()) {
    return false
  }

  return !(data.date == "" || data.activity == "" || data.scalar == "" || data.units == "")
}


/**
 * Checks if future activity data is valid
 * @param {Object} data
 * @param {string} data.date
 * @param {string} data.activity
 * @returns {boolean} Boolean represents if data is valid
 */
function future_activity_form_is_valid(data) {
  let date = new Date(data.date.replace('-', '/'))
  if ( date != "Invalid Date" && date < newUTCDate()) {
    return false
  }
  return !(data.date == "" || data.activity == "")
}


/**
 * Insert Prompt at the top of parent and remove old prompts
 * @param {HTMLElement} parent - DOM element 
 * @param {HTMLElement} child - DOM element
 */
function insert_latest_response(parent, child) {
  if (parent.children.length > 1) {
    parent.removeChild(parent.children[0])
  }
  parent.insertBefore(child, parent.childNodes[0])
}


/**
 * Convert 'yyyy-mm-dd' to 'mm/dd/yy'
 * @param {string} date 
 * @returns {string} same date, but reformated
 */
function reformat_date(date) {
  let [yyyy, mm, dd] = date.split("-");
  return `${mm}/${dd}/${yyyy.substring(2, 4)}`
}


/**
 * Convert GMT date to UTC
 * @returns {Date} current date, but converts GMT date to UTC date
 */
function newUTCDate() {
  let gmtDate = new Date()
  return new Date(gmtDate.toLocaleDateString())
}

/* Overlay */

let reminder_yes_button = document.getElementById("YesBtn");
reminder_yes_button.addEventListener("click", yesToReminder);

let reminder_no_button = document.getElementById("NoBtn");
reminder_no_button.addEventListener("click", noToReminder);


function viewProgressOff() {
  document.getElementById("overlay").style.display = "none";
}

let reminder = document.getElementById("reminder");
let currReminder;
let aa = document.getElementById("AA");

document.getElementById("activity").style.fontWeight = "bold";
document.getElementById("activity").style.color = "white";
document.getElementById("activity").style.fontFamily = "sans-serif";
document.getElementById("activity").style.marginLeft = "5px";


function get_reminder() {
  // Only called 1 time
  fetch("/reminder")
    .then(response => {
      response.json()
        .then(activity => {
          console.log("Reminder success", activity);
          if (typeof (activity["message"]) == "string") {
            console.log("no data");
          }
          else {
            // The code that calculates which activity to do should go here, but that can come later
            currReminder = activity;
            let reminderActivity = remind_format(activity);
            document.getElementById("activity").textContent = reminderActivity;
          }
        });
    })
    .catch(
      function(error) {
        console.log("Error with /get from DB", error);
      }
    );
}

function remind_format(data) {
  let daysOfTheWeekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let day = new Date(data["date"]);
  day = new Date(day.getTime() + day.getTimezoneOffset() * 60000);
  let dayOfTheWeek = daysOfTheWeekArray[day.getDay()];
  let today = newUTCDate();
  let t = (Math.abs(day - today));
  let numberofdays = (t / (1000 * 60 * 60 * 24));
  if (numberofdays > 6) {
    reminder.style.display = "none";
    document.getElementById("rq").textContent = " ";
    return (" ");
  }
  reminder.style.display = "flex";
  console.log(data["activity"], "yesterday");
  if (daysOfTheWeekArray[((today).getDay()) - 1] == dayOfTheWeek) {
    let reminderActivity = `${data["activity"]} yesterday?`;
    return (reminderActivity);
  } else if ((today).getDay() == 0 && dayOfTheWeek == "Saturday") {
    let reminderActivity = `${data["activity"]} yesterday?`;
    return (reminderActivity);
  } else {
    let reminderActivity = `${data["activity"]} on ${dayOfTheWeek}`;
    return (reminderActivity);
  }
}

function yesToReminder() {
  console.log("Reminder: yes");
  // Go into the add new activity for past activity
  reminder.style.display = "none";
  add_past_activity_onclick();
  console.log(currReminder);
  console.log(currReminder["activity"]);
  document.getElementById('pAct-activity').value = currReminder["activity"];
  past_activity_dropdown_onchange();
  document.getElementById('pAct-date').valueAsDate = new Date(currReminder["date"]);
  console.log("sending");
  fetch("/delete/yesreminder", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(currReminder), // post body
  });
}

function noToReminder() {
  // Console logging according to the demo video
  console.log("Reminder: no");
  reminder.style.display = "none";
}

// set default date in view progress
let today = newUTCDate();
let def = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
def = new Date(def.toLocaleDateString());
let ls = findlastsat();

function findlastsat() {
  let day = today.getDay();
  let sat = day + 1;
  let ls = new Date(today.getFullYear(), today.getMonth(), today.getDate() - sat);
  return ls;
}

document.getElementById('viewProg-pAct-date').valueAsDate = ls;

