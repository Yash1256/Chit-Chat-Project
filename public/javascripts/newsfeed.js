('use strict');
//like here
var liketoggle = document.querySelectorAll('.like-color-toggle');
for (var i = 0; i < liketoggle.length; i++) {
  liketoggle[i].addEventListener('click', async (event) => {
    var id = event.target
      .closest('.post-data-with-information')
      .getAttribute('data-id');
    const urrl = '/v1/posts/' + id + '/like';
    try {
      const res = await axios({
        method: 'PATCH',
        url: urrl,
      }).then((res) => {
        if (res.data.status == 'OK') {
          event.target
            .closest('.post-data-with-information')
            .querySelector('.likes-count').textContent =
            res.data.data.length + ' like(s)';
          if (res.data.liked) {
            // console.log('I came Here');
            var element = event.target
              .closest('.post-data-with-information')
              .querySelector('.not-liked');
            // console.log(element);
            element.classList.remove('not-liked');
            element.classList.add('liked-already');
          } else {
            var element = event.target
              .closest('.post-data-with-information')
              .querySelector('.liked-already');
            // console.log(element);
            element.classList.add('not-liked');
            element.classList.remove('liked-already');
          }
        }
      });
    } catch (err) {
      console.log('Sry for Inconvinience');
    }
  });
}
// Onwards post modal window
var postModalBtn = document.querySelector('.post-input');
var postModal = document.querySelector('.Post-Modal');
var postModalClose = document.querySelector('.closeModalWindow');
postModalBtn.addEventListener('click', () => {
  postModal.style.display = 'block';
});
window.onclick = function (event) {
  if (event.target == postModal) {
    postModal.style.display = 'none';
  }
};
postModalClose.addEventListener('click', () => {
  postModal.style.display = 'none';
});

// Posting post
const submitPostBTN = document.getElementById('postForm');
submitPostBTN.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('postContent', document.getElementById('postContent').value);
  formData.append('image', document.getElementById('actual-btn-one').files[0]);
  try {
    const response = await axios({
      method: 'POST',
      url: '/v1/posts/',
      data: formData,
    });
    if (response.data.status == 'OK') {
      window.setTimeout(() => {
        location.assign(window.location.href);
      }, 50);
    }
  } catch (err) {
    console.log('Error occured while posting post');
  }
});

//Posting comment

const commentSection = document.querySelectorAll('.commentSection');
const appendComment = (
  commentText,
  userPhoto,
  commentId,
  preOrAppend,
  whereToPreOrAppend,
  fromLoggedInUser
) => {
  let innerHTML = `<div class="who-commented" style = "background-color : rgb(36, 37, 39)">
                        <img class="avatar avatar-margin dis-inline-block" src="/users/${userPhoto}" alt="" />
                        <div class="comment-section dis-inline-block">
                            ${commentText}
                        </div>

                        <div class="feature-on-comment">
                            <div class="row" style="margin-left: 1vw">
                                <div class="col-4 button-format-comment"> <i class="fas fa-thumbs-up"></i>&nbsp;Like</div>
                                <div class="col-4 button-format-comment">
                                    <svg style="margin-bottom: 2px;" xmlns="http://www.w3.org/2000/svg" width="21" height="21"
                                        fill="currentColor" class="bi bi-reply-fill" viewBox="0 0 16 16">
                                        <path
                                            d="M5.921 11.9L1.353 8.62a.719.719 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z" />
                                    </svg>
                                    Reply
                                </div>`;
  if (fromLoggedInUser) {
    innerHTML += `<div class="col-4 button-format-comment comment-select" comment-id="${commentId}"><i class="fas fa-trash"></i>&nbsp;Delete</div>`;
  }
  innerHTML += `</div>
                  </div>
                  <!-- <div class="comment-inherited">tu galat hai</div> -->
                </div>`;
  const newDiv = document.createElement('div');
  newDiv.classList.add('toBeDeleted');
  newDiv.innerHTML = innerHTML;
  newDiv
    .querySelector('.comment-select')
    .addEventListener('click', Deleting_Comment);
  if (preOrAppend) {
    whereToPreOrAppend.querySelector('.Comments-Hide').prepend(newDiv);
    return;
  }
  whereToPreOrAppend.querySelector('.Comments-Hide').append(newDiv);
};
for (var i = 0; i < commentSection.length; i++) {
  commentSection[i].addEventListener('click', async (event) => {
    var elementPost = event.target.closest('.post-data-with-information');
    var commentHideSection = elementPost.querySelector('.Comments-Hide').style
      .display;
    elementPost.querySelector('.Comments-Hide').innerHTML = '';
    if (commentHideSection == 'block') {
      elementPost.querySelector('.Comments-Hide').style.display = 'none';
      return;
    }
    var id = elementPost.getAttribute('data-id');
    const urrl = '/v1/posts/' + id + '/comments';
    const loggedInUser = document
      .querySelector('.loggedInUser')
      .value.replace(/ /g, '');
    try {
      const responseFromServer = await axios({
        method: 'GET',
        url: urrl,
      });
      if (responseFromServer.status == 200) {
        const allCommentOnPost = responseFromServer.data.data;
        for (let i = 0; i < allCommentOnPost.length; i++) {
          if (allCommentOnPost[i].authorId.username == loggedInUser) {
            appendComment(
              allCommentOnPost[i].text,
              allCommentOnPost[i].authorId.userPhoto,
              allCommentOnPost[i]._id,
              false,
              elementPost,
              true
            );
          } else {
            appendComment(
              allCommentOnPost[i].text,
              allCommentOnPost[i].authorId.userPhoto,
              allCommentOnPost[i]._id,
              false,
              elementPost,
              false
            );
          }
        }
      }
      if (elementPost.querySelector('.Comments-Hide').innerHTML == '') {
        elementPost.querySelector('.Comments-Hide').style.display = 'none';
        return;
      }
      elementPost.querySelector('.Comments-Hide').style.display = 'block';
      // then add eventlistenser
    } catch (error) {
      console.log(
        'Error occur while requesting for comments in nesfeed.js on line 182 approx'
      );
    }
  });
}

// auto resizing comment textarea
const allCommentPostData = document.querySelectorAll('.commentPostData');
for (var i = 0; i < allCommentPostData.length; i++) {
  allCommentPostData[i].addEventListener('keypress', function (event) {
    if (event.shiftKey && event.key == 'Enter') {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    }
    if (!event.shiftKey && event.key == 'Enter') {
      event.target
        .closest('.commentPost')
        .querySelector('.commentPostSubmit')
        .click();
    }
  });
}
// implement posting comment
const commentPost = document.querySelectorAll('.commentPost');
for (var i = 0; i < commentPost.length; i++) {
  commentPost[i].addEventListener('submit', async (event) => {
    event.preventDefault();
    const commentDiv = event.target.closest('.post-data-with-information');
    const id = commentDiv.getAttribute('data-id');
    const commentData = commentDiv
      .querySelector('.commentPostData')
      .value.replace(/\s+/g, ' ')
      .trim();
    if (!commentData) return;
    const urrl = '/v1/posts/' + id + '/comments';
    try {
      const response = await axios({
        method: 'POST',
        url: urrl,
        data: {
          text: commentData,
        },
      });
      if (response.data.status == 'Ok') {
        commentDiv
          .querySelector('.comments-count')
          .querySelector('.Comments').textContent =
          response.data.length + ' Comments';
        commentDiv.querySelector('.commentPostData').value = '';
        var comment_hide_cls = commentDiv.querySelector('.Comments-Hide');
        if (comment_hide_cls) {
          comment_hide_cls.style.display = 'none';
          comment_hide_cls.innerHTML = '';
        }
      }
    } catch (error) {
      console.log(
        'error occured in newsfeed.js on line 176 apporx, while posting comment'
      );
      console.log(error.message);
    }
  });
}

// Deleting Comment
const Deleting_Comment = async (event) => {
  var elementPost = event.target.closest('.post-data-with-information');
  var id = elementPost.getAttribute('data-id');
  var comment_id = event.target
    .closest('.comment-select')
    .getAttribute('comment-id');
  const urrl = '/v1/posts/' + id + '/comments/' + comment_id;
  try {
    const response = await axios({
      method: 'DELETE',
      url: urrl,
    });
    if (response.data.status == 'success') {
      event.target.closest('.toBeDeleted').remove();
      if (elementPost.querySelector('.Comments-Hide').innerHTML == '') {
        elementPost.querySelector('.Comments-Hide').style.display = 'none';
      }
      elementPost
        .querySelector('.comments-count')
        .querySelector('.Comments').textContent =
        response.data.length + ' Comments';
    }
  } catch (error) {
    console.log(
      'error occured in newsfeed.js on line 229 apporx, while deleting comment'
    );
    console.log(error.message);
  }
};

// delete post
const deletePost = document.querySelectorAll('.delete-post');
for (var i = 0; i < deletePost.length; i++) {
  deletePost[i].addEventListener('click', async (event) => {
    var id = event.target
      .closest('.post-data-with-information')
      .getAttribute('data-id');
    try {
      const urrl = '/v1/posts/' + id;
      const response = await axios({
        method: 'DELETE',
        url: urrl,
      });
      if (response.data.status == 'OK') {
        window.setTimeout(() => {
          location.assign(window.location.href);
        }, 50);
      }
    } catch (err) {
      console.log(err.message);
    }
  });
}

//story post
const storyForm = document.getElementById('story-form');
if (storyForm) {
  document.getElementById('story-btn').onchange = () => {
    document.querySelector('.upload-story-confirm').style.display = 'block';
  };
  const cancelConfirmStory = document.querySelector('.cancel-confirm-story');
  cancelConfirmStory.addEventListener('click', () => {
    document.querySelector('.upload-story-confirm').style.display = 'none';
    document.getElementById('story-btn').value = null;
  });
  storyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData();
    form.append('storyPhoto', document.getElementById('story-btn').files[0]);
    try {
      const response = await axios({
        method: 'PATCH',
        url: 'v1/story',
        data: form,
      });
      if (response.data.status == 'OK') {
        document.querySelector('.upload-story-confirm').style.display = 'none';
        window.setTimeout(() => {
          location.assign('/newsfeed');
        }, 50);
      }
    } catch (err) {
      console.log(err.message);
    }
  });
}

// left block friend Suggestion list

const addFriendOption = document.querySelectorAll('.add-friend-option');
for (var i = 0; i < addFriendOption.length; i++) {
  addFriendOption[i].addEventListener('click', async (event) => {
    const parentDiv = event.target.closest('.addFriendDiv');
    const userName = parentDiv.querySelector('.show-username').textContent;
    try {
      const urll = 'v1/users/addFriend/' + userName + '/';
      const response = await axios({
        method: 'PATCH',
        url: urll,
      });
      if (response.data.status == 'Success') {
        window.setTimeout(() => {
          location.assign('/newsfeed');
        }, 50);
      }
    } catch (err) {
      console.log(err);
    }
  });
}

const removeFriendOption = document.querySelectorAll('.removeFriend');
for (var i = 0; i < removeFriendOption.length; i++) {
  removeFriendOption[i].addEventListener('click', async (event) => {
    const parentDiv = event.target.closest('.ForFriendRemove');
    const userName = parentDiv.querySelector('.UserName').textContent;
    try {
      const urll = 'v1/users/removeFriend/' + userName + '/';
      const response = await axios({
        method: 'PATCH',
        url: urll,
      });
      if (response.data.status == 'Success') {
        window.setTimeout(() => {
          location.assign('/profile');
        }, 50);
      }
    } catch (err) {
      console.log(err);
    }
  });
}
