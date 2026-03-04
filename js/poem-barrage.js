// 文件：poem-barrage.js
// 诗词数据
const poems = [
    "求不得，放不下，梧桐化成杖，孤走枯苍道。",
    "诸法因缘生，我说是因缘；因缘尽故灭，我作如是说。",
    "街喧闹，人过往，且记曾相识，不为少年留。",
    "一落红，一枯叶，落红离弦去，从此两难聚。",
    "若人造重罪，作已深自责；忏悔更不造，能拔根本业。",
    "一切有为法，如梦幻泡影，如露亦如电，应作如是观。",
    "落黄昏，三更雨，临行密密缝，离愁丝丝苦。",
    "我本因地，以念佛心，入无生忍，今于此界，摄念佛人，归于净土。",
    "人离合，月圆缺，花开又花谢，不愿再相逢。",
    "花映红，春风笑，佳人佩美坠，不知与谁同。",
    "风过处，百花残，心有意，爱无伤。",
    "损愁眉，哭断肠，待到佳期如梦。",
    "凝霜夜，幽香梦，枕边人赴烽火，吹起一帘牵挂。",
    "当舍于懈怠，远离诸愦闹；寂静常知足，是人当解脱。",
    "倾盆雨，惊天雷，众里寻他而去。",
    "碧天阔，白云散，百万里无硝烟，大雁向南飞去。",
    "汝修三昧，本出尘劳。淫心不除，尘不可出。",
    "龙吟恨，且回首，却在灯火阑珊。",
    "菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。",
    "马行处，雪无痕，相见难，别亦难。",
    "珠有泪，玉生烟，稀白头不胜簪，只是当时惘然。",
    "魔非魔，念人间，怎知情愁滋味。",
    "人间道，路远茫，相逢终有期。",
    "人间如梦，红尘万丈，劈不断相思情。",
    "挽金弓，如满月，望人间，凝伫久。",
    "一种相思，两处闲愁，火焰化红莲，此情自消衍。",
    "恨悠悠，几时休。爱轻轻，随风行。",
    "殿可毁，人可亡，恨犹在，何时还。",
    "英雄泪，只为江山。万里山河，千里孤城，破国恨，永难忘。",
    "心若顽石，不生多情，多情空于恨，此恨无绝期。",
    "风卷云残，俱消往昔，既然无缘，何立誓言。",
    "彼岸花，有花无叶，生生世世，永不相见；幻七彩，无生无死，无苦无悲，无欲无求。"
];

// 弹幕配置
const barrageConfig = {
    speed: 0.5,          // 横向移动速度
    fontSize: 20,      // 字体大小
    interval: 2000,    // 弹幕生成间隔(毫秒)
    fontFamily: "'STKaiti', 'SimSun', 'Microsoft YaHei', serif",
    colors: ['#FFD700', '#98FB98', '#87CEEB', '#FFB6C1', '#DDA0DD', '#FFA07A'],
    maxWidth: 300,      // 弹幕最大宽度
    opacity: 1,        // 透明度
    lineHeight: 1.2,    // 行高
    columns: 1,         // 列数
    columnCooldown: 5000 // 列冷却时间(毫秒)
};

// 全局变量
let container;
let barrageInterval;
let leftColumns = [];
let rightColumns = [];
let leftColumnCooldowns = [];
let rightColumnCooldowns = [];
let isPageVisible = true;
let activeBarrages = [];

// 处理诗词文本，实现横向格式
function processPoemText(text) {
    // 保持原文格式，不添加额外的换行
    return text;
}

// 初始化列数组
function initColumns() {
    // 初始化左侧列数组
    leftColumns = [];
    leftColumnCooldowns = [];
    
    // 初始化右侧列数组
    rightColumns = [];
    rightColumnCooldowns = [];
    
    // 为每侧创建指定数量的列
    const columnCount = Math.max(1, barrageConfig.columns);
    
    for (let i = 0; i < columnCount; i++) {
        leftColumns[i] = [];
        leftColumnCooldowns[i] = 0;
        rightColumns[i] = [];
        rightColumnCooldowns[i] = 0;
    }
}

// 检查列是否可用
function isColumnAvailable(columnIndex, isLeft) {
    const cooldowns = isLeft ? leftColumnCooldowns : rightColumnCooldowns;
    // 确保 cooldowns 数组存在且索引有效
    if (!cooldowns || columnIndex < 0 || columnIndex >= cooldowns.length) {
        return true;
    }
    return Date.now() >= cooldowns[columnIndex];
}

// 计算新弹幕的起始位置
function calculateStartPosition(columnIndex, isLeft, height) {
    const columns = isLeft ? leftColumns : rightColumns;
    const positions = columns[columnIndex] || [];
    
    if (positions.length === 0) {
        return -height - 50;
    }
    
    // 找到最底部的弹幕位置
    const bottomMost = Math.max(...positions);
    
    // 计算新弹幕的起始位置，确保与底部弹幕有足够的间距
    let startPos = bottomMost + height * 1.5;
    
    // 确保起始位置在屏幕外
    if (startPos > 0) {
        startPos = -height - 50;
    }
    
    return startPos;
}

// 为指定侧创建弹幕
function createBarrageForSide(poem, color, isLeft) {
    const columnIndex = 0;
    const columns = isLeft ? leftColumns : rightColumns;
    
    const barrage = document.createElement('div');
    
    // 设置弹幕样式
    barrage.style.cssText = `
        position: absolute;
        max-width: ${barrageConfig.maxWidth}px;
        width: auto;
        font-size: ${barrageConfig.fontSize}px;
        color: ${color};
        opacity: 0;
        ${isLeft ? 'left: -300px; right: auto;' : 'right: -300px; left: auto;'}
        top: ${Math.random() * (window.innerHeight - 100)}px;
        font-family: ${barrageConfig.fontFamily};
        font-weight: normal;
        pointer-events: none;
        user-select: none;
        line-height: ${barrageConfig.lineHeight};
        white-space: nowrap;
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.5), 1px 1px 3px rgba(0, 0, 0, 0.6), -1px 1px 3px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transition: opacity 1s ease-in-out;
    `;
    
    // 设置弹幕内容
    barrage.innerHTML = processPoemText(poem);
    container.appendChild(barrage);
    
    // 计算弹幕宽度
    setTimeout(() => {
        const width = barrage.offsetWidth;
        const height = barrage.offsetHeight;
        
        // 设置初始位置
        let left = isLeft ? -width : window.innerWidth;
        const speed = isLeft ? barrageConfig.speed : -barrageConfig.speed;
        
        // 计算总距离和时间
        const totalDistance = isLeft ? window.innerWidth + width : window.innerWidth + width;
        const totalTime = totalDistance / Math.abs(speed);
        
        // 总冷却时间 = 动画时间 + 额外1秒
        const totalCooldownTime = totalTime * 1000 + barrageConfig.columnCooldown;
        
        // 创建弹幕状态
        const barrageId = Date.now() + Math.random();
        const barrageState = {
            id: barrageId,
            element: barrage,
            left: left,
            width: width,
            height: height,
            columnIndex: columnIndex,
            isLeft: isLeft,
            totalTime: totalTime,
            totalCooldownTime: totalCooldownTime,
            speed: speed,
            active: true
        };
        
        // 添加到活跃弹幕列表
        activeBarrages.push(barrageState);
        
        // 渐入效果
        setTimeout(() => {
            barrage.style.opacity = barrageConfig.opacity;
        }, 100);
        
        // 动画函数
        function move() {
            if (!isPageVisible || !barrageState.active) return;
            
            // 更新位置
            barrageState.left += barrageState.speed;
            barrage.style.left = `${barrageState.left}px`;
            
            // 检查是否超出屏幕
            if ((isLeft && barrageState.left > window.innerWidth) || (!isLeft && barrageState.left < -barrageState.width)) {
                // 移除弹幕元素
                if (barrage.parentNode === container) {
                    container.removeChild(barrage);
                }
                
                // 设置冷却时间
                const cooldowns = isLeft ? leftColumnCooldowns : rightColumnCooldowns;
                if (cooldowns) {
                    cooldowns[columnIndex] = Date.now() + totalCooldownTime;
                }
                
                // 从活跃弹幕列表中移除
                const activeIndex = activeBarrages.findIndex(b => b.id === barrageId);
                if (activeIndex !== -1) {
                    activeBarrages.splice(activeIndex, 1);
                }
                
                // 标记为非活跃
                barrageState.active = false;
            } else {
                // 继续动画
                requestAnimationFrame(move);
            }
        }
        
        // 启动动画
        requestAnimationFrame(move);
    }, 10);
}

// 创建单个弹幕
function createBarrage() {
    if (!isPageVisible || !container) return;
    
    const poem = poems[Math.floor(Math.random() * poems.length)];
    const color = barrageConfig.colors[Math.floor(Math.random() * barrageConfig.colors.length)];
    
    // 随机选择左侧或右侧
    const isLeft = Math.random() > 0.5;
    
    // 为选定侧创建弹幕
    createBarrageForSide(poem, color, isLeft);
}

// 初始化弹幕系统
function initBarrageSystem() {
    // 创建弹幕容器
    container = document.createElement('div');
    container.id = 'poem-barrage';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
    `;
    document.body.appendChild(container);
    
    // 初始化列数组
    initColumns();
    
    // 设置弹幕生成间隔
    barrageInterval = setInterval(() => {
        createBarrage();
    }, barrageConfig.interval);
    
    // 初始生成弹幕
    setTimeout(createBarrage, 1000);
    
    // 监听窗口大小变化和页面可见性变化
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// 处理页面可见性变化
function handleVisibilityChange() {
    if (document.hidden) {
        isPageVisible = false;
        if (barrageInterval) {
            clearInterval(barrageInterval);
            barrageInterval = null;
        }
        // 暂停所有活跃弹幕的动画
        activeBarrages.forEach(barrage => {
            barrage.active = false;
        });
    } else {
        isPageVisible = true;
        if (!barrageInterval) {
            barrageInterval = setInterval(() => {
                createBarrage();
            }, barrageConfig.interval);
        }
        // 重新启动所有活跃弹幕的动画
        activeBarrages.forEach(barrage => {
            if (barrage.active === false && barrage.element) {
                barrage.active = true;
                // 重新启动动画
                function resumeMove() {
                    if (!isPageVisible || !barrage.active) return;
                    
                    barrage.left += barrage.speed;
                    barrage.element.style.left = `${barrage.left}px`;
                    
                    if ((barrage.isLeft && barrage.left > window.innerWidth) || (!barrage.isLeft && barrage.left < -barrage.width)) {
                        if (barrage.element.parentNode === container) {
                            container.removeChild(barrage.element);
                        }
                        
                        const cooldowns = barrage.isLeft ? leftColumnCooldowns : rightColumnCooldowns;
                        if (cooldowns) {
                            cooldowns[barrage.columnIndex] = Date.now() + barrage.totalCooldownTime;
                        }
                        
                        const activeIndex = activeBarrages.findIndex(b => b.id === barrage.id);
                        if (activeIndex !== -1) {
                            activeBarrages.splice(activeIndex, 1);
                        }
                        
                        barrage.active = false;
                    } else {
                        requestAnimationFrame(resumeMove);
                    }
                }
                requestAnimationFrame(resumeMove);
            }
        });
    }
}

// 处理窗口大小变化
function handleResize() {
    // 可以在这里添加响应式调整
}

// 公共API
window.poemBarrage = {
    addPoem: function(poem) {
        if (typeof poem === 'string' && poem.trim()) {
            poems.push(poem.trim());
        }
    },
    
    updateConfig: function(newConfig) {
        Object.assign(barrageConfig, newConfig);
        
        if (newConfig.interval && barrageInterval) {
            clearInterval(barrageInterval);
            barrageInterval = setInterval(() => {
                createBarrage();
            }, barrageConfig.interval);
        }
    },
    
    pause: function() {
        if (barrageInterval) {
            clearInterval(barrageInterval);
            barrageInterval = null;
        }
    },
    
    resume: function() {
        if (!barrageInterval) {
            barrageInterval = setInterval(() => {
                createBarrage();
            }, barrageConfig.interval);
        }
    },
    
    clear: function() {
        if (container) {
            const barrages = container.querySelectorAll('div');
            barrages.forEach(barrage => {
                if (barrage.parentNode === container) {
                    container.removeChild(barrage);
                }
            });
        }
    }
};

// 页面加载完成后启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBarrageSystem);
} else {
    initBarrageSystem();
}
