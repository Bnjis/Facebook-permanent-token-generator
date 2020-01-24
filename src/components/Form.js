import React, { Component } from "react";
import axios from "axios";

import "./Form.scss";

class Form extends Component {
  constructor(props) {
    super(props);

    this.state = {
      app_id: "",
      app_secret: "",
      user_access_token: "",
      permanent_token: "",
      isError: ""
    };

    this.handleChangeApp_id = this.handleChangeApp_id.bind(this);
    this.handleChangeApp_secret = this.handleChangeApp_secret.bind(this);
    this.handleChangeToken = this.handleChangeToken.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeApp_id(event) {
    this.setState({ app_id: event.target.value });
  }

  handleChangeApp_secret(event) {
    this.setState({ app_secret: event.target.value });
  }

  handleChangeToken(event) {
    this.setState({ user_access_token: event.target.value });
  }

  handleSubmit(event) {
    const { app_id, app_secret, user_access_token } = this.state;

    if (!app_id || !app_secret || !user_access_token) {
      alert("Please complete all fields");
      event.preventDefault();
      return;
    }

    const API_URL = "https://graph.facebook.com/v3.2";

    let obj = { id: "", token: "" };
    var self = this;
    axios
      .get(
        API_URL +
          "/oauth/access_token?grant_type=fb_exchange_token&client_id=" +
          app_id +
          "&client_secret=" +
          app_secret +
          "&fb_exchange_token=" +
          user_access_token
      )
      .then(response => {
        obj.token = response.data.access_token;
        return obj;
      })
      .then(obj => {
        axios
          .get(API_URL + "/me?access_token=" + obj.token)
          .then(response => {
            obj.id = response.data.id;
            return obj;
          })
          .then(obj => {
            axios
              .get(
                API_URL + "/" + obj.id + "/accounts?access_token=" + obj.token
              )
              .then(response => {
                this.setState({
                  permanent_token: response.data.data[0].access_token
                });
              })
              .catch(error => {
                console.log(error);
                self.setState({ isError: error.response.data.error.message });
              });
          })
          .catch(error => {
            console.log(error);
            self.setState({ isError: error.response.data.error.message });
          });
      })
      .catch(function(error) {
        console.log(error.response);
        self.setState({ isError: error.response.data.error.message });
      });
    event.preventDefault();
  }

  render() {
    const { permanent_token, isError } = this.state;
    return (
      <div className="form-wrapper">
        <h1>Facebook PermaToken Generator</h1>
        <p className="description">
          Complete the following fields to get your permanent token. The
          documentation is available on GitHub via the link at the top right
        </p>
        <form onSubmit={this.handleSubmit} className="access_form">
          <label htmlFor="app_id">
            App ID
            <input
              type="text"
              id="app_id"
              value={this.state.app_id}
              onChange={this.handleChangeApp_id}
            />
          </label>
          <label htmlFor="app_secret">
            App Secret
            <input
              type="text"
              id="app_secret"
              value={this.state.app_secret}
              onChange={this.handleChangeApp_secret}
            />
          </label>
          <label htmlFor="user_token">
            User Access Token or Page Access Token
            <input
              type="text"
              id="user_token"
              value={this.state.user_access_token}
              onChange={this.handleChangeToken}
            />
          </label>
          <button>Submit</button>
        </form>
        {isError !== "" ? (
          <div className="response error">
            An error has occured : <strong>{isError}</strong>
          </div>
        ) : (
          ""
        )}
        {permanent_token !== "" ? (
          <div className="response valide">
            Your permanent token is : <strong>{permanent_token}</strong>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default Form;
