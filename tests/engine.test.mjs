import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadPyodide } from 'pyodide';
import { levels, worldFor, grade } from '../levels.js';

const py=await loadPyodide();
py.runPython(await readFile(new URL('../engine.py',import.meta.url),'utf8'));
const execute=py.globals.get('execute_adventure');
const run=(code,level=levels[0])=>JSON.parse(execute(code,JSON.stringify(worldFor(level))));

for(const level of levels){
  test(`任务 ${level.id+1}：${level.name} 的参考解完成真实目标`,()=>{
    const result=run(level.solution,level);
    assert.equal(result.error,null,result.error);
    assert.deepEqual(grade(level,result),{ok:true});
    assert.ok(result.events.length>0);
    assert.ok(result.events.every(e=>Number.isInteger(e.line)&&e.line>0));
  });
}
test('错误输出不会完成第一关',()=>assert.equal(grade(levels[0],run('print("not the answer")')).ok,false));
test('通过循环表达式计算的输出同样可以通关',()=>assert.equal(grade(levels[0],run('words = ["Hello", "world!"]\nprint(", ".join(words))')).ok,true));
test('语法错误提供准确的行号',()=>{const r=run('# comment\nprint("Hello"');assert.match(r.error,/SyntaxError/);assert.equal(r.errorLine,2);});
test('未定义变量提供准确的行号',()=>{const r=run('print(missing_name)');assert.match(r.error,/NameError/);assert.equal(r.errorLine,1);});
test('无法穿过影兽',()=>{const r=run('hero.move("east")',levels[4]);assert.match(r.error,/影兽/);assert.equal(r.state.x,1);});
test('无尽循环被追踪步数限制中止',()=>{const r=run('while True:\n    pass');assert.match(r.error,/无限循环/);});
test('动作数上限保护输出和回放',()=>{const r=run('for i in range(200):\n    print(i)');assert.match(r.error,/180/);assert.equal(r.events.length,180);});
test('仅定义函数而不调用不能通关',()=>{const r=run('def restore():\n    pass',levels[5]);assert.equal(grade(levels[5],r).ok,false);});
test('循环课程要求实际使用循环结构',()=>{const r=run('hero.move("east")\nhero.light()\nhero.move("east")\nhero.light()\nhero.move("east")\nhero.light()',levels[3]);assert.equal(r.state.lit.length,3);assert.equal(grade(levels[3],r).ok,false);});
test('每次运行隔离 Python 变量和场景状态',()=>{run('secret=42\nhero.move("east")');const r=run('print(secret)');assert.match(r.error,/NameError/);assert.equal(r.state.x,1);});
test('星能不能重复收集，边界不能越过',()=>{assert.match(run('hero.collect()\nhero.collect()',levels[2]).error,/已经收集/);assert.match(run('hero.move("west", 4)',levels[1]).error,/范围/);});
test('错误符文顺序被拒绝',()=>assert.match(run('hero.attune("star")',levels[6]).error,/顺序/));
