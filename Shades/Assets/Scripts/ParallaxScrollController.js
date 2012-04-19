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

function Update () {
	// Where should our camera be looking right now?
	//var goalPosition : Vector3 = Camera.main.GetComponent(CameraScrolling).GetGoalPosition();
	//var actualCamPosX : float = Vector3.Lerp (transform.position, goalPosition, Time.deltaTime * springiness).x;
	var actualCamPosX = Camera.main.transform.position.x;
	
	transform.position.x = Mathf.Lerp(transform.position.x, sensitivity * (actualCamPosX - initCamPos) + initScrollLayerPos, Time.deltaTime * smoothTime);
}