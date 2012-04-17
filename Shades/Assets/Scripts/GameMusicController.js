#pragma strict

enum Fade {In, Out}

var fadeInTime = 4.0;
var fadeOutTime = 1.0;

function Awake() {
    // see if we've got menu music still playing
    //var menuMusic : GameObject = GameObject.Find("MenuMusic");
    //if (menuMusic) {
        // kill menu music
    //    Destroy(menuMusic);
    //}
    // make sure we survive going to different scenes
    var gameMusics : GameObject[] = GameObject.FindGameObjectsWithTag("Music");
    for (var gameMusic : GameObject in gameMusics) {
    	if (gameMusic.GetInstanceID() != gameObject.GetInstanceID()) {
       		//kill game music
			Destroy(gameObject);
        } 
    }

    DontDestroyOnLoad(gameObject);
}

function OnLevelWasLoaded(){
	FadeAudio(fadeInTime, Fade.In);
}

function SwitchLevel() {
	var audio : AudioSource = GetComponent(AudioSource);
	FadeAudio(fadeOutTime, Fade.Out);
}

function FadeAudio (timer : float, fadeType : Fade) {

    var start = fadeType == Fade.In? 0.0 : 1.0;

    var end = fadeType == Fade.In? 1.0 : 0.0;

    var i = 0.0;

    var step = 1.0/timer;

 

    while (i <= 1.0) {

        i += step * Time.deltaTime;

        audio.volume = Mathf.Lerp(start, end, i);

        yield;

    }

}