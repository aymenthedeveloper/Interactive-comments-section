const {currentUser, comments} = {
  "currentUser": {
    "image": { 
      "png": "./images/avatars/image-juliusomo.png",
      "webp": "./images/avatars/image-juliusomo.webp"
    },
    "username": "juliusomo"
  },
  "comments": [
    {
      "id": 1,
      "content": "Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
      "createdAt": "1 month ago",
      "score": 12,
      "user": {
        "image": { 
          "png": "./images/avatars/image-amyrobson.png",
          "webp": "./images/avatars/image-amyrobson.webp"
        },
        "username": "amyrobson"
      },
      "replies": []
    },
    {
      "id": 2,
      "content": "Woah, your project looks awesome! How long have you been coding for? I'm still new, but think I want to dive into React as well soon. Perhaps you can give me an insight on where I can learn React? Thanks!",
      "createdAt": "2 weeks ago",
      "score": 5,
      "user": {
        "image": { 
          "png": "./images/avatars/image-maxblagun.png",
          "webp": "./images/avatars/image-maxblagun.webp"
        },
        "username": "maxblagun"
      },
      "replies": [
        {
          "id": 3,
          "content": "If you're still new, I'd recommend focusing on the fundamentals of HTML, CSS, and JS before considering React. It's very tempting to jump ahead but lay a solid foundation first.",
          "createdAt": "1 week ago",
          "score": 4,
          "replyingTo": "maxblagun",
          "user": {
            "image": { 
              "png": "./images/avatars/image-ramsesmiron.png",
              "webp": "./images/avatars/image-ramsesmiron.webp"
            },
            "username": "ramsesmiron"
          }
        },
        {
          "id": 4,
          "content": "I couldn't agree more with this. Everything moves so fast and it always seems like everyone knows the newest library/framework. But the fundamentals are what stay constant.",
          "createdAt": "2 days ago",
          "score": 2,
          "replyingTo": "ramsesmiron",
          "user": {
            "image": { 
              "png": "./images/avatars/image-juliusomo.png",
              "webp": "./images/avatars/image-juliusomo.webp"
            },
            "username": "juliusomo"
          }
        }
      ]
    }
  ]
}
const db = {
  lastId: 0,
  editTargetId: 0,
  replyTargetId: 0,
  deleteTargetId: 0,
  rating: {},
  commentsRating: {}
}

const CommentsSection = document.querySelector('main .comments-section');
const CommentInputContainer = document.querySelector('main .comment-input');
const CommentInput = document.querySelector('main .comment-input .input');
const CommentSendBtn = document.querySelector('main .comment-input .send');
const modal = document.querySelector('.modal');
const CancelDelete = document.querySelector('.modal .btns .cancel');
const confirmDelete = document.querySelector('.modal .btns .delete');

function getCommentHtml(comment){
  const {id, content, score, createdAt, user, replies, replyingTo} = comment;
    db.lastId = id;
    db.commentsRating[id] = {
      rating: score,
    };
  let allReplies = '';
  if (!!replies && replies.length){
    allReplies += replies.map(getCommentHtml).join('\n')
  }
  return `
  <div class="comment ${currentUser.username == user.username? "is-own-comment": ""}" data-id="${id}" data-username="${user.username}">
    <div class="comment-body">
      <div class="rating">
        <button data-id="${id}" onclick="changeRating(event)">
          <img src="./images/icon-plus.svg" alt="" class="plus">
          <div class="count">${score}</div>
          <img src="./images/icon-minus.svg" alt="" class="minus">
        </button>
      </div>
      <div class="data">
        <div class="header">
          <div class="user">
            <img src="${user.image.png}" alt="">
            <p class="username">${user.username}${currentUser.username == user.username? `<span class="you">you</span>`: ""}</p>
            <p class="date ">${createdAt}</p>
          </div>
          <div class="comment-actions" data-id="${id}">
            <button onclick="showConfirmation(event)"><img src="./images/icon-delete.svg" alt="" > Delete</button>
            <button onclick="editComment(event)"><img src="./images/icon-edit.svg" alt=""> Edit</button>
            <button onclick="replyToComment(event)"><img src="./images/icon-reply.svg" alt=""> Reply</button>
          </div>
        </div>
        <div class="comment-content">
          ${(!!replyingTo? `<span class="replyingTo">@${replyingTo} </span>`: '')}
          <span class="content">${content}</span>
        </div>
      </div>
    </div>
    <div class="comment-replies">
      ${allReplies}
    </div>
    </div>`
  }
  
function resetInput(action="SEND", mode='', value=null, placeholder="Add a comment..."){
  CommentSendBtn.innerHTML = action;
  CommentSendBtn.setAttribute('mode', mode)
  CommentInput.value = value;
  CommentInput.setAttribute('placeholder', placeholder)
}

function loadComments(){
  for (const key in comments) {
    let comment = getCommentHtml(comments[key])
    CommentsSection.insertAdjacentHTML('beforeend', comment)
  }
  resetInput()
}


CommentSendBtn.addEventListener('click', ()=>{
  const content = CommentInput.value;
  if (content == "") return;
  if (CommentSendBtn.getAttribute("mode") === 'edit'){
    const targetComment = document.querySelector(`.comment[data-id="${db.editTargetId}"] .data .comment-content .content`);
    targetComment.innerHTML = content;
  } else if(CommentSendBtn.getAttribute("mode") === 'reply'){
    const targetComment = document.querySelector(`.comment[data-id="${db.replyTargetId}"]`);
    const myComment = getCommentHtml({id: ++db.lastId, content: content, score: 0,createdAt: 'just now', user: currentUser, replyingTo: targetComment.dataset.username})
    if (targetComment.parentNode.classList.contains('comment-replies')) targetComment.parentNode.insertAdjacentHTML('beforeend', myComment);
    else targetComment.lastElementChild.insertAdjacentHTML('beforeend', myComment)
    CommentInput.setAttribute('placeholder', `Add a comment...`)
  } else{
    const myComment = getCommentHtml({id: ++db.lastId, content: content, score: 0, createdAt: 'just now', user: currentUser})
    CommentsSection.insertAdjacentHTML('beforeend', myComment)
  }
  resetInput()
})
CancelDelete.addEventListener('click', ()=>{
  modal.close()
})
confirmDelete.addEventListener('click', ()=>{
  deleteComment()
  modal.close()
})


loadComments();


function showConfirmation(event){
  modal.showModal();
  console.log('modal opened');
  db.deleteTargetId = event.target.parentNode.dataset.id;
}
function deleteComment(){
  const id = db.deleteTargetId;
  const comment = document.querySelector(`.comment[data-id="${id}"]`);
  if (comment.classList.contains('is-own-comment')) comment.remove();
  if (id == db.editTargetId) resetInput();
}
function replyToComment(event){
  db.replyTargetId = event.target.parentNode.dataset.id;
  const comment = document.querySelector(`.comment[data-id="${db.replyTargetId}"]`);
  resetInput("REPLY", "reply", null, `Reply to @${comment.dataset.username}...`)
  CommentInput.focus()
}
function editComment(event){
  db.editTargetId = event.target.parentNode.dataset.id;
  const comment = document.querySelector(`.comment[data-id="${db.editTargetId}"]`);
  const commentContent = comment.querySelector('.data .comment-content .content').textContent.trim();
  resetInput("EDIT", "edit", commentContent, 'Edit your comment...')
  CommentInput.focus()
}
function changeRating(event) {
  id = event.target.dataset.id ?? event.target.parentNode.dataset.id;
  const ratingBtn = document.querySelector(`.comment[data-id="${id}"] .comment-body .rating button`);
  const commentScore = ratingBtn.querySelector('.count');
  if (event.target.classList.contains('plus')) {
    commentScore.innerHTML = db.commentsRating[id].rating + 1
    ratingBtn.classList.add('no-plus')
    ratingBtn.classList.remove('no-minus')
  } else if (event.target.classList.contains('minus')) {
    if (db.commentsRating[id].rating + 1 == 1){
      commentScore.innerHTML = db.commentsRating[id].rating;
    }else {
      commentScore.innerHTML = db.commentsRating[id].rating - 1
      ratingBtn.classList.add('no-minus')
    }
    ratingBtn.classList.remove('no-plus')
  }
}