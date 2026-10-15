/* Patient education, not a personal care plan. Clinical windows and local service dates differ. */
(() => {
  'use strict';
  const sources = {
    cnPublic:{name:'国家基本公共卫生服务规范（第三版）',url:'https://dghb.dg.gov.cn/attachment/0/229/229312/4128171.pdf',date:'2017-02 · 国家规范，政府 PDF 镜像',scope:'儿童及孕产妇健康管理：出院后1周内访视、宝宝28～30天满月管理和妈妈产后42天检查。当地实施与个体复诊另行确认。'},
    vaccine:{name:'国家免疫规划疫苗儿童免疫程序（2021版）',url:'https://www.nhc.gov.cn/cms-search/downFiles/7559f978e6be4ec585a9a1fe0d9224f6.pdf',date:'2021-02',scope:'本页只引用乙肝及卡介苗相关程序；特殊儿、漏种及其余疫苗以接种门诊当前方案为准，不是一张完整接种表。'},
    blood:{name:'荥阳卫健部门：新生儿血片采集流程',url:'https://public.xingyang.gov.cn/D0107Y/820396.jhtml',date:'2015-12-29发布的地方流程全文',scope:'仅用于足跟血72小时后、充分喂养、7天内的常见窗口例证；并非全国最新统一流程，听筛时点采用另列来源。'},
    hearing:{name:'湖南卫健委：新生儿筛查服务清单',url:'https://wjw.hunan.gov.cn/wjw/xxgk/tzgg/202601/33900710/files/eeefebc18b9f4e25b3a3e23f7f38d1e9.pdf',date:'2025-12-31印发 · 省级试行服务清单',scope:'PDF第7页：听力48小时至出院前初筛、42天内复筛、未通过者3月龄内诊断；只引用时间窗，不把湖南免费项目承诺套用于全国。'},
    shBlood:{name:'上海市新生儿遗传代谢病筛查技术规范',url:'https://www.shanghai.gov.cn/gwk/search/content/2a906cbfa05e4241a2413d24e5c26cc8',date:'2024-05-10印发 · 2024-05-11发布',scope:'上海正常采样为出生48小时～7天、充分哺乳；用于说明地区差异，不将上海病种数或复采流程套用于全国。'},
    whoPost:{name:'WHO 母婴产后照护建议',url:'https://www.who.int/news/item/30-03-2022-who-urges-quality-care-for-women-and-newborns-in-critical-first-weeks-after-childbirth',date:'2022-03-30',scope:'首24小时照护，以及48～72小时、7～14天、第6周的健康母婴接触框架；需按风险增加，不等于额外重复挂号。'},
    whoFeed:{name:'WHO 婴幼儿喂养',url:'https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding',date:'2026-08-04',scope:'母婴适宜时尽早开始、按需喂养及健康纯母乳婴儿的原则；不照搬其他国家特殊疾病喂养政策。'},
    whoCare:{name:'WHO 新生儿日常照护',url:'https://www.who.int/tools/your-life-your-health/life-phase/newborns-and-children-under-5-years/caring-for-newborns',date:'2022-09-30',scope:'清洁、干燥脐部、洗手和新生儿危险征象；医院特殊护理方案优先。'},
    vitaminK:{name:'CDC 新生儿维生素K预防问答',url:'https://www.cdc.gov/vitamin-k-deficiency/faq/index.html',date:'2025-01-17',scope:'出生后由医院安排预防，维生素K不是疫苗；不提供家庭自行给药方案。'},
    sleep:{name:'CDC 婴儿安全睡眠',url:'https://www.cdc.gov/reproductive-health/features/babies-sleep.html',date:'2024-09-25',scope:'仰卧、平坦坚实的独立睡面、同室不同床及避免松软物品和过热；不是对某款产品的推荐。'},
    formula:{name:'CDC 配方奶准备与储存',url:'https://www.cdc.gov/infant-toddler-nutrition/formula-feeding/preparation-and-storage.html',date:'2026-05-14',scope:'水粉比例、卫生和使用时限；未满2月、早产或免疫低下宝宝要额外防污染，不将美国自来水条件直接套用于本地。'},
    jaundice:{name:'NHS 新生儿黄疸',url:'https://www.nhs.uk/conditions/jaundice-in-babies/',date:'正文审阅 2026-03-24',scope:'早现黄疸、全身异常及测量与随访；不凭照片、颜色或统一数值决定是否治疗。'},
    fever:{name:'NHS 婴幼儿发热与警示症状',url:'https://www.nhs.uk/symptoms/fever-in-children/',date:'正文审阅 2024-01-03',scope:'未满3个月体温≥38℃需紧急联系医生；不把大龄儿童的居家观察建议用于新生儿。急救号码按中国大陆写120。'},
    vitaminD:{name:'CDC 婴儿维生素D',url:'https://www.cdc.gov/infant-toddler-nutrition/vitamins-minerals/vitamin-d.html',date:'2026-04-14',scope:'出生后不久的补充需求与喂养方式有关；本页提醒确认方案，不给统一剂量或推销产品。'},
    gdm:{name:'中华医学会：中国糖尿病防治指南（2024版）全文',url:'https://files.sciconf.cn/master/50/33230/202501/20250120111901_47273.pdf',date:'2025-01-20发布 · 期刊2025年1月',scope:'CMA官网发布的期刊全文；仅妊娠期糖尿病的条件随访：产后4～12周75g OGTT，PDF第69页（期刊页84）。不以家用空腹血糖代替。'},
    csRecovery:{name:'NHS 剖宫产后恢复',url:'https://www.nhs.uk/tests-and-treatments/caesarean-section/recovery/',date:'正文审阅 2023-01-04',scope:'伤口、疼痛、轻度活动与求助；英国住院天数及具体服务不作国内标准。'},
    bodyRecovery:{name:'NHS 产后身体与盆底恢复',url:'https://www.nhs.uk/baby/support-and-services/your-post-pregnancy-body/',date:'正文审阅 2026-07-20',scope:'渐进恢复，疼痛、漏尿或下坠时按需评估；不是人人都需购买的康复项目清单。'},
    mental:{name:'NHS 产后抑郁',url:'https://www.nhs.uk/mental-health/conditions/postnatal-depression/',date:'正文审阅 2026-03-18',scope:'短暂低落、持续或加重症状及求助；两周不是必须等待的门槛。'},
    psychosis:{name:'NHS 产后精神病',url:'https://www.nhs.uk/mental-health/conditions/post-partum-psychosis/',date:'正文审阅 2023-10-18',scope:'突发幻觉、妄想、混乱或躁狂需急诊评估，不能依靠网页评分排除。'},
    contraception:{name:'NHS 产后性生活与避孕',url:'https://www.nhs.uk/baby/support-and-services/sex-and-contraception-after-birth/',date:'正文审阅 2024-02-07',scope:'月经恢复前也可能怀孕，应提前讨论适合的避孕；不照搬英国药具服务安排。'},
    lactation:{name:'Southampton NHS 不哺乳时的乳房照护',url:'https://www.uhs.nhs.uk/Media/UHS-website-2019/Patientinformation/Pregnancyandbirth/Suppressing-your-breast-milk-supply-after-giving-birth-2907-PIL.pdf',date:'2024-09审阅 · 版本3',scope:'胀乳、舒适支持与减少泌乳的原则；是否用药由医生评估，本页不提供药名或剂量。'},
    breastPain:{name:'NHS 乳房疼痛与炎症警示',url:'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-problems/breast-pain/',date:'正文审阅 2026-03-11',scope:'乳房红热痛、发热或全身不适需要评估；避免过量挤奶，不自行使用页面提到的药物。'},
    stopping:{name:'NHS 逐步停止哺乳',url:'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/how-to-stop/',date:'正文审阅 2023-03-16',scope:'已建立泌乳者逐步减少可降低胀乳等问题；喂养调整按母婴需要与专业支持进行。'},
    activity:{name:'NHS 产后活动与恢复',url:'https://www.nhs.uk/baby/support-and-services/keeping-fit-and-healthy-with-a-baby/',date:'正文审阅 2026-04-20',scope:'按耐受开始轻活动；剖宫产、复杂分娩或有症状时个体评估，不设统一达标日。'},
    maternalWarning:{name:'CDC HEAR HER 孕产妇警示症状',url:'https://www.cdc.gov/hearher/maternal-warning-signs/index.html',date:'2024-05-15',scope:'孕期及产后一年内的急症信号；不是完整急症清单，不能等待达到某个出血量才求助。'}
  };
  const item=(id,audience,kind,title,text,refs)=>({id,audience,kind,title,text,refs});
  const stages=[
    {id:'first-day',label:'首24小时',when:'从宝宝出生时间开始计时 · 住院照护',summary:'先由医护确认母婴稳定，核对首轮预防、喂养支持与观察安排。',items:[
      item('baby-start','baby','医院安排','保暖、评估与首次喂养',['由医护评估宝宝状态、保暖并帮助安全接触。母婴情况允许时尽早开始喂养；需要治疗或暂时分离时采用个体方案，不为赶时间强行完成。'],['whoPost','whoFeed']),
      item('baby-vaccine-first','baby','医院安排','核对乙肝首剂、卡介苗和维生素K',['乙肝首剂常规在出生24小时内；妈妈HBsAg阳性或不详时，首剂建议12小时内尽早，阳性者还需医院安排免疫球蛋白等阻断措施。不要等回家再问。','卡介苗按出生接种程序和宝宝情况评估，不能把“24小时内”套到所有宝宝。确认维生素K预防是否已安排；它不是疫苗。暂缓时带走后续计划。'],['vaccine','vitaminK']),
      item('mother-observation','mother','医院安排','妈妈仍需持续观察',['医护会观察出血、宫缩、生命体征、排尿、疼痛等。WHO建议健康母婴在机构分娩后至少接受24小时照护；剖宫产、并发症或状态不稳定时按实际情况延长。24小时不是自动出院时间。'],['whoPost']),
      item('mother-contact','mother','家庭照护','告诉团队疼痛、喂养意愿和不舒服',['清楚表达疼痛、头晕、排尿困难与喂养选择，需要时请家人协助沟通。家属承担联络和生活事务，保证妈妈有照护与休息；具体安排为本站实用整理。'],['whoPost'])
    ]},
    {id:'day-2-3',label:'第2～3天',when:'出生后48～72小时 · 住院或已返家',summary:'WHO的母婴接触窗口之一；如果仍在医院，可由相应查房评估承担，不必机械重复挂号。',items:[
      item('baby-hearing-first','baby','医院安排','听力初筛与未通过后的预约',['常见听力初筛安排在出生48小时后至出院前。未通过或漏筛应拿到42天内复筛安排；未通过并不等于确诊，仍须按时追踪。NICU或有风险者采用专门流程。'],['hearing']),
      item('baby-blood-window','baby','医院安排','足跟血：确认本院采样窗口',['常见安排是出生72小时后、充分喂养后至7天内；上海2024规范为48小时～7天。按出生医院当地流程完成，不自行等待某个固定日子。','提前出院要约好采血；早产、低出生体重、输血或正在治疗者可能需补采、复采。具体病种和召回安排因地区而异。'],['blood','shBlood']),
      item('baby-jaundice-plan','baby','需要预约','拿到黄疸评估和复测计划',['出院前问清黄疸检查结果、下一次复测时间及地点。复查取决于日龄、孕周、测值和危险因素，不能统一等到满月。出生24小时内出现黄疸，或伴难唤醒、拒奶等情况应立即就医。'],['jaundice']),
      item('mother-early-contact','mother','医院安排','复核出血、伤口、排尿和乳房',['出生后48～72小时的接触用于确认恢复、喂养及照护困难。有高血压、明显失血、感染或手术等情况时，随访可能更早、更密集，按出院医嘱安排。'],['whoPost','cnPublic'])
    ]},
    {id:'week-1',label:'出院前后／首周',when:'筛查按出生时间；社区访视按出院时间',summary:'两个起算点要分清：国家公卫的母婴访视是“出院后1周内”，不是统一出生第7天。',items:[
      item('baby-discharge','baby','家庭照护','宝宝出院交接清单',['保存出院记录、接种证／接种记录和筛查单；确认血筛结果怎么查、听筛是否通过、黄疸何时复查，以及异常时联系哪里。电话号码保持可接通。此卡为本站实用整理。'],['cnPublic','blood','hearing']),
      item('baby-homevisit','baby','需要预约','出院后1周内：新生儿家庭访视',['联系居住地社区卫生服务中心或乡镇卫生院，核查喂养、体重、黄疸、脐部等。早产、低体重、多胎或有疾病的宝宝可增加访视；不取代出院时已约好的专科复诊。'],['cnPublic']),
      item('mother-discharge','mother','家庭照护','把妈妈的个体复诊写清楚',['带好药物、伤口及复诊指导，问清血压、血糖、贫血或其他问题“何时查、查什么、什么变化联系谁”。按医嘱用药和调整，不统一等42天。','出院前就可讨论避孕：最早产后约3周即可再次怀孕，月经未恢复也不能简单排除。此卡为本站实用整理。'],['cnPublic','csRecovery','contraception']),
      item('mother-homevisit','mother','需要预约','出院后1周内：妈妈产后访视',['由社区衔接产后访视，评估恶露、子宫与伤口、乳房及情绪等。有异常时转回分娩医院或专科；如果尚未接到联系，可主动询问当地服务。'],['cnPublic']),
      item('mother-breast','mother','家庭照护','不母乳也可能胀乳',['无论采用哪种喂养方式，都可请医护帮助处理乳房不适。不哺乳者可用合适支撑内衣、短时冷敷缓解；已建立泌乳后减少喂／挤奶通常需要逐步进行。','避免用力揉按、反复挤空或自行用回奶药。持续红热痛、伴发热或全身不适时及时就诊。'],['lactation','stopping','breastPain'])
    ]},
    {id:'week-2',label:'第7～14天',when:'出生后第7～14天 · 结合已有社区与医院安排',summary:'WHO建议再次接触评估，确认返家适应与未解决的问题；和国内访视协调，不把两套框架叠加成强制检查次数。',items:[
      item('baby-two-week','baby','需要预约','看看喂养、体重和黄疸是否按计划改善',['按出院计划评估生长、喂养、排泄与黄疸，关注脐部和家庭照护困难。黄疸不改善、加重，或出现深色尿、浅白便时及时就医，不仅按“母乳性”自行解释。'],['whoPost','jaundice']),
      item('baby-screen-results','baby','家庭照护','查询筛查结果，及时响应召回',['没有收到电话不能自动理解为全部通过。按筛查单查询并保存结果；异常或样本需复采时尽快联系筛查机构。筛查提示需复查，不等于已经确诊。'],['blood','shBlood']),
      item('mother-wound-week2','mother','家庭照护','伤口、恶露和活动按恢复调整',['剖宫产切口或会阴伤口疼痛加重、红肿、流脓、异味或裂开，应提前就诊。恢复平稳时从轻柔活动和短程步行开始，有手术或复杂分娩者按个体指导，不强行赶运动天数。'],['csRecovery','activity']),
      item('mother-mood-week2','mother','家庭照护','情绪困难可以现在求助',['短暂产后低落通常在两周内改善；持续、加重或已难以应付时可以随时求助，不必等满两周。家属接手部分夜间照护和家务，保障休息并认真倾听。'],['mental'])
    ]},
    {id:'month-1',label:'满月／第4周起',when:'宝宝出生28～30天；有些妈妈另有4～12周检查窗口',summary:'宝宝满月管理和妈妈42天检查是两个节点，可以分别预约；不要将母婴所有检查都挤到同一天。',items:[
      item('baby-one-month','baby','需要预约','宝宝28～30天：满月健康管理',['按当地儿保安排评估体重、身长、头围、喂养和查体，并核对筛查与接种。带上母子健康手册、出院与筛查记录；需要补做的项目按安排完成。'],['cnPublic']),
      item('baby-hepb-second','baby','需要预约','1月龄：核对乙肝第二剂',['常规乙肝程序是0、1、6月龄。具体接种日看接种证与门诊安排；早产、特殊阻断或暂缓者可能采用不同程序，不自行补算或重新开始。'],['vaccine']),
      item('mother-gdm','mother','需要预约','仅有妊娠期糖尿病者：4～12周OGTT',['中国2024版糖尿病指南建议GDM妈妈在产后4～12周做75g口服葡萄糖耐量试验，重新评估糖代谢。预约及准备按医院要求；家用空腹血糖不能替代这项评估。没有GDM等指征者不因这张时间表人人做。'],['gdm']),
      item('mother-contraception-plan','mother','家庭照护','提前讨论避孕与性生活',['月经尚未恢复也可能排卵，不能只靠“在哺乳”判断不会怀孕。提前讨论适合的避孕方式；性生活以本人意愿、舒适度、伤口恢复及个体医嘱为准，没有人人相同的强制恢复日。'],['contraception'])
    ]},
    {id:'week-6',label:'第6周／42天',when:'妈妈产后约42天；宝宝听力复筛应在42天内按通知完成',summary:'6周是复核与继续照护的节点，不代表身体自动全部恢复，也不替代宝宝满月检查。',items:[
      item('baby-hearing-repeat','baby','需要预约','听力未通过或漏筛：按时复筛／转诊',['按照通知在42天内完成复筛；仍未通过者尽早转诊，争取3月龄内进一步诊断。不要等到3个月才开始预约。高危或NICU宝宝可能直接进入专科流程。'],['hearing']),
      item('mother-42-days','mother','需要预约','妈妈42天：产后健康检查',['评估恢复、伤口、血压、情绪及需要解决的排尿排便或疼痛问题，讨论喂养、性健康和避孕；辅助检查由症状和医生评估决定。孕产期异常或仍未恢复者按安排回分娩医院／专科。'],['cnPublic']),
      item('mother-pelvic-plan','mother','家庭照护','有症状时评估盆底与活动能力',['持续漏尿、便失禁、明显下坠或疼痛，可以请专业人员评估，不必硬等或自行加大训练量。42天不等于自动允许跑跳、提重物；也不表示每个人都必须购买电刺激或“骨盆修复”套餐。'],['bodyRecovery'])
    ]},
    {id:'later',label:'6周以后',when:'继续按儿保、接种及个体专科计划随访',summary:'新生儿期通常指出生后28天内；本页延伸到母婴后续交接，帮助把尚未解决的问题跟到底。',items:[
      item('baby-ongoing','baby','需要预约','筛查未结案或高危儿：继续追踪',['听力、血筛和其他专科问题按转诊计划跟进。早产或住院治疗宝宝的眼底等检查与随访，以专科出院单为准，不套用健康足月儿的日程。'],['hearing','cnPublic']),
      item('mother-ongoing','mother','需要预约','把持续问题交接到长期随访',['伤口疼痛、漏尿、下坠、情绪或慢病仍有问题时继续就诊，不因完成42天检查停止照护。GDM即使此次血糖恢复正常也需长期复查，下一次时间由医生按风险确定。'],['bodyRecovery','mental','gdm']),
      item('mother-year-warning','mother','家庭照护','产后一年内仍留意警示症状',['产后一年内出现胸痛、呼吸困难、晕厥、严重头痛或异常出血等，应及时就医并说明曾经怀孕或生产的时间。不要只因“已经出月子”就排除相关问题。'],['maternalWarning'])
    ]}
  ];
  const daily=[
    item('daily-safe-sleep','baby','家庭照护','每一次睡眠：仰卧、独立、平坦坚实',['宝宝每次入睡仰卧，睡在平坦、坚实、独立的婴儿睡面，同室不同床。床内不放枕头、松被、玩具或床围，不用加重睡袋，不蒙头或过度捂热。吐奶并不意味着要改为侧睡或趴睡。'],['sleep']),
    item('daily-feeding','baby','家庭照护','喂养时观察宝宝状态',['按饥饿信号及时喂养，有含接、奶量或体重方面困难请医护评估。健康纯母乳婴儿0～6个月不常规额外喂水；患病或需要补液者由医生决定。不要把拒奶、难唤醒当作“睡得好”。'],['whoFeed','jaundice']),
    item('daily-formula','baby','家庭照护','配方奶：比例和防污染同样重要',['洗手并清洁消毒喂养用具，严格按标签水粉比例，先量水后加奶粉，不自行稀释或加浓。奶粉并非无菌：未满2月、早产或免疫低下者，向出生医院确认额外防污染与安全冲调方案。','现配尽快喂；一般在配好2小时内、开始喂后1小时内使用，喝剩的丢弃。品牌或医院有更严格要求时遵照执行，不用微波炉加热。'],['formula']),
    item('daily-cord','baby','家庭照护','换尿布和脐部：清洁、干燥、观察',['护理前后洗手，保持脐部清洁干燥，避免尿布摩擦污染；不要自行涂油、粉、草药或强行拉掉脐带。医院有特定方案时按其指导。红肿扩散、流脓、异味或持续出血时联系儿科。'],['whoCare']),
    item('daily-vitamin','baby','家庭照护','补充剂：在出院或儿保时确认方案',['向医护确认维生素D的开始时间、产品和补充方案，计入配方奶及复合制剂已有含量，避免多种产品重复。早产、低体重或有疾病的宝宝按专科方案，不自行套用足月儿补充表。'],['vitaminD']),
    item('daily-jaundice','baby','家庭照护','黄疸：看变化，按计划测，不靠照片判断',['出现或加重时及时联系医护；出生24小时内出现，或伴拒奶、嗜睡等异常要立即评估。深色尿、浅白便也要尽快就诊。不能凭肉眼、照片或单一固定数值排除风险，不自行用晒太阳、草药或停母乳替代评估。'],['jaundice']),
    item('daily-mother-body','mother','家庭照护','伤口、排尿排便和活动循序渐进',['按出院指导清洁伤口、使用药物并逐步活动；疼痛加重、伤口流脓裂开、排尿困难等及时求助。不能把长期卧床当作保护伤口，也不按固定天数强迫完成运动目标。'],['csRecovery','activity']),
    item('daily-mother-rest','mother','家庭照护','家属把休息支持落实到每天',['分担家务、夜间照护和沟通，让妈妈获得休息。持续低落、焦虑、失眠或难以应付时尽早寻求专业支持；这不是等满两周才可以求助的测验。'],['mental']),
    item('daily-mother-milk','mother','家庭照护','所有喂养选择都需要乳房照护',['乳房持续红热痛、发热或全身不适需就医。不哺乳也可能胀乳；温和处理并咨询医护，避免用力揉按或自行服用回奶药，方案按是否已建立泌乳调整。'],['lactation','breastPain'])
  ];
  const alerts={
    baby:['呼吸困难、嘴唇或皮肤发青、抽搐、明显反应差或难唤醒：立即急诊，危急时120。','未满3个月体温≥38℃须紧急联系医生就诊；新生儿明显发冷、拒奶或尿量明显减少也要及时评估，不等满月。','出生24小时内出现黄疸，或黄疸伴拒奶、嗜睡、异常松软／僵硬、呼吸异常等，立即就医。'],
    mother:['严重出血、晕厥、胸痛或呼吸困难：立即求助，危急时120。出现自伤／伤害宝宝想法也须立即寻求专业评估；有即刻危险时120，并由可信的人陪伴。','持续或剧烈头痛、视力改变、发热≥38℃、剧烈腹痛、恶臭分泌物或单侧小腿红肿痛等，立即联系医护，不等42天。','突然幻觉、妄想、明显混乱或躁狂，需紧急精神与产科评估；不要让本人独自承担，也不要用在线评分排除。'],
    refs:['fever','jaundice','whoCare','maternalWarning','psychosis']
  };
  window.POSTPARTUM_GUIDE={reviewed:'2026-10-15',sources,stages,daily,alerts};
})();
