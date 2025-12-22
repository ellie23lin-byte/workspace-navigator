// ==========================================
// 1. Firebase 配置
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

// 初始化 Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v3_combined'; // 使用新 ID 確保數據結構乾淨

const { useState, useEffect, useRef } = React;

// ==========================================
// 2. 預設資料 (包含 Design Resources)
// ==========================================
const initialData = {
    ai: [
        { id: 'ai-1', name: 'Manus', desc: 'AI Agent', url: 'https://manus.ai', color: 'bg-stone-800 text-white' },
        { id: 'ai-2', name: 'Gemini', desc: 'Google AI', url: 'https://gemini.google.com', color: 'bg-blue-50 text-blue-600' },
        { id: 'ai-6', name: 'ChatGPT', desc: 'OpenAI', url: 'https://chat.openai.com', color: 'bg-emerald-50 text-emerald-600' }
    ],
    workflow: [
        { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', color: 'bg-rose-50 text-rose-600' },
        { id: 'wf-2', name: 'Make', url: 'https://www.make.com', color: 'bg-violet-50 text-violet-600' },
        { id: 'wf-7', name: 'GitHub', url: 'https://github.com', color: 'bg-gray-50 text-gray-800' }
    ],
    design: [
        { id: 'ds-1', name: 'Figma', url: 'https://www.figma.com', desc: 'UI Design', color: 'bg-orange-50 text-orange-500' },
        { id: 'ds-2', name: 'Spline', url: 'https://spline.design', desc: '3D Web Design', color: 'bg-indigo-50 text-indigo-500' },
        { id: 'ds-10', name: 'Lucide', url: 'https://lucide.dev', desc: 'Icon Library', color: 'bg-cyan-50 text-cyan-600' }
    ],
    media: [
        { id: 'md-1', name: 'Midjourney', url: 'https://www.midjourney.com', desc: 'AI Image', color: 'bg-violet-50 text-violet-700' },
        { id: 'md-10', name: 'YouTube', url: 'https://youtube.com', desc: 'Video Platform', color: 'bg-red-50 text-red-700' }
    ]
};

// ==========================================
// 3. React App 主程式
// ==========================================
const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState(null);
    const [order, setOrder] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const toolsRef = useRef(null);
    const orderRef = useRef(null);
    const sortableInstances = useRef([]);

    // 自動獲取 Favicon Logo
    const getLogo = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch (e) { return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; }
    };

    // 同步 Ref 以解決 Sortable 閉包問題
    useEffect(() => {
        toolsRef.current = tools;
        orderRef.current = order;
    }, [tools, order]);

    // 初始化：載入時間與 Firebase 資料
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get().then(doc => {
            if (doc.exists && doc.data().tools) {
                setTools(doc.data().tools);
                setOrder(doc.data().order);
            } else {
                setTools(initialData);
                setOrder(Object.keys(initialData));
            }
            setLoading(false);
        }).catch(err => {
            console.error("Firebase Error:", err);
            setTools(initialData);
            setOrder(Object.keys(initialData));
            setLoading(false);
        });

        return () => clearInterval(timer);
    }, []);

    // 保存資料到 Firebase
    const saveState = (newTools, newOrder) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            tools: newTools,
            order: newOrder,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(e => console.error("Save error:", e));
    };

    // 初始化拖拽功能 (SortableJS)
    useEffect(() => {
        if (loading || !order) return;

        // 清除舊的實例，防止記憶體洩漏
        sortableInstances.current.forEach(i => i.destroy());
        sortableInstances.current = [];

        // 1. 主容器排序 (區塊排序)
        const mainEl = document.getElementById('main-container');
        if (mainEl) {
            const ins = Sortable.create(mainEl, {
                animation: 200, 
                handle: '.drag-handle',
                onEnd: (evt) => {
                    const { oldIndex, newIndex, item, from } = evt;
                    if (oldIndex === newIndex) return;
                    
                    // 【核心修復】手動將 DOM 移回原位，讓 React 接手渲染
                    const children = Array.from(from.children);
                    if (oldIndex < newIndex) from.insertBefore(item, children[oldIndex]);
                    else from.insertBefore(item, children[oldIndex].nextSibling || null);

                    const newOrder = [...orderRef.current];
                    const [moved] = newOrder.splice(oldIndex, 1);
                    newOrder.splice(newIndex, 0, moved);
                    
                    setOrder(newOrder);
                    saveState(toolsRef.current, newOrder);
                }
            });
            sortableInstances.current.push(ins);
        }

        // 2. 工具網格排序 (分類內部的工具)
        order.forEach(type => {
            const el = document.getElementById(`grid-${type}`);
            if (!el) return;
            const ins = Sortable.create(el, {
                animation: 200, 
                delay: 50,
                onEnd: (evt) => {
                    const { oldIndex, newIndex, item, from } = evt;
                    if (oldIndex === newIndex) return;

                    // 【核心修復】DOM 復位機制
                    const children = Array.from(from.children);
                    if (oldIndex < newIndex) from.insertBefore(item, children[oldIndex]);
                    else from.insertBefore(item, children[oldIndex].nextSibling || null);

                    const newTools = JSON.parse(JSON.stringify(toolsRef.current));
                    const [moved] = newTools[type].splice(oldIndex, 1);
                    newTools[type].splice(newIndex, 0, moved);

                    setTools(newTools);
                    saveState(newTools, orderRef.current);
                }
            });
            sortableInstances.current.push(ins);
        });

        return () => sortableInstances.current.forEach(i => i.destroy());
    }, [loading, order]);

    // 更新圖標
    useEffect(() => { 
        if (!loading && typeof lucide !== 'undefined') lucide.createIcons(); 
    }, [loading, tools, isEditing, order]);

    // 刪除工具
    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定要刪除這個工具嗎？")) return;
        const newTools = { ...tools };
        newTools[type] = newTools[type].filter(t => t.id !== id);
        setTools(newTools);
        saveState(newTools, order);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 font-mono text-stone-400">
            SYNCING WORKSPACE...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCF5] p-8 font-sans">
            {/* Header */}
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-5xl font-black text-stone-800 tracking-tighter">
                        {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                    </h1>
                    <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                        {currentTime.toLocaleDateString('zh-TW')}
                    </p>
                </div>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${isEditing ? 'bg-orange-500 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                >
                    <i data-lucide={isEditing ? 'check' : 'settings-2'} className="w-4 h-4"></i>
                    {isEditing ? '完成管理' : '管理工具'}
                </button>
            </header>

            {/* Main Content */}
            <main id="main-container" className="max-w-7xl mx-auto space-y-12 pb-20">
                {order.map(type => (
                    <section key={type} className="relative group/sec bg-white/30 p-6 rounded-3xl border border-transparent hover:border-stone-100 transition-all">
                        {/* 區塊拖動把手 */}
                        <div className="drag-handle absolute -left-4 top-8 opacity-0 group-hover/sec:opacity-100 transition-opacity cursor-grab p-2 text-stone-300 hover:text-stone-800">
                            <i data-lucide="grip-vertical"></i>
                        </div>
                        
                        <h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] mb-6">
                            {
                                type === 'ai' ? 'AI Intelligence' : 
                                type === 'workflow' ? 'Workflow & Dev' : 
                                type === 'design' ? 'Design Resources' : 'Media Assets'
                            }
                        </h2>

                        <div id={`grid-${type}`} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {tools[type] && tools[type].map(tool => (
                                <div key={tool.id} data-id={tool.id} className="group relative bg-white border border-stone-100 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:scale-95">
                                    {isEditing && (
                                        <button 
                                            onClick={(e) => handleDelete(type, tool.id, e)} 
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center z-30 shadow-md hover:scale-110 transition-transform"
                                        >
                                            <i data-lucide="x" className="w-3 h-3"></i>
                                        </button>
                                    )}
                                    <a href={tool.url} target="_blank" className="flex items-center gap-3">
                                        <div className={`w-10 h-10 flex-shrink-0 rounded-xl ${tool.color ? tool.color.split(' ')[0] : 'bg-stone-100'} flex items-center justify-center p-1.5 border border-stone-50`}>
                                            <img src={getLogo(tool.url)} className="w-full h-full object-contain" alt="logo" loading="lazy" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-stone-800 text-sm truncate">{tool.name}</h3>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase truncate">{tool.desc || 'Tool'}</p>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
};

// 渲染到根節點
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
