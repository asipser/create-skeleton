import React, { Component } from "react";

import "../../utilities.css";
import "./Skeleton.css";

import Auth from "../modules/Auth";

class Skeleton extends Component {
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
        <Auth
          logout={this.props.logout}
          loggedIn={this.props.user !== undefined}
          setUser={this.props.setUser}
          providers={["google"]}
        />
        <h1>Hello World</h1>
      </>
    );
  }
}

export default Skeleton;
