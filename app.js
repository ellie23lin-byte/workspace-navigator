// V2 穩定版：已整合使用者實時排序與新增工具 (2025-12-22)
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
    const toolsRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const sectionOrder = ['ai', 'workflow', 'design', 'outputs', 'media'];
    const sectionRefs = {
        ai: useRef(null), workflow: useRef(null), design: useRef(null), outputs: useRef(null), media: useRef(null)
    };

    // 整合您提供的實時 JSON 數據作為預設值
    const defaultInitial = {
        "ai": [
            { "id": "ai-2", "name": "Gemini", "desc": "Google AI", "url": "https://gemini.google.com", "color": "bg-blue-100" },
            { "id": "ai-6", "name": "ChatGPT", "desc": "AI Chat", "url": "https://chat.openai.com", "color": "bg-emerald-100" },
            { "id": "ai-7", "name": "Claude", "desc": "AI Writing", "url": "https://claude.ai", "color": "bg-orange-100" },
            { "id": "ai-9", "name": "Perplexity", "desc": "AI Search", "url": "https://www.perplexity.ai", "color": "bg-cyan-100" },
            { "id": "ai-1", "name": "Manus", "desc": "AI Agent", "url": "https://manus.ai", "color": "bg-stone-800 text-white" },
            { "id": "ai-4", "name": "NotebookLM", "desc": "Research", "url": "https://notebooklm.google.com", "color": "bg-teal-100" },
            { "id": "ai-5", "name": "AI Studio", "desc": "Dev Tool", "url": "https://aistudio.google.com", "color": "bg-indigo-100" },
            { "id": "ai-3", "name": "Gamma", "desc": "Presentation", "url": "https://gamma.app", "color": "bg-purple-100" },
            { "id": "ai-8", "name": "DeepL", "desc": "Translate", "url": "https://www.deepl.com", "color": "bg-blue-50" },
            { "id": "ai-10", "name": "Leonardo", "desc": "Art Gen", "url": "https://leonardo.ai", "color": "bg-amber-100" }
        ],
        "workflow": [
            { "id": "1766381917294", "name": "Notion", "url": "https://www.notion.so/9719a4dcbfb248079e8e8a65d59aaa87", "color": "bg-white" },
            { "id": "wf-7", "name": "GitHub", "url": "https://github.com", "color": "bg-gray-100" },
            { "id": "wf-1", "name": "n8n", "url": "https://n8n.io", "color": "bg-rose-50" },
            { "id": "wf-2", "name": "Make", "url": "https://www.make.com", "color": "bg-violet-50" },
            { "id": "wf-3", "name": "Vercel", "url": "https://vercel.com", "color": "bg-slate-100" },
            { "id": "wf-4", "name": "GAS", "url": "https://script.google.com", "color": "bg-amber-50" },
            { "id": "wf-6", "name": "Wix", "url": "https://www.wix.com", "color": "bg-sky-50" },
            { "id": "wf-5", "name": "Wix Studio", "url": "https://www.wix.com/studio", "color": "bg-blue-50" }
        ],
        "design": [
            { "id": "ds-9", "name": "Google Fonts", "url": "https://fonts.google.com", "color": "bg-green-50" },
            { "id": "ds-1", "name": "Figma", "url": "https://www.figma.com", "color": "bg-orange-50" },
            { "id": "ds-10", "name": "Lucide", "url": "https://lucide.dev", "color": "bg-cyan-50" },
            { "id": "ds-2", "name": "Spline", "url": "https://spline.design", "color": "bg-indigo-50" },
            { "id": "ds-3", "name": "Pinterest", "url": "https://www.pinterest.com", "color": "bg-red-50" },
            { "id": "ds-4", "name": "Dribbble", "url": "https://dribbble.com", "color": "bg-pink-50" },
            { "id": "ds-5", "name": "Behance", "url": "https://www.behance.net", "color": "bg-blue-50" },
            { "id": "ds-6", "name": "Coolors", "url": "https://coolors.co", "color": "bg-teal-50" },
            { "id": "ds-7", "name": "Adobe Color", "url": "https://color.adobe.com", "color": "bg-yellow-50" },
            { "id": "ds-8", "name": "Fontjoy", "url": "https://fontjoy.com", "color": "bg-lime-50" }
        ],
        "outputs": [
            { "id": "1766381973976", "name": "Studio 工作導航儀", "url": "https://petitns-space.github.io/workspace-navigator/", "color": "bg-white" },
            { "id": "out-cv", "name": "我的CV", "desc": "Personal Resume", "url": "https://my-project-topaz-tau.vercel.app/", "color": "bg-rose-100" }
        ],
        "media": [
            { "id": "md-1", "name": "Midjourney", "url": "https://www.midjourney.com", "color": "bg-violet-100" },
            { "id": "md-10", "name": "YouTube", "url": "https://youtube.com", "color": "bg-red-100" },
            { "id": "md-2", "name": "Runway", "url": "https://runwayml.com", "color": "bg-pink-100" },
            { "id": "md-3", "name": "Pika", "url": "https://pika.art", "color": "bg-fuchsia-100" },
            { "id": "md-4", "name": "Luma", "url": "https://lumalabs.ai", "color": "bg-purple-100" },
            { "id": "md-5", "name": "Krea", "url": "https://www.krea.ai", "color": "bg-sky-100" },
            { "id": "md-6", "name": "Unsplash", "url": "https://unsplash.com", "color": "bg-slate-100" },
            { "id": "md-7", "name": "Freepik", "url": "https://www.freepik.com", "color": "bg-cyan-100" },
            { "id": "md-8", "name": "Icons8", "url": "https://icons8.com", "color": "bg-emerald-100" },
            { "id": "md-9", "name": "Envato Elements", "url": "https://elements.envato.com", "color": "bg-lime-100" }
        ]
    };

    const updateTools = (newData) => {
        setTools(newData);
        toolsRef.current = newData;
    };

    useEffect(() => {
        const loadAndMerge = async () => {
            if (!db) return;
            try {
                const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                let finalData;
                if (doc.exists) {
                    const cloudData = doc.data();
                    const mergedData = {};
                    sectionOrder.forEach(key => {
                        const cloudList = cloudData[key] || [];
                        const defaultList = defaultInitial[key] || [];
                        const cloudIds = new Set(cloudList.map(item => item.id));
                        const missingItems = defaultList.filter(item => !cloudIds.has(item.id));
                        mergedData[key] = [...cloudList, ...missingItems];
                    });
                    finalData = mergedData;
                } else {
                    finalData = defaultInitial;
                }
                updateTools(finalData);
            } catch (err) { console.error("Load Data Fail", err); }
        };
        loadAndMerge();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!tools || typeof Sortable === 'undefined') return;
        const initSortable = () => {
            sectionOrder.forEach(key => {
                const el = sectionRefs[key].current;
                if (!el || el.sortable) return;
                Sortable.create(el, {
                    animation: 250,
                    onEnd: (evt) => {
                        const currentData = { ...toolsRef.current };
                        const list = [...currentData[key]];
                        const [moved] = list.splice(evt.oldIndex, 1);
                        list.splice(evt.newIndex, 0, moved);
                        const newData = { ...currentData, [key]: list };
                        updateTools(newData);
                        if(db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newData);
                    }
                });
            });
            if (window.lucide) lucide.createIcons();
        };
        setTimeout(initSortable, 500);
    }, [tools === null]);

    const getFavicon = (url) => {
        try { return `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`; } 
        catch (e) { return null; }
    };

    if (!tools) return <div className="p-10 text-stone-400 font-mono bg-[#FDFCF5] min-h-screen flex items-center justify-center italic tracking-widest uppercase">Syncing V2 Custom Workspace...</div>;

    return (
        <div className="min-h-screen pb-20 bg-[#FDFCF5]">
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/80 backdrop-blur-md border-b border-stone-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <h1 className="font-bold text-stone-800 text-lg flex items-center gap-2"><i data-lucide="zap" className="w-5 h-5 text-amber-400"></i> Navigator</h1>
                    <nav className="flex space-x-4">
                        {sectionOrder.map(k => (
                            <button key={k} onClick={() => document.getElementById(k)?.scrollIntoView({behavior:'smooth'})} className="text-[10px] font-bold text-stone-400 hover:text-stone-800 uppercase tracking-widest transition-colors">
                                {k === 'outputs' ? '我的產出' : k}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="text-xs font-mono text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-100 shadow-sm select-none">{currentTime.toLocaleTimeString('zh-TW', { hour12: false })}</div>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 mt-12 space-y-20">
                {sectionOrder.map(type => (
                    <section key={type} id={type} className="scroll-mt-24">
                        <div className="flex justify-between items-end mb-6 border-b border-stone-200 pb-2">
                            <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                {type === 'outputs' ? (
                                    <React.Fragment><i data-lucide="sparkles" className="w-4 h-4 text-rose-400"></i> 我的產出 My Outputs</React.Fragment>
                                ) : (
                                    <React.Fragment><i data-lucide={type==='ai'?'brain':type==='workflow'?'rocket':type==='design'?'palette':'video'} className="w-4 h-4"></i> {type}</React.Fragment>
                                )}
                            </h2>
                        </div>
                        <div ref={sectionRefs[type]} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 min-h-[50px]">
                            {tools[type].map(t => (
                                <div key={t.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
                                    <a href={t.url} target="_blank" className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                        <div className={`w-10 h-10 rounded-xl ${t.color || 'bg-stone-50'} flex items-center justify-center shrink-0 overflow-hidden border border-stone-50 relative`}>
                                            <span className="absolute text-[10px] font-bold text-stone-300 uppercase select-none">{t.name.charAt(0)}</span>
                                            <img 
                                                src={getFavicon(t.url)} 
                                                className="w-6 h-6 object-contain relative z-10" 
                                                onError={(e) => { e.target.style.display = 'none'; }} 
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-stone-800 text-sm truncate">{t.name}</div>
                                            <div className="text-[9px] font-bold text-stone-400 uppercase truncate tracking-wider">{t.desc || 'Project'}</div>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
            <footer className="text-center py-20 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; 2025</footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
