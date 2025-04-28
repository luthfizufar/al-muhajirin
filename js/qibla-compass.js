document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const compassArrow = document.querySelector(".compass-arrow")
  const compassDegrees = document.querySelector(".compass-degrees")
  const qiblaContainer = document.querySelector(".qibla")

  // Initialize
  initQiblaCompass()

  // Functions
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

          // Calculate Qibla direction using API
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
  }

  function getCardinalDirection(degrees) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"]
    return directions[Math.round(degrees / 45) % 8]
  }
})
