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
const DOCUMENT_ID = 'user_tool_order_v8_ultimate'; // 再次更新 ID 確保所有按鈕清單重置載入

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // 完整保留並擴充工具清單
    const initialData = {
        ai: [
            { id: 'ai-1', name: 'Manus', desc: '通用型 AI Agent 代理人', icon: 'bot', url: 'https://manus.ai', color: 'bg-stone-800 text-white border-stone-900' },
            { id: 'ai-2', name: 'Gemini', desc: 'Google 多模態核心模型', icon: 'sparkles', url: 'https://gemini.google.com', color: 'bg-blue-100 text-blue-600 border-blue-200' },
            { id: 'ai-6', name: 'ChatGPT', desc: '全能對話生產力助手', icon: 'message-square', url: 'https://chat.openai.com', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
            { id: 'ai-7', name: 'Claude', desc: '精準文案與邏輯推理', icon: 'brain-circuit', url: 'https://claude.ai', color: 'bg-orange-100 text-orange-600 border-orange-200' },
            { id: 'ai-9', name: 'Perplexity', desc: 'AI 驅動的知識搜尋引擎', icon: 'search', url: 'https://www.perplexity.ai', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
            { id: 'ai-3', name: 'Gamma', desc: 'AI 簡報、網頁、文件生成', icon: 'presentation', url: 'https://gamma.app', color: 'bg-purple-100 text-purple-600 border-purple-200' },
            { id: 'ai-4', name: 'NotebookLM', desc: 'AI 智慧筆記分析', icon: 'book-open', url: 'https://notebooklm.google.com', color: 'bg-teal-100 text-teal-600 border-teal-200' },
            { id: 'ai-11', name: 'v0.dev', desc: 'Vercel 生成式 UI 開發', icon: 'code', url: 'https://v0.dev', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
            { id: 'ai-12', name: 'Kimi', desc: '超長文本分析專家', icon: 'align-left', url: 'https://kimi.moonshot.cn', color: 'bg-green-100 text-green-600 border-green-200' },
            { id: 'ai-10', name: 'Leonardo', desc: '創意影像生成', icon: 'image', url: 'https://leonardo.ai', color: 'bg-amber-100 text-amber-700 border-amber-200' },
            { id: 'ai-5', name: 'AI Studio', desc: 'Google 開發者工具', icon: 'terminal', url: 'https://aistudio.google.com', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
            { id: 'ai-8', name: 'DeepL', desc: '全球精準 AI 翻譯', icon: 'languages', url: 'https://www.deepl.com', color: 'bg-blue-50 text-blue-800 border-blue-100' },
        ],
        workflow: [
            { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', icon: 'infinity', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
            { id: 'wf-2', name: 'Make', url: 'https://www.make.com', icon: 'zap', bgColor: 'bg-violet-50 border-violet-100 text-violet-600' },
            { id: 'wf-9', name: 'Linear', url: 'https://linear.app', icon: 'check-circle', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
            { id: 'wf-7', name: 'Notion', url: 'https://www.notion.so', icon: 'book-open', bgColor: 'bg-stone-100 border-stone-200 text-stone-600' },
            { id: 'wf-8', name: 'GitHub', url: 'https://github.com', icon: 'github', bgColor: 'bg-slate-100 border-slate-200 text-slate-700' },
            { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', icon: 'layout', bgColor: 'bg-zinc-50 border-zinc-200 text-zinc-800' },
            { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', icon: 'monitor', bgColor: 'bg-blue-50 border-blue-100 text-blue-600' },
            { id: 'wf-6', name: 'Wix', url: 'https://www.wix.com', icon: 'globe', bgColor: 'bg-sky-50 border-sky-100 text-sky-600' },
            { id: 'wf-4', name: 'GAS', url: 'https://script.google.com', icon: 'file-code', bgColor: 'bg-amber-50 border-amber-100 text-amber-600' },
            { id: 'wf-10', name: 'Arc Boost', url: 'https://arc.net', icon: 'compass', bgColor: 'bg-orange-50 border-orange-100 text-orange-600' },
        ],
        media: [
            { id: 'md-1', name: 'CapCut', url: 'https://www.capcut.com', icon: 'video', bgColor: 'bg-cyan-50 border-cyan-100 text-cyan-600' },
            { id: 'md-7', name: 'Luma AI', url: 'https://lumalabs.ai', icon: 'film', bgColor: 'bg-purple-50 border-purple-100 text-purple-600' },
            { id: 'md-2', name: 'Canva', url: 'https://www.canva.com', icon: 'pen-tool', bgColor: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600' },
            { id: 'md-8', name: 'ElevenLabs', url: 'https://elevenlabs.io', icon: 'mic', bgColor: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
            { id: 'md-6', name: 'Suno', url: 'https://suno.com', icon: 'music', bgColor: 'bg-orange-50 border-orange-100 text-orange-600' },
            { id: 'md-3', name: 'Remove.bg', url: 'https://www.remove.bg', icon: 'scissors', bgColor: 'bg-lime-50 border-lime-100 text-lime-600' },
            { id: 'md-4', name: 'Stable Audio', url: 'https://stableaudio.com', icon: 'audio-lines', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
            { id: 'md-5', name: 'Soundtrap', url: 'https://www.soundtrap.com', icon: 'waves', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
        ]
    };

    const [aiTools, setAiTools] = useState(initialData.ai);
    const [workflowTools, setWorkflowTools] = useState(initialData.workflow);
    const [mediaTools, setMediaTools] = useState(initialData.media);

    const aiRef = useRef(null);
    const workflowRef = useRef(null);
    const mediaRef = useRef(null);

    const syncToFirebase = (ai, wf, md) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ai, workflow: wf, media: md,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.error("Sync Error:", err));
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            window.scrollTo({ top: (elementRect - bodyRect) - offset, behavior: 'smooth' });
        }
    };

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

    useEffect(() => {
        if (loading) return;
        const config = { animation: 200, delay: 200, delayOnTouchOnly: true, ghostClass: 'sortable-ghost' };
        const initSortable = (ref, type, setFunc) => {
            if (!ref.current) return;
            Sortable.create(ref.current, {
                ...config,
                onEnd: () => {
                    const newIds = Array.from(ref.current.children).map(el => el.dataset.id);
                    setFunc(prev => {
                        const next = newIds.map(id => prev.find(t => t.id === id)).filter(Boolean);
                        setTimeout(() => {
                            if (type === 'ai') syncToFirebase(next, workflowTools, mediaTools);
                            if (type === 'wf') syncToFirebase(aiTools, next, mediaTools);
                            if (type === 'md') syncToFirebase(aiTools, workflowTools, next);
                        }, 100);
                        return next;
                    });
                }
            });
        };
        initSortable(aiRef, 'ai', setAiTools);
        initSortable(workflowRef, 'wf', setWorkflowTools);
        initSortable(mediaRef, 'md', setMediaTools);
    }, [loading, aiTools, workflowTools, mediaTools]);

    useEffect(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, [aiTools, workflowTools, mediaTools, loading]);

    const handleAdd = (type) => {
        const name = prompt("工具名稱:");
        const url = prompt("網址 (https://...):");
        if (!name || !url) return;
        const newTool = {
            id: Date.now().toString(),
            name, url, desc: "自定義工具", icon: "link",
            color: "bg-white border-stone-200 text-stone-600",
            bgColor: "bg-white border-stone-200 text-stone-600"
        };
        if (type === 'ai') setAiTools(p => { const n = [...p, newTool]; syncToFirebase(n, workflowTools, mediaTools); return n; });
        if (type === 'wf') setWorkflowTools(p => { const n = [...p, newTool]; syncToFirebase(aiTools, n, mediaTools); return n; });
        if (type === 'md') setMediaTools(p => { const n = [...p, newTool]; syncToFirebase(aiTools, workflowTools, n); return n; });
    };

    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定刪除？")) return;
        if (type === 'ai') setAiTools(p => { const n = p.filter(t => t.id !== id); syncToFirebase(n, workflowTools, mediaTools); return n; });
        if (type === 'wf') setWorkflowTools(p => { const n = p.filter(t => t.id !== id); syncToFirebase(aiTools, n, mediaTools); return n; });
        if (type === 'md') setMediaTools(p => { const n = p.filter(t => t.id !== id); syncToFirebase(aiTools, workflowTools, n); return n; });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400 tracking-widest animate-pulse">SYNCING WORKSPACE...</div>;

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            {/* Header - 功能不變：鎖定置頂、導航菜單 */}
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-10">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                            <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-white shadow-lg"><i data-lucide="zap" className="w-5 h-5"></i></div>
                            <h1 className="text-lg font-bold text-stone-700 tracking-tight hidden md:block">Studio Navigator</h1>
                        </div>
                        <nav className="flex space-x-8">
                            {['AI 思考', '生產力', '影音媒體'].map((label, idx) => (
                                <button key={label} onClick={() => scrollToSection(['ai-sec', 'wf-sec', 'md-sec'][idx])} className="text-[11px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-all">{label}</button>
                            ))}
                        </nav>
                    </div>
                    <div className="font-mono text-xs font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 text-stone-500 shadow-sm">
                        {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                    </div>
                </div>
            </header>

            {/* Main Content - 排版不變：橫向全寬區塊 */}
            <main className="max-w-[1600px] mx-auto px-10 py-12 space-y-24">
                
                {/* 1. AI Section */}
                <section id="ai-sec" className="scroll-mt-28">
                    <div className="flex justify-between items-end mb-10 border-b border-stone-200 pb-5">
                        <div>
                            <h2 className="text-3xl font-black text-stone-800 flex items-center gap-4"><i data-lucide="brain"></i> AI Intelligence</h2>
                            <p className="text-stone-400 text-xs mt-2 font-bold uppercase tracking-[0.2em]">Core Models & Research</p>
                        </div>
                        <button onClick={() => handleAdd('ai')} className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><i data-lucide="plus"></i></button>
                    </div>
                    <div ref={aiRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {aiTools.map(tool => (
                            <div key={tool.id} data-id={tool.id} className="group relative p-6 bg-white border border-stone-200 rounded-[2.5rem] hover:shadow-2xl transition-all cursor-grab active:cursor-grabbing">
                                <button onClick={(e) => handleDelete('ai', tool.id, e)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md z-20 transition-opacity"><i data-lucide="x" className="w-4 h-4"></i></button>
                                <div className="flex flex-col h-full">
                                    <div className={`w-14 h-14 mb-5 rounded-2xl ${tool.color} flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110`}><i data-lucide={tool.icon} className="w-7 h-7"></i></div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-stone-800 text-lg mb-1 truncate">{tool.name}</h3>
                                        <p className="text-stone-400 text-[11px] leading-relaxed font-medium line-clamp-2">{tool.desc}</p>
                                    </div>
                                    <a href={tool.url} target="_blank" className="mt-5 inline-flex items-center text-[10px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest gap-2" onClick={(e) => e.stopPropagation()}>Launch <i data-lucide="arrow-up-right" className="w-3 h-3"></i></a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Workflow Section */}
                <section id="wf-sec" className="scroll-mt-28">
                    <div className="flex justify-between items-end mb-10 border-b border-stone-200 pb-5">
                        <div>
                            <h2 className="text-3xl font-black text-stone-800 flex items-center gap-4"><i data-lucide="rocket"></i> Workflow Automation</h2>
                            <p className="text-stone-400 text-xs mt-2 font-bold uppercase tracking-[0.2em]">Productivity Ecosystem</p>
                        </div>
                        <button onClick={() => handleAdd('wf')} className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><i data-lucide="plus"></i></button>
                    </div>
                    <div ref={workflowRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {workflowTools.map(tool => (
                            <div key={tool.id} data-id={tool.id} className="group relative">
                                <button onClick={(e) => handleDelete('wf', tool.id, e)} className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md transition-opacity"><i data-lucide="x" className="w-4 h-4"></i></button>
                                <a href={tool.url} target="_blank" className={`flex flex-col items-center justify-center p-6 ${tool.bgColor} border border-stone-100 rounded-[2.2rem] hover:shadow-xl transition-all h-44 text-center active:scale-95 group`}>
                                    <i data-lucide={tool.icon} className="mb-4 w-8 h-8 group-hover:scale-125 transition-transform"></i>
                                    <span className="text-sm font-black tracking-tight text-stone-700">{tool.name}</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Media Section */}
                <section id="md-sec" className="scroll-mt-28">
                    <div className="flex justify-between items-end mb-10 border-b border-stone-200 pb-5">
                        <div>
                            <h2 className="text-3xl font-black text-stone-800 flex items-center gap-4"><i data-lucide="video"></i> Creative Media</h2>
                            <p className="text-stone-400 text-xs mt-2 font-bold uppercase tracking-[0.2em]">Visual & Audio Production</p>
                        </div>
                        <button onClick={() => handleAdd('md')} className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><i data-lucide="plus"></i></button>
                    </div>
                    <div ref={mediaRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {mediaTools.map(tool => (
                            <div key={tool.id} data-id={tool.id} className="group relative">
                                <button onClick={(e) => handleDelete('md', tool.id, e)} className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md transition-opacity"><i data-lucide="x" className="w-4 h-4"></i></button>
                                <a href={tool.url} target="_blank" className={`flex flex-col items-center justify-center p-6 ${tool.bgColor} border border-stone-100 rounded-[2.2rem] hover:shadow-xl transition-all h-44 text-center active:scale-95 group`}>
                                    <i data-lucide={tool.icon} className="mb-4 w-8 h-8 group-hover:scale-125 transition-transform"></i>
                                    <span className="text-sm font-black tracking-tight text-stone-700">{tool.name}</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
            <footer className="text-center py-24 border-t border-stone-100 mt-12 bg-white/50">
                <p className="text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">Beige Studio &bull; Creative Workflow Hub &bull; 2025</p>
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
