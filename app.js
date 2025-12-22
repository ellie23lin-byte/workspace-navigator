// V2_3 手機強化版：兩欄佈局、全中文介面、拖拉修正
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

    // 拖拉優化：增加 forceFallback 以支援行動裝置
    useEffect(() => {
        if (!tools) return;
        sectionOrder.forEach(key => {
            const el = sectionRefs[key].current;
            if (el && !el.sortable) {
                Sortable.create(el, {
                    animation: 250,
                    handle: '.drag-handle',
                    ghostClass: 'opacity-30',
                    forceFallback: true, // 強制使用回退模式，增加手機相容性
                    fallbackTolerance: 3, // 容許小範圍位移防止誤觸
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

    const getFavicon = (url) => `https://www.google.com/s2/favicons?sz=128&domain=${new URL(url).hostname}`;
    const getCustomIcon = (id) => {
        const iconMap = { '1766381973976': 'layout-dashboard', 'out-cv': 'user-round' };
        return iconMap[id] || null;
    };

    if (!tools) return <div className="min-h-screen bg-[#FDFCF5] flex items-center justify-center font-mono text-stone-400">同步工作區 V2_3...</div>;

    const getSectionTitle = (k) => {
        const map = { 'ai': 'AI 思考', 'workflow': '工作流程', 'design': '設計美學', 'outputs': '我的產出', 'media': '多媒體' };
        return map[k] || k;
    };

    return (
        <div className={`min-h-screen pb-20 bg-[#FDFCF5] select-none`}>
            {/* Header: 繁體中文化 */}
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center text-white shrink-0">
                        <i data-lucide="zap" className="w-5 h-5"></i>
                    </div>
                    {/* 手機版下拉選單：全中文 */}
                    <select 
                        onChange={(e) => {
                            const el = document.getElementById(e.target.value);
                            if(el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
                        }}
                        className="bg-transparent text-[13px] font-bold tracking-widest text-stone-700 border-none focus:ring-0 cursor-pointer md:hidden appearance-none"
                    >
                        <option value="">跳轉至區塊...</option>
                        {sectionOrder.map(k => <option key={k} value={k}>{getSectionTitle(k)}</option>)}
                    </select>
                    {/* 電腦版選單 */}
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
                    className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${isEditing ? 'bg-rose-500 text-white border-rose-500 shadow-lg scale-105' : 'bg-white text-stone-500 border-stone-200 shadow-sm'}`}
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
                        {/* 手機版 2 欄編排：grid-cols-2 */}
                        <div ref={sectionRefs[type]} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {tools[type].map(t => (
                                <div key={t.id} className={`group relative bg-white border border-stone-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center transition-all ${isEditing ? 'ring-1 ring-rose-100 animate-pulse-subtle' : 'hover:shadow-xl hover:border-stone-300'}`}>
                                    
                                    {/* 拖拉把手 :: 加大觸控區域 */}
                                    {isEditing && (
                                        <div className="drag-handle absolute top-2 left-2 text-stone-300 cursor-move p-2 -m-1 z-20">
                                            <i data-lucide="grip-vertical" className="w-5 h-5"></i>
                                        </div>
                                    )}
                                    
                                    <a href={t.url} target="_blank" className={`flex flex-col sm:flex-row items-center gap-3 w-full min-w-0 ${isEditing ? 'pointer-events-none' : ''}`}>
                                        <div className={`w-11 h-11 rounded-xl ${t.color || 'bg-stone-50'} flex items-center justify-center shrink-0 border border-stone-50 relative overflow-hidden shadow-sm`}>
                                            {type === 'outputs' && getCustomIcon(t.id) ? (
                                                <i data-lucide={getCustomIcon(t.id)} className="w-5 h-5 text-stone-600"></i>
                                            ) : (
                                                <React.Fragment>
                                                    <span className="absolute text-[10px] font-bold text-stone-300 uppercase">{t.name.charAt(0)}</span>
                                                    <img src={getFavicon(t.url)} className="w-7 h-7 object-contain relative z-10" />
                                                </React.Fragment>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 text-center sm:text-left mt-1 sm:mt-0">
                                            <div className="font-bold text-stone-800 text-[13px] sm:text-sm truncate leading-tight px-1">{t.name}</div>
                                            <div className="text-[9px] font-bold text-stone-400 uppercase truncate tracking-wider mt-0.5">{t.desc || '工具'}</div>
                                        </div>
                                    </a>

                                    {/* 刪除按鈕 */}
                                    {isEditing && (
                                        <button onClick={() => { if(confirm("確定刪除？")) { const f = tools[type].filter(x => x.id !== t.id); updateTools({...tools, [type]: f}); } }} className="absolute top-2 right-2 text-rose-400 p-1 hover:bg-rose-50 rounded-full">
                                            <i data-lucide="trash-2" className="w-4 h-4"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <button 
                                    onClick={() => {
                                        const n = prompt("名稱:");
                                        const u = prompt("網址:");
                                        if(n && u) updateTools({...tools, [type]: [...tools[type], {id: Date.now().toString(), name: n, url: u, color:'bg-white'}]});
                                    }}
                                    className="border-2 border-dashed border-stone-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-stone-400 hover:bg-stone-50 transition-all min-h-[80px]"
                                >
                                    <i data-lucide="plus" className="w-5 h-5"></i>
                                    <span className="text-[10px] font-black uppercase tracking-widest">新增按鈕</span>
                                </button>
                            )}
                        </div>
                    </section>
                ))}
            </main>
            <footer className="text-center py-20 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; V2.3 手機強化版</footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
