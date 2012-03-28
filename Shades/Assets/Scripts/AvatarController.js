#pragma strict

var jumpForce : float;
var maxSpeed : float;

var movementSpeed : float;
var airModifier : float;

var groundDetectionRange : float; //How far from ground you can be to jump

// Spawn avatar here if it dies.
var spawnPoint : Transform;

class AvatarControllerMovement {
	// The speed when walking 
	var walkSpeed = 3.0;

	var inAirControlAcceleration = 1.0; //?????

	// The gravity for the character
	var gravity = 60.0;
	var terminalVelocity = 20.0;

	// How fast does the character change speeds?  Higher is faster.
	var speedSmoothing = 5.0;

	// The current move direction in x-y.  This will always been (1,0,0) or (-1,0,0)
	// The next line, @System.NonSerialized , tells Unity to not serialize the variable or show it in the inspector view.  Very handy for organization!
	@System.NonSerialized
	var direction = Vector3.zero;

	// The current vertical speed
	@System.NonSerialized
	var verticalSpeed = 0.0;

	// The current movement speed.  This gets smoothed by speedSmoothing.
	@System.NonSerialized
	var speed = 0.0;

	// Is the user pressing the left or right movement keys?
	@System.NonSerialized
	var isMoving = false;

	// The last collision flags returned from controller.Move
	@System.NonSerialized
	var collisionFlags : CollisionFlags; 

	// We will keep track of an approximation of the character's current velocity, so that we return it from GetVelocity () for our camera to use for prediction.
	@System.NonSerialized
	var velocity : Vector3;
	
	// This keeps track of our current velocity while we're not grounded?
	@System.NonSerialized
	var inAirVelocity = Vector3.zero;

	// This will keep track of how long we have we been in the air (not grounded)
	@System.NonSerialized
	var hangTime = 0.0;
}

function Start () {
	// Ignore physics of world avatar is not in
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("DarkWorld"),LayerMask.NameToLayer("LightWorld"),true);
	Physics.IgnoreLayerCollision(LayerMask.NameToLayer("LightWorld"),LayerMask.NameToLayer("DarkWorld"),true);
}

function Update () {
	var grounded;
	var horizMovement : Vector2;
	
	horizMovement = Input.GetAxis("Horizontal") * transform.right * Time.deltaTime * movementSpeed;
	
	//Check if the character is grounded; we can later use layers to make sure we are in the right world when we make the check
	var rayHit : RaycastHit;
	if (Physics.Raycast(transform.position, -transform.up, rayHit, groundDetectionRange)) {
    	grounded = true;
    } else {
		horizMovement *= airModifier;
		grounded = false;
	}

	//jump if the user pressing the jump AND our character is grounded
	if (Input.GetButtonDown("Jump") && grounded)
	{
		rigidbody.AddRelativeForce(transform.up * jumpForce, ForceMode.Impulse);
		//rigidbody.velocity.y = jumpForce;
	}
	
	//Limit terminal velocity
	if (rigidbody.velocity.magnitude > maxSpeed) {
		rigidbody.velocity = rigidbody.velocity.normalized * maxSpeed;
	} 
 
 	//move the avatar (walking/in the air)
	transform.Translate(horizMovement);

}


function OnCollisionEnter(theCollision : Collision) {
	//if(theCollision.gameObject.name == "PlatformObj"){
	//	grounded = true;
	//}
}
