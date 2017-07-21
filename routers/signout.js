const express = require('express')
const router = express.Router()

let {checkLogin} = require('../middlewares/check')

//GET /signout 登出
router.get('/',(req,res) => {
	req.session.user = null
	req.flash('success','登出成功')
	res.redirect('/posts')
})

module.exports = router