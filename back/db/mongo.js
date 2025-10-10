const mongoose = require('mongoose');

const PASSWORD = "2BaOgCyV0fWACJkX";
const USER = "preslykombam_db_user";
const DB_URL = `mongodb+srv://${USER}:${PASSWORD}@cluster0.pxecn1e.mongodb.net/hottakes?retryWrites=true&w=majority&appName=Cluster0`
console.log("DB_URL:", DB_URL);

async function connect() {
 try {
  await mongoose.connect(DB_URL);
  console.log("Connected to Database");
 } catch (e) {
  console.error(e);
 }
}
connect();

module.exports = {};