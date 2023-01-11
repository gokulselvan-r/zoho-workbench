import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptopCode,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Row,
  Container,
  Nav,
  Tab,
} from "@themesberg/react-bootstrap";
import REST from "./REST";
import COQL from "./COQL";

export default class Main extends React.Component {
  render() {
    return (
      <main>
        <section className="d-flex align-items-center my-5 mt-lg-4 mb-lg-5">
          <Container>
            <Tab.Container defaultActiveKey="coql">
              <Row>
                <Col lg={12}>
                  <Nav fill variant="pills" className="flex-column flex-sm-row">
                  <Nav.Item>
                      <Nav.Link
                        eventKey="coql"
                        className="mb-sm-3 mb-md-0"
                      >
                        <FontAwesomeIcon icon={faLaptopCode} className="me-2" />{" "}
                        COQL
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        eventKey="rest_api"
                        className="mb-sm-3 mb-md-0"
                      >
                        <FontAwesomeIcon icon={faCode} className="me-2" />
                        REST API
                      </Nav.Link>
                    </Nav.Item>
                    
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane
                      eventKey="coql"
                      className="py-4"
                    >
                      <COQL  user={this.props.user}/>

                    </Tab.Pane>
                    <Tab.Pane eventKey="rest_api" className="py-4">
                      <REST user={this.props.user} />
                    </Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Container>
        </section>
      </main>
    );
  }
}
