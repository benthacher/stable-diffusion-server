const socket = io();

const galleryContainer = document.querySelector('.gallery-container');

function clearImages() {
    galleryContainer.innerHTML = '';
}

function addImage(src) {
    const responsive = document.createElement('div');
    const galleryItem = document.createElement('div');
    const link = document.createElement('a');
    const img = document.createElement('img');
    const desc = document.createElement('div');
    
    responsive.classList.add('responsive');
    galleryItem.classList.add('gallery');
    link.target = '_blank';
    link.href = src;
    img.src = src;
    desc.classList.add('desc');
    desc.innerHTML = src.slice(src.lastIndexOf('\\') + 1);

    link.append(img);
    galleryItem.append(link, desc);
    responsive.append(galleryItem);
    galleryContainer.append(responsive);
}

socket.emit('get-image-paths');

socket.on('image-paths', paths => {
    for (const path of paths) {
        addImage(path);
    }
});