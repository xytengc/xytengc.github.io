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
    riseSpeed: 0.75,      // 向上移动速度（px/帧）
    speedJitter: 0.25,    // 速度随机浮动
    fontSize: 20,
    interval: 2200,       // 定时器触发间隔（毫秒）
    minGlobalInterval: 1800, // 全局最小发射间隔（毫秒）
    globalJitter: 700,    // 全局随机抖动（毫秒）
    sideCooldown: 2800,   // 单侧最小冷却（毫秒）
    sideCooldownJitter: 800,
    minSpawnGap: 120,     // 底部保护区，避免堆叠
    maxActivePerSide: 2,  // 每侧最大同时弹幕数量
    sidePadding: 18,      // 距离左右边缘像素
    sideWidthJitter: 36,  // 左右侧横向轻微随机
    fontFamily: "'STKaiti', 'SimSun', 'Microsoft YaHei', serif",
    colors: ['#FFD700', '#98FB98', '#87CEEB', '#FFB6C1', '#DDA0DD', '#FFA07A'],
    maxWidth: 300,
    opacity: 1,
    lineHeight: 1.2
};

// 全局变量
let container;
let barrageInterval;
let isPageVisible = true;
let activeBarrages = [];
let nextGlobalSpawnAt = 0;

let sideState = {
    left: { activeCount: 0, nextSpawnAt: 0 },
    right: { activeCount: 0, nextSpawnAt: 0 }
};

// 处理诗词文本，竖版显示
function processPoemText(text) {
    return text.replace(/\s+/g, '');
}

function initColumns() {
    sideState = {
        left: { activeCount: 0, nextSpawnAt: 0 },
        right: { activeCount: 0, nextSpawnAt: 0 }
    };
}

function isSideAvailable(sideKey) {
    const state = sideState[sideKey];
    if (!state) return false;
    if (Date.now() < state.nextSpawnAt) return false;
    if (state.activeCount >= barrageConfig.maxActivePerSide) return false;

    const bottomGuardLine = window.innerHeight - barrageConfig.minSpawnGap;
    const hasNearBottomBarrage = activeBarrages.some((barrage) => {
        return barrage.active && barrage.side === sideKey && barrage.top > bottomGuardLine;
    });
    return !hasNearBottomBarrage;
}

function removeBarrageState(barrageState) {
    if (!barrageState || !barrageState.active) return;

    barrageState.active = false;
    if (barrageState.element && barrageState.element.parentNode === container) {
        container.removeChild(barrageState.element);
    }

    const state = sideState[barrageState.side];
    if (state) {
        state.activeCount = Math.max(0, state.activeCount - 1);
    }

    const activeIndex = activeBarrages.findIndex((item) => item.id === barrageState.id);
    if (activeIndex !== -1) {
        activeBarrages.splice(activeIndex, 1);
    }
}

function animateBarrage(barrageState) {
    function move() {
        if (!barrageState.active) return;
        if (!isPageVisible) {
            requestAnimationFrame(move);
            return;
        }

        barrageState.top -= barrageState.speed;
        barrageState.element.style.top = `${barrageState.top}px`;

        if (barrageState.top < -barrageState.height - 40) {
            removeBarrageState(barrageState);
            return;
        }

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}

// 为指定侧创建弹幕（左右两侧，从下向上）
function createBarrageForSide(poem, color, sideKey) {
    const barrage = document.createElement('div');

    // 设置弹幕样式
    barrage.style.cssText = `
        position: absolute;
        max-width: ${barrageConfig.maxWidth}px;
        width: auto;
        font-size: ${barrageConfig.fontSize}px;
        color: ${color};
        opacity: 0;
        left: 0;
        top: 0;
        font-family: ${barrageConfig.fontFamily};
        font-weight: normal;
        pointer-events: none;
        user-select: none;
        line-height: ${barrageConfig.lineHeight};
        writing-mode: vertical-rl;
        text-orientation: upright;
        white-space: normal;
        letter-spacing: 2px;
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.5), 1px 1px 3px rgba(0, 0, 0, 0.6), -1px 1px 3px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transition: opacity 1s ease-in-out;
    `;
    
    // 设置弹幕内容
    barrage.innerHTML = processPoemText(poem);
    container.appendChild(barrage);
    
    // 计算尺寸与起始位置
    setTimeout(() => {
        const width = barrage.offsetWidth;
        const height = barrage.offsetHeight;

        const isLeft = sideKey === 'left';
        const edgeJitter = Math.random() * barrageConfig.sideWidthJitter;
        const left = isLeft
            ? barrageConfig.sidePadding + edgeJitter
            : window.innerWidth - width - barrageConfig.sidePadding - edgeJitter;
        const top = window.innerHeight + 20;
        const speed = barrageConfig.riseSpeed + Math.random() * barrageConfig.speedJitter;

        // 创建弹幕状态
        const barrageId = Date.now() + Math.random();
        const barrageState = {
            id: barrageId,
            element: barrage,
            side: sideKey,
            left: left,
            top: top,
            width: width,
            height: height,
            speed: speed,
            active: true
        };

        // 设置初始定位
        barrage.style.left = `${left}px`;
        barrage.style.top = `${top}px`;

        const state = sideState[sideKey];
        if (state) {
            state.activeCount += 1;
            state.nextSpawnAt = Date.now() + barrageConfig.sideCooldown + Math.random() * barrageConfig.sideCooldownJitter;
        }

        // 添加到活跃弹幕列表
        activeBarrages.push(barrageState);

        // 渐入效果
        setTimeout(() => {
            barrage.style.opacity = barrageConfig.opacity;
        }, 100);

        // 启动动画
        animateBarrage(barrageState);
    }, 10);
}

// 创建单个弹幕
function createBarrage() {
    if (!isPageVisible || !container) return;

    const now = Date.now();
    if (now < nextGlobalSpawnAt) return;

    const availableSides = [];
    if (isSideAvailable('left')) availableSides.push('left');
    if (isSideAvailable('right')) availableSides.push('right');
    if (availableSides.length === 0) return;

    const sideKey = availableSides[Math.floor(Math.random() * availableSides.length)];
    const poem = poems[Math.floor(Math.random() * poems.length)];
    const color = barrageConfig.colors[Math.floor(Math.random() * barrageConfig.colors.length)];

    nextGlobalSpawnAt = now + barrageConfig.minGlobalInterval + Math.random() * barrageConfig.globalJitter;
    createBarrageForSide(poem, color, sideKey);
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
    } else {
        isPageVisible = true;
        if (!barrageInterval) {
            barrageInterval = setInterval(() => {
                createBarrage();
            }, barrageConfig.interval);
        }
    }
}

// 处理窗口大小变化
function handleResize() {
    activeBarrages.forEach((barrage) => {
        if (!barrage.active || !barrage.element) return;

        const isLeft = barrage.side === 'left';
        const width = barrage.width || barrage.element.offsetWidth;
        const edgeJitter = Math.random() * barrageConfig.sideWidthJitter;

        barrage.left = isLeft
            ? barrageConfig.sidePadding + edgeJitter
            : window.innerWidth - width - barrageConfig.sidePadding - edgeJitter;

        barrage.element.style.left = `${barrage.left}px`;
    });
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
        activeBarrages = [];
        initColumns();
    }
};

// 页面加载完成后启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBarrageSystem);
} else {
    initBarrageSystem();
}
