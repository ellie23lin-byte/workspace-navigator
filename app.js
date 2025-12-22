// 1. Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({ experimentalForceLongPolling: true });

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v12_fixed'; 

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const [aiTools, setAiTools] = useState([]);
    const [workflowTools, setWorkflowTools] = useState([]);
    const [mediaTools, setMediaTools] = useState([]);
    const [outputs, setOutputs] = useState([]);

    const aiRef = useRef(null);
    const workflowRef = useRef(null);
    const mediaRef = useRef(null);
    const outputsRef = useRef(null);

    const getLogo = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch (e) {
            return `https://www.google.com/s2/favicons?sz=64&domain=google.com`;
        }
    };

    const syncToFirebase = (ai, wf, md, out) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ai, workflow: wf, media: md, outputs: out,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.error("Sync Error:", err));
    };

    // 核心修復：使用最新的 State 引用進行同步
    const stateRef = useRef({ ai: [], workflow: [], media: [], outputs: [] });
    useEffect(() => {
        stateRef.current = { ai: aiTools, workflow: workflowTools, media: mediaTools, outputs: outputs };
    }, [aiTools, workflowTools, mediaTools, outputs]);

    useEffect(() => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get().then(doc => {
            if (doc.exists && doc.data().ai) {
                const d = doc.data();
                setAiTools(d.ai); setWorkflowTools(d.workflow); setMediaTools(d.media); setOutputs(d.outputs || []);
            } else {
                // 若 Firebase 沒資料，載入初始預設 (省略部分清單以簡潔，實際運行時會載入)
                const initial = {
                    ai: [
                        { id: 'ai-1', name: 'Manus', desc: 'AI Agent', url: 'https://manus.ai', color: 'bg-stone-800' },
                        { id: 'ai-2', name: 'Gemini', desc: 'Google AI', url: 'https://gemini.google.com', color: 'bg-blue-50' },
                        { id: 'ai-6', name: 'ChatGPT', desc: 'OpenAI', url: 'https://chat.openai.com', color: 'bg-emerald-50' },
                        { id: 'ai-7', name: 'Claude', desc: 'Anthropic', url: 'https://claude.ai', color: 'bg-orange-50' }
                    ],
                    workflow: [
                        { id: 'wf-11', name: 'Firebase', url: 'https://console.firebase.google.com', color: 'bg-orange-50' },
                        { id: 'wf-12', name: 'Lucide Icons', url: 'https://lucide.dev/icons', color: 'bg-amber-50' }
                    ],
                    media: [
                        { id: 'md-1', name: 'CapCut', url: 'https://www.capcut.com', color: 'bg-cyan-50' }
                    ],
                    outputs: [
                        { id: 'out-1', name: '工作導航儀', desc: 'Workspace', url: '#', color: 'bg-stone-800 text-white', icon: 'palette' },
                        { id: 'out-2', name: '我的 Web CV', desc: 'Portfolio', url: 'https://my-project-topaz-tau.vercel.app/', color: 'bg-rose-100 text-rose-600', icon: 'heart' }
                    ]
                };
                setAiTools(initial.ai); setWorkflowTools(initial.workflow); setMediaTools(initial.media); setOutputs(initial.outputs);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 核心修復：防止重複生成的 Sortable 配置
    useEffect(() => {
        if (loading) return;
        const createSortable = (el, list, setFunc, type) => {
            if (!el) return;
            Sortable.create(el, {
                animation: 250,
                delay: 200,
                delayOnTouchOnly: true,
                ghostClass: 'sortable-ghost',
                onEnd: (evt) => {
                    // 1. 獲取拖拽後的真實 DOM ID 順序
                    const newIds = Array.from(el.children).map(child => child.dataset.id);
                    
                    // 2. 獲取當前最新的數據源
                    const currentList = stateRef.current[type];
                    const sortedList = newIds.map(id => currentList.find(t => t.id === id)).filter(Boolean);
                    
                    // 3. 核心：手動強制把 DOM 移回原位，讓 React 接手渲染，避免重複
                    const itemEl = evt.item;
                    itemEl.parentNode.removeChild(itemEl);
                    if (evt.oldIndex < el.children.length) {
                        el.insertBefore(itemEl, el.children[evt.oldIndex]);
                    } else {
                        el.appendChild(itemEl);
                    }

                    // 4. 更新狀態
                    setFunc(sortedList);
                    
                    // 5. 同步 Firebase
                    setTimeout(() => {
                        const { ai, workflow, media, outputs } = stateRef.current;
                        syncToFirebase(ai, workflow, media, outputs);
                    }, 50);
                }
            });
        };

        createSortable(aiRef.current, aiTools, setAiTools, 'ai');
        createSortable(workflowRef.current, workflowTools, setWorkflowTools, 'workflow');
        createSortable(mediaRef.current, mediaTools, setMediaTools, 'media');
        createSortable(outputsRef.current, outputs, setOutputs, 'outputs');
    }, [loading]); // 僅在加載完成後初始化一次

    useEffect(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, [loading, aiTools, workflowTools, mediaTools, outputs]);

    const handleAdd = (type) => {
        const name = prompt("名稱:");
        const url = prompt("網址:");
        if (!name || !url) return;
        const newTool = { id: Date.now().toString(), name, url, color: "bg-white", desc: "Tool", icon: "sparkles" };
        if (type === 'ai') setAiTools(p => [...p, newTool]);
        if (type === 'wf') setWorkflowTools(p => [...p, newTool]);
        if (type === 'md') setMediaTools(p => [...p, newTool]);
        if (type === 'out') setOutputs(p => [...p, newTool]);
        setTimeout(() => syncToFirebase(stateRef.current.ai, stateRef.current.workflow, stateRef.current.media, stateRef.current.outputs), 200);
    };

    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定刪除？")) return;
        if (type === 'ai') setAiTools(p => p.filter(t => t.id !== id));
        if (type === 'wf') setWorkflowTools(p => p.filter(t => t.id !== id));
        if (type === 'md') setMediaTools(p => p.filter(t => t.id !== id));
        if (type === 'out') setOutputs(p => p.filter(t => t.id !== id));
        setTimeout(() => syncToFirebase(stateRef.current.ai, stateRef.current.workflow, stateRef.current.media, stateRef.current.outputs), 200);
    };

    const ToolButton = ({ tool, type, useLucide = false }) => (
        <div data-id={tool.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
            <button onClick={(e) => handleDelete(type, tool.id, e)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 shadow-lg transition-opacity"><i data-lucide="x" className="w-3 h-3"></i></button>
            <a href={tool.url} target="_blank" className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <div className={`w-10 h-10 shrink-0 rounded-xl ${tool.color} flex items-center justify-center border border-stone-100 shadow-sm overflow-hidden p-1.5`}>
                    {useLucide ? <i data-lucide={tool.icon || 'sparkles'} className="w-5 h-5"></i> : <img src={getLogo(tool.url)} className="w-full h-full object-contain" />}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-stone-800 text-sm truncate">{tool.name}</h3>
                    <p className="text-[9px] text-stone-400 font-bold uppercase truncate">{tool.desc || 'Tool'}</p>
                </div>
            </a>
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400 animate-pulse">FIXING ENGINE...</div>;

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
                                <button key={label} onClick={() => {
                                    const section = ['ai-sec', 'wf-sec', 'md-sec', 'out-sec'][idx];
                                    document.getElementById(section)?.scrollIntoView({behavior:'smooth', block:'start'});
                                }} className="text-[11px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest">{label}</button>
                            ))}
                        </nav>
                    </div>
                    <div className="font-mono text-xs font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 text-stone-500 shadow-sm">
                        {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 space-y-16">
                <section id="ai-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="brain"></i> AI Intelligence</h2><button onClick={()=>handleAdd('ai')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button></div>
                    <div ref={aiRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{aiTools.map(t=><ToolButton key={t.id} tool={t} type="ai"/>)}</div>
                </section>

                <section id="wf-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="rocket"></i> Workflow Automation</h2><button onClick={()=>handleAdd('wf')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button></div>
                    <div ref={workflowRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{workflowTools.map(t=><ToolButton key={t.id} tool={t} type="wf"/>)}</div>
                </section>

                <section id="md-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="video"></i> Creative Media</h2><button onClick={()=>handleAdd('md')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button></div>
                    <div ref={mediaRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{mediaTools.map(t=><ToolButton key={t.id} tool={t} type="md"/>)}</div>
                </section>

                <section id="out-sec"><div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4"><h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="folder-kanban"></i> My Outputs</h2><button onClick={()=>handleAdd('out')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg"><i data-lucide="plus"></i></button></div>
                    <div ref={outputsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">{outputs.map(t=><ToolButton key={t.id} tool={t} type="out" useLucide={true}/>)}</div>
                </section>
            </main>

            <footer className="text-center py-24 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; Creative Workspace 2025</footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
