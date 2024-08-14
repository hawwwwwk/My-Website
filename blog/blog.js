document.addEventListener('DOMContentLoaded', function () {
    fetch('posts.json')
        .then(response => response.json())
        .then(posts => {
            let postsHTML = '';
            posts.forEach(post => {
                postsHTML += `
                    <a href="posts/${post.filename}"><li>
                        <span>${post.title}</span>
                        <span class="music-list-span-right">${post.date}</span>
                    </li></a>
                `;
            });

            // inject
            document.getElementById('posts-list').innerHTML = postsHTML;
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.getElementById('posts-list').innerHTML = '<li>Error loading posts</li>';
        });
});
