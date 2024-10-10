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
        document.getElementById('add-image-form').addEventListener('submit', addImage);
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
        <p>${news.avatar}</p>
        <p>By ${news.author}</p>
        <p><a href="${news.url}" target="_blank">Read more</a></p>
        <p>Description: ${news.description}</p>
    `;
}

function fetchImages(id) {
    fetch(`${apiBaseUrl}/news/${id}/images`)
        .then(response => response.json())
        .then(data => {
            images = data;
            currentSlide = 0;
            renderImageSlider();
        })
        .catch(error => console.error('Error fetching images:', error));
}

function renderImageSlider() {
    const slidesContainer = document.querySelector('.slides-container');
    slidesContainer.innerHTML = '';

    if (images.length === 0) {
        slidesContainer.innerHTML = '<p class="no-images">No images available.</p>';
        return;
    }

    images.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.classList.add('slide');
        if (index === 0) slide.classList.add('active');
        slide.innerHTML = `
            <img src="${img.image}" alt="Image ${index + 1}">
            <button class="delete-image-btn" data-image-id="${img.id}">✖️</button>
        `;
        slidesContainer.appendChild(slide);
    });

    updateSlideDisplay();

    // Attach event listeners to delete buttons
    document.querySelectorAll('.delete-image-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const imageId = e.target.getAttribute('data-image-id');
            deleteImage(imageId);
        });
    });
}

function updateSlideDisplay() {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
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
    if (images.length === 0) return;

    currentSlide = (currentSlide + direction + images.length) % images.length;
    updateSlideDisplay();
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
            <img src="${comment.avatar}" alt="${comment.name}" class="avatar">
            <div>
                <p><strong>${comment.name}</strong></p>
                <p>${comment.comment}</p>
                <button class="edit-comment">Edit</button>
                <button class="delete-comment">Delete</button>
            </div>
        `;
        commentsList.appendChild(commentDiv);

   
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
            avatar: 'https://gravatar.com/avatar/ab556f09fef2b920ed262386b7a4ffaa?s=400&d=robohash&r=x', 
            comment: commentText
        };

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
    if (newCommentText !== null && newCommentText.trim() !== '') {
        fetch(`${apiBaseUrl}/news/${newsId}/comments/${comment.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...comment, comment: newCommentText.trim() })
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

// Add Image Functionality
function addImage(event) {
    event.preventDefault();
    const imageFileInput = document.getElementById('image-file');
    const file = imageFileInput.files[0];

    if (file) {
        //base 64
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageData = reader.result; 
            const newImage = {
                newsId: newsId,
                image: imageData
            };

            fetch(`${apiBaseUrl}/news/${newsId}/images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newImage)
            })
            .then(response => response.json())
            .then(data => {
                fetchImages(newsId);
                document.getElementById('add-image-form').reset();
                
                // Show success message
                displaySuccessMessage('Image added successfully!');
            })
            .catch(error => console.error('Error adding image:', error));
        };
        reader.readAsDataURL(file);
    }
}

// Function to display success message
function displaySuccessMessage(message) {
    const messageContainer = document.getElementById('success-message');
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';

    // Hide the message after 3 seconds
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 3000);
}


// Delete Image Functionality
function deleteImage(imageId) {
    if (confirm('Are you sure you want to delete this image?')) {
        fetch(`${apiBaseUrl}/news/${newsId}/images/${imageId}`, {
            method: 'DELETE'
        })
            .then(() => {
                if (currentSlide >= images.length - 1) {
                    currentSlide = images.length - 2 >= 0 ? images.length - 2 : 0;
                }
                fetchImages(newsId);
            })
            .catch(error => console.error('Error deleting image:', error));
    }
}
