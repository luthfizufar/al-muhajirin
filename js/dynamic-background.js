document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const sunBackground = document.querySelector(".sun-background")
  const moonBackground = document.querySelector(".moon-background")
  const sun = document.querySelector(".sun")
  const moon = document.querySelector(".moon")
  const stars = document.querySelectorAll(".star")
  const clouds = document.querySelectorAll(".cloud")

  // Initialize
  initParallaxEffect()
  animateTimeBasedBackground()

  // Functions
  function initParallaxEffect() {
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.body.scrollHeight
      const scrollPercentage = scrollPosition / (documentHeight - windowHeight)

      // Parallax effect for sun/moon
      if (sunBackground) {
        sunBackground.style.transform = `translateY(${scrollPosition * -0.15}px)`
      }

      if (moonBackground) {
        moonBackground.style.transform = `translateY(${scrollPosition * -0.1}px)`
      }

      // Rotate sun rays based on scroll
      const sunRays = document.querySelectorAll(".sun-ray")
      sunRays.forEach((ray, index) => {
        const baseRotation = index * 45 // 45 degrees apart
        const rotationAmount = baseRotation + scrollPosition * 0.05
        ray.style.transform = `rotate(${rotationAmount}deg)`
      })

      // Move stars slightly for parallax effect
      stars.forEach((star, index) => {
        const parallaxFactor = 0.05 + (index % 3) * 0.02
        star.style.transform = `translate(${scrollPosition * -parallaxFactor}px, ${scrollPosition * -parallaxFactor * 0.5}px)`
      })

      // Move clouds at different speeds
      clouds.forEach((cloud, index) => {
        const speed = 0.1 + index * 0.05
        const horizontalMove = Math.sin(scrollPosition * 0.001) * 50
        cloud.style.transform = `translateX(${-scrollPosition * speed + horizontalMove}px)`
      })
    })
  }

  function animateTimeBasedBackground() {
    // Get current hour to determine if it's day or night
    const currentHour = new Date().getHours()
    const isDayTime = currentHour >= 6 && currentHour < 18

    // Auto switch to dark mode at night if not manually toggled
    const darkModeToggle = document.getElementById("dark-mode-toggle")
    const hasUserToggledTheme = localStorage.getItem("userToggledTheme") === "true"

    if (!hasUserToggledTheme && !isDayTime) {
      darkModeToggle.checked = true
    }

    // Store user preference when manually toggled
    darkModeToggle.addEventListener("change", () => {
      localStorage.setItem("userToggledTheme", "true")
    })

    // Add pulsating glow to sun
    if (sun) {
      setInterval(() => {
        const randomSize = Math.random() * 10 + 70 // Random size between 70-80px
        const randomOpacity = 0.4 + Math.random() * 0.2 // Random opacity between 0.4-0.6

        sun.style.boxShadow = `0 0 ${randomSize}px ${randomSize / 2}px rgba(255, 193, 7, ${randomOpacity})`
      }, 2000)
    }

    // Add twinkling effect to stars
    if (stars.length) {
      stars.forEach((star, index) => {
        // Random initial delay for each star
        const delay = Math.random() * 5
        star.style.animationDelay = `${delay}s`

        // Random size for each star
        const size = 2 + Math.random() * 4
        star.style.width = `${size}px`
        star.style.height = `${size}px`
      })
    }
  }
})
