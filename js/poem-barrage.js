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
    speed: 1.15,             // 从右向左移动速度（px/帧）
    fontSize: 20,
    interval: 420,           // 调度器检查间隔（毫秒）
    minGlobalInterval: 520,  // 全局最小发射间隔（毫秒）
    globalJitter: 180,
    lanePaddingTop: 80,
    lanePaddingBottom: 80,
    laneGap: 8,
    spawnOffset: 24,         // 初始在屏幕右侧之外的偏移
    minSpawnGap: 160,        // 同行最小安全距离
    fontFamily: "'STKaiti', 'SimSun', 'Microsoft YaHei', serif",
    colors: ['#FFD700', '#98FB98', '#87CEEB', '#FFB6C1', '#DDA0DD', '#FFA07A'],
    maxWidth: 420,
    opacity: 1,
    lineHeight: 1.2
};

// 全局变量
let container;
let barrageInterval;
let isPageVisible = true;
let activeBarrages = [];
let nextGlobalSpawnAt = 0;
let laneStates = [];
let laneHeight = 0;

// 保持横排文本
function processPoemText(text) {
    return text;
}

function initLanes() {
    laneHeight = Math.ceil(barrageConfig.fontSize * barrageConfig.lineHeight + barrageConfig.laneGap);
    const usableHeight = Math.max(120, window.innerHeight - barrageConfig.lanePaddingTop - barrageConfig.lanePaddingBottom);
    const laneCount = Math.max(1, Math.floor(usableHeight / laneHeight));

    laneStates = Array.from({ length: laneCount }, () => ({
        nextSpawnAt: 0
    }));
}

function laneTopByIndex(laneIndex) {
    return barrageConfig.lanePaddingTop + laneIndex * laneHeight;
}

function isLaneAvailable(laneIndex, now) {
    const laneState = laneStates[laneIndex];
    if (!laneState) return false;
    if (now < laneState.nextSpawnAt) return false;

    const spawnGuardX = window.innerWidth - barrageConfig.minSpawnGap;
    const hasNearSpawnBarrage = activeBarrages.some((barrage) => {
        if (!barrage.active || barrage.lane !== laneIndex) return false;
        return barrage.x + barrage.width > spawnGuardX;
    });

    return !hasNearSpawnBarrage;
}

function removeBarrageState(barrageState) {
    if (!barrageState || !barrageState.active) return;

    barrageState.active = false;
    if (barrageState.element && barrageState.element.parentNode === container) {
        container.removeChild(barrageState.element);
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

        barrageState.x -= barrageState.speed;
        barrageState.element.style.left = `${barrageState.x}px`;

        if (barrageState.x < -barrageState.width - 40) {
            removeBarrageState(barrageState);
            return;
        }

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}

function createBarrageInLane(poem, color, laneIndex) {
    const barrage = document.createElement('div');
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
        white-space: nowrap;
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.5), 1px 1px 3px rgba(0, 0, 0, 0.6), -1px 1px 3px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transition: opacity 0.6s ease-in-out;
    `;

    barrage.textContent = processPoemText(poem);
    container.appendChild(barrage);

    setTimeout(() => {
        const width = barrage.offsetWidth;
        const x = window.innerWidth + barrageConfig.spawnOffset;
        const y = laneTopByIndex(laneIndex);
        const speed = barrageConfig.speed;

        const barrageState = {
            id: Date.now() + Math.random(),
            element: barrage,
            lane: laneIndex,
            x: x,
            y: y,
            width: width,
            speed: speed,
            active: true
        };

        barrage.style.left = `${x}px`;
        barrage.style.top = `${y}px`;

        // 依据速度与宽度计算该行下一次可安全发射时间，避免同行重叠。
        const travelPx = barrageConfig.spawnOffset + width + barrageConfig.minSpawnGap;
        const safeMs = Math.ceil((travelPx / speed) * 16.67);
        laneStates[laneIndex].nextSpawnAt = Date.now() + safeMs;

        activeBarrages.push(barrageState);

        setTimeout(() => {
            barrage.style.opacity = barrageConfig.opacity;
        }, 80);

        animateBarrage(barrageState);
    }, 10);
}

function createBarrage() {
    if (!isPageVisible || !container) return;

    const now = Date.now();
    if (now < nextGlobalSpawnAt) return;

    const availableLanes = [];
    for (let i = 0; i < laneStates.length; i++) {
        if (isLaneAvailable(i, now)) {
            availableLanes.push(i);
        }
    }

    if (availableLanes.length === 0) return;

    const laneIndex = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const poem = poems[Math.floor(Math.random() * poems.length)];
    const color = barrageConfig.colors[Math.floor(Math.random() * barrageConfig.colors.length)];

    nextGlobalSpawnAt = now + barrageConfig.minGlobalInterval + Math.random() * barrageConfig.globalJitter;
    createBarrageInLane(poem, color, laneIndex);
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
    
    // 初始化行道
    initLanes();
    
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
    initLanes();
    activeBarrages.forEach((barrage) => {
        if (!barrage.active || !barrage.element) return;
        barrage.y = laneTopByIndex(Math.min(barrage.lane, laneStates.length - 1));
        barrage.element.style.top = `${barrage.y}px`;
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
        initLanes();
    }
};

// 页面加载完成后启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBarrageSystem);
} else {
    initBarrageSystem();
}
