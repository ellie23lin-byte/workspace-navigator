// 1. Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
  authDomain: "my-studio-dashboard.firebaseapp.com",
  projectId: "my-studio-dashboard",
  storageBucket: "my-studio-dashboard.firebasestorage.app",
  messagingSenderId: "219057281896",
  appId: "1:219057281896:web:63304825302437231754dd"
};

// 2. 初始化 Firebase (確保只初始化一次)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// 3. 定義常數與輔助函式
const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order';

const { useState, useEffect, useRef } = React;

const saveOrder = (type, order) => {
    db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
        [type]: order
    }, { merge: true })
    .then(() => console.log(`${type} order saved.`))
    .catch((error) => console.error(`Error saving ${type}: `, error));
};

const reorderTools = (tools, order) => {
    if (!order || order.length === 0) return tools;
    const map = new Map(tools.map(tool => [tool.id, tool]));
    return order.map(id => map.get(id)).filter(tool => tool);
};

// 4. 主程式元件
const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const aiRef = useRef(null);
    const workflowRef = useRef(null);
    const mediaRef = useRef(null);

    // 工具原始資料
    const initialAiTools = [
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
    ];
    
    const initialWorkflowTools = [
        { id: 'wf-1', name: 'n8n', category: '自動化', url: 'https://n8n.io', icon: 'infinity', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
        { id: 'wf-2', name: 'Make', category: '自動化', url: 'https://www.make.com', icon: 'zap', bgColor: 'bg-violet-50 border-violet-100 text-violet-600' },
        { id: 'wf-3', name: 'Vercel', category: '部署', url: 'https://vercel.com', icon: 'layout', bgColor: 'bg-slate-100 border-slate-200 text-slate-700' },
        { id: 'wf-4', name: 'GAS', category: '腳本', url: 'https://script.google.com', icon: 'file-code', bgColor: 'bg-amber-50 border-amber-100 text-amber-600' },
        { id: 'wf-5', name: 'Wix Studio', category: '專業開發', url: 'https://www.wix.com/studio', icon: 'monitor', bgColor: 'bg-blue-50 border-blue-100 text-blue-600' },
        { id: 'wf-6', name: 'Wix', category: '架站', url: 'https://www.wix.com', icon: 'globe', bgColor: 'bg-sky-50 border-sky-100 text-sky-600' },
        { id: 'wf-7', name: 'Notion', category: '協作', url: 'https://www.notion.so', icon: 'book-open', bgColor: 'bg-stone-100 border-stone-200 text-stone-600' },
        { id: 'wf-8', name: 'GitHub', category: '代碼', url: 'https://github.com', icon: 'code-2', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
    ];

    const initialMediaTools = [
        { id: 'md-1', name: 'CapCut', category: '剪輯', url: 'https://www.capcut.com', icon: 'video', bgColor: 'bg-cyan-50 border-cyan-100 text-cyan-600' },
        { id: 'md-2', name: 'Canva', category: '設計', url: 'https://www.canva.com', icon: 'pen-tool', bgColor: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600' },
        { id: 'md-3', name: 'Remove.bg', category: '去背', url: 'https://www.remove.bg', icon: 'scissors', bgColor: 'bg-lime-50 border-lime-100 text-lime-600' },
        { id: 'md-4', name: 'Stable Audio', category: '音效', url: 'https://stableaudio.com', icon: 'audio-lines', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
        { id: 'md-5', name: 'Soundtrap', category: '音樂', url: 'https://www.soundtrap.com', icon: 'waves', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
        { id: 'md-6', name: 'Suno', category: '歌曲', url: 'https://suno.com', icon: 'music', bgColor: 'bg-orange-50 border-orange-100 text-orange-600' },
    ];

    const [aiTools, setAiTools] = useState(initialAiTools);
    const [workflowTools, setWorkflowTools] = useState(initialWorkflowTools);
    const [mediaTools, setMediaTools] = useState(initialMediaTools);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 100, behavior: "smooth" });
        }
    };

    useEffect(() => {
        // 從 Firestore 讀取排序
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data.ai) setAiTools(reorderTools(initialAiTools, data.ai));
                if (data.workflow) setWorkflowTools(reorderTools(initialWorkflowTools, data.workflow));
                if (data.media) setMediaTools(reorderTools(initialMediaTools, data.media));
            }
        });

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        // 初始化拖拉功能
        const initSortable = (ref, type, setTools, sourceTools) => {
            if (ref.current) {
                Sortable.create(ref.current, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    onEnd: (evt) => {
                        const newOrder = Array.from(evt.to.children).map(el => el.dataset.id);
                        const updatedTools = reorderTools(sourceTools, newOrder);
                        setTools(updatedTools);
                        saveOrder(type, newOrder);
                        setTimeout(() => lucide.createIcons(), 0);
                    }
                });
            }
        };

        initSortable(aiRef, 'ai', setAiTools, initialAiTools);
        initSortable(workflowRef, 'workflow', setWorkflowTools, initialWorkflowTools);
        initSortable(mediaRef, 'media', setMediaTools, initialMediaTools);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        lucide.createIcons();
    }, [aiTools, workflowTools, mediaTools]);

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#E8E6D9] rounded-2xl flex items-center justify-center text-stone-600 shadow-inner">
                            <i data-lucide="zap" className="w-5 h-5"></i>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-stone-700 leading-none">Studio</h1>
                            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-1">Workspace</p>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center space-x-6 border-l border-stone-200 pl-8">
                        <button onClick={() => scrollToSection('ai-tools')} className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-widest">AI 思考</button>
                        <button onClick={() => scrollToSection('productivity-tools')} className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-widest">生產力</button>
                        <button onClick={() => scrollToSection('media-tools')} className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-widest">影音媒體</button>
                    </nav>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-2 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                        <i data-lucide="grip-vertical" className="w-3 h-3 text-stone-400"></i>
                        <span className="text-[10px] text-stone-500 font-bold uppercase">全區拖拉排序中</span>
                    </div>
                    <div className="flex items-center space-x-4 bg-white/50 px-5 py-2 rounded-2xl border border-stone-200 shadow-sm">
                        <i data-lucide="clock" className="w-4 h-4 text-stone-400"></i>
                        <span className="font-mono text-sm font-semibold text-stone-600">
                            {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* AI 區塊 */}
                    <section id="ai-tools" className="lg:col-span-8 scroll-mt-24">
                        <div className="flex items-center space-x-3 mb-8">
                            <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                                <i data-lucide="brain-circuit" className="w-4 h-4 text-stone-600"></i>
                            </span>
                            <h2 className="text-xl font-bold text-stone-700">AI 思考工具</h2>
                        </div>
                        <div ref={aiRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiTools.map((tool) => (
                                <div key={tool.id} data-id={tool.id} className="group relative cursor-grab active:cursor-grabbing p-5 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-4 rounded-2xl ${tool.color} border shadow-sm`}>
                                            <i data-lucide={tool.icon} className="w-5 h-5"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-stone-800 truncate">{tool.name}</h3>
                                            <p className="text-stone-400 text-xs font-medium mt-0.5 truncate">{tool.desc}</p>
                                        </div>
                                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-50 rounded-full text-stone-300 hover:text-stone-600 hover:bg-stone-100" onClick={(e) => e.stopPropagation()}>
                                            <i data-lucide="arrow-up-right" className="w-5 h-5"></i>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="lg:col-span-4 space-y-10">
                        {/* 生產力 */}
                        <section id="productivity-tools" className="scroll-mt-24">
                            <div className="flex items-center space-x-3 mb-6">
                                <i data-lucide="rocket" className="w-5 h-5 text-stone-400"></i>
                                <h2 className="text-lg font-bold text-stone-700">生產力工具</h2>
                            </div>
                            <div ref={workflowRef} className="grid grid-cols-2 gap-3">
                                {workflowTools.map((tool) => (
                                    <div key={tool.id} data-id={tool.id} className="cursor-grab active:cursor-grabbing">
                                        <a href={tool.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`flex flex-col items-center justify-center p-5 ${tool.bgColor} rounded-[2rem] border transition-all active:scale-95 group shadow-sm hover:shadow-md h-full`}>
                                            <i data-lucide={tool.icon} className="w-4 h-4 mb-2 transition-transform group-hover:scale-110"></i>
                                            <span className="font-bold text-[13px] leading-tight text-center">{tool.name}</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 影音媒體 */}
                        <section id="media-tools" className="scroll-mt-24">
                            <div className="flex items-center space-x-3 mb-6">
                                <i data-lucide="video" className="w-5 h-5 text-stone-400"></i>
                                <h2 className="text-lg font-bold text-stone-700">影音媒體製作</h2>
                            </div>
                            <div ref={mediaRef} className="grid grid-cols-2 gap-3">
                                {mediaTools.map((tool) => (
                                    <div key={tool.id} data-id={tool.id} className="cursor-grab active:cursor-grabbing">
                                        <a href={tool.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`flex flex-col items-center justify-center p-5 ${tool.bgColor} rounded-[2rem] border transition-all active:scale-95 group shadow-sm hover:shadow-md h-full`}>
                                            <i data-lucide={tool.icon} className="w-4 h-4 mb-2 transition-transform group-hover:scale-110"></i>
                                            <span className="font-bold text-[13px] leading-tight text-center">{tool.name}</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            <footer className="text-center py-12 text-stone-300 text-[10px] font-black uppercase tracking-[0.3em]">
                Beige Studio &bull; Creative Workflow 2025
            </footer>
        </div>
    );
};

// 渲染
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
