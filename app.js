// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v21_final'; 
const DATA_VERSION = "20251222_v1"; // 用於強制更新舊資料

const { useState, useEffect, useRef } = React;

const initialData = {
    version: DATA_VERSION,
    ai: [
        { id: 'ai-1', name: 'Manus', desc: '通用型 AI Agent 代理人', url: 'https://manus.ai', color: 'bg-stone-800 text-white' },
        { id: 'ai-2', name: 'Gemini', desc: 'Google 多模態核心模型', url: 'https://gemini.google.com', color: 'bg-blue-100 text-blue-600' },
        { id: 'ai-3', name: 'Gamma', desc: 'AI 簡報、網頁、文件生成', url: 'https://gamma.app', color: 'bg-purple-100 text-purple-600' },
        { id: 'ai-4', name: 'NotebookLM', desc: 'AI 智慧筆記與文獻分析', url: 'https://notebooklm.google.com', color: 'bg-teal-100 text-teal-600' },
        { id: 'ai-5', name: 'AI Studio', desc: 'Google AI 開發者工具', url: 'https://aistudio.google.com', color: 'bg-indigo-100 text-indigo-600' },
        { id: 'ai-6', name: 'ChatGPT', desc: '全能對話生產力助手', url: 'https://chat.openai.com', color: 'bg-emerald-100 text-emerald-600' },
        { id: 'ai-7', name: 'Claude', desc: '精準文案與邏輯推理', url: 'https://claude.ai', color: 'bg-orange-100 text-orange-600' },
        { id: 'ai-8', name: 'DeepL', desc: '全球最精準的 AI 翻譯', url: 'https://www.deepl.com', color: 'bg-blue-50 text-blue-800' },
        { id: 'ai-9', name: 'Perplexity', desc: 'AI 驅動的知識搜尋引擎', url: 'https://www.perplexity.ai', color: 'bg-cyan-100 text-cyan-600' },
        { id: 'ai-10', name: 'Leonardo', desc: '創意影像生成與畫質提升', url: 'https://leonardo.ai', color: 'bg-amber-100 text-amber-700' },
    ],
    workflow: [
        { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', color: 'bg-rose-50 text-rose-600' },
        { id: 'wf-2', name: 'Make', url: 'https://www.make.com', color: 'bg-violet-50 text-violet-600' },
        { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', color: 'bg-slate-100 text-slate-700' },
        { id: 'wf-4', name: 'GAS', url: 'https://script.google.com', color: 'bg-amber-50 text-amber-600' },
        { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', color: 'bg-blue-50 text-blue-600' },
        { id: 'wf-6', name: 'Wix', url: 'https://www.wix.com', color: 'bg-sky-50 text-sky-600' },
        { id: 'wf-7', name: 'GitHub', url: 'https://github.com', color: 'bg-gray-100 text-gray-800' }
    ],
    design: [
        { id: 'ds-1', name: 'Figma', url: 'https://www.figma.com', color: 'bg-orange-50 text-orange-500' },
        { id: 'ds-2', name: 'Spline', url: 'https://spline.design', color: 'bg-indigo-50 text-indigo-500' },
        { id: 'ds-3', name: 'Pinterest', url: 'https://www.pinterest.com', color: 'bg-red-50 text-red-500' },
        { id: 'ds-4', name: 'Dribbble', url: 'https://dribbble.com', color: 'bg-pink-50 text-pink-500' },
        { id: 'ds-5', name: 'Behance', url: 'https://www.behance.net', color: 'bg-blue-50 text-blue-500' },
        { id: 'ds-6', name: 'Coolors', url: 'https://coolors.co', color: 'bg-teal-50 text-teal-500' },
        { id: 'ds-7', name: 'Adobe Color', url: 'https://color.adobe.com', color: 'bg-yellow-50 text-yellow-600' },
        { id: 'ds-8', name: 'Fontjoy', url: 'https://fontjoy.com', color: 'bg-lime-50 text-lime-600' },
        { id: 'ds-9', name: 'Google Fonts', url: 'https://fonts.google.com', color: 'bg-green-50 text-green-600' },
        { id: 'ds-10', name: 'Lucide', url: 'https://lucide.dev', color: 'bg-cyan-50 text-cyan-600' }
    ],
    media: [
        { id: 'md-1', name: 'Midjourney', url: 'https://www.midjourney.com', color: 'bg-violet-100 text-violet-700' },
        { id: 'md-2', name: 'Runway', url: 'https://runwayml.com', color: 'bg-pink-100 text-pink-700' },
        { id: 'md-3', name: 'Pika', url: 'https://pika.art', color: 'bg-fuchsia-100 text-fuchsia-700' },
        { id: 'md-4', name: 'Luma', url: 'https://lumalabs.ai', color: 'bg-purple-100 text-purple-700' },
        { id: 'md-5', name: 'Krea', url: 'https://www.krea.ai', color: 'bg-sky-100 text-sky-700' },
        { id: 'md-6', name: 'Unsplash', url: 'https://unsplash.com', color: 'bg-slate-100 text-slate-700' },
        { id: 'md-7', name: 'Freepik', url: 'https://www.freepik.com', color: 'bg-cyan-100 text-cyan-700' },
        { id: 'md-8', name: 'Icons8', url: 'https://icons8.com', color: 'bg-emerald-100 text-emerald-700' },
        { id: 'md-9', name: 'Envato Elements', url: 'https://elements.envato.com', color: 'bg-lime-100 text-lime-700' },
        { id: 'md-10', name: 'YouTube', url: 'https://youtube.com', color: 'bg-red-100 text-red-700' }
    ]
};

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState(initialData);

    const sectionRefs = {
        ai: useRef(null), workflow: useRef(null), design: useRef(null), media: useRef(null)
    };
    
    const stateRef = useRef(initialData);
    const sortableInstances = useRef([]);

    const getLogo = (url) => {
        try { return `https://www.google.com/s2/favicons?sz=64&domain=${new URL(url).hostname}`; }
        catch (e) { return `https://www.google.com/s2/favicons?sz=64&domain=google.com`; }
    };

    const syncToFirebase = (data) => {
        if (!db) return;
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ...data,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(err => console.error("Sync Error:", err));
    };

    useEffect(() => { stateRef.current = tools; }, [tools]);

    useEffect(() => {
        const loadData = async () => {
            if (db) {
                try {
                    const doc = await db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get();
                    if (doc.exists) {
                        const cloudData = doc.data();
                        // 檢查版本，如果雲端沒有 version 或版本過舊，則使用 initialData 並更新雲端
                        if (!cloudData.version || cloudData.version !== DATA_VERSION) {
                            setTools(initialData);
                            syncToFirebase(initialData);
                        } else {
                            setTools(cloudData);
                        }
                    } else {
                        setTools(initialData);
                        syncToFirebase(initialData);
                    }
                } catch (e) {
                    setTools(initialData);
                }
            }
            setLoading(false);
        };

        loadData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (loading || typeof Sortable === 'undefined') return;

        // 清除舊實例
        sortableInstances.current.forEach(ins => ins && ins.destroy());
        sortableInstances.current = [];

        const initSortable = (type) => {
            const el = sectionRefs[type].current;
            if (!el) return; // 報錯核心修正：確保元素存在

            const ins = Sortable.create(el, {
                animation: 200, delay: 50,
                onEnd: (evt) => {
                    const { oldIndex, newIndex, from } = evt;
                    if (oldIndex === newIndex) return;

                    const newTools = { ...stateRef.current };
                    const currentList = [...newTools[type]];
                    const [movedItem] = currentList.splice(oldIndex, 1);
                    currentList.splice(newIndex, 0, movedItem);
                    newTools[type] = currentList;

                    setTools(newTools);
                    syncToFirebase(newTools);
                }
            });
            sortableInstances.current.push(ins);
        };

        ['ai', 'workflow', 'design', 'media'].forEach(initSortable);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        return () => sortableInstances.current.forEach(ins => ins && ins.destroy());
    }, [loading, tools.ai.length, tools.design.length]);

    const ToolButton = ({ tool, type }) => (
        <div key={tool.id} data-id={tool.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
            <a href={tool.url} target="_blank" className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                <div className={`w-10 h-10 shrink-0 rounded-xl ${tool.color || 'bg-stone-100'} flex items-center justify-center border border-stone-100 shadow-sm overflow-hidden p-1.5`}>
                    <img src={getLogo(tool.url)} className="w-full h-full object-contain" alt="icon" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-stone-800 text-sm truncate">{tool.name}</h3>
                    <p className="text-[9px] text-stone-400 font-bold uppercase truncate">{tool.desc || 'Tool'}</p>
                </div>
            </a>
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400 bg-[#FDFCF5]">RESTORING WORKSPACE...</div>;

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-10">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                        <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center shadow-lg"><i data-lucide="zap" className="w-5 h-5 text-white"></i></div>
                        <h1 className="text-xl font-bold text-stone-700 tracking-tight">Studio Navigator</h1>
                    </div>
                </div>
                <div className="font-mono text-xs font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 text-stone-500 shadow-sm">
                    {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 space-y-16">
                <section>
                    <div className="mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="brain" className="w-4 h-4"></i> AI Intelligence</h2></div>
                    <div ref={sectionRefs.ai} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{tools.ai.map(t=><ToolButton key={t.id} tool={t} type="ai"/>)}</div>
                </section>
                <section>
                    <div className="mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="rocket" className="w-4 h-4"></i> Workflow</h2></div>
                    <div ref={sectionRefs.workflow} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{tools.workflow.map(t=><ToolButton key={t.id} tool={t} type="workflow"/>)}</div>
                </section>
                <section>
                    <div className="mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="palette" className="w-4 h-4"></i> Design Resources</h2></div>
                    <div ref={sectionRefs.design} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{tools.design.map(t=><ToolButton key={t.id} tool={t} type="design"/>)}</div>
                </section>
                <section>
                    <div className="mb-6 border-b border-stone-200 pb-4"><h2 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.3em] flex items-center gap-3"><i data-lucide="video" className="w-4 h-4"></i> Creative Media</h2></div>
                    <div ref={sectionRefs.media} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{tools.media.map(t=><ToolButton key={t.id} tool={t} type="media"/>)}</div>
                </section>
            </main>
        </div>
    );
};

const rootEl = document.getElementById('root');
if (rootEl) {
    ReactDOM.createRoot(rootEl).render(React.createElement(App));
}
