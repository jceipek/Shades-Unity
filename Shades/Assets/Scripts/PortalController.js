#pragma strict

function OnTriggerEnter (obj : Collider) {
	Debug.Log("hit portal");
	obj.gameObject.SendMessage("ChangeWorld");
}