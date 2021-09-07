const loginSubmit = document.querySelector('#loginForm');

loginSubmit.addEventListener('submit', async (event) => {
  event.preventDefault();
  const usernameOrEmail = document.getElementById('emailOrUsername').value;
  const password = document.getElementById('password').value;
  try {
    const ress = await axios({
      method: 'POST',
      url: '/v1/users/login',
      data: {
        username: usernameOrEmail,
        password: password,
      },
    });
    if (ress.data.status == 'OK') {
      window.setTimeout(() => {
        location.assign('/newsfeed');
      }, 50);
    }
  } catch (err) {
    console.log('error in login.js page, no response');
  }
});

const clickSignup = document.getElementById('click-signup');
clickSignup.addEventListener('click', () => {
  document.querySelector('#loginForm').style.display = 'none';
  document.querySelector('.signupFormPage1').style.display = 'block';
});

const signupFormPage1 = document.querySelector('.signupFormPage1');
signupFormPage1.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('passwordSignup').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  //   console.log(email, username);
  //   console.log(password, passwordConfirm);
  signupFormPage1.style.display = 'none';
  signupFormPage2Func(email, username, password, passwordConfirm);
});

function signupFormPage2Func(email, username, password, passwordConfirm) {
  const signupFormPage2 = document.querySelector('.signupFormPage2');
  signupFormPage2.style.display = 'block';
  signupFormPage2.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstname = document.getElementById('firstName').value;
    const lastname = document.getElementById('lastName').value;
    const DOB = document.getElementById('DOB').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    // console.log(firstName, lastName);
    // console.log(DOB, phoneNumber);
    const allData = {
      email,
      username,
      password,
      firstname,
      lastname,
      DOB,
      phoneNumber,
      passwordConfirm,
    };
    try {
      const response = await axios({
        method: 'POST',
        url: '/v1/users/signup',
        data: allData,
      });
      if (response.status == 201) {
        window.setTimeout(() => {
          location.assign('/newsfeed');
        }, 50);
      } else {
        throw 'check data that you have provided';
      }
    } catch (err) {
      console.log(err.message);
    }
  });
}
