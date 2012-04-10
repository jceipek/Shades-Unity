#pragma strict

var level:String;

function OnTriggerEnter(other : Collider) {
	Application.LoadLevel(level);
}

// Require a box collider for the trigger
@script RequireComponent(BoxCollider)