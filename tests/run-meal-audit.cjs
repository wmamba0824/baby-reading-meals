const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const audit=require('./meal-plan-audit.cjs');
const context=vm.createContext({window:{}});
for(const file of ['food-data.js','meal-plan.js','meal-nutrition.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file});
console.log(JSON.stringify(audit(context.window),null,2));
