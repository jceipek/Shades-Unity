#pragma strict

var jumping;

function Start () {
	jumping = false;
}

function Update () {
	if (Input.GetButtonDown("Jump")) {
		jumping = true;
	}
	
	if (Input.GetButtonUp("Jump")) {
		jumping = false;
	}
	
	if(jumping) {
		transform.Translate(0, 9 * Time.deltaTime, 0);
	}
}