'use strict'

// using a Promises-wrapped version of sqlite3
const db = require('./sqlWrap');

// SQL commands for ActivityTable
const insertDB = "insert into ActivityTable (activity, date, amount) values (?,?,?)"
const getOneDB = "select * from ActivityTable where activity = ? and date = ? and amount = ?";
const getF = "select * from ActivityTable where  amount = ?";
const getP = "select * from ActivityTable where  amount >= 0";
const allDB = "select * from ActivityTable where activity = ?";
const entireDB = "select * from ActivityTable";
const deleteone = " delete from ActivityTable where activity = ? and date = ? and amount = ?";
const getActRange = "select * from ActivityTable where activity = ? and date >= ? and date <= ? and amount > 0";
const getMax = "select MAX(date) from ActivityTable where amount > 0";
const getMaxAct = "select MAX(rowIDNum) from ActivityTable where date = ? and amount > 0";
const getId = "select activity from ActivityTable where rowIDNum = ?";

async function testDB () {

  // for testing, always use today's date
  const today = new Date().getTime();

  // all DB commands are called using await

  // empty out database - probably you don't want to do this in your program
  await db.deleteEverything();

  await db.run(insertDB,["running",today,2.4]);
  await db.run(insertDB,["walking",today,1.1]);
  await db.run(insertDB,["walking",today,2.7]);
  
  console.log("inserted two items");

  // look at the item we just inserted
  let result = await db.get(getOneDB,["running",today,2.4]);
  console.log(result);

  // get multiple items as a list
  result = await db.all(allDB,["walking"]);
  console.log(result);
}

async function storePastActivity (data) {
  console.log("DB requested to store PA");
  console.log(data);
  await db.run(insertDB,[data['activity'],data['date'],data['scalar']]); 
  console.log("inserted past activity in DB");
  let result = await db.all(entireDB);
  console.log(result);
  console.log("Past Result should be above");
  return(data);
}

async function storeFuturePlan (data) {
  console.log("DB requested to store FP");
  console.log(data);
  await db.run(insertDB,[data['activity'],data['date'],-1]);
  console.log("inserted future plan in DB");
  let result = await db.all(entireDB);
  console.log(result);
  console.log("Future Result should be above");
}

async function reminder() {
  let te = await db.all(getF,[-1]);
  return te;
}

async function delete_act(data){
  console.log("deleting");
  console.log(data);
  db.run(deleteone, [data['activity'],data['date'],-1]);
}

async function clearDB() {
  await db.deleteEverything();
}

async function getWeekData(activity, dateMin, dateMax) {
  console.log("DB requested to get date for " + activity + " between " + dateMin + " and " + dateMax);
  let actRange = await db.all(getActRange,[activity, dateMin, dateMax]);
  console.log(actRange);
  return actRange;
}

async function recentAct() {
  let maxDate = await db.all(getMax);
  let mostRecentInput = await db.all(getMaxAct, [maxDate[0]['MAX(date)']]);
  let recentActivity = await db.all(getId, [mostRecentInput[0]['MAX(rowIDNum)']]) ;
  recentActivity = recentActivity[0]['activity'];
  return recentActivity;
}

module.exports.testDB = testDB;
module.exports.storePastActivity = storePastActivity;
module.exports.storeFuturePlan = storeFuturePlan;
module.exports.clearDB = clearDB;
module.exports.reminder = reminder;
module.exports.delete_act = delete_act;
module.exports.getWeekData = getWeekData;
module.exports.recentAct = recentAct;