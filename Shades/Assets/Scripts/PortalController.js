#pragma strict

var rotationSpeed : float = 10.0;
var darkTexture : Texture;
var lightTexture : Texture;

function Awake() {
	if (gameObject.layer == LayerMask.NameToLayer("LightWorld")) {
		renderer.material.mainTexture = lightTexture;
	} else if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
		renderer.material.mainTexture = darkTexture;
	}
}

function OnTriggerEnter (other : Collider) {
	Debug.Log("hit portal");
	
	if (gameObject.layer == LayerMask.NameToLayer("DarkWorld")) {
		other.gameObject.SendMessage("ChangeWorldTo", LayerMask.NameToLayer("LightWorld"));
	} else {
		other.gameObject.SendMessage("ChangeWorldTo", LayerMask.NameToLayer("DarkWorld"));
	}

}

function Update() {
	 transform.Rotate(Vector3.forward * rotationSpeed * Time.deltaTime, Space.World);
}

// Require a box collider for the trigger
@script RequireComponent(BoxCollider)