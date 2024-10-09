const apiBaseUrl = 'https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1';
let newsId = null;
let images = [];
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    newsId = params.get('id');
    if (newsId) {
        fetchNewsDetail(newsId);
        fetchImages(newsId);
        fetchComments(newsId);
        document.getElementById('comment-form').addEventListener('submit', addComment);
        setupSliderControls();
    } else {
        alert('No news ID provided.');
        window.location.href = 'index.html';
    }
});

function fetchNewsDetail(id) {
    fetch(`${apiBaseUrl}/news/${id}`)
        .then(response => response.json())
        .then(data => renderNewsDetail(data))
        .catch(error => console.error('Error fetching news detail:', error));
}

function renderNewsDetail(news) {
    const newsDetail = document.getElementById('news-detail');
    newsDetail.innerHTML = `
        <h2>${news.title}</h2>
        <p><img src="${news.avatar}}"></p>
        <p>By ${news.author}</p>
        <p>${news.description}</p>
        <p><a href="${news.url}" target="_blank">Read more</a></p>
    `;
}

function fetchImages(id) {
    fetch(`${apiBaseUrl}/news/${id}/images`)
        .then(response => response.json())
        .then(data => {
            images = data;
            renderImageSlider();
        })
        .catch(error => console.error('Error fetching images:', error));
}

function renderImageSlider() {
    const slidesContainer = document.querySelector('.slides-container');
    slidesContainer.innerHTML = '';
    images.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.classList.add('slide');
        if (index === 0) slide.classList.add('active');
        slide.innerHTML = `<img src="${img.image}" alt="Image ${index + 1}">`;
        slidesContainer.appendChild(slide);
    });
}

function setupSliderControls() {
    document.querySelector('.prev').addEventListener('click', () => {
        changeSlide(-1);
    });
    document.querySelector('.next').addEventListener('click', () => {
        changeSlide(1);
    });
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

function fetchComments(id) {
    fetch(`${apiBaseUrl}/news/${id}/comments`)
        .then(response => response.json())
        .then(data => renderComments(data))
        .catch(error => console.error('Error fetching comments:', error));
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.classList.add('comment-item');
        commentDiv.dataset.commentId = comment.id;
        commentDiv.innerHTML = `
            
            <div>
                <p><img src='${comment.avatar}' width='60px'; style='border-radius: 50%'></p>
                <p><strong>${comment.name}</strong></p>
                <p>${comment.comment}</p>
                <button class="edit-comment">Edit</button>
                <button class="delete-comment">Delete</button>
            </div>
        `;
        commentsList.appendChild(commentDiv);

        // Edit and Delete functionality
        commentDiv.querySelector('.edit-comment').addEventListener('click', () => editComment(comment));
        commentDiv.querySelector('.delete-comment').addEventListener('click', () => deleteComment(comment.id));
    });
}

function addComment(event) {
    event.preventDefault();
    const name = document.getElementById('comment-name').value.trim();
    const commentText = document.getElementById('comment-text').value.trim();

    if (name && commentText) {
        const newComment = {
            newsId: newsId,
            name: name,
            avatar: 'https://gravatar.com/avatar/1c8e8a6e8d1fe52b782b280909abeb38?s=400&d=robohash&r=x', // Placeholder avatar
            comment: commentText
        };

        console.log('Adding comment:', newComment);

        fetch(`${apiBaseUrl}/news/${newsId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newComment)
        })
            .then(response => response.json())
            .then(data => {
                fetchComments(newsId);
                document.getElementById('comment-form').reset();
            })
            .catch(error => console.error('Error adding comment:', error));
    }
}

function editComment(comment) {
    const newCommentText = prompt('Edit your comment:', comment.comment);
    if (newCommentText !== null) {
        fetch(`${apiBaseUrl}/news/${newsId}/comments/${comment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...comment, comment: newCommentText })
        })
            .then(response => response.json())
            .then(data => fetchComments(newsId))
            .catch(error => console.error('Error editing comment:', error));
    }
}

function deleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        fetch(`${apiBaseUrl}/news/${newsId}/comments/${commentId}`, {
            method: 'DELETE'
        })
            .then(() => fetchComments(newsId))
            .catch(error => console.error('Error deleting comment:', error));
    }
}
