// 1. Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyAJQh-yzP3RUF2zhN7s47uNOJokF0vrR_c",
    authDomain: "my-studio-dashboard.firebaseapp.com",
    projectId: "my-studio-dashboard",
    storageBucket: "my-studio-dashboard.firebasestorage.app",
    messagingSenderId: "219057281896",
    appId: "1:219057281896:web:63304825302437231754dd"
};

// 2. 初始化 Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
db.settings({ experimentalForceLongPolling: true });

const COLLECTION_NAME = 'workspace_navigator_states';
const DOCUMENT_ID = 'user_tool_order_v3';

const { useState, useEffect, useRef } = React;

// 3. 預設工具清單 (靜態常數)
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
        { id: 'wf-7', name: 'GitHub', url: 'https://github.com', icon: 'github', bgColor: 'bg-gray-100 border-gray-200 text-gray-800' }
    ],
    design: [
        { id: 'ds-1', name: 'Figma', url: 'https://www.figma.com', icon: 'figma', bgColor: 'bg-orange-50 border-orange-100 text-orange-500' },
        { id: 'ds-2', name: 'Spline', url: 'https://spline.design', icon: 'cube', bgColor: 'bg-indigo-50 border-indigo-100 text-indigo-500' },
        { id: 'ds-3', name: 'Pinterest', url: 'https://www.pinterest.com', icon: 'pinterest', bgColor: 'bg-red-50 border-red-100 text-red-500' },
        { id: 'ds-4', name: 'Dribbble', url: 'https://dribbble.com', icon: 'dribbble', bgColor: 'bg-pink-50 border-pink-100 text-pink-500' },
        { id: 'ds-5', name: 'Behance', url: 'https://www.behance.net', icon: 'behance', bgColor: 'bg-blue-50 border-blue-100 text-blue-500' },
        { id: 'ds-6', name: 'Coolors', url: 'https://coolors.co', icon: 'palette', bgColor: 'bg-teal-50 border-teal-100 text-teal-500' },
        { id: 'ds-7', name: 'Adobe Color', url: 'https://color.adobe.com', icon: 'swatch-book', bgColor: 'bg-yellow-50 border-yellow-100 text-yellow-600' },
        { id: 'ds-8', name: 'Fontjoy', url: 'https://fontjoy.com', icon: 'type', bgColor: 'bg-lime-50 border-lime-100 text-lime-600' },
        { id: 'ds-9', name: 'Google Fonts', url: 'https://fonts.google.com', icon: 'pilcrow', bgColor: 'bg-green-50 border-green-100 text-green-600' },
        { id: 'ds-10', name: 'Lucide', url: 'https://lucide.dev', icon: 'sparkles', bgColor: 'bg-cyan-50 border-cyan-100 text-cyan-600' }
    ],
    media: [
        { id: 'md-1', name: 'Midjourney', url: 'https://www.midjourney.com', icon: 'image', bgColor: 'bg-violet-100 border-violet-200 text-violet-700' },
        { id: 'md-2', name: 'Runway', url: 'https://runwayml.com', icon: 'video', bgColor: 'bg-pink-100 border-pink-200 text-pink-700' },
        { id: 'md-3', name: 'Pika', url: 'https://pika.art', icon: 'film', bgColor: 'bg-fuchsia-100 border-fuchsia-200 text-fuchsia-700' },
        { id: 'md-4', name: 'Luma', url: 'https://lumalabs.ai', icon: 'camera', bgColor: 'bg-purple-100 border-purple-200 text-purple-700' },
        { id: 'md-5', name: 'Krea', url: 'https://www.krea.ai', icon: 'wand-2', bgColor: 'bg-sky-100 border-sky-200 text-sky-700' },
        { id: 'md-6', name: 'Unsplash', url: 'https://unsplash.com', icon: 'camera', bgColor: 'bg-slate-100 border-slate-200 text-slate-700' },
        { id: 'md-7', name: 'Freepik', url: 'https://www.freepik.com', icon: 'layout-grid', bgColor: 'bg-cyan-100 border-cyan-200 text-cyan-700' },
        { id: 'md-8', name: 'Icons8', url: 'https://icons8.com', icon: 'mouse-pointer-2', bgColor: 'bg-emerald-100 border-emerald-200 text-emerald-700' },
        { id: 'md-9', name: 'Envato Elements', url: 'https://elements.envato.com', icon: 'folder-search', bgColor: 'bg-lime-100 border-lime-200 text-lime-700' },
        { id: 'md-10', name: 'YouTube', url: 'https://youtube.com', icon: 'youtube', bgColor: 'bg-red-100 border-red-200 text-red-700' }
    ]
};

// 4. React App 元件
const App = ( ) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState(null);
    const [order, setOrder] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const sortableRefs = useRef({});

    // 時間更新 effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 資料載入 effect
    useEffect(() => {
        console.log("Starting to fetch data from Firebase...");
        const loadingTimeout = setTimeout(() => {
            if (loading) {
                console.warn("Firebase connection timed out after 5 seconds. Falling back to initial data.");
                setTools(initialData);
                setOrder(Object.keys(initialData));
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = db.collection(COLLECTION_NAME).doc(DOCUMENT_ID)
            .onSnapshot(doc => {
                clearTimeout(loadingTimeout);
                console.log("Received data from Firebase.");
                if (doc.exists) {
                    const data = doc.data();
                    if (data && data.tools && data.order && Array.isArray(data.order)) {
                        console.log("Firebase data is valid. Applying state.");
                        setTools(data.tools);
                        setOrder(data.order);
                    } else {
                        console.warn("Firebase data is incomplete or malformed. Falling back to initial data.");
                        setTools(initialData);
                        setOrder(Object.keys(initialData));
                    }
                } else {
                    console.log("Document does not exist. Using initial data.");
                    setTools(initialData);
                    setOrder(Object.keys(initialData));
                }
                setLoading(false);
            }, err => {
                clearTimeout(loadingTimeout);
                console.error("Error fetching from Firebase: ", err);
                console.log("Falling back to initial data due to error.");
                setTools(initialData);
                setOrder(Object.keys(initialData));
                setLoading(false);
            });

        return () => {
            console.log("Cleaning up Firebase listener and timeout.");
            unsubscribe();
            clearTimeout(loadingTimeout);
        };
    }, []);

    // Sortable.js 初始化 effect
    useEffect(() => {
        if (loading || !order) {
            return;
        }
        
        console.log("Initializing or re-initializing Sortable.js...");

        // 清理舊的實例
        Object.values(sortableRefs.current).forEach(instance => instance && instance.destroy());
        sortableRefs.current = {};

        // 主容器排序
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            sortableRefs.current.main = new Sortable(mainContainer, {
                animation: 150,
                handle: '.drag-handle',
                onEnd: (evt) => {
                    const newOrder = [...order];
                    const [movedItem] = newOrder.splice(evt.oldIndex, 1);
                    newOrder.splice(evt.newIndex, 0, movedItem);
                    setOrder(newOrder);
                    saveState({ order: newOrder, tools });
                }
            });
        }

        // 分類內部工具排序
        order.forEach(type => {
            const el = document.getElementById(`tool-grid-${type}`);
            if (el) {
                sortableRefs.current[type] = new Sortable(el, {
                    group: 'tools',
                    animation: 150,
                    onEnd: (evt) => {
                        const { from, to, oldIndex, newIndex } = evt;
                        const fromType = from.id.replace('tool-grid-', '');
                        const toType = to.id.replace('tool-grid-', '');
                        
                        const newTools = JSON.parse(JSON.stringify(tools));
                        const [movedItem] = newTools[fromType].splice(oldIndex, 1);
                        newTools[toType].splice(newIndex, 0, movedItem);
                        
                        setTools(newTools);
                        saveState({ order, tools: newTools });
                    }
                });
            }
        });

        return () => {
            console.log("Cleaning up Sortable.js instances.");
            Object.values(sortableRefs.current).forEach(instance => instance && instance.destroy());
        };
    }, [loading, order, tools]); // 依賴 tools 確保跨區拖曳後能重新綁定

    // Lucide 圖標更新 effect
    useEffect(() => {
        if (!loading) {
            console.log("Creating Lucide icons.");
            lucide.createIcons();
        }
    }, [loading, tools, isEditing]);

    const saveState = (newState) => {
        console.log("Saving state to Firebase:", newState);
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newState)
            .catch(error => console.error("Error writing to Firebase: ", error));
    };

    const handleDelete = (type, id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('確定要刪除這個工具嗎？')) {
            const newTools = { ...tools };
            newTools[type] = newTools[type].filter(tool => tool.id !== id);
            setTools(newTools);
            saveState({ order, tools: newTools });
        }
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
        return `${year}.${month}.${day} 星期${dayOfWeek}`;
    };

    if (loading || !tools || !order) {
        return React.createElement('div', { className: 'flex items-center justify-center h-screen bg-slate-900 text-white text-xl' },
            React.createElement('i', { 'data-lucide': 'loader-circle', className: 'w-8 h-8 mr-4 animate-spin' }),
            'Loading Workspace...'
        );
    }

    const renderTool = (tool, type) => {
        const isSimple = ['workflow', 'design', 'media'].includes(type);
        const commonProps = {
            key: tool.id,
            'data-id': tool.id,
            className: "group relative cursor-grab"
        };

        const deleteButton = isEditing && React.createElement('button', {
            onClick: (e) => handleDelete(type, tool.id, e),
            className: "absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all hover:scale-110"
        }, React.createElement('i', { 'data-lucide': 'x', className: 'w-4 h-4' }));

        const linkClass = isSimple
            ? `flex items-center justify-center p-4 h-full rounded-lg border transition-all group-hover:scale-105 group-hover:shadow-lg ${tool.bgColor}`
            : `flex flex-col items-center p-3 text-center rounded-lg border transition-all group-hover:scale-105 group-hover:shadow-xl ${tool.color}`;

        const linkContent = isSimple
            ? [
                React.createElement('i', { key: 'icon', 'data-lucide': tool.icon, className: 'w-6 h-6 mr-3' }),
                React.createElement('span', { key: 'name', className: 'font-semibold' }, tool.name)
            ]
            : [
                React.createElement('i', { key: 'icon', 'data-lucide': tool.icon, className: 'w-8 h-8 mb-2' }),
                React.createElement('h3', { key: 'name', className: 'font-bold text-sm mb-1' }, tool.name),
                React.createElement('p', { key: 'desc', className: 'text-xs opacity-70' }, tool.desc)
            ];

        return React.createElement('div', commonProps,
            deleteButton,
            React.createElement('a', { href: tool.url, target: '_blank', className: linkClass }, linkContent)
        );
    };

    return React.createElement('div', { className: 'min-h-screen bg-slate-900 text-white p-4 md:p-8' },
        React.createElement('header', { className: 'flex justify-between items-center mb-8' },
            React.createElement('div', { className: 'text-left' },
                React.createElement('h1', { className: 'text-5xl font-bold tracking-tighter' }, formatTime(currentTime)),
                React.createElement('p', { className: 'text-slate-400' }, formatDate(currentTime))
            ),
            React.createElement('button', {
                onClick: () => setIsEditing(!isEditing),
                className: `px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'}`
            },
                React.createElement('i', { 'data-lucide': isEditing ? 'check' : 'settings-2', className: 'w-4 h-4' }),
                isEditing ? '完成管理' : '管理工具'
            )
        ),
        React.createElement('main', { id: 'main-container', className: 'space-y-8' },
            order.map(type => {
                const category = tools[type];
                if (!category || !Array.isArray(category)) return null;
                const titleMap = { ai: 'AI Agents', workflow: 'Workflow & Dev', design: 'Design Resources', media: 'Media & Assets' };
                const gridStyle = {
                    ai: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
                    workflow: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                    design: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                    media: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                };

                return React.createElement('section', { key: type, 'data-type': type, className: 'relative pt-4' },
                    React.createElement('div', { className: 'drag-handle absolute -left-8 top-5 text-slate-500 cursor-move p-1' },
                        React.createElement('i', { 'data-lucide': 'grip-vertical', className: 'w-5 h-5' })
                    ),
                    React.createElement('h2', { className: 'text-xl font-semibold mb-4 text-slate-300' }, titleMap[type]),
                    React.createElement('div', { id: `tool-grid-${type}`, className: `grid gap-4 ${gridStyle[type]}` },
                        category.map(tool => renderTool(tool, type))
                    )
                );
            })
        )
    );
};

// 5. 渲染 App
ReactDOM.render(React.createElement(App), document.getElementById('root'));
