document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const currentDateElement = document.getElementById("current-date")
  const currentTimeElement = document.getElementById("current-time")
  const nextPrayerNameElement = document.getElementById("next-prayer-name")
  const nextPrayerTimeElement = document.getElementById("next-prayer-time")
  const timeRemainingElement = document.getElementById("time-remaining")

  // Prayer time elements
  const fajrTimeElement = document.getElementById("fajr-time")
  const sunriseTimeElement = document.getElementById("sunrise-time")
  const dhuhrTimeElement = document.getElementById("dhuhr-time")
  const asrTimeElement = document.getElementById("asr-time")
  const maghribTimeElement = document.getElementById("maghrib-time")
  const ishaTimeElement = document.getElementById("isha-time")

  // Contact section prayer times
  const contactFajrElement = document.getElementById("contact-fajr")
  const contactDhuhrElement = document.getElementById("contact-dhuhr")
  const contactAsrElement = document.getElementById("contact-asr")
  const contactMaghribElement = document.getElementById("contact-maghrib")
  const contactIshaElement = document.getElementById("contact-isha")

  // Qibla elements
  const compassArrow = document.querySelector(".compass-arrow")
  const compassDegrees = document.querySelector(".compass-degrees")
  const qiblaContainer = document.querySelector(".qibla")

  // Initialize
  updateDateTime()
  fetchPrayerTimes()
  initQiblaCompass()

  // Update date and time every second
  setInterval(updateDateTime, 1000)

  // Add animation to bento grid items
  animateBentoGrid()

  // Functions
  function updateDateTime() {
    const now = new Date()

    // Format date: Senin, 26 April 2025
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    }
    if (currentDateElement) {
      currentDateElement.textContent = now.toLocaleDateString("id-ID", options)
    }

    // Format time: 14:30:45
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }
    if (currentTimeElement) {
      currentTimeElement.textContent = now.toLocaleTimeString("id-ID", timeOptions)
    }

    // Update next prayer and time remaining if we have prayer times
    const prayerTimes = getPrayerTimesFromStorage()
    if (prayerTimes) {
      updateNextPrayer(now, prayerTimes)
    }
  }

  function updatePrayerTimes(times) {
    // Update prayer time elements
    if (fajrTimeElement) fajrTimeElement.textContent = times.fajr
    if (sunriseTimeElement) sunriseTimeElement.textContent = times.sunrise
    if (dhuhrTimeElement) dhuhrTimeElement.textContent = times.dhuhr
    if (asrTimeElement) asrTimeElement.textContent = times.asr
    if (maghribTimeElement) maghribTimeElement.textContent = times.maghrib
    if (ishaTimeElement) ishaTimeElement.textContent = times.isha

    // Update contact section prayer times
    contactFajrElement.textContent = times.fajr
    contactDhuhrElement.textContent = times.dhuhr
    contactAsrElement.textContent = times.asr
    contactMaghribElement.textContent = times.maghrib
    contactIshaElement.textContent = times.isha

    // Save to localStorage
    savePrayerTimesToStorage(times)
  }

  function updateNextPrayer(now, times) {
    // Convert current time to minutes since midnight
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTimeInMinutes = currentHours * 60 + currentMinutes

    // Convert prayer times to minutes since midnight
    const prayerTimesInMinutes = {
      fajr: convertTimeToMinutes(times.fajr),
      sunrise: convertTimeToMinutes(times.sunrise),
      dhuhr: convertTimeToMinutes(times.dhuhr),
      asr: convertTimeToMinutes(times.asr),
      maghrib: convertTimeToMinutes(times.maghrib),
      isha: convertTimeToMinutes(times.isha),
    }

    // Find next prayer
    let nextPrayer = ""
    let nextPrayerTime = 0
    let timeRemaining = 0

    if (currentTimeInMinutes < prayerTimesInMinutes.fajr) {
      nextPrayer = "Subuh"
      nextPrayerTime = prayerTimesInMinutes.fajr
    } else if (currentTimeInMinutes < prayerTimesInMinutes.sunrise) {
      nextPrayer = "Terbit"
      nextPrayerTime = prayerTimesInMinutes.sunrise
    } else if (currentTimeInMinutes < prayerTimesInMinutes.dhuhr) {
      nextPrayer = "Dzuhur"
      nextPrayerTime = prayerTimesInMinutes.dhuhr
    } else if (currentTimeInMinutes < prayerTimesInMinutes.asr) {
      nextPrayer = "Ashar"
      nextPrayerTime = prayerTimesInMinutes.asr
    } else if (currentTimeInMinutes < prayerTimesInMinutes.maghrib) {
      nextPrayer = "Maghrib"
      nextPrayerTime = prayerTimesInMinutes.maghrib
    } else if (currentTimeInMinutes < prayerTimesInMinutes.isha) {
      nextPrayer = "Isya"
      nextPrayerTime = prayerTimesInMinutes.isha
    } else {
      // After Isha, next prayer is Fajr tomorrow
      nextPrayer = "Subuh"
      nextPrayerTime = prayerTimesInMinutes.fajr + 24 * 60 // Add 24 hours
    }

    // Calculate time remaining
    timeRemaining = nextPrayerTime - currentTimeInMinutes

    // If next prayer is Fajr tomorrow
    if (nextPrayer === "Subuh" && timeRemaining > 24 * 60) {
      timeRemaining = timeRemaining - 24 * 60
    }

    // Update UI
    if (nextPrayerNameElement) nextPrayerNameElement.textContent = nextPrayer
    if (nextPrayerTimeElement) nextPrayerTimeElement.textContent = formatMinutesToTime(nextPrayerTime % (24 * 60))
    if (timeRemainingElement) timeRemainingElement.textContent = formatTimeRemaining(timeRemaining)

    // Highlight the next prayer in the bento grid
    highlightNextPrayer(nextPrayer.toLowerCase())
  }

  function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours * 60 + minutes
  }

  function formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
  }

  function formatTimeRemaining(minutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `dalam ${hours} jam ${mins} menit`
    } else {
      return `dalam ${mins} menit`
    }
  }

  function fetchPrayerTimes() {
    // Check if we have cached prayer times for today
    const cachedTimes = getPrayerTimesFromStorage()
    if (cachedTimes && isSameDay(new Date(cachedTimes.date), new Date())) {
      updatePrayerTimes(cachedTimes)
      return
    }

    // Fetch prayer times from API
    fetch("https://api.aladhan.com/v1/timingsByCity?city=Bandung&country=Indonesia&method=3")
      .then((response) => response.json())
      .then((data) => {
        const times = data.data.timings
        const prayerTimes = {
          fajr: formatTime(times.Fajr),
          sunrise: formatTime(times.Sunrise),
          dhuhr: formatTime(times.Dhuhr),
          asr: formatTime(times.Asr),
          maghrib: formatTime(times.Maghrib),
          isha: formatTime(times.Isha),
          date: new Date().toISOString(),
        }
        updatePrayerTimes(prayerTimes)
      })
      .catch((error) => {
        console.error("Error fetching prayer times:", error)

        // Use fallback times if API fails
        const fallbackTimes = {
          fajr: "04:35",
          sunrise: "06:02",
          dhuhr: "12:05",
          asr: "15:15",
          maghrib: "18:02",
          isha: "19:12",
          date: new Date().toISOString(),
        }
        updatePrayerTimes(fallbackTimes)
      })
  }

  function formatTime(timeString) {
    // Convert 24-hour format to HH:MM
    const [hours, minutes] = timeString.split(":")
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
  }

  function savePrayerTimesToStorage(times) {
    localStorage.setItem("prayerTimes", JSON.stringify(times))
  }

  function getPrayerTimesFromStorage() {
    const times = localStorage.getItem("prayerTimes")
    return times ? JSON.parse(times) : null
  }

  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  function highlightNextPrayer(prayerName) {
    // Remove highlight from all prayer items
    const prayerItems = document.querySelectorAll(".bento-item.prayer")
    prayerItems.forEach((item) => {
      item.classList.remove("active")
    })

    // Add highlight to the next prayer
    if (prayerItems.length > 0) {
      if (prayerName === "terbit") {
        prayerItems[1]?.classList.add("active")
      } else if (prayerName === "subuh") {
        prayerItems[0]?.classList.add("active")
      } else if (prayerName === "dzuhur") {
        prayerItems[2]?.classList.add("active")
      } else if (prayerName === "ashar") {
        prayerItems[3]?.classList.add("active")
      } else if (prayerName === "maghrib") {
        prayerItems[4]?.classList.add("active")
      } else if (prayerName === "isya") {
        prayerItems[5]?.classList.add("active")
      }
    }
  }

  function animateBentoGrid() {
    const bentoItems = document.querySelectorAll(".bento-item")

    // Add animation with staggered delay
    bentoItems.forEach((item, index) => {
      item.style.opacity = "0"
      item.style.transform = "translateY(20px)"
      item.style.transition = "opacity 0.5s ease, transform 0.5s ease"

      setTimeout(() => {
        item.style.opacity = "1"
        item.style.transform = "translateY(0)"
      }, 100 * index)
    })
  }

  // Qibla compass functions
  function initQiblaCompass() {
    // Add loading state
    if (qiblaContainer) {
      qiblaContainer.classList.add("loading")
    }

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          // Calculate Qibla direction or fetch from API
          fetchQiblaDirection(latitude, longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Use default location for Bandung, Indonesia
          fetchQiblaDirection(-6.9175, 107.6191)
        },
        { timeout: 10000 },
      )
    } else {
      console.error("Geolocation is not supported by this browser")
      // Use default location for Bandung, Indonesia
      fetchQiblaDirection(-6.9175, 107.6191)
    }
  }

  function fetchQiblaDirection(latitude, longitude) {
    // Use the Aladhan API to get Qibla direction
    fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 200 && data.data) {
          const qiblaDirection = data.data.direction
          updateCompass(qiblaDirection)
        } else {
          throw new Error("Failed to fetch Qibla direction")
        }
      })
      .catch((error) => {
        console.error("Error fetching Qibla direction:", error)
        // Use approximate Qibla direction for Bandung (about 295 degrees)
        updateCompass(295)
      })
      .finally(() => {
        if (qiblaContainer) {
          qiblaContainer.classList.remove("loading")
        }
      })
  }

  function updateCompass(direction) {
    // Update compass arrow rotation
    if (compassArrow) {
      compassArrow.style.transform = `rotate(${direction}deg)`

      // Set CSS variable for animation
      document.documentElement.style.setProperty("--qibla-direction", `${direction}deg`)
    }

    // Update degrees text
    if (compassDegrees) {
      // Format direction to 1 decimal place
      const formattedDirection = Math.round(direction * 10) / 10

      // Determine cardinal direction
      const cardinalDirection = getCardinalDirection(direction)

      compassDegrees.textContent = `${formattedDirection}° ${cardinalDirection}`
    }

    // Add animation to compass
    animateCompass()
  }

  function getCardinalDirection(degrees) {
    const directions = ["U", "TL", "T", "TG", "S", "BD", "B", "BL", "U"]
    return directions[Math.round(degrees / 45) % 8]
  }

  function animateCompass() {
    // Add pulse animation to compass
    const compassOuter = document.querySelector(".compass-outer")
    if (compassOuter) {
      compassOuter.classList.add("pulse")

      // Add floating animation to arrow
      if (compassArrow) {
        compassArrow.classList.add("floating-arrow")
      }
    }
  }
})
