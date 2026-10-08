export const levels = [
  {id:0,chapter:'第一章 · 林间的回声',name:'向世界问好',subtitle:'A VOICE IN THE SILENCE',concept:'输出',area:'微光森林',time:'约 3 分钟',xp:100,item:'初语之羽',icon:'✦',
   story:'这片森林已经沉睡了很久。旅行者，古老的符文仍在等待一个声音。试着用你的第一行代码，向世界问好。',
   task:'使用 print() 输出 Hello, world!，唤醒林间的第一束微光。',goals:['输出 Hello, world!','唤醒沉睡的符文'],
   hint:'print() 会把括号里的内容输出出来。文字需要用英文引号包裹，留意逗号、空格和感叹号。',
   starter:'# 每一段伟大的旅程，都始于一句问候。\n# 在下方写下你的第一行 Python 代码\n\nprint("Hello, world!")\n',solution:'print("Hello, world!")',
   start:[1,3],lamps:[],barrier:null,target:null,requirements:[],check:s=>s.outputs.some(x=>x==='Hello, world!')},
  {id:1,chapter:'第一章 · 林间的回声',name:'石桥上的脚步',subtitle:'EVERY JOURNEY BEGINS WITH A STEP',concept:'顺序执行',area:'旧水车石桥',time:'约 4 分钟',xp:120,item:'行者短靴',icon:'⌁',
   story:'听，水车又转起来了。桥的另一端有一封留给你的信。代码会按从上到下的顺序执行，让脚步跟上你的想法。',
   task:'从 (1, 3) 向东移动 3 格，到达石桥上的信标 (4, 3)。',goals:['向东移动 3 格','抵达石桥信标'],hint:'hero.move("east") 移动一格。可以写三次，也可以用 hero.move("east", 3)。',
   starter:'# east 东 / west 西 / north 北 / south 南\n# 目标坐标：(4, 3)\n\nhero.move("east")\n# 继续补上剩余的脚步\n',solution:'hero.move("east", 3)',start:[1,3],lamps:[],barrier:null,target:[4,3],requirements:[],check:s=>s.x===4&&s.y===3},
  {id:2,chapter:'第一章 · 林间的回声',name:'把星光装进口袋',subtitle:'A NAME FOR THE LIGHT',concept:'变量',area:'苔石机关',time:'约 5 分钟',xp:140,item:'星能结晶',icon:'◇',
   story:'变量像一只可以命名的口袋。把能量数值放进去，在需要时取出来。拾起脚边的星能，再给古老的机关注入 3 点能量。',
   task:'定义 energy = 3，收集星能，向东走 2 格，然后用 energy 启动机关。',goals:['用变量保存能量','收集星能并启动机关'],hint:'依次使用 energy = 3、hero.collect()、hero.move("east", 2) 和 hero.activate(energy)。',
   starter:'# 给这份能量取一个名字\nenergy = 3\n\nhero.collect()\nhero.move("east", 2)\n# 将 energy 交给机关\n',solution:'energy = 3\nhero.collect()\nhero.move("east", 2)\nhero.activate(energy)',start:[1,3],lamps:[],barrier:null,target:[3,3],requirements:['Assign'],check:s=>s.gate&&s.collected},
  {id:3,chapter:'第一章 · 林间的回声',name:'三盏归途的灯',subtitle:'SMALL STEPS, REPEATED',concept:'for 循环',area:'归途灯径',time:'约 5 分钟',xp:160,item:'守灯人徽章',icon:'♧',
   story:'守灯人每天都重复相同的工作：向前一步，点亮一盏灯。循环能把这份重复写得很优雅。让三盏灯一起迎接归人吧。',
   task:'用 for 循环重复 3 次：向东走一格，然后点灯。',goals:['使用 for 循环','点亮全部 3 盏路灯'],hint:'for i in range(3): 后面要有冒号。循环里的 hero.move("east") 和 hero.light() 都缩进 4 个空格。',
   starter:'# 重复的事，交给循环\nfor i in range(3):\n    hero.move("east")\n    # 在这里点亮路灯\n',solution:'for i in range(3):\n    hero.move("east")\n    hero.light()',start:[1,3],lamps:[[2,3],[3,3],[4,3]],barrier:null,target:[4,3],requirements:['For'],check:s=>s.lit.length===3},
  {id:4,chapter:'第二章 · 遗迹的秘密',name:'迷雾中的抉择',subtitle:'WHEN THE PATH CHANGES',concept:'条件判断',area:'雾隐关隘',time:'约 5 分钟',xp:180,item:'雷光符文',icon:'ϟ',
   story:'前方的影兽堵住了路。勇敢不等于鲁莽：先判断，再行动。如果前路受阻，就用 spark 咒语驱散它。',
   task:'使用 if 判断前方是否受阻；施放 spark 后，向东走 2 格。',goals:['使用 if 判断障碍','驱散影兽并通过关隘'],hint:'if hero.is_blocked():\n    hero.cast("spark")\nhero.move("east", 2)\n移动不需要放在 if 的缩进内。',
   starter:'# 观察，是行动的第一步\nif hero.is_blocked():\n    # 用 hero.cast("spark") 驱散影兽\n    pass\n\nhero.move("east", 2)\n',solution:'if hero.is_blocked():\n    hero.cast("spark")\nhero.move("east", 2)',start:[1,3],lamps:[],barrier:[2,3],target:[3,3],requirements:['If'],check:s=>!s.barrier&&s.x===3&&s.y===3},
  {id:5,chapter:'第二章 · 遗迹的秘密',name:'属于你的咒语',subtitle:'GIVE YOUR MAGIC A NAME',concept:'函数',area:'星灯回廊',time:'约 6 分钟',xp:200,item:'旅人法典',icon:'⌘',
   story:'真正的符文师会创造自己的咒语。把“走一步，点一盏灯”封装成函数，再反复调用。名字让复杂的事情变得清晰。',
   task:'定义名为 restore 的函数，执行移动和点灯；调用它点亮 3 盏灯。',goals:['定义并调用 restore()','点亮全部 3 盏路灯'],hint:'def restore(): 下方缩进写 hero.move("east") 和 hero.light()，然后在函数外用循环调用 restore()。',
   starter:'def restore():\n    hero.move("east")\n    # 补上点灯的动作\n\n# 在这里调用你的咒语\n',solution:'def restore():\n    hero.move("east")\n    hero.light()\n\nfor i in range(3):\n    restore()',start:[1,3],lamps:[[2,3],[3,3],[4,3]],barrier:null,target:[4,3],requirements:['FunctionDef'],check:s=>s.lit.length===3&&s.calls.includes('restore')},
  {id:6,chapter:'第二章 · 遗迹的秘密',name:'星辰的排列',subtitle:'CONSTELLATIONS IN A LIST',concept:'列表',area:'三相祭坛',time:'约 6 分钟',xp:220,item:'三相星盘',icon:'☷',
   story:'太阳、月亮、星辰。祭坛上的符文必须按顺序共鸣。列表会记住这份排列，循环则会逐一读出它们。',
   task:'创建包含 "sun"、"moon"、"star" 的列表，用循环依次调用 hero.attune()。',goals:['创建并遍历列表','按日、月、星的顺序共鸣'],hint:'runes = ["sun", "moon", "star"]\nfor rune in runes:\n    hero.attune(rune)',
   starter:'runes = ["sun", "moon", "star"]\n\n# 让每一个符文与祭坛共鸣\nfor rune in runes:\n    pass\n',solution:'runes = ["sun", "moon", "star"]\nfor rune in runes:\n    hero.attune(rune)',start:[4,2],lamps:[],barrier:null,target:[4,2],requirements:['List','For'],check:s=>s.runes.join(',')==='sun,moon,star'},
  {id:7,chapter:'终章 · 微光重燃',name:'让世界重新发光',subtitle:'THE WORLD IS YOUR PROGRAM',concept:'综合挑战',area:'黎明之门',time:'约 8 分钟',xp:300,item:'黎明旅人之证',icon:'☀',
   story:'最后一扇门就在前方。收集星能、点亮三盏灯、驱散影兽，再开启黎明之门。你写下的每一行代码，都在改变这个世界。',
   task:'收集星能 → 向东点亮 3 盏灯 → 判断并驱散影兽 → 向东走 2 格 → 用 3 点能量开门。',goals:['点灯并驱散影兽','抵达 (6, 3) 并开启黎明之门'],hint:'先 hero.collect()；循环 3 次移动和点灯；if hero.is_blocked(): 中施放 spark；再移动 2 格并 hero.activate(3)。',
   starter:'# 用你学到的一切，写下这段旅程的结局\nenergy = 3\nhero.collect()\n\n# 1. 点亮三盏灯\n\n# 2. 处理前方的障碍\n\n# 3. 开启黎明之门\n',solution:'energy = 3\nhero.collect()\nfor i in range(3):\n    hero.move("east")\n    hero.light()\nif hero.is_blocked():\n    hero.cast("spark")\nhero.move("east", 2)\nhero.activate(energy)',start:[1,3],lamps:[[2,3],[3,3],[4,3]],barrier:[5,3],target:[6,3],requirements:['For','If'],check:s=>s.gate&&s.lit.length===3&&!s.barrier}
];

export function worldFor(level){return {x:level.start[0],y:level.start[1],lamps:level.lamps,barrier:level.barrier,target:level.target,lit:[],runes:[],gate:false,collected:false,energy:0,outputs:[],calls:[]};}
export function grade(level,result){
  if(result.error)return {ok:false,reason:result.error};
  const missing=level.requirements.filter(r=>!result.concepts.includes(r));
  if(missing.length)return {ok:false,reason:`动作完成了，但本关还需要练习「${level.concept}」。请试着用这个知识点解决任务。`};
  return level.check(result.state)?{ok:true}:{ok:false,reason:'代码已执行，目标还没有全部完成。对照任务说明，调整代码再试一次吧。'};
}
