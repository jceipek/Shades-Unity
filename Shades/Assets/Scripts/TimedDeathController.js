#pragma strict

var secondsToExist : float = 3.0f;

function Start() {
	yield WaitForSeconds(secondsToExist);
	Destroy(gameObject);
}