import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

// Function to create preview elements
function createPreviewElement(book) {
    const { author, id, image, title } = book;
    const element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', id);
    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element;
}

// Function to set theme
function setTheme(theme) {
    console.log('Setting theme:', theme);
    console.log('Theme element:', document.querySelector('[data-settings-theme]'));
    const colorDark = theme === 'night' ? '255, 255, 255' : '10, 10, 20';
    const colorLight = theme === 'night' ? '10, 10, 20' : '255, 255, 255';
    document.documentElement.style.setProperty('--color-dark', colorDark);
    document.documentElement.style.setProperty('--color-light', colorLight);
}

// Function to handle form submission
function handleFormSubmission(formSelector, dataSelector, callback) {
    document.querySelector(formSelector).addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        callback(filters);
        document.querySelector(dataSelector).open = false;
    });
}

// Function to update the list based on filters
function updateList(filters) {
    const result = books.filter(book => {
        let genreMatch = filters.genre === 'any';
        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true; }
        }
        return (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        );
    });
    page = 1;
    matches = result;
    updateListDisplay();
}

// Function to update list display
function updateListDisplay() {
    const listItems = document.querySelector('[data-list-items]');
    listItems.innerHTML = '';
    const newItems = document.createDocumentFragment();
    const itemsToShow = matches.slice(0, BOOKS_PER_PAGE * page);
    for (const book of itemsToShow) {
        const element = createPreviewElement(book);
        newItems.appendChild(element);
    }
    listItems.appendChild(newItems);
    const remaining = Math.max(0, matches.length - BOOKS_PER_PAGE * page);
    const buttonText = remaining > 0 ? `Show more (${remaining})` : 'No more books';
    document.querySelector('[data-list-button]').innerHTML = `<span>Show more</span><span class="list__remaining">${buttonText}</span>`;
    document.querySelector('[data-list-button]').disabled = remaining === 0;
}

// Function to handle clicking "Show more" button
function handleShowMoreClick() {
    page++;
    updateListDisplay();
}

// Event listener setup
function setupEventListeners() {
    // Search form submission
    handleFormSubmission('[data-search-form]', '[data-search-overlay]', updateList);
    // Settings form submission
    handleFormSubmission('[data-settings-form]', '[data-settings-overlay]', setTheme);
    // Cancel buttons
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false;
    });
    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false;
    });
    // Header buttons
    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    });
    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;
    });
    // List close button
    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false;
    });
    // Show more button
    document.querySelector('[data-list-button]').addEventListener('click', handleShowMoreClick);
    // Preview items click
    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const target = event.target.closest('.preview');
        if (!target) return;
        const activeBook = books.find(book => book.id === target.dataset.preview);
        if (activeBook) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = activeBook.image;
            document.querySelector('[data-list-image]').src = activeBook.image;
            document.querySelector('[data-list-title]').innerText = activeBook.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = activeBook.description;
        }
    });
}

// Initial setup
function init() {
    // Create initial list
    const listItems = document.querySelector('[data-list-items]');
    const newItems = document.createDocumentFragment();
    for (const book of matches.slice(0, BOOKS_PER_PAGE)) {
        const element = createPreviewElement(book);
        newItems.appendChild(element);
    }
    listItems.appendChild(newItems);
    // Populate genre dropdown
    const genreDropdown = document.querySelector('[data-search-genres]');
    const genreOptions = Object.entries(genres).map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
    genreDropdown.innerHTML = `<option value="any">All Genres</option>${genreOptions}`;
    // Populate author dropdown
    const authorDropdown = document.querySelector('[data-search-authors]');
    const authorOptions = Object.entries(authors).map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
    authorDropdown.innerHTML = `<option value="any">All Authors</option>${authorOptions}`;
    // Set theme
    const preferredTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    setTheme(preferredTheme);
    // Set initial list button text and disabled state
    updateListDisplay();
    // Setup event listeners
    setupEventListeners();
}

// Initialize the application
init();
