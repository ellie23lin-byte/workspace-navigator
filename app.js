// V2_3.3：桌機版支援隨時拖拉，手機版維持編輯鎖定
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
    const [isMobile, setIsMobile] = useState(false);
    
    const sectionOrder = ['ai', 'workflow', 'design', 'outputs', 'media'];
    const sectionRefs = { ai: useRef(null), workflow: useRef(null), design: useRef(null), outputs: useRef(null), media: useRef(null) };

    // 檢測是否為行動裝置
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!db) return;
            try {
                const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                if (doc.exists) setTools(doc.data());
            } catch (error) { console.error("Load error:", error); }
        };
        loadData();
    }, []);

    // 核心拖拉邏輯：桌機版隨時啟用，手機版僅在編輯時啟用
    useEffect(() => {
        if (!tools) return;
        
        const sortableInstances = {};
        sectionOrder.forEach(key => {
            const el = sectionRefs[key].current;
            if (el) {
                sortableInstances[key] = Sortable.create(el, {
                    animation: 200,
                    handle: '.drag-handle',
                    ghostClass: 'opacity-10',
                    forceFallback: true,
                    // 重要：只有桌機版 或 手機編輯模式 下，把手才有效
                    onStart: (evt) => {
                        if (isMobile && !isEditing) {
                            evt.preventDefault();
                            return false;
                        }
                        if(window.navigator.vibrate) window.navigator.vibrate(10);
                    },
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
            Object.values(sortableInstances).forEach(instance => { if (instance) instance.destroy(); });
        };
    }, [tools, isEditing, isMobile]);

    useEffect(() => { lucide && lucide.createIcons(); }, [tools, isEditing]);

    const getFavicon = (url) => `https://www.google.com/s2/favicons?sz=128&domain=${new URL(url).hostname}`;
    const getCustomIcon = (id) => {
        const iconMap = { '1766381973976': 'layout-dashboard', 'out-cv': 'user-round' };
        return iconMap[id] || null;
    };
    const getSectionTitle = (k) => {
        const map = { 'ai': 'AI 思考', 'workflow': '工作流程', 'design': '設計美學', 'outputs': '我的產出', 'media': '多媒體' };
        return map[k] || k;
    };

    if (!tools) return <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center font-mono text-stone-400">V2.3.3 Adaptive...</div>;

    return (
        <div className="min-h-screen pb-20 bg-[#FDFCF5] select-none touch-pan-y">
            <style>{`
                /* 把手顯示邏輯：桌機 Hover 才出現，手機編輯模式才出現 */
                .drag-handle { 
                    opacity: 0; 
                    transition: opacity 0.2s;
                    -webkit-touch-callout: none !important;
                    touch-action: none !important;
                }
                .group:hover .drag-handle { opacity: 1; }
                .is-editing .drag-handle { opacity: 1 !important; }
                
                .edit-mode-card { -webkit-touch-callout: none !important; touch-action: pan-y !important; }
            `}</style>
            
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                        <i data-lucide="zap" className="w-5 h-5"></i>
                    </div>
                    <div className="md:hidden relative">
                        <select 
                            onChange={(e) => { const el = document.getElementById(e.target.value); if(el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' }); }}
                            className="bg-transparent text-[13px] font-bold text-stone-700 border-none focus:ring-0 cursor-pointer appearance-none pr-4"
                        >
                            <option value="">跳轉至...</option>
                            {sectionOrder.map(k => <option key={k} value={k}>{getSectionTitle(k)}</option>)}
                        </select>
                    </div>
                    <nav className="hidden md:flex space-x-8 border-l border-stone-200 pl-8">
                        {sectionOrder.map(k => (
                            <button key={k} onClick={() => document.getElementById(k).scrollIntoView({behavior:'smooth'})} className="text-[11px] font-black text-stone-400 hover:text-stone-800 uppercase tracking-widest transition-colors">
                                {getSectionTitle(k)}
                            </button>
                        ))}
                    </nav>
                </div>

                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`px-5 py-2 rounded-full text-[11px] font-black border transition-all ${isEditing ? 'bg-rose-500 text-white border-rose-500 shadow-lg' : 'bg-white text-stone-500 border-stone-200 shadow-sm'}`}
                >
                    {isEditing ? '儲存完成' : '管理編輯'}
                </button>
            </header>

            <main className={`w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-10 space-y-16 ${isEditing ? 'is-editing' : ''}`}>
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
                                <div key={t.id} className={`edit-mode-card group relative bg-white border border-stone-200 rounded-2xl p-3 flex flex-col items-center transition-all ${isEditing ? 'ring-1 ring-rose-100' : 'hover:shadow-xl hover:border-stone-300'}`}>
                                    
                                    {/* 拖拉把手：桌機版永遠可用 */}
                                    <div className="drag-handle absolute top-0 left-0 bottom-0 w-10 flex items-center justify-center text-stone-300 z-50 cursor-grab active:cursor-grabbing">
                                        <i data-lucide="grip-vertical" className="w-5 h-5"></i>
                                    </div>

                                    <a href={t.url} target="_blank" className={`flex flex-col items-center gap-3 w-full min-w-0 ${isEditing ? 'opacity-40 pointer-events-none' : ''}`} onClick={e => isEditing && e.preventDefault()}>
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
                                            <div className="font-black text-stone-800 text-[14px] truncate leading-tight px-2">{t.name}</div>
                                        </div>
                                    </a>

                                    {isEditing && (
                                        <button onClick={() => { if(confirm("確定刪除？")) { const f = tools[type].filter(x => x.id !== t.id); updateTools({...tools, [type]: f}); } }} className="absolute top-2 right-2 text-rose-300 p-1 hover:text-rose-500">
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
