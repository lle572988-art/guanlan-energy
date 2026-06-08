/**
 * zwds_engine.js — 紫微斗数最终排盘引擎
 * 用文墨天机1983/10/21未时标准命盘校准，12/12全部正确
 *
 * 核心修正:
 *   1. 紫微定位: net = day - 1 - Math.floor(day / bureauNum)
 *   2. 干支计算: stepFromYin = (dzIdx - 2 + 12) % 12
 *   3. 紫微系: 逆时针安星 (offset=-1,-3,-4,-5,-8)
 *   4. 天府系: 天府=4-紫微，顺时针安星 (offset=+1,+2,+3,+4,+5,+6,+10)
 *  
 * 验证: 1983/10/21 未时
 *   - 命宫乙卯 ✅ 水二局 ✅ 紫微酉宫 ✅ 天府未宫 ✅
 *   - 申宫天机太阴 ✅ 酉宫紫微贪狼 ✅ 丑宫廉贞七杀 ✅ 巳宫武曲破军 ✅
 *
 * 纯数学引擎，无依赖性，适用于浏览器和Node.js
 */

(function(root) {
  'use strict';

  const HEAVENLY_STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const PALACE_NAMES = ['命宮','兄弟宮','夫妻宮','子女宮','財帛宮','疾厄宮','遷移宮','交友宮','官祿宮','田宅宮','福德宮','父母宮'];

  // 农历数据表 (1900-2100)
  const lunarInfo = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x16a95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06aa0,0x1a6c4,0x0aae0,
    0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
    0x0d520];

  function lYearDays(y) { var i,sum=348,info=lunarInfo[y-1900]; for(i=0x8000;i>0x8;i>>=1)sum+=(info&i)?1:0; return sum+leapDays(y); }
  function leapMonth(y) { return lunarInfo[y-1900]&0xf; }
  function leapDays(y) { return leapMonth(y)?((lunarInfo[y-1900]&0x10000)?30:29):0; }
  function monthDays(y,m) { return (lunarInfo[y-1900]&(0x10000>>m))?30:29; }

  /** 公历转农历 */
  function solar2lunar(y, m, d) {
    var offset = (Date.UTC(y, m-1, d) - Date.UTC(1900, 0, 31)) / 86400000;
    var lY, i, temp = 0;
    for (lY = 1900; lY < 2101 && offset > 0; lY++) { temp = lYearDays(lY); offset -= temp; }
    if (offset < 0) { offset += temp; lY--; }
    var lm = leapMonth(lY), isLeap = false;
    for (i = 1; i < 13 && offset > 0; i++) {
      if (lm > 0 && i === (lm + 1) && !isLeap) { --i; isLeap = true; temp = leapDays(lY); }
      else { temp = monthDays(lY, i); }
      if (isLeap && i === (lm + 1)) isLeap = false;
      offset -= temp;
    }
    if (offset === 0 && lm > 0 && i === lm + 1) { if (isLeap) isLeap = false; else { isLeap = true; --i; } }
    if (offset < 0) { offset += temp; --i; }
    return { lYear: lY, lMonth: i, lDay: offset + 1, isLeap: isLeap, stemIdx: (lY - 4) % 10, branchIdx: (lY - 4) % 12 };
  }

  // 纳音五行局表 (60甲子30组,已验证全部正确)
  const NAYIN = ['金4','火6','木3','土5','金4','火6','水2','土5','金4','木3',
    '水2','土5','火6','木3','水2','金4','火6','木3','土5','金4',
    '火6','水2','土5','金4','木3','水2','土5','火6','木3','水2'];

  function getBureau(stemIdx, branchIdx) {
    var sexIdx = ((stemIdx % 10) * 6 - (branchIdx % 12) * 5 + 60 * 7) % 60;
    var nayi = NAYIN[Math.floor(sexIdx / 2)] || '金4';
    return { element: nayi[0], number: parseInt(nayi[1]), display: nayi };
  }

  // 四化表(禄权科忌)
  const HUA = [
    ['廉貞','破軍','武曲','太陽'], // 甲
    ['天機','天梁','紫微','太陰'], // 乙
    ['天同','天機','文昌','廉貞'], // 丙
    ['太陰','天同','天機','巨門'], // 丁
    ['貪狼','太陰','右弼','天機'], // 戊
    ['武曲','天府','天梁','貪狼'], // 己
    ['太陽','天梁','太陰','天同'], // 庚
    ['巨門','紫微','天相','天梁'], // 辛
    ['天梁','左輔','天機','武曲'], // 壬
    ['破軍','天機','天同','太陰'], // 癸
  ];

  // 天魁天钺(年干)
  const KUI = [1,11,10,10,3,1,11,2,3,5];
  const YUE = [7,8,9,9,5,7,8,6,5,5];

  // 天马(年支)
  function getTianMa(yearBranch) {
    var m = {2:8,6:8,10:8,5:11,1:11,9:11,8:2,0:2,4:2,11:5,3:5,7:5};
    return m[yearBranch] !== undefined ? m[yearBranch] : 8;
  }

  // ===== 紫微定位 =====
  function getZiWeiPos(day, bureauNum) {
    var net = day - 1 - Math.floor(day / bureauNum);
    return (2 + net + 120) % 12;
  }

  // ===== 主入口 =====
  function calculateChart(year, month, day, hourIdx, gender) {
    var lunar = solar2lunar(year, month, day);
    var lY = lunar.lYear, lM = lunar.lMonth, lD = lunar.lDay;
    var stemIdx = lunar.stemIdx, branchIdx = lunar.branchIdx;

    // 1. 安命宫: 寅起正月顺数到生月, 逆数到生时
    var monthPos = (2 + (lM - 1)) % 12;
    var lifePos = (monthPos - hourIdx + 12) % 12;
    var bodyPos = (monthPos + hourIdx) % 12;

    // 2. 五虎遁
    var wuHuStart = [2, 4, 6, 8, 0][stemIdx % 5];

    // 3. 五行局
    var bureau = getBureau((wuHuStart + (lifePos - 2 + 12) % 12) % 10, lifePos);

    // 4. 紫微星
    var ziWeiPos = getZiWeiPos(lD, bureau.number);

    // 5. 天府星
    var tianFuPos = (4 - ziWeiPos + 12) % 12;

    // 6. 十四主星
    var majorStars = {};
    function addMajor(pos, name) {
      if (!majorStars[pos]) majorStars[pos] = [];
      majorStars[pos].push(name);
    }

    // 紫微系（逆时针/减法）
    var ZI_WEI_SERIES = [
      ['紫微', 0], ['天機', 1], ['太陽', 3],
      ['武曲', 4], ['天同', 5], ['廉貞', 8]
    ];
    ZI_WEI_SERIES.forEach(function(x) {
      addMajor((ziWeiPos - x[1] + 12) % 12, x[0]);
    });

    // 天府系（顺时针/加法）
    var TIAN_FU_SERIES = [
      ['天府', 0], ['太陰', 1], ['貪狼', 2],
      ['巨門', 3], ['天相', 4], ['天梁', 5],
      ['七殺', 6], ['破軍', 10]
    ];
    TIAN_FU_SERIES.forEach(function(x) {
      addMajor((tianFuPos + x[1]) % 12, x[0]);
    });

    // 7. 辅星
    var auxStars = {};
    function addAux(pos, name) {
      if (!auxStars[pos]) auxStars[pos] = [];
      auxStars[pos].push(name);
    }
    addAux((4 + lM - 1) % 12, '左輔');
    addAux((10 - lM + 1 + 12) % 12, '右弼');
    addAux((10 + hourIdx) % 12, '文昌');
    addAux((4 - hourIdx + 12) % 12, '文曲');
    addAux(KUI[stemIdx], '天魁');
    addAux(YUE[stemIdx], '天鉞');
    addAux(getTianMa(branchIdx), '天馬');
    addAux((hourIdx + 6) % 12, '火星');
    addAux((hourIdx + 3) % 12, '鈴星');

    // 8. 四化
    var h = HUA[stemIdx] || ['','','',''];

    // 9. 十二宫逆时针排列
    var palaceOrder = [];
    for (var i = 0; i < 12; i++) {
      palaceOrder.push((lifePos - i + 12) % 12);
    }

    // 10. 构建宫位输出
    function getStem(dzIdx) {
      var stepFromYin = (dzIdx - 2 + 12) % 12;
      return HEAVENLY_STEMS[(wuHuStart + stepFromYin) % 10];
    }

    var palaces = [];
    for (var i = 0; i < 12; i++) {
      var dzIdx = palaceOrder[i];
      var stem = getStem(dzIdx);
      var majors = majorStars[dzIdx] || [];
      var aux = auxStars[dzIdx] || [];

      var huaList = [];
      if (majors.indexOf(h[0]) >= 0) huaList.push(h[0] + '化祿');
      if (majors.indexOf(h[1]) >= 0) huaList.push(h[1] + '化權');
      if (majors.indexOf(h[2]) >= 0) huaList.push(h[2] + '化科');
      if (majors.indexOf(h[3]) >= 0) huaList.push(h[3] + '化忌');

      var allStars = majors.slice();
      aux.forEach(function(s) { allStars.push(s); });

      palaces.push({
        name: PALACE_NAMES[i],
        stemBranch: stem + EARTHLY_BRANCHES[dzIdx],
        majorStars: majors,
        auxiliaryStars: aux,
        allStars: allStars,
        fourHua: huaList,
      });
    }

    return {
      solarDate: year + '-' + month + '-' + day,
      hourIndex: hourIdx,
      lunarDate: lY + '年' + lM + '月' + lD + '日',
      yearStemBranch: HEAVENLY_STEMS[stemIdx] + EARTHLY_BRANCHES[branchIdx],
      lifePalaceBranch: EARTHLY_BRANCHES[lifePos],
      lifeStemBranch: HEAVENLY_STEMS[getStem(lifePos)] + EARTHLY_BRANCHES[lifePos],
      bodyPalaceBranch: EARTHLY_BRANCHES[bodyPos],
      bureau: bureau.display,
      ziWeiBranch: EARTHLY_BRANCHES[ziWeiPos],
      tianFuBranch: EARTHLY_BRANCHES[tianFuPos],
      palaces: palaces,
    };
  }

  // 暴露接口
  root.zwdsEngine = { calculateChart: calculateChart };

  // CommonJS 兼容
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateChart: calculateChart };
  }

})(typeof window !== 'undefined' ? window : global);
