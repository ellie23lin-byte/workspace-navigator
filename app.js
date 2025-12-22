// V2_2 手機優化版：修正超出畫面、下拉選單、把手拖拉邏輯
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
    const toolsRef = useRef(null);
    const sectionOrder = ['ai', 'workflow', 'design', 'outputs', 'media'];
    const sectionRefs = { ai: useRef(null), workflow: useRef(null), design: useRef(null), outputs: useRef(null), media: useRef(null) };

    const updateTools = (newData) => {
        setTools(newData);
        toolsRef.current = newData;
        if(db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newData);
    };

    useEffect(() => {
        const loadData = async () => {
            if (!db) return;
            const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
            if (doc.exists) { setTools(doc.data()); toolsRef.current = doc.data(); }
        };
        loadData();
    }, []);

    // 拖拉初始化：加入 Handle 把手控制
    useEffect(() => {
        if (!tools) return;
        sectionOrder.forEach(key => {
            const el = sectionRefs[key].current;
            if (el && !el.sortable) {
                Sortable.create(el, {
                    animation: 250,
                    handle: '.drag-handle', // 只有點擊把手才能拖拉
                    ghostClass: 'opacity-10',
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

    const getFavicon = (url) => `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`;
    const getCustomIcon = (id) => {
        const iconMap = { '1766381973976': 'layout-dashboard', 'out-cv': 'user-round' };
        return iconMap[id] || null;
    };

    if (!tools) return <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center font-mono text-stone-400">Optimizing V2_2 for Mobile...</div>;

    return (
        <div className={`min-h-screen pb-20 bg-[#FDFCF5] select-none touch-pan-y`}>
            {/* Header: 手機版下拉菜單設計 */}
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center text-white shrink-0">
                        <i data-lucide="zap" className="w-4 h-4"></i>
                    </div>
                    {/* 手機版下拉選單 */}
                    <select 
                        onChange={(e) => {
                            const el = document.getElementById(e.target.value);
                            if(el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
                        }}
                        className="bg-transparent text-[11px] font-black uppercase tracking-widest text-stone-600 border-none focus:ring-0 cursor-pointer md:hidden"
                    >
                        <option value="">Jump to...</option>
                        {sectionOrder.map(k => <option key={k} value={k}>{k === 'outputs' ? '我的產出' : k}</option>)}
                    </select>
                    {/* 電腦版選單 */}
                    <nav className="hidden md:flex space-x-6 border-l border-stone-200 pl-6">
                        {sectionOrder.map(k => (
                            <button key={k} onClick={() => document.getElementById(k).scrollIntoView({behavior:'smooth'})} className="text-[10px] font-black text-stone-400 hover:text-stone-800 uppercase tracking-widest transition-colors">
                                {k === 'outputs' ? '我的產出' : k}
                            </button>
                        ))}
                    </nav>
                </div>

                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isEditing ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white text-stone-400 border-stone-200'}`}
                >
                    {isEditing ? 'Done' : 'Edit'}
                </button>
            </header>

            <main className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-8 space-y-12">
                {sectionOrder.map(type => (
                    <section key={type} id={type} className="scroll-mt-24">
                        <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-2">
                            <h2 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <i data-lucide={type==='ai'?'brain':type==='workflow'?'rocket':type==='design'?'palette':type==='outputs'?'sparkles':'video'} className="w-3.5 h-3.5"></i>
                                {type === 'outputs' ? '我的產出' : type}
                            </h2>
                        </div>
                        <div ref={sectionRefs[type]} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {tools[type].map(t => (
                                <div key={t.id} className={`group relative bg-white border border-stone-200 rounded-2xl p-3 flex items-center transition-all ${isEditing ? 'ring-1 ring-rose-100' : 'hover:shadow-md'}`}>
                                    {/* 拖拉把手：解決手機長按衝突 */}
                                    {isEditing && (
                                        <div className="drag-handle mr-2 text-stone-300 cursor-move p-1">
                                            <i data-lucide="grip-vertical" className="w-4 h-4"></i>
                                        </div>
                                    )}
                                    
                                    <a href={t.url} target="_blank" className={`flex items-center gap-3 flex-1 min-w-0 ${isEditing ? 'pointer-events-none' : ''}`}>
                                        <div className={`w-9 h-9 rounded-xl ${t.color || 'bg-stone-50'} flex items-center justify-center shrink-0 border border-stone-50 relative overflow-hidden`}>
                                            {type === 'outputs' && getCustomIcon(t.id) ? (
                                                <i data-lucide={getCustomIcon(t.id)} className="w-4 h-4 text-stone-600"></i>
                                            ) : (
                                                <React.Fragment>
                                                    <span className="absolute text-[9px] font-bold text-stone-300 uppercase">{t.name.charAt(0)}</span>
                                                    <img src={getFavicon(t.url)} className="w-5 h-5 object-contain relative z-10" />
                                                </React.Fragment>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-stone-800 text-xs truncate">{t.name}</div>
                                            <div className="text-[8px] font-bold text-stone-400 uppercase truncate tracking-wider">{t.desc || 'Tool'}</div>
                                        </div>
                                    </a>

                                    {isEditing && (
                                        <button onClick={() => { if(confirm("Delete?")) { const f = tools[type].filter(x => x.id !== t.id); updateTools({...tools, [type]: f}); } }} className="ml-2 text-rose-400 p-1">
                                            <i data-lucide="trash-2" className="w-4 h-4"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
            <footer className="text-center py-10 text-stone-300 text-[9px] font-black uppercase tracking-[0.4em]">Beige Studio &bull; Mobile V2.2</footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
