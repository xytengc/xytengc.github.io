// 修改后的 waifu-common.js
document.addEventListener('DOMContentLoaded', function() {
    // ========== 配置部分 ==========
    // 设置你的网站根目录路径
    const BASE_PATH = '/live2d/';
    const ASSETS_PATH = BASE_PATH + 'assets/';
    
    // 保存看板娘状态的 key
    const WAIFU_STATE_KEY = 'waifu_state_v2';
    
    // ========== 1. 检查并加载 jQuery ==========
    function loadJQuery(callback) {
        if (typeof jQuery === 'undefined') {
            const jqScript = document.createElement('script');
            // 使用绝对路径
            jqScript.src = ASSETS_PATH + "jquery.min.js?v=3.3.1";
            jqScript.onload = callback;
            jqScript.onerror = function() {
                console.error('加载jQuery失败，尝试备用路径');
                // 备用路径
                jqScript.src = BASE_PATH + "assets/jquery.min.js?v=3.3.1";
                jqScript.onload = callback;
            };
            document.body.appendChild(jqScript);
        } else {
            callback();
        }
    }

    // ========== 2. 检查并加载 jQuery UI ==========
    function loadJQueryUI(callback) {
        if (typeof jQuery.ui === 'undefined') {
            const uiScript = document.createElement('script');
            // 使用绝对路径
            uiScript.src = ASSETS_PATH + "jquery-ui.min.js?v=1.12.1";
            uiScript.onload = callback;
            uiScript.onerror = function() {
                console.error('加载jQuery UI失败，尝试备用路径');
                uiScript.src = BASE_PATH + "assets/jquery-ui.min.js?v=1.12.1";
                jqScript.onload = callback;
            };
            document.body.appendChild(uiScript);
        } else {
            callback();
        }
    }

    // ========== 3. 自动创建看板娘 DOM ==========
    function createWaifuDOM() {
        if (document.getElementById('live2d')) return;
        
        // 尝试加载保存的位置
        let savedStyle = '';
        try {
            const saved = localStorage.getItem(WAIFU_STATE_KEY);
            if (saved) {
                const state = JSON.parse(saved);
                if (state.position) {
                    savedStyle = `style="left: ${state.position.x}px; top: ${state.position.y}px;"`;
                }
            }
        } catch (e) {
            console.log('加载看板娘状态失败:', e);
        }
        
        const waifuDOM = `
            <div class="waifu">
                <div class="waifu-tips"></div>
                <canvas id="live2d" class="live2d"></canvas>
                <div class="waifu-tool">
                    <span class="fui-home"></span>
                    <span class="fui-chat"></span>
                    <span class="fui-eye"></span>
                    <span class="fui-user"></span>
                    <span class="fui-photo"></span>
                    <span class="fui-info-circle"></span>
                    <span class="fui-cross"></span>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', waifuDOM);
        
        // 保存看板娘引用
        window.waifuElement = document.querySelector('.waifu');
    }

    // ========== 4. 加载 Live2D 核心脚本 ==========
    function initLive2D() {
        // 加载脚本函数
        const loadScript = (src, callback) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = callback;
            script.onerror = function() {
                console.error('加载失败:', src);
                // 尝试使用相对于网站根目录的路径
                const newSrc = src.startsWith('/') ? src : BASE_PATH + src.replace('./', '');
                console.log('尝试备用路径:', newSrc);
                script.src = newSrc;
            };
            document.body.appendChild(script);
        };

        // 加载 waifu-tips.js
        loadScript(ASSETS_PATH + "waifu-tips.min.js?v=1.4.2", () => {
            // 加载 live2d.js
            loadScript(ASSETS_PATH + "live2d.min.js?v=1.0.5", () => {
                // 初始化参数
                window.live2d_settings = window.live2d_settings || {};
                Object.assign(live2d_settings, {
                        'modelId': 1,                  // 默认模型 ID
                        'modelTexturesId': 2,          // 默认材质 ID
                        'modelStorage': false,         // 不储存模型 ID
                        'canCloseLive2d': false,       // 隐藏 关闭看板娘 按钮
                        'canTurnToHomePage': false,    // 隐藏 返回首页 按钮
                        'waifuEdgeSide': 'left:0',      // 贴边方向：left:0 或 right:0
                        'waifuEdgeSize': 20,             // 贴边距离（像素）
                        'waifuDraggable': 'axis-x',   // 拖拽限制：'unlimited'（随意拖）| 'axis-x'（水平拖）| 'axis-y'（垂直拖）| 'none'（不可拖）
                        // 尺寸配置
                        'waifuSize': '300x250',          // 看板娘尺寸：宽度x高度
                        'waifuTipsSize': '370x80',       // 提示框尺寸
                        'waifuTipsWidth': 370,           // 提示框宽度
                        'waifuTipsHeight': 80,           // 提示框高度
                        
                        // 其他配置
                        'waifuFontSize': '16px',         // 提示文字大小
                        'waifuToolFont': '20px',         // 工具栏图标大小
                        'waifuToolLine': '25px',         // 工具栏行高
                        'waifuToolTop': '-50px',         // 工具栏距离看板娘顶部的偏移
                        'waifuToolColor': '#66ccff'      // 工具栏图标颜色
                });
                
                // 加载模型配置（使用绝对路径）
                if (typeof initModel === 'function') {
                    // 修改 waifu-tips.js 中的 initModel 函数，让它使用绝对路径
                    patchInitModel();
                    initModel(ASSETS_PATH + "waifu-tips.json?v=1.4.2");
                } else {
                    console.error('initModel 函数未定义');
                }
                
                // 应用保存的模型
                applySavedModel();
            });
        });
    }
    
    // ========== 5. 修补 initModel 函数（重要！） ==========
    function patchInitModel() {
        if (window.initModel) {
            const originalInitModel = window.initModel;
            window.initModel = function(configPath) {
                console.log('加载看板娘配置文件:', configPath);
                return originalInitModel.call(this, configPath);
            };
        }
    }
    
    // ========== 6. 应用保存的模型 ==========
    function applySavedModel() {
        setTimeout(() => {
            try {
                const saved = localStorage.getItem(WAIFU_STATE_KEY);
                if (saved) {
                    const state = JSON.parse(saved);
                    if (state.modelId && window.changeModel) {
                        console.log('应用保存的模型:', state.modelId);
                        setTimeout(() => {
                            window.changeModel(state.modelId);
                        }, 1000);
                    }
                }
            } catch (e) {
                console.log('应用保存的模型失败:', e);
            }
        }, 500);
    }
    
    // ========== 7. 保存状态函数 ==========
    function saveWaifuState() {
        try {
            const waifu = document.querySelector('.waifu');
            if (!waifu) return;
            
            const rect = waifu.getBoundingClientRect();
            const state = {
                position: {
                    x: parseInt(waifu.style.left) || rect.left,
                    y: parseInt(waifu.style.top) || rect.top
                },
                timestamp: Date.now()
            };
            
            localStorage.setItem(WAIFU_STATE_KEY, JSON.stringify(state));
        } catch (e) {
            console.log('保存看板娘状态失败:', e);
        }
    }
    
    function saveModelSelection(modelId) {
        try {
            const saved = localStorage.getItem(WAIFU_STATE_KEY);
            const state = saved ? JSON.parse(saved) : {};
            state.modelId = modelId;
            localStorage.setItem(WAIFU_STATE_KEY, JSON.stringify(state));
        } catch (e) {
            console.log('保存模型选择失败:', e);
        }
    }

    // ========== 8. 主执行流程 ==========
    loadJQuery(() => {
        loadJQueryUI(() => {
            createWaifuDOM();
            initLive2D();
            
            // 绑定保存事件
            window.addEventListener('beforeunload', saveWaifuState);
            setInterval(saveWaifuState, 30000);
            
            // 监听模型切换
            setTimeout(() => {
                if (window.changeModel) {
                    const originalChangeModel = window.changeModel;
                    window.changeModel = function(modelId) {
                        originalChangeModel(modelId);
                        saveModelSelection(modelId);
                    };
                }
            }, 2000);
        });
    });
});