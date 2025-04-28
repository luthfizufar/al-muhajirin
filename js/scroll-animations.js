document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const sections = document.querySelectorAll("section")
  const scrollRevealElements = document.querySelectorAll(".scroll-reveal")

  // Initialize
  initScrollObserver()
  initParallaxElements()

  // Functions
  function initScrollObserver() {
    // Create intersection observer for sections
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible")

            // Add staggered animation to children
            const children = entry.target.querySelectorAll(".scroll-reveal")
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add("revealed")
              }, 100 * index)
            })
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "-50px 0px",
      },
    )

    // Observe all sections
    sections.forEach((section) => {
      sectionObserver.observe(section)
      section.classList.add("section-animated")
    })

    // Create intersection observer for individual elements
    const elementObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "-20px 0px",
      },
    )

    // Observe all scroll reveal elements
    scrollRevealElements.forEach((element) => {
      elementObserver.observe(element)
    })
  }

  function initParallaxElements() {
    // Add parallax effect to specific elements
    const parallaxElements = document.querySelectorAll(".parallax-element")

    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY

      parallaxElements.forEach((element) => {
        const speed = element.dataset.speed || 0.5
        element.style.transform = `translateY(${scrollPosition * speed}px)`
      })
    })

    // Add floating animation to elements with .floating class
    const floatingElements = document.querySelectorAll(".floating")
    floatingElements.forEach((element, index) => {
      // Add random delay to each element
      const delay = Math.random() * 2
      element.style.animationDelay = `${delay}s`
    })
  }
})
