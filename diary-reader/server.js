const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/app/data';

// 静态文件
app.use(express.static(path.join(__dirname, 'src')));

// 日记数据 API
app.get('/api/diaries', (req, res) => {
    const yearsPath = path.join(DATA_DIR);

    if (!fs.existsSync(yearsPath)) {
        return res.json([]);
    }

    const years = fs.readdirSync(yearsPath)
        .filter(item => !item.startsWith('.'))
        .sort()
        .reverse();

    const diaries = [];

    for (const year of years) {
        const yearPath = path.join(yearsPath, year);
        const months = fs.readdirSync(yearPath)
            .filter(item => !item.startsWith('.'))
            .sort()
            .reverse();

        for (const month of months) {
            const monthPath = path.join(yearPath, month);
            const files = fs.readdirSync(monthPath)
                .filter(item => item.endsWith('.md'))
                .sort()
                .reverse();

            for (const file of files) {
                const filePath = path.join(monthPath, file);
                const stats = fs.statSync(filePath);
                diaries.push({
                    year,
                    month,
                    file,
                    path: filePath,
                    modified: stats.mtime,
                    size: stats.size
                });
            }
        }
    }

    res.json(diaries);
});

// 单篇日记内容
app.get('/api/diary/:year/:month/:file', (req, res) => {
    const { year, month, file } = req.params;
    
    // 移除 .md 后缀如果存在
    const fileName = file.endsWith('.md') ? file : file + '.md';
    const filePath = path.join(DATA_DIR, year, month, fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found', path: filePath });
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 搜索日记
app.get('/api/search', (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    const results = [];
    const years = fs.readdirSync(DATA_DIR)
        .filter(item => !item.startsWith('.'));

    for (const year of years) {
        const yearPath = path.join(DATA_DIR, year);
        const months = fs.readdirSync(yearPath)
            .filter(item => !item.startsWith('.'));

        for (const month of months) {
            const monthPath = path.join(yearPath, month);
            const files = fs.readdirSync(monthPath)
                .filter(item => item.endsWith('.md'));

            for (const file of files) {
                const filePath = path.join(monthPath, file);
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    if (content.toLowerCase().includes(q.toLowerCase())) {
                        results.push({
                            year,
                            month,
                            file,
                            path: filePath
                        });
                    }
                } catch (err) {
                    // Skip error files
                }
            }
        }
    }

    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Daily Diary Reader running at http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
});
