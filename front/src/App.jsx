import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import fetchCampaigns from "./lib/apis/fetchCampaigns";

function App() {
  const [campaignList, setCampaignList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCampaigns();
        setCampaignList(data);
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      <Row xs={1} md={2} lg={4} className="g-4">
        {campaignList.map((campaign) => (
          <Col key={campaign._id}>
            <Card>
              <Card.Img variant="top" src={campaign.photoUrl} />
              <Card.Body>
                <Card.Text>{campaign.achievementRate}</Card.Text>
                <Card.Title>{campaign.title}</Card.Title>
                <Card.Text style={{ color: "gray" }}>
                  {campaign.nickName}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default App;
