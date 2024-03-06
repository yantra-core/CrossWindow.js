export default function open(url, options = {}, adjustCurrentWindow = false) {
  // Check if URL is provided
  if (!url) {
    console.error('URL is required to open a new window.');
    return;
  }

  // Default window features
  const defaultFeatures = {
    width: 600, // Default width
    height: 400, // Default height
    menubar: 'no',
    toolbar: 'no',
    location: 'no',
    status: 'no',
    scrollbars: 'yes',
    resizable: 'yes',
    title: new Date().toISOString(), // Default title
    left: window.screenX + 100, // Default left position
    top: window.screenY + 100 // Default top position
  };

  // adjust the position with offset of current window
  //defaultFeatures.left = window.screenX - window.innerWidth / 2;
  //defaultFeatures.top = window.screenY;

  // Merge default features with custom options
  const features = { ...defaultFeatures, ...options };
  console.log(features.left + " " + features.top + " " + features.width + " " + features.height)
  // If adjustCurrentWindow is true, resize and reposition the current window
  if (adjustCurrentWindow) {
    window.resizeTo(window.outerWidth / 2, window.outerHeight / 2);
    window.moveTo(features.left, features.top);
    // Adjust new window's size to fill the empty space
    //features.width = window.outerWidth;
    //features.height = window.outerHeight;
  }

  // Convert features object to a comma-separated string
  const featuresStr = Object.entries(features).map(([key, value]) => `${key}=${value}`).join(',');

  // Open a new window with the specified URL, name, and configured features
  const newWindow = window.open(url, features.title, featuresStr);

  if (newWindow) {
    // If adjustCurrentWindow is true, position the new window to fill the empty space
    if (adjustCurrentWindow) {
      newWindow.moveTo(window.screenX + window.outerWidth, window.screenY);
    }
    // Return the reference to the new window for further use
    return newWindow;
  } else {
    console.error('Failed to open a new window. Please check browser popup settings.');
  }
}
