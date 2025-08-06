export const createThemedFavicon = (bgColor: string, mainColor: string, textColor: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <!-- Rounded background box -->
      <rect
        width="30"
        height="30"
        x="1"
        y="1"
        rx="6"
        ry="6"
        fill="${bgColor}"
        stroke="${textColor}"
        stroke-width="2"
      />

      <!-- Korean character 끝 -->
      <text
        x="16"
        y="20"
        font-family="Arial, sans-serif, 'Black Han Sans'"
        font-size="25"
        font-weight="bold"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="${mainColor}"
      >
        끝
      </text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const updateFavicon = (faviconUrl: string) => {
  let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    document.head.appendChild(favicon);
  }
  favicon.href = faviconUrl;
};
