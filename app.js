/**
 * Studio Workspace Navigator V3.3 (Final Integrated)
 * Base: V3 Locked
 * Features: Adaptive Dragging, Add Tool Modal, Dual Navigation, Font Scaled +30%
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
    
    // Modal & Form 狀態
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', url: '' });

    const sectionOrder = ['ai', 'workflow', 'design', 'outputs', 'media'];
    const sectionRefs = { ai: useRef(null), workflow: useRef(null), design: useRef(null), outputs: useRef(null), media: useRef(null) };
    const sortableInstances = useRef({});

    // 1. 響應式檢測
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 2. 載入資料
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

    // 3. SortableJS 實例管理 (持久化優化)
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

    // 4. 動態拖拉開關
    useEffect(() => {
        if (!tools) return;
        const isDisabled = isMobile && !isEditing;
        Object.values(sortableInstances.current).forEach(instance => {
            if (instance) instance.option('disabled', isDisabled);
        });
    }, [isMobile, isEditing, tools]);

    // 5. 圖標更新
    useEffect(() => { lucide && lucide.createIcons(); }, [tools, isEditing, showAddModal]);

    // 6. 邏輯函式
    const handleDelete = (type, id) => {
        if (!confirm("確定要刪除嗎？")) return;
        setTools(prev => {
            const updated = { ...prev, [type]: prev[type].filter(item => item.id !== id) };
            if (db) db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(updated);
            return updated;
        });
    };

    const handleSaveNewTool = () => {
        if (!formData.name || !formData.url) return alert("請填寫完整資訊");
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

    if (!tools) return <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center font-mono text-stone-400">SYNCING V3.3...</div>;

    return (
        <div className="min-h-screen pb-20 bg-[#FDFCF5] select-none touch-pan-y">
            <style>{`
                .drag-handle { opacity: 0; transition: all 0.2s ease; touch-action: none !important; }
                .group:hover .drag-handle { opacity: 1; }
                .is-editing .drag-handle { opacity: 1 !important; color: #f43f5e; }
            `}</style>
            
            {/* Header: Menu Font Scaled +30% */}
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer hover:rotate-12 transition-transform" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                        <i data-lucide="zap" className="w-6 h-6"></i>
                    </div>

                    {/* 手機導航: 17px */}
                    <div className="md:hidden relative flex items-center ml-2 border-l border-stone-200 pl-4">
                        <select 
                            onChange={(e) => { const el = document.getElementById(e.target.value); if(el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' }); }}
                            className="bg-transparent text-[17px] font-black text-stone-700 border-none focus:ring-0 cursor-pointer appearance-none pr-7 py-0 leading-none"
                        >
                            <option value="">導航...</option>
                            {sectionOrder.map(k => <option key={k} value={k}>{getSectionTitle(k)}</option>)}
                        </select>
                        <i data-lucide="chevron-down" className="w-4 h-4 absolute right-0 text-stone-400 pointer-events-none"></i>
                    </div>

                    {/* 桌機導航: 14.5px */}
                    <nav className="hidden md:flex items-center space-x-12 border-l border-stone-200 ml-6 pl-10">
                        {sectionOrder.map(k => (
                            <button 
                                key={k} 
                                onClick={() => { const el = document.getElementById(k); if(el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' }); }} 
                                className="group relative py-2 text-[14.5px] font-black text-stone-400 hover:text-stone-800 uppercase tracking-[0.25em] transition-all"
                            >
                                {getSectionTitle(k)}
                                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-stone-800 transition-all group-hover:w-full"></span>
                            </button>
                        ))}
                    </nav>
                </div>
                
                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className={`px-6 py-2.5 rounded-full text-[13px] font-black border transition-all ${isEditing ? 'bg-rose-500 text-white border-rose-500 shadow-lg scale-105' : 'bg-white text-stone-500 border-stone-200 shadow-sm hover:border-stone-400'}`}
                >
                    {isEditing ? '儲存完成' : '管理編輯'}
                </button>
            </header>

            <main className={`w-full max-w-[1400px] mx-auto px-4 md:px-8 mt-10 space-y-16 ${isEditing ? 'is-editing' : ''}`}>
                {sectionOrder.map(type => (
                    <section key={type} id={type} className="scroll-mt-32">
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
                            
                            {/* Add Tool Trigger Card */}
                            {isEditing && (
                                <button 
                                    onClick={() => { setActiveCategory(type); setShowAddModal(true); }}
                                    className="border-2 border-dashed border-stone-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-stone-400 hover:bg-stone-50 transition-all group min-h-[110px]"
                                >
                                    <i data-lucide="plus-circle" className="w-8 h-8 text-stone-300 group-hover:text-stone-500"></i>
                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">新增工具</span>
                                </button>
                            )}
                        </div>
                    </section>
                ))}
            </main>

            {/* Modal: Add Tool Dialog */}
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
                                <input autoFocus type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="例如：Gemini" className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">網址 (URL)</label>
                                <input type="text" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://..." className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800" />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl text-[11px] font-black text-stone-400 border border-stone-200 hover:bg-stone-50">取消</button>
                            <button onClick={handleSaveNewTool} className="flex-1 px-4 py-3 rounded-xl text-[11px] font-black bg-stone-800 text-white hover:bg-stone-700">確認新增</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
