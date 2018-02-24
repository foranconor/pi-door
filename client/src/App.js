import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import { SHA3 } from 'crypto-js';

function Activated(props) {
  if (!props.act) {
    return null;
  } else return (
    <div class="row pt-3">
      <div class="col-2"></div>
      <div class="alert alert-warning col-8">
        <p class="lead">
          Activated !!!
        </p>
      </div>
      <div class="col-2"></div>
    </div>
  );
}

function Failed(props) {
  if (!props.fail) {
    return null;
  } else {
    return (
      <div class="row pt-3">
        <div class="col-2"></div>
        <div class="alert alert-danger col-8">
          <p class="lead">
            Request failed!!
          </p>
        </div>
        <div class="col-2"></div>
      </div>
    )
  }
}

function Title(props) {
  return (
    <div>
      <h3 class="display-3">Garage Door</h3>
    </div>
  );
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { activated: false, password: '' }
    this.passwordChanged = this.passwordChanged.bind(this);
    this.activate = this.activate.bind(this);
  }

  render() {
    return (
      <div class="container text-center">
        <Title />
        <form onSubmit={this.activate}>
          <div class="form-group">
            <label>
              Password
              <input
                type="password"
                value={this.state.password}
                onChange={this.passwordChanged}
                class="form-control text-center"/>
            </label>
          </div>
          <button type="submit" class="btn btn-lg btn-info">
            Activate
          </button>
        </form>
        <Activated act={this.state.activated} />
        <Failed fail={this.state.failed} />
      </div>
    );
  }

  activate(event) {
    event.preventDefault();
    // request nonce from server
    const url = 'http://192.168.1.3:8888/';
    fetch(url + 'nonce').then(nonceRes => {
      if (nonceRes.ok) {
        nonceRes.json().then(body => {
          const hash = SHA3(this.state.password + body.nonce).toString();
          console.log(hash);
          const respose = { key: hash };
          fetch(url + 'door', {
            method: 'POST',
            body: JSON.stringify(respose),
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          }).then(authRes => {
            if (authRes.ok) {
              this.result(true);
            } else {
              this.result(false);
            }
          })
        });
      } else {
        this.result(false);
      }
    });
  }

  result(success) {
    if (success) {
      this.setState({ activated: true });
      setTimeout(() => this.setState({ activated: false}), 3000);
    } else {
      this.setState({ failed: true });
      setTimeout(() => this.setState({ failed: false}), 1000);
    }
  }

  passwordChanged(event) {
    const p = { password: event.target.value};
    this.setState(p);
    localStorage.pwd = JSON.stringify(p);
  }

  componentDidMount() {
    let p;
    try {
      p = JSON.parse(localStorage.pwd);
    } catch (e) {
      p = '';
    }
    this.setState({ password: p.password });
  }
}

export default App;
