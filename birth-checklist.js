/* This builds discussion questions, not a diagnostic or delivery prediction. */
(function (root) {
  'use strict';
  const choices = {
    urgent: [['unknown','不确定'],['no','目前没有下列警示症状'],['yes','现在有下列任一警示症状']],
    babies: [['unknown','不清楚'],['single','单胎'],['multiple','双胎或更多']],
    presentation: [['unknown','不清楚／还未确定'],['head','头先露'],['breech','臀位'],['transverse','横位或其他胎位']],
    placenta: [['unknown','不清楚'],['clear','医生说没有低置／前置问题'],['low','低置，待复查或评估'],['covering','覆盖宫颈内口／前置胎盘'],['accreta','疑似胎盘植入／前置血管']],
    history: [['unknown','不清楚'],['none','没有剖宫产或子宫手术'],['cs','既往剖宫产'],['surgery','其他子宫手术'],['rupture','既往子宫破裂／已知古典式子宫切口']],
    conditions: [['unknown','不清楚'],['none','目前没有医生告知的合并症'],['bp','高血压／子痫前期等'],['sugar','糖尿病／血糖异常'],['other','其他合并症或检查异常']],
    advice: [['unknown','还未讨论／不清楚'],['vaginal','医生目前建议讨论阴道分娩'],['cs','医生目前建议剖宫产'],['review','医生要求复查后再定']],
    preference: [['unknown','尚未确定'],['vaginal','倾向阴道分娩'],['pain','最重视镇痛和减轻恐惧'],['cs','倾向计划剖宫产']],
    service: [['unknown','还在比较'],['ordinary','倾向普通产科'],['special','倾向特需／国际部']]
  };
  const labels = {urgent:'警示症状', babies:'胎数', presentation:'胎位', placenta:'胎盘情况', history:'剖宫产／子宫手术史', conditions:'合并症', advice:'医生目前意见', preference:'个人偏好', service:'服务偏好'};
  function normalized(input) {
    const data = {};
    for (const [key, options] of Object.entries(choices)) data[key] = options.some(([value]) => value === input?.[key]) ? input[key] : 'unknown';
    const value = String(input?.weeks ?? '').trim();
    data.weeks = value !== '' && /^\d{1,2}$/.test(value) && +value >= 1 && +value <= 43 ? +value : null;
    return data;
  }
  function build(input = {}) {
    const data = normalized(input);
    const recorded = Object.keys(choices).map(key => `${labels[key]}：${choices[key].find(([value]) => value === data[key])[1]}`);
    recorded.unshift(`孕周：${data.weeks === null ? '尚未填写／需核对' : `约 ${data.weeks} 周（以产检记录为准）`}`);
    const result = {type:'incomplete', title:'先补齐关键资料', recorded, missing:[], questions:[], notes:[], refs:['whoLabor']};
    if (data.urgent === 'yes') {
      result.type = 'urgent'; result.title = '现在先联系产科急诊或 120';
      result.notes = ['不要等待这份清单或下一次产检。请说明孕周、症状及是否已生产；严重出血、晕厥、胸痛、呼吸困难或存在即刻伤害风险时拨打 120，并请可信的人陪伴。','这份工具不能判断急症原因。'];
      result.refs = ['warning']; return result;
    }
    const keys = ['babies','presentation','placenta','history','conditions'];
    result.missing = keys.filter(key => data[key] === 'unknown').map(key => labels[key]);
    if (data.weeks === null) result.missing.unshift('准确孕周');
    if (data.urgent === 'unknown') result.missing.unshift('当前症状是否需要及时就医');
    result.notes.push('未选择警示症状不等于排除风险；症状不在列表或拿不准时也应联系医护。这是就诊问题清单，不是诊断、试产许可或手术指征判断。');
    if (['covering','accreta'].includes(data.placenta) || data.presentation === 'transverse' || data.history === 'rupture') {
      result.type = 'specialist'; result.title = '请产科专科明确分娩方式与地点';
    } else if (['low'].includes(data.placenta) || ['breech'].includes(data.presentation) || ['cs','surgery'].includes(data.history) || data.babies === 'multiple' || ['bp','sugar','other'].includes(data.conditions)) {
      result.type = 'review'; result.title = '有需要重点复核的项目';
    } else if (!result.missing.length) {
      result.type = 'discussion'; result.title = '资料可用于门诊讨论，仍不能确定分娩方式';
    }
    if (data.weeks === null) result.questions.push('目前准确孕周和预产期是什么？最近需要补做哪项检查？');
    else if (data.weeks >= 41) { result.questions.push('已经约 41 周或以上，继续等待与引产各有什么利弊？何时联系或住院？'); result.refs.push('inductionCN'); }
    else if (data.weeks < 37) result.questions.push('目前是否需要再次复查胎位、胎盘和生长情况？若出现早产迹象应去哪个院区？');
    if (data.babies === 'multiple') result.questions.push('多胎的绒毛膜性、第一胎胎位和胎儿情况对方式与时机有什么影响？医院能否接诊？');
    if (data.presentation === 'breech') { result.questions.push('此孕周的臀位需何时复查？是否适合医生实施外倒转？若不适合或未成功，有哪些分娩方案？'); result.refs.push('niceCS'); }
    if (data.presentation === 'transverse') { result.questions.push('胎位需要何时再次确认？如果临产时仍为横位，如何安排分娩及应急处理？'); result.refs.push('inductionCN'); }
    if (data.placenta === 'low') { result.questions.push('胎盘与宫颈内口的位置关系是什么，何时复查？出现出血时应怎样就诊？'); result.refs.push('niceCS'); }
    if (['covering','accreta'].includes(data.placenta)) { result.questions.push('超声诊断和出血风险是什么？是否需要更高层级机构、输血准备或多学科团队？'); result.refs.push('inductionCN'); }
    if (data.history === 'cs') { result.questions.push('请核对上次子宫切口、手术原因与恢复记录：是否适合 TOLAC？本院能否及时急诊手术，如何监护？'); result.refs.push('vbac'); }
    if (['surgery','rupture'].includes(data.history)) { result.questions.push('原手术是否涉及子宫肌层／宫腔？原记录对试产、分娩时机和医院选择有什么影响？'); result.refs.push('inductionCN'); }
    if (data.conditions !== 'none' && data.conditions !== 'unknown') { result.questions.push('合并症目前的严重程度和控制情况是什么？是否改变分娩时机、镇痛或监护？需要哪些专科共同评估？'); result.refs.push('inductionCN'); }
    if (data.advice === 'cs') result.questions.push('医生目前建议剖宫产的具体指征是什么？时机、麻醉、替代方案及提前临产时的安排是什么？');
    else if (data.advice === 'vaginal') result.questions.push('医生讨论阴道分娩的依据是什么？还要复核哪些条件，产程中哪些变化会需要调整方案？');
    else result.questions.push('依据当前全部检查，有哪些分娩方案可讨论，各自对我和宝宝有哪些主要利弊？');
    if (data.preference === 'pain') result.questions.push('能否提前做麻醉评估？镇痛何时可用、等待怎样处理，恐惧或既往创伤可以获得哪些支持？');
    else if (data.preference === 'cs') result.questions.push('我倾向计划剖宫产，能否充分讨论理由、手术风险、未来生育影响和其他减轻恐惧的方法？');
    else result.questions.push('我的分娩偏好、疼痛顾虑和希望的陪伴怎样写进可调整的意愿单？');
    result.questions.push('所选院区夜间产科、麻醉、手术、输血及新生儿复苏怎样保障？出现超出接诊能力的情况怎样转诊？');
    result.questions.push(data.service === 'special' ? '特需费用中包含什么，哪些不能保证？指定医生、满床、转急诊及宝宝费用怎样处理，保险如何确认？' : '普通产科能提供哪些镇痛、陪产与房型？如果升级服务，差价与报销范围是什么？');
    result.refs.push('nhcPain','nhsaPrice');
    result.refs = [...new Set(result.refs)];
    return result;
  }
  const api = {choices, labels, normalized, build};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BIRTH_CHECKLIST = api;
})(typeof window === 'undefined' ? globalThis : window);
