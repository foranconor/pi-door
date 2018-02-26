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

function Button(props) {
    return (
      <button type="submit" className={'btn btn-lg ' + props.style}>
        Activate
      </button>
    )
}

const url = 'https:///';
var reReq;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { activated: false, password: '', btnStyle: 'btn-info' }
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
          <Button style={this.state.btnStyle} />
        </form>
        <DoorState kind={this.state.kind} message={this.state.message} />
      </div>
    );
  }

  activate(event) {
    event.preventDefault();
    reReq = setInterval(() => this.doorState(), 500);
    setTimeout(() => clearInterval(reReq), 25000);
    fetch(url + 'nonce').then(nonceRes => {
      if (nonceRes.ok) {
        nonceRes.json().then(body => {
          const hash = SHA3(this.state.password + body.nonce).toString();
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
    const p = { password: event.target.value};
    this.setState(p);
    localStorage.pwd = JSON.stringify(p);
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
