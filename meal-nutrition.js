/* Quantities are editorial reference portions. Composition is imported, not invented. */
(() => {
  'use strict';
  const plan = window.MEAL_PLAN, data = window.FOOD_DATA;
  const metrics = Object.keys(data.nutrientUnits);
  const labels = {
    '原味燕麦片':'oats', '巴氏杀菌全脂牛奶':'milk', '小米':'millet', '去皮南瓜':'pumpkin', '南瓜':'pumpkin',
    '大米':'rice', '玉米粒':'corn', '去皮山药':'yam', '全麦粉':'wheat', '红薯':'sweet-potato', '全麦吐司':'bread',
    '鸡蛋':'egg', '原味无糖全脂酸奶':'yogurt', '无盐核桃仁':'walnut', '苹果可食部':'apple', '梨可食部':'pear',
    '橙子可食部':'orange', '猕猴桃可食部':'kiwi', '香蕉可食部':'banana', '糙米':'brown-rice', '干蛋面':'noodles',
    '去皮鸡胸肉':'chicken', '鸡胸肉':'chicken', '胡萝卜':'carrot', '姜':'ginger', '油':'oil', '加碘食盐':'salt',
    '土豆':'potato', '洋葱':'onion', '鲜香菇':'shiitake', '西葫芦':'zucchini', '淀粉':'starch', '瘦牛肉':'beef',
    '瘦牛肉末':'beef-mince', '芹菜':'celery', '猪里脊肉':'pork', '猪里脊肉末':'pork', '西兰花':'broccoli',
    '大白菜':'napa', '石膏豆腐':'tofu', '干红小扁豆':'lentil', '番茄':'tomato', '三文鱼':'salmon', '鳕鱼':'cod',
    '小白菜':'bok-choy', '菠菜':'spinach', '圆白菜':'cabbage', '四季豆':'green-beans', '茄子':'eggplant',
    '油麦菜':'lettuce', '白萝卜':'radish', '去皮冬瓜':'wintermelon'
  };
  // Use named ingredients instead of ambiguous alternatives in the estimated menu.
  plan.recipes.bun = {id:'bun',name:'全麦小饼',minutes:18,servings:1,ingredients:['全麦粉 50 克','水 65 毫升','油 3 克'],
    steps:['全麦粉与水搅匀，静置约 5 分钟；面糊应能缓慢流动，按吸水性补少量水。','平底锅薄薄刷油，倒入面糊摊成约 0.5 厘米厚的小饼，小火烙。','约 3～4 分钟后翻面，再烙至两面熟透、中心没有湿生面糊；锅具和厚度会影响时间。','切块后稍放凉，与当天蛋类、奶类搭配。'],allergens:['小麦'],tip:'使用 100% 全麦粉；不以全麦馒头成品重量代替面粉重量。'};
  plan.recipes['tofu-simple'] = {id:'tofu-simple',name:'清蒸石膏豆腐',minutes:15,servings:1,ingredients:['石膏豆腐 100 克','水 20 毫升'],
    steps:['选择标明硫酸钙（石膏）凝固剂的正规豆腐，核对保质期，切约 1 厘米厚片。','放耐热盘中，加水，蒸锅水开后上锅蒸约 10～12 分钟。','确认豆腐完全热透后食用；不额外加盐，搭配当天蔬菜。'],allergens:['大豆'],tip:'钙估算对应 USDA 的石膏豆腐条目；不同产品钙含量差异很大，以实物营养标签为准。'};
  for (const recipe of Object.values(plan.recipes)) {
    recipe.ingredients = recipe.ingredients.map(line => line.replace(/北豆腐|嫩豆腐/g,'石膏豆腐').replace('无盐核桃仁或杏仁 15 克','无盐核桃仁 10 克').replace('干红扁豆','干红小扁豆').replace('巴氏杀菌牛奶','巴氏杀菌全脂牛奶').replace('原味无糖酸奶','原味无糖全脂酸奶').replace('干面条','干蛋面').replace('去皮去骨鸡肉','去皮鸡胸肉').replace(/^牛肉/,'瘦牛肉').replace('猪瘦肉末','猪里脊肉末').replace('食盐','加碘食盐'));
    recipe.steps = recipe.steps.map(line => line.replace('称取 15 克','称取上列分量').replace('取约 150 克可食果肉','取上列分量的可食果肉'));
    if (recipe.ingredients.some(line => line.startsWith('石膏豆腐'))) recipe.tip = (recipe.tip ? recipe.tip+' ' : '') + '选硫酸钙凝固的豆腐；钙估算不适用于所有卤水或内酯豆腐。';
  }
  plan.recipes.noodles.name='清水蛋面';
  plan.recipes.noodles.allergens=['小麦','蛋'];
  function parse(line) {
    const match = line.match(/^(.+?)\s+(?:约\s*)?(\d+(?:\.\d+)?)\s*(克|毫升|个)$/);
    if (!match) throw new Error('Unparsed ingredient: '+line);
    const [,label,number,unit] = match, amount = Number(number);
    const foodKey = labels[label] || null;
    if (!foodKey && !['水','温水','蒸锅用水'].includes(label)) throw new Error('Unmapped food: '+label);
    return {label,amount,unit,foodKey,grams: amount*(unit==='个'?50:1)};
  }
  const round = value => Math.round(value*10)/10;
  function recipeFor(id, changes={}) {
    const original = plan.recipes[id];
    const items = original.ingredients.map(parse).map(item => {
      if (changes[item.foodKey] !== undefined && item.foodKey) {
        const grams = data.foods[item.foodKey].group === '蔬菜' ? Math.round(changes[item.foodKey]) : round(changes[item.foodKey]);
        return {...item, grams, amount:grams/(item.unit==='个'?50:1)};
      }
      return item;
    });
    const ingredients = items.map(item => `${item.label} ${round(item.amount)} ${item.unit}${item.unit==='个'?'（约 50 克可食部/个）':''}`);
    // Rice water amounts in original prose are replaced when grain portions change.
    let steps = original.steps.map(line => line.replace(/(?:加入)?(?:约 )?(120|130|140) 毫升水/g,'按上列水量加水'));
    if (['rice','mixed-rice','millet-rice','pumpkin-rice'].includes(id)) {
      const grain = items.filter(item => ['rice','brown-rice','millet'].includes(item.foodKey)).reduce((sum,item)=>sum+item.grams,0);
      const water = items.find(item=>!item.foodKey);
      water.amount=water.grams=Math.round(grain*(id==='mixed-rice'?1.75:1.5));
      ingredients[items.indexOf(water)] = `水 约 ${water.amount} 毫升（以设备刻度和米种调整）`;
    }
    return {...original,ingredients,steps,items};
  }
  const totalsOf = meals => {
    const totals = Object.fromEntries(metrics.map(metric=>[metric,0]));
    for (const item of meals.flatMap(meal=>meal.recipes.flatMap(recipe=>recipe.items))) {
      if (!item.foodKey) continue;
      const profile=data.foods[item.foodKey];
      for (const metric of metrics) {
        if (profile.per100g[metric] === undefined) throw new Error('Missing '+metric+' for '+item.foodKey);
        totals[metric] += profile.per100g[metric]*item.grams/100;
      }
    }
    return totals;
  };
  function buildDay(dayNumber,profile='lactating') {
    if (!['lactating','nonlactating'].includes(profile)) throw new Error('Unknown profile');
    const source=plan.days[dayNumber-1];
    if (!source) throw new Error('Invalid day');
    const selected=source.meals.map(meal=>({...meal,recipeIds:[...meal.recipeIds]}));
    // Three low-mercury fish meals per week, each 100 g edible raw fish (~300 g/week).
    if (dayNumber%7===0) selected[2].recipeIds[1]=dayNumber%14===0?'salmon':'cod';
    // Whole grains in every lunch; daily dinner starch remains varied.
    selected[2].recipeIds[0]='mixed-rice';
    if (selected[4].recipeIds[0]==='rice') selected[4].recipeIds[0]='millet-rice';
    if (selected[0].recipeIds[0]==='sweet-potato') selected[0].recipeIds.push('bun');
    const laterEgg = selected.slice(2).some(meal=>meal.recipeIds.some(id=>plan.recipes[id].ingredients.some(line=>line.startsWith('鸡蛋 '))));
    if (laterEgg) selected[0].recipeIds=selected[0].recipeIds.filter(id=>!['boiled-egg','egg-custard'].includes(id));
    const mainIds=[selected[2].recipeIds[1],selected[4].recipeIds[1]];
    const animals=mainIds.filter(id=>plan.recipes[id].ingredients.some(line=>/^(去皮鸡胸肉|鸡胸肉|瘦牛肉|瘦牛肉末|猪里脊肉|猪里脊肉末|三文鱼|鳕鱼) /.test(line)));
    const fishPresent=animals.some(id=>['salmon','cod'].includes(id));
    let meals=selected.map(meal=>({...meal,recipes:meal.recipeIds.map(id=>{
      const changes={};
      if (id==='milk'||id==='oats') changes.milk=150;
      if (id==='nuts') changes.walnut=10;
      if (id==='sweet-potato') changes['sweet-potato']=100;
      if (['rice','pumpkin-rice','noodles'].includes(id)) changes[id==='noodles'?'noodles':'rice']=75;
      if (id==='mixed-rice') {changes.rice=40; changes['brown-rice']=35;}
      if (id==='millet-rice') {changes.rice=40; changes.millet=35;}
      if (animals.includes(id)) {
        const grams=['salmon','cod'].includes(id)?100:animals.length===2?(fishPresent?50:75):125;
        for(const foodKey of ['chicken','beef','beef-mince','pork','salmon','cod']) changes[foodKey]=grams;
      }
      if (['tofu-tomato','tofu-mushroom','tofu-egg'].includes(id)) changes.tofu=150;
      return recipeFor(id,changes);
    })}));
    const tofu=meals.flatMap(meal=>meal.recipes.flatMap(recipe=>recipe.items)).filter(item=>item.foodKey==='tofu').reduce((sum,item)=>sum+item.grams,0);
    if(tofu<100) meals[2].recipes.push(recipeFor('tofu-simple',{tofu:100-tofu}));
    // Include vegetables in main dishes and soups, not just the two side dishes.
    const vegetableGrams=meals.flatMap(meal=>meal.recipes.flatMap(recipe=>recipe.items)).filter(item=>item.foodKey&&data.foods[item.foodKey].group==='蔬菜').reduce((sum,item)=>sum+item.grams,0);
    meals=meals.map(meal=>({...meal,recipes:meal.recipes.map(recipe=>{
      const changes=Object.fromEntries(recipe.items.filter(item=>item.foodKey).map(item=>[item.foodKey,item.grams*(data.foods[item.foodKey].group==='蔬菜'?500/vegetableGrams:1)]));
      return recipeFor(recipe.id,changes);
    })}));
    const base=totalsOf(meals);
    if(profile==='lactating') {
      // Add 30 g of dry grain at each main meal, 150 ml milk and 5 g walnuts.
      for(const index of [2,4]) {
        const recipe=meals[index].recipes[0];
        const keys=recipe.items.filter(item=>['rice','brown-rice','millet','noodles'].includes(item.foodKey));
        const grain=keys.reduce((sum,item)=>sum+item.grams,0);
        const changes=Object.fromEntries(recipe.items.filter(item=>item.foodKey).map(item=>[item.foodKey,item.grams*(keys.includes(item)?(grain+30)/grain:1)]));
        meals[index].recipes[0]=recipeFor(recipe.id,changes);
      }
      meals[1].recipes.push(recipeFor('milk',{milk:150}));
      meals[3].recipes=meals[3].recipes.map(recipe=>recipe.id==='nuts'?recipeFor('nuts',{walnut:15}):recipe);
    }
    const nutrients=totalsOf(meals);
    const groups={};
    for(const item of meals.flatMap(meal=>meal.recipes.flatMap(recipe=>recipe.items))) if(item.foodKey){const group=data.foods[item.foodKey].group;groups[group]=(groups[group]||0)+item.grams;}
    return {...source,profile,meals,nutrients,groups,extraKcal:nutrients.kcal-base.kcal};
  }
  window.MEAL_NUTRITION={buildDay,totalsOf,metrics,foodData:data};
})();
