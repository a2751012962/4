"use strict";
/* ================= 谜案集 · 案件数据 =================
 * 规则：每行每列各站一人；所有证词必须成立；
 * 与被害者单独同处一室的人，就是凶手。
 * solution / murderer 仅供开发期校验（mkVerifyAllCases）使用。
 */
const MURDOKU_CASES=[

/* ---------- 案件一 · 4×4 入门：行 / 列 / 房间 ---------- */
{
  id:'mk1', title:'案件一 · 打烊的餐厅', sizeTag:'4×4',
  brief:'清晨，前台的铃响了很久没人应。海鸥小姐倒在餐厅里，羽毛散了一地。',
  size:4,
  rooms:[
    "AABB",
    "AABB",
    "CABB",
    "CCDD"
  ],
  roomNames:{A:'大堂',B:'餐厅',C:'厨房',D:'储物间'},
  objects:[
    {id:'register',name:'收银机',glyph:'🛎️',r:0,c:0},
    {id:'piano',name:'钢琴',glyph:'🎹',r:3,c:3}
  ],
  blocked:[],
  people:[
    {id:'gull',  name:'海鸥小姐', glyph:'🕊️'},
    {id:'crab',  name:'螃蟹先生', glyph:'🦀'},
    {id:'sailor',name:'水手熊',   glyph:'⚓'},
    {id:'hiker', name:'登山熊',   glyph:'⛰️'}
  ],
  victim:'gull',
  clues:[
    {person:'gull',  type:'row', row:0},
    {person:'gull',  type:'inRoom', room:'B'},
    {person:'crab',  type:'col', col:3},
    {person:'sailor',type:'inRoom', room:'C'},
    {person:'hiker', type:'row', row:3}
  ],
  solution:{gull:[0,2],crab:[1,3],sailor:[2,0],hiker:[3,1]},
  murderer:'crab'
},

/* ---------- 案件二 · 4×4：引入“在家具旁边” ---------- */
{
  id:'mk2', title:'案件二 · 碎掉的花瓶', sizeTag:'4×4',
  brief:'阅览室的花瓶碎了一地。夜班门童没有去交班，摇铃安静地躺在客房门口。',
  size:4,
  rooms:[
    "AABB",
    "AABB",
    "CCDD",
    "CCDD"
  ],
  roomNames:{A:'阅览室',B:'琴房',C:'走廊',D:'客房'},
  objects:[
    {id:'piano',name:'钢琴',glyph:'🎹',r:0,c:3},
    {id:'vase', name:'花瓶',glyph:'🏺',r:1,c:1}
  ],
  blocked:[],
  people:[
    {id:'porter',name:'夜班门童', glyph:'🔔'},
    {id:'keeper',name:'灯塔管理员',glyph:'🏮'},
    {id:'onesie',name:'连体衣熊', glyph:'🧸'},
    {id:'crab',  name:'螃蟹先生', glyph:'🦀'}
  ],
  victim:'porter',
  clues:[
    {person:'onesie',type:'besideObject', object:'vase'},
    {person:'onesie',type:'row', row:0},
    {person:'crab',  type:'besideObject', object:'vase'},
    {person:'keeper',type:'inRoom', room:'D'},
    {person:'keeper',type:'row', row:2},
    {person:'porter',type:'dir', other:'piano', dir:'S'},
    {person:'porter',type:'inRoom', room:'D'}
  ],
  solution:{porter:[3,3],keeper:[2,2],onesie:[0,1],crab:[1,0]},
  murderer:'keeper'
},

/* ---------- 案件三 · 4×4：引入“在家具的正北/正西方” ---------- */
{
  id:'mk3', title:'案件三 · 储物间的灯', sizeTag:'4×4',
  brief:'储物间的台灯亮了一整夜。螃蟹先生的钳子，还夹着半张没写完的字条。',
  size:4,
  rooms:[
    "AABB",
    "CABB",
    "CADD",
    "CCDD"
  ],
  roomNames:{A:'大堂',B:'阳台',C:'走廊',D:'储物间'},
  objects:[
    {id:'clock',name:'落地钟',glyph:'🕰️',r:2,c:1},
    {id:'lamp', name:'台灯',  glyph:'🕯️',r:3,c:3}
  ],
  blocked:[],
  people:[
    {id:'crab',     name:'螃蟹先生', glyph:'🦀'},
    {id:'collector',name:'收藏家',   glyph:'🎩'},
    {id:'sailor',   name:'水手熊',   glyph:'⚓'},
    {id:'onesie',   name:'连体衣熊', glyph:'🧸'}
  ],
  victim:'crab',
  clues:[
    {person:'sailor',   type:'col', col:0},
    {person:'sailor',   type:'inRoom', room:'A'},
    {person:'onesie',   type:'dir', other:'clock', dir:'N'},
    {person:'collector',type:'dir', other:'lamp',  dir:'W'},
    {person:'crab',     type:'dir', other:'lamp',  dir:'N'},
    {person:'crab',     type:'inRoom', room:'D'}
  ],
  solution:{sailor:[0,0],onesie:[1,1],crab:[2,3],collector:[3,2]},
  murderer:'collector'
},

/* ---------- 案件四 · 5×5：引入“同一房间 / 独自一人”与墙 ---------- */
{
  id:'mk4', title:'案件四 · 熄灭的灯塔', sizeTag:'5×5',
  brief:'灯塔管理员没有回去点灯。保管库的门虚掩着，海风从走廊一直灌到大堂。',
  size:5,
  rooms:[
    "AABBB",
    "AABBB",
    "CCCDD",
    "CCCDD",
    "CCCDD"
  ],
  roomNames:{A:'大堂',B:'餐厅',C:'走廊',D:'保管库'},
  objects:[
    {id:'cart',name:'行李车',glyph:'🧳',r:0,c:2},
    {id:'fire',name:'壁炉',  glyph:'🔥',r:4,c:0}
  ],
  blocked:[[2,2]],
  people:[
    {id:'keeper',name:'灯塔管理员',glyph:'🏮'},
    {id:'crab',  name:'螃蟹先生', glyph:'🦀'},
    {id:'sailor',name:'水手熊',   glyph:'⚓'},
    {id:'hiker', name:'登山熊',   glyph:'⛰️'},
    {id:'onesie',name:'连体衣熊', glyph:'🧸'}
  ],
  victim:'keeper',
  clues:[
    {person:'hiker', type:'besideObject', object:'cart'},
    {person:'sailor',type:'sameRoom', other:'hiker'},
    {person:'crab',  type:'row', row:2},
    {person:'crab',  type:'inRoom', room:'D'},
    {person:'onesie',type:'col', col:2},
    {person:'onesie',type:'aloneInRoom'},
    {person:'keeper',type:'row', row:3},
    {person:'keeper',type:'edge'},
    {person:'keeper',type:'inRoom', room:'D'}
  ],
  solution:{hiker:[0,1],sailor:[1,0],crab:[2,3],keeper:[3,4],onesie:[4,2]},
  murderer:'crab'
},

/* ---------- 案件五 · 5×5：引入否定证词与“上/下一行”链条 ---------- */
{
  id:'mk5', title:'案件五 · 走廊尽头', sizeTag:'5×5',
  brief:'海鸥小姐最后一次被看见，是在走廊尽头整理羽毛。电话听筒垂在半空，还在嗡嗡作响。',
  size:5,
  rooms:[
    "AABBB",
    "AABBB",
    "CCCDD",
    "CCCDD",
    "CCCDD"
  ],
  roomNames:{A:'客房',B:'阅览室',C:'走廊',D:'厨房'},
  objects:[
    {id:'fish', name:'鱼缸',glyph:'🐠',r:1,c:2},
    {id:'phone',name:'电话',glyph:'☎️',r:3,c:0}
  ],
  blocked:[[0,4]],
  people:[
    {id:'gull',     name:'海鸥小姐', glyph:'🕊️'},
    {id:'porter',   name:'夜班门童', glyph:'🔔'},
    {id:'collector',name:'收藏家',   glyph:'🎩'},
    {id:'sailor',   name:'水手熊',   glyph:'⚓'},
    {id:'onesie',   name:'连体衣熊', glyph:'🧸'}
  ],
  victim:'gull',
  clues:[
    {person:'sailor',   type:'corner'},
    {person:'sailor',   type:'notInRoom', room:'C'},
    {person:'collector',type:'besideObject', object:'fish'},
    {person:'onesie',   type:'notInRoom', room:'C'},
    {person:'onesie',   type:'rowBelow', other:'gull'},
    {person:'porter',   type:'rowBelow', other:'onesie'},
    {person:'porter',   type:'inRoom', room:'C'},
    {person:'porter',   type:'notBesideObject', object:'phone'},
    {person:'gull',     type:'inRoom', room:'C'},
    {person:'gull',     type:'col', col:2}
  ],
  solution:{sailor:[0,0],collector:[1,3],gull:[2,2],onesie:[3,4],porter:[4,1]},
  murderer:'porter'
},

/* ---------- 案件六 · 5×5：引入“只有我们两个人” ---------- */
{
  id:'mk6', title:'案件六 · 琴房里的影子', sizeTag:'5×5',
  brief:'琴盖开着，一个音没弹完。螃蟹先生横在琴房中央，像一枚放错位置的棋子。',
  size:5,
  rooms:[
    "AABBB",
    "AABBB",
    "CCDDB",
    "CCDDE",
    "CCDEE"
  ],
  roomNames:{A:'客房',B:'餐厅',C:'大堂',D:'琴房',E:'储物间'},
  objects:[
    {id:'piano',name:'钢琴',  glyph:'🎹',r:2,c:3},
    {id:'clock',name:'落地钟',glyph:'🕰️',r:3,c:4}
  ],
  blocked:[[0,2],[4,0]],
  people:[
    {id:'crab',  name:'螃蟹先生', glyph:'🦀'},
    {id:'keeper',name:'灯塔管理员',glyph:'🏮'},
    {id:'hiker', name:'登山熊',   glyph:'⛰️'},
    {id:'gull',  name:'海鸥小姐', glyph:'🕊️'},
    {id:'porter',name:'夜班门童', glyph:'🔔'}
  ],
  victim:'crab',
  clues:[
    {person:'hiker', type:'corner'},
    {person:'gull',  type:'aloneWith', other:'hiker'},
    {person:'keeper',type:'besideObject', object:'piano'},
    {person:'porter',type:'besideObject', object:'clock'},
    {person:'porter',type:'aloneInRoom'},
    {person:'porter',type:'edge'},
    {person:'crab',  type:'besideObject', object:'piano'},
    {person:'crab',  type:'inRoom', room:'D'},
    {person:'crab',  type:'row', row:2}
  ],
  solution:{hiker:[0,0],gull:[1,1],crab:[2,2],keeper:[3,3],porter:[4,4]},
  murderer:'keeper'
},

/* ---------- 案件七 · 6×6：全部类型混合 ---------- */
{
  id:'mk7', title:'案件七 · 打烊之后', sizeTag:'6×6',
  brief:'门童的摇铃滚落在琴房门口。所有客人都说自己那晚“哪儿也没去”。',
  size:6,
  rooms:[
    "AAABBB",
    "AAABBB",
    "CCDDBB",
    "CCDDEE",
    "CCDDEE",
    "CCCDEE"
  ],
  roomNames:{A:'大堂',B:'餐厅',C:'走廊',D:'琴房',E:'客房'},
  objects:[
    {id:'register',name:'收银机',glyph:'🛎️',r:0,c:0},
    {id:'piano',   name:'钢琴',  glyph:'🎹',r:3,c:2},
    {id:'vase',    name:'花瓶',  glyph:'🏺',r:2,c:5},
    {id:'lamp',    name:'台灯',  glyph:'🕯️',r:5,c:0}
  ],
  blocked:[[1,1],[4,4]],
  people:[
    {id:'porter',name:'夜班门童', glyph:'🔔'},
    {id:'keeper',name:'灯塔管理员',glyph:'🏮'},
    {id:'sailor',name:'水手熊',   glyph:'⚓'},
    {id:'hiker', name:'登山熊',   glyph:'⛰️'},
    {id:'gull',  name:'海鸥小姐', glyph:'🕊️'},
    {id:'onesie',name:'连体衣熊', glyph:'🧸'}
  ],
  victim:'porter',
  clues:[
    {person:'sailor',type:'besideObject', object:'register'},
    {person:'sailor',type:'row', row:0},
    {person:'gull',  type:'inRoom', room:'B'},
    {person:'gull',  type:'rowAbove', other:'hiker'},
    {person:'hiker', type:'dir', other:'lamp', dir:'N'},
    {person:'keeper',type:'dir', other:'piano', dir:'S'},
    {person:'onesie',type:'corner'},
    {person:'onesie',type:'inRoom', room:'E'},
    {person:'porter',type:'besideObject', object:'piano'},
    {person:'porter',type:'col', col:3}
  ],
  solution:{sailor:[0,1],gull:[1,4],hiker:[2,0],porter:[3,3],keeper:[4,2],onesie:[5,5]},
  murderer:'keeper'
},

/* ---------- 案件八 · 6×6：没有任何行列证词 ---------- */
{
  id:'mk8', title:'案件八 · 壁炉的余温', sizeTag:'6×6',
  brief:'壁炉里只剩余温。储物间的门从里面反锁——可钥匙，插在外面。',
  size:6,
  rooms:[
    "AABBBC",
    "AABBCC",
    "DDBBCC",
    "DDEEFF",
    "DDEEFF",
    "DEEEFF"
  ],
  roomNames:{A:'阅览室',B:'大堂',C:'餐厅',D:'走廊',E:'琴房',F:'储物间'},
  objects:[
    {id:'fire', name:'壁炉',  glyph:'🔥',r:2,c:2},
    {id:'fire', name:'壁炉',  glyph:'🔥',r:2,c:3},
    {id:'clock',name:'落地钟',glyph:'🕰️',r:4,c:1},
    {id:'fish', name:'鱼缸',  glyph:'🐠',r:1,c:4}
  ],
  blocked:[[0,5],[3,0],[5,5]],
  people:[
    {id:'crab',  name:'螃蟹先生', glyph:'🦀'},
    {id:'porter',name:'夜班门童', glyph:'🔔'},
    {id:'sailor',name:'水手熊',   glyph:'⚓'},
    {id:'hiker', name:'登山熊',   glyph:'⛰️'},
    {id:'onesie',name:'连体衣熊', glyph:'🧸'},
    {id:'gull',  name:'海鸥小姐', glyph:'🕊️'}
  ],
  victim:'crab',
  clues:[
    {person:'sailor',type:'corner'},
    {person:'sailor',type:'inRoom', room:'A'},
    {person:'hiker', type:'besideObject', object:'fire'},
    {person:'hiker', type:'inRoom', room:'B'},
    {person:'hiker', type:'colRightOf', other:'onesie'},
    {person:'onesie',type:'dir', other:'clock', dir:'N'},
    {person:'gull',  type:'aloneInRoom'},
    {person:'gull',  type:'notInRoom', room:'F'},
    {person:'gull',  type:'edge'},
    {person:'porter',type:'dir', other:'clock', dir:'E'},
    {person:'porter',type:'edge'},
    {person:'crab',  type:'inRoom', room:'F'},
    {person:'crab',  type:'rowAbove', other:'porter'}
  ],
  solution:{sailor:[0,0],hiker:[1,2],onesie:[2,1],crab:[3,4],porter:[4,5],gull:[5,3]},
  murderer:'porter'
},

/* ---------- 案件九 · 6×6：线索最少的终章 ---------- */
{
  id:'mk9', title:'案件九 · 收藏家的最后一夜', sizeTag:'6×6',
  brief:'这一次，躺在保管库里的，是收藏家本人。他毕生收藏别人的故事，最后成了一桩无人认领的旧案。',
  size:6,
  rooms:[
    "AAABBB",
    "ACCBBB",
    "ACCDDB",
    "EECDDB",
    "EECDDF",
    "EEFFFF"
  ],
  roomNames:{A:'大堂',B:'餐厅',C:'琴房',D:'客房',E:'走廊',F:'保管库'},
  objects:[
    {id:'piano',name:'钢琴',  glyph:'🎹',r:1,c:2},
    {id:'clock',name:'落地钟',glyph:'🕰️',r:3,c:3},
    {id:'lamp', name:'台灯',  glyph:'🕯️',r:5,c:0}
  ],
  blocked:[[0,3],[2,5],[4,0]],
  people:[
    {id:'collector',name:'收藏家',   glyph:'🎩'},
    {id:'keeper',   name:'灯塔管理员',glyph:'🏮'},
    {id:'sailor',   name:'水手熊',   glyph:'⚓'},
    {id:'hiker',    name:'登山熊',   glyph:'⛰️'},
    {id:'onesie',   name:'连体衣熊', glyph:'🧸'},
    {id:'gull',     name:'海鸥小姐', glyph:'🕊️'}
  ],
  victim:'collector',
  clues:[
    {person:'sailor',   type:'corner'},
    {person:'hiker',    type:'rowBelow', other:'sailor'},
    {person:'onesie',   type:'besideObject', object:'piano'},
    {person:'gull',     type:'inRoom', room:'E'},
    {person:'gull',     type:'rowBelow', other:'onesie'},
    {person:'keeper',   type:'edge'},
    {person:'keeper',   type:'notInRoom', room:'E'},
    {person:'collector',type:'dir', other:'clock', dir:'S'},
    {person:'collector',type:'inRoom', room:'F'}
  ],
  solution:{sailor:[0,0],hiker:[1,4],onesie:[2,2],gull:[3,1],keeper:[4,5],collector:[5,3]},
  murderer:'keeper'
}
];
