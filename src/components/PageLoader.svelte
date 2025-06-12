<svg class="header__logo" width="349" height="164" viewBox="0 0 349 164" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Original path -->
  <path id="logo-path" d="M283.573 0L229.036 110.713L207.659 66.8615L185.387 21.2948L174.997 0L119.814 111.015L64.5812 0L0.400024 131.553H26.5L64.78 53.0855L103.806 131.553H135.772L174.798 53.0855L195.727 95.9274H175L186.385 119.695H207.311L207.709 120.502L213.127 131.553L228.937 164L244.945 131.553L264.085 92.6474L283.573 53.0855L304.701 95.9274H284.173L295.507 119.695H316.384L322.25 131.553H348.4L283.573 0Z" fill="transparent"/>

  <!-- Inner path for the circle animation -->
  <path id="inner-path" d="M283.573 0L229.036 110.713L207.659 66.8615L185.387 21.2948L174.997 0L119.814 111.015L64.5812 0L0.400024 131.553H26.5L64.78 53.0855L103.806 131.553H135.772L174.798 53.0855L195.727 95.9274H175L186.385 119.695H207.311L207.709 120.502L213.127 131.553L228.937 164L244.945 131.553L264.085 92.6474L283.573 53.0855L304.701 95.9274H284.173L295.507 119.695H316.384L322.25 131.553H348.4L283.573 0Z" 
    fill="none" 
    stroke="transparent" 
    stroke-width="20"
    stroke-linejoin="round"
    stroke-linecap="round"/>

  <!-- Red dot that moves along the inner path -->
  <circle r="8" fill="white">
    <animateMotion dur="1s" repeatCount="indefinite">
      <mpath href="#inner-path" />
    </animateMotion>
  </circle>
</svg>
