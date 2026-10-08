document.addEventListener('DOMContentLoaded', function () {
    const tagList = document.getElementById('post-tags');
    const tags = document.querySelector('meta[name="tags"]')?.content || '';

    tags.split(',').map(tag => tag.trim()).filter(Boolean).forEach(tag => {
        const label = document.createElement('small');
        label.textContent = tag;
        tagList.append(label);
    });

    if (tagList.childElementCount === 0) {
        tagList.hidden = true;
    }
});
