import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { SHA3 } from 'crypto-js';

function Activated(props) {
  if (!props.act) {
    return null;
  } else return (
    <div className="row pt-3">
      <div className="col-2"></div>
      <div className="alert alert-warning col-8">
        <p className="lead">
          Activated !!!
        </p>
      </div>
      <div className="col-2"></div>
    </div>
  );
}

function Failed(props) {
  if (!props.fail) {
    return null;
  } else {
    return (
      <div className="row pt-3">
        <div className="col-2"></div>
        <div className="alert alert-danger col-8">
          <p className="lead">
            Request failed!!
          </p>
        </div>
        <div className="col-2"></div>
      </div>
    )
  }
}

function DoorState(props) {
  return (
    <div className="row pt-3">
      <div className="col-2"></div>
        <div className={'alert col-8 ' + props.kind}>
          {props.message}
        </div>
      <div className="col-2"></div>
    </div>
  )
}

function Title(props) {
  return (
    <div>
      <h3 className="display-3">Garage Door</h3>
    </div>
  );
}

const url = 'https://202.78.140.206/';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { activated: false, password: '' }
    this.passwordChanged = this.passwordChanged.bind(this);
    this.activate = this.activate.bind(this);
  }

  render() {
    return (
      <div className="container text-center">
        <Title />
        <form onSubmit={this.activate}>
          <div className="form-group">
            <label>
              Password
              <input
                type="password"
                value={this.state.password}
                onChange={this.passwordChanged}
                className="form-control text-center"/>
            </label>
          </div>
          <button type="submit" className="btn btn-lg btn-info">
            Activate
          </button>
        </form>
        <Activated act={this.state.activated} />
        <Failed fail={this.state.failed} />
        <DoorState kind={this.state.kind} message={this.state.message} />
      </div>
    );
  }

  activate(event) {
    event.preventDefault();
    // request nonce from server
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

  doorState() {
    fetch(url + 'state').then(res => {
      console.log(res);
      if (res.ok) {
        res.json().then(data => {
          switch (data.state) {
            case 'moving':
              this.setState({
                kind: 'alert-warning',
                message: 'Moving'
              });
              break;
            case 'open':
              this.setState({
                kind: 'alert-success',
                message: 'Open'
              });
              break;
            case 'closed':
              this.setState({
                kind: 'alert-danger',
                message: 'Closed'
              });
              break;
            default:
              this.setState({
                kind: 'alert-primary',
                message: 'Sensor Error!!!'
              });
            break;
          }
        }).catch(e => {
          this.setState({
            kind: 'alert-info',
            message: 'JSON Error!!!'
          })
        });
      }
    }).catch(e => {
      this.setState({
        kind: 'alert-info',
        message: 'Network Error!!!'
      })
    });
  }

  componentDidMount() {
    let p;
    try {
      p = JSON.parse(localStorage.pwd);
    } catch (e) {
      p = '';
    }
    this.setState({ password: p.password });
    this.doorState();
  }
}

export default App;
