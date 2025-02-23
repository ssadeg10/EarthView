async function main() {
  const imageURL =
    "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/latest.jpg";

  await updateImage(imageURL);
}

async function updateImage(imageURL) {
  const imageElement = document.getElementById("main");
  try {
    const responseObj = await getImage(imageURL);

    const lastModified = new Date(responseObj.lastModified);
    const nextUpdate = new Date(lastModified.getTime() + 10 * 60 * 1000);

    if (nextUpdate.getTime() < Date.now()) {
      nextUpdate.setTime(Date.now() + 60 * 1000);
    }

    console.log(`Next update scheduled for: ${nextUpdate.toLocaleString()}`);

    // Schedule the next update
    setTimeout(
      async () => await updateImage(imageURL),
      nextUpdate.getTime() - Date.now()
    );

    // set the image
    const blobURL = URL.createObjectURL(responseObj.blob);
    const prevBlobURL = imageElement.src;
    imageElement.src = blobURL;
    URL.revokeObjectURL(prevBlobURL);
  } catch (error) {
    console.error(error);
  }
}

async function getImage(imageURL, maxRetries = 3, retryCount = 0) {
  try {
    const response = await fetch(imageURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const responseObj = {
      blob: await response.blob(),
      lastModified: response.headers.get("last-modified"),
    };
    return responseObj;
  } catch (error) {
    if (retryCount < maxRetries) {
      retryCount++;
      setTimeout(() => {
        return getImage(imageURL, maxRetries, retryCount);
      }, 15000);
    } else {
      throw new Error(`Failed to fetch image after ${maxRetries} retries`);
    }
  }
}

main();
