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
const DOCUMENT_ID = 'user_tool_order_v16_final_fix'; 

const { useState, useEffect, useRef } = React;

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const [aiTools, setAiTools] = useState([]);
    const [workflowTools, setWorkflowTools] = useState([]);
    const [mediaTools, setMediaTools] = useState([]);
    const [outputs, setOutputs] = useState([]);

    const aiRef = useRef(null);
    const workflowRef = useRef(null);
    const mediaRef = useRef(null);
    const outputsRef = useRef(null);
    
    // 儲存 Sortable 實例的 Ref，用來銷毀舊實例
    const sortableInstances = useRef({});
    const stateRef = useRef({ ai: [], workflow: [], media: [], outputs: [] });

    const initialData = {
        ai: [
            { id: 'ai-1', name: 'Manus', desc: 'AI Agent', url: 'https://manus.ai', color: 'bg-stone-800' },
            { id: 'ai-2', name: 'Gemini', desc: 'Google AI', url: 'https://gemini.google.com', color: 'bg-blue-50' },
            { id: 'ai-6', name: 'ChatGPT', desc: 'OpenAI', url: 'https://chat.openai.com', color: 'bg-emerald-50' },
            { id: 'ai-7', name: 'Claude', desc: 'Anthropic', url: 'https://claude.ai', color: 'bg-orange-50' },
            { id: 'ai-9', name: 'Perplexity', desc: 'Search AI', url: 'https://www.perplexity.ai', color: 'bg-cyan-50' },
            { id: 'ai-3', name: 'Gamma', desc: 'AI PPT', url: 'https://gamma.app', color: 'bg-purple-50' },
            { id: 'ai-4', name: 'NotebookLM', desc: 'AI Notes', url: 'https://notebooklm.google.com', color: 'bg-teal-50' },
            { id: 'ai-11', name: 'v0.dev', desc: 'Vercel UI', url: 'https://v0.dev', color: 'bg-zinc-50' },
            { id: 'ai-12', name: 'Kimi', desc: 'Long Text', url: 'https://kimi.moonshot.cn', color: 'bg-green-50' },
            { id: 'ai-10', name: 'Leonardo', desc: 'AI Image', url: 'https://leonardo.ai', color: 'bg-amber-50' },
            { id: 'ai-5', name: 'AI Studio', desc: 'Google Dev', url: 'https://aistudio.google.com', color: 'bg-indigo-50' },
            { id: 'ai-8', name: 'DeepL', desc: 'AI Trans', url: 'https://www.deepl.com', color: 'bg-blue-50' },
        ],
        workflow: [
            { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', color: 'bg-rose-50' },
            { id: 'wf-2', name: 'Make', url: 'https://www.make.com', color: 'bg-violet-50' },
            { id: 'wf-12', name: 'Lucide Icons', url: 'https://lucide.dev/icons', color: 'bg-amber-50' },
            { id: 'wf-11', name: 'Firebase', url: 'https://console.firebase.google.com', color: 'bg-orange-50' },
            { id: 'wf-9', name: 'Linear', url: 'https://linear.app', color: 'bg-indigo-50' },
            { id: 'wf-7', name: 'Notion', url: 'https://www.notion.so', color: 'bg-stone-50' },
            { id: 'wf-8', name: 'GitHub', url: 'https://github.com', color: 'bg-slate-50' },
            { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', color: 'bg-zinc-50' },
            { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', color: 'bg-blue-50' },
            { id: 'wf-6', name: 'Wix', url: 'https://www.wix.com', color: 'bg-sky-50' },
            { id: 'wf-4', name: 'GAS', url: 'https://script.google.com', color: 'bg-amber-50' },
            { id: 'wf-10', name: 'Arc Boost', url: 'https://arc.net', color: 'bg-orange-50' },
        ],
        media: [
            { id: 'md-1', name: 'CapCut', url: 'https://www.capcut.com', color: 'bg-cyan-50' },
            { id: 'md-7', name: 'Luma AI', url: 'https://lumalabs.ai', color: 'bg-purple-50' },
            { id: 'md-2', name: 'Canva', url: 'https://www.canva.com', color: 'bg-fuchsia-50' },
            { id: 'md-8', name: 'ElevenLabs', url: 'https://elevenlabs.io', color: 'bg-yellow-50' },
            { id: 'md-6', name: 'Suno', url: 'https://suno.com', color: 'bg-orange-50' },
            { id: 'md-3', name: 'Remove.bg', url: 'https://www.remove.bg', color: 'bg-lime-50' },
            { id: 'md-4', name: 'Stable Audio', url: 'https://stableaudio.com', color: 'bg-indigo-50' },
            { id: 'md-5', name: 'Soundtrap', url: 'https://www.soundtrap.com', color: 'bg-rose-50' },
        ],
        outputs: [
            { id: 'out-1', name: '工作導航儀', desc: 'Workspace', url: 'https://petitns-space.github.io/workspace-navigator/', color: 'bg-stone-800 text-white', icon: 'palette' },
            { id: 'out-2', name: '我的 Web CV', desc: 'Portfolio', url: 'https://my-project-topaz-tau.vercel.app/', color: 'bg-rose-100 text-rose-600', icon: 'heart' },
        ]
    };

    const getLogo = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch (e) {
            return `https://www.google.com/s2/favicons?sz=64&domain=google.com`;
        }
    };

    const syncToFirebase = (ai, wf, md, out) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({
            ai, workflow: wf, media: md, outputs: out,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.error("Sync Error:", err));
    };

    useEffect(() => {
        stateRef.current = { ai: aiTools, workflow: workflowTools, media: mediaTools, outputs: outputs };
    }, [aiTools, workflowTools, mediaTools, outputs]);

    useEffect(() => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).get().then(doc => {
            if (doc.exists && doc.data().ai) {
                const d = doc.data();
                setAiTools(d.ai); setWorkflowTools(d.workflow); setMediaTools(d.media); setOutputs(d.outputs || []);
            } else {
                setAiTools(initialData.ai); setWorkflowTools(initialData.workflow); setMediaTools(initialData.media); setOutputs(initialData.outputs);
            }
            setLoading(false);
        }).catch(() => setLoading(false));
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 關鍵修復：管理 Sortable 實例，避免重複掛載
    useEffect(() => {
        if (loading) return;
        const init = (el, setFunc, type) => {
            if (!el) return;
            // 如果該區塊已有實例，先銷毀它
            if (sortableInstances.current[type]) {
                sortableInstances.current[type].destroy();
            }
            sortableInstances.current[type] = Sortable.create(el, {
                animation: 250, delay: 200, delayOnTouchOnly: true, ghostClass: 'sortable-ghost',
                onEnd: (evt) => {
                    const newIds = Array.from(el.children).map(child => child.dataset.id);
                    const currentList = stateRef.current[type];
                    const sortedList = newIds.map(id => currentList.find(t => t.id === id)).filter(Boolean);
                    
                    // 強制還原 DOM 狀態，讓 React 重新繪製真實順序
                    const itemEl = evt.item;
                    itemEl.parentNode.removeChild(itemEl);
                    if (evt.oldIndex < el.children.length) el.insertBefore(itemEl, el.children[evt.oldIndex]);
                    else el.appendChild(itemEl);

                    setFunc(sortedList);
                    setTimeout(() => {
                        const s = stateRef.current;
                        syncToFirebase(s.ai, s.workflow, s.media, s.outputs);
                    }, 50);
                }
            });
        };

        init(aiRef.current, setAiTools, 'ai');
        init(workflowRef.current, setWorkflowTools, 'workflow');
        init(mediaRef.current, setMediaTools, 'media');
        init(outputsRef.current, setOutputs, 'outputs');

        // 組件卸載時銷毀所有實例
        return () => {
            Object.values(sortableInstances.current).forEach(ins => ins && ins.destroy());
        };
    }, [loading]); // 僅在初始加載完成後執行一次

    useEffect(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, [loading, aiTools, workflowTools, mediaTools, outputs]);

    const handleAdd = (type) => {
        const name = prompt("名稱:");
        const url = prompt("網址:");
        if (!name || !url) return;
        const newTool = { id: Date.now().toString(), name, url, color: "bg-white", desc: "Tool", icon: "sparkles" };
        if (type === 'ai') setAiTools(p => [...p, newTool]);
        if (type === 'wf') setWorkflowTools(p => [...p, newTool]);
        if (type === 'md') setMediaTools(p => [...p, newTool]);
        if (type === 'out') setOutputs(p => [...p, newTool]);
        setTimeout(() => syncToFirebase(stateRef.current.ai, stateRef.current.workflow, stateRef.current.media, stateRef.current.outputs), 200);
    };

    const handleDelete = (type, id, e) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm("確定刪除？")) return;
        if (type === 'ai') setAiTools(p => p.filter(t => t.id !== id));
        if (type === 'wf') setWorkflowTools(p => p.filter(t => t.id !== id));
        if (type === 'md') setMediaTools(p => p.filter(t => t.id !== id));
        if (type === 'out') setOutputs(p => p.filter(t => t.id !== id));
        setTimeout(() => syncToFirebase(stateRef.current.ai, stateRef.current.workflow, stateRef.current.media, stateRef.current.outputs), 200);
    };

    const ToolButton = ({ tool, type, useLucide = false }) => (
        <div data-id={tool.id} className="group relative bg-white border border-stone-200 rounded-2xl p-3 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
            <button onClick={(e) => handleDelete(type, tool.id, e)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 shadow-lg"><i data-lucide="x" className="w-3 h-3"></i></button>
            <a
