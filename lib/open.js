export default function open(url, options = {}, adjustCurrentWindow = true) {
  if (!url) {
    console.error('URL is required to open a new window.');
    return;
  }

  const availableScreenWidth = screen.availWidth - window.screenX;
  const availableScreenHeight = screen.availHeight - window.screenY;

  const defaultFeatures = {
    width: Math.min(window.outerWidth, availableScreenWidth - 100),
    height: Math.min(window.outerHeight, availableScreenHeight - 100),
    menubar: 'no',
    toolbar: 'no',
    location: 'no',
    status: 'no',
    scrollbars: 'yes',
    resizable: 'yes',
    title: new Date().toISOString(),
    left: window.screenX + window.outerWidth + 100,
    top: window.screenY
  };

  const features = { ...defaultFeatures, ...options };

  if (adjustCurrentWindow && (features.left + features.width > screen.availWidth || features.top + features.height > screen.availHeight)) {
    const halfWidth = Math.floor(window.outerWidth / 2);
    const halfHeight = Math.floor(window.outerHeight / 2);

    // window.resizeTo(halfWidth, halfHeight);

    // Determine an appropriate offset to maintain proximity without overlap
    const offsetX = (window.screenX + halfWidth + features.width > screen.availWidth) ? (screen.availWidth - features.width - halfWidth) : window.screenX;
    const offsetY = (window.screenY + halfHeight + features.height > screen.availHeight) ? (screen.availHeight - features.height - halfHeight) : window.screenY;

    // window.moveTo(offsetX, offsetY);

    features.width = halfWidth;
    features.height = halfHeight;
    features.left = offsetX + halfWidth; // Place new window to the right of the resized current window
    // features.top = offsetY; // Align new window's top with the current window's top
  }
  
  const featuresStr = Object.entries(features).map(([key, value]) => `${key}=${value}`).join(',');
  const newWindow = window.open(url, features.title, featuresStr);

  if (newWindow) {
    return newWindow;
  } else {
    console.error('Failed to open a new window. Please check browser popup settings.');
  }
}
