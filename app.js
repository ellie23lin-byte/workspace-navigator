// 1. Firebase 配置
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
db.settings({ experimentalForceLongPolling: true });

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_stable_v5';

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // 原始數據備援
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
            { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', icon: 'infinity', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
            { id: 'wf-2', name: 'Make', url: 'https://www.make.com', icon: 'zap', bgColor: 'bg-violet-50 border-violet-100 text-violet-600' },
            { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', icon: 'layout', bgColor: 'bg-slate-100 border-slate-200 text-slate-700' },
            { id: 'wf-4', name: 'GAS', url: 'https://script.google.com', icon: 'file-code', bgColor: 'bg-amber-50 border-amber-100 text-amber-600' },
            { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', icon: 'monitor', bgColor: 'bg-blue-50 border-blue-100 text-blue-600' },
            { id: 'wf-6', name: 'Wix', url: 'https://www.wix.com', icon: 'globe', bgColor: 'bg-sky-50 border-sky-100 text-sky-600' },
            { id: 'wf-7', name: 'Notion', url: 'https://www.notion.so', icon: 'book-open', bgColor: 'bg-stone-100 border-stone-200 text-stone-600' },
            { id: 'wf-8', name: 'GitHub', url: 'https://github.com', icon: 'code-2', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
        ],
        media: [
            { id: 'md-1', name: 'CapCut', url: 'https://www.capcut.com', icon: 'video', bgColor: 'bg-cyan-50 border-cyan-100 text-cyan-600' },
            { id: 'md-2', name: 'Canva', url: 'https://www.canva.com', icon: 'pen-tool', bgColor: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600' },
            { id: 'md-3', name: 'Remove.bg', url: 'https://www.remove.bg', icon: 'scissors', bgColor: 'bg-lime-50 border-lime-100 text-lime-600' },
            { id: 'md-4', name: 'Stable Audio', url: 'https://stableaudio.com', icon: 'audio-lines', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
            { id: 'md-5', name: 'Soundtrap', url: 'https://www.soundtrap.com', icon: 'waves', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
            { id: 'md-6', name: 'Suno', url: 'https://suno.com', icon: 'music', bgColor: 'bg-orange-50 border-orange-100 text-orange-600' },
        ]
    };

    const [aiTools, setAiTools] = useState(initialData.ai);
    const [workflowTools, setWorkflowTools] = useState(initialData.workflow);
    const [mediaTools, setMediaTools] = useState(initialData.media);

    const aiRef = useRef(null);
    const workflowRef = useRef(null);
    const mediaRef = useRef(null);

    // 同步函式
    const syncToFirebase = (ai, wf, md) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ai, workflow: wf, media: md,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.error("Sync Error:", err));
    };

    // 捲動函式
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // 扣除 fixed header 高度
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // 讀取初始資料
    useEffect(() => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get().then(doc => {
            if (doc.exists && doc.data().ai) {
                const data = doc.data();
                setAiTools(data.ai);
                setWorkflowTools(data.workflow);
                setMediaTools(data.media);
            }
            setLoading(false);
        }).catch(() => setLoading(false));

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 拖拉初始化 (增加 delay 200ms 以支援滑動)
    useEffect(() => {
        if (loading) return;
        const initSortable = (ref, type, setFunc) => {
            if (!ref.current) return;
            Sortable.create(ref.current, {
                animation: 200,
                delay: 200, // 長按 200ms 才啟動，避免捲動頁面時誤觸
                delayOnTouchOnly: true,
                ghostClass: 'sortable-ghost',
                onEnd: () => {
                    const newIds = Array.from(ref.current.children).map(el => el.dataset.id);
                    setFunc(prev => {
                        const next = newIds.map(id => prev.find(t => t.id === id)).filter(Boolean);
                        // 避免同步執行造成的畫面閃爍，使用 setTimeout
                        setTimeout(() => {
                            if (type === 'ai') syncToFirebase(next, workflowTools, mediaTools);
                            if (type === 'wf') syncToFirebase(aiTools, next, mediaTools);
                            if (type === 'md') syncToFirebase(aiTools, workflowTools, next);
                        }, 50);
                        return next;
                    });
                }
            });
        };
        initSortable(aiRef, 'ai', setAiTools);
        initSortable(workflowRef, 'wf', setWorkflowTools);
        initSortable(mediaRef, 'md', setMediaTools);
    }, [loading]);

    // 更新圖示
    useEffect(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, [aiTools, workflowTools, mediaTools, loading]);

    // 管理功能
    const handleAdd = (type) => {
        const name = prompt("輸入新工具名稱:");
        const url = prompt("輸入網址 (https://...):");
        if (!name || !url) return;
        const newTool = {
            id: Date.now().toString(),
            name, url, desc: "新增工具", icon: "external-link",
            color: "bg-white border-stone-200 text-stone-600",
            bgColor: "bg-white border-stone-200 text-stone-600"
        };
        if (type === 'ai') setAiTools(p => { const n = [...p, newTool]; syncToFirebase(n, workflowTools, mediaTools); return n; });
        if (type === 'wf') setWorkflowTools(p => { const n = [...p, newTool]; syncToFirebase(aiTools, n, mediaTools); return n; });
        if (type === 'md') setMediaTools(p => { const n = [...p, newTool]; syncToFirebase(aiTools, workflowTools, n); return n; });
    };

    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定要刪除這個按鈕嗎？")) return;
        if (type === 'ai') setAiTools(p => { const n = p.filter(t => t.id !== id); syncToFirebase(n, workflowTools, mediaTools); return n; });
        if (type === 'wf') setWorkflowTools(p => { const n = p.filter(t => t.id !== id); syncToFirebase(aiTools, n, mediaTools); return n; });
        if (type === 'md') setMediaTools(p => { const n = p.filter(t => t.id !== id); syncToFirebase(aiTools, workflowTools, n); return n; });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400">LOADING...</div>;

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            {/* 1. Sticky Navigation Bar */}
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-stone-800 rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                                <i data-lucide="zap" className="w-5 h-5"></i>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-base font-bold text-stone-700 leading-none">Studio</h1>
                                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">Workspace</p>
                            </div>
                        </div>
                        {/* 導航選單 */}
                        <nav className="flex items-center space-x-4 md:space-x-8 border-l border-stone-200 pl-6">
                            <button onClick={() => scrollToSection('ai-sec')} className="text-[11px] font-black text-stone-400 hover:text-stone-800 uppercase tracking-tighter md:tracking-widest transition-colors">AI 思考</button>
                            <button onClick={() => scrollToSection('wf-sec')} className="text-[11px] font-black text-stone-400 hover:text-stone-800 uppercase tracking-tighter md:tracking-widest transition-colors">生產力</button>
                            <button onClick={() => scrollToSection('md-sec')} className="text-[11px] font-black text-stone-400 hover:text-stone-800 uppercase tracking-tighter md:tracking-widest transition-colors">影音媒體</button>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="font-mono text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 shadow-sm">
                            {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Main Content (增加手機左右間隔 px-8) */}
            <main className="max-w-7xl mx-auto px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* AI Section */}
                    <div id="ai-sec" className="lg:col-span-8 scroll-mt-24">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-stone-700 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500"><i data-lucide="brain"></i></span>
                                AI 思考工具
                            </h2>
                            <button onClick={() => handleAdd('ai')} className="w-8 h-8 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><i data-lucide="plus" className="w-4 h-4"></i></button>
                        </div>
                        <div ref={aiRef} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {aiTools.map(tool => (
                                <div key={tool.id} data-id={tool.id} className="group relative p-6 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
                                    <button onClick={(e) => handleDelete('ai', tool.id, e)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md z-20 transition-opacity"><i data-lucide="x" className="w-4 h-4"></i></button>
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl ${tool.color} border shadow-inner`}><i data-lucide={tool.icon} className="w-6 h-6"></i></div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-stone-800 truncate text-lg">{tool.name}</h3>
                                            <p className="text-stone-400 text-xs truncate font-medium">{tool.desc}</p>
                                        </div>
                                        <a href={tool.url} target="_blank" className="p-2 text-stone-300 hover:text-stone-600 transition-colors" onClick={(e) => e.stopPropagation()}><i data-lucide="arrow-up-right" className="w-6 h-6"></i></a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Sections */}
                    <div className="lg:col-span-4 space-y-12">
                        {/* Workflow */}
                        <section id="wf-sec" className="scroll-mt-24">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[12px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2"><i data-lucide="rocket" className="w-4 h-4"></i> 生產力</h2>
                                <button onClick={() => handleAdd('wf')} className="text-stone-300 hover:text-stone-800"><i data-lucide="plus-circle" className="w-5 h-5"></i></button>
                            </div>
                            <div ref={workflowRef} className="grid grid-cols-2 gap-4">
                                {workflowTools.map(tool => (
                                    <div key={tool.id} data-id={tool.id} className="group relative">
                                        <button onClick={(e) => handleDelete('wf', tool.id, e)} className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-sm transition-opacity"><i data-lucide="x" className="w-3 h-3"></i></button>
                                        <a href={tool.url} target="_blank" className={`flex flex-col items-center justify-center p-5 ${tool.bgColor} border border-stone-100 rounded-[1.8rem] hover:shadow-lg transition-all h-28 text-center active:scale-95 group`}>
                                            <i data-lucide={tool.icon} className="mb-3 w-5 h-5 group-hover:scale-110 transition-transform"></i>
                                            <span className="text-[13px] font-bold leading-none">{tool.name}</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Media */}
                        <section id="md-sec" className="scroll-mt-24">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[12px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2"><i data-lucide="video" className="w-4 h-4"></i> 影音媒體</h2>
                                <button onClick={() => handleAdd('md')} className="text-stone-300 hover:text-stone-800"><i data-lucide="plus-circle" className="w-5 h-5"></i></button>
                            </div>
                            <div ref={mediaRef} className="grid grid-cols-2 gap-4">
                                {mediaTools.map(tool => (
                                    <div key={tool.id} data-id={tool.id} className="group relative">
                                        <button onClick={(e) => handleDelete('md', tool.id, e)} className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-sm transition-opacity"><i data-lucide="x" className="w-3 h-3"></i></button>
                                        <a href={tool.url} target="_blank" className={`flex flex-col items-center justify-center p-5 ${tool.bgColor} border border-stone-100 rounded-[1.8rem] hover:shadow-lg transition-all h-28 text-center active:scale-95 group`}>
                                            <i data-lucide={tool.icon} className="mb-3 w-5 h-5 group-hover:scale-110 transition-transform"></i>
                                            <span className="text-[13px] font-bold leading-none">{tool.name}</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <footer className="text-center py-12 text-stone-300 text-[10px] font-black uppercase tracking-[0.3em]">
                Beige Studio &bull; Creative Workflow 2025
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
