document.addEventListener('DOMContentLoaded', function () {
    const latestPostContainer = document.getElementById('latest-blog-post');

    fetch('/blog/posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load blog posts: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            if (!Array.isArray(posts) || posts.length === 0) {
                throw new Error('No blog posts are available');
            }

            const latestPost = posts[0];
            const link = document.createElement('a');
            link.href = `/blog/posts/${encodeURIComponent(latestPost.filename)}`;
            link.textContent = latestPost.title;

            const date = document.createElement('span');
            date.className = 'latest-blog-date';
            date.textContent = latestPost.date;

            latestPostContainer.replaceChildren(link, date);
        })
        .catch(error => {
            console.error('Error loading latest blog post:', error);
            latestPostContainer.textContent = 'Latest post is unavailable.';
        });
});
