document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const notificationToggle = document.getElementById("notification-toggle")
  const notificationStatus = document.getElementById("notification-status")

  // Initialize
  initNotifications()

  // Functions
  function initNotifications() {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      notificationStatus.textContent = "Notifications not supported in this browser"
      notificationToggle.disabled = true
      return
    }

    // Check if user has already granted permission
    if (Notification.permission === "granted") {
      notificationToggle.checked = localStorage.getItem("prayerNotifications") === "enabled"
      updateNotificationStatus()
    } else if (Notification.permission === "denied") {
      notificationStatus.textContent = "Notification permission denied"
      notificationToggle.disabled = true
    }

    // Add event listener for toggle
    notificationToggle.addEventListener("change", toggleNotifications)
  }

  function toggleNotifications() {
    if (notificationToggle.checked) {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          enableNotifications()
        } else {
          notificationToggle.checked = false
          notificationStatus.textContent = "Permission denied"
        }
      })
    } else {
      disableNotifications()
    }
  }

  function enableNotifications() {
    localStorage.setItem("prayerNotifications", "enabled")
    updateNotificationStatus()

    // Send test notification
    sendNotification("Prayer Notifications Enabled", "You will be notified before each prayer time.")

    // Set up notification schedule
    scheduleNotifications()
  }

  function disableNotifications() {
    localStorage.setItem("prayerNotifications", "disabled")
    updateNotificationStatus()

    // Clear any scheduled notifications
    clearScheduledNotifications()
  }

  function updateNotificationStatus() {
    const isEnabled = notificationToggle.checked
    notificationStatus.textContent = isEnabled ? "Notifications enabled" : "Notifications disabled"

    notificationStatus.className = isEnabled ? "status-enabled" : "status-disabled"
  }

  function sendNotification(title, body) {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: body,
        icon: "/assets/logo.png",
      })

      notification.onclick = function () {
        window.focus()
        this.close()
      }
    }
  }

  function scheduleNotifications() {
    // Clear any existing scheduled notifications
    clearScheduledNotifications()

    // Get prayer times
    const prayerTimes = getPrayerTimesFromStorage()
    if (!prayerTimes) return

    // Current time
    const now = new Date()

    // Schedule notifications for each prayer time
    const prayers = [
      { name: "Fajr", time: prayerTimes.fajr },
      { name: "Dhuhr", time: prayerTimes.dhuhr },
      { name: "Asr", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isha", time: prayerTimes.isha },
    ]

    prayers.forEach((prayer) => {
      const prayerTime = getTimeFromString(prayer.time)

      // Set notification to 10 minutes before prayer time
      prayerTime.setMinutes(prayerTime.getMinutes() - 10)

      // Only schedule if prayer time is in the future
      if (prayerTime > now) {
        const timeUntilNotification = prayerTime.getTime() - now.getTime()

        // Schedule notification
        const timerId = setTimeout(() => {
          sendNotification(`${prayer.name} Prayer Soon`, `${prayer.name} prayer time will begin in 10 minutes.`)
        }, timeUntilNotification)

        // Store timer ID for later cleanup
        const notificationTimers = JSON.parse(localStorage.getItem("notificationTimers") || "[]")
        notificationTimers.push(timerId)
        localStorage.setItem("notificationTimers", JSON.stringify(notificationTimers))
      }
    })
  }

  function clearScheduledNotifications() {
    // Clear all scheduled notification timeouts
    const notificationTimers = JSON.parse(localStorage.getItem("notificationTimers") || "[]")
    notificationTimers.forEach((timerId) => {
      clearTimeout(timerId)
    })
    localStorage.setItem("notificationTimers", "[]")
  }

  function getTimeFromString(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number)
    const time = new Date()
    time.setHours(hours, minutes, 0, 0)
    return time
  }

  function getPrayerTimesFromStorage() {
    const times = localStorage.getItem("prayerTimes")
    return times ? JSON.parse(times) : null
  }
})
