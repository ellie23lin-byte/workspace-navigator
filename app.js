// 4. React App 元件 (修正版：拖曳常駐)
const App = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState(null);
    const [order, setOrder] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // 這個狀態現在只控制刪除按鈕的顯示

    const sortableContainers = useRef({});

    // --- 時間更新 effect ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- 資料載入 effect (使用上一版修正的 robust loading) ---
    useEffect(() => {
        const loadingTimeout = setTimeout(() => {
            if (loading) {
                console.warn("Firebase timeout. Falling back to initial data.");
                setTools(initialData);
                setOrder(Object.keys(initialData));
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = db.collection(COLLECTION_NAME).doc(DOCUMENT_ID)
            .onSnapshot(doc => {
                clearTimeout(loadingTimeout);
                if (doc.exists) {
                    const data = doc.data();
                    if (data.tools && data.order) {
                        setTools(data.tools);
                        setOrder(data.order);
                    } else {
                        setTools(initialData);
                        setOrder(Object.keys(initialData));
                    }
                } else {
                    setTools(initialData);
                    setOrder(Object.keys(initialData));
                }
                setLoading(false);
            }, err => {
                clearTimeout(loadingTimeout);
                console.error("Error fetching document: ", err);
                setTools(initialData);
                setOrder(Object.keys(initialData));
                setLoading(false);
            });

        return () => {
            unsubscribe();
            clearTimeout(loadingTimeout);
        };
    }, []);

    // --- 核心修正：Sortable.js 初始化邏輯 ---
    useEffect(() => {
        // 只有在資料載入完成後才執行
        if (loading) return;

        // 銷毀舊的實例，確保每次都重新初始化
        Object.values(sortableContainers.current).forEach(sortable => {
            if (sortable) sortable.destroy();
        });
        sortableContainers.current = {};

        // 1. 初始化主容器排序 (Section 排序)
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            sortableContainers.current.main = new Sortable(mainContainer, {
                animation: 150,
                handle: '.drag-handle', // 指定拖曳控制項
                onEnd: (evt) => {
                    // 使用 functional update 避免 state 閉包問題
                    setOrder(prevOrder => {
                        const newOrder = [...prevOrder];
                        const [movedItem] = newOrder.splice(evt.oldIndex, 1);
                        newOrder.splice(evt.newIndex, 0, movedItem);
                        
                        // 異步保存狀態
                        setTools(prevTools => {
                            saveState({ order: newOrder, tools: prevTools });
                            return prevTools;
                        });

                        return newOrder;
                    });
                }
            });
        }

        // 2. 初始化每個分類的工具排序 (Tool 排序)
        order.forEach(type => {
            const el = document.getElementById(`tool-grid-${type}`);
            if (el) {
                sortableContainers.current[type] = new Sortable(el, {
                    group: 'tools', // 允許在不同分類間拖曳
                    animation: 150,
                    onEnd: (evt) => {
                        const { from, to, oldIndex, newIndex } = evt;
                        const fromType = from.id.replace('tool-grid-', '');
                        const toType = to.id.replace('tool-grid-', '');

                        // 使用 functional update
                        setTools(prevTools => {
                            const newTools = JSON.parse(JSON.stringify(prevTools)); // 深拷貝
                            const [movedItem] = newTools[fromType].splice(oldIndex, 1);
                            newTools[toType].splice(newIndex, 0, movedItem);
                            
                            // 異步保存狀態
                            setOrder(prevOrder => {
                                saveState({ order: prevOrder, tools: newTools });
                                return prevOrder;
                            });

                            return newTools;
                        });
                    }
                });
            }
        });
        
        // 元件卸載時銷毀所有 Sortable 實例
        return () => {
            Object.values(sortableContainers.current).forEach(sortable => {
                if (sortable) sortable.destroy();
            });
        };

    }, [loading, order]); // 依賴項改為 loading 和 order

    // --- Lucide 圖標更新 effect ---
    useEffect(() => {
        if (!loading) {
            lucide.createIcons();
        }
    }, [loading, tools, isEditing]); // isEditing 變更時也需重繪圖標 (如刪除按鈕)

    // --- 其他函式 (保持不變) ---
    const saveState = (newState) => {
        db.collection(COLLECTION_NAME).doc(DOCUMENT_ID).set(newState)
            .catch(error => console.error("Error writing document: ", error));
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

    // --- 渲染邏輯 ---
    if (loading || !tools || !order) {
        return React.createElement('div', { className: 'flex items-center justify-center h-screen bg-slate-900 text-white text-xl' },
            React.createElement('i', { 'data-lucide': 'loader-circle', className: 'w-8 h-8 mr-4 animate-spin' }),
            'Loading Workspace...'
        );
    }

    const renderTool = (tool, type) => {
        const isSimple = type === 'workflow' || type === 'design' || type === 'media';
        const commonProps = {
            key: tool.id,
            'data-id': tool.id,
            className: "group relative cursor-grab" // 添加 cursor-grab 提示可拖曳
        };

        const deleteButton = isEditing && React.createElement('button', {
            onClick: (e) => handleDelete(type, tool.id, e),
            className: "absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all hover:scale-110"
        }, React.createElement('i', { 'data-lucide': 'x', className: 'w-4 h-4' }));

        if (isSimple) {
            return React.createElement('div', commonProps,
                deleteButton,
                React.createElement('a', { href: tool.url, target: '_blank', className: `flex items-center justify-center p-4 h-full rounded-lg border transition-all group-hover:scale-105 group-hover:shadow-lg ${tool.bgColor}` },
                    React.createElement('i', { 'data-lucide': tool.icon, className: 'w-6 h-6 mr-3' }),
                    React.createElement('span', { className: 'font-semibold' }, tool.name)
                )
            );
        }

        return React.createElement('div', commonProps,
            deleteButton,
            React.createElement('a', { href: tool.url, target: '_blank', className: `flex flex-col items-center p-3 text-center rounded-lg border transition-all group-hover:scale-105 group-hover:shadow-xl ${tool.color}` },
                React.createElement('i', { 'data-lucide': tool.icon, className: 'w-8 h-8 mb-2' }),
                React.createElement('h3', { className: 'font-bold text-sm mb-1' }, tool.name),
                React.createElement('p', { className: 'text-xs opacity-70' }, tool.desc)
            )
        );
    };

    return React.createElement('div', { className: 'min-h-screen bg-slate-900 text-white p-4 md:p-8' },
        React.createElement('header', { className: 'flex justify-between items-center mb-8' },
            React.createElement('div', { className: 'text-left' },
                React.createElement('h1', { className: 'text-5xl font-bold tracking-tighter' }, formatTime(currentTime)),
                React.createElement('p', { className: 'text-slate-400' }, formatDate(currentTime))
            ),
            // --- 修正點：按鈕文字和功能語意變更 ---
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
                if (!category) return null;
                const titleMap = { ai: 'AI Agents', workflow: 'Workflow & Dev', design: 'Design Resources', media: 'Media & Assets' };
                const gridStyle = {
                    ai: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
                    workflow: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                    design: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                    media: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                };

                return React.createElement('section', { key: type, 'data-type': type, className: 'relative' },
                    // --- 修正點：拖曳圖示常駐顯示 ---
                    React.createElement('div', { className: 'drag-handle absolute -left-8 top-1 text-slate-500 cursor-move p-1' },
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
