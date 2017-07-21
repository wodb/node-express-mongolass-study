const marked = require('marked')
const {Post} = require('../lib/mongo')
const CommentModel = require('./comments')

Post.plugin('contentToHtml',{
	afterFind:(posts) => {
		return posts.map((post) => {
			post.content = marked(post.content)
			return post
		})
	},
	afterFindOne:(post) => {
		if (post) {
			post.content = marked(post.content)
		}
		return post
	}
})

Post.plugin('addCommentsCount',{
	afterFind:(posts) => {
		return Promise.all(posts.map((post) => {
			return CommentModel.getCommentsCount(post._id)
			.then((commentsCount) => {
				post.commentsCount = commentsCount
				return post
			})
		}))
	},
	afterFindOne:(post) => {
		if (post) {
			return CommentModel.getCommentsCount(post._id)
			.then((count) => {
				post.commentsCount = count
				return post
			})
		}
		return post
	}
})


module.exports = {
	// 创建一片文章
	create:(posts) => {
		return Post.create(posts).exec()
	},
	// 根据文章ID获取文章内容
	getPostById:(postid) => {
		return Post
		.findOne({_id:postid})
		.populate({path:'author',model:'User'})
		.addCreatedAt()
		.addCommentsCount()
		.contentToHtml()
		.exec()
	},
	// 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
	getPosts:(author) => {
		let query = {}
		if (author) {
			query.author = author
		}
		return Post
		.find(query)
		.populate({path:'author',model:'User'})
		.sort({_id:-1})
		.addCreatedAt()
		.addCommentsCount()
		.contentToHtml()
		.exec()
	},
	// 通过文章ID pv +1
	incPv:(postid) => {
		return Post
		.update({_id:postid},{$inc:{pv:1}})
		.exec()
	},
	// 通过ID获取文章
	getRawPostById:(postid) => {
		return Post
		.findOne({_id:postid})
		.populate({path:'author',model:'User'})
		.exec()
	},
	// 通过ID和文章ID更新文章
	updatePostById:(postid,author,data) => {
		return Post
		.update({author:author,_id:postid},{$set:data})
		.exec()
	},
	// 通过id和文章ID删除文章
	deletePostById:(postid,author) => {
		return Post
		.remove({_id:postid,author:author})
		.exec()
		.then(function (res) {
			// 文章删除后,在删除所有留言
			if (res.result.ok && res.result.n > 0) {
				return CommentModel.delCommentsByPostId(postid)
			}
		})
	}
}