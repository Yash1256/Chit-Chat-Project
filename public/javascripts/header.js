var jumpLetter = document.querySelectorAll('.jump-letter');
var i = 0;
for (i = 0; i < jumpLetter.length; i++) {
  jumpLetter[i].addEventListener('mouseover', function () {
    this.style.animationName = 'animateJump';
  });
}

const allImgOrVideo = document.querySelectorAll('.img-or-video');

for (i = 0; i < allImgOrVideo.length; i++) {
  allImgOrVideo[i].addEventListener('click', function openFullscreen() {
    if (this.requestFullscreen) {
      this.requestFullscreen();
    } else if (this.webkitRequestFullscreen) {
      /* Safari */
      this.webkitRequestFullscreen();
    } else if (this.msRequestFullscreen) {
      /* IE11 */
      this.msRequestFullscreen();
    }
  });
}

const logOut = document.getElementById('logout');
logOut.addEventListener('click', async (req, res) => {
  console.log('pk');
  try {
    const response = await axios({
      method: 'GET',
      url: '/v1/users/logout',
    });
    if (response.data.status == 'OK') {
      window.setTimeout(() => {
        location.assign('/login');
      }, 50);
    } else {
      throw 'error occured, go and search';
    }
  } catch (err) {
    console.log(err.message);
  }
});
