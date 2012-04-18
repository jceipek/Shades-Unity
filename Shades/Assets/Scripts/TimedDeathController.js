#pragma strict

var secondsToExist : float = 3.0f;
private var startTime : float;

function Awake() {
	startTime = Time.time;
}

function Update(){
  // if secondsToExist have passed since the timer was started
  if(Time.time - startTime >= secondsToExist){
    // destroy the gameobject this script is attached to
    Destroy(gameObject);
  }
}