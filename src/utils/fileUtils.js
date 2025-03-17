const fs = require('fs').promises;
const fsSync = require('fs');

// 安全删除文件函数
async function safeDeleteFile(filePath) {
    try {
        if (fsSync.existsSync(filePath)) {
            await fs.unlink(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('删除文件失败:', error);
        return false;
    }
}

module.exports = {
    safeDeleteFile,
};
