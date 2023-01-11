import axios from 'axios';
import React from 'react';

import Login from './Login.js';
import Main from './Main.js';
import NavBar from './Navbar.js';
export default class Home extends React.Component {
  state = {
    user: null
  };
  componentDidMount() {
    // Get logged in user
    fetch('/auth/whoami', {
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          console.log(json)
          this.setState({
            user: json
          })
        });
      } else if (response.status !== 401) {
        // Ignore 'unauthorized' responses before logging in
        console.error('Failed to retrieve logged user.', JSON.stringify(response));
      }
    });
  }

  render() {
    return (
      <div>
        <NavBar user={this.state.user}/>
        {this.state.user == null ? (
          <Login />
        ) : (
          <div className="slds-m-around--xx-large">
            <Main user={this.state.user} />
          </div>
        )}
      </div>
    );
  }
}
