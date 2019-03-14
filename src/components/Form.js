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
      permanent_token: ""
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
    const API_URL = "https://graph.facebook.com/v3.2";

    let obj = { id: "", token: "" };
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
              });
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
    event.preventDefault();
  }

  render() {
    const { permanent_token } = this.state;
    return (
      <div className="form-wrapper">
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
            User Acess Token
            <input
              type="text"
              id="user_token"
              value={this.state.user_access_token}
              onChange={this.handleChangeToken}
            />
          </label>
          <button>Submit</button>
        </form>
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
