document.addEventListener('DOMContentLoaded', function () {
    const postsList = document.getElementById('posts-list');
    const tagOptions = document.getElementById('blog-tag-options');
    const filterStatus = document.getElementById('blog-tag-filter-status');
    const showAllButton = document.getElementById('show-all-posts');
    const selectedTags = new Set();
    let posts = [];

    function getPostTags(filename) {
        return fetch(`posts/${encodeURIComponent(filename)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Unable to load ${filename}: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                const postDocument = new DOMParser().parseFromString(html, 'text/html');
                const tags = postDocument.querySelector('meta[name="tags"]')?.content || '';
                return tags.split(',').map(tag => tag.trim()).filter(Boolean);
            });
    }

    function renderTagFilters() {
        const tagCounts = new Map();
        posts.forEach(post => {
            post.tags.forEach(tag => {
                const key = tag.toLocaleLowerCase();
                const current = tagCounts.get(key);
                tagCounts.set(key, { label: current?.label || tag, count: (current?.count || 0) + 1 });
            });
        });

        tagOptions.replaceChildren();
        tagCounts.forEach(({ label, count }, key) => {
            const button = document.createElement('button');
            button.className = 'blog-tag-filter-button';
            button.type = 'button';
            button.dataset.tag = key;
            button.setAttribute('aria-pressed', 'false');
            button.append(document.createTextNode(label));

            const countLabel = document.createElement('span');
            countLabel.className = 'blog-tag-count';
            countLabel.textContent = count;
            button.append(countLabel);
            tagOptions.append(button);
        });
    }

    function filterPosts() {
        let visibleCount = 0;
        posts.forEach((post, index) => {
            const matches = selectedTags.size === 0 ||
                post.tags.some(tag => selectedTags.has(tag.toLocaleLowerCase()));
            postsList.children[index].hidden = !matches;
            if (matches) visibleCount += 1;
        });

        showAllButton.setAttribute('aria-pressed', String(selectedTags.size === 0));
        tagOptions.querySelectorAll('[data-tag]').forEach(button => {
            button.setAttribute('aria-pressed', String(selectedTags.has(button.dataset.tag)));
        });
        filterStatus.textContent = `Showing ${visibleCount} of ${posts.length} posts`;
    }

    function renderPosts() {
        postsList.replaceChildren();
        posts.forEach(post => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.className = 'blog-post-link';
            link.href = `posts/${encodeURIComponent(post.filename)}`;

            const title = document.createElement('span');
            title.textContent = post.title;
            const date = document.createElement('span');
            date.className = 'music-list-span-right';
            date.textContent = post.date;
            link.append(title, date);
            item.append(link);

            if (post.tags.length > 0) {
                const tags = document.createElement('div');
                tags.className = 'blog-post-tags';
                post.tags.forEach(tag => {
                    const label = document.createElement('small');
                    label.textContent = tag;
                    tags.append(label);
                });
                item.append(tags);
            }

            postsList.append(item);
        });
    }

    fetch('posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Unable to load posts.json: ${response.status}`);
            }
            return response.json();
        })
        .then(async postData => {
            posts = await Promise.all(postData.map(async post => ({
                ...post,
                tags: await getPostTags(post.filename)
            })));
            renderPosts();
            renderTagFilters();
            filterPosts();
        })
        .catch(error => {
            console.error('Error loading blog posts or tags:', error);
            const errorMessage = document.createElement('li');
            errorMessage.textContent = 'Error loading posts';
            postsList.replaceChildren(errorMessage);
            filterStatus.textContent = 'Unable to load posts and tags.';
        });

    showAllButton.addEventListener('click', () => {
        selectedTags.clear();
        filterPosts();
    });

    tagOptions.addEventListener('click', event => {
        const button = event.target.closest('[data-tag]');
        if (!button) return;

        const tag = button.dataset.tag;
        if (selectedTags.has(tag)) {
            selectedTags.delete(tag);
        } else {
            selectedTags.add(tag);
        }
        filterPosts();
    });
});
