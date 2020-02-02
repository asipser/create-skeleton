import React, { Component } from "react";
import { get } from "../../utilities";
{{#auth.google}}
import OAuth from "./OAuth";
{{/auth.google}}
{{#auth.local}}
import LocalAuth from "./LocalAuth";
{{/auth.local}}

/**
 * Proptypes
 * @param {(user) => void} setUser: (function) login user
 * @param {(user) => void} logout: (function) logout user
 * @param {boolean} loggedIn: is user loggedIn
 * @param {string[]} providers: providers for oauth
 */

class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
    };
  }

  login = (user) => {
    this.props.setUser(user);
  };

  logout = () => {
    console.log("logging out...");
    get("/auth/logout").then(() => {
      this.props.logout();
    });
  };

  render() {
    const { loggedIn, disabled, providers } = this.props;
{{#auth.google}}
    const providersList = providers.map((provider) => (
      <OAuth key={provider} login={this.login} provider={provider} disabled={disabled} />
    ));
{{/auth.google}}


    return (
      <>
        {loggedIn ? (
          <div className="u-link" onClick={this.logout}>
            Logout
          </div>
        ) : (
          <>
{{#auth.local}}
            <LocalAuth login={this.login} disabled={disabled} />
{{/auth.local}}
{{#auth.google}}
            {providersList}
{{/auth.google}}
          </>
        )}
      </>
    );
  }
}

export default Auth;
