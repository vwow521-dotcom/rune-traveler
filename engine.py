"""Local Python game API. Executed inside a dedicated Pyodide worker."""
import ast
import builtins
import contextlib
import io
import json
import sys
import traceback

def execute_adventure(source, world_json):
    state = json.loads(world_json)
    events = []
    concepts = []
    line = 1
    ticks = 0

    def emit(kind, **data):
        if len(events) >= 180:
            raise RuntimeError('一次最多执行 180 个动作。请缩短循环，然后重试。')
        events.append(dict(kind=kind, line=line, **data))

    def trace(frame, event, arg):
        nonlocal line, ticks
        if frame.f_code.co_filename == 'adventure.py':
            if event == 'line':
                line = frame.f_lineno
                ticks += 1
                if ticks > 12000:
                    raise RuntimeError('执行步数过多，可能出现了无限循环。请检查循环条件。')
            elif event == 'call':
                state['calls'].append(frame.f_code.co_name)
        return trace

    class Output(io.TextIOBase):
        pending = ''
        def write(self, value):
            self.pending += value
            if len(self.pending) > 4000:
                raise RuntimeError('单行输出过长，请缩短要输出的文字。')
            while '\n' in self.pending:
                text, self.pending = self.pending.split('\n', 1)
                state['outputs'].append(text)
                emit('print', text=text)
            return len(value)
        def flush(self):
            if self.pending:
                state['outputs'].append(self.pending)
                emit('print', text=self.pending)
                self.pending = ''

    class Hero:
        @property
        def x(self): return state['x']
        @property
        def y(self): return state['y']
        def move(self, direction, steps=1):
            vectors={'east':(1,0),'west':(-1,0),'north':(0,-1),'south':(0,1)}
            if direction not in vectors: raise ValueError('方向应是 "east"、"west"、"north" 或 "south"。')
            if type(steps) is not int or not 1 <= steps <= 12: raise ValueError('步数应为 1 到 12 之间的整数。')
            dx,dy=vectors[direction]
            for _ in range(steps):
                nx,ny=state['x']+dx,state['y']+dy
                if not (0<=nx<=8 and 0<=ny<=4): raise ValueError('前方已经超出可探索范围，请换个方向。')
                if state['barrier']==[nx,ny]: raise ValueError('影兽挡住了路！先使用 hero.cast("spark")。')
                state['x'],state['y']=nx,ny
                emit('move',x=nx,y=ny,direction=direction)
        def say(self, text):
            text=str(text)
            if len(text)>200: raise ValueError('对话请控制在 200 个字符以内。')
            emit('say',text=text)
        def collect(self):
            if [state['x'],state['y']]!=json.loads(world_json).get('start', [1,3]):
                raise ValueError('星能在出发的位置 (1, 3)，请先回到那里。')
            if state['collected']: raise ValueError('这枚星能已经收集过了。')
            state['collected']=True
            state['energy']=3
            emit('collect',energy=3)
        def light(self):
            point=[state['x'],state['y']]
            if point not in state['lamps']: raise ValueError('这里没有路灯。请走到灯所在的位置再点亮。')
            if point not in state['lit']: state['lit'].append(point)
            emit('light',x=state['x'],y=state['y'])
        def is_blocked(self): return state['barrier']==[state['x']+1,state['y']]
        def cast(self, spell):
            if spell!='spark': raise ValueError('你目前掌握的咒语是 "spark"。')
            if not self.is_blocked(): raise ValueError('前方没有影兽，不需要施放咒语。')
            emit('cast',x=state['barrier'][0],y=state['barrier'][1])
            state['barrier']=None
        def activate(self, energy):
            if [state['x'],state['y']]!=state['target']: raise ValueError('请先移动到金色机关标记所在的位置。')
            if type(energy) is not int or energy!=3: raise ValueError('机关需要恰好 3 点能量。')
            if state['energy']<3: raise ValueError('能量不足，请先在出发位置使用 hero.collect()。')
            state['energy']-=3
            state['gate']=True
            emit('activate')
        def attune(self, rune):
            order=['sun','moon','star']
            if [state['x'],state['y']]!=state['target']: raise ValueError('请站在祭坛前再进行共鸣。')
            if len(state['runes'])>=3: raise ValueError('三枚符文已经全部共鸣。')
            if rune!=order[len(state['runes'])]: raise ValueError('顺序不对。祭坛上的铭文是 sun → moon → star。')
            state['runes'].append(rune)
            emit('attune',rune=rune)

    output=Output()
    error=None
    error_line=None
    try:
        tree=ast.parse(source,filename='adventure.py')
        concepts=list(set(type(node).__name__ for node in ast.walk(tree)))
        compiled=compile(tree,'adventure.py','exec')
        scope={'hero':Hero(),'__name__':'__adventure__','__builtins__':builtins.__dict__}
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            sys.settrace(trace)
            try: exec(compiled,scope)
            finally: sys.settrace(None)
            output.flush()
    except BaseException as exc:
        sys.settrace(None)
        error=f'{type(exc).__name__}: {exc}'
        if isinstance(exc,SyntaxError): error_line=exc.lineno
        else:
            frames=traceback.extract_tb(exc.__traceback__)
            error_line=next((f.lineno for f in reversed(frames) if f.filename=='adventure.py'),line)
    return json.dumps(dict(state=state,events=events,concepts=concepts,error=error,errorLine=error_line),ensure_ascii=False)
