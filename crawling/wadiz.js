import axios from "axios";
import https from "https";
import crypto from "crypto";

// Campaign 데이터를 가져오는 함수
async function fetchCampaignData() {
  const CAMPAIGN_URL = "https://service.wadiz.kr/api/search/funding";
  const body = {
    startNum: 0,
    order: "support",
    limit: 20,
    categoryCode: "",
    endYn: ""
  };

  try {
    const makeRequest = (url, body) => {
      return axios({
        url,
        method: "POST",
        httpsAgent: new https.Agent({
          secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
        }),
        data: body
      });
    };
    const response = await makeRequest(CAMPAIGN_URL, body);
    const itemList = response.data.data.list;
    return itemList;
  } catch (error) {
    console.error("Error fetching campaign data:", error);
    return [];
  }
}

// 댓글 데이터를 가져오는 함수
async function fetchCommentData(itemList) {
  const COMMENT_URL = 'https://www.wadiz.kr/web/reward/api/comments/campaigns/';
  const commentList = itemList.map(async item => {
    const res = axios({
      url: `${COMMENT_URL}${item.campaignId}`,
      method: "GET",
      httpsAgent: new https.Agent({
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
      }),
      params: {
        page: 0,
        size: 20,
        commentGroupType: 'CAMPAIGN',
        rewardCommentType: ''
      }
    })
    return (await res).data.data.content
  });
  return Promise.all(commentList);
}

// Campaign 데이터를 저장하는 함수
async function saveCampaignData(itemList) {
  try {
    const promises = itemList.map(async item => {
      const response = await axios.post('http://127.0.0.1:3000/api/save/campaign', item);
      console.log(`Campaign saved: ${response.data._id}`);
      return { commonId: item.campaignId, campaignId: response.data._id };
    });
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error saving campaign data:", error);
    return [];
  }
}

// 댓글을 저장하는 함수
async function saveCommentData(comments, campaignIds) {
  try {
    const promises = comments.flatMap(async commentGroup => {
      return await Promise.all(commentGroup.map(async comment => {
        // 대댓글 저장 및 대댓글의 _id 추출하여 저장
        if (comment.commentReplys){
          const savedReplies = await Promise.all(comment.commentReplys.map(async reply => {
            const campaignId = campaignIds.find(campaignId => campaignId.commonId === reply.commonId).campaignId;
            reply.Campaign = campaignId;
            const responseReply = await axios.post('http://127.0.0.1:3000/api/save/comment', reply);
            return responseReply.data._id;
          }));
          comment.commentReplys = savedReplies;
        }
        // 댓글 저장 전처리
        const campaignId = campaignIds.find(campaignId => campaignId.commonId === comment.commonId).campaignId;
        comment.Campaign = campaignId;
        const responseComment = await axios.post('http://127.0.0.1:3000/api/save/comment', comment);
        return responseComment.data._id;
      }));
    });

    // 모든 작업이 완료된 후에 결과를 반환
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error saving comment data:", error);
    return [];
  }
}

// 메인 함수
async function main() {
  try {
    const itemList = await fetchCampaignData();
    if (itemList.length === 0) {
      console.log('No campaign data fetched. Exiting...');
      return;
    }
    console.log(`Fetched ${itemList.length} campaigns.`);
    
    // Campaign 데이터 저장 및 commonId와 해당하는 campaignId 반환
    const campaignIds = await saveCampaignData(itemList);

    const comments = await fetchCommentData(itemList);
    console.log(`Fetched comments for ${comments.length} campaigns.`);

    // 댓글 데이터 저장
    const savedComments = await saveCommentData(comments, campaignIds);
    // console.log(savedComments)
    console.log("All data saved successfully.");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();


/*
아래는 itemList의 한 객체
{
  campaignId: 257983,
  userId: 6959271,
  title: '연 매출 800억! 미국시장을 휩쓴 의류 수출회사의 이지케어 #허밍셔츠',  
  whenOpen: '2024-02-19 11:00:26',
  productType: 'REWARD',
  photoUrl: 'https://cdn1.wadiz.kr/images/20240206/1707193693443.png/wadiz/opti
mize',
  nickName: '굿트러스트',
  corpName: '굿트러스트',
  participationCnt: 136,
  totalBackedAmount: 7180600,
  achievementRate: 1305,
  signatureCnt: 84,
  remainingDay: 9,
  endYn: 0,
  coreMessage: '아직도 셔츠는 관리에 불편하고 입었을때 답답하다고 생각하시나요?
 관리가 편해서 손이 자주 가는 이지케어 셔츠! 프리미엄 원단으로 제작한 링클프리 
허밍셔츠입니다',
  custValueCode: 288,
  custValueCodeNm: '패션·잡화',
  advertisement: true,
  acid: 10048384,
  landingUrl: 'https://www.wadiz.kr/web/campaign/detail/257983',
  additionalParam: 'acid=10048384&_refer_section_st=REWARD_0',
  categoryName: '의류',
  categoryCode: 'B0100'
}

아래는 comment의 한 객체
{
    "encUserId": 1480337204,
    "campaignId": 0,
    "boardId": 3554177,
    "depth": 0,
    "commonId": 267360,
    "body": "펀딩번호 12015659\n\n매일 아침 눈뜨는게 너무 힘들었는데 아침에 눈 번쩍 뜨고 나만의 시간을 보낼 수 있길 기대합니다! 90일분으로 질렀어요ㅋㅋㅋㅋ효능 믿어보겠습니다~ 효과 좋으면 다시 또 후기남길게용",
    "commentType": "SUPPORT",
    "whenCreated": "2024-02-19 15:17:58.0",
    "del": false,
    "parentBoardId": null,
    "nickName": "김민정",
    "userStatus": "NM",
    "photoUrl": "https://www.wadiz.kr/wwwwadiz/green001/sns_profile_pics/20210115171746436_1596727528.jpg",
    "hasReply": true,
    "commentReplys": [
        {
            "encUserId": 1344255802,
            "campaignId": 0,
            "boardId": 3555372,
            "depth": 1,
            "commonId": 267360,
            "body": "매일 아침 에너지 넘치게 화이팅!",
            "commentType": null,
            "whenCreated": "2024-02-20 10:00:24.0",
            "del": false,
            "parentBoardId": 3554177,
            "nickName": "호랑이의아침",
            "userStatus": "NM",
            "photoUrl": "https://www.wadiz.kr/wwwwadiz/green001/2023/0912/20230912230517736_239292.jpg",
            "hasReply": false,
            "commentReplys": [],
            "commentImages": null,
            "userFollow": null,
            "reactions": [],
            "maker": true,
            "support": false,
            "owner": false
        }
    ],
    "commentImages": [],
    "userFollow": {
        "userId": 3700843,
        "isFollowing": false
    },
    "reactions": [
        {
            "boardReactionId": 85295,
            "typeId": 1,
            "count": 1,
            "isChecked": false
        }
    ],
    "maker": false,
    "support": true,
    "owner": false
},
*/