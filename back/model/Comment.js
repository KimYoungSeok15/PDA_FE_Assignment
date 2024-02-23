const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required : true
    },
    Campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
    },
    commentType: String,
    nickName: {
        type: String,
        required : true
    },
    whenCreated: { type: Date, default: Date.now },
    commentReplys: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    depth: Number // 대댓글의 경우 depth를 이용하여 구분
})


const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment