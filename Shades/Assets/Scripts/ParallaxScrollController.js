#pragma strict

var sensitivity : float = 0.8;
var springiness = 4.0;
var smoothTime = 100.0;

private var initCamPos : float;
private var initScrollLayerPos : float;

function Awake () {
	initCamPos = Camera.main.transform.position.x;
	initScrollLayerPos = transform.position.x;
}

function LateUpdate() {
	SetToGoal();
}


function SetToGoal() {
	var actualCamPosX : float = Camera.main.transform.position.x;
	transform.position.x = sensitivity * (actualCamPosX - initCamPos) + initScrollLayerPos;

}