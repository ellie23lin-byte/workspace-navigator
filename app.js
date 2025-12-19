// 1. Firebase 配置
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

// 關鍵設定：增加超時處理與長輪詢，避免 GitHub Pages 阻擋連線
db.settings({ 
    experimentalForceLongPolling: true,
    merge: true 
});

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_stable'; // 更換 ID 避免舊緩存干擾

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // 原始預設工具清單 (絕對不能刪除，作為回退機制)
    const initialData = {
        ai: [
            { id: 'ai-1', name: 'Manus', desc: '通用型 AI Agent 代理人', icon: 'bot', url: 'https://manus.ai', color: 'bg-stone-800 text-white border-stone-900' },
            { id: 'ai-2', name: 'Gemini', desc: 'Google 多模態核心模型', icon: 'sparkles', url: 'https://gemini.google.com', color: 'bg-blue-100 text-blue-600 border-blue-200' },
            { id: 'ai-3', name: 'Gamma', desc: 'AI 簡報、網頁、文件生成', icon: 'presentation', url: 'https://gamma.app', color: 'bg-purple-100 text-purple-600 border-purple-200' },
            { id: 'ai-4', name: 'NotebookLM', desc: 'AI 智慧筆記與文獻分析', icon: 'book-open', url: 'https://notebooklm.google.com', color: 'bg-teal-100 text-teal-600 border-teal-200' },
            { id: 'ai-5', name: 'AI Studio', desc: 'Google AI 開發者工具', icon: 'terminal', url: 'https://aistudio.google.com', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
            { id: 'ai-6', name: 'ChatGPT', desc: '全能對話生產力助手', icon: 'message-square', url: 'https://chat.openai.com', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
            { id: 'ai-7', name: 'Claude', desc: '精準文案與邏輯推理', icon: 'brain-circuit', url: 'https://claude.ai', color: 'bg-orange-100 text-orange-600 border-orange-200' },
            { id: 'ai-8', name: 'DeepL', desc: '全球最精準的 AI 翻譯', icon: 'languages', url: 'https://www.deepl.com', color: 'bg-blue-50 text-blue-800 border-blue-100' },
            { id: 'ai-9', name: 'Perplexity', desc: 'AI 驅動的知識搜尋引擎', icon: 'zap', url: 'https://www.perplexity.ai', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
            { id: 'ai-10', name: 'Leonardo', desc: '創意影像生成與畫質提升', icon: 'image', url: 'https://leonardo.ai', color: 'bg-amber-100 text-amber-700 border-amber-200' },
        ],
        workflow: [
            { id: 'wf-1', name: 'n8n', category: '自動化', url: 'https://n8n.io', icon: 'infinity', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
            { id: 'wf-2', name: 'Make', category: '自動化', url: 'https://www.make.com', icon: 'zap', bgColor: 'bg-violet-50 border-violet-100 text-violet-600' },
            { id: 'wf-3', name: 'Vercel', category: '部署', url: 'https://vercel.com', icon: 'layout', bgColor: 'bg-slate-100 border-slate-200 text-slate-700' },
            { id: 'wf-4', name: 'GAS', category: '腳本', url: 'https://script.google.com', icon: 'file-code', bgColor: 'bg-amber-50 border-amber-100 text-amber-600' },
            { id: 'wf-5', name: 'Wix Studio', category: '專業開發', url: 'https://www.wix.com/studio', icon: 'monitor', bgColor: 'bg-blue-50 border-blue-100 text-blue-600' },
            { id: 'wf-6', name: 'Wix', category: '架站', url: 'https://www.wix.com', icon: 'globe', bgColor: 'bg-sky-50 border-sky-100 text-sky-600' },
            { id: 'wf-7', name: 'Notion', category: '協作', url: 'https://www.notion.so', icon: 'book-open', bgColor: 'bg-stone-100 border-stone-200 text-stone-600' },
            { id: 'wf-8', name: 'GitHub', category: '代碼', url: 'https://github.com', icon: 'code-2', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
        ],
        media: [
            { id: 'md-1', name: 'CapCut', category: '剪輯', url: 'https://www.capcut.com', icon: 'video', bgColor: 'bg-cyan-50 border-cyan-100 text-cyan-600' },
            { id: 'md-2', name: 'Canva', category: '設計', url: 'https://www.canva.com', icon: 'pen-tool', bgColor: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600' },
            { id: 'md-3', name: 'Remove.bg', category: '去背', url: 'https://www.remove.bg', icon: 'scissors', bgColor: 'bg-lime-50 border-lime-100 text-lime-600' },
            { id: 'md-4', name: 'Stable Audio', category: '音效', url: 'https://stableaudio.com', icon: 'audio-lines', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
            { id: 'md-5', name: 'Soundtrap', category: '音樂', url: 'https://www.soundtrap.com', icon: 'waves', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
            { id: 'md-6', name: 'Suno', category: '歌曲', url: 'https://suno.com', icon: 'music', bgColor: 'bg-orange-50 border-orange-100 text-orange-600' },
        ]
    };

    const [aiTools, setAiTools] = useState(initialData.ai);
    const [workflowTools, setWorkflowTools] = useState(initialData.workflow);
    const [mediaTools, setMediaTools] = useState(initialData.media);

    const aiRef = useRef(null);
    const workflowRef = useRef(null);
    const mediaRef = useRef(null);

    // 儲存至 Firebase (增加防錯)
    const syncToFirebase = (ai, wf, md) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ai, workflow: wf, media: md,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => console.log("✅ Sync Success")).catch(e => console.error("❌ Sync Error", e));
    };

    // 初始化讀取
    useEffect(() => {
        const loadData = async () => {
            try {
                // 設定 5 秒超時，如果 Firebase 沒反應就用預設值
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
                const fetchDoc = db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                
                const doc = await Promise.race([fetchDoc, timeout]);
                
                if (doc.exists && doc.data().ai) {
                    const data = doc.data();
                    setAiTools(data.ai);
                    setWorkflowTools(data.workflow);
                    setMediaTools(data.media);
                    console.log("📂 Data loaded from Firebase");
                }
            } catch (err) {
                console.warn("⚠️ Firebase load failed, using local defaults", err);
            } finally {
                setLoading(false);
                setTimeout(() => lucide.createIcons(), 100);
            }
        };

        loadData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 拖拉排序
    useEffect(() => {
        if (loading) return;
        const setupSortable = (ref, type) => {
            if (!ref.current) return;
            Sortable.create(ref.current, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: () => {
                    const newIds = Array.from(ref.current.children).map(el => el.dataset.id);
                    if (type === 'ai') {
                        setAiTools(prev => {
                            const next = newIds.map(id => prev.find(t => t.id === id)).filter(Boolean);
                            syncToFirebase(next, workflowTools, mediaTools);
                            return next;
                        });
                    } else if (type === 'wf') {
                        setWorkflowTools(prev => {
                            const next = newIds.map(id => prev.find(t => t.id === id)).filter(Boolean);
                            syncToFirebase(aiTools, next, mediaTools);
                            return next;
                        });
                    } else {
                        setMediaTools(prev => {
                            const next = newIds.map(id => prev.find(t => t.id === id)).filter(Boolean);
                            syncToFirebase(aiTools, workflowTools, next);
                            return next;
                        });
                    }
                }
            });
        };
        setupSortable(aiRef, 'ai'); setupSortable(workflowRef, 'wf'); setupSortable(mediaRef, 'md');
    }, [loading]);

    // 管理功能：新增
    const handleAdd = (type) => {
        const name = prompt("工具名稱:");
        const url = prompt("網址 (https://...):");
        if (!name || !url) return;

        const newTool = {
            id: `${type}-${Date.now()}`,
            name, url, desc: "自定義工具", icon: "link",
            color: type === 'ai' ? "bg-white text-stone-600 border-stone-200" : "",
            bgColor: type !== 'ai' ? "bg-stone-50 border-stone-100 text-stone-600" : ""
        };

        if (type === 'ai') {
            const next = [...aiTools, newTool]; setAiTools(next); syncToFirebase(next, workflowTools, mediaTools);
        } else if (type === 'wf') {
            const next = [...workflowTools, newTool]; setWorkflowTools(next); syncToFirebase(aiTools, next, mediaTools);
        } else {
            const next = [...mediaTools, newTool]; setMediaTools(next); syncToFirebase(aiTools, workflowTools, next);
        }
    };

    // 管理功能：刪除
    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定要刪除嗎？")) return;
        if (type === 'ai') {
            const next = aiTools.filter(t => t.id !== id); setAiTools(next); syncToFirebase(next, workflowTools, mediaTools);
        } else if (type === 'wf') {
            const next = workflowTools.filter(t => t.id !== id); setWorkflowTools(next); syncToFirebase(aiTools, next, mediaTools);
        } else {
            const next = mediaTools.filter(t => t.id !== id); setMediaTools(next); syncToFirebase(aiTools, workflowTools, next);
        }
    };

    useEffect(() => { lucide.createIcons(); }, [aiTools, workflowTools, mediaTools]);

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-white">
                        <i data-lucide="zap" className="w-5 h-5"></i>
                    </div>
                    <h1 className="text-lg font-bold text-stone-700">Studio Navigator</h1>
                </div>
                <div className="font-mono text-sm bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
                    {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* AI Tools */}
                    <div className="lg:col-span-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-stone-700 flex items-center gap-2"><i data-lucide="brain"></i> AI思考</h2>
                            <button onClick={() => handleAdd('ai')} className="p-2 hover:bg-stone-200 rounded-full"><i data-lucide="plus"></i></button>
                        </div>
                        <div ref={aiRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiTools.map(tool => (
                                <div key={tool.id} data-id={tool.id} className="group relative p-5 bg-white border border-stone-200 rounded-[2rem] hover:shadow-lg transition-all cursor-grab active:cursor-grabbing">
                                    <button onClick={(e) => handleDelete('ai', tool.id, e)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i data-lucide="x" className="w-3 h-3"></i></button>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${tool.color} border`}><i data-lucide={tool.icon} className="w-5 h-5"></i></div>
                                        <div className="flex-1 truncate">
                                            <h3 className="font-bold text-stone-800 truncate">{tool.name}</h3>
                                            <p className="text-stone-400 text-xs truncate">{tool.desc}</p>
                                        </div>
                                        <a href={tool.url} target="_blank" className="text-stone-300 hover:text-stone-600"><i data-lucide="external-link"></i></a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-10">
                        {['workflow', 'media'].map(type => (
                            <section key={type}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-stone-700 uppercase tracking-widest">{type === 'workflow' ? '生產力' : '影音媒體'}</h2>
                                    <button onClick={() => handleAdd(type === 'workflow' ? 'wf' : 'md')} className="p-1 hover:text-stone-800 text-stone-400"><i data-lucide="plus-circle"></i></button>
                                </div>
                                <div ref={type === 'workflow' ? workflowRef : mediaRef} className="grid grid-cols-2 gap-3">
                                    {(type === 'workflow' ? workflowTools : mediaTools).map(tool => (
                                        <div key={tool.id} data-id={tool.id} className="group relative">
                                            <button onClick={(e) => handleDelete(type === 'workflow' ? 'wf' : 'md', tool.id, e)} className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><i data-lucide="x" className="w-2 h-2"></i></button>
                                            <a href={tool.url} target="_blank" className={`flex flex-
