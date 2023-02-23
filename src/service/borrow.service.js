const connection = require('../app/database')

class BorrowService{
    async search(name) {
        const statement = `SELECT * FROM books WHERE name=?`

        const result = await connection.execute(statement, [name])

        return result[0]
    }
    async update(username,bookname,nums,istrue=true){
        nums=istrue?-1*nums:nums
        const statement =`UPDATE books SET nums=nums+? WHERE name=?`
        const statement1 = `INSERT INTO record (username,bookname,nums) VALUES (?,?,?)`
        const result = await connection.execute(statement,[nums,bookname])
        console.log(username,bookname,nums);
        const result1 = await connection.execute(statement1,[username,bookname,nums])
                                              

        return result[0]
    }

}

module.exports = new BorrowService()