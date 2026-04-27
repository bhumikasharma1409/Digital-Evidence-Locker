const mongoose = require('mongoose');
const Case = require('./models/case.model');
require('dotenv').config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const caseItem = await Case.findOne({ description: "hmm k" });
  console.log("evidenceFile:", caseItem.evidenceFile);
  process.exit(0);
}
run();
