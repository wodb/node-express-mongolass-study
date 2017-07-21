const marked = require('marked')

let {Comment} = require('../lib/mongo')

// 将comment的content从markdown转成html
Comment.plugin('contentToHtml',{
	afterFind:(comments) => {
		return comments.map((comment) => {
			comment.content = marked(comment.content)
			return comment
		})
	}
})

module.exports = {
	// 创建一个留言
	create:(comment) => {
		return Comment.create(comment).exec()
	},
	// 通过用户 id 和留言 id 删除一个留言
	delCommentById:(commentId,author) => {
		return Comment.remove({author,_id:commentId}).exec()
	},
	// 通过文章 id 删除该文章下所有留言
	delCommentsByPostId:(postId) => {
		return Comment.remove({postId}).exec()
	},
	// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
	getComments:(postId) => {
		return Comment
		.find({postId:postId})
		.populate({path:'author',model:'User'})
		.sort({_id:-1})
		.addCreatedAt()
		.contentToHtml()
		.exec()
	},
	// 通过文章 id 获取该文章下留言数
	getCommentsCount:(postId) => {
		return Comment.count({postId}).exec()
	}
}