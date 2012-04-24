#pragma strict

var darkTexture : Texture;
var lightTexture : Texture;

function Awake() {
	// Called before any Start functions and lets us initialize stuff. Always called (but only once) even if object is disabled, so use this for construction.	
	//controller = GetComponent(CharacterController);
		
	// Always ignore physics of world avatar is not in. XXX: Not sure if this is the right place to put this code...
	//Physics.IgnoreLayerCollision(LayerMask.NameToLayer("DarkWorld"),LayerMask.NameToLayer("LightWorld"),true);
	//Physics.IgnoreLayerCollision(LayerMask.NameToLayer("LightWorld"),LayerMask.NameToLayer("DarkWorld"),true);
	
	//CorrectTexture();

	

}

function Update() {
	var down = Vector3(0, -5, 0);
	
	//Debug.DrawLine (transform.position, down + transform.position, Color.green);
	
	if (Physics.Raycast(transform.position, down, 2)) {
		
    }
}

function OnTriggerEnter (other : Collider) {
	other.gameObject.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
}

function EnemyMove() {
	
}
