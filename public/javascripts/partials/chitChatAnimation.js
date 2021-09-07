const arr = [
  'Hello, kya hal hai',
  'badiya hai apna batoa, kya ker rahi ho',
  'kuch nahi bash book padh rahi hmm auor tum',
  'kuch nahi bas end sem ke liye prepare ker raha hmm',
  'accha, end sem aa gaya kya tumhara',
  'yep hmm aa gaya, college wale pareshan kerke rakhke hai',
  'itna koin pareshan kerta hai',
  'wahi na,inne koin samjhe',
  'chodo unko unka toh vo hii kam hai',
  'wahi na, mei toh full ignore kerta un chutiye ko',
];

var ii = 0;
var speed = 50;
let check = undefined;
function typeWriter(index) {
  if (ii < arr[index].length) {
    check.querySelector('.animeChatBox').innerHTML += arr[index].charAt(ii);
    ii++;
    setTimeout(() => {
      typeWriter(index);
    }, speed);
  }
}

const insideChatBoxDefault = document.querySelector('.insideChatBoxDefault');
const apppendBox = (gender, index) => {
  const str = `<div>
                    <img class="animeAvatar ${gender}Avatar" src="/defaultPic/${gender}.jpg" alt="">
                    <span class="animeChatBox ${gender}AnimeChatBox">
                    </span>
                </div>`;
  const newDiv = document.createElement('div');
  newDiv.innerHTML = str;
  insideChatBoxDefault.append(newDiv);
  insideChatBoxDefault.scrollTop =
    insideChatBoxDefault.scrollHeight - insideChatBoxDefault.clientHeight;
  check = newDiv;
  ii = 0;
  typeWriter(index);
};

i = 0;
function animeAll() {
  if (i < arr.length) {
    if (i & 1) {
      apppendBox('male', i);
    } else {
      apppendBox('female', i);
    }

    setTimeout(() => {
      animeAll();
    }, arr[i].length * 60);
  }
  i++;
}
animeAll();
