#pragma strict

private var offset : float;
var sensitivity : float = 0.8;

function Start () {
	offset = transform.position.x;
}

function Update () {
	transform.position.x = Camera.main.transform.position.x - (Camera.main.transform.position.x-offset)*sensitivity;
}