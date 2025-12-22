/**
 * Studio Workspace Navigator V3.1
 * Base: V3 Locked
 * Added: Integrated Add Tool Modal (UX Optimized)
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
    
    // Modal 相關狀態
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', url: '' });

    const sectionOrder = ['ai', 'workflow', 'design', 'outputs', 'media'];
    const sectionRefs = { ai: useRef(null), workflow: useRef(null), design: useRef(null), outputs: useRef(null), media: useRef(null) };
    const sortableInstances = useRef({});

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            if (!db) return;
            try {
                const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                if (doc.exists) setTools(doc.data());
            } catch (error) { console.error("Load Error:", error); }
        };
        loadData();
    }, []);

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

    useEffect(() => {
        if (!tools) return;
        const isDisabled = isMobile && !isEditing;
        Object.values(sortableInstances.current).forEach(instance => {
            if (instance) instance.option('disabled', isDisabled);
        });
    }, [isMobile, isEditing, tools]);

    useEffect(() => { lucide && lucide.createIcons(); }, [tools, isEditing, showAddModal]);

    // 刪除與新增邏輯
    const handleDelete = (type, id) => {
        if (!confirm("確定要刪除嗎？")) return;
        setTools(prev => {
            const updated = { ...prev, [type]: prev[type].filter(item => item.id !== id) };
            if (db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(updated);
            return updated;
        });
    };

    const handleSaveNewTool = () => {
        if (!formData.name || !formData.url) return alert("請填寫名稱與網址");
        let finalUrl = formData.url;
        if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;

        setTools(prev => {
            const updated = {
                ...prev,
                [activeCategory]: [...prev[activeCategory], {
                    id: Date.now().toString(),
                    name: formData.name,
                    url: finalUrl,
                    color: "bg-stone-50"
                }]
            };
            if (db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(updated);
            return updated;
        });
        setShowAddModal(false);
        setFormData({ name: '', url: '' });
    };

    const getFavicon = (url) => `https://www.google.com/s2/favicons?sz=128&domain=${new URL(url).hostname}`;
    const getCustomIcon = (id) => {
        const iconMap = { '1766381973976': 'layout-dashboard', 'out-cv': 'user-round' };
        return iconMap[id] || null;
    };
    const getSectionTitle = (k) => {
        const map = { 'ai': 'AI 思考', 'workflow': '工作流程', 'design': '設計美學', 'outputs': '我的產出', 'media': '多媒體' };
        return map[k] || k;
    };

    if (!tools) return <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center font-mono text-stone-400 uppercase tracking-widest">Loading V3.1...</div>;

    return (
        <div className="min-h-screen pb-20 bg-[#FDFCF5] select-none touch-pan-y">
            <style>{`
                .drag-handle { opacity: 0; transition: all 0.2s ease; touch-action: none !important; }
                .group:hover .drag-handle { opacity: 1; }
                .is-editing .drag-handle { opacity: 1 !important; color: #f43f5e; }
            `}</style>
            
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer hover:rotate-12 transition-transform" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                        <i data-lucide="zap" className="w-5 h-5"></i>
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
                                <i data-lucide={type==='ai'?'brain':type==='workflow'?'rocket':type==='design'?'palette':type==='outputs'?'sparkles':'video'} className="w-4 h-4"></i>
                                {getSectionTitle(type)}
                            </h2>
                        </div>
                        <div ref={sectionRefs[type]} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {tools[type].map(t => (
                                <div key={t.id} className="edit-mode-card group relative bg-white border border-stone-200 rounded-2xl p-3 flex flex-col items-center transition-all hover:shadow-xl">
                                    <div className="drag-handle absolute top-0 left-0 bottom-0 w-10 flex items-center justify-center text-stone-300 z-40 cursor-grab active:cursor-grabbing">
                                        <i data-lucide="grip-vertical" className="w-5 h-5"></i>
                                    </div>
                                    <a href={t.url} target="_blank" className={`flex flex-col items-center gap-3 w-full ${isEditing ? 'opacity-40 pointer-events-none' : ''}`}>
                                        <div className={`w-12 h-12 rounded-xl ${t.color || 'bg-stone-50'} flex items-center justify-center shrink-0 border border-stone-50 shadow-sm overflow-hidden`}>
                                            {type === 'outputs' && getCustomIcon(t.id) ? (
                                                <i data-lucide={getCustomIcon(t.id)} className="w-6 h-6 text-stone-600"></i>
                                            ) : (
                                                <img src={getFavicon(t.url)} className="w-8 h-8 object-contain" />
                                            )}
                                        </div>
                                        <div className="font-black text-stone-800 text-[14px] truncate text-center px-2">{t.name}</div>
                                    </a>
                                    {isEditing && (
                                        <button onClick={() => handleDelete(type, t.id)} className="absolute top-2 right-2 text-rose-300 p-1 hover:text-rose-500 z-50">
                                            <i data-lucide="x-circle" className="w-5 h-5"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            {/* 新增工具按鈕卡片 */}
                            {isEditing && (
                                <button 
                                    onClick={() => { setActiveCategory(type); setShowAddModal(true); }}
                                    className="border-2 border-dashed border-stone-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-stone-400 hover:bg-stone-50 transition-all group"
                                >
                                    <i data-lucide="plus-circle" className="w-8 h-8 text-stone-300 group-hover:text-stone-500"></i>
                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">新增工具</span>
                                </button>
                            )}
                        </div>
                    </section>
                ))}
            </main>

            {/* Beige Style Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-[#FDFCF5] w-full max-w-md rounded-3xl shadow-2xl p-8 border border-stone-200 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-[14px] font-black text-stone-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <i data-lucide="plus" className="w-5 h-5 text-rose-500"></i>
                            新增至 {getSectionTitle(activeCategory)}
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">工具名稱</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="例如：Gemini"
                                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">網址 (URL)</label>
                                <input 
                                    type="text" 
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                    placeholder="https://..."
                                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 transition-all"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl text-[11px] font-black text-stone-400 border border-stone-200 hover:bg-stone-50 transition-all">取消</button>
                            <button onClick={handleSaveNewTool} className="flex-1 px-4 py-3 rounded-xl text-[11px] font-black bg-stone-800 text-white hover:bg-stone-700 transition-all">確認新增</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
