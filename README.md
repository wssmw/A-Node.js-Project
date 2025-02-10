注意:
    1.返回的数据是这种格式
        ctx.body = {
            code: 200,
            message: '创建成功',
            success: true,
            data: {
                userInfo: user,
            },
        };
    2.保存的图片url都是完整的,这是因为有第三方登录,此时图片地址是完整的