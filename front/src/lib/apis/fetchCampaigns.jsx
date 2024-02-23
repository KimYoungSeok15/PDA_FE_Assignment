import instance from "./base";

async function fetchCampaigns() {
  try {
    const res = await instance.get("campaign");
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("게시글 목록을 불러오는 중 에러가 발생했습니다.", error);
    throw error;
  }
}

export default fetchCampaigns;
