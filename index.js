async function main() {
  const imageURL =
    "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/latest.jpg";

  await updateImage(imageURL);
}

async function updateImage(imageURL) {
  const imageElement = document.getElementById("main");
  const updateTimeElement = document.getElementById("update-time");
  try {
    const responseObj = await getImage(imageURL);

    const lastModified = new Date(responseObj.lastModified);
    const nextUpdate = new Date(lastModified.getTime() + minToMillisec(10));
    const now = new Date(Date.now());

    if (nextUpdate.getTime() < now.getTime()) {
      //   console.log(
      //     nextUpdate.toLocaleTimeString() + " < " + now.toLocaleTimeString()
      //   );
      nextUpdate.setTime(now.getTime() + minToMillisec(1));
    }

    // console.log(`Next update scheduled for: ${nextUpdate.toLocaleString()}`);

    // Schedule the next update
    setTimeout(
      async () => await updateImage(imageURL),
      nextUpdate.getTime() - now.getTime()
    );

    // set the image
    const blobURL = URL.createObjectURL(responseObj.blob);
    const prevBlobURL = imageElement.src;
    imageElement.src = blobURL;
    URL.revokeObjectURL(prevBlobURL);

    updateTimeElement.innerText = now.toLocaleTimeString();
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

function minToMillisec(minutes) {
  return minutes * 60000;
}

main();
