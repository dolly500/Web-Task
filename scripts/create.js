const apiBaseUrl = 'https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1';
let isEditMode = false;
let newsId = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    newsId = params.get('id');
    if (newsId) {
        isEditMode = true;
        fetchNewsForEdit(newsId);
    }

    document.getElementById('news-form').addEventListener('submit', submitForm);
});

function fetchNewsForEdit(id) {
    fetch(`${apiBaseUrl}/news/${id}`)
        .then(response => response.json())
        .then(data => populateForm(data))
        .catch(error => console.error('Error fetching news for edit:', error));
}

function populateForm(news) {
    document.getElementById('news-id').value = news.id;
    document.getElementById('news-author').value = news.author;
    document.getElementById('news-avatar').value = news.avatar;
    document.getElementById('news-title').value = news.title;
    document.getElementById('news-url').value = news.url;
    document.getElementById('news-description').value = news.description;
}

function submitForm(event) {
    event.preventDefault();
    const author = document.getElementById('news-author').value.trim();
    const avatar = document.getElementById('news-avatar').value.trim();
    const title = document.getElementById('news-title').value.trim();
    const url = document.getElementById('news-url').value.trim();
    const description = document.getElementById('news-description').value.trim();

    const newsData = { author, avatar, title, url, description };

    if (isEditMode) {
        // Update existing news
        fetch(`${apiBaseUrl}/news/${newsId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newsData)
        })
            .then(response => response.json())
            .then(() => {
                alert('News updated successfully!');
                window.location.href = `news.html?id=${newsId}`;
            })
            .catch(error => console.error('Error updating news:', error));
    } else {
        // Create new news
        fetch(`${apiBaseUrl}/news`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newsData)
        })
            .then(response => response.json())
            .then(() => {
                alert('News created successfully!');
                window.location.href = 'index.html';
            })
            .catch(error => console.error('Error creating news:', error));
    }
}
