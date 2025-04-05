const searchForm = document.querySelector('form');
const documentaryContainer = document.querySelector('.documentary-container');
const inputBox = document.querySelector('.inputBox');
const youtubeResults = document.getElementById("youtube-results");


const YOUTUBE_API_KEY = CONFIG.YOUTUBE_API_KEY;
const OMDBAPIKEY = CONFIG.OMDBAPIKEY;
// Fetch data from OMDb API
const getDocumentaryInfo = async (documentaryName) => {
  try {
    let OMDBAPIKEY; // OMDb API key
    const url = `https://www.omdbapi.com/?apikey=${OMDBAPIKEY}&t=${encodeURIComponent(documentaryName)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data from OMDb");

    const data = await response.json();
    if (data.Response === "False") {
      showErrorMessage("No Movie Found!");
      return;
    }

    showDocumentaryData(data);
    getYouTubeVideos(`${documentaryName} documentary trailer`);
  } catch (error) {
    showErrorMessage("An error occurred while fetching data.");
  }
};

// Display data from OMDb
const showDocumentaryData = (data) => {
  documentaryContainer.innerHTML = "";
  documentaryContainer.classList.remove("noBackground");

  const { Title, imdbRating, Genre, Released, Runtime, Actors, Plot, Poster } = data;

  const docInfo = document.createElement('div');
  docInfo.classList.add('documentary-info');

  const genresHTML = Genre.split(',').map(g =>
    `<p>${g.trim()}</p>`
  ).join('');

  docInfo.innerHTML = `
    <h2>${Title}</h2>
    <p><strong>Rating: &#11088;</strong> ${imdbRating}</p>
    <div class="documentary-genre">${genresHTML}</div>
    <p><strong>Released Date:</strong> ${Released}</p>
    <p><strong>Duration:</strong> ${Runtime}</p>
    <p><strong>Cast:</strong> ${Actors}</p>
    <p><strong>Plot:</strong> ${Plot}</p>
  `;

  const docPoster = document.createElement('div');
  docPoster.classList.add('documentary-poster');
  docPoster.innerHTML = `<img src="${Poster}" alt="${Title} Poster" />`;

  documentaryContainer.appendChild(docPoster);
  documentaryContainer.appendChild(docInfo);
};

// Fetch related YouTube videos
const getYouTubeVideos = async (searchQuery) => {
  const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(searchQuery)}&part=snippet&type=video&maxResults=3`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      youtubeResults.innerHTML = "<p style='color: white;'>No related videos found.</p>";
      return;
    }

    displayYouTubeVideos(data.items);
  } catch (err) {
    youtubeResults.innerHTML = "<p style='color: white;'>Error fetching YouTube videos.</p>";
  }
};

// Display YouTube videos
const displayYouTubeVideos = (videos) => {
  youtubeResults.innerHTML = `
    <h2>Related Videos</h2>
    <div class="video-grid">
      ${videos.map(video => `
        <div class="video-card">
          <iframe src="https://www.youtube.com/embed/${video.id.videoId}" frameborder="0" allowfullscreen></iframe>
          <h3>${video.snippet.title}</h3>
        </div>
      `).join('')}
    </div>
  `;
};

// Handle empty input or errors
const showErrorMessage = (message) => {
  documentaryContainer.innerHTML = `<h2>${message}</h2>`;
  documentaryContainer.classList.add("noBackground");
  youtubeResults.innerHTML = "";
};

// Submit form event
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = inputBox.value.trim();

  if (query !== '') {
    getDocumentaryInfo(query);
  } else {
    showErrorMessage("Please enter a documentary name to search.");
  }
});
