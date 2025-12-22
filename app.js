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
const DOCUMENT_ID = 'user_tool_order_v9_refined'; 

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const initialData = {
        ai: [
            { id: 'ai-1', name: 'Manus', desc: 'AI Agent', icon: 'bot', url: 'https://manus.ai', color: 'bg-stone-800 text-white border-stone-900' },
            { id: 'ai-2', name: 'Gemini', desc: 'Google AI', icon: 'sparkles', url: 'https://gemini.google.com', color: 'bg-blue-100 text-blue-600 border-blue-200' },
            { id: 'ai-6', name: 'ChatGPT', desc: 'OpenAI', icon: 'message-square', url: 'https://chat.openai.com', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
            { id: 'ai-7', name: 'Claude', desc: 'Anthropic', icon: 'brain-circuit', url: 'https://claude.ai', color: 'bg-orange-100 text-orange-600 border-orange-200' },
            { id: 'ai-9', name: 'Perplexity', desc: 'Search AI', icon: 'search', url: 'https://www.perplexity.ai', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
            { id: 'ai-3', name: 'Gamma', desc: 'AI PPT', icon: 'presentation', url: 'https://gamma.app', color: 'bg-purple-100 text-purple-600 border-purple-200' },
            { id: 'ai-4', name: 'NotebookLM', desc: 'AI Notes', icon: 'book-open', url: 'https://notebooklm.google.com', color: 'bg-teal-100 text-teal-600 border-teal-200' },
            { id: 'ai-11', name: 'v0.dev', desc: 'Vercel UI', icon: 'code', url: 'https://v0.dev', color: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
            { id: 'ai-12', name: 'Kimi', desc: 'Long Text', icon: 'align-left', url: 'https://kimi.moonshot.cn', color: 'bg-green-100 text-green-600 border-green-200' },
            { id: 'ai-10', name: 'Leonardo', desc: 'AI Image', icon: 'image', url: 'https://leonardo.ai', color: 'bg-amber-100 text-amber-700 border-amber-200' },
            { id: 'ai-5', name: 'AI Studio', desc: 'Google Dev', icon: 'terminal', url: 'https://aistudio.google.com', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
            { id: 'ai-8', name: 'DeepL', desc: 'AI Trans', icon: 'languages', url: 'https://www.deepl.com', color: 'bg-blue-50 text-blue-800 border-blue-100' },
        ],
        workflow: [
            { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', icon: 'infinity', bgColor: 'bg-rose-50 border-rose-100 text-rose-600' },
            { id: 'wf-2', name: 'Make', url: 'https://www.make.com', icon: 'zap', bgColor: 'bg-violet-50 border-violet-100 text-violet-600' },
            { id: 'wf-11', name: 'Firebase', url: 'https://console.firebase.google.com', icon: 'flame', bgColor: 'bg-orange-50 border-orange-100 text-orange-600' },
            { id: 'wf-9', name: 'Linear', url: 'https://linear.app', icon: 'check-circle', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-600' },
            { id: 'wf-7', name: 'Notion', url: 'https://www.notion.so', icon: 'book-open', bgColor: 'bg-stone-100 border-stone-200 text-stone-600' },
            { id: 'wf-8', name: 'GitHub', url: 'https://github.com', icon: 'github', bgColor: 'bg-slate-100 border-slate-200 text-slate-700' },
            { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', icon: 'layout', bgColor: 'bg-zinc-50 border-zinc-200 text-zinc-800' },
            { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', icon: 'monitor', bgColor: 'bg-blue-50 border-blue-100 text-blue-600' },
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
        ],
        outputs: [
            { id: 'out-1', name: '工作導航儀', url: '#', icon: 'navigation', bgColor: 'bg-stone-800 text-white' },
            { id: 'out-2', name: '我的 Web CV', url: 'https://my-project-topaz-tau.vercel.app/', icon: 'user-circle', bgColor: 'bg-white border-stone-200 text-stone-700' },
        ]
    };

    const [aiTools, setAiTools] = useState(initialData.ai);
    const [workflowTools, setWorkflowTools] = useState(initialData.workflow);
    const [mediaTools, setMediaTools] = useState(initialData.media);
    const [outputs, setOutputs] = useState(initialData.outputs);

    const aiRef = useRef(null);
    const workflowRef = useRef(null);
    const mediaRef = useRef(null);
    const outputsRef = useRef(null);

    const syncToFirebase = (ai, wf, md, out) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ai, workflow: wf, media: md, outputs: out,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.error("Sync Error:", err));
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get().then(doc => {
            if (doc.exists && doc.data().ai) {
                const data = doc.data();
                setAiTools(data.ai);
                setWorkflowTools(data.workflow);
                setMediaTools(data.media);
                if (data.outputs) setOutputs(data.outputs);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (loading) return;
        const config = { animation: 200, delay: 200, delayOnTouchOnly: true, ghostClass: 'sortable-ghost' };
        const init = (ref, type, setFunc) => {
            if (!ref.current) return;
            Sortable.create(ref.current, {
                ...config,
                onEnd: () => {
                    const newIds = Array.from(ref.current.children).map(el => el.dataset.id);
                    setFunc(prev => {
                        const next = newIds.map(id => prev.find(t => t.id === id)).filter(Boolean);
                        setTimeout(() => syncToFirebase(aiTools, workflowTools, mediaTools, outputs), 100);
                        return next;
                    });
                }
            });
        };
        init(aiRef, 'ai', setAiTools);
        init(workflowRef, 'wf', setWorkflowTools);
        init(mediaRef, 'md', setMediaTools);
        init(outputsRef, 'out', setOutputs);
    }, [loading, aiTools, workflowTools, mediaTools, outputs]);

    useEffect(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, [aiTools, workflowTools, mediaTools, outputs, loading]);

    const handleAdd = (type) => {
        const name = prompt("名稱:");
        const url = prompt("網址:");
        if (!name || !url) return;
        const newTool = { id: Date.now().toString(), name, url, icon: "link", bgColor: "bg-white border-stone-200 text-stone-600" };
        if (type === 'ai') setAiTools(p => [...p, { ...newTool, color: "bg-white text-stone-600 border-stone-200", desc: "Custom" }]);
        if (type === 'wf') setWorkflowTools(p => [...p, newTool]);
        if (type === 'md') setMediaTools(p => [...p, newTool]);
        if (type === 'out') setOutputs(p => [...p, newTool]);
        setTimeout(() => syncToFirebase(aiTools, workflowTools, mediaTools, outputs), 100);
    };

    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定刪除？")) return;
        if (type === 'ai') setAiTools(p => p.filter(t => t.id !== id));
        if (type === 'wf') setWorkflowTools(p => p.filter(t => t.id !== id));
        if (type === 'md') setMediaTools(p => p.filter(t => t.id !== id));
        if (type === 'out') setOutputs(p => p.filter(t => t.id !== id));
        setTimeout(() => syncToFirebase(aiTools, workflowTools, mediaTools, outputs), 100);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-stone-400">PREPARING STUDIO...</div>;

    return (
        <div className="min-h-screen bg-[#FDFCF5]">
            <header className="sticky top-0 z-50 bg-[#FDFCF5]/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-10">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                            <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-white shadow-lg"><i data-lucide="zap" className="w-5 h-5"></i></div>
                            <h1 className="text-xl font-bold text-stone-700 tracking-tight hidden md:block">Studio Navigator</h1>
                        </div>
                        <nav className="flex space-x-8">
                            {['AI 思考', '生產力', '影音媒體', '我的產出'].map((label, idx) => (
                                <button key={label} onClick={() => scrollToSection(['ai-sec', 'wf-sec', 'md-sec', 'out-sec'][idx])} className="text-[11px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-all">{label}</button>
                            ))}
                        </nav>
                    </div>
                    <div className="font-mono text-xs font-bold bg-white px-4 py-2 rounded-xl border border-stone-200 text-stone-500 shadow-sm">
                        {currentTime.toLocaleTimeString('zh-TW', { hour12: false })}
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 py-12 space-y-20">
                
                {/* 1. AI Section - 窄版設計，文字在 Icon 旁 */}
                <section id="ai-sec" className="scroll-mt-28">
                    <div className="flex justify-between items-end mb-8 border-b border-stone-200 pb-4">
                        <h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="brain"></i> AI Intelligence</h2>
                        <button onClick={() => handleAdd('ai')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><i data-lucide="plus"></i></button>
                    </div>
                    <div ref={aiRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {aiTools.map(tool => (
                            <div key={tool.id} data-id={tool.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
                                <button onClick={(e) => handleDelete('ai', tool.id, e)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-20"><i data-lucide="x" className="w-3 h-3"></i></button>
                                <a href={tool.url} target="_blank" className="flex items-center gap-3">
                                    <div className={`w-10 h-10 shrink-0 rounded-xl ${tool.color} flex items-center justify-center border shadow-sm`}><i data-lucide={tool.icon} className="w-5 h-5"></i></div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-stone-800 text-sm truncate">{tool.name}</h3>
                                        <p className="text-[9px] text-stone-400 font-bold uppercase truncate">{tool.desc}</p>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Workflow & Firebase */}
                <section id="wf-sec" className="scroll-mt-28">
                    <div className="flex justify-between items-end mb-8 border-b border-stone-200 pb-4">
                        <h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="rocket"></i> Workflow Automation</h2>
                        <button onClick={() => handleAdd('wf')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><i data-lucide="plus"></i></button>
                    </div>
                    <div ref={workflowRef} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {workflowTools.map(tool => (
                            <div key={tool.id} data-id={tool.id} className="group relative">
                                <button onClick={(e) => handleDelete('wf', tool.id, e)} className="absolute -top-1 -right-1 z-20 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"><i data-lucide="x" className="w-3 h-3"></i></button>
                                <a href={tool.url} target="_blank" className={`flex flex-col items-center justify-center p-4 ${tool.bgColor} border border-stone-100 rounded-2xl hover:shadow-xl transition-all h-28 text-center group`}>
                                    <i data-lucide={tool.icon} className="mb-2 w-6 h-6 group-hover:scale-110 transition-transform"></i>
                                    <span className="text-[11px] font-black tracking-tighter text-stone-700">{tool.name}</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Media Section */}
                <section id="md-sec" className="scroll-mt-28">
                    <div className="flex justify-between items-end mb-8 border-b border-stone-200 pb-4">
                        <h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="video"></i> Creative Media</h2>
                        <button onClick={() => handleAdd('md')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><i data-lucide="plus"></i></button>
                    </div>
                    <div ref={mediaRef} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {mediaTools.map(tool => (
                            <div key={tool.id} data-id={tool.id} className="group relative">
                                <button onClick={(e) => handleDelete('md', tool.id, e)} className="absolute -top-1 -right-1 z-20 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center"><i data-lucide="x" className="w-3 h-3"></i></button>
                                <a href={tool.url} target="_blank" className={`flex flex-col items-center justify-center p-4 ${tool.bgColor} border border-stone-100 rounded-2xl hover:shadow-xl transition-all h-28 text-center group`}>
                                    <i data-lucide={tool.icon} className="mb-2 w-6 h-6 group-hover:scale-110 transition-transform"></i>
                                    <span className="text-[11px] font-black tracking-tighter text-stone-700">{tool.name}</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. 我的產出 Section - 新增區塊 */}
                <section id="out-sec" className="scroll-mt-28">
                    <div className="flex justify-between items-end mb-8 border-b border-stone-200 pb-4">
                        <h2 className="text-2xl font-black text-stone-800 flex items-center gap-3"><i data-lucide="folder-kanban"></i> My Outputs</h2>
                        <button onClick={() => handleAdd('out')} className="w-10 h-10 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"><i data-lucide="plus"></i></button>
                    </div>
                    <div ref={outputsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {outputs.map(tool => (
                            <div key={tool.id} data-id={tool.id} className="group relative bg-white border border-stone-200 rounded-[2rem] p-5 hover:shadow-2xl transition-all cursor-grab">
                                <button onClick={(e) => handleDelete('out', tool.id, e)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-md z-20"><i data-lucide="x" className="w-4 h-4"></i></button>
                                <a href={tool.url} target="_blank" className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl ${tool.bgColor} flex items-center justify-center border shadow-inner`}><i data-lucide={tool.icon} className="w-7 h-7"></i></div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-stone-800 text-lg leading-tight">{tool.name}</h3>
                                        <p className="text-stone-400 text-[10px] font-bold uppercase mt-1 tracking-widest">View Project</p>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
            <footer className="text-center py-24 text-stone-300 text-[10px] font-black uppercase tracking-[0.5em]">
                Beige Studio &bull; Creative Workspace 2025
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
