#pragma strict

function OnTriggerEnter (other : Collider) {
	Debug.Log("hit portal");
	
	if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
		other.gameObject.SendMessage("ChangeWorldTo", LayerMask.NameToLayer("LightWorld"));
	} else {
		other.gameObject.SendMessage("ChangeWorldTo", LayerMask.NameToLayer("DarkWorld"));
	}

}

// Require a box collider for the trigger
@script RequireComponent(BoxCollider)