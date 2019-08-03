
const url = 'https://202.78.140.206/';
const passwordElem = document.getElementById('password');
const timerElem = document.getElementById('timer');
const nowElem = document.getElementById('now');
const thenElem = document.getElementById('then');
//const statusElem = document.getElementById('status');
//const liveElem = document.getElementById('live');
const errorElem = document.getElementById('error');
const lightsElem = document.getElementById('lights');


const second = 1000;
const hour = 60 * 60 * second;
const halfMinute = 30 * second;
const halfSecond = second / 2;
let statusTimer = 0;


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
  // getStatus(halfSecond, halfMinute);
  access(0, password);
});

thenElem.addEventListener('click', () => {
  let password = passwordElem.value;
  let timer = timerElem.value;
  save(password, timer);
  // setTimeout(getStatus, timer * second, halfSecond, halfMinute);
  access(timer, password);
});

lightsElem.addEventListener('click', () => {
  let password = passwordElem.value;
  save(password, timer);
  lights(password);
});

// liveElem.addEventListener('click', () => {
//   getStatus(second, hour);
// });

// network access request
const access = (t, p) => {
  setBackground();
  fetch(url + 'nonce').then(nonceRes => {
    if (nonceRes.ok) {
      nonceRes.json().then(body => {
        const hash = CryptoJS.SHA3(p + body.nonce).toString();
        const response = { key: hash, timer: t };
        fetch(url + 'door', postData(response)).then(authRes => {
          if (authRes.ok) {
            allowed();
          } else {
            denied('Auth request denied');
          }
        }).catch(e => {
          console.log(e);
          denied('Auth request failed');
        });
      });
    } else {
      denied('Nonce request denied');
    }
  }).catch(e => denied('Nonce request failed'));
};

const lights = p => {
  fetch(url + 'nonce').then(nonceRes => {
    if (nonceRes.ok) {
      nonceRes.json().then(body => {
        const hash = CryptoJS.SHA3(p + body.nonce).toString();
        const response = { key: hash };
        fetch(url + 'lights', postData(response)).then(authRes => {
          console.log('ok');  
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

const setBackground = () => {
  document.body.style.backgroundColor = "LightGoldenRodYellow";
  setTimeout(() => {
    document.body.style.backgroundColor = "LavenderBlush";
  }, 5 * second);
}
  
const postData = (data) => {
  return {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({ 'Content-Type' : 'application/json' })    
  }
}

const allowed = () => {
  document.body.style.backgroundColor = "MediumSpringGreen";
  console.log('success');
}

const denied = (error) => {
  document.body.style.backgroundColor = "Tomato";
  errorElem.innerHTML = error;
  setTimeout(() => {
    errorElem.innerHTML = "";
  }, 5 * second);
}

// door status request

// const getStatus = (interval, timeOut) => {
//   if (statusTimer === 0) {
//     statusTimer = setInterval(status, interval);
//     setTimeout(() => {
//       clearInterval(statusTimer);
//       statusTimer = 0;
//     }, timeOut);
//   } 
// }

// const status = () => {
//   fetch(url + 'state').then(res => {
//     if (res.ok) {
//       res.json().then(data => {
//         setStatus(data.state);
//       }).catch(e => {
//         console.log(e);
//         setStatus('JSON error');
//       });
//     } else {
//       setStatus('Denied request');
//     }
//   }).catch(e => {
//     setStatus('Failed request');
//   });
// }

// const setStatus = (status) => {
//     statusElem.innerHTML = status;
// }

// do the thing
load();
// status();
