const apiBaseUrl = 'https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1';

let currentPage = 1;
const limit = 10;

document.addEventListener('DOMContentLoaded', () => {
    fetchNews(currentPage);
    document.getElementById('next-btn').addEventListener('click', () => {
        currentPage++;
        fetchNews(currentPage);
    });
    document.getElementById('back-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchNews(currentPage);
        }
    });
});

function fetchNews(page) {
    fetch(`${apiBaseUrl}/news?page=${page}&limit=${limit}`)
        .then(response => response.json())
        .then(data => {
            renderNewsList(data);
            document.getElementById('page-info').textContent = `Page ${page}`;
            document.getElementById('back-btn').disabled = page === 1;
            document.getElementById('next-btn').disabled = data.length < limit;
        })
        .catch(error => console.error('Error fetching news:', error));
}

function renderNewsList(news) {
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = '';
    news.forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.classList.add('news-item');
        newsItem.innerHTML = `
            <h2><a href="news.html?id=${item.id}">${item.title}</a></h2>
            <p>By ${item.author}</p>
        `;
        newsList.appendChild(newsItem);
    });
}
