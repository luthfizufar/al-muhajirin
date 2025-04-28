document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const quranContainer = document.querySelector(".quran-container")
  const surahSelect = document.getElementById("surah-select")
  const reciterSelect = document.getElementById("reciter-select")
  const translationSelect = document.getElementById("translation-select")
  const quranText = document.getElementById("quran-text")
  const currentSurahTitle = document.getElementById("current-surah-title")
  const surahInfo = document.getElementById("surah-info")

  // State
  let isLoading = false
  let currentSurah = 1
  let currentReciter = 7 // Default to Mishari Rashid al-`Afasy
  let currentTranslation = "id" // Default to Indonesian

  // Initialize
  initQuranSection()
  addVerseHighlightEffect()

  // Functions
  function initQuranSection() {
    // Add loading animation to Quran container
    quranContainer.classList.add("loading")

    // Load preferences from localStorage
    loadPreferences()

    // Add event listeners
    surahSelect.addEventListener("change", handleSurahChange)
    reciterSelect.addEventListener("change", handleReciterChange)
    translationSelect.addEventListener("change", handleTranslationChange)

    // Fetch surahs with retry mechanism
    fetchSurahsWithRetry()
  }

  function fetchSurahsWithRetry(retryCount = 0) {
    const maxRetries = 3

    fetch("https://equran.id/api/v2/surat")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.code === 200 && data.data) {
          populateSurahDropdown(data.data)
          loadSurah(currentSurah, currentReciter, currentTranslation)
          quranContainer.classList.remove("loading")
        } else {
          throw new Error("Invalid API response format")
        }
      })
      .catch((error) => {
        console.error("Error fetching surahs:", error)

        if (retryCount < maxRetries) {
          // Show retry message
          showRetryMessage(retryCount, maxRetries)

          // Retry after delay
          setTimeout(() => {
            fetchSurahsWithRetry(retryCount + 1)
          }, 2000)
        } else {
          // Show error after max retries
          showError(
            "Failed to load Quran data after multiple attempts. Please check your connection and try again later.",
          )
          quranContainer.classList.remove("loading")
        }
      })
  }

  function showRetryMessage(retryCount, maxRetries) {
    quranText.innerHTML = `
      <div class="retry-message">
        <p>Connection issue. Retrying... (${retryCount + 1}/${maxRetries})</p>
        <div class="spinner"></div>
      </div>
    `
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

  function handleSurahChange() {
    currentSurah = Number.parseInt(this.value)

    // Add loading animation
    quranContainer.classList.add("loading")

    // Load surah with smooth transition
    setTimeout(() => {
      loadSurah(currentSurah, currentReciter, currentTranslation)
    }, 300)

    // Save preference
    savePreference("currentSurah", currentSurah)
  }

  function handleReciterChange() {
    currentReciter = Number.parseInt(this.value)

    // Update audio source with visual feedback
    const audioPlayer = document.querySelector(".audio-player")
    if (audioPlayer) {
      audioPlayer.classList.add("updating")

      setTimeout(() => {
        loadAudio(currentSurah, currentReciter)
        audioPlayer.classList.remove("updating")
      }, 500)
    }

    // Save preference
    savePreference("currentReciter", currentReciter)
  }

  function handleTranslationChange() {
    currentTranslation = this.value

    // Add loading animation to translation only
    const translations = document.querySelectorAll(".translation")
    translations.forEach((translation) => {
      translation.classList.add("updating")
    })

    // Update translations with delay for visual feedback
    setTimeout(() => {
      loadTranslation(currentSurah, currentTranslation)
    }, 300)

    // Save preference
    savePreference("currentTranslation", currentTranslation)
  }

  function loadSurah(surahNumber, reciterId, translationLang) {
    if (isLoading) return

    isLoading = true

    // Update UI while loading
    currentSurahTitle.innerHTML = '<div class="shimmer" style="width: 200px; height: 30px;"></div>'
    surahInfo.innerHTML = '<div class="shimmer" style="width: 300px; height: 20px;"></div>'
    quranText.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading Surah ${surahNumber}...</p>
      </div>
    `

    // Fetch surah data
    fetch(`https://equran.id/api/v2/surat/${surahNumber}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.code === 200 && data.data) {
          renderSurah(data.data, translationLang)
          loadAudio(surahNumber, reciterId)
        } else {
          throw new Error("Invalid API response format")
        }
      })
      .catch((error) => {
        console.error("Error loading surah:", error)
        showError(`Failed to load Surah ${surahNumber}. Please try again later.`)
      })
      .finally(() => {
        isLoading = false
        quranContainer.classList.remove("loading")
      })
  }

  function renderSurah(surahData, translationLang) {
    // Update UI with surah data
    currentSurahTitle.textContent = `Surah ${surahData.namaLatin}`
    surahInfo.textContent = `${surahData.arti} • ${surahData.jumlahAyat} Verses`

    // Clear existing content
    quranText.innerHTML = ""

    // Add bismillah except for Surah At-Taubah (9)
    if (surahData.nomor !== 9) {
      const bismillahElement = document.createElement("div")
      bismillahElement.className = "bismillah"
      bismillahElement.textContent = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
      quranText.appendChild(bismillahElement)
    }

    // Add verses with staggered animation
    surahData.ayat.forEach((ayat, index) => {
      const verseElement = document.createElement("div")
      verseElement.className = "verse"
      verseElement.dataset.verseNumber = ayat.nomorAyat
      verseElement.style.animationDelay = `${index * 0.05}s`

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

      quranText.appendChild(verseElement)
    })
  }

  function loadAudio(surahNumber, reciterId) {
    // Format surah number with leading zeros for audio file naming
    const formattedSurahNumber = surahNumber.toString().padStart(3, "0")

    // Get the base URL for the selected reciter
    const reciterBaseUrls = {
      1: "https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/",
      2: "https://everyayah.com/data/mahmoud_ali_al_banna_32kbps/",
      3: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_64kbps/",
      4: "https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_64kbps/",
      5: "https://everyayah.com/data/Hani_Rifai_64kbps/",
      6: "https://everyayah.com/data/Husary_64kbps/",
      7: "https://everyayah.com/data/Alafasy_64kbps/",
      8: "https://everyayah.com/data/Minshawy_Murattal_128kbps/",
      9: "https://everyayah.com/data/Mohammad_al_Tablaway_64kbps/",
      10: "https://everyayah.com/data/Muhammad_Jibreel_64kbps/",
      11: "https://everyayah.com/data/Saood_ash-Shuraym_64kbps/",
    }

    const baseUrl = reciterBaseUrls[reciterId] || reciterBaseUrls[7]

    // Construct the audio URL
    const audioUrl = `${baseUrl}${formattedSurahNumber}.mp3`

    // Set the audio source
    const quranAudio = document.getElementById("quran-audio")
    if (quranAudio) {
      quranAudio.src = audioUrl
      quranAudio.load()
    }
  }

  function loadTranslation(surahNumber, translationLang) {
    // In a real implementation, we would fetch translations for different languages
    // For now, we'll just reload the surah to get the Indonesian translation
    loadSurah(surahNumber, currentReciter, translationLang)
  }

  function addVerseHighlightEffect() {
    // Add hover and click effects to verses
    document.addEventListener("click", (e) => {
      const verse = e.target.closest(".verse")
      if (verse) {
        // Remove highlight from all verses
        document.querySelectorAll(".verse-highlighted").forEach((v) => {
          v.classList.remove("verse-highlighted")
        })

        // Add highlight to clicked verse
        verse.classList.add("verse-highlighted")

        // Smooth scroll to verse
        verse.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    })
  }

  function showError(message) {
    quranText.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <p>${message}</p>
        <button class="retry-button ripple">Retry</button>
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
  }
})
