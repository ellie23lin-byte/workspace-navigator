// 1. Firebase 配置 (保持不變)
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// 確保長輪詢以提高穩定性
db.settings({ experimentalForceLongPolling: true });

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v2'; 

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [aiTools, setAiTools] = useState([]);
    const [workflowTools, setWorkflowTools] = useState([]);
    const [mediaTools, setMediaTools] = useState([]);
    const [loading, setLoading] = useState(true);

    const aiRef = useRef(null);
    const workflowRef = useRef(null);
    const mediaRef = useRef(null);

    const defaultData = {
        ai: [
            { id: 'ai-1', name: 'Manus', desc: 'AI Agent', icon: 'bot', url: 'https://manus.ai', color: 'bg-stone-800 text-white border-stone-900' },
            { id: 'ai-2', name: 'Gemini', desc: 'Google AI', icon: 'sparkles', url: 'https://gemini.google.com', color: 'bg-blue-100 text-blue-600 border-blue-200' }
        ],
        workflow: [
            { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', icon: 'infinity', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' }
        ],
        media: [
            { id: 'md-1', name: 'CapCut', url: 'https://www.capcut.com', icon: 'video', bgColor: 'bg-cyan-50 border-cyan-100 text-cyan-600' }
        ]
    };

    // 統一儲存函式 - 加上成功/失敗 Log
    const saveAllToFirebase = async (ai, wf, md) => {
        try {
            await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
                ai, workflow: wf, media: md,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log("✅ 資料已同步至 Firebase");
        } catch (error) {
            console.error("❌ Firebase 儲存失敗:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                if (doc.exists && doc.data().ai) {
                    const data = doc.data();
                    setAiTools(data.ai || []);
                    setWorkflowTools(data.workflow || []);
                    setMediaTools(data.media || []);
                } else {
                    console.log("ℹ️ 無現成資料，載入預設值");
                    setAiTools(defaultData.ai);
                    setWorkflowTools(defaultData.workflow);
                    setMediaTools(defaultData.media);
                    saveAllToFirebase(defaultData.ai, defaultData.workflow, defaultData.media);
                }
            } catch (error) {
                console.error("❌ 讀取失敗:", error);
                // 讀取失敗也載入預設值，避免畫面卡死
                setAiTools(defaultData.ai);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 新增工具
    const handleAdd = (type) => {
        const name = prompt("請輸入工具名稱：");
        const url = prompt("請輸入工具網址 (https://...)：");
        if (!name || !url) return;

        const newTool = {
            id: `${type}-${Date.now()}`,
            name, url, desc: "自定義工具", icon: "link",
            color: "bg-white text-stone-600 border-stone-200",
            bgColor: "bg-stone-50 border-stone-100 text-stone-600"
        };

        if (type === 'ai') {
            const next = [...aiTools, newTool];
            setAiTools(next);
            saveAllToFirebase(next, workflowTools, mediaTools);
        } else if (type === 'wf') {
            const next = [...workflowTools, newTool];
            setWorkflowTools(next);
            saveAllToFirebase(aiTools, next, mediaTools);
        } else {
            const next = [...mediaTools, newTool];
            setMediaTools(next);
            saveAllToFirebase(aiTools, workflowTools, next);
        }
    };

    // 刪除工具
    const handleDelete = (type, id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("確定要刪除嗎？")) return;

        let nextAi = aiTools, nextWf = workflowTools, nextMd = mediaTools;
        if (type === 'ai') nextAi = aiTools.filter(t => t.id !== id);
        else if (type === 'wf') nextWf = workflowTools.filter(t => t.id !== id);
        else nextMd = mediaTools.filter(t => t.id !== id);

        setAiTools(nextAi);
        setWorkflowTools(nextWf);
        setMediaTools(nextMd);
        saveAllToFirebase(nextAi, nextWf, nextMd);
    };

    // 拖拉功能
    useEffect(() => {
        if (loading) return;
        const setupSortable = (ref, type, list, setter) => {
            if (ref.current) {
                Sortable.create(ref.current, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    onEnd: (evt) => {
                        const newIds = Array.from(evt.to.children).map(el => el.dataset.id);
                        const reordered = newIds.map(id => [...aiTools, ...workflowTools, ...mediaTools].find(t => t.id === id)).filter(Boolean);
                        
                        // 這裡需要根據 type 找出正確的 setter 並儲存
                        if (type === 'ai') { setAiTools(reordered); saveAllToFirebase(reordered, workflowTools, mediaTools); }
                        if (type === 'wf') { setWorkflowTools(reordered); saveAllToFirebase(aiTools, reordered, mediaTools); }
                        if (type === 'md') { setMediaTools(reordered); saveAllToFirebase(aiTools, workflowTools, reordered); }
                    }
                });
            }
        };
        setupSortable(aiRef, 'ai', aiTools, setAiTools);
        setupSortable(workflowRef, 'wf', workflowTools, setWorkflowTools);
        setupSortable(mediaRef, 'md', mediaTools, setMediaTools);
        lucide.createIcons();
    }, [loading, aiTools, workflowTools, mediaTools]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400">LOADING DATABASE...</div>;

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#E8E6D9] rounded-2xl flex items-center justify-center text-stone-600 shadow-inner">
                        <i data-lucide="zap" className="w-5 h-5"></i>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-stone-700">Studio</h1>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Live Sync Mode</p>
                    </div>
                </div>
                <div className="font-mono text-sm font-semibold text-stone-600 bg-white/50 px-5 py-2 rounded-2xl border border-stone-200 shadow-sm">
                    {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <section className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-stone-700 flex items-center gap-2">
                                <i data-lucide="brain-circuit" className="w-5 h-5"></i> AI 思考
                            </h2>
                            <button onClick={() => handleAdd('ai')} className="w-8 h-8 bg-stone-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                <i data-lucide="plus" className="w-4 h-4"></i>
                            </button>
                        </div>
                        <div ref={aiRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiTools.map((tool) => (
                                <div key={tool.id} data-id={tool.id} className="group relative p-5 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all">
                                    <button onClick={(e) => handleDelete('ai', tool.id, e)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md z-10">
                                        <i data-lucide="x" className="w-3 h-3"></i>
                                    </button>
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-4 rounded-2xl ${tool.color} border shadow-sm`}>
                                            <i data-lucide={tool.icon} className="w-5 h-5"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-stone-800 truncate">{tool.name}</h3>
                                            <p className="text-stone-400 text-xs truncate">{tool.desc}</p>
                                        </div>
                                        <a href={tool.url} target="_blank" className="p-2 bg-stone-50 rounded-full text-stone-300 hover:text-stone-600">
                                            <i data-lucide="arrow-up-right" className="w-5 h-5"></i>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="lg:col-span-4 space-y-10">
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-stone-700">生產力</h2>
                                <button onClick={() => handleAdd('wf')} className="text-stone-400 hover:text-stone-700"><i data-lucide="plus-circle" className="w-5 h-5"></i></button>
                            </div>
                            <div ref={workflowRef} className="grid grid-cols-2 gap-3">
                                {workflowTools.map((tool) => (
                                    <div key={tool.id} data-id={tool.id} className="group relative">
                                        <button onClick={(e) => handleDelete('wf', tool.id, e)} className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm">
                                            <i data-lucide="x" className="w-2 h-2"></i>
                                        </button>
                                        <a href={tool.url} target="_blank" className={`flex flex-col items-center justify-center p-5 ${tool.bgColor || 'bg-white border-stone-200'} rounded-[2rem] border transition-all h-full text-center`}>
                                            <i data-lucide={tool.icon} className="w-4 h-4 mb-2"></i>
                                            <span className="font-bold text-[13px]">{tool.name}</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-stone-700">媒體製作</h2>
                                <button onClick={() => handleAdd('md')} className="text-stone-400 hover:text-stone-700"><i data-lucide="plus-circle" className="w-5 h-5"></i></button>
                            </div>
                            <div ref={mediaRef} className="grid grid-cols-2 gap-3">
                                {mediaTools.map((tool) => (
                                    <div key={tool.id} data-id={tool.id} className="group relative">
                                        <button onClick={(e) => handleDelete('md', tool.id, e)} className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm">
                                            <i data-lucide="x" className="w-2 h-2"></i>
                                        </button>
                                        <a href={tool.url} target="_blank" className={`flex flex-col items-center justify-center p-5 ${tool.bgColor || 'bg-white border-stone-200'} rounded-[2rem] border transition-all h-full text-center`}>
                                            <i data-lucide={tool.icon} className="w-4 h-4 mb-2"></i>
                                            <span className="font-bold text-[13px]">{tool.name}</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
