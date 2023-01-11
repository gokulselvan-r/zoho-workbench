import React from "react";
import { Col, Row, Card, Form, Button } from '@themesberg/react-bootstrap';


export default class COQL extends React.Component {
  state = {
    query: `select First_Name, Last_Name, Date_of_Birth, Phone, Email, Created_Time, Created_By from Contacts where Created_Time > '2000-01-01T00:00:00+05:30'`
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const query = this.state.query.trim();
    if (!query) {
      return;
    }
    const queryUrl = '/query?q=' + encodeURIComponent(query);
    fetch(queryUrl, {
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store'
    }).then((response) => {
      response.json().then((json) => {
        if (response.ok) {
          this.setState({ result: JSON.stringify(json, null, 2) });
        } else {
          this.setState({ result: JSON.stringify(json, null, 2) });
        }
      });
    });
  };

  handleQueryChange = (e) => {
    this.setState({ query: e.target.value });
  };

  render() {
    return (
      <Col xs={12} className="d-flex align-items-center justify-content-center">
        <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-3 w-100">
          <div className="text-center text-md-center">
          </div>
          <Card border="light" className="bg-white shadow-sm mb-4">
      <Card.Body>
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col sm={12}>
            <Form.Group>
            <Form.Control as="textarea" value={this.state.query} rows="2" onChange={this.handleQueryChange} />
              </Form.Group>
            </Col>
            
          </Row>
          <div className="mt-3" style={{textAlign:'right'}}>
            <Button variant="primary" type="submit">Execute</Button>
          </div>
        </Form>
        </Card.Body>
    </Card>
    {
      this.state.result ? 
      <Card border="light" className="bg-white shadow-sm mb-4">
      <Card.Body>
        <pre>{this.state.result}</pre>
      </Card.Body>
    </Card>
    :<></>
    }
    
        </div>
      </Col>
    );
  }
}
