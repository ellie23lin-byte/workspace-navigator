// Firebase 初始化
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v21_final'; 

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const [aiTools, setAiTools] = useState([]);
    const [workflowTools, setWorkflowTools] = useState([]);
    const [designTools, setDesignTools] = useState([]); // 新增：Design 分類
    const [mediaTools, setMediaTools] = useState([]);
    const [outputs, setOutputs] = useState([]);

    const refs = {
        ai: useRef(null), workflow: useRef(null), design: useRef(null), media: useRef(null), outputs: useRef(null)
    };
    
    const stateRef = useRef({ ai: [], workflow: [], design: [], media: [], outputs: [] });
    const sortableInstances = useRef([]);

    const initialData = {
        ai: [
            { id: 'ai-1', name: 'Manus', desc: 'AI Agent', url: 'https://manus.ai', color: 'bg-stone-800 text-white' },
            { id: 'ai-2', name: 'Gemini', desc: 'Google AI', url: 'https://gemini.google.com', color: 'bg-blue-50' },
            { id: 'ai-6', name: 'ChatGPT', desc: 'OpenAI', url: 'https://chat.openai.com', color: 'bg-emerald-50' }
        ],
        workflow: [
            { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', color: 'bg-rose-50' },
            { id: 'wf-8', name: 'GitHub', url: 'https://github.com', color: 'bg-slate-50' }
        ],
        design: [ // 補回 Design Resources
            { id: 'ds-1', name: 'Figma', url: 'https://www.figma.com', desc: 'UI Design', color: 'bg-orange-50' },
            { id: 'ds-2', name: 'Spline', url: 'https://spline.design', desc: '3D Web', color: 'bg-indigo-50' },
            { id: 'ds-3', name: 'Lucide', url: 'https://lucide.dev', desc: 'Icons', color: 'bg-cyan-50' }
        ],
        media: [
            { id: 'md-1', name: 'Midjourney', url: 'https://www.midjourney.com', color: 'bg-violet-50' },
            { id: 'md-10', name: 'YouTube', url: 'https://youtube.com', color: 'bg-red-50' }
        ],
        outputs: [
            { id: 'out-1', name: '工作導航儀', desc: 'Workspace', url: 'https://petitns-space.github.io/workspace-navigator/', color: 'bg-stone-800 text-white', icon: 'zap' }
        ]
    };

    const getLogo = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch (e) { return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; }
    };

    const syncToFirebase = (ai, wf, ds, md, out) => {
        if (!db) return;
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ai, workflow: wf, design: ds, media: md, outputs: out,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(err => console.error("Firebase Sync Fail:", err));
    };

    useEffect(() => {
        stateRef.current = { ai: aiTools, workflow: workflowTools, design: designTools, media: mediaTools, outputs: outputs };
    }, [aiTools, workflowTools, designTools, mediaTools, outputs]);

    useEffect(() => {
        if (db) {
            db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get().then(doc => {
                if (doc.exists && doc.data().ai) {
                    const d = doc.data();
                    setAiTools(d.ai || []); setWorkflowTools(d.workflow || []); 
                    setDesignTools(d.design || []); setMediaTools(d.media || []); setOutputs(d.outputs || []);
                } else {
                    setAiTools(initialData.ai); setWorkflowTools(initialData.workflow); 
                    setDesignTools(initialData.design); setMediaTools(initialData.media); setOutputs(initialData.outputs);
                }
                setLoading(false);
            }).catch(() => {
                setAiTools(initialData.ai); setWorkflowTools(initialData.workflow);
                setDesignTools(initialData.design); setMediaTools(initialData.media); setOutputs(initialData.outputs);
                setLoading(false);
            });
        } else {
            setAiTools(initialData.ai); setWorkflowTools(initialData.workflow);
            setDesignTools(initialData.design); setMediaTools(initialData.media); setOutputs(initialData.outputs);
            setLoading(false);
        }
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (loading || typeof Sortable === 'undefined') return;

        sortableInstances.current.forEach(ins => ins && ins.destroy());
        sortableInstances.current = [];

        const init = (type, setFunc) => {
            const el = refs[type].current;
            if (!el) return;
            
            const ins = Sortable.create(el, {
                animation: 200, delay: 50,
                onEnd: (evt) => {
                    const { oldIndex, newIndex, item, from } = evt;
                    if (oldIndex === newIndex) return;

                    const children = Array.from(from.children);
                    if (oldIndex < newIndex) from.insertBefore(item, children[oldIndex]);
                    else from.insertBefore(item, children[oldIndex].nextSibling || null);

                    const currentData = [...stateRef.current[type]];
                    const [movedItem] = currentData.splice(oldIndex, 1);
                    currentData.splice(newIndex, 0, movedItem);

                    setFunc(currentData);
                    setTimeout(() => {
                        const s = stateRef.current;
                        syncToFirebase(s.ai, s.workflow, s.design, s.media, s.outputs);
                    }, 500);
                }
            });
            sortableInstances.current.push(ins);
        };

        ['ai', 'workflow', 'design', 'media', 'outputs'].forEach(t => init(t, 
            t === 'ai' ? setAiTools : t === 'workflow' ? setWorkflowTools : t === 'design' ? setDesignTools : t === 'media' ? setMediaTools : setOutputs
        ));

        return () => sortableInstances.current.forEach(ins => ins && ins.destroy());
    }, [loading]);

    useEffect(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, [loading, aiTools, workflowTools, designTools, mediaTools, outputs]);

    const handleAdd = (type) => {
        const name = prompt("名稱:");
        const url = prompt("網址:");
        if (!name || !url) return;
        const newTool = { id: `t-${Date.now()}`, name, url, color: "bg-white", desc: "Tool", icon: "link" };
        if (type === 'ai') setAiTools(p => [...p, newTool]);
        else if (type === 'wf') setWorkflowTools(p => [...p, newTool]);
        else if (type === 'ds') setDesignTools(p => [...p, newTool]);
        else if (type === 'md') setMediaTools(p => [...p, newTool]);
        else if (type === 'out') setOutputs(p => [...p, newTool]);
        setTimeout(() => syncToFirebase(stateRef.current.ai, stateRef.current.workflow, stateRef.current.design, stateRef.current.media, stateRef.current.outputs), 300);
    };

    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定刪除？")) return;
        if (type === 'ai') setAiTools(p => p.filter(t => t.id !== id));
        else if (type === 'wf') setWorkflowTools(p => p.filter(t => t.id !== id));
        else if (type === 'ds') setDesignTools(p => p.filter(t => t.id !== id));
        else if (type === 'md') setMediaTools(p => p.filter(t => t.id !== id));
        else if (type === 'out') setOutputs(p => p.filter(t => t.id !== id));
        setTimeout(() => syncToFirebase(stateRef.current.ai, stateRef.current.workflow, stateRef.current.design, stateRef.current.media, stateRef.current.outputs), 300);
    };

    const ToolButton = ({ tool, type, useLucide = false }) => (
        <div key={tool.id} data-id={tool.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
            <button onClick={(e) => handleDelete(type, tool.id, e)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 shadow-lg transition-opacity"><i data-lucide="x" className="w-3 h-3"></i></button>
            <a href={tool.url} target="_blank" className="flex items-center gap-3">
                <div className={`w-10 h-10 shrink-0 rounded-xl ${tool.color || 'bg-stone-100'} flex items-center justify-center border border-stone-100 shadow-sm overflow-hidden p-1.5`}>
                    {useLucide ? <i data-lucide={tool.icon || 'sparkles'} className="w-5 h-5"></i> : <img src={getLogo(tool.url)} className="w-full h-full object-contain" alt="icon" />}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-stone-800 text-sm truncate">{tool.name}</h3>
                    <p className="text-[9px] text-stone-400 font-bold uppercase truncate">{tool.desc || 'Tool'}</p>
                </div>
            </a>
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400 bg-[#FDFCF5]">LOADING WORKSPACE...</div>;

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-10">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                            <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center shadow-lg"><i data-lucide="zap" className="w-5 h-5 text-white"></i></div>
                            <h1 className="text-xl font-bold text-stone-700 tracking-tight hidden md:block">Studio Navigator</h1>
                        </div>
                        <nav className="flex space-x-8">
                            {['AI 思考', '生產力', '設計資源', '影音媒體', '我的產出'].map((label, idx) => (
                                <button key={label} onClick={() => document.getElementById(['ai-sec', 'wf-sec', 'ds-sec', 'md-sec', 'out-sec'][idx])?.scrollIntoView({behavior:'smooth'})} className="text-[11px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest">{label}</button>
                            ))}
                        </nav>
                    </div>
                    <div className="font-mono text-xs font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 text-stone-500 shadow-sm">{currentTime.toLocaleTimeString('zh-TW', { hour12: false })}</div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 space-y-16">
                <section id="ai-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="brain" className="w-4 h-4"></i> AI Intelligence</h2><button onClick={()=>handleAdd('ai')} className="w-8 h-8 bg-stone-100 text-stone-400 hover:bg-stone-800 hover:text-white rounded-full flex items-center justify-center transition-all"><i data-lucide="plus" className="w-4 h-4"></i></button></div>
                    <div ref={refs.ai} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{aiTools.map(t=><ToolButton key={t.id} tool={t} type="ai"/>)}</div>
                </section>
                
                <section id="wf-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="rocket" className="w-4 h-4"></i> Workflow</h2><button onClick={()=>handleAdd('wf')} className="w-8 h-8 bg-stone-100 text-stone-400 hover:bg-stone-800 hover:text-white rounded-full flex items-center justify-center transition-all"><i data-lucide="plus" className="w-4 h-4"></i></button></div>
                    <div ref={refs.workflow} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{workflowTools.map(t=><ToolButton key={t.id} tool={t} type="wf"/>)}</div>
                </section>

                <section id="ds-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="palette" className="w-4 h-4"></i> Design Resources</h2><button onClick={()=>handleAdd('ds')} className="w-8 h-8 bg-stone-100 text-stone-400 hover:bg-stone-800 hover:text-white rounded-full flex items-center justify-center transition-all"><i data-lucide="plus" className="w-4 h-4"></i></button></div>
                    <div ref={refs.design} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{designTools.map(t=><ToolButton key={t.id} tool={t} type="ds"/>)}</div>
                </section>

                <section id="md-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="video" className="w-4 h-4"></i> Creative</h2><button onClick={()=>handleAdd('md')} className="w-8 h-8 bg-stone-100 text-stone-400 hover:bg-stone-800 hover:text-white rounded-full flex items-center justify-center transition-all"><i data-lucide="plus" className="w-4 h-4"></i></button></div>
                    <div ref={refs.media} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{mediaTools.map(t=><ToolButton key={t.id} tool={t} type="md"/>)}</div>
                </section>

                <section id="out-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="folder-kanban" className="w-4 h-4"></i> My Outputs</h2><button onClick={()=>handleAdd('out')} className="w-8 h-8 bg-stone-100 text-stone-400 hover:bg-stone-800 hover:text-white rounded-full flex items-center justify-center transition-all"><i data-lucide="plus" className="w-4 h-4"></i></button></div>
                    <div ref={refs.outputs} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{outputs.map(t=><ToolButton key={t.id} tool={t} type="out" useLucide={true}/>)}</div>
                </section>
            </main>
            <footer className="text-center py-24 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; Creative Workspace 2025</footer>
        </div>
    );
};

// 最終相容性渲染邏輯
const container = document.getElementById('root');
if (container) {
    if (typeof ReactDOM.createRoot === 'function') {
        ReactDOM.createRoot(container).render(React.createElement(App));
    } else {
        ReactDOM.render(React.createElement(App), container);
    }
}
