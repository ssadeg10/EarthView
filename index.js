async function main() {
  await updateImage();
}

async function updateImage() {
  const imageElement = document.getElementById("main");
  const updateTimeElement = document.getElementById("update-time");
  try {
    const responseObj = await getImage();

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
      async () => await updateImage(),
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

async function getImage(maxRetries = 3, retryCount = 0) {
  var mainVersion = "/GOES16/ABI/FD/GEOCOLOR/latest.jpg";
  var altVersion = "/GOES19/ABI/FD/GEOCOLOR/latest.jpg";
  const host = "https://cdn.star.nesdis.noaa.gov";

  try {
    const response = await fetch(host + mainVersion, { mode: "no-cors" });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const responseObj = {
      blob: await response.blob(),
      lastModified: response.headers.get("last-modified"),
    };
    return responseObj;
  } catch (error) {
    try {
      const response = await fetch(host + altVersion);

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
          return getImage(maxRetries, retryCount);
        }, 15000);
      } else {
        throw new Error(`Failed to fetch image after ${maxRetries} retries`);
      }
    }
  }
}

function minToMillisec(minutes) {
  return minutes * 60000;
}

main();
