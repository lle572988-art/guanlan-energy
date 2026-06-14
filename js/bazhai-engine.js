/**
 * Ba Zhai (八宅) / Ming Gua engine — pure JS, no API.
 * Eight Mansions personal direction mapping for Living Compass.
 */
(function (root) {
  'use strict';

  var DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  var KUA_META = {
    1: { cn: '坎', trigram: 'Kan', element: 'water', archetype: 'The Listener', group: 'east' },
    2: { cn: '坤', trigram: 'Kun', element: 'earth', archetype: 'The Nurturer', group: 'west' },
    3: { cn: '震', trigram: 'Zhen', element: 'wood', archetype: 'The Initiator', group: 'east' },
    4: { cn: '巽', trigram: 'Xun', element: 'wood', archetype: 'The Connector', group: 'east' },
    6: { cn: '乾', trigram: 'Qian', element: 'metal', archetype: 'The Strategist', group: 'west' },
    7: { cn: '兑', trigram: 'Dui', element: 'metal', archetype: 'The Communicator', group: 'west' },
    8: { cn: '艮', trigram: 'Gen', element: 'earth', archetype: 'The Guardian', group: 'west' },
    9: { cn: '离', trigram: 'Li', element: 'fire', archetype: 'The Illuminator', group: 'east' },
  };

  /** Eight positions per Kua — shengqi, tianyi, yannian, fuwei + four inauspicious */
  var KUA_DIRECTIONS = {
    1: { shengqi: 'SE', tianyi: 'E', yannian: 'S', fuwei: 'N', huohai: 'W', wugui: 'NE', liusha: 'NW', jueming: 'SW' },
    2: { shengqi: 'NE', tianyi: 'W', yannian: 'NW', fuwei: 'SW', huohai: 'E', wugui: 'SE', liusha: 'S', jueming: 'N' },
    3: { shengqi: 'S', tianyi: 'N', yannian: 'SE', fuwei: 'E', huohai: 'NW', wugui: 'SW', liusha: 'W', jueming: 'NE' },
    4: { shengqi: 'N', tianyi: 'S', yannian: 'E', fuwei: 'SE', huohai: 'SW', wugui: 'NW', liusha: 'NE', jueming: 'W' },
    6: { shengqi: 'W', tianyi: 'NE', yannian: 'SW', fuwei: 'NW', huohai: 'SE', wugui: 'E', liusha: 'N', jueming: 'S' },
    7: { shengqi: 'NW', tianyi: 'SW', yannian: 'NE', fuwei: 'W', huohai: 'N', wugui: 'S', liusha: 'E', jueming: 'SE' },
    8: { shengqi: 'SW', tianyi: 'NW', yannian: 'W', fuwei: 'NE', huohai: 'S', wugui: 'E', liusha: 'SE', jueming: 'N' },
    9: { shengqi: 'E', tianyi: 'SE', yannian: 'N', fuwei: 'S', huohai: 'W', wugui: 'NE', liusha: 'SW', jueming: 'NW' },
  };

  var POSITION_META = {
    shengqi: {
      cn: '生气',
      label: 'Wealth & Vitality',
      short: 'Wealth',
      kind: 'auspicious',
      tip: 'Face this direction when working, negotiating, or activating income.',
    },
    tianyi: {
      cn: '天医',
      label: 'Health & Recovery',
      short: 'Health',
      kind: 'auspicious',
      tip: 'Place your headboard against this wall for rest and recovery.',
    },
    yannian: {
      cn: '延年',
      label: 'Relationships & Harmony',
      short: 'Relationships',
      kind: 'auspicious',
      tip: 'Sit facing this direction in conversations that matter.',
    },
    fuwei: {
      cn: '伏位',
      label: 'Stability & Grounding',
      short: 'Stability',
      kind: 'auspicious',
      tip: 'Your personal center — align daily routines with this bearing.',
    },
    huohai: {
      cn: '祸害',
      label: 'Minor Drain',
      short: 'Caution',
      kind: 'inauspicious',
      tip: 'Avoid long hours facing this direction when tired or stressed.',
    },
    wugui: {
      cn: '五鬼',
      label: 'Disruption',
      short: 'Disruption',
      kind: 'inauspicious',
      tip: 'Do not place your desk or bed facing this direction.',
    },
    liusha: {
      cn: '六煞',
      label: 'Conflict',
      short: 'Conflict',
      kind: 'inauspicious',
      tip: 'Reduce noise and clutter in this sector of your space.',
    },
    jueming: {
      cn: '绝命',
      label: 'Avoid',
      short: 'Avoid',
      kind: 'inauspicious',
      tip: 'Never orient sleep or main work toward this direction.',
    },
  };

  var ELEMENT_COLORS = {
    wood: '#5B8C5A',
    fire: '#C0573B',
    earth: '#C9A24B',
    metal: '#D8D5CC',
    water: '#2E4A5B',
  };

  function reduceDigit(n) {
    n = Math.abs(parseInt(n, 10) || 0);
    while (n > 9) {
      var s = 0;
      while (n > 0) {
        s += n % 10;
        n = Math.floor(n / 10);
      }
      n = s;
    }
    return n;
  }

  function getLunarYear(solarYear, solarMonth, solarDay) {
    if (root.Solar) {
      try {
        var solar = root.Solar.fromYmd(solarYear, solarMonth, solarDay);
        return solar.getLunar().getYear();
      } catch (e) { /* fall through */ }
    }
    return solarYear;
  }

  function calculateKua(lunarYear, gender) {
    var sum = reduceDigit(lunarYear);
    var isMale = gender === 'male' || gender === 'm';
    var kua;

    if (isMale) {
      kua = lunarYear >= 2000 ? 9 - sum : 10 - sum;
      if (kua === 10) kua = 1;
      if (kua === 5) kua = 2;
      if (kua < 1) kua = 9;
    } else {
      kua = lunarYear >= 2000 ? sum + 6 : sum + 5;
      while (kua > 9) kua -= 9;
      if (kua === 0) kua = 9;
      if (kua === 5) kua = 8;
    }
    return kua;
  }

  function buildPositions(map) {
    var positions = [];
    Object.keys(POSITION_META).forEach(function (key) {
      var dir = map[key];
      var meta = POSITION_META[key];
      positions.push({
        key: key,
        cn: meta.cn,
        label: meta.label,
        short: meta.short,
        kind: meta.kind,
        tip: meta.tip,
        direction: dir,
      });
    });
    return positions;
  }

  function buildActions(map) {
    return [
      'Sit facing ' + map.shengqi + ' in meetings and focused work.',
      'Headboard against the ' + map.tianyi + ' wall when sleeping.',
      'Face ' + map.yannian + ' for important conversations.',
    ];
  }

  function calculate(input) {
    var year = parseInt(input.year, 10);
    var month = parseInt(input.month, 10);
    var day = parseInt(input.day, 10);
    var gender = input.gender || 'female';
    var houseFacing = input.houseFacing || '';

    if (!year || !month || !day) return null;

    var lunarYear = getLunarYear(year, month, day);
    var kua = calculateKua(lunarYear, gender);
    var kuaMeta = KUA_META[kua];
    var dirMap = KUA_DIRECTIONS[kua];
    if (!kuaMeta || !dirMap) return null;

    var groupLabel = kuaMeta.group === 'east' ? 'East Group · 东四命' : 'West Group · 西四命';

    return {
      kua: kua,
      cn: kuaMeta.cn,
      trigram: kuaMeta.trigram,
      element: kuaMeta.element,
      elementColor: ELEMENT_COLORS[kuaMeta.element] || '#7A9B8E',
      archetype: kuaMeta.archetype,
      group: kuaMeta.group,
      groupLabel: groupLabel,
      lunarYear: lunarYear,
      solarDate: { year: year, month: month, day: day },
      gender: gender,
      houseFacing: houseFacing,
      directions: dirMap,
      positions: buildPositions(dirMap),
      actions: buildActions(dirMap),
      auspicious: buildPositions(dirMap).filter(function (p) { return p.kind === 'auspicious'; }),
      inauspicious: buildPositions(dirMap).filter(function (p) { return p.kind === 'inauspicious'; }),
    };
  }

  root.BaZhai = {
    calculate: calculate,
    DIRECTIONS: DIRECTIONS,
    KUA_META: KUA_META,
    POSITION_META: POSITION_META,
    ELEMENT_COLORS: ELEMENT_COLORS,
    getLunarYear: getLunarYear,
    calculateKua: calculateKua,
  };
})(typeof window !== 'undefined' ? window : global);
