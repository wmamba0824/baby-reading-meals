(() => {
  'use strict';
  const g = window.POSTPARTUM_GUIDE;
  Object.assign(g.sources, {
  "skinWound": {
    "name": "NHS：剖宫产后恢复",
    "url": "https://www.nhs.uk/tests-and-treatments/caesarean-section/recovery/",
    "date": "核查 2026-11-08；发布日期以原文为准",
    "scope": "切口清洁与感染警示，英国住院安排不作为国内标准。"
  },
  "skinScars": {
    "name": "NHS：瘢痕护理",
    "url": "https://www.nhs.uk/conditions/scars/",
    "date": "核查 2026-11-08；发布日期以原文为准",
    "scope": "瘢痕成熟、防晒、完全愈合后的按摩及求助。"
  },
  "skinSilicone": {
    "name": "Leeds Teaching Hospitals：硅酮贴使用说明",
    "url": "https://www.leedsth.nhs.uk/patients/resources/silicone-gel-sheet/",
    "date": "核查 2026-11-08；发布日期以原文为准",
    "scope": "只用于完全愈合的皮肤，具体使用方法遵医嘱与产品说明。"
  },
  "skinEvidence": {
    "name": "Cochrane：硅酮贴治疗增生性瘢痕",
    "url": "https://www.cochrane.org/evidence/CD013357_silicone-gel-sheeting-treating-hypertrophic-scars",
    "date": "核查 2026-11-08；发布日期以原文为准",
    "scope": "2021 年综述，检索截至 2021-04-21。已有增生性瘢痕治疗证据低或极低确定性，不能保证预防或消除剖宫产瘢痕。"
  },
  "skinStretch": {
    "name": "美国皮肤病学会：妊娠纹及治疗",
    "url": "https://www.aad.org/public/cosmetic/scars-stretch-marks/stretch-marks-why-appear",
    "date": "核查 2026-11-08；发布日期以原文为准",
    "scope": "新旧妊娠纹、治疗局限及孕期和哺乳期注意。"
  },
  "skinTreat": {
    "name": "美国皮肤病学会：瘢痕诊断与治疗",
    "url": "https://www.aad.org/public/diseases/a-z/scars-treatment",
    "date": "核查 2026-11-08；发布日期以原文为准",
    "scope": "增生性瘢痕与瘢痕疙瘩需专科个体评估，非家庭自行治疗方案。"
  }
});
  g.skin = {
  "reviewed": "2026-11-08",
  "intro": "剖宫产瘢痕和妊娠纹是不同问题，护理方法不能互相套用。先保障伤口恢复，再按本人意愿考虑外观改善。宝宝出生日期不能判断切口是否愈合，不会到某一天就自动建议开始治疗。",
  "warning": [
    "切口红肿热痛加重、流脓或异味、裂开、新鲜出血，或伴发热、明显不适：及时联系分娩医院／产科，不继续按摩或贴祛疤贴。",
    "严重疼痛、明显大量出血、呼吸困难或胸痛等情况立即就医，危急时拨打 120。"
  ],
  "warningRefs": [
    "skinWound"
  ],
  "sections": [
    {
      "title": "剖宫产瘢痕 · 按伤口状态护理",
      "items": [
        {
          "id": "skin-open",
          "audience": "mother",
          "kind": "护理参考",
          "title": "还未完全闭合：先按出院方案护理",
          "text": [
            "按医院要求处理敷料、清洁并轻轻擦干，穿宽松衣物减少摩擦。不要自行撕痂、处理缝线，或在破损处试用祛疤产品。",
            "有渗液、裂开、结痂未脱或不确定是否愈合时，先让医护查看；不要仅凭“满月”或“42天”开始硅酮贴、按摩或美容治疗。"
          ],
          "refs": [
            "skinWound",
            "skinSilicone"
          ]
        },
        {
          "id": "skin-silicone",
          "audience": "mother",
          "kind": "护理参考",
          "title": "完全愈合后：咨询硅酮凝胶或贴",
          "text": [
            "医护确认皮肤完整、干燥、无开放伤口后，可讨论医用硅酮凝胶或贴。遵说明和医嘱使用及清洁，出现皮疹、浸渍或破皮先停用并咨询。",
            "这类产品常用于瘢痕护理，但 Cochrane 对已有增生性瘢痕的研究结论为低或极低确定性，不能保证祛疤，也不是对子宫切口恢复的治疗。无需叠加多款产品。"
          ],
          "refs": [
            "skinSilicone",
            "skinEvidence"
          ]
        },
        {
          "id": "skin-care",
          "audience": "mother",
          "kind": "护理参考",
          "title": "日常护理：保湿、遮挡与耐心",
          "text": [
            "完全愈合后可用温和保湿产品缓解干燥，暴露部位注意衣物遮挡与防晒。瘢痕变淡需要时间，不以外观判断内部手术恢复。",
            "按摩仅在完全愈合并获医护同意后轻柔进行，疼痛或破皮时停止。不能保证消除瘢痕，也不能据此宣称可揉开腹腔粘连。"
          ],
          "refs": [
            "skinScars"
          ]
        },
        {
          "id": "skin-raised",
          "audience": "mother",
          "kind": "护理参考",
          "title": "持续增厚、痛痒或超出切口：看专科",
          "text": [
            "明显隆起、持续长大、痛痒影响生活时，可挂皮肤科或整形外科，评估增生性瘢痕或瘢痕疙瘩。带上手术时间、愈合经过、既往瘢痕史及使用过的产品。",
            "医生可能讨论局部注射、激光等联合方案。适用性、复发风险和次数须评估，不自行注射，也不把切除或激光视为一次根治。"
          ],
          "refs": [
            "skinTreat"
          ]
        }
      ]
    },
    {
      "title": "妊娠纹 · 改善外观，不承诺消除",
      "items": [
        {
          "id": "skin-stretch",
          "audience": "mother",
          "kind": "护理参考",
          "title": "先分清新纹与成熟纹",
          "text": [
            "新出现的红紫色纹路与较久的浅白色纹路，对治疗反应可能不同。妊娠纹会随时间淡化，但通常不能完全消除；是否治疗由本人决定。",
            "保湿可用于舒适护理，但可可脂、橄榄油、维生素 E 等不能被宣传为可靠的去纹方案。不要为“保证无纹”买单。"
          ],
          "refs": [
            "skinStretch"
          ]
        },
        {
          "id": "skin-retinoid",
          "audience": "mother",
          "kind": "护理参考",
          "title": "孕期、备孕或哺乳期：先核对成分",
          "text": [
            "透明质酸或处方维 A 酸对部分早期妊娠纹可能有有限改善，不代表对成熟白纹同样有效。",
            "怀孕期间不使用维 A 酸类祛纹药。备孕或哺乳时，把具体成分和涂抹位置交给医生核对，不自行开用维 A 酸／视黄醇类产品，不让宝宝接触涂药皮肤。这里不提供自行用药浓度和疗程。"
          ],
          "refs": [
            "skinStretch"
          ]
        },
        {
          "id": "skin-procedure",
          "audience": "mother",
          "kind": "护理参考",
          "title": "考虑激光等治疗前，先做皮肤科评估",
          "text": [
            "激光、射频等可能改善外观，但不保证消除。先评估肤色、纹路阶段及色素改变风险，问清预期改善、恢复期、费用与治疗次数。",
            "主动告知医生是否哺乳、有未愈合切口或皮肤问题。不要在家对切口或妊娠纹做微针、强酸焕肤等破皮操作。"
          ],
          "refs": [
            "skinStretch",
            "skinTreat"
          ]
        }
      ]
    }
  ]
};
})();
