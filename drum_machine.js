
var context = new AudioContext();

var compressor = context.createDynamicsCompressor();
compressor.threshold.value = -50;
compressor.knee.value = 40;
compressor.ratio.value = 12;
compressor.reduction.value = -20;
compressor.attack.value = 20;
compressor.release.value = 0.25;
compressor.connect(context.destination)

var Audio = function(name, path){
  this.name = name
  this.path = path
  this.gain = context.createGain()
  this.gain.connect(compressor)
  this.pattern = {}
}

Audio.prototype.loadSound = function(){
  var sound = this
  var getSound = new XMLHttpRequest();
  getSound.open("GET", sound.path, true);
  getSound.responseType = "arraybuffer";
  getSound.onload = function(){
    context.decodeAudioData(getSound.response, function(audioBuffer){
      sound.buffer = audioBuffer;
    });
  }
  getSound.send();
}


var allSounds = {
  kick1: new Audio('kick1', 'sounds/kick-1.wav'),
  kick2: new Audio('kick2', 'sounds/kick-2.wav'),
  kick3: new Audio('kick3', 'sounds/kick-3.wav'),
  snare1: new Audio('snare1', 'sounds/snare-1.wav'),
  snare2: new Audio('snare2', 'sounds/snare-2.wav'),
  clap1: new Audio('clap1', 'sounds/clap-1.wav'),
  clap2: new Audio('clap2', 'sounds/clap-2.wav'),
  hihat1: new Audio('hihat1', 'sounds/hi-hat-1.wav'),
  hihat2: new Audio('hihat2', 'sounds/hi-hat-2.wav'),
  openhat1: new Audio('openhat1', 'sounds/open-hat-1.wav'),
  openhat2: new Audio('openhat2', 'sounds/open-hat-2.wav'),
}



function loadAllSounds(){
  for (sound in allSounds) {
    allSounds[sound].loadSound()
  }
}


function playSound(audio){
  var sound = context.createBufferSource();
  sound.buffer = audio.buffer;
  sound.connect(audio.gain);
  sound.start(0);
}


var tempo = 100;
var rhythmIndex = 1;
var playing = false;
var sixteenthNoteTime;
var timer;


function play(){
  if(!playing){
    loop();
    playing = true;
  }else{
    rhythmIndex = 1
  }
};

function loop(){
  sixteenthNoteTime = 60 / tempo / 4;
  timer = setTimeout(function(){
    playCurrentIndex()
    loop()
  }, sixteenthNoteTime*1000)
}

function playCurrentIndex(){
  for (audio in allSounds){
    var track = allSounds[audio];
    var pattern = track.pattern
    if (pattern[rhythmIndex]) {
      playSound(track)
    }
  }
  movePlayhead(rhythmIndex)
  progressRhythm()
};

function progressRhythm(){
  if(rhythmIndex < 16){
    rhythmIndex++
  }else{
    rhythmIndex = 1
  }
}

function stop(){
  clearTimeout(timer)
  playing = false
  rhythmIndex = 1
  $('.bar').css('background-color','');
};




function playButtonListener(){
  $('button.play').on('click', function(){
    play();
  });
}

function stopButtonListener(){
  $('button.stop').on('click', function(){
    stop();
  });
};


function padClickListener(){
  $('div.pad').on('click', function(){
    var sound = $(this).attr('id')
    var position = $(this).attr("value")

    if ($(this).hasClass('active')){
      $(this).removeClass('active')
      $(this).css('background-color', '')
      allSounds[sound].pattern[position] = false

    } else {
      $(this).addClass('active')
      $(this).css('background-color', 'red')
      allSounds[sound].pattern[position] = true
    }
  });
}


function tempoChangeListener(){
  $('input.bpm').on('change', function(){
    tempo = $(this).val()
  });
}


function gainChangeListener(){
  $('input.gain').on('change', function(e){
    e.preventDefault();
    var newGain = $(this).val()
    var instrument = $(this).parent().attr('id')
    allSounds[instrument].gain.gain.value = newGain
  });
};


function movePlayhead(index){
  $('.bar').css({
    'background-color':'',
  });
  $('#'+ index).css({
    'background-color':'red',
  });
}


function buildStepNumbers(){
  for (var i = 1; i < 17; i++) {
    var context = {number: i};
    var html = $('#step_number_template').html();
    var templatingFunction = Handlebars.compile(html);
    $('.step_number_container').append(templatingFunction(context));
  };
};


function buildTracks(){

    var context = {sounds: allSounds};
    var html = $('#track_template').html();
    var templatingFunction = Handlebars.compile(html);
    $('#instrument_container').append(templatingFunction(context));
};

function buildPads(){
  for(track in allSounds){
    var instrument = allSounds[track].name
    console.log(instrument)
    for (var i = 1; i < 17; i++) {
      var pads = $('span.' + instrument +'_pads')
      pads.append("<div class='" + instrument +" pad " + i + "' id=" + instrument + " value='" + i +"'></div>")
    };
  }
}

function buildBoard(){
  buildStepNumbers();
  buildTracks()
  buildPads()
};

function initializeControls(){
  playButtonListener();
  stopButtonListener()
  padClickListener();
  tempoChangeListener();
  gainChangeListener();
};

$(document).ready(function() {
  buildBoard()
  loadAllSounds();
  initializeControls();
});




