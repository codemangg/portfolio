document.addEventListener("DOMContentLoaded", () => {
  const currentUrl = window.location.href;

  document.querySelectorAll("nav a").forEach(link => {
    if (link.href === currentUrl) {
      link.classList.add("active");
      link.addEventListener("click", e => e.preventDefault());
    }
  });
});
