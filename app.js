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
const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v3';

const { useState, useEffect, useRef } = React;

// 2. 您提供的所有完整按鈕資料
const initialData = {
    ai: [
        { id: 'ai-1', name: 'Manus', desc: 'AI Agent', url: 'https://manus.ai', color: 'bg-stone-800 text-white', icon: 'bot' },
        { id: 'ai-2', name: 'Gemini', desc: 'Google AI', url: 'https://gemini.google.com', color: 'bg-blue-50 text-blue-600', icon: 'sparkles' },
        { id: 'ai-6', name: 'ChatGPT', desc: 'OpenAI', url: 'https://chat.openai.com', color: 'bg-emerald-50 text-emerald-600', icon: 'message-square' },
        { id: 'ai-7', name: 'Claude', desc: 'Anthropic', url: 'https://claude.ai', color: 'bg-orange-50 text-orange-600', icon: 'brain-circuit' },
        { id: 'ai-9', name: 'Perplexity', desc: 'Search AI', url: 'https://www.perplexity.ai', color: 'bg-cyan-50 text-cyan-600', icon: 'zap' },
        { id: 'ai-3', name: 'Gamma', desc: 'AI PPT', url: 'https://gamma.app', color: 'bg-purple-50 text-purple-600', icon: 'presentation' },
        { id: 'ai-4', name: 'NotebookLM', desc: 'AI Notes', url: 'https://notebooklm.google.com', color: 'bg-teal-50 text-teal-600', icon: 'book-open' },
        { id: 'ai-11', name: 'v0.dev', desc: 'Vercel UI', url: 'https://v0.dev', color: 'bg-zinc-50 text-zinc-600', icon: 'layout' },
        { id: 'ai-12', name: 'Kimi', desc: 'Long Text', url: 'https://kimi.moonshot.cn', color: 'bg-green-50 text-green-600', icon: 'file-text' },
        { id: 'ai-10', name: 'Leonardo', desc: 'AI Image', url: 'https://leonardo.ai', color: 'bg-amber-50 text-amber-700', icon: 'image' },
        { id: 'ai-5', name: 'AI Studio', desc: 'Google Dev', url: 'https://aistudio.google.com', color: 'bg-indigo-50 text-indigo-600', icon: 'terminal' },
        { id: 'ai-8', name: 'DeepL', desc: 'AI Trans', url: 'https://www.deepl.com', color: 'bg-blue-50 text-blue-800', icon: 'languages' },
    ],
    workflow: [
        { id: 'wf-1', name: 'n8n', url: 'https://n8n.io', color: 'bg-rose-50 text-rose-600', icon: 'infinity' },
        { id: 'wf-2', name: 'Make', url: 'https://www.make.com', color: 'bg-violet-50 text-violet-600', icon: 'zap' },
        { id: 'wf-12', name: 'Lucide Icons', url: 'https://lucide.dev/icons', color: 'bg-amber-50 text-amber-600', icon: 'sparkles' },
        { id: 'wf-11', name: 'Firebase', url: 'https://console.firebase.google.com', color: 'bg-orange-50 text-orange-600', icon: 'database' },
        { id: 'wf-9', name: 'Linear', url: 'https://linear.app', color: 'bg-indigo-50 text-indigo-600', icon: 'check-circle' },
        { id: 'wf-7', name: 'Notion', url: 'https://www.notion.so', color: 'bg-stone-50 text-stone-600', icon: 'book' },
        { id: 'wf-8', name: 'GitHub', url: 'https://github.com', color: 'bg-slate-50 text-slate-800', icon: 'github' },
        { id: 'wf-3', name: 'Vercel', url: 'https://vercel.com', color: 'bg-zinc-50 text-zinc-800', icon: 'triangle' },
        { id: 'wf-5', name: 'Wix Studio', url: 'https://www.wix.com/studio', color: 'bg-blue-50 text-blue-600', icon: 'monitor' },
        { id: 'wf-6', name: 'Wix', url: 'https://www.wix.com', color: 'bg-sky-50 text-sky-600', icon: 'globe' },
        { id: 'wf-4', name: 'GAS', url: 'https://script.google.com', color: 'bg-amber-50 text-amber-600', icon: 'file-code' },
        { id: 'wf-10', name: 'Arc Boost', url: 'https://arc.net', color: 'bg-orange-50 text-orange-600', icon: 'compass' },
    ],
    design: [
        { id: 'ds-1', name: 'Figma', url: 'https://www.figma.com', icon: 'figma', color: 'bg-orange-50 border-orange-100 text-orange-500' },
        { id: 'ds-2', name: 'Spline', url: 'https://spline.design', icon: 'cube', color: 'bg-indigo-50 border-indigo-100 text-indigo-500' },
        { id: 'ds-3', name: 'Pinterest', url: 'https://www.pinterest.com', icon: 'pinterest', color: 'bg-red-50 border-red-100 text-red-500' },
        { id: 'ds-4', name: 'Dribbble', url: 'https://dribbble.com', icon: 'dribbble', color: 'bg-pink-50 border-pink-100 text-pink-500' },
        { id: 'ds-5', name: 'Behance', url: 'https://www.behance.net', icon: 'behance', color: 'bg-blue-50 border-blue-100 text-blue-500' },
        { id: 'ds-6', name: 'Coolors', url: 'https://coolors.co', icon: 'palette', color: 'bg-teal-50 border-teal-100 text-teal-500' },
        { id: 'ds-7', name: 'Adobe Color', url: 'https://color.adobe.com', icon: 'swatch-book', color: 'bg-yellow-50 border-yellow-100 text-yellow-600' },
        { id: 'ds-8', name: 'Fontjoy', url: 'https://fontjoy.com', icon: 'type', color: 'bg-lime-50 border-lime-100 text-lime-600' },
        { id: 'ds-9', name: 'Google Fonts', url: 'https://fonts.google.com', icon: 'pilcrow', color: 'bg-green-50 border-green-100 text-green-600' },
        { id: 'ds-10', name: 'Lucide', url: 'https://lucide.dev', icon: 'sparkles', color: 'bg-cyan-50 border-cyan-100 text-cyan-600' }
    ],
    media: [
        { id: 'md-1', name: 'CapCut', url: 'https://www.capcut.com', color: 'bg-cyan-50 text-cyan-600', icon: 'video' },
        { id: 'md-7', name: 'Luma AI', url: 'https://lumalabs.ai', color: 'bg-purple-50 text-purple-600', icon: 'camera' },
        { id: 'md-2', name: 'Canva', url: 'https://www.capcut.com', color: 'bg-fuchsia-50 text-fuchsia-600', icon: 'layout-grid' },
        { id: 'md-8', name: 'ElevenLabs', url: 'https://elevenlabs.io', color: 'bg-yellow-50 text-yellow-700', icon: 'mic' },
        { id: 'md-6', name: 'Suno', url: 'https://suno.com', color: 'bg-orange-50 text-orange-600', icon: 'music' },
        { id: 'md-3', name: 'Remove.bg', url: 'https://www.remove.bg', color: 'bg-lime-50 text-lime-600', icon: 'scissors' },
        { id: 'md-4', name: 'Stable Audio', url: 'https://stableaudio.com', color: 'bg-indigo-50 text-indigo-600', icon: 'headphones' },
        { id: 'md-5', name: 'Soundtrap', url: 'https://www.soundtrap.com', color: 'bg-rose-50 text-rose-600', icon: 'cassette-tape' },
    ],
    outputs: [
        { id: 'out-1', name: '工作導航儀', desc: 'Workspace', url: 'https://petitns-space.github.io/workspace-navigator/', color: 'bg-stone-800 text-white', icon: 'palette' },
        { id: 'out-2', name: '我的 Web CV', desc: 'Portfolio', url: 'https://my-project-topaz-tau.vercel.app/', color: 'bg-rose-100 text-rose-600', icon: 'heart' },
    ]
};

const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState(null);
    const [order, setOrder] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const toolsRef = useRef(null);
    const orderRef = useRef(null);

    useEffect(() => {
        toolsRef.current = tools;
        orderRef.current = order;
    }, [tools, order]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const unsubscribe = db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                setTools(data.tools || initialData);
                setOrder(data.order || Object.keys(initialData));
            } else {
                setTools(initialData);
                setOrder(Object.keys(initialData));
            }
            setLoading(false);
        });
        return () => { clearInterval(timer); unsubscribe(); };
    }, []);

    const saveState = (t, o) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set({ tools: t, order: o });
    };

    useEffect(() => {
        if (loading || !order) return;
        const instances = [];

        // 主容器排序
        const mainEl = document.getElementById('main-container');
        if (mainEl) {
            instances.push(new Sortable(mainEl, {
                animation: 150, handle: '.drag-handle',
                onEnd: (evt) => {
                    const { oldIndex, newIndex, item, from } = evt;
                    const children = Array.from(from.children);
                    if (oldIndex < newIndex) from.insertBefore(item, children[oldIndex]);
                    else from.insertBefore(item, children[oldIndex].nextSibling || null);
                    const newOrder = [...orderRef.current];
                    const [moved] = newOrder.splice(oldIndex, 1);
                    newOrder.splice(newIndex, 0, moved);
                    setOrder(newOrder);
                    saveState(toolsRef.current, newOrder);
                }
            }));
        }

        // 分類網格排序
        order.forEach(type => {
            const el = document.getElementById(`grid-${type}`);
            if (el) {
                instances.push(new Sortable(el, {
                    group: 'tools', animation: 150,
                    onEnd: (evt) => {
                        const { from, to, oldIndex, newIndex, item } = evt;
                        const children = Array.from(from.children);
                        if (oldIndex < newIndex) from.insertBefore(item, children[oldIndex]);
                        else from.insertBefore(item, children[oldIndex].nextSibling || null);
                        const fromType = from.id.replace('grid-', '');
                        const toType = to.id.replace('grid-', '');
                        const newTools = JSON.parse(JSON.stringify(toolsRef.current));
                        const [moved] = newTools[fromType].splice(oldIndex, 1);
                        newTools[toType].splice(newIndex, 0, moved);
                        setTools(newTools);
                        saveState(newTools, orderRef.current);
                    }
                }));
            }
        });
        return () => instances.forEach(i => i.destroy());
    }, [loading, order]);

    useEffect(() => { if (!loading) lucide.createIcons(); }, [loading, tools, isEditing]);

    const handleDelete = (type, id) => {
        if (!confirm('確定刪除？')) return;
        const newTools = { ...tools };
        newTools[type] = newTools[type].filter(t => t.id !== id);
        setTools(newTools);
        saveState(newTools, order);
    };

    if (loading) return React.createElement('div', { className: 'flex items-center justify-center h-screen bg-slate-900 text-white font-mono' }, 'LOADING WORKSPACE...');

    return React.createElement('div', { className: 'min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans' },
        React.createElement('header', { className: 'flex justify-between items-center mb-8 max-w-7xl mx-auto' },
            React.createElement('div', null,
                React.createElement('h1', { className: 'text-5xl font-bold tracking-tighter' }, currentTime.toLocaleTimeString('zh-TW', { hour12: false })),
                React.createElement('p', { className: 'text-slate-400 mt-1' }, currentTime.toLocaleDateString('zh-TW'))
            ),
            React.createElement('button', { 
                onClick: () => setIsEditing(!isEditing), 
                className: `px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${isEditing ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}` 
            }, React.createElement('i', { 'data-lucide': isEditing ? 'check' : 'settings-2', className: 'w-4 h-4' }), isEditing ? '完成管理' : '管理工具')
        ),

        React.createElement('main', { id: 'main-container', className: 'space-y-12 max-w-7xl mx-auto pb-20' },
            order.map(type => {
                const category = tools[type];
                if (!category) return null;
                const titleMap = { ai: 'AI Agents', workflow: 'Workflow & Dev', design: 'Design Resources', media: 'Media & Assets', outputs: '我的產出內容' };
                const gridStyle = {
                    ai: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
                    workflow: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                    design: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                    media: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                    outputs: 'grid-cols-1 md:grid-cols-2'
                };

                return React.createElement('section', { key: type, className: 'relative' },
                    React.createElement('div', { className: 'drag-handle absolute -left-8 top-1 text-slate-600 cursor-move hover:text-white transition-colors' }, 
                        React.createElement('i', { 'data-lucide': 'grip-vertical', className: 'w-5 h-5' })
                    ),
                    React.createElement('h2', { className: 'text-sm font-black text-slate-500 uppercase tracking-widest mb-4' }, titleMap[type]),
                    React.createElement('div', { id: `grid-${type}`, className: `grid gap-4 ${gridStyle[type]}` },
                        category.map(tool => {
                            const isAI = type === 'ai';
                            const isOutput = type === 'outputs';
                            return React.createElement('div', { key: tool.id, 'data-id': tool.id, className: 'group relative cursor-grab' },
                                isEditing && React.createElement('button', {
                                    onClick: () => handleDelete(type, tool.id),
                                    className: 'absolute -top-2 -right-2 z-30 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg'
                                }, React.createElement('i', { 'data-lucide': 'x', className: 'w-3 h-3 text-white' })),
                                React.createElement('a', { 
                                    href: tool.url, 
                                    target: '_blank', 
                                    className: `flex ${isAI ? 'flex-col items-center text-center p-3' : 'items-center p-4'} rounded-xl border transition-all hover:scale-105 hover:shadow-xl ${tool.color}` 
                                },
                                    React.createElement('i', { 'data-lucide': tool.icon || 'link', className: `${isAI ? 'w-8 h-8 mb-2' : 'w-6 h-6 mr-3 flex-shrink-0'}` }),
                                    React.createElement('div', { className: 'min-w-0' },
                                        React.createElement('h3', { className: 'font-bold text-sm truncate' }, tool.name),
                                        (isAI || isOutput) && React.createElement('p', { className: 'text-[10px] opacity-70 truncate' }, tool.desc)
                                    )
                                )
                            );
                        })
                    )
                );
            })
        )
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
