//post-window or simple modal window for post
var postModalBtn = document.querySelector('.post-input');
var postModal = document.querySelector('.Post-Modal');
var postModalClose = document.querySelector('.closeModalWindow');
postModalBtn.addEventListener('click', () => {
  postModal.style.display = 'block';
  // console.log(postModal);
});
window.onclick = function (event) {
  if (event.target == postModal) {
    postModal.style.display = 'none';
  }
};
postModalClose.addEventListener('click', () => {
  postModal.style.display = 'none';
});

///Post implementation here
// already declared in newsdfeed.js

//navbar
const profileContent = document.querySelector('.profile-content');
const aboutUser = document.querySelector('.about-user');
const profileFriendSection = document.querySelector('.profile-friend-section');
const profilePhotoSection = document.querySelector('.profile-photo-section');
const POST_BTN = document.getElementById('POST_BTN');
const ABOUT_BTN = document.getElementById('ABOUT_BTN');
const FRIENDS_BTN = document.getElementById('FRIENDS_BTN');
const PHOTOS_BTN = document.getElementById('PHOTOS_BTN');

POST_BTN.addEventListener('click', () => {
  profileContent.style.display = 'block';
  aboutUser.style.display = 'none';
  profileFriendSection.style.display = 'none';
  profilePhotoSection.style.display = 'none';
  FRIENDS_BTN.style.color = 'white';
  ABOUT_BTN.style.color = 'white';
  POST_BTN.style.color = 'blue';
  PHOTOS_BTN.style.color = 'white';
});
ABOUT_BTN.addEventListener('click', () => {
  profileContent.style.display = 'none';
  aboutUser.style.display = 'block';
  profileFriendSection.style.display = 'none';
  profilePhotoSection.style.display = 'none';
  FRIENDS_BTN.style.color = 'white';
  ABOUT_BTN.style.color = 'blue';
  POST_BTN.style.color = 'white';
  PHOTOS_BTN.style.color = 'white';
});
FRIENDS_BTN.addEventListener('click', () => {
  profileContent.style.display = 'none';
  aboutUser.style.display = 'none';
  profileFriendSection.style.display = 'block';
  profilePhotoSection.style.display = 'none';
  FRIENDS_BTN.style.color = 'blue';
  ABOUT_BTN.style.color = 'white';
  POST_BTN.style.color = 'white';
  PHOTOS_BTN.style.color = 'white';
});
PHOTOS_BTN.addEventListener('click', () => {
  profileContent.style.display = 'none';
  aboutUser.style.display = 'none';
  profileFriendSection.style.display = 'none';
  profilePhotoSection.style.display = 'block';
  FRIENDS_BTN.style.color = 'white';
  ABOUT_BTN.style.color = 'white';
  POST_BTN.style.color = 'white';
  PHOTOS_BTN.style.color = 'blue';
});

// Cover Photo Upload
const uploadCoverPhoto = document.getElementById('upload-cover-photo-form');

document.getElementById('upload-cover-photo').onchange = () => {
  document.querySelectorAll('.upload-cover-photo-confirm')[0].style.display =
    'block';
};

const CancelCoverPhotoUpload = document.querySelectorAll(
  '.cancel-upload-cover-photo'
);

for (var i = 0; i < CancelCoverPhotoUpload.length; i++) {
  CancelCoverPhotoUpload[i].addEventListener('click', () => {
    document.querySelectorAll('.upload-cover-photo-confirm')[0].style.display =
      'none';
    document.querySelectorAll('.upload-cover-photo-confirm')[1].style.display =
      'none';
    document.getElementById('upload-cover-photo').value = null;
  });
}
uploadCoverPhoto.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newFormData = new FormData();
  newFormData.append(
    'coverPhoto',
    document.getElementById('upload-cover-photo').files[0]
  );
  try {
    const response = await axios({
      method: 'PATCH',
      url: '/v1/users/updateMe',
      data: newFormData,
    });
    if (response.data.status == 'success') {
      window.setTimeout(() => {
        location.assign('/profile');
      }, 50);
    }
  } catch (err) {
    console.log(err.message);
  }
});

// User Photo
const uploadUserPhoto = document.getElementById('upload-user-photo-form');
document.getElementById('upload-user-photo').onchange = () => {
  document.querySelectorAll('.upload-cover-photo-confirm')[1].style.display =
    'block';
};
uploadUserPhoto.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newFormData = new FormData();
  newFormData.append(
    'userPhoto',
    document.getElementById('upload-user-photo').files[0]
  );
  try {
    const response = await axios({
      method: 'PATCH',
      url: '/v1/users/updateMe',
      data: newFormData,
    });
    if (response.data.status == 'success') {
      window.setTimeout(() => {
        location.assign('/profile');
      }, 50);
    }
  } catch (err) {
    console.log(err.message);
  }
});

// about forms related
const overview = document.querySelector('.overview');
const workAndEducation = document.querySelector('.work-and-education');
const placeLived = document.querySelector('.place-lived');
const contactAndInfo = document.querySelector('.contact-and-info');
const detailsAboutYou = document.querySelector('.details-about-you');
const all = document.querySelectorAll('.about-user-content-left');
for (var i = 0; i < all.length; i++) {
  all[i].addEventListener('click', (event) => {
    // display
    overview.style.display = 'none';
    workAndEducation.style.display = 'none';
    placeLived.style.display = 'none';
    contactAndInfo.style.display = 'none';
    detailsAboutYou.style.display = 'none';
    // font color
    document.getElementById('OverviewBTN').style.color = 'white';
    document.getElementById('WorkEducationBTN').style.color = 'white';
    document.getElementById('PlacedLivedBTN').style.color = 'white';
    document.getElementById('ContactInfoBTN').style.color = 'white';
    document.getElementById('DetailsBTN').style.color = 'white';
    event.path[0].style.color = 'blue';
    // display block
    const idBTN = event.path[0].id;
    if (idBTN == 'OverviewBTN') overview.style.display = 'block';
    else if (idBTN == 'WorkEducationBTN')
      workAndEducation.style.display = 'block';
    else if (idBTN == 'PlacedLivedBTN') placeLived.style.display = 'block';
    else if (idBTN == 'ContactInfoBTN') contactAndInfo.style.display = 'block';
    else if (idBTN == 'DetailsBTN') detailsAboutYou.style.display = 'block';
  });
}

// overview
const AddaWorkspace = document.getElementById('AddaWorkspace');
const WorkSpaceCancel = document.getElementById('WorkSpaceCancel');
AddaWorkspace.addEventListener('click', () => {
  document.getElementById('AddaWorkspaceFORM').style.display = 'block';
  AddaWorkspace.style.display = 'none';
});
WorkSpaceCancel.addEventListener('click', () => {
  document.getElementById('AddaWorkspaceFORM').style.display = 'none';
  AddaWorkspace.style.display = 'block';
});

//TODO
// const RelationShipBTN = document.getElementById('RelationShipBTN');
// const RelationShipCancel = document.getElementById('RelationShipCancel');
// RelationShipBTN.addEventListener('click', () => {
//   document.getElementById('RelationShipBTNFORM').style.display = 'block';
//   RelationShipBTN.style.display = 'none';
// });

//work-and-education
const AddaWorkspace2nd = document.getElementById('Workspace2nd');
const WorkSpace2ndCancel = document.getElementById('WorkSpace2ndCancel');
AddaWorkspace2nd.addEventListener('click', () => {
  document.getElementById('Workspace2ndFORM').style.display = 'block';
  AddaWorkspace2nd.style.display = 'none';
});
WorkSpace2ndCancel.addEventListener('click', () => {
  document.getElementById('Workspace2ndFORM').style.display = 'none';
  AddaWorkspace2nd.style.display = 'block';
});

const AddAUniversity = document.getElementById('AddAUniversity');
const CancelAddingAUniversity = document.getElementById(
  'CancelAddingAUniversity'
);
AddAUniversity.addEventListener('click', () => {
  AddAUniversity.style.display = 'none';
  document.getElementById('AddAUniversityFORM').style.display = 'block';
});
CancelAddingAUniversity.addEventListener('click', () => {
  AddAUniversity.style.display = 'block';
  document.getElementById('AddAUniversityFORM').style.display = 'none';
});

const AddAHighSchool = document.getElementById('AddAHighSchool');
const CancelAddingAHighSchool = document.getElementById(
  'CancelAddingAHighSchool'
);
AddAHighSchool.addEventListener('click', () => {
  AddAHighSchool.style.display = 'none';
  document.getElementById('AddAHighSchoolFORM').style.display = 'block';
});
CancelAddingAHighSchool.addEventListener('click', () => {
  AddAHighSchool.style.display = 'block';
  document.getElementById('AddAHighSchoolFORM').style.display = 'none';
});

const AddACity = document.getElementById('AddACity');
const cancelAddingACity = document.getElementById('cancelAddingACity');
AddACity.addEventListener('click', () => {
  document.getElementById('AddACityFORM').style.display = 'block';
  AddACity.style.display = 'none';
});
cancelAddingACity.addEventListener('click', () => {
  document.getElementById('AddACityFORM').style.display = 'none';
  AddACity.style.display = 'block';
});

const AddAddress = document.getElementById('AddAddress');
const CancelAddingAddress = document.getElementById('CancelAddingAddress');
AddAddress.addEventListener('click', () => {
  document.getElementById('AddAddressFORM').style.display = 'block';
  AddAddress.style.display = 'none';
});
CancelAddingAddress.addEventListener('click', () => {
  document.getElementById('AddAddressFORM').style.display = 'none';
  AddAddress.style.display = 'block';
});

const AddLanguage = document.getElementById('AddLanguage');
const CancelAddingLanguage = document.getElementById('CancelAddingLanguage');
AddLanguage.addEventListener('click', () => {
  document.getElementById('AddLanguageFORM').style.display = 'block';
  AddLanguage.style.display = 'none';
});
CancelAddingLanguage.addEventListener('click', () => {
  document.getElementById('AddLanguageFORM').style.display = 'none';
  AddLanguage.style.display = 'block';
});

const AddInterestedIn = document.getElementById('AddInterestedIn');
const CancelAddingInterestedIn = document.getElementById(
  'CancelAddingInterestedIn'
);
AddInterestedIn.addEventListener('click', () => {
  document.getElementById('AddInterestedInFORM').style.display = 'block';
  AddInterestedIn.style.display = 'none';
});
CancelAddingInterestedIn.addEventListener('click', () => {
  document.getElementById('AddInterestedInFORM').style.display = 'none';
  AddInterestedIn.style.display = 'block';
});

const AddGender = document.getElementById('AddGender');
const CancelAddingGender = document.getElementById('CancelAddingGender');
AddGender.addEventListener('click', () => {
  document.getElementById('AddGenderFORM').style.display = 'block';
  AddGender.style.display = 'none';
});
CancelAddingGender.addEventListener('click', () => {
  document.getElementById('AddGenderFORM').style.display = 'none';
  AddGender.style.display = 'block';
});

const AddBirthday = document.getElementById('AddBirthday');
const CancelAddingBirthday = document.getElementById('CancelAddingBirthday');
AddBirthday.addEventListener('click', () => {
  document.getElementById('AddBirthdayFORM').style.display = 'block';
  AddBirthday.style.display = 'none';
});
CancelAddingBirthday.addEventListener('click', () => {
  document.getElementById('AddBirthdayFORM').style.display = 'none';
  AddBirthday.style.display = 'block';
});

const Addyourself = document.getElementById('Addyourself');
const CancelAddingyourself = document.getElementById('CancelAddingyourself');
Addyourself.addEventListener('click', () => {
  document.getElementById('AddyourselfFORM').style.display = 'block';
  Addyourself.style.display = 'none';
});
CancelAddingyourself.addEventListener('click', () => {
  document.getElementById('AddyourselfFORM').style.display = 'none';
  Addyourself.style.display = 'block';
});

const AddOtherName = document.getElementById('AddOtherName');
const CancelAddingOtherName = document.getElementById('CancelAddingOtherName');
AddOtherName.addEventListener('click', () => {
  document.getElementById('AddOtherNameFORM').style.display = 'block';
  AddOtherName.style.display = 'none';
});
CancelAddingOtherName.addEventListener('click', () => {
  document.getElementById('AddOtherNameFORM').style.display = 'none';
  AddOtherName.style.display = 'block';
});
