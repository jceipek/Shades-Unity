#pragma strict

var sensitivity : float = 0.8;
var springiness = 4.0;
var smoothTime = 100.0;

var changeY : boolean = false;

private var initCamPos : Vector3;
private var initScrollLayerPos : Vector3;

function Awake () {
	initCamPos = Camera.main.transform.position;
	initScrollLayerPos = transform.position;
}

function LateUpdate() {
	SetToGoal();
}


function SetToGoal() {
	var actualCamPos : Vector3 = Camera.main.transform.position;
	transform.position.x = sensitivity * (actualCamPos.x - initCamPos.x) + initScrollLayerPos.x;

	if (changeY) {
		transform.position.y = sensitivity * (actualCamPos.y - initCamPos.y) + initScrollLayerPos.y;
	}
}