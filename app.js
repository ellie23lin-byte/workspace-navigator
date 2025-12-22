// 1. Firebase 配置
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
const DATA_VERSION = "20251222_v2_fix"; // 更新版本號以強制刷新

const { useState, useEffect, useRef } = React;

const initialData = {
    version: DATA_VERSION,
    ai: [
        { id: 'ai-1', name: 'Manus', desc: '通用型 AI Agent 代理人', url: 'https://manus.ai', color: 'bg-stone-800 text-white' },
        { id: 'ai-2', name: 'Gemini', desc: 'Google 多模態核心模型', url: 'https://gemini.google.com', color: 'bg-blue-100 text-blue-600' },
        { id: 'ai-3', name: 'Gamma', desc: 'AI 簡報、網頁、文件生成', url: 'https://gamma.app', color: 'bg-purple-100 text-purple-600' },
        { id: 'ai-4', name: 'NotebookLM', desc: 'AI 智慧筆記與文獻分析', url: 'https://notebooklm.google.com', color: 'bg-teal-100 text-teal-600' },
        { id: 'ai-5', name: 'AI Studio', desc: 'Google AI 開發者工具', url: 'https://aistudio.google.com', color: 'bg-indigo-100 text-indigo-600' },
        { id: 'ai-6', name: 'ChatGPT', desc: '全能對話生產力助手', url: 'https://chat.openai.com', color: 'bg-emerald-100 text-emerald-600' },
        { id: 'ai-7', name: 'Claude', desc: '精準文案與邏輯推理', url: 'https://claude.ai', color: 'bg-orange-100 text-orange-600' },
        { id: 'ai-8', name: 'DeepL', desc: '全球最精準的 AI 翻譯', url: 'https://www.deepl.com', color: 'bg-blue-50 text-blue-800' },
        { id: 'ai-9', name: 'Perplexity', desc: 'AI 驅動的知識搜尋引擎', url: 'https://www.perplexity.ai', color: 'bg-cyan-100 text-cyan-600' },
        { id: 'ai-10', name: 'Leonardo', desc: '創意影像生成與畫質提升', url: 'https://leonardo.ai', color: 'bg-amber-100 text-amber-700' },
    ],
    workflow: [
        { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', color: 'bg-rose-50 text-rose-600' },
        { id: 'wf-2', name: 'Make', url: 'https://www.make.com', color: 'bg-violet-50 text-violet-600' },
        { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', color: 'bg-slate-100 text-slate-700' },
        { id: 'wf-4', name: 'GAS', url: 'https://script.google.com', color: 'bg-amber-50 text-amber-600' },
        { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', color: 'bg-blue-50 text-blue-600' },
        { id: 'wf-7', name: 'GitHub', url: 'https://github.com', color: 'bg-gray-100 text-gray-800' }
    ],
    design: [
        { id: 'ds-1', name: 'Figma', url: 'https://www.figma.com', color: 'bg-orange-50 text-orange-500' },
        { id: 'ds-2', name: 'Spline', url: 'https://spline.design', color: 'bg-indigo-50 text-indigo-500' },
        { id: 'ds-3', name: 'Pinterest', url: 'https://www.pinterest.com', color: 'bg-red-50 text-red-500' },
        { id: 'ds-6', name: 'Coolors', url: 'https://coolors.co', color: 'bg-teal-50 text-teal-500' },
        { id: 'ds-9', name: 'Google Fonts', url: 'https://fonts.google.com', color: 'bg-green-50 text-green-600' },
        { id: 'ds-10', name: 'Lucide', url: 'https://lucide.dev', color: 'bg-cyan-50 text-cyan-600' }
    ],
    media: [
        { id: 'md-1', name: 'Midjourney', url: 'https://www.midjourney.com', color: 'bg-violet-100 text-violet-700' },
        { id: 'md-2', name: 'Runway', url: 'https://runwayml.com', color: 'bg-pink-100 text-pink-700' },
        { id: 'md-4', name: 'Luma', url: 'https://lumalabs.ai', color: 'bg-purple-100 text-purple-700' },
        { id: 'md-10', name: 'YouTube', url: 'https://youtube.com', color: 'bg-red-100 text-red-700' }
    ],
    outputs: [] // 這裡存放「我的產出」
};

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState(initialData);

    const sectionRefs = {
        ai: useRef(null), workflow: useRef(null), design: useRef(null), media: useRef(null), outputs: useRef(null)
    };
    
    const stateRef = useRef(initialData);
    const sortableInstances = useRef([]);

    const getLogo = (url) => {
        try { return `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`; }
        catch (e) { return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; }
    };

    const syncToFirebase = (data) => {
        if (!db) return;
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ...data,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    };

    useEffect(() => { stateRef.current = tools; }, [tools]);

    useEffect(() => {
        const loadData = async () => {
            if (db) {
                try {
                    const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                    if (doc.exists) {
                        const cloudData = doc.data();
                        // 修正：如果雲端版號不對，合併資料確保「我的產出」不丟失但補齊新工具
                        if (cloudData.version !== DATA_VERSION) {
                            const merged = { ...initialData, outputs: cloudData.outputs || [] };
                            setTools(merged);
                            syncToFirebase(merged);
                        } else {
                            setTools(cloudData);
                        }
                    } else {
                        setTools(initialData);
                        syncToFirebase(initialData);
                    }
                } catch (e) { setTools(initialData); }
            }
            setLoading(false);
        };
        loadData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (loading || typeof Sortable === 'undefined') return;
        
        sortableInstances.current.forEach(ins => ins && ins.destroy());
        sortableInstances.current = [];

        const init = (type) => {
            const el = sectionRefs[type].current;
            if (!el) return;
            const ins = Sortable.create(el, {
                animation: 200, delay: 50, ghostClass: 'bg-stone-50',
                onEnd: (evt) => {
                    const { oldIndex, newIndex } = evt;
                    if (oldIndex === newIndex) return;
                    const newTools = { ...stateRef.current };
                    const list = [...newTools[type]];
                    const [moved] = list.splice(oldIndex, 1);
                    list.splice(newIndex, 0, moved);
                    newTools[type] = list;
                    setTools(newTools);
                    syncToFirebase(newTools);
                }
            });
            sortableInstances.current.push(ins);
        };

        ['ai', 'workflow', 'design', 'media', 'outputs'].forEach(init);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, [loading, tools]);

    const handleAdd = (type) => {
        const name = prompt("名稱:");
        const url = prompt("網址 (https://...):");
        if (!name || !url) return;
        const newItem = { id: `${type}-${Date.now()}`, name, url, color: 'bg-white', desc: 'Custom Tool' };
        const newTools = { ...tools, [type]: [...tools[type], newItem] };
        setTools(newTools);
        syncToFirebase(newTools);
    };

    const handleDelete = (type, id) => {
        if (!confirm("確定刪除此項目？")) return;
        const newTools = { ...tools, [type]: tools[type].filter(t => t.id !== id) };
        setTools(newTools);
        syncToFirebase(newTools);
    };

    const ToolCard = ({ tool, type }) => (
        <div key={tool.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
            <button onClick={() => handleDelete(type, tool.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-30 shadow-lg"><i data-lucide="x" className="w-3 h-3"></i></button>
            <a href={tool.url} target="_blank" className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                <div className={`w-10 h-10 shrink-0 rounded-xl ${tool.color || 'bg-stone-100'} flex items-center justify-center border border-stone-100 p-1.5 overflow-hidden`}>
                    <img src={getLogo(tool.url)} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-stone-800 text-sm truncate">{tool.name}</h3>
                    <p className="text-[9px] text-stone-400 font-bold uppercase truncate">{tool.desc || 'Tool'}</p>
                </div>
            </a>
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400 bg-[#FDFCF5]">RESTORING WORKSPACE...</div>;

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-10">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                            <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center shadow-lg"><i data-lucide="zap" className="w-5 h-5 text-white"></i></div>
                            <h1 className="text-xl font-bold text-stone-700 tracking-tight">Studio Navigator</h1>
                        </div>
                        <nav className="flex space-x-6 hidden md:flex">
                            {['outputs', 'ai', 'workflow', 'design', 'media'].map((id) => (
                                <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({behavior:'smooth'})} className="text-[10px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest">
                                    {id === 'outputs' ? '我的產出' : id.toUpperCase()}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="font-mono text-xs font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 text-stone-500 shadow-sm">
                        {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 space-y-20">
                {/* 我的產出區塊 */}
                <section id="outputs">
                    <div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4">
                        <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="folder-heart" className="w-4 h-4 text-rose-400"></i> My Outputs 我的產出</h2>
                        <button onClick={() => handleAdd('outputs')} className="w-8 h-8 bg-stone-100 text-stone-400 hover:bg-stone-800 hover:text-white rounded-full flex items-center justify-center transition-all"><i data-lucide="plus" className="w-4 h-4"></i></button>
                    </div>
                    <div ref={sectionRefs.outputs} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {tools.outputs.length > 0 ? tools.outputs.map(t => <ToolCard key={t.id} tool={t} type="outputs" />) : <div className="col-span-full py-10 border-2 border-dashed border-stone-200 rounded-3xl flex items-center justify-center text-stone-300 text-xs font-bold uppercase tracking-widest">點擊右側 + 按鈕新增產出連結</div>}
                    </div>
                </section>

                {/* AI / Workflow / Design / Media 區塊 */}
                {['ai', 'workflow', 'design', 'media'].map(type => (
                    <section key={type} id={type}>
                        <div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4">
                            <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <i data-lucide={type === 'ai' ? 'brain' : type === 'workflow' ? 'rocket' : type === 'design' ? 'palette' : 'video'} className="w-4 h-4"></i>
                                {type.toUpperCase()}
                            </h2>
                            <button onClick={() => handleAdd(type)} className="w-8 h-8 bg-stone-100 text-stone-400 hover:bg-stone-800 hover:text-white rounded-full flex items-center justify-center transition-all"><i data-lucide="plus" className="w-4 h-4"></i></button>
                        </div>
                        <div ref={sectionRefs[type]} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {tools[type].map(t => <ToolCard key={t.id} tool={t} type={type} />)}
                        </div>
                    </section>
                ))}
            </main>
            <footer className="text-center py-20 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; 2025</footer>
        </div>
    );
};

const rootDiv = document.getElementById('root');
if (rootDiv) { ReactDOM.createRoot(rootDiv).render(React.createElement(App)); }
