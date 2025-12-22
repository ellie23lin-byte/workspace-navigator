// V2_1 升級版：新增管理編輯模式與區塊新增功能
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (e) { console.error("Firebase init error", e); }

const db = (typeof firebase !== 'undefined') ? firebase.firestore() : null;
const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v20251222';

const { useState, useEffect, useRef } = React;

const App = () => {
    const [tools, setTools] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // 編輯模式開關
    const toolsRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const sectionOrder = ['ai', 'workflow', 'design', 'outputs', 'media'];
    const sectionRefs = {
        ai: useRef(null), workflow: useRef(null), design: useRef(null), outputs: useRef(null), media: useRef(null)
    };

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
        toolsRef.current = newData;
        if(db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newData);
    };

    useEffect(() => {
        const loadData = async () => {
            if (!db) return;
            try {
                const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                if (doc.exists) {
                    setTools(doc.data());
                    toolsRef.current = doc.data();
                } else {
                    updateTools(defaultInitial);
                }
            } catch (err) { console.error("Load fail", err); }
        };
        loadData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!tools) return;
        sectionOrder.forEach(key => {
            const el = sectionRefs[key].current;
            if (el && !el.sortable) {
                Sortable.create(el, {
                    animation: 250,
                    ghostClass: 'opacity-20',
                    onEnd: (evt) => {
                        const list = [...toolsRef.current[key]];
                        const [moved] = list.splice(evt.oldIndex, 1);
                        list.splice(evt.newIndex, 0, moved);
                        updateTools({ ...toolsRef.current, [key]: list });
                    }
                });
            }
        });
        if (window.lucide) lucide.createIcons();
    }, [tools, isEditing]);

    const handleAdd = (type) => {
        const name = prompt("輸入名稱:");
        const url = prompt("輸入 URL:");
        if (name && url) {
            const newTool = { id: Date.now().toString(), name, url, color: 'bg-white' };
            updateTools({ ...tools, [type]: [...tools[type], newTool] });
        }
    };

    const handleDelete = (type, id) => {
        if (confirm("確定刪除此按鈕？")) {
            const filtered = tools[type].filter(t => t.id !== id);
            updateTools({ ...tools, [type]: filtered });
        }
    };

    const getFavicon = (url) => `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`;
    
    const getCustomIcon = (id) => {
        const iconMap = { '1766381973976': 'layout-dashboard', 'out-cv': 'user-round' };
        return iconMap[id] || null;
    };

    if (!tools) return <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center font-mono text-stone-400">Loading V2_1...</div>;

    return (
        <div className={`min-h-screen pb-20 bg-[#FDFCF5] ${isEditing ? 'edit-mode' : ''}`}>
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/80 backdrop-blur-md border-b border-stone-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <h1 className="font-bold text-stone-800 text-lg flex items-center gap-2"><i data-lucide="zap" className="w-5 h-5 text-amber-400"></i> Navigator</h1>
                    <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${isEditing ? 'bg-rose-500 text-white border-rose-500 shadow-lg' : 'bg-white text-stone-400 border-stone-200 hover:border-stone-400'}`}
                    >
                        {isEditing ? '完成編輯 Done' : '管理編輯 Edit'}
                    </button>
                </div>
                <div className="text-xs font-mono text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm">{currentTime.toLocaleTimeString('zh-TW', { hour12: false })}</div>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 mt-12 space-y-16">
                {sectionOrder.map(type => (
                    <section key={type} id={type}>
                        <div className="flex justify-between items-center mb-6 border-b border-stone-200 pb-2">
                            <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <i data-lucide={type==='ai'?'brain':type==='workflow'?'rocket':type==='design'?'palette':type==='outputs'?'sparkles':'video'} className={`w-4 h-4 ${type==='outputs'?'text-rose-400':''}`}></i>
                                {type === 'outputs' ? '我的產出' : type}
                            </h2>
                        </div>
                        <div ref={sectionRefs[type]} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {tools[type].map(t => (
                                <div key={t.id} className={`group relative bg-white border border-stone-200 rounded-2xl p-3 transition-all ${isEditing ? 'hover:border-rose-300 ring-1 ring-transparent hover:ring-rose-100' : 'hover:shadow-xl'}`}>
                                    {isEditing && (
                                        <button 
                                            onClick={() => handleDelete(type, t.id)}
                                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg z-50 hover:bg-rose-600 transition-transform hover:scale-110"
                                        >
                                            <i data-lucide="x" className="w-3 h-3"></i>
                                        </button>
                                    )}
                                    <a href={t.url} target="_blank" className={`flex items-center gap-3 ${isEditing ? 'pointer-events-none' : ''}`}>
                                        <div className={`w-10 h-10 rounded-xl ${t.color || 'bg-stone-50'} flex items-center justify-center shrink-0 border border-stone-50 relative`}>
                                            {type === 'outputs' && getCustomIcon(t.id) ? (
                                                <i data-lucide={getCustomIcon(t.id)} className="w-5 h-5 text-stone-600"></i>
                                            ) : (
                                                <React.Fragment>
                                                    <span className="absolute text-[10px] font-bold text-stone-300 uppercase">{t.name.charAt(0)}</span>
                                                    <img src={getFavicon(t.url)} className="w-6 h-6 object-contain relative z-10" onError={e => e.target.style.display='none'} />
                                                </React.Fragment>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-stone-800 text-sm truncate">{t.name}</div>
                                            <div className="text-[9px] font-bold text-stone-400 uppercase truncate tracking-wider">{t.desc || 'Tool'}</div>
                                        </div>
                                    </a>
                                </div>
                            ))}
                            {isEditing && (
                                <button 
                                    onClick={() => handleAdd(type)}
                                    className="border-2 border-dashed border-stone-200 rounded-2xl p-3 flex items-center justify-center gap-2 text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all group"
                                >
                                    <i data-lucide="plus" className="w-4 h-4 group-hover:scale-110 transition-transform"></i>
                                    <span className="text-[10px] font-black uppercase tracking-widest">新增按鈕</span>
                                </button>
                            )}
                        </div>
                    </section>
                ))}
            </main>
            <footer className="text-center py-20 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; V2.1 Edit Mode</footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
