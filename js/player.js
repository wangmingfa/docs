const midis = ["Beat-It.mid", "mojito.mid", "夜曲.mid", "Billie-Jean.mid"]
const players = []

let currentIndex = 0
let player
function play () {
  if (player) {
    player.stop()
    player = null
  }
  player = new MIDIPlayer(`./audio/${midis[currentIndex]}`)
  player.onload = function () {
    console.log('midi loaded', this.state)
    player.setVolume(30)
    player.play()
  }
  player.onend = function () {
    // 播放下一首
    currentIndex = (currentIndex + 1) % midis.length
    play()
  }
}
document.addEventListener('click', function () {
 // play()
})
