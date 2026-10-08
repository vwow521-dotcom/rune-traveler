import { loadPyodide } from './node_modules/pyodide/pyodide.mjs';
let python;
async function initialize(){
  try {
    python=await loadPyodide({indexURL:new URL('./node_modules/pyodide/',import.meta.url).href});
    const response=await fetch('./engine.py');
    if(!response.ok)throw new Error('无法读取 Python 游戏引擎');
    python.runPython(await response.text());
    self.postMessage({type:'ready',version:python.runPython('sys.version.split()[0]')});
  } catch(error){self.postMessage({type:'init-error',error:error.message});}
}
self.onmessage=({data})=>{
  if(data.type!=='run'||!python)return;
  try{
    const execute=python.globals.get('execute_adventure');
    const result=JSON.parse(execute(data.code,JSON.stringify(data.world)));
    execute.destroy();
    self.postMessage({type:'result',id:data.id,result});
  }catch(error){self.postMessage({type:'result',id:data.id,result:{error:error.message,events:[],concepts:[],state:data.world}});}
};
initialize();
