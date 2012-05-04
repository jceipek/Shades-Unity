#pragma strict

var movementSpeed : float = 1.0f;

@System.NonSerialized
var avatar : GameObject;
@System.NonSerialized
var collisionFlags : boolean;
@System.NonSerialized
var direction : int = 1;
@System.NonSerialized
var overPlatformBefore : boolean = true;
@System.NonSerialized
var movementOffset = Vector3(2, 0, 0);
@System.NonSerialized
var controller : CharacterController;

function Awake() {
	// Called before any Start functions and lets us initialize stuff. Always called (but only once) even if object is disabled, so use this for construction.	
	//controller = GetComponent(CharacterController);
		
	// Always ignore physics of world avatar is not in. XXX: Not sure if this is the right place to put this code...
	//Physics.IgnoreLayerCollision(LayerMask.NameToLayer("DarkWorld"),LayerMask.NameToLayer("LightWorld"),true);
	//Physics.IgnoreLayerCollision(LayerMask.NameToLayer("LightWorld"),LayerMask.NameToLayer("DarkWorld"),true);
	
	//CorrectTexture();
	
	
	controller = GetComponent(CharacterController);
	
	avatar = GameObject.Find("Avatar");
	

}

function Update() {
	var down = Vector3(0, -2, 0);
	
	if (!Physics.Raycast(transform.position, down, 2) && overPlatformBefore) {
		direction *= -1;
		overPlatformBefore = false;
    } else {
		if (Physics.Raycast(transform.position, down, 2) && !overPlatformBefore) {
			overPlatformBefore = true;
		}
	}
	
	EnemyMove();
	
	var distance = Vector3.Distance(avatar.transform.position, transform.position);
	if (distance < 3) {
		avatar.gameObject.SendMessage("OnDeath", SendMessageOptions.DontRequireReceiver);
	}
}

function OnTriggerEnter(other : Collider) {
	other.gameObject.SendMessage("OnDeath", SendMessageOptions.DontRequireReceiver);
}

function EnemyMove() {
	collisionFlags = controller.Move(movementOffset * movementSpeed * direction * Time.deltaTime);
}
