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
        fetch('/submit/', {
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
    fetch('/entries/')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load guestbook entries.');
        }
        return response.json();
    })
    .then(entries => {
        const container = document.getElementById('guestbook-entries');
        container.replaceChildren();

        entries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('guestbook-entry');
            const screenname = document.createElement('strong');
            screenname.classList.add('screenname');
            screenname.textContent = entry.screenname;
            entryDiv.append(screenname, document.createTextNode(' '));

            if (entry.website) {
                const websiteText = `(${entry.website})`;
                if (/^https?:\/\//i.test(entry.website)) {
                    const websiteLink = document.createElement('a');
                    websiteLink.href = entry.website;
                    websiteLink.target = '_blank';
                    websiteLink.rel = 'noopener noreferrer';
                    websiteLink.textContent = websiteText;
                    entryDiv.append(websiteLink);
                } else {
                    entryDiv.append(document.createTextNode(websiteText));
                }
            }

            entryDiv.append(document.createTextNode(' : '));
            entryDiv.append(document.createTextNode(entry.message));
            entryDiv.append(document.createElement('br'));

            const postedDate = document.createElement('small');
            postedDate.textContent = `Posted on ${new Date(entry.created_at).toDateString()}`;
            entryDiv.append(postedDate, document.createElement('br'));

            const divider = document.createElement('div');
            divider.classList.add('menu-divider');
            entryDiv.append(divider);
            container.appendChild(entryDiv);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was a problem loading the guestbook entries. Please try again later.');
    });
}

