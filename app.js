/**
 * Studio Workspace Navigator V2_3.5
 * Base: V2_2 Logic
 * Optimizations: 
 * - Adaptive Dragging (Desktop: Always, Mobile: Edit Mode Only)
 * - SortableJS Instance Persistence (Ref-based)
 * - Enhanced Deletion Logic with Immutability
 */

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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    const sectionOrder = ['ai', 'workflow', 'design', 'outputs', 'media'];
    const sectionRefs = { ai: useRef(null), workflow: useRef(null), design: useRef(null), outputs: useRef(null), media: useRef(null) };
    
    // 使用 Ref 保存 Sortable 實例，避免重複初始化造成的性能損耗
    const sortableInstances = useRef({});

    // 1. 響應式檢測
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 2. 資料初始化
    useEffect(() => {
        const loadData = async () => {
            if (!db) return;
            try {
                const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                if (doc.exists) {
                    setTools(doc.data());
                } else {
                    console.log("Using default local data...");
                    // 這裡可以放 defaultInitial 資料
                }
            } catch (error) { console.error("Firebase Load Error:", error); }
        };
        loadData();
    }, []);

    // 3. Sortable 實例生命週期管理
    useEffect(() => {
        if (!tools) return;

        sectionOrder.forEach(key => {
            const el = sectionRefs[key].current;
            if (el && !sortableInstances.current[key]) {
                sortableInstances.current[key] = Sortable.create(el, {
                    animation: 200,
                    handle: '.drag-handle',
                    ghostClass: 'opacity-10',
                    forceFallback: true,
                    onStart: () => {
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
            Object.values(sortableInstances.current).forEach(instance => { if (instance) instance.destroy(); });
            sortableInstances.current = {};
        };
    }, [tools]); 

    // 4. 動態切換拖拉開關 (Adaptive Dragging)
    useEffect(() => {
        if (!tools) return;
        const isDisabled = isMobile && !isEditing;
        Object.values(sortableInstances.current).forEach(instance => {
            if (instance) instance.option('disabled', isDisabled);
        });
    }, [isMobile, isEditing, tools]);

    // 5. 圖標重繪
    useEffect(() => { lucide && lucide.createIcons(); }, [tools, isEditing]);

    // 6. 刪除邏輯優化
    const handleDelete = (type, id) => {
        if (!confirm("確定要刪除這個工具嗎？")) return;

        setTools(prevTools => {
            const updatedTools = {
                ...prevTools,
                [type]: prevTools[type].filter(item => item.id !== id)
            };
            if (db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(updatedTools);
            return updatedTools;
        });
    };

    // 工具函式
    const getFavicon = (url) => `https://www.google.com/s2/favicons?sz=128&domain=${new URL(url).hostname}`;
    const getCustomIcon = (id) => {
        const iconMap = { '1766381973976': 'layout-dashboard', 'out-cv': 'user-round' };
        return iconMap[id] || null;
    };
    const getSectionTitle = (k) => {
        const map = { 'ai': 'AI 思考', 'workflow': '工作流程', 'design': '設計美學', 'outputs': '我的產出', 'media': '多媒體' };
        return map[k] || k;
    };

    if (!tools) return (
        <div className="min-h-screen bg-[#FDFCF5] flex flex-col items-center justify-center font-mono">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mb-4"></div>
            <div className="text-stone-400 text-xs tracking-widest uppercase">Initializing V2.3.5...</div>
        </div>
    );

    return (
        <div className="min-h-screen pb-20 bg-[#FDFCF5] select-none touch-pan-y">
            <style>{`
                .drag-handle { 
                    opacity: 0; 
                    transition: all 0.2s ease;
                    -webkit-touch-callout: none !important;
                    touch-action: none !important;
                }
                .group:hover .drag-handle { opacity: 1; }
                .is-editing .drag-handle { opacity: 1 !important; color: #f43f5e; }
                .edit-mode-card { -webkit-touch-callout: none !important; touch-action: pan-y !important; }
            `}</style>
            
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer hover:rotate-12 transition-transform" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                        <i data-lucide="zap" className="w-5 h-5"></i>
                    </div>
                    
                    {/* 手機導航 */}
                    <div className="md:hidden relative">
                        <select 
                            onChange={(e) => { const el = document.getElementById(e.target.value); if(el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' }); }}
                            className="bg-transparent text-[13px] font-bold text-stone-700 border-none focus:ring-0 cursor-pointer appearance-none pr-4"
                        >
                            <option value="">跳轉導航...</option>
                            {sectionOrder.map(k => <option key={k} value={k}>{getSectionTitle(k)}</option>)}
                        </select>
                    </div>

                    {/* 桌機導航 */}
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
                    className={`px-5 py-2 rounded-full text-[11px] font-black border transition-all ${isEditing ? 'bg-rose-500 text-white border-rose-500 shadow-lg' : 'bg-white text-stone-500 border-stone-200 shadow-sm hover:border-stone-400'}`}
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
                                    
                                    {/* 拖拉把手：Z-index 設為 40 確保不擋住刪除按鈕 */}
                                    <div className="drag-handle absolute top-0 left-0 bottom-0 w-10 flex items-center justify-center text-stone-300 z-40 cursor-grab active:cursor-grabbing hover:text-stone-600">
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
                                        <button 
                                            onClick={() => handleDelete(type, t.id)} 
                                            className="absolute top-2 right-2 text-rose-300 p-1 hover:text-rose-500 hover:scale-110 transition-all z-50"
                                        >
                                            <i data-lucide="x-circle" className="w-5 h-5"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
            <footer className="text-center py-20 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; Workspace v2.3.5</footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
