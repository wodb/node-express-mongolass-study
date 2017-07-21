const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash') 
const config = require('config-lite')(__dirname)
const router = require('./routers/index')
const pkg = require('./package')
const winston = require('winston')
const expressWinston = require('express-winston')

// 设置模版路径
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')//设置模版引擎

// 设置静态文件
app.use(express.static(path.join(__dirname,'public')))

// session中间件
app.use(session({
	name:config.session.key, // 设置 cookie中保存session ID的字段名称
	secret:config.session.secret, // 同设置secret 来计算 hash值 并放在cookie中,防止篡改
	resave:true,// 强制更新
	saveUninitialized:false,// 设置 false 强制创建一个session,即使用户未登录
	cookie:{
		maxAge:config.session.maxAge // 过期时间,国企后cookie中session ID 自动删除
	},
	store:new MongoStore({
		url:config.mongodb
	})
}))

// flash中间件 用来显示通知
app.use(flash())

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
	uploadDir:path.join(__dirname,'public/img/'), //上传文件路径
	keepExtensions:true // 保留后缀
}))

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};
// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

// 正常请求的日志
app.use(expressWinston.logger({
	transports:[
		// new (winston.transports.Console)({json:true,colorize:true}),
		new winston.transports.File({
			filename:'logs/success.log'
		})
	]
}))
// 路由
router(app)
// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    /*new winston.transports.Console({
      json: true,
      colorize: true
    }),*/
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

// error page
app.use(function (err, req, res, next) {
	res.render('error', {
		error: err
	});
});
app.listen(3000, (err) => {
	if (err) throw err
	console.log('开启成功!')
})