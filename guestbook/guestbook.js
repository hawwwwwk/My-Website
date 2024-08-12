// on page load
document.addEventListener('DOMContentLoaded', function () {
    loadEntries();

    // handle form submission
    document.getElementById('guestbook-form').addEventListener('submit', function (event) {
        event.preventDefault(); // prevent submission via HTTP

        // get form data
        const formData = new FormData(event.target);
        const data = {
            screenname: formData.get('screenname'),
            website: formData.get('website'),
            message: formData.get('message')
        };

        // give data to the server 
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save your message.');
            }
            return response.text();
        })
        .then(() => {
            loadEntries();
            event.target.reset(); // clear form
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was a problem saving your entry. Please try again later.');
        });
    });
});

// loads and displays guestbook entries
function loadEntries() {
    fetch('/entries')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load guestbook entries.');
        }
        return response.json();
    })
    .then(entries => {
        const container = document.getElementById('guestbook-entries');
        container.innerHTML = ''; // clear old entries

        entries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('guestbook-entry');
            entryDiv.innerHTML = `
                <strong>${escapeHtml(entry.screenname)}</strong> `;
            if (entry.website?.includes('http')) {
                entryDiv.innerHTML = entryDiv.innerHTML + `<a href="${escapeHtml(entry.website)}" target="_blank">(${escapeHtml(entry.website)})</a> : `;
            } else if (entry.website) {
                entryDiv.innerHTML = entryDiv.innerHTML + `(${escapeHtml(entry.website)}) : `;
            } else {
                entryDiv.innerHTML = entryDiv.innerHTML + ` : `;
            }
            entryDiv.innerHTML = entryDiv.innerHTML + `${escapeHtml(entry.message)}<br>
            <small>Posted on ${new Date(entry.created_at).toDateString()}</small>
            <br><div class="menu-divider"></div>`;
            container.appendChild(entryDiv);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was a problem loading the guestbook entries. Please try again later.');
    });
}

// util to escape HTML and prevent XSS attacks :3
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
