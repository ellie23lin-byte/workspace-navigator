// 1. Firebase 初始化優化
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    // 移除重複的 settings 設定以消除 Logger 警告
} else {
    firebase.app();
}
const db = firebase.firestore();

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v20_final'; 

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const [aiTools, setAiTools] = useState([]);
    const [workflowTools, setWorkflowTools] = useState([]);
    const [mediaTools, setMediaTools] = useState([]);
    const [outputs, setOutputs] = useState([]);

    const refs = {
        ai: useRef(null), workflow: useRef(null), media: useRef(null), outputs: useRef(null)
    };
    
    // 使用 Ref 確保在 Sortable 回調中能拿到最新的狀態
    const stateRef = useRef({ ai: [], workflow: [], media: [], outputs: [] });

    const initialData = {
        ai: [
            { id: 'ai-1', name: 'Manus', desc: 'AI Agent', url: 'https://manus.ai', color: 'bg-stone-800' },
            { id: 'ai-2', name: 'Gemini', desc: 'Google AI', url: 'https://gemini.google.com', color: 'bg-blue-50' },
            { id: 'ai-6', name: 'ChatGPT', desc: 'OpenAI', url: 'https://chat.openai.com', color: 'bg-emerald-50' },
            { id: 'ai-7', name: 'Claude', desc: 'Anthropic', url: 'https://claude.ai', color: 'bg-orange-50' },
            { id: 'ai-9', name: 'Perplexity', desc: 'Search AI', url: 'https://www.perplexity.ai', color: 'bg-cyan-50' },
            { id: 'ai-3', name: 'Gamma', desc: 'AI PPT', url: 'https://gamma.app', color: 'bg-purple-50' },
            { id: 'ai-4', name: 'NotebookLM', desc: 'AI Notes', url: 'https://notebooklm.google.com', color: 'bg-teal-50' },
            { id: 'ai-11', name: 'v0.dev', desc: 'Vercel UI', url: 'https://v0.dev', color: 'bg-zinc-50' },
            { id: 'ai-12', name: 'Kimi', desc: 'Long Text', url: 'https://kimi.moonshot.cn', color: 'bg-green-50' },
            { id: 'ai-10', name: 'Leonardo', desc: 'AI Image', url: 'https://leonardo.ai', color: 'bg-amber-50' },
            { id: 'ai-5', name: 'AI Studio', desc: 'Google Dev', url: 'https://aistudio.google.com', color: 'bg-indigo-50' },
            { id: 'ai-8', name: 'DeepL', desc: 'AI Trans', url: 'https://www.deepl.com', color: 'bg-blue-50' },
        ],
        workflow: [
            { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', color: 'bg-rose-50' },
            { id: 'wf-2', name: 'Make', url: 'https://www.make.com', color: 'bg-violet-50' },
            { id: 'wf-12', name: 'Lucide Icons', url: 'https://lucide.dev/icons', color: 'bg-amber-50' },
            { id: 'wf-11', name: 'Firebase', url: 'https://console.firebase.google.com', color: 'bg-orange-50' },
            { id: 'wf-9', name: 'Linear', url: 'https://linear.app', color: 'bg-indigo-50' },
            { id: 'wf-7', name: 'Notion', url: 'https://www.notion.so', color: 'bg-stone-50' },
            { id: 'wf-8', name: 'GitHub', url: 'https://github.com', color: 'bg-slate-50' },
            { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', color: 'bg-zinc-50' },
            { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', color: 'bg-blue-50' },
            { id: 'wf-6', name: 'Wix', url: 'https://www.wix.com', color: 'bg-sky-50' },
            { id: 'wf-4', name: 'GAS', url: 'https://script.google.com', color: 'bg-amber-50' },
            { id: 'wf-10', name: 'Arc Boost', url: 'https://arc.net', color: 'bg-orange-50' },
        ],
        media: [
            { id: 'md-1', name: 'CapCut', url: 'https://www.capcut.com', color: 'bg-cyan-50' },
            { id: 'md-7', name: 'Luma AI', url: 'https://lumalabs.ai', color: 'bg-purple-50' },
            { id: 'md-2', name: 'Canva', url: 'https://www.canva.com', color: 'bg-fuchsia-50' },
            { id: 'md-8', name: 'ElevenLabs', url: 'https://elevenlabs.io', color: 'bg-yellow-50' },
            { id: 'md-6', name: 'Suno', url: 'https://suno.com', color: 'bg-orange-50' },
            { id: 'md-3', name: 'Remove.bg', url: 'https://www.remove.bg', color: 'bg-lime-50' },
            { id: 'md-4', name: 'Stable Audio', url: 'https://stableaudio.com', color: 'bg-indigo-50' },
            { id: 'md-5', name: 'Soundtrap', url: 'https://www.soundtrap.com', color: 'bg-rose-50' },
        ],
        outputs: [
            { id: 'out-1', name: '工作導航儀', desc: 'Workspace', url: 'https://petitns-space.github.io/workspace-navigator/', color: 'bg-stone-800 text-white', icon: 'palette' },
            { id: 'out-2', name: '我的 Web CV', desc: 'Portfolio', url: 'https://my-project-topaz-tau.vercel.app/', color: 'bg-rose-100 text-rose-600', icon: 'heart' },
        ]
    };

    const getLogo = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch (e) { return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; }
    };

    const syncToFirebase = (ai, wf, md, out) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ai, workflow: wf, media: md, outputs: out,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(err => console.error("Firebase Sync Fail:", err));
    };

    useEffect(() => {
        stateRef.current = { ai: aiTools, workflow: workflowTools, media: mediaTools, outputs: outputs };
    }, [aiTools, workflowTools, mediaTools, outputs]);

    useEffect(() => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get().then(doc => {
            if (doc.exists && doc.data().ai) {
                const d = doc.data();
                setAiTools(d.ai); setWorkflowTools(d.workflow); setMediaTools(d.media); setOutputs(d.outputs || []);
            } else {
                setAiTools(initialData.ai); setWorkflowTools(initialData.workflow); setMediaTools(initialData.media); setOutputs(initialData.outputs);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 核心解決方案：手動歸還 DOM 節點，讓 React 處理排序
    useEffect(() => {
        if (loading) return;
        const init = (type, setFunc) => {
            const el = refs[type].current;
            if (!el) return;
            Sortable.create(el, {
                animation: 200, delay: 100, delayOnTouchOnly: true,
                onEnd: (evt) => {
                    const { oldIndex, newIndex, item, from } = evt;
                    if (oldIndex === newIndex) return;

                    // 1. 強制將 DOM 節點移回原始位置 (關鍵：防止 React 崩潰)
                    const children = Array.from(from.children);
                    if (oldIndex < newIndex) {
                        from.insertBefore(item, children[oldIndex]);
                    } else {
                        from.insertBefore(item, children[oldIndex].nextSibling);
                    }

                    // 2. 在 React 狀態中處理排序
                    const currentData = [...stateRef.current[type]];
                    const [movedItem] = currentData.splice(oldIndex, 1);
                    currentData.splice(newIndex, 0, movedItem);

                    // 3. 更新 React 狀態，這會引發順序正確的重新渲染
                    setFunc(currentData);

                    // 4. 延時同步 Firebase
                    setTimeout(() => {
                        const s = stateRef.current;
                        syncToFirebase(s.ai, s.workflow, s.media, s.outputs);
                    }, 500);
                }
            });
        };

        init('ai', setAiTools); init('workflow', setWorkflowTools);
        init('media', setMediaTools); init('outputs', setOutputs);
    }, [loading]);

    useEffect(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, [loading, aiTools, workflowTools, mediaTools, outputs]);

    const handleAdd = (type) => {
        const name = prompt("名稱:");
        const url = prompt("網址:");
        if (!name || !url) return;
        const newTool = { id: `t-${Date.now()}`, name, url, color: "bg-white", desc: "Tool", icon: "link" };
        if (type === 'ai') setAiTools(p => [...p, newTool]);
        else if (type === 'wf') setWorkflowTools(p => [...p, newTool]);
        else if (type === 'md') setMediaTools(p => [...p, newTool]);
        else if (type === 'out') setOutputs(p => [...p, newTool]);
        setTimeout(() => syncToFirebase(stateRef.current.ai, stateRef.current.workflow, stateRef.current.media, stateRef.current.outputs), 300);
    };

    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定刪除？")) return;
        if (type === 'ai') setAiTools(p => p.filter(t => t.id !== id));
        else if (type === 'wf') setWorkflowTools(p => p.filter(t => t.id !== id));
        else if (type === 'md') setMediaTools(p => p.filter(t => t.id !== id));
        else if (type === 'out') setOutputs(p => p.filter(t => t.id !== id));
        setTimeout(() => syncToFirebase(stateRef.current.ai, stateRef.current.workflow, stateRef.current.media, stateRef.current.outputs), 300);
    };

    const ToolButton = ({ tool, type, useLucide = false }) => (
        <div key={tool.id} data-id={tool.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
            <button onClick={(e) => handleDelete(type, tool.id, e)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 shadow-lg"><i data-lucide="x" className="w-3 h-3"></i></button>
            <a href={tool.url} target="_blank" className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <div className={`w-10 h-10 shrink-0 rounded-xl ${tool.color} flex items-center justify-center border border-stone-100 shadow-sm overflow-hidden p-1.5`}>
                    {useLucide ? <i data-lucide={tool.icon || 'sparkles'} className="w-5 h-5"></i> : <img src={getLogo(tool.url)} className="w-full h-full object-contain" alt="icon" />}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-stone-800 text-sm truncate">{tool.name}</h3>
                    <p className="text-[9px] text-stone-400 font-bold uppercase truncate">{tool.desc || 'Tool'}</p>
                </div>
            </a>
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400">INITIALIZING SECURE FLOW...</div>;

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
                            {['AI 思考', '生產力', '影音媒體', '我的產出'].map((label, idx) => (
                                <button key={label} onClick={() => document.getElementById(['ai-sec', 'wf-sec', 'md-sec', 'out-sec'][idx])?.scrollIntoView({behavior:'smooth'})} className="text-[11px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest">{label}</button>
                            ))}
                        </nav>
                    </div>
                    <div className="font-mono text-xs font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 text-stone-500 shadow-sm">{currentTime.toLocaleTimeString('zh-TW', { hour12: false })}</div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 space-y-16">
                <section id="ai-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="brain"></i> AI Intelligence</h2><button onClick={()=>handleAdd('ai')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button></div>
                    <div ref={refs.ai} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{aiTools.map(t=><ToolButton key={t.id} tool={t} type="ai"/>)}</div>
                </section>
                <section id="wf-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="rocket"></i> Workflow</h2><button onClick={()=>handleAdd('wf')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button></div>
                    <div ref={refs.workflow} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{workflowTools.map(t=><ToolButton key={t.id} tool={t} type="wf"/>)}</div>
                </section>
                <section id="md-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="video"></i> Creative</h2><button onClick={()=>handleAdd('md')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button></div>
                    <div ref={refs.media} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{mediaTools.map(t=><ToolButton key={t.id} tool={t} type="md"/>)}</div>
                </section>
                <section id="out-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="folder-kanban"></i> My Outputs</h2><button onClick={()=>handleAdd('out')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button></div>
                    <div ref={refs.outputs} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{outputs.map(t=><ToolButton key={t.id} tool={t} type="out" useLucide={true}/>)}</div>
                </section>
            </main>
            <footer className="text-center py-24 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; Creative Workspace 2025</footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
