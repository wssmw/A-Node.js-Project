const noteService = require('../service/note.service');
const {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
} = require('../utils');

class NoteController {
    async create(ctx) {
        try {
            const { title, content, weather, note_time } = ctx.request.body;
            const { id: userId } = ctx.userinfo;
            if (!title || !content || !note_time || !weather) {
                ctx.status = 400;
                ctx.body = {
                    code: 400,
                    message: '标题、内容、时间、天气不能为空',
                };
                return;
            }
            const result = await noteService.createNote({
                title,
                content,
                weather,
                note_time,
                userId,
            });
            handeleSuccessReturnMessage(ctx, '小记创建成功', { id: result.id });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    async getById(ctx) {
        try {
            const { id } = ctx.request.body;
            const { id: userId } = ctx.userinfo;
            console.log(id, userId, 'id, userId');
            const note = await noteService.getNoteById(id, userId);
            if (!note) {
                ctx.status = 404;
                ctx.body = { code: 404, message: '小记不存在' };
                return;
            }
            handeleSuccessReturnMessage(ctx, '获取成功', note);
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    async list(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { page = 1, pageSize = 10, title } = ctx.request.body;
            const { notes, total } = await noteService.getNotesByUser(
                userId,
                title,
                page,
                pageSize
            );
            handeleSuccessReturnMessage(ctx, '获取成功', {
                notes,
                total,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    async update(ctx) {
        try {
            const { id } = ctx.request.body;
            const { id: userId } = ctx.userinfo;
            const { title, content, weather, note_time } = ctx.request.body;
            console.log(
                id,
                userId,
                title,
                content,
                weather,
                note_time,
                'id, userId, title, content, weather, note_time'
            );
            const success = await noteService.updateNote(id, userId, {
                title,
                content,
                weather,
                note_time,
            });
            if (!success) {
                ctx.status = 404;
                ctx.body = { code: 404, message: '小记不存在或无权限' };
                return;
            }
            handeleSuccessReturnMessage(ctx, '更新成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    async delete(ctx) {
        try {
            const { id } = ctx.request.body;
            const { id: userId } = ctx.userinfo;
            const success = await noteService.deleteNote(id, userId);
            if (!success) {
                ctx.status = 404;
                ctx.body = { code: 404, message: '小记不存在或无权限' };
                return;
            }
            handeleSuccessReturnMessage(ctx, '删除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }
}

module.exports = new NoteController();
