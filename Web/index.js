
const url = 'https://202.78.140.206/';
const passwordElem = document.getElementById('password');
const timerElem = document.getElementById('timer');
const nowElem = document.getElementById('now');
const thenElem = document.getElementById('then');
const lightsElem = document.getElementById('lights');


const second = 1000;
const hour = 60 * 60 * second;
const halfMinute = 30 * second;
const halfSecond = second / 2;
let statusTimer = 0;

// background colours
const networkError = 'MediumOrchid';
const networkWait = 'LavenderBlush';
const doorActive = 'MediumSpringGreen';
const lightsOn = 'LightGoldenRodYellow';
const lightsOff = 'LightSteelBlue';
const accessDenied = 'Tomato';


// loading and saving values
const load = () => {
  try {
    let p = JSON.parse(localStorage.pwd);
    passwordElem.value = p;
  } catch (e) {
    passwordElem.value = '';
  }
  try {
    let t = JSON.parse(localStorage.timer);
    timerElem.value = t;
  } catch (e) {
    timerElem.value = 0;
  }
}

const save = (pwd, tim) => {
  localStorage.pwd = JSON.stringify(pwd);
  localStorage.timer = JSON.stringify(tim);
}

// click events for elements
nowElem.addEventListener('click', () => {
  let password = passwordElem.value;
  let timer = timerElem.value;
  save(password, timer);
  access(0, password);
});

thenElem.addEventListener('click', () => {
  let password = passwordElem.value;
  let timer = timerElem.value;
  save(password, timer);
  access(timer, password);
});

lightsElem.addEventListener('click', () => {
  let password = passwordElem.value;
  save(password, timer);
  lights(password);
});

// network access request
const access = (t, p) => {
  document.body.style.backgroundColor = networkWait;
  fetch(url + 'nonce').then(nonceRes => {
    if (nonceRes.ok) {
      nonceRes.json().then(body => {
        const hash = CryptoJS.SHA3(p + body.nonce).toString();
        const response = { key: hash, timer: t };
        fetch(url + 'door', postData(response)).then(authRes => {
          if (authRes.ok) {
            document.body.style.backgroundColor = doorActive;  
          } else {
            document.body.style.backgroundColor = accessDenied;
          }
          setTimeout(status, 5000);
        }).catch(e => {
          console.log(e);
        });
      });
    } else {
      console.log('nonce request failed');
    }
  }).catch(e => console.log('nonce request failed'));
};

const lights = p => {
  document.body.style.backgroundColor = networkWait;
  fetch(url + 'nonce').then(nonceRes => {
    if (nonceRes.ok) {
      nonceRes.json().then(body => {
        const hash = CryptoJS.SHA3(p + body.nonce).toString();
        const response = { key: hash };
        fetch(url + 'lights', postData(response)).then(reply => {
          console.log('ok');
          if (reply.status === 'on') {
            document.body.style.backgroundColor = lightsOn;
          } else {
            document.body.style.backgroundColor = lightsOff;
          }          
        }).catch(e => {
          console.log(e);
        })
      });
    } else {
      console.log('nonce req denied');
    }
  }).catch(e => {
    console.log(e);
  });
};
  
const postData = (data) => {
  return {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({ 'Content-Type' : 'application/json' })    
  }
}

// lights status request
const status = () => {
  fetch(url + 'status').then(res => {
    if (res.ok) {
      res.json().then(data => {
        if (data.status === 'on') {
          document.body.style.backgroundColor = lightsOn;
        } else {
          document.body.style.backgroundColor = lightsOff;
        }
      }).catch(e => {
        console.log(e);
        setStatus('JSON error');
      });
    } else {
      setStatus('Denied request');
    }
  }).catch(e => {
    setStatus('Failed request');
  });
}

// do the thing
load();
status();
