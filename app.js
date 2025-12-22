// V2_3.2 穩定版：整合 React 標準化重構 + V2_2 原始數據
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = (typeof firebase !== 'undefined') ? firebase.firestore() : null;
const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v20251222';

const { useState, useEffect, useRef } = React;

const App = () => {
    const [tools, setTools] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const sectionOrder = ['ai', 'workflow', 'design', 'outputs', 'media'];
    const sectionRefs = { ai: useRef(null), workflow: useRef(null), design: useRef(null), outputs: useRef(null), media: useRef(null) };

    // 初始備援資料 (避免資料庫讀取失敗時空白)
    const defaultInitial = {
        "ai": [
            { "id": "ai-2", "name": "Gemini", "desc": "Google AI", "url": "https://gemini.google.com", "color": "bg-blue-100" },
            { "id": "ai-6", "name": "ChatGPT", "desc": "AI Chat", "url": "https://chat.openai.com", "color": "bg-emerald-100" },
            { "id": "ai-7", "name": "Claude", "desc": "AI Writing", "url": "https://claude.ai", "color": "bg-orange-100" },
            { "id": "ai-9", "name": "Perplexity", "desc": "AI Search", "url": "https://www.perplexity.ai", "color": "bg-cyan-100" },
            { "id": "ai-1", "name": "Manus", "desc": "AI Agent", "url": "https://manus.ai", "color": "bg-stone-800 text-white" }
        ],
        "workflow": [
            { "id": "1766381917294", "name": "Notion", "url": "https://www.notion.so/9719a4dcbfb248079e8e8a65d59aaa87", "color": "bg-white" },
            { "id": "wf-7", "name": "GitHub", "url": "https://github.com", "color": "bg-gray-100" }
        ],
        "design": [
            { "id": "ds-9", "name": "Google Fonts", "url": "https://fonts.google.com", "color": "bg-green-50" },
            { "id": "ds-1", "name": "Figma", "url": "https://www.figma.com", "color": "bg-orange-50" }
        ],
        "outputs": [
            { "id": "1766381973976", "name": "Studio 工作導航儀", "url": "https://petitns-space.github.io/workspace-navigator/", "color": "bg-white" },
            { "id": "out-cv", "name": "我的CV", "desc": "Personal Resume", "url": "https://my-project-topaz-tau.vercel.app/", "color": "bg-rose-100" }
        ],
        "media": [
            { "id": "md-1", "name": "Midjourney", "url": "https://www.midjourney.com", "color": "bg-violet-100" },
            { "id": "md-10", "name": "YouTube", "url": "https://youtube.com", "color": "bg-red-100" }
        ]
    };

    const updateTools = (newData) => {
        setTools(newData);
        if(db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newData);
    };

    useEffect(() => {
        const loadData = async () => {
            if (!db) return;
            try {
                const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                if (doc.exists) {
                    setTools(doc.data());
                } else {
                    setTools(defaultInitial);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                setTools(defaultInitial);
            }
        };
        loadData();
    }, []);

    // 核心拖拉邏輯
    useEffect(() => {
        if (!tools || !isEditing) return;

        const sortableInstances = {};
        sectionOrder.forEach(key => {
            const el = sectionRefs[key].current;
            if (el) {
                sortableInstances[key] = Sortable.create(el, {
                    animation: 150,
                    handle: '.drag-handle',
                    ghostClass: 'opacity-10',
                    forceFallback: true,
                    fallbackOnBody: true,
                    swapThreshold: 0.65,
                    touchStartThreshold: 5,
                    onStart: () => { if(window.navigator.vibrate) window.navigator.vibrate(20); },
                    onEnd: (evt) => {
                        setTools(currentTools => {
                            const newTools = { ...currentTools };
                            const list = [...newTools[key]];
                            const [moved] = list.splice(evt.oldIndex, 1);
                            list.splice(evt.newIndex, 0, moved);
                            newTools[key] = list;
                            if(db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newTools);
                            return newTools;
                        });
                    }
                });
            }
        });

        return () => {
            Object.values(sortableInstances).forEach(instance => {
                if (instance) instance.destroy();
            });
        };
    }, [tools, isEditing]);

    useEffect(() => {
        if (window.lucide) lucide.createIcons();
    }, [tools, isEditing]);

    const getFavicon = (url) => `https://www.google.com/s2/favicons?sz=128&domain=${new URL(url).hostname}`;
    const getCustomIcon = (id) => {
        const iconMap = { '1766381973976': 'layout-dashboard', 'out-cv': 'user-round' };
        return iconMap[id] || null;
    };

    if (!tools) return <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center font-mono text-stone-400 italic text-sm">LOADING V2.3.2 STABLE...</div>;

    const getSectionTitle = (k) => {
        const map = { 'ai': 'AI 思考', 'workflow': '工作流程', 'design': '設計美學', 'outputs': '我的產出', 'media': '多媒體' };
        return map[k] || k;
    };

    return (
        <div className="min-h-screen pb-20 bg-[#FDFCF5] select-none touch-pan-y">
            <style>{`
                .drag-handle { -webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important; touch-action: none !important; }
                .edit-mode-card { -webkit-touch-callout: none !important; touch-action: pan-y !important; }
            `}</style>
            
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                        <i data-lucide="zap" className="w-5 h-5"></i>
                    </div>
                    <select 
                        onChange={(e) => { const el = document.getElementById(e.target.value); if(el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' }); }}
                        className="bg-transparent text-[13px] font-bold text-stone-700 border-none focus:ring-0 cursor-pointer md:hidden appearance-none"
                    >
                        <option value="">跳轉至...</option>
                        {sectionOrder.map(k => <option key={k} value={k}>{getSectionTitle(k)}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`px-5 py-2 rounded-full text-[11px] font-black border transition-all ${isEditing ? 'bg-rose-500 text-white border-rose-500 shadow-lg' : 'bg-white text-stone-500 border-stone-200'}`}
                >
                    {isEditing ? '儲存完成' : '管理編輯'}
                </button>
            </header>

            <main className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-10 space-y-16">
                {sectionOrder.map(type => (
                    <section key={type} id={type} className="scroll-mt-28">
                        <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-3">
                            <h2 className="text-[12px] font-black text-stone-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                <i data-lucide={type==='ai'?'brain':type==='workflow'?'rocket':type==='design'?'palette':type==='outputs'?'sparkles':'video'} className={`w-4 h-4 ${type==='outputs'?'text-rose-400':''}`}></i>
                                {getSectionTitle(type)}
                            </h2>
                        </div>
                        <div ref={sectionRefs[type]} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {tools[type].map(t => (
                                <div key={t.id} className={`edit-mode-card group relative bg-white border border-stone-200 rounded-2xl p-3 flex flex-col items-center transition-all ${isEditing ? 'ring-1 ring-rose-100' : 'hover:shadow-xl'}`}>
                                    {isEditing && (
                                        <div className="drag-handle absolute top-0 left-0 bottom-0 w-10 flex items-center justify-center text-stone-300 z-50">
                                            <i data-lucide="grip-vertical" className="w-5 h-5"></i>
                                        </div>
                                    )}
                                    <a href={t.url} target="_blank" className={`flex flex-col items-center gap-3 w-full min-w-0 ${isEditing ? 'opacity-50 pointer-events-none' : ''}`} onClick={e => isEditing && e.preventDefault()}>
                                        <div className={`w-12 h-12 rounded-xl ${t.color || 'bg-stone-50'} flex items-center justify-center shrink-0 border border-stone-50 relative overflow-hidden shadow-sm`}>
                                            {type === 'outputs' && getCustomIcon(t.id) ? (
                                                <i data-lucide={getCustomIcon(t.id)} className="w-6 h-6 text-stone-600"></i>
                                            ) : (
                                                <React.Fragment>
                                                    <span className="absolute text-[10px] font-bold text-stone-300 uppercase">{t.name.charAt(0)}</span>
                                                    <img src={getFavicon(t.url)} className="w-8 h-8 object-contain relative z-10" />
                                                </React.Fragment>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 text-center">
                                            <div className="font-black text-stone-800 text-[14px] truncate leading-tight">{t.name}</div>
                                        </div>
                                    </a>
                                    {isEditing && (
                                        <button onClick={() => { if(confirm("確定刪除？")) { const f = tools[type].filter(x => x.id !== t.id); updateTools({...tools, [type]: f}); } }} className="absolute top-2 right-2 text-rose-300 p-1">
                                            <i data-lucide="x-circle" className="w-5 h-5"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
