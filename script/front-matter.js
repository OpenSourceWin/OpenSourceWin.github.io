const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../source/_data/rankingList.json');
const SOURCE_DIR = path.join(__dirname, '../source');

// 读取 JSON 数据
async function readRankingData(year) {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const rankings = JSON.parse(data);
    return rankings.find(yearData => yearData.year === year);
}

// 更新 Front-matter
async function updateFrontMatter(login, githubId, githubAvatar) {
    const dirPath = path.join(SOURCE_DIR, login);
    const indexPath = path.join(dirPath, 'index.md');

    let frontMatter = `---
github_id: ${githubId}
github_avatar: ${githubAvatar}
---\n\n# ${login}\n\n`;

    try {
        // 如果文件存在，读取并更新 Front-matter
        const content = await fs.readFile(indexPath, 'utf-8');

        // 检查并更新字段
        if (content.includes('github_id:') && content.includes('github_avatar:')) {
            // 更新现有的 Front-matter
            const updatedContent = content.replace(/github_id: .*/g, `github_id: ${githubId}`)
                                           .replace(/github_avatar: .*/g, `github_avatar: ${githubAvatar}`);
            await fs.writeFile(indexPath, updatedContent, 'utf-8');
            console.log(`Updated index.md for ${login}`);
        } else {
            // 追加新字段
            const newContent = frontMatter + content;
            await fs.writeFile(indexPath, newContent, 'utf-8');
            console.log(`Added fields to index.md for ${login}`);
        }
    } catch (error) {
        // 文件不存在，创建目录和文件
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(indexPath, frontMatter, 'utf-8');
        console.log(`Generated new index.md for ${login}`);
    }
}

// 主函数
async function main(year) {
    try {
        const rankingsData = await readRankingData(year);

        if (!rankingsData) {
            console.error(`Year ${year} not found in the data.`);
            return;
        }

        for (const item of rankingsData.annualRanking) {
            const { login, github_id, github_avatar } = item;

            // 更新 Front-matter
            await updateFrontMatter(login, github_id, github_avatar);
        }
        
        console.log(`All index.md files processed for the year ${year}.`);
    } catch (error) {
        console.error('Error:', error);
    }
}

// 执行主程序
main(2024);