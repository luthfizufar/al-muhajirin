document.addEventListener("DOMContentLoaded", () => {
  // Initialize scroll reveal
  initScrollReveal()

  // Add ripple effect to buttons
  addRippleEffect()

  // Function to initialize scroll reveal
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(".scroll-reveal")

    const revealOnScroll = () => {
      const windowHeight = window.innerHeight

      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top
        const elementVisible = 150

        if (elementTop < windowHeight - elementVisible) {
          element.classList.add("revealed")
        }
      })
    }

    // Add event listener for scroll
    window.addEventListener("scroll", revealOnScroll)

    // Trigger once on load
    revealOnScroll()
  }

  // Function to add ripple effect to buttons
  function addRippleEffect() {
    const buttons = document.querySelectorAll(".ripple")

    buttons.forEach((button) => {
      button.addEventListener("click", function (e) {
        const x = e.clientX - this.getBoundingClientRect().left
        const y = e.clientY - this.getBoundingClientRect().top

        const ripple = document.createElement("span")
        ripple.style.left = `${x}px`
        ripple.style.top = `${y}px`

        this.appendChild(ripple)

        setTimeout(() => {
          ripple.remove()
        }, 600)
      })
    })
  }
})
