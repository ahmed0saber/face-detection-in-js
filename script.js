const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
]).then(startVideo)

function startVideo() {
  navigatorAny = navigator;
  navigator.getUserMedia = navigator.getUserMedia ||
    navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
    navigatorAny.msGetUserMedia;
  delete navigatorAny;
  if (navigator.getUserMedia) {
    navigator.getUserMedia({
      video: {
        facingMode: 'user',
        frameRate: { ideal: 10, max: 10 },
        width: { ideal: 320, max: 320 },
        height: { ideal: 240, max: 240 }
      }
    },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }
}

video.addEventListener('playing', () => {
  const displaySize = { width: video.width, height: video.height }
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  }, 100)
})