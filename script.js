// 页面加载完成后执行
window.onload = function() {
    // 给所有 section 添加渐入动画
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // 逐个显示，增加延迟
        setTimeout(() => {
            section.style.opacity = 1;
            section.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });

    // 创建回到顶部按钮
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fa fa-arrow-up"></i>';
    backToTopBtn.style.position = 'fixed';
    backToTopBtn.style.bottom = '30px';
    backToTopBtn.style.right = '30px';
    backToTopBtn.style.padding = '10px 15px';
    backToTopBtn.style.border = 'none';
    backToTopBtn.style.borderRadius = '50%';
    backToTopBtn.style.backgroundColor = '#3498db';
    backToTopBtn.style.color = 'white';
    backToTopBtn.style.fontSize = '1.2rem';
    backToTopBtn.style.cursor = 'pointer';
    backToTopBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    backToTopBtn.style.opacity = 0;
    backToTopBtn.style.transition = 'opacity 0.3s';
    backToTopBtn.style.zIndex = '999';
    document.body.appendChild(backToTopBtn);

    // 滚动时显示/隐藏回到顶部按钮
    window.onscroll = function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = 1;
        } else {
            backToTopBtn.style.opacity = 0;
        }
    };

    // 点击回到顶部
    backToTopBtn.onclick = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
};
