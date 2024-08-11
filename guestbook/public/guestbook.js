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
        fetch('http://localhost:3000/submit', {
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
    fetch('http://localhost:3000/entries')
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
                <strong>${escapeHtml(entry.screenname)}</strong> 
                (${escapeHtml(entry.website) || 'No Website'})<br>
                ${escapeHtml(entry.message)}<br>
                <small>Posted on ${new Date(entry.created_at).toLocaleString()}</small>
                <hr>`;
            container.appendChild(entryDiv);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was a problem loading the guestbook entries. Please try again later.');
    });
}

// ulti to escape HTML and prevent XSS attacks :3
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
