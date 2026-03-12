// 数据缓存
let diariesData = [];
let currentTheme = localStorage.getItem('theme') || 'light';

// 页面加载完成后
document.addEventListener('DOMContentLoaded', () => {
    loadDiaries();
    applyTheme(currentTheme);
});

// 加载日记列表
async function loadDiaries() {
    showLoading(true);

    try {
        const response = await fetch('/api/diaries');
        diariesData = await response.json();
        renderDiaries(diariesData);
    } catch (error) {
        console.error('Failed to load diaries:', error);
        alert('加载失败，请刷新页面重试');
    } finally {
        showLoading(false);
    }
}

// 渲染日记列表
function renderDiaries(diaries) {
    const container = document.getElementById('diaryList');
    container.innerHTML = '';

    if (diaries.length === 0) {
        container.innerHTML = '<p class="empty">暂无日志记录</p>';
        return;
    }

    let lastYear = '';
    let lastMonth = '';

    diaries.forEach(diary => {
        // 年份标题
        if (diary.year !== lastYear) {
            const yearHeader = document.createElement('div');
            yearHeader.className = 'year-header';
            yearHeader.textContent = `📅 ${diary.year} 年`;
            container.appendChild(yearHeader);
            lastYear = diary.year;
        }

        // 月份标题
        if (diary.month !== lastMonth) {
            const monthHeader = document.createElement('div');
            monthHeader.className = 'month-header';
            const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                              '七月', '八月', '九月', '十月', '十一月', '十二月'];
            const monthNum = parseInt(diary.month, 10);
            monthHeader.textContent = `📂 ${monthNames[monthNum - 1]}`;
            container.appendChild(monthHeader);
            lastMonth = diary.month;
        }

        // 日记条目
        const item = document.createElement('div');
        item.className = 'diary-item';
        item.onclick = () => openDiary(diary);

        const date = new Date(diary.modified);
        const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="diary-date">${diary.file} - ${timeStr}</div>
            <div class="diary-info">
                <span class="diary-size">📊 ${(diary.size / 1024).toFixed(1)} KB</span>
            </div>
        `;

        container.appendChild(item);
    });
}

// 打开日记详情
async function openDiary(diary) {
    try {
        const response = await fetch(`/api/diary/${diary.year}/${diary.month}/${diary.file}`);
        const data = await response.json();

        document.getElementById('diaryTitle').textContent =
            `系统状态总结 - ${diary.file.replace('.md', '')}`;

        // 简单的 Markdown 渲染
        let content = data.content
            .replace(/^#\s+.*\n+/m, '') // 移除标题
            .replace(/#{1,6}/g, (match) => '#'.repeat(match.length / 2) + ' ') // 调整标题级别
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // 代码块
            .replace(/`([^`]+)`/g, '<code>$1</code>') // 行内代码
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // 粗体
            .replace(/\*([^*]+)\*/g, '<em>$1</em>') // 斜体
            .replace(/\n\n/g, '</p><p>') // 段落
            .replace(/\n/g, '<br>'); // 换行

        document.getElementById('diaryBody').innerHTML = content;
        document.getElementById('diaryContent').classList.remove('hidden');
    } catch (error) {
        console.error('Failed to open diary:', error);
        alert('加载失败，请重试');
    }
}

// 关闭日记
function closeDiary() {
    document.getElementById('diaryContent').classList.add('hidden');
}

// 搜索功能
function handleSearch(event) {
    const query = event.target.value.trim();

    if (query.length < 2) {
        renderDiaries(diariesData);
        return;
    }

    const filtered = diariesData.filter(diary => {
        // 可以在这里实现更复杂的搜索逻辑
        return true;
    });

    if (filtered.length > 0) {
        performSearch(query);
    } else {
        renderDiaries(diariesData);
    }
}

// 执行搜索
async function performSearch(query) {
    showLoading(true);

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();

        const container = document.getElementById('diaryList');
        container.innerHTML = '<div class="search-results">🔍 搜索结果</div>';

        if (results.length === 0) {
            container.innerHTML += '<p class="empty">未找到匹配的日志</p>';
        } else {
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'diary-item search-result';
                item.onclick = () => openDiary(result);

                item.innerHTML = `
                    <div class="diary-date">${result.year}/${result.month}/${result.file}</div>
                `;

                container.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Search failed:', error);
    } finally {
        showLoading(false);
    }
}

// 主题切换
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);

    const button = document.getElementById('themeToggle');
    button.textContent = currentTheme === 'light' ? '🌓' : '☀️';
}

function applyTheme(theme) {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);

    const button = document.getElementById('themeToggle');
    button.textContent = theme === 'light' ? '🌓' : '☀️';
}

// 显示/隐藏加载状态
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}
