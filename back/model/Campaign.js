const mongoose = require('mongoose')

const campaignSchema = new mongoose.Schema({
    campaignId : String,
    categoryName : String,
    title: String,
    totalBackedAmount: Number,
    photoUrl : String,
    nickName : String,
    coreMessage : String,
    whenOpen : Date,
    achievementRate : String,
})

const Campaign = mongoose.model("Campaign", campaignSchema)

module.exports = Campaign