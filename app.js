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
const DATA_VERSION = "20251222_v3_full"; // 強制更新版本號

const { useState, useEffect, useRef } = React;

const initialData = {
    version: DATA_VERSION,
    outputs: [], // 我的產出
    ai: [
        { id: 'ai-1', name: 'Manus', desc: 'AI Agent 代理人', url: 'https://manus.ai', color: 'bg-stone-800 text-white' },
        { id: 'ai-2', name: 'Gemini', desc: 'Google 核心模型', url: 'https://gemini.google.com', color: 'bg-blue-100 text-blue-600' },
        { id: 'ai-3', name: 'Gamma', desc: 'AI 簡報生成', url: 'https://gamma.app', color: 'bg-purple-100 text-purple-600' },
        { id: 'ai-4', name: 'NotebookLM', desc: '文獻分析', url: 'https://notebooklm.google.com', color: 'bg-teal-100 text-teal-600' },
        { id: 'ai-5', name: 'AI Studio', desc: '開發者工具', url: 'https://aistudio.google.com', color: 'bg-indigo-100 text-indigo-600' },
        { id: 'ai-6', name: 'ChatGPT', desc: '全能助手', url: 'https://chat.openai.com', color: 'bg-emerald-100 text-emerald-600' },
        { id: 'ai-7', name: 'Claude', desc: '邏輯推理', url: 'https://claude.ai', color: 'bg-orange-100 text-orange-600' },
        { id: 'ai-8', name: 'DeepL', desc: '精準翻譯', url: 'https://www.deepl.com', color: 'bg-blue-50 text-blue-800' },
        { id: 'ai-9', name: 'Perplexity', desc: 'AI 搜尋', url: 'https://www.perplexity.ai', color: 'bg-cyan-100 text-cyan-600' },
        { id: 'ai-10', name: 'Leonardo', desc: '影像生成', url: 'https://leonardo.ai', color: 'bg-amber-100 text-amber-700' },
    ],
    workflow: [
        { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', color: 'bg-rose-50 text-rose-600' },
        { id: 'wf-2', name: 'Make', url: 'https://www.make.com', color: 'bg-violet-50 text-violet-600' },
        { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', color: 'bg-slate-100 text-slate-700' },
        { id: 'wf-4', name: 'GAS', url: 'https://script.google.com', color: 'bg-amber-50 text-amber-600' },
        { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', color: 'bg-blue-50 text-blue-600' },
        { id: 'wf-6', name: 'Wix', url: 'https://www.wix.com', color: 'bg-sky-50 text-sky-600' },
        { id: 'wf-7', name: 'GitHub', url: 'https://github.com', color: 'bg-gray-100 text-gray-800' }
    ],
    design: [
        { id: 'ds-1', name: 'Figma', url: 'https://www.figma.com', color: 'bg-orange-50 text-orange-500' },
        { id: 'ds-2', name: 'Spline', url: 'https://spline.design', color: 'bg-indigo-50 text-indigo-500' },
        { id: 'ds-3', name: 'Pinterest', url: 'https://www.pinterest.com', color: 'bg-red-50 text-red-500' },
        { id: 'ds-4', name: 'Dribbble', url: 'https://dribbble.com', color: 'bg-pink-50 text-pink-500' },
        { id: 'ds-5', name: 'Behance', url: 'https://www.behance.net', color: 'bg-blue-50 text-blue-500' },
        { id: 'ds-6', name: 'Coolors', url: 'https://coolors.co', color: 'bg-teal-50 text-teal-500' },
        { id: 'ds-7', name: 'Adobe Color', url: 'https://color.adobe.com', color: 'bg-yellow-50 text-yellow-600' },
        { id: 'ds-8', name: 'Fontjoy', url: 'https://fontjoy.com', color: 'bg-lime-50 text-lime-600' },
        { id: 'ds-9', name: 'Google Fonts', url: 'https://fonts.google.com', color: 'bg-green-50 text-green-600' },
        { id: 'ds-10', name: 'Lucide', url: 'https://lucide.dev', color: 'bg-cyan-50 text-cyan-600' }
    ],
    media: [
        { id: 'md-1', name: 'Midjourney', url: 'https://www.midjourney.com', color: 'bg-violet-100 text-violet-700' },
        { id: 'md-2', name: 'Runway', url: 'https://runwayml.com', color: 'bg-pink-100 text-pink-700' },
        { id: 'md-3', name: 'Pika', url: 'https://pika.art', color: 'bg-fuchsia-100 text-fuchsia-700' },
        { id: 'md-4', name: 'Luma', url: 'https://lumalabs.ai', color: 'bg-purple-100 text-purple-700' },
        { id: 'md-5', name: 'Krea', url: 'https://www.krea.ai', color: 'bg-sky-100 text-sky-700' },
        { id: 'md-6', name: 'Unsplash', url: 'https://unsplash.com', color: 'bg-slate-100 text-slate-700' },
        { id: 'md-7', name: 'Freepik', url: 'https://www.freepik.com', color: 'bg-cyan-100 text-cyan-700' },
        { id: 'md-8', name: 'Icons8', url: 'https://icons8.com', color: 'bg-emerald-100 text-emerald-700' },
        { id: 'md-9', name: 'Envato Elements', url: 'https://elements.envato.com', color: 'bg-lime-100 text-lime-700' },
        { id: 'md-10', name: 'YouTube', url: 'https://youtube.com', color: 'bg-red-100 text-red-700' }
    ]
};

const App = () => {
    const [tools, setTools] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const sectionRefs = {
        outputs: useRef(null), ai: useRef(null), workflow: useRef(null), design: useRef(null), media: useRef(null)
    };
    
    const stateRef = useRef(initialData);
    const sortableInstances = useRef([]);

    useEffect(() => { stateRef.current = tools; }, [tools]);

    // 數據載入
    useEffect(() => {
        const load = async () => {
            if (db) {
                try {
                    const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                    if (doc.exists) {
                        const cloudData = doc.data();
                        // 檢查版本：如果雲端版號不同，補足缺少的分類，保留 cloudData 的 outputs
                        if (cloudData.version !== DATA_VERSION) {
                            const merged = { ...initialData, outputs: cloudData.outputs || [] };
                            setTools(merged);
                        } else {
                            setTools(cloudData);
                        }
                    } else {
                        setTools(initialData);
                    }
                } catch (e) { setTools(initialData); }
            }
            setLoading(false);
        };
        load();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 排序初始化
    useEffect(() => {
        if (loading || typeof Sortable === 'undefined') return;

        sortableInstances.current.forEach(ins => ins.destroy());
        sortableInstances.current = [];

        Object.keys(sectionRefs).forEach(key => {
            const el = sectionRefs[key].current;
            if (!el) return; // 關鍵 Debug: 確保 el 不是 null

            const ins = Sortable.create(el, {
                animation: 200, delay: 50, ghostClass: 'bg-stone-50',
                onEnd: (evt) => {
                    const { oldIndex, newIndex } = evt;
                    if (oldIndex === newIndex) return;
                    const newTools = { ...stateRef.current };
                    const list = [...newTools[key]];
                    const [moved] = list.splice(oldIndex, 1);
                    list.splice(newIndex, 0, moved);
                    newTools[key] = list;
                    setTools(newTools);
                    if (db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newTools, { merge: true });
                }
            });
            sortableInstances.current.push(ins);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, [loading, tools]);

    const handleAdd = (type) => {
        const name = prompt("名稱:");
        const url = prompt("網址 (https://...):");
        if (!name || !url) return;
        const newItem = { id: `${type}-${Date.now()}`, name, url, color: 'bg-white', desc: 'Custom' };
        const newTools = { ...tools, [type]: [...tools[type], newItem] };
        setTools(newTools);
        if (db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newTools, { merge: true });
    };

    const handleDelete = (type, id) => {
        if (!confirm("確定刪除？")) return;
        const newTools = { ...tools, [type]: tools[type].filter(t => t.id !== id) };
        setTools(newTools);
        if (db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newTools, { merge: true });
    };

    const getLogo = (url) => `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`;

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400 bg-[#FDFCF5]">LOADING SYSTEM...</div>;

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            {/* Menu Bar */}
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-10">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                            <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center shadow-lg"><i data-lucide="zap" className="w-5 h-5 text-white"></i></div>
                            <h1 className="text-xl font-bold text-stone-700 tracking-tight">Studio Navigator</h1>
                        </div>
                        <nav className="hidden md:flex space-x-6">
                            {['outputs', 'ai', 'workflow', 'design', 'media'].map(id => (
                                <button key={id} onClick={() => document.getElementById(id).scrollIntoView({behavior:'smooth'})} className="text-[10px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest">
                                    {id === 'outputs' ? '我的產出' : id}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="font-mono text-xs font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 text-stone-500 shadow-sm">{currentTime.toLocaleTimeString('zh-TW', { hour12: false })}</div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 space-y-20">
                {['outputs', 'ai', 'workflow', 'design', 'media'].map(type => (
                    <section key={type} id={type}>
                        <div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-4">
                            <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <i data-lucide={type==='outputs'?'folder-heart':type==='ai'?'brain':type==='workflow'?'rocket':type==='design'?'palette':'video'} className="w-4 h-4"></i>
                                {type === 'outputs' ? 'My Outputs 我的產出' : type.toUpperCase()}
                            </h2>
                            <button onClick={() => handleAdd(type)} className="w-8 h-8 bg-stone-100 text-stone-400 hover:bg-stone-800 hover:text-white rounded-full flex items-center justify-center transition-all"><i data-lucide="plus" className="w-4 h-4"></i></button>
                        </div>
                        <div ref={sectionRefs[type]} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {tools[type].map(t => (
                                <div key={t.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
                                    <button onClick={() => handleDelete(type, t.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-30 shadow-lg transition-all"><i data-lucide="x" className="w-3 h-3"></i></button>
                                    <a href={t.url} target="_blank" className="flex items-center gap-3">
                                        <div className={`w-10 h-10 shrink-0 rounded-xl ${t.color || 'bg-stone-100'} flex items-center justify-center border border-stone-100 p-1.5 overflow-hidden`}>
                                            <img src={getLogo(t.url)} className="w-full h-full object-contain" onError={(e)=>e.target.src='https://www.google.com/s2/favicons?sz=64&domain=google.com'} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-stone-800 text-sm truncate">{t.name}</h3>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase truncate">{t.desc || 'Tool'}</p>
                                        </div>
                                    </a>
                                </div>
                            ))}
                            {type === 'outputs' && tools.outputs.length === 0 && (
                                <div className="col-span-full py-10 border-2 border-dashed border-stone-200 rounded-3xl flex items-center justify-center text-stone-300 text-xs font-bold uppercase tracking-widest">點擊 + 新增您的產出連結</div>
                            )}
                        </div>
                    </section>
                ))}
            </main>
            <footer className="text-center py-20 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; 2025</footer>
        </div>
    );
};

const root = document.getElementById('root');
if (root) { ReactDOM.createRoot(root).render(React.createElement(App)); }
