import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { SHA3 } from 'crypto-js';

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

const url = 'https:///';
var reReq;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { activated: false, password: '', timer: 0, btnStyle: 'btn-info' }
    this.timerChanged = this.timerChanged.bind(this);
    this.passwordChanged = this.passwordChanged.bind(this);
    this.activate = this.activate.bind(this);
  }

  render() {
    return (
      <div className="container text-center">
        <Title />
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
        <div className="form-group">
          <label>
            Timer
            <input
              type="number"
              value={this.state.timer}
              onChange={this.timerChanged}
              className="form-control text-center" />
          </label>
        </div>
        <div className="btn-group">
          <button
            onClick={(e) => this.activate(e, 0)}
            className={'btn btn-lg ' + this.state.btnStyle}>
            Now
          </button>
          <button
            onClick={(e) => this.activate(e, this.state.timer)}
            className={'btn btn-lg ' + this.state.btnStyle}>
            Then
          </button>
        </div>
        <DoorState kind={this.state.kind} message={this.state.message} />
      </div>
    );
  }

  activate(event, time) {
    event.preventDefault();
    reReq = setInterval(() => this.doorState(), 500);
    setTimeout(() => clearInterval(reReq), 25000);
    fetch(url + 'nonce').then(nonceRes => {
      if (nonceRes.ok) {
        nonceRes.json().then(body => {
          const hash = SHA3(this.state.password + body.nonce).toString();
          const respose = { key: hash, timer: time };
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
        }).catch(e => this.result(false));
      } else {
        this.result(false);
      }
    }).catch(e => this.result(false));
  }

  result(success) {
    let s = 'btn-danger';
    if (success) {
      s = 'btn-success';
    }
    this.setState({
      btnStyle: s
    });
    setTimeout(() => this.setState({
      btnStyle: 'btn-info'
    }), 2000);
  }

  passwordChanged(event) {
    const p = { password: event.target.value };
    this.setState(p);
    localStorage.pwd = JSON.stringify(p);
  }

  timerChanged(event) {
    const t = { timer: event.target.value };
    this.setState(t);
    localStorage.timer = JSON.stringify(t);
  }

  doorState() {
    fetch(url + 'state').then(res => {
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
    let t;
    try { p = JSON.parse(localStorage.pwd); }
    catch (e) { p = ''; }
    try { t = JSON.parse(localStorage.timer); }
    catch (e) { t = 0; }
    this.setState({ password: p.password });
    this.setState({ timer: t.timer });
    this.doorState();
  }
}

export default App;
