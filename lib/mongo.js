const config = require('config-lite')(__dirname);
const Mongolass = require('mongolass');
const moment = require('moment')
const objectidToTimestamp = require('objectid-to-timestamp')
const mongolass = new Mongolass();
mongolass.connect(config.mongodb);

mongolass.plugin('addCreatedAt',{
	afterFind:function (result) {
		result.forEach((item) => {
			item.created_at = moment(objectidToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
		})
		return result
	},
	afterFindOne:function (result) {
		if (result) {
			result.created_at = moment(objectidToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
		}
		return result
	}
})
exports.Post = mongolass.model('Post',{
	author:{type:Mongolass.Types.ObjectId},
	title:{type:'string'},
	content:{type:'string'},
	pv:{type:'number'}
})
exports.Post.index({author:1,_id:-1}).exec()// 按创建时间降序查看用户的文章列表

exports.User = mongolass.model("User",{
	name:{type:'string'},
	password:{type:'string'},
	avatar:{type:'string'},
	gender:{type:'string',enum:['m','f','x']},
	bio:{type:'string'}
})
exports.User.index({name:1},{unique:true}).exec()// 根据用户名找到用户，用户名全局唯一

exports.Comment = mongolass.model('Comment',{
	author:{type:Mongolass.Types.ObjectId},
	content:{type:'string'},
	postId:{type:Mongolass.Types.ObjectId}
})
exports.Comment.index({postId:1,_id:1}).exec()// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({author:1,_id:1}).exec()// 通过用户 id 和留言 id 删除一个留言
	