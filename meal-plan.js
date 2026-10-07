/* Original home-cooking instructions. Public guidance informs variety and food safety,
   not a clinically validated diet or a copied third-party 42-day prescription. */
(() => {
  const recipes = {};
  function add(id, name, minutes, ingredients, steps, allergens = '', tip = '') {
    recipes[id] = { id, name, minutes, servings: 1, ingredients: ingredients.split('|'), steps: steps.split('|'), allergens: allergens ? allergens.split('、') : [], tip };
  }
  add('oats', '牛奶燕麦粥', 10, '原味燕麦片 50 克|巴氏杀菌牛奶 200 毫升|水 150 毫升', '锅中加入水，煮沸后放入燕麦片。|转小火煮 3～5 分钟，边煮边搅拌，按包装要求煮至软熟。|倒入牛奶，小火继续加热约 2 分钟，搅匀后关火，放到适口温度。', '乳', '乳糖不耐受可用无乳糖奶；替换不等于消除牛奶蛋白过敏风险。');
  add('millet', '南瓜小米粥', 30, '小米 60 克|去皮南瓜 100 克|水 600 毫升', '小米淘洗一遍，南瓜切成约 1 厘米小块。|水煮沸，倒入小米和南瓜，搅拌后转小火。|半盖锅盖煮 20～25 分钟，间隔搅拌，煮至小米软熟、南瓜能压散。|太稠可加少量开水，再煮 1 分钟；不额外加糖。');
  add('corn-porridge', '玉米大米粥', 30, '大米 50 克|玉米粒 60 克|水 600 毫升', '大米淘洗，玉米粒冲净。|锅中加水、大米，煮沸后小火煮 15 分钟。|加入玉米粒再煮 10 分钟，至米粒和玉米熟透。|过程中搅拌防粘底，按喜欢的稠度补开水。');
  add('rice-porridge', '山药大米粥', 35, '大米 60 克|去皮山药 100 克|水 650 毫升', '大米淘洗，山药去皮切小丁；处理山药时可戴手套。|大米和水煮沸，转小火煮 15 分钟。|放入山药丁，继续煮 15～20 分钟。|确认山药松软、米粒软熟后关火，稍放凉再吃。');
  add('bun', '蒸全麦馒头', 12, '全麦馒头 100 克|蒸锅用水 500 毫升', '选正规包装的全麦馒头，核对保质期和过敏原。|蒸锅加水，馒头放在蒸屉上，避免直接接触水。|水开后蒸约 8～10 分钟；冷冻馒头按包装时间延长。|中心完全热透后取出，稍放凉食用。', '小麦');
  add('sweet-potato', '蒸红薯', 25, '红薯 200 克|蒸锅用水 600 毫升', '红薯刷洗干净，切成约 3 厘米厚块。|水开后放入蒸屉，盖上锅盖。|中火蒸约 20 分钟，用筷子能轻松穿透中心即熟。|稍放凉后去皮食用；较大的整根红薯需延长时间。');
  add('bread', '温热全麦吐司', 5, '全麦吐司 80 克', '查看包装成分和保质期，确认没有霉变。|放入烤面包机，按设备说明低档加热 1～2 分钟。|没有烤面包机可放干净平底锅，小火每面约 1 分钟。|不烤焦，搭配当天蛋类和奶类一起吃。', '小麦', '部分吐司含乳、蛋或大豆，购买时以标签为准。');
  add('boiled-egg', '水煮鸡蛋', 12, '鸡蛋 1 个|水 500 毫升', '鸡蛋放入锅中，加水没过蛋。|煮沸后转小火，保持微沸约 9～10 分钟。|用勺子取出，稍放凉后剥壳。|切开确认蛋白和蛋黄均已凝固，不做溏心蛋。', '蛋');
  add('egg-custard', '嫩蒸蛋', 18, '鸡蛋 1 个|温水 80 毫升|食盐 0.3 克', '鸡蛋打入碗中搅散，加入温水和盐搅匀。|撇去表面泡沫，盖上耐热小盘。|蒸锅水开后放入，转中小火蒸 10～12 分钟。|打开检查中心已凝固；若仍流动，继续蒸到完全熟透。', '蛋');
  add('milk', '温牛奶', 5, '巴氏杀菌牛奶 250 毫升', '检查包装、保质期和冷藏状态。|倒入小锅，小火加热并轻轻搅拌。|加热至自己喜欢的温度即可；巴氏杀菌奶不必长时间沸煮。|倒入干净杯子现喝，不反复加热剩奶。', '乳');
  add('yogurt', '原味酸奶', 2, '原味无糖酸奶 200 克', '选择经过巴氏杀菌乳制作的正规酸奶，核对保质期。|取出需要的量，开封后用干净勺子食用。|按自己耐受的温度食用，不需要煮沸。|剩余部分及时冷藏，按包装要求尽快食用。', '乳');
  add('nuts', '原味坚果小份', 2, '无盐核桃仁或杏仁 15 克', '选择无盐、无糖、未霉变的坚果。|称取 15 克，放在干净小碟中。|细嚼慢咽，可切碎后拌入当天酸奶。', '坚果', '这是成人餐；整粒坚果不提供给婴幼儿。');
  add('apple', '苹果小份', 5, '苹果可食部 150 克', '在流动水下洗净苹果表面。|用干净刀具切开，去核，按自己喜好去皮。|切成小块，现切现吃；不必加糖或蒸煮。');
  add('pear', '梨小份', 5, '梨可食部 150 克', '梨用流动水洗净。|去核，切成方便入口的小块。|现切现吃；不喜欢生吃可放耐热碗中蒸约 10 分钟，不加糖。');
  add('orange', '橙子小份', 5, '橙子可食部 150 克', '橙子表皮洗净，擦干手和刀具。|剥皮或切块，去除明显的籽。|直接吃果肉，保留纤维，不用榨汁代替。');
  add('kiwi', '猕猴桃小份', 5, '猕猴桃可食部 150 克', '洗净猕猴桃表皮。|切开，用干净勺子挖取果肉或去皮切块。|选择熟软但未腐败的果实，现切现吃。');
  add('banana', '香蕉小份', 2, '香蕉可食部 150 克', '洗净双手，确认香蕉没有腐败。|剥皮，取约 150 克可食果肉。|切段或直接食用，不需要另加糖。');
  add('rice', '软米饭', 35, '大米 80 克|水 约 120 毫升', '大米淘洗，沥水后放入电饭煲。|加入约 120 毫升水；以电饭煲刻度和米的吸水性调整。|按煮饭键，程序结束后焖 5～10 分钟。|翻松后食用；一次做多份可成比例增加米和水。');
  add('mixed-rice', '糙米白米饭', 45, '大米 60 克|糙米 20 克|水 约 140 毫升', '糙米洗净，按包装建议浸泡约 1～2 小时；浸泡时间另计。|与淘洗好的大米混合，加入约 140 毫升水。|用电饭煲杂粮饭模式煮熟，结束后焖 10 分钟。|颗粒应完全软熟；腹胀或不耐受时可换当天的软米饭。');
  add('millet-rice', '小米白米饭', 35, '大米 60 克|小米 20 克|水 约 130 毫升', '大米和小米分别轻轻淘洗。|混合放入电饭煲，加入约 130 毫升水。|选择煮饭模式，煮好后焖 5～10 分钟。|轻轻翻松，水量按米种和设备调整。');
  add('pumpkin-rice', '南瓜米饭', 35, '大米 80 克|南瓜 100 克|水 约 120 毫升', '大米淘洗；南瓜去皮去籽，切约 1 厘米小丁。|大米和水放入电饭煲，南瓜铺在上面。|按煮饭键，完成后焖 5 分钟。|把南瓜和米饭轻轻拌匀，确认南瓜软熟。');
  add('noodles', '清水面条', 12, '干面条 80 克|水 800 毫升', '水煮沸，放入面条，搅散防粘。|按包装时间煮约 6～10 分钟，检查面条中心没有硬芯。|捞出沥水，搭配当天主菜和蔬菜。|若选含盐面条，当天配菜少放盐；不是只喝面汤。', '小麦');
  add('chicken-carrot', '胡萝卜炖鸡', 35, '去皮去骨鸡肉 120 克|胡萝卜 100 克|姜 3 克|油 5 克|食盐 0.6 克|水 250 毫升', '胡萝卜洗净切块，鸡肉切成约 2 厘米小块；生熟刀具分开，不冲洗生鸡肉。|锅中加油，小火炒香姜片，放鸡肉翻炒表面变色。|加入胡萝卜和水，煮沸后盖盖小火炖约 20 分钟。|检查最大鸡块中心达到 74℃，胡萝卜软熟，最后加盐拌匀。');
  add('potato-chicken', '土豆焖鸡', 35, '去皮去骨鸡肉 120 克|土豆 100 克|洋葱 40 克|油 5 克|食盐 0.6 克|水 250 毫升', '土豆去皮切块，洋葱切丝，鸡肉切 2 厘米块。|油热后先炒洋葱 1 分钟，放入鸡肉翻炒变色。|加土豆和水，煮沸转小火，盖盖焖约 20 分钟。|鸡肉最厚处达到 74℃、土豆能用筷子穿透时，加盐稍收汁。');
  add('mushroom-chicken', '香菇蒸鸡', 25, '去皮去骨鸡肉 120 克|鲜香菇 80 克|姜 3 克|油 5 克|食盐 0.6 克|水 20 毫升', '香菇洗净切片，鸡肉切成约 1 厘米厚片。|鸡肉与姜、盐、油、水拌匀，平铺在耐热盘中，不堆得太厚。|铺上香菇，水开后中火蒸约 18～20 分钟。|用食品温度计确认最厚鸡肉中心达到 74℃；不足则继续蒸熟。');
  add('chicken-zucchini', '西葫芦鸡片', 20, '鸡胸肉 120 克|西葫芦 120 克|淀粉 3 克|油 5 克|食盐 0.6 克|水 40 毫升', '西葫芦洗净切片，鸡肉切薄片，与淀粉和 10 毫升水拌匀。|锅中加油，放鸡片翻炒到表面变色。|加西葫芦和剩余水，盖盖焖约 5～7 分钟。|揭盖翻匀，加盐；鸡片中心达到 74℃再出锅。');
  add('tomato-beef', '番茄炖牛肉', 60, '牛肉 120 克|番茄 150 克|洋葱 30 克|油 5 克|食盐 0.6 克|水 350 毫升', '牛肉切成约 2 厘米块，番茄和洋葱洗净切块。|油热后炒洋葱和牛肉 2 分钟，放番茄炒出汁。|加水煮沸后小火盖盖炖约 45～50 分钟，必要时补开水。|炖至牛肉完全熟透且能轻松咬开，加盐；肉较硬可继续炖。');
  add('radish-beef', '白萝卜炖牛肉', 65, '牛肉 120 克|白萝卜 150 克|姜 3 克|食盐 0.6 克|水 500 毫升', '牛肉、白萝卜切 2 厘米块，姜切片。|牛肉和姜入锅加水，煮沸后撇去浮沫。|盖盖小火炖约 35 分钟，再放入白萝卜。|继续炖 20～25 分钟至肉和萝卜软熟，加盐；连肉一起吃，不只喝汤。');
  add('celery-beef', '芹菜炒牛肉', 20, '牛肉 120 克|芹菜 120 克|淀粉 3 克|油 5 克|食盐 0.6 克|水 40 毫升', '芹菜洗净切短段，牛肉逆纹切薄片，与淀粉和 10 毫升水拌匀。|锅中加油，放牛肉分散翻炒约 3～4 分钟。|加入芹菜和余下水，盖盖焖约 3 分钟。|揭盖翻炒至牛肉完全熟透、芹菜熟软，最后加盐。');
  add('beef-pumpkin', '南瓜牛肉末', 20, '牛肉末 120 克|南瓜 150 克|油 5 克|食盐 0.6 克|水 120 毫升', '南瓜去皮去籽，切小丁。|油热后把牛肉末炒散，炒至变色。|加南瓜和水，盖盖小火焖约 10～12 分钟。|肉末中心达到 71℃，南瓜松软后加盐拌匀。');
  add('pork-mushroom', '香菇炒肉片', 20, '猪里脊肉 120 克|鲜香菇 100 克|淀粉 3 克|油 5 克|食盐 0.6 克|水 40 毫升', '香菇洗净切片，里脊逆纹切薄片，加淀粉和 10 毫升水拌匀。|热锅加油，肉片摊开翻炒约 3 分钟。|加香菇和余下水，小火焖约 5 分钟。|确认肉片和香菇完全熟透，加盐翻匀后出锅。');
  add('pork-broccoli', '西兰花炒肉片', 22, '猪里脊肉 120 克|西兰花 150 克|油 5 克|食盐 0.6 克|水 40 毫升', '西兰花分小朵，在流动水下洗净；里脊切薄片。|西兰花入沸水焯约 2 分钟，捞出。|热锅加油，肉片炒 3～4 分钟，放西兰花和水。|盖盖焖约 3 分钟，肉片完全熟透后加盐拌匀。');
  add('pork-yam', '山药蒸肉饼', 25, '猪瘦肉末 120 克|去皮山药 100 克|淀粉 3 克|油 3 克|食盐 0.6 克|水 30 毫升', '山药切细丁，与肉末、淀粉、油、盐和水拌匀。|放耐热浅盘，压成厚约 1.5 厘米的肉饼。|水开后中火蒸约 18～20 分钟。|确认中心达到 71℃，山药软熟；未熟就继续蒸，不凭外观判断中心。');
  add('pork-cabbage', '白菜烩肉片', 22, '猪里脊肉 120 克|大白菜 150 克|油 5 克|食盐 0.6 克|水 100 毫升', '白菜洗净切片，菜帮和叶分开放，肉切薄片。|油热后炒肉片至变色，加入白菜帮炒 2 分钟。|加水和白菜叶，盖盖焖约 6～8 分钟。|肉片完全熟透、白菜软熟后，加盐翻匀。');
  add('tofu-mushroom', '香菇炖豆腐', 20, '北豆腐 200 克|鲜香菇 100 克|胡萝卜 50 克|油 5 克|食盐 0.6 克|水 200 毫升', '豆腐切 2 厘米块，香菇切片，胡萝卜切薄片。|锅中加油，炒香菇和胡萝卜约 2 分钟。|放豆腐和水，煮沸后转小火炖 10 分钟。|轻轻翻动避免弄碎，蔬菜软熟后加盐，连豆腐一起吃。', '大豆');
  add('tofu-tomato', '番茄烩豆腐', 18, '北豆腐 200 克|番茄 150 克|油 5 克|食盐 0.6 克|水 100 毫升', '豆腐切小块，番茄洗净切丁。|锅中加油，番茄小火炒约 3 分钟至出汁。|加豆腐和水，煮沸后小火炖 8～10 分钟。|加盐，用锅铲轻推拌匀，豆腐完全热透后出锅。', '大豆');
  add('tofu-egg', '豆腐蒸蛋', 20, '鸡蛋 1 个|嫩豆腐 150 克|温水 80 毫升|食盐 0.4 克', '嫩豆腐切小块放入耐热浅碗。|鸡蛋加温水和盐搅匀，倒在豆腐上，盖耐热小盘。|水开后中小火蒸约 12～15 分钟。|中心蛋液完全凝固、豆腐热透后取出；中心未熟再蒸几分钟。', '蛋、大豆');
  add('lentil-pumpkin', '扁豆南瓜炖锅', 35, '干红扁豆 60 克|南瓜 120 克|番茄 100 克|油 5 克|食盐 0.6 克|水 350 毫升', '红扁豆淘洗，南瓜去皮切丁，番茄切块。|锅中加油炒番茄 2 分钟，加红扁豆、南瓜和水。|煮沸转小火，盖盖煮约 25 分钟，中途搅拌并视情况补水。|确认扁豆完全软熟、南瓜松软后加盐。', '', '这里用干红扁豆（lentil），不是鲜扁豆荚；不耐受豆类时可换鸡肉或豆腐菜。');
  add('salmon', '清蒸三文鱼', 20, '三文鱼 120 克|姜 3 克|食盐 0.4 克|水 20 毫升', '选正规来源三文鱼，冷冻鱼先在冰箱冷藏室解冻，时间另计。|去除可见鱼刺，放浅盘，铺姜片，加盐和水。|水开后蒸约 10～15 分钟，时间按厚度调整。|用温度计确认最厚处达到 63℃，再仔细检查鱼刺后食用。', '鱼');
  add('cod', '番茄鳕鱼', 22, '鳕鱼 120 克|番茄 150 克|油 5 克|食盐 0.5 克|水 100 毫升', '鳕鱼冷藏解冻后检查鱼刺，番茄切小块。|锅中加油，小火炒番茄约 3 分钟至出汁。|放入鱼块和水，盖盖小火炖约 10～12 分钟，不频繁翻动。|鱼最厚处达到 63℃后加盐，食用时再检查鱼刺。', '鱼');
  add('bok-choy', '清炒小白菜', 12, '小白菜 180 克|油 5 克|食盐 0.5 克|水 30 毫升', '小白菜掰开，逐叶用流动水洗净，切段。|热锅加油，先放较厚菜梗炒约 1 分钟。|放菜叶和水，翻炒后盖盖焖 2～3 分钟。|菜梗熟软后加盐，翻匀即出锅。');
  add('spinach', '香菇菠菜', 15, '菠菜 180 克|鲜香菇 50 克|油 5 克|食盐 0.5 克|水 30 毫升', '菠菜去根洗净，香菇洗净切片。|菠菜入沸水焯约 1 分钟，捞出沥水。|油热后先炒香菇，加入水焖 3 分钟。|放菠菜翻炒约 1～2 分钟，确认香菇熟透，加盐出锅。');
  add('broccoli', '胡萝卜西兰花', 15, '西兰花 140 克|胡萝卜 60 克|油 5 克|食盐 0.5 克|水 40 毫升', '西兰花掰小朵洗净，胡萝卜切薄片。|两种蔬菜入沸水焯约 2 分钟，捞出。|锅中加油，放蔬菜和水翻炒，盖盖焖 2 分钟。|确认西兰花茎和胡萝卜熟软，加盐翻匀。');
  add('cabbage', '清炒圆白菜', 15, '圆白菜 200 克|油 5 克|食盐 0.5 克|水 40 毫升', '圆白菜逐叶洗净，撕成小片，较厚叶梗切薄。|油热后先炒叶梗，再放叶片。|加水，盖盖焖约 3 分钟，再揭盖翻炒 1～2 分钟。|完全熟软后加盐，不用腌菜或浓酱调味。');
  add('zucchini', '胡萝卜炒西葫芦', 15, '西葫芦 150 克|胡萝卜 50 克|油 5 克|食盐 0.5 克|水 40 毫升', '两种蔬菜洗净，胡萝卜切薄片，西葫芦切半圆片。|油热后先炒胡萝卜 2 分钟。|加西葫芦和水，盖盖焖约 3 分钟。|揭盖翻炒至两种蔬菜熟软，加盐出锅。');
  add('green-beans', '焖四季豆', 25, '四季豆 180 克|油 5 克|食盐 0.5 克|水 180 毫升', '四季豆去两头和筋，洗净，切成约 3 厘米段。|锅中加油，放四季豆翻炒约 2 分钟。|加水，盖盖保持沸腾焖煮约 15～20 分钟，避免烧干。|确认完全熟透、没有生硬感后加盐；未熟的四季豆不能吃，时间不足就继续煮。');
  add('eggplant', '蒸茄子', 20, '茄子 180 克|油 3 克|食盐 0.4 克|水 20 毫升', '茄子洗净，切成约 1 厘米粗条，放耐热盘。|水开后蒸约 12～15 分钟，至用筷子能轻松压开。|将油、盐和 20 毫升热水拌匀，浇在熟茄子上。|轻轻拌匀食用，不用生蒜或大量酱汁。');
  add('pumpkin', '蒸南瓜', 20, '去皮南瓜 180 克|蒸锅用水 500 毫升', '南瓜去籽、去皮，切约 2 厘米块。|放入耐热盘，水开后上锅蒸。|中火蒸约 12～15 分钟，确认中心松软。|取出稍放凉即可，不额外加糖。');
  add('lettuce', '清炒油麦菜', 12, '油麦菜 180 克|油 5 克|食盐 0.5 克|水 30 毫升', '油麦菜逐叶洗净，切成短段。|锅中加油，放入较厚的菜梗炒约 1 分钟。|加入叶片和水，翻炒并焖 2～3 分钟。|完全熟软后加盐拌匀，现做现吃。');
  add('tomato-tofu-soup', '番茄豆腐汤', 18, '番茄 100 克|嫩豆腐 80 克|水 300 毫升|食盐 0.3 克', '番茄洗净切块，豆腐切小丁。|水煮沸放番茄，小火煮约 5 分钟。|加入豆腐再煮 5～7 分钟，确认完全热透。|加盐拌匀，连番茄和豆腐一起吃；汤是配菜，不替代主餐。', '大豆');
  add('radish-soup', '萝卜菌菇汤', 20, '白萝卜 100 克|鲜香菇 50 克|水 300 毫升|食盐 0.3 克', '萝卜洗净切薄片，香菇洗净切片。|水煮沸，放萝卜和香菇。|小火煮约 12～15 分钟，直到萝卜软熟、香菇熟透。|最后加盐，连菜一起食用。');
  add('corn-soup', '胡萝卜玉米汤', 25, '胡萝卜 80 克|玉米粒 60 克|水 300 毫升|食盐 0.3 克', '胡萝卜洗净切小丁，玉米粒冲净。|水煮沸后加入两种食材。|小火煮约 18～20 分钟，至胡萝卜和玉米完全熟软。|加少量盐即可，连食材一起吃，不额外加糖。');
  add('wintermelon-soup', '冬瓜香菇汤', 18, '去皮冬瓜 150 克|鲜香菇 50 克|水 300 毫升|食盐 0.3 克', '冬瓜去皮去瓤切小片，香菇洗净切片。|水煮沸放入两种食材。|小火煮约 10～12 分钟，至冬瓜半透明、香菇完全熟透。|加盐拌匀，放至适口温度。');
  add('egg-soup', '菠菜蛋花汤', 15, '菠菜 80 克|鸡蛋 1 个|水 300 毫升|食盐 0.3 克', '菠菜洗净切段，先用另一锅沸水焯约 1 分钟，沥水。|鸡蛋打散，汤锅水煮沸后倒入菠菜。|缓缓倒入蛋液，待凝固后再轻轻搅拌，继续煮约 2 分钟。|蛋液完全熟透后加盐出锅。', '蛋');

  // Each explicit row represents one full day, not a repeated 7-day sample.
  // Breakfast starch, lunch protein, lunch vegetable, dinner protein, dinner vegetable, soup.
  const rows = [
    ['millet','chicken-carrot','bok-choy','tofu-tomato','spinach','wintermelon-soup'],
    ['oats','pork-yam','zucchini','salmon','broccoli','corn-soup'],
    ['rice-porridge','tomato-beef','cabbage','mushroom-chicken','lettuce','radish-soup'],
    ['bun','tofu-mushroom','spinach','pork-cabbage','bok-choy','tomato-tofu-soup'],
    ['corn-porridge','potato-chicken','broccoli','cod','zucchini','wintermelon-soup'],
    ['sweet-potato','radish-beef','lettuce','tofu-egg','cabbage','corn-soup'],
    ['bread','pork-mushroom','bok-choy','chicken-zucchini','pumpkin','egg-soup'],
    ['oats','celery-beef','broccoli','tofu-mushroom','lettuce','wintermelon-soup'],
    ['bun','chicken-zucchini','spinach','cod','cabbage','corn-soup'],
    ['millet','pork-broccoli','eggplant','lentil-pumpkin','bok-choy','radish-soup'],
    ['bread','mushroom-chicken','zucchini','pork-yam','lettuce','tomato-tofu-soup'],
    ['rice-porridge','beef-pumpkin','bok-choy','salmon','spinach','wintermelon-soup'],
    ['corn-porridge','tofu-tomato','broccoli','potato-chicken','cabbage','corn-soup'],
    ['sweet-potato','pork-cabbage','lettuce','tomato-beef','zucchini','radish-soup'],
    ['bun','radish-beef','spinach','chicken-carrot','cabbage','tomato-tofu-soup'],
    ['millet','tofu-mushroom','bok-choy','salmon','eggplant','wintermelon-soup'],
    ['oats','pork-yam','green-beans','celery-beef','broccoli','corn-soup'],
    ['sweet-potato','potato-chicken','lettuce','lentil-pumpkin','spinach','radish-soup'],
    ['bread','pork-mushroom','cabbage','cod','bok-choy','tomato-tofu-soup'],
    ['rice-porridge','tomato-beef','zucchini','tofu-egg','broccoli','wintermelon-soup'],
    ['corn-porridge','chicken-zucchini','bok-choy','pork-broccoli','eggplant','corn-soup'],
    ['bread','beef-pumpkin','lettuce','tofu-tomato','cabbage','radish-soup'],
    ['oats','mushroom-chicken','green-beans','cod','spinach','tomato-tofu-soup'],
    ['bun','pork-cabbage','broccoli','celery-beef','zucchini','wintermelon-soup'],
    ['millet','lentil-pumpkin','bok-choy','chicken-carrot','eggplant','corn-soup'],
    ['corn-porridge','pork-yam','spinach','salmon','cabbage','radish-soup'],
    ['sweet-potato','radish-beef','zucchini','tofu-mushroom','lettuce','tomato-tofu-soup'],
    ['rice-porridge','potato-chicken','broccoli','pork-mushroom','green-beans','wintermelon-soup'],
    ['oats','celery-beef','bok-choy','tofu-egg','eggplant','corn-soup'],
    ['sweet-potato','chicken-zucchini','cabbage','salmon','lettuce','radish-soup'],
    ['bread','pork-broccoli','spinach','lentil-pumpkin','zucchini','tomato-tofu-soup'],
    ['bun','tofu-tomato','green-beans','mushroom-chicken','broccoli','wintermelon-soup'],
    ['millet','tomato-beef','lettuce','cod','bok-choy','corn-soup'],
    ['corn-porridge','pork-mushroom','eggplant','chicken-carrot','spinach','radish-soup'],
    ['rice-porridge','beef-pumpkin','cabbage','tofu-mushroom','green-beans','tomato-tofu-soup'],
    ['sweet-potato','pork-yam','bok-choy','potato-chicken','broccoli','wintermelon-soup'],
    ['bread','lentil-pumpkin','spinach','cod','cabbage','corn-soup'],
    ['oats','radish-beef','green-beans','chicken-zucchini','lettuce','radish-soup'],
    ['corn-porridge','mushroom-chicken','eggplant','tofu-tomato','bok-choy','tomato-tofu-soup'],
    ['bun','pork-cabbage','broccoli','salmon','zucchini','wintermelon-soup'],
    ['rice-porridge','celery-beef','lettuce','pork-broccoli','spinach','corn-soup'],
    ['millet','chicken-carrot','cabbage','tofu-mushroom','green-beans','radish-soup']
  ];
  const staples = ['rice', 'millet-rice', 'pumpkin-rice', 'mixed-rice', 'noodles'];
  const fruits = ['apple', 'pear', 'orange', 'kiwi', 'banana'];
  const notes = [
    '这一周选了较软的家常做法；只有已获准恢复普通饮食时才开始使用。',
    '主食、蛋白质、蔬菜都保留；不喜欢的食材可换成自己能耐受的同类食物。',
    '荤菜、豆类和蔬菜交替搭配，汤里的食材也一起吃。',
    '提前处理当天食材，可以先开电饭煲，再准备炖菜和蔬菜。',
    '按食欲和实际需要调整份量；这份菜单没有计算个人能量和营养目标。',
    '延续日常多样饮食，42 天结束后也可以继续沿用喜欢的家常菜。'
  ];
  const days = rows.map((row, index) => {
    const [breakfast, lunch, lunchVeg, dinner, dinnerVeg, soup] = row;
    const breakfastIds = [breakfast, index % 3 === 0 ? 'egg-custard' : 'boiled-egg'];
    if (breakfast !== 'oats') breakfastIds.push('milk');
    return { day: index + 1, week: Math.floor(index / 7) + 1, note: notes[Math.floor(index / 7)], meals: [
      { label: '早餐', time: '07:30', recipeIds: breakfastIds },
      { label: '上午加餐', time: '10:00', recipeIds: [fruits[index % fruits.length]] },
      { label: '午餐', time: '12:00', recipeIds: [staples[Math.floor(index / 7) === 0 ? 0 : index % staples.length], lunch, lunchVeg] },
      { label: '下午加餐', time: '15:00', recipeIds: ['yogurt', fruits[(index + 2) % fruits.length], 'nuts'] },
      { label: '晚餐', time: '18:00', recipeIds: [staples[Math.floor(index / 7) === 0 ? 0 : (index + 1) % staples.length], dinner, dinnerVeg, soup] }
    ] };
  });
  window.MEAL_PLAN = { version: 1, recipes, days, sources: [
    { title: 'CDC：哺乳期多样饮食与个人营养需求', url: 'https://www.cdc.gov/breastfeeding-special-circumstances/hcp/diet-micronutrients/maternal-diet.html' },
    { title: 'FDA：孕期与哺乳期鱼类选择', url: 'https://www.fda.gov/food/consumers/advice-about-eating-fish' },
    { title: 'FoodSafety.gov：安全烹饪中心温度', url: 'https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures' }
  ] };
})();
