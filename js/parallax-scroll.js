document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const celestialElements = document.querySelectorAll(".sun-3d, .moon-3d, .star-3d, .planet")
  const mosque = document.querySelector(".mosque-3d")

  // Initialize
  initParallaxScroll()

  // Functions
  function initParallaxScroll() {
    // Add scroll event listener
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY

      // Apply parallax effect to celestial elements
      celestialElements.forEach((element, index) => {
        // Different movement speeds for different elements - increased for more noticeable effect
        let speed

        if (element.classList.contains("sun-3d")) {
          speed = 0.08
        } else if (element.classList.contains("moon-3d")) {
          speed = 0.12
        } else if (element.classList.contains("star-3d")) {
          // Different speeds for stars based on their index
          speed = 0.05 + (index % 5) * 0.02
        } else if (element.classList.contains("planet")) {
          // Different speeds for planets - increased for more movement
          speed = 0.1 + (index % 5) * 0.03
        }

        // Calculate movement based on scroll position
        const yOffset = scrollPosition * speed
        const xOffset = scrollPosition * speed * 0.8 // Increased horizontal movement

        // Apply transformation
        if (element.classList.contains("planet")) {
          // Planets move in different directions
          const direction = index % 2 === 0 ? 1 : -1
          element.style.transform = `translateY(${yOffset * direction}px) translateX(${xOffset * -direction}px)`
        } else if (element.classList.contains("moon-3d")) {
          // Enhanced moon movement
          element.style.transform = `translateY(${-yOffset}px) translateX(${xOffset * 0.5}px) rotate(${scrollPosition * 0.02}deg)`
        } else {
          element.style.transform = `translateY(${-yOffset}px) translateX(${xOffset * 0.3}px)`
        }
      })

      // Subtle movement for mosque
      if (mosque) {
        const mosqueSpeed = 0.03
        const mosqueOffset = scrollPosition * mosqueSpeed
        mosque.style.transform = `rotateX(10deg) translateY(${-mosqueOffset}px)`
      }
    })
  }
})
