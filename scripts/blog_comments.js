document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('blog-comment-form');
    if (!form) return;

    const status = document.querySelector('.blog-comments-status');
    const list = document.querySelector('.blog-comments-list');
    list.classList.add('guestbook-entries');
    const postSlug = decodeURIComponent(window.location.pathname.split('/').pop()).replace(/\.html$/i, '');

    function showStatus(message) {
        status.textContent = message;
    }

    async function loadComments() {
        const response = await fetch(`/comments/${encodeURIComponent(postSlug)}`);
        if (!response.ok) throw new Error('Could not load comments.');

        const comments = await response.json();
        list.replaceChildren();
        if (comments.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'guestbook-entry';
            empty.textContent = 'No comments yet. Be the first to leave one!';
            list.appendChild(empty);
            return;
        }

        comments.forEach(comment => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('guestbook-entry');

            const heading = document.createElement('strong');
            heading.className = 'screenname';
            heading.textContent = comment.screenname;

            const date = document.createElement('small');
            date.textContent = `Posted on ${new Date(comment.created_at).toDateString()}`;

            entryDiv.append(heading, document.createTextNode(` : ${comment.message}`));
            entryDiv.append(document.createElement('br'), date, document.createElement('br'));

            const divider = document.createElement('div');
            divider.className = 'menu-divider';
            entryDiv.appendChild(divider);
            list.appendChild(entryDiv);
        });
    }

    loadComments().catch(error => {
        console.error(error);
        showStatus('Comments could not be loaded right now.');
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        submitButton.disabled = true;
        showStatus('Posting comment...');

        try {
            const response = await fetch('/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postSlug,
                    screenname: formData.get('screenname'),
                    message: formData.get('message')
                })
            });
            if (!response.ok) {
                const detail = await response.text();
                throw new Error(detail || 'Could not post comment.');
            }

            form.reset();
            showStatus('Your comment has been posted.');
            try {
                await loadComments();
            } catch (error) {
                console.error(error);
                showStatus('Your comment was posted, but the comments could not be refreshed.');
            }
        } catch (error) {
            console.error(error);
            showStatus('Your comment could not be posted. Please try again later.');
        } finally {
            submitButton.disabled = false;
        }
    });
});
