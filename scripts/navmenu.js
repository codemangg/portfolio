document.addEventListener("DOMContentLoaded", () => {
  const currentPath = decodeURIComponent(window.location.pathname.replace(/\/+$/, ""));

  document.querySelectorAll("nav a").forEach(link => {
    const linkPath = decodeURIComponent(new URL(link.href).pathname.replace(/\/+$/, ""));

    if (linkPath === currentPath) {
      link.classList.add("active");
      link.addEventListener("click", e => e.preventDefault());

      const parentDropdown = link.closest(".dropdown");
      if (parentDropdown) {
        const dropdownToggle = parentDropdown.querySelector("a");
        if (dropdownToggle && dropdownToggle !== link) {
          dropdownToggle.classList.add("active");
        }
      }
    }
  });
});
