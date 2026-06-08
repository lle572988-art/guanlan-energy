/**
 * zwds-core.js — 紫微斗数排盘核心引擎 v8
 * 
 * 基于用户提供的5组真数据验证通过的【绝对数学不变式】
 * 
 * 核心公式：
 *   紫微定位: Q = ceil(D/B), X = Q*B-D, 补数奇偶决定顺逆
 *   天府定位: tianFuIdx = (4 - ziWeiIdx + 12) % 12
 *   十二宫: 命宫起逆时针排列
 *   五虎遁: 年干→寅宫定干
 *
 * 农历转换依赖: lunar-javascript (https://github.com/6tail/lunar-javascript)
 *
 * 统一地支坐标系: 0=子, 1=丑, 2=寅, 3=卯, 4=辰, 5=巳, 6=午, 7=未, 8=申, 9=酉, 10=戌, 11=亥
 */

(function(root) {
"use strict";

// Lunar 由外部 <script src="/lunar.js"> 提供，通过 root.Lunar 访问
// 浏览器端:Lunar挂在window上, Node端:需require

// ─── 基础常量 ───
const HEAVENLY_STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

const PALACE_NAMES = ['命宮','兄弟宮','夫妻宮','子女宮','財帛宮','疾厄宮','遷移宮','交友宮','官祿宮','田宅宮','福德宮','父母宮'];

// 十干四化表
const HUA_TABLE = {
  '甲': {huaLu: '廉貞', huaQuan: '破軍', huaKe: '武曲', huaJi: '太陽'},
  '乙': {huaLu: '天機', huaQuan: '天梁', huaKe: '紫微', huaJi: '太陰'},
  '丙': {huaLu: '天同', huaQuan: '天機', huaKe: '文昌', huaJi: '廉貞'},
  '丁': {huaLu: '太陰', huaQuan: '天同', huaKe: '天機', huaJi: '巨門'},
  '戊': {huaLu: '貪狼', huaQuan: '太陰', huaKe: '右弼', huaJi: '天機'},
  '己': {huaLu: '武曲', huaQuan: '貪狼', huaKe: '天梁', huaJi: '文曲'},
  '庚': {huaLu: '太陽', huaQuan: '武曲', huaKe: '太陰', huaJi: '天同'},
  '辛': {huaLu: '巨門', huaQuan: '太陽', huaKe: '文曲', huaJi: '文昌'},
  '壬': {huaLu: '天梁', huaQuan: '紫微', huaKe: '左輔', huaJi: '武曲'},
  '癸': {huaLu: '破軍', huaQuan: '巨門', huaKe: '太陰', huaJi: '貪狼'}
};

// 纳音五行局
const NAYIN = {
  '甲子':'金4','乙丑':'金4','丙寅':'火6','丁卯':'火6','戊辰':'木3','己巳':'木3',
  '庚午':'土5','辛未':'土5','壬申':'金4','癸酉':'金4','甲戌':'火6','乙亥':'火6',
  '丙子':'水2','丁丑':'水2','戊寅':'土5','己卯':'土5','庚辰':'金4','辛巳':'金4',
  '壬午':'木3','癸未':'木3','甲申':'水2','乙酉':'水2','丙戌':'土5','丁亥':'土5',
  '戊子':'火6','己丑':'火6','庚寅':'木3','辛卯':'木3','壬辰':'水2','癸巳':'水2',
  '甲午':'金4','乙未':'金4','丙申':'火6','丁酉':'火6','戊戌':'木3','己亥':'木3',
  '庚子':'土5','辛丑':'土5','壬寅':'金4','癸卯':'金4','甲辰':'火6','乙巳':'火6',
  '丙午':'水2','丁未':'水2','戊申':'土5','己酉':'土5','庚戌':'金4','辛亥':'金4',
  '壬子':'木3','癸丑':'木3','甲寅':'水2','乙卯':'水2','丙辰':'土5','丁巳':'土5',
  '戊午':'火6','己未':'火6','庚申':'木3','辛酉':'木3','壬戌':'水2','癸亥':'水2'
};

// ─── 农历转换（依赖 lunar-javascript） ───
function solarToLunar(year, month, day) {
  var S = (typeof window !== "undefined" ? window.Solar : root.Solar);
  if (!S || !S.fromYmd) {
    console.error("lunar-javascript not loaded");
    return null;
  }
  var solar = S.fromYmd(year, month, day);
  var lunar = solar.getLunar();
  
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    leap: lunar.getMonthInChinese && lunar.getMonthInChinese().indexOf('闰') >= 0,
    yearStemBranch: lunar.getYearInGanZhi(),
    monthStemBranch: lunar.getMonthInGanZhi()
  };
}

// 获取年干支（直接计算，不用库）
function getYearGanZhi(year) {
  var gan = (year - 4) % 10;
  var zhi = (year - 4) % 12;
  if (gan < 0) gan += 10;
  if (zhi < 0) zhi += 12;
  return HEAVENLY_STEMS[gan] + EARTHLY_BRANCHES[zhi];
}

// ─── 核心公式：紫微定位 ───
function getZiWeiIdx(B, D) {
  var Q = Math.ceil(D / B);
  var X = Q * B - D;
  var baseIdx = 2; // 寅宫
  var targetIdx = baseIdx + Q - 1;
  if (X % 2 === 0) {
    targetIdx += X;
  } else {
    targetIdx -= X;
  }
  return (targetIdx + 12) % 12;
}

// ─── 核心公式：天府定位 ───
function getTianFuIdx(ziWeiIdx) {
  return (4 - ziWeiIdx + 12) % 12;
}

// ─── 十四主星偏移 ───
const ZI_WEI_OFFSETS = {
  '紫微': 0, '天機': -1, '太陽': -3,
  '武曲': -4, '天同': -5, '廉貞': -8
};

const TIAN_FU_OFFSETS = {
  '天府': 0, '太陰': 1, '貪狼': 2, '巨門': 3,
  '天相': 4, '天梁': 5, '七殺': 6, '破軍': 10
};

// ─── 辅星 ───
function getAuxiliaryStars(palaceIdx, yearStem, yearBranch, lunarMonth, hourIndex) {
  var aux = [];
  var sMonth = lunarMonth;
  var sHour = hourIndex;

  // 左辅: 辰上顺数至月
  if ((4 + (sMonth - 1)) % 12 === palaceIdx) aux.push('左輔');
  // 右弼: 戌上逆数至月
  if ((10 - (sMonth - 1) + 12) % 12 === palaceIdx) aux.push('右弼');
  // 文昌: 戌上顺数至时
  if ((10 + sHour) % 12 === palaceIdx) aux.push('文昌');
  // 文曲: 辰上逆数至时
  if ((4 - sHour + 12) % 12 === palaceIdx) aux.push('文曲');
  
  // 天魁
  var tianKuiMap = {'甲':2,'乙':11,'丙':5,'丁':5,'戊':2,'己':11,'庚':8,'辛':8,'壬':3,'癸':3};
  if (tianKuiMap[yearStem] === palaceIdx) aux.push('天魁');
  // 天钺
  var tianYueMap = {'甲':7,'乙':8,'丙':9,'丁':9,'戊':7,'己':8,'庚':6,'辛':6,'壬':3,'癸':3};
  if (tianYueMap[yearStem] === palaceIdx) aux.push('天鉞');
  
  // 火星（简化版）
  var huoMap = {'寅':8,'午':4,'戌':0,'子':6};
  var huoStart = huoMap[EARTHLY_BRANCHES[EARTHLY_BRANCHES.indexOf(yearBranch)]];
  if (huoStart !== undefined) {
    if ((huoStart + sHour) % 12 === palaceIdx) aux.push('火星');
  } else {
    var huoBase = [4,8,0][Math.floor(EARTHLY_BRANCHES.indexOf(yearBranch) / 4)];
    if ((huoBase + sHour) % 12 === palaceIdx) aux.push('火星');
  }
  
  // 铃星
  var lingMap = {'寅':2,'午':10,'戌':4,'子':8};
  var lingStart = lingMap[EARTHLY_BRANCHES[EARTHLY_BRANCHES.indexOf(yearBranch)]];
  if (lingStart !== undefined) {
    if ((lingStart + sHour) % 12 === palaceIdx) aux.push('鈴星');
  } else {
    var lingBase = [10,2,4][Math.floor(EARTHLY_BRANCHES.indexOf(yearBranch) / 4)];
    if ((lingBase + sHour) % 12 === palaceIdx) aux.push('鈴星');
  }
  
  // 天马
  var tianMaMap = {'寅':8,'申':2,'巳':11,'亥':5};
  if (tianMaMap[EARTHLY_BRANCHES[EARTHLY_BRANCHES.indexOf(yearBranch)]] !== undefined) {
    if (tianMaMap[EARTHLY_BRANCHES[EARTHLY_BRANCHES.indexOf(yearBranch)]] === palaceIdx) aux.push('天馬');
  }

  return aux;
}

// ─── 四化 ───
function getFourHua(yearStem, majorStars) {
  var hua = [];
  var table = HUA_TABLE[yearStem];
  if (!table) return hua;
  
  [
    {star: table.huaLu, type: '化禄'},
    {star: table.huaQuan, type: '化权'},
    {star: table.huaKe, type: '化科'},
    {star: table.huaJi, type: '化忌'}
  ].forEach(function(item) {
    if (majorStars.indexOf(item.star) >= 0) {
      hua.push(item.star + item.type);
    }
  });
  
  return hua;
}

// ─── 主计算入口 ───
function calculateChart(solarYear, solarMonth, solarDay, hourIndex, gender) {
  // 1. 公历→农历
  var lunar = solarToLunar(solarYear, solarMonth, solarDay);
  if (!lunar) return null;

  var lunarYear = lunar.year;
  var lunarMonth = lunar.month;
  var lunarDay = lunar.day;
  var yearStemBranch = lunar.yearStemBranch;
  var yearStem = yearStemBranch[0];
  var yearBranch = yearStemBranch[1];

  // 2. 命宫: 正月(寅)起, 顺数到生月, 逆数到生时
  var lifePalaceIdx = ((2 + (lunarMonth - 1)) - hourIndex + 12) % 12;

  // 3. 身宫: 正月起寅, 顺数到生月, 顺数到生时
  var bodyPalaceIdx = (2 + (lunarMonth - 1) + hourIndex) % 12;

  // 4. 十二宫天干: 五虎遁 (甲己→丙寅 …)
  var yearGanIdx = HEAVENLY_STEMS.indexOf(yearStem);
  var wuHuStart = [2, 4, 6, 8, 0][yearGanIdx % 5];

  // 5. 纳音五行局 — 以命宫干支定局 (非年柱)
  var lifeStemIdx = (wuHuStart + (lifePalaceIdx - 2 + 12) % 12) % 10;
  var lifeStemBranchForBureau = HEAVENLY_STEMS[lifeStemIdx] + EARTHLY_BRANCHES[lifePalaceIdx];
  var nayin = NAYIN[lifeStemBranchForBureau];
  if (!nayin) {
    console.error("No nayin for life palace " + lifeStemBranchForBureau);
    return null;
  }
  var bureauNum = parseInt(nayin[1], 10);
  var bureauName = nayin[0] + bureauNum + '局';
  
  // 6. 紫微定位
  var ziWeiIdx = getZiWeiIdx(bureauNum, lunarDay);

  // 7. 天府定位
  var tianFuIdx = getTianFuIdx(ziWeiIdx);

  // 8. 十四主星
  var starMap = {};
  
  // 紫微系（逆行）
  Object.keys(ZI_WEI_OFFSETS).forEach(function(star) {
    var idx = (ziWeiIdx + ZI_WEI_OFFSETS[star] + 12) % 12;
    if (!starMap[idx]) starMap[idx] = [];
    starMap[idx].push(star);
  });

  // 天府系（顺行）
  Object.keys(TIAN_FU_OFFSETS).forEach(function(star) {
    var idx = (tianFuIdx + TIAN_FU_OFFSETS[star]) % 12;
    if (!starMap[idx]) starMap[idx] = [];
    starMap[idx].push(star);
  });

  // 9. 构建十二宫（【雷打不动的逆时针序列】）
  var palaces = [];
  var palaceStems = [];
  
  for (var i = 0; i < 12; i++) {
    var dz = (lifePalaceIdx - i + 12) % 12; // 逆时针
    
    // 宫干
    var stemIdx = (wuHuStart + (dz - 2 + 12) % 12) % 10;
    palaceStems[dz] = HEAVENLY_STEMS[stemIdx] + EARTHLY_BRANCHES[dz];
    
    var majorStars = starMap[dz] || [];
    // 去重
    majorStars = majorStars.filter(function(s, idx) { return majorStars.indexOf(s) === idx; });
    
    var aux = getAuxiliaryStars(dz, yearStem, yearBranch, lunarMonth, hourIndex);
    var hua = getFourHua(yearStem, majorStars);
    var branchChar = EARTHLY_BRANCHES[dz];
    var bigCycleStart = bureauNum + i * 10;

    palaces.push({
      name: PALACE_NAMES[i],
      palaceName: PALACE_NAMES[i],
      branch: branchChar,
      stemBranch: palaceStems[dz],
      majorStars: majorStars,
      mainStars: majorStars,
      auxiliaryStars: aux,
      fourHua: hua,
      luckyTransform: hua.join(' · '),
      bigCycle: bigCycleStart + '–' + (bigCycleStart + 9),
      allStars: majorStars.concat(aux)
    });
  }

  // 10. 返回值
  return {
    solarDate: solarYear + '-' + solarMonth + '-' + solarDay,
    lunarDate: lunarYear + '年' + lunarMonth + '月' + lunarDay + '日',
    yearStemBranch: yearStemBranch,
    lifeStemBranch: palaceStems[lifePalaceIdx],
    lifePalaceIdx: lifePalaceIdx,
    bodyStemBranch: palaceStems[bodyPalaceIdx],
    bodyPalaceIdx: bodyPalaceIdx,
    ziWeiBranch: EARTHLY_BRANCHES[ziWeiIdx],
    tianFuBranch: EARTHLY_BRANCHES[tianFuIdx],
    bureau: bureauName,
    lunarMonth: lunarMonth,
    lunarDay: lunarDay,
    palaceStems: palaceStems,
    palaces: palaces
  };
}

// ─── 标准化 chartData JSON（供 SVG / API 消费） ───
function buildChartData(result) {
  if (!result || !result.palaces) return { palaces: [] };
  return {
    solarDate: result.solarDate,
    lunarDate: result.lunarDate,
    bureau: result.bureau,
    yearStemBranch: result.yearStemBranch,
    lifeStemBranch: result.lifeStemBranch,
    palaces: result.palaces.map(function(p) {
      var branch = p.branch || (p.stemBranch ? p.stemBranch.slice(-1) : '');
      var mainStars = p.mainStars || p.majorStars || [];
      var hua = p.fourHua || [];
      return {
        palaceName: p.palaceName || p.name,
        branch: branch,
        mainStars: mainStars,
        luckyTransform: p.luckyTransform || hua.join(' · '),
        bigCycle: p.bigCycle || ''
      };
    })
  };
}

// ─── 对外暴露 ───
root.zwdsCore = {
  calculateChart: calculateChart,
  buildChartData: buildChartData,
  getZiWeiIdx: getZiWeiIdx,
  getTianFuIdx: getTianFuIdx,
  HEAVENLY_STEMS: HEAVENLY_STEMS,
  EARTHLY_BRANCHES: EARTHLY_BRANCHES,
  PALACE_NAMES: PALACE_NAMES,
  NAYIN: NAYIN,
  HUA_TABLE: HUA_TABLE
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = root.zwdsCore;
}

})(typeof window !== 'undefined' ? window : global);
