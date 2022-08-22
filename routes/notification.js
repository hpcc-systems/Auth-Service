var express = require("express");
var router = express.Router();


router.get("/settings", function (req, res, next) {
try{
    if(process.env.EMAIL_SMTP_HOST && process.env.EMAIL_PORT && process.env.EMAIL_SENDER){
        return res.status(200).json({success: true,  notificationSettingConfigured : true})
    }
    return res.status(200).json({ success: true,  notificationSettingConfigured: false });
}catch(err){
    console.log(err)
     return res.status(500).json({ success: false, message: "Unable to process request" });
}
 
});

module.exports = router;