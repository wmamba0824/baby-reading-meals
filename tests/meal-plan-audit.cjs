
function auditMealPlan(window) {
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const plan=window.MEAL_PLAN,nutrition=window.MEAL_NUTRITION,food=window.FOOD_DATA;
  const near=(a,b,tolerance=0.2)=>Math.abs(a-b)<=tolerance;
  assert(plan.days.length===42,'Requires exactly 42 days');
  assert(new Set(plan.days.map(day=>day.day)).size===42,'Day IDs must be unique');
  assert(new Set(plan.days.map(day=>JSON.stringify(day.meals.map(meal=>meal.recipeIds)))).size===42,'Whole-day menus must differ');
  assert(new Set(plan.days.map(day=>day.meals[2].recipeIds[0])).size>=6,'Lunch must rotate at least six starch dishes');
  assert(new Set(plan.days.map(day=>day.meals[0].recipeIds[0])).size>=12,'Breakfast must rotate at least twelve starch dishes');
  const mains=plan.days.flatMap(day=>[day.meals[2].recipeIds[1],day.meals[4].recipeIds[1]]);
  assert(new Set(mains).size>=35,'Main dishes must offer meaningful variety');
  const usage={};for(const id of mains)usage[id]=(usage[id]||0)+1;
  assert(Math.max(...Object.values(usage))<=3,'A main dish may appear at most three times in 42 days');
  for(let i=1;i<42;i++)assert(!plan.days[i].meals.some((meal,index)=>(index===2||index===4)?meal.recipeIds[1]===plan.days[i-1].meals[index].recipeIds[1]:false),'Adjacent days must rotate main dishes');
  const all=[];
  for(const profile of ['nonlactating','lactating']) {
    for(let day=1;day<=42;day++) {
      const d=nutrition.buildDay(day,profile),items=d.meals.flatMap(meal=>meal.recipes.flatMap(recipe=>recipe.items));
      assert(d.meals.length===5,'All daily meal slots must be present');
      for(const meal of d.meals)for(const recipe of meal.recipes) {
        assert(recipe.steps.length>=2&&recipe.ingredients.length>=1,'Detailed recipe required: '+recipe.id);
        for(let i=0;i<recipe.items.length;i++) {
          const item=recipe.items[i],display=recipe.ingredients[i].match(/\s+(?:约\s*)?(\d+(?:\.\d+)?)\s*(克|毫升|个)/);
          assert(display,'Readable quantity missing: '+recipe.id);
          assert(near(Number(display[1])*(display[2]==='个'?50:1),item.grams,0.08),'Displayed quantity and calculation diverge: '+recipe.id);
          assert(item.grams>=0&&Number.isFinite(item.grams),'Invalid portion');
          if(item.foodKey)assert(food.foods[item.foodKey]?.fdcId,'Untraceable ingredient');
        }
      }
      for(const metric of nutrition.metrics) {
        let total=0;
        for(const meal of d.meals)for(const recipe of meal.recipes)for(let i=0;i<recipe.items.length;i++) {
          const item=recipe.items[i];if(!item.foodKey)continue;
          const display=recipe.ingredients[i].match(/\s+(?:约\s*)?(\d+(?:\.\d+)?)\s*(克|毫升|个)/);
          const grams=Number(display[1])*(display[2]==='个'?50:1);
          total+=grams*food.foods[item.foodKey].per100g[metric]/100;
        }
        assert(Number.isFinite(d.nutrients[metric])&&near(total,d.nutrients[metric],0.5),'Nutrition does not match displayed ingredients: '+metric+' day '+day);
      }
      assert(d.quality.foodCount>=12,'Insufficient ingredient variety');
      assert(near(d.quality.vegetables,500,4)&&near(d.quality.darkVegetables,250,4),'Vegetable balance');
      assert(d.quality.wholeGrainsAndBeans>=50&&d.quality.wholeGrainsAndBeans<=150.2,'Coarse/refined balance');
      assert(near(d.quality.egg,50)&&near(d.quality.dairy,profile==='lactating'?500:350),'Egg or dairy portions');
      const rawFruit=items.filter(item=>item.foodKey&&food.foods[item.foodKey].group==='水果').reduce((sum,item)=>sum+item.grams,0);
      assert(near(rawFruit,300),'Fruit portions');
      if(profile==='lactating') {
        const base=nutrition.buildDay(day,'nonlactating');
        assert(d.extraKcal>=330&&d.extraKcal<=400,'Breastfeeding reference increment');
        assert(near(d.nutrients.kcal-base.nutrients.kcal,d.extraKcal),'Increment must compare same day');
      }
      assert(JSON.stringify(d)===JSON.stringify(nutrition.buildDay(day,profile)),'Build must be deterministic and not mutate source data');
      all.push(d);
    }
    for(let week=1;week<=6;week++) {
      const summary=nutrition.weekSummary(week,profile);
      assert(summary.foodCount>=25,'Insufficient weekly food variety');
      assert(summary.fishMeals===3&&near(summary.fishGrams,300),'Weekly low-mercury fish schedule');
    }
  }
  for(const args of [[0,'lactating'],[43,'lactating'],[1,'invalid']]) {
    let threw=false;try{nutrition.buildDay(...args);}catch{threw=true;}assert(threw,'Invalid input must be rejected');
  }
  return {passed:true,days:42,profiles:2,menusChecked:all.length,mainRecipes:new Set(mains).size,maxMainRepeats:Math.max(...Object.values(usage)),lunchStarches:new Set(plan.days.map(day=>day.meals[2].recipeIds[0])).size,breakfastStarches:new Set(plan.days.map(day=>day.meals[0].recipeIds[0])).size};
}
if(typeof module!=='undefined')module.exports=auditMealPlan;
