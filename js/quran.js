document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const surahSelect = document.getElementById("surah-select")
  const reciterSelect = document.getElementById("reciter-select")
  const translationSelect = document.getElementById("translation-select")
  const currentSurahTitle = document.getElementById("current-surah-title")
  const surahInfo = document.getElementById("surah-info")
  const quranText = document.getElementById("quran-text")
  const quranAudio = document.getElementById("quran-audio")
  const surahLoading = document.getElementById("surah-loading")
  const fontSizeSelect = document.getElementById("font-size")
  const mushafModeCheckbox = document.getElementById("mushaf-mode")
  const bookmarkButton = document.getElementById("bookmark-button")
  const shareButtons = document.querySelectorAll(".share-button")

  // State
  let allSurahs = []
  let currentSurah = 1
  let currentReciter = 7 // Default to Mishari Rashid al-`Afasy
  let currentTranslation = "id" // Default to Indonesian
  let isAudioPlaying = false

  // Reciter audio base URLs
  const reciterBaseUrls = {
    1: "https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/", // Abdul Basit
    2: "https://everyayah.com/data/mahmoud_ali_al_banna_32kbps/", // Mahmoud Ali Al-Banna
    3: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_64kbps/", // Abdul Rahman Al-Sudais
    4: "https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_64kbps/", // Abu Bakr al-Shatri
    5: "https://everyayah.com/data/Hani_Rifai_64kbps/", // Hani ar-Rifai
    6: "https://everyayah.com/data/Husary_64kbps/", // Mahmoud Khalil Al-Husary
    7: "https://everyayah.com/data/Alafasy_64kbps/", // Mishari Rashid al-`Afasy
    8: "https://everyayah.com/data/Minshawy_Murattal_128kbps/", // Mohamed Siddiq al-Minshawi
    9: "https://everyayah.com/data/Mohammad_al_Tablaway_64kbps/", // Muhammad Ayyoub
    10: "https://everyayah.com/data/Muhammad_Jibreel_64kbps/", // Muhammad Jibreel
    11: "https://everyayah.com/data/Saood_ash-Shuraym_64kbps/", // Sa`ud ash-Shuraym
  }

  // Initialize
  initializeQuranSection()

  // Event listeners
  surahSelect.addEventListener("change", function () {
    currentSurah = Number.parseInt(this.value)
    loadSurah(currentSurah, currentReciter, currentTranslation)
    savePreference("currentSurah", currentSurah)
  })

  reciterSelect.addEventListener("change", function () {
    currentReciter = Number.parseInt(this.value)
    loadAudio(currentSurah, currentReciter)
    savePreference("currentReciter", currentReciter)
  })

  translationSelect.addEventListener("change", function () {
    currentTranslation = this.value
    loadTranslation(currentSurah, currentTranslation)
    savePreference("currentTranslation", currentTranslation)
  })

  fontSizeSelect.addEventListener("change", function () {
    const size = this.value
    quranText.classList.remove("font-size-small", "font-size-medium", "font-size-large")
    quranText.classList.add(`font-size-${size}`)
    savePreference("fontSize", size)
  })

  mushafModeCheckbox.addEventListener("change", function () {
    quranText.classList.toggle("mushaf-mode", this.checked)
    savePreference("mushafMode", this.checked)
  })

  bookmarkButton.addEventListener("click", () => {
    bookmarkCurrentVerse()
  })

  shareButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const platform = this.dataset.platform
      shareVerse(platform)
    })
  })

  // Add event listener for audio playback
  quranAudio.addEventListener("play", () => {
    isAudioPlaying = true
    highlightCurrentVerse()
  })

  quranAudio.addEventListener("pause", () => {
    isAudioPlaying = false
    removeVerseHighlights()
  })

  quranAudio.addEventListener("ended", () => {
    isAudioPlaying = false
    removeVerseHighlights()
  })

  quranAudio.addEventListener("timeupdate", () => {
    if (isAudioPlaying) {
      highlightCurrentVerse()
    }
  })

  // Functions
  async function initializeQuranSection() {
    // Load preferences
    loadPreferences()

    // Set initial UI state
    quranText.classList.add(`font-size-${fontSizeSelect.value}`)
    if (mushafModeCheckbox.checked) {
      quranText.classList.add("mushaf-mode")
    }

    // Fetch all surahs
    await fetchAllSurahs()

    // Load current surah
    loadSurah(currentSurah, currentReciter, currentTranslation)
  }

  async function fetchAllSurahs() {
    try {
      surahLoading.classList.add("active")

      // Fetch from Equran.id API
      const response = await fetch("https://equran.id/api/v2/surat")
      const data = await response.json()

      if (data.code === 200 && data.data) {
        allSurahs = data.data
        populateSurahDropdown(allSurahs)
      } else {
        throw new Error("Failed to fetch surahs")
      }
    } catch (error) {
      console.error("Error fetching surahs:", error)
      showError("Failed to load Quran data. Please try again later.")
    } finally {
      surahLoading.classList.remove("active")
    }
  }

  function populateSurahDropdown(surahs) {
    // Clear existing options
    surahSelect.innerHTML = ""

    // Add all surahs to dropdown
    surahs.forEach((surah) => {
      const option = document.createElement("option")
      option.value = surah.nomor
      option.textContent = `${surah.nomor}. ${surah.namaLatin} (${surah.arti})`
      surahSelect.appendChild(option)
    })

    // Set selected surah
    surahSelect.value = currentSurah
  }

  async function loadSurah(surahNumber, reciterId, translationLang) {
    // Update UI while loading
    currentSurahTitle.textContent = "Loading..."
    surahInfo.textContent = ""
    quranText.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading Quran text...</p>
      </div>
    `

    try {
      // Fetch surah data from Equran.id API
      const response = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`)
      const data = await response.json()

      if (data.code === 200 && data.data) {
        const surahData = data.data

        // Update UI with surah data
        currentSurahTitle.textContent = `Surah ${surahData.namaLatin}`
        surahInfo.textContent = `${surahData.arti} • ${surahData.jumlahAyat} Verses`

        // Clear existing content
        quranText.innerHTML = ""

        // Add verses
        surahData.ayat.forEach((ayat) => {
          const verseElement = document.createElement("div")
          verseElement.className = "verse"
          verseElement.dataset.verseNumber = ayat.nomorAyat

          const verseNumberElement = document.createElement("div")
          verseNumberElement.className = "verse-number"
          verseNumberElement.textContent = ayat.nomorAyat

          const arabicElement = document.createElement("div")
          arabicElement.className = "arabic"
          arabicElement.textContent = ayat.teksArab

          const translationElement = document.createElement("div")
          translationElement.className = "translation"

          // Use the appropriate translation based on language
          if (translationLang === "id") {
            translationElement.textContent = ayat.teksIndonesia
          } else {
            // For other languages, we would fetch from a different API endpoint
            // For now, we'll use the Indonesian translation as a fallback
            translationElement.textContent = ayat.teksIndonesia
          }

          verseElement.appendChild(verseNumberElement)
          verseElement.appendChild(arabicElement)
          verseElement.appendChild(translationElement)

          // Add click event to play from this verse
          verseElement.addEventListener("click", () => {
            // In a real implementation, we would seek to the specific verse
            // For now, we'll just play the audio from the beginning
            quranAudio.play()
          })

          quranText.appendChild(verseElement)
        })

        // Load audio
        loadAudio(surahNumber, reciterId)
      } else {
        throw new Error("Failed to fetch surah data")
      }
    } catch (error) {
      console.error("Error loading surah:", error)
      showError("Failed to load surah data. Please try again later.")
    }
  }

  function loadAudio(surahNumber, reciterId) {
    // Format surah number with leading zeros for audio file naming
    const formattedSurahNumber = surahNumber.toString().padStart(3, "0")

    // Get the base URL for the selected reciter
    const baseUrl = reciterBaseUrls[reciterId] || reciterBaseUrls[7] // Default to Mishari if not found

    // Construct the audio URL
    const audioUrl = `${baseUrl}${formattedSurahNumber}.mp3`

    console.log(`Loading audio from: ${audioUrl}`)

    // Set the audio source
    quranAudio.src = audioUrl
    quranAudio.load()

    // Add event listener for audio errors
    quranAudio.onerror = () => {
      console.error("Error loading audio file:", audioUrl)
      showAudioError("Failed to load audio. Please try another reciter or surah.")
    }
  }

  function showAudioError(message) {
    // Create an error message element
    const errorElement = document.createElement("div")
    errorElement.className = "audio-error"
    errorElement.textContent = message

    // Insert it after the audio element
    const audioPlayer = document.querySelector(".audio-player")
    audioPlayer.appendChild(errorElement)

    // Remove the error message after 5 seconds
    setTimeout(() => {
      errorElement.remove()
    }, 5000)
  }

  async function loadTranslation(surahNumber, translationLang) {
    try {
      // In a real implementation, we would fetch translations for different languages
      // For now, we'll just reload the surah to get the Indonesian translation
      if (translationLang !== "id") {
        console.log(`Translation for ${translationLang} is not available. Using Indonesian instead.`)
      }

      // Reload the surah to update translations
      await loadSurah(surahNumber, currentReciter, translationLang)
    } catch (error) {
      console.error("Error loading translation:", error)
      showError("Failed to load translation. Please try again later.")
    }
  }

  function highlightCurrentVerse() {
    // In a real implementation, we would calculate which verse is currently being recited
    // based on the audio timestamp and verse timing data
    // For now, we'll just highlight a random verse for demonstration

    removeVerseHighlights()

    const verses = quranText.querySelectorAll(".verse")
    if (verses.length > 0) {
      const randomIndex = Math.floor(Math.random() * verses.length)
      verses[randomIndex].classList.add("verse-highlighted")

      // Scroll to the highlighted verse
      verses[randomIndex].scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  function removeVerseHighlights() {
    const highlightedVerses = quranText.querySelectorAll(".verse-highlighted")
    highlightedVerses.forEach((verse) => {
      verse.classList.remove("verse-highlighted")
    })
  }

  function bookmarkCurrentVerse() {
    // Get the first visible verse in the viewport
    const verses = quranText.querySelectorAll(".verse")
    let currentVerse = null

    for (const verse of verses) {
      const rect = verse.getBoundingClientRect()
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        currentVerse = verse
        break
      }
    }

    if (currentVerse) {
      const verseNumber = currentVerse.dataset.verseNumber
      const bookmark = {
        surah: currentSurah,
        verse: verseNumber,
        timestamp: new Date().toISOString(),
      }

      // Save bookmark to localStorage
      const bookmarks = JSON.parse(localStorage.getItem("quranBookmarks") || "[]")
      bookmarks.push(bookmark)
      localStorage.setItem("quranBookmarks", JSON.stringify(bookmarks))

      // Show confirmation
      alert(`Bookmarked Surah ${currentSurah}, Verse ${verseNumber}`)
    } else {
      alert("No verse currently in view to bookmark")
    }
  }

  function shareVerse(platform) {
    // Get the first visible verse in the viewport
    const verses = quranText.querySelectorAll(".verse")
    let currentVerse = null

    for (const verse of verses) {
      const rect = verse.getBoundingClientRect()
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        currentVerse = verse
        break
      }
    }

    if (currentVerse) {
      const verseNumber = currentVerse.dataset.verseNumber
      const arabicText = currentVerse.querySelector(".arabic").textContent
      const translationText = currentVerse.querySelector(".translation").textContent

      // Get current surah name
      const surahName = currentSurahTitle.textContent.replace("Surah ", "")

      // Create share text
      const shareText = `${arabicText}\n\n${translationText}\n\n- Quran, ${surahName} (${currentSurah}:${verseNumber})`

      // Share based on platform
      switch (platform) {
        case "whatsapp":
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")
          break
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`,
            "_blank",
          )
          break
        case "twitter":
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank")
          break
        default:
          // Copy to clipboard
          navigator.clipboard
            .writeText(shareText)
            .then(() => alert("Verse copied to clipboard!"))
            .catch((err) => console.error("Could not copy text: ", err))
      }
    } else {
      alert("No verse currently in view to share")
    }
  }

  function showError(message) {
    quranText.innerHTML = `
      <div class="error-state">
        <p>${message}</p>
        <button class="retry-button">Retry</button>
      </div>
    `

    const retryButton = quranText.querySelector(".retry-button")
    if (retryButton) {
      retryButton.addEventListener("click", () => {
        loadSurah(currentSurah, currentReciter, currentTranslation)
      })
    }
  }

  function savePreference(key, value) {
    const preferences = JSON.parse(localStorage.getItem("quranPreferences") || "{}")
    preferences[key] = value
    localStorage.setItem("quranPreferences", JSON.stringify(preferences))
  }

  function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem("quranPreferences") || "{}")

    // Set current surah
    if (preferences.currentSurah) {
      currentSurah = Number.parseInt(preferences.currentSurah)
    }

    // Set current reciter
    if (preferences.currentReciter) {
      currentReciter = Number.parseInt(preferences.currentReciter)
      reciterSelect.value = currentReciter
    }

    // Set current translation
    if (preferences.currentTranslation) {
      currentTranslation = preferences.currentTranslation
      translationSelect.value = currentTranslation
    }

    // Set font size
    if (preferences.fontSize) {
      fontSizeSelect.value = preferences.fontSize
    }

    // Set mushaf mode
    if (preferences.mushafMode !== undefined) {
      mushafModeCheckbox.checked = preferences.mushafMode
    }
  }
})
