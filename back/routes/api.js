const express = require('express');
const router = express.Router();
const Campaign = require('../model/Campaign');
const Comment = require('../model/Comment');

// // Campaign 저장
// router.post('/save/campaign', async (req, res) => {
//     const campaign = new Campaign({
//         campaignId: req.body.campaignId,
//         categoryName: req.body.categoryName,
//         title: req.body.title,
//         totalBackedAmount: req.body.totalBackedAmount,
//         photoUrl: req.body.photoUrl,
//         nickName: req.body.nickName,
//         coreMessage: req.body.coreMessage,
//         whenOpen: req.body.whenOpen,
//         achievementRate: req.body.achievementRate
//     });
//     try {
//         const newCampaign = await campaign.save();
//         res.status(201).json(newCampaign);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // Comment 저장
// router.post('/save/comment', async (req, res) => {
//     const comment = new Comment({
//         body: req.body.body,
//         Campaign: req.body.Campaign,
//         commentType: req.body.commentType,
//         nickName: req.body.nickName,
//         depth: req.body.depth,
//         commentReplys: req.body.commentReplys
//     });
//     try {
//         const newComment = await comment.save();
//         res.status(201).json(newComment);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// Campaign 리스트 조회
router.get('/campaign', async (req, res) => {
    try {
        const campaigns = await Campaign.find()
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Campaign 한 개와 해당하는 댓글 조회
router.get('/:campaignId', async (req, res) => {
    try {
        const campaignId = req.params.campaignId;
        const campaign = await Campaign.findOne({ campaignId: campaignId });
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        // 위에서 구한 캠페인에 달린 댓글들 조회
        const comments = await Comment.find({ Campaign: campaign._id });
        res.json({ campaign, comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 캠페인에 댓글 추가
router.post('/:campaignId/comment', async (req, res) => {
    try {
        // 캠페인 찾기
        const campaign = await Campaign.findOne({ campaignId: req.params.campaignId });
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // 댓글 생성
        const comment = new Comment({
            body: req.body.body,
            Campaign: campaign._id, // 캠페인의 _id를 사용하여 저장
            commentType: req.body.commentType,
            nickName: req.body.nickName,
            depth: 0, // 최상위 댓글은 depth를 0으로 설정
            commentReplys: [],
            whenCreated: Date.now()
        });

        // 댓글 저장
        const newComment = await comment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 댓글에 대댓글 추가
router.post('/:campaignId/comment/:commentId', async (req, res) => {
    // 부모 댓글 찾기
    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
    }

    const comment = new Comment({
        body: req.body.body,
        Campaign: parentComment.Campaign,
        commentType: req.body.commentType,
        nickName: req.body.nickName,
        depth: parentComment.depth + 1, // 대댓글의 depth는 부모 댓글의 depth에 1을 더합니다.
        commentReplys: [],
        whenCreated: Date.now()
    });
    try {
        const newComment = await comment.save();
        parentComment.commentReplys.push(newComment._id);
        await parentComment.save();
        const newParentComment = await parentComment.populate('commentReplys')
        res.status(201).json(newParentComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;