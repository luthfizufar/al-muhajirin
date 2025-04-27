document.addEventListener("DOMContentLoaded", () => {
  // YouTube channel ID for Al-Muhajirin
  const channelId = "UCZXjlm7JK5h3fFrOYFEYHYQ"
  const channelUsername = "almuhajirin-e3s"
  const maxResults = 6 // Number of videos to display

  // Elements
  const youtubeVideosGrid = document.getElementById("youtube-videos-grid")
  const youtubeLoading = document.getElementById("youtube-loading")

  // Initialize
  fetchYouTubeVideos()

  // Functions
  async function fetchYouTubeVideos() {
    try {
      // Show loading state
      youtubeLoading.style.display = "flex"

      // Use actual video data instead of placeholders
      const videos = getActualVideos()

      // Display videos after a short delay to simulate loading
      setTimeout(() => {
        displayYouTubeVideos(videos)
        youtubeLoading.style.display = "none"
      }, 800)
    } catch (error) {
      console.error("Error fetching YouTube videos:", error)
      showYouTubeError("Failed to load videos from our YouTube channel. Please try again later.")
    }
  }

  function displayYouTubeVideos(videos) {
    // Clear existing content
    youtubeVideosGrid.innerHTML = ""

    // Add videos to grid
    videos.forEach((video) => {
      const videoCard = document.createElement("div")
      videoCard.className = "youtube-video-card"

      const videoId = video.id
      const title = video.title
      const viewCount = formatViewCount(video.viewCount)
      const thumbnailUrl = video.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`

      videoCard.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="youtube-video-link">
          <div class="youtube-thumbnail">
            <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
            <div class="youtube-play-button"></div>
          </div>
          <div class="youtube-video-info">
            <h4 class="youtube-video-title">${title}</h4>
            <div class="youtube-video-meta">
              <span>${viewCount} views</span>
            </div>
          </div>
        </a>
      `

      youtubeVideosGrid.appendChild(videoCard)
    })

    // Add "View More" button
    const viewMoreContainer = document.createElement("div")
    viewMoreContainer.className = "youtube-view-more"
    viewMoreContainer.innerHTML = `
      <a href="https://www.youtube.com/@${channelUsername}" target="_blank" class="youtube-view-more-button">
        View More Videos
      </a>
    `

    youtubeVideosGrid.parentElement.appendChild(viewMoreContainer)
  }

  function showYouTubeError(message) {
    youtubeLoading.style.display = "none"

    const errorElement = document.createElement("div")
    errorElement.className = "youtube-error"
    errorElement.innerHTML = `
      <p>${message}</p>
      <button class="youtube-retry-button">Retry</button>
    `

    youtubeVideosGrid.innerHTML = ""
    youtubeVideosGrid.parentElement.insertBefore(errorElement, youtubeVideosGrid)

    const retryButton = errorElement.querySelector(".youtube-retry-button")
    retryButton.addEventListener("click", () => {
      errorElement.remove()
      fetchYouTubeVideos()
    })
  }

  function formatViewCount(views) {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + "M"
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + "K"
    } else {
      return views.toString()
    }
  }

  // Return actual videos with the provided YouTube links
  function getActualVideos() {
    return [
      {
        id: "aLp5SNHmiQ8",
        title: "Ust.Evie. Effendi ALMUHAJIRIN BUMI HARAPAN",
        viewCount: 7800,
        thumbnailUrl: "https://i.ytimg.com/vi/aLp5SNHmiQ8/mqdefault.jpg",
      },
      {
        id: "LlbDJzYLJ-M",
        title: "KH.Fiqih Noval Hamdzali",
        viewCount: 7500,
        thumbnailUrl: "https://i.ytimg.com/vi/LlbDJzYLJ-M/mqdefault.jpg",
      },
      {
        id: "ohyCJ54rDGQ",
        title: "CERAMAH DA'I KONDANG KH ZAINUDIN MZ - KISAH NABI SULAIMAN",
        viewCount: 2200,
        thumbnailUrl: "https://i.ytimg.com/vi/ohyCJ54rDGQ/mqdefault.jpg",
      },
      {
        id: "SuiVsOAoug4",
        title: "KH.Drs.Agus Abdullah,M.Ag",
        viewCount: 1900,
        thumbnailUrl: "https://i.ytimg.com/vi/SuiVsOAoug4/mqdefault.jpg",
      },
      {
        id: "eYy_fPD_QA8",
        title: "Pesantren ALJAWAMI Cileunyi Bandung",
        viewCount: 1100,
        thumbnailUrl: "https://i.ytimg.com/vi/eYy_fPD_QA8/mqdefault.jpg",
      },
      {
        id: "QCSxJqqEhr4",
        title: "CERAMAH DA'I KONDANG KH ZAINUDIN MZ AL MUGFURALAH || SURGA DAN CALON PENGHUNINYA",
        viewCount: 1000,
        thumbnailUrl: "https://i.ytimg.com/vi/QCSxJqqEhr4/mqdefault.jpg",
      },
    ]
  }
})
