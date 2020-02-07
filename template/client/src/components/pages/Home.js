import React, { Component } from "react";

import "../../utilities.css";
import "./Home.css";
{{#auth}}
import AuthController from "../modules/AuthController";
{{/auth}}
class Home extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {};
  }

  componentDidMount() {
    // remember -- api calls go here!
  }

  render() {
    return (
      <>
{{#auth}}
        <AuthController
          logout={this.props.logout}
          loggedIn={this.props.user !== undefined}
          setUser={this.props.setUser}
          providers={["google"]}
        />
{{/auth}}
        <h1>Hello World</h1>
      </>
    );
  }
}

export default Home;
